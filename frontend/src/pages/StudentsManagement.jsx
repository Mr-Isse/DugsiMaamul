import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Download,
  LayoutGrid,
  List,
  Phone,
  School,
  Eye,
  Key,
  Upload,
  Mail,
  UserCheck,
  UserX,
  VenetianMask,
  ChevronDown,
  RefreshCw,
  FileDown,
  Loader2,
} from 'lucide-react';
import {
  useGetStudentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetClassesQuery,
  useGenerateBulkCredentialsMutation,
  useGenerateStudentLoginMutation,
  useGetBranchesQuery,
} from '../store/adminApiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import * as XLSX from 'xlsx';

import ConfirmModal from '../components/ConfirmModal';
import BulkImportModal from '../components/BulkImportModal';
import StudentProfileModal from '../components/StudentProfileModal';
import ImageUpload from '../components/ImageUpload';
import CredentialActionsMenu from '../components/CredentialActionsMenu';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { SummaryWidget } from '../components/ui/SummaryWidget';
import { 
  EnterprisePageLayout, 
  EnterpriseStatsGrid, 
  EnterpriseTable, 
  EnterpriseFilterPanel 
} from '../components/ui/EnterpriseSystem';
import { cn } from '../lib/utils';

const CHART_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#EC4899'];

const PAGE_SIZE = 20;

const StudentCardSkeleton = () => (
  <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
    <CardContent className="p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-3 w-full rounded" />
        ))}
      </div>
      <Skeleton className="h-9 rounded-xl w-full" />
    </CardContent>
  </Card>
);

const StudentsManagement = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { selectedBranch } = useSelector((state) => state.branch);

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [classFilter, setClassFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const tableRef = useRef(null);

  const {
    data: students,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetStudentsQuery();
  const { data: classes } = useGetClassesQuery();
  const { data: branches } = useGetBranchesQuery();
  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();
  const [generateBulkCredentials, { isLoading: isGeneratingCreds }] = useGenerateBulkCredentialsMutation();
  const [generateStudentLogin] = useGenerateStudentLoginMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    customId: '',
    phone: '',
    parentName: '',
    parentPhone: '',
    class: '',
    monthlyFees: '',
    gender: 'Male',
    age: '',
    address: '',
    mode: 'Full-time',
    placeOfBirth: '',
    entryDate: '',
    motherName: '',
    emergencyContact: '',
    profileImage: null,
    branch: '',
  });

  useEffect(() => {
    if (selectedBranch) {
      setFormData((prev) => ({
        ...prev,
        branch: typeof selectedBranch === 'object' ? selectedBranch._id : selectedBranch,
      }));
    }
  }, [selectedBranch]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      customId: '',
      phone: '',
      parentName: '',
      parentPhone: '',
      class: '',
      monthlyFees: '',
      gender: 'Male',
      age: '',
      address: '',
      mode: 'Full-time',
      placeOfBirth: '',
      entryDate: '',
      motherName: '',
      emergencyContact: '',
      profileImage: null,
      branch: selectedBranch
        ? typeof selectedBranch === 'object'
          ? selectedBranch._id
          : selectedBranch
        : '',
    });
  }, [selectedBranch]);

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    const list = Array.isArray(students) ? students : students.data || [];
    return list.filter((s) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          (s.name || '').toLowerCase().includes(q) ||
          (s.customId || '').toLowerCase().includes(q) ||
          (s.phone || '').includes(q) ||
          (s.email || '').toLowerCase().includes(q) ||
          (s.parentName || '').toLowerCase().includes(q) ||
          (s.parentPhone || '').includes(q);
        if (!match) return false;
      }
      if (classFilter !== 'all' && s.class?._id !== classFilter && s.class !== classFilter) return false;
      if (genderFilter !== 'all' && (s.gender || '').toLowerCase() !== genderFilter) return false;
      if (statusFilter !== 'all' && (s.status || 'active').toLowerCase() !== statusFilter) return false;
      if (branchFilter !== 'all') {
        const sbId = typeof s.branch === 'object' ? s.branch?._id : s.branch;
        if (sbId !== branchFilter) return false;
      }
      return true;
    });
  }, [students, searchTerm, classFilter, genderFilter, statusFilter, branchFilter]);

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredStudents.slice(start, start + PAGE_SIZE);
  }, [filteredStudents, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, classFilter, genderFilter, statusFilter, branchFilter]);

  const studentKpis = useMemo(() => {
    const list = Array.isArray(students) ? students : students?.data || [];
    const total = list.length;
    const active = list.filter((s) => (s.status || 'active') === 'active').length;
    const male = list.filter((s) => (s.gender || '').toLowerCase() === 'male').length;
    const female = list.filter((s) => (s.gender || '').toLowerCase() === 'female').length;
    return { total, active, male, female };
  }, [students]);

  const classDistribution = useMemo(() => {
    const list = Array.isArray(students) ? students : students?.data || [];
    const map = {};
    list.forEach((s) => {
      const name = s.class?.name || 'Unassigned';
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [students]);

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await createStudent({
        ...formData,
        classId: formData.class,
        monthlyFees: Number(formData.monthlyFees),
      }).unwrap();
      toast.success('Student created successfully');
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to create student');
    }
  };

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name || '',
      email: student.email || '',
      customId: student.customId || '',
      phone: student.phone || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      class: student.class?._id || student.class || '',
      monthlyFees: student.monthlyFees || '',
      gender: student.gender || 'Male',
      age: student.age || '',
      address: student.address || '',
      mode: student.mode || 'Full-time',
      placeOfBirth: student.placeOfBirth || '',
      entryDate: student.entryDate
        ? new Date(student.entryDate).toISOString().split('T')[0]
        : '',
      motherName: student.motherName || '',
      emergencyContact: student.emergencyContact || '',
      profileImage: student.profileImage || null,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    try {
      await updateStudent({
        id: selectedStudent._id,
        ...formData,
        classId: formData.class,
        monthlyFees: Number(formData.monthlyFees),
      }).unwrap();
      toast.success('Student updated successfully');
      setIsEditModalOpen(false);
      setSelectedStudent(null);
      resetForm();
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to update student');
    }
  };

  const handleDeleteStudent = async () => {
    try {
      await deleteStudent(studentToDelete._id).unwrap();
      toast.success('Student deleted successfully');
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to delete student');
    }
  };

  const handleGenerateCredentials = () => setIsCredsModalOpen(true);

  const confirmGenerateCredentials = async () => {
    try {
      await generateBulkCredentials().unwrap();
      toast.success('Credentials generation started');
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to generate credentials');
    }
  };

  const handleSingleStudentCreds = async (id) => {
    try {
      await generateStudentLogin(id).unwrap();
      toast.success('Credentials generated');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedStudents.map((s) => s._id)));
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exportData = (format) => {
    const dataToExport = selectedIds.size > 0
      ? filteredStudents.filter((s) => selectedIds.has(s._id))
      : filteredStudents;

    const data = dataToExport.map((s) => ({
      'Student ID': s.customId,
      Name: s.name,
      Class: s.class?.name || 'N/A',
      Gender: s.gender || 'N/A',
      Phone: s.phone || 'N/A',
      Email: s.email || 'N/A',
      'Parent Name': s.parentName || 'N/A',
      'Parent Phone': s.parentPhone || 'N/A',
      'Monthly Fees': s.monthlyFees || 0,
      Status: s.status || 'active',
      Branch: s.branch?.name || 'Main',
      Address: s.address || 'N/A',
    }));

    if (format === 'excel' || format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Students');
      XLSX.writeFile(wb, `students_export.${format === 'excel' ? 'xlsx' : 'csv'}`);
      toast.success(`Exported ${data.length} students`);
    }
  };

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setClassFilter('all');
    setGenderFilter('all');
    setStatusFilter('all');
    setBranchFilter('all');
  }, []);

  const filterOptions = [
    {
      label: 'Class',
      key: 'class',
      value: classFilter,
      options: (classes || []).map((c) => ({ value: c._id, label: `${c.name} ${c.section || ''}` })),
      onChange: setClassFilter,
    },
    {
      label: 'Gender',
      key: 'gender',
      value: genderFilter,
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
      ],
      onChange: setGenderFilter,
    },
    {
      label: 'Status',
      key: 'status',
      value: statusFilter,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'graduated', label: 'Graduated' },
        { value: 'transferred', label: 'Transferred' },
      ],
      onChange: setStatusFilter,
    },
    {
      label: 'Branch',
      key: 'branch',
      value: branchFilter,
      options: (branches?.data || branches || []).map((b) => ({ value: b._id, label: b.name })),
      onChange: setBranchFilter,
    },
  ];

  const activeFilterCount = [classFilter, genderFilter, statusFilter, branchFilter].filter(
    (v) => v !== 'all'
  ).length;

  const formatNumber = (v) => new Intl.NumberFormat('en-US').format(v || 0);

  const StudentForm = ({ isEdit }) => (
    <form
      onSubmit={isEdit ? handleUpdateStudent : handleCreateStudent}
      className="space-y-6"
    >
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 sm:w-28 sm:h-28">
          <ImageUpload
            value={formData.profileImage}
            onChange={(val) => setFormData({ ...formData, profileImage: val })}
            label="Profile Photo"
            shape="circle"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          Full Name <span className="text-indigo-600">*</span>
        </label>
        <Input
          required
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Fatima Omar Said"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
          <Input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="0698765432"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="student@school.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student ID *</label>
          <Input
            required
            type="text"
            value={formData.customId}
            onChange={(e) => setFormData({ ...formData, customId: e.target.value })}
            placeholder="HJSTD277043"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
          <Input
            type="text"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            placeholder="e.g. 15"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Class *</label>
          <select
            required
            value={formData.class}
            onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/30 rounded-xl text-sm font-bold transition-all outline-none cursor-pointer"
          >
            <option value="">Select Class</option>
            {classes?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} - {c.section}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Monthly Fees *
          </label>
          <Input
            required
            type="number"
            value={formData.monthlyFees}
            onChange={(e) => setFormData({ ...formData, monthlyFees: e.target.value })}
            placeholder="50"
          />
        </div>
      </div>

      <div className="pt-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block border-b border-slate-100 dark:border-slate-800 pb-2">
          Personal Information
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/30 rounded-xl text-sm font-bold transition-all outline-none cursor-pointer"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mode</label>
            <select
              value={formData.mode}
              onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
              className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/30 rounded-xl text-sm font-bold transition-all outline-none cursor-pointer"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          Place of Birth
        </label>
        <Input
          type="text"
          value={formData.placeOfBirth}
          onChange={(e) => setFormData({ ...formData, placeOfBirth: e.target.value })}
          placeholder="Hargeisa"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
        <Input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="District 5"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Entry Date</label>
        <Input
          type="date"
          value={formData.entryDate}
          onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
        />
      </div>

      <div className="pt-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block border-b border-slate-100 dark:border-slate-800 pb-2">
          Family & Contact
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Mother's Name
            </label>
            <Input
              type="text"
              value={formData.motherName}
              onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
              placeholder="Mother's full name"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Parent/Guardian
            </label>
            <Input
              type="text"
              value={formData.parentName}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              placeholder="Omar Said"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Parent's Phone
          </label>
          <Input
            type="text"
            value={formData.parentPhone}
            onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
            placeholder="e.g. 0612345678"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
            Emergency Contact
          </label>
          <Input
            type="text"
            value={formData.emergencyContact}
            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
            placeholder="e.g. 0612345678"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isCreating || isUpdating}
        className="w-full px-6 py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isCreating || isUpdating ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          isEdit ? 'Update Student' : 'Add Student'
        )}
      </button>
    </form>
  );


  // Prepare Table Columns
  const tableColumns = [
    {
      id: 'student',
      label: 'Student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 rounded-xl border-2 border-white dark:border-slate-800 shadow-sm">
            <AvatarImage
              loading="lazy"
              src={
                row.imageUrl ||
                (typeof row.profileImage === 'string'
                  ? row.profileImage
                  : row.profileImage?.url)
              }
            />
            <AvatarFallback className="font-black text-sm bg-slate-100 text-slate-500 dark:bg-slate-800">
              {row.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-black text-slate-900 dark:text-white leading-none">
              {row.name}
            </p>
            <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 mt-1.5 uppercase tracking-widest">
              {row.customId}
            </p>
          </div>
        </div>
      ),
    },
    ...(!selectedBranch ? [{
      id: 'branch',
      label: 'Branch',
      render: (row) => (
        <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 uppercase tracking-widest text-[9px] font-black">
          {row.branch?.name || 'Main'}
        </Badge>
      ),
    }] : []),
    {
      id: 'class',
      label: 'Class',
      render: (row) => (
        <Badge variant="secondary" className="uppercase tracking-widest text-[9px] font-black">
          {row.class?.name} {row.class?.section}
        </Badge>
      ),
    },
    {
      id: 'gender',
      label: 'Gender',
      render: (row) => (
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
          {row.gender || 'N/A'}
        </span>
      ),
    },
    {
      id: 'contact',
      label: 'Contact',
      render: (row) => (
        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
          <p className="flex items-center gap-1.5 whitespace-nowrap">
            <Phone size={11} className="text-slate-400 shrink-0" />
            {row.phone || 'N/A'}
          </p>
          <p className="flex items-center gap-1.5 mt-1 whitespace-nowrap">
            <Mail size={11} className="text-slate-400 shrink-0" />
            {row.email || 'N/A'}
          </p>
        </div>
      ),
    },
    {
      id: 'fee',
      label: 'Fee',
      render: (row) => (
        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
          ${row.monthlyFees || 0}
        </span>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      render: (row) => (
        <Badge
          variant={(row.status || 'active') === 'active' ? 'success' : 'destructive'}
          className="text-[9px] font-black uppercase tracking-widest"
        >
          {row.status || 'active'}
        </Badge>
      ),
    },
  ];

  const quickActions = [
    { label: 'Import', icon: Upload, onClick: () => setIsImportModalOpen(true) },
    { label: 'Credentials', icon: Key, onClick: handleGenerateCredentials }
  ];

  const actions = (
    <Button
      size="sm"
      onClick={() => {
        resetForm();
        setIsModalOpen(true);
      }}
      className="h-9 px-5 rounded-xl font-semibold text-xs gap-2 shadow-lg shadow-indigo-600/20"
    >
      <Plus size={14} />
      Add Student
    </Button>
  );

  const stats = [
    { label: 'Total Students', value: formatNumber(studentKpis.total), variant: 'blue' },
    { label: 'Active Students', value: formatNumber(studentKpis.active), variant: 'emerald', trend: 'up', trendValue: `${studentKpis.total > 0 ? Math.round((studentKpis.active / studentKpis.total) * 100) : 0}% active` },
    { label: 'Male Students', value: formatNumber(studentKpis.male), variant: 'indigo', subtitle: `${studentKpis.total > 0 ? Math.round((studentKpis.male / studentKpis.total) * 100) : 0}% of total` },
    { label: 'Female Students', value: formatNumber(studentKpis.female), variant: 'fuchsia', subtitle: `${studentKpis.total > 0 ? Math.round((studentKpis.female / studentKpis.total) * 100) : 0}% of total` },
  ];

  return (
    <EnterprisePageLayout
      title="Students"
      description="Manage student records, profiles, and credentials"
      icon={Users}
      breadcrumbs={[{ label: 'Students', path: '/students' }]}
      actions={actions}
      quickActions={quickActions}
      isLoading={isLoading}
    >
      {isError && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-5 flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <UserX size={18} className="text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-700 dark:text-rose-300">Failed to load students</p>
              <p className="text-xs text-rose-500 dark:text-rose-400">{error?.data?.message || 'There was a problem fetching student records'}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="shrink-0 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl text-xs font-bold"
          >
            Try Again
          </Button>
        </div>
      )}

      <div className="mb-6">
        <EnterpriseStatsGrid stats={stats} />
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
        <EnterpriseFilterPanel
          title="Filter Students"
          filters={[
            {
              label: 'Class',
              key: 'class',
              type: 'select',
              placeholder: 'All Classes',
              options: [{ value: 'all', label: 'All Classes' }, ...(classes || []).map(c => ({ value: c._id, label: `${c.name} ${c.section || ''}` }))]
            },
            {
              label: 'Gender',
              key: 'gender',
              type: 'select',
              placeholder: 'All Genders',
              options: [{ value: 'all', label: 'All Genders' }, { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]
            },
            {
              label: 'Status',
              key: 'status',
              type: 'select',
              placeholder: 'All Statuses',
              options: [{ value: 'all', label: 'All Statuses' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'graduated', label: 'Graduated' }, { value: 'transferred', label: 'Transferred' }]
            },
            {
              label: 'Branch',
              key: 'branch',
              type: 'select',
              placeholder: 'All Branches',
              options: [{ value: 'all', label: 'All Branches' }, ...(branches?.data || branches || []).map(b => ({ value: b._id, label: b.name }))]
            }
          ]}
          onFilterChange={(newFilters) => {
             if (newFilters.class !== undefined) setClassFilter(newFilters.class || 'all');
             if (newFilters.gender !== undefined) setGenderFilter(newFilters.gender || 'all');
             if (newFilters.status !== undefined) setStatusFilter(newFilters.status || 'all');
             if (newFilters.branch !== undefined) setBranchFilter(newFilters.branch || 'all');
          }}
          onReset={handleResetFilters}
          className="sticky top-6"
        />

        <div className="space-y-6">
          <EnterpriseTable
            title="Student Directory"
            columns={tableColumns}
            data={filteredStudents}
            loading={isLoading}
            onEdit={handleEditClick}
            onView={(row) => {
              setSelectedStudent(row);
              setIsProfileModalOpen(true);
            }}
            onDelete={(row) => {
              setStudentToDelete(row);
              setIsDeleteModalOpen(true);
            }}
            onSelect={setSelectedIds}
            selectedRows={selectedIds}
            onAdd={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            onExport={() => exportData('excel')}
            emptyMessage={searchTerm || classFilter !== 'all' ? 'No matching students' : 'No students yet'}
            customActions={(row) => (
              <DropdownMenuItem onClick={(e) => {
                 e.preventDefault();
                 handleSingleStudentCreds(row._id);
              }}>
                <Key size={14} className="mr-2 text-amber-500" /> Generate Credentials
              </DropdownMenuItem>
            )}
          />

          {!isLoading && filteredStudents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SummaryWidget
                title="Class Distribution"
                description="Students grouped by class"
              >
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={classDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={50}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {classDistribution.map((_, idx) => (
                          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </SummaryWidget>

              <SummaryWidget
                title="Quick Summary"
                description="Student body at a glance"
              >
                <div className="space-y-2 mt-4">
                  {[
                    { label: 'Total Students', value: formatNumber(studentKpis.total), color: 'text-indigo-600 dark:text-indigo-400' },
                    { label: 'Active Students', value: formatNumber(studentKpis.active), color: 'text-emerald-600 dark:text-emerald-400' },
                    { label: 'Male / Female', value: `${formatNumber(studentKpis.male)} / ${formatNumber(studentKpis.female)}`, color: 'text-slate-700 dark:text-slate-200' },
                    { label: 'Classes', value: formatNumber(classDistribution.length), color: 'text-cyan-600 dark:text-cyan-400' },
                  ].map((item, i) => (
                    <div key={item.label} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {item.label}
                      </span>
                      <span className={`text-lg font-extrabold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </SummaryWidget>
            </div>
          )}
        </div>
      </div>
      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen || isEditModalOpen} onOpenChange={(open) => { if (!open) { setIsModalOpen(false); setIsEditModalOpen(false); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <div className="px-6 py-5 bg-indigo-600 flex items-center justify-between relative">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative z-10">
              <h2 className="text-xl font-black text-white tracking-tight">
                {isEditModalOpen ? 'Edit Student' : 'Add New Student'}
              </h2>
              <p className="text-xs text-white/60 font-bold mt-0.5">
                {isEditModalOpen
                  ? `Update information for ${formData.name || 'student'}`
                  : 'Fill in the details to register a new student'}
              </p>
            </div>
          </div>
          <div className="p-6 overflow-y-auto flex-1">
            <StudentForm isEdit={isEditModalOpen} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      {isDeleteModalOpen && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteStudent}
          title="Delete Student"
          message={`Are you sure you want to delete ${studentToDelete?.name}? This action cannot be undone.`}
          isLoading={isDeleting}
        />
      )}

      {/* Bulk Credentials Confirmation */}
      {isCredsModalOpen && (
        <ConfirmModal
          isOpen={isCredsModalOpen}
          onClose={() => setIsCredsModalOpen(false)}
          onConfirm={confirmGenerateCredentials}
          title="Generate Credentials"
          message="Generate login credentials for all students who don't have them? This will allow them to access the mobile app."
          confirmText="Generate"
          type="primary"
        />
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <BulkImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImported={() => refetch()}
          type="students"
        />
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <StudentProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          student={selectedStudent}
        />
      )}
    </EnterprisePageLayout>
  );
};

export default StudentsManagement;