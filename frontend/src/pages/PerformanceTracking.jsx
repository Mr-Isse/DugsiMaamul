import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Clock,
  Award,
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  BookOpen,
  Activity,
  Hash,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import {
  useGetStudentsQuery,
  useGetStudentResultsQuery,
  useGetAttendanceQuery,
} from '../store/adminApiSlice';
import { motion } from 'framer-motion';

const BAR_COLORS = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500', 'bg-pink-500', 'bg-cyan-500', 'bg-orange-500'];

const PerformanceTracking = () => {
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const { data: students, isLoading: studentsLoading } = useGetStudentsQuery();
  const { data: resultsData, isLoading: resultsLoading } = useGetStudentResultsQuery(selectedStudentId, {
    skip: !selectedStudentId,
  });
  const { data: attendanceData, isLoading: attendanceLoading } = useGetAttendanceQuery(selectedStudentId, {
    skip: !selectedStudentId,
  });

  const isLoading = studentsLoading || resultsLoading || attendanceLoading;

  const studentList = useMemo(() => {
    if (!students) return [];
    return Array.isArray(students) ? students : students?.data || [];
  }, [students]);

  const subjectScores = useMemo(() => {
    if (!resultsData) return [];
    const results = resultsData?.allResults || (Array.isArray(resultsData) ? resultsData : []);
    const grouped = {};
    results.forEach((r) => {
      const name = r.subject?.name || 'Unknown';
      const score = r.total || 0;
      if (!grouped[name]) grouped[name] = { name, scores: [], raw: [] };
      grouped[name].scores.push(score);
      grouped[name].raw.push(r);
    });
    return Object.values(grouped).map((g) => ({
      name: g.name,
      avg: Math.round(g.scores.reduce((a, b) => a + b, 0) / g.scores.length),
      latest: g.scores[g.scores.length - 1],
      scores: g.scores,
    }));
  }, [resultsData]);

  const overallAverage = useMemo(() => {
    if (subjectScores.length === 0) return 0;
    return Math.round(subjectScores.reduce((a, b) => a + b.avg, 0) / subjectScores.length);
  }, [subjectScores]);

  const attendanceRate = useMemo(() => {
    if (!attendanceData) return 0;
    const records = attendanceData?.attendance || (Array.isArray(attendanceData) ? attendanceData : []);
    if (records.length === 0) return 0;
    const present = records.filter((r) => r.status === 'present' || r.status === 'Present').length;
    return Math.round((present / records.length) * 100);
  }, [attendanceData]);

  const rankEstimate = useMemo(() => {
    if (overallAverage >= 85) return '#1-3';
    if (overallAverage >= 75) return '#4-10';
    if (overallAverage >= 65) return '#11-20';
    if (overallAverage >= 50) return '#21-35';
    return '#35+';
  }, [overallAverage]);

  const improvementTrend = useMemo(() => {
    if (subjectScores.length === 0) return { direction: 'stable', percent: 0 };
    const allLatest = subjectScores.map((s) => s.latest);
    const allFirst = subjectScores.map((s) => s.scores[0] || s.latest);
    const avgLatest = allLatest.reduce((a, b) => a + b, 0) / allLatest.length;
    const avgFirst = allFirst.reduce((a, b) => a + b, 0) / allFirst.length;
    const diff = avgLatest - avgFirst;
    if (Math.abs(diff) < 2) return { direction: 'stable', percent: 0 };
    return {
      direction: diff > 0 ? 'up' : 'down',
      percent: Math.round(Math.abs(diff)),
    };
  }, [subjectScores]);

  const lastFiveScores = useMemo(() => {
    if (!resultsData) return [];
    const results = resultsData?.allResults || (Array.isArray(resultsData) ? resultsData : []);
    const all = results.map((r) => ({
      score: r.total || 0,
      subject: r.subject?.name || '',
    }));
    return all.slice(-5);
  }, [resultsData]);

  const subjectComparison = useMemo(() => {
    return subjectScores.map((s, idx) => ({
      ...s,
      color: BAR_COLORS[idx % BAR_COLORS.length],
    }));
  }, [subjectScores]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <TrendingUp className="text-indigo-600" size={32} />
            Performance Tracking
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">
            Track student performance, growth, and trends.
          </p>
        </div>
        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          className="px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        >
          <option value="">Select Student</option>
          {studentList.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name} {s.surname ? ` ${s.surname}` : ''}
            </option>
          ))}
        </select>
      </div>

      {!selectedStudentId ? (
        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="mx-auto w-24 h-24 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6">
              <TrendingUp size={48} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Select a Student</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold">
              Choose a student from the dropdown to view performance analytics.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
        </div>
      ) : subjectScores.length === 0 ? (
        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="mx-auto w-24 h-24 rounded-3xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-6">
              <BarChart3 size={48} className="text-amber-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Results Found</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold">
              No exam results available for this student yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Performance Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: BarChart3,
                label: 'Overall Score',
                value: `${overallAverage}%`,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50 dark:bg-indigo-900/20',
              },
              {
                icon: Clock,
                label: 'Attendance',
                value: `${attendanceRate}%`,
                color: 'text-emerald-600',
                bg: 'bg-emerald-50 dark:bg-emerald-900/20',
              },
              {
                icon: Hash,
                label: 'Rank Estimate',
                value: rankEstimate,
                color: 'text-violet-600',
                bg: 'bg-violet-50 dark:bg-violet-900/20',
              },
              {
                icon: improvementTrend.direction === 'up' ? TrendingUp : improvementTrend.direction === 'down' ? TrendingDown : Minus,
                label: 'Improvement',
                value: improvementTrend.percent > 0 ? `${improvementTrend.percent}%` : 'Stable',
                color: improvementTrend.direction === 'up' ? 'text-emerald-600' : improvementTrend.direction === 'down' ? 'text-rose-600' : 'text-slate-500',
                bg: improvementTrend.direction === 'up' ? 'bg-emerald-50 dark:bg-emerald-900/20' : improvementTrend.direction === 'down' ? 'bg-rose-50 dark:bg-rose-900/20' : 'bg-slate-50 dark:bg-slate-800',
              },
            ].map((card, idx) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${card.bg}`}>
                      <card.icon size={24} className={card.color} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
                      <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Score Trend - Last 5 Exams */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                <Activity size={16} className="text-indigo-600" />
                Recent Exam Scores
              </h3>
              {lastFiveScores.length === 0 ? (
                <p className="text-sm font-bold text-slate-400 text-center py-8">No recent scores available.</p>
              ) : (
                <div className="flex items-end gap-3 h-48">
                  {lastFiveScores.map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300">{item.score}%</span>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${item.score}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className={`w-full rounded-t-xl ${BAR_COLORS[idx % BAR_COLORS.length]} min-h-[4px]`}
                        style={{ maxHeight: '160px' }}
                      />
                      <span className="text-[10px] font-bold text-slate-400 truncate max-w-full" title={item.subject}>
                        {item.subject.length > 10 ? item.subject.substring(0, 10) + '...' : item.subject}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subject Comparison - Horizontal Bar Chart */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                <BookOpen size={16} className="text-emerald-600" />
                Subject Comparison
              </h3>
              <div className="space-y-4">
                {subjectComparison.map((subject, idx) => (
                  <div key={subject.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{subject.name}</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{subject.avg}%</span>
                    </div>
                    <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${subject.avg}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.08 }}
                        className={`h-full rounded-full ${subject.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attendance vs Performance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
                      <Clock size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance</p>
                      <p className="text-3xl font-black text-emerald-600">{attendanceRate}%</p>
                    </div>
                  </div>
                  <div className="w-full h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${attendanceRate}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${attendanceRate >= 80 ? 'bg-emerald-500' : attendanceRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {attendanceRate >= 90 ? (
                      <><ArrowUp size={14} className="text-emerald-500" /><span className="text-xs font-bold text-emerald-500">Excellent</span></>
                    ) : attendanceRate >= 75 ? (
                      <><Minus size={14} className="text-amber-500" /><span className="text-xs font-bold text-amber-500">Satisfactory</span></>
                    ) : (
                      <><ArrowDown size={14} className="text-rose-500" /><span className="text-xs font-bold text-rose-500">Needs Improvement</span></>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20">
                      <Award size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Score</p>
                      <p className="text-3xl font-black text-indigo-600">{overallAverage}%</p>
                    </div>
                  </div>
                  <div className="w-full h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${overallAverage}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full bg-indigo-500"
                    />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {improvementTrend.direction === 'up' ? (
                      <><ArrowUp size={14} className="text-emerald-500" /><span className="text-xs font-bold text-emerald-500">+{improvementTrend.percent}% improvement</span></>
                    ) : improvementTrend.direction === 'down' ? (
                      <><ArrowDown size={14} className="text-rose-500" /><span className="text-xs font-bold text-rose-500">-{improvementTrend.percent}% decline</span></>
                    ) : (
                      <><Minus size={14} className="text-slate-400" /><span className="text-xs font-bold text-slate-400">Stable performance</span></>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Growth Indicators */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                <Zap size={16} className="text-amber-600" />
                Growth Indicators
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {subjectScores.map((subject, idx) => {
                  const first = subject.scores[0] || 0;
                  const last = subject.latest;
                  const diff = last - first;
                  const isUp = diff > 0;
                  const isDown = diff < 0;
                  return (
                    <motion.div
                      key={subject.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-500">{subject.name}</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{subject.avg}%</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {isUp ? (
                          <ArrowUp size={18} className="text-emerald-500" />
                        ) : isDown ? (
                          <ArrowDown size={18} className="text-rose-500" />
                        ) : (
                          <Minus size={18} className="text-slate-400" />
                        )}
                        <span className={`text-xs font-black ${isUp ? 'text-emerald-500' : isDown ? 'text-rose-500' : 'text-slate-400'}`}>
                          {isUp ? '+' : ''}{diff}%
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PerformanceTracking;
