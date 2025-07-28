import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ⚠️ ЗАМІНІТЬ ЦІ ЗНАЧЕННЯ НА ВАШІ РЕАЛЬНІ ДАНІ З SUPABASE
// 1. Перейдіть до Settings → API у вашому проекті Supabase
// 2. Скопіюйте Project URL та anon public ключ
// 3. Вставте їх нижче:
const supabaseUrl = 'https://ruehvguvzoshymdjlgda.supabase.co'; // https://your-project.supabase.co
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1ZWh2Z3V2em9zaHltZGpsZ2RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMDA1MDAsImV4cCI6MjA2ODc3NjUwMH0.e1jenwylac7T0AAj8YPqc6gtNJom8GFCTnL1AIaSJsM'; // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

import { Database as ProfileDatabase } from '../types/profile';

export type Database = ProfileDatabase; 