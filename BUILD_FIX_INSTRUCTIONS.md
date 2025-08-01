# Виправлення проблем збірки

## Проблема
Помилка збірки: `Unable to resolve module ../config/api from /Users/expo/workingdir/build/services/translation.ts`

## Рішення

### 1. Виправлено імпорти
- Оновлено `config/index.ts` для явного експорту всіх необхідних функцій
- Виправлено імпорти в сервісах для використання `../config` замість `../config/api`

### 2. Оновлений config/index.ts
```typescript
// API exports
export { anthropic, openai, CLAUDE_CONFIG, GPT_CONFIG, MODEL_CONFIG, detectLanguage } from './api';

// In-App Purchases exports
export { initializeInAppPurchases, purchaseProduct, restorePurchases, getAvailableProducts } from './inAppPurchases';

// Supabase exports
export { supabase } from './supabase';
```

### 3. Виправлені сервіси
- `services/translation.ts` - імпорт з `../config`
- `services/claude.ts` - імпорт з `../config`
- `services/conversationSummary.ts` - імпорт з `../config`

## Перевірка

### Локальне тестування
```bash
npm start
# або
yarn start
```

### EAS Build
```bash
eas build --platform ios
```

## Можливі проблеми

### 1. Metro bundler не може знайти модулі
**Рішення:**
- Перезапустіть Metro bundler
- Очистіть кеш: `npx expo start --clear`

### 2. TypeScript помилки
**Рішення:**
- Перевірте, чи всі експорти правильно типізовані
- Запустіть `npx tsc --noEmit` для перевірки типів

### 3. EAS Build помилки
**Рішення:**
- Перевірте, чи всі залежності встановлені
- Запустіть `npm install` перед збіркою

## Наступні кроки

1. Протестуйте локальну збірку
2. Запустіть EAS Build
3. Перевірте, чи всі функції працюють правильно
4. Протестуйте magic link авторизацію 