import { useState } from 'react';
import {
  Wallet, Plus, Edit3, Trash2, AlertTriangle, Search, X, DollarSign, Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetEnterpriseFinanceQuery,
  useCreateEnterpriseFinanceMutation,
  useUpdateEnterpriseFinanceMutation,
  useDeleteEnterpriseFinanceMutation,
} from '../store/apiSlice';
import { Skeleton } from '../components/ui/skeleton';
import { useToast } from '../components/ToastContainer';

const statusColors = {
  'Draft': 'bg-gray-100 text-gray-600',
  'Approved': 'bg-green-100 text-green-700',
  'Active': 'bg-blue-100 text-blue-700',
  'Closed': 'bg-gray-200 text-gray-500',
};

const emptyBudgetItem = { category: '', allocatedAmount: 0, spentAmount: 0, description: '' };

const EnterpriseFinanceManagement = () => {
  const { showToast } = useToast();
  const { data: response, isLoading } = useGetEnterpriseFinanceQuery();
  const financeRecords = response?.data || [];
  const [createFinance, { isLoading: isCreating }] = useCreateEnterpriseFinanceMutation();
  const [updateFinance, { isLoading: isUpdating }] = useUpdateEnterpriseFinanceMutation();
  const [deleteFinance] = useDeleteEnterpriseFinanceMutation();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const defaultForm = {
    fiscalYear: '',
    budgetItems: [{ ...emptyBudgetItem }],
    status: 'Draft',
    notes: '',
  };

  const [form, setForm] = useState(defaultForm);

  const calcTotalAllocated = (items) => items.reduce((sum, i) => sum + (Number(i.allocatedAmount) || 0), 0);
  const calcTotalSpent = (items) => items.reduce((sum, i) => sum + (Number(i.spentAmount) || 0), 0);

  const updateBudgetItem = (index, field, value) => {
    const budgetItems = [...form.budgetItems];
    budgetItems[index] = { ...budgetItems[index], [field]: value };
    setForm({ ...form, budgetItems });
  };

  const addBudgetItem = () => {
    setForm({ ...form, budgetItems: [...form.budgetItems, { ...emptyBudgetItem }] });
  };

  const removeBudgetItem = (index) => {
    setForm({ ...form, budgetItems: form.budgetItems.filter((_, i) => i !== index) });
  };

  const resetForm = () => {
    setForm({ ...defaultForm, budgetItems: [{ ...emptyBudgetItem }] });
    setEditItem(null);
    setShowForm(false);
  };

  const openEdit = (item) => {
    const budgetItems = item.budgetItems?.map(i => ({
      category: i.category || '',
      allocatedAmount: i.allocatedAmount || 0,
      spentAmount: i.spentAmount || 0,
      description: i.description || '',
    })) || [{ ...emptyBudgetItem }];
    setForm({
      fiscalYear: item.fiscalYear || '',
      budgetItems,
      status: item.status || 'Draft',
      notes: item.notes || '',
    });
    setEditItem(item);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await updateFinance({ id: editItem._id, ...form }).unwrap();
        showToast('Finance record updated successfully', 'success');
      } else {
        await createFinance(form).unwrap();
        showToast('Finance record created successfully', 'success');
      }
      resetForm();
    } catch (err) {
      showToast(err?.data?.userMessage || 'Something went wrong', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFinance(id).unwrap();
      showToast('Finance record deleted', 'success');
      setShowDeleteConfirm(null);
    } catch (err) {
      showToast(err?.data?.userMessage || 'Failed to delete', 'error');
    }
  };

  const filtered = financeRecords.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.fiscalYear?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q)
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
            <Wallet className="text-emerald-600" size={28} />
            Enterprise Finance
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage budgets and fiscal planning
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
          placeholder="Search by fiscal year or status..."
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
                {editItem ? 'Edit Finance Record' : 'New Finance Record'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fiscal Year *</label>
                  <input
                    type="text"
                    required
                    value={form.fiscalYear}
                    onChange={(e) => setForm({ ...form, fiscalYear: e.target.value })}
                    placeholder="e.g. 2025-2026"
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
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* Budget Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Budget Items *</label>
                  <button type="button" onClick={addBudgetItem}
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition"
                  >
                    <Plus size={14} /> Add Budget Item
                  </button>
                </div>
                <div className="space-y-3">
                  {form.budgetItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <input
                          type="text"
                          required
                          value={item.category}
                          onChange={(e) => updateBudgetItem(idx, 'category', e.target.value)}
                          placeholder="Category"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={item.allocatedAmount || ''}
                          onChange={(e) => updateBudgetItem(idx, 'allocatedAmount', e.target.value)}
                          placeholder="Allocated"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.spentAmount || ''}
                          onChange={(e) => updateBudgetItem(idx, 'spentAmount', e.target.value)}
                          placeholder="Spent"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateBudgetItem(idx, 'description', e.target.value)}
                          placeholder="Description"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                      </div>
                      {form.budgetItems.length > 1 && (
                        <button type="button" onClick={() => removeBudgetItem(idx)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition mt-0.5"
                        >
                          <Minus size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-6 mt-3 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Total Allocated: <span className="font-semibold text-emerald-600 dark:text-emerald-400">${calcTotalAllocated(form.budgetItems).toFixed(2)}</span>
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    Total Spent: <span className="font-semibold text-orange-600 dark:text-orange-400">${calcTotalSpent(form.budgetItems).toFixed(2)}</span>
                  </span>
                </div>
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

      {/* Finance Records List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Wallet className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">No Finance Records</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">No enterprise finance records found. Create one to get started.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fiscal Year</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"># Budget Items</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Allocated</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Spent</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const totalAllocated = calcTotalAllocated(r.budgetItems || []);
                  const totalSpent = calcTotalSpent(r.budgetItems || []);
                  return (
                    <motion.tr
                      key={r._id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">{r.fiscalYear}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{r.budgetItems?.length || 0}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          <DollarSign size={14} />
                          {totalAllocated.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                          <DollarSign size={14} />
                          {totalSpent.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[r.status] || 'bg-gray-100 text-gray-600'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
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
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="px-4 py-3 bg-red-50 dark:bg-red-900/10 border-t border-red-100 dark:border-red-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                <AlertTriangle size={16} />
                Delete this finance record?
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

export default EnterpriseFinanceManagement;