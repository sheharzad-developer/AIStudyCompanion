import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Design } from '@/constants/theme';

// Start the tab navigator on Home (expo-router 58 replaced the initialRouteName prop).
export const unstable_settings = {
  anchor: 'dashboard',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Design.color.primary,
        tabBarInactiveTintColor: Design.color.subtle,
        tabBarStyle: {
          backgroundColor: Design.color.surface,
          borderTopColor: Design.color.border,
          borderTopWidth: 1,
          height: 82,
          paddingBottom: 16,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '800',
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="sparkles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tutor',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.closed.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Guide',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.crop.circle.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
