-- Скрипт для виправлення дублікатів в таблиці anonymous_users
-- Виконайте цей скрипт, якщо у вас є дублікати device_id

-- 1. Знаходимо дублікати
SELECT device_id, COUNT(*) as count
FROM anonymous_users
GROUP BY device_id
HAVING COUNT(*) > 1;

-- 2. Видаляємо дублікати, залишаючи тільки найновіший запис
DELETE FROM anonymous_users
WHERE id NOT IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY device_id ORDER BY created_at DESC) as rn
    FROM anonymous_users
  ) ranked
  WHERE rn = 1
);

-- 3. Перевіряємо, що дублікати видалені
SELECT device_id, COUNT(*) as count
FROM anonymous_users
GROUP BY device_id
HAVING COUNT(*) > 1;

-- 4. Додаємо унікальний індекс (якщо його немає)
CREATE UNIQUE INDEX IF NOT EXISTS idx_anonymous_users_device_id_unique 
ON anonymous_users(device_id);

-- 5. Перевіряємо загальну кількість записів
SELECT COUNT(*) as total_anonymous_users FROM anonymous_users; 