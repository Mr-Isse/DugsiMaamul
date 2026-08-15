import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Check, 
  Clock, 
  BookOpen, 
  UserSquare2,
  AlertCircle,
  User
} from 'lucide-react';
import { 
  useGetSchedulesQuery, 
  useCreateScheduleMutation, 
  useUpdateScheduleMutation, 
  useDeleteScheduleMutation,
  useGetClassesQuery,
  useGetClassByIdQuery,
  useGetTeachersQuery,
  useGetTeacherScheduleQuery,
  useGetStudentScheduleQuery
} from '../store/adminApiSlice';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Skeleton } from '../components/ui/skeleton';
import ConfirmModal from '../components/ConfirmModal';
import { Globe } from 'lucide-react';

// Days in correct order: Saturday → Friday
const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const COLORS = [
  '#4F46E5', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

const ScheduleManagement = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDay, setSelectedDay] = useState('Saturday');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [timeError, setTimeError] = useState('');
  const [teacherError, setTeacherError] = useState('');
  
  const [formData, setFormData] = useState({
    subjectId: '',
    teacherId: '',
    teacherName: '',
    day: 'Saturday',
    startTime: '',
    endTime: '',
    color: COLORS[0]
  });

  // Admin query
  const { data: schedules, isLoading: schedulesLoading } = useGetSchedulesQuery(selectedClassId, { 
    skip: userInfo?.role !== 'schooladmin' || !selectedClassId 
  });
  
  // Teacher query
  const { data: teacherSchedules, isLoading: teacherLoading } = useGetTeacherScheduleQuery(undefined, { 
    skip: userInfo?.role !== 'teacher' 
  });

  const { selectedBranch } = useSelector((state) => state.branch);

  // Student query
  const { data: studentSchedules, isLoading: studentLoading } = useGetStudentScheduleQuery(undefined, { 
    skip: userInfo?.role !== 'student' 
  });

  const { data: classes } = useGetClassesQuery(undefined, { skip: userInfo?.role !== 'schooladmin' });
  const { data: classDetail } = useGetClassByIdQuery(selectedClassId, {
    skip: userInfo?.role !== 'schooladmin' || !selectedClassId,
  });
  const { data: teachers } = useGetTeachersQuery(undefined, { skip: userInfo?.role !== 'schooladmin' });

  const [createSchedule, { isLoading: isCreating }] = useCreateScheduleMutation();
  const [updateSchedule, { isLoading: isUpdating }] = useUpdateScheduleMutation();
  const [deleteSchedule] = useDeleteScheduleMutation();

  const activeSchedules = userInfo?.role === 'schooladmin' 
    ? schedules 
    : userInfo?.role === 'teacher' 
    ? teacherSchedules 
    : studentSchedules;

  const isLoading = schedulesLoading || teacherLoading || studentLoading;

  // Get available subjects for selected class
  const availableSubjects = useMemo(() => {
    return classDetail?.subjects || [];
  }, [classDetail]);

  // Auto-select teacher when subject changes
  useEffect(() => {
    if (!formData.subjectId || !classDetail) return;

    // Find the subject assignment in class detail
    const subjectAssignment = classDetail.subjects?.find(
      s => s._id === formData.subjectId || s.assignmentId === formData.subjectId
    );

    if (subjectAssignment?.teacher) {
      // Teacher is assigned to this subject in this class
      setFormData(prev => ({
        ...prev,
        teacherId: subjectAssignment.teacher._id,
        teacherName: subjectAssignment.teacher.name
      }));
      setTeacherError('');
    } else {
      // No teacher assigned
      setFormData(prev => ({
        ...prev,
        teacherId: '',
        teacherName: ''
      }));
      setTeacherError('No teacher assigned to this subject for this class');
    }
  }, [formData.subjectId, classDetail]);

  // Validate time when start or end time changes
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      if (formData.endTime <= formData.startTime) {
        setTimeError('End time must be after start time');
      } else {
        setTimeError('');
      }
    } else {
      setTimeError('');
    }
  }, [formData.startTime, formData.endTime]);

  const handleOpenModal = (schedule = null) => {
    if (userInfo?.role !== 'schooladmin') return;
    
    setTimeError('');
    setTeacherError('');
    
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        subjectId: schedule.subject?._id,
        teacherId: schedule.teacher?._id,
        teacherName: schedule.teacher?.name || '',
        day: schedule.day,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        color: schedule.color
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        subjectId: '',
        teacherId: '',
        teacherName: '',
        day: selectedDay,
        startTime: '',
        endTime: '',
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate time
    if (formData.endTime <= formData.startTime) {
      toast.error('End time must be after start time');
      return;
    }
    
    // Validate teacher is assigned
    if (!formData.teacherId) {
      toast.error('No teacher assigned to this subject for this class');
      return;
    }
    
    try {
      if (editingSchedule) {
        await updateSchedule({ 
          id: editingSchedule._id, 
          subjectId: formData.subjectId,
          teacherId: formData.teacherId,
          day: formData.day,
          startTime: formData.startTime,
          endTime: formData.endTime,
          color: formData.color,
          classId: selectedClassId 
        }).unwrap();
        toast.success('Schedule updated successfully');
      } else {
        await createSchedule({ 
          subjectId: formData.subjectId,
          teacherId: formData.teacherId,
          day: formData.day,
          startTime: formData.startTime,
          endTime: formData.endTime,
          color: formData.color,
          classId: selectedClassId 
        }).unwrap();
        toast.success('Schedule created successfully');
      }
      setIsModalOpen(false);
    } catch (err) {
      const errorMsg = err?.data?.userMessage || err?.data?.message;
      if (errorMsg?.includes('conflict') || errorMsg?.includes('overlap') || errorMsg?.includes('already') || errorMsg?.includes('booked')) {
        toast.error(errorMsg || 'This time slot is already booked. Please choose a different time.');
      } else if (errorMsg?.includes('teacher')) {
        toast.error(errorMsg || 'Unable to assign teacher. Please check the subject and class assignments.');
      } else {
        toast.error('Unable to save schedule. Please try again.');
      }
    }
  };

  const handleDelete = async () => {
    if (!scheduleToDelete) return;
    
    try {
      await deleteSchedule(scheduleToDelete).unwrap();
      toast.success('Schedule deleted successfully');
      setScheduleToDelete(null);
    } catch (err) {
      const errorMsg = err?.data?.userMessage || err?.data?.message;
      if (errorMsg?.includes('not found') || errorMsg?.includes('delete')) {
        toast.error('Unable to delete schedule. Please try again.');
      } else {
        toast.error('Unable to delete schedule. Please try again.');
      }
    }
  };

  const confirmDeleteSchedule = (id) => {
    setScheduleToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const filteredSchedules = activeSchedules?.filter(s => s.day === selectedDay) || [];

  // Sort schedules by start time
  const sortedSchedules = useMemo(() => {
    return [...filteredSchedules].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
  }, [filteredSchedules]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
            <Calendar className="text-primary" size={28} />
            {userInfo?.role === 'schooladmin' ? 'Schedule Management' : 'Weekly Schedule'}
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
            {userInfo?.role === 'schooladmin' 
              ? 'Manage weekly timetables for all classes.' 
              : userInfo?.role === 'teacher' 
              ? 'View your teaching schedule for the week.'
              : 'View your class timetable and today\'s classes.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {userInfo?.role === 'schooladmin' && (
            <>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-bold focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
              >
                <option value="">Select Class</option>
                {classes?.map(c => (
                  <option key={c._id} value={c._id}>{c.name} - {c.section}</option>
                ))}
              </select>
              {selectedClassId && (
                <button 
                  onClick={() => handleOpenModal()}
                  className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 flex items-center justify-center gap-2 text-sm transform hover:-translate-y-0.5 active:scale-95"
                >
                  <Plus size={18} />
                  Add Period
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {userInfo?.role === 'schooladmin' && !selectedClassId ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No Class Selected</h3>
          <p className="text-gray-500">Please select a class to view and manage its schedule.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Day Selector - Mobile Friendly */}
          <div className="bg-white dark:bg-gray-800 p-1.5 sm:p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 p-1">
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                    selectedDay === day
                      ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02] sm:scale-105'
                      : 'bg-gray-50 dark:bg-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex flex-row items-center justify-between gap-3">
              <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <Clock size={18} className="text-primary sm:size-5" />
                <span className="truncate">{selectedDay}</span>
              </h3>
              <span className="text-[10px] sm:text-sm text-gray-500 font-bold bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-full whitespace-nowrap">
                {sortedSchedules.length} <span className="hidden sm:inline">Periods</span>
              </span>
            </div>

            <div className="p-4 sm:p-6">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                  ))}
                </div>
              ) : sortedSchedules.length === 0 ? (
                <div className="text-center py-10 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Calendar size={24} className="text-gray-300 sm:size-32" />
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 italic font-medium">No classes scheduled for {selectedDay}.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {sortedSchedules.map((schedule) => (
                    <motion.div
                      key={schedule._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 sm:p-5 border-l-4 shadow-sm hover:shadow-md transition-all border-l-primary"
                      style={{ borderLeftColor: schedule.color }}
                    >
                      <div className="flex justify-between items-start mb-2 sm:mb-3">
                        <div className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                          <BookOpen size={16} style={{ color: schedule.color }} className="sm:size-[18px]" />
                        </div>
                        {userInfo?.role === 'schooladmin' && (
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleOpenModal(schedule)}
                              className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors bg-white/50 dark:bg-gray-800/50"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => confirmDeleteSchedule(schedule._id)}
                              className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg transition-colors bg-white/50 dark:bg-gray-800/50"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                        {schedule.subject?.name}
                      </h4>
                      <div className="space-y-1 sm:space-y-1.5 mb-3 sm:mb-4">
                        {!selectedBranch && (
                          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                            <Globe size={12} /> {schedule.branch?.name || 'Main Branch'}
                          </p>
                        )}
                        <p className="text-[10px] sm:text-xs text-gray-500 font-bold flex items-center gap-1.5">
                          {userInfo?.role === 'teacher' ? (
                            <><Calendar size={12} className="text-gray-400" /> {schedule.class?.name} - {schedule.class?.section}</>
                          ) : (
                            <><UserSquare2 size={12} className="text-gray-400" /> {schedule.teacher?.name}</>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-2.5 sm:pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-1.5 font-black text-[10px] sm:text-xs" style={{ color: schedule.color }}>
                          <Clock size={12} className="sm:size-[13px]" />
                          {schedule.startTime} - {schedule.endTime}
                        </div>
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 dark:bg-gray-600 px-1.5 py-0.5 rounded">
                          {schedule.subject?.code}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      <AnimatePresence>
        {isModalOpen && userInfo?.role === 'schooladmin' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-[2rem] sm:rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center mb-5 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold font-heading">
                  {editingSchedule ? 'Edit Period' : 'Add Period'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <X size={20} className="sm:size-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
                {/* Day Selection */}
                <div className="space-y-1">
                  <label className="text-[11px] sm:text-xs font-bold ml-1 text-gray-500 uppercase tracking-wider">
                    Day <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.day}
                    onChange={(e) => setFormData({...formData, day: e.target.value})}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary outline-none text-sm font-bold"
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Subject Selection */}
                <div className="space-y-1">
                  <label className="text-[11px] sm:text-xs font-bold ml-1 text-gray-500 uppercase tracking-wider">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.subjectId}
                    onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary outline-none text-sm font-bold"
                  >
                    <option value="">Select Subject</option>
                    {availableSubjects.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                  {availableSubjects.length === 0 && (
                    <p className="text-[10px] text-amber-600 mt-1 font-medium">
                      No subjects assigned to this class.
                    </p>
                  )}
                </div>

                {/* Teacher - Auto-filled and Read-only */}
                <div className="space-y-1">
                  <label className="text-[11px] sm:text-xs font-bold ml-1 text-gray-500 uppercase tracking-wider">
                    Teacher
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.teacherName || 'Auto-assigned'}
                      disabled
                      className={`w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-gray-100 dark:bg-gray-600 border-none outline-none text-sm font-bold ${
                        teacherError ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    />
                  </div>
                  {teacherError && (
                    <div className="flex items-center gap-1 mt-1 text-red-500 text-[10px] font-bold">
                      <AlertCircle size={12} />
                      <span>{teacherError}</span>
                    </div>
                  )}
                </div>

                {/* Time Selection */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] sm:text-xs font-bold ml-1 text-gray-500 uppercase tracking-wider">
                      Start <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="w-full px-3 py-2.5 sm:py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary outline-none text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] sm:text-xs font-bold ml-1 text-gray-500 uppercase tracking-wider">
                      End <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className={`w-full px-3 py-2.5 sm:py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none outline-none text-sm font-bold ${
                        timeError ? 'ring-2 ring-red-500' : 'focus:ring-2 focus:ring-primary'
                      }`}
                    />
                  </div>
                </div>
                
                {/* Time Validation Error */}
                {timeError && (
                  <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 dark:bg-red-900/20 p-2.5 rounded-xl font-bold">
                    <AlertCircle size={14} />
                    <span>{timeError}</span>
                  </div>
                )}

                {/* Color Tag */}
                <div className="space-y-2">
                  <label className="text-[11px] sm:text-xs font-bold ml-1 text-gray-500 uppercase tracking-wider">Color Tag</label>
                  <div className="flex flex-wrap gap-2.5 sm:gap-3">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData({...formData, color: c})}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full transition-transform ${formData.color === c ? 'scale-110 ring-2 ring-offset-2 ring-primary' : 'hover:scale-105'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isCreating || isUpdating || !!timeError || !!teacherError || !formData.teacherId}
                  className="w-full py-3.5 sm:py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating || isUpdating ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <><Check size={18} /> {editingSchedule ? 'Update' : 'Create'}</>
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
        onConfirm={handleDelete}
        title="Delete Schedule"
        message="Are you sure you want to delete this class period? This action will remove it from the weekly timetable."
        confirmText="Delete Period"
      />
    </div>
  );
};

export default ScheduleManagement;
