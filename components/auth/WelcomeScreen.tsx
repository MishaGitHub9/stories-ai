import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { UserProfile } from '../../types/profile';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface WelcomeScreenProps {
  onContinue?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, getUserProfile } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setError('No user found');
        setLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile(user.id);
        if (userProfile) {
          setProfile(userProfile);
        } else {
          setError('Failed to load user profile');
        }
      } catch (err) {
        setError('Error loading profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, getUserProfile]);

  const getPlanDisplayName = (plan?: string) => {
    switch (plan) {
      case 'free':
        return 'Free';
      case 'premium':
        return 'Premium';
      case 'pro':
        return 'Pro';
      default:
        return 'Free';
    }
  };

  const getPlanIcon = (plan?: string) => {
    switch (plan) {
      case 'premium':
        return 'star';
      case 'pro':
        return 'diamond';
      default:
        return 'person';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Loading your profile...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF3B30" />
          <ThemedText style={styles.errorTitle}>Error</ThemedText>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const plan = profile?.subscription_status || 'free';
  const planDisplayName = getPlanDisplayName(plan);
  const planIcon = getPlanIcon(plan);

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name={planIcon} size={48} color="#007AFF" />
          </View>
          
          <ThemedText style={styles.welcomeTitle}>
            Welcome!
          </ThemedText>
          
          <ThemedText style={styles.subscriptionText}>
            Your subscription plan:
          </ThemedText>
          
          <View style={styles.planContainer}>
            <ThemedText style={styles.planName}>
              {planDisplayName}
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <ThemedText style={styles.infoText}>
            You're all set! You can now enjoy all the features available with your {planDisplayName.toLowerCase()} plan.
          </ThemedText>
        </View>

        {onContinue && (
          <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
            <ThemedText style={styles.continueButtonText}>
              Continue to App
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subscriptionText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  planContainer: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  infoContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 