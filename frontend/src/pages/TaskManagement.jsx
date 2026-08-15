import { useState, useMemo } from 'react';
import {
  CheckSquare, Plus, Search, Edit3, X, Calendar, User, AlertTriangle, CheckCircle, Clock, Filter, LayoutGrid, List,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from '../store/adminApiSlice';

const STATUSES = ['To Do', 'In Progress', 'In Review', 'Done'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const CATEGORIES = ['Academic', 'Administrative', 'Technical', 'Facilities', 'Other'];

const STATUS_COLORS = {
  'To Do': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'In Review': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const PRIORITY_COLORS = {
  Low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  High: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const isOverdue = (d) => {
  if (!d) return false;
  return new Date(d) < new Date();
};

const TaskModal = ({ initial, onClose }) => {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    assignedTo: initial?.assignedTo || '',
    priority: initial?.priority || 'Medium',
    status: initial?.status || 'To Do',
    dueDate: initial?.dueDate ? new Date(initial.dueDate).toISOString().split('T')[0] : '',
    category: initial?.category || 'Academic',
  });

  const [createTask, { isLoading: creating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: updating }] = useUpdateTaskMutation();

  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    try {
      if (isEdit) {
        await updateTask({ id: initial._id, ...form }).unwrap();
        toast.success('Task updated');
      } else {
        await createTask(form).unwrap();
        toast.success('Task created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save task');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required
              placeholder="Task title"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Description</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Task description..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Assigned To</label>
              <input value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)}
                placeholder="Assignee name"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={creating || updating}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 text-sm font-bold transition-all duration-200 disabled:opacity-50">
              {creating || updating ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ task, onClose }) => {
  const [deleteTask, { isLoading }] = useDeleteTaskMutation();

  const handleDelete = async () => {
    try {
      await deleteTask(task._id).unwrap();
      toast.success('Task deleted');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete task');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Delete Task</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          Are you sure you want to delete "<span className="font-bold text-slate-700 dark:text-slate-200">{task.title}</span>"?
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

const KanbanBoard = ({ tasks, onEdit }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {STATUSES.map(status => {
        const statusTasks = tasks.filter(t => t.status === status);
        return (
          <div key={status} className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[status]}`}>{status}</span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{statusTasks.length}</span>
              </div>
            </div>
            {statusTasks.map(task => (
              <div key={task._id}
                onClick={() => onEdit(task)}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 cursor-pointer hover:shadow-md transition-shadow space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{task.title}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${PRIORITY_COLORS[task.priority] || ''}`}>
                    {task.priority}
                  </span>
                </div>
                {task.assignedTo && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <User size={12} /> {task.assignedTo}
                  </p>
                )}
                {task.dueDate && (
                  <p className={`text-xs flex items-center gap-1 ${isOverdue(task.dueDate) && task.status !== 'Done' ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                    <Calendar size={12} /> {fmtDate(task.dueDate)}
                  </p>
                )}
              </div>
            ))}
            {statusTasks.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">No tasks</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const TaskManagement = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  const queryArgs = useMemo(() => {
    const q = {};
    if (search) q.search = search;
    if (statusFilter) q.status = statusFilter;
    if (priorityFilter) q.priority = priorityFilter;
    return q;
  }, [search, statusFilter, priorityFilter]);

  const { data, isLoading, refetch } = useGetTasksQuery(queryArgs);
  const tasks = data?.data || data?.tasks || (Array.isArray(data) ? data : []);

  const stats = useMemo(() => ({
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Done').length,
    overdue: tasks.filter(t => isOverdue(t.dueDate) && t.status !== 'Done').length,
  }), [tasks]);

  const statCards = [
    { label: 'Total Tasks', value: stats.total, icon: CheckSquare, color: 'bg-indigo-500' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'bg-blue-500' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <CheckSquare className="text-green-600" size={28} />
            Task Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Track and manage tasks across your team.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setViewMode(viewMode === 'table' ? 'kanban' : 'table')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            {viewMode === 'table' ? <LayoutGrid size={16} /> : <List size={16} />}
            {viewMode === 'table' ? 'Kanban' : 'Table'}
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 text-sm font-bold transition-all duration-200">
            <Plus size={16} /> New Task
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
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        isLoading ? (
          <TableSkeleton rows={3} columns={4} />
        ) : (
          <KanbanBoard tasks={tasks} onEdit={setEditRecord} />
        )
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {isLoading ? (
            <TableSkeleton rows={6} columns={6} />
          ) : tasks.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4">
                <CheckSquare size={28} className="text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No tasks found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {search || statusFilter || priorityFilter ? 'Try adjusting your filters.' : 'Click "New Task" to create your first task.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Assigned To</th>
                    <th className="px-6 py-3">Priority</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Due Date</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tasks.map(task => (
                    <tr key={task._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                        <div className="font-bold">{task.title}</div>
                        {task.description && <div className="text-xs text-slate-400 truncate max-w-[200px]">{task.description}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <User size={14} className="text-slate-400" />
                          {task.assignedTo || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${PRIORITY_COLORS[task.priority] || ''}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[task.status] || ''}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <span className={`flex items-center gap-1.5 ${isOverdue(task.dueDate) && task.status !== 'Done' ? 'text-red-500 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                          <Calendar size={14} /> {fmtDate(task.dueDate)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">{task.category || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setEditRecord(task)} title="Edit"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => setDeleteRecord(task)} title="Delete"
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
      )}

      {showCreate && <TaskModal onClose={() => setShowCreate(false)} />}
      {editRecord && <TaskModal initial={editRecord} onClose={() => setEditRecord(null)} />}
      {deleteRecord && <DeleteModal task={deleteRecord} onClose={() => setDeleteRecord(null)} />}
    </div>
  );
};

export default TaskManagement;
