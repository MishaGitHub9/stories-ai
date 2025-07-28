import { anthropic } from '@/config/api';

export interface ConversationSummary {
  keyTopics: string[];
  userPreferences: string[];
  corrections: string[];
  vocabulary: string[];
  grammarPoints: string[];
  context: string;
  lastUpdated: Date;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class ConversationSummaryService {
  private summaries: Map<string, ConversationSummary> = new Map();
  private summaryCache: Map<string, { summary: ConversationSummary; messageCount: number }> = new Map();

  /**
   * Генерує резюме з історії повідомлень
   */
  async generateSummary(
    conversationId: string,
    messages: Message[],
    topic: string,
    level: string
  ): Promise<ConversationSummary> {
    try {
      // Якщо повідомлень мало, не потрібно резюме
      if (messages.length <= 10) {
        return this.getEmptySummary();
      }

      // Беремо повідомлення, які будуть видалені (всі крім останніх 10)
      const messagesToSummarize = messages.slice(0, -10);
      
      // Оптимізація: створюємо резюме тільки кожні 5 повідомлень
      const shouldCreateSummary = messagesToSummarize.length % 5 === 0;
      if (!shouldCreateSummary) {
        console.log(`📝 Skipping summary creation (messages: ${messagesToSummarize.length}, will create at ${Math.ceil(messagesToSummarize.length / 5) * 5})`);
        return this.getEmptySummary();
      }
      
      // Кешування: перевіряємо, чи вже є резюме для цієї кількості повідомлень
      const cacheKey = `${conversationId}-${messagesToSummarize.length}`;
      const cached = this.summaryCache.get(cacheKey);
      if (cached && cached.messageCount === messagesToSummarize.length) {
        console.log(`📝 Using cached summary for ${messagesToSummarize.length} messages`);
        return cached.summary;
      }
      
      if (messagesToSummarize.length === 0) {
        return this.getEmptySummary();
      }

      // Формуємо текст для аналізу
      const conversationText = messagesToSummarize
        .map(msg => `${msg.role === 'user' ? 'Student' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const systemPrompt = `Analyze this English learning conversation and create a concise summary.

TOPIC: ${topic}
LEVEL: ${level}

EXTRACT:
1. Key topics discussed (3-5 main points)
2. User's preferences/interests mentioned
3. Grammar corrections made
4. New vocabulary introduced
5. Important context/details

IMPORTANT: Respond ONLY with valid JSON. No additional text before or after.

FORMAT your response as JSON:
{
  "keyTopics": ["topic1", "topic2", "topic3"],
  "userPreferences": ["preference1", "preference2"],
  "corrections": ["correction1", "correction2"],
  "vocabulary": ["word1", "word2"],
  "grammarPoints": ["grammar1", "grammar2"],
  "context": "Brief context summary"
}

Keep each array item short (1-3 words). Focus on what's important for continuing the conversation.
Return ONLY the JSON object, no explanations or additional text.`;

      const response = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 300,
        temperature: 0.1,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: conversationText
          }
        ]
      });

      if (response.content[0].type === 'text') {
        const summaryText = response.content[0].text.trim();
        
        // Парсимо JSON відповідь з покращеною обробкою помилок
        try {
          // Спробуємо знайти JSON в тексті
          const jsonMatch = summaryText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            console.error('No JSON found in response:', summaryText);
            return this.getEmptySummary();
          }
          
          const jsonText = jsonMatch[0];
          const summaryData = JSON.parse(jsonText);
          
          const summary: ConversationSummary = {
            keyTopics: Array.isArray(summaryData.keyTopics) ? summaryData.keyTopics : [],
            userPreferences: Array.isArray(summaryData.userPreferences) ? summaryData.userPreferences : [],
            corrections: Array.isArray(summaryData.corrections) ? summaryData.corrections : [],
            vocabulary: Array.isArray(summaryData.vocabulary) ? summaryData.vocabulary : [],
            grammarPoints: Array.isArray(summaryData.grammarPoints) ? summaryData.grammarPoints : [],
            context: typeof summaryData.context === 'string' ? summaryData.context : '',
            lastUpdated: new Date()
          };

          // Зберігаємо резюме
          this.summaries.set(conversationId, summary);
          
          // Кешуємо резюме
          this.summaryCache.set(cacheKey, {
            summary,
            messageCount: messagesToSummarize.length
          });
          
          console.log('📝 Generated conversation summary:', summary);
          return summary;
        } catch (parseError) {
          console.error('Failed to parse summary JSON:', parseError);
          console.error('Raw response:', summaryText);
          
          // Fallback: спробуємо створити просте резюме з тексту
          try {
            const fallbackSummary = this.createFallbackSummary(summaryText, topic);
            
            // Кешуємо fallback резюме
            this.summaryCache.set(cacheKey, {
              summary: fallbackSummary,
              messageCount: messagesToSummarize.length
            });
            
            console.log('📝 Using fallback summary:', fallbackSummary);
            return fallbackSummary;
          } catch (fallbackError) {
            console.error('Fallback summary creation failed:', fallbackError);
            return this.getEmptySummary();
          }
        }
      }

      return this.getEmptySummary();
    } catch (error) {
      console.error('Error generating conversation summary:', error);
      return this.getEmptySummary();
    }
  }

  /**
   * Оновлює існуюче резюме новими даними
   */
  async updateSummary(
    conversationId: string,
    newMessages: Message[],
    topic: string,
    level: string
  ): Promise<ConversationSummary> {
    const existingSummary = this.summaries.get(conversationId) || this.getEmptySummary();
    
    // Генеруємо резюме з нових повідомлень
    const newSummary = await this.generateSummary(conversationId, newMessages, topic, level);
    
    // Об'єднуємо з існуючим резюме
    const updatedSummary: ConversationSummary = {
      keyTopics: [...new Set([...existingSummary.keyTopics, ...newSummary.keyTopics])],
      userPreferences: [...new Set([...existingSummary.userPreferences, ...newSummary.userPreferences])],
      corrections: [...new Set([...existingSummary.corrections, ...newSummary.corrections])],
      vocabulary: [...new Set([...existingSummary.vocabulary, ...newSummary.vocabulary])],
      grammarPoints: [...new Set([...existingSummary.grammarPoints, ...newSummary.grammarPoints])],
      context: existingSummary.context + (newSummary.context ? ` ${newSummary.context}` : ''),
      lastUpdated: new Date()
    };

    // Обмежуємо кількість елементів у масивах
    updatedSummary.keyTopics = updatedSummary.keyTopics.slice(0, 8);
    updatedSummary.userPreferences = updatedSummary.userPreferences.slice(0, 6);
    updatedSummary.corrections = updatedSummary.corrections.slice(0, 10);
    updatedSummary.vocabulary = updatedSummary.vocabulary.slice(0, 15);
    updatedSummary.grammarPoints = updatedSummary.grammarPoints.slice(0, 8);

    this.summaries.set(conversationId, updatedSummary);
    
    console.log('📝 Updated conversation summary:', updatedSummary);
    return updatedSummary;
  }

  /**
   * Отримує резюме для розмови
   */
  getSummary(conversationId: string): ConversationSummary | null {
    return this.summaries.get(conversationId) || null;
  }

  /**
   * Формує текст резюме для включення в промпт
   */
  formatSummaryForPrompt(summary: ConversationSummary): string {
    if (!summary || this.isEmptySummary(summary)) {
      return '';
    }

    let summaryText = 'CONVERSATION SUMMARY:\n';
    
    if (summary.keyTopics.length > 0) {
      summaryText += `Key topics: ${summary.keyTopics.join(', ')}\n`;
    }
    
    if (summary.userPreferences.length > 0) {
      summaryText += `User interests: ${summary.userPreferences.join(', ')}\n`;
    }
    
    if (summary.corrections.length > 0) {
      summaryText += `Previous corrections: ${summary.corrections.join(', ')}\n`;
    }
    
    if (summary.vocabulary.length > 0) {
      summaryText += `Introduced vocabulary: ${summary.vocabulary.join(', ')}\n`;
    }
    
    if (summary.grammarPoints.length > 0) {
      summaryText += `Grammar points: ${summary.grammarPoints.join(', ')}\n`;
    }
    
    if (summary.context) {
      summaryText += `Context: ${summary.context}\n`;
    }

    return summaryText;
  }

  /**
   * Створює порожнє резюме
   */
  private getEmptySummary(): ConversationSummary {
    return {
      keyTopics: [],
      userPreferences: [],
      corrections: [],
      vocabulary: [],
      grammarPoints: [],
      context: '',
      lastUpdated: new Date()
    };
  }

  /**
   * Перевіряє чи резюме порожнє
   */
  private isEmptySummary(summary: ConversationSummary): boolean {
    return (
      summary.keyTopics.length === 0 &&
      summary.userPreferences.length === 0 &&
      summary.corrections.length === 0 &&
      summary.vocabulary.length === 0 &&
      summary.grammarPoints.length === 0 &&
      !summary.context
    );
  }

  /**
   * Очищає резюме для розмови
   */
  clearSummary(conversationId: string): void {
    this.summaries.delete(conversationId);
  }

  /**
   * Створює просте резюме з тексту відповіді (fallback)
   */
  private createFallbackSummary(responseText: string, topic: string): ConversationSummary {
    // Простий парсинг ключових слів з тексту
    const text = responseText.toLowerCase();
    
    const keyTopics: string[] = [];
    const userPreferences: string[] = [];
    const corrections: string[] = [];
    const vocabulary: string[] = [];
    const grammarPoints: string[] = [];
    
    // Шукаємо ключові слова
    if (text.includes('travel') || text.includes('trip') || text.includes('visit')) {
      keyTopics.push('travel');
    }
    if (text.includes('hotel') || text.includes('accommodation')) {
      keyTopics.push('accommodation');
    }
    if (text.includes('food') || text.includes('restaurant')) {
      keyTopics.push('food');
    }
    if (text.includes('museum') || text.includes('culture')) {
      keyTopics.push('culture');
    }
    
    // Шукаємо інтереси
    if (text.includes('like') || text.includes('prefer')) {
      userPreferences.push('preferences mentioned');
    }
    
    // Шукаємо виправлення
    if (text.includes('correction') || text.includes('grammar')) {
      corrections.push('grammar corrections');
    }
    
    // Шукаємо лексику
    if (text.includes('vocabulary') || text.includes('words')) {
      vocabulary.push('new vocabulary');
    }
    
    // Контекст
    const context = `Fallback summary for ${topic} conversation`;
    
    return {
      keyTopics,
      userPreferences,
      corrections,
      vocabulary,
      grammarPoints,
      context,
      lastUpdated: new Date()
    };
  }

  /**
   * Отримує статистику резюме
   */
  getSummaryStats(): { totalSummaries: number; activeConversations: number } {
    return {
      totalSummaries: this.summaries.size,
      activeConversations: this.summaries.size
    };
  }
}

export const conversationSummaryService = new ConversationSummaryService(); 