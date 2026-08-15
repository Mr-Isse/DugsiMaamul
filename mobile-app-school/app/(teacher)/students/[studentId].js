import React from 'react';
import { 
  View, 
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { UserX, ChevronLeft } from 'lucide-react-native';
import { useGetStudentProfileByIdQuery } from '../../../src/store/mobileApiSlice';
import StudentProfileView from '../../../src/components/StudentProfileView';
import { useTheme } from '../../../src/theme';

const TeacherStudentProfile = () => {
  const { studentId } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const T = theme;

  const { data, isLoading, error } = useGetStudentProfileByIdQuery(studentId, {
    skip: !studentId
  });

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: T.bg }]}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: T.bg }]}>
        <StatusBar barStyle="light-content" backgroundColor={T.primary} />
        <View style={[styles.errorIconBox, { backgroundColor: T.dark ? '#EF444422' : '#FEF2F2' }]}>
          <UserX size={48} color="#EF4444" />
        </View>
        <Text style={[styles.errorTitle, { color: T.text }]}>Student Not Found</Text>
        <Text style={[styles.errorSub, { color: T.subText }]}>
          We couldn't find a student profile for ID: {studentId}. They might have been removed or the ID is incorrect.
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

  // data from /teacher/student-profile/:customId returns { student, attendance, payments, marks }
  return (
    <StudentProfileView 
      student={data.student} 
      attendance={data.attendance}
      payments={data.payments}
      marks={data.marks}
      onBack={() => router.back()}
      isOwnProfile={false} 
    />
  );
};

const styles = StyleSheet.create({
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
});

export default TeacherStudentProfile;
