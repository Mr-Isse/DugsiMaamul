import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Link as LinkIcon,
  Phone,
  Mail,
  Key,
  UserPlus
} from 'lucide-react';
import { 
  useGetParentsQuery, 
  useCreateParentMutation, 
  useUpdateParentMutation,
  useDeleteParentMutation,
  useResetParentPasswordMutation,
  useLinkParentToStudentsMutation,
  useGetStudentsQuery
} from '../store/adminApiSlice';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import ConfirmModal from '../components/ConfirmModal';
import { PageLayout, PageHeader, ContentCard } from '../components/PageLayout';
import { Input } from '../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/Dialog';

const ParentsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [parentToDelete, setParentToDelete] = useState(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  const { data: parents, isLoading } = useGetParentsQuery();
  const { data: students } = useGetStudentsQuery();
  const [createParent, { isLoading: isCreating }] = useCreateParentMutation();
  const [updateParent, { isLoading: isUpdating }] = useUpdateParentMutation();
  const [deleteParent, { isLoading: isDeleting }] = useDeleteParentMutation();
  const [resetParentPassword, { isLoading: isResetting }] = useResetParentPasswordMutation();
  const [linkParentToStudents, { isLoading: isLinking }] = useLinkParentToStudentsMutation();
  const [resetData, setResetData] = useState({ mode: 'generate', newPassword: '', generatedPassword: '' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    customId: '',
    password: '',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      customId: '',
      password: '',
    });
  };

  const handleCreateParent = async (e) => {
    e.preventDefault();
    try {
      if (selectedParent) {
        await updateParent({ id: selectedParent._id, ...formData }).unwrap();
        toast.success('Parent account updated successfully');
      } else {
        await createParent(formData).unwrap();
        toast.success('Parent account created successfully');
      }
      setIsModalOpen(false);
      setSelectedParent(null);
      resetForm();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create parent');
    }
  };

  const handleEditParent = (parent) => {
    setSelectedParent(parent);
    setFormData({
      name: parent.name || '',
      email: parent.email || '',
      phone: parent.phone || '',
      customId: parent.customId || '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteParent = async () => {
    try {
      await deleteParent(parentToDelete._id).unwrap();
      toast.success('Parent deleted successfully');
      setIsDeleteModalOpen(false);
      setParentToDelete(null);
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to delete parent');
    }
  };

  const handleResetParentPassword = async (e) => {
    e.preventDefault();
    if (resetData.mode === 'manual' && resetData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    try {
      const result = await resetParentPassword({
        id: selectedParent._id,
        generateRandom: resetData.mode === 'generate',
        newPassword: resetData.mode === 'manual' ? resetData.newPassword : undefined
      }).unwrap();
      toast.success('Password reset successfully');
      if (result?.generatedPassword) {
        setResetData({ mode: 'generate', newPassword: '', generatedPassword: result.generatedPassword });
      } else {
        setIsResetModalOpen(false);
        setResetData({ mode: 'generate', newPassword: '', generatedPassword: '' });
      }
    } catch (err) {
      toast.error(err?.data?.userMessage || err?.data?.message || 'Failed to reset password');
    }
  };

  const handleLinkStudents = async (studentIds) => {
    try {
      await linkParentToStudents({
        parentId: selectedParent._id,
        studentIds
      }).unwrap();
      toast.success('Students linked successfully');
      setIsLinkModalOpen(false);
      setSelectedParent(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to link students');
    }
  };

  const filteredParents = useMemo(() => {
    if (!parents) return [];
    return parents.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm) ||
      p.customId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [parents, searchTerm]);

  const filteredStudents = useMemo(() => {
    if (!students || !selectedParent) return [];
    // Only show students NOT already linked to this parent
    const linkedIds = (selectedParent.linkedStudents || []).map(s => s._id || s);
    return students.filter(s => 
      !linkedIds.includes(s._id) &&
      (s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
       s.customId?.toLowerCase().includes(studentSearchTerm.toLowerCase()))
    );
  }, [students, selectedParent, studentSearchTerm]);

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader isLoading />
        <ContentCard>
          <Skeleton className="h-10 w-full" />
        </ContentCard>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="Parents Management"
        description="Manage parent accounts and link them to their children."
        actions={
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white hover:bg-indigo-700 rounded-2xl font-black shadow-sm shadow-indigo-600/20 transition-all text-xs uppercase tracking-widest"
          >
            <Plus size={18} />
            Add Parent
          </button>
        }
      />

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            type="text"
            placeholder="Search by name, email, phone or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500/50 rounded-2xl text-sm font-bold transition-all outline-none"
          />
        </div>
      </div>

      {/* Parents Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Parent</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Linked Children</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {filteredParents.map((parent) => (
                <tr key={parent._id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg">
                        {parent.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{parent.name}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{parent.customId || 'No ID'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
                        <Phone size={14} className="text-gray-400" />
                        {parent.phone || 'N/A'}
                      </div>
                      {parent.email && (
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                          <Mail size={14} className="text-gray-400" />
                          {parent.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-2">
                      {parent.linkedStudents?.length > 0 ? (
                        parent.linkedStudents.map((child) => (
                          <span key={child._id} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                            {child.name} ({child.class?.name || 'N/A'})
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-bold text-gray-400 italic">No children linked</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setSelectedParent(parent); setIsLinkModalOpen(true); }}
                        className="p-2.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors"
                        title="Link Children"
                      >
                        <LinkIcon size={18} />
                      </button>
                      <button 
                        onClick={() => { setSelectedParent(parent); setIsResetModalOpen(true); }}
                        className="p-2.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-colors"
                        title="Reset Password"
                      >
                        <Key size={18} />
                      </button>
                      <button 
                        onClick={() => handleEditParent(parent)}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
                        title="Edit Parent"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => { setParentToDelete(parent); setIsDeleteModalOpen(true); }}
                        className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"
                        title="Delete Parent"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredParents.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-8 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-300">
                        <Users size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-black text-gray-900 dark:text-white uppercase tracking-widest">No parents found</p>
                        <p className="text-sm text-gray-500">Try adjusting your search or add a new parent.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Parent Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) { setIsModalOpen(false); setSelectedParent(null); resetForm(); }}}>
        <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedParent ? 'Edit Parent' : 'Add New Parent'}</DialogTitle>
          </DialogHeader>
          <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-sm shadow-indigo-600/20">
                {selectedParent ? <Edit2 size={24} /> : <UserPlus size={24} />}
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                  {selectedParent ? 'Edit Parent' : 'Add New Parent'}
                </h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                  {selectedParent ? 'Update parent account details' : 'Create a login account for parents'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateParent} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                <Input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500/30 rounded-2xl text-sm font-bold transition-all outline-none"
                  placeholder="Mohamed Ali"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                  <Input 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500/30 rounded-2xl text-sm font-bold transition-all outline-none"
                    placeholder="parent@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <Input 
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500/30 rounded-2xl text-sm font-bold transition-all outline-none"
                    placeholder="061XXXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Parent ID (Optional)</label>
                  <Input 
                    type="text"
                    value={formData.customId}
                    onChange={(e) => setFormData({...formData, customId: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500/30 rounded-2xl text-sm font-bold transition-all outline-none"
                    placeholder="PAR12345"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                  <Input 
                    required={!selectedParent}
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-indigo-500/30 rounded-2xl text-sm font-bold transition-all outline-none"
                    placeholder={selectedParent ? 'leave blank to keep unchanged' : 'enter password'}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isCreating || isUpdating}
                className="w-full px-8 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {isCreating || isUpdating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  selectedParent ? 'Update Parent Account' : 'Create Parent Account'
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Link Students Modal */}
      <Dialog open={isLinkModalOpen} onOpenChange={(open) => { if (!open) { setIsLinkModalOpen(false); }}}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <DialogHeader className="sr-only">
            <DialogTitle>Link Children</DialogTitle>
          </DialogHeader>
          <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-sm shadow-indigo-600/20">
                <LinkIcon size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Link Children</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Link {selectedParent?.name} to their children</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                type="text"
                placeholder="Search students by name or ID..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500/50 rounded-2xl text-sm font-bold transition-all outline-none"
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <div 
                    key={student._id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-transparent hover:border-indigo-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                        {student.name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white text-sm">{student.name}</div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{student.customId} &bull; {student.class?.name || 'No Class'}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleLinkStudents([student._id])}
                      disabled={isLinking}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all opacity-0 group-hover:opacity-100 shadow-sm shadow-indigo-600/20"
                    >
                      {isLinking ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={14} />}
                      Link Child
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 font-bold">No students found matching your search.</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-50 dark:border-gray-800">
               <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  <span>Currently Linked</span>
                  <span>{selectedParent?.linkedStudents?.length || 0} Children</span>
               </div>
               <div className="mt-4 flex flex-wrap gap-2">
                  {selectedParent?.linkedStudents?.map(child => (
                    <div key={child._id} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-wider border border-indigo-100/50 dark:border-indigo-500/20">
                      {child.name}
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={isResetModalOpen} onOpenChange={(open) => { if (!open) { setIsResetModalOpen(false); setSelectedParent(null); setResetData({ mode: 'generate', newPassword: '', generatedPassword: '' }); }}}>
        <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
          <DialogHeader className="sr-only">
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="p-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Key size={16} className="text-white" />
                </div>
                <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">Security</span>
              </div>
              <h2 className="text-2xl font-bold font-heading tracking-tight">Reset Password</h2>
              <p className="text-white/70 text-xs mt-1">For <span className="text-white font-bold">{selectedParent?.name}</span></p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <form onSubmit={handleResetParentPassword} className="space-y-6">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setResetData(prev => ({ ...prev, mode: 'generate' }))}
                  className={`py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${resetData.mode === 'generate' ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20' : 'bg-gray-50 dark:bg-gray-800 text-gray-500'}`}
                >
                  Generate
                </button>
                <button
                  type="button"
                  onClick={() => setResetData(prev => ({ ...prev, mode: 'manual' }))}
                  className={`py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${resetData.mode === 'manual' ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20' : 'bg-gray-50 dark:bg-gray-800 text-gray-500'}`}
                >
                  Manual
                </button>
              </div>

              {resetData.mode === 'manual' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                    New Password
                  </label>
                  <Input
                    type="text"
                    value={resetData.newPassword}
                    onChange={(e) => setResetData(prev => ({ ...prev, newPassword: e.target.value }))}
                    autoFocus
                    className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-amber-400 rounded-2xl text-sm font-bold transition-all outline-none"
                    placeholder="Enter at least 8 characters"
                  />
                </div>
              )}

              {resetData.generatedPassword && (
                <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/10 px-6 py-4 border border-amber-100 dark:border-amber-500/20">
                  <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Generated Password</p>
                  <p className="text-sm font-black text-gray-900 dark:text-gray-100 font-mono select-all bg-white dark:bg-gray-900 px-4 py-2.5 rounded-xl border border-dashed border-amber-200 dark:border-amber-500/30">{resetData.generatedPassword}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isResetting || (resetData.mode === 'manual' && resetData.newPassword.length < 8)}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-black shadow-sm shadow-amber-500/30 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none uppercase tracking-widest text-xs"
              >
                {isResetting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Key size={16} /> 
                    <span>Reset Password</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Parent Confirmation */}
      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setParentToDelete(null); }}
        onConfirm={handleDeleteParent}
        title="Delete Parent"
        message={`Are you sure you want to delete ${parentToDelete?.name}? This action will permanently remove their parent account and cannot be undone.`}
        confirmText="Delete Parent"
        isLoading={isDeleting}
      />
    </PageLayout>
  );
};

export default ParentsManagement;
