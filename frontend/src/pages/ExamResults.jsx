import { useState, useMemo } from 'react';
import {
  BarChart3,
  Search,
  Filter,
  Loader2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  TrendingUp,
  Download,
  Users,
  FileText,
  Send,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  Target,
  Percent,
  X,
  Hash,
  BookOpen,
  GraduationCap,
  Trophy,
  Medal,
  BarChart,
  PieChart,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetExamResultsQuery,
  useGetExamResultByIdQuery,
  useGradeExamMutation,
  useGetOnlineExamsQuery,
  useGetStudentsQuery,
  useGetExamRankingsQuery,
  useCalculateStudentGPAQuery,
  useCalculateStudentCGPAQuery,
  usePublishExamResultsMutation,
  useBulkGradeExamsMutation,
  useGetMeritListQuery,
} from '../store/adminApiSlice';
import MeritListTab from '../components/MeritListTab';
import { Skeleton } from '../components/ui/skeleton';

const ExamResults = () => {
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [activeTab, setActiveTab] = useState('results');

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBulkGradeModal, setShowBulkGradeModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showReportCard, setShowReportCard] = useState(false);
  const [showRankings, setShowRankings] = useState(false);
  const [showMeritList, setShowMeritList] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedResults, setSelectedResults] = useState([]);

  const [gradingData, setGradingData] = useState({
    score: '',
    grade: '',
    gradingNotes: '',
    feedback: '',
  });

  const [bulkGradingData, setBulkGradingData] = useState({
    examId: '',
    grades: {},
  });

  const [publishData, setPublishData] = useState({
    examId: '',
    publishedBy: '',
    notifyStudents: true,
    notifyParents: true,
    includeMarks: true,
    includeGrade: true,
    includeComments: true,
  });

  const [gpaQuery, setGpaQuery] = useState({ studentId: '', term: '', academicYear: '' });
  const [cgpaQuery, setCgpaQuery] = useState({ studentId: '', academicYear: '' });

  const { data: results, isLoading, refetch } = useGetExamResultsQuery({
    examId: selectedExam,
    studentId: selectedStudent,
    status: selectedStatus,
    search: searchQuery,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: pageSize,
  });

  const { data: selectedResultDetail } = useGetExamResultByIdQuery(selectedResult, {
    skip: !selectedResult,
  });

  const [gradeExam, { isLoading: isGrading }] = useGradeExamMutation();
  const [bulkGradeExams, { isLoading: isBulkGrading }] = useBulkGradeExamsMutation();
  const [publishExamResults, { isLoading: isPublishing }] = usePublishExamResultsMutation();
  const { data: exams } = useGetOnlineExamsQuery();
  const { data: students } = useGetStudentsQuery();

  const { data: rankings, isLoading: isLoadingRankings } = useGetExamRankingsQuery(
    { examId: selectedExam, classId: selectedStudent ? undefined : '' },
    { skip: !showRankings || !selectedExam }
  );

  const { data: gpaData, isLoading: isLoadingGPA } = useCalculateStudentGPAQuery(
    gpaQuery,
    { skip: !gpaQuery.studentId || !gpaQuery.term || !gpaQuery.academicYear }
  );

  const { data: cgpaData, isLoading: isLoadingCGPA } = useCalculateStudentCGPAQuery(
    cgpaQuery,
    { skip: !cgpaQuery.studentId || !cgpaQuery.academicYear }
  );

  const examResults = useMemo(() => {
    return results?.examResults || [];
  }, [results]);

  const filteredResults = useMemo(() => {
    return examResults.filter((result) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          result.student?.name?.toLowerCase().includes(query) ||
          result.exam?.name?.toLowerCase().includes(query) ||
          result.student?.customId?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [examResults, searchQuery]);

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredResults.slice(start, start + pageSize);
  }, [filteredResults, currentPage, pageSize]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredResults.length / pageSize);
  }, [filteredResults, pageSize]);

  const stats = useMemo(() => {
    if (!examResults.length) {
      return {
        total: 0,
        avgScore: 0,
        avgPercentage: 0,
        passed: 0,
        failed: 0,
        passRate: 0,
        highestScore: 0,
        lowestScore: 0,
        medianScore: 0,
        gradeDistribution: {},
      };
    }

    const scores = examResults.map((r) => r.percentage || 0);
    const sorted = [...scores].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const medianScore = sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;

    const gradeDist = examResults.reduce((acc, r) => {
      const grade = r.grade || 'N/A';
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});

    return {
      total: examResults.length,
      avgScore: Math.round(examResults.reduce((sum, r) => sum + (r.score || 0), 0) / examResults.length),
      avgPercentage: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length),
      passed: examResults.filter((r) => r.percentage >= 50).length,
      failed: examResults.filter((r) => r.percentage < 50).length,
      passRate: Math.round(
        (examResults.filter((r) => r.percentage >= 50).length / examResults.length) * 100
      ),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      medianScore: Math.round(medianScore),
      gradeDistribution: gradeDist,
    };
  }, [examResults]);

  const handleViewDetail = (resultId) => {
    setSelectedResult(resultId);
    setShowDetailModal(true);
  };

  const handleGrade = async () => {
    if (!selectedResult) return;
    if (!gradingData.score || parseFloat(gradingData.score) < 0) {
      toast.error('Please enter a valid score');
      return;
    }

    try {
      await gradeExam({
        examResultId: selectedResult,
        score: parseFloat(gradingData.score),
        grade: gradingData.grade,
        gradingNotes: gradingData.gradingNotes,
        feedback: gradingData.feedback,
      }).unwrap();
      toast.success('Exam graded successfully');
      setShowDetailModal(false);
      setSelectedResult(null);
      setGradingData({ score: '', grade: '', gradingNotes: '', feedback: '' });
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to grade exam');
    }
  };

  const handleBulkGrade = async () => {
    if (!bulkGradingData.examId) {
      toast.error('Please select an exam');
      return;
    }

    const gradesArray = Object.entries(bulkGradingData.grades)
      .filter(([, data]) => data.score !== '')
      .map(([studentId, data]) => ({
        studentId,
        score: parseFloat(data.score),
        grade: data.grade,
        gradingNotes: data.gradingNotes,
        feedback: data.feedback,
      }));

    if (gradesArray.length === 0) {
      toast.error('No grades to submit');
      return;
    }

    try {
      await bulkGradeExams({
        examId: bulkGradingData.examId,
        grades: gradesArray,
      }).unwrap();
      toast.success(`Successfully graded ${gradesArray.length} students`);
      setShowBulkGradeModal(false);
      setBulkGradingData({ examId: '', grades: {} });
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to bulk grade');
    }
  };

  const handlePublishResults = async () => {
    if (!publishData.examId) {
      toast.error('Please select an exam');
      return;
    }

    try {
      await publishExamResults({
        examId: publishData.examId,
        publishedBy: publishData.publishedBy,
        notifyStudents: publishData.notifyStudents,
        notifyParents: publishData.notifyParents,
        includeMarks: publishData.includeMarks,
        includeGrade: publishData.includeGrade,
        includeComments: publishData.includeComments,
      }).unwrap();
      toast.success('Results published successfully');
      setShowPublishModal(false);
      setPublishData({
        examId: '',
        publishedBy: '',
        notifyStudents: true,
        notifyParents: true,
        includeMarks: true,
        includeGrade: true,
        includeComments: true,
      });
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to publish results');
    }
  };

  const handleSelectResult = (resultId) => {
    setSelectedResults((prev) =>
      prev.includes(resultId) ? prev.filter((id) => id !== resultId) : [...prev, resultId]
    );
  };

  const handleSelectAll = () => {
    if (selectedResults.length === paginatedResults.length) {
      setSelectedResults([]);
    } else {
      setSelectedResults(paginatedResults.map((r) => r._id));
    }
  };

  const toggleExpandRow = (resultId) => {
    setExpandedRows((prev) => ({ ...prev, [resultId]: !prev[resultId] }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'GRADED':
        return 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'IN_PROGRESS':
        return 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'PUBLISHED':
        return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
      case 'REVIEW_REQUESTED':
        return 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
      case 'REVIEWED':
        return 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
      default:
        return 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'text-gray-500';
    switch (grade) {
      case 'A+': return 'text-emerald-600';
      case 'A': return 'text-green-600';
      case 'B+': return 'text-blue-500';
      case 'B': return 'text-blue-600';
      case 'C+': return 'text-yellow-500';
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-orange-600';
      case 'E': return 'text-red-500';
      case 'F': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getGradeBadge = (grade) => {
    if (!grade) return '';
    switch (grade) {
      case 'A+': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
      case 'A': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'B+': return 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      case 'B': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'C+': return 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'C': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'D': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300';
      case 'E': return 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'F': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleExportCSV = () => {
    if (!filteredResults.length) {
      toast.error('No results to export');
      return;
    }

    const headers = ['Student Name', 'Student ID', 'Exam', 'Score', 'Max Score', 'Percentage', 'Grade', 'Status', 'Rank', 'Time Taken'];
    const rows = filteredResults.map((r) => [
      r.student?.name || '',
      r.student?.customId || '',
      r.exam?.name || '',
      r.score || 0,
      r.maxScore || 0,
      (r.percentage || 0).toFixed(1),
      r.grade || '',
      r.status || '',
      r.classRank || '',
      r.timeTaken ? `${Math.floor(r.timeTaken / 60)}m ${r.timeTaken % 60}s` : '',
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-results-${selectedExam || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Results exported successfully');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Results</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
            View, grade, and publish student exam results with GPA rankings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReportCard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl text-sm font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
          >
            <GraduationCap size={16} />
            Report Card
          </button>
          <button
            onClick={() => setShowRankings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl text-sm font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
          >
            <Trophy size={16} />
            Rankings
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button
            onClick={() => setShowBulkGradeModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <Zap size={16} />
            Bulk Grade
          </button>
          <button
            onClick={() => setShowPublishModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Send size={16} />
            Publish Results
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Avg Score</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.avgPercentage}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Pass Rate</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.passRate}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Passed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{stats.passed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Failed</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.failed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Highest</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.highestScore}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Median</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.medianScore}%</p>
        </div>
      </div>

      {/* Grade Distribution Bar */}
      {Object.keys(stats.gradeDistribution).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Grade Distribution</h3>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
              <div key={grade} className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs font-bold rounded-lg ${getGradeBadge(grade)}`}>
                  {grade}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search student or exam..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Exam</label>
            <select
              value={selectedExam}
              onChange={(e) => { setSelectedExam(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              <option value="">All Exams</option>
              {exams?.exams?.map((exam) => (
                <option key={exam._id} value={exam._id}>{exam.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => { setSelectedStudent(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              <option value="">All Students</option>
              {students?.map((student) => (
                <option key={student._id} value={student._id}>{student.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              <option value="">All Status</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="GRADED">Graded</option>
              <option value="PUBLISHED">Published</option>
              <option value="REVIEW_REQUESTED">Review Requested</option>
              <option value="REVIEWED">Reviewed</option>
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Sort By</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              <option value="score-desc">Score (High to Low)</option>
              <option value="score-asc">Score (Low to High)</option>
              <option value="percentage-desc">Percentage (High to Low)</option>
              <option value="percentage-asc">Percentage (Low to High)</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="rank-asc">Rank (Best First)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'results'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <BarChart3 size={16} />
            Results ({filteredResults.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'analytics'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <PieChart size={16} />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('merit')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'merit'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Trophy size={16} />
            Merit List
          </button>
        </div>

        {activeTab === 'results' && (
          <div>
            {isLoading ? (
              <div className="p-6">
                <TableSkeleton rows={10} columns={6} />
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="p-12 text-center">
                <BarChart3 size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No results found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Adjust filters to see results</p>
              </div>
            ) : (
              <>
                {/* Bulk Actions Bar */}
                {selectedResults.length > 0 && (
                  <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 flex items-center gap-4">
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      {selectedResults.length} selected
                    </span>
                    <button
                      onClick={() => setShowBulkGradeModal(true)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                    >
                      <Zap size={12} />
                      Bulk Grade Selected
                    </button>
                    <button
                      onClick={() => setSelectedResults([])}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Clear Selection
                    </button>
                  </div>
                )}

                {/* Results Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedResults.length === paginatedResults.length && paginatedResults.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Student</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Exam</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Score</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Percentage</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Grade</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Rank</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Time</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {paginatedResults.map((result) => (
                        <tr
                          key={result._id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${
                            selectedResults.includes(result._id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedResults.includes(result._id)}
                              onChange={() => handleSelectResult(result._id)}
                              className="rounded border-gray-300"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {result.student?.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {result.student?.customId}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm text-gray-700 dark:text-gray-300">{result.exam?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{result.exam?.term}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {result.score}/{result.maxScore}
                            </span>
                            {result.negativeMarksDeducted > 0 && (
                              <p className="text-xs text-red-500">-{result.negativeMarksDeducted} neg</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className={`text-sm font-bold ${getScoreColor(result.percentage)}`}>
                                {(result.percentage || 0).toFixed(1)}%
                              </span>
                              <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${getScoreBarColor(result.percentage)}`}
                                  style={{ width: `${Math.min(result.percentage || 0, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 text-xs font-bold rounded-lg ${getGradeBadge(result.grade)}`}>
                              {result.grade || 'N/A'}
                            </span>
                            {result.gpa && (
                              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                GPA: {result.gpa.toFixed(2)}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {result.classRank ? (
                              <div className="flex items-center justify-center gap-1">
                                {result.classRank <= 3 && (
                                  <Medal size={14} className={result.classRank === 1 ? 'text-yellow-500' : result.classRank === 2 ? 'text-gray-400' : 'text-amber-600'} />
                                )}
                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                  #{result.classRank}
                                </span>
                                {result.totalStudentsInClass && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    /{result.totalStudentsInClass}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getStatusColor(result.status)}`}>
                              {result.status?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {result.timeTaken ? (
                              <div className="flex items-center justify-center gap-1">
                                <Clock size={12} className="text-gray-400" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleViewDetail(result._id)}
                                className="p-1.5 text-gray-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                onClick={() => toggleExpandRow(result._id)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                title="Expand"
                              >
                                {expandedRows[result._id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredResults.length)} of {filteredResults.length}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Prev
                      </button>
                      {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                        let page;
                        if (totalPages <= 7) {
                          page = i + 1;
                        } else if (currentPage <= 4) {
                          page = i + 1;
                        } else if (currentPage >= totalPages - 3) {
                          page = totalPages - 6 + i;
                        } else {
                          page = currentPage - 3 + i;
                        }
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                              currentPage === page
                                ? 'bg-primary text-white'
                                : 'border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-600 disabled:opacity-40 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Score Distribution */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Score Distribution</h4>
                <div className="space-y-2">
                  {[
                    { range: '90-100%', color: 'bg-emerald-500', count: examResults.filter((r) => r.percentage >= 90).length },
                    { range: '80-89%', color: 'bg-green-500', count: examResults.filter((r) => r.percentage >= 80 && r.percentage < 90).length },
                    { range: '70-79%', color: 'bg-blue-500', count: examResults.filter((r) => r.percentage >= 70 && r.percentage < 80).length },
                    { range: '60-69%', color: 'bg-yellow-500', count: examResults.filter((r) => r.percentage >= 60 && r.percentage < 70).length },
                    { range: '50-59%', color: 'bg-orange-500', count: examResults.filter((r) => r.percentage >= 50 && r.percentage < 60).length },
                    { range: 'Below 50%', color: 'bg-red-500', count: examResults.filter((r) => r.percentage < 50).length },
                  ].map(({ range, color, count }) => (
                    <div key={range} className="flex items-center gap-3">
                      <span className="text-xs text-gray-600 dark:text-gray-400 w-20 shrink-0">{range}</span>
                      <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full transition-all`}
                          style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Summary Statistics</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Total Students', value: stats.total, icon: Users, color: 'text-blue-600' },
                    { label: 'Average Score', value: `${stats.avgPercentage}%`, icon: BarChart3, color: 'text-blue-600' },
                    { label: 'Highest Score', value: `${stats.highestScore}%`, icon: TrendingUp, color: 'text-green-600' },
                    { label: 'Lowest Score', value: `${stats.lowestScore}%`, icon: TrendingUp, color: 'text-red-600' },
                    { label: 'Median Score', value: `${stats.medianScore}%`, icon: Target, color: 'text-purple-600' },
                    { label: 'Pass Rate', value: `${stats.passRate}%`, icon: CheckCircle2, color: 'text-green-600' },
                  ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className={color} />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GPA Calculator */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                  <GraduationCap size={16} className="inline mr-2" />
                  GPA Calculator
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Student</label>
                    <select
                      value={gpaQuery.studentId}
                      onChange={(e) => setGpaQuery({ ...gpaQuery, studentId: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="">Select Student</option>
                      {students?.map((s) => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Term</label>
                      <select
                        value={gpaQuery.term}
                        onChange={(e) => setGpaQuery({ ...gpaQuery, term: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <option value="">Select</option>
                        <option value="Monthly1">Monthly 1</option>
                        <option value="Midterm">Midterm</option>
                        <option value="Monthly2">Monthly 2</option>
                        <option value="Final">Final</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Year</label>
                      <input
                        type="text"
                        placeholder="e.g. 2026"
                        value={gpaQuery.academicYear}
                        onChange={(e) => setGpaQuery({ ...gpaQuery, academicYear: e.target.value })}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  </div>
                  {isLoadingGPA && <Loader2 size={16} className="animate-spin text-primary" />}
                  {gpaData && (
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <Star size={16} className="text-amber-500" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          GPA: {gpaData.gpa?.toFixed(2) || 'N/A'}
                        </span>
                      </div>
                      {gpaData.subjectGPAs && (
                        <div className="mt-2 space-y-1">
                          {gpaData.subjectGPAs.map((sg, i) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400">{sg.subject}</span>
                              <span className="font-semibold text-gray-900 dark:text-white">{sg.gpa?.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* CGPA Calculator */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                  <Award size={16} className="inline mr-2" />
                  CGPA Calculator
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Student</label>
                    <select
                      value={cgpaQuery.studentId}
                      onChange={(e) => setCgpaQuery({ ...cgpaQuery, studentId: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="">Select Student</option>
                      {students?.map((s) => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Academic Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 2026"
                      value={cgpaQuery.academicYear}
                      onChange={(e) => setCgpaQuery({ ...cgpaQuery, academicYear: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  {isLoadingCGPA && <Loader2 size={16} className="animate-spin text-primary" />}
                  {cgpaData && (
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-purple-500" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          CGPA: {cgpaData.cgpa?.toFixed(2) || 'N/A'}
                        </span>
                      </div>
                      {cgpaData.termGPAs && (
                        <div className="mt-2 space-y-1">
                          {cgpaData.termGPAs.map((tg, i) => (
                            <div key={i} className="flex justify-between text-xs">
                              <span className="text-gray-600 dark:text-gray-400">{tg.term} ({tg.academicYear})</span>
                              <span className="font-semibold text-gray-900 dark:text-white">{tg.gpa?.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedResultDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl shadow-xl my-8">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exam Result Details</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {selectedResultDetail.student?.name} — {selectedResultDetail.exam?.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedResult(null);
                  setGradingData({ score: '', grade: '', gradingNotes: '', feedback: '' });
                }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Student Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Student</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedResultDetail.student?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Student ID</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedResultDetail.student?.customId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Exam</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedResultDetail.exam?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${getStatusColor(selectedResultDetail.status)}`}>
                    {selectedResultDetail.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Score Summary */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Score</p>
                  <p className="text-xl font-bold text-primary">{selectedResultDetail.score}/{selectedResultDetail.maxScore}</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Percentage</p>
                  <p className={`text-xl font-bold ${getScoreColor(selectedResultDetail.percentage)}`}>
                    {(selectedResultDetail.percentage || 0).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Grade</p>
                  <p className={`text-xl font-bold ${getGradeColor(selectedResultDetail.grade)}`}>
                    {selectedResultDetail.grade || 'N/A'}
                  </p>
                </div>
                {selectedResultDetail.gpa != null && (
                  <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
                    <p className="text-xs text-gray-500 dark:text-gray-400">GPA</p>
                    <p className="text-xl font-bold text-amber-600">{selectedResultDetail.gpa?.toFixed(2)}</p>
                  </div>
                )}
                <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Correct</p>
                  <p className="text-xl font-bold text-emerald-600">{selectedResultDetail.correctAnswers || 0}</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Wrong</p>
                  <p className="text-xl font-bold text-red-600">{selectedResultDetail.wrongAnswers || 0}</p>
                </div>
              </div>

              {/* Ranking & Negative Marking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedResultDetail.classRank && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy size={16} className="text-amber-500" />
                      <span className="text-sm font-bold text-gray-900 dark:text-white">Ranking</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Class Rank:</span>
                        <span className="ml-2 font-bold text-gray-900 dark:text-white">#{selectedResultDetail.classRank}</span>
                      </div>
                      {selectedResultDetail.subjectRank && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Subject Rank:</span>
                          <span className="ml-2 font-bold text-gray-900 dark:text-white">#{selectedResultDetail.subjectRank}</span>
                        </div>
                      )}
                      {selectedResultDetail.percentile != null && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Percentile:</span>
                          <span className="ml-2 font-bold text-gray-900 dark:text-white">{selectedResultDetail.percentile?.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {selectedResultDetail.negativeMarksDeducted > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={16} className="text-red-500" />
                      <span className="text-sm font-bold text-gray-900 dark:text-white">Negative Marking Applied</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Deducted: <span className="font-bold text-red-600">-{selectedResultDetail.negativeMarksDeducted}</span> marks
                    </p>
                  </div>
                )}
              </div>

              {/* Question Responses */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Question Responses</h4>
                <div className="space-y-2">
                  {selectedResultDetail.responses?.map((response, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        response.isCorrect
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                          : response.isSkipped
                          ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
                          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Question {index + 1}
                          {response.question?.type && (
                            <span className="ml-2 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-[10px]">
                              {response.question.type}
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          {response.negativePoints != null && response.negativePoints > 0 && (
                            <span className="text-xs text-red-500">-{response.negativePoints}</span>
                          )}
                          {response.isCorrect ? (
                            <CheckCircle2 size={16} className="text-green-600" />
                          ) : response.isSkipped ? (
                            <Clock size={16} className="text-gray-400" />
                          ) : (
                            <XCircle size={16} className="text-red-600" />
                          )}
                        </div>
                      </div>
                      {response.answer && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Answer: <span className="font-mono">{response.answer}</span>
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>Points: {response.points || 0}</span>
                        <span>Time: {response.timeSpent || 0}s</span>
                        {response.autoGraded != null && (
                          <span>{response.autoGraded ? 'Auto-graded' : 'Manual'}</span>
                        )}
                      </div>
                      {response.feedback && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Feedback: {response.feedback}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Proctoring Data */}
              {selectedResultDetail.proctoringData?.flaggedEvents?.length > 0 && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={16} className="text-orange-500" />
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Proctoring Flags</span>
                  </div>
                  <div className="space-y-2">
                    {selectedResultDetail.proctoringData.flaggedEvents.map((event, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="text-orange-600 dark:text-orange-400 font-semibold">{event.type}</span>
                        <span className="text-gray-500 dark:text-gray-400">{event.timestamp}</span>
                        {event.description && <span className="text-gray-600 dark:text-gray-300">{event.description}</span>}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    {selectedResultDetail.proctoringData.fullScreenExits != null && (
                      <div><span className="text-gray-500">Full-screen exits:</span> <span className="font-bold">{selectedResultDetail.proctoringData.fullScreenExits}</span></div>
                    )}
                    {selectedResultDetail.proctoringData.browser && (
                      <div><span className="text-gray-500">Browser:</span> <span className="font-bold">{selectedResultDetail.proctoringData.browser}</span></div>
                    )}
                    {selectedResultDetail.proctoringData.ip && (
                      <div><span className="text-gray-500">IP:</span> <span className="font-bold">{selectedResultDetail.proctoringData.ip}</span></div>
                    )}
                  </div>
                </div>
              )}

              {/* Review Section */}
              {selectedResultDetail.status === 'REVIEW_REQUESTED' && (
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Review Requested</h4>
                  {selectedResultDetail.reviewReason && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">Reason: {selectedResultDetail.reviewReason}</p>
                  )}
                </div>
              )}

              {/* Grading Section */}
              {selectedResultDetail.status === 'SUBMITTED' && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Manual Grading</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Score</label>
                        <input
                          type="number"
                          value={gradingData.score}
                          onChange={(e) => setGradingData({ ...gradingData, score: e.target.value })}
                          min="0"
                          max={selectedResultDetail.maxScore}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Grade</label>
                        <select
                          value={gradingData.grade}
                          onChange={(e) => setGradingData({ ...gradingData, grade: e.target.value })}
                          className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        >
                          <option value="">Select Grade</option>
                          <option value="A+">A+</option>
                          <option value="A">A</option>
                          <option value="B+">B+</option>
                          <option value="B">B</option>
                          <option value="C+">C+</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="E">E</option>
                          <option value="F">F</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Grading Notes</label>
                      <textarea
                        value={gradingData.gradingNotes}
                        onChange={(e) => setGradingData({ ...gradingData, gradingNotes: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Feedback</label>
                      <textarea
                        value={gradingData.feedback}
                        onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
                      />
                    </div>
                    <button
                      onClick={handleGrade}
                      disabled={isGrading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isGrading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      {isGrading ? 'Submitting...' : 'Submit Grade'}
                    </button>
                  </div>
                </div>
              )}

              {/* Existing Grading Info */}
              {(selectedResultDetail.status === 'GRADED' || selectedResultDetail.status === 'PUBLISHED' || selectedResultDetail.status === 'REVIEWED') && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Grading Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Grade:</span>
                      <span className={`font-semibold ${getGradeColor(selectedResultDetail.grade)}`}>
                        {selectedResultDetail.grade}
                      </span>
                    </div>
                    {selectedResultDetail.gradingNotes && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Notes:</span>
                        <p className="text-gray-900 dark:text-white mt-1">{selectedResultDetail.gradingNotes}</p>
                      </div>
                    )}
                    {selectedResultDetail.feedback && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Feedback:</span>
                        <p className="text-gray-900 dark:text-white mt-1">{selectedResultDetail.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Grade Modal */}
      {showBulkGradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl shadow-xl my-8">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bulk Grade Exams</h3>
              <button
                onClick={() => setShowBulkGradeModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Exam</label>
                <select
                  value={bulkGradingData.examId}
                  onChange={(e) => setBulkGradingData({ ...bulkGradingData, examId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Select Exam</option>
                  {exams?.exams?.map((exam) => (
                    <option key={exam._id} value={exam._id}>{exam.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Selected Results ({selectedResults.length})
                </p>
                {selectedResults.map((resultId) => {
                  const result = examResults.find((r) => r._id === resultId);
                  if (!result) return null;
                  return (
                    <div key={resultId} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white w-40 truncate">
                        {result.student?.name}
                      </span>
                      <input
                        type="number"
                        placeholder="Score"
                        value={bulkGradingData.grades[resultId]?.score || ''}
                        onChange={(e) =>
                          setBulkGradingData({
                            ...bulkGradingData,
                            grades: {
                              ...bulkGradingData.grades,
                              [resultId]: { ...bulkGradingData.grades[resultId], score: e.target.value },
                            },
                          })
                        }
                        className="w-20 px-2 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/40"
                      />
                      <select
                        value={bulkGradingData.grades[resultId]?.grade || ''}
                        onChange={(e) =>
                          setBulkGradingData({
                            ...bulkGradingData,
                            grades: {
                              ...bulkGradingData.grades,
                              [resultId]: { ...bulkGradingData.grades[resultId], grade: e.target.value },
                            },
                          })
                        }
                        className="w-20 px-2 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/40"
                      >
                        <option value="">Grade</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                        <option value="F">F</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Notes"
                        value={bulkGradingData.grades[resultId]?.gradingNotes || ''}
                        onChange={(e) =>
                          setBulkGradingData({
                            ...bulkGradingData,
                            grades: {
                              ...bulkGradingData.grades,
                              [resultId]: { ...bulkGradingData.grades[resultId], gradingNotes: e.target.value },
                            },
                          })
                        }
                        className="flex-1 px-2 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  );
                })}
                {selectedResults.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    Select results from the table to bulk grade
                  </p>
                )}
              </div>

              <button
                onClick={handleBulkGrade}
                disabled={isBulkGrading || selectedResults.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isBulkGrading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                {isBulkGrading ? 'Grading...' : `Grade ${selectedResults.length} Students`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Results Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-xl my-8">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Publish Exam Results</h3>
              <button
                onClick={() => setShowPublishModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Exam</label>
                <select
                  value={publishData.examId}
                  onChange={(e) => setPublishData({ ...publishData, examId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Select Exam</option>
                  {exams?.exams?.map((exam) => (
                    <option key={exam._id} value={exam._id}>{exam.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Published By (Teacher Name)</label>
                <input
                  type="text"
                  value={publishData.publishedBy}
                  onChange={(e) => setPublishData({ ...publishData, publishedBy: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Enter teacher name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Notifications</label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={publishData.notifyStudents}
                    onChange={(e) => setPublishData({ ...publishData, notifyStudents: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Notify Students</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={publishData.notifyParents}
                    onChange={(e) => setPublishData({ ...publishData, notifyParents: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Notify Parents</span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Include in Report</label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={publishData.includeMarks}
                    onChange={(e) => setPublishData({ ...publishData, includeMarks: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Marks</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={publishData.includeGrade}
                    onChange={(e) => setPublishData({ ...publishData, includeGrade: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Grade</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={publishData.includeComments}
                    onChange={(e) => setPublishData({ ...publishData, includeComments: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Comments</span>
                </label>
              </div>

              <button
                onClick={handlePublishResults}
                disabled={isPublishing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isPublishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isPublishing ? 'Publishing...' : 'Publish Results'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rankings Modal */}
      {showRankings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl shadow-xl my-8">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy size={20} className="text-amber-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exam Rankings</h3>
              </div>
              <button
                onClick={() => setShowRankings(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {!selectedExam ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  Select an exam from the filters above to view rankings
                </p>
              ) : isLoadingRankings ? (
                <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="flex items-center gap-3 p-3"><div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" /><div className="flex-1 space-y-2"><div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /><div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" /></div></div>)}</div>
              ) : rankings?.rankings?.length > 0 ? (
                <div className="space-y-3">
                  {rankings.rankings.map((rank, index) => (
                    <div
                      key={rank.student?._id || index}
                      className={`flex items-center gap-4 p-4 rounded-xl ${
                        index === 0
                          ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                          : index === 1
                          ? 'bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700'
                          : index === 2
                          ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                        {index === 0 ? (
                          <Trophy size={24} className="text-amber-500" />
                        ) : index === 1 ? (
                          <Medal size={24} className="text-gray-400" />
                        ) : index === 2 ? (
                          <Medal size={24} className="text-amber-600" />
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">#{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{rank.student?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{rank.student?.customId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{rank.score}/{rank.maxScore}</p>
                        <p className={`text-xs font-semibold ${getScoreColor(rank.percentage)}`}>
                          {(rank.percentage || 0).toFixed(1)}%
                        </p>
                      </div>
                      {rank.grade && (
                        <span className={`px-2 py-1 text-xs font-bold rounded-lg ${getGradeBadge(rank.grade)}`}>
                          {rank.grade}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No rankings data available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Card Modal */}
      {showReportCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl shadow-xl my-8">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap size={20} className="text-purple-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Student Report Card</h3>
              </div>
              <button
                onClick={() => setShowReportCard(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Student</label>
                  <select
                    value={gpaQuery.studentId}
                    onChange={(e) => setGpaQuery({ ...gpaQuery, studentId: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="">Select Student</option>
                    {students?.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Term</label>
                  <select
                    value={gpaQuery.term}
                    onChange={(e) => setGpaQuery({ ...gpaQuery, term: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    <option value="">Select Term</option>
                    <option value="Monthly1">Monthly 1</option>
                    <option value="Midterm">Midterm</option>
                    <option value="Monthly2">Monthly 2</option>
                    <option value="Final">Final</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Academic Year</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026"
                    value={gpaQuery.academicYear}
                    onChange={(e) => setGpaQuery({ ...gpaQuery, academicYear: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              {isLoadingGPA && (
                <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div>
              )}

              {gpaData && (
                <div className="space-y-4">
                  {/* Report Header */}
                  <div className="text-center p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">Student Progress Report</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {gpaQuery.term} — Academic Year {gpaQuery.academicYear}
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">GPA</p>
                        <p className="text-3xl font-bold text-primary">{gpaData.gpa?.toFixed(2) || 'N/A'}</p>
                      </div>
                      <div className="w-px h-12 bg-gray-300 dark:bg-gray-600" />
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Subjects</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{gpaData.subjectGPAs?.length || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Subject Grades Table */}
                  {gpaData.subjectGPAs && gpaData.subjectGPAs.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Subject</th>
                            <th className="px-4 py-2 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Score</th>
                            <th className="px-4 py-2 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Grade</th>
                            <th className="px-4 py-2 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">GPA</th>
                            <th className="px-4 py-2 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Performance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {gpaData.subjectGPAs.map((sg, i) => (
                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                              <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{sg.subject}</td>
                              <td className="px-4 py-3 text-center text-sm font-bold text-gray-700 dark:text-gray-300">
                                {sg.averageScore != null ? `${sg.averageScore.toFixed(1)}%` : 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-1 text-xs font-bold rounded-lg ${getGradeBadge(sg.grade)}`}>
                                  {sg.grade || 'N/A'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center text-sm font-bold text-gray-900 dark:text-white">
                                {sg.gpa?.toFixed(2) || 'N/A'}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="w-full max-w-[100px] mx-auto h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${getScoreBarColor(sg.averageScore || 0)}`}
                                    style={{ width: `${Math.min(sg.averageScore || 0, 100)}%` }}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Merit List Tab */}
      {activeTab === 'merit' && (
        <MeritListTab selectedExam={selectedExam} />
      )}
    </div>
  );
};

export default ExamResults;