import React, { useState } from 'react';
import {
  BarChart3,
  Filter,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useGetDeliveryReportsQuery } from '../store/adminApiSlice';
import { Skeleton } from '../components/ui/Skeleton';
import { Input } from '../components/ui/Input';

const DeliveryReports = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: reportsData, isLoading } = useGetDeliveryReportsQuery({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    channel: channelFilter !== 'all' ? channelFilter : undefined
  });

  const statusIcons = {
    sent: CheckCircle2,
    delivered: CheckCircle2,
    opened: CheckCircle2,
    failed: XCircle,
    bounced: XCircle,
    queued: Clock,
    pending: Clock
  };

  const statusColors = {
    sent: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
    delivered: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20',
    opened: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    failed: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    bounced: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
    queued: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
    pending: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
  };

  const filteredLogs = reportsData?.data?.logs?.filter(log =>
    !searchQuery ||
    log.to?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.to?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.to?.phone?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Delivery Reports
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Track delivery status of all your communications
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <Download size={16} />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search recipients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium"
            >
              <option value="all">All Channels</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="push">Push</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium"
            >
              <option value="all">All Status</option>
              <option value="queued">Queued</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="opened">Opened</option>
              <option value="failed">Failed</option>
              <option value="bounced">Bounced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <BarChart3 size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Delivery Logs</h2>
        </div>
        {filteredLogs?.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No delivery logs found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredLogs?.map(log => {
              const StatusIcon = statusIcons[log.status] || Clock;
              return (
                <div key={log._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${statusColors[log.status] || statusColors.pending}`}>
                        <StatusIcon size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                          {log.to?.name || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {log.to?.email || log.to?.phone || 'N/A'} • {log.channel?.toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[log.status] || statusColors.pending}`}>
                        <StatusIcon size={12} />
                        {log.status?.charAt(0).toUpperCase() + log.status?.slice(1) || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryReports;
