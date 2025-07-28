# Anonymous User Service

## Опис

Сервіс для роботи з анонімними користувачами в додатку Storylish. Забезпечує стабільне збереження та відстеження лімітів для користувачів без реєстрації.

## Основні функції

### `getOrCreateAnonymousUser()`

**Опис:** Отримує або створює анонімного користувача для поточного пристрою. **Захищено від race conditions.**

**Логіка роботи:**
1. **Кеш** - якщо є кешований користувач, повертає його
2. **Черга** - якщо вже виконується запит, додає до черги
3. **Запит** - отримує або генерує `device_id` з SecureStore
4. **Пошук** - перевіряє чи існує користувач з цим `device_id` в базі
5. **Створення** - якщо не існує, створює нового
6. **Кешування** - зберігає результат в кеші
7. **Повернення** - повертає результат всім очікуючим

**Повертає:** `Promise<AnonymousUser>`

**Захист від race conditions:**
- Кешування результату першого успішного запиту
- Чергування паралельних запитів
- Безпечне повернення того ж екземпляра користувача

**Приклад використання:**
```typescript
import { getOrCreateAnonymousUser } from '../services/anonymousUser';

const anonymousUser = await getOrCreateAnonymousUser();
console.log('User ID:', anonymousUser.id);
console.log('Device ID:', anonymousUser.device_id);
```

### `getAnonymousUserByDeviceId(deviceId)`

**Опис:** Отримує анонімного користувача за `device_id`.

**Параметри:**
- `deviceId: string` - унікальний ідентифікатор пристрою

**Повертає:** `Promise<AnonymousUser | null>`

### `updateAnonymousUser(userId, updates)`

**Опис:** Оновлює дані анонімного користувача.

**Параметри:**
- `userId: string` - ID анонімного користувача
- `updates: Partial<AnonymousUser>` - об'єкт з полями для оновлення

**Повертає:** `Promise<AnonymousUser>`

### `deleteAnonymousUser(userId)`

**Опис:** Видаляє анонімного користувача.

**Параметри:**
- `userId: string` - ID анонімного користувача

**Повертає:** `Promise<void>`

### `clearAnonymousUserCache()`

**Опис:** Очищає кеш анонімного користувача.

**Повертає:** `void`

**Використання:** Корисно при виході з додатку або зміні пристрою

### `forceResetAnonymousUserLimits(userId)`

**Опис:** Примусово скидає ліміти анонімного користувача (тільки для тестування).

**Параметри:**
- `userId: string` - ID анонімного користувача

**Повертає:** `Promise<AnonymousUser>`

**Використання:** Тільки для тестування, не використовувати в продакшені

## Структура даних

### `AnonymousUser`

```typescript
interface AnonymousUser {
  id: string;                    // UUID користувача
  device_id: string;             // Унікальний ID пристрою
  stories_generated_today: number; // Кількість згенерованих історій сьогодні
  messages_sent_today: number;   // Кількість відправлених повідомлень сьогодні
  last_reset_date: string;       // Дата останнього скидання лімітів
  created_at: string;            // Дата створення
  updated_at: string;            // Дата останнього оновлення
}
```

## Генерація Device ID

### Логіка генерації:

1. **SecureStore** - спочатку спробуємо отримати збережений `device_id`
2. **Crypto (SHA256)** - якщо немає, генеруємо новий через `digestStringAsync`
3. **Формат:** `anon_` + перші 16 символів хешу
4. **Fallback** - при помилках використовуємо тимчасовий ID

### Приклад device_id:
```
anon_a1b2c3d4e5f6g7h8
```

## Інтеграція з useLimits

### Оновлена логіка:

1. **Завантаження лімітів:**
   ```typescript
   const anonymousUser = await getOrCreateAnonymousUser();
   initStateRef.current.anonymousUser = anonymousUser;
   ```

2. **Оновлення лімітів:**
   ```typescript
   const updatedUser = await updateAnonymousUser(userId, {
     stories_generated_today: newCount,
     messages_sent_today: messagesSent,
     last_reset_date: currentDate,
   });
   ```

## Переваги нового підходу

### ✅ **Стабільність:**
- Device ID зберігається в SecureStore
- Не змінюється при перезавантаженні додатку
- Гарантує один запис на пристрій

### ✅ **Надійність:**
- Використання `upsert` для створення/оновлення
- Обробка помилок на всіх рівнях
- Fallback логіка при збоях

### ✅ **Продуктивність:**
- Кешування користувача в `useRef`
- Мінімальна кількість запитів до бази
- Оптимізовані операції

### ✅ **Безпека:**
- Криптографічно безпечна генерація ID
- Безпечне збереження в iOS Keychain
- Унікальні ідентифікатори

### ✅ **Race Condition Protection:**
- Кешування результату першого запиту
- Чергування паралельних запитів
- Безпечне повернення того ж екземпляра
- Обробка помилок для всіх очікуючих

### ✅ **Stable Limits Management:**
- Ліміти скидаються тільки при зміні дати
- Збереження лімітів між перезавантаженнями додатку
- Автоматичне оновлення кешу при зміні даних
- Примусове скидання тільки для тестування

## Логи для відстеження

### Успішні операції:
- `"Returning cached anonymous user:"` - повернення з кешу
- `"Anonymous user fetch in progress, adding to waiters queue"` - додавання до черги
- `"Starting new anonymous user fetch/creation"` - початок нового запиту
- `"Using device ID:"` - використання існуючого ID
- `"Generated new device ID (Crypto):"` - створення нового ID
- `"Found existing anonymous user:"` - знайдено існуючого користувача
- `"Using existing limits (same day)"` - використання існуючих лімітів
- `"Resetting daily limits for existing user (new day)"` - скидання лімітів для нового дня
- `"Successfully reset limits for anonymous user"` - успішне скидання лімітів
- `"Created new anonymous user:"` - створено нового користувача
- `"Anonymous user cache cleared"` - очищення кешу
- `"Force reset anonymous user limits:"` - примусове скидання лімітів

### Помилки:
- `"Error getting device ID from SecureStore:"` - помилка SecureStore
- `"Error creating anonymous user:"` - помилка створення користувача
- `"Error updating anonymous user:"` - помилка оновлення
- `"Error resetting anonymous user limits:"` - помилка скидання лімітів
- `"Error force resetting anonymous user limits:"` - помилка примусового скидання
- `"Error resolving waiter:"` - помилка повернення результату очікуючим
- `"Error rejecting waiter:"` - помилка повернення помилки очікуючим

## Міграція зі старої системи

### Що змінено:
1. **Видалено** `getStableDeviceId()` з `useLimits.ts`
2. **Додано** `getOrCreateAnonymousUser()` сервіс з захистом від race conditions
3. **Оновлено** логіку завантаження та оновлення лімітів
4. **Покращено** обробку помилок та fallback логіку
5. **Додано** кешування та чергування запитів
6. **Додано** `clearAnonymousUserCache()` для очищення кешу

### Зворотна сумісність:
- Старі записи в `anonymous_users` залишаються працювати
- Нова система автоматично використовує існуючі `device_id`
- Плавна міграція без втрати даних 