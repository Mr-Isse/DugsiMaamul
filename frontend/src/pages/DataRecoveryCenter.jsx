import React, { useState } from 'react';
import { Skeleton } from '../components/ui/skeleton';
import {
  useGetDataRecoverySummaryQuery,
  useGetDeletedRecordsQuery,
  useRestoreRecordMutation,
  usePermanentDeleteRecordMutation
} from '../store/adminApiSlice';
import { Users, UserSquare2, CreditCard, BookOpen, FileText, RefreshCw, Trash2, AlertCircle } from 'lucide-react';
import { useAppToast } from '../hooks/useAppToast';

const DataRecoveryCenter = () => {
  const { toast } = useAppToast();
  const { data: summaryData, isLoading: isLoadingSummary } = useGetDataRecoverySummaryQuery();
  const [restoreRecord] = useRestoreRecordMutation();
  const [permanentDeleteRecord] = usePermanentDeleteRecordMutation();

  const [selectedType, setSelectedType] = useState(null);
  const { data: deletedRecords, isLoading: isLoadingRecords } = useGetDeletedRecordsQuery(selectedType, { skip: !selectedType });

  const typeConfig = {
    students: { icon: Users, label: 'Students', color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30' },
    teachers: { icon: UserSquare2, label: 'Teachers', color: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30' },
    payments: { icon: CreditCard, label: 'Payments', color: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30' },
    classes: { icon: BookOpen, label: 'Classes', color: 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/30' },
    exams: { icon: FileText, label: 'Exams', color: 'text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-900/30' }
  };

  const handleRestore = async (type, id) => {
    if (!window.confirm('Are you sure you want to restore this record?')) return;
    try {
      await restoreRecord({ type, id }).unwrap();
      toast('Record restored successfully', 'success');
    } catch (err) {
      toast(err.userMessage || 'Failed to restore record', 'error');
    }
  };

  const handlePermanentDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to permanently delete this record? This cannot be undone.')) return;
    try {
      await permanentDeleteRecord({ type, id }).unwrap();
      toast('Record permanently deleted', 'success');
    } catch (err) {
      toast(err.userMessage || 'Failed to delete record', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 dark:text-gray-100 tracking-tight">
          Data Recovery Center
        </h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">
          Restore or permanently delete archived records
        </p>
      </div>

      {isLoadingSummary ? (
            <div className="max-w-7xl mx-auto space-y-6">
              <PageHeaderSkeleton />
              <StatsGridSkeleton count={5} />
            </div>
          ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {(summaryData?.summary || []).map((item) => {
              const config = typeConfig[item.type];
              if (!config) return null;
              const Icon = config.icon;

              return (
                <button
                  key={item.type}
                  onClick={() => setSelectedType(item.type)}
                  className={`p-6 rounded-xl border transition-all duration-200 text-left ${
                    selectedType === item.type
                      ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${config.color}`}>
                    <Icon size={24} />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{config.label}</p>
                  <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{item.count}</p>
                  <p className="text-xs text-slate-400 mt-1">Deleted records</p>
                </button>
              );
            })}
          </div>

          {selectedType && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Deleted {typeConfig[selectedType]?.label}
                </h2>
                <button
                  onClick={() => setSelectedType(null)}
                  className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Back to overview
                </button>
              </div>
              <div className="overflow-x-auto">
                {isLoadingRecords ? (
                  <div className="p-4">
                    <TableSkeleton rows={6} columns={4} />
                  </div>
                ) : (deletedRecords?.records || []).length === 0 ? (
                  <div className="text-center py-20 text-slate-500 dark:text-slate-400">
                    No deleted records found for this type.
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Name / Details
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Deleted At
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Deleted By
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {(deletedRecords?.records || []).map((record) => (
                        <tr key={record._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full ${typeConfig[selectedType]?.color} flex items-center justify-center`}>
                                {typeConfig[selectedType]?.icon && React.createElement(typeConfig[selectedType].icon, { size: 20 })}
                              </div>
                              <div>
                                <p className="font-medium text-slate-800 dark:text-white">
                                  {record.name || record.title || record._id}
                                </p>
                                {record.customId && (
                                  <p className="text-sm text-slate-500 dark:text-slate-400">{record.customId}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                            {new Date(record.deletedAt).toLocaleDateString()} {new Date(record.deletedAt).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-300">
                            {record.deletedBy?.name || 'System'}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleRestore(selectedType, record._id)}
                                className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
                              >
                                <RefreshCw size={14} />
                                Restore
                              </button>
                              <button
                                onClick={() => handlePermanentDelete(selectedType, record._id)}
                                className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex gap-3">
        <AlertCircle className="text-yellow-600 dark:text-yellow-400 shrink-0" size={20} />
        <div>
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
            Important Note
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
            Permanently deleting records cannot be undone. Only permanently delete records if you are sure you no longer need them.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataRecoveryCenter;
