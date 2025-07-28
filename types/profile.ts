export type SubscriptionStatus = 'free' | 'premium' | 'pro';
export type SubscriptionPlan = 'monthly' | 'yearly' | 'lifetime';
export type SubscriptionProvider = 'stripe' | 'apple' | 'google';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  subscription_status: SubscriptionStatus;
  subscription_plan?: SubscriptionPlan;
  subscription_start_date?: string;
  subscription_end_date?: string;
  subscription_provider?: SubscriptionProvider;
  subscription_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  full_name?: string;
  avatar_url?: string;
}

export interface SubscriptionUpdateData {
  subscription_status: SubscriptionStatus;
  subscription_plan?: SubscriptionPlan;
  subscription_start_date?: string;
  subscription_end_date?: string;
  subscription_provider?: SubscriptionProvider;
  subscription_id?: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
} 