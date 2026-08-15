import { useState, useMemo } from 'react';
import {
  Calendar, Plus, Search, CheckCircle, XCircle, Clock,
  AlertCircle, Users, Trash2, Edit, RefreshCw, X,
  FileText, TrendingUp, Download, Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetLeavesQuery,
  useCreateLeaveForEmployeeMutation,
  useUpdateLeaveMutation,
  useApproveLeaveViaAdminMutation,
  useRejectLeaveMutation,
  useDeleteLeaveMutation,
  useGetLeaveStatsQuery,
  useGetTeachersQuery,
} from '../store/adminApiSlice';
import * as XLSX from 'xlsx';

// ── Constants ─────────────────────────────────────────────────────────────────
const LEAVE_TYPES = ['Annual','Sick','Maternity','Paternity','Casual','Unpaid','Compensatory','Emergency','Study','Other'];
const MONTHS = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const STATUS_STYLES = {
  Pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Approved:  'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
  Rejected:  'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
  Cancelled: 'bg-slate-100  text-slate-600  dark:bg-slate-800     dark:text-slate-400',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';

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

// ── Leave Form Modal ──────────────────────────────────────────────────────────
const LeaveModal = ({ initial, onClose }) => {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState({
    userId: initial?.user?._id || '',
    leaveType: initial?.leaveType || 'Annual',
    startDate: initial?.startDate ? initial.startDate.split('T')[0] : '',
    endDate: initial?.endDate ? initial.endDate.split('T')[0] : '',
    reason: initial?.reason || '',
    isHalfDay: initial?.isHalfDay || false,
    halfDayPart: initial?.halfDayPart || 'morning',
    isPaid: initial?.isPaid !== false,
  });

  const { data: teachersData } = useGetTeachersQuery();
  const [createLeave, { isLoading: creating }] = useCreateLeaveForEmployeeMutation();
  const [updateLeave, { isLoading: updating }]  = useUpdateLeaveMutation();
  const teachers = teachersData || [];
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.userId && !isEdit) return toast.error('Select an employee');
    if (!form.startDate || !form.endDate) return toast.error('Start and end dates are required');
    if (new Date(form.endDate) < new Date(form.startDate)) return toast.error('End date cannot be before start date');
    if (!form.reason.trim()) return toast.error('Reason is required');

    try {
      if (isEdit) {
        await updateLeave({ id: initial._id, ...form }).unwrap();
        toast.success('Leave updated');
      } else {
        await createLeave(form).unwrap();
        toast.success('Leave created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save leave');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Leave Request' : 'New Leave Request'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isEdit && (
            <div>
              <label className="block text-sm font-bold mb-1">Employee *</label>
              <select value={form.userId} onChange={e => set('userId', e.target.value)} required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                <option value="">Select employee…</option>
                {teachers.map(t => (
                  <option key={t._id} value={t._id}>{t.name} ({t.customId || t.role})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-1">Leave Type *</label>
            <select value={form.leaveType} onChange={e => set('leaveType', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
              {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Start Date *</label>
              <input type="date" required value={form.startDate} onChange={e => set('startDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">End Date *</label>
              <input type="date" required value={form.endDate} onChange={e => set('endDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
              <input type="checkbox" checked={form.isHalfDay} onChange={e => set('isHalfDay', e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600" />
              Half Day
            </label>
            {form.isHalfDay && (
              <select value={form.halfDayPart} onChange={e => set('halfDayPart', e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">Reason *</label>
            <textarea rows={3} required value={form.reason} onChange={e => set('reason', e.target.value)}
              placeholder="Reason for leave…"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 resize-none" />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold">
              <input type="checkbox" checked={form.isPaid} onChange={e => set('isPaid', e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600" />
              Paid Leave
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={creating || updating}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {creating || updating ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Reject Modal ──────────────────────────────────────────────────────────────
const RejectModal = ({ leaveId, onClose }) => {
  const [reason, setReason] = useState('');
  const [rejectLeave, { isLoading }] = useRejectLeaveMutation();

  const handleReject = async () => {
    if (!reason.trim()) return toast.error('Rejection reason is required');
    try {
      await rejectLeave({ id: leaveId, reviewNote: reason }).unwrap();
      toast.success('Leave rejected');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to reject');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <h2 className="text-xl font-black mb-4 text-slate-900 dark:text-white">Reject Leave</h2>
        <textarea rows={3} value={reason} onChange={e => setReason(e.target.value)}
          placeholder="Enter rejection reason…"
          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-red-500 resize-none mb-4" />
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
            Cancel
          </button>
          <button onClick={handleReject} disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
            {isLoading ? 'Rejecting…' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const LeaveManagement = () => {
  const [filters, setFilters] = useState({ status: '', leaveType: '', year: String(CURRENT_YEAR), search: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord]  = useState(null);
  const [rejectId, setRejectId]      = useState(null);

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v }));

  const queryArgs = useMemo(() => {
    const q = {};
    if (filters.status)    q.status    = filters.status;
    if (filters.leaveType) q.leaveType = filters.leaveType;
    if (filters.year)      q.year      = filters.year;
    return q;
  }, [filters]);

  const { data, isLoading, refetch } = useGetLeavesQuery(queryArgs);
  const { data: statsData }          = useGetLeaveStatsQuery({ year: filters.year });
  const [approveLeave]               = useApproveLeaveViaAdminMutation();
  const [deleteLeave]                = useDeleteLeaveMutation();

  const records  = data?.data || [];
  const statsByStatus = statsData?.data?.byStatus || [];

  const getStat = (status) => statsByStatus.find(s => s._id === status);
  const pendingCount  = getStat('Pending')?.count  || 0;
  const approvedCount = getStat('Approved')?.count || 0;
  const rejectedCount = getStat('Rejected')?.count || 0;
  const totalDays     = statsByStatus.reduce((sum, s) => sum + (s.totalDays || 0), 0);

  const filtered = useMemo(() => {
    if (!filters.search) return records;
    const q = filters.search.toLowerCase();
    return records.filter(r =>
      r.user?.name?.toLowerCase().includes(q) ||
      r.leaveType?.toLowerCase().includes(q) ||
      r.reason?.toLowerCase().includes(q)
    );
  }, [records, filters.search]);

  const handleApprove = async (id) => {
    try {
      await approveLeave({ id }).unwrap();
      toast.success('Leave approved');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to approve');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this leave request?')) return;
    try {
      await deleteLeave(id).unwrap();
      toast.success('Leave request deleted');
    } catch (err) {
      toast.error(err?.data?.message || 'Cannot delete');
    }
  };

  const handleExport = () => {
    if (!filtered.length) return toast.error('No data to export');
    const rows = filtered.map(r => ({
      Employee: r.user?.name || '—',
      'Employee ID': r.user?.customId || '—',
      'Leave Type': r.leaveType,
      'Start Date': fmtDate(r.startDate),
      'End Date': fmtDate(r.endDate),
      'Total Days': r.totalDays,
      Reason: r.reason,
      Status: r.status,
      'Applied On': fmtDate(r.createdAt),
      'Reviewed By': r.approvedBy?.name || r.rejectedBy?.name || '—',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Requests');
    XLSX.writeFile(wb, `leave-requests-${filters.year}.xlsx`);
    toast.success('Exported successfully');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Calendar className="text-indigo-600" size={28} />
            Leave Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage employee leave requests and approvals.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <Download size={16} /> Export
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
            <Plus size={16} /> New Leave
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
          <StatCard label="Pending"   value={pendingCount}  icon={Clock}        color="bg-yellow-500" />
          <StatCard label="Approved"  value={approvedCount} icon={CheckCircle}  color="bg-green-500"  />
          <StatCard label="Rejected"  value={rejectedCount} icon={XCircle}      color="bg-red-500"    />
          <StatCard label="Total Days Taken" value={totalDays.toFixed(1)} icon={TrendingUp} color="bg-indigo-500" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={e => setF('search', e.target.value)}
              placeholder="Search employee, type or reason…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
          </div>
          <select value={filters.status} onChange={e => setF('status', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Statuses</option>
            {['Pending','Approved','Rejected','Cancelled'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={filters.leaveType} onChange={e => setF('leaveType', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Types</option>
            {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={filters.year} onChange={e => setF('year', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
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
          <TableSkeleton rows={6} columns={7} />
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
              <Calendar size={28} className="text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No leave requests found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Adjust filters or create a new leave request.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Duration</th>
                  <th className="px-5 py-3.5">Days</th>
                  <th className="px-5 py-3.5">Reason</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{r.user?.name || '—'}</div>
                      <div className="text-xs text-slate-400">{r.user?.customId || r.user?.role || ''}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400">
                        {r.leaveType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      <div>{fmtDate(r.startDate)}</div>
                      <div className="text-xs text-slate-400">→ {fmtDate(r.endDate)}</div>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {r.totalDays}
                      {r.isHalfDay && <span className="text-xs text-slate-400 ml-1">(½)</span>}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400 max-w-[200px] truncate" title={r.reason}>
                      {r.reason}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[r.status] || ''}`}>
                        {r.status}
                      </span>
                      {r.reviewNote && (
                        <div className="text-xs text-slate-400 mt-1 truncate max-w-[120px]" title={r.reviewNote}>
                          {r.reviewNote}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status === 'Pending' && (
                          <>
                            <button onClick={() => handleApprove(r._id)} title="Approve"
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-colors">
                              <CheckCircle size={16} />
                            </button>
                            <button onClick={() => setRejectId(r._id)} title="Reject"
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors">
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        {r.status === 'Pending' && (
                          <button onClick={() => setEditRecord(r)} title="Edit"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                            <Edit size={16} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(r._id)} title="Delete"
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

      {/* Modals */}
      {showCreate  && <LeaveModal onClose={() => setShowCreate(false)} />}
      {editRecord  && <LeaveModal initial={editRecord} onClose={() => setEditRecord(null)} />}
      {rejectId    && <RejectModal leaveId={rejectId} onClose={() => setRejectId(null)} />}
    </div>
  );
};

export default LeaveManagement;
