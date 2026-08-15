import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { CheckCircle2, XCircle, Clock, Calendar, TrendingUp } from 'lucide-react-native';
import { useGetChildAttendanceQuery } from '../../../src/store/mobileApiSlice';

const ChildAttendance = () => {
  const { studentId } = useLocalSearchParams();
  const { theme } = useTheme();
  const { data: attendanceData, isLoading, error } = useGetChildAttendanceQuery(studentId);
  const T = theme;

  const attendances = attendanceData?.data || [];
  const presentCount = attendances.filter(a => a.status?.toLowerCase() === 'present').length;
  const absentCount = attendances.filter(a => a.status?.toLowerCase() === 'absent').length;
  const lateCount = attendances.filter(a => a.status?.toLowerCase() === 'late').length;
  const total = attendances.length;
  const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

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
          <Text style={[styles.errorText, { color: T.text }]}>Failed to load attendance</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return <CheckCircle2 size={24} color="#34C759" />;
      case 'absent':
        return <XCircle size={24} color="#FF3B30" />;
      case 'late':
        return <Clock size={24} color="#FF9500" />;
      default:
        return <Clock size={24} color={T.subText} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present': return '#34C759';
      case 'absent': return '#FF3B30';
      case 'late': return '#FF9500';
      default: return T.subText;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Summary Cards */}
        {total > 0 && (
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: T.card, borderColor: T.border }]}>
              <TrendingUp size={20} color={percentage >= 75 ? '#34C759' : '#FF9500'} />
              <Text style={[styles.summaryValue, { color: T.text }]}>{percentage}%</Text>
              <Text style={[styles.summaryLabel, { color: T.subText }]}>Attendance</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: T.card, borderColor: T.border }]}>
              <CheckCircle2 size={20} color="#34C759" />
              <Text style={[styles.summaryValue, { color: '#34C759' }]}>{presentCount}</Text>
              <Text style={[styles.summaryLabel, { color: T.subText }]}>Present</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: T.card, borderColor: T.border }]}>
              <XCircle size={20} color="#FF3B30" />
              <Text style={[styles.summaryValue, { color: '#FF3B30' }]}>{absentCount}</Text>
              <Text style={[styles.summaryLabel, { color: T.subText }]}>Absent</Text>
            </View>
          </View>
        )}

        {attendances.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar size={48} color={T.subText} />
            <Text style={[styles.emptyText, { color: T.subText, marginTop: 12 }]}>No attendance records found</Text>
          </View>
        ) : (
          attendances.map((attendance) => (
            <View
              key={attendance._id}
              style={[styles.attendanceCard, { backgroundColor: T.card, borderColor: T.border }]}
            >
              <View style={[styles.statusBar, { backgroundColor: getStatusColor(attendance.status) }]} />
              <View style={styles.iconContainer}>
                {getStatusIcon(attendance.status)}
              </View>
              <View style={styles.attendanceInfo}>
                <Text style={[styles.attendanceDate, { color: T.text }]}>
                  {formatDate(attendance.date)}
                </Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(attendance.status) + '15' }]}>
                    <Text style={[styles.statusBadgeText, { color: getStatusColor(attendance.status) }]}>
                      {attendance.status}
                    </Text>
                  </View>
                </View>
                {attendance.remarks && (
                  <Text style={[styles.remarks, { color: T.subText }]}>
                    {attendance.remarks}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}

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
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  attendanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  statusBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  iconContainer: {
    marginLeft: 12,
    marginRight: 14,
  },
  attendanceInfo: {
    flex: 1,
  },
  attendanceDate: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  remarks: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
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

export default ChildAttendance;
