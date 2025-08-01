import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { supabase } from '../../config/supabase';

export default function AuthCallback() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback params:', params);
        
        // Перевіряємо, чи є access_token в URL
        const accessToken = params.access_token as string;
        const refreshToken = params.refresh_token as string;
        
        if (accessToken && refreshToken) {
          console.log('Found access_token and refresh_token in URL');
          
          // Використовуємо exchangeCodeForSession для авторизації
          const { data, error } = await supabase.auth.exchangeCodeForSession(accessToken);
          
          if (error) {
            console.error('Exchange code for session error:', error);
            setError('Authentication failed. Please try again.');
            setLoading(false);
            return;
          }

          if (data.session) {
            console.log('User authenticated successfully via exchangeCodeForSession');
            // Перенаправляємо на головний екран
            router.replace('/(tabs)');
          } else {
            console.log('No session after exchangeCodeForSession');
            setError('Authentication failed. Please try again.');
            setLoading(false);
          }
        } else {
          console.log('No access_token found, checking current session');
          
          // Якщо немає access_token, перевіряємо поточну сесію
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Get session error:', error);
            setError('Authentication failed. Please try again.');
            setLoading(false);
            return;
          }

          if (session) {
            console.log('User authenticated successfully via getSession');
            // Перенаправляємо на головний екран
            router.replace('/(tabs)');
          } else {
            console.log('No session found');
            setError('Authentication failed. Please try again.');
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setError('An unexpected error occurred. Please try again.');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [params]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>
          Completing sign in...
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>
          {error}
        </ThemedText>
        <ThemedText 
          style={styles.retryText}
          onPress={() => router.replace('/auth')}
        >
          Try Again
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <ThemedText style={styles.loadingText}>
        Redirecting...
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryText: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
}); 