import { useState, useMemo } from 'react';
import {
  Shield, Plus, Search, Edit3, Trash2, X, RefreshCw,
  CheckCircle, AlertCircle, Globe, Lock, Unlock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetIpRestrictionsQuery,
  useCreateIpRestrictionMutation,
  useUpdateIpRestrictionMutation,
  useDeleteIpRestrictionMutation,
} from '../store/adminApiSlice';

const IP_TYPES = ['allow', 'deny'];
const STATUSES = ['Active', 'Inactive'];

const TYPE_STYLES = {
  allow: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  deny:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const STATUS_STYLES = {
  Active:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
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

const IpRestrictionModal = ({ initial, onClose }) => {
  const [form, setForm] = useState({
    name:   initial?.name || '',
    ip:     initial?.ip || '',
    type:   initial?.type || 'allow',
    status: initial?.status || 'Active',
  });

  const [createRestriction, { isLoading: creating }] = useCreateIpRestrictionMutation();
  const [updateRestriction, { isLoading: updating }] = useUpdateIpRestrictionMutation();

  const isEdit = Boolean(initial);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.ip.trim()) return toast.error('IP address is required');
    try {
      if (isEdit) {
        await updateRestriction({ id: initial._id, ...form }).unwrap();
        toast.success('IP restriction updated');
      } else {
        await createRestriction(form).unwrap();
        toast.success('IP restriction created');
      }
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save IP restriction');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            {isEdit ? 'Edit IP Restriction' : 'New IP Restriction'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1">Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required
              placeholder="e.g. Office IP"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500" />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1">IP Address *</label>
            <input value={form.ip} onChange={e => set('ip', e.target.value)} required
              placeholder="e.g. 192.168.1.0/24"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500 font-mono text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                {IP_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:border-indigo-500">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={creating || updating}
              className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {creating || updating ? 'Saving\u2026' : 'Save Restriction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ record, onClose }) => {
  const [deleteRestriction, { isLoading }] = useDeleteIpRestrictionMutation();

  const handleDelete = async () => {
    try {
      await deleteRestriction(record._id).unwrap();
      toast.success('IP restriction deleted');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete IP restriction');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Delete IP Restriction</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          Are you sure you want to delete <span className="font-bold text-slate-700 dark:text-slate-200">"{record.name}"</span>?
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

const IpRestrictionsManagement = () => {
  const [filters, setFilters] = useState({ search: '', type: '', page: 1 });
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v, page: k !== 'page' ? 1 : v }));

  const queryArgs = useMemo(() => {
    const q = {};
    if (filters.search) q.search = filters.search;
    if (filters.type)   q.type   = filters.type;
    return q;
  }, [filters]);

  const { data, isLoading, refetch } = useGetIpRestrictionsQuery(queryArgs);

  const restrictions = data?.data || data?.restrictions || data?.ipRestrictions || [];
  const filteredRestrictions = useMemo(() => {
    let result = restrictions;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(r => r.name?.toLowerCase().includes(s) || r.ip?.toLowerCase().includes(s));
    }
    if (filters.type) {
      result = result.filter(r => r.type === filters.type);
    }
    return result;
  }, [restrictions, filters.search, filters.type]);

  const allowCount = restrictions.filter(r => r.type === 'allow').length;
  const denyCount = restrictions.filter(r => r.type === 'deny').length;
  const activeCount = restrictions.filter(r => r.status === 'Active').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Shield className="text-rose-600" size={28} />
            IP Restrictions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage IP allow/deny rules for system access.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors text-sm">
            <Plus size={16} /> Add Restriction
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Rules" value={restrictions.length} icon={Shield} color="bg-rose-500" />
          <StatCard label="Allow Rules" value={allowCount} icon={Unlock} color="bg-green-500" />
          <StatCard label="Deny Rules" value={denyCount} icon={Lock} color="bg-red-500" />
          <StatCard label="Active" value={activeCount} icon={CheckCircle} color="bg-blue-500" />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={filters.search} onChange={e => setF('search', e.target.value)}
              placeholder="Search by name or IP..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
          </div>
          <select value={filters.type} onChange={e => setF('type', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Types</option>
            {IP_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : filteredRestrictions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mb-4">
              <Shield size={28} className="text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No IP restrictions found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {filters.search || filters.type
                ? 'Try adjusting your filters.'
                : 'Click "Add Restriction" to create your first rule.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">IP Address</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRestrictions.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{r.name}</td>
                    <td className="px-5 py-3.5 text-sm font-mono text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Globe size={14} />
                        {r.ip}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${TYPE_STYLES[r.type] || ''}`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[r.status] || ''}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setEditRecord(r)} title="Edit"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => setDeleteRecord(r)} title="Delete"
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

      {showCreate && <IpRestrictionModal onClose={() => setShowCreate(false)} />}
      {editRecord && <IpRestrictionModal initial={editRecord} onClose={() => setEditRecord(null)} />}
      {deleteRecord && <DeleteModal record={deleteRecord} onClose={() => setDeleteRecord(null)} />}
    </div>
  );
};

export default IpRestrictionsManagement;
