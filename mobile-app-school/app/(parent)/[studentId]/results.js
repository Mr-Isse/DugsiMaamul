import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { FileText, GraduationCap } from 'lucide-react-native';
import { useGetChildResultsQuery } from '../../../src/store/mobileApiSlice';

const ChildResults = () => {
  const { studentId } = useLocalSearchParams();
  const { theme } = useTheme();
  const { data: resultsData, isLoading, error } = useGetChildResultsQuery(studentId);
  const T = theme;

  const results = resultsData?.data || [];

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
          <Text style={[styles.errorText, { color: T.text }]}>Failed to load results</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: T.subText }]}>No results found</Text>
          </View>
        ) : (
          results.map((result) => (
            <View
              key={result._id}
              style={[styles.resultCard, { backgroundColor: T.card, borderColor: T.border }]}
            >
              <View style={styles.resultHeader}>
                <View style={styles.examIconContainer}>
                  <FileText size={24} color={T.primary} />
                </View>
                <View style={styles.examInfo}>
                  <Text style={[styles.examName, { color: T.text }]}>
                    {result.exam?.name || 'Unknown Exam'}
                  </Text>
                  <Text style={[styles.subjectName, { color: T.subText }]}>
                    {result.subject?.name || 'Unknown Subject'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.resultDetails}>
                <View style={styles.marksContainer}>
                  <Text style={[styles.marksLabel, { color: T.subText }]}>Marks</Text>
                  <Text style={[styles.marksValue, { color: T.text }]}>
                    {result.marksObtained} / {result.totalMarks}
                  </Text>
                </View>
                
                {result.grade && (
                  <View style={styles.gradeContainer}>
                    <Text style={[styles.gradeLabel, { color: T.subText }]}>Grade</Text>
                    <Text style={[styles.gradeValue, { color: T.text }]}>{result.grade}</Text>
                  </View>
                )}
              </View>
              
              {result.remarks && (
                <View style={styles.remarksContainer}>
                  <Text style={[styles.remarksLabel, { color: T.subText }]}>Remarks</Text>
                  <Text style={[styles.remarksText, { color: T.text }]}>{result.remarks}</Text>
                </View>
              )}
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
  resultCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  examIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  examInfo: {
    flex: 1,
  },
  examName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subjectName: {
    fontSize: 14,
  },
  resultDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  marksContainer: {
    flex: 1,
  },
  marksLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  marksValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  gradeContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  gradeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  gradeValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#34C759',
  },
  remarksContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  remarksLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  remarksText: {
    fontSize: 14,
    fontStyle: 'italic',
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

export default ChildResults;
