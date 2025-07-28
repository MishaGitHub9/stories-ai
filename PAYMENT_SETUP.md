# 🛒 Налаштування In-App Purchases

## 📋 Необхідні кроки для налаштування оплати

### 1. **App Store Connect Налаштування**

#### 1.1 Створення продукту в App Store Connect:
1. Увійдіть в [App Store Connect](https://appstoreconnect.apple.com)
2. Виберіть ваш додаток
3. Перейдіть в розділ **"Features"** → **"In-App Purchases"**
4. Натисніть **"+"** для створення нового продукту

#### 1.2 Налаштування підписки:
```
Product ID: com.mihadev.story.ai.premium.monthly
Type: Auto-Renewable Subscription
Reference Name: Monthly Premium
Subscription Group: Premium Subscriptions
```

#### 1.3 Налаштування цін:
- **Base Price**: $9.99 USD
- **Subscription Duration**: 1 Month
- **Free Trial**: 3 Days (опціонально)

#### 1.4 Локалізація:
- **Display Name**: "Monthly Premium"
- **Description**: "Unlimited stories and messages with translation features"

### 2. **Код додатку**

#### 2.1 Продукт ID вже налаштований:
```typescript
// config/inAppPurchases.ts
export const PRODUCT_IDS = {
  PREMIUM_MONTHLY: 'com.mihadev.story.ai.premium.monthly',
} as const;
```

#### 2.2 Функціональність вже реалізована:
- ✅ Ініціалізація покупок
- ✅ Покупка підписки
- ✅ Відновлення покупок
- ✅ Оновлення статусу в базі даних
- ✅ Обробка помилок

### 3. **Тестування**

#### 3.1 Sandbox тестування:
1. Створіть тестового користувача в App Store Connect
2. Використовуйте EAS Build для створення тестового додатку
3. Увійдіть з тестовим акаунтом на пристрої

#### 3.2 Тестові сценарії:
- Покупка підписки
- Відновлення покупок
- Скасування підписки
- Перевірка лімітів

### 4. **Безпека**

#### 4.1 Валідація на сервері (рекомендовано):
```typescript
// Приклад валідації receipt на сервері
const validateReceipt = async (receiptData: string) => {
  const response = await fetch('https://buy.itunes.apple.com/verifyReceipt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      'receipt-data': receiptData,
      'password': 'your-app-shared-secret'
    })
  });
  
  return response.json();
};
```

#### 4.2 App Shared Secret:
1. В App Store Connect перейдіть в **"App Information"**
2. Знайдіть **"App-Specific Shared Secret"**
3. Використовуйте для валідації на сервері

### 5. **Моніторинг**

#### 5.1 App Store Connect Analytics:
- Переглядайте продажі в **"Sales and Trends"**
- Аналізуйте конверсію в **"Subscriptions"**
- Відстежуйте скасування

#### 5.2 Логи в додатку:
```typescript
// Всі покупки логуються в консоль
console.log('Purchase initiated for:', productId);
console.log('Purchase completed:', purchaseData);
```

### 6. **Публікація**

#### 6.1 Перед публікацією:
- ✅ Протестуйте всі сценарії покупок
- ✅ Перевірте валідацію receipt
- ✅ Налаштуйте App Review Information
- ✅ Підготуйте скріншоти для App Review

#### 6.2 App Review:
- Додаток повинен відповідати [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- Особливо розділ про In-App Purchases

### 7. **Підтримка**

#### 7.1 Користувацька підтримка:
- Налаштуйте систему для обробки запитів про покупки
- Підготуйте FAQ про підписки
- Налаштуйте автоматичні відповіді

#### 7.2 Технічна підтримка:
- Моніторинг помилок покупок
- Логи для діагностики
- План дій при збоях

## 🚀 Готово до запуску!

Система оплати повністю налаштована і готова до використання. Всі необхідні компоненти реалізовані:

- ✅ Конфігурація продуктів
- ✅ UI для покупок
- ✅ Обробка транзакцій
- ✅ Відновлення покупок
- ✅ Інтеграція з базою даних
- ✅ Обробка помилок

Залишилося тільки налаштувати продукти в App Store Connect та протестувати в реальному додатку! 