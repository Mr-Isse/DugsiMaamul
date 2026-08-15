import { useState } from 'react';
import {
  Package, Plus, Edit3, Trash2, AlertTriangle, Search, X, DollarSign, Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetProcurementsQuery,
  useCreateProcurementMutation,
  useUpdateProcurementMutation,
  useDeleteProcurementMutation,
} from '../store/apiSlice';
import { Skeleton } from '../components/ui/skeleton';
import { useToast } from '../components/ToastContainer';

const statusColors = {
  'Draft': 'bg-gray-100 text-gray-600',
  'Pending Approval': 'bg-yellow-100 text-yellow-700',
  'Approved': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700',
  'Processing': 'bg-blue-100 text-blue-700',
  'Delivered': 'bg-emerald-100 text-emerald-700',
  'Cancelled': 'bg-gray-200 text-gray-500',
};

const emptyItem = { name: '', description: '', quantity: 1, unitPrice: 0, totalPrice: 0 };

const ProcurementManagement = () => {
  const { showToast } = useToast();
  const { data: response, isLoading } = useGetProcurementsQuery();
  const procurements = response?.data || [];
  const [createProcurement, { isLoading: isCreating }] = useCreateProcurementMutation();
  const [updateProcurement, { isLoading: isUpdating }] = useUpdateProcurementMutation();
  const [deleteProcurement] = useDeleteProcurementMutation();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const defaultForm = {
    type: 'Purchase Request',
    vendor: '',
    items: [{ ...emptyItem }],
    totalAmount: 0,
    status: 'Draft',
    requestDate: new Date().toISOString().slice(0, 10),
    expectedDeliveryDate: '',
    notes: '',
  };

  const [form, setForm] = useState(defaultForm);

  const calcItemTotal = (item) => {
    return (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
  };

  const calcTotal = (items) => {
    return items.reduce((sum, item) => sum + calcItemTotal(item), 0);
  };

  const updateItem = (index, field, value) => {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      items[index].totalPrice = calcItemTotal(items[index]);
    }
    setForm({ ...form, items, totalAmount: calcTotal(items) });
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { ...emptyItem }] });
  };

  const removeItem = (index) => {
    const items = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items, totalAmount: calcTotal(items) });
  };

  const resetForm = () => {
    setForm({ ...defaultForm, items: [{ ...emptyItem }] });
    setEditItem(null);
    setShowForm(false);
  };

  const openEdit = (item) => {
    const items = item.items?.map(i => ({
      name: i.name || '',
      description: i.description || '',
      quantity: i.quantity || 1,
      unitPrice: i.unitPrice || 0,
      totalPrice: i.totalPrice || 0,
    })) || [{ ...emptyItem }];
    setForm({
      type: item.type || 'Purchase Request',
      vendor: item.vendor || '',
      items,
      totalAmount: item.totalAmount || calcTotal(items),
      status: item.status || 'Draft',
      requestDate: item.requestDate ? new Date(item.requestDate).toISOString().slice(0, 10) : '',
      expectedDeliveryDate: item.expectedDeliveryDate ? new Date(item.expectedDeliveryDate).toISOString().slice(0, 10) : '',
      notes: item.notes || '',
    });
    setEditItem(item);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, totalAmount: calcTotal(form.items) };
      if (editItem) {
        await updateProcurement({ id: editItem._id, ...payload }).unwrap();
        showToast('Procurement updated successfully', 'success');
      } else {
        await createProcurement(payload).unwrap();
        showToast('Procurement created successfully', 'success');
      }
      resetForm();
    } catch (err) {
      showToast(err?.data?.userMessage || 'Something went wrong', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProcurement(id).unwrap();
      showToast('Procurement deleted', 'success');
      setShowDeleteConfirm(null);
    } catch (err) {
      showToast(err?.data?.userMessage || 'Failed to delete', 'error');
    }
  };

  const filtered = procurements.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.type?.toLowerCase().includes(q) ||
      p.vendor?.toLowerCase().includes(q) ||
      p.status?.toLowerCase().includes(q)
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
            <Package className="text-orange-600" size={28} />
            Procurement Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage purchase requests and orders
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-sm"
        >
          <Plus size={18} /> New Procurement
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search procurements..."
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
                {editItem ? 'Edit Procurement' : 'New Procurement'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                  <select
                    required
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="Purchase Request">Purchase Request</option>
                    <option value="Purchase Order">Purchase Order</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vendor</label>
                  <input
                    type="text"
                    value={form.vendor}
                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                    placeholder="Vendor name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Pending Approval">Pending Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Processing">Processing</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Request Date *</label>
                  <input
                    type="date"
                    required
                    value={form.requestDate}
                    onChange={(e) => setForm({ ...form, requestDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expected Delivery</label>
                  <input
                    type="date"
                    value={form.expectedDeliveryDate}
                    onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Items *</label>
                  <button type="button" onClick={addItem}
                    className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition"
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>
                <div className="space-y-3">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => updateItem(idx, 'name', e.target.value)}
                          placeholder="Item name"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        <input
                          type="number"
                          required
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                          placeholder="Qty"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                          placeholder="Unit price"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        <div className="flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                          <DollarSign size={14} className="text-gray-400 mr-1" />
                          {(Number(item.quantity) * Number(item.unitPrice) || 0).toFixed(2)}
                        </div>
                      </div>
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(idx)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition mt-0.5"
                        >
                          <Minus size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-3">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Total: ${calcTotal(form.items).toFixed(2)}
                  </div>
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

      {/* Procurements List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Package className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">No Procurements</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">No procurement records found. Create one to get started.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vendor</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Request Date</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <motion.tr
                    key={p._id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">{p.type}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{p.vendor || '-'}</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                        <DollarSign size={14} />
                        {Number(p.totalAmount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[p.status] || 'bg-gray-100 text-gray-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{formatDate(p.requestDate)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
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
                Delete this procurement?
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

export default ProcurementManagement;