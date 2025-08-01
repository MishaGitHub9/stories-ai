# Налаштування Deep Links в Supabase

## Оновлена конфігурація

Тепер додаток використовує прямі deep links `stories.ai://auth/callback` замість Vercel URL.

## Налаштування в Supabase Dashboard

### 1. Authentication Settings

1. **Перейдіть до**: Authentication → Settings
2. **Встановіть Site URL**: `stories.ai://auth/callback`
3. **Додайте Redirect URLs**:
   ```
   stories.ai://auth/callback
   stories.ai://*
   ```

### 2. Email Templates

1. **Перейдіть до**: Authentication → Email Templates
2. **Виберіть**: Magic Link template
3. **Встановіть Redirect URL**: `stories.ai://auth/callback`

## Конфігурація додатку

### app.json
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

### useAuth.ts
```typescript
const sendMagicLink = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'stories.ai://auth/callback',
      },
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
```

### expo-router конфігурація
```typescript
export const linking = {
  prefixes: ['stories.ai://'],
  config: {
    screens: {
      '(tabs)': {
        screens: {
          index: '',
          settings: 'settings',
          stories: 'stories',
        },
      },
      auth: 'auth',
      'auth/callback': 'auth/callback',
      modal: 'modal',
    },
  },
};
```

## Як це працює

### 1. Magic Link Flow
1. **Користувач вводить email** → **Натискає "Send Magic Link"**
2. **Supabase відправляє email** з посиланням `stories.ai://auth/callback?access_token=...&refresh_token=...`
3. **Користувач натискає посилання** в email
4. **Додаток відкривається** і обробляє deep link
5. **Викликається `exchangeCodeForSession(access_token)`**
6. **Користувач авторизується** і бачить WelcomeScreen

### 2. Обробка Deep Links
- **useDeepLinks hook** слухає всі deep links
- **callback.tsx** обробляє параметри з URL
- **exchangeCodeForSession** виконує авторизацію
- **router.replace('/(tabs)')** перенаправляє на головний екран

## Тестування

### 1. Локальне тестування
```bash
# Відкрийте додаток в симуляторі
npx expo start

# Протестуйте deep link
npx uri-scheme open "stories.ai://auth/callback?access_token=test&refresh_token=test" --ios
```

### 2. Тестування magic link
1. Відправте magic link на тестовий email
2. Перевірте, чи відкривається додаток
3. Перевірте логи в консолі
4. Перевірте, чи відображається WelcomeScreen

## Логи для діагностики

Додайте ці логи для діагностики:

```typescript
// В useDeepLinks.ts
console.log('Deep link received:', url);
console.log('URL params:', { accessToken, refreshToken, type });

// В callback.tsx
console.log('Auth callback params:', params);
console.log('Exchange code for session result:', { data, error });

// В useAuth.ts
console.log('Sending magic link to:', email);
console.log('Magic link result:', { data, error });
```

## Можливі проблеми

### 1. Deep link не відкриває додаток
**Рішення:**
- Перевірте, чи додаток встановлений
- Перевірте конфігурацію в app.json
- Перевірте налаштування в Supabase

### 2. exchangeCodeForSession не працює
**Рішення:**
- Перевірте, чи access_token передається правильно
- Перевірте логи в консолі
- Перевірте налаштування в Supabase

### 3. Користувач не авторизується
**Рішення:**
- Перевірте, чи викликається useDeepLinks
- Перевірте, чи працює AuthGuard
- Перевірте логи в callback.tsx

## Переваги нового підходу

- ✅ **Прямі deep links** без залежності від Vercel
- ✅ **Автоматична авторизація** через exchangeCodeForSession
- ✅ **Кращий UX** - додаток відкривається одразу
- ✅ **Надійність** - працює навіть без інтернету після отримання токену
- ✅ **Безпека** - токени передаються через deep link 