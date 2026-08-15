import { useMemo, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';

import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import ConfirmModal from '../components/ConfirmModal';

import { BookOpen, Users, X, Plus, Check, ArrowLeft, Edit2, Trash2, ArrowRightLeft, GraduationCap, Phone, Calendar } from 'lucide-react';

import {
  useGetClassByIdQuery,
  useGetTeachersQuery,
  useGetSubjectsQuery,
  useGetStudentsInClassQuery,
  useGetClassesQuery,
  useAssignSubjectToClassMutation,
  useUpdateClassSubjectAssignmentMutation,
  useTransferStudentMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
} from '../store/adminApiSlice';



const tabs = [

  { id: 'subjects', label: 'Subjects', icon: BookOpen },

  { id: 'teachers', label: 'Teachers', icon: Users },

  { id: 'students', label: 'Students', icon: Users },

];



const ClassDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [activeTab, setActiveTab] = useState('subjects');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assignForm, setAssignForm] = useState({ subjectId: '', teacherId: '' });
  const [editClassForm, setEditClassForm] = useState({ name: '', section: '', maxStudents: '' });
  const [transferClassId, setTransferClassId] = useState('');

  const { data: cls, isLoading } = useGetClassByIdQuery(id);
  const { data: teachers } = useGetTeachersQuery();
  const { data: allSubjects } = useGetSubjectsQuery();
  const { data: students, isLoading: studentsLoading } = useGetStudentsInClassQuery(id, { skip: activeTab !== 'students' });
  const { data: allClasses } = useGetClassesQuery();

  const [assignSubjectToClass, { isLoading: isAssigning }] = useAssignSubjectToClassMutation();
  const [updateClassSubjectAssignment, { isLoading: isUpdating }] = useUpdateClassSubjectAssignmentMutation();
  const [transferStudent, { isLoading: isTransferring }] = useTransferStudentMutation();
  const [updateClass, { isLoading: isUpdatingClass }] = useUpdateClassMutation();
  const [deleteClass, { isLoading: isDeletingClass }] = useDeleteClassMutation();



  const subjects = cls?.subjects || [];



  const assignedSubjectIds = useMemo(

    () => new Set(subjects.map((s) => String(s._id)).filter(Boolean)),

    [subjects]

  );



  const availableSubjects = useMemo(

    () => (allSubjects || []).filter((s) => !assignedSubjectIds.has(String(s._id))),

    [allSubjects, assignedSubjectIds]

  );



  const teachersMap = useMemo(() => {

    const map = new Map();

    (teachers || []).forEach(t => map.set(t._id, t));

    return map;

  }, [teachers]);



  const teacherAssignments = useMemo(() => {

    const byTeacher = new Map();

    subjects.forEach(s => {

      const tid = s.teacher?._id || s.teacher;

      if (!tid) return;

      if (!byTeacher.has(tid)) byTeacher.set(tid, []);

      byTeacher.get(tid).push(s);

    });

    return [...byTeacher.entries()].map(([teacherId, subs]) => ({

      teacherId,

      teacherName: teachersMap.get(teacherId)?.name || subs[0]?.teacher?.name || 'Teacher',

      subjects: subs,

    }));

  }, [subjects, teachersMap]);

  // Get teachers already assigned to subjects in this class (excluding the current row)
  const getAssignedTeacherIds = (excludeAssignmentId) => {
    const ids = new Set();
    subjects.forEach(s => {
      // Exclude the current subject assignment being edited
      if ((s.assignmentId || s._id) === excludeAssignmentId) return;
      const tid = s.teacher?._id || s.teacher;
      if (tid) ids.add(tid);
    });
    return ids;
  };

  // Get available teachers for a specific subject assignment (for inline editing)
  const getAvailableTeachersForSubject = (assignmentId, subjectId) => {
    // We want teachers who:
    // 1. Are registered to teach this specific subject
    // 2. [Optional/Removed] Are not already assigned to another subject in this class
    // User requested: "only the subject assigned to the teachers who are registered with us should appear"
    // and "if he assigns another subject, that class should appear every time a subject is selected"
    
    return (teachers || []).filter(t => {
      // Check if teacher is qualified for this subject
      const teachesSubject = t.subjects?.some(sub => (sub._id || sub) === subjectId);
      return teachesSubject;
    });
  };

  // Get available teachers for new assignments (modal)
  const availableTeachers = useMemo(() => {
    if (!assignForm.subjectId) return [];
    
    return (teachers || []).filter(t => {
      // Check if teacher is qualified for the selected subject
      const teachesSubject = t.subjects?.some(sub => (sub._id || sub) === assignForm.subjectId);
      return teachesSubject;
    });
  }, [teachers, assignForm.subjectId]);



  const onAssignSubject = async (e) => {

    e.preventDefault();

    const subjectId = assignForm.subjectId;

    const teacherId = assignForm.teacherId;



    if (!subjectId) {

      toast.error('Select a subject');

      return;

    }

    if (!teacherId) {

      toast.error('Select a teacher');

      return;

    }



    try {

      await assignSubjectToClass({

        classId: cls._id,

        subjectId,

        teacherId,

      }).unwrap();

      toast.success('Subject assigned to class');

      setIsAddOpen(false);

      setAssignForm({ subjectId: '', teacherId: '' });

    } catch (err) {

      toast.error(err?.data?.message || 'Failed to assign subject');

    }

  };



  const onChangeTeacher = async (assignmentId, teacherId) => {

    if (!teacherId || !assignmentId) return;

    try {

      await updateClassSubjectAssignment({

        id: assignmentId,

        teacherId,

      }).unwrap();

      toast.success('Teacher updated');

    } catch (err) {

      toast.error(err?.data?.message || 'Failed to update teacher');
    }
  };

  // Handle class update
  const onUpdateClass = async (e) => {
    e.preventDefault();
    try {
      await updateClass({
        id: cls._id,
        classData: {
          name: editClassForm.name,
          section: editClassForm.section,
          maxStudents: parseInt(editClassForm.maxStudents),
        },
      }).unwrap();
      toast.success('Class updated successfully');
      setIsEditClassOpen(false);
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to update class');
    }
  };

  // Handle class delete
  const onDeleteClass = async () => {
    try {
      await deleteClass(cls._id).unwrap();
      toast.success('Class deleted successfully');
      navigate('/classes');
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to delete class');
    }
  };

  // Handle student transfer
  const onTransferStudent = async (e) => {
    e.preventDefault();
    if (!transferClassId) {
      toast.error('Please select a class');
      return;
    }
    try {
      await transferStudent({
        studentId: selectedStudent._id,
        newClassId: transferClassId,
      }).unwrap();
      toast.success(`Student transferred successfully`);
      setIsTransferOpen(false);
      setSelectedStudent(null);
      setTransferClassId('');
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to transfer student');
    }
  };

  // Open edit class modal
  const openEditClassModal = () => {
    setEditClassForm({
      name: cls.name,
      section: cls.section,
      maxStudents: cls.maxStudents,
    });
    setIsEditClassOpen(true);
  };

  // Open transfer modal
  const openTransferModal = (student) => {
    setSelectedStudent(student);
    setTransferClassId('');
    setIsTransferOpen(true);
  };

  // Skeleton Loading State
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }



  if (!cls) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center space-y-6 p-8 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="mx-auto w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center text-red-600 dark:text-red-400">
          <BookOpen size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black font-heading text-gray-900 dark:text-gray-100 tracking-tight">Class Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            The class you are looking for doesn't exist or has been removed.
          </p>
        </div>
        <button
          onClick={() => navigate('/classes')}
          className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft size={20} />
          Return to Classes
        </button>
      </div>
    );
  }



  return (

    <div className="space-y-6 max-w-7xl mx-auto">

      <div className="flex items-start justify-between gap-4">

        <div>

          <button

            type="button"

            onClick={() => navigate('/classes')}

            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"

          >

            <ArrowLeft size={16} />

            Back to classes

          </button>

          <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-gray-100 tracking-tight mt-2">
            {cls.name} — Section {cls.section}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Max students: {cls.maxStudents} | Current: {students?.length || 0}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={openEditClassModal}
            disabled={isUpdatingClass}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 flex items-center gap-2"
          >
            <Edit2 size={18} />
            Edit Class
          </button>
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            disabled={isDeletingClass}
            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200 flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete
          </button>
          {activeTab === 'subjects' && (
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200 flex items-center gap-2"
            >
              <Plus size={18} />
              Assign subject
            </button>
          )}
        </div>
      </div>



      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">

        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-wrap gap-2">

          {tabs.map(t => {

            const Icon = t.icon;

            const isActive = activeTab === t.id;

            return (

              <button

                key={t.id}

                type="button"

                onClick={() => setActiveTab(t.id)}

                className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors inline-flex items-center gap-2 ${

                  isActive

                    ? 'bg-primary text-white'

                    : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'

                }`}

              >

                <Icon size={16} />

                {t.label}

              </button>

            );

          })}

        </div>



        <div className="p-6">

          {activeTab === 'subjects' && (

            <div className="space-y-4">

              <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/20 p-4">

                <h2 className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Assign subjects</h2>

                <p className="text-sm text-gray-600 dark:text-gray-300">

                  Pick a subject from the school catalog and a teacher. Each teacher can only teach one subject per class.

                </p>

              </div>

              {subjects.length === 0 ? (

                <p className="text-sm text-gray-500 dark:text-gray-400">No subjects assigned yet. Use <span className="font-semibold">Assign subject</span> to add your first one.</p>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full text-left">

                    <thead>

                      <tr className="bg-gray-50 dark:bg-gray-700/50">

                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>

                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Code</th>

                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Teacher</th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">

                      {subjects.map(s => (

                        <tr key={s.assignmentId || s._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">

                          <td className="px-6 py-4">

                            <div className="flex items-center gap-2">

                              <BookOpen size={16} className="text-gray-400" />

                              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{s.name}</span>

                            </div>

                          </td>

                          <td className="px-6 py-4">

                            <span className="text-xs font-mono font-semibold text-gray-600 dark:text-gray-300">{s.code || '—'}</span>

                          </td>

                          <td className="px-6 py-4">

                            <select

                              value={s.teacher?._id || s.teacher || ''}

                              onChange={(e) => onChangeTeacher(s.assignmentId, e.target.value)}

                              disabled={isUpdating || !s.assignmentId}

                              className="w-full max-w-sm px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary outline-none text-sm"

                            >

                              <option value="">Select teacher</option>

                              {/* Show currently assigned teacher even if they're in the assigned list */}

                              {(s.teacher?._id || s.teacher) && !getAvailableTeachersForSubject(s.assignmentId, s._id).find(t => t._id === (s.teacher?._id || s.teacher)) && (

                                <option value={s.teacher?._id || s.teacher}>

                                  {teachersMap.get(s.teacher?._id || s.teacher)?.name || 'Current Teacher'}

                                </option>

                              )}

                              {/* Show only available teachers for this specific subject */}

                              {getAvailableTeachersForSubject(s.assignmentId, s._id).map(t => (

                                <option key={t._id} value={t._id}>{t.name}</option>

                              ))}

                            </select>

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          )}



          {activeTab === 'teachers' && (

            <div className="space-y-4">

              {/* Summary Cards */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="rounded-2xl border border-gray-100 dark:border-gray-700 p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">

                  <div className="flex items-center gap-3">

                    <div className="p-2 rounded-xl bg-blue-500/20">

                      <Users size={20} className="text-blue-600 dark:text-blue-400" />

                    </div>

                    <div>

                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Teachers</p>

                      <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{teachers?.length || 0}</p>

                    </div>

                  </div>

                </div>

                <div className="rounded-2xl border border-gray-100 dark:border-gray-700 p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">

                  <div className="flex items-center gap-3">

                    <div className="p-2 rounded-xl bg-green-500/20">

                      <Check size={20} className="text-green-600 dark:text-green-400" />

                    </div>

                    <div>

                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned</p>

                      <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{teacherAssignments.length}</p>

                    </div>

                  </div>

                </div>

                <div className="rounded-2xl border border-gray-100 dark:border-gray-700 p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">

                  <div className="flex items-center gap-3">

                    <div className="p-2 rounded-xl bg-amber-500/20">

                      <Users size={20} className="text-amber-600 dark:text-amber-400" />

                    </div>

                    <div>

                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Available</p>

                      <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{availableTeachers.length}</p>

                    </div>

                  </div>

                </div>

              </div>

              {teacherAssignments.length === 0 ? (

                <div className="text-center py-12">

                  <Users size={48} className="mx-auto text-gray-300 mb-4" />

                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">No Teacher Assignments</h3>

                  <p className="text-gray-500 dark:text-gray-400">Go to the Subjects tab to assign teachers to subjects.</p>

                </div>

              ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {teacherAssignments.map(t => (

                    <div key={t.teacherId} className="rounded-2xl border border-gray-100 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex items-center gap-3">

                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">

                            <span className="text-lg font-bold text-primary">{t.teacherName.charAt(0)}</span>

                          </div>

                          <div>

                            <h3 className="text-lg font-bold font-heading text-gray-900 dark:text-gray-100">{t.teacherName}</h3>

                            <p className="text-xs text-gray-500 dark:text-gray-400">

                              {t.subjects.length} {t.subjects.length === 1 ? 'subject' : 'subjects'}

                            </p>

                          </div>

                        </div>

                        <div className="px-2 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">

                          Assigned

                        </div>

                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">

                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Teaching</p>

                        <div className="flex flex-wrap gap-2">

                          {t.subjects.map(s => (

                            <span key={s.assignmentId || s._id} className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-bold flex items-center gap-1">

                              <BookOpen size={12} />

                              {s.name}

                            </span>

                          ))}

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

          )}



          {activeTab === 'students' && (
            <div className="space-y-4">
              {studentsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : students?.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">No Students Enrolled</h3>
                  <p className="text-gray-500">This class has no students yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-700/50">
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Student ID</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Age</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {students?.map((student) => (
                        <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono font-semibold text-primary">{student.customId || 'N/A'}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">{student.name?.charAt(0)}</span>
                              </div>
                              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{student.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                              <Phone size={14} />
                              {student.phone || <span className="text-gray-400 italic">Not Assigned</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {student.age ? `${student.age} yrs` : <span className="text-gray-400 italic">Not Assigned</span>}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => openTransferModal(student)}
                              className="px-3 py-1.5 bg-secondary/10 text-secondary rounded-lg text-xs font-bold hover:bg-secondary/20 transition-colors flex items-center gap-1"
                            >
                              <ArrowRightLeft size={14} />
                              Transfer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </div>



      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-heading tracking-tight text-gray-900 dark:text-gray-100">Assign subject</h2>
                <button 
                  type="button" 
                  onClick={() => setIsAddOpen(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={onAssignSubject} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold ml-1 text-gray-700 dark:text-gray-300">Subject</label>
                  <select
                    required
                    value={assignForm.subjectId}
                    onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value, teacherId: '' })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all duration-200"
                  >
                    <option value="">{availableSubjects.length ? 'Select subject' : 'All subjects assigned'}</option>
                    {availableSubjects.map((sub) => (
                      <option key={sub._id} value={sub._id}>{sub.name} ({sub.code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold ml-1 text-gray-700 dark:text-gray-300">Teacher</label>
                  <select
                    required
                    value={assignForm.teacherId}
                    onChange={(e) => setAssignForm({ ...assignForm, teacherId: e.target.value })}
                    disabled={!assignForm.subjectId}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">{assignForm.subjectId ? (availableTeachers.length ? 'Select teacher' : 'No qualified teachers') : 'Select subject first'}</option>
                    {availableTeachers.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                  {assignForm.subjectId && availableTeachers.length === 0 && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 font-semibold px-1 leading-tight">
                      No teachers are registered to teach this subject. Please register a teacher for this subject first.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isAssigning || !assignForm.subjectId || !assignForm.teacherId}
                  className="w-full py-3 mt-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                  {isAssigning ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <><Check size={18} /> Add to class</>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Edit Class Modal */}
        {isEditClassOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-heading tracking-tight text-gray-900 dark:text-gray-100">Edit Class</h2>
                <button 
                  type="button" 
                  onClick={() => setIsEditClassOpen(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={onUpdateClass} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold ml-1 text-gray-700 dark:text-gray-300">Class Name</label>
                  <input
                    type="text"
                    required
                    value={editClassForm.name}
                    onChange={(e) => setEditClassForm({ ...editClassForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all duration-200"
                    placeholder="e.g., Grade 10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold ml-1 text-gray-700 dark:text-gray-300">Section</label>
                  <input
                    type="text"
                    required
                    value={editClassForm.section}
                    onChange={(e) => setEditClassForm({ ...editClassForm, section: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all duration-200 uppercase"
                    placeholder="e.g., A"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold ml-1 text-gray-700 dark:text-gray-300">Max Students</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editClassForm.maxStudents}
                    onChange={(e) => setEditClassForm({ ...editClassForm, maxStudents: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-sm transition-all duration-200"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingClass}
                  className="w-full py-3 mt-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUpdatingClass ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <><Check size={18} /> Update Class</>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Transfer Student Modal */}
        {isTransferOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold font-heading tracking-tight text-gray-900 dark:text-gray-100">Transfer Student</h2>
                <button 
                  type="button" 
                  onClick={() => setIsTransferOpen(false)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-1">Student</p>
                <p className="font-bold text-gray-900 dark:text-gray-100 truncate">{selectedStudent.name}</p>
                <p className="text-xs text-primary font-mono font-bold mt-0.5">{selectedStudent.customId}</p>
              </div>

              <form onSubmit={onTransferStudent} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold ml-1 text-gray-700 dark:text-gray-300">Transfer to Class</label>
                  <select
                    required
                    value={transferClassId}
                    onChange={(e) => setTransferClassId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-secondary focus:ring-4 focus:ring-secondary/10 outline-none text-sm transition-all duration-200"
                  >
                    <option value="">Select target class</option>
                    {allClasses?.filter(c => c._id !== id).map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} — Section {cls.section}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isTransferring || !transferClassId}
                  className="w-full py-3 mt-2 bg-secondary text-white rounded-xl font-bold shadow-lg shadow-secondary/25 hover:bg-secondary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isTransferring ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Transferring...</span>
                    </div>
                  ) : (
                    <><ArrowRightLeft size={18} /> Transfer Student</>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={onDeleteClass}
        title="Delete Class"
        message={`Are you sure you want to delete class ${cls?.name}? This action cannot be undone and will remove all student associations.`}
        confirmText="Delete Class"
      />
    </div>
  );
};

export default ClassDetail;


