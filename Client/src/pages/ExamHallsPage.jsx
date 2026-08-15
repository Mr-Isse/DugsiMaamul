import { useMemo, useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  X,
  Users,
  School,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  UserPlus,
  UserMinus,
  AlertTriangle,
  ShieldCheck,
  Timer,
  ShieldAlert
} from 'lucide-react';
import { 
  useGetExamHallsQuery, 
  useCreateExamHallMutation,
  useUpdateExamHallMutation,
  useDeleteExamHallMutation,
  useGetExamHallQuery,
  useAssignStudentToHallMutation,
  useRemoveStudentFromHallMutation,
  useGetStudentsQuery,
  useGetTeachersQuery,
  useGrantTemporaryClearanceMutation,
  useRevokeTemporaryClearanceMutation,
} from '@/services/api';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
    }, 60000);

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

const ExamHallsPage = () => {
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
  const [selectedHallId, setSelectedHallId] = useState(null);
  const [hallToDelete, setHallToDelete] = useState(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  
  // Temporary Clearance State
  const [isClearanceModalOpen, setIsClearanceModalOpen] = useState(false);
  const [selectedStudentForClearance, setSelectedStudentForClearance] = useState(null);
  const [clearanceFormData, setClearanceFormData] = useState({
    days: '1',
    reason: '',
    allowAccess: true,
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

  const { data: halls, isLoading, refetch } = useGetExamHallsQuery(
    isTeacher && showMyHallsOnly ? { myHalls: 'true' } : undefined
  );
  const { data: students, isLoading: isLoadingStudents } = useGetStudentsQuery();
  const { data: teachers, isLoading: isLoadingTeachers } = useGetTeachersQuery();
  const { data: hallDetails, isLoading: isDetailsLoading } = useGetExamHallQuery(selectedHallId, {
    skip: !selectedHallId
  });

  const [createHall, { isLoading: isCreating }] = useCreateExamHallMutation();
  const [updateHall, { isLoading: isUpdating }] = useUpdateExamHallMutation();
  const [deleteHall, { isLoading: isDeleting }] = useDeleteExamHallMutation();
  const [assignStudent, { isLoading: isAssigning }] = useAssignStudentToHallMutation();
  const [removeStudent, { isLoading: isRemoving }] = useRemoveStudentFromHallMutation();
  const [grantClearance, { isLoading: isGranting }] = useGrantTemporaryClearanceMutation();
  const [revokeClearance, { isLoading: isRevoking }] = useRevokeTemporaryClearanceMutation();

  const filteredStudents = useMemo(() => {
    const list = hallDetails?.students || [];
    const q = studentSearchTerm.trim().toLowerCase();
    if (!q) return list;
    return list.filter(item => 
      String(item.student?.name || '').toLowerCase().includes(q) ||
      String(item.student?.customId || '').toLowerCase().includes(q)
    );
  }, [hallDetails?.students, studentSearchTerm]);

  const filteredHalls = useMemo(() => {
    const list = Array.isArray(halls) ? halls : halls?.data || [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return list;
    return list.filter(h => 
      String(h.name || '').toLowerCase().includes(q)
    );
  }, [halls, searchTerm]);

  const handleGrantClearance = async (e) => {
    e.preventDefault();
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + parseInt(clearanceFormData.days));
      
      await grantClearance({
        studentId: selectedStudentForClearance._id,
        expiresAt: expiryDate,
        reason: clearanceFormData.reason,
        allowAccess: clearanceFormData.allowAccess,
      }).unwrap();
      
      toast.success('Temporary clearance granted');
      setIsClearanceModalOpen(false);
      setClearanceFormData({ days: '1', reason: '', allowAccess: true });
      refetch();
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to grant clearance');
    }
  };

  const handleRevokeClearance = async (studentId) => {
    try {
      await revokeClearance({ studentId }).unwrap();
      toast.success('Clearance revoked');
      refetch();
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to revoke clearance');
    }
  };

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
      refetch();
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
      refetch();
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to delete exam hall');
    }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    try {
      // Check capacity
      const currentAssigned = hallDetails?.students?.length || 0;
      const newAssignments = assignData.studentIds.length;
      const totalAfterAssign = currentAssigned + newAssignments;
      
      if (totalAfterAssign > hallDetails?.capacity) {
        toast.error(`Capacity exceeded. Available spots: ${hallDetails?.capacity - currentAssigned}`);
        return;
      }
      
      await assignStudent({
        id: selectedHallId,
        ...assignData
      }).unwrap();
      toast.success('Students assigned successfully');
      setIsAssignModalOpen(false);
      setAssignData({ studentIds: [], seatPrefix: '' });
      refetch();
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
      refetch();
    } catch (err) {
      toast.error(err?.data?.userMessage || 'Failed to remove student');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Hall Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isAdmin 
              ? 'Manage halls, seat assignments, and student financial clearance.' 
              : 'View assigned exam halls and student attendance status.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
          {isAdmin && (
            <Button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
            >
              <Plus size={20} className="mr-2" />
              Add New Hall
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search by hall name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12"
            />
          </div>
          
          {isTeacher && (
            <div className="flex items-center gap-2 p-1 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
              <Button
                variant={!showMyHallsOnly ? "default" : "ghost"}
                size="sm"
                onClick={() => setShowMyHallsOnly(false)}
              >
                All Halls
              </Button>
              <Button
                variant={showMyHallsOnly ? "default" : "ghost"}
                size="sm"
                onClick={() => setShowMyHallsOnly(true)}
              >
                My Assignments
              </Button>
            </div>
          )}
        </div>

        <div className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hall Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Supervisors</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHalls?.map((hall) => (
                <TableRow key={hall._id}>
                  <TableCell className="font-medium">{hall.name}</TableCell>
                  <TableCell>{new Date(hall.examDate).toLocaleDateString()}</TableCell>
                  <TableCell><Badge variant="outline">{hall.examSession}</Badge></TableCell>
                  <TableCell>{hall.capacity}</TableCell>
                  <TableCell>{hall.students?.length || 0}</TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {hall.supervisors?.slice(0, 3).map((sup, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                          {sup.name?.charAt(0)}
                        </div>
                      ))}
                      {(hall.supervisors?.length || 0) > 3 && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-bold text-gray-500">
                          +{(hall.supervisors?.length || 0) - 3}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => { setSelectedHallId(hall._id); setIsDetailModalOpen(true); }}
                      >
                        <Users size={18} />
                      </Button>
                      {isAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(hall)}
                          >
                            <Edit2 size={18} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setHallToDelete(hall); setIsDeleteModalOpen(true); }}
                            className="text-red-600"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredHalls?.length === 0 && (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
              <School size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No exam halls found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Start by adding a new hall for your upcoming exams.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{hallDetails?.name}</DialogTitle>
            <DialogDescription>
              {hallDetails?.students?.length || 0} / {hallDetails?.capacity} Students Assigned
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {isDetailsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left side: Student List */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="text-blue-600" size={24} />
                        Enrolled Students
                      </h3>
                      {isAdmin && (
                        <Button onClick={() => setIsAssignModalOpen(true)}>
                          <UserPlus size={18} className="mr-2" />
                          Assign Student
                        </Button>
                      )}
                    </div>
                    <div className="mb-4">
                      <Input
                        placeholder="Search by ID or Name..."
                        value={studentSearchTerm}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredStudents?.map((item, idx) => (
                        <div 
                          key={item.student?._id || idx}
                          className={`p-4 rounded-lg border ${
                            item.student?.isCleared 
                              ? item.student?.isTemporarilyCleared
                                ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                                : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                              : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold ${
                                item.student?.isCleared 
                                  ? item.student?.isTemporarilyCleared
                                    ? 'bg-amber-200 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                                    : 'bg-green-200 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                                  : 'bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                              }`}>
                                {item.student?.name?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">{item.student?.name}</p>
                                <p className="text-sm text-gray-500">ID: {item.student?.customId || 'N/A'}</p>
                                <div className="mt-2 flex items-center gap-2">
                                  <Badge variant="outline">Seat {item.seatNumber || 'N/A'}</Badge>
                                  {item.student?.isTemporarilyCleared && (
                                    <Badge className="bg-amber-500 text-white">
                                      <CountdownTimer expiresAt={item.student.temporaryAccessExpiresAt} />
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {isAdmin && item.student?.hasOwedMoney && !item.student?.isTemporarilyCleared && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => { setSelectedStudentForClearance(item.student); setIsClearanceModalOpen(true); }}
                                  className="text-amber-500"
                                >
                                  <ShieldAlert size={18} />
                                </Button>
                              )}
                              {isAdmin && item.student?.isTemporarilyCleared && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRevokeClearance(item.student?._id)}
                                  className="text-red-500"
                                >
                                  <UserMinus size={18} />
                                </Button>
                              )}
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveStudent(item.student?._id)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 size={18} />
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            {item.student?.isCleared ? (
                              item.student?.isTemporarilyCleared ? (
                                <>
                                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium text-xs uppercase">
                                    <Timer size={14} />
                                    <span>Temporarily Cleared</span>
                                  </div>
                                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                    Access granted by {item.student.temporaryAccessGrantedBy}. Reason: {item.student.temporaryAccessReason || 'No reason provided'}.
                                  </p>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium text-xs uppercase">
                                    <ShieldCheck size={14} />
                                    <span>Cleared for Exam</span>
                                  </div>
                                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    Student has no outstanding fees and is cleared for the exam.
                                  </p>
                                </>
                              )
                            ) : (
                              <>
                                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium text-xs uppercase">
                                  <AlertTriangle size={14} />
                                  <span>Financial Debt</span>
                                </div>
                                <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                  This student owes {item.student?.unpaidCount} month(s) of fees. Please refer to the finance office.
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      {hallDetails?.students?.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-gray-50 dark:bg-gray-800/30 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                          <UserPlus size={40} className="mx-auto text-gray-300 mb-2" />
                          <p className="text-gray-500 font-medium">No students assigned to this hall yet.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right side: Hall Stats */}
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Hall Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Total Capacity</span>
                          <span className="font-bold text-gray-900 dark:text-white">{hallDetails?.capacity}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Assigned</span>
                          <span className="font-bold text-gray-900 dark:text-white">{hallDetails?.students?.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Available</span>
                          <span className="font-bold text-green-600">{(hallDetails?.capacity || 0) - (hallDetails?.students?.length || 0)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Security Clearance</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">CLEARED</span>
                          <span className="font-bold text-green-700 dark:text-green-400">
                            {hallDetails?.students?.filter(s => s.student?.isCleared && !s.student?.isTemporarilyCleared).length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">TEMP CLEARED</span>
                          <span className="font-bold text-amber-700 dark:text-amber-400">
                            {hallDetails?.students?.filter(s => s.student?.isTemporarilyCleared).length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">OWES MONEY</span>
                          <span className="font-bold text-red-700 dark:text-red-400">
                            {hallDetails?.students?.filter(s => !s.student?.isCleared).length}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Supervisors</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {hallDetails?.supervisors?.map(sup => (
                          <div key={sup._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                              {sup.name?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{sup.name}</p>
                              <p className="text-xs text-gray-500">{sup.customId}</p>
                            </div>
                          </div>
                        ))}
                        {hallDetails?.supervisors?.length === 0 && (
                          <p className="text-sm text-gray-400 italic text-center py-4">No supervisors assigned</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Exam Hall' : 'Create New Exam Hall'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update exam hall information' : 'Fill in the details to create a new exam hall'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateHall} className="space-y-4">
            <div>
              <Label>Hall Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Capacity</Label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Exam Date</Label>
              <Input
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Session</Label>
              <Select
                value={formData.examSession}
                onValueChange={(value) => setFormData({ ...formData, examSession: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Morning">Morning</SelectItem>
                  <SelectItem value="Afternoon">Afternoon</SelectItem>
                  <SelectItem value="Evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assign Supervisors</Label>
              <div className="border border-gray-100 dark:border-gray-600 rounded-lg p-4 max-h-32 overflow-y-auto space-y-2">
                {isLoadingTeachers ? (
                  <p className="text-gray-500 text-center py-4">Loading teachers...</p>
                ) : teachers && teachers.length > 0 ? (
                  teachers.map(teacher => (
                    <label key={teacher._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formData.supervisors.includes(teacher._id)}
                        onChange={(e) => {
                          const newSups = e.target.checked 
                            ? [...formData.supervisors, teacher._id]
                            : formData.supervisors.filter(id => id !== teacher._id);
                          setFormData({ ...formData, supervisors: newSups });
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-900 dark:text-white">{teacher.name}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No teachers available</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsModalOpen(false); resetForm(); }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? 'Saving...' : isEditing ? 'Update Hall' : 'Create Hall'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Exam Hall</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{hallToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteHall}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Student Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Assign Students to Hall</DialogTitle>
            <DialogDescription>
              {hallDetails?.name} - Capacity: {hallDetails?.capacity}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignStudent} className="p-6 space-y-4 overflow-y-auto flex-1">
            <div>
              <Label>Select Students</Label>
              <div className="border border-gray-100 dark:border-gray-600 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                {isLoadingStudents ? (
                  <p className="text-gray-500 text-center py-4">Loading students...</p>
                ) : students && students.length > 0 ? (
                  students.filter(s => !hallDetails?.students?.some(hs => hs.student?._id === s._id)).map((student) => (
                    <label key={student._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assignData.studentIds.includes(student._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setAssignData({ ...assignData, studentIds: [...assignData.studentIds, student._id] });
                          } else {
                            setAssignData({ ...assignData, studentIds: assignData.studentIds.filter(id => id !== student._id) });
                          }
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-900 dark:text-white">{student.name} ({student.customId})</span>
                    </label>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No students available</p>
                )}
                {!isLoadingStudents && students && students.filter(s => !hallDetails?.students?.some(hs => hs.student?._id === s._id)).length === 0 && (
                  <p className="text-gray-500 text-center py-4">All students already assigned</p>
                )}
              </div>
            </div>
            <div>
              <Label>Seat Prefix (Optional)</Label>
              <Input
                value={assignData.seatPrefix}
                onChange={(e) => setAssignData({ ...assignData, seatPrefix: e.target.value })}
                placeholder="e.g. A-"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsAssignModalOpen(false); setAssignData({ studentIds: [], seatPrefix: '' }); }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAssigning}
              >
                {isAssigning ? 'Assigning...' : 'Assign Students'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Temporary Clearance Modal */}
      <Dialog open={isClearanceModalOpen} onOpenChange={setIsClearanceModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Grant Temporary Clearance</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGrantClearance} className="space-y-4">
            <div>
              <Label>Student</Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white">{selectedStudentForClearance?.name}</p>
                <p className="text-sm text-gray-500">{selectedStudentForClearance?.customId}</p>
              </div>
            </div>
            <div>
              <Label>Number of Days</Label>
              <Select
                value={clearanceFormData.days}
                onValueChange={(value) => setClearanceFormData({ ...clearanceFormData, days: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="2">2 Days</SelectItem>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="7">1 Week</SelectItem>
                  <SelectItem value="14">2 Weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason</Label>
              <Input
                value={clearanceFormData.reason}
                onChange={(e) => setClearanceFormData({ ...clearanceFormData, reason: e.target.value })}
                required
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Allow Exam Access</p>
                <p className="text-xs text-gray-500">Student can enter the hall immediately</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={clearanceFormData.allowAccess}
                  onChange={(e) => setClearanceFormData({ ...clearanceFormData, allowAccess: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setIsClearanceModalOpen(false); setClearanceFormData({ days: '1', reason: '' }); }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isGranting}
              >
                {isGranting ? 'Granting...' : 'Grant Clearance'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamHallsPage;
