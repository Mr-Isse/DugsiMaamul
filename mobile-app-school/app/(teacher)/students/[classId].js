import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useGetStudentsInClassQuery } from '../../../src/store/mobileApiSlice';
import { 
  ChevronLeft,
  ChevronRight,
  Users,
  User,
  Hash,
  AlertCircle
} from 'lucide-react-native';
import { useTheme } from '../../../src/theme';

const ClassStudents = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const T = theme;

  const { classId, className, section } = params;
  const { data: students, isLoading, error } = useGetStudentsInClassQuery(classId, {
    skip: !classId
  });

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: T.bg }]}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: T.bg }]}>
        <StatusBar barStyle="light-content" backgroundColor={T.primary} />
        <View style={[styles.errorIconBox, { backgroundColor: T.dark ? '#EF444422' : '#FEF2F2' }]}>
          <AlertCircle size={48} color="#EF4444" />
        </View>
        <Text style={[styles.errorTitle, { color: T.text }]}>Failed to load students</Text>
        <Text style={[styles.errorSub, { color: T.subText }]}>
          There was an error fetching the student list for this class. Please try again.
        </Text>
        <TouchableOpacity 
          style={[styles.retryBtn, { backgroundColor: T.primary }]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ChevronLeft size={20} color="#fff" />
          <Text style={styles.retryBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderStudent = ({ item, index }) => (
    <View 
      style={[styles.studentCard, { backgroundColor: T.card, borderColor: T.border }]}
    >
      <View style={styles.studentInfo}>
        <View style={[styles.studentAvatar, { backgroundColor: T.primary + '15' }]}>
          <Text style={[styles.avatarText, { color: T.primary }]}>{item.name?.charAt(0) || index + 1}</Text>
        </View>
        <View style={styles.studentDetails}>
          <Text style={[styles.studentName, { color: T.text }]}>{item.name}</Text>
          <View style={styles.studentMeta}>
            <Hash size={12} color={T.subText} style={{ marginRight: 4 }} />
            <Text style={[styles.studentId, { color: T.subText }]}>{item.customId}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.studentRoleBadge, { backgroundColor: T.primary + '10' }]}>
        <User size={14} color={T.primary} />
        <Text style={[styles.studentRoleText, { color: T.primary }]}>Student</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={T.primary} />
      
      {/* Header */}
      <View style={[styles.appBar, { backgroundColor: T.primary }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={26} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.appBarTitle}>{className}</Text>
          <Text style={styles.appBarSubtitle}>Section {section} • {students?.length || 0} Students</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Students List */}
      <FlatList
        data={students}
        renderItem={renderStudent}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={[styles.headerCard, { backgroundColor: T.primary }]}>
            <View style={[styles.headerIconBox, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <Users size={28} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>{className} - Section {section}</Text>
              <Text style={styles.heroSub}>{students?.length || 0} Students Enrolled</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: T.card, borderColor: T.border }]}>
            <View style={[styles.emptyIconBox, { backgroundColor: T.dark ? T.primary + '22' : T.primary + '10' }]}>
              <Users size={40} color={T.primary} />
            </View>
            <Text style={[styles.emptyText, { color: T.text }]}>No Students Found</Text>
            <Text style={[styles.emptySubText, { color: T.subText }]}>
              There are no students enrolled in this class yet. As soon as students are added, they will appear here.
            </Text>
          </View>
        }
      />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIconBox: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSub: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  appBar: {
    paddingTop: 80, // Moved down even more
    paddingBottom: 24,
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
  listContent: {
    padding: 20,
  },
  headerCard: {
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  headerIconBox: {
    width: 56,
    height: 56,
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
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  studentDetails: {
    flex: 1,
  },
  studentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
  },
  studentId: {
    fontSize: 12,
    fontWeight: '600',
  },
  studentRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  studentRoleText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    padding: 40,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ClassStudents;
