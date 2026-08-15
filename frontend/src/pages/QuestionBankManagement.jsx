import { useState } from 'react';
import {
  BookOpen, Plus, Edit, Trash2, Search, Filter, Loader2, AlertCircle, CheckCircle2, X,
  Copy, Send, Check, XCircle, BarChart3, Hash, Layers, Tag, ChevronDown, Eye, Archive
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useCreateQuestionBankMutation, useGetQuestionBanksQuery, useUpdateQuestionBankMutation,
  useDeleteQuestionBankMutation, useGetSubjectsQuery, useGetClassesQuery,
  useCloneQuestionBankMutation, useSubmitBankForApprovalMutation, useApproveQuestionBankMutation
} from '../store/adminApiSlice';

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  PUBLISHED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ARCHIVED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};
const APPROVAL_COLORS = {
  NOT_REQUIRED: 'bg-gray-100 text-gray-600',
  PENDING_REVIEW: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const QuestionBankManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', subject: '', class: '', tags: '', category: '', approvalRequired: false
  });

  const [createBank, { isLoading: isCreating }] = useCreateQuestionBankMutation();
  const [updateBank, { isLoading: isUpdating }] = useUpdateQuestionBankMutation();
  const [deleteBank, { isLoading: isDeleting }] = useDeleteQuestionBankMutation();
  const [cloneBank, { isLoading: isCloning }] = useCloneQuestionBankMutation();
  const [submitApproval, { isLoading: isSubmitting }] = useSubmitBankForApprovalMutation();
  const [approveBankAction, { isLoading: isApproving }] = useApproveQuestionBankMutation();
  const { data: banksData, isLoading, refetch } = useGetQuestionBanksQuery({
    subject: filterSubject || undefined, class: filterClass || undefined, page, limit: 20
  });
  const { data: subjects } = useGetSubjectsQuery();
  const { data: classes } = useGetClassesQuery();

  const banks = banksData?.questionBanks || [];
  const pagination = banksData?.pagination;

  const filteredBanks = banks.filter(b =>
    !searchQuery || b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalQuestions = filteredBanks.reduce((sum, b) => sum + (b.totalQuestions || 0), 0);
  const publishedCount = filteredBanks.filter(b => b.status === 'PUBLISHED').length;
  const pendingCount = filteredBanks.filter(b => b.approvalStatus === 'PENDING_REVIEW').length;

  const openCreate = () => {
    setEditingBank(null);
    setFormData({ name: '', description: '', subject: '', class: '', tags: '', category: '', approvalRequired: false });
    setShowModal(true);
  };

  const openEdit = (bank) => {
    setEditingBank(bank);
    setFormData({
      name: bank.name || '', description: bank.description || '', subject: bank.subject?._id || bank.subject || '',
      class: bank.class?._id || bank.class || '', tags: (bank.tags || []).join(', '), category: bank.category || '',
      approvalRequired: bank.approvalRequired || false
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...formData, tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [] };
      if (editingBank) {
        await updateBank({ id: editingBank._id, ...data }).unwrap();
        toast.success('Question bank updated');
      } else {
        await createBank(data).unwrap();
        toast.success('Question bank created');
      }
      setShowModal(false); refetch();
    } catch (error) { toast.error(error.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    try { await deleteBank(id).unwrap(); toast.success('Deleted'); setConfirmDelete(null); refetch(); }
    catch (error) { toast.error(error.data?.message || 'Failed'); }
  };

  const handleClone = async (bank) => {
    try {
      await cloneBank({ id: bank._id, name: `${bank.name} (Copy)` }).unwrap();
      toast.success('Bank cloned'); refetch();
    } catch (error) { toast.error(error.data?.message || 'Failed to clone'); }
  };

  const handleSubmitApproval = async (bank) => {
    try { await submitApproval(bank._id).unwrap(); toast.success('Submitted for approval'); refetch(); }
    catch (error) { toast.error(error.data?.message || 'Failed'); }
  };

  const handleApprove = async (bank, status) => {
    try {
      await approveBankAction({ id: bank._id, status }).unwrap();
      toast.success(`Bank ${status.toLowerCase()}`); refetch();
    } catch (error) { toast.error(error.data?.message || 'Failed'); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Question Banks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage question banks with approval workflow, analytics & bulk operations</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 active:scale-95 transition-all">
          <Plus size={16} />Create Bank
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Banks', value: filteredBanks.length, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Questions', value: totalQuestions, icon: Hash, color: 'bg-green-50 text-green-600' },
          { label: 'Published', value: publishedCount, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Pending Approval', value: pendingCount, icon: Send, color: 'bg-orange-50 text-orange-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search banks..." className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-primary/40" />
          </div>
          <select value={filterSubject} onChange={e => { setFilterSubject(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm">
            <option value="">All Subjects</option>
            {subjects?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select value={filterClass} onChange={e => { setFilterClass(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm">
            <option value="">All Classes</option>
            {classes?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm">
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        {isLoading ? (
          <div className="p-6"><TableSkeleton rows={6} columns={4} /></div>
        ) : filteredBanks.length === 0 ? (
          <div className="text-center py-16 text-gray-500"><BookOpen size={48} className="mx-auto mb-3 text-gray-300" /><p>No question banks found</p></div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {filteredBanks.map(bank => (
              <div key={bank._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 dark:text-white">{bank.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[bank.status] || STATUS_COLORS.DRAFT}`}>
                        {bank.status || 'DRAFT'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${APPROVAL_COLORS[bank.approvalStatus] || ''}`}>
                        {bank.approvalStatus === 'NOT_REQUIRED' ? '' : bank.approvalStatus?.replace('_', ' ')}
                      </span>
                    </div>
                    {bank.description && <p className="text-sm text-gray-500 mt-1 truncate">{bank.description}</p>}
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Hash size={12} />{bank.totalQuestions || 0} questions</span>
                      {bank.totalPoints > 0 && <span className="text-xs text-gray-500">{bank.totalPoints} points</span>}
                      <span className="text-xs text-gray-500">{bank.subject?.name || 'N/A'}</span>
                      <span className="text-xs text-gray-500">{bank.class?.name || 'N/A'}</span>
                      {bank.version > 1 && <span className="text-xs text-gray-400">v{bank.version}</span>}
                    </div>
                    {bank.totalQuestions > 0 && (
                      <div className="flex items-center gap-3 mt-2">
                        {bank.difficultyDistribution && Object.entries(bank.difficultyDistribution).map(([k, v]) => v > 0 && (
                          <span key={k} className={`text-xs px-2 py-0.5 rounded-full ${
                            k === 'easy' ? 'bg-green-100 text-green-700' : k === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>{v} {k}</span>
                        ))}
                      </div>
                    )}
                    {bank.bloomDistribution && Object.values(bank.bloomDistribution).some(v => v > 0) && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">Bloom:</span>
                        {Object.entries(bank.bloomDistribution).filter(([, v]) => v > 0).map(([k, v]) => (
                          <span key={k} className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded">{k}({v})</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => handleClone(bank)} disabled={isCloning} title="Clone"
                      className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition-colors">
                      <Copy size={15} />
                    </button>
                    {bank.approvalStatus === 'PENDING_REVIEW' && (
                      <>
                        <button onClick={() => handleApprove(bank, 'APPROVED')} disabled={isApproving} title="Approve"
                          className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors">
                          <Check size={15} />
                        </button>
                        <button onClick={() => handleApprove(bank, 'REJECTED')} disabled={isApproving} title="Reject"
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors">
                          <XCircle size={15} />
                        </button>
                      </>
                    )}
                    {bank.approvalStatus === 'NOT_REQUIRED' && bank.status === 'DRAFT' && (
                      <button onClick={() => handleSubmitApproval(bank)} disabled={isSubmitting} title="Submit for approval"
                        className="p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-600 transition-colors">
                        <Send size={15} />
                      </button>
                    )}
                    <button onClick={() => openEdit(bank)} title="Edit"
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 transition-colors">
                      <Edit size={15} />
                    </button>
                    <button onClick={() => setConfirmDelete(bank._id)} title="Delete"
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                {confirmDelete === bank._id && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-between">
                    <span className="text-sm text-red-700 dark:text-red-400">Delete this bank and all its questions?</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(bank._id)} disabled={isDeleting}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold disabled:opacity-50">
                        {isDeleting ? <Loader2 size={12} className="animate-spin inline" /> : 'Confirm'}
                      </button>
                      <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-xs font-semibold">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {pagination && pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages} ({pagination.total} banks)</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-semibold disabled:opacity-50">Previous</button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page >= pagination.pages}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-semibold disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editingBank ? 'Edit Question Bank' : 'Create Question Bank'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Name *</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-primary/40 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Subject *</label>
                  <select value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} required
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-primary/40">
                    <option value="">Select Subject</option>
                    {subjects?.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Class *</label>
                  <select value={formData.class} onChange={e => setFormData({ ...formData, class: e.target.value })} required
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-primary/40">
                    <option value="">Select Class</option>
                    {classes?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                <input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Chapter 1, Unit Test..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Tags (comma-separated)</label>
                <input type="text" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="math, algebra, grade-10..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-primary/40" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="approvalRequired" checked={formData.approvalRequired}
                  onChange={e => setFormData({ ...formData, approvalRequired: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary" />
                <label htmlFor="approvalRequired" className="text-sm text-gray-700 dark:text-gray-300">Require approval before publishing</label>
              </div>
              <button type="submit" disabled={isCreating || isUpdating}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50">
                {isCreating || isUpdating ? <Loader2 size={16} className="animate-spin" /> : null}
                {editingBank ? 'Update Bank' : 'Create Bank'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBankManagement;
