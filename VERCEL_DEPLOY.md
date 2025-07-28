# Деплой на Vercel - Покрокова інструкція

## 1. Встановити Vercel CLI

```bash
npm install -g vercel
```

## 2. Увійти в Vercel

```bash
vercel login
```

## 3. Деплой проекту

```bash
vercel --prod
```

## 4. Отримати URL

Після деплою ви отримаєте URL типу:
```
https://stories-ai-abc123.vercel.app
```

## 5. Налаштувати Supabase

1. Перейдіть до [Supabase Dashboard](https://supabase.com/dashboard)
2. Виберіть ваш проект
3. Перейдіть до **Authentication** → **URL Configuration**
4. Встановіть:
   - **Site URL**: `https://your-vercel-url.vercel.app`
   - **Redirect URLs**:
     ```
     stories.ai://auth/reset-password
     https://your-vercel-url.vercel.app/auth/reset-password
     ```

## 6. Оновити Email шаблон

В Supabase Dashboard → **Authentication** → **Email Templates** → **Reset Password**:

```html
<h2>Reset Password</h2>

<p>Follow this link to reset the password for your user:</p>
<p>
  <a href="{{ .ConfirmationURL }}">
     Скинути пароль
   </a>
</p>
```

## 7. Протестувати

1. Відправте запит на відновлення паролю
2. Перевірте, що посилання з пошти відкривається в додатку

## 8. Оновити app.json (опціонально)

Якщо хочете використовувати Vercel URL замість stories.ai:

```json
{
  "expo": {
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "your-vercel-url.vercel.app"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

## Готово! 🎉

Тепер ваш додаток буде правильно обробляти посилання для відновлення паролю. 