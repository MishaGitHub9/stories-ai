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
      console.log('🔗 Deep link received:', url);
      console.log('🔗 Full URL:', url);
      console.log('🔗 URL type:', typeof url);
      console.log('🔗 URL length:', url.length);
      
      try {
        // Використовуємо expo-linking для парсингу URL
        const parsedUrl = Linking.parse(url);
        console.log('🔍 Parsed URL:', parsedUrl);
        console.log('🔍 Query params:', parsedUrl.queryParams);
        
        // Отримуємо параметри з queryParams
        const accessToken = parsedUrl.queryParams?.access_token;
        const refreshToken = parsedUrl.queryParams?.refresh_token;
        const type = parsedUrl.queryParams?.type;
        
        // Альтернативний спосіб парсингу
        console.log('🔍 Trying alternative parsing...');
        const urlObj = new URL(url);
        console.log('🔍 URL search params:', urlObj.searchParams.toString());
        console.log('🔍 URL search params entries:', Array.from(urlObj.searchParams.entries()));
        
        console.log('📋 Parsed params:', { 
          accessToken: accessToken ? '✅ Present' : '❌ Missing', 
          refreshToken: refreshToken ? '✅ Present' : '❌ Missing', 
          type: type || '❌ Missing' 
        });
        console.log('📋 Raw params:', { accessToken, refreshToken, type });
        
        // Перевіряємо, чи це посилання для скидання пароля
        if (type === 'recovery' && accessToken && refreshToken) {
          console.log('✅ Password reset link detected');
          // Показуємо Alert для дебагу
          alert(`✅ Deep link detected!\nType: ${type}\nAccess Token: ${accessToken ? 'Present' : 'Missing'}\nRefresh Token: ${refreshToken ? 'Present' : 'Missing'}`);
          
          // Перенаправляємо на екран скидання пароля з параметрами
          const resetUrl = `/auth/reset-password?access_token=${accessToken}&refresh_token=${refreshToken}&type=${type}`;
          console.log('🔄 Redirecting to:', resetUrl);
          
          // Використовуємо router для навігації
          setTimeout(() => {
            console.log('🚀 Executing router.replace...');
            router.replace(resetUrl as any);
          }, 1000); // Збільшили затримку
        } else {
          console.log('❌ Not a valid password reset link');
          console.log('❌ Conditions check:', { 
            typeCheck: type === 'recovery', 
            accessTokenCheck: !!accessToken, 
            refreshTokenCheck: !!refreshToken 
          });
          // Показуємо Alert для дебагу
          alert(`❌ Invalid deep link!\nType: ${type}\nAccess Token: ${accessToken ? 'Present' : 'Missing'}\nRefresh Token: ${refreshToken ? 'Present' : 'Missing'}`);
        }
      } catch (error) {
        console.error('❌ Error parsing deep link:', error);
        console.error('❌ Error details:', (error as Error).message);
      }
    };

    // Обробка початкового URL при запуску додатку
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('🚀 Initial URL:', url);
        handleDeepLink(url);
      } else {
        console.log('📱 No initial URL found');
      }
    });

    // Слухаємо нові deep links
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('🆕 New deep link:', event.url);
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
