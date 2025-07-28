# Інструкції для оновлення бази даних

## Проблема
Якщо ви отримуєте помилку:
```
ERROR: 42710: trigger "on_auth_user_created" for relation "users" already exists
```

Це означає, що у вас вже є база даних зі старою схемою, і потрібно її оновити.

## Рішення

### Варіант 1: Використати повний скрипт (Рекомендовано)

1. Відкрийте Supabase Dashboard
2. Перейдіть до SQL Editor
3. Скопіюйте та виконайте весь вміст файлу `database/full_schema.sql`

**Цей скрипт створить всі таблиці з нуля і безпечний для використання.**

Цей скрипт:
- Видалить старі тригери, функції та таблиці (якщо вони існують)
- Створить всі таблиці з нуля
- Створить всі необхідні політики безпеки
- Створить записи профілів та лімітів для існуючих користувачів

### Варіант 2: Ручне оновлення

Якщо ви хочете виконати оновлення вручну:

1. **Видаліть старий тригер:**
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

2. **Видаліть стару функцію:**
```sql
DROP FUNCTION IF EXISTS public.handle_new_user();
```

3. **Додайте нові поля до таблиці profiles:**
```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE;
```

4. **Створіть нові таблиці** (використайте вміст з `database/schema.sql`)

5. **Створіть записи лімітів для існуючих користувачів:**
```sql
INSERT INTO user_limits (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_limits)
ON CONFLICT (user_id) DO NOTHING;
```

### Варіант 3: Повне перестворення (Тільки для розробки)

⚠️ **УВАГА: Це видалить всі дані!**

Якщо ви в режимі розробки і можете видалити всі дані:

1. В Supabase Dashboard перейдіть до Settings → Database
2. Натисніть "Reset Database"
3. Після скидання виконайте новий скрипт `database/schema.sql`

## Перевірка

Після оновлення перевірте, що все працює:

1. **Перевірте таблиці:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('anonymous_users', 'user_limits', 'stories', 'story_messages', 'subscriptions');
```

2. **Перевірте тригер:**
```sql
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

3. **Перевірте політики:**
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Поширені помилки

### Помилка: "relation does not exist"
- Переконайтеся, що ви виконуєте скрипт в правильній базі даних
- Перевірте, що Supabase підключений

### Помилка: "permission denied"
- Переконайтеся, що ви використовуєте правильні права доступу
- В Supabase використовуйте SQL Editor з повними правами

### Помилка: "duplicate key value"
- Це нормально, якщо записи вже існують
- Скрипт використовує `ON CONFLICT DO NOTHING` для безпеки

## Підтримка

Якщо у вас виникають проблеми:

1. Перевірте логи в Supabase Dashboard
2. Переконайтеся, що всі SQL команди виконані успішно
3. Перевірте, що всі таблиці створені правильно

## Наступні кроки

Після успішного оновлення бази даних:

1. Перезапустіть додаток
2. Протестуйте функціональність лімітів
3. Перевірте, що анонімні користувачі працюють
4. Перевірте, що зареєстровані користувачі мають правильні ліміти 