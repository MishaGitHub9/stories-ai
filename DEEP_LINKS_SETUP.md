# Налаштування Deep Links для відновлення паролю

## Проблема
Посилання з пошти для відновлення паролю відкривається в браузері замість додатку.

## Рішення

### 1. Налаштування в Supabase Dashboard

1. Перейдіть до вашого проекту в [Supabase Dashboard](https://supabase.com/dashboard)
2. Перейдіть до **Authentication** → **URL Configuration**
3. В розділі **Site URL** встановіть:
   ```
   https://stories.ai
   ```
4. В розділі **Redirect URLs** додайте:
   ```
   stories.ai://auth/reset-password
   https://stories.ai/auth/reset-password
   ```

### 2. Налаштування в додатку

Файли вже оновлені:
- `app.json` - додано CFBundleURLTypes для iOS
- `app/_layout.tsx` - покращено обробку deep links

### 3. Тестування

1. Запустіть додаток: `npx expo start`
2. Відправте запит на відновлення паролю
3. Перевірте, що посилання з пошти відкривається в додатку

### 4. Додаткові налаштування для production

Для production версії потрібно:
1. Налаштувати домен `stories.ai` з правильними DNS записями
2. Додати SSL сертифікат
3. Налаштувати App Links для Android та Universal Links для iOS

### 5. Альтернативне рішення

Якщо домен `stories.ai` недоступний, можна використати:
```
https://your-app-name.vercel.app/auth/reset-password
```

Або створити власний домен та налаштувати його відповідно. 