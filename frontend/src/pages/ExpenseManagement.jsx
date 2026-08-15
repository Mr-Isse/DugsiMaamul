import { useState, useMemo } from 'react';
import {
  DollarSign, Plus, Search, Edit3, Trash2, X, Filter,
  Calendar, CreditCard, Receipt, AlertCircle, TrendingUp,
  CheckCircle, Clock, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetExpensesQuery,
  useGetExpenseStatsQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from '../store/adminApiSlice';

// ── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  'Salaries', 'Utilities', 'Maintenance', 'Supplies', 'Transport',
  'Events', 'Technology', 'Marketing', 'Insurance', 'Rent', 'Other',
];
const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Cheque', 'Mobile Money', 'Card'];
const STATUSES = ['Pending', 'Approved', 'Paid', 'Rejected'];

const CATEGORY_COLORS = {
  Salaries:    'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  Utilities:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Maintenance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Supplies:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Transport:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Events:      'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  Technology:  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Marketing:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Insurance:   'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  Rent:        'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  Other:       'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const STATUS_STYLES = {
  Pending:  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Paid:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const fmt = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n || 0);

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

// ── Create / Edit Modal ───────────────────────────────────────────────────────
const ExpenseModal = ({ initial, onClose }) => {
  const [form, setForm] = useState({
    title:         initial?.title || '',
    description:   initial?.description || '',
    amount:        initial?.amount || '',
    date:          initial?.date ? new Date(initial.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    category:      initial?.category || 'Other',
    paymentMethod: initial?.paymentMethod || 'Cash',
    status:        initial?.status || 'Pending',
    receiptUrl:    initial?.receiptUrl || '',
  });

  const [createExpense, { isLoading: creating }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: updating }] = useUpdateExpenseMutation();

  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount');
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (isEdit) {
        await updateExpense({ id: initial._id, ...payload }).unwrap();
        toast.success('Expense updated');
      } else {
        await createExpense(payload).unwrap();
        toast.success('Expense created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save expense');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Expense' : 'New Expense'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required
              placeholder="e.g. Office supplies purchase"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Amount *</label>
              <input type="number" min="0" step="0.01" required value={form.amount}
                onChange={e => set('amount', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Date *</label>
              <input type="date" required value={form.date}
                onChange={e => set('date', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Payment Method</label>
              <select value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Receipt URL</label>
            <input value={form.receiptUrl} onChange={e => set('receiptUrl', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={creating || updating}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {creating || updating ? 'Saving…' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
const DeleteModal = ({ expense, onClose }) => {
  const [deleteExpense, { isLoading }] = useDeleteExpenseMutation();

  const handleDelete = async () => {
    try {
      await deleteExpense(expense._id).unwrap();
      toast.success('Expense deleted');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete expense');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Delete Expense</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-slate-200">"{expense.title}"</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
            {isLoading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const ExpenseManagement = () => {
  const [filters, setFilters] = useState({
    search: '', category: '', status: '', dateFrom: '', dateTo: '', page: 1,
  });
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v, page: k !== 'page' ? 1 : v }));

  const queryArgs = useMemo(() => {
    const q = { page: filters.page, limit: 20 };
    if (filters.search)    q.search    = filters.search;
    if (filters.category)  q.category  = filters.category;
    if (filters.status)    q.status    = filters.status;
    if (filters.dateFrom)  q.dateFrom  = filters.dateFrom;
    if (filters.dateTo)    q.dateTo    = filters.dateTo;
    return q;
  }, [filters]);

  const { data, isLoading, refetch } = useGetExpensesQuery(queryArgs);
  const { data: statsData }          = useGetExpenseStatsQuery();

  const expenses = data?.data || data?.expenses || [];
  const total    = data?.total || data?.totalPages || 0;
  const page     = data?.page || filters.page;
  const pages    = data?.pages || Math.ceil(total / 20) || 1;
  const stats    = statsData?.data || statsData || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <DollarSign className="text-green-600" size={28} />
            Expense Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Track, manage, and approve school expenses.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
            <Plus size={16} /> Add Expense
          </button>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Expenses" value={fmt(stats.totalExpenses || stats.total)} icon={DollarSign}  color="bg-indigo-500" />
          <StatCard label="Paid"           value={fmt(stats.paid)}          icon={CheckCircle} color="bg-green-500" />
          <StatCard label="Pending"        value={fmt(stats.pending)}       icon={Clock}       color="bg-yellow-500" />
          <StatCard label="Monthly Total"  value={fmt(stats.monthlyTotal)}  icon={TrendingUp}  color="bg-blue-500" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={e => setF('search', e.target.value)}
              placeholder="Search expenses…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
          </div>
          <select value={filters.category} onChange={e => setF('category', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.status} onChange={e => setF('status', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" value={filters.dateFrom} onChange={e => setF('dateFrom', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
          <input type="date" value={filters.dateTo} onChange={e => setF('dateTo', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : expenses.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4">
              <Receipt size={28} className="text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No expenses found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filters.search || filters.category || filters.status
                ? 'Try adjusting your filters.'
                : 'Click "Add Expense" to record your first expense.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Title</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.map(exp => (
                  <tr key={exp._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{exp.title}</div>
                      {exp.description && (
                        <div className="text-xs text-slate-400 truncate max-w-[200px]">{exp.description}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.Other}`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-slate-900 dark:text-white">
                      {fmt(exp.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      {fmtDate(exp.date)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <CreditCard size={14} />
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[exp.status] || ''}`}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {exp.receiptUrl && (
                          <a href={exp.receiptUrl} target="_blank" rel="noopener noreferrer" title="View Receipt"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 transition-colors">
                            <Receipt size={16} />
                          </a>
                        )}
                        <button onClick={() => setEditRecord(exp)} title="Edit"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => setDeleteRecord(exp)} title="Delete"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Page {page} of {pages} ({total} expenses)
            </p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setF('page', page - 1)}
                className="px-3 py-1.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Prev
              </button>
              <button disabled={page >= pages} onClick={() => setF('page', page + 1)}
                className="px-3 py-1.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate   && <ExpenseModal onClose={() => setShowCreate(false)} />}
      {editRecord   && <ExpenseModal initial={editRecord} onClose={() => setEditRecord(null)} />}
      {deleteRecord && <DeleteModal expense={deleteRecord} onClose={() => setDeleteRecord(null)} />}
    </div>
  );
};

export default ExpenseManagement;
