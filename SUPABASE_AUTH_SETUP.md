# Налаштування авторизації Supabase для Stories.ai

## 1. Налаштування в Supabase Dashboard

### 1.1 URL Configuration
Перейдіть до **Authentication** → **URL Configuration**:

```
Site URL: https://your-domain.com (або https://stories-ai.vercel.app)
Redirect URLs:
- stories.ai://auth/reset-password
- https://your-domain.com/auth/reset-password
```

### 1.2 Email Templates
Перейдіть до **Authentication** → **Email Templates** → **Reset Password**:

Замініть шаблон на:
```html
<h2>Reset Password</h2>

<p>Follow this link to reset the password for your user:</p>
<p>
  <a href="{{ .ConfirmationURL }}">
     Скинути пароль
   </a>
</p>
```

**ВАЖЛИВО:** Використовуйте `{{ .ConfirmationURL }}` замість `{{ .SiteURL }}/auth/reset-password?type=recovery`

### 1.3 Auth Settings
Перейдіть до **Authentication** → **Settings**:

- ✅ **Enable email confirmations**: ON
- ✅ **Enable email change confirmations**: ON
- ✅ **Enable phone confirmations**: OFF (якщо не потрібно)
- ✅ **Enable phone change confirmations**: OFF

## 2. Налаштування в додатку

### 2.1 app.json (вже налаштовано)
```json
{
  "expo": {
    "scheme": "stories.ai",
    "ios": {
      "associatedDomains": ["applinks:your-domain.com"]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "https",
              "host": "your-domain.com"
            }
          ]
        }
      ]
    }
  }
}
```

### 2.2 Deep Links (вже налаштовано)
Файл `app/_layout.tsx` вже містить обробку deep links.

## 3. Тестування

### 3.1 Локальне тестування
```bash
npx expo start --tunnel
```

### 3.2 Тестування відновлення паролю
1. Відправте запит на відновлення паролю
2. Перевірте email
3. Клікніть на посилання
4. Перевірте, що відкривається додаток

## 4. Альтернативні домени

### 4.1 Vercel (рекомендовано)
```bash
npm i -g vercel
vercel --prod
```
Отримаєте URL: `https://stories-ai-abc123.vercel.app`

### 4.2 Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod
```
Отримаєте URL: `https://random-name-123.netlify.app`

### 4.3 Expo App Links
```bash
npx expo start --tunnel
```
Отримаєте URL: `https://abc123.exp.direct`

## 5. Структура файлів

```
public/
  auth/
    reset-password.html  ← Веб-сторінка для перенаправлення

app/
  auth/
    reset-password.tsx   ← Обробка токенів
    change-password.tsx  ← Зміна паролю

components/
  auth/
    AuthScreen.tsx       ← Логін/реєстрація
    ForgotPasswordScreen.tsx ← Запит на відновлення
```

## 6. Порядок роботи

1. **Користувач** натискає "Forgot Password"
2. **Додаток** відправляє запит на `resetPassword(email)`
3. **Supabase** відправляє email з посиланням
4. **Користувач** клікає на посилання в email
5. **Браузер** відкриває `https://your-domain.com/auth/reset-password`
6. **HTML файл** перенаправляє в `stories.ai://auth/reset-password`
7. **Додаток** обробляє токени та відкриває екран зміни паролю

## 7. Відладка

### 7.1 Перевірка deep links
```bash
npx uri-scheme open "stories.ai://auth/reset-password?access_token=test&refresh_token=test&type=recovery" --ios
```

### 7.2 Логи в додатку
Перевірте консоль на наявність:
```
Deep link received: stories.ai://auth/reset-password?...
Password reset link detected
Redirecting to: /auth/reset-password?...
```

### 7.3 Перевірка Supabase
В Supabase Dashboard → **Authentication** → **Users** перевірте:
- ✅ Користувачі створюються
- ✅ Email підтвердження працює
- ✅ Password reset працює

## 8. Поширені проблеми

### 8.1 Посилання не відкривається в додатку
- Перевірте `app.json` схему
- Перевірте Supabase URL Configuration
- Перевірте HTML файл

### 8.2 Помилка "Invalid reset link"
- Перевірте email template в Supabase
- Перевірте `resetPassword` функцію
- Перевірте токени в URL

### 8.3 Домен не працює
- Використовуйте Vercel/Netlify замість власного домену
- Перевірте DNS налаштування
- Перевірте SSL сертифікат 