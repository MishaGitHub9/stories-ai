# Налаштування Deep Links в Supabase для Password Reset

## Крок 1: Налаштування в Supabase Dashboard

### 1.1 Вхід в Supabase
1. **Перейдіть до [Supabase Dashboard](https://supabase.com/dashboard)**
2. **Виберіть ваш проект**
3. **Перейдіть до "Authentication" → "URL Configuration"**

### 1.2 Налаштування URL для Password Reset

#### Site URL:
```
https://stories.ai
```

#### Redirect URLs:
```
https://stories.ai/auth/reset-password
stories.ai://auth/reset-password
```

### 1.3 Налаштування Email Templates

#### Password Reset Email Template:
1. **Перейдіть до "Authentication" → "Email Templates"**
2. **Виберіть "Password Reset"**
3. **Оновіть посилання в шаблоні:**

```html
<!-- Замініть стандартне посилання на: -->
<a href="{{ .SiteURL }}/auth/reset-password?access_token={{ .TokenHash }}&refresh_token={{ .TokenHash }}&type=recovery">
  Скинути пароль
</a>
```

## Крок 2: Налаштування в App Store Connect

### 2.1 Associated Domains
1. **Перейдіть до App Store Connect**
2. **Виберіть ваш додаток**
3. **Перейдіть до "App Information"**
4. **Додайте Associated Domain:**
   ```
   applinks:stories.ai
   ```

### 2.2 Universal Links
Переконайтеся, що в `app.json` налаштовано:
```json
{
  "ios": {
    "associatedDomains": [
      "applinks:stories.ai"
    ]
  }
}
```

## Крок 3: Тестування

### 3.1 В Supabase Dashboard
1. **Перейдіть до "Authentication" → "Users"**
2. **Знайдіть тестового користувача**
3. **Натисніть "Send password reset email"**
4. **Перевірте, що email надіслано з правильним посиланням**

### 3.2 В додатку
1. **Запустіть додаток на реальному пристрої**
2. **Натисніть посилання в email**
3. **Перевірте, що додаток відкривається і перенаправляє на екран скидання пароля**

## Крок 4: Troubleshooting

### 4.1 Якщо посилання не працює:
1. **Перевірте Associated Domains в App Store Connect**
2. **Перевірте URL в Supabase Dashboard**
3. **Перевірте, що додаток встановлений на пристрої**
4. **Перевірте логи в консолі додатку**

### 4.2 Якщо додаток не відкривається:
1. **Перевірте scheme в app.json**
2. **Перевірте, що deep linking налаштовано правильно**
3. **Перевірте, що екрани створені і правильно налаштовані**

## Важливі примітки

### Безпека:
- ✅ Всі токени передаються через HTTPS
- ✅ Токени мають обмежений час дії
- ✅ Використовується secure storage для зберігання

### Підтримка:
- ✅ Працює на iOS та Android
- ✅ Підтримує Universal Links (iOS) та App Links (Android)
- ✅ Fallback на веб-версію, якщо додаток не встановлений

## Полезні посилання

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Universal Links Guide](https://developer.apple.com/ios/universal-links/)
- [App Links Guide](https://developer.android.com/training/app-links) 