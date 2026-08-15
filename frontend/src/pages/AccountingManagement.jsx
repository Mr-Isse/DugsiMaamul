import { useState, useMemo } from 'react';
import {
  BookOpen, Plus, Search, Edit3, Trash2, X, Filter,
  AlertCircle, TrendingUp, CheckCircle, Clock, RefreshCw,
  FileText, DollarSign, ArrowRightLeft, Calendar, ChevronDown,
  ChevronRight, Send, RotateCcw, BarChart3, Wallet, Landmark,
  TrendingDown, CircleDot, Lock,
} from 'lucide-react';
import { useToast } from '../components/ToastContainer';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetAccountsQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  useGetJournalEntriesQuery,
  useCreateJournalEntryMutation,
  usePostJournalEntryMutation,
  useReverseJournalEntryMutation,
  useGetTrialBalanceQuery,
  useGetProfitAndLossQuery,
  useGetBalanceSheetQuery,
  useGetCashFlowQuery,
  useGetFiscalPeriodsQuery,
  useCreateFiscalPeriodMutation,
  useCloseFiscalPeriodMutation,
} from '../store/adminApiSlice';

const ACCOUNT_TYPES = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
const SUB_TYPES = {
  Asset: ['Current Asset', 'Fixed Asset', 'Other Asset'],
  Liability: ['Current Liability', 'Long-term Liability'],
  Equity: ['Retained Earnings', 'Owner Equity'],
  Revenue: ['Operating Revenue', 'Non-operating Revenue'],
  Expense: ['Operating Expense', 'Non-operating Expense', 'Cost of Goods Sold'],
};
const JOURNAL_STATUSES = ['Draft', 'Posted', 'Reversed'];
const TABS = ['Chart of Accounts', 'Journal Entries', 'Reports', 'Fiscal Periods'];

const TYPE_COLORS = {
  Asset:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Liability:'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Equity:   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Revenue:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Expense:  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

const STATUS_COLORS = {
  Draft:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Posted:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Reversed:'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const PERIOD_STATUS_COLORS = {
  Open:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Closed:   'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  Archived: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0);

const fmtDate = (d) => {
  if (!d) return '\u2014';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

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

const AccountModal = ({ initial, accounts, onClose }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    code: initial?.code || '',
    name: initial?.name || '',
    type: initial?.type || 'Asset',
    subType: initial?.subType || '',
    parent: initial?.parent || '',
    description: initial?.description || '',
    openingBalance: initial?.openingBalance || '',
  });
  const [createAccount, { isLoading: creating }] = useCreateAccountMutation();
  const [updateAccount, { isLoading: updating }] = useUpdateAccountMutation();
  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) return toast.error('Account code is required');
    if (!form.name.trim()) return toast.error('Account name is required');
    try {
      const payload = { ...form, openingBalance: Number(form.openingBalance) || 0 };
      if (isEdit) {
        await updateAccount({ id: initial._id, ...payload }).unwrap();
        toast.success('Account updated');
      } else {
        await createAccount(payload).unwrap();
        toast.success('Account created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save account');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Account' : 'New Account'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Code *</label>
              <input value={form.code} onChange={e => set('code', e.target.value)} required
                placeholder="e.g. 1001"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Type *</label>
              <select value={form.type} onChange={e => { set('type', e.target.value); set('subType', ''); }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              placeholder="e.g. Cash in Hand"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Sub Type</label>
              <select value={form.subType} onChange={e => set('subType', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                <option value="">None</option>
                {(SUB_TYPES[form.type] || []).map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Parent Account</label>
              <select value={form.parent} onChange={e => set('parent', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                <option value="">None (Root)</option>
                {accounts.filter(a => a._id !== initial?._id).map(a => (
                  <option key={a._id} value={a._id}>{a.code} - {a.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Opening Balance</label>
            <input type="number" step="0.01" value={form.openingBalance}
              onChange={e => set('openingBalance', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={creating || updating}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {creating || updating ? 'Saving\u2026' : 'Save Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteAccountModal = ({ account, onClose }) => {
  const toast = useToast();
  const [deleteAccount, { isLoading }] = useDeleteAccountMutation();

  const handleDelete = async () => {
    try {
      await deleteAccount(account._id).unwrap();
      toast.success('Account deleted');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete account');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Delete Account</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-slate-200">&quot;{account.code} - {account.name}&quot;</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
            {isLoading ? 'Deleting\u2026' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const JournalEntryModal = ({ accounts, onClose }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    reference: '',
    lines: [{ account: '', debit: '', credit: '' }],
  });
  const [createJournalEntry, { isLoading }] = useCreateJournalEntryMutation();
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const updateLine = (index, key, value) => {
    setForm(p => {
      const lines = [...p.lines];
      lines[index] = { ...lines[index], [key]: value };
      return { ...p, lines };
    });
  };

  const addLine = () => {
    setForm(p => ({ ...p, lines: [...p.lines, { account: '', debit: '', credit: '' }] }));
  };

  const removeLine = (index) => {
    if (form.lines.length <= 1) return;
    setForm(p => ({ ...p, lines: p.lines.filter((_, i) => i !== index) }));
  };

  const totalDebit = form.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = form.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) return toast.error('Description is required');
    if (form.lines.some(l => !l.account)) return toast.error('All lines must have an account');
    if (Math.abs(totalDebit - totalCredit) > 0.01) return toast.error('Total debit must equal total credit');
    if (totalDebit === 0) return toast.error('Total must be greater than zero');
    try {
      await createJournalEntry({
        date: form.date,
        description: form.description,
        reference: form.reference,
        lines: form.lines.map(l => ({ account: l.account, debit: Number(l.debit) || 0, credit: Number(l.credit) || 0 })),
      }).unwrap();
      toast.success('Journal entry created');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create journal entry');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">New Journal Entry</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Date *</label>
              <input type="date" required value={form.date}
                onChange={e => set('date', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Reference</label>
              <input value={form.reference} onChange={e => set('reference', e.target.value)}
                placeholder="e.g. INV-001"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Description *</label>
            <input value={form.description} onChange={e => set('description', e.target.value)} required
              placeholder="e.g. Purchase of office supplies"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold">Lines</label>
              <button type="button" onClick={addLine}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700">
                <Plus size={14} /> Add Line
              </button>
            </div>
            <div className="space-y-2">
              {form.lines.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select value={line.account} onChange={e => updateLine(i, 'account', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 text-sm">
                    <option value="">Select Account</option>
                    {accounts.map(a => <option key={a._id} value={a._id}>{a.code} - {a.name}</option>)}
                  </select>
                  <input type="number" step="0.01" min="0" placeholder="Debit"
                    value={line.debit} onChange={e => updateLine(i, 'debit', e.target.value)}
                    className="w-28 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 text-sm" />
                  <input type="number" step="0.01" min="0" placeholder="Credit"
                    value={line.credit} onChange={e => updateLine(i, 'credit', e.target.value)}
                    className="w-28 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 text-sm" />
                  <button type="button" onClick={() => removeLine(i)} disabled={form.lines.length <= 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors disabled:opacity-30">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-6 mt-3 text-sm font-bold">
              <span className="text-slate-600 dark:text-slate-300">Debit: {fmt(totalDebit)}</span>
              <span className="text-slate-600 dark:text-slate-300">Credit: {fmt(totalCredit)}</span>
              {Math.abs(totalDebit - totalCredit) > 0.01 && (
                <span className="text-red-500">Unbalanced</span>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {isLoading ? 'Creating\u2026' : 'Create Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FiscalPeriodModal = ({ onClose }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
  });
  const [createFiscalPeriod, { isLoading }] = useCreateFiscalPeriodMutation();
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Period name is required');
    if (!form.startDate || !form.endDate) return toast.error('Start and end dates are required');
    if (new Date(form.startDate) >= new Date(form.endDate)) return toast.error('End date must be after start date');
    try {
      await createFiscalPeriod(form).unwrap();
      toast.success('Fiscal period created');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create fiscal period');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">New Fiscal Period</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Period Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              placeholder="e.g. FY 2025-2026"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Start Date *</label>
              <input type="date" required value={form.startDate}
                onChange={e => set('startDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">End Date *</label>
              <input type="date" required value={form.endDate}
                onChange={e => set('endDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {isLoading ? 'Creating\u2026' : 'Create Period'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ChartOfAccountsTab = () => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const queryArgs = useMemo(() => {
    const q = {};
    if (search) q.search = search;
    if (filterType) q.type = filterType;
    return q;
  }, [search, filterType]);

  const { data, isLoading, refetch } = useGetAccountsQuery(queryArgs);
  const accounts = data?.data || data?.accounts || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search accounts\u2026"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
          <option value="">All Types</option>
          {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
          <RefreshCw size={16} />
        </button>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
          <Plus size={16} /> Add Account
        </button>
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : accounts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
              <BookOpen size={28} className="text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No accounts found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {search || filterType ? 'Try adjusting your filters.' : 'Click "Add Account" to create your first account.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5 text-right">Balance</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {accounts.map(acc => (
                  <tr key={acc._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-sm font-bold text-slate-900 dark:text-white">{acc.code}</td>
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{acc.name}</div>
                      {acc.description && (
                        <div className="text-xs text-slate-400 truncate max-w-[200px]">{acc.description}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${TYPE_COLORS[acc.type] || ''}`}>
                        {acc.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-slate-900 dark:text-white">
                      {fmt(acc.balance || acc.openingBalance)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditRecord(acc)} title="Edit"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => setDeleteRecord(acc)} title="Delete"
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
      </div>
      {showCreate && <AccountModal accounts={accounts} onClose={() => setShowCreate(false)} />}
      {editRecord && <AccountModal initial={editRecord} accounts={accounts} onClose={() => setEditRecord(null)} />}
      {deleteRecord && <DeleteAccountModal account={deleteRecord} onClose={() => setDeleteRecord(null)} />}
    </div>
  );
};

const JournalEntriesTab = () => {
  const toast = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const queryArgs = useMemo(() => {
    const q = {};
    if (filterStatus) q.status = filterStatus;
    return q;
  }, [filterStatus]);

  const { data: accountsData } = useGetAccountsQuery({});
  const { data, isLoading, refetch } = useGetJournalEntriesQuery(queryArgs);
  const [postJournalEntry, { isLoading: posting }] = usePostJournalEntryMutation();
  const [reverseJournalEntry, { isLoading: reversing }] = useReverseJournalEntryMutation();

  const entries = data?.data || data?.entries || [];
  const accounts = accountsData?.data || accountsData?.accounts || [];
  const getAccountName = (id) => {
    const acc = accounts.find(a => a._id === id);
    return acc ? `${acc.code} - ${acc.name}` : id;
  };

  const handlePost = async (id) => {
    try {
      await postJournalEntry(id).unwrap();
      toast.success('Journal entry posted');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to post entry');
    }
  };

  const handleReverse = async (id) => {
    try {
      await reverseJournalEntry(id).unwrap();
      toast.success('Journal entry reversed');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to reverse entry');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
          <option value="">All Statuses</option>
          {JOURNAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
          <RefreshCw size={16} />
        </button>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
          <Plus size={16} /> New Entry
        </button>
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : entries.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
              <FileText size={28} className="text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No journal entries found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Click "New Entry" to record your first journal entry.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Entry #</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5 text-right">Debit</th>
                  <th className="px-5 py-3.5 text-right">Credit</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {entries.map(entry => {
                  const totalDr = (entry.lines || []).reduce((s, l) => s + (l.debit || 0), 0);
                  const totalCr = (entry.lines || []).reduce((s, l) => s + (l.credit || 0), 0);
                  return (
                    <tr key={entry._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-sm font-bold text-slate-900 dark:text-white">
                        {entry.entryNumber || entry.jeNumber || `JE-${entry._id?.slice(-6)}`}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                        {fmtDate(entry.date)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{entry.description}</div>
                        {entry.reference && (
                          <div className="text-xs text-slate-400">Ref: {entry.reference}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right font-black text-green-600 dark:text-green-400">
                        {fmt(totalDr)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-black text-red-600 dark:text-red-400">
                        {fmt(totalCr)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[entry.status] || ''}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {entry.status === 'Draft' && (
                            <>
                              <button onClick={() => handlePost(entry._id)} disabled={posting}
                                title="Post"
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                                <Send size={14} /> Post
                              </button>
                            </>
                          )}
                          {entry.status === 'Posted' && (
                            <button onClick={() => handleReverse(entry._id)} disabled={reversing}
                              title="Reverse"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                              <RotateCcw size={14} /> Reverse
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showCreate && <JournalEntryModal accounts={accounts} onClose={() => setShowCreate(false)} />}
    </div>
  );
};

const ReportsTab = () => {
  const { data: trialData, isLoading: loadingTB } = useGetTrialBalanceQuery();
  const { data: pnlData, isLoading: loadingPNL } = useGetProfitAndLossQuery();
  const { data: bsData, isLoading: loadingBS } = useGetBalanceSheetQuery();
  const { data: cfData, isLoading: loadingCF } = useGetCashFlowQuery();

  const trialBalance = trialData?.data || trialData || {};
  const pnl = pnlData?.data || pnlData || {};
  const bs = bsData?.data || bsData || {};
  const cf = cfData?.data || cfData || {};

  const renderReportTable = (items, labelKey, amountKey) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
          <tr>
            <th className="px-5 py-3.5">Account</th>
            <th className="px-5 py-3.5 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {(items || []).map((item, i) => (
            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white">
                {item[labelKey] || item.name || item.account}
              </td>
              <td className="px-5 py-3.5 text-right font-black text-slate-900 dark:text-white">
                {fmt(item[amountKey] || item.amount || item.balance)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
              <BarChart3 size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white">Trial Balance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Debits = Credits</p>
            </div>
          </div>
          {loadingTB ? <TableSkeleton rows={4} columns={2} /> : (
            <>
              <div className="grid grid-cols-2 gap-4 p-5">
                <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <p className="text-xs font-bold text-green-600 uppercase">Total Debit</p>
                  <p className="text-lg font-black text-green-700 dark:text-green-400">{fmt(trialBalance.totalDebit)}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                  <p className="text-xs font-bold text-red-600 uppercase">Total Credit</p>
                  <p className="text-lg font-black text-red-700 dark:text-red-400">{fmt(trialBalance.totalCredit)}</p>
                </div>
              </div>
              {renderReportTable(trialBalance.accounts || trialBalance.items, 'name', 'balance')}
            </>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
              <TrendingUp size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white">Profit & Loss</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Revenue minus Expenses</p>
            </div>
          </div>
          {loadingPNL ? <TableSkeleton rows={4} columns={2} /> : (
            <>
              <div className="grid grid-cols-2 gap-4 p-5">
                <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <p className="text-xs font-bold text-green-600 uppercase">Revenue</p>
                  <p className="text-lg font-black text-green-700 dark:text-green-400">{fmt(pnl.totalRevenue)}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                  <p className="text-xs font-bold text-red-600 uppercase">Expenses</p>
                  <p className="text-lg font-black text-red-700 dark:text-red-400">{fmt(pnl.totalExpenses)}</p>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Net Income</span>
                <span className={`text-lg font-black ${(pnl.netIncome || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {fmt(pnl.netIncome)}
                </span>
              </div>
              {renderReportTable(pnl.items || pnl.accounts, 'name', 'amount')}
            </>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
              <Landmark size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white">Balance Sheet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Assets = Liabilities + Equity</p>
            </div>
          </div>
          {loadingBS ? <TableSkeleton rows={4} columns={2} /> : (
            <>
              <div className="grid grid-cols-3 gap-3 p-5">
                <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <p className="text-xs font-bold text-green-600 uppercase">Assets</p>
                  <p className="text-lg font-black text-green-700 dark:text-green-400">{fmt(bs.totalAssets)}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20">
                  <p className="text-xs font-bold text-red-600 uppercase">Liabilities</p>
                  <p className="text-lg font-black text-red-700 dark:text-red-400">{fmt(bs.totalLiabilities)}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                  <p className="text-xs font-bold text-purple-600 uppercase">Equity</p>
                  <p className="text-lg font-black text-purple-700 dark:text-purple-400">{fmt(bs.totalEquity)}</p>
                </div>
              </div>
              {renderReportTable(bs.items || bs.accounts, 'name', 'balance')}
            </>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center">
              <Wallet size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white">Cash Flow</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Operating, Investing, Financing</p>
            </div>
          </div>
          {loadingCF ? <TableSkeleton rows={4} columns={2} /> : (
            <>
              <div className="grid grid-cols-3 gap-3 p-5">
                <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <p className="text-xs font-bold text-green-600 uppercase">Operating</p>
                  <p className="text-lg font-black text-green-700 dark:text-green-400">{fmt(cf.operating)}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-xs font-bold text-blue-600 uppercase">Investing</p>
                  <p className="text-lg font-black text-blue-700 dark:text-blue-400">{fmt(cf.investing)}</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                  <p className="text-xs font-bold text-purple-600 uppercase">Financing</p>
                  <p className="text-lg font-black text-purple-700 dark:text-purple-400">{fmt(cf.financing)}</p>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Net Cash Flow</span>
                <span className={`text-lg font-black ${(cf.netCashFlow || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {fmt(cf.netCashFlow)}
                </span>
              </div>
              {renderReportTable(cf.items || cf.activities, 'name', 'amount')}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const FiscalPeriodsTab = () => {
  const toast = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const { data, isLoading, refetch } = useGetFiscalPeriodsQuery();
  const [closeFiscalPeriod, { isLoading: closing }] = useCloseFiscalPeriodMutation();

  const periods = data?.data || data?.periods || [];

  const handleClose = async (id) => {
    try {
      await closeFiscalPeriod(id).unwrap();
      toast.success('Fiscal period closed');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to close period');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
          <RefreshCw size={16} />
        </button>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
          <Plus size={16} /> New Period
        </button>
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={4} columns={5} />
        ) : periods.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
              <Calendar size={28} className="text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No fiscal periods</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Click "New Period" to create your first fiscal period.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Start Date</th>
                  <th className="px-5 py-3.5">End Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {periods.map(period => (
                  <tr key={period._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{period.name}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">{fmtDate(period.startDate)}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">{fmtDate(period.endDate)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${PERIOD_STATUS_COLORS[period.status] || ''}`}>
                        {period.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {period.status === 'Open' && (
                          <button onClick={() => handleClose(period._id)} disabled={closing}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                            <Lock size={14} /> Close
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showCreate && <FiscalPeriodModal onClose={() => setShowCreate(false)} />}
    </div>
  );
};

const AccountingManagement = () => {
  const [activeTab, setActiveTab] = useState('Chart of Accounts');

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <BookOpen className="text-indigo-600" size={28} />
            Accounting Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage chart of accounts, journal entries, reports, and fiscal periods.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 flex gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}>
            {tab === 'Chart of Accounts' && <BookOpen size={16} />}
            {tab === 'Journal Entries' && <FileText size={16} />}
            {tab === 'Reports' && <BarChart3 size={16} />}
            {tab === 'Fiscal Periods' && <Calendar size={16} />}
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Chart of Accounts' && <ChartOfAccountsTab />}
      {activeTab === 'Journal Entries' && <JournalEntriesTab />}
      {activeTab === 'Reports' && <ReportsTab />}
      {activeTab === 'Fiscal Periods' && <FiscalPeriodsTab />}
    </div>
  );
};

export default AccountingManagement;
