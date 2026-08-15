import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  Calendar,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Skeleton } from '../ui/skeleton';
import { useGetExecutiveDashboardQuery, useGetStatsQuery } from '../../store/adminApiSlice';
import { hasFeatureAccess } from '../../utils/featureAccess';
import { cn } from '../../lib/utils';

const SummaryCard = ({ label, value, icon: Icon, color, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
    className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
  >
    <div className={cn('w-7 h-7 rounded-lg mx-auto mb-1.5 flex items-center justify-center', color)}>
      <Icon size={13} className="text-white" />
    </div>
    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 truncate">{label}</p>
    <p className="text-sm font-extrabold text-slate-900 dark:text-white">{value}</p>
  </motion.div>
);

const ExecutiveSummary = ({ formatCurrency }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: statsRes, isLoading: statsLoading } = useGetStatsQuery();
  const { data: execRes, isLoading: execLoading } = useGetExecutiveDashboardQuery();

  const stats = statsRes;
  const exec = execRes?.data;
  const isLoading = statsLoading || execLoading;

  const showFinance = hasFeatureAccess(userInfo, 'finance');
  const showAttendance = hasFeatureAccess(userInfo, 'attendance');

  if (isLoading) {
    return (
      <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-5 space-y-3">
          <Skeleton className="h-5 w-32 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const kpis = exec?.kpis || [];
  const recentActivity = exec?.recentActivity || [];

  const summaryItems = [
    { label: 'Students', value: stats?.totalStudents || 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Teachers', value: stats?.totalTeachers || 0, icon: Users, color: 'bg-indigo-500' },
    { label: 'Attendance', value: `${stats?.attendanceRate || 0}%`, icon: Activity, color: 'bg-emerald-500' },
    ...(showFinance ? [
      { label: 'Revenue', value: formatCurrency(stats?.totalRevenue), icon: DollarSign, color: 'bg-violet-500' },
      { label: 'Monthly', value: formatCurrency(stats?.monthlyRevenue), icon: TrendingUp, color: 'bg-amber-500' },
      { label: 'Today', value: formatCurrency(stats?.todayRevenue), icon: Calendar, color: 'bg-teal-500' },
    ] : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.45 }}
    >
      <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden">
        <CardHeader className="pb-2 pt-4 px-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center">
              <BarChart3 size={14} className="text-violet-500" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">Executive Summary</CardTitle>
              <CardDescription className="text-[10px]">Key metrics at a glance</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {summaryItems.map((item, i) => (
              <SummaryCard key={item.label} {...item} index={i} />
            ))}
          </div>

          {kpis.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">BI Insights</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {kpis.slice(0, 6).map((kpi, i) => (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.04 }}
                    className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center"
                  >
                    <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 truncate">{kpi.label}</p>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white">{kpi.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {recentActivity.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">Recent Activity</p>
              <div className="space-y-1 max-h-[120px] overflow-y-auto">
                {recentActivity.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className={cn(
                      'w-5 h-5 rounded-md flex items-center justify-center shrink-0',
                      item.type === 'payment' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'
                    )}>
                      {item.type === 'payment' ? <TrendingUp size={10} /> : <Activity size={10} />}
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-300 flex-1 truncate">{item.text}</p>
                    <span className="text-[8px] text-slate-400 shrink-0">
                      {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(ExecutiveSummary);
