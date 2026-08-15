import { useState, useMemo } from 'react';
import { PageLayout, PageHeader, ContentCard, StatsGrid2 } from '../components/PageLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/Dialog';
import { Input } from '../components/ui/Input';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  X,
  CheckCircle2,
  Clock,
  Users,
  Play,
  Eye,
  Copy,
  Send,
  BarChart3,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Shield,
  Settings,
  Sliders,
  BookOpen,
  Hash,
  Target,
  Award,
  Percent,
  Timer,
  Lock,
  RotateCcw,
  EyeOff,
  Monitor,
  MousePointerClick,
  Keyboard,
  Info,
  GraduationCap,
} from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import {
  useCreateOnlineExamMutation,
  useGetOnlineExamsQuery,
  useGetOnlineExamByIdQuery,
  useUpdateOnlineExamMutation,
  useDeleteOnlineExamMutation,
  useStartOnlineExamMutation,
  useSubmitOnlineExamMutation,
  useGetQuestionBanksQuery,
  useGetQuestionsQuery,
  useGetSubjectsQuery,
  useGetClassesQuery,
  usePublishOnlineExamMutation,
  useGetExamAnalyticsQuery,
} from '../store/adminApiSlice';

const TERM_COLORS = {
  Monthly1: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
  Midterm: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  Monthly2: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
  Final: 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
};

const STATUS_COLORS = {
  Draft: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  Scheduled: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  Published: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  In_Progress: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  Completed: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  Cancelled: 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
};

const TYPE_COLORS = {
  ONLINE: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  OFFLINE: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  HYBRID: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
};

const CATEGORY_COLORS = {
  FORMATIVE: 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
  SUMMATIVE: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  DIAGNOSTIC: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  PLACEMENT: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  PRACTICE: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
};

const DEFAULT_FORM = {
  name: '',
  term: 'Midterm',
  date: '',
  class: '',
  subject: '',
  maxMarks: 100,
  examCategory: 'SUMMATIVE',
  examType: 'OFFLINE',
  questionSelectionMode: 'MANUAL',
  questionBank: '',
  questions: [],
  startTime: '',
  endTime: '',
  duration: 60,
  passingScore: 50,
  passingPercentage: 50,
  maxAttempts: 1,
  allowRetake: false,
  timePerQuestion: false,
  negativeMarking: { enabled: false, penaltyPerWrong: 0, maxNegativePercentage: 25 },
  requireProctoring: false,
  antiCheatConfig: {
    tabSwitchLimit: 3,
    fullScreenRequired: true,
    copyPasteDisabled: true,
    rightClickDisabled: true,
    browserFullScreen: false,
  },
  shuffleQuestions: false,
  shuffleOptions: false,
  showResultsImmediately: true,
  showCorrectAnswers: false,
  password: '',
  allowedIPs: '',
  instructions: '',
  gradingScale: [],
  randomizationConfig: { easyCount: 0, mediumCount: 0, hardCount: 0, totalQuestions: 0, questionPoolSize: 0 },
};

const ExamManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({ ...DEFAULT_FORM });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [analyticsExamId, setAnalyticsExamId] = useState(null);
  const [activeModalTab, setActiveModalTab] = useState('basic');
  const [expandedRows, setExpandedRows] = useState({});

  const [createExam, { isLoading: isCreating }] = useCreateOnlineExamMutation();
  const [updateExam, { isLoading: isUpdating }] = useUpdateOnlineExamMutation();
  const [deleteExam, { isLoading: isDeleting }] = useDeleteOnlineExamMutation();
  const [publishExam, { isLoading: isPublishing }] = usePublishOnlineExamMutation();
  const { data: exams, isLoading, refetch } = useGetOnlineExamsQuery();
  const { data: questionBanks } = useGetQuestionBanksQuery();
  const { data: questionsData } = useGetQuestionsQuery(formData.questionBank ? { questionBank: formData.questionBank } : undefined, { skip: !formData.questionBank });
  const { data: subjects } = useGetSubjectsQuery();
  const { data: classes } = useGetClassesQuery();

  const { data: analyticsData, isLoading: analyticsLoading } = useGetExamAnalyticsQuery(analyticsExamId, { skip: !analyticsExamId });

  const filteredExams = useMemo(() => {
    if (!exams?.exams) return [];
    return exams.exams.filter((exam) => {
      if (searchQuery && !exam.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (filterType && exam.examType !== filterType) return false;
      if (filterStatus && exam.status !== filterStatus) return false;
      if (filterClass && (exam.class?._id || exam.class) !== filterClass) return false;
      if (filterSubject && (exam.subject?._id || exam.subject) !== filterSubject) return false;
      return true;
    });
  }, [exams, searchQuery, filterType, filterStatus, filterClass, filterSubject]);

  const stats = useMemo(() => {
    const list = exams?.exams || [];
    return {
      total: list.length,
      online: list.filter((e) => e.examType === 'ONLINE').length,
      scheduled: list.filter((e) => e.status === 'Scheduled').length,
      published: list.filter((e) => e.status === 'Published').length,
      completed: list.filter((e) => e.status === 'Completed').length,
    };
  }, [exams]);

  const questionsList = useMemo(() => {
    if (questionsData?.questions) return questionsData.questions;
    if (Array.isArray(questionsData)) return questionsData;
    return [];
  }, [questionsData]);

  const groupedQuestions = useMemo(() => {
    const groups = {};
    questionsList.forEach((q) => {
      const type = q.questionType || 'Other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(q);
    });
    return groups;
  }, [questionsList]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const handleAddGradingRow = () => {
    setFormData((prev) => ({
      ...prev,
      gradingScale: [...prev.gradingScale, { grade: '', minPercentage: 0, maxPercentage: 100, gpaPoints: 0 }],
    }));
  };

  const handleUpdateGradingRow = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.gradingScale];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, gradingScale: updated };
    });
  };

  const handleRemoveGradingRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      gradingScale: prev.gradingScale.filter((_, i) => i !== index),
    }));
  };

  const toggleQuestionSelection = (questionId) => {
    setFormData((prev) => {
      const exists = prev.questions.includes(questionId);
      return {
        ...prev,
        questions: exists ? prev.questions.filter((id) => id !== questionId) : [...prev.questions, questionId],
      };
    });
  };

  const toggleAllQuestionsInGroup = (groupQuestions) => {
    setFormData((prev) => {
      const ids = groupQuestions.map((q) => q._id);
      const allSelected = ids.every((id) => prev.questions.includes(id));
      if (allSelected) {
        return { ...prev, questions: prev.questions.filter((id) => !ids.includes(id)) };
      }
      const merged = new Set([...prev.questions, ...ids]);
      return { ...prev, questions: [...merged] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        term: formData.term,
        date: formData.date ? new Date(formData.date) : undefined,
        class: formData.class,
        subject: formData.subject,
        maxMarks: Number(formData.maxMarks),
        examCategory: formData.examCategory,
        examType: formData.examType,
        questionSelectionMode: formData.questionSelectionMode,
        questionBank: formData.questionBank || undefined,
        questions: formData.questions,
        startTime: formData.startTime ? new Date(formData.startTime) : undefined,
        endTime: formData.endTime ? new Date(formData.endTime) : undefined,
        duration: Number(formData.duration),
        passingScore: Number(formData.passingScore),
        passingPercentage: Number(formData.passingPercentage),
        maxAttempts: Number(formData.maxAttempts),
        allowRetake: formData.allowRetake,
        timePerQuestion: formData.timePerQuestion,
        negativeMarking: {
          enabled: formData.negativeMarking.enabled,
          penaltyPerWrong: Number(formData.negativeMarking.penaltyPerWrong),
          maxNegativePercentage: Number(formData.negativeMarking.maxNegativePercentage),
        },
        requireProctoring: formData.requireProctoring,
        antiCheatConfig: { ...formData.antiCheatConfig },
        shuffleQuestions: formData.shuffleQuestions,
        shuffleOptions: formData.shuffleOptions,
        showResultsImmediately: formData.showResultsImmediately,
        showCorrectAnswers: formData.showCorrectAnswers,
        password: formData.password || undefined,
        allowedIPs: formData.allowedIPs ? formData.allowedIPs.split(',').map((ip) => ip.trim()).filter(Boolean) : [],
        instructions: formData.instructions,
        gradingScale: formData.gradingScale,
        randomizationConfig: { ...formData.randomizationConfig },
      };

      if (editingExam) {
        await updateExam({ id: editingExam._id, ...payload }).unwrap();
        toast.success('Exam updated successfully');
      } else {
        await createExam(payload).unwrap();
        toast.success('Exam created successfully');
      }

      closeModal();
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to save exam');
    }
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      name: exam.name || '',
      term: exam.term || 'Midterm',
      date: exam.date ? exam.date.split('T')[0] : '',
      class: exam.class?._id || exam.class || '',
      subject: exam.subject?._id || exam.subject || '',
      maxMarks: exam.maxMarks || 100,
      examCategory: exam.examCategory || 'SUMMATIVE',
      examType: exam.examType || 'OFFLINE',
      questionSelectionMode: exam.questionSelectionMode || 'MANUAL',
      questionBank: exam.questionBank?._id || exam.questionBank || '',
      questions: exam.questions?.map((q) => q._id || q) || [],
      startTime: exam.startTime ? new Date(exam.startTime).toISOString().slice(0, 16) : '',
      endTime: exam.endTime ? new Date(exam.endTime).toISOString().slice(0, 16) : '',
      duration: exam.duration || 60,
      passingScore: exam.passingScore || 50,
      passingPercentage: exam.passingPercentage || 50,
      maxAttempts: exam.maxAttempts || 1,
      allowRetake: exam.allowRetake || false,
      timePerQuestion: exam.timePerQuestion || false,
      negativeMarking: {
        enabled: exam.negativeMarking?.enabled || false,
        penaltyPerWrong: exam.negativeMarking?.penaltyPerWrong || 0,
        maxNegativePercentage: exam.negativeMarking?.maxNegativePercentage || 25,
      },
      requireProctoring: exam.requireProctoring || false,
      antiCheatConfig: {
        tabSwitchLimit: exam.antiCheatConfig?.tabSwitchLimit ?? 3,
        fullScreenRequired: exam.antiCheatConfig?.fullScreenRequired ?? true,
        copyPasteDisabled: exam.antiCheatConfig?.copyPasteDisabled ?? true,
        rightClickDisabled: exam.antiCheatConfig?.rightClickDisabled ?? true,
        browserFullScreen: exam.antiCheatConfig?.browserFullScreen ?? false,
      },
      shuffleQuestions: exam.shuffleQuestions || false,
      shuffleOptions: exam.shuffleOptions || false,
      showResultsImmediately: exam.showResultsImmediately !== false,
      showCorrectAnswers: exam.showCorrectAnswers || false,
      password: exam.password || '',
      allowedIPs: exam.allowedIPs?.join(', ') || '',
      instructions: exam.instructions || '',
      gradingScale: exam.gradingScale || [],
      randomizationConfig: {
        easyCount: exam.randomizationConfig?.easyCount || 0,
        mediumCount: exam.randomizationConfig?.mediumCount || 0,
        hardCount: exam.randomizationConfig?.hardCount || 0,
        totalQuestions: exam.randomizationConfig?.totalQuestions || 0,
        questionPoolSize: exam.randomizationConfig?.questionPoolSize || 0,
      },
    });
    setActiveModalTab('basic');
    setShowModal(true);
  };

  const handleDelete = async (examId) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      await deleteExam(examId).unwrap();
      toast.success('Exam deleted successfully');
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to delete exam');
    }
  };

  const handlePublish = async (examId) => {
    if (!confirm('Are you sure you want to publish this exam? Students will be able to see it.')) return;
    try {
      await publishExam(examId).unwrap();
      toast.success('Exam published successfully');
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to publish exam');
    }
  };

  const handleClone = (exam) => {
    setEditingExam(null);
    setFormData({
      name: `${exam.name} (Copy)`,
      term: exam.term || 'Midterm',
      date: exam.date ? exam.date.split('T')[0] : '',
      class: exam.class?._id || exam.class || '',
      subject: exam.subject?._id || exam.subject || '',
      maxMarks: exam.maxMarks || 100,
      examCategory: exam.examCategory || 'SUMMATIVE',
      examType: exam.examType || 'OFFLINE',
      questionSelectionMode: exam.questionSelectionMode || 'MANUAL',
      questionBank: exam.questionBank?._id || exam.questionBank || '',
      questions: exam.questions?.map((q) => q._id || q) || [],
      startTime: '',
      endTime: '',
      duration: exam.duration || 60,
      passingScore: exam.passingScore || 50,
      passingPercentage: exam.passingPercentage || 50,
      maxAttempts: exam.maxAttempts || 1,
      allowRetake: exam.allowRetake || false,
      timePerQuestion: exam.timePerQuestion || false,
      negativeMarking: {
        enabled: exam.negativeMarking?.enabled || false,
        penaltyPerWrong: exam.negativeMarking?.penaltyPerWrong || 0,
        maxNegativePercentage: exam.negativeMarking?.maxNegativePercentage || 25,
      },
      requireProctoring: exam.requireProctoring || false,
      antiCheatConfig: {
        tabSwitchLimit: exam.antiCheatConfig?.tabSwitchLimit ?? 3,
        fullScreenRequired: exam.antiCheatConfig?.fullScreenRequired ?? true,
        copyPasteDisabled: exam.antiCheatConfig?.copyPasteDisabled ?? true,
        rightClickDisabled: exam.antiCheatConfig?.rightClickDisabled ?? true,
        browserFullScreen: exam.antiCheatConfig?.browserFullScreen ?? false,
      },
      shuffleQuestions: exam.shuffleQuestions || false,
      shuffleOptions: exam.shuffleOptions || false,
      showResultsImmediately: exam.showResultsImmediately !== false,
      showCorrectAnswers: exam.showCorrectAnswers || false,
      password: '',
      allowedIPs: '',
      instructions: exam.instructions || '',
      gradingScale: exam.gradingScale?.map((g) => ({ ...g })) || [],
      randomizationConfig: {
        easyCount: exam.randomizationConfig?.easyCount || 0,
        mediumCount: exam.randomizationConfig?.mediumCount || 0,
        hardCount: exam.randomizationConfig?.hardCount || 0,
        totalQuestions: exam.randomizationConfig?.totalQuestions || 0,
        questionPoolSize: exam.randomizationConfig?.questionPoolSize || 0,
      },
    });
    setActiveModalTab('basic');
    setShowModal(true);
    toast.success('Exam cloned — edit and save as new');
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExam(null);
    setFormData({ ...DEFAULT_FORM });
    setActiveModalTab('basic');
  };

  const toggleRowExpand = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isOnline = formData.examType !== 'OFFLINE';

  const MODAL_TABS = [
    { key: 'basic', label: 'Basic', icon: FileText },
    ...(isOnline
      ? [
          { key: 'online', label: 'Online Settings', icon: Settings },
          { key: 'negative', label: 'Negative Marking', icon: AlertTriangle },
          { key: 'anticheat', label: 'Anti-Cheat', icon: Shield },
          { key: 'display', label: 'Display', icon: Eye },
          { key: 'security', label: 'Security', icon: Lock },
          { key: 'randomization', label: 'Randomization', icon: Sliders },
        ]
      : []),
    { key: 'grading', label: 'Grading', icon: Award },
    { key: 'instructions', label: 'Instructions', icon: Info },
  ];

  return (
    <PageLayout>
      <PageHeader
        title="Exam Management"
        description="Manage online, offline and hybrid examinations"
        icon={FileText}
        actions={
          <button
            onClick={() => {
              setEditingExam(null);
              setFormData({ ...DEFAULT_FORM });
              setActiveModalTab('basic');
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 active:scale-95 transition-all"
          >
            <Plus size={16} />
            Create Exam
          </button>
        }
      />

      <StatsGrid2 columns={5}>
        {[
          { label: 'Total Exams', value: stats.total, icon: FileText, iconColor: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-900/30' },
          { label: 'Online', value: stats.online, icon: Monitor, iconColor: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-900/30' },
          { label: 'Scheduled', value: stats.scheduled, icon: Clock, iconColor: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-900/30' },
          { label: 'Published', value: stats.published, icon: Send, iconColor: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-900/30' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, iconColor: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-700' },
        ].map((stat) => (
          <ContentCard key={stat.label} padding={false}>
            <div className="flex items-center gap-3 p-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon size={18} className={stat.iconColor} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </ContentCard>
        ))}
      </StatsGrid2>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search exams by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
              showFilters
                ? 'bg-primary text-white border-primary'
                : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <Filter size={16} />
            Filters
            {(filterType || filterStatus || filterClass || filterSubject) && (
              <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {[filterType, filterStatus, filterClass, filterSubject].filter(Boolean).length}
              </span>
            )}
          </button>
          {(filterType || filterStatus || filterClass || filterSubject) && (
            <button
              onClick={() => {
                setFilterType('');
                setFilterStatus('');
                setFilterClass('');
                setFilterSubject('');
              }}
              className="text-sm text-red-500 hover:text-red-700 font-semibold"
            >
              Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Exam Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">All Types</option>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Published">Published</option>
                <option value="In_Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Class</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">All Classes</option>
                {classes?.map((cls) => (
                  <option key={cls._id} value={cls._id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase">Subject</label>
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">All Subjects</option>
                {subjects?.map((sub) => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Exams List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <FileText size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Exam List</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{filteredExams.length} exam(s) found</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex items-center justify-center">
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No exams found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first exam to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredExams.map((exam) => (
              <div key={exam._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${TYPE_COLORS[exam.examType] || TYPE_COLORS.OFFLINE}`}>
                          {exam.examType}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${STATUS_COLORS[exam.status] || STATUS_COLORS.Draft}`}>
                          {exam.status?.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${TERM_COLORS[exam.term] || ''}`}>
                          {exam.term}
                        </span>
                        {exam.examCategory && (
                          <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${CATEGORY_COLORS[exam.examCategory] || ''}`}>
                            {exam.examCategory}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{exam.name}</h3>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <BookOpen size={12} />
                          {exam.subject?.name || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap size={12} />
                          {exam.class?.name || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target size={12} />
                          {exam.maxMarks} marks
                        </span>
                        {exam.duration && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {exam.duration} min
                          </span>
                        )}
                        {exam.passingScore && (
                          <span className="flex items-center gap-1">
                            <Award size={12} />
                            Pass: {exam.passingScore}
                          </span>
                        )}
                        {exam.questions?.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Hash size={12} />
                            {exam.questions.length} Qs
                          </span>
                        )}
                        {exam.date && (
                          <span>{new Date(exam.date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                      {exam.examType !== 'OFFLINE' && exam.status !== 'Published' && exam.status !== 'In_Progress' && exam.status !== 'Completed' && (
                        <button
                          onClick={() => handlePublish(exam._id)}
                          disabled={isPublishing}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                          title="Publish Exam"
                        >
                          <Send size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => setAnalyticsExamId(exam._id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="View Analytics"
                      >
                        <BarChart3 size={16} />
                      </button>
                      <button
                        onClick={() => handleClone(exam)}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                        title="Clone Exam"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => handleEdit(exam)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="Edit Exam"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(exam._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete Exam"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => toggleRowExpand(exam._id)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Details"
                      >
                        {expandedRows[exam._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {expandedRows[exam._id] && (
                  <div className="px-4 pb-4 pt-0 border-t border-gray-100 dark:border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                      {exam.instructions && (
                        <div className="col-span-2 md:col-span-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Instructions</p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{exam.instructions}</p>
                        </div>
                      )}
                      {exam.negativeMarking?.enabled && (
                        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 rounded-xl p-3">
                          <AlertTriangle size={14} className="text-red-500" />
                          <div>
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400">Negative Marking</p>
                            <p className="text-xs text-red-500 dark:text-red-400">-{exam.negativeMarking.penaltyPerWrong}% per wrong (max {exam.negativeMarking.maxNegativePercentage}%)</p>
                          </div>
                        </div>
                      )}
                      {exam.requireProctoring && (
                        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                          <Shield size={14} className="text-amber-500" />
                          <div>
                            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Proctored</p>
                            <p className="text-xs text-amber-500 dark:text-amber-400">Tab limit: {exam.antiCheatConfig?.tabSwitchLimit || 3}</p>
                          </div>
                        </div>
                      )}
                      {exam.password && (
                        <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
                          <Lock size={14} className="text-purple-500" />
                          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">Password Protected</p>
                        </div>
                      )}
                      {exam.gradingScale?.length > 0 && (
                        <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/20 rounded-xl p-3">
                          <Award size={14} className="text-teal-500" />
                          <div>
                            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">Custom Grading</p>
                            <p className="text-xs text-teal-500 dark:text-teal-400">{exam.gradingScale.length} grade levels</p>
                          </div>
                        </div>
                      )}
                      {exam.shuffleQuestions && (
                        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3">
                          <RotateCcw size={14} className="text-indigo-500" />
                          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Questions Shuffled</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingExam ? 'Edit Exam' : 'Create Exam'}</DialogTitle>
          </DialogHeader>

          {/* Modal Tabs */}
          <div className="-mx-6 px-6 border-b border-gray-100 dark:border-gray-700 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {MODAL_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveModalTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
                    activeModalTab === tab.key
                      ? 'bg-primary/10 text-primary border-b-2 border-primary'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <form id="exam-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Tab */}
              {activeModalTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Exam Name *</label>
<Input
                          type="text"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Term *</label>
                      <select
                        value={formData.term}
                        onChange={(e) => updateField('term', e.target.value)}
                        className="w-full"
                        required
                      >
                        <option value="Monthly1">Monthly 1</option>
                        <option value="Midterm">Midterm</option>
                        <option value="Monthly2">Monthly 2</option>
                        <option value="Final">Final</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date *</label>
                      <Input
                        type="date"
                        value={formData.date}
                        onChange={(e) => updateField('date', e.target.value)}
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Subject *</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => updateField('subject', e.target.value)}
                        className="w-full"
                        required
                      >
                        <option value="">Select Subject</option>
                        {subjects?.map((s) => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Class *</label>
                      <select
                        value={formData.class}
                        onChange={(e) => updateField('class', e.target.value)}
                        className="w-full"
                        required
                      >
                        <option value="">Select Class</option>
                        {classes?.map((c) => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Max Marks *</label>
                      <Input
                        type="number"
                        value={formData.maxMarks}
                        onChange={(e) => updateField('maxMarks', parseInt(e.target.value) || 0)}
                        min="1"
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Exam Type *</label>
                      <select
                        value={formData.examType}
                        onChange={(e) => updateField('examType', e.target.value)}
                        className="w-full"
                        required
                      >
                        <option value="OFFLINE">Offline</option>
                        <option value="ONLINE">Online</option>
                        <option value="HYBRID">Hybrid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                      <select
                        value={formData.examCategory}
                        onChange={(e) => updateField('examCategory', e.target.value)}
                        className="w-full"
                        required
                      >
                        <option value="FORMATIVE">Formative</option>
                        <option value="SUMMATIVE">Summative</option>
                        <option value="DIAGNOSTIC">Diagnostic</option>
                        <option value="PLACEMENT">Placement</option>
                        <option value="PRACTICE">Practice</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Online Settings Tab */}
              {activeModalTab === 'online' && isOnline && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Question Selection Mode</label>
                      <select
                        value={formData.questionSelectionMode}
                        onChange={(e) => updateField('questionSelectionMode', e.target.value)}
                        className="w-full"
                      >
                        <option value="MANUAL">Manual Selection</option>
                        <option value="AUTO_RANDOM">Auto — Random from Bank</option>
                        <option value="AUTO_DIFFICULTY">Auto — By Difficulty</option>
                        <option value="AUTO_BLOOM">Auto — By Bloom's Taxonomy</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Question Bank</label>
                      <select
                        value={formData.questionBank}
                        onChange={(e) => {
                          updateField('questionBank', e.target.value);
                          updateField('questions', []);
                        }}
                        className="w-full"
                      >
                        <option value="">Select Bank</option>
                        {questionBanks?.questionBanks?.map((bank) => (
                          <option key={bank._id} value={bank._id}>{bank.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
                      <Input
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={(e) => updateField('startTime', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">End Time</label>
                      <Input
                        type="datetime-local"
                        value={formData.endTime}
                        onChange={(e) => updateField('endTime', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Duration (min)</label>
                      <Input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => updateField('duration', parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Passing Score</label>
                      <Input
                        type="number"
                        value={formData.passingScore}
                        onChange={(e) => updateField('passingScore', parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Passing %</label>
                      <Input
                        type="number"
                        value={formData.passingPercentage}
                        onChange={(e) => updateField('passingPercentage', parseInt(e.target.value) || 0)}
                        min="0"
                        max="100"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Max Attempts</label>
                      <Input
                        type="number"
                        value={formData.maxAttempts}
                        onChange={(e) => updateField('maxAttempts', parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-full"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <label className="flex items-center gap-2 cursor-pointer py-2.5">
                        <input
                          type="checkbox"
                          checked={formData.allowRetake}
                          onChange={(e) => updateField('allowRetake', e.target.checked)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Allow Retake</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.timePerQuestion}
                          onChange={(e) => updateField('timePerQuestion', e.target.checked)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Time per Question</span>
                      </label>
                    </div>
                  </div>

                  {/* Manual Question Selection */}
                  {formData.questionSelectionMode === 'MANUAL' && formData.questionBank && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          Select Questions ({formData.questions.length} selected)
                        </h4>
                        {questionsList.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const allIds = questionsList.map((q) => q._id);
                              const allSelected = allIds.every((id) => formData.questions.includes(id));
                              if (allSelected) {
                                updateField('questions', []);
                              } else {
                                updateField('questions', allIds);
                              }
                            }}
                            className="text-xs text-primary font-semibold hover:underline"
                          >
                            {questionsList.every((q) => formData.questions.includes(q._id)) ? 'Deselect All' : 'Select All'}
                          </button>
                        )}
                      </div>
                      {questionsList.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500">No questions found in this bank</p>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                          {Object.entries(groupedQuestions).map(([type, qs]) => (
                            <div key={type} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                              <button
                                type="button"
                                onClick={() => toggleAllQuestionsInGroup(qs)}
                                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/50 text-left"
                              >
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase">
                                  {type.replace(/_/g, ' ')} ({qs.length})
                                </span>
                                <span className="text-xs text-primary font-semibold">
                                  {qs.every((q) => formData.questions.includes(q._id)) ? 'All selected' : `${qs.filter((q) => formData.questions.includes(q._id)).length} selected`}
                                </span>
                              </button>
                              <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                                {qs.map((q) => (
                                  <label
                                    key={q._id}
                                    className="flex items-start gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={formData.questions.includes(q._id)}
                                      onChange={() => toggleQuestionSelection(q._id)}
                                      className="w-4 h-4 mt-0.5 rounded shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{q.questionText || q.text || 'Untitled question'}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        {q.difficulty && (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase font-semibold">
                                            {q.difficulty}
                                          </span>
                                        )}
                                        {q.marks && (
                                          <span className="text-[10px] text-gray-400">{q.marks} marks</span>
                                        )}
                                      </div>
                                    </div>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Negative Marking Tab */}
              {activeModalTab === 'negative' && isOnline && (
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.negativeMarking.enabled}
                      onChange={(e) => updateNestedField('negativeMarking', 'enabled', e.target.checked)}
                      className="w-5 h-5 rounded"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Enable Negative Marking</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Deduct marks for incorrect answers</p>
                    </div>
                  </label>
                  {formData.negativeMarking.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Penalty per Wrong Answer (%)</label>
<Input
                      type="number"
                          value={formData.negativeMarking.penaltyPerWrong}
                          onChange={(e) => updateNestedField('negativeMarking', 'penaltyPerWrong', parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          step="0.5"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Max Negative % of Total</label>
<Input
                      type="number"
                          value={formData.negativeMarking.maxNegativePercentage}
                          onChange={(e) => updateNestedField('negativeMarking', 'maxNegativePercentage', parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Anti-Cheat Tab */}
              {activeModalTab === 'anticheat' && isOnline && (
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requireProctoring}
                      onChange={(e) => updateField('requireProctoring', e.target.checked)}
                      className="w-5 h-5 rounded"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Require Proctoring</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Enable exam proctoring and monitoring</p>
                    </div>
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tab Switch Limit</label>
                      <Input
                        type="number"
                        value={formData.antiCheatConfig.tabSwitchLimit}
                        onChange={(e) => updateNestedField('antiCheatConfig', 'tabSwitchLimit', parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Restrictions</h4>
                    {[
                      { key: 'fullScreenRequired', label: 'Require Full Screen', desc: 'Force fullscreen mode during exam', icon: Monitor },
                      { key: 'copyPasteDisabled', label: 'Disable Copy/Paste', desc: 'Prevent copying and pasting content', icon: Keyboard },
                      { key: 'rightClickDisabled', label: 'Disable Right Click', desc: 'Block right-click context menu', icon: MousePointerClick },
                      { key: 'browserFullScreen', label: 'Browser Full Screen', desc: 'Require browser fullscreen mode', icon: Eye },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.antiCheatConfig[item.key]}
                          onChange={(e) => updateNestedField('antiCheatConfig', item.key, e.target.checked)}
                          className="w-4 h-4 rounded"
                        />
                        <item.icon size={16} className="text-gray-400 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.label}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{item.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Display Tab */}
              {activeModalTab === 'display' && isOnline && (
                <div className="space-y-3">
                  {[
                    { key: 'shuffleQuestions', label: 'Shuffle Questions', desc: 'Randomize question order for each student' },
                    { key: 'shuffleOptions', label: 'Shuffle Options', desc: 'Randomize answer options order' },
                    { key: 'showResultsImmediately', label: 'Show Results Immediately', desc: 'Display results after submission' },
                    { key: 'showCorrectAnswers', label: 'Show Correct Answers', desc: 'Reveal correct answers after submission' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData[item.key]}
                        onChange={(e) => updateField(item.key, e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.label}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{item.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {/* Security Tab */}
              {activeModalTab === 'security' && isOnline && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Exam Password (optional)</label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      placeholder="Leave empty for no password"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Allowed IPs (comma-separated)</label>
                    <Input
                      type="text"
                      value={formData.allowedIPs}
                      onChange={(e) => updateField('allowedIPs', e.target.value)}
                      placeholder="e.g. 192.168.1.1, 10.0.0.1"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Restrict access to specific IP addresses. Leave empty for no restriction.</p>
                  </div>
                </div>
              )}

              {/* Randomization Tab */}
              {activeModalTab === 'randomization' && isOnline && formData.questionSelectionMode !== 'MANUAL' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Easy Questions</label>
                      <Input
                        type="number"
                        value={formData.randomizationConfig.easyCount}
                        onChange={(e) => updateNestedField('randomizationConfig', 'easyCount', parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Medium Questions</label>
                      <Input
                        type="number"
                        value={formData.randomizationConfig.mediumCount}
                        onChange={(e) => updateNestedField('randomizationConfig', 'mediumCount', parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Hard Questions</label>
                      <Input
                        type="number"
                        value={formData.randomizationConfig.hardCount}
                        onChange={(e) => updateNestedField('randomizationConfig', 'hardCount', parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Questions</label>
                      <Input
                        type="number"
                        value={formData.randomizationConfig.totalQuestions}
                        onChange={(e) => updateNestedField('randomizationConfig', 'totalQuestions', parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Question Pool Size</label>
                      <Input
                        type="number"
                        value={formData.randomizationConfig.questionPoolSize}
                        onChange={(e) => updateNestedField('randomizationConfig', 'questionPoolSize', parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
              {activeModalTab === 'randomization' && (formData.questionSelectionMode === 'MANUAL' || !isOnline) && (
                <div className="text-center py-8">
                  <Sliders size={32} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Randomization is only available for auto-generated question modes.</p>
                </div>
              )}

              {/* Grading Tab */}
              {activeModalTab === 'grading' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Custom Grading Scale</h4>
                    <button
                      type="button"
                      onClick={handleAddGradingRow}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20 transition-colors"
                    >
                      <Plus size={14} />
                      Add Grade
                    </button>
                  </div>
                  {formData.gradingScale.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <Award size={28} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400 dark:text-gray-500">No custom grades defined. Default grading will be used.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formData.gradingScale.map((row, idx) => (
                        <div key={idx} className="grid grid-cols-5 gap-2 items-center bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2">
                          <Input
                            type="text"
                            placeholder="Grade (e.g. A+)"
                            value={row.grade}
                            onChange={(e) => handleUpdateGradingRow(idx, 'grade', e.target.value)}
                            className="px-3 py-2 bg-white dark:bg-gray-700"
                          />
                          <div>
                            <label className="text-[10px] text-gray-400 uppercase font-semibold">Min %</label>
                            <Input
                              type="number"
                              value={row.minPercentage}
                              onChange={(e) => handleUpdateGradingRow(idx, 'minPercentage', parseFloat(e.target.value) || 0)}
                              min="0"
                              max="100"
                              className="w-full px-3 py-2 bg-white dark:bg-gray-700"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 uppercase font-semibold">Max %</label>
                            <Input
                              type="number"
                              value={row.maxPercentage}
                              onChange={(e) => handleUpdateGradingRow(idx, 'maxPercentage', parseFloat(e.target.value) || 0)}
                              min="0"
                              max="100"
                              className="w-full px-3 py-2 bg-white dark:bg-gray-700"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-400 uppercase font-semibold">GPA</label>
                            <Input
                              type="number"
                              value={row.gpaPoints}
                              onChange={(e) => handleUpdateGradingRow(idx, 'gpaPoints', parseFloat(e.target.value) || 0)}
                              min="0"
                              max="4"
                              step="0.1"
                              className="w-full px-3 py-2 bg-white dark:bg-gray-700"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveGradingRow(idx)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors self-end"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Instructions Tab */}
              {activeModalTab === 'instructions' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Exam Instructions</label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) => updateField('instructions', e.target.value)}
                      rows={8}
                      placeholder="Enter instructions for students taking this exam..."
                      className="w-full resize-none"
                    />
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      These instructions will be displayed to students before they begin the exam.
                    </p>
                  </div>
                </div>
              )}

            </form>

          <DialogFooter className="mt-4">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="exam-form"
              disabled={isCreating || isUpdating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating || isUpdating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  {editingExam ? 'Update Exam' : 'Create Exam'}
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Modal */}
      <Dialog open={!!analyticsExamId} onOpenChange={(open) => { if (!open) setAnalyticsExamId(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 size={20} />
              Exam Analytics
            </DialogTitle>
          </DialogHeader>

              {analyticsLoading ? (
                <div className="py-12 flex items-center justify-center">
                  <Loader2 size={28} className="animate-spin text-primary" />
                </div>
              ) : !analyticsData?.analytics ? (
                <div className="text-center py-8">
                  <BarChart3 size={36} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No analytics data available yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Analytics will appear after students complete the exam</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Total Students', value: analyticsData.analytics.totalStudents, color: 'text-blue-600 dark:text-blue-400' },
                      { label: 'Average Score', value: `${analyticsData.analytics.averageScore}%`, color: 'text-emerald-600 dark:text-emerald-400' },
                      { label: 'Pass Rate', value: `${analyticsData.analytics.passRate}%`, color: 'text-emerald-600 dark:text-emerald-400' },
                      { label: 'Median Score', value: `${analyticsData.analytics.medianScore}%`, color: 'text-purple-600 dark:text-purple-400' },
                      { label: 'Highest Score', value: `${analyticsData.analytics.highestScore}%`, color: 'text-amber-600 dark:text-amber-400' },
                      { label: 'Lowest Score', value: `${analyticsData.analytics.lowestScore}%`, color: 'text-rose-600 dark:text-rose-400' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">{stat.label}</p>
                        <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {analyticsData.analytics.responseRate && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Response Rate</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{analyticsData.analytics.responseRate}%</p>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${Math.min(analyticsData.analytics.responseRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {Object.keys(analyticsData.analytics.gradeDistribution || {}).length > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase mb-2">Grade Distribution</p>
                      <div className="space-y-1.5">
                        {Object.entries(analyticsData.analytics.gradeDistribution).map(([grade, count]) => (
                          <div key={grade} className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 w-8">{grade}</span>
                            <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                              <div
                                className="bg-primary/70 rounded-full h-2.5 transition-all"
                                style={{ width: `${(count / analyticsData.analytics.totalStudents) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-6 text-right">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

          <DialogFooter>
            <button
              onClick={() => setAnalyticsExamId(null)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default ExamManagement;
