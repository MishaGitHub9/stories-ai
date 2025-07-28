import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { CircularTabButton } from '@/components/CircularTabButton';
import { CustomTabBarButton } from '@/components/CustomTabBarButton';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tabIconSelected,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].tabBarBackground,
          borderTopWidth: 0,
          height: 95,
          paddingBottom: Platform.select({
            ios: 30,
            android: 25,
          }),
          paddingTop: 15,
          ...Platform.select({
            ios: {
              position: 'absolute',
            },
            default: {},
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarItemStyle: {
          flex: 1,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="house.fill" 
              color={focused ? Colors[colorScheme ?? 'light'].tabIconSelected : color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="stories"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <CircularTabButton 
              focused={focused} 
            />
          ),
          tabBarButton: (props) => (
            <CustomTabBarButton 
              {...props} 
              onPress={() => router.push('/ai-mode')}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <IconSymbol 
              size={focused ? 26 : 24} 
              name="gearshape.fill" 
              color={focused ? Colors[colorScheme ?? 'light'].tabIconSelected : color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
