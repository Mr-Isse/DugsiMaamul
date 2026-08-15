import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  X,
  Check,
  Users,
  School,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  UserPlus,
  UserMinus,
  AlertTriangle,
  CheckCircle,
  Eye,
  MoreVertical,
  MapPin,
  ShieldCheck,
  CreditCard,
  QrCode,
  Award,
  Timer,
  ShieldAlert
} from 'lucide-react';
import { 
  useGetExamHallsQuery, 
  useCreateExamHallMutation,
  useUpdateExamHallMutation,
  useDeleteExamHallMutation,
  useGetExamHallByIdQuery,
  useAssignStudentToHallMutation,
  useRemoveStudentFromHallMutation,
  useGetStudentsQuery,
  useGetTeachersQuery,
  useGrantTemporaryClearanceMutation,
  useRevokeTemporaryClearanceMutation,
  useLazyVerifyIDCardQuery
} from '../store/adminApiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../components/ui/skeleton';
import ConfirmModal from '../components/ConfirmModal';

const CountdownTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState('');

  const calculateTimeLeft = useCallback(() => {
    const difference = new Date(expiresAt) - new Date();
    if (difference <= 0) return 'Expired';

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);

    let parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);

    return parts.join(' ');
  }, [expiresAt]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute

    setTimeLeft(calculateTimeLeft());
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  return (
    <span className="flex items-center gap-1">
      <Clock size={10} />
      {timeLeft}
    </span>
  );
};

const ExamHallsManagement = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const isAdmin = userInfo?.role === 'schooladmin';
  const isTeacher = userInfo?.role === 'teacher';

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingHallId, setEditingHallId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedHallId, setSelectedHallId] = useState(null);
  const [hallToDelete, setHallToDelete] = useState(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  
  // QR Verification
  const [verifyIDCard, { data: qrVerificationResult }] = useLazyVerifyIDCardQuery();
  
  // Temporary Clearance State
  const [isClearanceModalOpen, setIsClearanceModalOpen] = useState(false);
  const [selectedStudentForClearance, setSelectedStudentForClearance] = useState(null);
  const [clearanceFormData, setClearanceFormData] = useState({
    days: '1',
    reason: '',
    allowAccess: true
  });
  
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    examDate: '',
    examSession: 'Morning',
    supervisors: []
  });

  const [assignData, setAssignData] = useState({
    studentIds: [],
    seatPrefix: ''
  });

  const [showMyHallsOnly, setShowMyHallsOnly] = useState(false);
  const { data: halls, isLoading } = useGetExamHallsQuery(
    isTeacher && showMyHallsOnly ? { myHalls: 'true' } : undefined
  );
  const { data: students } = useGetStudentsQuery();
  const { data: teachers } = useGetTeachersQuery();
  const { data: hallDetails, isLoading: isDetailsLoading } = useGetExamHallByIdQuery(selectedHallId, {
    skip: !selectedHallId
  });

  const [createHall, { isLoading: isCreating }] = useCreateExamHallMutation();
  const [updateHall, { isLoading: isUpdating }] = useUpdateExamHallMutation();
  const [deleteHall, { isLoading: isDeleting }] = useDeleteExamHallMutation();
  const [assignStudent, { isLoading: isAssigning }] = useAssignStudentToHallMutation();
  const filteredStudents = useMemo(() => {
    const list = hallDetails?.students || [];
    const q = studentSearchTerm.trim().toLowerCase();
    if (!q) return list;
    return list.filter(item => 
      String(item.student?.name || '').toLowerCase().includes(q) ||
      String(item.student?.customId || '').toLowerCase().includes(q)
    );
  }, [hallDetails?.students, studentSearchTerm]);

  const [removeStudent, { isLoading: isRemoving }] = useRemoveStudentFromHallMutation();
  const [grantClearance, { isLoading: isGranting }] = useGrantTemporaryClearanceMutation();
  const [revokeClearance, { isLoading: isRevoking }] = useRevokeTemporaryClearanceMutation();

  // QR Scanner Effect
  useEffect(() => {
    const handleQrScanned = (e) => {
      const token = e.detail;
      verifyIDCard(token);
    };
    
    if (isQrModalOpen) {
      // Dynamically add html5-qrcode script
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
      script.onload = () => {
        if (typeof window.loadQrScanner === 'function') {
          window.loadQrScanner();
        }
      };
      document.body.appendChild(script);
      
      window.addEventListener('qr-scanned', handleQrScanned);
      
      return () => {
        document.body.removeChild(script);
        window.removeEventListener('qr-scanned', handleQrScanned);
        if (window.qrScannerInstance) {
          window.qrScannerInstance.clear();
        }
      };
    }
  }, [isQrModalOpen, verifyIDCard]);

  const handleGrantClearance = async (e) => {
    e.preventDefault();
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(clearanceFormData.days));
      
      await grantClearance({
        studentId: selectedStudentForClearance._id,
        expiresAt: expiryDate,
        reason: clearanceFormData.reason
      }).unwrap();
      
      toast.success('Temporary clearance granted');
      setIsClearanceModalOpen(false);
      setClearanceFormData({ days: '1', reason: '', allowAccess: true });
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to grant clearance');
    }
  };

  const handleRevokeClearance = async (studentId) => {
    try {
      await revokeClearance({ studentId }).unwrap();
      toast.success('Clearance revoked');
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to revoke clearance');
    }
  };

  const filteredHalls = useMemo(() => {
    const list = halls || [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return list;
    return list.filter(h => 
      String(h.name || '').toLowerCase().includes(q)
    );
  }, [halls, searchTerm]);

  const handleCreateHall = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateHall({
          id: editingHallId,
          ...formData,
          capacity: Number(formData.capacity)
        }).unwrap();
        toast.success('Exam hall updated successfully');
      } else {
        await createHall({
          ...formData,
          capacity: Number(formData.capacity)
        }).unwrap();
        toast.success('Exam hall created successfully');
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err?.data?.userMessage || `Failed to ${isEditing ? 'update' : 'create'} exam hall`);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', capacity: '', examDate: '', examSession: 'Morning', supervisors: [] });
    setIsEditing(false);
    setEditingHallId(null);
  };

  const handleEditClick = (hall) => {
    setFormData({
      name: hall.name,
      capacity: hall.capacity,
      examDate: new Date(hall.examDate).toISOString().split('T')[0],
      examSession: hall.examSession,
      supervisors: hall.supervisors?.map(s => s._id) || []
    });
    setEditingHallId(hall._id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteHall = async () => {
    try {
      await deleteHall(hallToDelete._id).unwrap();
      toast.success('Exam hall deleted successfully');
      setIsDeleteModalOpen(false);
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to delete exam hall');
    }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    try {
      await assignStudent({
        id: selectedHallId,
        ...assignData
      }).unwrap();
      toast.success('Students assigned successfully');
      setIsAssignModalOpen(false);
      setAssignData({ studentIds: [], seatPrefix: '' });
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to assign students');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await removeStudent({
        id: selectedHallId,
        studentId
      }).unwrap();
      toast.success('Student removed from hall');
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to remove student');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <PageHeaderSkeleton />
        <TableSkeleton rows={5} columns={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-gray-100 tracking-tight">Exam Hall Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {isAdmin 
              ? 'Manage halls, seat assignments, and student financial clearance.' 
              : 'View assigned exam halls and student attendance status.'}
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all duration-200 flex items-center gap-2 transform hover:scale-105 active:scale-95"
          >
            <Plus size={20} />
            Add New Hall
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30 dark:bg-gray-800/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by hall name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-sm transition-all shadow-sm"
            />
          </div>
          
          {isTeacher && (
            <div className="flex items-center gap-3 p-1.5 bg-white dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-600 shadow-sm">
              <button
                onClick={() => setShowMyHallsOnly(false)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  !showMyHallsOnly 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                All Halls
              </button>
              <button
                onClick={() => setShowMyHallsOnly(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  showMyHallsOnly 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                My Assignments
              </button>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHalls?.map((hall) => (
              <motion.div
                key={hall._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group relative bg-white dark:bg-gray-800 rounded-3xl border shadow-sm hover:shadow-2xl transition-all p-6 overflow-hidden ${
                  isTeacher && hall.supervisors?.some(s => s._id === userInfo?._id)
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-gray-100 dark:border-gray-700'
                }`}
              >
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  {isAdmin && (
                    <>
                      <button 
                        onClick={() => handleEditClick(hall)}
                        className="p-2 text-primary hover:bg-primary/5 rounded-xl transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => { setHallToDelete(hall); setIsDeleteModalOpen(true); }}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-inner">
                    <School size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                        {hall.name}
                      </h3>
                      {isTeacher && hall.supervisors?.some(s => s._id === userInfo?._id) && (
                        <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-md uppercase tracking-widest">
                          Assigned to You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>{new Date(hall.examDate).toLocaleDateString()}</span>
                      <span className="mx-1">•</span>
                      <Clock size={14} />
                      <span>{hall.examSession}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Capacity</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {hall.students?.length || 0} / {hall.capacity}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((hall.students?.length || 0) / hall.capacity) * 100}%` }}
                      className={`h-full rounded-full ${
                        ((hall.students?.length || 0) / hall.capacity) > 0.9 ? 'bg-red-500' : 'bg-primary'
                      }`}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <div className="flex -space-x-2">
                      {hall.supervisors?.slice(0, 3).map((sup, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-primary/20 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-bold text-primary">
                          {sup.name?.charAt(0)}
                        </div>
                      ))}
                      {(hall.supervisors?.length || 0) > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-500">
                          +{(hall.supervisors?.length || 0) - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {hall.supervisors?.length || 0} Supervisor{(hall.supervisors?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => { setSelectedHallId(hall._id); setIsDetailModalOpen(true); }}
                  className="w-full mt-6 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-primary hover:text-white text-primary rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group/btn"
                >
                  <Eye size={18} className="group-hover/btn:scale-110 transition-transform" />
                  {isAdmin ? 'Manage Students' : 'View Students'}
                </button>
              </motion.div>
            ))}
          </div>

          {filteredHalls?.length === 0 && (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <School size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No exam halls found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Start by adding a new hall for your upcoming exams.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-5xl h-[90vh] shadow-2xl overflow-hidden flex flex-col"
            >
              {isDetailsLoading ? (
                <div className="flex-1 p-8 space-y-8 animate-pulse">
                  <div className="flex items-center justify-between pb-8 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-3xl bg-gray-200 dark:bg-gray-700" />
                      <div className="space-y-2">
                        <div className="w-48 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                        <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                      </div>
                    </div>
                    <div className="w-32 h-12 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="h-48 rounded-[2rem] bg-gray-100 dark:bg-gray-800" />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="h-64 rounded-[2rem] bg-gray-100 dark:bg-gray-800" />
                      <div className="h-48 rounded-[2rem] bg-gray-100 dark:bg-gray-800" />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-3xl bg-primary/10 text-primary">
                        <School size={32} />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{hallDetails?.name}</h2>
                        <p className="text-gray-500 flex items-center gap-2">
                          <Users size={16} /> {hallDetails?.students?.length} / {hallDetails?.capacity} Students Assigned
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setIsQrModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-2xl font-bold hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all"
                      >
                        <QrCode size={20} />
                        Scan QR
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => setIsAssignModalOpen(true)}
                          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                        >
                          <UserPlus size={20} />
                          Assign Student
                        </button>
                      )}
                      <button 
                        onClick={() => setIsDetailModalOpen(false)}
                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-colors text-gray-500"
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left side: Student List */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Users className="text-primary" size={24} />
                            Enrolled Students
                          </h3>
                          <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                              type="text"
                              placeholder="Search by ID or Name..."
                              value={studentSearchTerm}
                              onChange={(e) => setStudentSearchTerm(e.target.value)}
                              className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-primary outline-none text-sm transition-all dark:text-gray-100"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredStudents?.map((item, idx) => (
                            <motion.div 
                              key={item.student?._id || idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-5 rounded-3xl border transition-all duration-300 group hover:shadow-xl ${
                                item.student?.isCleared 
                                  ? item.student?.isTemporarilyCleared
                                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/50 hover:border-amber-300'
                                    : 'bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900/50 hover:border-green-300'
                                  : 'bg-red-50/50 dark:bg-red-950/20 border-red-100 dark:border-red-900/50 hover:border-red-300'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner ${
                                    item.student?.isCleared 
                                      ? item.student?.isTemporarilyCleared
                                        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                                        : 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                                      : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                                  }`}>
                                    {item.student?.name?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 dark:text-gray-100 text-lg group-hover:text-primary transition-colors">{item.student?.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-tight">ID: {item.student?.customId || 'N/A'}</p>
                                    <div className="mt-2 flex items-center gap-3">
                                      <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg text-xs font-bold border border-gray-100 dark:border-gray-700 dark:text-gray-200">
                                        Seat {item.seatNumber || 'N/A'}
                                      </span>
                                      {item.student?.isTemporarilyCleared && (
                                        <span className="px-3 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                          <CountdownTimer expiresAt={item.student.temporaryAccessExpiresAt} />
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {isAdmin && item.student?.hasOwedMoney && !item.student?.isTemporarilyCleared && (
                                    <button 
                                      onClick={() => { setSelectedStudentForClearance(item.student); setIsClearanceModalOpen(true); }}
                                      className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all"
                                      title="Grant Temporary Clearance"
                                    >
                                      <ShieldAlert size={18} />
                                    </button>
                                  )}
                                  {isAdmin && item.student?.isTemporarilyCleared && (
                                    <button 
                                      onClick={() => handleRevokeClearance(item.student?._id)}
                                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                      title="Revoke Temporary Clearance"
                                    >
                                      <UserMinus size={18} />
                                    </button>
                                  )}
                                  {isAdmin && (
                                    <button 
                                      onClick={() => handleRemoveStudent(item.student?._id)}
                                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex flex-col gap-2">
                                  {item.student?.isCleared ? (
                                    item.student?.isTemporarilyCleared ? (
                                      <>
                                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider bg-amber-100/50 dark:bg-amber-900/30 px-3 py-1.5 rounded-full w-fit">
                                          <Timer size={14} />
                                          <span>Temporarily Cleared</span>
                                        </div>
                                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold leading-relaxed pl-1">
                                          Access granted by {item.student.temporaryAccessGrantedBy}. Reason: {item.student.temporaryAccessReason || 'No reason provided'}.
                                        </p>
                                      </>
                                    ) : (
                                      <>
                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-xs uppercase tracking-wider bg-green-100/50 dark:bg-green-900/30 px-3 py-1.5 rounded-full w-fit">
                                          <ShieldCheck size={14} />
                                          <span>Cleared for Exam</span>
                                        </div>
                                        <p className="text-[11px] text-green-600 dark:text-green-400 font-bold leading-relaxed pl-1">
                                          The student who does not owe money is waiting for you to come out successfully, which means that he can take his exam and be released.
                                        </p>
                                      </>
                                    )
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs uppercase tracking-wider bg-red-100/50 dark:bg-red-900/30 px-3 py-1.5 rounded-full w-fit">
                                        <AlertTriangle size={14} />
                                        <span>Financial Debt</span>
                                      </div>
                                      <p className="text-[11px] text-red-500 dark:text-red-400 font-bold leading-relaxed pl-1">
                                        This student owes {item.student?.unpaidCount} month(s) of fees. Please refer to the finance office.
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                          {hallDetails?.students?.length === 0 && (
                            <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-gray-800/30 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                              <UserPlus size={40} className="mx-auto text-gray-300 mb-2" />
                              <p className="text-gray-500 font-medium">No students assigned to this hall yet.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right side: Hall Stats & Security */}
                      <div className="space-y-8">
                        <div className="bg-gray-50 dark:bg-gray-800/80 rounded-[2rem] p-8 border border-gray-100 dark:border-gray-700 shadow-xl">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <ShieldCheck className="text-primary" size={24} />
                            Security Clearance
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-700/50 rounded-2xl shadow-sm border border-gray-50 dark:border-gray-600 transition-colors">
                              <span className="text-sm font-semibold text-gray-500 dark:text-gray-300">Total Enrolled</span>
                              <span className="text-xl font-black text-gray-900 dark:text-white">{hallDetails?.students?.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-500/10 rounded-2xl border border-green-100 dark:border-green-500/30 transition-colors">
                              <span className="text-sm font-bold text-green-600 dark:text-green-400 uppercase tracking-tight">CLEARED</span>
                              <span className="text-xl font-black text-green-700 dark:text-green-400">
                                {hallDetails?.students?.filter(s => s.student?.isCleared && !s.student?.isTemporarilyCleared).length}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/30 transition-colors">
                              <span className="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tight">TEMP CLEARED</span>
                              <span className="text-xl font-black text-amber-700 dark:text-amber-400">
                                {hallDetails?.students?.filter(s => s.student?.isTemporarilyCleared).length}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/30 transition-colors">
                              <span className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-tight">OWES MONEY</span>
                              <span className="text-xl font-black text-red-700 dark:text-red-400">
                                {hallDetails?.students?.filter(s => !s.student?.isCleared).length}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-primary/5 dark:bg-primary/10 rounded-[2rem] p-8 border border-primary/10">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <UserPlus className="text-primary" size={24} />
                            Supervisors
                          </h3>
                          <div className="space-y-3">
                            {hallDetails?.supervisors?.map(sup => (
                              <div key={sup._id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-white dark:border-gray-700">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                  {sup.name?.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900 dark:text-white">{sup.name}</p>
                                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{sup.customId}</p>
                                </div>
                              </div>
                            ))}
                            {hallDetails?.supervisors?.length === 0 && (
                              <p className="text-sm text-gray-400 italic text-center py-4">No supervisors assigned</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Scan Modal */}
      <AnimatePresence>
        {isQrModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <QrCode size={24} />
                    Scan Student ID Card
                  </h2>
                </div>
                <button 
                  onClick={() => setIsQrModalOpen(false)}
                  className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-colors text-gray-500"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-8">
                <div 
                  id="qr-reader" 
                  className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
                ></div>
                
                {/* QR Scanned Result */}
                {qrVerificationResult && (
                  <div className="mt-6 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Verification Result</h3>
                    {qrVerificationResult.valid ? (
                      <div className="text-green-600 dark:text-green-400 font-medium">
                        <CheckCircle className="inline mr-2" size={16} />
                        Valid ID Card
                      </div>
                    ) : (
                      <div className="text-red-600 dark:text-red-400 font-medium">
                        <AlertTriangle className="inline mr-2" size={16} />
                        Invalid or Expired ID Card
                      </div>
                    )}
                    
                    {qrVerificationResult.data && (
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {qrVerificationResult.data.user && (
                          <div className="p-4 bg-white dark:bg-gray-700/50 rounded-xl">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Student</p>
                            <p className="font-bold text-gray-900 dark:text-white">{qrVerificationResult.data.user.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{qrVerificationResult.data.user.customId}</p>
                          </div>
                        )}
                        
                        {qrVerificationResult.data.branch && (
                          <div className="p-4 bg-white dark:bg-gray-700/50 rounded-xl">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Branch</p>
                            <p className="font-bold text-gray-900 dark:text-white">{qrVerificationResult.data.branch.name}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Initialize QR Scanner */}
      {isQrModalOpen && (
        <script dangerouslySetInnerHTML={{
          __html: `
            window.loadQrScanner = function() {
              if (typeof Html5QrcodeScanner !== 'undefined') {
                const html5QrCodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } });
                html5QrCodeScanner.render(function(decodedText, decodedResult) {
                  try {
                    const data = JSON.parse(decodedText);
                    if (data.verificationToken) {
                      window.dispatchEvent(new CustomEvent('qr-scanned', { detail: data.verificationToken }));
                    }
                  } catch (e) {
                    console.error('Error parsing QR code', e);
                  }
                }, function(errorMessage) {
                  console.error('QR Error:', errorMessage);
                });
                window.qrScannerInstance = html5QrCodeScanner;
              }
            };
            
            if (document.readyState === 'complete') {
              window.loadQrScanner();
            } else {
              window.addEventListener('load', window.loadQrScanner);
            }
          `
        }} />
      )}
      


      {/* Create Hall Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 w-full max-w-lg shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isEditing ? 'Edit Exam Hall' : 'Create Exam Hall'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {isEditing ? 'Update supervisors and hall details.' : 'Setup a new location for upcoming exams.'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateHall} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Hall Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    placeholder="e.g. Main Hall A"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Student Capacity</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                      placeholder="e.g. 50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Session</label>
                    <select
                      value={formData.examSession}
                      onChange={(e) => setFormData({ ...formData, examSession: e.target.value })}
                      className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none"
                    >
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Evening">Evening</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={formData.examDate}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Assign Supervisors</label>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                    {teachers?.map(teacher => (
                      <label key={teacher._id} className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-gray-600 rounded-xl cursor-pointer transition-colors">
                        <input 
                          type="checkbox"
                          checked={formData.supervisors.includes(teacher._id)}
                          onChange={(e) => {
                            const newSups = e.target.checked 
                              ? [...formData.supervisors, teacher._id]
                              : formData.supervisors.filter(id => id !== teacher._id);
                            setFormData({ ...formData, supervisors: newSups });
                          }}
                          className="w-5 h-5 rounded-md text-primary focus:ring-primary border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{teacher.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 mt-4"
                >
                  {isCreating || isUpdating ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Exam Hall' : 'Create Exam Hall')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Student Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 w-full max-w-md shadow-2xl border border-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assign Student</h2>
                <button 
                  onClick={() => setIsAssignModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAssignStudent} className="space-y-5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Students</label>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {assignData.studentIds.length} Selected
                    </span>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border-2 border-transparent focus-within:border-primary/20 transition-all">
                    {students?.filter(s => !hallDetails?.students?.some(hs => hs.student?._id === s._id)).map(student => (
                      <label 
                        key={student._id} 
                        className={`flex items-center gap-3 p-3 mb-1 rounded-xl cursor-pointer transition-all ${
                          assignData.studentIds.includes(student._id) 
                            ? 'bg-primary/10 border-primary/20 shadow-sm' 
                            : 'hover:bg-white dark:hover:bg-gray-600'
                        }`}
                      >
                        <input 
                          type="checkbox"
                          checked={assignData.studentIds.includes(student._id)}
                          onChange={(e) => {
                            const newIds = e.target.checked 
                              ? [...assignData.studentIds, student._id]
                              : assignData.studentIds.filter(id => id !== student._id);
                            setAssignData({ ...assignData, studentIds: newIds });
                          }}
                          className="w-5 h-5 rounded-md text-primary focus:ring-primary border-gray-300 transition-all"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">{student.name}</p>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tighter">ID: {student.customId}</p>
                        </div>
                      </label>
                    ))}
                    {students?.filter(s => !hallDetails?.students?.some(hs => hs.student?._id === s._id)).length === 0 && (
                      <p className="text-center py-4 text-sm text-gray-400 italic">No available students</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Seat Prefix (Optional)</label>
                  <input
                    type="text"
                    value={assignData.seatPrefix}
                    onChange={(e) => setAssignData({ ...assignData, seatPrefix: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    placeholder="e.g. ROW-A"
                  />
                  <p className="text-[10px] text-gray-400 italic ml-1">Seat numbers will be auto-generated (e.g. ROW-A-1, ROW-A-2)</p>
                </div>

                <button
                  type="submit"
                  disabled={isAssigning || assignData.studentIds.length === 0}
                  className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <UserPlus size={20} />
                  {isAssigning ? 'Assigning...' : `Assign ${assignData.studentIds.length} Student${assignData.studentIds.length !== 1 ? 's' : ''}`}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteHall}
        title="Delete Exam Hall"
        message={`Are you sure you want to delete "${hallToDelete?.name}"? This will remove all student assignments for this hall.`}
        confirmText="Delete Hall"
        isLoading={isDeleting}
        variant="danger"
      />

      {/* Temporary Clearance Modal */}
      <AnimatePresence>
        {isClearanceModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl border border-white/10"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Temporary Clearance</h2>
                    <p className="text-sm text-gray-500">Grant temporary exam access to {selectedStudentForClearance?.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsClearanceModalOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleGrantClearance} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Number of Days</label>
                    <select
                      required
                      value={clearanceFormData.days}
                      onChange={(e) => setClearanceFormData({ ...clearanceFormData, days: e.target.value })}
                      className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all appearance-none"
                    >
                      <option value="1">1 Day</option>
                      <option value="2">2 Days</option>
                      <option value="3">3 Days</option>
                      <option value="7">1 Week</option>
                      <option value="14">2 Weeks</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-1 block">Status</label>
                    <div className="inline-flex items-center gap-2 px-4 py-3.5 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800">
                      <Timer size={16} className="text-amber-500" />
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400">PENDING PAY</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Reason / Notes</label>
                  <textarea
                    required
                    value={clearanceFormData.reason}
                    onChange={(e) => setClearanceFormData({ ...clearanceFormData, reason: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all resize-none h-24"
                    placeholder="e.g. Student promised to pay by next Monday..."
                  />
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-600 rounded-lg shadow-sm">
                      <CheckCircle size={18} className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Allow Exam Access</p>
                      <p className="text-[10px] text-gray-500 font-medium italic">Student can enter the hall immediately</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={clearanceFormData.allowAccess}
                      onChange={(e) => setClearanceFormData({ ...clearanceFormData, allowAccess: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsClearanceModalOpen(false)}
                    className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGranting}
                    className="flex-[2] py-4 bg-amber-500 text-white rounded-2xl font-bold shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGranting ? 'Granting...' : 'Grant Clearance'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamHallsManagement;
