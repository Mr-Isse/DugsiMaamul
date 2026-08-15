import React, { useState } from 'react';
import {
  BarChart3,
  Smartphone,
  Mail,
  MessageSquare,
  Bell,
  Calendar
} from 'lucide-react';
import { useGetCommunicationUsageQuery } from '../store/adminApiSlice';
import { Skeleton } from '../components/ui/Skeleton';

const CommunicationUsage = () => {
  const [period, setPeriod] = useState('monthly');
  const { data: usageData, isLoading } = useGetCommunicationUsageQuery({ period });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  const channelStats = [
    { name: 'SMS', key: 'sms', icon: Smartphone, color: 'indigo', data: usageData?.totals?.sms || { sent: 0, delivered: 0, failed: 0, cost: 0 } },
    { name: 'WhatsApp', key: 'whatsapp', icon: MessageSquare, color: 'emerald', data: usageData?.totals?.whatsapp || { sent: 0, delivered: 0, failed: 0, cost: 0 } },
    { name: 'Email', key: 'email', icon: Mail, color: 'blue', data: usageData?.totals?.email || { sent: 0, delivered: 0, opened: 0, failed: 0, cost: 0 } },
    { name: 'Push', key: 'push', icon: Bell, color: 'purple', data: usageData?.totals?.push || { sent: 0, delivered: 0, opened: 0, failed: 0, cost: 0 } }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Communication Usage
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Track message volume and costs across all channels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {channelStats.map(({ name, icon: Icon, color, data }) => (
          <div key={name} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${color}-50 dark:bg-${color}-900/20`}>
                  <Icon size={24} className={`text-${color}-600 dark:text-${color}-400`} />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{name}</h3>
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Sent</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{data.sent}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Delivered</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">{data.delivered}</span>
                </div>
                {data.opened !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Opened</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{data.opened}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Failed</span>
                  <span className="text-lg font-bold text-red-600 dark:text-red-400">{data.failed}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cost</span>
                  <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                    ${(data.cost || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Usage Timeline */}
      {usageData?.usageRecords && usageData.usageRecords.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <BarChart3 size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Usage Timeline</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    {channelStats.map(c => (
                      <th key={c.name} className="text-left py-3 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {c.name} Sent
                      </th>
                    ))}
                    <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total Cost
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usageData.usageRecords.map((record) => (
                    <tr key={record._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      {channelStats.map(c => (
                        <td key={c.name} className="py-4 px-4 text-sm font-bold text-gray-900 dark:text-white">
                          {record[c.key]?.sent || 0}
                        </td>
                      ))}
                      <td className="py-4 px-4 text-sm font-bold text-gray-900 dark:text-white text-right">
                        ${(record.totalCost || 0).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationUsage;
