import { useState } from 'react';
import { 
  Database, Plus, Search, X, AlertTriangle, 
  ShieldCheck, RotateCcw, CheckCircle, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useGetBackupsQuery, 
  useCreateBackupMutation, 
  useRestoreBackupMutation,
  useVerifyBackupQuery
} from '../store/apiSlice';
import { Skeleton } from '../components/ui/skeleton';
import { useToast } from '../components/ToastContainer';

const statusColors = {
  success: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  verified: 'bg-blue-100 text-blue-700',
  integrity_error: 'bg-red-100 text-red-700',
};

const labelColors = {
  manual: 'bg-gray-100 text-gray-600',
  daily: 'bg-blue-100 text-blue-700',
  weekly: 'bg-purple-100 text-purple-700',
};

const formatSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });
};

const BackupManager = () => {
  const { showToast } = useToast();
  const { data: backupsResponse, isLoading } = useGetBackupsQuery();
  const backups = backupsResponse?.data || [];
  const [createBackup, { isLoading: isCreating }] = useCreateBackupMutation();
  const [restoreBackup, { isLoading: isRestoring }] = useRestoreBackupMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [verificationResults, setVerificationResults] = useState({});

  const handleCreateBackup = async () => {
    try {
      await createBackup({ label: 'manual' }).unwrap();
      showToast('Backup created successfully', 'success');
    } catch (err) {
      showToast(err?.data?.userMessage || 'Failed to create backup', 'error');
    }
  };

  const handleRestore = async (backup) => {
    try {
      await restoreBackup({ fileName: backup.fileName, confirm: true }).unwrap();
      showToast('Backup restored successfully', 'success');
      setShowRestoreConfirm(null);
    } catch (err) {
      showToast(err?.data?.userMessage || 'Failed to restore backup', 'error');
    }
  };

  const handleVerify = async (backup) => {
    setVerifyingId(backup._id);
    try {
      const response = await fetch(`/enterprise/backups/${encodeURIComponent(backup.fileName)}/verify`, {
        credentials: 'include',
      });
      const result = await response.json();
      setVerificationResults((prev) => ({ ...prev, [backup._id]: result }));
      if (result.success) {
        showToast('Backup verified successfully', 'success');
      } else {
        showToast('Backup verification failed', 'error');
      }
    } catch (err) {
      showToast('Failed to verify backup', 'error');
      setVerificationResults((prev) => ({ ...prev, [backup._id]: { success: false } }));
    } finally {
      setVerifyingId(null);
    }
  };

  const filtered = backups.filter((b) => {
    return !searchQuery || 
      b.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.label.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
            <Database className="text-blue-500" size={28} />
            Backup Manager
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create, verify, and restore database backups
          </p>
        </div>
        <button
          onClick={handleCreateBackup}
          disabled={isCreating}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium shadow-sm disabled:opacity-50"
        >
          <Plus size={18} /> {isCreating ? 'Creating...' : 'Create Backup'}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search backups by file name or label..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Database className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">No Backups</h3>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first backup to protect your data.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">File Name</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Size</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Records</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Label</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Created</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((backup) => (
                  <motion.tr
                    key={backup._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Database size={14} className="text-blue-500 shrink-0" />
                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{backup.fileName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-300">
                      {formatSize(backup.sizeBytes)}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-300">
                      {backup.recordCount?.toLocaleString() || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${labelColors[backup.label] || 'bg-gray-100 text-gray-600'}`}>
                        {backup.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[backup.status] || 'bg-gray-100 text-gray-600'}`}>
                        {backup.status === 'integrity_error' ? 'Integrity Error' : backup.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs">
                      {formatDate(backup.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleVerify(backup)}
                          disabled={verifyingId === backup._id}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 transition disabled:opacity-50"
                          title="Verify integrity"
                        >
                          {verifyingId === backup._id ? (
                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <ShieldCheck size={14} />
                          )}
                        </button>
                        <button
                          onClick={() => setShowRestoreConfirm(backup)}
                          className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 transition"
                          title="Restore backup"
                        >
                          <RotateCcw size={14} />
                        </button>
                      </div>

                      <AnimatePresence>
                        {showRestoreConfirm?._id === backup._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-4 mt-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-red-200 dark:border-red-800 z-10 w-72"
                          >
                            <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400 mb-3">
                              <AlertTriangle size={16} />
                              <span className="font-semibold">Restore Backup?</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                              This will overwrite current data with <strong>{backup.fileName}</strong>. This action cannot be undone.
                            </p>
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setShowRestoreConfirm(null)}
                                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                              <button onClick={() => handleRestore(backup)} disabled={isRestoring}
                                className="px-3 py-1.5 text-xs rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
                              >
                                {isRestoring ? 'Restoring...' : 'Restore'}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupManager;
