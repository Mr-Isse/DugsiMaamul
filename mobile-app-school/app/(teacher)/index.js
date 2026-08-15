import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { 
  useGetTeacherDashboardStatsQuery, 
  useGetTeacherProfileQuery, 
  useGetTeacherScheduleQuery,
  useGetAssignedClassesQuery,
  useGetTaughtSubjectsQuery
} from '../../src/store/mobileApiSlice';
import { 
  Users, 
  BookOpen, 
  ClipboardCheck, 
  GraduationCap, 
  ChevronRight, 
  Bell,
  Calendar,
  Users as UsersIcon,
  Clock
} from 'lucide-react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from '../../src/theme';

const { width } = Dimensions.get('window');

const Dashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: stats, isLoading: statsLoading, error: statsError } = useGetTeacherDashboardStatsQuery();
  const { data: profile, isLoading: profileLoading } = useGetTeacherProfileQuery();
  const { data: scheduleData, isLoading: scheduleLoading } = useGetTeacherScheduleQuery();
  const { data: classes, isLoading: classesLoading } = useGetAssignedClassesQuery();
  const { data: subjects, isLoading: subjectsLoading } = useGetTaughtSubjectsQuery();
  const router = useRouter();
  const { theme } = useTheme();
  const T = theme;

  // Calculate stats from classes/subjects if stats API fails
  const calculatedStats = React.useMemo(() => {
    if (classes && subjects) {
      const uniqueClasses = [...new Set(classes.map(c => c._id))];
      
      return {
        totalClasses: uniqueClasses.length,
        totalSubjects: subjects.length,
        studentsCount: stats?.studentsCount || 0,
        assignedClasses: classes.map(c => ({
          _id: c._id,
          className: c.name,
          section: c.section
        })),
        assignedSubjects: subjects.map(s => ({
          _id: s._id,
          name: s.name,
          code: s.code,
          classId: s.class?._id,
          className: s.class?.name,
          section: s.class?.section
        })),
        schedule: [] // Will be populated from scheduleData
      };
    }
    return null;
  }, [classes, subjects, stats]);

  // Use stats from API, fallback to calculated
  const displayStats = stats || calculatedStats || { 
    totalClasses: 0, 
    totalSubjects: 0, 
    studentsCount: 0,
    assignedClasses: [],
    assignedSubjects: [],
    schedule: []
  };

  // Use schedule from stats API (today's schedule) or fallback to all schedule data
  const displaySchedule = displayStats.schedule || scheduleData || [];

  if (statsLoading || profileLoading || scheduleLoading || classesLoading || subjectsLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: T.bg }]}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }

  const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
  const todaySchedule = displaySchedule
    .filter(s => s.day === today)
    .sort((a, b) => (a.start || a.startTime || '').localeCompare(b.start || b.startTime || ''));

  const classColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899'];

  const summaryCards = [
    { 
      title: 'Schedule', 
      value: 'View', 
      icon: Calendar, 
      color: '#4F46E5', 
      bg: '#EEF2FF',
      route: '/(teacher)/schedule'
    },
    { 
      title: 'Classes', 
      value: displayStats?.totalClasses || 0, 
      icon: BookOpen, 
      color: '#10B981', 
      bg: '#ECFDF5',
      route: '/(teacher)/subjects'
    },
    { 
      title: 'Attendance', 
      value: 'Mark', 
      icon: ClipboardCheck, 
      color: '#F59E0B', 
      bg: '#FFFBEB',
      route: '/(teacher)/attendance'
    },
    { 
      title: 'Marks', 
      value: 'Entry', 
      icon: GraduationCap, 
      color: '#EF4444', 
      bg: '#FEF2F2',
      route: '/(teacher)/marks'
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: T.card }]}>
          <View>
            <Text style={[styles.welcomeText, { color: T.subText }]}>Welcome back,</Text>
            <Text style={[styles.userName, { color: T.text }]}>{profile?.name}</Text>
          </View>
          <TouchableOpacity style={[styles.notificationBtn, { backgroundColor: T.input }]}>
            <Bell size={24} color={T.text} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: T.primary }]}>
          <View style={styles.profileInfo}>
            <View style={[styles.avatar, { backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.4)' }]}>
              <Text style={styles.avatarText}>{profile?.name?.charAt(0) || 'T'}</Text>
            </View>
            <View style={styles.profileDetails}>
              <Text style={styles.profileId}>ID: {profile?.customId || 'N/A'}</Text>
              <Text style={styles.profileRole}>
                {profile?.subjects && profile.subjects.length > 0 
                  ? profile.subjects[0].name 
                  : 'Assigned Teacher'}
              </Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{displayStats?.totalClasses || 0}</Text>
              <Text style={styles.statLabel}>Classes</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{displayStats?.totalSubjects || 0}</Text>
              <Text style={styles.statLabel}>Subjects</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{displayStats?.studentsCount || 0}</Text>
              <Text style={styles.statLabel}>Students</Text>
            </View>
          </View>
        </View>

        {/* Working Hours & Phone Info */}
        {(profile?.phone || profile?.workingStartTime || profile?.teacherAge) && (
          <View style={[styles.infoCard, { backgroundColor: T.card, borderColor: T.border }]}>
            <View style={styles.infoCardHeader}>
              <Clock size={18} color={T.primary} />
              <Text style={[styles.infoCardTitle, { color: T.text }]}>Teacher Information</Text>
            </View>
            <View style={styles.infoGrid}>
              {profile?.phone && (
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: T.subText }]}>Phone</Text>
                  <Text style={[styles.infoValue, { color: T.text }]}>{profile.phone}</Text>
                </View>
              )}
              {(profile?.workingStartTime || profile?.workingEndTime) && (
                <>
                  {profile?.phone && <View style={styles.infoDivider} />}
                  <View style={styles.infoItem}>
                    <Text style={[styles.infoLabel, { color: T.subText }]}>Working Hours</Text>
                    <Text style={[styles.infoValue, { color: T.text }]}>
                      {profile.workingStartTime || 'N/A'} - {profile.workingEndTime || 'N/A'}
                    </Text>
                  </View>
                </>
              )}
              {profile?.teacherAge && (
                <>
                  {(profile?.phone || profile?.workingStartTime) && <View style={styles.infoDivider} />}
                  <View style={styles.infoItem}>
                    <Text style={[styles.infoLabel, { color: T.subText }]}>Age</Text>
                    <Text style={[styles.infoValue, { color: T.text }]}>{profile.teacherAge} years</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Your Classes Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: T.text }]}>Your Classes</Text>
          <TouchableOpacity onPress={() => router.push('/(teacher)/subjects')}>
            <Text style={[styles.seeAll, { color: T.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.classesScroll}
        >
          {classesLoading || subjectsLoading ? (
            // Loading skeletons
            [1, 2, 3].map((i) => (
              <View key={i} style={[styles.classCard, { backgroundColor: T.card, borderColor: T.border }]}>
                <View style={[styles.classCardIcon, { backgroundColor: T.input }]} />
                <View style={[styles.skeletonLine, { backgroundColor: T.input, width: 80 }]} />
                <View style={[styles.skeletonLine, { backgroundColor: T.input, width: 60 }]} />
              </View>
            ))
          ) : classes && classes.length > 0 ? (
            // Grouped Classes
            classes?.map((cls, idx) => {
              const classSubjects = subjects?.filter(s => s.class?._id === cls._id || s.class === cls._id) || [];
              const subjectNames = classSubjects.map(s => s.name).join(', ');
              const subjectIds = classSubjects.map(s => s._id).join(',');
              
              return (
                <TouchableOpacity
                  key={cls._id}
                  style={[styles.classCard, { backgroundColor: T.card, borderColor: T.border }]}
                  onPress={() => router.push({
                    pathname: '/(teacher)/subjects',
                    params: { 
                      initialClassId: cls._id
                    }
                  })}
                >
                  <View style={[styles.classCardIcon, { backgroundColor: classColors[idx % classColors.length] }]}>
                    <BookOpen size={24} color="#fff" />
                  </View>
                  <Text style={[styles.classCardName, { color: T.text }]}>{cls.name}</Text>
                  <Text 
                    style={[styles.classCardSubject, { color: T.subText }]} 
                    numberOfLines={1}
                  >
                    {subjectNames || 'No subjects'}
                  </Text>
                  <Text style={[styles.classCardSection, { color: T.subText }]}>Section {cls.section}</Text>
                </TouchableOpacity>
              );
            })
          ) : (
            // Empty state
            <View style={[styles.emptyState, { backgroundColor: T.card, borderColor: T.border }]}>
              <BookOpen size={32} color={T.subText} />
              <Text style={[styles.emptyStateText, { color: T.subText }]}>No classes assigned yet</Text>
              <Text style={[styles.emptyStateSubtext, { color: T.subText }]}>Contact your administrator</Text>
            </View>
          )}
        </ScrollView>

        {/* Quick Actions Grid */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: T.text }]}>Quick Actions</Text>
        </View>
        <View style={styles.grid}>
          {summaryCards.map((card, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.gridCard, { backgroundColor: T.dark ? card.color + '22' : card.bg }]}
              onPress={() => router.push(card.route)}
            >
              <View style={[styles.iconContainer, { backgroundColor: T.card }]}>
                <card.icon size={24} color={card.color} />
              </View>
              <Text style={[styles.cardValue, { color: card.color }]}>{card.value}</Text>
              <Text style={[styles.cardTitle, { color: T.subText }]}>{card.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity / Schedule */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: T.text }]}>Today's Schedule</Text>
          <TouchableOpacity onPress={() => router.push('/(teacher)/schedule')}>
            <Text style={[styles.seeAll, { color: T.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.scheduleContainer}>
          {scheduleLoading ? (
            // Loading skeletons for schedule
            [1, 2].map((i) => (
              <View key={i} style={[styles.scheduleItem, { backgroundColor: T.card, borderColor: T.border }]}>
                <View style={[styles.scheduleTime, { borderLeftColor: T.input }]}>
                  <View style={[styles.skeletonLine, { backgroundColor: T.input, width: 50 }]} />
                  <View style={[styles.skeletonLine, { backgroundColor: T.input, width: 40, marginTop: 4 }]} />
                </View>
                <View style={styles.scheduleContent}>
                  <View style={[styles.skeletonLine, { backgroundColor: T.input, width: 120 }]} />
                  <View style={[styles.skeletonLine, { backgroundColor: T.input, width: 80, marginTop: 6 }]} />
                </View>
              </View>
            ))
          ) : todaySchedule.length === 0 ? (
            <View style={[styles.emptySchedule, { backgroundColor: T.card, borderColor: T.border }]}>
              <Calendar size={32} color={T.subText} />
              <Text style={[styles.emptyScheduleText, { color: T.subText }]}>No teaching sessions today</Text>
              <Text style={[styles.emptyScheduleSubtext, { color: T.subText }]}>Today is {today}</Text>
            </View>
          ) : (
            todaySchedule.map((item, idx) => (
              <View key={idx} style={[styles.scheduleItem, { backgroundColor: T.card, borderColor: T.border }]}>
                <View style={[styles.scheduleTime, { borderLeftColor: item.color || T.primary }]}>
                  <Text style={[styles.timeText, { color: T.text }]}>{item.start || item.startTime}</Text>
                  <Text style={[styles.durationText, { color: T.subText }]}>{item.end || item.endTime}</Text>
                </View>
                <View style={styles.scheduleContent}>
                  <Text style={[styles.subjectText, { color: T.text }]}>{item.subject}</Text>
                  <Text style={[styles.classText, { color: T.subText }]}>{item.class}</Text>
                </View>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: T.input }]} onPress={() => router.push('/(teacher)/schedule')}>
                  <ChevronRight size={20} color={T.subText} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  notificationBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileCard: {
    margin: 24,
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  profileDetails: {
    marginLeft: 16,
  },
  profileId: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  profileRole: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: (width - 64) / 2,
    marginHorizontal: 8,
    marginBottom: 16,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
  },
  classesScroll: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  classCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  classCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  classCardName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  classCardSubject: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  classCardSection: {
    fontSize: 11,
    fontWeight: '500',
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  emptyState: {
    width: 200,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  scheduleContainer: {
    paddingHorizontal: 24,
  },
  scheduleItem: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  scheduleTime: {
    paddingLeft: 12,
    borderLeftWidth: 4,
    width: 80,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  durationText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  scheduleContent: {
    flex: 1,
    marginLeft: 16,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '700',
  },
  classText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySchedule: {
    padding: 40,
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyScheduleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyScheduleSubtext: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  infoCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  infoDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
});

export default Dashboard;

