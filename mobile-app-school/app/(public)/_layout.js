import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Calendar, Info, Settings } from 'lucide-react-native';
import { useTheme } from '../../src/theme';

export default function PublicLayout() {
  const { theme } = useTheme();
  const T = theme;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: T.tabBar,
          borderTopWidth: 1,
          borderTopColor: T.border,
          height: 80,
          paddingBottom: 8,
          paddingTop: 12,
          paddingHorizontal: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: T.tabActive,
        tabBarInactiveTintColor: T.tabText,
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color }) => <Info size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
      {/* Hidden from tab bar */}
      <Tabs.Screen name="news"    options={{ href: null }} />
      <Tabs.Screen name="contact" options={{ href: null }} />
      <Tabs.Screen name="developer" options={{ href: null }} />
    </Tabs>
  );
}

