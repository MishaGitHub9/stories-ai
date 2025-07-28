# API Setup Guide

## Налаштування API ключів

### 1. Claude API (Anthropic)
1. Зайдіть на https://console.anthropic.com/
2. Створіть новий API ключ
3. Скопіюйте ключ та замініть в `config/api.ts`:
```typescript
const CLAUDE_API_KEY = 'your-claude-api-key-here';
```

### 2. OpenAI API (GPT-4o-mini)
1. Зайдіть на https://platform.openai.com/api-keys
2. Створіть новий API ключ
3. Скопіюйте ключ та замініть в `config/api.ts`:
```typescript
const OPENAI_API_KEY = 'your-openai-api-key-here';
```

## Логіка вибору моделі

### Автоматичний вибір моделі:
- **Кириличний текст** → GPT-4o-mini
- **Англійський та інші мови** → Claude-3-5-haiku

### Приклади:
- "Привіт, як справи?" → GPT-4o-mini
- "Hello, how are you?" → Claude-3-5-haiku
- "Hola, ¿cómo estás?" → Claude-3-5-haiku

## Вартість використання

### Claude-3-5-haiku:
- Input: $0.25 per 1M tokens
- Output: $1.25 per 1M tokens

### GPT-4o-mini:
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens

## Моніторинг

Всі запити логуються з інформацією про:
- Використану модель
- Кількість токенів
- Вартість запиту
- Загальну статистику використання

## Безпека

⚠️ **ВАЖЛИВО**: Ніколи не комітьте API ключі в Git!
- Використовуйте змінні середовища
- Додайте `config/api.ts` до `.gitignore`
- Використовуйте `.env` файли для локальної розробки 