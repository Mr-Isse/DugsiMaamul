import React, { useMemo, useState } from 'react';
import { 
  Search, 
  Plus, 
  X,
  Check,
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  Edit,
  Trash2,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { 
  useGetBranchesQuery, 
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useToggleBranchStatusMutation
} from '../store/adminApiSlice';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../components/ui/skeleton';

import ConfirmModal from '../components/ConfirmModal';

const BranchesManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    id: null,
    title: '',
    message: ''
  });
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: '',
    principalName: '',
    loginEmail: '',
    password: '',
  });

  const { data: branchesData, isLoading } = useGetBranchesQuery();
  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();
  const [deleteBranch] = useDeleteBranchMutation();
  const [toggleBranchStatus] = useToggleBranchStatusMutation();

  const branches = branchesData?.data || [];

  const handleToggleStatus = async (id) => {
    try {
      await toggleBranchStatus(id).unwrap();
      toast.success('Status updated');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update status');
    }
  };

  const filteredBranches = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter(b => 
      String(b.name || '').toLowerCase().includes(q) || 
      String(b.code || '').toLowerCase().includes(q) ||
      String(b.city || '').toLowerCase().includes(q)
    );
  }, [branches, searchTerm]);

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      country: '',
      principalName: '',
      loginEmail: '',
      password: '',
    });
    setEditingBranch(null);
  };

  const handleOpenModal = (branch = null) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name || '',
        code: branch.code || '',
        phone: branch.phone || '',
        email: branch.email || '',
        address: branch.address || '',
        city: branch.city || '',
        country: branch.country || '',
        principalName: branch.principalName || '',
        loginEmail: branch.loginEmail || '',
        password: '', // Don't show hashed password
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await updateBranch({ id: editingBranch._id, ...formData }).unwrap();
        toast.success('Branch updated successfully');
      } else {
        await createBranch(formData).unwrap();
        toast.success('Branch created successfully');
      }
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save branch');
    }
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      id,
      title: 'Archive Branch',
      message: 'Are you sure you want to archive this branch? This will hide it from active branch lists.'
    });
  };

  const confirmDelete = async () => {
    try {
      await deleteBranch(confirmModal.id).unwrap();
      toast.success('Branch archived successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to archive branch');
    }
  };

  if (isLoading) return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <TableSkeleton />
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Branch Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage school campuses and multi-branch isolation</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95"
        >
          <Plus size={20} />
          Add New Branch
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search branches by name, code or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Branch Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="w-12 h-12 text-slate-200" />
                      <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No branches found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch) => (
                  <tr key={branch._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shadow-sm group-hover:scale-110 transition-transform">
                          {branch.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{branch.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Code: {branch.code || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                        <MapPin size={14} className="text-slate-400" />
                        {branch.city}, {branch.country}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          <Phone size={12} className="text-slate-400" />
                          {branch.phone || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          <Mail size={12} className="text-slate-400" />
                          {branch.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        branch.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' 
                        : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-700 dark:border-slate-600'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${branch.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {branch.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => handleToggleStatus(branch._id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          branch.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {branch.status === 'active' ? (
                          <><Check size={12} strokeWidth={3} /> Active</>
                        ) : (
                          <><X size={12} strokeWidth={3} /> Inactive</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(branch)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-xl transition-all"
                          title="Edit Branch"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(branch._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                          title="Archive Branch"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto"
            >
              <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 sticky top-0 z-10 backdrop-blur-sm">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {editingBranch ? 'Edit Branch' : 'Add New Branch'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">Configure campus details and isolation</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-colors shrink-0"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Main Campus"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Branch Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      placeholder="MC-01"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Principal Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={formData.principalName}
                        onChange={(e) => setFormData({...formData, principalName: e.target.value})}
                        placeholder="Dr. John Doe"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="campus@school.com"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+252 61..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                    <input
                      required
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="Mogadishu"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div className="sm:col-span-2 mt-4 pt-6 border-t border-slate-100 dark:border-slate-700">
                    <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Branch Login Credentials</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Login Email / Username</label>
                        <input
                          type="email"
                          value={formData.loginEmail}
                          onChange={(e) => setFormData({...formData, loginEmail: e.target.value})}
                          placeholder="branch-a@school.com"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          {editingBranch ? 'Update Password (Optional)' : 'Branch Password'}
                        </label>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="••••••••"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                      <textarea
                        rows="2"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Wadajir District, Mogadishu..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="sm:flex-1 px-6 py-3 sm:py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all active:scale-95 order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isCreating || isUpdating}
                    type="submit"
                    className="sm:flex-[2] px-6 py-3 sm:py-4 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2 order-1 sm:order-2"
                  >
                    {(isCreating || isUpdating) ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Check size={20} />
                    )}
                    {editingBranch ? 'Update Branch' : 'Create Branch'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmDelete}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Archive"
        type="danger"
      />
    </div>
  );
};

export default BranchesManagement;
