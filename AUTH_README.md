# Система авторизації для Stories.ai

Цей додаток використовує Supabase для авторизації користувачів через email та Google OAuth.

## Функціональність

### ✅ Реалізовано
- [x] Авторизація через email/пароль
- [x] Реєстрація нових користувачів
- [x] Авторизація через Google OAuth
- [x] Відновлення пароля
- [x] Автоматичне перенаправлення на основі стану авторизації
- [x] Захист маршрутів (AuthGuard)
- [x] Вихід з облікового запису
- [x] Збереження сесії між запусками додатку

### 🔄 В процесі
- [ ] Підтвердження email
- [ ] Оновлення профілю користувача
- [ ] Додаткові OAuth провайдери (Facebook, Apple)

## Структура файлів

```
├── config/
│   └── supabase.ts          # Конфігурація Supabase клієнта
├── contexts/
│   └── AuthContext.tsx      # React Context для авторизації
├── hooks/
│   └── useAuth.ts           # Хук для роботи з авторизацією
├── components/auth/
│   ├── AuthScreen.tsx       # Екран входу/реєстрації
│   ├── ForgotPasswordScreen.tsx # Екран відновлення пароля
│   └── AuthGuard.tsx        # Компонент захисту маршрутів
├── types/
│   └── auth.ts              # TypeScript типи
└── app/
    ├── auth.tsx             # Головний екран авторизації
    └── _layout.tsx          # Layout з AuthProvider
```

## Використання

### 1. Отримання стану авторизації

```typescript
import { useAuthContext } from '../contexts/AuthContext';

function MyComponent() {
  const { user, session, loading } = useAuthContext();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <LoginScreen />;
  }
  
  return <MainApp />;
}
```

### 2. Авторизація через email

```typescript
import { useAuthContext } from '../contexts/AuthContext';

function LoginForm() {
  const { signInWithEmail, signUpWithEmail } = useAuthContext();
  
  const handleLogin = async (email: string, password: string) => {
    const { error } = await signInWithEmail(email, password);
    if (error) {
      console.error('Помилка входу:', error.message);
    }
  };
  
  const handleSignUp = async (email: string, password: string) => {
    const { error } = await signUpWithEmail(email, password);
    if (error) {
      console.error('Помилка реєстрації:', error.message);
    }
  };
}
```

### 3. Авторизація через Google

```typescript
import { useAuthContext } from '../contexts/AuthContext';

function GoogleLoginButton() {
  const { signInWithGoogle } = useAuthContext();
  
  const handleGoogleLogin = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      console.error('Помилка Google авторизації:', error.message);
    }
  };
  
  return (
    <Button onPress={handleGoogleLogin}>
      Увійти через Google
    </Button>
  );
}
```

### 4. Вихід з облікового запису

```typescript
import { useAuthContext } from '../contexts/AuthContext';

function LogoutButton() {
  const { signOut } = useAuthContext();
  
  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Помилка виходу:', error.message);
    }
  };
  
  return (
    <Button onPress={handleLogout}>
      Вийти
    </Button>
  );
}
```

### 5. Захист маршрутів

```typescript
import { AuthGuard } from '../components/auth/AuthGuard';

function ProtectedScreen() {
  return (
    <AuthGuard requireAuth={true}>
      <SecretContent />
    </AuthGuard>
  );
}

function PublicScreen() {
  return (
    <AuthGuard requireAuth={false}>
      <PublicContent />
    </AuthGuard>
  );
}
```

## Налаштування

### 1. Supabase конфігурація

Відредагуйте `config/supabase.ts`:

```typescript
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key-here';
```

### 2. URL схеми

Переконайтеся, що в `app.json` налаштована схема:

```json
{
  "expo": {
    "scheme": "stories.ai"
  }
}
```

### 3. Google OAuth

Для Google авторизації потрібно:
1. Створити OAuth 2.0 Client ID в Google Cloud Console
2. Налаштувати redirect URI: `https://your-project.supabase.co/auth/v1/callback`
3. Додати Client ID та Secret в Supabase Dashboard

## Безпека

- Всі ключі API зберігаються в безпечному місці
- Використовується Row Level Security (RLS) для захисту даних
- Сесії автоматично оновлюються
- Підтримується вихід з усіх пристроїв

## Обробка помилок

Система автоматично обробляє помилки авторизації:

```typescript
const { error } = await signInWithEmail(email, password);
if (error) {
  // Показати повідомлення користувачу
  Alert.alert('Помилка', error.message);
}
```

## Тестування

1. Запустіть додаток: `npm start`
2. Спробуйте зареєструватися з новим email
3. Спробуйте увійти з існуючим акаунтом
4. Перевірте Google OAuth
5. Тестуйте відновлення пароля
6. Перевірте вихід з облікового запису

## Підтримка

Для отримання допомоги:
1. Перевірте логи в Supabase Dashboard
2. Перегляньте документацію Supabase
3. Перевірте налаштування OAuth провайдерів 