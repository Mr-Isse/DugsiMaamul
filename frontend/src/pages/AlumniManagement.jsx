import { useState } from 'react';
import {
  GraduationCap, Plus, Edit3, Trash2, AlertTriangle, Search, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetAlumniQuery,
  useCreateAlumniMutation,
  useUpdateAlumniMutation,
  useDeleteAlumniMutation
} from '../store/apiSlice';
import { Skeleton } from '../components/ui/skeleton';
import { useToast } from '../components/ToastContainer';

const AlumniManagement = () => {
  const { showToast } = useToast();
  const { data: response, isLoading } = useGetAlumniQuery();
  const alumniList = response?.data || [];
  const [createAlumni, { isLoading: isCreating }] = useCreateAlumniMutation();
  const [updateAlumni, { isLoading: isUpdating }] = useUpdateAlumniMutation();
  const [deleteAlumni] = useDeleteAlumniMutation();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const emptyForm = {
    firstName: '', lastName: '', email: '', phone: '', gender: '',
    graduationYear: '', university: '', course: '', currentJob: '',
    currentCompany: '', currentLocation: '', achievements: '', notes: ''
  };
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => {
    setForm(emptyForm);
    setEditItem(null);
    setShowForm(false);
  };

  const openEdit = (item) => {
    setForm({
      firstName: item.firstName || '',
      lastName: item.lastName || '',
      email: item.email || '',
      phone: item.phone || '',
      gender: item.gender || '',
      graduationYear: item.graduationYear || '',
      university: item.university || '',
      course: item.course || '',
      currentJob: item.currentJob || '',
      currentCompany: item.currentCompany || '',
      currentLocation: item.currentLocation || '',
      achievements: (item.achievements || []).join(', '),
      notes: item.notes || '',
    });
    setEditItem(item);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
        achievements: form.achievements ? form.achievements.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      if (editItem) {
        await updateAlumni({ id: editItem._id, data: payload }).unwrap();
        showToast('Alumni record updated successfully', 'success');
      } else {
        await createAlumni(payload).unwrap();
        showToast('Alumni record created successfully', 'success');
      }
      resetForm();
    } catch (err) {
      showToast(err?.data?.userMessage || 'Something went wrong', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAlumni(id).unwrap();
      showToast('Alumni record deleted', 'success');
      setShowDeleteConfirm(null);
    } catch (err) {
      showToast(err?.data?.userMessage || 'Failed to delete', 'error');
    }
  };

  const filtered = alumniList.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      `${a.firstName || ''} ${a.lastName || ''}`.toLowerCase().includes(q) ||
      (a.university || '').toLowerCase().includes(q) ||
      (a.currentJob || '').toLowerCase().includes(q) ||
      (a.email || '').toLowerCase().includes(q)
    );
  });

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
            <GraduationCap className="text-emerald-600" size={28} />
            Alumni Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track and manage alumni records and achievements
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-sm"
        >
          <Plus size={18} /> New Alumni
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, university, job, or email..."
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
                {editItem ? 'Edit Alumni Record' : 'New Alumni Record'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="First name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Last name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Graduation Year *</label>
                  <input
                    type="number"
                    required
                    value={form.graduationYear}
                    onChange={(e) => setForm({ ...form, graduationYear: e.target.value })}
                    placeholder="e.g. 2023"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Email address"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Phone number"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">University</label>
                  <input
                    type="text"
                    value={form.university}
                    onChange={(e) => setForm({ ...form, university: e.target.value })}
                    placeholder="University name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Course</label>
                  <input
                    type="text"
                    value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                    placeholder="Course / degree"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Job</label>
                  <input
                    type="text"
                    value={form.currentJob}
                    onChange={(e) => setForm({ ...form, currentJob: e.target.value })}
                    placeholder="Job title"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Company</label>
                  <input
                    type="text"
                    value={form.currentCompany}
                    onChange={(e) => setForm({ ...form, currentCompany: e.target.value })}
                    placeholder="Company name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Location</label>
                  <input
                    type="text"
                    value={form.currentLocation}
                    onChange={(e) => setForm({ ...form, currentLocation: e.target.value })}
                    placeholder="City / country"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Achievements</label>
                <input
                  type="text"
                  value={form.achievements}
                  onChange={(e) => setForm({ ...form, achievements: e.target.value })}
                  placeholder="Comma-separated (e.g. Dean's List, Best Student Award)"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional notes"
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

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <GraduationCap className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">No Alumni</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add your first alumni record to start tracking graduates.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => (
            <motion.div
              key={a._id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {a.firstName} {a.lastName}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Class of {a.graduationYear}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                    {a.university && <span>{a.university}</span>}
                    {a.currentJob && (
                      <span>
                        {a.currentJob}{a.currentCompany ? ` at ${a.currentCompany}` : ''}
                      </span>
                    )}
                    {a.email && <span>{a.email}</span>}
                  </div>
                </div>
                <div className="flex items-start gap-2 shrink-0">
                  <button onClick={() => openEdit(a)}
                    className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => setShowDeleteConfirm(a._id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {showDeleteConfirm === a._id && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                    <AlertTriangle size={16} />
                    Delete this alumni record?
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(null)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button onClick={() => handleDelete(a._id)}
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

export default AlumniManagement;
