import { useState, useMemo } from 'react';
import {
  FileText, Plus, Search, Edit3, X,
  Calendar, CheckCircle, Clock, AlertCircle, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetContractsQuery,
  useCreateContractMutation,
  useUpdateContractMutation,
  useGetTeachersQuery,
  useGetDepartmentsQuery,
} from '../store/adminApiSlice';

const CONTRACT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary'];
const STATUSES = ['Active', 'Expired', 'Terminated', 'Pending'];

const STATUS_STYLES = {
  Active:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Expired:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Terminated: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  Pending:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const TYPE_STYLES = {
  'Full-time':  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'Part-time':  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Contract':   'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Internship': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Temporary':  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

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

const ContractModal = ({ initial, onClose, employees, departments }) => {
  const [form, setForm] = useState({
    employee:      initial?.employee?._id || initial?.employee || '',
    contractType:  initial?.contractType || 'Full-time',
    startDate:     initial?.startDate ? new Date(initial.startDate).toISOString().split('T')[0] : '',
    endDate:       initial?.endDate ? new Date(initial.endDate).toISOString().split('T')[0] : '',
    department:    initial?.department?._id || initial?.department || '',
    salary:        initial?.salary || '',
    status:        initial?.status || 'Active',
    notes:         initial?.notes || '',
  });

  const [createContract, { isLoading: creating }] = useCreateContractMutation();
  const [updateContract, { isLoading: updating }] = useUpdateContractMutation();

  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employee) return toast.error('Employee is required');
    if (!form.startDate) return toast.error('Start date is required');
    try {
      const payload = { ...form, salary: form.salary ? Number(form.salary) : undefined };
      if (isEdit) {
        await updateContract({ id: initial._id, ...payload }).unwrap();
        toast.success('Contract updated');
      } else {
        await createContract(payload).unwrap();
        toast.success('Contract created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save contract');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Contract' : 'New Contract'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Employee *</label>
            <select value={form.employee} onChange={e => set('employee', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
              <option value="">Select employee</option>
              {(employees || []).map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name || `${emp.firstName} ${emp.lastName}`}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Contract Type *</label>
              <select value={form.contractType} onChange={e => set('contractType', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                {CONTRACT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Department</label>
              <select value={form.department} onChange={e => set('department', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                <option value="">Select department</option>
                {(departments || []).map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Start Date *</label>
              <input type="date" required value={form.startDate}
                onChange={e => set('startDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">End Date</label>
              <input type="date" value={form.endDate}
                onChange={e => set('endDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Salary</label>
              <input type="number" min="0" step="0.01" value={form.salary}
                onChange={e => set('salary', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 resize-none" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={creating || updating}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {creating || updating ? 'Saving\u2026' : 'Save Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const EmployeeContractsManagement = () => {
  const [filters, setFilters] = useState({ search: '', status: '', contractType: '', page: 1 });
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v, page: k !== 'page' ? 1 : v }));

  const queryArgs = useMemo(() => {
    const q = { page: filters.page, limit: 20 };
    if (filters.search)       q.search       = filters.search;
    if (filters.status)       q.status       = filters.status;
    if (filters.contractType) q.contractType = filters.contractType;
    return q;
  }, [filters]);

  const { data, isLoading, refetch } = useGetContractsQuery(queryArgs);
  const { data: teachersData } = useGetTeachersQuery();
  const { data: deptData } = useGetDepartmentsQuery();

  const contracts = data?.data || data?.contracts || [];
  const total    = data?.total || 0;
  const page     = data?.page || filters.page;
  const pages    = data?.pages || Math.ceil(total / 20) || 1;
  const employees = teachersData?.data || teachersData || [];
  const departments = deptData?.data || deptData || [];

  const activeCount = contracts.filter(c => c.status === 'Active').length;
  const expiredCount = contracts.filter(c => c.status === 'Expired').length;
  const pendingCount = contracts.filter(c => c.status === 'Pending').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <FileText className="text-indigo-600" size={28} />
            Employee Contracts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage employee contracts, terms, and assignments.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
            <Plus size={16} /> Add Contract
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Contracts" value={total} icon={FileText} color="bg-indigo-500" />
          <StatCard label="Active" value={activeCount} icon={CheckCircle} color="bg-green-500" />
          <StatCard label="Expired" value={expiredCount} icon={AlertCircle} color="bg-red-500" />
          <StatCard label="Pending" value={pendingCount} icon={Clock} color="bg-yellow-500" />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={e => setF('search', e.target.value)}
              placeholder="Search contracts..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
          </div>
          <select value={filters.contractType} onChange={e => setF('contractType', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Types</option>
            {CONTRACT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.status} onChange={e => setF('status', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : contracts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
              <FileText size={28} className="text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No contracts found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filters.search || filters.status || filters.contractType
                ? 'Try adjusting your filters.'
                : 'Click "Add Contract" to create your first contract.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Start Date</th>
                  <th className="px-5 py-3.5">End Date</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {contracts.map(c => (
                  <tr key={c._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {c.employee?.name || c.employee?.firstName || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${TYPE_STYLES[c.contractType] || ''}`}>
                        {c.contractType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      {c.department?.name || '\u2014'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      {fmtDate(c.startDate)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      {fmtDate(c.endDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[c.status] || ''}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditRecord(c)} title="Edit"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                          <Edit3 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Page {page} of {pages} ({total} contracts)
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

      {showCreate && <ContractModal onClose={() => setShowCreate(false)} employees={employees} departments={departments} />}
      {editRecord && <ContractModal initial={editRecord} onClose={() => setEditRecord(null)} employees={employees} departments={departments} />}
    </div>
  );
};

export default EmployeeContractsManagement;
