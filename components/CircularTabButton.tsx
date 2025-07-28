import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface CircularTabButtonProps {
  focused: boolean;
}

export const CircularTabButton: React.FC<CircularTabButtonProps> = ({ focused }) => {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={focused 
          ? ['#7C3AED', '#8B5CF6', '#A855F7'] as const
          : ['#6D28D9', '#7C3AED', '#8B5CF6'] as const
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.container,
          focused && styles.focusedContainer
        ]}
      >
        <View style={styles.innerRing}>
          <View style={styles.content}>
            <Text style={styles.emoji}>📚</Text>
            <Text style={[styles.mainText, { color: Colors[colorScheme ?? 'light'].text }]}>
              STORIES
            </Text>
          </View>
        </View>
      </LinearGradient>
      
      {/* Outer glow effect when focused */}
      {focused && (
        <View style={styles.glowRing} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  container: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  focusedContainer: {
    elevation: 16,
    shadowOpacity: 0.6,
    shadowRadius: 12,
    transform: [{ scale: 1.05 }],
  },
  innerRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  mainText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 95,
    height: 95,
    borderRadius: 47.5,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    top: -2.5,
    left: -2.5,
  },
}); 