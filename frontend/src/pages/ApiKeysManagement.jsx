import { useState, useMemo } from 'react';
import {
  Key, Plus, Search, Trash2, X, RefreshCw,
  CheckCircle, AlertCircle, Shield, Eye, EyeOff,
  Clock, Ban,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
  useDeleteApiKeyMutation,
} from '../store/adminApiSlice';

const STATUSES = ['Active', 'Revoked', 'Expired'];

const STATUS_STYLES = {
  Active:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Revoked: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Expired: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
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

const ApiKeyModal = ({ onClose }) => {
  const [form, setForm] = useState({
    name: '',
    permissions: [],
    rateLimit: 1000,
    expiresAt: '',
  });

  const [createApiKey, { isLoading }] = useCreateApiKeyMutation();
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const togglePermission = (perm) => {
    setForm(p => ({
      ...p,
      permissions: p.permissions.includes(perm)
        ? p.permissions.filter(x => x !== perm)
        : [...p.permissions, perm],
    }));
  };

  const PERMISSIONS = ['read', 'write', 'delete', 'admin'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    if (form.permissions.length === 0) return toast.error('Select at least one permission');
    try {
      const payload = { ...form, rateLimit: Number(form.rateLimit) };
      if (!payload.expiresAt) delete payload.expiresAt;
      const result = await createApiKey(payload).unwrap();
      toast.success('API key created. Copy it now - it will not be shown again!');
      if (result?.key || result?.data?.key) {
        navigator.clipboard?.writeText(result.key || result.data.key);
        toast.success('API key copied to clipboard!');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create API key');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">New API Key</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              placeholder="e.g. Production API Key"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Permissions *</label>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Rate Limit (req/hr)</label>
              <input type="number" min="1" value={form.rateLimit}
                onChange={e => set('rateLimit', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Expiry Date</label>
              <input type="date" value={form.expiresAt}
                onChange={e => set('expiresAt', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {isLoading ? 'Creating\u2026' : 'Create API Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ apiKey, onClose }) => {
  const [deleteKey, { isLoading }] = useDeleteApiKeyMutation();

  const handleDelete = async () => {
    try {
      await deleteKey(apiKey._id).unwrap();
      toast.success('API key deleted');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete API key');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Delete API Key</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-slate-200">"{apiKey.name}"</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
            {isLoading ? 'Deleting\u2026' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ApiKeysManagement = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const { data, isLoading, refetch } = useGetApiKeysQuery();
  const [revokeApiKey] = useRevokeApiKeyMutation();

  const keys = data?.data || data?.apiKeys || [];
  const activeCount = keys.filter(k => k.status === 'Active').length;
  const revokedCount = keys.filter(k => k.status === 'Revoked').length;

  const handleRevoke = async (key) => {
    try {
      await revokeApiKey(key._id).unwrap();
      toast.success('API key revoked');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to revoke API key');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Key className="text-amber-600" size={28} />
            API Keys
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage API keys for external integrations.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
            <Plus size={16} /> Create API Key
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Keys" value={keys.length} icon={Key} color="bg-amber-500" />
          <StatCard label="Active" value={activeCount} icon={CheckCircle} color="bg-green-500" />
          <StatCard label="Revoked" value={revokedCount} icon={Ban} color="bg-red-500" />
          <StatCard label="Security" value="OK" icon={Shield} color="bg-blue-500" />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : keys.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4">
              <Key size={28} className="text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No API keys found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Click "Create API Key" to generate your first key.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Prefix</th>
                  <th className="px-5 py-3.5">Permissions</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Last Used</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {keys.map(k => (
                  <tr key={k._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{k.name}</td>
                    <td className="px-5 py-3.5">
                      <code className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono">
                        {k.prefix || k.keyPrefix || '\u2026\u2026\u2026'}
                      </code>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(k.permissions || []).map(p => (
                          <span key={p} className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[k.status] || ''}`}>
                        {k.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      {fmtDate(k.lastUsedAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {k.status === 'Active' && (
                          <button onClick={() => handleRevoke(k)} title="Revoke"
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 transition-colors">
                            <Ban size={16} />
                          </button>
                        )}
                        <button onClick={() => setDeleteRecord(k)} title="Delete"
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

      {showCreate && <ApiKeyModal onClose={() => setShowCreate(false)} />}
      {deleteRecord && <DeleteModal apiKey={deleteRecord} onClose={() => setDeleteRecord(null)} />}
    </div>
  );
};

export default ApiKeysManagement;
