import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Filter, 
  Search, 
  Download, 
  Upload,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  BarChart3,
  ClipboardCheck,
  X,
  Check,
  BookOpen
} from 'lucide-react';
import { PageLayout, PageHeader, ContentCard, StatsGrid2 } from '../components/PageLayout';
import { useNavigate } from 'react-router-dom';
import { 
  useGetAttendanceQuery, 
  useGetClassesQuery,
  useGetAssignedClassesQuery, 
  useGetTaughtSubjectsQuery,
  useGetStudentsInClassQuery,
  useGetSubjectsQuery,
  useGetClassByIdQuery,
  useTakeAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useGetBranchesQuery
} from '../store/adminApiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import { AttendanceTrend, PresentAbsentPie, TopAbsentStudents } from '../components/charts/AttendanceCharts';
import ConfirmModal from '../components/ConfirmModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../components/ui/Dialog';

const AttendanceManagement = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { selectedBranch } = useSelector((state) => state.branch);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  
  // Modal state
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attendanceData, setAttendanceData] = useState([]); // [{ studentId, status }]

  const { data: attendance, isLoading } = useGetAttendanceQuery();
  const { data: adminClasses } = useGetClassesQuery(undefined, { skip: userInfo?.role !== 'schooladmin' });
  const { data: assignedClasses } = useGetAssignedClassesQuery(undefined, { skip: userInfo?.role !== 'teacher' });
  const { data: taughtSubjects } = useGetTaughtSubjectsQuery(undefined, { skip: userInfo?.role !== 'teacher' });
  const { data: classStudents, isLoading: studentsLoading } = useGetStudentsInClassQuery(selectedClass, { skip: !selectedClass });
  const { data: selectedClassDetail } = useGetClassByIdQuery(selectedClass, { skip: !selectedClass || userInfo?.role !== 'schooladmin' });
  const { data: allSubjects } = useGetSubjectsQuery(undefined, { skip: userInfo?.role !== 'schooladmin' });
  const [takeAttendance, { isLoading: isSubmitting }] = useTakeAttendanceMutation();
  const [updateAttendance, { isLoading: isUpdating }] = useUpdateAttendanceMutation();
  const [deleteAttendance, { isLoading: isDeleting }] = useDeleteAttendanceMutation();

  const availableClassesForFilter = userInfo?.role === 'schooladmin' ? adminClasses : assignedClasses;

  useEffect(() => {
    if (classStudents) {
      setAttendanceData(classStudents.map(s => ({ studentId: s._id, name: s.name, customId: s.customId, status: 'Present' })));
    }
  }, [classStudents]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => prev.map(item => 
      item.studentId === studentId ? { ...item, status } : item
    ));
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject) {
      return toast.error('Please select class and subject');
    }
    try {
      await takeAttendance({
        classId: selectedClass,
        subjectId: selectedSubject,
        studentsAttendance: attendanceData.map(({ studentId, status }) => ({ studentId, status })),
        date: new Date(),
        isAdmin: userInfo?.role === 'schooladmin'
      }).unwrap();
      toast.success('Attendance recorded successfully');
      setIsModalOpen(false);
      setSelectedClass('');
      setSelectedSubject('');
    } catch (err) {
      const errorMsg = err?.data?.userMessage || err?.data?.message;
      if (errorMsg?.includes('already') || errorMsg?.includes('exists')) {
        toast.error('Attendance has already been recorded for this class and subject.');
      } else if (errorMsg?.includes('validation')) {
        toast.error('Please check the attendance data and try again.');
      } else {
        toast.error('Unable to record attendance. Please try again.');
      }
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Present': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Absent': return 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400';
      case 'Late': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Excused': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Handle edit attendance
  const handleEditAttendance = (record) => {
    setSelectedAttendance(record);
    setEditStatus(record.status);
    setIsEditModalOpen(true);
  };

  // Handle update attendance
  const handleUpdateAttendance = async (e) => {
    e.preventDefault();
    if (!selectedAttendance || !editStatus) return;
    
    try {
      await updateAttendance({
        id: selectedAttendance._id,
        status: editStatus,
      }).unwrap();
      toast.success('Attendance updated successfully');
      setIsEditModalOpen(false);
      setSelectedAttendance(null);
    } catch (err) {
      const errorMsg = err?.data?.userMessage || err?.data?.message;
      if (errorMsg?.includes('not found')) {
        toast.error('Attendance record not found. It may have been deleted.');
      } else {
        toast.error('Unable to update attendance. Please try again.');
      }
    }
  };

  // Handle delete attendance
  const handleDeleteAttendance = async () => {
    if (!attendanceToDelete) return;
    
    try {
      await deleteAttendance(attendanceToDelete).unwrap();
      toast.success('Attendance record deleted successfully');
      setAttendanceToDelete(null);
    } catch (err) {
      const errorMsg = err?.data?.userMessage || err?.data?.message;
      toast.error(errorMsg || 'Unable to delete attendance record. Please try again.');
    }
  };

  const confirmDelete = (id) => {
    setAttendanceToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Calculate attendance percentage for a specific student
  const getStudentAttendanceRate = (studentId) => {
    if (!attendance || !studentId) return 0;
    const studentRecords = attendance.filter(record => record.user?._id === studentId);
    if (studentRecords.length === 0) return 100; // Default if no records
    
    const presentCount = studentRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
    return Math.round((presentCount / studentRecords.length) * 100);
  };

  const filteredAttendance = attendance?.filter(record => {
    const matchesSearch = record.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         record.user?.customId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
    const matchesClass = classFilter === 'All' || record.class?._id === classFilter;
    return matchesSearch && matchesStatus && matchesClass;
  });

  const getAbsentThisMonth = () => {
    if (!attendance) return 0;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const absentRecords = attendance.filter(a => {
      const attendanceDate = new Date(a.date);
      return a.status === 'Absent' && attendanceDate >= startOfMonth;
    });
    // Get unique student IDs who were absent at least once this month
    const uniqueAbsentStudents = new Set(absentRecords.map(a => a.user?._id));
    return uniqueAbsentStudents.size;
  };

  // Skeleton Loading State
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-32 w-full" />
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <PageHeader 
        title="Attendance Management" 
        description={userInfo?.role === 'teacher' ? 'Record and manage attendance for your assigned subjects.' : 'Monitor daily attendance across all classes and sections.'}
        actions={(userInfo?.role === 'teacher' || userInfo?.role === 'schooladmin') ? (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={18} />
            Take Attendance
          </button>
        ) : undefined}
      />

      <StatsGrid2>
        <ContentCard className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
            <CheckCircle2 size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">Present Today</p>
            <h3 className="text-lg sm:text-2xl font-bold truncate">{attendance?.filter(a => a.status === 'Present' && new Date(a.date).toDateString() === new Date().toDateString()).length || 0}</h3>
          </div>
        </ContentCard>
        <ContentCard className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/30">
            <XCircle size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">Absent Today</p>
            <h3 className="text-lg sm:text-2xl font-bold truncate">{attendance?.filter(a => a.status === 'Absent' && new Date(a.date).toDateString() === new Date().toDateString()).length || 0}</h3>
          </div>
        </ContentCard>
        <ContentCard className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/30">
            <XCircle size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">Monthly Absents</p>
            <h3 className="text-lg sm:text-2xl font-bold truncate">{getAbsentThisMonth()}</h3>
          </div>
        </ContentCard>
        <ContentCard className="flex items-center gap-3 sm:gap-4">
          <div className="p-2 sm:p-3 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30">
            <Clock size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400">Late Arrivals</p>
            <h3 className="text-lg sm:text-2xl font-bold truncate">{attendance?.filter(a => a.status === 'Late' && new Date(a.date).toDateString() === new Date().toDateString()).length || 0}</h3>
          </div>
        </ContentCard>
      </StatsGrid2>

      <div className="grid gap-6 lg:grid-cols-3 mt-4">
        <div className="rounded-2xl bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Attendance Trend</h3>
          {isLoading ? <Skeleton className="h-48 w-full" /> : <AttendanceTrend attendance={attendance || []} />}
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Present vs Absent</h3>
          {isLoading ? <Skeleton className="h-48 w-full" /> : <PresentAbsentPie attendance={attendance || []} />}
        </div>

        <div className="rounded-2xl bg-white dark:bg-gray-800 p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Top Absent Students</h3>
          {isLoading ? <Skeleton className="h-48 w-full" /> : <TopAbsentStudents attendance={attendance || []} />}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition-all"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Filter size={18} className="text-gray-400 hidden sm:block" />
            <select 
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="flex-1 sm:flex-none bg-gray-50 dark:bg-gray-700 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none min-w-[120px]"
            >
              <option value="All">All Classes</option>
              {availableClassesForFilter?.map(c => (
                <option key={c._id} value={c._id}>{c.name} - {c.section}</option>
              ))}
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-none bg-gray-50 dark:bg-gray-700 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none min-w-[120px]"
            >
              <option value="All">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
          {filteredAttendance?.length > 0 ? (
            filteredAttendance.map((record) => (
              <div key={record._id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{record.user?.name}</span>
                    <span className="text-[10px] text-primary font-bold uppercase">{record.user?.customId}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(record.status)}`}>
                    {record.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen size={12} />
                    {record.subject?.name || 'General'}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-50 dark:border-gray-700">
                  <span className="text-[10px] font-bold text-gray-400">
                    Rate: <span className={getStudentAttendanceRate(record.user?._id) >= 70 ? 'text-emerald-500' : 'text-rose-500'}>
                      {getStudentAttendanceRate(record.user?._id)}%
                    </span>
                  </span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEditAttendance(record)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => confirmDelete(record._id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">No attendance records found</div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block">
          <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                <th className="sticky left-0 z-20 bg-gray-50 dark:bg-gray-700 px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student</th>
                {!selectedBranch && <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Branch</th>}
                <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Class</th>
                <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subject</th>
                <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                {userInfo?.role === 'schooladmin' && (
                  <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rate</th>
                )}
                <th className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredAttendance?.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                  <td className="px-4 py-4 text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/30 px-4 py-4 border-r border-gray-100/50 dark:border-gray-700/50 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                    <div className="flex flex-col min-w-[100px]">
                      <span className="text-xs md:text-sm font-bold text-gray-900 dark:text-gray-100 truncate max-w-[120px]">{record.user?.name}</span>
                      <span className="text-[10px] md:text-xs text-primary font-medium">{record.user?.customId}</span>
                    </div>
                  </td>
                  {!selectedBranch && (
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                        {record.branch?.name || 'Main Branch'}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-4 text-xs md:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {record.class ? `${record.class.name}` : 'N/A'}
                  </td>
                  <td className="px-4 py-4 text-xs md:text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                    {record.subject?.name || 'General'}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusStyle(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  {userInfo?.role === 'schooladmin' && (
                    <td className="px-4 py-4">
                      <span className={`text-[10px] md:text-xs font-bold ${
                        getStudentAttendanceRate(record.user?._id) >= 85 ? 'text-emerald-600 dark:text-emerald-400' : 
                        getStudentAttendanceRate(record.user?._id) >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {getStudentAttendanceRate(record.user?._id)}%
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 md:gap-2">
                      <button 
                        onClick={() => handleEditAttendance(record)}
                        disabled={isUpdating || isDeleting}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        onClick={() => confirmDelete(record._id)}
                        disabled={isUpdating || isDeleting}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Take Attendance Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl dark:bg-gray-900 !p-0 !gap-0 overflow-hidden" style={{ maxHeight: '94vh' }}>
          <DialogHeader className="sr-only">
            <DialogTitle>Take Attendance</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col h-full">
            <div className="bg-indigo-600 px-8 py-8 text-white shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
              <div className="flex justify-between items-center relative z-10">
                <div>
                  <h2 className="text-3xl font-black font-heading tracking-tight">Take Attendance</h2>
                  <p className="text-white/70 text-sm font-bold mt-1">Record daily attendance for your class</p>
                </div>
                <DialogClose className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                  <X size={24} className="text-white" />
                </DialogClose>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col p-8 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Select Class</label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500/30 outline-none transition-all text-sm font-bold"
                  >
                    <option value="">Choose Class...</option>
                    {userInfo?.role === 'schooladmin' 
                      ? adminClasses?.map(c => (
                          <option key={c._id} value={c._id}>{c.name} {c.section}</option>
                        ))
                      : assignedClasses?.map(c => (
                          <option key={c._id} value={c._id}>{c.name} {c.section}</option>
                        ))
                    }
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Select Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    disabled={!selectedClass}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500/30 outline-none transition-all text-sm font-bold disabled:opacity-50"
                  >
                    <option value="">Choose Subject...</option>
                    {userInfo?.role === 'schooladmin'
                      ? selectedClassDetail?.subjects?.map(s => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))
                      : taughtSubjects?.filter(s => String(s.class?._id || s.class) === String(selectedClass)).map(s => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))
                    }
                  </select>
                </div>
              </div>

              {selectedClass ? (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Students List</h3>
                    <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest">
                      {attendanceData.length} Total
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-6">
                    {studentsLoading ? (
                      <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Fetching class roster...</p>
                      </div>
                    ) : attendanceData.length > 0 ? (
                      attendanceData.map((student) => (
                        <div key={student.studentId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/30 rounded-3xl border border-gray-100 dark:border-gray-700/50 gap-4 group hover:border-indigo-500/30 transition-all hover:shadow-lg hover:shadow-indigo-500/5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg shadow-sm border border-white dark:border-gray-700">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black text-gray-900 dark:text-gray-100 leading-tight truncate">{student.name}</p>
                              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{student.customId}</p>
                            </div>
                          </div>
                          <div className="flex flex-row gap-1.5 w-full sm:w-auto">
                            {[
                              { id: 'Present', label: 'Present', color: 'emerald' },
                              { id: 'Absent', label: 'Absent', color: 'red' },
                              { id: 'Late', label: 'Late', color: 'amber' },
                              { id: 'Excused', label: 'Excused', color: 'blue' }
                            ].map((status) => (
                              <button
                                key={status.id}
                                type="button"
                                onClick={() => handleStatusChange(student.studentId, status.id)}
                                className={`flex-1 sm:flex-none px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                  student.status === status.id 
                                    ? `bg-${status.color}-100 text-${status.color}-700 dark:bg-${status.color}-900/30 dark:text-${status.color}-400 shadow-sm ring-1 ring-${status.color}-500/20`
                                    : 'bg-white dark:bg-gray-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-100 dark:border-gray-600'
                                }`}
                              >
                                {status.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-16 bg-gray-50/50 dark:bg-gray-800/30 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <Users size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-xs text-gray-400 font-black uppercase tracking-widest">No students found in this class.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20 px-8">
                  <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] flex items-center justify-center mb-6">
                    <ClipboardCheck size={40} className="text-indigo-400" />
                  </div>
                  <p className="text-sm font-black text-gray-400 uppercase tracking-widest max-w-[250px] leading-relaxed">Select a class and subject to start taking attendance</p>
                </div>
              )}

              <div className="pt-6 mt-auto shrink-0 border-t border-gray-50 dark:border-gray-800">
                <button
                  type="submit"
                  onClick={handleSubmitAttendance}
                  disabled={isSubmitting || !selectedClass || !selectedSubject || attendanceData.length === 0}
                  className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Check size={20} /> Submit Attendance</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Attendance Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-heading">Edit Attendance</DialogTitle>
          </DialogHeader>

          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-sm text-gray-500 dark:text-gray-400">Student</p>
            <p className="font-bold text-gray-900 dark:text-gray-100">{selectedAttendance?.user?.name}</p>
            <p className="text-sm text-primary font-mono">{selectedAttendance?.user?.customId}</p>
            <p className="text-xs text-gray-400 mt-2">
              {selectedAttendance ? `${new Date(selectedAttendance.date).toLocaleDateString()} • ${selectedAttendance.class?.name} ${selectedAttendance.class?.section}` : ''}
            </p>
          </div>

          <form onSubmit={handleUpdateAttendance} className="space-y-4">
            <div>
              <label className="text-sm font-bold mb-2 block">Status</label>
              <div className="grid grid-cols-2 gap-3">
                {['Present', 'Absent', 'Late', 'Excused'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setEditStatus(status)}
                    className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      editStatus === status
                        ? getStatusStyle(status)
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdating || !editStatus}
              className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-6"
            >
              {isUpdating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <><Check size={20} /> Update Attendance</>
              )}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAttendance}
        title="Delete Attendance Record"
        message="Are you sure you want to delete this attendance record? This action cannot be undone."
        confirmText="Delete Record"
      />
    </PageLayout>
  );
};

export default AttendanceManagement;
