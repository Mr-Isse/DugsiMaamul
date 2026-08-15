import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Key,
  X,
  Check,
  UserPlus,
  BookOpen,
  Clock,
  Phone,
  Mail,
  Calendar,
  Hash,
  AlertCircle,
  CheckCircle,
  Download,
  FileSpreadsheet,
  LayoutGrid,
  List,
  GraduationCap,
  Activity,
} from 'lucide-react';
import {
  useGetTeachersQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useResetTeacherPasswordMutation,
  useGetSubjectsQuery,
  useLazyCheckTeacherIdQuery
} from '../store/adminApiSlice';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import ConfirmModal from '../components/ConfirmModal';
import BulkImportModal from '../components/BulkImportModal';
import ImageUpload from '../components/ImageUpload';
import { Button } from '../components/ui/button';
import { KpiCard, KpiGrid } from '../components/ui/KpiCard';
import { PageLayout, PageHeader } from '../components/PageLayout';
import { SummaryWidget } from '../components/ui/SummaryWidget';
import { Input } from '../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/Dialog';
import {
  lettersAndSpacesOnly,
  alphanumericId,
  optionalEmail,
  passwordField,
  cnInputError,
  normalizeName,
  filterAlphanumericId,
  filterLettersAndSpaces,
  numbersOnly,
  getSchoolPrefix,
} from '../utils/strictValidation';

const CHART_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

// ── Excel Export ──────────────────────────────────────────────────────────
function exportTeachersToExcel(teachers) {
  if (!teachers || teachers.length === 0) return;
  const rows = teachers.map((t, i) => ({
    '#': i + 1,
    'Teacher ID': t.customId || '—',
    'Full Name': t.name || '—',
    'Email': t.email || '—',
    'Phone': t.phone || '—',
    'Age': t.teacherAge || '—',
    'Subjects': t.subjects?.map(s => s.name || s).join(', ') || '—',
    'Working Hours': t.workingStartTime && t.workingEndTime ? `${t.workingStartTime} – ${t.workingEndTime}` : '—',
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 4 }, { wch: 14 }, { wch: 24 }, { wch: 28 }, { wch: 16 }, { wch: 6 }, { wch: 32 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Teachers');
  XLSX.writeFile(wb, `teachers_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

const TeachersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // Default to card view
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showErrors, setShowErrors] = useState(false);
  const [showResetErrors, setShowResetErrors] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    customId: '',
    phone: '',
    age: '',
    subjects: [],
    workingStartTime: '',
    workingEndTime: '',
    profileImage: null,
  });

  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    mode: 'generate',
    generatedPassword: ''
  });

  const [teacherIdStatus, setTeacherIdStatus] = useState({ checking: false, available: null, message: '' });

  const { data: teachers, isLoading } = useGetTeachersQuery();
  const { data: subjects } = useGetSubjectsQuery();
  const { selectedBranch } = useSelector((state) => state.branch);
  const [createTeacher, { isLoading: isCreating }] = useCreateTeacherMutation();
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();
  const [deleteTeacher, { isLoading: isDeleting }] = useDeleteTeacherMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetTeacherPasswordMutation();
  const [checkTeacherId, { isFetching: isCheckingId }] = useLazyCheckTeacherIdQuery();

  // Pre-fill Teacher ID with school prefix
  useEffect(() => {
    if (isModalOpen && !formData.customId && userInfo?.school?.name) {
      const prefix = getSchoolPrefix(userInfo.school.name);
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      setFormData(prev => ({ ...prev, customId: `${prefix}TCH${randomDigits}` }));
    }
  }, [isModalOpen, userInfo, formData.customId]);

  // Debounced teacher ID check
  const checkTeacherIdAvailability = useCallback(async (customId, excludeId = null) => {
    if (!customId || customId.trim().length < 3) {
      setTeacherIdStatus({ checking: false, available: null, message: '' });
      return;
    }

    setTeacherIdStatus(prev => ({ ...prev, checking: true }));

    try {
      const result = await checkTeacherId({ customId, excludeId }).unwrap();
      setTeacherIdStatus({
        checking: false,
        available: result.available,
        message: result.message || ''
      });
    } catch (error) {
      // If server returns an error response, use its message
      const errorMessage = error?.data?.message || error?.data?.userMessage || 'Unable to check ID availability';
      setTeacherIdStatus({ checking: false, available: null, message: errorMessage });
    }
  }, [checkTeacherId]);

  // Debounce effect for teacher ID check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.customId.trim() && !isEditModalOpen) {
        checkTeacherIdAvailability(formData.customId);
      } else if (isEditModalOpen && selectedTeacher && formData.customId !== selectedTeacher.customId) {
        checkTeacherIdAvailability(formData.customId, selectedTeacher._id);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.customId, checkTeacherIdAvailability, isEditModalOpen, selectedTeacher]);

  const createFieldErrors = useMemo(() => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Full name is required.';
    } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      errors.name = 'Name can only contain letters.';
    }

    // Email validation (optional)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address.';
      }
    }

    // Phone validation (required, numbers only)
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!/^[0-9+]+$/.test(formData.phone.trim())) {
      errors.phone = 'Phone number can only contain digits.';
    }

    // Age validation (required, 18-70)
    if (!formData.age.trim()) {
      errors.age = 'Age is required.';
    } else {
      const ageNum = Number(formData.age);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 70) {
        errors.age = 'Age must be between 18 and 70.';
      }
    }

    // Password validation - ONLY for CREATE
    if (!isEditModalOpen) {
      if (!formData.password || formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters.';
      }
    }

    // Teacher ID validation
    if (formData.customId.trim()) {
      const trimmedId = formData.customId.trim();
      if (!/^[A-Za-z0-9]+$/.test(trimmedId)) {
        errors.customId = 'Teacher ID can only contain letters and numbers.';
      } else {
        if (userInfo?.school?.name) {
          const prefix = getSchoolPrefix(userInfo.school.name);
          if (!trimmedId.toUpperCase().startsWith(prefix)) {
            errors.customId = `Teacher ID must start with ${prefix}.`;
          }
        }
        if (teacherIdStatus.available === false) {
          errors.customId = teacherIdStatus.message || 'This Teacher ID already exists.';
        }
      }
    }

    // Time validation (required)
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!formData.workingStartTime) {
      errors.workingStartTime = 'Working start time is required.';
    } else if (!timeRegex.test(formData.workingStartTime)) {
      errors.workingStartTime = 'Use HH:MM format (e.g., 08:00).';
    }
    if (!formData.workingEndTime) {
      errors.workingEndTime = 'Working end time is required.';
    } else if (!timeRegex.test(formData.workingEndTime)) {
      errors.workingEndTime = 'Use HH:MM format (e.g., 14:00).';
    }

    // Subjects validation (required)
    if (!formData.subjects || formData.subjects.length === 0) {
      errors.subjects = 'At least one subject is required.';
    }

    return errors;
  }, [formData, teacherIdStatus, isEditModalOpen]);

  const resetPasswordError = useMemo(
    () => resetPasswordData.mode === 'manual' ? passwordField('New Password', resetPasswordData.newPassword) : '',
    [resetPasswordData.mode, resetPasswordData.newPassword]
  );

  const formValid = !Object.values(createFieldErrors).some(Boolean) && !teacherIdStatus.checking;
  const resetFormValid = !resetPasswordError;

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: 'password123',
      customId: '',
      phone: '',
      age: '',
      subjects: [],
      workingStartTime: '',
      workingEndTime: '',
      profileImage: null,
    });
    setTeacherIdStatus({ checking: false, available: null, message: '' });
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setShowErrors(true);
    if (!formValid) {
      toast.error('Please fix the errors in the form');
      return;
    }
    try {
      await createTeacher({
        name: normalizeName(formData.name),
        email: String(formData.email || '').trim() || undefined,
        password: formData.password,
        customId: String(formData.customId || '').trim() || undefined,
        phone: String(formData.phone || '').trim() || undefined,
        age: String(formData.age || '').trim() || undefined,
        subjects: formData.subjects.length > 0 ? formData.subjects : undefined,
        workingStartTime: formData.workingStartTime || undefined,
        workingEndTime: formData.workingEndTime || undefined,
        profileImage: formData.profileImage || undefined,
      }).unwrap();
      toast.success('Teacher created successfully');
      setIsModalOpen(false);
      resetForm();
      setShowErrors(false);
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.message || 'Something went wrong. Please try again.');
    }
  };

  const handleEditClick = (teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name || '',
      email: teacher.email || '',
      password: '',
      customId: teacher.customId || '',
      phone: teacher.phone || '',
      age: teacher.teacherAge?.toString() || '',
      subjects: teacher.subjects?.map(s => s._id || s) || [],
      workingStartTime: teacher.workingStartTime || '',
      workingEndTime: teacher.workingEndTime || '',
      profileImage: teacher.profileImage || null,
    });
    setTeacherIdStatus({ checking: false, available: true, message: '' });
    setShowErrors(false);
    setIsEditModalOpen(true);
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    setShowErrors(true);
    if (!formValid) {
      toast.error('Please fix the errors in the form');
      return;
    }
    try {
      await updateTeacher({
        id: selectedTeacher._id,
        name: normalizeName(formData.name),
        email: String(formData.email || '').trim() || undefined,
        customId: String(formData.customId || '').trim() || undefined,
        phone: String(formData.phone || '').trim() || undefined,
        age: String(formData.age || '').trim() || undefined,
        subjects: formData.subjects,
        workingStartTime: formData.workingStartTime || undefined,
        workingEndTime: formData.workingEndTime || undefined,
        profileImage: formData.profileImage || undefined,
      }).unwrap();
      toast.success('Teacher updated successfully');
      setIsEditModalOpen(false);
      setSelectedTeacher(null);
      resetForm();
      setShowErrors(false);
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.message || 'Something went wrong. Please try again.');
    }
  };

  const handleDeleteTeacher = async () => {
    if (!teacherToDelete) return;

    try {
      await deleteTeacher(teacherToDelete._id).unwrap();
      toast.success('Teacher deleted successfully');
      setTeacherToDelete(null);
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.message || 'Something went wrong. Please try again.');
    }
  };

  const confirmDeleteTeacher = (teacher) => {
    setTeacherToDelete(teacher);
    setIsDeleteModalOpen(true);
  };

  const handleTeacherCredentials = (teacher) => {
    const username = teacher.customId || teacher.email || teacher.phone || '';
    if (username && navigator?.clipboard) {
      navigator.clipboard.writeText(username);
      toast.success('Teacher username copied');
    } else {
      toast.success('Teacher credentials are available on the teacher record');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setShowResetErrors(true);
    if (!resetFormValid) {
      toast.error('Please fix the errors in the form');
      return;
    }
    try {
      const result = await resetPassword({
        id: selectedTeacher._id,
        generateRandom: resetPasswordData.mode === 'generate',
        newPassword: resetPasswordData.mode === 'manual' ? resetPasswordData.newPassword : undefined
      }).unwrap();
      toast.success('Password changed successfully');
      if (result?.generatedPassword) {
        setResetPasswordData({ newPassword: '', mode: 'generate', generatedPassword: result.generatedPassword });
      } else {
        setIsResetModalOpen(false);
        setResetPasswordData({ newPassword: '', mode: 'generate', generatedPassword: '' });
      }
      setShowResetErrors(false);
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.message || 'Something went wrong. Please try again.');
    }
  };

  const shouldShowError = (field, value) => {
    return createFieldErrors[field] && (showErrors || (value && String(value).length > 0));
  };

  const shouldShowResetError = (value) => {
    return resetPasswordError && (showResetErrors || (value && String(value).length > 0));
  };

  const handleSubjectToggle = (subjectId) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter(id => id !== subjectId)
        : [...prev.subjects, subjectId]
    }));
  };

  const filteredTeachers = useMemo(() => {
    if (!teachers) return [];
    const search = searchTerm.toLowerCase().trim();
    if (!search) return teachers;

    return teachers.filter(t => {
      const nameMatch = t.name.toLowerCase().includes(search);
      const idMatch = t.customId?.toLowerCase().includes(search);
      const emailMatch = t.email?.toLowerCase().includes(search);
      const phoneMatch = t.phone?.toLowerCase().includes(search);
      
      // Search in subjects (which might contain class names/codes)
      const subjectMatch = t.subjects?.some(s => 
        (s.name || '').toLowerCase().includes(search) || 
        (s.code || '').toLowerCase().includes(search)
      );

      return nameMatch || idMatch || emailMatch || phoneMatch || subjectMatch;
    });
  }, [teachers, searchTerm]);

  // Skeleton Loading State
  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader title="Teachers Management" description="Manage teacher profiles, subjects, and access credentials." icon={GraduationCap} isLoading />
        <KpiGrid columns={4}>
          {[0,1,2,3].map(i => <KpiCard key={i} isLoading index={i} />)}
        </KpiGrid>
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  // ── Derived stats ────────────────────────────────────────────────────────
  const totalTeachers = teachers?.length || 0;
  const activeTeachers = teachers?.filter(t => !t.status || t.status === 'active').length || 0;
  const withSubjects = teachers?.filter(t => t.subjects?.length > 0).length || 0;
  const subjectData = (teachers || []).reduce((acc, t) => {
    const count = (t.subjects || []).length;
    const name = `${count} subject${count !== 1 ? 's' : ''}`;
    const idx = acc.findIndex(x => x.name === name);
    if (idx === -1) acc.push({ name, value: 1 }); else acc[idx].value += 1;
    return acc;
  }, []);

  return (
    <PageLayout breadcrumbs={[{ label: 'Teachers', path: '/teachers' }]}>
      {/* Page Header */}
      <PageHeader
        icon={GraduationCap}
        title="Teachers Management"
        description="Manage teacher profiles, subjects, and access credentials."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportTeachersToExcel(filteredTeachers)}
              disabled={!filteredTeachers?.length}
              className="h-9 rounded-xl gap-2 text-xs font-bold"
            >
              <FileSpreadsheet size={14} /> Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              className="h-9 rounded-xl gap-2 text-xs font-bold"
            >
              <Download size={14} /> Import
            </Button>
            <Button
              size="sm"
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="h-9 rounded-xl gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white border-none"
            >
              <UserPlus size={14} /> Add Teacher
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <KpiGrid columns={4}>
        <KpiCard title="Total Teachers" value={totalTeachers} icon={Users} variant="emerald" subtitle="All registered teachers" index={0} />
        <KpiCard title="Active Teachers" value={activeTeachers} icon={Activity} variant="blue" subtitle="Currently active" index={1} />
        <KpiCard title="With Subjects" value={withSubjects} icon={BookOpen} variant="violet" subtitle="Have assigned subjects" index={2} />
        <KpiCard title="Avg Subjects" value={(totalTeachers > 0 ? ((teachers || []).reduce((s, t) => s + (t.subjects?.length || 0), 0) / totalTeachers).toFixed(1) : 0)} icon={GraduationCap} variant="amber" subtitle="Per teacher" index={3} />
      </KpiGrid>

      {/* Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Subject Distribution Chart */}
        <SummaryWidget title="Subject Distribution" icon={BookOpen} className="lg:col-span-1">
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={subjectData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name }) => name}>
                  {subjectData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No data</div>
          )}
        </SummaryWidget>

        {/* Teachers Table */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by name, ID, email or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-500 transition-all"
                />
              </div>
              {/* View Toggle */}
              <div className="hidden md:flex items-center bg-slate-50 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all text-sm font-bold ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  title="Table View"
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                  title="Grid View"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300">
                {filteredTeachers?.length ?? 0}{searchTerm ? ` / ${teachers?.length ?? 0}` : ''} teacher{(filteredTeachers?.length ?? 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Teachers Grid View */}
          {viewMode === 'grid' ? (
            <div className="p-4 sm:p-5 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {filteredTeachers?.length > 0 ? (
              filteredTeachers.map((teacher) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={teacher._id}
                  className="bg-white dark:bg-slate-950 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all group relative overflow-hidden flex flex-col"
                >
                  {/* Decorative background element */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-600/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500" />
                  
                  <div className="flex items-start justify-between gap-2 mb-2 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0 overflow-hidden border-2 border-white dark:border-gray-700 shadow-md group-hover:rotate-3 transition-transform">
                        {teacher.profileImage ? (
                          <img src={typeof teacher.profileImage === 'string' ? teacher.profileImage : teacher.profileImage?.url} alt={teacher.name} className="w-full h-full object-cover" />
                        ) : (
                          teacher.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 transition-colors leading-tight">{teacher.name}</h3>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-indigo-600 text-white text-[7px] font-black uppercase tracking-wider rounded-lg shadow-sm shadow-indigo-600/20">
                          {teacher.customId}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[8px] rounded-lg font-black uppercase tracking-widest shrink-0">
                      {teacher.status || 'active'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-y-1 mb-2 relative z-10">
                    <div className="flex items-center gap-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-500/60 shrink-0">
                        <Users size={10} />
                      </div>
                      <span className="truncate uppercase tracking-widest text-[8px]">{teacher.branch?.name || 'Main'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-gray-600 dark:text-gray-400">
                      <div className="w-6 h-6 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-indigo-600/60 shrink-0">
                        <Phone size={10} />
                      </div>
                      <span className="truncate text-[8px]">{teacher.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-gray-600 dark:text-gray-400">
                      <div className="w-6 h-6 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-indigo-600/60 shrink-0">
                        <Mail size={10} />
                      </div>
                      <span className="truncate text-[8px]">{teacher.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-gray-600 dark:text-gray-400">
                      <div className="w-6 h-6 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-indigo-600/60 shrink-0">
                        <BookOpen size={10} />
                      </div>
                      <span className="truncate text-[8px]">{teacher.subjects?.[0]?.name || teacher.subjects?.[0] || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs font-bold text-gray-600 dark:text-gray-400">
                      <div className="w-6 h-6 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-indigo-600/60 shrink-0">
                        <Clock size={10} />
                      </div>
                      <span className="truncate text-[8px]">{teacher.workingStartTime ? `${teacher.workingStartTime}–${teacher.workingEndTime}` : 'N/A'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700 relative z-10">
                    <span className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Subjects</span>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects?.length > 0 ? (
                        teacher.subjects.slice(0, 2).map(sub => (
                          <span key={sub._id || sub} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[8px] rounded-lg font-black border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                            {sub.name || sub}
                          </span>
                        ))
                      ) : (
                        <span className="text-[8px] text-gray-400 italic">No subjects</span>
                      )}
                      {teacher.subjects?.length > 2 && (
                        <span className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-400 text-[8px] rounded-lg font-black">+{teacher.subjects.length - 2}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-1 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => handleTeacherCredentials(teacher)}
                      className="flex items-center justify-center gap-1 py-1 text-[6px] font-black uppercase tracking-widest text-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-gray-300 rounded-lg hover:bg-gray-100 transition-all active:scale-95 px-1"
                      title="View Credentials"
                    >
                      <Hash size={9} /> Credentials
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setIsResetModalOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-1 text-[6px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 transition-all active:scale-95 px-1"
                      title="Reset Password"
                    >
                      <Key size={9} /> Password
                    </button>
                    <button
                      onClick={() => handleEditClick(teacher)}
                      className="flex-1 flex items-center justify-center gap-1 py-1 text-[6px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 transition-all active:scale-95 px-1"
                      title="Edit Teacher"
                    >
                      <Edit2 size={9} /> Edit
                    </button>
                    <button
                      onClick={() => confirmDeleteTeacher(teacher)}
                      className="flex items-center justify-center gap-1 py-1 text-[6px] font-black uppercase tracking-widest text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 transition-all active:scale-95 px-1"
                      title="Delete Teacher"
                    >
                      <Trash2 size={9} /> Delete
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4">
                  <Users size={28} className="text-slate-300" />
                </div>
                <h3 className="text-slate-700 dark:text-slate-300 font-bold text-sm">No teachers found</h3>
                <p className="text-slate-400 text-xs mt-1">Try adjusting your search or add a new teacher.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Teacher ID</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phone</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subjects</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Working Hours</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Age</th>
                  <th className="px-5 py-3.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTeachers?.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                    <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/30 px-6 py-4 text-sm font-bold text-indigo-600 border-r border-gray-100/50 dark:border-gray-700/50 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                      {teacher.customId}
                    </td>
                    <td className="sticky left-[120px] z-10 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700/30 px-6 py-4 border-r border-gray-100/50 dark:border-gray-700/50 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600/10 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                          {teacher.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{teacher.name}</span>
                      </div>
                    </td>
                    {!selectedBranch && (
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                          {teacher.branch?.name || 'Main Branch'}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {teacher.phone || <span className="text-gray-400 italic">Not Assigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects?.length > 0 ? (
                          teacher.subjects.map(sub => (
                            <span key={sub._id || sub} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                              {sub.name || sub}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400 italic">Not Assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {teacher.workingStartTime && teacher.workingEndTime ? (
                        <span className="flex items-center gap-1">
                          <Clock size={14} className="text-gray-400" />
                          {teacher.workingStartTime} - {teacher.workingEndTime}
                        </span>
                      ) : <span className="text-gray-400 italic">Not Assigned</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {teacher.teacherAge ? `${teacher.teacherAge} yrs` : <span className="text-gray-400 italic">Not Assigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setIsResetModalOpen(true);
                          }}
                          className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <Key size={18} />
                        </button>
                        <button
                          onClick={() => handleEditClick(teacher)}
                          className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 rounded-lg transition-colors"
                          title="Edit Teacher"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => confirmDeleteTeacher(teacher)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                          title="Delete Teacher"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTeachers?.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Users size={22} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                          {searchTerm ? 'No teachers match your search' : 'No teachers yet'}
                        </p>
                        {!searchTerm && (
                          <p className="text-gray-400 dark:text-gray-500 text-xs">Add your first teacher using the button above</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>

      {/* Create Teacher Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
            <DialogDescription>Fill in the details to register a new teacher.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTeacher} className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32">
                <ImageUpload 
                  value={formData.profileImage} 
                  onChange={(val) => setFormData({ ...formData, profileImage: val })} 
                  label="Profile Photo"
                  shape="circle"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: filterLettersAndSpaces(e.target.value) })}
                placeholder="e.g. Ahmed Ali Hassan"
                error={shouldShowError('name', formData.name) ? createFieldErrors.name : undefined}
                wrapperClassName="mb-4"
              />
              <Input
                label="Phone Number *"
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: numbersOnly(e.target.value) })}
                placeholder="e.g. 0612345678"
                error={shouldShowError('phone', formData.phone) ? createFieldErrors.phone : undefined}
                wrapperClassName="mb-4"
              />
              <Input
                label="Age *"
                type="number"
                min="18"
                max="70"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="18-70"
                error={shouldShowError('age', formData.age) ? createFieldErrors.age : undefined}
                wrapperClassName="mb-4"
              />
              <Input
                label="Email (Optional)"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. ahmed@school.com"
                error={shouldShowError('email', formData.email) ? createFieldErrors.email : undefined}
                wrapperClassName="mb-4"
              />
              <Input
                label="Teacher ID"
                type="text"
                value={formData.customId}
                onChange={(e) => setFormData({ ...formData, customId: filterAlphanumericId(e.target.value) })}
                placeholder="e.g. TCH001"
                error={shouldShowError('customId', formData.customId) ? createFieldErrors.customId : undefined}
                wrapperClassName="mb-4"
              />
              <Input
                label="Password *"
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min 6 chars"
                error={shouldShowError('password', formData.password) ? createFieldErrors.password : undefined}
                wrapperClassName="mb-4"
              />
              <Input
                label="Start Time"
                type="time"
                value={formData.workingStartTime}
                onChange={(e) => setFormData({ ...formData, workingStartTime: e.target.value })}
                error={shouldShowError('workingStartTime', formData.workingStartTime) ? createFieldErrors.workingStartTime : undefined}
                wrapperClassName="mb-4"
              />
              <Input
                label="End Time"
                type="time"
                value={formData.workingEndTime}
                onChange={(e) => setFormData({ ...formData, workingEndTime: e.target.value })}
                error={shouldShowError('workingEndTime', formData.workingEndTime) ? createFieldErrors.workingEndTime : undefined}
                wrapperClassName="mb-4"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Subjects They Teach <span className="text-red-500">*</span>
              </label>
              <div className={`flex flex-wrap gap-1.5 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 transition-all ${shouldShowError('subjects', formData.subjects) ? 'border-red-500 ring-4 ring-red-500/10' : 'border-transparent'}`}>
                {subjects?.map(subject => (
                  <button
                    key={subject._id}
                    type="button"
                    onClick={() => handleSubjectToggle(subject._id)}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${formData.subjects.includes(subject._id)
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-100 dark:border-gray-500'
                      }`}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isCreating || !formValid}>
                {isCreating ? 'Creating Teacher...' : 'Create Teacher'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Teacher Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>Update teacher information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTeacher} className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32">
                <ImageUpload 
                  value={formData.profileImage} 
                  onChange={(val) => setFormData({ ...formData, profileImage: val })} 
                  label="Profile Photo"
                  shape="circle"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: filterLettersAndSpaces(e.target.value) })}
                placeholder="e.g. Ahmed Ali Hassan"
                error={shouldShowError('name', formData.name) ? createFieldErrors.name : undefined}
                wrapperClassName="mb-4"
              />
              <Input
                label="Phone Number *"
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: numbersOnly(e.target.value) })}
                placeholder="e.g. 0612345678"
                error={shouldShowError('phone', formData.phone) ? createFieldErrors.phone : undefined}
                wrapperClassName="mb-4"
              />
              <Input
                label="Age *"
                type="number"
                min="18"
                max="70"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="18-70"
                error={shouldShowError('age', formData.age) ? createFieldErrors.age : undefined}
                wrapperClassName="mb-4"
              />
              <Input
                label="Email (Optional)"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. ahmed@school.com"
                error={shouldShowError('email', formData.email) ? createFieldErrors.email : undefined}
                wrapperClassName="mb-4"
              />
              <Input
                label="Teacher ID"
                type="text"
                value={formData.customId}
                onChange={(e) => setFormData({ ...formData, customId: filterAlphanumericId(e.target.value) })}
                placeholder="e.g. TCH001"
                error={shouldShowError('customId', formData.customId) ? createFieldErrors.customId : undefined}
                wrapperClassName="mb-4"
              />
              <Input
                label="Working Start Time"
                type="time"
                value={formData.workingStartTime}
                onChange={(e) => setFormData({ ...formData, workingStartTime: e.target.value })}
                error={shouldShowError('workingStartTime', formData.workingStartTime) ? createFieldErrors.workingStartTime : undefined}
                wrapperClassName="mb-4"
              />
              <Input
                label="Working End Time"
                type="time"
                value={formData.workingEndTime}
                onChange={(e) => setFormData({ ...formData, workingEndTime: e.target.value })}
                error={shouldShowError('workingEndTime', formData.workingEndTime) ? createFieldErrors.workingEndTime : undefined}
                wrapperClassName="mb-4"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Subjects They Teach <span className="text-red-500">*</span>
              </label>
              <div className={`flex flex-wrap gap-1.5 p-2.5 sm:p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 transition-all ${shouldShowError('subjects', formData.subjects) ? 'border-red-500 ring-4 ring-red-500/10' : 'border-transparent'}`}>
                {subjects?.map(subject => (
                  <button
                    key={subject._id}
                    type="button"
                    onClick={() => handleSubjectToggle(subject._id)}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${formData.subjects.includes(subject._id)
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-500 border border-gray-100 dark:border-gray-500'
                      }`}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" type="button" onClick={() => { setIsEditModalOpen(false); setSelectedTeacher(null); resetForm(); }}>Cancel</Button>
              <Button type="submit" disabled={isUpdating || !formValid}>
                {isUpdating ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              For {selectedTeacher?.name} &middot; ID: {selectedTeacher?.customId}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-5">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setResetPasswordData(prev => ({ ...prev, mode: 'generate' }))}
                className={`py-3 rounded-2xl text-xs font-bold transition-all ${resetPasswordData.mode === 'generate' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-gray-50 dark:bg-gray-800 text-gray-500'}`}
              >
                Generate Password
              </button>
              <button
                type="button"
                onClick={() => setResetPasswordData(prev => ({ ...prev, mode: 'manual' }))}
                className={`py-3 rounded-2xl text-xs font-bold transition-all ${resetPasswordData.mode === 'manual' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-gray-50 dark:bg-gray-800 text-gray-500'}`}
              >
                Manual Password
              </button>
            </div>
            {resetPasswordData.mode === 'manual' && (
              <Input
                label="New Password"
                type="text"
                value={resetPasswordData.newPassword}
                onChange={(e) => setResetPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                autoFocus
                placeholder="Enter new password (min 8 chars)"
                error={shouldShowResetError(resetPasswordData.newPassword) ? resetPasswordError : undefined}
                wrapperClassName="mb-4"
              />
            )}
            {resetPasswordData.generatedPassword && (
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/10 px-4 py-3">
                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mb-1">Generated Password</p>
                <p className="text-sm font-black text-gray-900 dark:text-gray-100 font-mono">{resetPasswordData.generatedPassword}</p>
              </div>
            )}
            <Button type="submit" disabled={isResetting || !resetFormValid} className="w-full">
              {isResetting ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteTeacher}
        title="Delete Teacher"
        message={`Are you sure you want to delete ${teacherToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete Teacher"
      />

      {/* Bulk Import Modal */}
      {isImportModalOpen && (
        <BulkImportModal
          type="teachers"
          onClose={() => setIsImportModalOpen(false)}
        />
      )}
    </PageLayout>
  );
};

export default TeachersManagement;
