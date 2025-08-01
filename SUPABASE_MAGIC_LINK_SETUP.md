# Налаштування Magic Link в Supabase

## Проблема
Magic link відкриває веб-сторінку замість додатку. Це означає, що deep link не налаштований правильно.

## Рішення

### 1. Налаштування в Supabase Dashboard

#### Крок 1: Перейдіть до Authentication Settings
1. Відкрийте ваш проект в Supabase Dashboard
2. Перейдіть до **Authentication** → **Settings**
3. Знайдіть розділ **URL Configuration**

#### Крок 2: Налаштуйте Site URL
Встановіть:
- **Site URL**: `https://storylish-mxwlt1w0g-ms-projects-2554a4d0.vercel.app`
- **Redirect URLs**: 
  ```
  https://storylish-mxwlt1w0g-ms-projects-2554a4d0.vercel.app/auth-callback.html
  stories.ai://auth/callback
  stories.ai://*
  ```

#### Крок 3: Налаштуйте Email Templates
1. Перейдіть до **Authentication** → **Email Templates**
2. Виберіть **Magic Link** template
3. В розділі **Redirect URL** встановіть:
   ```
   https://storylish-mxwlt1w0g-ms-projects-2554a4d0.vercel.app/auth-callback.html
   ```

### 2. Розгортання веб-сторінки fallback

#### Крок 1: Завантажте auth-callback.html
Файл `public/auth-callback.html` має бути розгорнутий на вашому домені:
`https://storylish-mxwlt1w0g-ms-projects-2554a4d0.vercel.app/auth-callback.html`

#### Крок 2: Перевірте розгортання
Відкрийте в браузері:
`https://storylish-mxwlt1w0g-ms-projects-2554a4d0.vercel.app/auth-callback.html`

Ви маєте побачити сторінку з повідомленням "Redirecting to Stories.ai"

### 3. Перевірка конфігурації додатку

#### app.json
Переконайтеся, що в `app.json` правильно налаштовані deep links:

```json
{
  "expo": {
    "scheme": "stories.ai",
    "ios": {
      "infoPlist": {
        "CFBundleURLTypes": [
          {
            "CFBundleURLName": "stories.ai",
            "CFBundleURLSchemes": ["stories.ai"]
          }
        ]
      }
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "stories.ai"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

#### useAuth.ts
Переконайтеся, що в `hooks/useAuth.ts` використовується правильний redirect URL:

```typescript
const sendMagicLink = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://storylish-mxwlt1w0g-ms-projects-2554a4d0.vercel.app/auth-callback.html',
      },
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
```

### 4. Як це працює

1. **Користувач натискає magic link в email**
2. **Відкривається веб-сторінка** `auth-callback.html`
3. **Веб-сторінка автоматично перенаправляє** на `stories.ai://auth/callback`
4. **Додаток відкривається** і обробляє callback
5. **Користувач авторизується** і бачить WelcomeScreen

### 5. Тестування

#### Крок 1: Перезапустіть додаток
```bash
npm start
# або
yarn start
```

#### Крок 2: Протестуйте magic link
1. Відправте magic link на тестовий email
2. Перевірте, чи відкривається веб-сторінка з повідомленням "Redirecting to Stories.ai"
3. Перевірте, чи автоматично відкривається додаток
4. Перевірте, чи працює callback і відображається WelcomeScreen

### 6. Альтернативні рішення

#### Якщо deep link все ще не працює:

1. **Перевірте, чи додаток встановлений**
   - Deep link працює тільки якщо додаток встановлений
   - Якщо додаток не встановлений, користувач залишиться на веб-сторінці

2. **Додайте інструкції для користувача**
   ```html
   <p>If the app doesn't open automatically, please install the Stories.ai app and try again.</p>
   ```

3. **Використовуйте Universal Links (iOS)**
   ```json
   {
     "ios": {
       "associatedDomains": [
         "applinks:storylish-mxwlt1w0g-ms-projects-2554a4d0.vercel.app"
       ]
     }
   }
   ```

### 7. Діагностика

#### Перевірте логи в Supabase
1. Перейдіть до **Logs** → **Auth**
2. Знайдіть записи про magic link
3. Перевірте, чи правильно відправляється redirect URL

#### Перевірте логи додатку
Додайте логи для діагностики:
```typescript
console.log('Magic link redirect URL:', 'https://storylish-mxwlt1w0g-ms-projects-2554a4d0.vercel.app/auth-callback.html');
console.log('Supabase auth state:', authState);
```

### 8. Фінальна перевірка

Після налаштування:
1. Magic link має відкривати веб-сторінку з повідомленням "Redirecting to Stories.ai"
2. Веб-сторінка має автоматично перенаправляти на додаток
3. Додаток має відкритися і обробити callback
4. Користувач має автоматично авторизуватися
5. Має відобразитися WelcomeScreen з планом підписки

### 9. Troubleshooting

#### Проблема: Веб-сторінка не перенаправляє на додаток
**Рішення:**
- Перевірте, чи додаток встановлений
- Перевірте, чи правильно налаштований URL scheme
- Спробуйте натиснути кнопку "Open in App" вручну

#### Проблема: Додаток відкривається, але не авторизується
**Рішення:**
- Перевірте логи в callback.tsx
- Перевірте налаштування в Supabase Dashboard
- Перевірте, чи правильно працює AuthGuard

#### Проблема: WelcomeScreen не відображається
**Рішення:**
- Перевірте, чи існує запис в таблиці profiles
- Перевірте права доступу до таблиці
- Перевірте логи в WelcomeScreen.tsx 