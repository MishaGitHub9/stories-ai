import { useColorScheme } from '@/hooks/useColorScheme';
import * as Linking from 'expo-linking';
import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { initializeInAppPurchases } from '../config/inAppPurchases';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Ініціалізація In-App Purchases
  useEffect(() => {
    const initPurchases = async () => {
      try {
        await initializeInAppPurchases();
        console.log('In-App Purchases initialized in root layout');
      } catch (error) {
        console.error('Failed to initialize In-App Purchases in root layout:', error);
      }
    };

    initPurchases();
  }, []);

  // Обробка deep links для скидання пароля
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('Deep link received:', url);
      
      try {
        // Парсимо URL для отримання параметрів
        const urlObj = new URL(url);
        const accessToken = urlObj.searchParams.get('access_token');
        const refreshToken = urlObj.searchParams.get('refresh_token');
        const type = urlObj.searchParams.get('type');
        
        // Перевіряємо, чи це посилання для скидання пароля
        if (type === 'recovery' && accessToken && refreshToken) {
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

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="subscription" options={{ headerShown: false }} />
        <Stack.Screen name="splash" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AuthProvider>
  );
}
