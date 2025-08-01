import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { MagicLinkAuthScreen } from '../components/auth/MagicLinkAuthScreen';
import { WelcomeScreen } from '../components/auth/WelcomeScreen';
import { ThemedView } from '../components/ThemedView';
import { useAuth } from '../hooks/useAuth';

type AuthScreenType = 'login' | 'welcome';

export default function Auth() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreenType>('login');
  const { user, loading } = useAuth();

  useEffect(() => {
    // Якщо користувач авторизований, показуємо welcome screen
    if (user && !loading) {
      setCurrentScreen('welcome');
    }
  }, [user, loading]);

  const handleAuthSuccess = () => {
    // Після успішної авторизації показуємо welcome screen
    setCurrentScreen('welcome');
  };

  const handleContinueToApp = () => {
    // Повертаємося до головного екрану після привітання
    router.replace('/(tabs)');
  };

  const handleBackToSettings = () => {
    // Повертаємося до налаштувань
    router.replace('/(tabs)/settings');
  };

  // Показуємо loading поки перевіряємо стан авторизації
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        {/* Loading indicator буде показаний в WelcomeScreen */}
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {currentScreen === 'login' && (
        <MagicLinkAuthScreen 
          onAuthSuccess={handleAuthSuccess}
          onBack={handleBackToSettings}
        />
      )}
      
      {currentScreen === 'welcome' && user && (
        <WelcomeScreen 
          onContinue={handleContinueToApp}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 