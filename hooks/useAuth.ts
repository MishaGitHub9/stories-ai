import { useEffect, useState } from 'react';
import { supabase, WEB_REDIRECT_URL } from '../config/supabase';
import { AuthState } from '../types/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    // Отримуємо поточну сесію
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    // Слухаємо зміни авторизації
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };



  const signOut = async () => {
    try {
      console.log('Attempting to sign out...');
      
      // Спочатку перевіряємо, чи є активна сесія
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session ? 'exists' : 'none');
      
      if (!session) {
        console.log('No active session found, clearing state anyway');
        // Якщо сесії немає, просто очищаємо локальний стан
        setAuthState({
          user: null,
          session: null,
          loading: false,
        });
        return { error: null };
      }
      
      const { error } = await supabase.auth.signOut();
      console.log('Sign out result:', { error });
      
      // Навіть якщо є помилка, очищаємо локальний стан
      setAuthState({
        user: null,
        session: null,
        loading: false,
      });
      
      if (error) throw error;
      console.log('Sign out successful');
      return { error: null };
    } catch (error) {
      console.error('Sign out error in hook:', error);
      // Навіть при помилці очищаємо стан
      setAuthState({
        user: null,
        session: null,
        loading: false,
      });
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: WEB_REDIRECT_URL,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  return {
    ...authState,
    signUpWithEmail,
    signInWithEmail,
    signOut,
    resetPassword,
    updatePassword,
  };
}; 