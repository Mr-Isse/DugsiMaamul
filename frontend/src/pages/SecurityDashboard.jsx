import { useState, useMemo } from 'react';
import {
  Shield, Plus, Search, Trash2, X, Monitor, Smartphone,
  Key, AlertTriangle, CheckCircle, Eye, Clock,
} from 'lucide-react';
import { useToast } from '../components/ToastContainer';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetActiveSessionsQuery,
  useRevokeSessionMutation,
  useRevokeAllSessionsMutation,
  useGetAPITokensQuery,
  useCreateAPITokenMutation,
  useRevokeAPITokenMutation,
  useDeleteAPITokenMutation,
  useGetSecurityDashboardQuery,
} from '../store/adminApiSlice';

const STATUS_COLORS = {
  Active:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Online:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Offline: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  Expired: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Failed:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

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

const PERMISSIONS = ['read', 'write', 'delete', 'admin', 'users', 'reports', 'settings'];
const EXPIRY_OPTIONS = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
  { label: '1 year', value: '365d' },
  { label: 'Never', value: 'never' },
];

const CreateTokenModal = ({ onClose }) => {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', permissions: [], expiration: '30d' });
  const [createToken, { isLoading }] = useCreateAPITokenMutation();
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const togglePermission = (perm) => {
    setForm(p => ({
      ...p,
      permissions: p.permissions.includes(perm)
        ? p.permissions.filter(x => x !== perm)
        : [...p.permissions, perm],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Token name is required');
    if (form.permissions.length === 0) return toast.error('Select at least one permission');
    try {
      await createToken({ name: form.name, permissions: form.permissions, expiresIn: form.expiration }).unwrap();
      toast.success('API token created successfully');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create token');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Create API Token</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Token Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              placeholder="e.g. Production Token"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Permissions *</label>
            <div className="flex flex-wrap gap-2">
              {PERMISSIONS.map(p => (
                <button key={p} type="button" onClick={() => togglePermission(p)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-colors ${
                    form.permissions.includes(p)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">Expiration</label>
            <select value={form.expiration} onChange={e => set('expiration', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {EXPIRY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {isLoading ? 'Creating\u2026' : 'Create Token'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SecurityDashboard = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('sessions');
  const [search, setSearch] = useState('');
  const [showCreateToken, setShowCreateToken] = useState(false);

  const { data: dashData, isLoading: dashLoading } = useGetSecurityDashboardQuery();
  const { data: sessionsData, isLoading: sessionsLoading, refetch: refetchSessions } = useGetActiveSessionsQuery();
  const { data: tokensData, isLoading: tokensLoading, refetch: refetchTokens } = useGetAPITokensQuery();
  const [revokeSession] = useRevokeSessionMutation();
  const [revokeAllSessions] = useRevokeAllSessionsMutation();
  const [revokeToken] = useRevokeAPITokenMutation();
  const [deleteToken] = useDeleteAPITokenMutation();

  const sessions = sessionsData?.data || sessionsData?.sessions || [];
  const tokens = tokensData?.data || tokensData?.tokens || [];
  const dashStats = dashData?.data || {};

  const stats = useMemo(() => ({
    activeSessions: dashStats.activeSessions ?? sessions.filter(s => s.status === 'Active' || s.status === 'Online').length,
    apiTokens: dashStats.apiTokens ?? tokens.length,
    failedLogins: dashStats.failedLogins ?? 0,
    suspiciousActivity: dashStats.suspiciousActivity ?? 0,
  }), [dashStats, sessions, tokens]);

  const filteredSessions = useMemo(() => {
    if (!search) return sessions;
    const q = search.toLowerCase();
    return sessions.filter(s =>
      (s.user?.name || s.user || '').toLowerCase().includes(q) ||
      (s.ip || '').toLowerCase().includes(q) ||
      (s.device || '').toLowerCase().includes(q)
    );
  }, [sessions, search]);

  const filteredTokens = useMemo(() => {
    if (!search) return tokens;
    const q = search.toLowerCase();
    return tokens.filter(t =>
      (t.name || '').toLowerCase().includes(q)
    );
  }, [tokens, search]);

  const handleRevokeSession = async (id) => {
    try {
      await revokeSession(id).unwrap();
      toast.success('Session revoked');
      refetchSessions();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to revoke session');
    }
  };

  const handleRevokeAll = async () => {
    try {
      await revokeAllSessions().unwrap();
      toast.success('All sessions revoked');
      refetchSessions();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to revoke sessions');
    }
  };

  const handleRevokeToken = async (id) => {
    try {
      await revokeToken(id).unwrap();
      toast.success('Token revoked');
      refetchTokens();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to revoke token');
    }
  };

  const handleDeleteToken = async (id) => {
    try {
      await deleteToken(id).unwrap();
      toast.success('Token deleted');
      refetchTokens();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete token');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Shield className="text-red-600" size={28} />
            Security Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Monitor sessions, API tokens, and security events.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => { refetchSessions(); refetchTokens(); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <Eye size={16} />
          </button>
          {activeTab === 'sessions' && sessions.length > 1 && (
            <button onClick={handleRevokeAll}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 font-bold transition-colors text-sm">
              <Trash2 size={16} /> Revoke All
            </button>
          )}
          {activeTab === 'tokens' && (
            <button onClick={() => setShowCreateToken(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold transition-colors text-sm">
              <Plus size={16} /> New Token
            </button>
          )}
        </div>
      </div>

      {dashLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Active Sessions" value={stats.activeSessions} icon={Monitor} color="bg-green-500" />
          <StatCard label="API Tokens" value={stats.apiTokens} icon={Key} color="bg-indigo-500" />
          <StatCard label="Failed Logins (24h)" value={stats.failedLogins} icon={AlertTriangle} color="bg-red-500" />
          <StatCard label="Suspicious Activity" value={stats.suspiciousActivity} icon={Shield} color="bg-amber-500" />
        </div>
      )}

      <div className="flex gap-2">
        <button onClick={() => { setActiveTab('sessions'); setSearch(''); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            activeTab === 'sessions'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}>
          <Monitor size={16} className="inline mr-1.5" /> Active Sessions
        </button>
        <button onClick={() => { setActiveTab('tokens'); setSearch(''); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            activeTab === 'tokens'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}>
          <Key size={16} className="inline mr-1.5" /> API Tokens
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${activeTab === 'sessions' ? 'sessions\u2026' : 'tokens\u2026'}`}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      {activeTab === 'sessions' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {sessionsLoading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : filteredSessions.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4">
                <Monitor size={28} className="text-green-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No active sessions</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {search ? 'Try adjusting your search.' : 'No active sessions at this time.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSessions.map(s => (
                    <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {(s.device || '').toLowerCase().includes('mobile') || (s.device || '').toLowerCase().includes('iphone')
                            ? <Smartphone size={16} className="text-slate-400" />
                            : <Monitor size={16} className="text-slate-400" />}
                          <span className="font-bold">{s.user?.name || s.user || '\u2014'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{s.ip || '\u2014'}</code>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">{s.device || s.userAgent || '\u2014'}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">{fmtDate(s.lastActive || s.updatedAt)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[s.status] || STATUS_COLORS.Active}`}>
                          {s.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => handleRevokeSession(s._id)} title="Revoke Session"
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

      {activeTab === 'tokens' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {tokensLoading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : filteredTokens.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
                <Key size={28} className="text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No API tokens</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {search ? 'Try adjusting your search.' : 'Click "New Token" to create your first token.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Used</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expires</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTokens.map(t => (
                    <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Key size={16} className="text-indigo-500" />
                          <span className="font-bold">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">{fmtDate(t.lastUsedAt)}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">{fmtDate(t.expiresAt)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[t.status] || STATUS_COLORS.Active}`}>
                          {t.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {t.status !== 'Expired' && (
                            <button onClick={() => handleRevokeToken(t._id)} title="Revoke"
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 transition-colors">
                              <AlertTriangle size={16} />
                            </button>
                          )}
                          <button onClick={() => handleDeleteToken(t._id)} title="Delete"
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

      {showCreateToken && <CreateTokenModal onClose={() => setShowCreateToken(false)} />}
    </div>
  );
};

export default SecurityDashboard;
