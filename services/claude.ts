import { CLAUDE_CONFIG, GPT_CONFIG, anthropic, detectLanguage, openai } from '../config';
import { conversationSummaryService, type Message } from './conversationSummary';

export interface ConversationContext {
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  scenario?: string;
  conversationId?: string; // Додаємо ID розмови для резюме
}

export class ClaudeService {
  // 📈 СТАТИСТИКА ВИКОРИСТАННЯ
  private usageStats: Array<{
    timestamp: Date;
    type: 'conversation' | 'scenario';
    topic: string;
    level: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
  }> = [];

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.message?.includes('401') || error.message?.includes('403')) {
          throw error; // Authentication errors
        }
        
        if (attempt === maxRetries) {
          break; // Last attempt failed
        }
        
        // Calculate delay with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`API call failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  // 🚀 ОПТИМІЗОВАНИЙ СИСТЕМНИЙ ПРОМПТ
  private buildSystemPrompt(context: ConversationContext): string {
    const levelRules = {
      beginner: 'A1-A2 vocabulary, simple sentences, basic tenses',
      intermediate: 'common vocabulary, normal sentences, simple connectors',
      advanced: 'sophisticated vocabulary, complex structures, idioms'
    };

    return `English conversation partner in learning scenario.

CONTEXT: ${context.topic} | ${context.level} | ${context.scenario}

RULES:
1. Stay in role (guide/shopkeeper/assistant)
2. Keep responses short (1-2 sentences)
3. Correct gently: "You mean [correct]. [why]"
4. Ask follow-up questions
5. Use emojis and **bold**
6. YOU start conversations
7. Student = visitor, you = helper
8. Speak only - no action descriptions
9. Don't describe your character's actions.


LANGUAGE: ${levelRules[context.level]}

RESPONSES:
- Short input ("ok", "yes") → Continue with question
- Mistakes → Correct + explain + question
- Empty → Ask relevant question

Example: "I go store" → "You mean 'I went to the store'. Use 'went' for past. What did you buy? 🛒"

Stay helpful, in character, engaging.`;
  }

  private async buildConversationHistory(context: ConversationContext): Promise<string> {
    let history = '';
    
    // Обрізаємо до останніх 10 повідомлень для економії токенів
    const recentMessages = context.conversationHistory.slice(-10);
    
    // Якщо є більше повідомлень, генеруємо або оновлюємо резюме
    if (context.conversationHistory.length > 10 && context.conversationId) {
      try {
        // Конвертуємо повідомлення в формат для резюме
        const messagesForSummary: Message[] = context.conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date()
        }));

        // Оновлюємо резюме
        await conversationSummaryService.updateSummary(
          context.conversationId,
          messagesForSummary,
          context.topic,
          context.level
        );
      } catch (error) {
        console.error('Error updating conversation summary:', error);
      }
    }
    
    // Додаємо резюме, якщо воно є
    if (context.conversationId) {
      const summary = conversationSummaryService.getSummary(context.conversationId);
      if (summary) {
        const summaryText = conversationSummaryService.formatSummaryForPrompt(summary);
        if (summaryText) {
          history += summaryText + '\n\n';
        }
      }
    }
    
    // Add conversation history
    recentMessages.forEach(msg => {
      if (msg.role === 'user') {
        history += `Student: ${msg.content}\n`;
      } else {
        history += `You: ${msg.content}\n`;
      }
    });
    
    return history;
  }

  // 💰 РОЗРАХУНОК ВАРТОСТІ
  private calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1000000) * 0.25;   // $0.25 per 1M tokens
    const outputCost = (outputTokens / 1000000) * 1.25; // $1.25 per 1M tokens
    return inputCost + outputCost;
  }

  private calculateGPTCost(inputTokens: number, outputTokens: number): number {
    // GPT-4o-mini pricing: $0.15 per 1M input tokens, $0.60 per 1M output tokens
    const inputCost = (inputTokens / 1000000) * 0.15;   // $0.15 per 1M tokens
    const outputCost = (outputTokens / 1000000) * 0.60; // $0.60 per 1M tokens
    return inputCost + outputCost;
  }

  // 📊 ЗБЕРЕЖЕННЯ СТАТИСТИКИ
  private saveUsageStats(
    type: 'conversation' | 'scenario',
    topic: string, 
    level: string, 
    inputTokens: number, 
    outputTokens: number, 
    cost: number
  ) {
    this.usageStats.push({
      timestamp: new Date(),
      type,
      topic,
      level,
      inputTokens,
      outputTokens,
      cost
    });
    
    // Показати загальну статистику кожні 10 запитів
    if (this.usageStats.length % 10 === 0) {
      this.printTotalStats();
    }
  }

  // 📈 ВИВЕДЕННЯ ЗАГАЛЬНОЇ СТАТИСТИКИ
  private printTotalStats() {
    const total = this.usageStats.reduce((acc, stat) => ({
      cost: acc.cost + stat.cost,
      inputTokens: acc.inputTokens + stat.inputTokens,
      outputTokens: acc.outputTokens + stat.outputTokens
    }), { cost: 0, inputTokens: 0, outputTokens: 0 });
    
    console.log('💰 Total Usage:');
    console.log(`Requests: ${this.usageStats.length}`);
    console.log(`Total cost: ${total.cost.toFixed(4)}`);
    console.log(`Total tokens: ${total.inputTokens + total.outputTokens}`);
    console.log(`Average per request: ${(total.cost / this.usageStats.length).toFixed(6)}`);
  }

  async generateResponse(context: ConversationContext, userMessage: string): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const conversationHistory = await this.buildConversationHistory(context);
      const detectedLanguage = detectLanguage(userMessage);
      
      console.log(`🌍 Detected language: ${detectedLanguage} for message: "${userMessage}"`);

      // Використовуємо GPT-4.1 mini для кириличного тексту
      if (detectedLanguage === 'cyrillic') {
        console.log('🤖 Using GPT-4o-mini for Cyrillic text');
        return await this.generateGPTResponse(systemPrompt, conversationHistory, userMessage, context);
      } else {
        // Використовуємо Claude для всіх інших випадків
        console.log('🤖 Using Claude-3-5-haiku for non-Cyrillic text');
        return await this.generateClaudeResponse(systemPrompt, conversationHistory, userMessage, context);
      }
    } catch (error: any) {
      console.error('AI Service Error:', error);
      
      // Provide user-friendly error messages
      if (error.message?.includes('529') || error.message?.includes('overloaded')) {
        throw new Error('AI servers are currently busy. Please try again in a moment. 🤖');
      }
      
      if (error.message?.includes('401') || error.message?.includes('403')) {
        throw new Error('Authentication error. Please check your API key configuration. 🔑');
      }
      
      if (error.message?.includes('rate_limit')) {
        throw new Error('Too many requests. Please wait a moment before trying again. ⏰');
      }
      
      throw new Error('Failed to generate AI response. Please check your internet connection and try again. 🌐');
    }
  }

  private async generateClaudeResponse(
    systemPrompt: string, 
    conversationHistory: string, 
    userMessage: string, 
    context: ConversationContext
  ): Promise<string> {
    // 🔄 Створюємо масив system блоків динамічно
    const systemBlocks = [
      {
        type: "text" as const,
        text: systemPrompt,
        cache_control: { type: "ephemeral" as const }
      }
    ];

    // ⚡ Додаємо історію тільки якщо вона не порожня
    if (conversationHistory.trim()) {
      systemBlocks.push({
        type: "text" as const,
        text: `Previous conversation:\n${conversationHistory}`,
        cache_control: { type: "ephemeral" as const }
      });
    }

    const response = await this.retryWithBackoff(async () => {
      return await anthropic.messages.create({
        model: CLAUDE_CONFIG.model,
        max_tokens: CLAUDE_CONFIG.max_tokens,
        temperature: CLAUDE_CONFIG.temperature,
        system: systemBlocks,
        messages: [
          {
            role: 'user',
            content: userMessage // ⚡ Тільки нове повідомлення
          }
        ]
      }, {
        // 🔑 Додаємо бета-хедер для кешування в options
        headers: {
          'anthropic-beta': 'prompt-caching-2024-07-31'
        }
      });
    });

    // 📊 МОНІТОРИНГ ТОКЕНІВ ТА ВАРТОСТІ
    if (response.usage) {
      const { input_tokens, output_tokens } = response.usage;
      const totalCost = this.calculateCost(input_tokens, output_tokens);
      
      console.log('📊 Claude Response:');
      console.log(`Model: ${CLAUDE_CONFIG.model}`);
      console.log(`Input tokens: ${input_tokens}`);
      console.log(`Output tokens: ${output_tokens}`);
      console.log(`Cost: $${totalCost.toFixed(6)} (in: $${((input_tokens / 1000000) * 0.25).toFixed(6)}, out: $${((output_tokens / 1000000) * 1.25).toFixed(6)})`);
      
      // Зберігаємо статистику
      this.saveUsageStats('conversation', context.topic, context.level, input_tokens, output_tokens, totalCost);
    }

    if (response.content[0].type === 'text') {
      return response.content[0].text;
    }
    
    throw new Error('Unexpected response format from Claude');
  }

  private async generateGPTResponse(
    systemPrompt: string, 
    conversationHistory: string, 
    userMessage: string, 
    context: ConversationContext
  ): Promise<string> {
    // Формуємо повний промпт для GPT
    let fullPrompt = systemPrompt;
    
    if (conversationHistory.trim()) {
      fullPrompt += `\n\nPrevious conversation:\n${conversationHistory}`;
    }
    
    fullPrompt += `\n\nUser: ${userMessage}\nAssistant:`;

    const response = await this.retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: GPT_CONFIG.model,
        max_tokens: GPT_CONFIG.max_tokens,
        temperature: GPT_CONFIG.temperature,
        messages: [
          {
            role: 'system',
            content: fullPrompt
          }
        ]
      });
    });

    // 📊 МОНІТОРИНГ ТОКЕНІВ ТА ВАРТОСТІ
    if (response.usage) {
      const { prompt_tokens, completion_tokens } = response.usage;
      const totalCost = this.calculateGPTCost(prompt_tokens, completion_tokens);
      
      console.log('📊 GPT Response:');
      console.log(`Model: ${GPT_CONFIG.model}`);
      console.log(`Input tokens: ${prompt_tokens}`);
      console.log(`Output tokens: ${completion_tokens}`);
      console.log(`Cost: $${totalCost.toFixed(6)}`);
      
      // Зберігаємо статистику
      this.saveUsageStats('conversation', context.topic, context.level, prompt_tokens, completion_tokens, totalCost);
    }

    if (response.choices[0]?.message?.content) {
      return response.choices[0].message.content;
    }
    
    throw new Error('Unexpected response format from GPT');
  }

  async generateScenario(topic: string, level: string): Promise<{
    intro: string;
    firstMessage: string;
  }> {
    try {
      // Diverse theme list for AI to draw inspiration from
      const themeList = [
        // Travel themes (realistic only)
        'cultural exchange', 'language barrier', 'local customs', 'tourist problems', 'hidden gems', 'local food', 'transportation issues', 'accommodation surprises', 'festivals and events', 'historical sites', 'nature exploration', 'city vs countryside', 'budget travel', 'luxury travel', 'solo travel', 'group travel', 'business travel', 'family vacation', 'backpacking', 'cruise travel',
        
        // Business themes
        'startup challenges', 'corporate culture', 'remote work', 'team dynamics', 'client relations', 'negotiations', 'presentations', 'crisis management', 'innovation', 'competition', 'mentorship', 'career change', 'work-life balance', 'office politics', 'international business', 'small business', 'freelancing', 'entrepreneurship', 'investor relations', 'market research',
        
        // Romance themes
        'first impressions', 'cultural differences', 'long-distance relationships', 'online dating', 'speed dating', 'blind dates', 'reconnecting', 'friendship to romance', 'age differences', 'professional relationships', 'social class differences', 'language barriers in love', 'family approval', 'cultural traditions', 'modern vs traditional', 'casual dating', 'serious commitment', 'breakup and reconciliation', 'second chances', 'love at first sight',
        
        // Daily life themes
        'neighborhood interactions', 'community events', 'family dynamics', 'friendship challenges', 'health and wellness', 'hobbies and interests', 'technology integration', 'environmental awareness', 'social media impact', 'local businesses', 'volunteering', 'education and learning', 'personal growth', 'life transitions', 'cultural celebrations', 'seasonal activities', 'urban vs rural life', 'generational differences', 'social issues', 'personal achievements',
        
        // Mystery themes (realistic only)
        'missing items', 'strange occurrences', 'unexplained events', 'coincidences', 'hidden messages', 'unusual discoveries', 'mysterious people', 'strange places', 'unexpected connections', 'family secrets', 'neighborhood mysteries', 'workplace intrigue', 'travel mysteries', 'historical mysteries', 'personal investigations', 'urban legends', 'supernatural experiences', 'psychological mysteries', 'social mysteries', 'technological mysteries',
        
        // Fantasy themes
        'magical encounters', 'supernatural beings', 'enchanted places', 'magical objects', 'time travel', 'parallel worlds', 'magical abilities', 'mythical creatures', 'magical schools', 'wizard adventures', 'fairy tales', 'magical kingdoms', 'spell casting', 'magical creatures', 'enchanted forests', 'magical artifacts', 'supernatural powers', 'magical transformations', 'mythical quests', 'magical friendships'
      ];

      const randomTheme = themeList[Math.floor(Math.random() * themeList.length)];

      const systemPrompt = `Create a short English learning scenario.

TOPIC: ${topic}
LEVEL: ${level}
THEME: ${randomTheme}

REQUIREMENTS:
- SCENARIO: 1 sentence, max 12 words, clear situation
- FIRST_MESSAGE: 1 short sentence, starts conversation
- Student is visitor/customer, you are guide/shopkeeper/assistant
- You ALWAYS start the conversation
- Keep it simple and logical
${level === 'beginner' ? '- Use ONLY A1-A2 level vocabulary (basic words, simple sentences)' : ''}
${topic === 'travel' ? '- NO magical agencies, supernatural elements, or fantasy travel' : ''}

FORMAT:
SCENARIO: [Clear situation in 1 sentence]
FIRST_MESSAGE: [1 sentence to start conversation]

EXAMPLES:
SCENARIO: You need help finding your hotel in a new city.
FIRST_MESSAGE: Hello! Can I help you find something?

SCENARIO: You want to order food at a restaurant.
FIRST_MESSAGE: Welcome! What would you like to eat today?

SCENARIO: You're lost and need directions.
FIRST_MESSAGE: Hi! Do you need help finding your way?

❌ WRONG: "You want to buy a laptop but think the price is too high"
✅ CORRECT: "You're looking at laptops in a computer store"

❌ AMBIGUOUS: "You're at a train station helping a confused traveler"
✅ CLEAR: "You're a station worker helping a lost tourist"

${topic === 'travel' ? '❌ WRONG: "You visit a magical travel agency that grants wishes"' : ''}
${topic === 'travel' ? '✅ CORRECT: "You need help booking a flight at a travel agency"' : ''}

Create a scenario about ${topic} using the theme "${randomTheme}". Make it realistic and engaging.`;

      const response = await this.retryWithBackoff(async () => {
        return await anthropic.messages.create({
          model: CLAUDE_CONFIG.model,
          max_tokens: 120, // Reduced for ultra-short scenarios
          temperature: 0.3, // Higher temperature for maximum creativity and variety
          // 🔄 Змінюємо system на масив об'єктів з кешуванням
          system: [
            {
              type: "text",
              text: systemPrompt,
              cache_control: { type: "ephemeral" as const }
            }
          ],
          messages: [
            {
              role: 'user',
              content: `Create a unique ${level} level English conversation scenario about ${topic}, inspired by the theme: "${randomTheme}". Explore this theme in an interesting and creative way while keeping the situation realistic and engaging. Remember: SCENARIO must be 1 sentence, max 15 words. FIRST_MESSAGE must be 1 short sentence. IMPORTANT: Define clearly who the AI will play (supporting character) and who the student will play (main character).`
            }
          ]
        }, {
          // 🔑 Додаємо бета-хедер для кешування в options
          headers: {
            'anthropic-beta': 'prompt-caching-2024-07-31'
          }
        });
      });

      // 📊 МОНІТОРИНГ ДЛЯ ГЕНЕРАЦІЇ СЦЕНАРІЇВ
      if (response.usage) {
        const { input_tokens, output_tokens } = response.usage;
        const totalCost = this.calculateCost(input_tokens, output_tokens);
        
        console.log('🎭 Scenario Generation:');
        console.log(`Input tokens: ${input_tokens}`);
        console.log(`Output tokens: ${output_tokens}`);
        console.log(`Cost: $${totalCost.toFixed(6)}`);
        
        // Зберігаємо статистику
        this.saveUsageStats('scenario', topic, level, input_tokens, output_tokens, totalCost);
      }

      if (response.content[0].type === 'text') {
        return this.parseScenarioResponse(response.content[0].text);
      }
      
      throw new Error('Unexpected response format from Claude');
    } catch (error: any) {
      console.error('Claude API Error:', error);
      
      // Provide user-friendly error messages for scenario generation
      if (error.message?.includes('529') || error.message?.includes('overloaded')) {
        console.log('AI servers busy, using fallback scenario...');
      } else if (error.message?.includes('401') || error.message?.includes('403')) {
        console.log('Authentication error, using fallback scenario...');
      } else {
        console.log('API error, using fallback scenario...');
      }
      
      // Fallback to default scenario if API fails
      return this.getDefaultScenario(topic, level);
    }
  }

  private parseScenarioResponse(responseText: string): {
    intro: string;
    firstMessage: string;
  } {
    const lines = responseText.split('\n').map(line => line.trim());
    
    let intro = '';
    let firstMessage = '';
    
    for (const line of lines) {
      if (line.startsWith('SCENARIO:')) {
        intro = line.substring(9).trim();
      } else if (line.startsWith('FIRST_MESSAGE:')) {
        firstMessage = line.substring(14).trim();
      }
    }
    
    return { intro, firstMessage };
  }

  private getDefaultScenario(topic: string, level: string): {
    intro: string;
    firstMessage: string;
  } {
    // Fallback scenarios if API fails
    const fallbacks = {
      travel: {
        beginner: {
          intro: "You need help finding your hotel in a new city.",
          firstMessage: "Hello! Can I help you find something?"
        },
        intermediate: {
          intro: "You're lost and need directions to your destination.",
          firstMessage: "Hi! Do you need help finding your way?"
        },
        advanced: {
          intro: "You want to book a tour of the city.",
          firstMessage: "Welcome! What kind of tour interests you?"
        }
      },
      business: {
        beginner: {
          intro: "You need help with your business meeting.",
          firstMessage: "Hello! How can I help you today?"
        },
        intermediate: {
          intro: "You want to discuss a business proposal.",
          firstMessage: "Hi! What brings you to our office?"
        },
        advanced: {
          intro: "You're presenting to potential investors.",
          firstMessage: "Good morning! What's your business idea?"
        }
      },
      'daily life': {
        beginner: {
          intro: "You want to buy something at the store.",
          firstMessage: "Hello! What can I help you find?"
        },
        intermediate: {
          intro: "You need help choosing a gift for a friend.",
          firstMessage: "Hi! What kind of gift are you looking for?"
        },
        advanced: {
          intro: "You want to join a local community event.",
          firstMessage: "Welcome! What interests you about our event?"
        }
      },
      mystery: {
        beginner: {
          intro: "You found something strange and need help.",
          firstMessage: "Hello! What did you discover?"
        },
        intermediate: {
          intro: "You're investigating a mysterious situation.",
          firstMessage: "Hi! What clues have you found?"
        },
        advanced: {
          intro: "You're solving a complex puzzle.",
          firstMessage: "Interesting! What's your theory about this?"
        }
      },
      fantasy: {
        beginner: {
          intro: "You want to learn magic from a wizard.",
          firstMessage: "Hello! Do you want to learn some spells?"
        },
        intermediate: {
          intro: "You discovered a magical object.",
          firstMessage: "Welcome! What magical item did you find?"
        },
        advanced: {
          intro: "You're exploring an enchanted realm.",
          firstMessage: "Greetings! What brings you to this magical place?"
        }
      },
      romance: {
        beginner: {
          intro: "You want to talk to someone at a cafe.",
          firstMessage: "Hi! Do you like this coffee?"
        },
        intermediate: {
          intro: "You're at a party and want to meet people.",
          firstMessage: "Hello! What brings you to this party?"
        },
        advanced: {
          intro: "You're attending a cultural event.",
          firstMessage: "Good evening! What interests you about this event?"
        }
      }
    };

    const topicFallback = fallbacks[topic as keyof typeof fallbacks];
    if (topicFallback) {
      const levelFallback = topicFallback[level as keyof typeof topicFallback];
      if (levelFallback) {
        return levelFallback;
      }
    }

    // Ultimate fallback
    return {
      intro: `You see ${topic}. You like ${topic}.`,
      firstMessage: "Hello! You good?"
    };
  }

  // 📊 ПУБЛІЧНИЙ МЕТОД ДЛЯ ОТРИМАННЯ СТАТИСТИКИ
  public getUsageStats() {
    return {
      stats: this.usageStats,
      total: this.usageStats.reduce((acc, stat) => ({
        cost: acc.cost + stat.cost,
        inputTokens: acc.inputTokens + stat.inputTokens,
        outputTokens: acc.outputTokens + stat.outputTokens,
        requests: acc.requests + 1
      }), { cost: 0, inputTokens: 0, outputTokens: 0, requests: 0 })
    };
  }

  // 🧹 ОЧИСТКА СТАТИСТИКИ
  public clearUsageStats() {
    this.usageStats = [];
    console.log('📊 Usage statistics cleared');
  }
}

export const claudeService = new ClaudeService();