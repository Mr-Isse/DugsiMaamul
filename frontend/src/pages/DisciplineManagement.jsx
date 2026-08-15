import { useState } from 'react';
import {
  Shield, Plus, Edit3, Trash2, AlertTriangle, Search, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetDisciplinesQuery,
  useCreateDisciplineMutation,
  useUpdateDisciplineMutation,
  useDeleteDisciplineMutation
} from '../store/apiSlice';
import { Skeleton } from '../components/ui/skeleton';
import { useToast } from '../components/ToastContainer';

const severityColors = {
  Low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const statusColors = {
  Pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Closed: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
};

const DisciplineManagement = () => {
  const { showToast } = useToast();
  const { data: response, isLoading } = useGetDisciplinesQuery();
  const disciplines = response?.data || [];
  const [createDiscipline, { isLoading: isCreating }] = useCreateDisciplineMutation();
  const [updateDiscipline, { isLoading: isUpdating }] = useUpdateDisciplineMutation();
  const [deleteDiscipline] = useDeleteDisciplineMutation();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const emptyForm = {
    student: '', type: 'Warning', date: new Date().toISOString().split('T')[0],
    description: '', actionTaken: '', severity: 'Medium', status: 'Pending', notes: ''
  };
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => {
    setForm(emptyForm);
    setEditItem(null);
    setShowForm(false);
  };

  const openEdit = (item) => {
    setForm({
      student: item.student?.name || item.student?.customId || item.student || '',
      type: item.type || 'Warning',
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      description: item.description || '',
      actionTaken: item.actionTaken || '',
      severity: item.severity || 'Medium',
      status: item.status || 'Pending',
      notes: item.notes || '',
    });
    setEditItem(item);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (editItem) {
        await updateDiscipline({ id: editItem._id, data: payload }).unwrap();
        showToast('Discipline record updated successfully', 'success');
      } else {
        await createDiscipline(payload).unwrap();
        showToast('Discipline record created successfully', 'success');
      }
      resetForm();
    } catch (err) {
      showToast(err?.data?.userMessage || 'Something went wrong', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDiscipline(id).unwrap();
      showToast('Discipline record deleted', 'success');
      setShowDeleteConfirm(null);
    } catch (err) {
      showToast(err?.data?.userMessage || 'Failed to delete', 'error');
    }
  };

  const filtered = disciplines.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (d.student?.name || '').toLowerCase().includes(q) ||
      (d.type || '').toLowerCase().includes(q) ||
      (d.description || '').toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr) => {
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
            <Shield className="text-indigo-600" size={28} />
            Discipline Records
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track and manage student discipline records
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-sm"
        >
          <Plus size={18} /> New Record
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by student, type, or description..."
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
                {editItem ? 'Edit Discipline Record' : 'New Discipline Record'}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="Warning">Warning</option>
                    <option value="Minor Offense">Minor Offense</option>
                    <option value="Major Offense">Major Offense</option>
                    <option value="Suspension">Suspension</option>
                    <option value="Expulsion">Expulsion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Action Taken</label>
                  <input
                    type="text"
                    value={form.actionTaken}
                    onChange={(e) => setForm({ ...form, actionTaken: e.target.value })}
                    placeholder="e.g. Detention, Warning letter"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the incident..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional notes"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
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
          <Shield className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">No Discipline Records</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first discipline record to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((d) => (
            <motion.div
              key={d._id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {d.student?.name || 'Unknown Student'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                      {d.type}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${severityColors[d.severity] || severityColors.Medium}`}>
                      {d.severity}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[d.status] || statusColors.Pending}`}>
                      {d.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap line-clamp-2">{d.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 dark:text-gray-500">
                    <span>{formatDate(d.date)}</span>
                    {d.actionTaken && <span className="text-indigo-500">Action: {d.actionTaken}</span>}
                  </div>
                </div>
                <div className="flex items-start gap-2 shrink-0">
                  <button onClick={() => openEdit(d)}
                    className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => setShowDeleteConfirm(d._id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {showDeleteConfirm === d._id && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                    <AlertTriangle size={16} />
                    Delete this discipline record?
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(null)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button onClick={() => handleDelete(d._id)}
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

export default DisciplineManagement;
