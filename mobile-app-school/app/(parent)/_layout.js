import { Tabs } from 'expo-router';
import React from 'react';
import { useTheme } from '../../src/theme';
import { Home } from 'lucide-react-native';

export default function ParentLayout() {
  const { theme } = useTheme();
  const T = theme;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: T.primary,
        tabBarInactiveTintColor: T.subText,
        tabBarStyle: {
          backgroundColor: T.card,
          borderTopColor: T.border,
        },
        headerStyle: {
          backgroundColor: T.appBar,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '700',
        },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="[studentId]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
