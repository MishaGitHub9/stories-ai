import { LimitReachedModal } from '@/components/LimitReachedModal';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLimits } from '@/hooks/useLimits';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function AIModeScreen() {
  const colorScheme = useColorScheme();
  const { limits, canPerformAction, incrementStoriesGenerated } = useLimits();
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [showLimitModal, setShowLimitModal] = useState(false);

  const topics = [
    { id: 'travel', title: 'Travel & Adventure', emoji: '✈️', gradient: ['#8B5CF6', '#A855F7'] as const },
    { id: 'business', title: 'Business & Work', emoji: '💼', gradient: ['#A855F7', '#C084FC'] as const },
    { id: 'daily', title: 'Daily Life', emoji: '🏠', gradient: ['#7C3AED', '#8B5CF6'] as const },
    { id: 'romance', title: 'Romance & Relationships', emoji: '💕', gradient: ['#C084FC', '#DDD6FE'] as const },
    { id: 'mystery', title: 'Mystery & Detective', emoji: '🔍', gradient: ['#6D28D9', '#7C3AED'] as const },
    { id: 'fantasy', title: 'Fantasy & Magic', emoji: '🧙‍♂️', gradient: ['#5B21B6', '#6D28D9'] as const },
  ];

  const levels = [
    { 
      id: 'beginner', 
      title: 'Beginner', 
      description: 'Simple vocabulary and grammar',
      icon: '🌱',
      gradient: ['#10B981', '#059669'] as const
    },
    { 
      id: 'intermediate', 
      title: 'Intermediate', 
      description: 'Moderate complexity and idioms',
      icon: '🚀',
      gradient: ['#F59E0B', '#D97706'] as const
    },
    { 
      id: 'advanced', 
      title: 'Advanced', 
      description: 'Complex structures and native expressions',
      icon: '⭐',
      gradient: ['#EF4444', '#DC2626'] as const
    },
  ];

  const handleStartStory = async () => {
    if (selectedTopic && selectedLevel) {
      // Перевіряємо, чи може користувач згенерувати історію
      if (!canPerformAction('generate_story')) {
        setShowLimitModal(true);
        return;
      }

      // Збільшуємо лічильник згенерованих історій ПЕРЕД переходом
      // оскільки користувач вже вибрав тему та рівень
      await incrementStoriesGenerated();

      console.log(`Starting AI story: ${selectedTopic} - ${selectedLevel}`);
      router.push({
        pathname: '/ai-story',
        params: { topic: selectedTopic, level: selectedLevel }
      });
    }
  };

  // Custom header with back arrow and title
  const renderCustomHeader = () => (
    <View style={styles.customHeaderContainer}>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.backButton,
          pressed && { opacity: 0.6 }
        ]}
        hitSlop={10}
      >
        <View style={styles.backButtonIconWrapper}>
          <Ionicons
            name="arrow-back"
            size={28}
            color={Colors[colorScheme ?? 'light'].text}
          />
        </View>
      </Pressable>
      <Text style={styles.customHeaderTitle}>AI Interactive Mode</Text>
      {/* Spacer for symmetry */}
      <View style={{ width: 28, alignItems: 'center', justifyContent: 'center' }}>
        {/* Instead of a raw View, use an empty Text for proper rendering */}
        <Text>{' '}</Text>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false, // Hide default header to use custom one
        }} 
      />
      <LinearGradient
        colors={['#1E0B37', '#2D1B69', '#1E0B37']}
        style={styles.container}
      >
        {/* Custom Header */}
        {renderCustomHeader()}

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Modern Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#8B5CF6', '#A855F7', '#C084FC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <Text style={styles.headerEmoji}>🤖</Text>
                <Text style={styles.title}>AI Interactive Stories</Text>
                <Text style={styles.subtitle}>
                  Personalized conversations powered by AI
                </Text>
              </View>
            </LinearGradient>
          </View>



          {/* Topic Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Choose Your Adventure</Text>
              <Text style={styles.sectionSubtitle}>Select a topic that interests you</Text>
            </View>
            
            <View style={styles.topicsGrid}>
              {topics.map((topic, index) => (
                <TouchableOpacity
                  key={topic.id}
                  style={[
                    styles.topicCard,
                    selectedTopic === topic.id && styles.selectedCard
                  ]}
                  onPress={() => setSelectedTopic(topic.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={selectedTopic === topic.id ? topic.gradient : ['#2D1B69', '#374151'] as const}
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.topicEmoji}>{topic.emoji}</Text>
                    <Text style={[
                      styles.topicTitle,
                      { color: selectedTopic === topic.id ? '#FFFFFF' : Colors[colorScheme ?? 'light'].text }
                    ]}>
                      {topic.title}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Level Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Choose Your Level</Text>
              <Text style={styles.sectionSubtitle}>Pick the right difficulty for you</Text>
            </View>
            
            <View style={styles.levelsContainer}>
              {levels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.levelCard,
                    selectedLevel === level.id && styles.selectedLevelCard
                  ]}
                  onPress={() => setSelectedLevel(level.id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={selectedLevel === level.id ? level.gradient : ['#2D1B69', '#374151'] as const}
                    style={styles.levelGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.levelHeader}>
                      <Text style={styles.levelIcon}>{level.icon}</Text>
                      <Text style={[
                        styles.levelTitle,
                        { color: selectedLevel === level.id ? '#FFFFFF' : Colors[colorScheme ?? 'light'].text }
                      ]}>
                        {level.title}
                      </Text>
                    </View>
                    <Text style={[
                      styles.levelDescription,
                      { color: selectedLevel === level.id ? '#FFFFFF' : Colors[colorScheme ?? 'light'].icon }
                    ]}>
                      {level.description}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Modern Start Button */}
          <View style={styles.startButtonContainer}>
            <TouchableOpacity
              style={[
                styles.startButton,
                { opacity: selectedTopic && selectedLevel ? 1 : 0.5 }
              ]}
              onPress={handleStartStory}
              disabled={!selectedTopic || !selectedLevel}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={selectedTopic && selectedLevel ? 
                  ['#8B5CF6', '#A855F7', '#C084FC'] : 
                  ['#4B5563', '#6B7280']
                }
                style={styles.startButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.startButtonText}>
                  {selectedTopic && selectedLevel ? '🚀 Start Your Journey' : '✨ Select Topic & Level'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Limit Reached Modal */}
      <LimitReachedModal
        visible={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        limitType="stories"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  // Increase padding and size for backButton to avoid clipping the arrow
  backButton: {
    padding: 8,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    overflow: 'visible',
  },
  // Add a wrapper to ensure the icon is centered and not clipped
  backButtonIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    overflow: 'visible',
  },
  customHeaderTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  headerGradient: {
    width: '100%',
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 64,
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    color: '#E5E7EB',
    fontWeight: '500',
  },

  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  topicCard: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedCard: {
    transform: [{ scale: 1.02 }],
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  cardGradient: {
    width: '100%',
    height: 120,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
  },
  levelsContainer: {
    gap: 16,
  },
  levelCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedLevelCard: {
    transform: [{ scale: 1.02 }],
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  levelGradient: {
    width: '100%',
    height: 120,
    padding: 20,
    justifyContent: 'space-between',
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  levelDescription: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  startButtonContainer: {
    paddingHorizontal: 20,
    marginVertical: 24,
    marginBottom: 40,
  },
  startButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
}); 