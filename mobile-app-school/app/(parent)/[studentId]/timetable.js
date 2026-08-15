import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { Clock, BookOpen } from 'lucide-react-native';
import { useGetChildTimetableQuery } from '../../../src/store/mobileApiSlice';

const ChildTimetable = () => {
  const { studentId } = useLocalSearchParams();
  const { theme } = useTheme();
  const { data: timetableData, isLoading, error } = useGetChildTimetableQuery(studentId);
  const T = theme;

  const timetable = timetableData?.data || [];

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
          <Text style={[styles.errorText, { color: T.text }]}>Failed to load timetable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const groupedByDay = {};
  timetable.forEach(item => {
    if (!groupedByDay[item.day]) {
      groupedByDay[item.day] = [];
    }
    groupedByDay[item.day].push(item);
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {Object.keys(groupedByDay).length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: T.subText }]}>No timetable found</Text>
          </View>
        ) : (
          daysOfWeek
            .filter(day => groupedByDay[day])
            .map(day => (
              <View key={day} style={styles.daySection}>
                <Text style={[styles.dayTitle, { color: T.text }]}>{day}</Text>
                {groupedByDay[day].map((item, index) => (
                  <View
                    key={`${day}-${index}`}
                    style={[styles.timetableItem, { backgroundColor: T.card, borderColor: T.border }]}
                  >
                    <View style={styles.timeContainer}>
                      <Clock size={20} color={T.subText} />
                      <Text style={[styles.timeText, { color: T.text }]}>
                        {item.startTime} - {item.endTime}
                      </Text>
                    </View>
                    <View style={styles.subjectContainer}>
                      <BookOpen size={20} color={T.primary} />
                      <View style={styles.subjectInfo}>
                        <Text style={[styles.subjectName, { color: T.text }]}>
                          {item.subject?.name || 'Unknown Subject'}
                        </Text>
                        {item.teacher && (
                          <Text style={[styles.teacherName, { color: T.subText }]}>
                            {item.teacher.name}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  daySection: {
    marginBottom: 30,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  timetableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  timeText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  subjectContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectInfo: {
    marginLeft: 12,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  teacherName: {
    fontSize: 12,
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

export default ChildTimetable;
