import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { GraduationCap, Calendar, ClipboardCheck, FileText, CreditCard, Clock } from 'lucide-react-native';
import { useGetChildProfileQuery } from '../../../src/store/mobileApiSlice';

const ChildOverview = () => {
  const router = useRouter();
  const { studentId } = useLocalSearchParams();
  const { theme } = useTheme();
  const { data: profileData, isLoading, error } = useGetChildProfileQuery(studentId);
  const T = theme;

  const profile = profileData?.data;

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: T.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: T.text }]}>Failed to load student profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  const quickActions = [
    {
      title: 'Attendance',
      desc: 'View attendance records',
      icon: ClipboardCheck,
      color: '#007AFF',
      bg: '#E3F2FD',
      route: 'attendance',
    },
    {
      title: 'Results',
      desc: 'View exam results',
      icon: FileText,
      color: '#34C759',
      bg: '#E8F5E9',
      route: 'results',
    },
    {
      title: 'Timetable',
      desc: 'View class schedule',
      icon: Clock,
      color: '#FF9500',
      bg: '#FFF3E0',
      route: 'timetable',
    },
    {
      title: 'Fees',
      desc: 'View payment history',
      icon: CreditCard,
      color: '#AF52DE',
      bg: '#F3E5F5',
      route: 'payments',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.profileCard, { backgroundColor: T.card, borderColor: T.border }]}>
          <View style={styles.profileIconWrapper}>
            <GraduationCap size={48} color={T.primary} />
          </View>
          <Text style={[styles.studentName, { color: T.text }]}>{profile?.name}</Text>
          <Text style={[styles.studentClass, { color: T.subText }]}>
            {profile?.class ? `${profile.class.name} ${profile.class.section}` : 'Class not assigned'}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: T.text }]}>Quick Actions</Text>

        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { backgroundColor: T.card, borderColor: T.border }]}
              onPress={() => router.push(`/(parent)/${studentId}/${action.route}`)}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: action.bg }]}>
                <action.icon size={32} color={action.color} />
              </View>
              <Text style={[styles.actionTitle, { color: T.text }]}>{action.title}</Text>
              <Text style={[styles.actionDesc, { color: T.subText }]}>{action.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  profileCard: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 30,
  },
  profileIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  studentClass: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
  },
  actionIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDesc: {
    fontSize: 12,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ChildOverview;
