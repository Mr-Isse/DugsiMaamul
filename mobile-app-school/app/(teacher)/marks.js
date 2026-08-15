import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  FlatList,
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { 
  useGetAssignedClassesQuery,
  useGetTaughtSubjectsQuery,
  useGetStudentsInClassQuery,
  useGetClassSubjectMarksQuery,
  useSubmitMarksMutation,
  useGetExamsQuery,
  useMarkExamAsPresentMutation
} from '../../src/store/mobileApiSlice';
import { 
  ChevronLeft, 
  Check, 
  ArrowRight,
  BookOpen,
  Trophy,
  User as UserIcon,
  ChevronDown,
  LayoutGrid,
  FileText,
  UploadCloud,
  AlertCircle
} from 'lucide-react-native';
import { useTheme } from '../../src/theme';

const { width } = Dimensions.get('window');

const EXAM_TYPES = [
  { id: 'Monthly1', label: 'Monthly 1' },
  { id: 'Midterm', label: 'Midterm' },
  { id: 'Monthly2', label: 'Monthly 2' },
  { id: 'Final', label: 'Final Exam' }
];

const MarksEntry = () => {
  const { theme } = useTheme();
  const T = theme;
  const params = useLocalSearchParams();
  const [step, setStep] = useState(1); // 1: Select Exam Type, 2: Select Subject/Class, 3: Bulk Entry
  const [selectedExamType, setSelectedExamType] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [marksData, setMarksData] = useState({}); // { studentId: score }
  const [remarksData, setRemarksData] = useState({}); // { studentId: remarks }

  const { data: classes, isLoading: classesLoading } = useGetAssignedClassesQuery();
  const { data: subjects, isLoading: subjectsLoading } = useGetTaughtSubjectsQuery();
  const { data: exams,    isLoading: examsLoading } = useGetExamsQuery();
  const { data: students, isLoading: studentsLoading } = useGetStudentsInClassQuery(selectedClass?._id, {
    skip: !selectedClass
  });

  // Fetch existing saved marks for this class+subject to pre-fill the correct exam type
  const { data: existingMarks, isLoading: existingMarksLoading } = useGetClassSubjectMarksQuery(
    { classId: selectedClass?._id, subjectId: (selectedSubject?.subjectId || selectedSubject?._id) },
    { 
      skip: !selectedClass || !selectedSubject,
      refetchOnMountOrArgChange: true // Ensure fresh data whenever class/subject changes
    }
  );

  const [submitMarks, { isLoading: isSubmitting }] = useSubmitMarksMutation();

  // Auto-select class and subject if params are provided
  useEffect(() => {
    if (params.classId && params.subjectId && classes && subjects) {
      const cls = classes.find(c => c._id === params.classId);
      const sub = subjects.find(s => s._id === params.subjectId);
      
      if (cls && sub) {
        setSelectedClass(cls);
        setSelectedSubject(sub);
        setStep(1); // Start at exam type selection
      }
    }
  }, [params.classId, params.subjectId, classes, subjects]);

  // Reset marks when students or exam type changes, then pre-fill with saved data for the current exam type
  useEffect(() => {
    if (students && selectedExamType) {
      const examField = selectedExamType.id.toLowerCase(); // 'monthly1', 'midterm', etc.
      const initialMarks = {};
      const initialRemarks = {};
      students.forEach(student => {
        const saved = existingMarks?.[student._id];
        // Only pre-fill for the CURRENT exam type — not other exams
        const savedScore = saved?.[examField];
        initialMarks[student._id] = savedScore != null && savedScore > 0 ? String(savedScore) : '';
        initialRemarks[student._id] = saved?.remarks || '';
      });
      setMarksData(initialMarks);
      setRemarksData(initialRemarks);
    }
  }, [students, selectedExamType, existingMarks]);

  const handleStep1 = (type) => {
    setSelectedExamType(type);
    setStep(2);
  };

  const handleStep2 = (cls, sub) => {
    setSelectedClass(cls);
    setSelectedSubject(sub);
    
    // The subject ID is stored in 'subjectId' for taught subjects
    const targetSubjectId = sub.subjectId || sub._id;
    const targetClassId = cls._id;
    
    const exam = exams?.find(e => {
      const examClassId = e.class?._id || e.class;
      const examSubId = e.subject?._id || e.subject;
      
      return String(examClassId) === String(targetClassId) && 
             String(examSubId) === String(targetSubjectId) && 
             e.term === selectedExamType.id;
    });

    setSelectedExam(exam);
    setStep(3);
  };

  const handleUploadExam = async () => {
    if (!selectedExam) {
      Alert.alert('Error', 'No exam has been scheduled by Admin for this subject/class');
      return;
    }
    try {
      await markPresent(selectedExam._id).unwrap();
      Alert.alert('Success', 'Exam has been uploaded/marked as present');
      // Refresh selected exam state
      setSelectedExam({ ...selectedExam, status: 'Present' });
    } catch (err) {
      Alert.alert('Error', err?.data?.message || 'Failed to upload exam');
    }
  };

  const updateScore = (studentId, value) => {
    setMarksData(prev => ({ ...prev, [studentId]: value }));
  };

  const updateRemarks = (studentId, value) => {
    setRemarksData(prev => ({ ...prev, [studentId]: value }));
  };

  const handleSubmit = async () => {
    // Only include students where the teacher actually entered a score
    const formattedData = Object.entries(marksData)
      .filter(([, score]) => score !== '' && score !== null && score !== undefined)
      .map(([studentId, score]) => ({
        studentId,
        score: parseFloat(score) || 0,
        remarks: remarksData[studentId] || ''
      }));

    if (formattedData.length === 0) {
      Alert.alert('No Marks Entered', 'Please enter scores for at least one student before submitting.');
      return;
    }

    Alert.alert(
      'Confirm Submission',
      `You are about to save ${selectedExamType?.label} marks for ${formattedData.length} student(s). This will ONLY update the ${selectedExamType?.label} scores.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              await submitMarks({
                subjectId: selectedSubject._id,
                classId: selectedClass._id,
                examType: selectedExamType.id.toLowerCase(),
                studentMarks: formattedData
              }).unwrap();
              
              Alert.alert('Success', `${selectedExamType.label} marks saved successfully! Other exam scores are not affected.`);
              setStep(1);
              setSelectedExamType(null);
              setSelectedClass(null);
              setSelectedSubject(null);
              setSelectedExam(null);
            } catch (err) {
              Alert.alert('Error', err?.data?.message || 'Failed to submit marks');
            }
          }
        }
      ]
    );
  };

  if (classesLoading || subjectsLoading || examsLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: T.bg }]}>
        <ActivityIndicator size="large" color={T.primary} />
      </View>
    );
  }

  const getStepTitle = () => {
    if (step === 1) return 'Select Exam';
    if (step === 2) return 'Select Class';
    return 'Exam Management';
  };

  const getStepSubtitle = () => {
    if (step === 1) return 'Choose which exam marks to record';
    if (step === 2) return `Grading for: ${selectedExamType?.label}`;
    return `${selectedExamType?.label} • ${selectedSubject?.name}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: T.bg }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: T.card, borderBottomColor: T.border }]}>
        <View style={styles.headerContent}>
          {step > 1 && (
            <TouchableOpacity onPress={() => setStep(step - 1)} style={[styles.backBtn, { backgroundColor: T.input }]}>
              <ChevronLeft size={24} color={T.text} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={[styles.headerTitle, { color: T.text }]}>{getStepTitle()}</Text>
            <Text style={[styles.headerSubtitle, { color: T.subText }]}>{getStepSubtitle()}</Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1 }}>
        {/* Step 1: Select Exam Type */}
        {step === 1 && (
          <View style={styles.selectionGrid}>
            {EXAM_TYPES.map(type => (
              <TouchableOpacity 
                key={type.id} 
                style={styles.typeCard}
                onPress={() => handleStep1(type)}
              >
                <View style={[styles.typeIcon, { backgroundColor: '#ECFDF5' }]}>
                  <FileText size={28} color="#10B981" />
                </View>
                <Text style={styles.typeLabel}>{type.label}</Text>
                <Text style={styles.typeDesc}>Record marks for {type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 2: Select Class/Subject */}
        {step === 2 && (
          <ScrollView contentContainerStyle={styles.listPadding}>
            {classes?.map(cls => {
              const classSubjects = subjects?.filter(s => s.class?._id === cls._id || s.class === cls._id);
              return classSubjects?.map(sub => (
                <TouchableOpacity 
                  key={`${cls._id}-${sub._id}`}
                  style={styles.examCard}
                  onPress={() => handleStep2(cls, sub)}
                >
                  <View style={styles.examIcon}>
                    <LayoutGrid size={24} color="#10B981" />
                  </View>
                  <View style={styles.examInfo}>
                    <Text style={styles.examName}>{sub.name}</Text>
                    <Text style={styles.examDetails}>{cls.name} • Section {cls.section}</Text>
                  </View>
                  <ArrowRight size={20} color="#cbd5e1" />
                </TouchableOpacity>
              ));
            })}
          </ScrollView>
        )}

        {/* Step 3: Direct Marks Entry — each exam type is independent */}
        {step === 3 && (
          <View style={{ flex: 1 }}>
            {!selectedExam || selectedExam.status !== 'Published' ? (
              <View style={styles.uploadContainer}>
                <View style={styles.uploadIconCircle}>
                  <AlertCircle size={40} color="#10B981" />
                </View>
                <Text style={styles.uploadTitle}>Exam Not Ready</Text>
                <Text style={styles.uploadDesc}>
                  The school admin has not yet registered or published the {selectedExamType?.label} exam for {selectedSubject?.name}. You cannot record scores until the school admin creates it.
                </Text>
              </View>
            ) : studentsLoading ? (
              <ActivityIndicator style={{ marginTop: 40 }} color="#10B981" />
            ) : !students || students.length === 0 ? (
              <View style={styles.uploadContainer}>
                <Text style={styles.uploadTitle}>No Students Found</Text>
                <Text style={styles.uploadDesc}>There are no students enrolled in this class yet.</Text>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <FlatList
                  data={students}
                  keyExtractor={item => item._id}
                  contentContainerStyle={[styles.listPadding, { paddingBottom: 120 }]}
                  renderItem={({ item }) => (
                    <View style={styles.studentMarkItem}>
                      <View style={styles.studentHeader}>
                        <View style={styles.studentAvatar}>
                          <UserIcon size={20} color="#64748b" />
                        </View>
                        <View style={styles.studentDetails}>
                          <Text style={styles.studentName}>{item.name}</Text>
                          <Text style={styles.studentId}>ID: {item.customId}</Text>
                        </View>
                        <View style={styles.bulkInputContainer}>
                          <Text style={styles.inputLabel}>Score</Text>
                          <TextInput
                            style={styles.bulkInput}
                            placeholder="0.0"
                            keyboardType="numeric"
                            value={marksData[item._id]}
                            onChangeText={(val) => updateScore(item._id, val)}
                          />
                        </View>
                      </View>
                      <TextInput
                        style={styles.remarksInput}
                        placeholder="Remarks (optional)..."
                        value={remarksData[item._id]}
                        onChangeText={(val) => updateRemarks(item._id, val)}
                        placeholderTextColor="#94a3b8"
                      />
                    </View>
                  )}
                />

                <View style={styles.footer}>
                  <TouchableOpacity 
                    style={styles.submitBtn} 
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Check size={20} color="#fff" strokeWidth={3} />
                        <Text style={styles.submitBtnText}>Submit {selectedExamType?.label} Marks</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    marginTop: 2,
  },
  selectionGrid: {
    padding: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  typeCard: {
    backgroundColor: '#fff',
    width: (width - 56) / 2,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
  },
  typeIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  typeDesc: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    fontWeight: '600',
  },
  listPadding: {
    padding: 20,
  },
  examCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  examIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  examInfo: {
    flex: 1,
  },
  examName: {
    fontSize: 16,    fontWeight: '700',
    color: '#1e293b',
  },
  examDetails: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  studentMarkItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
  },
  studentId: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  bulkInputContainer: {
    width: 80,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bulkInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 8,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: '#10B981',
    width: '100%',
  },
  remarksInput: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    fontSize: 12,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  submitBtn: {
    backgroundColor: '#10B981',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  uploadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  uploadIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
  },
  uploadDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  uploadBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default MarksEntry;


