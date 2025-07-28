import { useColorScheme } from '@/hooks/useColorScheme';
import { useInAppPurchases } from '@/hooks/useInAppPurchases';
import { useTranslationLanguage } from '@/hooks/useTranslationLanguage';
import { TranslationLanguage } from '@/services/translation';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthContext } from '../../contexts/AuthContext';
import { useProfile } from '../../hooks/useProfile';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const { selectedLanguage, updateLanguage, isLoading } = useTranslationLanguage();
  const { user, signOut } = useAuthContext();
  const { profile, hasActiveSubscription, isPremium, isPro, getSubscriptionStatus } = useProfile();
  const { restore, loading: restoreLoading, isExpoGo } = useInAppPurchases();

  const languages: { code: TranslationLanguage; name: string; flag: string }[] = [
    { code: 'ukrainian', name: 'Українська', flag: '🇺🇦' },
    { code: 'german', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'polish', name: 'Polski', flag: '🇵🇱' },
    { code: 'french', name: 'Français', flag: '🇫🇷' },
    { code: 'spanish', name: 'Español', flag: '🇪🇸' }
  ];

  const handleFeedbackPress = async () => {
    const telegramUrl = 'https://t.me/not_hijacked';
    try {
      const supported = await Linking.canOpenURL(telegramUrl);
      if (supported) {
        await Linking.openURL(telegramUrl);
      } else {
        Alert.alert('Error', 'Cannot open Telegram. Please make sure Telegram is installed.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open Telegram. Please try again.');
    }
  };

  const handleRestorePurchases = async () => {
    if (isExpoGo) {
      Alert.alert(
        'Expo Go',
        'Restore purchases is only available in the real app.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
      return;
    }

    try {
      await restore();
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert(
        'Restore Failed',
        'Unable to restore purchases. Please try again.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Starting sign out process...');
              const result = await signOut();
              console.log('Sign out result:', result);
              
              if (result.error) {
                console.error('Sign out error:', result.error);
                const errorMessage = result.error instanceof Error 
                  ? result.error.message 
                  : typeof result.error === 'string' 
                    ? result.error 
                    : 'Unknown error';
                
                // Якщо помилка про відсутність сесії, вважаємо це успішним виходом
                if (errorMessage.includes('Auth session missing')) {
                  console.log('Session was already missing, treating as successful logout');
                  Alert.alert('Success', 'You have successfully signed out');
                } else {
                  Alert.alert('Error', `Failed to sign out: ${errorMessage}`);
                }
              } else {
                console.log('Successfully signed out');
                Alert.alert('Success', 'You have successfully signed out');
              }
            } catch (err) {
              console.error('Sign out exception:', err);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const getSubscriptionDisplayName = () => {
    const status = getSubscriptionStatus();
    switch (status) {
      case 'premium':
        return 'Premium';
      case 'pro':
        return 'Pro';
      default:
        return 'Free';
    }
  };

  const getSubscriptionColor = () => {
    const status = getSubscriptionStatus();
    switch (status) {
      case 'premium':
        return '#FFD700'; // Gold
      case 'pro':
        return '#FF6B6B'; // Red
      default:
        return '#666666'; // Gray
    }
  };

  const settingsGroups = [
    {
      title: 'Choose language',
      icon: '🌍',
      items: [
        {
          id: 'language',
          type: 'language-selector',
          languages: languages,
          selectedLanguage: selectedLanguage,
          onLanguageChange: updateLanguage
        }
      ]
    },
    {
      title: 'Account',
      icon: '👤',
      items: [
        {
          id: 'email',
          title: 'Email',
          subtitle: user?.email || 'Not specified',
          type: 'info'
        },
        {
          id: 'subscription',
          title: 'Subscription',
          subtitle: getSubscriptionDisplayName(),
          type: 'button',
          action: () => router.push('/subscription' as any),
          customColor: getSubscriptionColor(),
          buttonStyle: 'gradient'
        },
        ...(user ? [
          {
            id: 'restore',
            title: 'Restore Purchases',
            subtitle: restoreLoading ? 'Restoring...' : 'Restore your previous purchases',
            type: 'button',
            action: handleRestorePurchases,
            disabled: restoreLoading
          },
          {
            id: 'signout',
            title: 'Sign Out',
            subtitle: 'End current session',
            type: 'button',
            action: handleSignOut
          }
        ] : [
          {
            id: 'signin',
            title: 'Sign In to Account',
            subtitle: 'Authorize to save progress',
            type: 'button',
            action: () => router.push('/auth' as any),
            buttonStyle: 'gradient'
          }
        ])
      ]
    },
    {
      title: 'Support',
      icon: '❓',
      items: [
        {
          id: 'feedback',
          title: 'Send Feedback',
          subtitle: 'Contact us on Telegram',
          type: 'button',
          action: handleFeedbackPress
        }
      ]
    }
  ];

  return (
    <LinearGradient
      colors={['#1E0B37', '#2D1B69', '#1E0B37']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#7C3AED', '#8B5CF6', '#A855F7'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <Text style={styles.headerEmoji}>⚙️</Text>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSubtitle}>
              Customize your experience
            </Text>
          </LinearGradient>
        </View>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.settingsGroup}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupIcon}>{group.icon}</Text>
              <Text style={styles.groupTitle}>{group.title}</Text>
            </View>
            
            <LinearGradient
              colors={['#2D1B69', '#374151'] as const}
              style={styles.groupGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {group.items.map((item, itemIndex) => {
                if (item.type === 'language-selector' && 'languages' in item) {
                  return (
                    <View key={item.id} style={styles.languageSelectorContainer}>
                      <View style={styles.languageSelector}>
                        {item.languages.map((language) => (
                          <TouchableOpacity
                            key={language.code}
                            style={[
                              styles.languageOption,
                              item.selectedLanguage === language.code && styles.languageOptionSelected
                            ]}
                            onPress={() => item.onLanguageChange(language.code)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.languageFlag}>{language.flag}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  );
                } else if (item.type === 'button' && 'action' in item && 'title' in item && 'subtitle' in item) {
                  const isDisabled = 'disabled' in item && item.disabled;
                  
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.settingItem,
                        itemIndex < group.items.length - 1 && styles.settingItemBorder,
                        isDisabled && styles.settingItemDisabled
                      ]}
                      onPress={item.action}
                      disabled={isDisabled}
                      activeOpacity={0.8}
                    >
                      <View style={styles.settingContent}>
                        <Text style={[
                          styles.settingTitle,
                          item.id === 'signout' && styles.signOutTitle,
                          item.id === 'signin' && styles.signInTitle,
                          item.id === 'restore' && styles.restoreTitle
                        ]}>
                          {item.title}
                        </Text>
                        <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                      </View>
                      
                      <LinearGradient
                        colors={
                          item.id === 'signout' 
                            ? ['#EF4444', '#DC2626', '#B91C1C']
                            : item.id === 'signin'
                            ? ['#10B981', '#059669', '#047857']
                            : item.id === 'subscription'
                            ? ['#FFD700', '#FFA500', '#FF8C00']
                            : item.id === 'restore'
                            ? ['#3B82F6', '#2563EB', '#1D4ED8']
                            : ['#00BCD4', '#0097A7', '#006064']
                        }
                        style={[styles.settingButton, isDisabled && styles.settingButtonDisabled]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.settingButtonText}>
                          {item.id === 'signout' ? '🚪' : 
                           item.id === 'signin' ? '🔑' : 
                           item.id === 'subscription' ? '⭐' : 
                           item.id === 'restore' ? '🔄' : '💬'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                } else if (item.type === 'info' && 'title' in item && 'subtitle' in item) {
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.settingItem,
                        itemIndex < group.items.length - 1 && styles.settingItemBorder
                      ]}
                    >
                      <View style={styles.settingContent}>
                        <Text style={styles.settingTitle}>{item.title}</Text>
                        <Text style={[
                          styles.settingSubtitle,
                          'customColor' in item && item.customColor ? { color: item.customColor } : {}
                        ]}>
                          {item.subtitle}
                        </Text>
                      </View>
                    </View>
                  );
                }
                return null;
              })}
            </LinearGradient>
          </View>
        ))}

        {/* Spacer for bottom padding */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerGradient: {
    padding: 28,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  headerEmoji: {
    fontSize: 52,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
    fontWeight: '500',
  },
  settingsGroup: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  groupIcon: {
    fontSize: 26,
    marginRight: 14,
  },
  groupTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  groupGradient: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  settingItemDisabled: {
    opacity: 0.6,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  signOutTitle: {
    color: '#EF4444',
  },
  signInTitle: {
    color: '#10B981',
  },
  restoreTitle: {
    color: '#3B82F6',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  settingButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  settingButtonDisabled: {
    opacity: 0.5,
  },
  settingButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  languageSelectorContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  languageOption: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageOptionSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.4)',
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  languageFlag: {
    fontSize: 24,
  },
  bottomSpacer: {
    height: 120, // Збільшуємо відступ для таббару
  },
}); 