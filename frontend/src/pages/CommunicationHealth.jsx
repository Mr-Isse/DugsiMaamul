import React from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Smartphone,
  Mail,
  MessageSquare,
  Bell,
  BarChart3,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import {
  useGetCommunicationHealthQuery
} from '../store/adminApiSlice';
import { Skeleton } from '../components/ui/Skeleton';

const CommunicationHealth = () => {
  const { data: healthData, isLoading, error } = useGetCommunicationHealthQuery();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Failed to load health data</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{error?.data?.message || error?.error}</p>
      </div>
    );
  }

  const channels = [
    { name: 'SMS', key: 'sms', icon: Smartphone, data: healthData?.sms },
    { name: 'WhatsApp', key: 'whatsapp', icon: MessageSquare, data: healthData?.whatsapp },
    { name: 'Email', key: 'email', icon: Mail, data: healthData?.email },
    { name: 'Push', key: 'push', icon: Bell, data: healthData?.push }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Communication Health
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Monitor the status of your communication channels and delivery queue
        </p>
      </div>

      {/* Channel Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {channels.map(({ name, key, icon: Icon, data }) => {
          const status = data?.isEnabled ? (data?.status === 'unknown' ? 'warning' : 'healthy') : 'disabled';
          const statusColors = {
            healthy: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
            warning: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
            disabled: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
            error: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
          };

          return (
            <div key={key} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${statusColors[status]}`}>
                    <Icon size={24} />
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[status]}`}>
                    {status === 'healthy' && <CheckCircle2 size={12} />}
                    {status === 'warning' && <AlertCircle size={12} />}
                    {status === 'error' && <XCircle size={12} />}
                    {status === 'disabled' && <Clock size={12} />}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Provider: {data?.provider || 'Not configured'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Queue & Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue Status */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <Activity size={18} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Queue Status</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pending</span>
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {healthData?.queue?.pending || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Retrying</span>
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {healthData?.queue?.retrying || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last processed</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {healthData?.queue?.lastProcessed ? new Date(healthData.queue.lastProcessed).toLocaleString() : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <BarChart3 size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Delivery Statistics</h2>
            </div>
            <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {healthData?.statistics?.totalMessages || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">Total</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {healthData?.statistics?.sent || 0}
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider mt-1">Sent</div>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {healthData?.statistics?.delivered || 0}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wider mt-1">Delivered</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {healthData?.statistics?.failed || 0}
              </div>
              <div className="text-xs text-red-700 dark:text-red-300 font-bold uppercase tracking-wider mt-1">Failed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationHealth;
