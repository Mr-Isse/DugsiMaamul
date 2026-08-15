import { Tabs, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { useTheme } from '../../../src/theme';
import { Home, Calendar, ClipboardCheck, FileText, CreditCard, Clock } from 'lucide-react-native';

export default function ChildDetailLayout() {
  const { theme } = useTheme();
  const { studentId } = useLocalSearchParams();
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
          title: 'Overview',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color, size }) => <ClipboardCheck color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: 'Results',
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="timetable"
        options={{
          title: 'Timetable',
          tabBarIcon: ({ color, size }) => <Clock color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Fees',
          tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
