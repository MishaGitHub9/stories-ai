# Налаштування API Ключів

## Проблема
Файл `config/api.ts` був доданий до `.gitignore` для безпеки, оскільки містив API ключі.

## Рішення

### 1. Створіть файл config/api.ts
Скопіюйте вміст з `config/api.example.ts` та створіть `config/api.ts`:

```bash
cp config/api.example.ts config/api.ts
```

### 2. Налаштуйте API ключі

#### Варіант A: Змінні середовища (рекомендовано)
Створіть файл `.env` в корені проекту:

```env
CLAUDE_API_KEY=your-claude-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

#### Варіант B: Пряме вставлення (не рекомендується для production)
Відредагуйте `config/api.ts` та замініть placeholder'и на реальні ключі:

```typescript
const CLAUDE_API_KEY = 'sk-ant-api03-your-actual-key';
const OPENAI_API_KEY = 'sk-proj-your-actual-key';
```

### 3. Отримання API ключів

#### Claude API Key
1. Перейдіть до [Anthropic Console](https://console.anthropic.com/)
2. Створіть новий API ключ
3. Скопіюйте ключ (починається з `sk-ant-api03-`)

#### OpenAI API Key
1. Перейдіть до [OpenAI Platform](https://platform.openai.com/api-keys)
2. Створіть новий API ключ
3. Скопіюйте ключ (починається з `sk-`)

### 4. Перевірка налаштувань

#### Локальне тестування
```bash
npm start
```

#### EAS Build
Для EAS Build додайте змінні середовища в `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "CLAUDE_API_KEY": "your-claude-api-key",
        "OPENAI_API_KEY": "your-openai-api-key"
      }
    }
  }
}
```

### 5. Безпека

#### ✅ Правильно:
- Використовуйте змінні середовища
- Додайте `.env` до `.gitignore`
- Не комітьте API ключі в git

#### ❌ Неправильно:
- Не додавайте API ключі в код
- Не комітьте `.env` файли
- Не публікуйте ключі в публічних репозиторіях

### 6. Troubleshooting

#### Помилка: "API key not found"
- Перевірте, чи файл `config/api.ts` існує
- Перевірте, чи правильно встановлені змінні середовища
- Перевірте, чи API ключі дійсні

#### Помилка: "Rate limit exceeded"
- Перевірте ліміти вашого API плану
- Зменшіть кількість запитів
- Розгляньте оновлення плану

## Наступні кроки

1. Створіть `config/api.ts` з вашими API ключами
2. Протестуйте локальну збірку
3. Налаштуйте змінні середовища для EAS Build
4. Протестуйте magic link авторизацію 