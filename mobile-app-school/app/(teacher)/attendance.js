import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  FlatList,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { 
  useGetAssignedClassesQuery, 
  useGetTaughtSubjectsQuery,
  useGetStudentsInClassQuery,
  useTakeAttendanceMutation,
  useGetClassAttendanceQuery,
  useGetTeacherScheduleQuery
} from '../../src/store/mobileApiSlice';
import { 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  Check, 
  ArrowRight,
  ChevronRight,
  ClipboardCheck,
  LayoutGrid,
  BookOpen,
  BarChart3
} from 'lucide-react-native';
import { useTheme } from '../../src/theme';

const Attendance = () => {
  const { theme } = useTheme();
  const T = theme;
  const params = useLocalSearchParams();
  const [step, setStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [currentSubjectId, setCurrentSubjectId] = useState(null);

  const { data: classes, isLoading: classesLoading } = useGetAssignedClassesQuery();
  const { data: subjects, isLoading: subjectsLoading } = useGetTaughtSubjectsQuery();

  // Sort classes by schedule priority
  const sortedClasses = useMemo(() => {
    if (!classes || !scheduleData) return classes;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    return [...classes].sort((a, b) => {
      const aSched = scheduleData.find(s => (s.class?._id || s.class) === a._id && timeStr >= s.startTime && timeStr <= s.endTime);
      const bSched = scheduleData.find(s => (s.class?._id || s.class) === b._id && timeStr >= s.startTime && timeStr <= s.endTime);
      if (aSched && !bSched) return -1;
      if (!aSched && bSched) return 1;
      return 0;
    });
  }, [classes, scheduleData]);

  // Auto-select class and subject if params are provided
  useEffect(() => {
    if (params.classId && params.subjectId && classes && subjects) {
      const cls = classes.find(c => c._id === params.classId);
      const sub = subjects.find(s => (s.subjectId || s._id) === params.subjectId || s._id === params.subjectId);
      
      if (cls && sub) {
        setSelectedClass(cls);
        setSelectedSubject(sub);
        setStep(2); // Skip to attendance marking
      }
    }
  }, [params.classId, params.subjectId, classes, subjects]);

  const { data: students, isLoading: studentsLoading } = useGetStudentsInClassQuery(selectedClass?._id, {
    skip: !selectedClass
  });
  const { data: scheduleData } = useGetTeacherScheduleQuery();
  const { data: existingAttendance, isFetching: attendanceFetching, refetch: refetchAttendance } = useGetClassAttendanceQuery({
    classId: selectedClass?._id,
    subjectId: selectedSubject?.subjectId || selectedSubject?._id,
    date: new Date().toISOString().split('T')[0]
  }, {
    skip: !selectedClass || !selectedSubject || step !== 2
  });

  const [takeAttendance, { isLoading: isSubmitting }] = useTakeAttendanceMutation();

  // Reset attendance data and update subject tracker when subject changes to prevent stale data
  useEffect(() => {
    if (selectedSubject) {
      const subId = selectedSubject.subjectId || selectedSubject._id;
      if (subId !== currentSubjectId) {
        setAttendanceData({});
        setCurrentSubjectId(subId);
      }
    }
  }, [selectedSubject, currentSubjectId]);

  // Pre-fill attendance data instantly and sync actual data when it arrives
  useEffect(() => {
    if (students && selectedSubject) {
      const subId = selectedSubject.subjectId || selectedSubject._id;
      
      // 1. Instant optimistic default (if switching to a new subject or empty)
      if (Object.keys(attendanceData).length === 0 || subId !== currentSubjectId) {
        const optimisticData = {};
        students.forEach(student => {
          optimisticData[student._id] = 'Present';
        });
        setAttendanceData(optimisticData);
        setCurrentSubjectId(subId);
      }

      // 2. Sync with actual backend data once fetch completes and it belongs to the current subject
      if (!attendanceFetching && existingAttendance && subId === currentSubjectId) {
        if (existingAttendance.length > 0) {
          const actualData = {};
          existingAttendance.forEach(record => {
            const studentId = record.user?._id || record.user;
            if (studentId) actualData[studentId] = record.status;
          });
          setAttendanceData(actualData);
        }
      }
    }
  }, [students, existingAttendance, attendanceFetching, selectedSubject, currentSubjectId]);

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    setStep(1.5); // Always select subject explicitly, even if there is only one
  };

  const handleSubjectSelect = (sub) => {
    setSelectedSubject(sub);
    setStep(2);
  };

  const toggleStatus = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Calculate attendance percentages
  const attendanceCalculations = React.useMemo(() => {
    if (!students) return null;
    
    const totalStudents = students.length;
    const presentCount = Object.values(attendanceData).filter(status => status === 'Present').length;
    const absentCount = Object.values(attendanceData).filter(status => status === 'Absent').length;
    const lateCount = Object.values(attendanceData).filter(status => status === 'Late').length;
    
    const attendanceRate = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;
    const absenceRate = totalStudents > 0 ? (absentCount / totalStudents) * 100 : 0;
    const lateRate = totalStudents > 0 ? (lateCount / totalStudents) * 100 : 0;
    
    return {
      total: totalStudents,
      present: presentCount,
      absent: absentCount,
      late: lateCount,
      attendanceRate: attendanceRate.toFixed(1),
      absenceRate: absenceRate.toFixed(1),
      lateRate: lateRate.toFixed(1)
    };
  }, [students, attendanceData]);

  const handleSubmit = async () => {
    const formattedData = Object.entries(attendanceData).map(([studentId, status]) => ({
      studentId,
      status
    }));

    try {
      await takeAttendance({
        classId: selectedClass._id,
        subjectId: selectedSubject.subjectId || selectedSubject._id,
        studentsAttendance: formattedData,
        date: new Date().toISOString()
      }).unwrap();
      
      Alert.alert('Success', 'Attendance recorded successfully!');
      setStep(1);
      setSelectedClass(null);
      setSelectedSubject(null);
    } catch (err) {
      Alert.alert('Error', err?.data?.userMessage || 'Failed to submit attendance');
    }
  };

  if (classesLoading || subjectsLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: T.bg }]}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: T.card, borderBottomColor: T.border }]}>
        <View style={styles.headerContent}>
          {step > 1 && (
            <TouchableOpacity onPress={() => setStep(step === 2 && subjects?.filter(s => s.class?._id === selectedClass._id).length === 1 ? 1 : step - 0.5)} style={[styles.backBtn, { backgroundColor: T.input }]}>
              <ChevronLeft size={24} color={T.text} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={[styles.headerTitle, { color: T.text }]}>
              {step === 1 ? 'Select Class' : step === 1.5 ? 'Select Subject' : 'Mark Attendance'}
            </Text>
            <Text style={[styles.headerSubtitle, { color: T.subText }]}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {step === 1 && (
          <FlatList
            data={sortedClasses}
            keyExtractor={item => item._id}
            contentContainerStyle={[styles.listPadding, { paddingBottom: 100 }]}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.selectionCard, { backgroundColor: T.card, borderColor: T.border }]}
                onPress={() => handleClassSelect(item)}
              >
                <View style={[styles.cardIcon, { backgroundColor: T.primary + '20' }]}>
                  <LayoutGrid size={24} color={T.primary} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardName, { color: T.text }]}>{item.name}</Text>
                  <Text style={[styles.cardSub, { color: T.subText }]}>Section {item.section}</Text>
                </View>
                <ArrowRight size={20} color={T.subText} />
              </TouchableOpacity>
            )}
          />
        )}

        {step === 1.5 && (
          <FlatList
            data={subjects?.filter(s => s.class?._id === selectedClass._id || s.class === selectedClass._id)}
            keyExtractor={item => item._id} // Using assignment ID for uniqueness
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.subjectCard, { backgroundColor: T.card, borderColor: T.border }]}
                onPress={() => handleSubjectSelect(item)}
              >
                <View style={[styles.subjectIconBox, { backgroundColor: T.primary + '20' }]}>
                  <BookOpen size={24} color={T.primary} />
                </View>
                <View style={styles.subjectInfo}>
                  <Text style={[styles.subjectName, { color: T.text }]}>{item.name}</Text>
                  <Text style={[styles.subjectCode, { color: T.subText }]}>{item.code}</Text>
                </View>
                <ChevronRight size={20} color={T.subText} />
              </TouchableOpacity>
            )}
          />
        )}

        {step === 2 && (
          <View style={{ flex: 1 }}>
            <View style={[styles.classBanner, { backgroundColor: T.primary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
              <View>
                <Text style={styles.bannerText}>{selectedClass.name} - {selectedSubject.name}</Text>
                <Text style={[styles.bannerText, { fontSize: 11, opacity: 0.8 }]}>Section {selectedClass.section}</Text>
              </View>
              {attendanceFetching && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Syncing...</Text>
                </View>
              )}
            </View>

            {studentsLoading ? (
              <View style={{ marginTop: 40, alignItems: 'center', gap: 12 }}>
                <ActivityIndicator size="large" color={T.primary} />
                <Text style={{ color: T.subText, fontSize: 14, fontWeight: '600' }}>
                  Loading students...
                </Text>
              </View>
            ) : (
              <FlatList
                data={students}
                keyExtractor={item => item._id}
                contentContainerStyle={[styles.listPadding, { paddingBottom: 180 }]}
                ListHeaderComponent={() => (
                  attendanceCalculations && (
                    <View style={[styles.statsContainer, { backgroundColor: T.card, borderColor: T.border, marginBottom: 20 }]}>
                      <View style={styles.statsHeader}>
                        <BarChart3 size={20} color={T.primary} />
                        <Text style={[styles.statsTitle, { color: T.text }]}>Attendance Overview</Text>
                      </View>
                      
                      <View style={styles.statsGrid}>
                        <View style={styles.statItem}>
                          <Text style={[styles.statValue, { color: '#10B981' }]}>{attendanceCalculations.present}</Text>
                          <Text style={[styles.statLabel, { color: T.subText }]}>Present</Text>
                          <Text style={[styles.statPercentage, { color: T.subText }]}>
                            {attendanceCalculations.attendanceRate}%
                          </Text>
                        </View>
                        
                        <View style={styles.statItem}>
                          <Text style={[styles.statValue, { color: '#EF4444' }]}>{attendanceCalculations.absent}</Text>
                          <Text style={[styles.statLabel, { color: T.subText }]}>Absent</Text>
                          <Text style={[styles.statPercentage, { color: T.subText }]}>
                            {attendanceCalculations.absenceRate}%
                          </Text>
                        </View>
                        
                        <View style={styles.statItem}>
                          <Text style={[styles.statValue, { color: '#F59E0B' }]}>{attendanceCalculations.late}</Text>
                          <Text style={[styles.statLabel, { color: T.subText }]}>Late</Text>
                          <Text style={[styles.statPercentage, { color: T.subText }]}>
                            {attendanceCalculations.lateRate}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  )
                )}
                renderItem={({ item, index }) => (
                  <View style={[styles.studentItem, { backgroundColor: T.card, borderColor: T.border }]}>
                    <View style={styles.studentInfo}>
                      <View style={[styles.studentAvatar, { backgroundColor: T.primary + '15' }]}>
                        <Text style={[styles.avatarText, { color: T.primary }]}>{index + 1}</Text>
                      </View>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={[styles.studentName, { color: T.text }]} numberOfLines={1}>{item.name}</Text>
                        <Text style={[styles.studentId, { color: T.subText }]}>{item.customId}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.statusGroup}>
                      {[
                        { id: 'Present', icon: CheckCircle2, color: '#10B981', bg: '#ECFDF5' },
                        { id: 'Absent', icon: XCircle, color: '#EF4444', bg: '#FEF2F2' },
                        { id: 'Late', icon: Clock, color: '#F59E0B', bg: '#FFFBEB' }
                      ].map(status => (
                        <TouchableOpacity 
                          key={status.id}
                          style={[
                            styles.statusBtn, 
                            { 
                              backgroundColor: attendanceData[item._id] === status.id ? status.bg : T.input,
                              borderColor: attendanceData[item._id] === status.id ? status.color : 'transparent'
                            }
                          ]}
                          onPress={() => setAttendanceData(prev => ({ ...prev, [item._id]: status.id }))}
                        >
                          <status.icon size={22} color={attendanceData[item._id] === status.id ? status.color : T.subText} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              />
            )}

            <View style={[styles.footer, { backgroundColor: T.card, borderTopColor: T.border }]}>
              <TouchableOpacity 
                style={[styles.submitBtn, { backgroundColor: T.primary }]} 
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Check size={20} color="#fff" strokeWidth={3} />
                    <Text style={styles.submitBtnText}>Submit Attendance</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
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
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  listPadding: {
    padding: 20,
  },
  selectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  subjectIconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '800',
  },
  subjectCode: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  classBanner: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  bannerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
  },
  studentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
  },
  studentId: {
    fontSize: 11,
    fontWeight: '600',
  },
  statusGroup: {
    flexDirection: 'row',
    gap: 12, // Increased gap for better icon separation
  },
  statusBtn: {
    width: 44, // Slightly larger buttons
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 80, // Account for tab bar height
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
  },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  statPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Attendance;


