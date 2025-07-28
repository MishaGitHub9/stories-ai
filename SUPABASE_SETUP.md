# Налаштування Supabase для авторизації

## 1. Створення проекту Supabase

1. Перейдіть на [supabase.com](https://supabase.com)
2. Створіть новий акаунт або увійдіть в існуючий
3. Створіть новий проект
4. Зачекайте завершення налаштування проекту

## 2. Отримання ключів API

1. У вашому проекті Supabase перейдіть до **Settings** → **API**
2. Скопіюйте:
   - **Project URL** (виглядає як `https://your-project.supabase.co`)
   - **anon public** ключ

## 3. Налаштування авторизації

### Email авторизація

1. Перейдіть до **Authentication** → **Settings**
2. Увімкніть **Enable email confirmations** якщо потрібно
3. Налаштуйте **Site URL** на `stories.ai://`
4. У **Redirect URLs** додайте:
   - `stories.ai://`
   - `stories.ai://reset-password`

### Google OAuth

1. Перейдіть до **Authentication** → **Providers**
2. Увімкніть **Google**
3. Створіть OAuth 2.0 Client ID в [Google Cloud Console](https://console.cloud.google.com):
   - Перейдіть до **APIs & Services** → **Credentials**
   - Створіть **OAuth 2.0 Client ID**
   - Тип: **Web application**
   - Authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
4. Скопіюйте **Client ID** та **Client Secret** в Supabase

## 4. Оновлення конфігурації

1. Відкрийте файл `config/supabase.ts`
2. Замініть `YOUR_SUPABASE_URL` на ваш Project URL
3. Замініть `YOUR_SUPABASE_ANON_KEY` на ваш anon public ключ

```typescript
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key-here';
```

## 5. Налаштування схеми URL

Для iOS додайте в `app.json`:

```json
{
  "expo": {
    "scheme": "stories.ai",
    "ios": {
      "bundleIdentifier": "com.mihadev.story.ai"
    }
  }
}
```

## 6. Тестування

1. Запустіть додаток: `npm start`
2. Спробуйте зареєструватися з email
3. Спробуйте увійти через Google
4. Перевірте відновлення пароля

## 7. Додаткові налаштування

### Row Level Security (RLS)

Якщо ви плануєте зберігати дані користувачів, увімкніть RLS:

```sql
-- Приклад для таблиці profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Увімкнення RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Політика для користувачів
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### Email шаблони

Налаштуйте email шаблони в **Authentication** → **Email Templates**:
- Confirmation email
- Reset password email
- Magic link email

## 8. Безпека

- Ніколи не комітьте ключі API в Git
- Використовуйте змінні середовища для продакшену
- Регулярно оновлюйте ключі
- Налаштуйте доменні обмеження для OAuth

## 9. Моніторинг

Використовуйте **Logs** в Supabase для моніторингу:
- Authentication logs
- API requests
- Database queries

## Підтримка

Якщо виникли проблеми:
1. Перевірте логи в Supabase Dashboard
2. Переконайтеся, що всі URL правильно налаштовані
3. Перевірте налаштування OAuth провайдерів 