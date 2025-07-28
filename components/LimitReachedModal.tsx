import { useColorScheme } from '@/hooks/useColorScheme';
import { useLimits } from '@/hooks/useLimits';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface LimitReachedModalProps {
  visible: boolean;
  onClose: () => void;
  limitType: 'stories' | 'messages';
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const LimitReachedModal: React.FC<LimitReachedModalProps> = ({
  visible,
  onClose,
  limitType,
}) => {
  const colorScheme = useColorScheme();
  const { limits } = useLimits();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim, slideAnim]);

  const getTitle = () => {
    if (limitType === 'stories') {
      return limits.isAnonymous ? 'Daily Stories Limit Reached!' : 'Daily Stories Limit Reached!';
    }
    return limits.isAnonymous ? 'Daily Messages Limit Reached!' : 'Daily Messages Limit Reached!';
  };

  const getDescription = () => {
    if (limitType === 'stories') {
      return limits.isAnonymous 
        ? 'You\'ve used all 3 free stories for today. Create an account to get unlimited stories with a 3-day free trial!'
        : 'You\'ve used all 3 free stories for today. Upgrade to premium for unlimited stories!';
    }
    return limits.isAnonymous
      ? 'You\'ve used all 20 free messages for today. Create an account to get unlimited messages with a 3-day free trial!'
      : 'You\'ve used all 20 free messages for today. Upgrade to premium for unlimited messages!';
  };

  const getUpgradeButtonText = () => {
    return limits.isAnonymous ? 'Create Account & Start Trial' : 'Upgrade to Premium';
  };

  const handleUpgrade = () => {
    onClose();
    if (limits.isAnonymous) {
      router.push('/auth');
    } else {
      router.push('/subscription');
    }
  };

  const features = [
    '✨ Unlimited stories',
    '💬 Unlimited messages',
    '🌍 Translation features',
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={['#8B5CF6', '#A855F7', '#C084FC']}
            style={styles.gradientBackground}
          />
          
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Text style={styles.limitIcon}>
                  {limitType === 'stories' ? '📚' : '💬'}
                </Text>
              </View>
              <Text style={styles.title}>{getTitle()}</Text>
              <Text style={styles.description}>{getDescription()}</Text>
            </View>

            {/* Features */}
            <View style={styles.featuresContainer}>
              <Text style={styles.featuresTitle}>Premium Features:</Text>
              <ScrollView style={styles.featuresList} showsVerticalScrollIndicator={false}>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Trial Info */}
            {limits.isAnonymous && (
              <View style={styles.trialContainer}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                  style={styles.trialGradient}
                >
                  <Text style={styles.trialText}>
                    🎉 3-Day Free Trial • Cancel anytime
                  </Text>
                </LinearGradient>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.upgradeButton}
                onPress={handleUpgrade}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FFF', '#F8F9FA']}
                  style={styles.upgradeGradient}
                >
                  <Text style={styles.upgradeButtonText}>
                    {getUpgradeButtonText()}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: screenWidth * 0.9,
    maxWidth: 400,
    maxHeight: screenHeight * 0.7,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  limitIcon: {
    fontSize: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 28,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  featuresList: {
    maxHeight: 80,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  trialContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  trialGradient: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  trialText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
  upgradeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  upgradeGradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
}); 