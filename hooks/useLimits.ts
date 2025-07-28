import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../config/supabase';
import { AnonymousUser, getOrCreateAnonymousUser, updateAnonymousUser } from '../services/anonymousUser';
import { useProfile } from './useProfile';

// Ліміти для безкоштовних користувачів (ТЕСТУВАННЯ - ВСІ ОБМЕЖЕННЯ ЗНЯТО)
const FREE_LIMITS = {
  STORIES_PER_DAY: 999999, // Необмежено для тестування
  MESSAGES_PER_STORY_PER_DAY: 999999, // Необмежено для тестування
} as const;

// Ліміти для пробного періоду
const TRIAL_LIMITS = {
  STORIES_PER_DAY: 999, // Необмежено
  MESSAGES_PER_STORY_PER_DAY: 999, // Необмежено
} as const;

export interface UserLimits {
  storiesGeneratedToday: number;
  messagesSentToday: number;
  canGenerateStory: boolean;
  canSendMessage: boolean;
  storiesRemaining: number;
  messagesRemaining: number;
  lastResetDate: string;
  isAnonymous: boolean;
  hasActiveSubscription: boolean;
  isInTrialPeriod: boolean;
  trialDaysRemaining: number;
}

export const useLimits = () => {
  const { profile } = useProfile();
  const [limits, setLimits] = useState<UserLimits>({
    storiesGeneratedToday: 0,
    messagesSentToday: 0,
    canGenerateStory: true,
    canSendMessage: true,
    storiesRemaining: FREE_LIMITS.STORIES_PER_DAY,
    messagesRemaining: FREE_LIMITS.MESSAGES_PER_STORY_PER_DAY,
    lastResetDate: new Date().toISOString().split('T')[0],
    isAnonymous: true,
    hasActiveSubscription: false,
    isInTrialPeriod: false,
    trialDaysRemaining: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Використовуємо ref для відстеження стану ініціалізації
  const initStateRef = useRef({
    hasInitialized: false,
    currentUserType: 'unknown' as 'anonymous' | 'registered' | 'unknown',
    anonymousUser: null as AnonymousUser | null,
  });

  // Отримання поточної дати з урахуванням часової зони
  const getCurrentDate = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Перевірка активності підписки
  const checkSubscriptionStatus = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status, trial_start_date, trial_end_date')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        return {
          hasActiveSubscription: false,
          isInTrialPeriod: false,
          trialDaysRemaining: 0,
        };
      }

      const now = new Date();
      const trialEnd = profileData.trial_end_date ? new Date(profileData.trial_end_date) : null;
      const isInTrial = trialEnd && now < trialEnd;
      const trialDaysRemaining = trialEnd ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

      return {
        hasActiveSubscription: profileData.subscription_status === 'premium' || isInTrial,
        isInTrialPeriod: isInTrial,
        trialDaysRemaining: Math.max(0, trialDaysRemaining),
      };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return {
        hasActiveSubscription: false,
        isInTrialPeriod: false,
        trialDaysRemaining: 0,
      };
    }
  }, []);

  // Завантаження лімітів для зареєстрованого користувача
  const loadRegisteredUserLimits = useCallback(async (userId: string) => {
    try {
      console.log('Loading registered user limits for:', userId);
      
      const subscriptionStatus = await checkSubscriptionStatus(userId);
      
      // Спочатку намагаємося отримати існуючі ліміти
      const { data, error } = await supabase
        .from('user_limits')
        .select('stories_generated_today, messages_sent_today, last_reset_date')
        .eq('user_id', userId)
        .single();

      const today = getCurrentDate();
      let storiesGenerated = 0;
      let messagesSent = 0;
      let lastReset = today;

      if (error && error.code === 'PGRST116') {
        // Створюємо новий запис для користувача
        console.log('Creating new user limits record');
        const { error: insertError } = await supabase
          .from('user_limits')
          .insert({
            user_id: userId,
            stories_generated_today: 0,
            messages_sent_today: 0,
            last_reset_date: today,
          });

        if (insertError && insertError.code !== '23505') { // Ігноруємо дублікати
          throw insertError;
        }
      } else if (!error && data) {
        storiesGenerated = data.stories_generated_today || 0;
        messagesSent = data.messages_sent_today || 0;
        lastReset = data.last_reset_date || today;

        // Скидаємо ліміти тільки якщо пройшов день
        if (lastReset !== today) {
          console.log('Resetting limits for new day');
          const { error: updateError } = await supabase
            .from('user_limits')
            .update({
              stories_generated_today: 0,
              messages_sent_today: 0,
              last_reset_date: today,
            })
            .eq('user_id', userId);

          if (!updateError) {
            storiesGenerated = 0;
            messagesSent = 0;
            lastReset = today;
          }
        }
      }

      const currentLimits = subscriptionStatus.hasActiveSubscription ? TRIAL_LIMITS : FREE_LIMITS;

      const newLimits: UserLimits = {
        storiesGeneratedToday: storiesGenerated,
        messagesSentToday: messagesSent,
        canGenerateStory: true, // ТЕСТУВАННЯ: Завжди дозволяємо
        canSendMessage: true, // ТЕСТУВАННЯ: Завжди дозволяємо
        storiesRemaining: 999999, // ТЕСТУВАННЯ: Необмежено
        messagesRemaining: 999999, // ТЕСТУВАННЯ: Необмежено
        lastResetDate: lastReset,
        isAnonymous: false,
        hasActiveSubscription: subscriptionStatus.hasActiveSubscription || false,
        isInTrialPeriod: subscriptionStatus.isInTrialPeriod || false,
        trialDaysRemaining: subscriptionStatus.trialDaysRemaining || 0,
      };

      console.log('Registered user limits loaded:', newLimits);
      setLimits(newLimits);
      initStateRef.current.currentUserType = 'registered';
      
    } catch (error) {
      console.error('Error loading registered user limits:', error);
      setError('Failed to load user limits');
    }
  }, [checkSubscriptionStatus, getCurrentDate]);

  // Завантаження лімітів для анонімного користувача
  const loadAnonymousUserLimits = useCallback(async () => {
    try {
      console.log('Loading anonymous user limits...');
      
      // Отримуємо або створюємо анонімного користувача
      const anonymousUser = await getOrCreateAnonymousUser();
      
      // Зберігаємо користувача в ref для подальшого використання
      initStateRef.current.anonymousUser = anonymousUser;

      const newLimits: UserLimits = {
        storiesGeneratedToday: anonymousUser.stories_generated_today,
        messagesSentToday: anonymousUser.messages_sent_today,
        canGenerateStory: true, // ТЕСТУВАННЯ: Завжди дозволяємо
        canSendMessage: true, // ТЕСТУВАННЯ: Завжди дозволяємо
        storiesRemaining: 999999, // ТЕСТУВАННЯ: Необмежено
        messagesRemaining: 999999, // ТЕСТУВАННЯ: Необмежено
        lastResetDate: anonymousUser.last_reset_date,
        isAnonymous: true,
        hasActiveSubscription: false,
        isInTrialPeriod: false,
        trialDaysRemaining: 0,
      };

      console.log('Anonymous user limits loaded:', newLimits);
      setLimits(newLimits);
      initStateRef.current.currentUserType = 'anonymous';
      setError(null);
      
    } catch (error) {
      console.error('Error loading anonymous user limits:', error);
      setError('Failed to load anonymous user limits');
      
      // Fallback до базових лімітів (ТЕСТУВАННЯ)
      const fallbackLimits: UserLimits = {
        storiesGeneratedToday: 0,
        messagesSentToday: 0,
        canGenerateStory: true, // ТЕСТУВАННЯ: Завжди дозволяємо
        canSendMessage: true, // ТЕСТУВАННЯ: Завжди дозволяємо
        storiesRemaining: 999999, // ТЕСТУВАННЯ: Необмежено
        messagesRemaining: 999999, // ТЕСТУВАННЯ: Необмежено
        lastResetDate: getCurrentDate(),
        isAnonymous: true,
        hasActiveSubscription: false,
        isInTrialPeriod: false,
        trialDaysRemaining: 0,
      };
      
      console.log('Using fallback limits:', fallbackLimits);
      setLimits(fallbackLimits);
      initStateRef.current.currentUserType = 'anonymous';
    }
  }, []);

  // Головна функція завантаження лімітів
  const loadLimits = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (profile) {
        await loadRegisteredUserLimits(profile.id);
      } else {
        await loadAnonymousUserLimits();
      }
      initStateRef.current.hasInitialized = true;
    } catch (error) {
      console.error('Error loading limits:', error);
      setError('Failed to load limits');
    } finally {
      setLoading(false);
    }
  }, [profile, loadRegisteredUserLimits, loadAnonymousUserLimits]);

  // Збільшення лічильника згенерованих історій
  const incrementStoriesGenerated = useCallback(async () => {
    try {
      if (profile) {
        const newCount = limits.storiesGeneratedToday + 1;
        console.log('Incrementing stories generated to:', newCount);
        
        const { error } = await supabase
          .from('user_limits')
          .update({ stories_generated_today: newCount })
          .eq('user_id', profile.id);

        if (error) throw error;

        const currentLimits = limits.hasActiveSubscription ? TRIAL_LIMITS : FREE_LIMITS;

        setLimits(prev => ({
          ...prev,
          storiesGeneratedToday: newCount,
          canGenerateStory: true, // ТЕСТУВАННЯ: Завжди дозволяємо
          storiesRemaining: 999999, // ТЕСТУВАННЯ: Необмежено
        }));
      } else {
        if (!initStateRef.current.anonymousUser) {
          console.error('No anonymous user found');
          return;
        }

        // Використовуємо актуальні дані з ref замість застарілих limits
        const currentStoriesCount = initStateRef.current.anonymousUser.stories_generated_today;
        const newCount = currentStoriesCount + 1;
        console.log('Incrementing anonymous stories generated from', currentStoriesCount, 'to:', newCount);
        
        const updatedUser = await updateAnonymousUser(initStateRef.current.anonymousUser.id, {
          stories_generated_today: newCount,
          messages_sent_today: initStateRef.current.anonymousUser.messages_sent_today,
          last_reset_date: initStateRef.current.anonymousUser.last_reset_date,
        });

        // Оновлюємо ref
        initStateRef.current.anonymousUser = updatedUser;

        setLimits(prev => ({
          ...prev,
          storiesGeneratedToday: newCount,
          canGenerateStory: true, // ТЕСТУВАННЯ: Завжди дозволяємо
          storiesRemaining: 999999, // ТЕСТУВАННЯ: Необмежено
        }));
      }
    } catch (error) {
      console.error('Error incrementing stories generated:', error);
    }
  }, [limits.storiesGeneratedToday, limits.hasActiveSubscription, profile]);

  // Збільшення лічильника відправлених повідомлень
  const incrementMessagesSent = useCallback(async () => {
    try {
      if (profile) {
        const newCount = limits.messagesSentToday + 1;
        console.log('Incrementing messages sent to:', newCount);
        
        const { error } = await supabase
          .from('user_limits')
          .update({ messages_sent_today: newCount })
          .eq('user_id', profile.id);

        if (error) throw error;

        const currentLimits = limits.hasActiveSubscription ? TRIAL_LIMITS : FREE_LIMITS;

        setLimits(prev => ({
          ...prev,
          messagesSentToday: newCount,
          canSendMessage: true, // ТЕСТУВАННЯ: Завжди дозволяємо
          messagesRemaining: 999999, // ТЕСТУВАННЯ: Необмежено
        }));
      } else {
        if (!initStateRef.current.anonymousUser) {
          console.error('No anonymous user found');
          return;
        }

        // Використовуємо актуальні дані з ref замість застарілих limits
        const currentMessagesCount = initStateRef.current.anonymousUser.messages_sent_today;
        const newCount = currentMessagesCount + 1;
        console.log('Incrementing anonymous messages sent from', currentMessagesCount, 'to:', newCount);
        
        const updatedUser = await updateAnonymousUser(initStateRef.current.anonymousUser.id, {
          stories_generated_today: initStateRef.current.anonymousUser.stories_generated_today,
          messages_sent_today: newCount,
          last_reset_date: initStateRef.current.anonymousUser.last_reset_date,
        });

        // Оновлюємо ref
        initStateRef.current.anonymousUser = updatedUser;

        setLimits(prev => ({
          ...prev,
          messagesSentToday: newCount,
          canSendMessage: true, // ТЕСТУВАННЯ: Завжди дозволяємо
          messagesRemaining: 999999, // ТЕСТУВАННЯ: Необмежено
        }));
      }
    } catch (error) {
      console.error('Error incrementing messages sent:', error);
    }
  }, [limits.messagesSentToday, limits.hasActiveSubscription, profile]);

  // Перевірка можливості виконання дії (ТЕСТУВАННЯ - ВСІ ДІЇ ДОЗВОЛЕНІ)
  const canPerformAction = useCallback((action: 'generate_story' | 'send_message') => {
    // ТЕСТУВАННЯ: Завжди повертаємо true для всіх дій
    console.log(`TESTING: Allowing action: ${action}`);
    return true;
  }, []);

  // Примусове оновлення лімітів
  const refreshLimits = useCallback(() => {
    initStateRef.current.hasInitialized = false;
    loadLimits();
  }, [loadLimits]);

  // Примусове скидання лімітів анонімного користувача (тільки для тестування)
  const forceResetAnonymousLimits = useCallback(async () => {
    if (!profile && initStateRef.current.anonymousUser) {
      try {
        const { forceResetAnonymousUserLimits } = await import('../services/anonymousUser');
        const updatedUser = await forceResetAnonymousUserLimits(initStateRef.current.anonymousUser.id);
        
        // Оновлюємо ref та state
        initStateRef.current.anonymousUser = updatedUser;
        setLimits(prev => ({
          ...prev,
          storiesGeneratedToday: 0,
          messagesSentToday: 0,
          canGenerateStory: true,
          canSendMessage: true,
          storiesRemaining: FREE_LIMITS.STORIES_PER_DAY,
          messagesRemaining: FREE_LIMITS.MESSAGES_PER_STORY_PER_DAY,
        }));
        
        console.log('Force reset anonymous user limits completed');
      } catch (error) {
        console.error('Error force resetting anonymous limits:', error);
      }
    }
  }, [profile]);

  // Effect для ініціалізації та реакції на зміни профілю
  useEffect(() => {
    const shouldLoad = !initStateRef.current.hasInitialized || 
      (profile && initStateRef.current.currentUserType !== 'registered') ||
      (!profile && initStateRef.current.currentUserType !== 'anonymous');

    if (shouldLoad) {
      console.log('Loading limits due to profile change or initialization');
      loadLimits();
    }
  }, [profile, loadLimits]);

  

  return {
    limits,
    loading,
    error,
    FREE_LIMITS,
    TRIAL_LIMITS,
    incrementStoriesGenerated,
    incrementMessagesSent,
    canPerformAction,
    refreshLimits,
    loadLimits,
    forceResetAnonymousLimits, // Тільки для тестування
  };
};