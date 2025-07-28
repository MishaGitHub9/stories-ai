import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../config/supabase';

export default function ResetPasswordScreen() {
  const { access_token, refresh_token, type } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handlePasswordReset();
  }, [access_token, refresh_token, type]);

  const handlePasswordReset = async () => {
    if (!access_token || !refresh_token || type !== 'recovery') {
      setError('Invalid password reset link');
      setLoading(false);
      return;
    }

    try {
      // Встановлюємо сесію з токенами
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: access_token as string,
        refresh_token: refresh_token as string,
      });

      if (sessionError) {
        throw sessionError;
      }

      // Перенаправляємо на екран зміни пароля
      router.replace('/auth/change-password');
      
    } catch (error: any) {
      console.error('Error handling password reset:', error);
      setError('Error processing password reset link');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#1E0B37', '#2D1B69', '#1E0B37']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Processing link...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient
        colors={['#1E0B37', '#2D1B69', '#1E0B37']}
        style={styles.container}
      >
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.helpText}>
            Try again or contact support
          </Text>
        </View>
      </LinearGradient>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80, // Зменшуємо відступ
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  helpText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
}); 