# Налаштування відновлення паролю в Supabase (GitHub Pages)

## Покрокові інструкції для налаштування в панелі Supabase

### 1. Налаштування URL Redirect

1. Відкрийте ваш проект в [Supabase Dashboard](https://supabase.com/dashboard)
2. Перейдіть до **Authentication** → **URL Configuration**
3. У полі **Site URL** введіть:
   ```
   https://mishagithub9.github.io/stories-ai
   ```

4. У полі **Redirect URLs** додайте наступні URL (кожен з нового рядка):
   ```
   https://mishagithub9.github.io/stories-ai
   https://mishagithub9.github.io/stories-ai/
   stories.ai://
   stories.ai://auth/reset-password
   ```

### 2. Налаштування Email Templates

1. Перейдіть до **Authentication** → **Email Templates**
2. Виберіть **Reset Password**
3. Замініть вміст на:

```html
<h2>Відновлення пароля</h2>

<p>Привіт!</p>

<p>Ви отримали цей лист, оскільки хтось запросив відновлення пароля для вашого акаунту в Stories.ai.</p>

<p>Щоб скинути пароль, натисніть на посилання нижче:</p>

<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next={{ .RedirectTo }}">Відновити пароль</a></p>

<p>Якщо ви не запрошували відновлення пароля, просто проігноруйте цей лист.</p>

<p>Посилання дійсне протягом 1 години.</p>

<p>З повагою,<br>Команда Stories.ai</p>
```

### 3. Важливо про схему з крапкою

У вашому випадку схема `stories.ai` містить крапку, тому в Supabase потрібно:

1. Перейти до **Authentication** → **URL Configuration**
2. У **Additional Redirect URLs** обов'язково додати:
   - `stories.ai://`
   - `stories.ai://auth/reset-password`

### 4. Налаштування PKCE Flow

1. Перейдіть до **Authentication** → **Settings**
2. Знайдіть секцію **Auth Flow**
3. Увімкніть **Enable PKCE flow**
4. Збережіть зміни

### 5. Перевірка налаштувань

Переконайтеся, що у вас є наступні налаштування:

- ✅ Site URL: `https://mishagithub9.github.io/stories-ai`
- ✅ Redirect URLs включають веб та мобільні схеми
- ✅ PKCE flow увімкнений
- ✅ Email template для reset password налаштований

## Налаштування GitHub Pages

### 1. Увімкніть GitHub Pages
1. Перейдіть до вашого репозиторію на GitHub
2. Натисніть **Settings** → **Pages**
3. У розділі **Source** виберіть **GitHub Actions**
4. Збережіть налаштування

### 2. Запустіть деплой
1. Закомітьте та запушьте зміни до репозиторію
2. GitHub Actions автоматично задеплоїть сторінку
3. Ваша сторінка буде доступна за адресою: `https://mishagithub9.github.io/stories-ai`

## Переваги GitHub Pages

✅ **Безкоштовно** - без обмежень на трафік  
✅ **Надійно** - інфраструктура GitHub  
✅ **SSL** - автоматичні HTTPS сертифікати  
✅ **CDN** - швидкий доступ по всьому світу  
✅ **Автоматичний деплой** - через GitHub Actions  

## Тестування

1. Запустіть додаток і спробуйте відновити пароль
2. Перевірте, що email приходить з правильним посиланням
3. Переконайтеся, що веб-сторінка відкривається за адресою GitHub Pages
4. Після зміни пароля має спрацювати deep link назад в додаток

## Виправлення помилок

### Якщо не приходить email:
- Перевірте Spam/Junk папку
- Переконайтеся, що email template збережений
- Перевірте Rate Limiting в Authentication → Settings

### Якщо посилання не працює:
- Перевірте правильність redirect URLs в Supabase
- Переконайтеся, що GitHub Pages активно
- Перевірте, що PKCE flow увімкнений

### Якщо GitHub Pages не працює:
- Перевірте, що GitHub Actions workflow запустився успішно
- Переконайтеся, що Pages налаштовано на GitHub Actions (не на branch)
- Перевірте логи в Actions для виявлення помилок

### Якщо не відкривається додаток:
- Переконайтеся, що схема `stories.ai` правильно налаштована в app.json
- Перевірте iOS scheme в Info.plist
- На Android перевірте intent filters 