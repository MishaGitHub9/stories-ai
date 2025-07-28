import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function StoryPlayScreen() {
  const colorScheme = useColorScheme();
  const { storyId } = useLocalSearchParams<{ storyId: string }>();

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: "Story Experience",
          headerStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
          headerTintColor: Colors[colorScheme ?? 'light'].text,
        }} 
      />
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Story Experience
        </Text>
        <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].icon }]}>
          Story ID: {storyId}
        </Text>
        <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].icon }]}>
          Ready story interaction will be implemented here
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
}); 