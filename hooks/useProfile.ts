import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { useAuthContext } from '../contexts/AuthContext';
import { ProfileUpdateData, SubscriptionUpdateData, UserProfile } from '../types/profile';

export const useProfile = () => {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Отримання профілю користувача
  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setError(error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('Exception fetching profile:', err);
      setError('Failed to fetch profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Оновлення профілю
  const updateProfile = async (updates: ProfileUpdateData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      setProfile(data);
      return { data, error: null };
    } catch (err) {
      console.error('Exception updating profile:', err);
      return { data: null, error: err };
    }
  };

  // Оновлення підписки
  const updateSubscription = async (subscriptionData: SubscriptionUpdateData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(subscriptionData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating subscription:', error);
        throw error;
      }

      setProfile(data);
      return { data, error: null };
    } catch (err) {
      console.error('Exception updating subscription:', err);
      return { data: null, error: err };
    }
  };

  // Перевірка чи є активна підписка
  const hasActiveSubscription = () => {
    if (!profile) return false;
    
    if (profile.subscription_status === 'free') return false;
    
    if (profile.subscription_plan === 'lifetime') return true;
    
    if (profile.subscription_end_date) {
      const endDate = new Date(profile.subscription_end_date);
      const now = new Date();
      return endDate > now;
    }
    
    return false;
  };

  // Перевірка чи є Premium підписка
  const isPremium = () => {
    return profile?.subscription_status === 'premium' && hasActiveSubscription();
  };

  // Перевірка чи є Pro підписка
  const isPro = () => {
    return profile?.subscription_status === 'pro' && hasActiveSubscription();
  };

  // Отримання статусу підписки
  const getSubscriptionStatus = () => {
    if (!profile) return 'free';
    if (hasActiveSubscription()) {
      return profile.subscription_status;
    }
    return 'free';
  };

  // Завантаження профілю при зміні користувача
  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    updateSubscription,
    hasActiveSubscription,
    isPremium,
    isPro,
    getSubscriptionStatus,
  };
}; 