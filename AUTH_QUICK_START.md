# 🚀 Швидкий старт авторизації Stories.ai

## Що вже налаштовано ✅

- ✅ Supabase конфігурація
- ✅ Deep links обробка
- ✅ Екрани авторизації
- ✅ Відновлення паролю
- ✅ HTML сторінка для перенаправлення

## Що потрібно зробити 🔧

### 1. Налаштувати Supabase (5 хв)

1. Перейдіть до [Supabase Dashboard](https://supabase.com/dashboard)
2. Виберіть ваш проект
3. Перейдіть до **Authentication** → **URL Configuration**
4. Встановіть:
   ```
   Site URL: https://stories-ai.vercel.app (або ваш домен)
   Redirect URLs:
   - stories.ai://auth/reset-password
   - https://stories-ai.vercel.app/auth/reset-password
   ```

### 2. Оновити Email Template (2 хв)

1. Перейдіть до **Authentication** → **Email Templates** → **Reset Password**
2. Замініть посилання на:
   ```html
   <a href="{{ .ConfirmationURL }}">
      Скинути пароль
   </a>
   ```

### 3. Деплой на Vercel (5 хв)

```bash
# Встановити Vercel CLI
npm i -g vercel

# Деплой
vercel --prod

# Скопіювати URL (наприклад: https://stories-ai-abc123.vercel.app)
```

### 4. Оновити Supabase з новим URL

В Supabase Dashboard оновіть:
```
Site URL: https://stories-ai-abc123.vercel.app
Redirect URLs:
- stories.ai://auth/reset-password
- https://stories-ai-abc123.vercel.app/auth/reset-password
```

### 5. Тестування (5 хв)

```bash
# Запустити додаток
npx expo start

# Протестувати відновлення паролю
# 1. Відправте запит на відновлення
# 2. Перевірте email
# 3. Клікніть на посилання
# 4. Перевірте, що відкривається додаток
```

## Структура файлів 📁

```
├── config/supabase.ts          ← Supabase клієнт
├── hooks/useAuth.ts            ← Авторизація логіка
├── contexts/AuthContext.tsx    ← Auth контекст
├── components/auth/            ← UI компоненти
├── app/auth/                   ← Екрани авторизації
├── public/auth/                ← Веб-сторінки
└── vercel.json                 ← Vercel конфігурація
```

## Тестування 🔍

### Тест deep links:
```bash
npx uri-scheme open "stories.ai://auth/reset-password?access_token=test&refresh_token=test&type=recovery" --ios
```

### Перевірка логів:
В консолі додатку повинно бути:
```
Deep link received: stories.ai://auth/reset-password?...
Password reset link detected
Redirecting to: /auth/reset-password?...
```

## Готово! 🎉

Тепер у вас є повна система авторизації з:
- ✅ Логін/реєстрація
- ✅ Відновлення паролю
- ✅ Deep links
- ✅ Веб-сторінка для перенаправлення
- ✅ Красивий UI

**Час налаштування: ~15 хвилин** 