# Тестування лічильника історій

## Проблема
Лічильник історій не оновлюється правильно в базі даних Supabase.

## Нова проблема
Лічильник збільшується навіть коли історія не генерується через ліміт.

## Що виправлено

### 1. **Використання актуальних даних**
- Замість `limits.storiesGeneratedToday` використовуємо `initStateRef.current.anonymousUser.stories_generated_today`
- Це гарантує, що ми завжди працюємо з актуальними даними з бази

### 2. **Покращена логіка оновлення**
```typescript
// Стара логіка (проблемна)
const newCount = limits.storiesGeneratedToday + 1;

// Нова логіка (виправлена)
const currentStoriesCount = initStateRef.current.anonymousUser.stories_generated_today;
const newCount = currentStoriesCount + 1;
```

### 3. **Детальне логування**
- Додано логування поточного та нового значення
- Легше відстежувати проблеми

### 4. **Правильна логіка збільшення лічильника**
- Лічильник збільшується тільки при успішному створенні історії
- Видалено дублюючі виклики `incrementStoriesGenerated()`
- Перевірка лімітів виконується перед збільшенням лічильника

## Як тестувати

### Крок 1: Перевірте поточний стан
```javascript
// В консолі браузера або React Native
console.log('Current limits:', limits);
console.log('Anonymous user:', initStateRef.current.anonymousUser);
```

### Крок 2: Згенеруйте історію
1. Відкрийте додаток
2. Згенеруйте історію
3. Перевірте логи в консолі:
   ```
   "Incrementing anonymous stories generated from 1 to: 2"
   ```

### Крок 3: Перевірте базу даних
1. Відкрийте Supabase Table Editor
2. Знайдіть таблицю `anonymous_users`
3. Перевірте поле `stories_generated_today`

### Крок 4: Примусове скидання (якщо потрібно)
```javascript
// В консолі браузера або React Native
await forceResetAnonymousLimits();
```

## Очікувані результати

### ✅ **Правильна поведінка:**
- Лічильник збільшується на 1 при кожній генерації
- Дані в базі оновлюються синхронно
- Ліміти працюють правильно (3 історії на день)
- Лічильник НЕ збільшується при показі модального вікна про ліміт

### ❌ **Проблемна поведінка:**
- Лічильник не збільшується
- Дані в базі не оновлюються
- Ліміти скидаються неочікувано
- Лічильник збільшується навіть коли історія не генерується

## Логи для відстеження

### Успішне оновлення:
```
"Incrementing anonymous stories generated from 1 to: 2"
"Successfully reset limits for anonymous user"
```

### Помилки:
```
"Error incrementing stories generated:"
"Error updating anonymous user:"
"No anonymous user found"
```

## Якщо проблема залишається

1. **Перевірте кеш:**
   ```javascript
   // Очистіть кеш
   clearAnonymousUserCache();
   ```

2. **Перезавантажте ліміти:**
   ```javascript
   // Примусово перезавантажте
   refreshLimits();
   ```

3. **Перевірте мережу:**
   - Переконайтеся, що є з'єднання з Supabase
   - Перевірте права доступу до таблиці

4. **Скиньте ліміти:**
   ```javascript
   // Примусово скиньте (тільки для тестування)
   await forceResetAnonymousLimits();
   ``` 