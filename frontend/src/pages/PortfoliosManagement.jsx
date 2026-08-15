import { useState } from 'react';
import {
  FolderOpen, Plus, Edit3, Trash2, AlertTriangle, Search, X, PlusCircle, MinusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetPortfoliosQuery,
  useCreatePortfolioMutation,
  useUpdatePortfolioMutation,
  useDeletePortfolioMutation
} from '../store/apiSlice';
import { Skeleton } from '../components/ui/skeleton';
import { useToast } from '../components/ToastContainer';

const itemTypes = ['Certificate', 'Award', 'Project', 'Activity', 'Achievement', 'Other'];

const PortfoliosManagement = () => {
  const { showToast } = useToast();
  const { data: response, isLoading } = useGetPortfoliosQuery();
  const portfolios = response?.data || [];
  const [createPortfolio, { isLoading: isCreating }] = useCreatePortfolioMutation();
  const [updatePortfolio, { isLoading: isUpdating }] = useUpdatePortfolioMutation();
  const [deletePortfolio] = useDeletePortfolioMutation();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const emptyItem = { title: '', type: 'Certificate', description: '', date: '', remarks: '' };
  const emptyForm = { student: '', items: [{ ...emptyItem }], isPublic: false };
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => {
    setForm(emptyForm);
    setEditItem(null);
    setShowForm(false);
  };

  const openEdit = (item) => {
    setForm({
      student: item.student?.name || item.student?.customId || item.student || '',
      items: item.items?.length > 0
        ? item.items.map(i => ({
            title: i.title || '',
            type: i.type || 'Certificate',
            description: i.description || '',
            date: i.date ? new Date(i.date).toISOString().split('T')[0] : '',
            remarks: i.remarks || '',
          }))
        : [{ ...emptyItem }],
      isPublic: item.isPublic ?? false,
    });
    setEditItem(item);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        student: form.student,
        items: form.items.filter(i => i.title.trim()),
        isPublic: form.isPublic,
      };
      if (editItem) {
        await updatePortfolio({ id: editItem._id, data: payload }).unwrap();
        showToast('Portfolio updated successfully', 'success');
      } else {
        await createPortfolio(payload).unwrap();
        showToast('Portfolio created successfully', 'success');
      }
      resetForm();
    } catch (err) {
      showToast(err?.data?.userMessage || 'Something went wrong', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePortfolio(id).unwrap();
      showToast('Portfolio deleted', 'success');
      setShowDeleteConfirm(null);
    } catch (err) {
      showToast(err?.data?.userMessage || 'Failed to delete', 'error');
    }
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { ...emptyItem }] });
  };

  const removeItem = (idx) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const updateItem = (idx, field, value) => {
    const updated = [...form.items];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, items: updated });
  };

  const filtered = portfolios.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.student?.name || '').toLowerCase().includes(q) ||
      (p.items || []).map(i => i.title).join(' ').toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
            <FolderOpen className="text-purple-600" size={28} />
            Student Portfolios
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage student portfolios with achievements and projects
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-sm"
        >
          <Plus size={18} /> New Portfolio
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by student name or item title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
        />
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {editItem ? 'Edit Portfolio' : 'New Portfolio'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student Name / ID *</label>
                  <input
                    type="text"
                    required
                    value={form.student}
                    onChange={(e) => setForm({ ...form, student: e.target.value })}
                    placeholder="Enter student name or ID"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isPublic}
                      onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Public Portfolio</span>
                  </label>
                </div>
              </div>

              {/* Portfolio Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio Items</label>
                  <button type="button" onClick={addItem}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    <PlusCircle size={14} /> Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateItem(idx, 'title', e.target.value)}
                          placeholder="Title *"
                          required
                          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        <select
                          value={item.type}
                          onChange={(e) => updateItem(idx, 'type', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                          {itemTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input
                          type="date"
                          value={item.date}
                          onChange={(e) => updateItem(idx, 'date', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(idx, 'description', e.target.value)}
                          placeholder="Description"
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        <input
                          type="text"
                          value={item.remarks}
                          onChange={(e) => updateItem(idx, 'remarks', e.target.value)}
                          placeholder="Remarks"
                          className="w-40 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        {form.items.length > 1 && (
                          <button type="button" onClick={() => removeItem(idx)}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <MinusCircle size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button type="submit" disabled={isCreating || isUpdating}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition"
                >
                  {isCreating || isUpdating ? 'Saving...' : editItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <FolderOpen className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">No Portfolios</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first student portfolio to start building.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => (
            <motion.div
              key={p._id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {p.student?.name || 'Unknown Student'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                      {p.items?.length || 0} item{(p.items?.length || 0) !== 1 ? 's' : ''}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.isPublic ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                      {p.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  {p.items?.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Types:</span> {[...new Set(p.items.map(i => i.type))].join(', ')}
                    </p>
                  )}
                </div>
                <div className="flex items-start gap-2 shrink-0">
                  <button onClick={() => openEdit(p)}
                    className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => setShowDeleteConfirm(p._id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {showDeleteConfirm === p._id && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                    <AlertTriangle size={16} />
                    Delete this portfolio?
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(null)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button onClick={() => handleDelete(p._id)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfoliosManagement;
