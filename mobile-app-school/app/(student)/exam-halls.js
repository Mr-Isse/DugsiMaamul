import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useGetExamHallsQuery } from '../../src/store/mobileApiSlice';
import { Search, School, Calendar, Clock, MapPin, AlertCircle, ShieldCheck, AlertTriangle } from 'lucide-react-native';
import { useTheme } from '../../src/theme';

const { width } = Dimensions.get('window');

const StudentExamHalls = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: halls, isLoading, refetch, isFetching } = useGetExamHallsQuery('student', {
    pollingInterval: 10000, // Real-time updates (10 seconds)
  });
  const { theme } = useTheme();
  const T = theme;

  const [searchTerm, setSearchTerm] = useState('');

  const filteredHalls = useMemo(() => {
    if (!halls) return [];
    const q = searchTerm.toLowerCase().trim();
    if (!q) return halls;
    return halls.filter(h => 
      h.name.toLowerCase().includes(q) || 
      new Date(h.examDate).toLocaleDateString().includes(q)
    );
  }, [halls, searchTerm]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: T.bg }]}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={T.appBar} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: T.appBar }]}>
        <Text style={styles.headerTitle}>My Exam Halls</Text>
        <Text style={styles.headerSubtitle}>View your assigned halls and seat info</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchWrapper, { backgroundColor: T.card, borderColor: T.border }]}>
          <Search size={20} color={T.subText} style={styles.searchIcon} />
          <TextInput
            placeholder="Search by hall name or date..."
            placeholderTextColor={T.subText}
            style={[styles.searchInput, { color: T.text }]}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} color={T.primary} />
        }
      >
        {filteredHalls.length > 0 ? (
          filteredHalls.map((hall) => {
            const myAssignment = hall.students.find(s => s.student?._id === userInfo?._id || s.student === userInfo?._id);
            const isCleared = !myAssignment?.student?.hasOwedMoney;

            return (
              <View 
                key={hall._id} 
                style={[
                  styles.hallCard, 
                  { backgroundColor: T.card, borderColor: T.border }
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, { backgroundColor: T.primary + '15' }]}>
                    <School size={24} color={T.primary} />
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={[styles.hallName, { color: T.text }]}>{hall.name}</Text>
                    <View style={styles.infoRow}>
                      <Calendar size={14} color={T.subText} />
                      <Text style={[styles.infoText, { color: T.subText }]}>
                        {new Date(hall.examDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                      <View style={[styles.dot, { backgroundColor: T.border }]} />
                      <Clock size={14} color={T.subText} />
                      <Text style={[styles.infoText, { color: T.subText }]}>{hall.examSession}</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: T.border }]} />

                <View style={styles.assignmentSection}>
                  <View style={styles.assignmentRow}>
                    <View style={styles.assignmentItem}>
                      <Text style={[styles.assignmentLabel, { color: T.subText }]}>Seat Number</Text>
                      <Text style={[styles.assignmentValue, { color: T.primary }]}>
                        {myAssignment?.seatNumber || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.assignmentItem}>
                      <Text style={[styles.assignmentLabel, { color: T.subText }]}>Status</Text>
                      <View style={[
                        styles.statusBadge, 
                        { backgroundColor: isCleared ? '#10B98115' : '#EF444415' }
                      ]}>
                        {isCleared ? (
                          <ShieldCheck size={14} color="#10B981" />
                        ) : (
                          <AlertTriangle size={14} color="#EF4444" />
                        )}
                        <Text style={[
                          styles.statusText, 
                          { color: isCleared ? '#10B981' : '#EF4444' }
                        ]}>
                          {isCleared ? 'Cleared' : 'Owes Money'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {!isCleared && (
                    <View style={[styles.warningBox, { backgroundColor: '#EF444410' }]}>
                      <AlertCircle size={16} color="#EF4444" />
                      <Text style={styles.warningText}>
                        Please visit the finance office to clear your dues.
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <School size={64} color={T.border} />
            <Text style={[styles.emptyTitle, { color: T.text }]}>No Halls Found</Text>
            <Text style={[styles.emptySubtitle, { color: T.subText }]}>
              {searchTerm ? 'Try a different search term' : 'You haven\'t been assigned to any exam halls yet.'}
            </Text>
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -20,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  hallCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  hallName: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    fontSize: 13,
    marginLeft: 5,
    fontWeight: '500',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 8,
  },
  divider: {
    height: 1,
    marginVertical: 15,
  },
  assignmentSection: {
    marginTop: 5,
  },
  assignmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignmentItem: {
    flex: 1,
  },
  assignmentLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  assignmentValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 15,
  },
  warningText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 15,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});

export default StudentExamHalls;

