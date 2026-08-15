import React, { useState } from 'react';
import { useGetEnterpriseFinanceAuditLogsQuery } from '../store/adminApiSlice';
import { Loader2, DollarSign, Search } from 'lucide-react';

const FinanceAuditViewer = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState({ action: '', targetId: '' });
  
  const { data, isLoading } = useGetEnterpriseFinanceAuditLogsQuery({ page, limit: 30, ...filter });
  const logs = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <DollarSign size={24} className="text-green-600" />
          Finance Audit Logs
        </h1>
        <p className="text-sm text-gray-500">Immutable record of financial changes</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex gap-4">
          <select 
            className="border rounded-xl px-4 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
            value={filter.action}
            onChange={(e) => setFilter({ ...filter, action: e.target.value })}
          >
            <option value="">All Actions</option>
            <option value="FEE_COLLECTION">Fee Collection</option>
            <option value="REFUND">Refund</option>
            <option value="DISCOUNT_APPLIED">Discount Applied</option>
            <option value="INVOICE_GENERATED">Invoice Generated</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by ID..." 
              className="pl-9 pr-4 py-2 border rounded-xl text-sm dark:bg-gray-900 dark:border-gray-700"
              value={filter.targetId}
              onChange={(e) => setFilter({ ...filter, targetId: e.target.value })}
            />
          </div>
        </div>

        {isLoading && page === 1 ? (
          <div className="flex justify-center p-10"><Loader2 className="animate-spin text-green-600 w-8 h-8" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs font-bold text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Target ID</th>
                  <th className="px-6 py-3">Performed By</th>
                  <th className="px-6 py-3">Changes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {logs.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-10 text-center text-gray-500">No finance logs found.</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-3 text-gray-600">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-3">
                        <span className="inline-flex px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-bold uppercase">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-bold text-gray-900 dark:text-white">
                        {log.amount ? `$${log.amount}` : '-'}
                      </td>
                      <td className="px-6 py-3 text-gray-600">{log.targetId}</td>
                      <td className="px-6 py-3">
                        {log.actorUserId?.name || 'System'}
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-500 max-w-xs truncate" title={JSON.stringify(log.changes)}>
                        {JSON.stringify(log.changes)}
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

export default FinanceAuditViewer;
