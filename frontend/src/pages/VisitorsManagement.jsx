import { useState } from 'react';
import {
  Users, Plus, Edit3, Trash2, AlertTriangle, Search, X, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetVisitorsQuery,
  useCreateVisitorMutation,
  useUpdateVisitorMutation,
  useDeleteVisitorMutation,
} from '../store/apiSlice';
import { Skeleton } from '../components/ui/skeleton';
import { useToast } from '../components/ToastContainer';

const statusColors = {
  'Checked In': 'bg-green-100 text-green-700',
  'Checked Out': 'bg-gray-100 text-gray-600',
};

const VisitorsManagement = () => {
  const { showToast } = useToast();
  const { data: response, isLoading } = useGetVisitorsQuery();
  const visitors = response?.data || [];
  const [createVisitor, { isLoading: isCreating }] = useCreateVisitorMutation();
  const [updateVisitor, { isLoading: isUpdating }] = useUpdateVisitorMutation();
  const [deleteVisitor] = useDeleteVisitorMutation();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const defaultForm = {
    visitorName: '',
    visitorPhone: '',
    visitorEmail: '',
    visitorAddress: '',
    purpose: '',
    personToVisit: '',
    checkInTime: new Date().toISOString().slice(0, 16),
    status: 'Checked In',
    notes: '',
  };

  const [form, setForm] = useState(defaultForm);

  const resetForm = () => {
    setForm({ ...defaultForm, checkInTime: new Date().toISOString().slice(0, 16) });
    setEditItem(null);
    setShowForm(false);
  };

  const openEdit = (item) => {
    setForm({
      visitorName: item.visitorName || '',
      visitorPhone: item.visitorPhone || '',
      visitorEmail: item.visitorEmail || '',
      visitorAddress: item.visitorAddress || '',
      purpose: item.purpose || '',
      personToVisit: item.personToVisit || '',
      checkInTime: item.checkInTime ? new Date(item.checkInTime).toISOString().slice(0, 16) : '',
      status: item.status || 'Checked In',
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
        await updateVisitor({ id: editItem._id, ...payload }).unwrap();
        showToast('Visitor updated successfully', 'success');
      } else {
        await createVisitor(payload).unwrap();
        showToast('Visitor created successfully', 'success');
      }
      resetForm();
    } catch (err) {
      showToast(err?.data?.userMessage || 'Something went wrong', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteVisitor(id).unwrap();
      showToast('Visitor deleted', 'success');
      setShowDeleteConfirm(null);
    } catch (err) {
      showToast(err?.data?.userMessage || 'Failed to delete', 'error');
    }
  };

  const filtered = visitors.filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.visitorName?.toLowerCase().includes(q) ||
      v.purpose?.toLowerCase().includes(q) ||
      v.personToVisit?.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
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
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
            <Users className="text-blue-600" size={28} />
            Visitor Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track and manage school visitors
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-sm"
        >
          <Plus size={18} /> New Visitor
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search visitors..."
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
                {editItem ? 'Edit Visitor' : 'New Visitor'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visitor Name *</label>
                  <input
                    type="text"
                    required
                    value={form.visitorName}
                    onChange={(e) => setForm({ ...form, visitorName: e.target.value })}
                    placeholder="Full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose *</label>
                  <input
                    type="text"
                    required
                    value={form.purpose}
                    onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    placeholder="Reason for visit"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={form.visitorPhone}
                    onChange={(e) => setForm({ ...form, visitorPhone: e.target.value })}
                    placeholder="Phone number"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.visitorEmail}
                    onChange={(e) => setForm({ ...form, visitorEmail: e.target.value })}
                    placeholder="Email address"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                <input
                  type="text"
                  value={form.visitorAddress}
                  onChange={(e) => setForm({ ...form, visitorAddress: e.target.value })}
                  placeholder="Home address"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Person to Visit</label>
                  <input
                    type="text"
                    value={form.personToVisit}
                    onChange={(e) => setForm({ ...form, personToVisit: e.target.value })}
                    placeholder="Staff or department"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="Checked In">Checked In</option>
                    <option value="Checked Out">Checked Out</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Check In Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={form.checkInTime}
                  onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
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

      {/* Visitors Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Users className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">No Visitors</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">No visitor records found. Create one to get started.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Visitor Name</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purpose</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Person to Visit</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check In</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v) => (
                  <motion.tr
                    key={v._id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{v.visitorName}</p>
                        {v.visitorPhone && (
                          <p className="text-xs text-gray-400 dark:text-gray-500">{v.visitorPhone}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{v.purpose}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{v.personToVisit || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-gray-400" />
                        {formatDate(v.checkInTime)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[v.status] || 'bg-gray-100 text-gray-600'}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(v)}
                          className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => setShowDeleteConfirm(v._id)}
                          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="px-4 py-3 bg-red-50 dark:bg-red-900/10 border-t border-red-100 dark:border-red-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                <AlertTriangle size={16} />
                Delete this visitor record?
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowDeleteConfirm(null)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VisitorsManagement;