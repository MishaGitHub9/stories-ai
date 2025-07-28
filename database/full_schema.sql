-- Повний скрипт для створення всіх таблиць з нуля
-- Використовуйте цей скрипт, якщо у вас ще немає таблиці profiles

-- 1. Видаляємо старі тригери та функції (якщо вони існують)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Видаляємо старі таблиці (якщо вони існують)
DROP TABLE IF EXISTS story_messages CASCADE;
DROP TABLE IF EXISTS stories CASCADE;
DROP TABLE IF EXISTS user_limits CASCADE;
DROP TABLE IF EXISTS anonymous_users CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. Створюємо таблицю профілів користувачів
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'free', -- 'free', 'premium', 'trial'
  subscription_plan TEXT, -- 'monthly', 'yearly', 'lifetime'
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  subscription_provider TEXT, -- 'stripe', 'apple', 'google'
  subscription_id TEXT, -- ID підписки в платіжній системі
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Створюємо таблицю для анонімних користувачів (без реєстрації)
CREATE TABLE anonymous_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT UNIQUE NOT NULL,
  stories_generated_today INTEGER DEFAULT 0,
  messages_sent_today INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Створюємо таблицю для відстеження лімітів зареєстрованих користувачів
CREATE TABLE user_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stories_generated_today INTEGER DEFAULT 0,
  messages_sent_today INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 6. Створюємо таблицю для історій
CREATE TABLE stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_user_id UUID REFERENCES anonymous_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  story_type TEXT DEFAULT 'ai_generated', -- 'ai_generated', 'ready'
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Створюємо таблицю для повідомлень в історіях
CREATE TABLE story_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_user_id UUID REFERENCES anonymous_users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'user', -- 'user', 'ai', 'system'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Створюємо таблицю для підписок
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL, -- 'monthly', 'yearly'
  status TEXT NOT NULL, -- 'active', 'cancelled', 'expired'
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  trial_start_date TIMESTAMP WITH TIME ZONE,
  trial_end_date TIMESTAMP WITH TIME ZONE,
  provider TEXT NOT NULL, -- 'apple', 'google', 'stripe'
  provider_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Увімкнення Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 10. Політики безпеки для profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 11. Політики безпеки для user_limits
CREATE POLICY "Users can view own limits" ON user_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own limits" ON user_limits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own limits" ON user_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 12. Політики безпеки для stories
CREATE POLICY "Users can view own stories" ON stories
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own stories" ON stories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stories" ON stories
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own stories" ON stories
  FOR DELETE USING (auth.uid() = user_id);

-- 13. Політики безпеки для story_messages
CREATE POLICY "Users can view story messages" ON story_messages
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert story messages" ON story_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 14. Політики безпеки для subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 15. Функція для автоматичного створення профілю при реєстрації
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Створюємо запис лімітів для нового користувача
  INSERT INTO public.user_limits (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 16. Тригер для автоматичного створення профілю
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 17. Функція для оновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 18. Тригери для автоматичного оновлення updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_limits_updated_at
  BEFORE UPDATE ON user_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 19. Функція для скидання денних лімітів
CREATE OR REPLACE FUNCTION reset_daily_limits()
RETURNS void AS $$
BEGIN
  -- Скидаємо ліміти для зареєстрованих користувачів
  UPDATE user_limits 
  SET 
    stories_generated_today = 0,
    messages_sent_today = 0,
    last_reset_date = CURRENT_DATE
  WHERE last_reset_date < CURRENT_DATE;
  
  -- Скидаємо ліміти для анонімних користувачів
  UPDATE anonymous_users 
  SET 
    stories_generated_today = 0,
    messages_sent_today = 0,
    last_reset_date = CURRENT_DATE
  WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 20. Індекси для швидкого пошуку
CREATE INDEX idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX idx_profiles_subscription_end_date ON profiles(subscription_end_date);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);
CREATE INDEX idx_anonymous_users_device_id ON anonymous_users(device_id);
CREATE INDEX idx_user_limits_user_id ON user_limits(user_id);
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_anonymous_user_id ON stories(anonymous_user_id);
CREATE INDEX idx_story_messages_story_id ON story_messages(story_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- 21. Створюємо записи лімітів для існуючих користувачів (якщо вони є)
INSERT INTO user_limits (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_limits)
ON CONFLICT (user_id) DO NOTHING;

-- 22. Створюємо записи профілів для існуючих користувачів (якщо вони є)
INSERT INTO profiles (id, email, full_name)
SELECT id, email, raw_user_meta_data->>'full_name' as full_name
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING; 