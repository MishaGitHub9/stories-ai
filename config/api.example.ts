import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// API ключі з змінних середовища
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || 'your-claude-api-key-here';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-openai-api-key-here';

export const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
});

export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export const CLAUDE_CONFIG = {
  model: 'claude-3-5-haiku-20241022',
  max_tokens: 200, // Increased slightly for error corrections and explanations
  temperature: 0.3, // Lower temperature for more realistic and consistent responses
};

export const GPT_CONFIG = {
  model: 'gpt-4o-mini',
  max_tokens: 200,
  temperature: 0.3,
};

// Конфігурація для різних моделей
export const MODEL_CONFIG = {
  fast: {
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 200,
    temperature: 0.3,
  }
};

// Функція для визначення мови повідомлення
export function detectLanguage(text: string): 'english' | 'cyrillic' | 'other' {
  // Детектор кириличного тексту
  const cyrillicPattern = /[а-яёіїєґ]/i;
  
  // Детектор англійського тексту
  const englishPattern = /^[a-zA-Z\s.,!?'"()-]+$/;
  
  // Інші мови
  const otherLanguagesPattern = /[áéíóúñüäöüßąćęłńóśźżàâäéèêëïîôöùûüÿç]/i;
  
  if (cyrillicPattern.test(text)) {
    return 'cyrillic';
  } else if (englishPattern.test(text)) {
    return 'english';
  } else if (otherLanguagesPattern.test(text)) {
    return 'other';
  }
  
  // Якщо немає спеціальних символів, вважаємо англійським
  return 'english';
} 