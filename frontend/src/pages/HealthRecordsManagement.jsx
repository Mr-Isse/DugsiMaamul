import { useState } from 'react';
import {
  Heart, Plus, Edit3, Trash2, AlertTriangle, Search, X, PlusCircle, MinusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetHealthRecordsQuery,
  useCreateHealthRecordMutation,
  useUpdateHealthRecordMutation,
  useDeleteHealthRecordMutation
} from '../store/apiSlice';
import { Skeleton } from '../components/ui/skeleton';
import { useToast } from '../components/ToastContainer';

const BloodRecordsManagement = () => {
  const { showToast } = useToast();
  const { data: response, isLoading } = useGetHealthRecordsQuery();
  const records = response?.data || [];
  const [createHealthRecord, { isLoading: isCreating }] = useCreateHealthRecordMutation();
  const [updateHealthRecord, { isLoading: isUpdating }] = useUpdateHealthRecordMutation();
  const [deleteHealthRecord] = useDeleteHealthRecordMutation();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const emptyForm = {
    student: '', bloodGroup: 'Unknown', allergies: '', medications: '',
    medicalConditions: '', emergencyContacts: [{ name: '', relationship: '', phone: '', email: '' }],
    lastCheckupDate: '', notes: '', isConfidential: true
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
      bloodGroup: item.bloodGroup || 'Unknown',
      allergies: (item.allergies || []).join(', '),
      medications: (item.medications || []).join(', '),
      medicalConditions: (item.medicalConditions || []).join(', '),
      emergencyContacts: item.emergencyContacts?.length > 0
        ? item.emergencyContacts.map(c => ({ name: c.name || '', relationship: c.relationship || '', phone: c.phone || '', email: c.email || '' }))
        : [{ name: '', relationship: '', phone: '', email: '' }],
      lastCheckupDate: item.lastCheckupDate ? new Date(item.lastCheckupDate).toISOString().split('T')[0] : '',
      notes: item.notes || '',
      isConfidential: item.isConfidential ?? true,
    });
    setEditItem(item);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        student: form.student,
        bloodGroup: form.bloodGroup,
        allergies: form.allergies ? form.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        medications: form.medications ? form.medications.split(',').map(s => s.trim()).filter(Boolean) : [],
        medicalConditions: form.medicalConditions ? form.medicalConditions.split(',').map(s => s.trim()).filter(Boolean) : [],
        emergencyContacts: form.emergencyContacts.filter(c => c.name.trim()),
        lastCheckupDate: form.lastCheckupDate || undefined,
        notes: form.notes,
        isConfidential: form.isConfidential,
      };
      if (editItem) {
        await updateHealthRecord({ id: editItem._id, data: payload }).unwrap();
        showToast('Health record updated successfully', 'success');
      } else {
        await createHealthRecord(payload).unwrap();
        showToast('Health record created successfully', 'success');
      }
      resetForm();
    } catch (err) {
      showToast(err?.data?.userMessage || 'Something went wrong', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteHealthRecord(id).unwrap();
      showToast('Health record deleted', 'success');
      setShowDeleteConfirm(null);
    } catch (err) {
      showToast(err?.data?.userMessage || 'Failed to delete', 'error');
    }
  };

  const addContact = () => {
    setForm({ ...form, emergencyContacts: [...form.emergencyContacts, { name: '', relationship: '', phone: '', email: '' }] });
  };

  const removeContact = (idx) => {
    setForm({ ...form, emergencyContacts: form.emergencyContacts.filter((_, i) => i !== idx) });
  };

  const updateContact = (idx, field, value) => {
    const updated = [...form.emergencyContacts];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm({ ...form, emergencyContacts: updated });
  };

  const filtered = records.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.student?.name || '').toLowerCase().includes(q) ||
      (r.bloodGroup || '').toLowerCase().includes(q) ||
      (r.allergies || []).join(' ').toLowerCase().includes(q)
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
            <Heart className="text-rose-600" size={28} />
            Health Records
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage student health records and emergency contacts
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
          placeholder="Search by student name, blood group, or allergies..."
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
                {editItem ? 'Edit Health Record' : 'New Health Record'}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="Unknown">Unknown</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Checkup Date</label>
                  <input
                    type="date"
                    value={form.lastCheckupDate}
                    onChange={(e) => setForm({ ...form, lastCheckupDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isConfidential}
                      onChange={(e) => setForm({ ...form, isConfidential: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Confidential</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allergies</label>
                  <input
                    type="text"
                    value={form.allergies}
                    onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                    placeholder="Comma-separated (e.g. Peanuts, Penicillin)"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medications</label>
                  <input
                    type="text"
                    value={form.medications}
                    onChange={(e) => setForm({ ...form, medications: e.target.value })}
                    placeholder="Comma-separated"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medical Conditions</label>
                  <input
                    type="text"
                    value={form.medicalConditions}
                    onChange={(e) => setForm({ ...form, medicalConditions: e.target.value })}
                    placeholder="Comma-separated"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              {/* Emergency Contacts */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contacts</label>
                  <button type="button" onClick={addContact}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    <PlusCircle size={14} /> Add Contact
                  </button>
                </div>
                <div className="space-y-3">
                  {form.emergencyContacts.map((contact, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => updateContact(idx, 'name', e.target.value)}
                        placeholder="Contact name"
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                      <input
                        type="text"
                        value={contact.relationship}
                        onChange={(e) => updateContact(idx, 'relationship', e.target.value)}
                        placeholder="Relationship"
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                      <input
                        type="text"
                        value={contact.phone}
                        onChange={(e) => updateContact(idx, 'phone', e.target.value)}
                        placeholder="Phone"
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          value={contact.email}
                          onChange={(e) => updateContact(idx, 'email', e.target.value)}
                          placeholder="Email"
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        {form.emergencyContacts.length > 1 && (
                          <button type="button" onClick={() => removeContact(idx)}
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
          <Heart className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">No Health Records</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first health record to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <motion.div
              key={r._id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {r.student?.name || 'Unknown Student'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                      {r.bloodGroup || 'Unknown'}
                    </span>
                    {r.isConfidential && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        Confidential
                      </span>
                    )}
                  </div>
                  {r.allergies?.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Allergies:</span> {r.allergies.join(', ')}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 dark:text-gray-500">
                    {r.lastCheckupDate && <span>Last checkup: {formatDate(r.lastCheckupDate)}</span>}
                    {r.emergencyContacts?.length > 0 && (
                      <span>{r.emergencyContacts.length} emergency contact{r.emergencyContacts.length > 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-2 shrink-0">
                  <button onClick={() => openEdit(r)}
                    className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => setShowDeleteConfirm(r._id)}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {showDeleteConfirm === r._id && (
                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                    <AlertTriangle size={16} />
                    Delete this health record?
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(null)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button onClick={() => handleDelete(r._id)}
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

export default BloodRecordsManagement;
