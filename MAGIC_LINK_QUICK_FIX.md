# Швидке виправлення Magic Link

## Проблема
Magic link відкриває веб-сторінку замість додатку.

## Швидке рішення

### 1. Налаштування в Supabase Dashboard

1. **Перейдіть до**: Authentication → Settings
2. **Встановіть Site URL**: `stories.ai://auth/callback`
3. **Додайте Redirect URLs**:
   ```
   stories.ai://auth/callback
   stories.ai://*
   ```

### 2. Налаштування Email Template

1. **Перейдіть до**: Authentication → Email Templates
2. **Виберіть**: Magic Link template
3. **Встановіть Redirect URL**: `stories.ai://auth/callback`

### 3. Тестування

1. Відправте magic link
2. Перевірте, чи відкривається додаток одразу
3. Перевірте, чи відображається WelcomeScreen

## Як це працює

1. **Magic link** → **Додаток відкривається** → **exchangeCodeForSession** → **Авторизація** → **WelcomeScreen**

## Переваги

- ✅ **Прямі deep links** без залежності від Vercel
- ✅ **Автоматична авторизація** через exchangeCodeForSession
- ✅ **Кращий UX** - додаток відкривається одразу
- ✅ **Надійність** - працює навіть без інтернету після отримання токену 