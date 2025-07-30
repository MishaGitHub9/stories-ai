import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// ✅ НАЛАШТУЙТЕ ЦІ ЗНАЧЕННЯ ПІСЛЯ СТВОРЕННЯ НОВОГО ПРОЕКТУ SUPABASE
// 1. Перейдіть до Settings → API у вашому проекті Supabase
// 2. Скопіюйте Project URL та anon public ключ
// 3. Вставте їх нижче:
const supabaseUrl = 'https://lkidcfdazjdhtykxiafp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraWRjZmRhempkaHR5a3hpYWZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTAzMzEsImV4cCI6MjA2OTM4NjMzMX0.PA_4fAgYn2TV3_-DkmNFFRDYYRDCggeIPMWxphSlT70';

// Web redirect URL для відновлення паролю через GitHub Pages
export const WEB_REDIRECT_URL = 'https://mishagithub9.github.io/stories-ai';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? localStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'pkce',
  },
});

import { Database as ProfileDatabase } from '../types/profile';

export type Database = ProfileDatabase; 