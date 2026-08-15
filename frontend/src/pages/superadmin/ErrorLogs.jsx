import React, { useState } from 'react';
import { useGetErrorLogsQuery, useUpdateErrorStatusMutation } from '../../store/superAdminApiSlice';
import { 
  AlertCircle, 
  Search, 
  Filter, 
  Clock, 
  ChevronRight,
  ShieldAlert,
  Terminal,
  User,
  School,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Loader2,
  Bug
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader, Panel, Badge, superAdminInputClass } from '../../components/superadmin/SuperAdminShell';
import { toast } from 'sonner';

const SeverityBadge = ({ severity }) => {
  const configs = {
    low: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    medium: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    high: { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
    critical: { color: 'bg-red-600 text-white border-red-700' },
  };
  const config = configs[severity] || configs.medium;
  return (
    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${config.color}`}>
      {severity}
    </span>
  );
};

const ErrorLogs = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const { data, isLoading } = useGetErrorLogsQuery({ status: statusFilter });
  const [updateStatus] = useUpdateErrorStatusMutation();

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Error marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="System Error Logs" 
        subtitle="Monitor and manage production exceptions" 
      />

      <Panel className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search exceptions..."
              className={`${superAdminInputClass} pl-12`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`${superAdminInputClass} md:w-48 cursor-pointer font-bold`}
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="ignored">Ignored</option>
          </select>
        </div>
      </Panel>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Panel className="overflow-hidden border-none shadow-xl shadow-slate-200/50 dark:shadow-slate-900/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Exception</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Severity</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isLoading ? (
                    [1,2,3].map(i => (
                      <tr key={i}>
                        <td colSpan={4} className="px-6 py-8"><div className="h-4 bg-slate-100 dark:bg-slate-800 animate-pulse rounded w-full" /></td>
                      </tr>
                    ))
                  ) : data?.data?.length > 0 ? (
                    data.data.map(log => (
                      <tr 
                        key={log._id} 
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${selectedLog?._id === log._id ? 'bg-indigo-500/10' : ''}`}
                        onClick={() => setSelectedLog(log)}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 ${log.type === 'frontend' ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                              {log.type === 'frontend' ? <Terminal size={18} /> : <Bug size={18} />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate max-w-xs">{log.message}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">{new Date(log.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <SeverityBadge severity={log.severity} />
                        </td>
                        <td className="px-6 py-5">
                          <Badge variant={log.status === 'resolved' ? 'success' : log.status === 'investigating' ? 'warning' : 'indigo'}>
                            {log.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <ChevronRight className="w-4 h-4 text-slate-600 ml-auto group-hover:text-indigo-400 transition-colors" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <CheckCircle2 className="w-12 h-12 text-slate-800" />
                          <p className="font-black text-slate-500 uppercase tracking-widest text-xs">No errors detected</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {selectedLog ? (
              <motion.div
                key={selectedLog._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Panel className="p-6 sticky top-28 border-none shadow-2xl shadow-slate-900/40">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center shadow-sm border border-rose-500/20">
                      <ShieldAlert size={24} />
                    </div>
                    <select 
                      value={selectedLog.status}
                      onChange={(e) => handleUpdateStatus(selectedLog._id, e.target.value)}
                      className="text-[10px] font-black uppercase tracking-widest border border-slate-700 bg-slate-800 rounded-lg px-2 py-1 outline-none text-white cursor-pointer hover:border-indigo-500 transition-all"
                    >
                      <option value="new">New</option>
                      <option value="investigating">Investigating</option>
                      <option value="resolved">Resolved</option>
                      <option value="ignored">Ignored</option>
                    </select>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Message</h4>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">{selectedLog.message}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Type</h4>
                        <div className="flex items-center gap-2 text-xs font-black text-slate-600 dark:text-slate-300 capitalize">
                          {selectedLog.type}
                        </div>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tenant</h4>
                        <div className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400">
                          <School size={14} /> {selectedLog.tenantId}
                        </div>
                      </div>
                    </div>

                    {selectedLog.stack && (
                      <div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Stack Trace</h4>
                        <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-800 overflow-x-auto custom-scrollbar">
                           <pre className="text-[10px] text-slate-400 font-mono leading-relaxed">{selectedLog.stack}</pre>
                        </div>
                      </div>
                    )}

                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-3">
                       <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <User size={12} /> Context Information
                       </div>
                       <div className="space-y-1">
                          <p className="text-xs text-slate-300 font-bold">Path: <span className="text-white">{selectedLog.path || 'N/A'}</span></p>
                          <p className="text-xs text-slate-300 font-bold">User: <span className="text-white">{selectedLog.userId || 'Guest'}</span></p>
                          <p className="text-xs text-slate-300 font-bold">Browser: <span className="text-white truncate block">{selectedLog.userAgent || 'N/A'}</span></p>
                       </div>
                    </div>
                  </div>
                </Panel>
              </motion.div>
            ) : (
              <div className="h-[500px] flex flex-col items-center justify-center text-center p-8 bg-slate-900/30 rounded-[2.5rem] border border-slate-800/50 border-dashed opacity-40">
                 <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-600 mb-4">
                   <AlertCircle size={32} />
                 </div>
                 <h3 className="text-lg font-black text-white mb-2">Select an error</h3>
                 <p className="text-slate-500 text-sm font-medium">Choose an exception from the list to view the full stack trace and diagnostic data.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ErrorLogs;