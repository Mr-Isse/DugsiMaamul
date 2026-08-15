import { useState } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Search,
  Filter,
  Download,
  Loader2,
  Crown,
  Star,
  Users,
  ChevronDown,
  Printer,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useGetMeritListQuery, useGetOnlineExamsQuery } from '../store/adminApiSlice';

const rankColors = {
  1: 'from-yellow-400 to-amber-500 text-white',
  2: 'from-gray-300 to-gray-400 text-gray-900',
  3: 'from-orange-300 to-orange-400 text-orange-900',
};

const rankBadge = (rank) => {
  if (rank === 1) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  if (rank === 2) return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  if (rank === 3) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
  return 'bg-primary/10 text-primary dark:bg-primary/20';
};

const gradeBadge = (grade) => {
  if (!grade) return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  if (grade.startsWith('A')) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
  if (grade.startsWith('B')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
  if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
  if (grade.startsWith('D')) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
};

const MeritListTab = ({ selectedExam }) => {
  const [examFilter, setExamFilter] = useState(selectedExam || '');
  const [classFilter, setClassFilter] = useState('');
  const [limitFilter, setLimitFilter] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: examsData } = useGetOnlineExamsQuery({});
  const { data: meritData, isLoading, refetch } = useGetMeritListQuery(
    examFilter ? { examId: examFilter, classId: classFilter || undefined, limit: limitFilter } : { limit: limitFilter },
    { skip: !examFilter }
  );

  const exams = examsData?.data || examsData?.exams || [];
  const meritList = meritData?.meritList || [];

  const filteredList = meritList.filter((entry) =>
    entry.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.student?.customId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!filteredList.length) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Rank', 'Name', 'ID', 'Score', 'Max Score', 'Percentage', 'Grade', 'GPA'];
    const csv = [
      headers.join(','),
      ...filteredList.map((e) =>
        [
          e.rank,
          `"${e.student?.name || ''}"`,
          e.student?.customId || '',
          e.score,
          e.maxScore,
          e.percentage?.toFixed(1),
          e.grade || '',
          e.gpa?.toFixed(2) || '',
        ].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `merit-list-${examFilter || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Merit list exported');
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Exam *</label>
            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Select Exam</option>
              {exams.map((ex) => (
                <option key={ex._id} value={ex._id}>{ex.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Limit</label>
            <select
              value={limitFilter}
              onChange={(e) => setLimitFilter(parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/40"
            >
              {[10, 25, 50, 100, 200].map((n) => (
                <option key={n} value={n}>Top {n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Search</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <Download size={14} />
              Export
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Printer size={14} />
            </button>
          </div>
        </div>
      </div>

      {!examFilter && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 shadow-sm text-center">
          <Trophy size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Select an Exam</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Choose an exam from the dropdown to view the merit list</p>
        </div>
      )}

      {examFilter && isLoading && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 shadow-sm flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      )}

      {examFilter && !isLoading && filteredList.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 shadow-sm text-center">
          <Medal size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Results Found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">No students have completed this exam yet</p>
        </div>
      )}

      {/* Top 3 Podium */}
      {examFilter && !isLoading && filteredList.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-2xl mx-auto mb-6">
          {[1, 0, 2].map((podiumIdx) => {
            const entry = filteredList[podiumIdx];
            if (!entry) return <div key={podiumIdx} />;
            const isFirst = podiumIdx === 0;
            return (
              <div
                key={podiumIdx}
                className={`relative flex flex-col items-center p-4 md:p-6 rounded-2xl border shadow-sm transition-all ${
                  isFirst
                    ? 'border-yellow-300 dark:border-yellow-600 bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800 pt-8 md:pt-10'
                    : podiumIdx === 1
                    ? 'border-gray-200 dark:border-gray-600 bg-gradient-to-b from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 pt-6 md:pt-8'
                    : 'border-orange-200 dark:border-orange-700 bg-gradient-to-b from-orange-50 to-white dark:from-orange-900/10 dark:to-gray-800 pt-6 md:pt-8'
                }`}
              >
                <div className={`absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold bg-gradient-to-br ${rankColors[entry.rank]}`}>
                  {entry.rank}
                </div>
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-lg md:text-2xl font-bold mb-2 ${isFirst ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                  {entry.student?.name?.charAt(0) || '?'}
                </div>
                <p className="text-xs md:text-sm font-bold text-gray-900 dark:text-white text-center truncate w-full">
                  {entry.student?.name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{entry.percentage?.toFixed(1)}%</p>
                <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${gradeBadge(entry.grade)}`}>
                  {entry.grade || 'N/A'}
                </span>
                {isFirst && <Crown size={20} className="absolute top-2 right-2 text-yellow-500" />}
              </div>
            );
          })}
        </div>
      )}

      {/* Full Merit List Table */}
      {examFilter && !isLoading && filteredList.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy size={16} className="text-primary" />
              Merit List ({filteredList.length} students)
            </h3>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase w-16">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Student</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Score</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Percentage</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Grade</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">GPA</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Attempt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredList.map((entry) => (
                  <tr
                    key={entry.rank}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${
                      entry.rank <= 3 ? 'bg-primary/5 dark:bg-primary/10' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${rankBadge(entry.rank)}`}>
                        {entry.rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                          entry.rank <= 3
                            ? 'bg-primary/10 text-primary'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          {entry.student?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{entry.student?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{entry.student?.customId || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{entry.score}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">/{entry.maxScore}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              entry.percentage >= 80 ? 'bg-emerald-500' : entry.percentage >= 60 ? 'bg-blue-500' : entry.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(entry.percentage || 0, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300 min-w-[40px]">{entry.percentage?.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${gradeBadge(entry.grade)}`}>
                        {entry.grade || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{entry.gpa?.toFixed(2) || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">#{entry.attemptNumber || 1}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700">
            {filteredList.map((entry) => (
              <div key={entry.rank} className={`p-4 ${entry.rank <= 3 ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${rankBadge(entry.rank)}`}>
                      #{entry.rank}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{entry.student?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{entry.student?.customId || ''}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${gradeBadge(entry.grade)}`}>
                    {entry.grade || 'N/A'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{entry.score}/{entry.maxScore}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Percentage</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{entry.percentage?.toFixed(1)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">GPA</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{entry.gpa?.toFixed(2) || 'N/A'}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        entry.percentage >= 80 ? 'bg-emerald-500' : entry.percentage >= 60 ? 'bg-blue-500' : entry.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(entry.percentage || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MeritListTab;
