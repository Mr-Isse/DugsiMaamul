import { useState, useMemo } from 'react';
import {
  Globe, Plus, Search, Edit3, X, Trash2, Send,
  CheckCircle, XCircle, Activity, Clock, RefreshCw,
} from 'lucide-react';
import { useToast } from '../components/ToastContainer';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetWebhooksQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useTestWebhookMutation,
  useGetWebhookLogsQuery,
  useGetAPIUsageStatsQuery,
} from '../store/adminApiSlice';

const STATUS_COLORS = {
  Active:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Inactive:  'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  Failed:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Error:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const EVENTS = [
  'student.created', 'student.updated', 'student.deleted',
  'attendance.marked', 'exam.created', 'exam.submitted',
  'fee.payment', 'fee.overdue', 'announcement.created',
  'staff.attendance', 'report.generated',
];

const fmtDate = (d) => {
  if (!d) return '\u2014';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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

const WebhookModal = ({ initial, onClose }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    name: initial?.name || '',
    url: initial?.url || '',
    events: initial?.events || [],
    secret: initial?.secret || '',
    enabled: initial?.enabled ?? true,
  });
  const [createWebhook] = useCreateWebhookMutation();
  const [updateWebhook] = useUpdateWebhookMutation();
  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toggleEvent = (evt) => {
    setForm(p => ({
      ...p,
      events: p.events.includes(evt)
        ? p.events.filter(x => x !== evt)
        : [...p.events, evt],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Webhook name is required');
    if (!form.url.trim()) return toast.error('Webhook URL is required');
    if (form.events.length === 0) return toast.error('Select at least one event');
    try {
      if (isEdit) {
        await updateWebhook({ id: initial._id, ...form }).unwrap();
        toast.success('Webhook updated');
      } else {
        await createWebhook(form).unwrap();
        toast.success('Webhook created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save webhook');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit Webhook' : 'New Webhook'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              placeholder="e.g. Student Events Hook"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">URL *</label>
            <input value={form.url} onChange={e => set('url', e.target.value)} required
              placeholder="https://example.com/webhook"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Secret</label>
            <input value={form.secret} onChange={e => set('secret', e.target.value)}
              placeholder="Optional signing secret"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Events *</label>
            <div className="flex flex-wrap gap-2">
              {EVENTS.map(evt => (
                <button key={evt} type="button" onClick={() => toggleEvent(evt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    form.events.includes(evt)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}>
                  {evt}
                </button>
              ))}
            </div>
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
              {isEdit ? 'Update Webhook' : 'Create Webhook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const APIPlatform = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('webhooks');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { data: webhooksData, isLoading: webhooksLoading, refetch: refetchWebhooks } = useGetWebhooksQuery();
  const { data: usageData, isLoading: usageLoading } = useGetAPIUsageStatsQuery();
  const { data: logsData, isLoading: logsLoading } = useGetWebhookLogsQuery({ limit: 10 });
  const [deleteWebhook] = useDeleteWebhookMutation();
  const [testWebhook] = useTestWebhookMutation();

  const webhooks = webhooksData?.data || webhooksData?.webhooks || [];
  const usage = usageData?.data || {};
  const logs = logsData?.data || logsData?.logs || [];

  const stats = useMemo(() => ({
    requestsToday: usage.requestsToday ?? 0,
    requestsWeek: usage.requestsWeek ?? 0,
    requestsMonth: usage.requestsMonth ?? 0,
    errorRate: usage.errorRate ?? '0%',
  }), [usage]);

  const filteredWebhooks = useMemo(() => {
    if (!search) return webhooks;
    const q = search.toLowerCase();
    return webhooks.filter(w =>
      (w.name || '').toLowerCase().includes(q) ||
      (w.url || '').toLowerCase().includes(q)
    );
  }, [webhooks, search]);

  const handleDelete = async (id) => {
    try {
      await deleteWebhook(id).unwrap();
      toast.success('Webhook deleted');
      refetchWebhooks();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete webhook');
    }
  };

  const handleTest = async (id) => {
    try {
      await testWebhook(id).unwrap();
      toast.success('Test webhook sent');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to test webhook');
    }
  };

  const openEdit = (item) => { setEditItem(item); setShowModal(true); };
  const openCreate = () => { setEditItem(null); setShowModal(true); };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Globe className="text-indigo-600" size={28} />
            API Platform
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage webhooks, API usage, and delivery logs.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => { refetchWebhooks(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} />
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold transition-colors text-sm">
            <Plus size={16} /> New Webhook
          </button>
        </div>
      </div>

      {usageLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Requests Today" value={stats.requestsToday.toLocaleString()} icon={Activity} color="bg-blue-500" />
          <StatCard label="This Week" value={stats.requestsWeek.toLocaleString()} icon={Clock} color="bg-indigo-500" />
          <StatCard label="This Month" value={stats.requestsMonth.toLocaleString()} icon={Globe} color="bg-green-500" />
          <StatCard label="Error Rate" value={stats.errorRate} icon={XCircle} color="bg-red-500" />
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => { setActiveTab('webhooks'); setSearch(''); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            activeTab === 'webhooks'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}>
          <Globe size={16} className="inline mr-1.5" /> Webhooks
        </button>
        <button onClick={() => { setActiveTab('logs'); setSearch(''); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            activeTab === 'logs'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}>
          <Clock size={16} className="inline mr-1.5" /> Delivery Logs
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${activeTab === 'webhooks' ? 'webhooks\u2026' : 'logs\u2026'}`}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      {activeTab === 'webhooks' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {webhooksLoading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : filteredWebhooks.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
                <Globe size={28} className="text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No webhooks found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {search ? 'Try adjusting your search.' : 'Click "New Webhook" to create your first webhook.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">URL</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Events</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Triggered</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredWebhooks.map(w => (
                    <tr key={w._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                        <span className="font-bold">{w.name}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded max-w-[200px] block truncate">{w.url}</code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(w.events || []).slice(0, 3).map(evt => (
                            <span key={evt} className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                              {evt}
                            </span>
                          ))}
                          {(w.events || []).length > 3 && (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold">
                              +{(w.events || []).length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${w.enabled ? STATUS_COLORS.Active : STATUS_COLORS.Inactive}`}>
                          {w.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">{fmtDate(w.lastTriggeredAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => handleTest(w._id)} title="Test Webhook"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-colors">
                            <Send size={16} />
                          </button>
                          <button onClick={() => openEdit(w)} title="Edit"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                            <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDelete(w._id)} title="Delete"
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
      )}

      {activeTab === 'logs' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {logsLoading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : logs.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                <Clock size={28} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No delivery logs</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Webhook delivery attempts will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Webhook</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Response Code</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {logs.map((log, i) => (
                    <tr key={log._id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap font-bold">
                        {log.webhookName || log.webhook?.name || '\u2014'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                          {log.event || '\u2014'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[log.status] || STATUS_COLORS.Pending}`}>
                          {log.status || '\u2014'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                        {log.responseCode || log.statusCode || '\u2014'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">{fmtDate(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showModal && <WebhookModal initial={editItem} onClose={() => { setShowModal(false); setEditItem(null); }} />}
    </div>
  );
};

export default APIPlatform;
