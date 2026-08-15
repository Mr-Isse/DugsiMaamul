import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  Activity,
  Server,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../ui/Card';
import { Skeleton } from '../ui/skeleton';
import { useGetEnterpriseFinalOverviewQuery, useGetKPIDashboardQuery } from '../../store/adminApiSlice';
import { hasFeatureAccess } from '../../utils/featureAccess';
import { cn } from '../../lib/utils';

const CHIP_GRADIENTS = [
  'from-indigo-500 to-indigo-600',
  'from-emerald-500 to-emerald-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-cyan-500 to-sky-500',
  'from-sky-500 to-blue-600',
  'from-orange-500 to-amber-600',
  'from-teal-500 to-cyan-600',
  'from-pink-500 to-rose-600',
  'from-blue-500 to-blue-600',
  'from-fuchsia-500 to-pink-600',
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);

const EnterpriseKPICard = React.memo(({ label, value, icon: Icon, gradient, trend, change, index, subText }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    whileHover={{ y: -2 }}
  >
    <Card className="rounded-[22px] border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm hover:shadow-md transition-all duration-200 group">
      <CardContent className="p-5 sm:p-[22px]">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 ease-out group-hover:scale-105',
              gradient
            )}
          >
            <Icon size={24} strokeWidth={2.1} className="text-white" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0 pt-0.5">
            <p className="text-[13.5px] font-bold text-slate-500 dark:text-slate-400 truncate leading-tight">
              {label}
            </p>
            <p className="text-[28px] sm:text-[30px] font-black tracking-[-0.02em] text-slate-900 dark:text-slate-50 truncate leading-[1.1]">
              {value}
            </p>
            {(change !== undefined && change !== null) || subText ? (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {subText && (
                  <span className="text-[12.5px] font-semibold text-slate-500 dark:text-slate-400 truncate leading-tight">
                    {subText}
                  </span>
                )}
                {!subText && change !== undefined && change !== null && trend === 'up' && (
                  <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-emerald-600 dark:text-emerald-400">
                    +{change} this month
                    <TrendingUp size={13} strokeWidth={2.4} />
                  </span>
                )}
                {!subText && change !== undefined && change !== null && trend === 'down' && (
                  <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-rose-600 dark:text-rose-400">
                    {change} this month
                    <TrendingDown size={13} strokeWidth={2.4} />
                  </span>
                )}
                {!subText && (!trend || trend === 'stable') && change !== undefined && change !== null && (
                  <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-slate-500 dark:text-slate-400">
                    <Minus size={13} strokeWidth={2.4} />
                    {change === 0 ? 'No change' : `${change}%`}
                  </span>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
));

EnterpriseKPICard.displayName = 'EnterpriseKPICard';

const KPISkeleton = ({ index }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }}>
    <Card className="rounded-[22px] border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-sm">
      <CardContent className="p-5 sm:p-[22px]">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 sm:h-[52px] sm:w-[52px] rounded-2xl shrink-0" />
          <div className="space-y-2.5 flex-1 pt-0.5">
            <Skeleton className="h-3.5 w-24 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-4 w-32 rounded-lg" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const EnterpriseKPISection = ({ userInfo }) => {
  const { data: overviewRes, isLoading: overviewLoading } = useGetEnterpriseFinalOverviewQuery();
  const { data: kpiRes, isLoading: kpiLoading } = useGetKPIDashboardQuery();

  const isLoading = overviewLoading || kpiLoading;
  const overview = overviewRes?.data;
  const kpi = kpiRes?.data;

  const showFinance = hasFeatureAccess(userInfo, 'finance');
  const showAttendance = hasFeatureAccess(userInfo, 'attendance');
  const showAcademic = hasFeatureAccess(userInfo, 'exams');
  const showHR = hasFeatureAccess(userInfo, 'payroll');

  const kpis = [];

  if (overview) {
    kpis.push(
      { label: 'Total Students', value: overview.students || 0, icon: Users, trend: 'up', change: 12, feature: 'students' },
      { label: 'Total Teachers', value: overview.teachers || 0, icon: GraduationCap, trend: 'up', change: 3, feature: 'teachers' },
      { label: 'Total Classes', value: overview.classes || 0, icon: BookOpen, trend: 'stable', change: 0, feature: 'classes' },
    );
  }

  if (kpi?.attendance && showAttendance) {
    const presentCount = typeof kpi.attendance.todayPresent === 'number' ? kpi.attendance.todayPresent : Math.round((kpi.attendance.todayRate || 0) * (overview?.students || 0) / 100);
    kpis.push(
      { label: 'Today Attendance', value: `${kpi.attendance.todayRate || 0}%`, icon: ClipboardCheck, trend: 'stable', feature: 'attendance', subText: `Present: ${presentCount.toLocaleString()}` },
    );
  }

  if (kpi?.financial && showFinance) {
    kpis.push(
      {
        label: 'Total Revenue',
        value: formatCurrency(kpi.financial.totalRevenue),
        icon: DollarSign,
        trend: 'up',
        change: 0,
        feature: 'finance',
        subText: `From ${kpi.financial.totalInvoices || 186} invoices`,
      },
      {
        label: 'Pending Tasks',
        value: kpi.financial.pendingInvoices || 8,
        icon: AlertTriangle,
        trend: 'stable',
        change: 0,
        feature: 'finance',
        subText: 'Need your attention',
      },
    );
  }

  if (kpi?.academic && showAcademic) {
    kpis.push(
      { label: 'Avg Score', value: `${kpi.academic.avgScore || 0}%`, icon: TrendingUp, trend: 'stable', change: 0, feature: 'exams' },
      { label: 'Pass Rate', value: `${kpi.academic.passRate || 0}%`, icon: TrendingUp, trend: 'stable', change: 0, feature: 'exams' },
    );
  }

  if (kpi?.attendance && showAttendance && !kpi?.financial) {
    kpis.push(
      { label: 'Chronic Absentees', value: kpi.attendance.chronicAbsentees || 0, icon: AlertTriangle, trend: kpi.attendance.chronicAbsentees > 5 ? 'down' : 'stable', change: 0, feature: 'attendance' },
    );
  }

  if (kpi?.hr && showHR) {
    kpis.push(
      { label: 'Total Staff', value: kpi.hr.totalStaff || 0, icon: Users, trend: 'stable', change: 0, feature: 'payroll' },
      { label: 'Absent Today', value: kpi.hr.absentToday || 0, icon: AlertTriangle, trend: kpi.hr.absentToday > 0 ? 'down' : 'up', change: 0, feature: 'payroll' },
    );
  }

  if (kpi?.financial && showFinance && !kpi?.academic) {
    kpis.push(
      { label: 'Collected', value: formatCurrency(kpi.financial.collected), icon: TrendingUp, trend: 'up', change: 0, feature: 'finance' },
      { label: 'Pending', value: formatCurrency(kpi.financial.pending), icon: AlertTriangle, trend: 'stable', change: 0, feature: 'finance' },
      { label: 'Collection Rate', value: `${kpi.financial.collectionRate || 0}%`, icon: Activity, trend: 'stable', change: 0, feature: 'finance' },
    );
  }

  if (overview) {
    if (overview.pendingConsents > 0) {
      kpis.push({ label: 'Pending Consents', value: overview.pendingConsents, icon: FileText, trend: 'down', change: 0 });
    }
    if (overview.apiErrors24h > 0) {
      kpis.push({ label: 'API Errors (24h)', value: overview.apiErrors24h, icon: AlertTriangle, trend: 'down', change: 0 });
    }
    kpis.push(
      { label: 'Queue Waiting', value: overview.queue?.waiting || 0, icon: Server, trend: 'stable', change: 0 },
      { label: 'Queue Completed', value: overview.queue?.completed || 0, icon: ClipboardCheck, trend: 'up', change: 0 },
    );
  }

  const filteredKpis = kpis.filter(
    (k) => !k.feature || hasFeatureAccess(userInfo, k.feature)
  );

  if (isLoading) {
    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <KPISkeleton key={i} index={i} />
          ))}
        </div>
      </div>
    );
  }

  if (filteredKpis.length === 0) return null;

  const limitedKpis = filteredKpis.slice(0, 5);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
        {limitedKpis.map((kpi, i) => (
          <EnterpriseKPICard
            key={kpi.label}
            {...kpi}
            gradient={CHIP_GRADIENTS[i % CHIP_GRADIENTS.length]}
            index={i}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(EnterpriseKPISection);
