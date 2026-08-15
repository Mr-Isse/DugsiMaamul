import React, { useCallback } from 'react';
import { LayoutDashboard, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

const DashboardHeader = ({ schoolName, isLoading, onRefresh }) => {
  const handleRefresh = useCallback(() => {
    if (onRefresh) onRefresh();
  }, [onRefresh]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <LayoutDashboard className="text-white" size={22} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Welcome back — here's what's happening at{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {schoolName || 'your school'}
            </span>
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        onClick={handleRefresh}
        disabled={isLoading}
        className="h-9 px-4 rounded-xl font-semibold text-xs gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0 self-start sm:self-center"
        aria-label="Refresh dashboard data"
      >
        <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
        Refresh
      </Button>
    </motion.div>
  );
};

export default React.memo(DashboardHeader);
