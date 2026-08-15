import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Search, AlertTriangle, TrendingDown, TrendingUp,
  Users, ArrowRight, Lightbulb, X
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { useGetStudentRiskQuery } from '../store/apiSlice';
import { Skeleton } from '../components/ui/skeleton';

const riskConfig = {
  high: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', border: 'border-red-200 dark:border-red-800/50', bg: 'bg-red-50 dark:bg-red-900/10', icon: AlertTriangle, trend: 'TrendingDown' },
  medium: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800/50', bg: 'bg-amber-50 dark:bg-amber-900/10', icon: TrendingDown, trend: 'TrendingUp' },
  low: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', border: 'border-green-200 dark:border-green-800/50', bg: 'bg-green-50 dark:bg-green-900/10', icon: Shield, trend: 'TrendingUp' },
};

const riskOrder = { high: 0, medium: 1, low: 2 };

const RiskAssessment = () => {
  const { data: response, isLoading } = useGetStudentRiskQuery();
  const riskData = response?.data || [];

  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const riskCounts = riskData.reduce(
    (acc, s) => {
      const level = (s.riskLevel || '').toLowerCase();
      if (level === 'high') acc.high++;
      else if (level === 'medium') acc.medium++;
      else acc.low++;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );

  const filteredData = useMemo(() => {
    let data = [...riskData];

    if (activeFilter !== 'All') {
      data = data.filter(s => (s.riskLevel || '').toLowerCase() === activeFilter.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(s =>
        (s.student?.name || '').toLowerCase().includes(q) ||
        (s.student?.class?.name || '').toLowerCase().includes(q) ||
        (s.reason || '').toLowerCase().includes(q) ||
        (s.recommendedAction || '').toLowerCase().includes(q)
      );
    }

    data.sort((a, b) => {
      const aLevel = riskOrder[(a.riskLevel || '').toLowerCase()] ?? 3;
      const bLevel = riskOrder[(b.riskLevel || '').toLowerCase()] ?? 3;
      return aLevel - bLevel;
    });

    return data;
  }, [riskData, activeFilter, searchQuery]);

  const filters = [
    { label: 'All', count: riskData.length },
    { label: 'High', count: riskCounts.high },
    { label: 'Medium', count: riskCounts.medium },
    { label: 'Low', count: riskCounts.low },
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 w-full rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Shield className="text-indigo-600" size={32} />
          Risk Assessment
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">
          Monitor and manage at-risk students with actionable insights.
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0 }}>
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                  <Users size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{riskData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-red-500 dark:text-red-400 uppercase">High</p>
                  <p className="text-xl font-black text-red-600 dark:text-red-400">{riskCounts.high}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <TrendingDown size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase">Medium</p>
                  <p className="text-xl font-black text-amber-600 dark:text-amber-400">{riskCounts.medium}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                  <Shield size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-green-500 dark:text-green-400 uppercase">Low</p>
                  <p className="text-xl font-black text-green-600 dark:text-green-400">{riskCounts.low}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map(f => {
          const isActive = activeFilter === f.label;
          return (
            <button
              key={f.label}
              onClick={() => setActiveFilter(f.label)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
              <span className={`px-1.5 py-0.5 rounded-md text-xs ${
                isActive ? 'bg-indigo-500 text-indigo-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, class, reason, or recommendation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 focus:border-indigo-500 outline-none transition font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
          >
            <X size={14} className="text-slate-400" />
          </button>
        )}
      </div>

      {/* Risk Cards */}
      {filteredData.length === 0 ? (
        <Card className="rounded-2xl border-none shadow-sm">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Shield size={40} className="text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-1">No Matches Found</h3>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                {searchQuery ? 'Try adjusting your search criteria.' : 'No students match the selected risk level.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredData.map((student, i) => {
              const level = (student.riskLevel || '').toLowerCase();
              const config = riskConfig[level] || riskConfig.low;
              const TrendIcon = config.trend === 'TrendingDown' ? TrendingDown : TrendingUp;

              return (
                <motion.div
                  key={student.student?._id || i}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: 0.03 * Math.min(i, 10) }}
                >
                  <Card className={`rounded-2xl border-none shadow-sm overflow-hidden ${config.bg}`}>
                    <CardContent className="p-0">
                      <div className={`border-l-4 ${config.border} p-5`}>
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          {/* Left: Student Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center flex-shrink-0">
                                <config.icon size={16} className={
                                  level === 'high' ? 'text-red-500' : level === 'medium' ? 'text-amber-500' : 'text-green-500'
                                } />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                                  {student.student?.name || 'Unknown Student'}
                                </h3>
                                {student.student?.class?.name && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{student.student.class.name}</p>
                                )}
                              </div>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${config.color}`}>
                                {student.riskLevel || 'Unknown'}
                              </span>
                            </div>

                            {/* Reason */}
                            {student.reason && (
                              <div className="mt-3 pl-12">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Reason</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{student.reason}</p>
                              </div>
                            )}

                            {/* Recommendation */}
                            {student.recommendedAction && (
                              <div className="mt-3 pl-12 flex items-start gap-2">
                                <Lightbulb size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-0.5">Recommendation</p>
                                  <p className="text-sm text-slate-700 dark:text-slate-300">{student.recommendedAction}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right: Trend Indicator */}
                          <div className="flex-shrink-0 self-center">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              level === 'high' ? 'bg-red-100 dark:bg-red-900/30' : level === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30'
                            }`}>
                              <TrendIcon size={18} className={
                                level === 'high' ? 'text-red-500' : level === 'medium' ? 'text-amber-500' : 'text-green-500'
                              } />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default RiskAssessment;
