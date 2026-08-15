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
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { 
  useGetExamHallsQuery, 
  useGetExamHallByIdQuery,
  useGrantTemporaryClearanceMutation,
  useRevokeTemporaryClearanceMutation
} from '../../src/store/mobileApiSlice';
import { Search, School, Calendar, Clock, Users, ShieldCheck, ChevronRight, X, AlertTriangle, AlertCircle, User, CreditCard, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../../src/theme';
import { useNavigation } from 'expo-router';

const { width, height } = Dimensions.get('window');

const TeacherExamHalls = () => {
  const navigation = useNavigation();
  const { userInfo } = useSelector((state) => state.auth);
  const { data: halls, isLoading, refetch, isFetching } = useGetExamHallsQuery('teacher', {
    pollingInterval: 10000, // Faster polling (10 seconds) for real-time updates
  });
  const { theme } = useTheme();
  const T = theme;

  const [searchTerm, setSearchTerm] = useState('');
  
  // Detail States
  const [selectedHallId, setSelectedHallId] = useState(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const { data: hallDetails, isLoading: detailsLoading } = useGetExamHallByIdQuery(
    { id: selectedHallId, role: 'teacher' },
    { skip: !selectedHallId }
  );

  const [grantClearance, { isLoading: isGranting }] = useGrantTemporaryClearanceMutation();
  const [revokeClearance, { isLoading: isRevoking }] = useRevokeTemporaryClearanceMutation();

  const handleNotifyFinance = async () => {
    if (!selectedStudent) return;
    try {
      // Logic to notify finance office
      alert('Notification sent to Finance Office. They will review this student\'s payment status.');
      setSelectedStudent(null);
    } catch (err) {
      alert('Failed to send notification');
    }
  };

  // Hide tab bar when modal is open
  React.useEffect(() => {
    navigation.setOptions({
      tabBarStyle: {
        display: selectedHallId ? 'none' : 'flex',
        borderTopWidth: 1,
        borderTopColor: T.border,
        height: 80,
        paddingBottom: 12,
        paddingTop: 12,
        paddingHorizontal: 8,
        backgroundColor: T.card,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      }
    });
  }, [selectedHallId, navigation, T]);

  const filteredHalls = useMemo(() => {
    if (!halls) return [];
    let list = halls;

    const q = searchTerm.toLowerCase().trim();
    if (!q) return list;
    
    return list.filter(h => 
      h.name.toLowerCase().includes(q) || 
      new Date(h.examDate).toLocaleDateString().includes(q)
    );
  }, [halls, searchTerm]);

  const filteredStudents = useMemo(() => {
    if (!hallDetails?.students) return [];
    const q = studentSearchTerm.toLowerCase().trim();
    if (!q) return hallDetails.students;
    return hallDetails.students.filter(item => 
      item.student?.name?.toLowerCase().includes(q) || 
      item.student?.customId?.toLowerCase().includes(q)
    );
  }, [hallDetails?.students, studentSearchTerm]);

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
        <Text style={styles.headerTitle}>Exam Supervision</Text>
        <Text style={styles.headerSubtitle}>Manage and view your assigned halls</Text>
      </View>

      {/* Search & Filters */}
      <View style={styles.topContainer}>
        <View style={[styles.searchWrapper, { backgroundColor: T.card, borderColor: T.border }]}>
          <Search size={20} color={T.subText} style={styles.searchIcon} />
          <TextInput
            placeholder="Search halls..."
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
            const studentCount = hall.students?.length || 0;
            const clearedCount = hall.students?.filter(s => s.student?.isCleared).length || 0;

            return (
              <View 
                key={hall._id} 
                style={[
                  styles.hallCard, 
                  { backgroundColor: T.card, borderColor: T.primary }
                ]}
              >
                <View style={[styles.myHallBadge, { backgroundColor: T.primary }]}>
                  <ShieldCheck size={12} color="#fff" />
                  <Text style={styles.myHallBadgeText}>Assigned to You</Text>
                </View>

                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, { backgroundColor: T.primary + '15' }]}>
                    <School size={24} color={T.primary} />
                  </View>
                  <View style={styles.headerInfo}>
                    <Text style={[styles.hallName, { color: T.text }]}>{hall.name}</Text>
                    <View style={styles.infoRow}>
                      <Calendar size={14} color={T.subText} />
                      <Text style={[styles.infoText, { color: T.subText }]}>
                        {new Date(hall.examDate).toLocaleDateString()}
                      </Text>
                      <View style={[styles.dot, { backgroundColor: T.border }]} />
                      <Clock size={14} color={T.subText} />
                      <Text style={[styles.infoText, { color: T.subText }]}>{hall.examSession}</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: T.border }]} />

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Users size={18} color={T.subText} />
                    <View style={styles.statInfo}>
                      <Text style={[styles.statValue, { color: T.text }]}>{studentCount}</Text>
                      <Text style={[styles.statLabel, { color: T.subText }]}>Total Students</Text>
                    </View>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: T.border }]} />
                  <View style={styles.statItem}>
                    <ShieldCheck size={18} color="#10B981" />
                    <View style={styles.statInfo}>
                      <Text style={[styles.statValue, { color: '#10B981' }]}>{clearedCount}</Text>
                      <Text style={[styles.statLabel, { color: T.subText }]}>Cleared</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity 
                  onPress={() => setSelectedHallId(hall._id)}
                  style={[styles.viewDetailsBtn, { backgroundColor: T.bg }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.viewDetailsText, { color: T.primary }]}>View Student List</Text>
                  <ChevronRight size={18} color={T.primary} />
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyContainer}>
            <School size={64} color={T.border} />
            <Text style={[styles.emptyTitle, { color: T.text }]}>
              No Assignments
            </Text>
            <Text style={[styles.emptySubtitle, { color: T.subText }]}>
              {searchTerm 
                ? 'Try a different search term' 
                : "You are not currently assigned to any exam halls."}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Hall Detail Modal */}
      <Modal
        visible={!!selectedHallId}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedHallId(null)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: T.bg }]}>
            <View style={[styles.modalHeader, { borderBottomColor: T.border }]}>
              <View>
                <Text style={[styles.modalTitle, { color: T.text }]}>{hallDetails?.name || 'Loading...'}</Text>
                <Text style={[styles.modalSubtitle, { color: T.subText }]}>
                  {filteredStudents.length} Students Assigned
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => { setSelectedHallId(null); setStudentSearchTerm(''); }}
                style={[styles.closeBtn, { backgroundColor: T.card }]}
              >
                <X size={24} color={T.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={[styles.modalSearchWrapper, { backgroundColor: T.card, borderColor: T.border }]}>
                <Search size={18} color={T.subText} style={styles.searchIcon} />
                <TextInput
                  placeholder="Search student by name or ID..."
                  placeholderTextColor={T.subText}
                  style={[styles.modalSearchInput, { color: T.text }]}
                  value={studentSearchTerm}
                  onChangeText={setStudentSearchTerm}
                />
              </View>

              {detailsLoading ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator size="large" color={T.primary} />
                </View>
              ) : (
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.studentList}
                >
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((item, index) => (
                      <TouchableOpacity 
                        key={item.student?._id || index}
                        onPress={() => setSelectedStudent(item)}
                        style={[styles.studentCard, { backgroundColor: T.card, borderColor: T.border }]}
                      >
                        <View style={[styles.studentAvatar, { backgroundColor: T.primary + '15' }]}>
                          <Text style={[styles.avatarText, { color: T.primary }]}>
                            {item.student?.name?.charAt(0)}
                          </Text>
                        </View>
                        <View style={styles.studentInfo}>
                          <Text style={[styles.studentName, { color: T.text }]}>{item.student?.name}</Text>
                          <Text style={[styles.studentId, { color: T.subText }]}>ID: {item.student?.customId}</Text>
                        </View>
                        <View style={[
                          styles.statusDot, 
                          { backgroundColor: item.student?.isCleared ? '#10B981' : '#EF4444' }
                        ]} />
                        <ChevronRight size={20} color={T.border} />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.modalEmpty}>
                      <Users size={48} color={T.border} />
                      <Text style={[styles.modalEmptyText, { color: T.subText }]}>No students found</Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Student Status Pop-up */}
      <Modal
        visible={!!selectedStudent}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedStudent(null)}
      >
        <View style={styles.statusModalOverlay}>
          <View style={[styles.statusModalContent, { backgroundColor: T.card }]}>
            <View style={[
              styles.statusHeader, 
              { backgroundColor: selectedStudent?.student?.isCleared ? '#10B98115' : '#EF444415' }
            ]}>
              <View style={[
                styles.statusIconWrapper, 
                { backgroundColor: selectedStudent?.student?.isCleared ? '#10B981' : '#EF4444' }
              ]}>
                {selectedStudent?.student?.isCleared ? (
                  <ShieldCheck size={32} color="#fff" />
                ) : (
                  <AlertTriangle size={32} color="#fff" />
                )}
              </View>
              <Text style={[
                styles.statusTitle, 
                { color: selectedStudent?.student?.isCleared ? '#10B981' : '#EF4444' }
              ]}>
                {selectedStudent?.student?.isCleared ? 'Cleared for Exam' : 'Not Cleared'}
              </Text>
            </View>

            <View style={styles.statusBody}>
              <View style={styles.statusStudentRow}>
                <View style={[styles.statusAvatar, { backgroundColor: T.bg }]}>
                  <User size={24} color={T.subText} />
                </View>
                <View>
                  <Text style={[styles.statusStudentName, { color: T.text }]}>{selectedStudent?.student?.name}</Text>
                  <Text style={[styles.statusStudentId, { color: T.subText }]}>ID: {selectedStudent?.student?.customId}</Text>
                </View>
              </View>

              <View style={[styles.statusDivider, { backgroundColor: T.border }]} />

              <View style={styles.statusMessageContainer}>
                {selectedStudent?.student?.isTemporarilyCleared ? (
                  <>
                    <Text style={[styles.statusMessage, { color: T.text }]}>
                      This student has been granted temporary clearance until their scheduled appointment.
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#10B98110' }]}>
                      <Clock size={16} color="#10B981" />
                      <Text style={[styles.statusBadgeText, { color: '#10B981' }]}>
                        Appointment: {new Date(selectedStudent?.student?.temporaryAccessExpiresAt).toLocaleDateString()}
                      </Text>
                    </View>
                    {selectedStudent?.student?.temporaryAccessReason && (
                      <View style={[styles.reasonBox, { backgroundColor: T.bg, borderColor: T.border }]}>
                        <Text style={[styles.reasonLabel, { color: T.subText }]}>Note/Reason:</Text>
                        <Text style={[styles.reasonText, { color: T.text }]}>{selectedStudent?.student?.temporaryAccessReason}</Text>
                      </View>
                    )}
                  </>
                ) : selectedStudent?.student?.isCleared ? (
                  <>
                    <Text style={[styles.statusMessage, { color: T.text }]}>
                      This student is fully cleared and allowed to take the exam.
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#10B98110' }]}>
                      <ShieldCheck size={16} color="#10B981" />
                      <Text style={[styles.statusBadgeText, { color: '#10B981' }]}>
                        Access Granted
                      </Text>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={[styles.statusMessage, { color: T.text }]}>
                      This student is currently blocked from taking the exam. Please ask them to visit the Finance Office.
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#EF444410' }]}>
                      <AlertCircle size={16} color="#EF4444" />
                      <Text style={[styles.statusBadgeText, { color: '#EF4444' }]}>
                        Entry Refused
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {!selectedStudent?.student?.isCleared && (
                <TouchableOpacity 
                  onPress={handleNotifyFinance}
                  style={[styles.statusActionBtn, { backgroundColor: '#FF6B00', marginBottom: 12 }]}
                >
                  <AlertCircle size={20} color="#fff" />
                  <Text style={styles.statusActionBtnText}>Notify Finance Office</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                onPress={() => setSelectedStudent(null)}
                style={[styles.statusCloseBtn, { backgroundColor: T.primary }]}
              >
                <Text style={styles.statusCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  topContainer: {
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
  filterRow: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '700',
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
    position: 'relative',
    overflow: 'hidden',
  },
  myHallBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  myHallBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 15,
  },
  viewDetailsBtn: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '700',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: height * 0.85,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingTop: 20,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  modalSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
  modalLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentList: {
    paddingBottom: 40,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  studentInfo: {
    flex: 1,
    marginLeft: 15,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '700',
  },
  studentId: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 15,
  },
  modalEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  modalEmptyText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
  statusModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  statusModalContent: {
    width: '100%',
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 10,
  },
  statusHeader: {
    alignItems: 'center',
    paddingVertical: 35,
  },
  statusIconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusBody: {
    padding: 25,
  },
  statusStudentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  statusAvatar: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusStudentName: {
    fontSize: 18,
    fontWeight: '800',
  },
  statusStudentId: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusDivider: {
    height: 1,
    marginVertical: 20,
  },
  statusMessageContainer: {
    marginBottom: 30,
  },
  statusMessage: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 20,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  reasonBox: {
    marginTop: 15,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  reasonText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  statusActionBtn: {
    height: 55,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    elevation: 3,
  },
  statusActionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  statusCloseBtn: {
    height: 55,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  statusCloseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});

export default TeacherExamHalls;


