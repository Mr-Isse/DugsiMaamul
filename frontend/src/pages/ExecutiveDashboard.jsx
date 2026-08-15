import { motion } from 'framer-motion';
import {
  GraduationCap, Users, School, DollarSign, TrendingUp,
  AlertTriangle, BookOpen, Shield, Activity, Clock, FileText, ArrowUpRight
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import {
  useGetEnterpriseOverviewQuery,
  useGetTeacherPerformanceQuery,
  useGetFeeForecastQuery,
  useGetStudentRiskQuery
} from '../store/apiSlice';
import { Skeleton } from '../components/ui/skeleton';

const StatCard = ({ icon: Icon, label, value, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center gap-4 p-5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient}`}>
            <Icon size={22} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const ProgressBar = ({ value, max, color, label }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-sm font-bold text-slate-900 dark:text-white">${Number(value || 0).toLocaleString()}</span>
      </div>
      <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
};

const ExecutiveDashboard = () => {
  const { data: overviewRes, isLoading: overviewLoading } = useGetEnterpriseOverviewQuery();
  const { data: teacherRes, isLoading: teacherLoading } = useGetTeacherPerformanceQuery();
  const { data: feeRes, isLoading: feeLoading } = useGetFeeForecastQuery();
  const { data: riskRes, isLoading: riskLoading } = useGetStudentRiskQuery();

  const overview = overviewRes?.data || {};
  const teachers = teacherRes?.data || [];
  const fees = feeRes?.data || {};
  const riskStudents = riskRes?.data || [];

  const isLoading = overviewLoading || teacherLoading || feeLoading || riskLoading;

  const topTeachers = [...teachers]
    .sort((a, b) => (b.attendanceRate || 0) - (a.attendanceRate || 0))
    .slice(0, 5);

  const riskCounts = riskStudents.reduce(
    (acc, s) => {
      const level = (s.riskLevel || '').toLowerCase();
      if (level === 'high') acc.high++;
      else if (level === 'medium') acc.medium++;
      else acc.low++;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  const collectionRate = fees.expectedRevenue > 0
    ? Math.round((fees.collected / fees.expectedRevenue) * 100)
    : 0;

  const alerts = [];
  if (riskCounts.high > 0) alerts.push({ icon: AlertTriangle, text: `${riskCounts.high} high-risk student(s) need attention`, color: 'text-red-500' });
  if (overview.pendingConsents > 0) alerts.push({ icon: FileText, text: `${overview.pendingConsents} pending consent form(s)`, color: 'text-orange-500' });
  if (overview.apiErrors24h > 0) alerts.push({ icon: Activity, text: `${overview.apiErrors24h} API error(s) in the last 24 hours`, color: 'text-red-500' });
  if (fees.outstanding > 0) alerts.push({ icon: DollarSign, text: `$${Number(fees.outstanding).toLocaleString()} in outstanding fees`, color: 'text-amber-500' });
  alerts.push({ icon: Clock, text: `${overview.activeScheduledReports || 0} scheduled report(s) active`, color: 'text-blue-500' });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Shield className="text-indigo-600" size={32} />
          Executive Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">
          High-level overview of school operations and performance.
        </p>
      </div>

      {/* Hero Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={GraduationCap} label="Students" value={overview.students || 0} gradient="from-indigo-500 to-indigo-600" delay={0} />
        <StatCard icon={Users} label="Teachers" value={overview.teachers || 0} gradient="from-emerald-500 to-emerald-600" delay={0.1} />
        <StatCard icon={School} label="Classes" value={overview.classes || 0} gradient="from-blue-500 to-blue-600" delay={0.2} />
        <StatCard icon={DollarSign} label="Revenue Collected" value={`$${Number(fees.collected || 0).toLocaleString()}`} gradient="from-amber-500 to-orange-500" delay={0.3} />
      </div>

      {/* Revenue Forecast */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={20} className="text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Forecast</h2>
              <span className="ml-auto text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                {collectionRate}% collected
              </span>
            </div>
            <div className="space-y-4">
              <ProgressBar value={fees.expectedRevenue} max={fees.expectedRevenue} color="bg-blue-500" label="Expected Revenue" />
              <ProgressBar value={fees.collected} max={fees.expectedRevenue} color="bg-emerald-500" label="Collected" />
              <ProgressBar value={fees.outstanding} max={fees.expectedRevenue} color="bg-amber-500" label="Outstanding" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teacher Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <Card className="rounded-2xl border-none shadow-sm h-full">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <BookOpen size={20} className="text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Teacher Performance</h2>
              </div>
              {topTeachers.length === 0 ? (
                <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">No teacher data available.</p>
              ) : (
                <div className="space-y-4">
                  {topTeachers.map((tp, i) => (
                    <div key={tp.teacher?._id || i} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[70%]">
                          {tp.teacher?.name || 'Unknown'}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{tp.attendanceRate || 0}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(tp.attendanceRate || 0, 100)}%` }}
                          transition={{ duration: 1, delay: 0.1 * i }}
                          className={`h-full rounded-full ${(tp.attendanceRate || 0) >= 90 ? 'bg-emerald-500' : (tp.attendanceRate || 0) >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                        />
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500">Student avg: {tp.studentPerformance || 0}%</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Overview & Alerts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="space-y-6">
          {/* Risk Badges */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <AlertTriangle size={20} className="text-red-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Risk Overview</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40">
                  <p className="text-2xl font-black text-red-600 dark:text-red-400">{riskCounts.high}</p>
                  <p className="text-xs font-bold text-red-500 dark:text-red-400 mt-0.5">High Risk</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40">
                  <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{riskCounts.medium}</p>
                  <p className="text-xs font-bold text-amber-500 dark:text-amber-400 mt-0.5">Medium</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/40">
                  <p className="text-2xl font-black text-green-600 dark:text-green-400">{riskCounts.low}</p>
                  <p className="text-xs font-bold text-green-500 dark:text-green-400 mt-0.5">Low Risk</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={20} className="text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Alerts</h2>
              </div>
              <div className="space-y-3">
                {alerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <alert.icon size={16} className={`${alert.color} mt-0.5 flex-shrink-0`} />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{alert.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
