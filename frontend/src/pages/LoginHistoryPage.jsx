import { useState, useMemo } from 'react';
import {
  History, Search, RefreshCw, CheckCircle, XCircle,
  AlertCircle, Clock, Shield, Monitor, Globe, Smartphone,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetLoginHistoryQuery,
  useGetLoginStatsQuery,
} from '../store/adminApiSlice';

const STATUSES = ['success', 'failed', 'blocked'];

const STATUS_STYLES = {
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  failed:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  blocked: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const fmtDateTime = (d) => {
  if (!d) return '\u2014';
  return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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

const LoginHistoryPage = () => {
  const [filters, setFilters] = useState({ status: '', dateFrom: '', dateTo: '', page: 1 });

  const setF = (k, v) => setFilters(p => ({ ...p, [k]: v, page: k !== 'page' ? 1 : v }));

  const queryArgs = useMemo(() => {
    const q = { page: filters.page, limit: 20 };
    if (filters.status)   q.status   = filters.status;
    if (filters.dateFrom) q.dateFrom = filters.dateFrom;
    if (filters.dateTo)   q.dateTo   = filters.dateTo;
    return q;
  }, [filters]);

  const { data, isLoading, refetch } = useGetLoginHistoryQuery(queryArgs);
  const { data: statsData } = useGetLoginStatsQuery();

  const records = data?.data || data?.history || [];
  const total = data?.total || 0;
  const page = data?.page || filters.page;
  const pages = data?.pages || Math.ceil(total / 20) || 1;
  const stats = statsData?.data || statsData || {};

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <History className="text-cyan-600" size={28} />
            Login History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            View all login attempts and authentication events.
          </p>
        </div>
        <button onClick={refetch}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-200 transition-colors text-sm">
          <RefreshCw size={16} />
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[0,1,2,3].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Today" value={stats.totalToday || total} icon={History} color="bg-cyan-500" />
          <StatCard label="Successful" value={stats.successful || records.filter(r => r.status === 'success').length} icon={CheckCircle} color="bg-green-500" />
          <StatCard label="Failed" value={stats.failed || records.filter(r => r.status === 'failed').length} icon={XCircle} color="bg-red-500" />
          <StatCard label="Blocked" value={stats.blocked || records.filter(r => r.status === 'blocked').length} icon={Shield} color="bg-yellow-500" />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <select value={filters.status} onChange={e => setF('status', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500">
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <input type="date" value={filters.dateFrom} onChange={e => setF('dateFrom', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
          <input type="date" value={filters.dateTo} onChange={e => setF('dateTo', e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-sm outline-none focus:border-indigo-500" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : records.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center mb-4">
              <History size={28} className="text-cyan-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No login records found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">IP Address</th>
                  <th className="px-5 py-3.5">Device</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.map((r, idx) => (
                  <tr key={r._id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {r.user?.name || r.userName || r.email || 'Unknown'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      {r.email || r.user?.email || '\u2014'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[r.status] || ''}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Globe size={14} />
                        {r.ipAddress || r.ip || '\u2014'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                        {r.userAgent?.includes('Mobile') ? <Smartphone size={14} /> : <Monitor size={14} />}
                        {r.device || r.userAgent?.substring(0, 30) || '\u2014'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                      {fmtDateTime(r.createdAt || r.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Page {page} of {pages} ({total} records)
            </p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setF('page', page - 1)}
                className="px-3 py-1.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Prev
              </button>
              <button disabled={page >= pages} onClick={() => setF('page', page + 1)}
                className="px-3 py-1.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginHistoryPage;
