import { useState, useMemo } from 'react';
import {
  HandCoins, Plus, Search, Edit3, X,
  AlertCircle, CheckCircle, Clock, RefreshCw,
  DollarSign, User, FileText, Send,
} from 'lucide-react';
import { useToast } from '../components/ToastContainer';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetLoansQuery,
  useCreateLoanMutation,
  useApproveLoanMutation,
  useRejectLoanMutation,
} from '../store/adminApiSlice';

const LOAN_TYPES = ['Personal', 'Emergency', 'Salary Advance', 'Education', 'Housing', 'Other'];
const REPAYMENT_METHODS = ['Monthly Deduction', 'Lump Sum', 'Installments'];

const STATUS_COLORS = {
  Pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Approved:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Rejected:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Disbursed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Closed:    'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const TYPE_COLORS = {
  Personal:       'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  Emergency:      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Salary Advance':'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Education:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Housing:        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Other:          'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
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

const LoanModal = ({ initial, onClose }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    employeeName: initial?.employeeName || '',
    employeeId: initial?.employeeId || '',
    type: initial?.type || 'Personal',
    amount: initial?.amount || '',
    outstandingBalance: initial?.outstandingBalance || '',
    interestRate: initial?.interestRate || '',
    term: initial?.term || '',
    repaymentMethod: initial?.repaymentMethod || 'Monthly Deduction',
    reason: initial?.reason || '',
    startDate: initial?.startDate ? new Date(initial.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  });
  const [createLoan, { isLoading: creating }] = useCreateLoanMutation();
  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employeeName.trim()) return toast.error('Employee name is required');
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount');
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        outstandingBalance: Number(form.outstandingBalance) || Number(form.amount),
        interestRate: Number(form.interestRate) || 0,
        term: Number(form.term) || 12,
      };
      await createLoan(payload).unwrap();
      toast.success('Loan created successfully');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create loan');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Loan' : 'New Loan'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Employee Name *</label>
              <input value={form.employeeName} onChange={e => set('employeeName', e.target.value)} required
                placeholder="e.g. John Smith"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Employee ID</label>
              <input value={form.employeeId} onChange={e => set('employeeId', e.target.value)}
                placeholder="e.g. TCH-001"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Loan Type *</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                {LOAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Amount *</label>
              <input type="number" min="0" step="0.01" required value={form.amount}
                onChange={e => set('amount', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Interest Rate %</label>
              <input type="number" min="0" step="0.1" value={form.interestRate}
                onChange={e => set('interestRate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Term (months)</label>
              <input type="number" min="1" value={form.term}
                onChange={e => set('term', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Start Date</label>
              <input type="date" value={form.startDate}
                onChange={e => set('startDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Repayment Method</label>
            <select value={form.repaymentMethod} onChange={e => set('repaymentMethod', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
              {REPAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Reason</label>
            <textarea rows={2} value={form.reason} onChange={e => set('reason', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={creating}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {creating ? 'Saving\u2026' : 'Save Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EmployeeLoansManagement = () => {
  const toast = useToast();
  const [filters, setFilters] = useState({ search: '', status: '', type: '' });
  const [showCreate, setShowCreate] = useState(false);

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v }));

  const queryArgs = useMemo(() => {
    const q = {};
    if (filters.search) q.search = filters.search;
    if (filters.status) q.status = filters.status;
    if (filters.type) q.type = filters.type;
    return q;
  }, [filters]);

  const { data, isLoading, refetch } = useGetLoansQuery(queryArgs);
  const [approveLoan, { isLoading: approving }] = useApproveLoanMutation();
  const [rejectLoan, { isLoading: rejecting }] = useRejectLoanMutation();

  const loans = data?.data || data?.loans || [];

  const stats = useMemo(() => {
    const total = loans.length;
    const pending = loans.filter(l => l.status === 'Pending').length;
    const approved = loans.filter(l => l.status === 'Approved' || l.status === 'Disbursed').length;
    const totalAmount = loans.reduce((s, l) => s + (l.amount || 0), 0);
    return { total, pending, approved, totalAmount };
  }, [loans]);

  const handleApprove = async (id) => {
    try {
      await approveLoan(id).unwrap();
      toast.success('Loan approved');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to approve loan');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectLoan(id).unwrap();
      toast.success('Loan rejected');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to reject loan');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <HandCoins className="text-indigo-600" size={28} />
            Employee Loans
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage employee loan requests, approvals, and repayments.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
            <Plus size={16} /> New Loan
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Loans" value={stats.total} icon={FileText} color="bg-indigo-500" />
          <StatCard label="Total Amount" value={fmt(stats.totalAmount)} icon={DollarSign} color="bg-blue-500" />
          <StatCard label="Pending" value={stats.pending} icon={Clock} color="bg-yellow-500" />
          <StatCard label="Approved" value={stats.approved} icon={CheckCircle} color="bg-green-500" />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={e => setF('search', e.target.value)}
              placeholder="Search loans\u2026"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
          </div>
          <select value={filters.status} onChange={e => setF('status', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Statuses</option>
            {['Pending','Approved','Rejected','Disbursed','Closed'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.type} onChange={e => setF('type', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Types</option>
            {LOAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : loans.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
              <HandCoins size={28} className="text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No loans found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filters.search || filters.status || filters.type
                ? 'Try adjusting your filters.'
                : 'Click "New Loan" to create the first loan request.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5 text-right">Outstanding</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loans.map(loan => (
                  <tr key={loan._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                          <User size={16} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{loan.employeeName}</div>
                          {loan.employeeId && (
                            <div className="text-xs text-slate-400">{loan.employeeId}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${TYPE_COLORS[loan.type] || TYPE_COLORS.Other}`}>
                        {loan.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-black text-slate-900 dark:text-white">
                      {fmt(loan.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-slate-600 dark:text-slate-300">
                      {fmt(loan.outstandingBalance || loan.amount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[loan.status] || ''}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      {fmtDate(loan.createdAt || loan.startDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {loan.status === 'Pending' && (
                          <>
                            <button onClick={() => handleApprove(loan._id)} disabled={approving}
                              title="Approve"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button onClick={() => handleReject(loan._id)} disabled={rejecting}
                              title="Reject"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                              <X size={14} /> Reject
                            </button>
                          </>
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

      {showCreate && <LoanModal onClose={() => setShowCreate(false)} />}
    </div>
  );
};

export default EmployeeLoansManagement;
