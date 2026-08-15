import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ChevronLeft,
  ClipboardCheck,
  GraduationCap,
  Users,
  Calendar,
  BookOpen,
  Clock,
  LayoutGrid
} from 'lucide-react-native';
import { useTheme } from '../../../src/theme';
import { useGetStudentsInClassQuery } from '../../../src/store/mobileApiSlice';

const ClassDetail = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const T = theme;

  const { classId, className, section, subjectId, subjectName } = params;

  // Fetch students to show correct count
  const { data: students, isLoading: studentsLoading } = useGetStudentsInClassQuery(classId, {
    skip: !classId
  });

  const actionButtons = [
    {
      icon: ClipboardCheck,
      title: 'Take Attendance',
      subtitle: 'Mark student attendance',
      color: '#10B981',
      bg: '#ECFDF5',
      route: '/(teacher)/attendance',
      params: { classId, className, section, subjectId, subjectName }
    },
    {
      icon: GraduationCap,
      title: 'Enter Marks',
      subtitle: 'Input exam scores',
      color: '#4F46E5',
      bg: '#EEF2FF',
      route: '/(teacher)/marks',
      params: { classId, className, section, subjectId, subjectName }
    },
    {
      icon: Users,
      title: 'View Students',
      subtitle: 'See class roster',
      color: '#F59E0B',
      bg: '#FFFBEB',
      route: '/(teacher)/students/[classId]',
      params: { classId, className, section }
    },
    {
      icon: Calendar,
      title: 'View Schedule',
      subtitle: 'Class timetable',
      color: '#EF4444',
      bg: '#FEF2F2',
      route: '/(teacher)/schedule'
    }
  ];

  const handleActionPress = (action) => {
    if (action.route.includes('[classId]')) {
      router.push({
        pathname: action.route,
        params: action.params
      });
    } else if (action.params) {
      // For attendance and marks, pass params
      router.push({
        pathname: action.route,
        params: action.params
      });
    } else {
      router.push(action.route);
    }
  };

  if (studentsLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: T.bg }]}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={T.primary} />
      
      {/* Header */}
      <View style={[styles.appBar, { backgroundColor: T.primary }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={26} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.appBarTitle}>{className || 'Class Detail'}</Text>
          <Text style={styles.appBarSubtitle}>Section {section || 'N/A'} {subjectName ? `• ${subjectName}` : ''}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Class Info Card */}
        <View style={[styles.heroCard, { backgroundColor: T.primary }]}>
          <View style={[styles.heroIconBox, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
            <LayoutGrid size={28} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>{className} - Section {section}</Text>
            <Text style={styles.heroSub}>{students?.length || 0} Students Enrolled</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: T.text }]}>Quick Actions</Text>
        
        <View style={styles.actionsGrid}>
          {actionButtons.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { backgroundColor: T.card, borderColor: T.border }]}
              onPress={() => handleActionPress(action)}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIcon, { backgroundColor: T.dark ? action.color + '22' : action.bg }]}>
                <action.icon size={28} color={action.color} />
              </View>
              <Text style={[styles.actionTitle, { color: T.text }]}>{action.title}</Text>
              <Text style={[styles.actionSubtitle, { color: T.subText }]}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Class Information */}
        <View style={[styles.infoCard, { backgroundColor: T.card, borderColor: T.border }]}>
          <View style={styles.infoHeader}>
            <Clock size={20} color={T.primary} />
            <Text style={[styles.infoTitle, { color: T.text }]}>Class Information</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: T.subText }]}>Class Name</Text>
            <Text style={[styles.infoValue, { color: T.text }]}>{className || 'N/A'}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: T.subText }]}>Section</Text>
            <Text style={[styles.infoValue, { color: T.text }]}>{section || 'N/A'}</Text>
          </View>
          {subjectName && (
            <>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: T.subText }]}>Subject</Text>
                <Text style={[styles.infoValue, { color: T.text }]}>{subjectName}</Text>
              </View>
            </>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBar: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  appBarSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  scroll: {
    padding: 20,
  },
  heroCard: {
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  heroIconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  infoCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  infoDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});

export default ClassDetail;
