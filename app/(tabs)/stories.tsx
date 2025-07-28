import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function StoriesScreen() {
  const colorScheme = useColorScheme();

  const modes = [
    {
      id: 'ai-interactive',
      title: 'AI Interactive',
      description: 'Create unique stories with AI that adapts to your choices and learning level',
      emoji: '🤖',
      gradient: ['#8B5CF6', '#A855F7', '#C084FC'] as const,
      route: '/ai-mode',
      features: ['Adaptive AI', 'Personalized', 'Unlimited Stories']
    },
    {
      id: 'ready-stories',
      title: 'Ready Stories',
      description: 'Explore our curated collection of engaging stories for every level',
      emoji: '📚',
      gradient: ['#10B981', '#059669', '#047857'] as const,
      route: '/story-mode',
      features: ['Curated Content', 'Level-based', 'Quick Start']
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
            colors={['#6D28D9', '#7C3AED', '#8B5CF6'] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <Text style={styles.headerEmoji}>📖</Text>
            <Text style={styles.headerTitle}>Story Modes</Text>
            <Text style={styles.headerSubtitle}>
              Choose your learning adventure
            </Text>
          </LinearGradient>
        </View>

        {/* Mode Selection Cards */}
        <View style={styles.modesContainer}>
          {modes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={styles.modeCard}
              onPress={() => router.push(mode.route as any)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={mode.gradient}
                style={styles.modeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.modeHeader}>
                  <Text style={styles.modeEmoji}>{mode.emoji}</Text>
                  <Text style={styles.modeTitle}>{mode.title}</Text>
                </View>
                
                <Text style={styles.modeDescription}>
                  {mode.description}
                </Text>
                
                <View style={styles.featuresContainer}>
                  {mode.features.map((feature, index) => (
                    <View key={index} style={styles.featureTag}>
                      <Text style={styles.featureText}>✨ {feature}</Text>
                    </View>
                  ))}
                </View>
                
                <View style={styles.actionButton}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)'] as const}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>Get Started →</Text>
                  </LinearGradient>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <LinearGradient
            colors={['#2D1B69', '#374151'] as const}
            style={styles.statsGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statsTitle}>Learning Stats</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>1000+</Text>
                <Text style={styles.statLabel}>Stories Available</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>50+</Text>
                <Text style={styles.statLabel}>Topics Covered</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>24/7</Text>
                <Text style={styles.statLabel}>AI Availability</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
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
    paddingBottom: 20,
  },
  headerGradient: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textAlign: 'center',
    fontWeight: '500',
  },
  modesContainer: {
    paddingHorizontal: 20,
    gap: 20,
    marginBottom: 32,
  },
  modeCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modeGradient: {
    padding: 24,
    minHeight: 200,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modeEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  modeTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    flex: 1,
  },
  modeDescription: {
    fontSize: 16,
    color: '#E5E7EB',
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: '500',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  featureTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  featureText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  statsGradient: {
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
    fontWeight: '500',
  },
}); 