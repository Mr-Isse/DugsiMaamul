import { useState, useMemo } from 'react';
import {
  AlertTriangle, Plus, Search, Edit3, X, Shield, Clock, CheckCircle, User, Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetIncidentsQuery,
  useCreateIncidentMutation,
  useUpdateIncidentMutation,
  useDeleteIncidentMutation,
} from '../store/adminApiSlice';

const STATUSES = ['Open', 'Investigating', 'Resolved', 'Closed'];
const TYPES = ['Safety', 'Disciplinary', 'Technical', 'Medical', 'Security'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

const STATUS_COLORS = {
  Open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Investigating: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Closed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const SEVERITY_COLORS = {
  Low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const IncidentModal = ({ initial, onClose }) => {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    type: initial?.type || 'Safety',
    severity: initial?.severity || 'Medium',
    reportedBy: initial?.reportedBy || '',
    actionsTaken: initial?.actionsTaken || '',
    status: initial?.status || 'Open',
  });

  const [createIncident, { isLoading: creating }] = useCreateIncidentMutation();
  const [updateIncident, { isLoading: updating }] = useUpdateIncidentMutation();

  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    try {
      if (isEdit) {
        await updateIncident({ id: initial._id, ...form }).unwrap();
        toast.success('Incident updated');
      } else {
        await createIncident(form).unwrap();
        toast.success('Incident reported');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save incident');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Incident' : 'Report Incident'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required
              placeholder="Brief incident title"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Description</label>
            <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Detailed description of the incident..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Severity</label>
              <select value={form.severity} onChange={e => set('severity', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Reported By</label>
            <input value={form.reportedBy} onChange={e => set('reportedBy', e.target.value)}
              placeholder="Name of the reporter"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Actions Taken</label>
            <textarea rows={3} value={form.actionsTaken} onChange={e => set('actionsTaken', e.target.value)}
              placeholder="What actions have been taken so far?"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
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
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 text-sm font-bold transition-all duration-200 disabled:opacity-50">
              <AlertTriangle size={16} /> {creating || updating ? 'Saving...' : isEdit ? 'Update' : 'Report Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ incident, onClose }) => {
  const [deleteIncident, { isLoading }] = useDeleteIncidentMutation();

  const handleDelete = async () => {
    try {
      await deleteIncident(incident._id).unwrap();
      toast.success('Incident deleted');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete incident');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Delete Incident</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          Are you sure you want to delete "<span className="font-bold text-slate-700 dark:text-slate-200">{incident.title}</span>"?
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors text-sm">
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const IncidentManagement = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const queryArgs = useMemo(() => {
    const q = {};
    if (search) q.search = search;
    if (statusFilter) q.status = statusFilter;
    if (typeFilter) q.type = typeFilter;
    return q;
  }, [search, statusFilter, typeFilter]);

  const { data, isLoading, refetch } = useGetIncidentsQuery(queryArgs);
  const incidents = data?.data || data?.incidents || (Array.isArray(data) ? data : []);

  const stats = useMemo(() => ({
    total: incidents.length,
    open: incidents.filter(i => i.status === 'Open').length,
    investigating: incidents.filter(i => i.status === 'Investigating').length,
    resolved: incidents.filter(i => i.status === 'Resolved').length,
  }), [incidents]);

  const statCards = [
    { label: 'Total', value: stats.total, icon: AlertTriangle, color: 'bg-indigo-500' },
    { label: 'Open', value: stats.open, icon: Shield, color: 'bg-blue-500' },
    { label: 'Investigating', value: stats.investigating, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'bg-green-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Shield className="text-red-600" size={28} />
            Incident Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Track and manage safety, security, and disciplinary incidents.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <Clock size={16} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 text-sm font-bold transition-all duration-200">
            <Plus size={16} /> Report Incident
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
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
              placeholder="Search incidents..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Types</option>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : incidents.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-4">
              <Shield size={28} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No incidents found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {search || statusFilter || typeFilter ? 'Try adjusting your filters.' : 'Click "Report Incident" to submit one.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Severity</th>
                  <th className="px-6 py-3">Reported By</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {incidents.map(incident => (
                  <tr key={incident._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                      <div className="font-bold">{incident.title}</div>
                      {incident.description && <div className="text-xs text-slate-400 truncate max-w-[200px]">{incident.description}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">{incident.type || '—'}</td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${SEVERITY_COLORS[incident.severity] || ''}`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <User size={14} className="text-slate-400" />
                        {incident.reportedBy || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[incident.status] || ''}`}>
                        {incident.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{fmtDate(incident.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditRecord(incident)} title="Edit"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => setDeleteRecord(incident)} title="Delete"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors">
                          <X size={16} />
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

      {showCreate && <IncidentModal onClose={() => setShowCreate(false)} />}
      {editRecord && <IncidentModal initial={editRecord} onClose={() => setEditRecord(null)} />}
      {deleteRecord && <DeleteModal incident={deleteRecord} onClose={() => setDeleteRecord(null)} />}
    </div>
  );
};

export default IncidentManagement;
