import { useState, useMemo } from 'react';
import {
  CreditCard, Plus, Search, CheckCircle,
  AlertCircle, Users, DollarSign, TrendingUp, Trash2,
  Edit, RefreshCw, FileText, BadgeCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import { PageLayout, PageHeader } from '../components/PageLayout';
import { Input } from '../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/Dialog';
import { Button } from '../components/ui/button';
import {
  useGetPayrollsQuery,
  useGetPayrollStatsQuery,
  useCreatePayrollMutation,
  useUpdatePayrollMutation,
  useDeletePayrollMutation,
  useApprovePayrollMutation,
  useMarkPayrollPaidMutation,
  useRunBulkPayrollMutation,
  useGetSalaryStructuresQuery,
  useGetTeachersQuery,
  useGetPayrollByIdQuery,
} from '../store/adminApiSlice';

// ── Constants ────────────────────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const CURRENT_YEAR  = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1;
const YEAR_OPTIONS  = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const STATUS_STYLES = {
  Draft:     'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Approved:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Paid:      'bg-emerald-100  text-emerald-700  dark:bg-emerald-900/30  dark:text-emerald-400',
  Cancelled: 'bg-rose-100    text-rose-700    dark:bg-rose-900/30    dark:text-rose-400',
};

const fmt = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n || 0);

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
const PayrollModal = ({ initial, onClose, schoolId }) => {
  const [form, setForm] = useState({
    userId: initial?.user?._id || '',
    month:  initial?.month  || CURRENT_MONTH,
    year:   initial?.year   || CURRENT_YEAR,
    basicSalary: initial?.basicSalary || '',
    salaryStructureId: initial?.salaryStructure?._id || '',
    paymentMethod: initial?.paymentMethod || 'Bank Transfer',
    bankName: initial?.bankName || '',
    accountNumber: initial?.accountNumber || '',
    remarks: initial?.remarks || '',
  });

  const { data: teachersData } = useGetTeachersQuery();
  const { data: structuresData } = useGetSalaryStructuresQuery();
  const [createPayroll, { isLoading: creating }] = useCreatePayrollMutation();
  const [updatePayroll, { isLoading: updating }]  = useUpdatePayrollMutation();

  const teachers   = teachersData || [];
  const structures = structuresData?.data || [];
  const isEdit     = Boolean(initial);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Auto-fill basic salary from selected structure
  const handleStructureChange = (id) => {
    set('salaryStructureId', id);
    const s = structures.find(x => x._id === id);
    if (s) set('basicSalary', s.basicSalary);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userId) return toast.error('Select an employee');
    if (!form.basicSalary || Number(form.basicSalary) < 0) return toast.error('Enter a valid basic salary');
    try {
      const payload = { ...form, basicSalary: Number(form.basicSalary) };
      if (isEdit) {
        await updatePayroll({ id: initial._id, ...payload }).unwrap();
        toast.success('Payroll record updated');
      } else {
        await createPayroll(payload).unwrap();
        toast.success('Payroll record created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save payroll');
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Payroll Record' : 'Create Payroll Record'}</DialogTitle>
        </DialogHeader>
        <form id="payroll-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Employee *</label>
            <select value={form.userId} onChange={e => set('userId', e.target.value)} required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
              <option value="">Select employee…</option>
              {teachers.map(t => (
                <option key={t._id} value={t._id}>{t.name} ({t.customId || 'No ID'})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Month *</label>
              <select value={form.month} onChange={e => set('month', Number(e.target.value))} required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Year *</label>
              <select value={form.year} onChange={e => set('year', Number(e.target.value))} required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Salary Structure (optional)</label>
            <select value={form.salaryStructureId} onChange={e => handleStructureChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
              <option value="">No structure (manual entry)</option>
              {structures.map(s => <option key={s._id} value={s._id}>{s.name} — {fmt(s.basicSalary, s.currency)}</option>)}
            </select>
          </div>

          <Input type="number" min="0" step="0.01" required value={form.basicSalary}
            onChange={e => set('basicSalary', e.target.value)} label="Basic Salary *" />

          <div>
            <label className="block text-sm font-bold mb-1">Payment Method</label>
            <select value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
              {['Bank Transfer','Cash','Cheque','Mobile Money'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          {form.paymentMethod === 'Bank Transfer' && (
            <div className="grid grid-cols-2 gap-4">
              <Input value={form.bankName} onChange={e => set('bankName', e.target.value)} label="Bank Name" />
              <Input value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} label="Account Number" />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-1">Remarks</label>
            <textarea rows={2} value={form.remarks} onChange={e => set('remarks', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 resize-none" />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="payroll-form" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Record'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Bulk Run Modal ────────────────────────────────────────────────────────────
const BulkRunModal = ({ onClose }) => {
  const [form, setForm] = useState({ month: CURRENT_MONTH, year: CURRENT_YEAR, salaryStructureId: '' });
  const { data: structuresData } = useGetSalaryStructuresQuery();
  const [runBulk, { isLoading }] = useRunBulkPayrollMutation();
  const structures = structuresData?.data || [];
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleRun = async () => {
    try {
      const res = await runBulk(form).unwrap();
      const { created, skipped, errors } = res.summary;
      toast.success(`Done — Created: ${created}, Skipped: ${skipped}, Errors: ${errors}`);
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Bulk run failed');
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Run Bulk Payroll</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Generates payroll records for all active teachers and staff for the selected period. Existing records are skipped.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Month</label>
              <select value={form.month} onChange={e => set('month', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Year</label>
              <select value={form.year} onChange={e => set('year', Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Default Salary Structure (optional)</label>
            <select value={form.salaryStructureId} onChange={e => set('salaryStructureId', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
              <option value="">Use default / employee monthly fees</option>
              {structures.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleRun} disabled={isLoading}>
            {isLoading ? 'Running...' : 'Run Payroll'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Mark Paid Modal ───────────────────────────────────────────────────────────
const MarkPaidModal = ({ record, onClose }) => {
  const [form, setForm] = useState({ paymentDate: new Date().toISOString().split('T')[0], paymentMethod: record?.paymentMethod || 'Bank Transfer', transactionRef: '' });
  const [markPaid, { isLoading }] = useMarkPayrollPaidMutation();
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await markPaid({ id: record._id, ...form }).unwrap();
      toast.success('Payroll marked as paid');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to mark as paid');
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Mark as Paid</DialogTitle>
        </DialogHeader>
        <form id="mark-paid-form" onSubmit={handleSubmit} className="space-y-4">
          <Input type="date" value={form.paymentDate} onChange={e => set('paymentDate', e.target.value)} label="Payment Date" />
          <div>
            <label className="block text-sm font-bold mb-1">Payment Method</label>
            <select value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
              {['Bank Transfer','Cash','Cheque','Mobile Money'].map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <Input value={form.transactionRef} onChange={e => set('transactionRef', e.target.value)} placeholder="Optional" label="Transaction Reference" />
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="mark-paid-form" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Confirm Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const PayrollManagement = () => {
  const [filters, setFilters] = useState({ month: '', year: String(CURRENT_YEAR), status: '', search: '' });
  const [showCreate, setShowCreate]   = useState(false);
  const [showBulk, setShowBulk]       = useState(false);
  const [editRecord, setEditRecord]   = useState(null);
  const [markPaidRec, setMarkPaidRec] = useState(null);

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v }));

  const queryArgs = useMemo(() => {
    const q = {};
    if (filters.month)  q.month  = filters.month;
    if (filters.year)   q.year   = filters.year;
    if (filters.status) q.status = filters.status;
    return q;
  }, [filters]);

  const { data, isLoading, refetch } = useGetPayrollsQuery(queryArgs);
  const { data: statsData }          = useGetPayrollStatsQuery({ year: filters.year || CURRENT_YEAR });
  const [approvePayroll]             = useApprovePayrollMutation();
  const [deletePayroll]              = useDeletePayrollMutation();

  const records = data?.data || [];
  const stats   = statsData?.data?.summary || {};

  const filtered = useMemo(() => {
    if (!filters.search) return records;
    const q = filters.search.toLowerCase();
    return records.filter(r =>
      r.user?.name?.toLowerCase().includes(q) ||
      r.user?.customId?.toLowerCase().includes(q) ||
      r.payslipNumber?.toLowerCase().includes(q)
    );
  }, [records, filters.search]);

  const handleApprove = async (id) => {
    try {
      await approvePayroll(id).unwrap();
      toast.success('Payroll approved');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to approve');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payroll record? This cannot be undone.')) return;
    try {
      await deletePayroll(id).unwrap();
      toast.success('Payroll record deleted');
    } catch (err) {
      toast.error(err?.data?.message || 'Cannot delete paid records');
    }
  };

  const handleDownloadPayslip = (id) => {
    // Opens the payslip PDF in a new tab
    const base = import.meta.env.VITE_API_URL || '/api/v1';
    window.open(`${base}/payroll/${id}/payslip`, '_blank');
  };

  return (
    <PageLayout>
      <PageHeader
        title="Payroll Management"
        description="Manage employee salaries, generate payslips, and run bulk payroll."
        icon={CreditCard}
        actions={
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" onClick={() => setShowBulk(true)}>
              <RefreshCw size={16} /> Bulk Run
            </Button>
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Add Record
            </Button>
          </div>
        }
      />

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Gross"  value={fmt(stats.totalGross)} icon={TrendingUp}  color="bg-indigo-500" />
          <StatCard label="Total Net"    value={fmt(stats.totalNet)}   icon={DollarSign}  color="bg-emerald-500" />
          <StatCard label="Tax Withheld" value={fmt(stats.totalTax)}   icon={AlertCircle} color="bg-amber-500" />
          <StatCard label="Records"      value={stats.count || 0}      icon={Users}       color="bg-indigo-500" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input value={filters.search} onChange={e => setF('search', e.target.value)}
              placeholder="Search employee or payslip #..." className="pl-9" />
          </div>
          <select value={filters.month} onChange={e => setF('month', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Months</option>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={filters.year} onChange={e => setF('year', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={filters.status} onChange={e => setF('status', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Statuses</option>
            {['Draft','Approved','Paid','Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
          <button onClick={refetch}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw size={16} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
              <CreditCard size={28} className="text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No payroll records</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Use "Add Record" or "Bulk Run" to generate payroll.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Period</th>
                  <th className="px-5 py-3.5 text-right">Basic</th>
                  <th className="px-5 py-3.5 text-right">Gross</th>
                  <th className="px-5 py-3.5 text-right">Deductions</th>
                  <th className="px-5 py-3.5 text-right">Net</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{r.user?.name || '—'}</div>
                      <div className="text-xs text-slate-400">{r.user?.customId || ''}</div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      {MONTHS[r.month - 1]} {r.year}
                      {r.payslipNumber && <div className="text-xs text-slate-400">{r.payslipNumber}</div>}
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-700 dark:text-slate-300">{fmt(r.basicSalary)}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-700 dark:text-slate-300">{fmt(r.grossSalary)}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-rose-500">{fmt(r.totalDeductions)}</td>
                    <td className="px-5 py-3.5 text-right font-black text-indigo-600 dark:text-indigo-400">{fmt(r.netSalary)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[r.status] || ''}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Download payslip */}
                        <button onClick={() => handleDownloadPayslip(r._id)} title="Download Payslip"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 transition-colors">
                          <FileText size={16} />
                        </button>
                        {/* Approve (Draft only) */}
                        {r.status === 'Draft' && (
                          <button onClick={() => handleApprove(r._id)} title="Approve"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 transition-colors">
                            <BadgeCheck size={16} />
                          </button>
                        )}
                        {/* Mark Paid */}
                        {(r.status === 'Draft' || r.status === 'Approved') && (
                          <button onClick={() => setMarkPaidRec(r)} title="Mark as Paid"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-colors">
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {/* Edit */}
                        {r.status !== 'Paid' && (
                          <button onClick={() => setEditRecord(r)} title="Edit"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                            <Edit size={16} />
                          </button>
                        )}
                        {/* Delete */}
                        {r.status !== 'Paid' && (
                          <button onClick={() => handleDelete(r._id)} title="Delete"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors">
                            <Trash2 size={16} />
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

      {/* Modals */}
      {showCreate  && <PayrollModal onClose={() => setShowCreate(false)} />}
      {editRecord  && <PayrollModal initial={editRecord} onClose={() => setEditRecord(null)} />}
      {showBulk    && <BulkRunModal onClose={() => setShowBulk(false)} />}
      {markPaidRec && <MarkPaidModal record={markPaidRec} onClose={() => setMarkPaidRec(null)} />}
    </PageLayout>
  );
};

export default PayrollManagement;
