import React from 'react';
import { 
  View, 
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../../src/store/authSlice';
import { 
  mobileApiSlice, 
  useGetStudentProfileQuery, 
  useGetStudentDashboardStatsQuery,
  useGetMyMonthlyPaymentsQuery,
  useGetStudentResultsQuery,
  useGetStudentAttendanceQuery
} from '../../src/store/mobileApiSlice';
import StudentProfileView from '../../src/components/StudentProfileView';
import { useTheme } from '../../src/theme';

const StudentProfile = () => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const T = theme;
  const { data: profile, isLoading: profileLoading } = useGetStudentProfileQuery();
  const { data: stats, isLoading: statsLoading } = useGetStudentDashboardStatsQuery();

  const { data: payments, isLoading: paymentsLoading } = useGetMyMonthlyPaymentsQuery();
  const { data: results, isLoading: resultsLoading } = useGetStudentResultsQuery();
  const { data: attendance, isLoading: attendanceLoading } = useGetStudentAttendanceQuery();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(mobileApiSlice.util.resetApiState());
  };

  if (profileLoading || statsLoading || paymentsLoading || resultsLoading || attendanceLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: T.bg }]}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }

  return (
    <StudentProfileView 
      student={profile} 
      stats={stats} 
      attendance={attendance}
      payments={payments?.payments}
      marks={results?.allResults}
      onLogout={handleLogout} 
      isOwnProfile={true} 
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default StudentProfile;

