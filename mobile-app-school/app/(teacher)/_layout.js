import React from 'react';
import { Tabs } from 'expo-router';
import { LayoutDashboard, ClipboardCheck, GraduationCap, BookOpen, User, Calendar, School } from 'lucide-react-native';
import { useTheme } from '../../src/theme';
import { useGetExamHallsQuery, useGetSchoolFeaturesQuery } from '../../src/store/mobileApiSlice';
import { hasFeatureAccess } from '../../src/utils/featureAccess';

export default function TeacherLayout() {
  const { theme } = useTheme();
  const T = theme;

  const { data: halls } = useGetExamHallsQuery('teacher');
  const { data: features } = useGetSchoolFeaturesQuery();
  const enabledFeatures = features?.data || features || [];
  const hasHalls = halls && halls.length > 0;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: T.primary,
        tabBarInactiveTintColor: T.subText,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: T.border,
          height: 80,
          paddingBottom: 12,
          paddingTop: 12,
          paddingHorizontal: 8,
          backgroundColor: T.card,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="subjects"
        options={{
          title: 'Classes',
          tabBarIcon: ({ color, size }) => <BookOpen size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color, size }) => <ClipboardCheck size={24} color={color} />,
          headerShown: false,
          href: hasFeatureAccess(enabledFeatures, 'attendance') ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="marks"
        options={{
          title: 'Marks',
          tabBarIcon: ({ color, size }) => <GraduationCap size={24} color={color} />,
          headerShown: false,
          href: hasFeatureAccess(enabledFeatures, 'exams') ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="exam-halls"
        options={{
          title: 'Halls',
          tabBarIcon: ({ color, size }) => <School size={24} color={color} />,
          headerShown: false,
          href: hasHalls && hasFeatureAccess(enabledFeatures, 'exam-halls') ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color, size }) => <Calendar size={24} color={color} />,
          headerShown: false,
          href: hasFeatureAccess(enabledFeatures, 'schedules') ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={24} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="class-detail/[classId]"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="students/[classId]"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="students/[studentId]"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
