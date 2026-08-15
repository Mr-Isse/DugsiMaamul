import { useState, useMemo } from 'react';
import {
  Activity,
  Brain,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import {
  useGetStudentsQuery,
  useGetStudentResultsQuery,
  useGetAttendanceQuery,
} from '../store/adminApiSlice';
import { motion } from 'framer-motion';

const getGrade = (score) => {
  if (score >= 80) return { letter: 'A', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' };
  if (score >= 70) return { letter: 'B', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' };
  if (score >= 60) return { letter: 'C', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' };
  if (score >= 50) return { letter: 'D', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' };
  return { letter: 'F', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' };
};

const BAR_COLORS = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500', 'bg-pink-500', 'bg-cyan-500', 'bg-orange-500'];

const AILearningAssistant = () => {
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

  const selectedStudent = useMemo(() => {
    return studentList.find((s) => s._id === selectedStudentId);
  }, [studentList, selectedStudentId]);

  const subjectScores = useMemo(() => {
    if (!resultsData) return [];
    const results = resultsData?.allResults || (Array.isArray(resultsData) ? resultsData : []);
    const grouped = {};
    results.forEach((r) => {
      const name = r.subject?.name || 'Unknown';
      const score = r.total || 0;
      if (!grouped[name]) grouped[name] = { name, scores: [] };
      grouped[name].scores.push(score);
    });
    return Object.values(grouped).map((g) => ({
      name: g.name,
      avg: Math.round(g.scores.reduce((a, b) => a + b, 0) / g.scores.length),
    }));
  }, [resultsData]);

  const overallAverage = useMemo(() => {
    if (subjectScores.length === 0) return 0;
    return Math.round(subjectScores.reduce((a, b) => a + b.avg, 0) / subjectScores.length);
  }, [subjectScores]);

  const bestSubject = useMemo(() => {
    if (subjectScores.length === 0) return null;
    return subjectScores.reduce((best, s) => (s.avg > best.avg ? s : best), subjectScores[0]);
  }, [subjectScores]);

  const weakestSubject = useMemo(() => {
    if (subjectScores.length === 0) return null;
    return subjectScores.reduce((worst, s) => (s.avg < worst.avg ? s : worst), subjectScores[0]);
  }, [subjectScores]);

  const attendanceRate = useMemo(() => {
    if (!attendanceData) return 0;
    const records = attendanceData?.attendance || (Array.isArray(attendanceData) ? attendanceData : []);
    if (records.length === 0) return 0;
    const present = records.filter((r) => r.status === 'present' || r.status === 'Present').length;
    return Math.round((present / records.length) * 100);
  }, [attendanceData]);

  const recommendations = useMemo(() => {
    const recs = [];
    if (weakestSubject && weakestSubject.avg < 60) {
      recs.push({
        icon: AlertTriangle,
        text: `Focus on ${weakestSubject.name} — current average is ${weakestSubject.avg}%, below the 60% threshold.`,
        color: 'text-rose-600',
        bg: 'bg-rose-50 dark:bg-rose-900/20',
      });
    }
    if (bestSubject && bestSubject.avg >= 80) {
      recs.push({
        icon: Award,
        text: `Excellent performance in ${bestSubject.name} — ${bestSubject.avg}% average. Keep it up!`,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      });
    }
    if (attendanceRate >= 95) {
      recs.push({
        icon: CheckCircle,
        text: `Outstanding attendance at ${attendanceRate}% — consistent presence boosts academic performance.`,
        color: 'text-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
      });
    } else if (attendanceRate < 80) {
      recs.push({
        icon: Clock,
        text: `Attendance is ${attendanceRate}% — below optimal. Missing classes impacts grades significantly.`,
        color: 'text-amber-600',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
      });
    }
    if (overallAverage < 50) {
      recs.push({
        icon: Target,
        text: 'Overall average is below 50% — consider additional tutoring or study groups.',
        color: 'text-rose-600',
        bg: 'bg-rose-50 dark:bg-rose-900/20',
      });
    } else if (overallAverage >= 70) {
      recs.push({
        icon: TrendingUp,
        text: `Overall average of ${overallAverage}% is strong — maintain study discipline for continued growth.`,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      });
    }
    if (recs.length === 0) {
      recs.push({
        icon: Sparkles,
        text: 'Select a student to generate personalized AI recommendations.',
        color: 'text-slate-500',
        bg: 'bg-slate-50 dark:bg-slate-800',
      });
    }
    return recs;
  }, [weakestSubject, bestSubject, attendanceRate, overallAverage]);

  const studyTips = [
    { icon: BookOpen, text: 'Use active recall — test yourself instead of re-reading notes.' },
    { icon: Clock, text: 'Study in 25-minute Pomodoro intervals with 5-minute breaks.' },
    { icon: Target, text: 'Set weekly goals for each subject and track completion.' },
    { icon: Brain, text: 'Teach concepts to someone else — it reinforces understanding.' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Activity className="text-indigo-600" size={32} />
            AI Learning Assistant
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">
            AI-powered learning analytics and study recommendations.
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
              <Brain size={48} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Select a Student</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold">
              Choose a student from the dropdown to view AI-powered learning insights.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
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
          {/* Performance Analysis Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: BarChart3,
                label: 'Overall Average',
                value: `${overallAverage}%`,
                grade: getGrade(overallAverage),
                color: 'text-indigo-600',
                bg: 'bg-indigo-50 dark:bg-indigo-900/20',
              },
              {
                icon: Award,
                label: 'Best Subject',
                value: bestSubject?.name || 'N/A',
                sub: bestSubject ? `${bestSubject.avg}%` : '',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50 dark:bg-emerald-900/20',
              },
              {
                icon: Target,
                label: 'Weakest Subject',
                value: weakestSubject?.name || 'N/A',
                sub: weakestSubject ? `${weakestSubject.avg}%` : '',
                color: 'text-rose-600',
                bg: 'bg-rose-50 dark:bg-rose-900/20',
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
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
                      <p className={`text-xl font-black ${card.color} truncate`}>{card.value}</p>
                      {card.sub && <p className="text-xs font-bold text-slate-500">{card.sub}</p>}
                      {card.grade && (
                        <span className={`inline-block text-xs font-black px-2 py-0.5 rounded-lg mt-1 ${card.grade.bg} ${card.grade.color}`}>
                          Grade {card.grade.letter}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Subject-wise Performance Bar Chart */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                <BarChart3 size={16} className="text-indigo-600" />
                Subject-wise Performance
              </h3>
              <div className="space-y-4">
                {subjectScores.map((subject, idx) => (
                  <div key={subject.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{subject.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black ${getGrade(subject.avg).color}`}>{getGrade(subject.avg).letter}</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{subject.avg}%</span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${subject.avg}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`h-full rounded-full ${BAR_COLORS[idx % BAR_COLORS.length]}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Impact */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                <Clock size={16} className="text-amber-600" />
                Attendance Impact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Attendance Rate</span>
                    <span className={`text-lg font-black ${attendanceRate >= 80 ? 'text-emerald-600' : attendanceRate >= 60 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {attendanceRate}%
                    </span>
                  </div>
                  <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${attendanceRate}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${attendanceRate >= 80 ? 'bg-emerald-500' : attendanceRate >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Academic Average</span>
                    <span className={`text-lg font-black ${overallAverage >= 60 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {overallAverage}%
                    </span>
                  </div>
                  <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${overallAverage}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full bg-indigo-500"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs font-bold text-slate-500">
                  {attendanceRate >= 90 && overallAverage >= 70
                    ? 'Strong attendance correlates with high academic performance.'
                    : attendanceRate >= 80
                    ? 'Good attendance supports stable academic performance.'
                    : 'Low attendance may be negatively impacting grades. Prioritize consistency.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                <Sparkles size={16} className="text-violet-600" />
                AI Recommendations
              </h3>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`flex items-start gap-3 p-4 rounded-2xl ${rec.bg}`}
                  >
                    <rec.icon size={20} className={rec.color} />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{rec.text}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Study Tips */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-5 flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-600" />
                Study Tips
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {studyTips.map((tip, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50"
                  >
                    <tip.icon size={18} className="text-indigo-500 mt-0.5" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{tip.text}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AILearningAssistant;
