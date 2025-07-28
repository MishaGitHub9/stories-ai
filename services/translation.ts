import { anthropic, CLAUDE_CONFIG } from '@/config/api';

export type TranslationLanguage = 'ukrainian' | 'german' | 'polish' | 'french' | 'spanish';

// Вартість токенів для Claude API (в USD за 1M токенів)
const CLAUDE_PRICING = {
  'claude-3-5-haiku-20241022': {
    input: 0.25, // $0.25 per 1M input tokens
    output: 1.25, // $1.25 per 1M output tokens
  }
};

// Функція для розрахунку вартості перекладу
function calculateTranslationCost(inputTokens: number, outputTokens: number, model: string): number {
  const pricing = CLAUDE_PRICING[model as keyof typeof CLAUDE_PRICING];
  if (!pricing) {
    console.warn(`Unknown model pricing for: ${model}`);
    return 0;
  }
  
  const inputCost = (inputTokens / 1000000) * pricing.input;
  const outputCost = (outputTokens / 1000000) * pricing.output;
  const totalCost = inputCost + outputCost;
  
  return totalCost;
}

export class TranslationService {
  private static getLanguageMap(): { [key in TranslationLanguage]: string } {
    return {
      ukrainian: 'Ukrainian',
      german: 'German', 
      polish: 'Polish',
      french: 'French',
      spanish: 'Spanish'
    };
  }

  private static getTranslationExamples(language: TranslationLanguage): string {
    const examples = {
      ukrainian: `"Hello" → "Привіт", "Thank you" → "Дякую", "How are you?" → "Як справи?"`,
      german: `"Hello" → "Hallo", "Thank you" → "Danke", "How are you?" → "Wie geht es dir?"`,
      polish: `"Hello" → "Cześć", "Thank you" → "Dziękuję", "How are you?" → "Jak się masz?"`,
      french: `"Hello" → "Bonjour", "Thank you" → "Merci", "How are you?" → "Comment allez-vous?"`,
      spanish: `"Hello" → "Hola", "Thank you" → "Gracias", "How are you?" → "¿Cómo estás?"`
    };
    return examples[language];
  }

  private static async translateWithAI(text: string, targetLanguage: TranslationLanguage = 'ukrainian'): Promise<string> {
    try {
      const languageMap = this.getLanguageMap();
      const targetLang = languageMap[targetLanguage];

      const response = await anthropic.messages.create({
        model: CLAUDE_CONFIG.model,
        max_tokens: 200,
        temperature: 0.3,
        system: `You are a professional English to ${targetLang} translator.

TASK: Translate the given English text to ${targetLang}.
REQUIREMENTS:
- Provide ONLY the ${targetLang} translation
- Keep the same tone and formality level
- Preserve formatting if present

EXAMPLES: ${this.getTranslationExamples(targetLanguage)}

Translate to ${targetLang}:`,
        messages: [
          {
            role: 'user',
            content: text
          }
        ]
      });

      if (response.content[0].type === 'text') {
        // Логування вартості перекладу
        const inputTokens = response.usage?.input_tokens || 0;
        const outputTokens = response.usage?.output_tokens || 0;
        const totalCost = calculateTranslationCost(inputTokens, outputTokens, CLAUDE_CONFIG.model);
        
        console.log(`🎭 Translation:`);
        console.log(`Input tokens: ${inputTokens}`);
        console.log(`Output tokens: ${outputTokens}`);
        console.log(`Cost: $${totalCost.toFixed(6)}`);
        
        return response.content[0].text.trim();
      }
      
      throw new Error('Unexpected response format from Claude');
    } catch (error: any) {
      console.error('Translation API Error:', error);
      return 'Помилка перекладу';
    }
  }

  // Fallback simple translations for common phrases
  private static simpleTranslations: { [key: string]: string } = {
    'hello': 'привіт',
    'hi': 'привіт',
    'thank you': 'дякую',
    'thanks': 'дякую',
    'please': 'будь ласка',
    'yes': 'так',
    'no': 'ні',
    'good': 'хороший',
    'bad': 'поганий',
    'big': 'великий',
    'small': 'малий',
    'house': 'будинок',
    'food': 'їжа',
    'water': 'вода',
    'friend': 'друг',
    'family': 'сім\'я',
    'work': 'робота',
    'home': 'дім',
    'school': 'школа',
    'book': 'книга',
    'phone': 'телефон',
    'time': 'час',
    'day': 'день',
    'night': 'ніч',
    'red': 'червоний',
    'blue': 'синій',
    'green': 'зелений',
    'yellow': 'жовтий',
    'black': 'чорний',
    'white': 'білий',
    'one': 'один',
    'two': 'два',
    'three': 'три',
    'four': 'чотири',
    'five': 'п\'ять',
  };

  static async translate(text: string, targetLanguage: TranslationLanguage = 'ukrainian'): Promise<string> {
    // Try AI translation first
    try {
      const aiTranslation = await this.translateWithAI(text, targetLanguage);
      if (aiTranslation && aiTranslation !== 'Помилка перекладу') {
        return aiTranslation;
      }
    } catch (error) {
      console.log('AI translation failed, using fallback');
    }

    // Fallback to simple translations (only for Ukrainian)
    if (targetLanguage === 'ukrainian') {
      const cleanText = text.toLowerCase().trim();
      return this.simpleTranslations[cleanText] || text;
    }

    return text; // Return original text for other languages if AI fails
  }

  static async getTranslation(text: string, targetLanguage: TranslationLanguage = 'ukrainian'): Promise<{ original: string; translation: string }> {
    const translation = await this.translate(text, targetLanguage);
    const errorMessages = {
      ukrainian: 'Переклад не знайдено',
      german: 'Übersetzung nicht gefunden',
      polish: 'Tłumaczenie nie znalezione',
      french: 'Traduction non trouvée',
      spanish: 'Traducción no encontrada'
    };
    
    const result = {
      original: text,
      translation: translation === text ? errorMessages[targetLanguage] : translation
    };
    
    return result;
  }
}