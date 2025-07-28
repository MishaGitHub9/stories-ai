# Налаштування TestFlight для In-App Purchases

## Проблема
В TestFlight з'являється помилка "Покупки не ініціалізовані" при спробі доступу до преміум функцій.

## Рішення

### 1. Оновлення пакетів ✅ ВИКОНАНО

1. **Встановлено react-native-iap:**
   ```bash
   npm install react-native-iap
   ```

2. **Видалено старі пакети:**
   ```bash
   npm uninstall expo-in-app-purchases expo-store-kit
   ```

3. **Оновлено app.json:**
   ```json
   {
     "expo": {
       "plugins": [
         [
           "react-native-iap",
           {
             "disableStoreKit2": true
           }
         ]
       ]
     }
   }
   ```

### 2. Налаштування в App Store Connect

1. **Створіть продукт в App Store Connect:**
   - Зайдіть в App Store Connect
   - Виберіть ваш додаток
   - Перейдіть в "Features" → "In-App Purchases"
   - Створіть новий Auto-Renewable Subscription
   - Product ID: `com.mihadev.story.ai.premium.monthly`

2. **Налаштуйте тестові акаунти:**
   - В App Store Connect перейдіть в "Users and Access"
   - Створіть Sandbox тестовий акаунт
   - Використовуйте цей акаунт для тестування в TestFlight

### 3. Оновлення коду ✅ ВИКОНАНО

Код оновлений для використання react-native-iap:

- Замінено expo-in-app-purchases на react-native-iap
- Додано обробник покупок та помилок
- Покращено повідомлення про помилки
- Додано очищення транзакцій для iOS

### 4. Тестування

1. **В TestFlight:**
   - Використовуйте Sandbox тестовий акаунт
   - Переконайтеся, що вийшли з реального App Store акаунта
   - Увійдіть в тестовий акаунт

2. **Перевірте логи:**
   - В Xcode Console або через Expo DevTools
   - Шукайте повідомлення про ініціалізацію react-native-iap

### 5. Перебудування додатку

Після оновлення конфігурації потрібно перебудувати додаток:

```bash
eas build --platform ios --profile development
```

### 6. Якщо проблема залишається

1. Перевірте, що продукт активний в App Store Connect
2. Переконайтеся, що використовуєте правильний Bundle ID
3. Перевірте, що додаток правильно підписаний
4. Спробуйте перебудувати додаток через EAS Build

## Важливо

- TestFlight використовує Sandbox середовище
- Потрібен окремий тестовий акаунт
- Реальні гроші не списуються
- Покупки не зберігаються між сесіями в Sandbox
- react-native-iap використовує StoreKit 1 (disableStoreKit2: true) 