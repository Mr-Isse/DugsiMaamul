import { useState, useMemo } from 'react';
import {
  AlertTriangle, Plus, Search, Edit3, X, CheckCircle, Clock, User, MessageSquare, Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetComplaintsQuery,
  useCreateComplaintMutation,
  useUpdateComplaintMutation,
} from '../store/adminApiSlice';

const STATUSES = ['Open', 'Under Review', 'Resolved', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const CATEGORIES = ['Academic', 'Facilities', 'Staff', 'Transport', 'Food', 'Other'];

const STATUS_COLORS = {
  Open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Under Review': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Closed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const PRIORITY_COLORS = {
  Low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const ComplaintModal = ({ initial, onClose }) => {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    category: initial?.category || 'Academic',
    priority: initial?.priority || 'Medium',
    status: initial?.status || 'Open',
  });

  const [createComplaint, { isLoading: creating }] = useCreateComplaintMutation();
  const [updateComplaint, { isLoading: updating }] = useUpdateComplaintMutation();

  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    try {
      if (isEdit) {
        await updateComplaint({ id: initial._id, ...form }).unwrap();
        toast.success('Complaint updated');
      } else {
        await createComplaint(form).unwrap();
        toast.success('Complaint created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save complaint');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Complaint' : 'New Complaint'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required
              placeholder="Brief title of the complaint"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Description</label>
            <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Describe the complaint in detail..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          {isEdit && (
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={creating || updating}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 text-sm font-bold transition-all duration-200 disabled:opacity-50">
              {creating || updating ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ComplaintManagement = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const queryArgs = useMemo(() => {
    const q = {};
    if (search) q.search = search;
    if (statusFilter) q.status = statusFilter;
    return q;
  }, [search, statusFilter]);

  const { data, isLoading, refetch } = useGetComplaintsQuery(queryArgs);
  const complaints = data?.data || data?.complaints || (Array.isArray(data) ? data : []);

  const [updateComplaint] = useUpdateComplaintMutation();

  const stats = useMemo(() => ({
    total: complaints.length,
    open: complaints.filter(c => c.status === 'Open').length,
    underReview: complaints.filter(c => c.status === 'Under Review').length,
    resolved: complaints.filter(c => c.status === 'Resolved').length,
  }), [complaints]);

  const statCards = [
    { label: 'Total', value: stats.total, icon: AlertTriangle, color: 'bg-indigo-500' },
    { label: 'Open', value: stats.open, icon: MessageSquare, color: 'bg-blue-500' },
    { label: 'Under Review', value: stats.underReview, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'bg-green-500' },
  ];

  const handleStatusUpdate = async (complaint, newStatus) => {
    try {
      await updateComplaint({ id: complaint._id, status: newStatus }).unwrap();
      toast.success(`Complaint marked as ${newStatus}`);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <AlertTriangle className="text-red-600" size={28} />
            Complaint Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Track and resolve complaints from students, parents, and staff.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <Clock size={16} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 text-sm font-bold transition-all duration-200">
            <Plus size={16} /> New Complaint
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
                <s.icon size={22} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{s.label}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search complaints..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No complaints found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {search || statusFilter ? 'Try adjusting your filters.' : 'Click "New Complaint" to submit one.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Submitted By</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {complaints.map(complaint => (
                  <tr key={complaint._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                      <div className="font-bold">{complaint.title}</div>
                      {complaint.description && <div className="text-xs text-slate-400 truncate max-w-[200px]">{complaint.description}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <User size={14} className="text-slate-400" />
                        {complaint.submittedBy || complaint.createdBy?.name || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">{complaint.category || '—'}</td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[complaint.status] || ''}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${PRIORITY_COLORS[complaint.priority] || ''}`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{fmtDate(complaint.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {complaint.status === 'Open' && (
                          <button onClick={() => handleStatusUpdate(complaint, 'Under Review')}
                            className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 hover:opacity-80 transition-opacity">
                            Review
                          </button>
                        )}
                        {complaint.status === 'Under Review' && (
                          <button onClick={() => handleStatusUpdate(complaint, 'Resolved')}
                            className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:opacity-80 transition-opacity">
                            Resolve
                          </button>
                        )}
                        <button onClick={() => setEditRecord(complaint)} title="Edit"
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
      </div>

      {showCreate && <ComplaintModal onClose={() => setShowCreate(false)} />}
      {editRecord && <ComplaintModal initial={editRecord} onClose={() => setEditRecord(null)} />}
    </div>
  );
};

export default ComplaintManagement;
