import React, { useState } from 'react';
import { useGetEnterpriseAuditLogsQuery } from '../store/adminApiSlice';
import { Shield, Search } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

const AuditLogViewer = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ action: '', module: '' });
  
  const { data, isLoading } = useGetEnterpriseAuditLogsQuery({ page, limit: 30, ...filter });
  const logs = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield size={24} className="text-indigo-600" />
            Audit Logs
          </h1>
          <p className="text-sm text-gray-500">Security and action audit trail</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter by action..." 
              className="pl-9 pr-4 py-2 border rounded-xl text-sm dark:bg-gray-900 dark:border-gray-700"
              value={filter.action}
              onChange={(e) => setFilter({ ...filter, action: e.target.value })}
            />
          </div>
          <select 
            className="border rounded-xl px-4 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
            value={filter.module}
            onChange={(e) => setFilter({ ...filter, module: e.target.value })}
          >
            <option value="">All Modules</option>
            <option value="user">Users</option>
            <option value="payment">Payments</option>
            <option value="branch">Branches</option>
            <option value="auth">Authentication</option>
          </select>
        </div>

        {isLoading && page === 1 ? (
          <div className="p-6"><TableSkeleton rows={10} columns={5} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs font-bold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Actor</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Target</th>
                  <th className="px-6 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {logs.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No logs found.</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-3 text-gray-600">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-3">
                        <div className="font-medium text-gray-900 dark:text-white">{log.actorUserId?.name || 'System'}</div>
                        <div className="text-xs text-gray-500">{log.actorUserId?.role || ''}</div>
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-flex px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-bold uppercase">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-600">
                        {log.targetType} ({log.targetId})
                      </td>
                      <td className="px-6 py-3 text-gray-500 text-xs font-mono">
                        {log.ipAddress || 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
            <span className="text-gray-500">Showing page {page} of {pagination.pages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50">Prev</button>
              <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogViewer;
