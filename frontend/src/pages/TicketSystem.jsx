import { useState, useMemo } from 'react';
import {
  MessageSquare, Plus, Search, Edit3, X, AlertTriangle, CheckCircle, Clock, Send, User, Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useAddTicketCommentMutation,
  useDeleteTicketMutation,
} from '../store/adminApiSlice';

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const CATEGORIES = ['Technical', 'Academic', 'Administrative', 'Facilities', 'Other'];

const STATUS_COLORS = {
  Open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'In Progress': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Closed: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
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

const TicketModal = ({ initial, onClose }) => {
  const [form, setForm] = useState({
    subject: initial?.subject || '',
    description: initial?.description || '',
    priority: initial?.priority || 'Medium',
    category: initial?.category || 'Technical',
    assignedTo: initial?.assignedTo || '',
    status: initial?.status || 'Open',
  });

  const [createTicket, { isLoading: creating }] = useCreateTicketMutation();
  const [updateTicket, { isLoading: updating }] = useUpdateTicketMutation();

  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim()) return toast.error('Subject is required');
    try {
      if (isEdit) {
        await updateTicket({ id: initial._id, ...form }).unwrap();
        toast.success('Ticket updated');
      } else {
        await createTicket(form).unwrap();
        toast.success('Ticket created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save ticket');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Ticket' : 'New Ticket'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Subject *</label>
            <input value={form.subject} onChange={e => set('subject', e.target.value)} required
              placeholder="Brief description of the issue"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Description</label>
            <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Detailed description..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
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
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Assigned To</label>
              <input value={form.assignedTo} onChange={e => set('assignedTo', e.target.value)}
                placeholder="Name or ID"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
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
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={creating || updating}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 text-sm font-bold transition-all duration-200 disabled:opacity-50">
              {creating || updating ? 'Saving...' : isEdit ? 'Update Ticket' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CommentModal = ({ ticket, onClose }) => {
  const [comment, setComment] = useState('');
  const [addComment, { isLoading }] = useAddTicketCommentMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error('Comment cannot be empty');
    try {
      await addComment({ id: ticket._id, content: comment }).unwrap();
      toast.success('Comment added');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to add comment');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Add Comment</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Comment</label>
            <textarea rows={4} value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Write your comment..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 text-sm font-bold transition-all duration-200 disabled:opacity-50">
              <Send size={16} /> {isLoading ? 'Sending...' : 'Send Comment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ ticket, onClose }) => {
  const [deleteTicket, { isLoading }] = useDeleteTicketMutation();

  const handleDelete = async () => {
    try {
      await deleteTicket(ticket._id).unwrap();
      toast.success('Ticket deleted');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete ticket');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Delete Ticket</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          Are you sure you want to delete "<span className="font-bold text-slate-700 dark:text-slate-200">{ticket.subject}</span>"?
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

const TicketSystem = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [commentTicket, setCommentTicket] = useState(null);

  const queryArgs = useMemo(() => {
    const q = {};
    if (search) q.search = search;
    if (statusFilter) q.status = statusFilter;
    if (priorityFilter) q.priority = priorityFilter;
    return q;
  }, [search, statusFilter, priorityFilter]);

  const { data, isLoading, refetch } = useGetTicketsQuery(queryArgs);
  const tickets = data?.data || data?.tickets || (Array.isArray(data) ? data : []);

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length,
    critical: tickets.filter(t => t.priority === 'Urgent').length,
  }), [tickets]);

  const statCards = [
    { label: 'Total Open', value: stats.open, icon: MessageSquare, color: 'bg-blue-500' },
    { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'bg-yellow-500' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Critical', value: stats.critical, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <MessageSquare className="text-blue-600" size={28} />
            Ticket System
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage and track support tickets and requests.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <Clock size={16} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 text-sm font-bold transition-all duration-200">
            <Plus size={16} /> New Ticket
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
              placeholder="Search tickets..."
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

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
              <MessageSquare size={28} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No tickets found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {search || statusFilter || priorityFilter ? 'Try adjusting your filters.' : 'Click "New Ticket" to create your first ticket.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Requester</th>
                  <th className="px-6 py-3">Priority</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tickets.map(ticket => (
                  <tr key={ticket._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                      <div className="font-bold">{ticket.subject}</div>
                      {ticket.description && <div className="text-xs text-slate-400 truncate max-w-[200px]">{ticket.description}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <User size={14} className="text-slate-400" />
                        {ticket.requester || ticket.createdBy?.name || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${PRIORITY_COLORS[ticket.priority] || ''}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[ticket.status] || ''}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">{ticket.category || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">{fmtDate(ticket.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setCommentTicket(ticket)} title="Comment"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-colors">
                          <Send size={16} />
                        </button>
                        <button onClick={() => setEditRecord(ticket)} title="Edit"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => setDeleteRecord(ticket)} title="Delete"
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

      {showCreate && <TicketModal onClose={() => setShowCreate(false)} />}
      {editRecord && <TicketModal initial={editRecord} onClose={() => setEditRecord(null)} />}
      {deleteRecord && <DeleteModal ticket={deleteRecord} onClose={() => setDeleteRecord(null)} />}
      {commentTicket && <CommentModal ticket={commentTicket} onClose={() => setCommentTicket(null)} />}
    </div>
  );
};

export default TicketSystem;
