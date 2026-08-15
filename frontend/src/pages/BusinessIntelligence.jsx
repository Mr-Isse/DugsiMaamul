import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Users, CreditCard, AlertTriangle, GraduationCap,
  DollarSign, ArrowUpDown, ChevronUp, ChevronDown, BookOpen, Shield
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import {
  useGetBusinessIntelligenceQuery,
  useGetEnterpriseOverviewQuery,
  useGetTeacherPerformanceQuery,
  useGetStudentRiskQuery,
  useGetFeeForecastQuery
} from '../store/apiSlice';
import { Skeleton } from '../components/ui/skeleton';

const StatCard = ({ icon: Icon, label, value, gradient, subtext, delay }) => (
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
            {subtext && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtext}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const BusinessIntelligence = () => {
  const { data: biRes, isLoading: biLoading } = useGetBusinessIntelligenceQuery();
  const { data: overviewRes, isLoading: overviewLoading } = useGetEnterpriseOverviewQuery();
  const { data: teacherRes, isLoading: teacherLoading } = useGetTeacherPerformanceQuery();
  const { data: riskRes, isLoading: riskLoading } = useGetStudentRiskQuery();
  const { data: feeRes, isLoading: feeLoading } = useGetFeeForecastQuery();

  const overview = overviewRes?.data || {};
  const teachers = teacherRes?.data || [];
  const riskStudents = riskRes?.data || [];
  const fees = feeRes?.data || {};

  const isLoading = overviewLoading || teacherLoading || riskLoading || feeLoading;

  const [teacherSort, setTeacherSort] = useState({ field: 'attendanceRate', dir: 'desc' });
  const [riskFilter, setRiskFilter] = useState('All');

  const atRiskCount = riskStudents.filter(s => (s.riskLevel || '').toLowerCase() === 'high').length;

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

  const sortedTeachers = useMemo(() => {
    const sorted = [...teachers];
    sorted.sort((a, b) => {
      const aVal = a[teacherSort.field] || 0;
      const bVal = b[teacherSort.field] || 0;
      return teacherSort.dir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return sorted;
  }, [teachers, teacherSort]);

  const filteredRisk = riskStudents.filter(s => {
    if (riskFilter === 'All') return true;
    return (s.riskLevel || '').toLowerCase() === riskFilter.toLowerCase();
  });

  const toggleTeacherSort = (field) => {
    setTeacherSort(prev => ({
      field,
      dir: prev.field === field && prev.dir === 'desc' ? 'asc' : 'desc'
    }));
  };

  const SortIcon = ({ field }) => {
    if (teacherSort.field !== field) return <ArrowUpDown size={14} className="text-slate-300 dark:text-slate-600" />;
    return teacherSort.dir === 'asc'
      ? <ChevronUp size={14} className="text-indigo-600" />
      : <ChevronDown size={14} className="text-indigo-600" />;
  };

  const maxRevenue = Math.max(fees.expectedRevenue || 0, 1);

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
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <TrendingUp className="text-indigo-600" size={32} />
          Business Intelligence
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">
          Comprehensive analytics and performance insights.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={GraduationCap} label="Students" value={overview.students || 0} gradient="from-indigo-500 to-indigo-600" delay={0} />
        <StatCard icon={Users} label="Teachers" value={overview.teachers || 0} gradient="from-emerald-500 to-emerald-600" delay={0.1} />
        <StatCard icon={DollarSign} label="Revenue" value={`$${Number(fees.collected || 0).toLocaleString()}`} gradient="from-blue-500 to-blue-600" subtext={`of $${Number(fees.expectedRevenue || 0).toLocaleString()} expected`} delay={0.2} />
        <StatCard icon={AlertTriangle} label="At-Risk Students" value={atRiskCount} gradient="from-red-500 to-red-600" subtext={`${riskStudents.length} total tracked`} delay={0.3} />
      </div>

      {/* Revenue Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard size={20} className="text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Breakdown</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Expected', value: fees.expectedRevenue, color: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20', borderColor: 'border-blue-100 dark:border-blue-900/40' },
                { label: 'Collected', value: fees.collected, color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', borderColor: 'border-emerald-100 dark:border-emerald-900/40' },
                { label: 'Outstanding', value: fees.outstanding, color: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/20', borderColor: 'border-amber-100 dark:border-amber-900/40' }
              ].map((item) => (
                <div key={item.label} className={`p-4 rounded-xl border ${item.bgColor} ${item.borderColor}`}>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                  <p className={`text-2xl font-black ${item.textColor}`}>${Number(item.value || 0).toLocaleString()}</p>
                  <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${maxRevenue > 0 ? Math.min(((item.value || 0) / maxRevenue) * 100, 100) : 0}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${item.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Teacher Performance Table */}
      {sortedTeachers.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 pb-0">
                <div className="flex items-center gap-2 mb-5">
                  <BookOpen size={20} className="text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Teacher Performance</h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                      <th className="text-left py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Teacher</th>
                      <th
                        onClick={() => toggleTeacherSort('attendanceRate')}
                        className="text-left py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-indigo-600 select-none"
                      >
                        <span className="flex items-center gap-1">Attendance <SortIcon field="attendanceRate" /></span>
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Performance Bar</th>
                      <th
                        onClick={() => toggleTeacherSort('studentPerformance')}
                        className="text-right py-3 px-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-indigo-600 select-none"
                      >
                        <span className="flex items-center justify-end gap-1">Student Avg <SortIcon field="studentPerformance" /></span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedTeachers.map((tp, i) => (
                      <motion.tr
                        key={tp.teacher?._id || i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.05 * i }}
                        className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3 px-6">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{tp.teacher?.name || 'Unknown'}</span>
                        </td>
                        <td className="py-3 px-6">
                          <span className={`text-sm font-bold ${(tp.attendanceRate || 0) >= 90 ? 'text-emerald-600 dark:text-emerald-400' : (tp.attendanceRate || 0) >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                            {tp.attendanceRate || 0}%
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          <div className="w-full max-w-[200px] h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${(tp.attendanceRate || 0) >= 90 ? 'bg-emerald-500' : (tp.attendanceRate || 0) >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(tp.attendanceRate || 0, 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-6 text-right">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{tp.studentPerformance || 0}%</span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Student Risk Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <Shield size={20} className="text-red-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Student Risk Breakdown</h2>
            </div>

            {/* Risk Count Cards */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <button
                onClick={() => setRiskFilter('All')}
                className={`text-center p-3 rounded-xl border transition-all ${riskFilter === 'All' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 ring-2 ring-indigo-200 dark:ring-indigo-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:bg-slate-100'}`}
              >
                <p className="text-2xl font-black text-slate-900 dark:text-white">{riskStudents.length}</p>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">All</p>
              </button>
              <button
                onClick={() => setRiskFilter('High')}
                className={`text-center p-3 rounded-xl border transition-all ${riskFilter === 'High' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 ring-2 ring-red-200 dark:ring-red-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:bg-slate-100'}`}
              >
                <p className="text-2xl font-black text-red-600 dark:text-red-400">{riskCounts.high}</p>
                <p className="text-xs font-bold text-red-500 dark:text-red-400 mt-0.5">High</p>
              </button>
              <button
                onClick={() => setRiskFilter('Medium')}
                className={`text-center p-3 rounded-xl border transition-all ${riskFilter === 'Medium' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 ring-2 ring-amber-200 dark:ring-amber-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 hover:bg-slate-100'}`}
              >
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{riskCounts.medium}</p>
                <p className="text-xs font-bold text-amber-500 dark:text-amber-400 mt-0.5">Medium</p>
              </button>
            </div>

            {/* Filtered Risk List */}
            {filteredRisk.length === 0 ? (
              <div className="text-center py-8">
                <Shield size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-slate-400 dark:text-slate-500">No students match this filter.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {filteredRisk.map((student, i) => {
                  const level = (student.riskLevel || '').toLowerCase();
                  const badgeClass = level === 'high'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : level === 'medium'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
                  return (
                    <div key={student.student?._id || i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                          <Users size={14} className="text-slate-500 dark:text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{student.student?.name || 'Unknown'}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{student.reason || 'No reason provided'}</p>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ml-3 ${badgeClass}`}>
                        {student.riskLevel || 'Unknown'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default BusinessIntelligence;
