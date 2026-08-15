import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { 
  useGetStudentProfileQuery, 
  useGetStudentClassQuery,
  useGetStudentDashboardStatsQuery
} from '../../src/store/mobileApiSlice';
import { 
  BookOpen, 
  Calendar, 
  ClipboardCheck, 
  CreditCard, 
  GraduationCap, 
  Trophy,
  Bell,
  ChevronRight,
  Clock,
  User,
  FileText,
  Wallet,
  Users as UsersIcon
} from 'lucide-react-native';
import { useTheme } from '../../src/theme';

const { width } = Dimensions.get('window');

const StudentHome = () => {
  const router = useRouter();
  const { userInfo } = useSelector((state) => state.auth);
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useGetStudentProfileQuery();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useGetStudentDashboardStatsQuery();
  const { theme } = useTheme();
  const T = theme;

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchStats()]);
    setRefreshing(false);
  }, []);

  if (profileLoading || statsLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: T.bg }]}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }

  // Handle errors (e.g., student not assigned to a class)
  const dashboardStats = stats || {};
  const studentProfile = profile || {};

  // Calculate attendance percentage
  const attendancePercentage = dashboardStats?.attendance?.percentage || 0;
  const feesPaid = dashboardStats?.fees?.paid || 0;
  const feesRemaining = dashboardStats?.fees?.remaining || 0;
  const className = dashboardStats?.className || studentProfile?.class?.name || 'Not Assigned';
  const section = dashboardStats?.section || studentProfile?.class?.section || 'N/A';
  const monthlyFee = dashboardStats?.monthlyFee || studentProfile?.monthlyFees || studentProfile?.class?.monthlyFees || 0;

  const academicServices = [
    { 
      title: 'Exams', 
      desc: 'Examination Info',
      icon: FileText, 
      color: '#0EA5E9', 
      bg: '#F0F9FF',
      route: '/(student)/results'
    },
    { 
      title: 'Finance', 
      desc: 'Financial Statements',
      icon: Wallet, 
      color: '#10B981', 
      bg: '#ECFDF5',
      route: '/(student)/payments'
    },
    { 
      title: 'Attendance', 
      desc: 'Attendance Records',
      icon: UsersIcon, 
      color: '#F59E0B', 
      bg: '#FFFBEB',
      route: '/(student)/attendance'
    },
    { 
      title: 'Schedule', 
      desc: 'Class Timetable',
      icon: Clock, 
      color: '#6366F1', 
      bg: '#EEF2FF',
      route: '/(student)/timetable'
    },
    { 
      title: 'Profile', 
      desc: 'Personal Info',
      icon: User, 
      color: '#10B981', 
      bg: '#ECFDF5',
      route: '/(student)/profile'
    },
  ];

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: '2-digit', 
    year: 'numeric' 
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
      <StatusBar barStyle={T.dark ? 'light-content' : 'light-content'} backgroundColor={T.appBar} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: T.appBar }]}>
        <Text style={styles.headerTitle}>Student Portal</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={T.primary} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Date Card */}
        <View style={[styles.dateCard, { backgroundColor: T.primary }]}>
          <View style={[styles.dateIconWrapper, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
            <Calendar size={24} color="#fff" />
          </View>
          <View style={styles.dateTextWrapper}>
            <Text style={styles.dateText}>{formattedDate}</Text>
            <Text style={styles.yearText}>{today.getFullYear()}</Text>
          </View>
          <View style={[styles.todayBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
            <Text style={styles.todayBadgeText}>Today</Text>
          </View>
        </View>
        
        {/* Quick Stats */}
        <View style={styles.quickStatsRow}>
          <View style={[styles.quickStatCard, { backgroundColor: T.card }]}>
            <Text style={[styles.quickStatValue, { color: '#10B981' }]}>
              {attendancePercentage}%
            </Text>
            <Text style={[styles.quickStatLabel, { color: T.subText }]}>Attendance</Text>
          </View>
          <View style={[styles.quickStatCard, { backgroundColor: T.card }]}>
            <Text style={[styles.quickStatValue, { color: '#4F46E5' }]}>
              ${feesPaid}
            </Text>
            <Text style={[styles.quickStatLabel, { color: T.subText }]}>Paid</Text>
          </View>
          <View style={[styles.quickStatCard, { backgroundColor: T.card }]}>
            <Text style={[styles.quickStatValue, { color: '#EF4444' }]}>
              ${feesRemaining}
            </Text>
            <Text style={[styles.quickStatLabel, { color: T.subText }]}>Remaining</Text>
          </View>
        </View>
        
        {/* Class Info Card */}
        <View style={[styles.classInfoCard, { backgroundColor: T.card, borderColor: T.border }]}>
          <View style={styles.classInfoHeader}>
            <BookOpen size={20} color={T.primary} />
            <Text style={[styles.classInfoTitle, { color: T.text }]}>Class Information</Text>
          </View>
          <View style={styles.classInfoGrid}>
            <View style={styles.classInfoItem}>
              <Text style={[styles.classInfoLabel, { color: T.subText }]}>Class</Text>
              <Text style={[styles.classInfoValue, { color: T.text }]}>
                {className}
              </Text>
            </View>
            <View style={styles.classInfoDivider} />
            <View style={styles.classInfoItem}>
              <Text style={[styles.classInfoLabel, { color: T.subText }]}>Section</Text>
              <Text style={[styles.classInfoValue, { color: T.text }]}>
                {section}
              </Text>
            </View>
            <View style={styles.classInfoDivider} />
            <View style={styles.classInfoItem}>
              <Text style={[styles.classInfoLabel, { color: T.subText }]}>Monthly Fee</Text>
              <Text style={[styles.classInfoValue, { color: T.text }]}>
                ${monthlyFee}
              </Text>
            </View>
          </View>
        </View>

        {/* Academic Services Section */}
        <Text style={[styles.sectionTitle, { color: T.text }]}>Academic Services</Text>
        
        <View style={styles.servicesGrid}>
          {academicServices.map((service, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.serviceCard, { backgroundColor: T.card }]}
              onPress={() => router.push(service.route)}
            >
              <View style={[styles.serviceIconWrapper, { backgroundColor: T.dark ? service.color + '22' : service.bg }]}>
                <service.icon size={28} color={service.color} />
              </View>
              <Text style={[styles.serviceTitle, { color: T.text }]}>{service.title}</Text>
              <Text style={[styles.serviceDesc, { color: T.subText }]}>{service.desc}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  scrollContent: {
    padding: 20,
  },
  dateCard: {
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  dateIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  dateTextWrapper: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  yearText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  todayBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  todayBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  quickStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  classInfoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  classInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  classInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  classInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  classInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  classInfoLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  classInfoValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  classInfoDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: (width - 60) / 2,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    height: 160,
    justifyContent: 'center',
  },
  serviceIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default StudentHome;
