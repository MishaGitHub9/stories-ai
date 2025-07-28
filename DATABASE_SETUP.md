# Налаштування бази даних для Stories.ai

## Крок 1: Створення таблиці профілів

1. **Перейдіть до вашого проекту Supabase**
2. **Зліва натисніть "SQL Editor"**
3. **Натисніть "New query"**
4. **Скопіюйте та вставте весь код з файлу `database/schema.sql`**
5. **Натисніть "Run"**

## Крок 2: Перевірка створення таблиці

1. **Перейдіть до "Table Editor"**
2. **Ви повинні побачити таблицю `profiles`**
3. **Перевірте, що всі колонки створені правильно**

## Крок 3: Тестування автоматичного створення профілю

1. **Зареєструйте нового користувача** в додатку
2. **Перейдіть до "Table Editor" → "profiles"**
3. **Ви повинні побачити новий запис** з email користувача

## Структура таблиці profiles

| Колонка | Тип | Опис |
|---------|-----|------|
| `id` | UUID | ID користувача (з auth.users) |
| `email` | TEXT | Email користувача |
| `full_name` | TEXT | Повне ім'я (опціонально) |
| `avatar_url` | TEXT | URL аватара (опціонально) |
| `subscription_status` | TEXT | Статус підписки: 'free', 'premium', 'pro' |
| `subscription_plan` | TEXT | План: 'monthly', 'yearly', 'lifetime' |
| `subscription_start_date` | TIMESTAMP | Дата початку підписки |
| `subscription_end_date` | TIMESTAMP | Дата закінчення підписки |
| `subscription_provider` | TEXT | Провайдер: 'stripe', 'apple', 'google' |
| `subscription_id` | TEXT | ID підписки в платіжній системі |
| `is_active` | BOOLEAN | Чи активний акаунт |
| `created_at` | TIMESTAMP | Дата створення |
| `updated_at` | TIMESTAMP | Дата оновлення |

## Безпека

- ✅ Row Level Security (RLS) увімкнено
- ✅ Користувач може бачити тільки свій профіль
- ✅ Користувач може оновлювати тільки свій профіль
- ✅ Автоматичне створення профілю при реєстрації

## Функції для роботи з підпискою

### Перевірка статусу підписки:
```typescript
const { hasActiveSubscription, isPremium, isPro } = useProfile();

if (hasActiveSubscription()) {
  // Користувач має активну підписку
}

if (isPremium()) {
  // Користувач має Premium підписку
}

if (isPro()) {
  // Користувач має Pro підписку
}
```

### Оновлення підписки:
```typescript
const { updateSubscription } = useProfile();

await updateSubscription({
  subscription_status: 'premium',
  subscription_plan: 'monthly',
  subscription_start_date: new Date().toISOString(),
  subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  subscription_provider: 'stripe',
  subscription_id: 'sub_123456'
});
```

## Моніторинг

1. **Перейдіть до "Logs"** в Supabase Dashboard
2. **Перевірте "Database logs"** для моніторингу запитів
3. **Перевірте "Auth logs"** для моніторингу авторизації

## Підтримка

Якщо виникли проблеми:
1. Перевірте логи в Supabase Dashboard
2. Переконайтеся, що всі SQL команди виконані успішно
3. Перевірте, що RLS політики створені правильно 