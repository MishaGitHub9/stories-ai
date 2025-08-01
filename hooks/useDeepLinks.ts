import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '../config/supabase';

export const useDeepLinks = () => {
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      console.log('Deep link received:', url);
      
      try {
        // Парсимо URL для отримання параметрів
        const urlObj = new URL(url);
        const accessToken = urlObj.searchParams.get('access_token');
        const refreshToken = urlObj.searchParams.get('refresh_token');
        const type = urlObj.searchParams.get('type');
        
        console.log('URL params:', { accessToken, refreshToken, type });
        
        // Перевіряємо, чи це magic link з access_token
        if (accessToken && refreshToken) {
          console.log('Magic link with access_token detected');
          
          // Використовуємо exchangeCodeForSession для авторизації
          const { data, error } = await supabase.auth.exchangeCodeForSession(accessToken);
          
          if (error) {
            console.error('Exchange code for session error:', error);
            return;
          }

          if (data.session) {
            console.log('User authenticated successfully via deep link');
            // Перенаправляємо на головний екран
            router.replace('/(tabs)');
          } else {
            console.log('No session after exchangeCodeForSession');
          }
        }
        // Перевіряємо, чи це посилання для скидання пароля
        else if (type === 'recovery' && accessToken && refreshToken) {
          console.log('Password reset link detected');
          // Перенаправляємо на екран скидання пароля з параметрами
          const resetUrl = `/auth/reset-password?access_token=${accessToken}&refresh_token=${refreshToken}&type=${type}`;
          console.log('Redirecting to:', resetUrl);
          
          // Використовуємо router для навігації
          setTimeout(() => {
            router.replace(resetUrl as any);
          }, 100);
        }
      } catch (error) {
        console.error('Error parsing deep link:', error);
      }
    };

    // Обробка початкового URL при запуску додатку
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Initial URL:', url);
        handleDeepLink(url);
      }
    });

    // Слухаємо нові deep links
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('New deep link:', event.url);
      handleDeepLink(event.url);
    });

    return () => {
      subscription?.remove();
    };
  }, []);
}; 