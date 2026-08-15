import { useState, useMemo } from 'react';
import {
  Database, Plus, Search, Trash2, RefreshCw, CheckCircle,
  XCircle, Clock, Download, Upload, Shield, HardDrive,
} from 'lucide-react';
import { useToast } from '../components/ToastContainer';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetBackupsQuery,
  useCreateBackupMutation,
  useRestoreBackupMutation,
  useVerifyBackupMutation,
  useDeleteBackupMutation,
  useGetBackupStatsQuery,
} from '../store/adminApiSlice';

const STATUS_COLORS = {
  Completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Running:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Failed:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  success:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  verified:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  failed:    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const BACKUP_TYPES = ['Full', 'Database Only', 'Files Only'];

const fmtDate = (d) => {
  if (!d) return '\u2014';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const fmtSize = (bytes) => {
  if (!bytes) return '\u2014';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const fmtDuration = (ms) => {
  if (!ms) return '\u2014';
  const secs = Math.round(ms / 1000);
  if (secs < 60) return `${secs}s`;
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
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

const RestoreConfirmModal = ({ backup, onClose, onRestore, isRestoring }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
      <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
        <Shield size={24} className="text-yellow-600 dark:text-yellow-400" />
      </div>
      <h2 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">Restore Backup?</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
        This will overwrite current data with <span className="font-bold text-slate-700 dark:text-slate-200">"{backup.name || backup.fileName}"</span>. This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onClose}
          className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          Cancel
        </button>
        <button onClick={onRestore} disabled={isRestoring}
          className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
          {isRestoring ? 'Restoring\u2026' : 'Restore'}
        </button>
      </div>
    </div>
  </div>
);

const BackupManagement = () => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [backupType, setBackupType] = useState('Full');
  const [restoreTarget, setRestoreTarget] = useState(null);

  const { data: backupsData, isLoading, refetch } = useGetBackupsQuery();
  const { data: statsData, isLoading: statsLoading } = useGetBackupStatsQuery();
  const [createBackup, { isLoading: isCreating }] = useCreateBackupMutation();
  const [restoreBackup, { isLoading: isRestoring }] = useRestoreBackupMutation();
  const [verifyBackup] = useVerifyBackupMutation();
  const [deleteBackup] = useDeleteBackupMutation();

  const backups = backupsData?.data || backupsData?.backups || [];
  const stats = statsData?.data || {};

  const computedStats = useMemo(() => ({
    totalBackups: stats.totalBackups ?? backups.length,
    lastBackup: stats.lastBackup ?? (backups.length > 0 ? backups[0].createdAt : null),
    totalSize: stats.totalSize ?? backups.reduce((s, b) => s + (b.sizeBytes || 0), 0),
    successRate: stats.successRate ?? (
      backups.length > 0
        ? `${Math.round((backups.filter(b => b.status === 'Completed' || b.status === 'success').length / backups.length) * 100)}%`
        : '0%'
    ),
  }), [stats, backups]);

  const filtered = useMemo(() => {
    if (!search) return backups;
    const q = search.toLowerCase();
    return backups.filter(b =>
      (b.name || b.fileName || '').toLowerCase().includes(q) ||
      (b.type || b.label || '').toLowerCase().includes(q)
    );
  }, [backups, search]);

  const handleCreateBackup = async () => {
    try {
      await createBackup({ type: backupType, label: 'manual' }).unwrap();
      toast.success(`${backupType} backup created successfully`);
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create backup');
    }
  };

  const handleRestore = async () => {
    if (!restoreTarget) return;
    try {
      await restoreBackup({ fileName: restoreTarget.fileName || restoreTarget.name, confirm: true }).unwrap();
      toast.success('Backup restored successfully');
      setRestoreTarget(null);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to restore backup');
    }
  };

  const handleVerify = async (backup) => {
    try {
      await verifyBackup(backup._id || backup.fileName).unwrap();
      toast.success('Backup verified successfully');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to verify backup');
    }
  };

  const handleDelete = async (backup) => {
    try {
      await deleteBackup(backup._id).unwrap();
      toast.success('Backup deleted');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete backup');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Database className="text-indigo-600" size={28} />
            Backup Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Create, restore, and verify system backups.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          <select value={backupType} onChange={e => setBackupType(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold">
            {BACKUP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={refetch}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} />
          </button>
          <button onClick={handleCreateBackup} disabled={isCreating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold transition-colors text-sm disabled:opacity-50">
            <Plus size={16} /> {isCreating ? 'Creating\u2026' : 'Create Backup'}
          </button>
        </div>
      </div>

      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Backups" value={computedStats.totalBackups} icon={Database} color="bg-indigo-500" />
          <StatCard label="Last Backup" value={computedStats.lastBackup ? fmtDate(computedStats.lastBackup) : 'Never'} icon={Clock} color="bg-green-500" />
          <StatCard label="Total Size" value={fmtSize(computedStats.totalSize)} icon={HardDrive} color="bg-blue-500" />
          <StatCard label="Success Rate" value={computedStats.successRate} icon={CheckCircle} color="bg-emerald-500" />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search backups\u2026"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
              <Database size={28} className="text-indigo-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No backups found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {search ? 'Try adjusting your search.' : 'Click "Create Backup" to generate your first backup.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(b => (
                  <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Database size={16} className="text-indigo-500" />
                        <span className="font-bold">{b.name || b.fileName || '\u2014'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {b.type || b.label || 'Full'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                      {fmtSize(b.sizeBytes || b.size)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[b.status] || STATUS_COLORS.Pending}`}>
                        {b.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">{fmtDate(b.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">
                      {fmtDuration(b.duration || b.durationMs)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleVerify(b)} title="Verify"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors">
                          <Shield size={16} />
                        </button>
                        <button onClick={() => setRestoreTarget(b)} title="Restore"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 transition-colors">
                          <Upload size={16} />
                        </button>
                        <button onClick={() => handleDelete(b)} title="Delete"
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

      {restoreTarget && (
        <RestoreConfirmModal
          backup={restoreTarget}
          onClose={() => setRestoreTarget(null)}
          onRestore={handleRestore}
          isRestoring={isRestoring}
        />
      )}
    </div>
  );
};

export default BackupManagement;
