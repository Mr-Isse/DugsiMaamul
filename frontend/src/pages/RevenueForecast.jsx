import { useState } from 'react';
import {
  TrendingUp, Plus, Edit3, Trash2, AlertTriangle, Search, X, DollarSign, Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetRevenueForecastsQuery,
  useCreateRevenueForecastMutation,
  useUpdateRevenueForecastMutation,
  useDeleteRevenueForecastMutation,
} from '../store/apiSlice';
import { Skeleton } from '../components/ui/skeleton';
import { useToast } from '../components/ToastContainer';

const statusColors = {
  'Draft': 'bg-gray-100 text-gray-600',
  'Final': 'bg-green-100 text-green-700',
};

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const emptyDataEntry = { month: 1, year: new Date().getFullYear(), forecastedAmount: 0, actualAmount: 0 };

const RevenueForecast = () => {
  const { showToast } = useToast();
  const { data: response, isLoading } = useGetRevenueForecastsQuery();
  const forecasts = response?.data || [];
  const [createForecast, { isLoading: isCreating }] = useCreateRevenueForecastMutation();
  const [updateForecast, { isLoading: isUpdating }] = useUpdateRevenueForecastMutation();
  const [deleteForecast] = useDeleteRevenueForecastMutation();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const defaultForm = {
    type: 'Monthly',
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    data: [{ ...emptyDataEntry }],
    totalForecasted: 0,
    status: 'Draft',
    notes: '',
  };

  const [form, setForm] = useState(defaultForm);

  const calcTotalForecasted = (data) => data.reduce((sum, d) => sum + (Number(d.forecastedAmount) || 0), 0);
  const calcTotalActual = (data) => data.reduce((sum, d) => sum + (Number(d.actualAmount) || 0), 0);

  const prefillMonths = (year) => {
    return Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      year: Number(year) || new Date().getFullYear(),
      forecastedAmount: 0,
      actualAmount: 0,
    }));
  };

  const handleTypeChange = (type) => {
    if (type === 'Monthly') {
      const data = prefillMonths(form.year);
      setForm({ ...form, type, data, totalForecasted: calcTotalForecasted(data) });
    } else {
      setForm({ ...form, type, data: [{ ...emptyDataEntry, year: form.year }] });
    }
  };

  const handleYearChange = (year) => {
    if (form.type === 'Monthly') {
      const data = form.data.map(d => ({ ...d, year: Number(year) }));
      setForm({ ...form, year: Number(year), data });
    } else {
      const data = form.data.map(d => ({ ...d, year: Number(year) }));
      setForm({ ...form, year: Number(year), data });
    }
  };

  const updateDataEntry = (index, field, value) => {
    const data = [...form.data];
    data[index] = { ...data[index], [field]: value };
    setForm({ ...form, data, totalForecasted: calcTotalForecasted(data) });
  };

  const addDataEntry = () => {
    const nextMonth = form.data.length > 0 ? Math.max(...form.data.map(d => Number(d.month) || 0)) + 1 : 1;
    setForm({
      ...form,
      data: [...form.data, { month: nextMonth > 12 ? 1 : nextMonth, year: form.year, forecastedAmount: 0, actualAmount: 0 }],
    });
  };

  const removeDataEntry = (index) => {
    const data = form.data.filter((_, i) => i !== index);
    setForm({ ...form, data, totalForecasted: calcTotalForecasted(data) });
  };

  const resetForm = () => {
    setForm({ ...defaultForm, data: [{ ...emptyDataEntry }] });
    setEditItem(null);
    setShowForm(false);
  };

  const openEdit = (item) => {
    const data = item.data?.map(d => ({
      month: d.month || 1,
      year: d.year || item.year,
      forecastedAmount: d.forecastedAmount || 0,
      actualAmount: d.actualAmount || 0,
    })) || [{ ...emptyDataEntry }];
    setForm({
      type: item.type || 'Monthly',
      year: item.year || new Date().getFullYear(),
      startDate: item.startDate ? new Date(item.startDate).toISOString().slice(0, 10) : '',
      endDate: item.endDate ? new Date(item.endDate).toISOString().slice(0, 10) : '',
      data,
      totalForecasted: item.totalForecasted || calcTotalForecasted(data),
      status: item.status || 'Draft',
      notes: item.notes || '',
    });
    setEditItem(item);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, totalForecasted: calcTotalForecasted(form.data) };
      if (editItem) {
        await updateForecast({ id: editItem._id, ...payload }).unwrap();
        showToast('Revenue forecast updated successfully', 'success');
      } else {
        await createForecast(payload).unwrap();
        showToast('Revenue forecast created successfully', 'success');
      }
      resetForm();
    } catch (err) {
      showToast(err?.data?.userMessage || 'Something went wrong', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteForecast(id).unwrap();
      showToast('Revenue forecast deleted', 'success');
      setShowDeleteConfirm(null);
    } catch (err) {
      showToast(err?.data?.userMessage || 'Failed to delete', 'error');
    }
  };

  const filtered = forecasts.filter((f) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.type?.toLowerCase().includes(q) ||
      String(f.year).includes(q) ||
      f.status?.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPeriodLabel = (f) => {
    if (!f.startDate || !f.endDate) return '-';
    return `${formatDate(f.startDate)} - ${formatDate(f.endDate)}`;
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
            <TrendingUp className="text-cyan-600" size={28} />
            Revenue Forecast
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Predict and analyze revenue trends
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-sm"
        >
          <Plus size={18} /> New Forecast
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search forecasts..."
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
                {editItem ? 'Edit Revenue Forecast' : 'New Revenue Forecast'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
                  <select
                    required
                    value={form.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year *</label>
                  <input
                    type="number"
                    required
                    value={form.year}
                    onChange={(e) => handleYearChange(e.target.value)}
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
                    <option value="Final">Final</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              {/* Data Periods */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Forecast Data *</label>
                  {form.type !== 'Monthly' && (
                    <button type="button" onClick={addDataEntry}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition"
                    >
                      <Plus size={14} /> Add Period
                    </button>
                  )}
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {form.data.map((entry, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          {form.type === 'Monthly' ? (
                            <div className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                              {monthNames[Number(entry.month) - 1] || 'Jan'} {entry.year}
                            </div>
                          ) : (
                            <select
                              required
                              value={entry.month}
                              onChange={(e) => updateDataEntry(idx, 'month', Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            >
                              {monthNames.map((m, i) => (
                                <option key={i + 1} value={i + 1}>{m}</option>
                              ))}
                            </select>
                          )}
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={entry.forecastedAmount || ''}
                          onChange={(e) => updateDataEntry(idx, 'forecastedAmount', e.target.value)}
                          placeholder="Forecasted"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={entry.actualAmount || ''}
                          onChange={(e) => updateDataEntry(idx, 'actualAmount', e.target.value)}
                          placeholder="Actual"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                        <div className="flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">
                          Diff: ${(Number(entry.forecastedAmount) - Number(entry.actualAmount) || 0).toFixed(2)}
                        </div>
                      </div>
                      {form.type !== 'Monthly' && form.data.length > 1 && (
                        <button type="button" onClick={() => removeDataEntry(idx)}
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
                    Total Forecasted: <span className="font-semibold text-cyan-600 dark:text-cyan-400">${calcTotalForecasted(form.data).toFixed(2)}</span>
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    Total Actual: <span className="font-semibold text-emerald-600 dark:text-emerald-400">${calcTotalActual(form.data).toFixed(2)}</span>
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

      {/* Forecasts List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <TrendingUp className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">No Revenue Forecasts</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">No forecast records found. Create one to get started.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Year</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Period</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Forecasted</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Actual</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => {
                  const totalActual = calcTotalActual(f.data || []);
                  return (
                    <motion.tr
                      key={f._id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">{f.type}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{f.year}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{getPeriodLabel(f)}</td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-sm font-semibold text-cyan-600 dark:text-cyan-400">
                          <DollarSign size={14} />
                          {Number(f.totalForecasted || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          <DollarSign size={14} />
                          {totalActual.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[f.status] || 'bg-gray-100 text-gray-600'}`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(f)}
                            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => setShowDeleteConfirm(f._id)}
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
                Delete this revenue forecast?
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

export default RevenueForecast;