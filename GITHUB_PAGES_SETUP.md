# Налаштування GitHub Pages для Stories.ai

## 1. Створення GitHub репозиторію

1. **Створіть новий репозиторій на GitHub:**
   - Назва: `stories-ai` або `storylish`
   - **ВАЖЛИВО:** Назва з крапкою "Stories.ai" може викликати проблеми в URL

2. **Додайте remote:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/stories-ai.git
git branch -M main
git push -u origin main
```

## 2. Активація GitHub Pages

1. Перейдіть до **Settings** → **Pages**
2. **Source:** Deploy from a branch
3. **Branch:** main
4. **Folder:** /docs
5. Натисніть **Save**

## 3. Отримання URL

Після активації ви отримаєте URL:
```
https://YOUR_USERNAME.github.io/stories-ai
```

## 4. Оновлення app.json

Замініть `username` на ваш GitHub username в файлі `app.json`:
```json
{
  "associatedDomains": [
    "applinks:YOUR_USERNAME.github.io"
  ],
  "intentFilters": [
    {
      "data": [
        {
          "scheme": "https",
          "host": "YOUR_USERNAME.github.io"
        }
      ]
    }
  ]
}
```

## 5. Налаштування Supabase

В Supabase Dashboard → Authentication → URL Configuration:

**Site URL:**
```
https://YOUR_USERNAME.github.io/stories-ai
```

**Redirect URLs:**
```
stories.ai://auth/reset-password
https://YOUR_USERNAME.github.io/stories-ai/auth/reset-password.html
```

## 6. Приклад для вашого репозиторію

Якщо ваш GitHub username - `mihadev`, то:

**Site URL:**
```
https://mihadev.github.io/stories-ai
```

**Redirect URLs:**
```
stories.ai://auth/reset-password
https://mihadev.github.io/stories-ai/auth/reset-password.html
```

## 7. Тестування

1. **Пуш коду:**
```bash
git add .
git commit -m "Setup GitHub Pages"
git push origin main
```

2. **Перевірте сайт:** Відкрийте ваш GitHub Pages URL

3. **Тестуйте deep link:** Додайте параметри для тестування:
```
https://YOUR_USERNAME.github.io/stories-ai/auth/reset-password.html?access_token=test&refresh_token=test&type=recovery
```

## 8. Що робити з назвою "Stories.ai"

Оскільки GitHub не підтримує крапки в URL, рекомендується:
- **Репозиторій:** `stories-ai` або `storylish`
- **URL:** `username.github.io/stories-ai`
- **Додаток:** залишається `Stories.ai`

Це не вплине на функціональність! 