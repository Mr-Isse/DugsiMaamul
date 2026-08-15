import { useState, useMemo } from 'react';
import {
  Zap, Plus, Search, Edit3, X, Play, Pause,
  Clock, RefreshCw, CheckCircle, AlertTriangle,
} from 'lucide-react';
import { useToast } from '../components/ToastContainer';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetScheduledJobsQuery,
  useCreateScheduledJobMutation,
  useUpdateScheduledJobMutation,
  useDeleteScheduledJobMutation,
  useToggleScheduledJobMutation,
  useRunScheduledJobNowMutation,
  useGetAutomationLogsQuery,
} from '../store/adminApiSlice';

const JOB_TYPES = ['Notification', 'Report', 'Cleanup', 'Sync', 'Backup'];

const STATUS_COLORS = {
  Active:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  Failed:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Running:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
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

const JobModal = ({ initial, onClose }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    name: initial?.name || '',
    type: initial?.type || 'Notification',
    cronExpression: initial?.cronExpression || '',
    enabled: initial?.enabled ?? true,
  });
  const [createJob] = useCreateScheduledJobMutation();
  const [updateJob] = useUpdateScheduledJobMutation();
  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Job name is required');
    if (!form.cronExpression.trim()) return toast.error('Cron expression is required');
    try {
      if (isEdit) {
        await updateJob({ id: initial._id, ...form }).unwrap();
        toast.success('Job updated');
      } else {
        await createJob(form).unwrap();
        toast.success('Job created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save job');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Job' : 'New Job'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Job Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              placeholder="e.g. Daily Backup"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Cron Expression *</label>
            <input value={form.cronExpression} onChange={e => set('cronExpression', e.target.value)} required
              placeholder="e.g. 0 2 * * *"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => set('enabled', !form.enabled)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.enabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form.enabled ? 'translate-x-5' : ''}`} />
            </button>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Enabled</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {isEdit ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AutomationEngine = () => {
  const toast = useToast();
  const [filters, setFilters] = useState({ search: '' });
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v }));

  const queryArgs = useMemo(() => {
    const q = {};
    if (filters.search) q.search = filters.search;
    return q;
  }, [filters]);

  const { data, isLoading, refetch } = useGetScheduledJobsQuery(queryArgs);
  const { data: logsData } = useGetAutomationLogsQuery({ limit: 10 });
  const [deleteJob] = useDeleteScheduledJobMutation();
  const [toggleJob] = useToggleScheduledJobMutation();
  const [runNow] = useRunScheduledJobNowMutation();

  const jobs = data?.data || data?.jobs || [];
  const logs = logsData?.data || logsData?.logs || [];

  const stats = useMemo(() => {
    const total = jobs.length;
    const active = jobs.filter(j => j.enabled).length;
    const runs24h = jobs.reduce((s, j) => s + (j.runsLast24h || 0), 0);
    const failed = jobs.filter(j => j.status === 'Failed').length;
    return { total, active, runs24h, failed };
  }, [jobs]);

  const handleToggle = async (id) => {
    try {
      await toggleJob(id).unwrap();
      toast.success('Job toggled');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to toggle job');
    }
  };

  const handleRunNow = async (id) => {
    try {
      await runNow(id).unwrap();
      toast.success('Job started');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to run job');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteJob(id).unwrap();
      toast.success('Job deleted');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete job');
    }
  };

  const openEdit = (item) => { setEditItem(item); setShowModal(true); };
  const openCreate = () => { setEditItem(null); setShowModal(true); };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Zap className="text-indigo-600" size={28} />
            Automation Engine
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Schedule and manage automated jobs, reports, and system tasks.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} />
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
            <Plus size={16} /> New Job
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Jobs" value={stats.total} icon={Zap} color="bg-indigo-500" />
          <StatCard label="Active" value={stats.active} icon={Play} color="bg-green-500" />
          <StatCard label="Last 24h Runs" value={stats.runs24h} icon={RefreshCw} color="bg-blue-500" />
          <StatCard label="Failed Jobs" value={stats.failed} icon={AlertTriangle} color="bg-red-500" />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={e => setF('search', e.target.value)}
              placeholder="Search jobs\u2026"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : jobs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
              <Zap size={28} className="text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No jobs found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filters.search
                ? 'Try adjusting your search.'
                : 'Click "New Job" to create your first scheduled job.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Run</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Next Run</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {jobs.map(job => (
                  <tr key={job._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{job.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{job.type}</td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                        {job.cronExpression}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{fmtDate(job.lastRun)}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{fmtDate(job.nextRun)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${job.enabled ? STATUS_COLORS.Active : STATUS_COLORS.Inactive}`}>
                        {job.enabled ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleRunNow(job._id)} title="Run Now"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
                          <Play size={14} />
                        </button>
                        <button onClick={() => handleToggle(job._id)} title={job.enabled ? 'Pause' : 'Enable'}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors">
                          {job.enabled ? <Pause size={14} /> : <Play size={14} />}
                        </button>
                        <button onClick={() => openEdit(job)} title="Edit"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(job._id)} title="Delete"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <X size={14} />
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

      {logs.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={18} /> Recent Automation Logs
          </h2>
          <div className="space-y-2">
            {logs.map((log, i) => (
              <div key={log._id || i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                {log.status === 'success'
                  ? <CheckCircle size={16} className="text-green-500" />
                  : <AlertTriangle size={16} className="text-red-500" />}
                <div className="flex-1">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{log.jobName || log.name}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">{log.message}</span>
                </div>
                <span className="text-xs text-slate-400">{fmtDate(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && <JobModal initial={editItem} onClose={() => { setShowModal(false); setEditItem(null); }} />}
    </div>
  );
};

export default AutomationEngine;
