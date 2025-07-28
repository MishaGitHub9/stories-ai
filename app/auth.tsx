import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { AuthScreen } from '../components/auth/AuthScreen';
import { ForgotPasswordScreen } from '../components/auth/ForgotPasswordScreen';
import { ThemedView } from '../components/ThemedView';

type AuthScreenType = 'login' | 'forgot-password';

export default function Auth() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreenType>('login');

  const handleAuthSuccess = () => {
    // Повертаємося до налаштувань після успішної авторизації
    router.replace('/(tabs)/settings');
  };

  const handleBackToSettings = () => {
    // Повертаємося до налаштувань
    router.replace('/(tabs)/settings');
  };

  const handleForgotPassword = () => {
    setCurrentScreen('forgot-password');
  };

  const handleBackToLogin = () => {
    setCurrentScreen('login');
  };

  return (
    <ThemedView style={styles.container}>
      {currentScreen === 'login' && (
        <AuthScreen 
          onAuthSuccess={handleAuthSuccess}
          onForgotPassword={handleForgotPassword}
          onBack={handleBackToSettings}
        />
      )}
      
      {currentScreen === 'forgot-password' && (
        <ForgotPasswordScreen 
          onBack={handleBackToLogin}
          onSuccess={handleAuthSuccess}
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