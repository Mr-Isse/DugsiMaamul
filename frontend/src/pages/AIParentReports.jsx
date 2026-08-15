import { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Clock,
  BarChart3,
  User,
  BookOpen,
  Calendar,
  Star,
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

const AIParentReports = () => {
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

  const subjectResults = useMemo(() => {
    if (!resultsData) return [];
    const results = resultsData?.allResults || (Array.isArray(resultsData) ? resultsData : []);
    return results.map((r) => {
      const score = r.total || 0;
      const prev = r.previousScore || null;
      const trend = prev !== null ? (score > prev ? 'improving' : score < prev ? 'declining' : 'stable') : 'stable';
      return {
        name: r.subject?.name || 'Unknown',
        code: r.subject?.code || '',
        score,
        grade: getGrade(score),
        trend,
        midterm: r.midterm || 0,
        final: r.final || 0,
      };
    });
  }, [resultsData]);

  const overallAverage = useMemo(() => {
    if (subjectResults.length === 0) return 0;
    return Math.round(subjectResults.reduce((a, b) => a + b.score, 0) / subjectResults.length);
  }, [subjectResults]);

  const attendanceRate = useMemo(() => {
    if (!attendanceData) return 0;
    const records = attendanceData?.attendance || (Array.isArray(attendanceData) ? attendanceData : []);
    if (records.length === 0) return 0;
    const present = records.filter((r) => r.status === 'present' || r.status === 'Present').length;
    return Math.round((present / records.length) * 100);
  }, [attendanceData]);

  const classPositionEstimate = useMemo(() => {
    if (overallAverage >= 80) return 'Top 10%';
    if (overallAverage >= 70) return 'Top 25%';
    if (overallAverage >= 60) return 'Top 50%';
    if (overallAverage >= 50) return 'Middle 50%';
    return 'Bottom 50%';
  }, [overallAverage]);

  const aiNarrative = useMemo(() => {
    if (!selectedStudent || subjectResults.length === 0) return '';
    const firstName = selectedStudent.name?.split(' ')[0] || 'The student';
    const overallGrade = getGrade(overallAverage);
    const best = subjectResults.reduce((best, s) => (s.score > best.score ? s : best), subjectResults[0]);
    const weakest = subjectResults.reduce((worst, s) => (s.score < worst.score ? s : worst), subjectResults[0]);
    const improving = subjectResults.filter((s) => s.trend === 'improving').length;
    const declining = subjectResults.filter((s) => s.trend === 'declining').length;

    let para1 = `${firstName} has achieved an overall average of ${overallAverage}% (Grade ${overallGrade.letter}) this term. `;
    para1 += `Their strongest subject is ${best.name} with a score of ${best.score}%, `;
    para1 += `while ${weakest.name} at ${weakest.score}% presents an area for improvement.`;

    let para2 = `Attendance stands at ${attendanceRate}%, `;
    para2 += attendanceRate >= 90
      ? 'which is commendable and positively reflects on academic consistency.'
      : attendanceRate >= 75
      ? 'which is satisfactory but could be improved for better academic outcomes.'
      : 'which is below the recommended threshold and may be impacting grades.';

    let para3 = '';
    if (improving > 0) {
      para3 += `${firstName} has shown improvement in ${improving} subject${improving > 1 ? 's' : ''}. `;
    }
    if (declining > 0) {
      para3 += `However, ${declining} subject${declining > 1 ? 's' : ''} show${declining === 1 ? 's' : ''} a declining trend and need${declining === 1 ? 's' : ''} attention.`;
    }
    if (!para3) {
      para3 = 'Performance has remained relatively stable across all subjects.';
    }

    return `${para1} ${para2} ${para3}`;
  }, [selectedStudent, subjectResults, overallAverage, attendanceRate]);

  const trendIcon = (trend) => {
    if (trend === 'improving') return <TrendingUp size={14} className="text-emerald-500" />;
    if (trend === 'declining') return <TrendingDown size={14} className="text-rose-500" />;
    return <Minus size={14} className="text-slate-400" />;
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <FileText className="text-indigo-600" size={32} />
            AI Parent Reports
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">
            Generate intelligent parent report summaries.
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          {selectedStudentId && (
            <div className="flex gap-2">
              <button className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <Printer size={18} className="text-slate-600 dark:text-slate-400" />
              </button>
              <button className="p-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/25">
                <Download size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {!selectedStudentId ? (
        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="mx-auto w-24 h-24 rounded-3xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-6">
              <FileText size={48} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Select a Student</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold">
              Choose a student to generate an AI-powered parent report.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="space-y-6">
          <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
        </div>
      ) : subjectResults.length === 0 ? (
        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="mx-auto w-24 h-24 rounded-3xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-6">
              <BarChart3 size={48} className="text-amber-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Results Found</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold">
              No exam results available to generate a report for this student.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Report Preview Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Student Report Card</p>
                    <h2 className="text-2xl font-black">{selectedStudent?.name} {selectedStudent?.surname || ''}</h2>
                    <p className="text-sm text-indigo-200 font-bold mt-1">
                      Class: {selectedStudent?.class?.name || 'N/A'} {selectedStudent?.class?.section || ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Academic Year</p>
                    <p className="text-lg font-black">{currentYear}</p>
                    <p className="text-xs font-bold text-indigo-200">Term 1</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
                    <Clock size={20} className="text-amber-500 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance</p>
                    <p className={`text-2xl font-black ${attendanceRate >= 80 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {attendanceRate}%
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
                    <Award size={20} className="text-indigo-500 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Grade</p>
                    <p className={`text-2xl font-black ${getGrade(overallAverage).color}`}>
                      {getGrade(overallAverage).letter} ({overallAverage}%)
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-center">
                    <Star size={20} className="text-violet-500 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class Position</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{classPositionEstimate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI-Generated Narrative */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="rounded-2xl border-none shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FileText size={16} className="text-indigo-600" />
                  AI-Generated Report Summary
                </h3>
                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {aiNarrative.split('. ').reduce((acc, sentence, idx) => {
                    if (idx % 2 === 0) acc.push([]);
                    acc[acc.length - 1].push(sentence);
                    return acc;
                  }, []).map((group, idx) => (
                    <p key={idx} className="text-slate-700 dark:text-slate-300">
                      {group.join('. ')}{group.length > 1 ? '.' : ''}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subject Breakdown Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="text-left p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                      <th className="text-center p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                      <th className="text-center p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</th>
                      <th className="text-center p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Midterm</th>
                      <th className="text-center p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Final</th>
                      <th className="text-center p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectResults.map((subject, idx) => (
                      <tr key={idx} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                              <BookOpen size={14} className="text-slate-500" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white">{subject.name}</p>
                              <p className="text-[10px] font-bold text-slate-400">{subject.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-sm font-black text-slate-900 dark:text-white">{subject.score}%</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`text-xs font-black px-3 py-1 rounded-lg ${subject.grade.bg} ${subject.grade.color}`}>
                            {subject.grade.letter}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{subject.midterm}%</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{subject.final}%</span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {trendIcon(subject.trend)}
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                              subject.trend === 'improving' ? 'text-emerald-500' :
                              subject.trend === 'declining' ? 'text-rose-500' : 'text-slate-400'
                            }`}>
                              {subject.trend}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AIParentReports;
