import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useInAppPurchases } from '@/hooks/useInAppPurchases';
import { useLimits } from '@/hooks/useLimits';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import React from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface SubscriptionPlan {
  id: string;
  title: string;
  price: string;
  originalPrice?: string;
  period: string;
  features: string[];
  popular?: boolean;
  trialDays: number;
  gradient: readonly [string, string, string];
}

export default function SubscriptionScreen() {
  const colorScheme = useColorScheme();
  const { limits } = useLimits();
  const { purchaseSubscription, getProductPrice, loading: purchaseLoading, isExpoGo } = useInAppPurchases();
  const selectedPlan = 'monthly';

  const plans: SubscriptionPlan[] = [
    {
      id: 'monthly',
      title: 'Monthly Premium',
      price: getProductPrice('com.mihadev.story.ai.premium.monthly'),
      period: 'per month',
      features: [
        '✨ Unlimited stories and messages',
        '💬 Unlimited messages',
        '🌍 Translation features'
      ],
      popular: true,
      trialDays: 3,
      gradient: ['#8B5CF6', '#A855F7', '#C084FC'] as const
    }
  ];

  const handleSubscribe = async () => {
    const plan = plans[0];

    if (limits.isAnonymous) {
      Alert.alert(
        'Create Account First',
        'Please create an account to start your free trial and subscribe.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Create Account', onPress: () => router.push('/auth') }
        ]
      );
      return;
    }

    if (isExpoGo) {
      Alert.alert(
        'Expo Go',
        'In-App Purchases are only available in the real app. Use EAS Build for testing.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
      return;
    }

    try {
      await purchaseSubscription('com.mihadev.story.ai.premium.monthly');
    } catch (error) {
      console.error('Subscription error:', error);
      Alert.alert(
        'Purchase Failed',
        'Unable to complete the purchase. Please try again.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
    }
  };

  const renderFeature = (feature: string, index: number) => (
    <View key={index} style={styles.featureRow}>
      <Text style={styles.featureText}>{feature}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme ?? 'light'].background }}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      <LinearGradient
        colors={['#1E0B37', '#2D1B69', '#1E0B37']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium Subscription</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <LinearGradient
              colors={['#8B5CF6', '#A855F7', '#C084FC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroGradient}
            >
              <Text style={styles.heroEmoji}>✨</Text>
              <Text style={styles.heroTitle}>Unlock Premium Features</Text>
              <Text style={styles.heroSubtitle}>
                Get unlimited access to all stories and features
              </Text>
            </LinearGradient>
          </View>

          {/* Trial Info */}
          <View style={styles.trialInfo}>
            <Text style={styles.trialTitle}>🎉 Start with 3-Day Free Trial</Text>
            <Text style={styles.trialDescription}>
              Try all premium features for free. Cancel anytime during the trial period.
            </Text>
          </View>

          {/* Plans */}
          <View style={styles.plansContainer}>
            {plans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={styles.planCard}
                activeOpacity={0.8}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Most Popular</Text>
                  </View>
                )}
                
                <LinearGradient
                  colors={plan.gradient}
                  style={styles.planGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.planHeader}>
                    <Text style={[styles.planTitle, { color: '#FFFFFF' }]}>
                      {plan.title}
                    </Text>
                    
                    <View style={styles.priceContainer}>
                      <Text style={[styles.price, { color: '#FFFFFF' }]}>
                        {plan.price}
                      </Text>
                      {plan.originalPrice && (
                        <Text style={[styles.originalPrice, { color: '#FFFFFF' }]}>
                          {plan.originalPrice}
                        </Text>
                      )}
                      <Text style={[styles.period, { color: '#FFFFFF' }]}>
                        {plan.period}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.featuresContainer}>
                    {plan.features.map(renderFeature)}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Subscribe Button */}
          <View style={styles.subscribeContainer}>
            <TouchableOpacity
              style={[styles.subscribeButton, purchaseLoading && styles.subscribeButtonDisabled]}
              onPress={handleSubscribe}
              disabled={purchaseLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#8B5CF6', '#A855F7', '#C084FC']}
                style={styles.subscribeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.subscribeText}>
                  {purchaseLoading ? 'Processing...' : 'Start Free Trial'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <Text style={styles.termsText}>
              By subscribing, you agree to our Terms of Service and Privacy Policy.
              Cancel anytime during the trial period.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 40,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  heroGradient: {
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  heroEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
    lineHeight: 22,
  },
  trialInfo: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  trialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
    textAlign: 'center',
    marginBottom: 8,
  },
  trialDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  plansContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  planCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  popularBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planGradient: {
    padding: 24,
  },
  planHeader: {
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  originalPrice: {
    fontSize: 18,
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  period: {
    fontSize: 14,
    opacity: 0.8,
  },
  featuresContainer: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
  },
  subscribeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  subscribeButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  subscribeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },
}); 