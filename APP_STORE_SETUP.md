# Налаштування Apple In-App Purchases

## Крок 1: Створення продукту в App Store Connect

### 1.1 Вхід в App Store Connect
1. **Перейдіть до [App Store Connect](https://appstoreconnect.apple.com)**
2. **Увійдіть з вашим Apple Developer акаунтом**
3. **Виберіть ваш додаток "Stories.ai"**

### 1.2 Створення In-App Purchase
1. **Перейдіть до "Features" → "In-App Purchases"**
2. **Натисніть "+" для створення нового продукту**

### 1.3 Налаштування продукту

#### Premium Monthly Subscription
- **Product ID**: `com.mihadev.story.ai.premium.monthly`
- **Type**: Auto-Renewable Subscription
- **Reference Name**: Premium Monthly
- **Subscription Group**: Create new group "Premium"
- **Subscription Duration**: 1 Month
- **Price**: $9.99

## Крок 2: Налаштування локалізації

### 2.1 Додайте інформацію про продукт:
- **Display Name**: Premium Monthly
- **Description**: Опис функцій підписки

### 2.2 Приклад для Premium Monthly:
```
Display Name: Premium Monthly
Description: 
• Необмежена кількість історій
• Необмежена кількість повідомлень
• Можливість перекладу
• Без реклами
```

## Крок 3: Налаштування цін

### 3.1 Виберіть цінову категорію:
- **Premium Monthly**: Tier 10 ($9.99)

### 3.2 Налаштування для різних країн:
1. **Натисніть "Pricing"**
2. **Виберіть "Custom" або залиште автоматичні ціни**
3. **Перевірте ціни для основних країн**

## Крок 4: Налаштування підписки

### 4.1 Створення Subscription Group:
1. **Premium Group**: Для Premium підписки

### 4.2 Налаштування рівня підписки:
- **Premium**: Основний рівень з усіма функціями

### 4.3 Налаштування промо-кодів (опціонально):
1. **Створіть промо-коди для тестування**
2. **Налаштуйте знижки для нових користувачів**

## Крок 5: Тестування

### 5.1 Створення Sandbox тестерів:
1. **Перейдіть до "Users and Access"**
2. **Створіть Sandbox тестера**
3. **Використовуйте тестову пошту**

### 5.2 Тестування в додатку:
1. **Запустіть додаток на реальному пристрої (НЕ Expo Go)**
2. **Увійдіть з Sandbox акаунтом**
3. **Спробуйте купити підписку**
4. **Перевірте відновлення покупок**

## Крок 6: Відправка на перевірку

### 6.1 Підготовка до відправки:
1. **Переконайтеся, що продукт активний**
2. **Перевірте локалізацію**
3. **Протестуйте всі сценарії покупок**

### 6.2 Відправка:
1. **Створіть нову версію додатку**
2. **Додайте опис In-App Purchase**
3. **Відправте на перевірку**

## Важливі примітки

### Безпека:
- ✅ Всі покупки перевіряються на сервері
- ✅ Використовуйте receipt validation
- ✅ Зберігайте історію покупок

### Підтримка користувачів:
- ✅ Додайте FAQ про підписки
- ✅ Налаштуйте автоматичні відповіді
- ✅ Створіть систему повернення коштів

### Моніторинг:
- ✅ Відстежуйте конверсію
- ✅ Аналізуйте відміни підписок
- ✅ Оптимізуйте ціни

## Конфігурація в коді

### Product ID:
```typescript
export const PRODUCT_IDS = {
  PREMIUM_MONTHLY: 'com.mihadev.story.ai.premium.monthly',
} as const;
```

### Тип підписки:
```typescript
export const SUBSCRIPTION_TYPES = {
  [PRODUCT_IDS.PREMIUM_MONTHLY]: {
    status: 'premium' as const,
    plan: 'monthly' as const,
    duration: 30, // днів
  },
} as const;
```

## Полезні посилання

- [Apple In-App Purchase Guidelines](https://developer.apple.com/app-store/review/guidelines/#in-app-purchase)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Testing In-App Purchases](https://developer.apple.com/documentation/storekit/in-app_purchase/testing_in-app_purchases_with_sandbox) 