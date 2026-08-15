import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldAlert,
  Clock,
  RefreshCcw,
  CheckCircle,
  XCircle,
  Activity,
  Database,
  HardDrive,
  AlertTriangle,
  Trash2,
  Search,
  FileWarning,
  Wifi,
  Server,
  Terminal
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../components/ui/Card';

const StatusBadge = ({ status, label }) => {
  const colors = {
    operational: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    degraded: 'bg-amber-100 text-amber-700 border-amber-200',
    down: 'bg-red-100 text-red-700 border-red-200',
  };
  const icons = {
    operational: CheckCircle,
    degraded: AlertTriangle,
    down: XCircle,
  };
  const Icon = icons[status] || XCircle;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border ${colors[status] || colors.down}`}>
      <Icon size={14} />
      {label || status}
    </div>
  );
};

const QuickActionBtn = ({ icon: Icon, label, onClick, variant = 'default' }) => {
  const variants = {
    default: 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md',
    danger: 'bg-white border-slate-200 text-red-600 hover:border-red-300 hover:shadow-md',
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-5 py-4 rounded-2xl border font-bold text-sm transition-all ${variants[variant]}`}
    >
      <Icon size={20} />
      {label}
    </button>
  );
};

const Maintenance = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const isAdmin = userInfo && ['schooladmin', 'school_admin', 'admin', 'superadmin'].includes(userInfo?.role);

  const [systemStatus, setSystemStatus] = useState({
    api: 'operational',
    database: 'operational',
    storage: 'operational',
  });
  const [lastBackup, setLastBackup] = useState('2026-07-13 03:00 AM');
  const [errorCount, setErrorCount] = useState(3);
  const [storageUsage, setStorageUsage] = useState(68);
  const [checking, setChecking] = useState(false);

  const simulateAction = (actionName) => {
    alert(`[Simulated] ${actionName} — This action would normally trigger a backend request.`);
  };

  // Non-admin: show maintenance splash
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center p-6 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          <div className="relative mb-10">
            <div className="w-24 h-24 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center mx-auto animate-pulse">
              <Settings className="w-12 h-12 text-indigo-500 animate-[spin_4s_linear_infinite]" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
              <ShieldAlert size={20} />
            </div>
          </div>

          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
            System Maintenance
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
            We're currently performing scheduled maintenance to improve your experience.
            The platform will be back online shortly. Thank you for your patience.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <Clock className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Time</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">30-60 Mins</p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <RefreshCcw className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Frequency</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Weekly</p>
            </div>
          </div>

          <button
            onClick={() => {
              setChecking(true);
              setTimeout(() => {
                setChecking(false);
                alert('All systems are online. The maintenance window has ended.');
              }, 2000);
            }}
            disabled={checking}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {checking ? 'Checking...' : 'Check Status'}
          </button>

          <p className="mt-8 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            DugsiKabe Enterprise Cloud
          </p>
        </motion.div>
      </div>
    );
  }

  // Admin: show maintenance control panel
  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-sm">
            <ShieldAlert className="w-4 h-4" /> Admin Control Panel
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            System <span className="text-indigo-600">Maintenance</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">Monitor and manage your platform infrastructure.</p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Wifi size={24} />
                </div>
                <StatusBadge status={systemStatus.api} label={systemStatus.api === 'operational' ? 'Operational' : 'Issues'} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">API Status</p>
              <p className="text-xl font-black text-slate-900">API Gateway</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Response time: 42ms</p>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Database size={24} />
                </div>
                <StatusBadge status={systemStatus.database} label={systemStatus.database === 'operational' ? 'Connected' : 'Issues'} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Database Status</p>
              <p className="text-xl font-black text-slate-900">MongoDB Cluster</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Connections: 12 active</p>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${storageUsage > 80 ? 'bg-red-50 text-red-600' : storageUsage > 60 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  <HardDrive size={24} />
                </div>
                <span className="text-xs font-black text-slate-500">{storageUsage}%</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Storage Usage</p>
              <p className="text-xl font-black text-slate-900">68.2 GB / 100 GB</p>
              <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${storageUsage > 80 ? 'bg-red-500' : storageUsage > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${storageUsage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Row */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-1">
                <Clock size={20} className="text-indigo-500" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Last Backup</p>
              </div>
              <p className="text-xl font-black text-slate-900 mt-2">{lastBackup}</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Auto-backup scheduled daily at 3:00 AM</p>
            </CardContent>
          </Card>

          <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-1">
                <FileWarning size={20} className={errorCount > 5 ? 'text-red-500' : 'text-amber-500'} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Errors (24h)</p>
              </div>
              <p className={`text-xl font-black mt-2 ${errorCount > 5 ? 'text-red-600' : 'text-slate-900'}`}>{errorCount} errors</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">Last error: 12 minutes ago</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-black text-slate-900 mb-6 tracking-tight">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <QuickActionBtn icon={Trash2} label="Clear Cache" onClick={() => simulateAction('Clear Cache')} />
              <QuickActionBtn icon={Activity} label="Run Diagnostics" onClick={() => simulateAction('Run Diagnostics')} />
              <QuickActionBtn icon={Search} label="View Error Logs" onClick={() => simulateAction('View Error Logs')} variant="danger" />
              <QuickActionBtn icon={RefreshCcw} label="Restart Services" onClick={() => simulateAction('Restart Services')} />
              <QuickActionBtn icon={Terminal} label="System Health Check" onClick={() => simulateAction('System Health Check')} />
            </div>
          </CardContent>
        </Card>

        {/* Toggle maintenance mode */}
        <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Maintenance Mode</h3>
                <p className="text-slate-500 text-sm font-medium mt-1">Toggle the maintenance banner for all users.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => simulateAction('Enable Maintenance Mode')}
                  className="px-8 py-3.5 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 active:scale-[0.98]"
                >
                  Enable
                </button>
                <button
                  onClick={() => simulateAction('Disable Maintenance Mode')}
                  className="px-8 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                >
                  Disable
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Maintenance;
