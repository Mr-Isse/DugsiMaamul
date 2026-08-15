import { useState, useMemo } from 'react';
import {
  Calendar, Plus, Search, Edit3, X, Clock, MapPin, Users, CheckCircle, XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetMeetingsQuery,
  useCreateMeetingMutation,
  useUpdateMeetingMutation,
  useDeleteMeetingMutation,
} from '../store/adminApiSlice';

const STATUSES = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];

const STATUS_COLORS = {
  Scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'In Progress': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const fmtTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};

const isToday = (d) => {
  if (!d) return false;
  const date = new Date(d);
  const now = new Date();
  return date.toDateString() === now.toDateString();
};

const MeetingModal = ({ initial, onClose }) => {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    date: initial?.date ? new Date(initial.date).toISOString().split('T')[0] : '',
    startTime: initial?.startTime || '',
    endTime: initial?.endTime || '',
    location: initial?.location || '',
    attendees: initial?.attendees?.join(', ') || '',
    status: initial?.status || 'Scheduled',
  });

  const [createMeeting, { isLoading: creating }] = useCreateMeetingMutation();
  const [updateMeeting, { isLoading: updating }] = useUpdateMeetingMutation();

  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.date) return toast.error('Date is required');
    try {
      const payload = {
        ...form,
        attendees: form.attendees.split(',').map(a => a.trim()).filter(Boolean),
      };
      if (isEdit) {
        await updateMeeting({ id: initial._id, ...payload }).unwrap();
        toast.success('Meeting updated');
      } else {
        await createMeeting(payload).unwrap();
        toast.success('Meeting created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save meeting');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Meeting' : 'New Meeting'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Title *</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} required
              placeholder="Meeting title"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Description</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Meeting description or agenda..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Date *</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Start Time</label>
              <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">End Time</label>
              <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Location</label>
            <input value={form.location} onChange={e => set('location', e.target.value)}
              placeholder="e.g. Conference Room A, Zoom"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Attendees (comma-separated)</label>
            <input value={form.attendees} onChange={e => set('attendees', e.target.value)}
              placeholder="e.g. John, Jane, Bob"
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
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm">
              Cancel
            </button>
            <button type="submit" disabled={creating || updating}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 text-sm font-bold transition-all duration-200 disabled:opacity-50">
              <Calendar size={16} /> {creating || updating ? 'Saving...' : isEdit ? 'Update Meeting' : 'Create Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ meeting, onClose }) => {
  const [deleteMeeting, { isLoading }] = useDeleteMeetingMutation();

  const handleDelete = async () => {
    try {
      await deleteMeeting(meeting._id).unwrap();
      toast.success('Meeting deleted');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete meeting');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <XCircle size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Delete Meeting</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          Are you sure you want to delete "<span className="font-bold text-slate-700 dark:text-slate-200">{meeting.title}</span>"?
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

const MeetingScheduler = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  const queryArgs = useMemo(() => {
    const q = {};
    if (search) q.search = search;
    if (statusFilter) q.status = statusFilter;
    return q;
  }, [search, statusFilter]);

  const { data, isLoading, refetch } = useGetMeetingsQuery(queryArgs);
  const meetings = data?.data || data?.meetings || (Array.isArray(data) ? data : []);

  const stats = useMemo(() => ({
    total: meetings.length,
    upcoming: meetings.filter(m => m.status === 'Scheduled').length,
    today: meetings.filter(m => isToday(m.date)).length,
    completed: meetings.filter(m => m.status === 'Completed').length,
  }), [meetings]);

  const statCards = [
    { label: 'Total', value: stats.total, icon: Calendar, color: 'bg-indigo-500' },
    { label: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'bg-blue-500' },
    { label: 'Today', value: stats.today, icon: MapPin, color: 'bg-amber-500' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'bg-green-500' },
  ];

  const upcomingMeetings = useMemo(() => {
    return meetings
      .filter(m => m.status === 'Scheduled')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 12);
  }, [meetings]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Calendar className="text-indigo-600" size={28} />
            Meeting Scheduler
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Schedule and manage meetings, conferences, and events.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setViewMode(viewMode === 'table' ? 'calendar' : 'table')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <Calendar size={16} /> {viewMode === 'table' ? 'Calendar' : 'Table'}
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 px-4 text-sm font-bold transition-all duration-200">
            <Plus size={16} /> New Meeting
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
              placeholder="Search meetings..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Upcoming Meetings</h3>
          {upcomingMeetings.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">No upcoming meetings</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingMeetings.map(meeting => (
                <div key={meeting._id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setEditRecord(meeting)}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${isToday(meeting.date) ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{fmtDate(meeting.date)}</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">{meeting.title}</h4>
                  {meeting.startTime && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                      <Clock size={12} /> {fmtTime(meeting.startTime)}{meeting.endTime ? ` - ${fmtTime(meeting.endTime)}` : ''}
                    </p>
                  )}
                  {meeting.location && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin size={12} /> {meeting.location}
                    </p>
                  )}
                  {meeting.attendees?.length > 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                      <Users size={12} /> {meeting.attendees.length} attendee{meeting.attendees.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {isLoading ? (
            <TableSkeleton rows={6} columns={7} />
          ) : meetings.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
                <Calendar size={28} className="text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No meetings found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {search || statusFilter ? 'Try adjusting your filters.' : 'Click "New Meeting" to schedule one.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Time</th>
                    <th className="px-6 py-3">Organizer</th>
                    <th className="px-6 py-3">Attendees</th>
                    <th className="px-6 py-3">Location</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {meetings.map(meeting => (
                    <tr key={meeting._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                        <div className="font-bold">{meeting.title}</div>
                        {meeting.description && <div className="text-xs text-slate-400 truncate max-w-[200px]">{meeting.description}</div>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                        <span className={`flex items-center gap-1.5 ${isToday(meeting.date) ? 'text-amber-600 font-bold' : ''}`}>
                          <Calendar size={14} /> {fmtDate(meeting.date)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {meeting.startTime ? `${fmtTime(meeting.startTime)}${meeting.endTime ? ` - ${fmtTime(meeting.endTime)}` : ''}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">{meeting.organizer || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Users size={14} className="text-slate-400" />
                          {meeting.attendees?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} /> {meeting.location || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[meeting.status] || ''}`}>
                          {meeting.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setEditRecord(meeting)} title="Edit"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => setDeleteRecord(meeting)} title="Delete"
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

      {showCreate && <MeetingModal onClose={() => setShowCreate(false)} />}
      {editRecord && <MeetingModal initial={editRecord} onClose={() => setEditRecord(null)} />}
      {deleteRecord && <DeleteModal meeting={deleteRecord} onClose={() => setDeleteRecord(null)} />}
    </div>
  );
};

export default MeetingScheduler;
