import { useState, useMemo } from 'react';
import {
  Heart, Activity, Database, HardDrive, Server, Cpu,
  MemoryStick, RefreshCw, CheckCircle, AlertTriangle,
  Clock, Wifi,
} from 'lucide-react';
import { useToast } from '../components/ToastContainer';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetHealthDashboardQuery,
  useGetQueueMonitoringQuery,
  useGetCacheMonitoringQuery,
  useGetDatabaseMonitoringQuery,
  useGetStorageMonitoringQuery,
  useGetErrorMonitoringQuery,
} from '../store/adminApiSlice';

const STATUS_COLORS = {
  healthy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Healthy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Down:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Up:       'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  OK:       'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const STATUS_DOT = {
  healthy: 'bg-green-500',
  warning: 'bg-yellow-500',
  critical: 'bg-red-500',
  Healthy: 'bg-green-500',
  Warning: 'bg-yellow-500',
  Critical: 'bg-red-500',
  Down: 'bg-red-500',
  Up: 'bg-green-500',
  OK: 'bg-green-500',
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

const UsageBar = ({ label, used, total, color = 'bg-indigo-500' }) => {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const barColor = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : color;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-bold text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-slate-500 dark:text-slate-400">{pct.toFixed(1)}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>{typeof used === 'number' ? used.toLocaleString() : used}</span>
        <span>{typeof total === 'number' ? total.toLocaleString() : total}</span>
      </div>
    </div>
  );
};

const HealthSection = ({ title, icon: Icon, status, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Icon size={20} className="text-slate-600 dark:text-slate-300" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">{title}</h3>
      </div>
      {status && (
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${STATUS_DOT[status] || 'bg-slate-400'}`} />
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
            {status}
          </span>
        </div>
      )}
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const SystemHealthDashboard = () => {
  const toast = useToast();
  const [lastRefresh, setLastRefresh] = useState(null);

  const { data: healthData, isLoading: healthLoading, refetch: refetchHealth } = useGetHealthDashboardQuery();
  const { data: queueData, isLoading: queueLoading } = useGetQueueMonitoringQuery();
  const { data: cacheData, isLoading: cacheLoading } = useGetCacheMonitoringQuery();
  const { data: dbData, isLoading: dbLoading } = useGetDatabaseMonitoringQuery();
  const { data: storageData, isLoading: storageLoading } = useGetStorageMonitoringQuery();
  const { data: errorData, isLoading: errorLoading } = useGetErrorMonitoringQuery();

  const health = healthData?.data || {};
  const queues = queueData?.data || queueData?.queues || [];
  const cache = cacheData?.data || {};
  const db = dbData?.data || {};
  const storage = storageData?.data || {};
  const errors = errorData?.data || {};

  const overallStatus = health.status || 'healthy';
  const uptime = health.uptime || '99.9%';

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchHealth()]);
      setLastRefresh(new Date());
      toast.success('Health data refreshed');
    } catch {
      toast.error('Failed to refresh health data');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Heart className="text-red-600" size={28} />
            System Health
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Real-time monitoring for all system components.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap items-center">
          {lastRefresh && (
            <span className="text-xs text-slate-400">
              Last refresh: {fmtDate(lastRefresh)}
            </span>
          )}
          <button onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className={`flex items-center gap-4 p-5 rounded-2xl border ${
        overallStatus === 'healthy'
          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
          : overallStatus === 'warning'
          ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
          : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
      }`}>
        <div className={`w-4 h-4 rounded-full ${STATUS_DOT[overallStatus] || 'bg-green-500'} animate-pulse`} />
        <div className="flex-1">
          <span className="text-sm font-black text-slate-900 dark:text-white uppercase">{overallStatus}</span>
          <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">Uptime: {uptime}</span>
        </div>
        <Wifi size={20} className={`${overallStatus === 'healthy' ? 'text-green-600' : overallStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'}`} />
      </div>

      {healthLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="CPU" value={`${health.cpu ?? 0}%`} icon={Cpu} color="bg-blue-500" />
          <StatCard label="Memory" value={`${health.memory ?? 0}%`} icon={MemoryStick} color="bg-indigo-500" />
          <StatCard label="Disk" value={`${health.disk ?? 0}%`} icon={HardDrive} color="bg-green-500" />
          <StatCard label="Uptime" value={uptime} icon={Clock} color="bg-emerald-500" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthSection title="CPU Usage" icon={Cpu} status={health.cpuStatus}>
          <UsageBar label="CPU" used={health.cpu ?? 0} total={100} />
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Cores</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{health.cpuCores || '\u2014'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Load Avg</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{health.loadAvg || '\u2014'}</p>
            </div>
          </div>
        </HealthSection>

        <HealthSection title="Memory Usage" icon={MemoryStick} status={health.memoryStatus}>
          <UsageBar label="Memory" used={health.memory ?? 0} total={100} color="bg-indigo-500" />
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Used</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{health.memoryUsed || '\u2014'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{health.memoryTotal || '\u2014'}</p>
            </div>
          </div>
        </HealthSection>

        <HealthSection title="Disk Usage" icon={HardDrive} status={health.diskStatus}>
          <UsageBar label="Disk" used={health.disk ?? 0} total={100} color="bg-green-500" />
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Used</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{health.diskUsed || '\u2014'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{health.diskTotal || '\u2014'}</p>
            </div>
          </div>
        </HealthSection>

        <HealthSection title="Database" icon={Database} status={db.status}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Connections</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{db.connections ?? '\u2014'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Collections</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{db.collections ?? '\u2014'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Documents</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{(db.documents ?? 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Size</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{db.size || '\u2014'}</p>
            </div>
          </div>
        </HealthSection>

        <HealthSection title="Cache" icon={Server} status={cache.status}>
          <UsageBar label="Memory" used={cache.memoryUsage ?? 0} total={cache.memoryMax ?? 100} color="bg-purple-500" />
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Hit Rate</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{cache.hitRate || '\u2014'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Keys</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{(cache.keys ?? 0).toLocaleString()}</p>
            </div>
          </div>
        </HealthSection>

        <HealthSection title="Storage" icon={HardDrive} status={storage.status}>
          <UsageBar label="Storage" used={storage.usedPercent ?? 0} total={100} color="bg-cyan-500" />
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Used</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{storage.used || '\u2014'}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Available</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{storage.available || '\u2014'}</p>
            </div>
          </div>
        </HealthSection>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Activity size={18} /> Queue Monitoring
          </h2>
        </div>
        {queueLoading ? (
          <TableSkeleton rows={4} columns={5} />
        ) : queues.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            No active queues.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Queue</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Waiting</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Failed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {queues.map((q, i) => (
                  <tr key={q._id || q.name || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap font-bold">{q.name || q.queue || '\u2014'}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">{q.waiting ?? q.pending ?? 0}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white whitespace-nowrap">{q.active ?? 0}</td>
                    <td className="px-6 py-4 text-sm text-green-600 dark:text-green-400 whitespace-nowrap font-bold">{q.completed ?? 0}</td>
                    <td className="px-6 py-4 text-sm text-red-600 dark:text-red-400 whitespace-nowrap font-bold">{q.failed ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {errors.recentErrors?.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" /> Recent Errors
          </h2>
          <div className="space-y-2">
            {errors.recentErrors.map((err, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/10">
                <AlertTriangle size={16} className="text-red-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-slate-900 dark:text-white block truncate">{err.message || err.error || 'Unknown error'}</span>
                  {err.source && <span className="text-xs text-slate-500 dark:text-slate-400">{err.source}</span>}
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">{fmtDate(err.createdAt || err.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealthDashboard;
