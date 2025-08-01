import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface MagicLinkAuthScreenProps {
  onAuthSuccess?: () => void;
  onBack?: () => void;
}

export const MagicLinkAuthScreen: React.FC<MagicLinkAuthScreenProps> = ({ 
  onAuthSuccess, 
  onBack 
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const { sendMagicLink } = useAuth();

  const handleSendMagicLink = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Проста валідація email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await sendMagicLink(email);

      if (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send magic link');
      } else {
        setEmailSent(true);
        Alert.alert(
          'Magic Link Sent!', 
          'Please check your email and click the link to sign in.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setEmailSent(false);
    setEmail('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <ThemedView style={styles.content}>
            {onBack && (
              <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Ionicons name="arrow-back" size={24} color="#007AFF" />
              </TouchableOpacity>
            )}
            
            <View style={styles.header}>
              <ThemedText style={styles.title}>
                {emailSent ? 'Check Your Email' : 'Sign In'}
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                {emailSent 
                  ? 'We\'ve sent a magic link to your email'
                  : 'Enter your email to receive a magic link'
                }
              </ThemedText>
            </View>

            {!emailSent ? (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.primaryButton,
                    loading && styles.buttonDisabled
                  ]}
                  onPress={handleSendMagicLink}
                  disabled={loading}
                >
                  <ThemedText style={styles.buttonText}>
                    {loading ? 'Sending...' : 'Send Magic Link'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emailSentContainer}>
                <View style={styles.emailIconContainer}>
                  <Ionicons name="mail" size={48} color="#007AFF" />
                </View>
                
                <ThemedText style={styles.emailSentText}>
                  We've sent a magic link to:
                </ThemedText>
                <ThemedText style={styles.emailAddress}>
                  {email}
                </ThemedText>
                
                <ThemedText style={styles.emailSentInstructions}>
                  Click the link in your email to sign in to your account.
                </ThemedText>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleBackToLogin}
                >
                  <ThemedText style={styles.secondaryButtonText}>
                    Try Different Email
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 80,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginBottom: 32,
  },
  emailSentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailIconContainer: {
    marginBottom: 24,
  },
  emailSentText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emailAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  emailSentInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
}); 