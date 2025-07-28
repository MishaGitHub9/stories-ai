# Система резюме розмови (Conversation Summary System)

## Опис проблеми

Коли кількість повідомлень у розмові перевищує ліміт (10 повідомлень), старі повідомлення видаляються для економії токенів. Це призводить до втрати контексту - ШІ забуває, що він раніше запитував, і починає все заново.

## Рішення

Створена система резюме, яка:
1. **Аналізує видалені повідомлення** і створює коротке резюме ключової інформації
2. **Зберігає контекст** між сесіями розмови
3. **Нарощує резюме** - кожне нове резюме об'єднується з попереднім
4. **Включає резюме в промпт** для ШІ, щоб він пам'ятав попередній контекст

## Архітектура

### Файли
- `services/conversationSummary.ts` - основний сервіс резюме
- `services/claude.ts` - оновлений для використання резюме
- `app/ai-story.tsx` - оновлений для передачі conversationId

### Ключові компоненти

#### ConversationSummaryService
```typescript
interface ConversationSummary {
  keyTopics: string[];        // Ключові теми обговорення
  userPreferences: string[];  // Інтереси користувача
  corrections: string[];      // Виправлення граматики
  vocabulary: string[];       // Нова лексика
  grammarPoints: string[];    // Граматичні моменти
  context: string;           // Загальний контекст
  lastUpdated: Date;         // Час останнього оновлення
}
```

#### Методи сервісу
- `generateSummary()` - створює резюме з повідомлень
- `updateSummary()` - оновлює існуюче резюме
- `formatSummaryForPrompt()` - форматує для включення в промпт
- `getSummary()` - отримує резюме за ID розмови

## Як це працює

### 1. Створення резюме
Коли кількість повідомлень > 10:
```typescript
// Беремо повідомлення, які будуть видалені
const messagesToSummarize = messages.slice(0, -10);

// Генеруємо резюме через Claude AI
const summary = await conversationSummaryService.generateSummary(
  conversationId,
  messagesToSummarize,
  topic,
  level
);
```

### 2. Аналіз через AI
Claude аналізує повідомлення і створює структуроване резюме:
```json
{
  "keyTopics": ["Paris travel", "hotels", "museums"],
  "userPreferences": ["French food", "city center"],
  "corrections": ["I go → I went", "I like → I would like"],
  "vocabulary": ["accommodation", "landmark", "budget"],
  "grammarPoints": ["past tense", "conditional"],
  "context": "Planning first trip to Paris, looking for hotel near Eiffel Tower"
}
```

### 3. Нарощування резюме
Кожне нове резюме об'єднується з попереднім:
```typescript
const updatedSummary = {
  keyTopics: [...existing.keyTopics, ...new.keyTopics],
  userPreferences: [...existing.userPreferences, ...new.userPreferences],
  // ... інші поля
};
```

### 4. Включення в промпт
Резюме додається до промпту перед історією повідомлень:
```
CONVERSATION SUMMARY:
Key topics: Paris travel, hotels, museums
User interests: French food, city center
Previous corrections: I go → I went, I like → I would like
Introduced vocabulary: accommodation, landmark, budget
Grammar points: past tense, conditional
Context: Planning first trip to Paris, looking for hotel near Eiffel Tower

Previous conversation:
Student: I want to visit the Arc de Triomphe
You: Great choice! It's a must-see landmark...
```

## Переваги

### ✅ Збереження контексту
- ШІ пам'ятає ключові теми обговорення
- Не повторює вже задані питання
- Продовжує розмову з того місця, де зупинився

### ✅ Економія токенів
- Резюме займає ~200-300 токенів
- Замість 1000+ токенів повної історії
- Економія ~70-80% токенів

### ✅ Якість розмови
- Більш природна та послідовна розмова
- ШІ розуміє контекст та інтереси користувача
- Кращі персоналізовані відповіді

### ✅ Масштабованість
- Система працює для довгих розмов
- Автоматичне оновлення резюме
- Підтримка багатьох одночасних розмов

## Використання

### В коді
```typescript
// Створення контексту з ID розмови
const context: ConversationContext = {
  topic: 'travel',
  level: 'intermediate',
  conversationHistory: [...],
  conversationId: 'unique-conversation-id'
};

// Резюме автоматично генерується та включається в промпт
const response = await claudeService.generateResponse(context, userMessage);
```

### У промпті
Резюме автоматично додається перед історією повідомлень:
```
[System Prompt]
[Conversation Summary]
[Recent Messages (last 10)]
[Current User Message]
```

## Налаштування

### Ліміти резюме
```typescript
// Максимальна кількість елементів у масивах
keyTopics: 8
userPreferences: 6
corrections: 10
vocabulary: 15
grammarPoints: 8
```

### Модель AI
- Використовується `claude-3-5-haiku-20241022`
- Оптимізована для швидкого аналізу
- Низька вартість (~$0.0001 за резюме)

## Моніторинг

### Логування
```typescript
console.log('📝 Generated conversation summary:', summary);
console.log('📝 Updated conversation summary:', updatedSummary);
```

### Статистика
```typescript
const stats = conversationSummaryService.getSummaryStats();
// { totalSummaries: 5, activeConversations: 3 }
```

## Тестування

Запустіть тестовий файл:
```bash
node test-summary.js
```

Це перевірить:
- Генерацію резюме
- Оновлення резюме
- Форматування для промпту
- Статистику

## Обробка помилок

### JSON Парсинг
Система включає покращену обробку помилок для JSON парсингу:

1. **Пошук JSON в тексті** - використовує regex для знаходження JSON об'єкта
2. **Валідація типів** - перевіряє, що всі поля мають правильні типи
3. **Fallback механізм** - створює просте резюме навіть при помилці парсингу
4. **Детальне логування** - зберігає оригінальну відповідь для діагностики

### Покращений промпт
```
IMPORTANT: Respond ONLY with valid JSON. No additional text before or after.
Return ONLY the JSON object, no explanations or additional text.
```

## Майбутні покращення

1. **Персистентне збереження** - зберігати резюме в базі даних
2. **Аналітика** - відстежувати ефективність резюме
3. **Налаштування** - дозволити користувачам налаштовувати деталізацію
4. **Многоязычность** - підтримка різних мов для резюме
5. **Контекстні фільтри** - фільтрувати неважливу інформацію

## Висновок

Система резюме ефективно вирішує проблему втрати контексту при обрізанні повідомлень. ШІ тепер пам'ятає ключову інформацію з попередніх частин розмови і може вести більш природну та послідовну бесіду. 