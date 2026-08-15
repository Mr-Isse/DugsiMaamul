import { useState, useMemo } from 'react';
import {
  Workflow, Plus, Search, Edit3, X, Play, Pause,
  CheckCircle, XCircle, Clock,
} from 'lucide-react';
import { useToast } from '../components/ToastContainer';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetWorkflowsQuery,
  useCreateWorkflowMutation,
  useUpdateWorkflowMutation,
  useDeleteWorkflowMutation,
  useGetWorkflowInstancesQuery,
  useApproveWorkflowStepMutation,
  useRejectWorkflowStepMutation,
} from '../store/adminApiSlice';

const STATUS_COLORS = {
  Active:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  Draft:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
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

const WorkflowModal = ({ initial, onClose }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    status: initial?.status || 'Draft',
    steps: initial?.steps?.length ? initial.steps.join(', ') : '',
  });
  const [createWorkflow] = useCreateWorkflowMutation();
  const [updateWorkflow] = useUpdateWorkflowMutation();
  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Workflow name is required');
    const payload = {
      name: form.name,
      description: form.description,
      status: form.status,
      steps: form.steps.split(',').map(s => s.trim()).filter(Boolean),
    };
    try {
      if (isEdit) {
        await updateWorkflow({ id: initial._id, ...payload }).unwrap();
        toast.success('Workflow updated');
      } else {
        await createWorkflow(payload).unwrap();
        toast.success('Workflow created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save workflow');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Workflow' : 'New Workflow'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Workflow Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              placeholder="e.g. Leave Approval Process"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Description</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Steps (comma-separated)</label>
            <input value={form.steps} onChange={e => set('steps', e.target.value)}
              placeholder="e.g. Submit, Manager Review, HR Approval"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {isEdit ? 'Update Workflow' : 'Create Workflow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WorkflowManagement = () => {
  const toast = useToast();
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v }));

  const queryArgs = useMemo(() => {
    const q = {};
    if (filters.search) q.search = filters.search;
    if (filters.status) q.status = filters.status;
    return q;
  }, [filters]);

  const { data, isLoading, refetch } = useGetWorkflowsQuery(queryArgs);
  const [deleteWorkflow] = useDeleteWorkflowMutation();
  const [approveStep] = useApproveWorkflowStepMutation();
  const [rejectStep] = useRejectWorkflowStepMutation();

  const workflows = data?.data || data?.workflows || [];

  const stats = useMemo(() => {
    const total = workflows.length;
    const active = workflows.filter(w => w.status === 'Active').length;
    const completed = workflows.reduce((s, w) => s + (w.completedInstances || 0), 0);
    const pending = workflows.reduce((s, w) => s + (w.pendingApprovals || 0), 0);
    return { total, active, completed, pending };
  }, [workflows]);

  const handleDelete = async (id) => {
    try {
      await deleteWorkflow(id).unwrap();
      toast.success('Workflow deleted');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete workflow');
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setShowModal(true);
  };

  const openCreate = () => {
    setEditItem(null);
    setShowModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Workflow className="text-indigo-600" size={28} />
            Workflow Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Create and manage automated workflow templates and approvals.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} />
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
            <Plus size={16} /> New Workflow
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Workflows" value={stats.total} icon={Workflow} color="bg-indigo-500" />
          <StatCard label="Active" value={stats.active} icon={Play} color="bg-green-500" />
          <StatCard label="Completed Instances" value={stats.completed} icon={CheckCircle} color="bg-blue-500" />
          <StatCard label="Pending Approvals" value={stats.pending} icon={Clock} color="bg-yellow-500" />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={e => setF('search', e.target.value)}
              placeholder="Search workflows\u2026"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={filters.status} onChange={e => setF('status', e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Statuses</option>
            {['Active', 'Inactive', 'Draft'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : workflows.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
              <Workflow size={28} className="text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No workflows found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filters.search || filters.status
                ? 'Try adjusting your filters.'
                : 'Click "New Workflow" to create your first workflow.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Steps</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Run</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {workflows.map(wf => (
                  <tr key={wf._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white">{wf.name}</div>
                      {wf.description && (
                        <div className="text-xs text-slate-400 mt-0.5">{wf.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                      {wf.steps?.length || 0} steps
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[wf.status] || ''}`}>
                        {wf.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                      {fmtDate(wf.lastRun)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">
                      {fmtDate(wf.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEdit(wf)} title="Edit"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(wf._id)} title="Delete"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <XCircle size={14} />
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

      {showModal && <WorkflowModal initial={editItem} onClose={() => { setShowModal(false); setEditItem(null); }} />}
    </div>
  );
};

export default WorkflowManagement;
