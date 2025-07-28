# Діагностика проблем з TestFlight In-App Purchases

## Проблема: "No subscriptions found for IDs: com.mihadev.story.ai.premium.monthly"

### 1. Перевірка в App Store Connect

#### Продукт:
- [ ] Product ID: `com.mihadev.story.ai.premium.monthly`
- [ ] Тип: Auto-Renewable Subscription
- [ ] Статус: "Ready to Submit" або "Approved"
- [ ] Доданий до Subscription Group
- [ ] Bundle ID співпадає: `com.mihadev.story.ai`

#### Угоди:
- [ ] Підписана "Paid Applications Agreement"
- [ ] Підписана "Apple Developer Program License Agreement"

### 2. Перевірка Sandbox тестера

#### Створення тестера:
1. App Store Connect → Users and Access → Sandbox Testers
2. Натисніть "+" 
3. Заповніть:
   - Email (унікальний, не використовується в реальному App Store)
   - Password
   - First Name, Last Name
   - Date of Birth

#### Використання в TestFlight:
1. В TestFlight вийдіть з реального App Store акаунта
2. Увійдіть з Sandbox тестера
3. Переконайтеся, що використовується правильний акаунт

### 3. Перевірка коду

#### Bundle ID:
```typescript
// В app.json
"ios": {
  "bundleIdentifier": "com.mihadev.story.ai"
}

// В App Store Connect
// Product повинен бути в додатку з Bundle ID: com.mihadev.story.ai
```

#### Product ID:
```typescript
// В config/inAppPurchases.ts
export const PRODUCT_IDS = {
  PREMIUM_MONTHLY: 'com.mihadev.story.ai.premium.monthly',
} as const;
```

### 4. Діагностика в коді

Додано логування для діагностики:

```typescript
console.log('Bundle ID:', Constants.expoConfig?.ios?.bundleIdentifier);
console.log('App ownership:', Constants.appOwnership);
console.log('Product IDs:', productIds);
console.log('Fetched subscriptions:', subscriptions);
```

### 5. Кроки для виправлення

1. **Перевірте статус продукту в App Store Connect**
2. **Створіть Sandbox тестера**
3. **Перебудуйте додаток:**
   ```bash
   eas build --platform ios --profile preview
   ```
4. **Тестуйте з Sandbox тестером**

### 6. Альтернативні рішення

#### Якщо продукт не затверджений:
- Створіть тестовий продукт з іншим ID
- Використовуйте Consumable замість Subscription для тестування

#### Якщо проблема з Sandbox:
- Створіть новий Sandbox тестера
- Перевірте, що вийшли з реального акаунта

### 7. Логи для перевірки

В Xcode Console або Expo DevTools шукайте:
- "Initializing react-native-iap..."
- "Connection result:"
- "Fetching subscriptions..."
- "Product IDs:"
- "Fetched subscriptions:"
- "All available products:"

### 8. Часті помилки

1. **"No subscriptions found"** - продукт не створений або не активний
2. **"Invalid product ID"** - неправильний Product ID
3. **"User not authorized"** - не використовується Sandbox тестера
4. **"Network error"** - проблема з інтернетом або App Store 