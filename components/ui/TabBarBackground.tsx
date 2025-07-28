import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function TabBarBackground() {
  const colorScheme = useColorScheme();
  
  return (
    <View 
      style={[
        StyleSheet.absoluteFill, 
        { backgroundColor: Colors[colorScheme ?? 'light'].tabBarBackground }
      ]} 
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
