import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  ActivityIndicator,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { logout } from '../../src/store/authSlice';
import { 
  mobileApiSlice, 
  useGetTeacherProfileQuery, 
  useGetTeacherDashboardStatsQuery 
} from '../../src/store/mobileApiSlice';
import { useTheme } from '../../src/theme';
import { SCHOOL_CONFIG } from '../../config';
import { useRouter } from 'expo-router';
import { 
  Shield, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Moon,
  School,
  User,
  Info,
  Phone,
  Hash,
  BookOpen,
  Users,
  Clock,
  Calendar,
  Sun
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const TeacherProfile = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: profile, isLoading } = useGetTeacherProfileQuery();
  const { data: stats, isLoading: statsLoading } = useGetTeacherDashboardStatsQuery();
  const { theme, dark, toggleTheme } = useTheme();
  const T = theme;

  const handleLogout = () => {
    dispatch(logout());
    dispatch(mobileApiSlice.util.resetApiState());
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: T.bg }]}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }

  // School data with fallbacks from config
  const schoolData = {
    name: profile?.school?.name || SCHOOL_CONFIG.appName,
    subdomain: profile?.school?.subdomain || SCHOOL_CONFIG.tenantId,
    code: profile?.school?.code || 'N/A'
  };

  const menuItems = [
    { icon: User, label: 'Personal Information', subLabel: 'Manage your profile details' },
    { icon: Shield, label: 'Security', subLabel: 'Password & Authentication' },
    { icon: Moon, label: 'Appearance', subLabel: 'Dark mode & Themes' },
    { icon: Settings, label: 'App Settings', subLabel: 'Notifications & Privacy' },
    { icon: HelpCircle, label: 'Help & Support', subLabel: 'FAQs & Contact' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.header, { backgroundColor: T.card }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: T.primary }]}>
              <Text style={styles.avatarText}>{profile?.name?.charAt(0) || 'T'}</Text>
            </View>
            <TouchableOpacity style={[styles.editBadge, { backgroundColor: T.primary + '20' }]}>
              <Settings size={14} color={T.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: T.text }]}>{profile?.name || 'Teacher'}</Text>
          <Text style={[styles.userEmail, { color: T.subText }]}>@{profile?.username || 'teacher'}</Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.idBadge, { backgroundColor: T.primary + '20' }]}>
              <Text style={[styles.idText, { color: T.primary }]}>ID: {profile?.customId || 'N/A'}</Text>
            </View>
            <View style={[styles.idBadge, { backgroundColor: '#10B98120' }]}>
              <Text style={[styles.idText, { color: '#10B981' }]}>SCHOOL: {schoolData.subdomain}</Text>
            </View>
          </View>
        </View>

        {/* School Information Section */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: T.text }]}>School Information</Text>
          <View style={[styles.infoCard, { backgroundColor: T.card, borderColor: T.border }]}>
            <InfoItem icon={School} label="School Name" value={schoolData.name} theme={T} />
            <InfoItem icon={Hash} label="School ID (Tenant)" value={schoolData.subdomain} theme={T} />
            <InfoItem icon={Shield} label="School Code" value={schoolData.code} theme={T} />
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: T.text }]}>Personal Information</Text>
          <View style={[styles.infoCard, { backgroundColor: T.card, borderColor: T.border }]}>
            <InfoItem icon={User} label="Full Name" value={profile?.name || 'Teacher'} theme={T} />
            <InfoItem icon={Hash} label="Teacher ID" value={profile?.customId || 'N/A'} theme={T} />
            <InfoItem icon={Calendar} label="Age" value={profile?.age ? `${profile.age} years` : undefined} theme={T} />
            <InfoItem icon={Phone} label="Phone Number" value={profile?.phone || 'N/A'} theme={T} />
          </View>
        </View>

        {/* Professional Information */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: T.text }]}>Professional Information</Text>
          <View style={[styles.infoCard, { backgroundColor: T.card, borderColor: T.border }]}>
            <InfoItem icon={School} label="School" value={schoolData.name} theme={T} />
            <InfoItem icon={BookOpen} label="Subject" value={profile?.subjects?.[0]?.name || stats?.assignedSubjects?.[0]?.name || 'N/A'} theme={T} />
            <InfoItem icon={Users} label="Classes Count" value={stats?.totalClasses ? `${stats.totalClasses} classes` : undefined} theme={T} />
            <InfoItem icon={Clock} label="Working Hours" value={profile?.workingStartTime ? `${profile.workingStartTime} - ${profile.workingEndTime}` : undefined} theme={T} />
          </View>
        </View>

        {/* Assigned Classes List */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: T.text }]}>My Assigned Classes</Text>
          <View style={[styles.infoCard, { backgroundColor: T.card, borderColor: T.border, padding: 0 }]}>
            {stats?.assignedClasses?.length > 0 ? (
              stats.assignedClasses.map((cls, idx) => (
                <View key={cls._id} style={[styles.assignedClassItem, { borderBottomWidth: idx === stats.assignedClasses.length - 1 ? 0 : 1, borderBottomColor: T.border }]}>
                  <View style={[styles.classIcon, { backgroundColor: T.primary + '15' }]}>
                    <Users size={18} color={T.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.className, { color: T.text }]}>{cls.className || cls.name}</Text>
                    <Text style={[styles.sectionName, { color: T.subText }]}>Section: {cls.section || 'A'}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.viewClassBtn, { backgroundColor: T.primary }]}
                    onPress={() => router.push(`/(teacher)/students/${cls._id}`)}
                  >
                    <Text style={styles.viewClassBtnText}>Students</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: T.subText }}>No classes assigned yet.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Exam Management Section */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: T.text }]}>Exam Management</Text>
          <View style={[styles.infoCard, { backgroundColor: T.card, borderColor: T.border }]}>
            <TouchableOpacity 
              style={[styles.requestExamBtn, { backgroundColor: T.primary }]}
              onPress={() => alert('Exam registration requested. Admin will review and approve.')}
            >
              <Calendar size={20} color="#fff" />
              <Text style={styles.requestExamBtnText}>Register New Exam</Text>
            </TouchableOpacity>
            <Text style={[styles.examNote, { color: T.subText }]}>
              Request new exams for your assigned classes. Once approved by admin, they will appear in your schedule.
            </Text>
          </View>
        </View>

        {/* Teaching Statistics */}
        <View style={styles.infoSection}>
          <Text style={[styles.sectionTitle, { color: T.text }]}>Teaching Statistics</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              icon={Users} 
              label="Students" 
              value={stats?.studentsCount || stats?.totalStudents || 0} 
              color="#4F46E5"
              theme={T}
            />
            <StatCard 
              icon={BookOpen} 
              label="Subjects" 
              value={stats?.totalSubjects || 0} 
              color="#10B981"
              theme={T}
            />
            <StatCard 
              icon={Calendar} 
              label="Classes" 
              value={stats?.totalClasses || 0} 
              color="#F59E0B"
              theme={T}
            />
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {/* Appearance Toggle */}
          <View style={[styles.menuItem, { borderBottomColor: T.border }]}>
            <View style={[styles.menuIcon, { backgroundColor: T.primary + '10' }]}>
              <Moon size={22} color={T.primary} />
            </View>
            <View style={styles.menuText}>
              <Text style={[styles.menuLabel, { color: T.text }]}>Dark Mode</Text>
              <Text style={[styles.menuSubLabel, { color: T.subText }]}>Switch between themes</Text>
            </View>
            <Switch 
              value={dark} 
              onValueChange={toggleTheme}
              trackColor={{ false: T.border, true: T.primary }}
              thumbColor="#fff"
            />
          </View>

          {menuItems.filter(item => item.label !== 'Appearance').map((item, index) => (
            <TouchableOpacity key={index} style={[styles.menuItem, { borderBottomColor: T.border }]}>
              <View style={[styles.menuIcon, { backgroundColor: T.primary + '10' }]}>
                <item.icon size={22} color={T.primary} />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuLabel, { color: T.text }]}>{item.label}</Text>
                <Text style={[styles.menuSubLabel, { color: T.subText }]}>{item.subLabel}</Text>
              </View>
              <ChevronRight size={20} color={T.subText} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: T?.card, borderColor: T?.border }]} 
          onPress={handleLogout}
        >
          <LogOut size={22} color={T?.primary} />
          <Text style={[styles.logoutText, { color: T?.primary }]}>Log Out Account</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: T?.subText }]}>{schoolData.name} v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoItem = ({ icon: Icon, label, value, theme }) => {
  if (!value) return null;
  return (
    <View style={infoItemStyles.infoRowItem}>
      <Icon size={18} color="#64748b" />
      <View style={infoItemStyles.infoRowText}>
        <Text style={[infoItemStyles.infoRowLabel, { color: theme.subText }]}>{label}</Text>
        <Text style={[infoItemStyles.infoRowValue, { color: theme.text }]}>{value}</Text>
      </View>
    </View>
  );
};

const infoItemStyles = StyleSheet.create({
  infoRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  infoRowText: { flex: 1 },
  infoRowLabel: { fontSize: 12, fontWeight: '600' },
  infoRowValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },
});

const StatCard = ({ icon: Icon, label, value, color, theme }) => (
  <View style={[statCardStyles.statCard, { backgroundColor: color + '10' }]}>
    <Icon size={20} color={color} />
    <Text style={[statCardStyles.statValue, { color }]}>{value}</Text>
    <Text style={[statCardStyles.statLabel, { color: theme.subText }]}>{label}</Text>
  </View>
);

const statCardStyles = StyleSheet.create({
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', paddingVertical: 30 },
  avatarContainer: { position: 'relative', marginBottom: 15 },
  avatar: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 40, fontWeight: '800', color: '#fff' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3 },
  userName: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  userEmail: { fontSize: 14, marginBottom: 12 },
  badgeContainer: { flexDirection: 'row', gap: 8 },
  idBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  idText: { fontSize: 12, fontWeight: '700' },
  infoSection: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  infoRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  infoRowText: { flex: 1 },
  infoRowLabel: { fontSize: 12, fontWeight: '600' },
  infoRowValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  menuContainer: { paddingHorizontal: 20, marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '600', marginTop: 1 },
  menuSubLabel: { fontSize: 12, marginTop: 1 },
  assignedClassItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  classIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  className: { fontSize: 15, fontWeight: '700' },
  sectionName: { fontSize: 12, fontWeight: '600' },
  viewClassBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  viewClassBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  requestExamBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 10, marginBottom: 10 },
  requestExamBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  examNote: { fontSize: 12, textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 10 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: 10, paddingVertical: 16, borderRadius: 16, borderWidth: 1 },
  logoutText: { fontSize: 16, fontWeight: '700', marginLeft: 10 },
  versionText: { textAlign: 'center', fontSize: 12, marginTop: 25 },
});

export default TeacherProfile;

