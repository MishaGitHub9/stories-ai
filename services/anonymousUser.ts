import { CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../config/supabase';

export interface AnonymousUser {
  id: string;
  device_id: string;
  stories_generated_today: number;
  messages_sent_today: number;
  last_reset_date: string;
  created_at: string;
  updated_at: string;
}

// Глобальний стан для кешування та чергування
interface AnonymousUserState {
  cachedAnonymousUser: AnonymousUser | null;
  isFetchingAnonymousUser: boolean;
  waiters: Array<{
    resolve: (user: AnonymousUser) => void;
    reject: (error: Error) => void;
  }>;
}

const anonymousUserState: AnonymousUserState = {
  cachedAnonymousUser: null,
  isFetchingAnonymousUser: false,
  waiters: [],
};

/**
 * Отримує або створює анонімного користувача для поточного пристрою
 * Захищено від race conditions через кешування та чергування
 * @returns Promise<AnonymousUser> - анонімний користувач
 */
export const getOrCreateAnonymousUser = async (): Promise<AnonymousUser> => {
  // 1. Якщо є кешований користувач, повертаємо його
  if (anonymousUserState.cachedAnonymousUser) {
    console.log('Returning cached anonymous user:', anonymousUserState.cachedAnonymousUser.id);
    return anonymousUserState.cachedAnonymousUser;
  }

  // 2. Якщо вже виконується запит, додаємо до черги
  if (anonymousUserState.isFetchingAnonymousUser) {
    console.log('Anonymous user fetch in progress, adding to waiters queue');
    return new Promise<AnonymousUser>((resolve, reject) => {
      anonymousUserState.waiters.push({ resolve, reject });
    });
  }

  // 3. Починаємо новий запит
  anonymousUserState.isFetchingAnonymousUser = true;
  console.log('Starting new anonymous user fetch/creation');

  try {
    // 4. Отримуємо або генеруємо device_id
    const deviceId = await getStableDeviceId();
    console.log('Using device ID:', deviceId);

    // 5. Перевіряємо чи існує користувач з цим device_id
    const { data: existingUser, error: fetchError } = await supabase
      .from('anonymous_users')
      .select('*')
      .eq('device_id', deviceId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = "No rows returned" - це нормально, якщо користувача немає
      console.error('Error fetching anonymous user:', fetchError);
      throw fetchError;
    }

    let anonymousUser: AnonymousUser;

    if (existingUser) {
      console.log('Found existing anonymous user:', existingUser.id);
      
      // Перевіряємо чи потрібно скинути ліміти (тільки при зміні дати)
      const currentDate = new Date().toISOString().split('T')[0];
      if (existingUser.last_reset_date !== currentDate) {
        console.log('Resetting daily limits for existing user (new day)');
        
        const { data: updatedUser, error: updateError } = await supabase
          .from('anonymous_users')
          .update({
            stories_generated_today: 0,
            messages_sent_today: 0,
            last_reset_date: currentDate,
          })
          .eq('id', existingUser.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error resetting anonymous user limits:', updateError);
          // Використовуємо існуючого користувача навіть при помилці скидання
          anonymousUser = existingUser;
        } else {
          console.log('Successfully reset limits for anonymous user');
          anonymousUser = updatedUser;
        }
      } else {
        console.log('Using existing limits (same day)');
        anonymousUser = existingUser;
      }
    } else {
      // 6. Створюємо нового анонімного користувача
      const currentDate = new Date().toISOString().split('T')[0];
      const { data: newUser, error: insertError } = await supabase
        .from('anonymous_users')
        .insert({
          device_id: deviceId,
          stories_generated_today: 0,
          messages_sent_today: 0,
          last_reset_date: currentDate,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating anonymous user:', insertError);
        throw insertError;
      }

      console.log('Created new anonymous user:', newUser.id);
      anonymousUser = newUser;
    }

    // 7. Кешуємо результат
    anonymousUserState.cachedAnonymousUser = anonymousUser;
    anonymousUserState.isFetchingAnonymousUser = false;

    // 8. Повертаємо результат всім очікуючим
    const waiters = [...anonymousUserState.waiters];
    anonymousUserState.waiters = [];
    
    waiters.forEach(({ resolve }) => {
      try {
        resolve(anonymousUser);
      } catch (error) {
        console.error('Error resolving waiter:', error);
      }
    });

    return anonymousUser;

  } catch (error) {
    // 9. Обробка помилок
    console.error('Error in getOrCreateAnonymousUser:', error);
    anonymousUserState.isFetchingAnonymousUser = false;

    // Повертаємо помилку всім очікуючим
    const waiters = [...anonymousUserState.waiters];
    anonymousUserState.waiters = [];
    
    waiters.forEach(({ reject }) => {
      try {
        reject(error instanceof Error ? error : new Error(String(error)));
      } catch (rejectError) {
        console.error('Error rejecting waiter:', rejectError);
      }
    });

    throw error;
  }
};

/**
 * Отримує стабільний device_id з SecureStore або генерує новий
 * @returns Promise<string> - стабільний device_id
 */
const getStableDeviceId = async (): Promise<string> => {
  try {
    // Спочатку спробуємо отримати з SecureStore
    let deviceId = await SecureStore.getItemAsync('device_id');
    
    if (!deviceId) {
      // Генеруємо новий ID через Crypto
      const hash = await digestStringAsync(
        CryptoDigestAlgorithm.SHA256, 
        Date.now().toString() + Math.random().toString()
      );
      deviceId = 'anon_' + hash.slice(0, 16); // укорочений UUID-like
      
      // Зберігаємо в SecureStore
      await SecureStore.setItemAsync('device_id', deviceId);
      console.log('Generated new device ID (Crypto):', deviceId);
    } else {
      console.log('Using existing device ID from SecureStore:', deviceId);
    }
    
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    
    // Fallback: генеруємо тимчасовий ID
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Using temporary device ID:', tempId);
    return tempId;
  }
};

/**
 * Отримує анонімного користувача за device_id
 * @param deviceId - device_id користувача
 * @returns Promise<AnonymousUser | null> - анонімний користувач або null
 */
export const getAnonymousUserByDeviceId = async (deviceId: string): Promise<AnonymousUser | null> => {
  try {
    const { data, error } = await supabase
      .from('anonymous_users')
      .select('*')
      .eq('device_id', deviceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Користувача не знайдено
      }
      console.error('Error fetching anonymous user by device ID:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getAnonymousUserByDeviceId:', error);
    throw error;
  }
};

/**
 * Оновлює дані анонімного користувача
 * @param userId - ID анонімного користувача
 * @param updates - об'єкт з полями для оновлення
 * @returns Promise<AnonymousUser> - оновлений користувач
 */
export const updateAnonymousUser = async (
  userId: string, 
  updates: Partial<Omit<AnonymousUser, 'id' | 'device_id' | 'created_at' | 'updated_at'>>
): Promise<AnonymousUser> => {
  try {
    // Очищаємо кеш при оновленні, щоб наступний запит отримав актуальні дані
    if (anonymousUserState.cachedAnonymousUser?.id === userId) {
      anonymousUserState.cachedAnonymousUser = null;
    }

    const { data, error } = await supabase
      .from('anonymous_users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating anonymous user:', error);
      throw error;
    }

    // Оновлюємо кеш з новими даними
    if (anonymousUserState.cachedAnonymousUser?.id === userId) {
      anonymousUserState.cachedAnonymousUser = data;
    }

    return data;
  } catch (error) {
    console.error('Error in updateAnonymousUser:', error);
    throw error;
  }
};

/**
 * Видаляє анонімного користувача
 * @param userId - ID анонімного користувача
 * @returns Promise<void>
 */
export const deleteAnonymousUser = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('anonymous_users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting anonymous user:', error);
      throw error;
    }

    // Очищаємо кеш якщо видаляємо поточного користувача
    if (anonymousUserState.cachedAnonymousUser?.id === userId) {
      clearAnonymousUserCache();
    }

    console.log('Deleted anonymous user:', userId);
  } catch (error) {
    console.error('Error in deleteAnonymousUser:', error);
    throw error;
  }
};

/**
 * Очищає кеш анонімного користувача
 * Корисно при виході з додатку або зміні пристрою
 */
export const clearAnonymousUserCache = (): void => {
  anonymousUserState.cachedAnonymousUser = null;
  anonymousUserState.isFetchingAnonymousUser = false;
  anonymousUserState.waiters = [];
  console.log('Anonymous user cache cleared');
};

/**
 * Примусово скидає ліміти анонімного користувача (тільки для тестування)
 * @param userId - ID анонімного користувача
 * @returns Promise<AnonymousUser> - оновлений користувач
 */
export const forceResetAnonymousUserLimits = async (userId: string): Promise<AnonymousUser> => {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('anonymous_users')
      .update({
        stories_generated_today: 0,
        messages_sent_today: 0,
        last_reset_date: currentDate,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error force resetting anonymous user limits:', error);
      throw error;
    }

    // Очищаємо кеш щоб наступний запит отримав оновлені дані
    if (anonymousUserState.cachedAnonymousUser?.id === userId) {
      anonymousUserState.cachedAnonymousUser = null;
    }

    console.log('Force reset anonymous user limits:', userId);
    return data;
  } catch (error) {
    console.error('Error in forceResetAnonymousUserLimits:', error);
    throw error;
  }
}; 