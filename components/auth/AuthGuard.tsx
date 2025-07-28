import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthContext } from '../../contexts/AuthContext';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Якщо потрібна авторизація, але користувач не авторизований
        router.replace('/auth' as any);
      } else if (!requireAuth && user) {
        // Якщо авторизація не потрібна, але користувач авторизований
        router.replace('/(tabs)');
      }
    }
  }, [user, loading, requireAuth, router]);

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Завантаження...</ThemedText>
      </ThemedView>
    );
  }

  // Якщо потрібна авторизація і користувач не авторизований
  if (requireAuth && !user) {
    return null; // Router вже перенаправить на /auth
  }

  // Якщо авторизація не потрібна і користувач авторизований
  if (!requireAuth && user) {
    return null; // Router вже перенаправить на /(tabs)
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
}); 