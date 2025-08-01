# Тестування Magic Link Авторизації

## Огляд змін

Ми переробили систему авторизації для використання magic link замість паролів. Ось що було змінено:

### 1. Новий хук useAuth
- Додано функцію `sendMagicLink(email)` для відправки magic link
- Додано функцію `getUserProfile(userId)` для отримання профілю користувача
- Оновлено AuthContext для підтримки нових функцій

### 2. Новий компонент MagicLinkAuthScreen
- Поле для введення email
- Кнопка "Send Magic Link"
- Стан "Check your email" після відправки
- Валідація email
- Обробка помилок

### 3. Новий компонент WelcomeScreen
- Відображення привітання: "Welcome!"
- Показ плану підписки: "Your subscription plan: {plan}"
- Завантаження профілю з таблиці profiles
- Обробка помилок та стану завантаження

### 4. Оновлена сторінка auth.tsx
- Використання MagicLinkAuthScreen замість AuthScreen
- Автоматичний перехід на WelcomeScreen після авторизації
- Обробка стану завантаження

### 5. Нова сторінка callback.tsx
- Обробка callback від magic link
- Автоматичне перенаправлення після успішної авторизації

## Як тестувати

### 1. Запуск додатку
```bash
npm start
# або
yarn start
```

### 2. Тестування авторизації
1. Відкрийте додаток
2. Перейдіть на сторінку авторизації
3. Введіть email адресу
4. Натисніть "Send Magic Link"
5. Перевірте email та натисніть на magic link
6. Перевірте, чи відображається WelcomeScreen з планом підписки

### 3. Перевірка профілю користувача
- Після авторизації має відобразитися повідомлення:
  ```
  Welcome! Your subscription plan: {plan}
  ```
- Де {plan} - це значення з поля `subscription_status` з таблиці `profiles`

### 4. Тестування обробки помилок
- Спробуйте ввести некоректний email
- Перевірте повідомлення про помилки
- Спробуйте відправити magic link без email

## Налаштування Supabase

### 1. Email Templates
Переконайтеся, що в Supabase налаштовані email templates для magic link:
1. Перейдіть до Authentication → Email Templates
2. Налаштуйте "Magic Link" template
3. Перевірте, що redirect URL встановлений правильно

### 2. Deep Links
Переконайтеся, що deep links налаштовані правильно:
- URL scheme: `stories.ai://`
- Callback URL: `stories.ai://auth/callback`

### 3. Database Schema
Переконайтеся, що таблиця `profiles` містить поле `subscription_status`:
```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  subscription_status TEXT DEFAULT 'free',
  -- інші поля...
);
```

## Можливі проблеми

### 1. Magic link не приходить
- Перевірте налаштування email в Supabase
- Перевірте, чи не потрапив email в спам
- Перевірте логи в Supabase Dashboard

### 2. Помилка при завантаженні профілю
- Перевірте, чи існує запис в таблиці `profiles`
- Перевірте права доступу до таблиці
- Перевірте консоль на помилки

### 3. Не працює deep link
- Перевірте налаштування в app.json
- Перевірте, чи правильно налаштований URL scheme
- Перевірте, чи працює callback URL

## Логи для діагностики

Додайте ці логи для діагностики:

```typescript
// В useAuth.ts
console.log('Sending magic link to:', email);
console.log('Magic link result:', { data, error });

// В WelcomeScreen.tsx
console.log('Fetching profile for user:', user?.id);
console.log('Profile result:', userProfile);

// В callback.tsx
console.log('Auth callback session:', session);
```

## Наступні кроки

1. Протестуйте всі сценарії авторизації
2. Перевірте роботу на різних пристроях
3. Налаштуйте email templates в Supabase
4. Додайте додаткові перевірки безпеки
5. Оптимізуйте UX на основі тестування 