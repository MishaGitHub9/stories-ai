# ✅ Supabase налаштування завершено!

## Ваші дані:
- **Project URL**: `https://lkidcfdazjdhtykxiafp.supabase.co`
- **Vercel URL**: `https://storylish-mxwlt1w0g-ms-projects-2554a4d0.vercel.app`

## Що потрібно зробити в Supabase Dashboard:

### 1. URL Configuration
1. Перейдіть до **Authentication** → **URL Configuration**
2. Встановіть:
   ```
   Site URL: https://storylish-mxwlt1w0g-ms-projects-2554a4d0.vercel.app
   Redirect URLs:
   - stories.ai://auth/reset-password
   - https://storylish-mxwlt1w0g-ms-projects-2554a4d0.vercel.app/auth/reset-password
   ```

### 2. Email Template
1. Перейдіть до **Authentication** → **Email Templates** → **Reset Password**
2. Замініть посилання на:
   ```html
   <a href="{{ .ConfirmationURL }}">
      Скинути пароль
   </a>
   ```

### 3. Auth Settings
1. Перейдіть до **Authentication** → **Settings**
2. Увімкніть:
   - ✅ **Enable email confirmations**
   - ✅ **Enable email change confirmations**

## Тестування:

### 1. Запустіть додаток:
```bash
npx expo start
```

### 2. Протестуйте:
1. Відкрийте додаток
2. Перейдіть до Settings → Sign Out
3. Натисніть "Forgot Password"
4. Введіть email
5. Перевірте email та клікніть на посилання
6. Перевірте, що відкривається додаток

### 3. Перевірте веб-сторінку:
Відкрийте: `https://storylish-mxwlt1w0g-ms-projects-2554a4d0.vercel.app/auth/reset-password`

## Готово! 🎉

Тепер у вас є повна система авторизації з:
- ✅ Новий Supabase проект
- ✅ Правильні ключі
- ✅ Vercel деплой
- ✅ Deep links
- ✅ Відновлення паролю

**Час налаштування: ~5 хвилин!** 