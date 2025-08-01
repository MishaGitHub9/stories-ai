import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useDeepLinks } from '@/hooks/useDeepLinks';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Використовуємо хук для обробки deep links
  useDeepLinks();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}

// Налаштування deep links для expo-router
export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Конфігурація deep links
export const linking = {
  prefixes: ['stories.ai://', 'https://storylish-mxwlt1w0g-ms-projects-2554a4d0.vercel.app'],
  config: {
    screens: {
      '(tabs)': {
        screens: {
          index: '',
          settings: 'settings',
          stories: 'stories',
        },
      },
      auth: 'auth',
      'auth/callback': 'auth/callback',
      modal: 'modal',
    },
  },
};
