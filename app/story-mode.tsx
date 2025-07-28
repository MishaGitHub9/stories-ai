import { LimitReachedModal } from '@/components/LimitReachedModal';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLimits } from '@/hooks/useLimits';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function StoryModeScreen() {
  const colorScheme = useColorScheme();
  const { limits, canPerformAction, incrementStoriesGenerated } = useLimits();
  const [showLimitModal, setShowLimitModal] = useState(false);

  const stories = [
    {
      id: 'coffee-shop',
      title: 'The Coffee Shop Mystery',
      level: 'Beginner',
      duration: '10-15 min',
      description: 'Help solve a mystery at a local coffee shop while practicing everyday English.',
      emoji: '☕',
      difficulty: 1,
    },
    {
      id: 'job-interview',
      title: 'The Perfect Interview',
      level: 'Intermediate',
      duration: '15-20 min',
      description: 'Navigate through a challenging job interview with multiple choice scenarios.',
      emoji: '💼',
      difficulty: 2,
    },
    {
      id: 'travel-adventure',
      title: 'Lost in London',
      level: 'Intermediate',
      duration: '20-25 min',
      description: 'Find your way through London while making friends and learning British English.',
      emoji: '🇬🇧',
      difficulty: 2,
    },
    {
      id: 'business-meeting',
      title: 'The Startup Pitch',
      level: 'Advanced',
      duration: '25-30 min',
      description: 'Present your startup idea to investors in this high-stakes business scenario.',
      emoji: '🚀',
      difficulty: 3,
    },
    {
      id: 'detective-case',
      title: 'The Missing Diamond',
      level: 'Advanced',
      duration: '30-35 min',
      description: 'Work as a detective to solve a complex theft case using advanced vocabulary.',
      emoji: '💎',
      difficulty: 3,
    },
  ];

  const handleStorySelect = async (storyId: string) => {
    // Перевіряємо, чи може користувач згенерувати історію
    if (!canPerformAction('generate_story')) {
      setShowLimitModal(true);
      return;
    }

    // Збільшуємо лічильник згенерованих історій ПЕРЕД переходом
    // оскільки це готові історії, які точно будуть запущені
    await incrementStoriesGenerated();

    router.push({
      pathname: '/story-play',
      params: { storyId }
    });
  };

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return '#4CAF50'; // Green
      case 2:
        return '#FF9800'; // Orange
      case 3:
        return '#F44336'; // Red
      default:
        return Colors[colorScheme ?? 'light'].icon;
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: "Ready Stories",
          headerStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
        }} 
      />
      <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            📚 Ready Stories
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].icon }]}>
            Choose from our curated collection of interactive stories
          </Text>
        </View>



        {/* Stories List */}
        <View style={styles.storiesContainer}>
          {stories.map((story) => (
            <TouchableOpacity
              key={story.id}
              style={[
                styles.storyCard,
                {
                  backgroundColor: Colors[colorScheme ?? 'light'].background,
                  borderColor: Colors[colorScheme ?? 'light'].icon + '40',
                }
              ]}
              onPress={() => handleStorySelect(story.id)}
              activeOpacity={0.8}
            >
              <View style={styles.storyHeader}>
                <View style={styles.storyTitleRow}>
                  <Text style={styles.storyEmoji}>{story.emoji}</Text>
                  <View style={styles.storyTitleContainer}>
                    <Text style={[styles.storyTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {story.title}
                    </Text>
                    <View style={styles.storyMeta}>
                      <View style={[
                        styles.levelBadge,
                        { backgroundColor: getDifficultyColor(story.difficulty) }
                      ]}>
                        <Text style={styles.levelText}>{story.level}</Text>
                      </View>
                      <Text style={[styles.duration, { color: Colors[colorScheme ?? 'light'].icon }]}>
                        {story.duration}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              
              <Text style={[styles.storyDescription, { color: Colors[colorScheme ?? 'light'].icon }]}>
                {story.description}
              </Text>

              <View style={[styles.playButton, { backgroundColor: Colors[colorScheme ?? 'light'].primaryPurple }]}>
                <Text style={[styles.playButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Start Story →
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

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
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  storiesContainer: {
    gap: 16,
    paddingBottom: 30,
  },
  storyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  storyHeader: {
    marginBottom: 12,
  },
  storyTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  storyEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  storyTitleContainer: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  storyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  duration: {
    fontSize: 12,
    fontWeight: '500',
  },
  storyDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  playButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

}); 