import { useState, useMemo, useCallback } from 'react';
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  X,
  CheckCircle2,
  Eye,
  Download,
  Upload,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ListChecks,
  BarChart3,
  Hash,
  FileJson,
  Copy,
  Timer,
  Target,
  TrendingUp,
  Zap,
  Code,
  AlignLeft,
  CheckSquare,
  ArrowUpDown,
  Link2,
  Box,
  CircleDot,
  Type,
  Columns,
  List,
  Calculator,
  Brain,
  BookOpen,
  Archive,
  RotateCcw,
  FileUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import {
  useCreateQuestionMutation,
  useGetQuestionsQuery,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useGetQuestionBanksQuery,
  useGetSubjectsQuery,
  useGetClassesQuery,
  useBulkCreateQuestionsMutation,
  useExportQuestionsQuery,
  useRestoreQuestionMutation,
  useArchiveQuestionMutation,
  useImportQuestionsMutation,
} from '../store/adminApiSlice';

const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: CheckSquare, color: 'blue' },
  { value: 'TRUE_FALSE', label: 'True/False', icon: CircleDot, color: 'green' },
  { value: 'SHORT_ANSWER', label: 'Short Answer', icon: Type, color: 'yellow' },
  { value: 'ESSAY', label: 'Essay', icon: AlignLeft, color: 'purple' },
  { value: 'MATCHING', label: 'Matching', icon: Columns, color: 'orange' },
  { value: 'FILL_BLANK', label: 'Fill in the Blank', icon: Box, color: 'pink' },
  { value: 'NUMERIC', label: 'Numeric', icon: Calculator, color: 'cyan' },
  { value: 'CODING', label: 'Coding', icon: Code, color: 'red' },
  { value: 'ORDERING', label: 'Ordering', icon: ArrowUpDown, color: 'indigo' },
];

const TYPE_BADGE_COLORS = {
  MULTIPLE_CHOICE: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  TRUE_FALSE: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  SHORT_ANSWER: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  ESSAY: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  MATCHING: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  FILL_BLANK: 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  NUMERIC: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
  CODING: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  ORDERING: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
};

const TYPE_SHORT = {
  MULTIPLE_CHOICE: 'MC',
  TRUE_FALSE: 'TF',
  SHORT_ANSWER: 'SA',
  ESSAY: 'Essay',
  MATCHING: 'Match',
  FILL_BLANK: 'Fill',
  NUMERIC: 'Numeric',
  CODING: 'Coding',
  ORDERING: 'Ordering',
};

const DIFFICULTY_COLORS = {
  EASY: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  MEDIUM: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  HARD: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

const BLOOM_LEVELS = ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE'];

const BLOOM_COLORS = {
  REMEMBER: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  UNDERSTAND: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  APPLY: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  ANALYZE: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  EVALUATE: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  CREATE: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
};

const CODING_LANGUAGES = ['JavaScript', 'Python', 'Java', 'C++', 'C', 'TypeScript', 'Go', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Rust'];

const ITEMS_PER_PAGE = 15;

const defaultFormData = {
  questionText: '',
  questionType: 'MULTIPLE_CHOICE',
  questionBank: '',
  subject: '',
  class: '',
  options: [{ optionText: '', isCorrect: false, optionOrder: 0 }],
  correctAnswer: false,
  correctAnswerText: '',
  matchingPairs: [{ leftItem: '', rightItem: '' }],
  blanks: [{ blankIndex: 0, correctAnswer: '' }],
  difficulty: 'MEDIUM',
  points: 1,
  tags: '',
  topic: '',
  chapter: '',
  explanation: '',
  timeLimit: '',
  bloomLevel: '',
  learningObjective: '',
  negativeMarking: false,
  negativeMarkingPenalty: 0,
  questionImageUrl: '',
  numericCorrectValue: '',
  numericTolerance: '',
  numericMin: '',
  numericMax: '',
  numericUnit: '',
  codingLanguage: 'JavaScript',
  codingTemplate: '',
  codingTestCases: [{ input: '', expectedOutput: '', isHidden: false, points: 1 }],
  orderingItems: [{ text: '', correctPosition: 1 }],
};

const QuestionManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({ ...defaultFormData });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterBank, setFilterBank] = useState('');
  const [page, setPage] = useState(1);
  const [showPreview, setShowPreview] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkJson, setBulkJson] = useState('');
  const [exportFormat, setExportFormat] = useState('json');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [createQuestion, { isLoading: isCreating }] = useCreateQuestionMutation();
  const [updateQuestion, { isLoading: isUpdating }] = useUpdateQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [bulkCreateQuestions, { isLoading: isBulkCreating }] = useBulkCreateQuestionsMutation();
  const [restoreQuestion] = useRestoreQuestionMutation();
  const [archiveQuestion] = useArchiveQuestionMutation();
  const [importQuestions, { isLoading: isImporting }] = useImportQuestionsMutation();

  const queryParams = useMemo(() => ({
    page,
    limit: ITEMS_PER_PAGE,
    ...(filterType && { questionType: filterType }),
    ...(filterDifficulty && { difficulty: filterDifficulty }),
    ...(filterBank && { questionBank: filterBank }),
  }), [page, filterType, filterDifficulty, filterBank]);

  const { data: questionsData, isLoading, refetch } = useGetQuestionsQuery(queryParams);
  const { data: questionBanks } = useGetQuestionBanksQuery();
  const { data: subjects } = useGetSubjectsQuery();
  const { data: classes } = useGetClassesQuery();

  const { data: exportData, refetch: refetchExport } = useExportQuestionsQuery(
    { format: exportFormat, questionType: filterType, difficulty: filterDifficulty, questionBank: filterBank },
    { skip: true }
  );

  const questions = useMemo(() => {
    const list = questionsData?.questions || [];
    if (!searchQuery) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (item) =>
        item.questionText?.toLowerCase().includes(q) ||
        item.topic?.toLowerCase().includes(q) ||
        item.chapter?.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [questionsData, searchQuery]);

  const allQuestions = questionsData?.questions || [];
  const totalQuestions = questionsData?.pagination?.totalQuestions || allQuestions.length;
  const totalPages = questionsData?.pagination?.totalPages || Math.ceil(totalQuestions / ITEMS_PER_PAGE);

  const stats = useMemo(() => {
    const byType = {};
    const byDifficulty = { EASY: 0, MEDIUM: 0, HARD: 0 };
    allQuestions.forEach((q) => {
      byType[q.questionType] = (byType[q.questionType] || 0) + 1;
      if (byDifficulty[q.difficulty] !== undefined) byDifficulty[q.difficulty]++;
    });
    return { total: totalQuestions, byType, byDifficulty };
  }, [allQuestions, totalQuestions]);

  const banksList = useMemo(() => questionBanks?.questionBanks || questionBanks || [], [questionBanks]);
  const subjectsList = useMemo(() => {
    if (Array.isArray(subjects)) return subjects;
    if (Array.isArray(subjects?.data)) return subjects.data;
    if (Array.isArray(subjects?.subjects)) return subjects.subjects;
    return [];
  }, [subjects]);
  const classesList = useMemo(() => {
    if (Array.isArray(classes)) return classes;
    if (Array.isArray(classes?.data)) return classes.data;
    if (Array.isArray(classes?.classes)) return classes.classes;
    return [];
  }, [classes]);

  const resetFormData = useCallback(() => setFormData({ ...defaultFormData }), []);

  const openCreateModal = useCallback(() => {
    setEditingQuestion(null);
    resetFormData();
    setShowModal(true);
  }, [resetFormData]);

  const handleEdit = useCallback((question) => {
    setEditingQuestion(question);
    setFormData({
      questionText: question.questionText || '',
      questionType: question.questionType || 'MULTIPLE_CHOICE',
      questionBank: question.questionBank?._id || '',
      subject: question.subject?._id || '',
      class: question.class?._id || '',
      options: question.options?.length ? question.options.map((o) => ({ ...o })) : [{ optionText: '', isCorrect: false, optionOrder: 0 }],
      correctAnswer: question.correctAnswer ?? false,
      correctAnswerText: question.correctAnswerText || '',
      matchingPairs: question.matchingPairs?.length ? question.matchingPairs.map((p) => ({ ...p })) : [{ leftItem: '', rightItem: '' }],
      blanks: question.blanks?.length ? question.blanks.map((b) => ({ ...b })) : [{ blankIndex: 0, correctAnswer: '' }],
      difficulty: question.difficulty || 'MEDIUM',
      points: question.points || 1,
      tags: question.tags?.join(', ') || '',
      topic: question.topic || '',
      chapter: question.chapter || '',
      explanation: question.explanation || '',
      timeLimit: question.timeLimit || '',
      bloomLevel: question.bloomLevel || '',
      learningObjective: question.learningObjective || '',
      negativeMarking: question.negativeMarking ?? false,
      negativeMarkingPenalty: question.negativeMarkingPenalty || 0,
      questionImageUrl: question.questionImageUrl || '',
      numericCorrectValue: question.numericCorrectValue ?? '',
      numericTolerance: question.numericTolerance ?? '',
      numericMin: question.numericMin ?? '',
      numericMax: question.numericMax ?? '',
      numericUnit: question.numericUnit || '',
      codingLanguage: question.codingLanguage || 'JavaScript',
      codingTemplate: question.codingTemplate || '',
      codingTestCases: question.codingTestCases?.length
        ? question.codingTestCases.map((tc) => ({ ...tc }))
        : [{ input: '', expectedOutput: '', isHidden: false, points: 1 }],
      orderingItems: question.orderingItems?.length
        ? question.orderingItems.map((it) => ({ ...it }))
        : [{ text: '', correctPosition: 1 }],
    });
    setShowModal(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        timeLimit: formData.timeLimit ? parseInt(formData.timeLimit, 10) : undefined,
        points: parseInt(formData.points, 10) || 1,
        negativeMarkingPenalty: formData.negativeMarking ? Number(formData.negativeMarkingPenalty) : 0,
        numericCorrectValue: formData.numericCorrectValue !== '' ? Number(formData.numericCorrectValue) : undefined,
        numericTolerance: formData.numericTolerance !== '' ? Number(formData.numericTolerance) : undefined,
        numericMin: formData.numericMin !== '' ? Number(formData.numericMin) : undefined,
        numericMax: formData.numericMax !== '' ? Number(formData.numericMax) : undefined,
      };

      if (editingQuestion) {
        await updateQuestion({ id: editingQuestion._id, ...data }).unwrap();
        toast.success('Question updated successfully');
      } else {
        await createQuestion(data).unwrap();
        toast.success('Question created successfully');
      }

      setShowModal(false);
      setEditingQuestion(null);
      resetFormData();
      refetch();
    } catch (error) {
      toast.error(error.data?.message || error.data?.userMessage || 'Failed to save question');
    }
  };

  const handleDelete = async (questionId) => {
    try {
      await deleteQuestion(questionId).unwrap();
      toast.success('Question deleted successfully');
      setConfirmDelete(null);
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to delete question');
    }
  };

  const handleRestore = async (questionId) => {
    try {
      await restoreQuestion({ questionId }).unwrap();
      toast.success('Question restored successfully');
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to restore question');
    }
  };

  const handleArchive = async (questionId) => {
    try {
      await archiveQuestion({ questionId }).unwrap();
      toast.success('Question archived');
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to archive question');
    }
  };

  const [importFile, setImportFile] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleCSVImport = async () => {
    if (!importFile) {
      toast.error('Please select a CSV file');
      return;
    }
    try {
      const text = await importFile.text();
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length < 2) {
        toast.error('CSV must have a header row and at least one data row');
        return;
      }
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const questions = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.trim());
        const row = {};
        headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
        const q = {
          questionType: row.type || row.questiontype || 'MULTIPLE_CHOICE',
          questionText: row.question || row.text || row.questiontext || '',
          difficulty: row.difficulty || 'MEDIUM',
          points: parseInt(row.points || '1'),
        };
        if (q.questionType === 'MULTIPLE_CHOICE' || q.questionType === 'TRUE_FALSE') {
          const opts = [];
          if (row.option1) opts.push({ text: row.option1, isCorrect: row.correct === '1' || row.correct?.toLowerCase() === row.option1?.toLowerCase() });
          if (row.option2) opts.push({ text: row.option2, isCorrect: row.correct === '2' || row.correct?.toLowerCase() === row.option2?.toLowerCase() });
          if (row.option3) opts.push({ text: row.option3, isCorrect: row.correct === '3' || row.correct?.toLowerCase() === row.option3?.toLowerCase() });
          if (row.option4) opts.push({ text: row.option4, isCorrect: row.correct === '4' || row.correct?.toLowerCase() === row.option4?.toLowerCase() });
          q.options = opts;
        }
        if (row.explanation) q.explanation = row.explanation;
        questions.push(q);
      }
      if (!questions.length) {
        toast.error('No valid questions found in CSV');
        return;
      }
      await importQuestions({ questions }).unwrap();
      toast.success(`${questions.length} questions imported from CSV`);
      setShowImportModal(false);
      setImportFile(null);
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to import CSV');
    }
  };

  const handleBulkImport = async () => {
    try {
      const parsed = JSON.parse(bulkJson);
      const questionsArr = Array.isArray(parsed) ? parsed : parsed.questions || [parsed];
      await bulkCreateQuestions({ questions: questionsArr }).unwrap();
      toast.success(`${questionsArr.length} questions imported successfully`);
      setShowBulkImport(false);
      setBulkJson('');
      refetch();
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error('Invalid JSON format');
      } else {
        toast.error(error.data?.message || 'Failed to import questions');
      }
    }
  };

  const handleExport = async (format) => {
    setShowExportMenu(false);
    setExportFormat(format);
    try {
      const result = await refetchExport().unwrap();
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'questions-export.json';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const csv = convertToCSV(result?.questions || result || []);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'questions-export.csv';
        a.click();
        URL.revokeObjectURL(url);
      }
      toast.success('Export completed');
    } catch {
      toast.error('Export failed');
    }
  };

  const convertToCSV = (data) => {
    if (!data.length) return '';
    const headers = ['questionText', 'questionType', 'difficulty', 'points', 'topic', 'chapter', 'subject', 'class'];
    const rows = data.map((row) =>
      headers.map((h) => {
        const val = row[h];
        if (val === undefined || val === null) return '';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  };

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const addOption = () => setFormData((p) => ({ ...p, options: [...p.options, { optionText: '', isCorrect: false, optionOrder: p.options.length }] }));
  const updateOption = (i, field, value) => setFormData((p) => ({ ...p, options: p.options.map((o, idx) => idx === i ? { ...o, [field]: value } : o) }));
  const removeOption = (i) => setFormData((p) => ({ ...p, options: p.options.filter((_, idx) => idx !== i) }));

  const addMatchingPair = () => setFormData((p) => ({ ...p, matchingPairs: [...p.matchingPairs, { leftItem: '', rightItem: '' }] }));
  const updateMatchingPair = (i, field, value) => setFormData((p) => ({ ...p, matchingPairs: p.matchingPairs.map((pr, idx) => idx === i ? { ...pr, [field]: value } : pr) }));
  const removeMatchingPair = (i) => setFormData((p) => ({ ...p, matchingPairs: p.matchingPairs.filter((_, idx) => idx !== i) }));

  const addBlank = () => setFormData((p) => ({ ...p, blanks: [...p.blanks, { blankIndex: p.blanks.length, correctAnswer: '' }] }));
  const updateBlank = (i, field, value) => setFormData((p) => ({ ...p, blanks: p.blanks.map((b, idx) => idx === i ? { ...b, [field]: value } : b) }));
  const removeBlank = (i) => setFormData((p) => ({ ...p, blanks: p.blanks.filter((_, idx) => idx !== i) }));

  const addTestCase = () => setFormData((p) => ({ ...p, codingTestCases: [...p.codingTestCases, { input: '', expectedOutput: '', isHidden: false, points: 1 }] }));
  const updateTestCase = (i, field, value) => setFormData((p) => ({ ...p, codingTestCases: p.codingTestCases.map((tc, idx) => idx === i ? { ...tc, [field]: value } : tc) }));
  const removeTestCase = (i) => setFormData((p) => ({ ...p, codingTestCases: p.codingTestCases.filter((_, idx) => idx !== i) }));

  const addOrderingItem = () => setFormData((p) => ({ ...p, orderingItems: [...p.orderingItems, { text: '', correctPosition: p.orderingItems.length + 1 }] }));
  const updateOrderingItem = (i, field, value) => setFormData((p) => ({ ...p, orderingItems: p.orderingItems.map((it, idx) => idx === i ? { ...it, [field]: value } : it) }));
  const removeOrderingItem = (i) => setFormData((p) => ({ ...p, orderingItems: p.orderingItems.filter((_, idx) => idx !== i) }));

  const closeModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
    resetFormData();
  };

  const renderTypeSpecificFields = () => {
    switch (formData.questionType) {
      case 'MULTIPLE_CHOICE':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Options *</label>
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={option.isCorrect}
                    onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary/40"
                  />
                  <input
                    type="text"
                    value={option.optionText}
                    onChange={(e) => updateOption(index, 'optionText', e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    required
                  />
                  {formData.options.length > 1 && (
                    <button type="button" onClick={() => removeOption(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addOption} className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium">
                <Plus size={14} /> Add Option
              </button>
            </div>
          </div>
        );

      case 'TRUE_FALSE':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Correct Answer *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={formData.correctAnswer === true}
                  onChange={() => updateField('correctAnswer', true)}
                  className="w-4 h-4 text-primary focus:ring-primary/40"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">True</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={formData.correctAnswer === false}
                  onChange={() => updateField('correctAnswer', false)}
                  className="w-4 h-4 text-primary focus:ring-primary/40"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">False</span>
              </label>
            </div>
          </div>
        );

      case 'SHORT_ANSWER':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Correct Answer *</label>
            <input
              type="text"
              value={formData.correctAnswerText}
              onChange={(e) => updateField('correctAnswerText', e.target.value)}
              placeholder="Enter the correct answer"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              required
            />
          </div>
        );

      case 'ESSAY':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Answer Key / Reference</label>
            <textarea
              value={formData.correctAnswerText}
              onChange={(e) => updateField('correctAnswerText', e.target.value)}
              rows={4}
              placeholder="Provide the answer key or reference solution for grading"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
            />
          </div>
        );

      case 'MATCHING':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Matching Pairs *</label>
            <div className="space-y-2">
              {formData.matchingPairs.map((pair, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={pair.leftItem}
                    onChange={(e) => updateMatchingPair(index, 'leftItem', e.target.value)}
                    placeholder="Left item"
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    required
                  />
                  <span className="text-gray-400 font-bold">→</span>
                  <input
                    type="text"
                    value={pair.rightItem}
                    onChange={(e) => updateMatchingPair(index, 'rightItem', e.target.value)}
                    placeholder="Right item"
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    required
                  />
                  {formData.matchingPairs.length > 1 && (
                    <button type="button" onClick={() => removeMatchingPair(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addMatchingPair} className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium">
                <Plus size={14} /> Add Pair
              </button>
            </div>
          </div>
        );

      case 'FILL_BLANK':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Blanks (Correct Answers) *</label>
            <div className="space-y-2">
              {formData.blanks.map((blank, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 w-16 shrink-0">Blank {index + 1}:</span>
                  <input
                    type="text"
                    value={blank.correctAnswer}
                    onChange={(e) => updateBlank(index, 'correctAnswer', e.target.value)}
                    placeholder="Correct answer"
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    required
                  />
                  {formData.blanks.length > 1 && (
                    <button type="button" onClick={() => removeBlank(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addBlank} className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium">
                <Plus size={14} /> Add Blank
              </button>
            </div>
          </div>
        );

      case 'NUMERIC':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Numeric Answer Settings</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Correct Value *</label>
                <input
                  type="number"
                  step="any"
                  value={formData.numericCorrectValue}
                  onChange={(e) => updateField('numericCorrectValue', e.target.value)}
                  placeholder="e.g., 42"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tolerance (±)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.numericTolerance}
                  onChange={(e) => updateField('numericTolerance', e.target.value)}
                  placeholder="e.g., 0.5"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Min Value</label>
                <input
                  type="number"
                  step="any"
                  value={formData.numericMin}
                  onChange={(e) => updateField('numericMin', e.target.value)}
                  placeholder="Min"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Max Value</label>
                <input
                  type="number"
                  step="any"
                  value={formData.numericMax}
                  onChange={(e) => updateField('numericMax', e.target.value)}
                  placeholder="Max"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Unit</label>
              <input
                type="text"
                value={formData.numericUnit}
                onChange={(e) => updateField('numericUnit', e.target.value)}
                placeholder="e.g., meters, kg, seconds"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
            </div>
          </div>
        );

      case 'CODING':
        return (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Coding Settings</label>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Programming Language *</label>
              <select
                value={formData.codingLanguage}
                onChange={(e) => updateField('codingLanguage', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              >
                {CODING_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Code Template</label>
              <textarea
                value={formData.codingTemplate}
                onChange={(e) => updateField('codingTemplate', e.target.value)}
                rows={4}
                placeholder="Provide starter code template for students..."
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Test Cases</label>
              <div className="space-y-3">
                {formData.codingTestCases.map((tc, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Test Case {index + 1}</span>
                      {formData.codingTestCases.length > 1 && (
                        <button type="button" onClick={() => removeTestCase(index)} className="text-red-500 hover:text-red-700 p-1">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={tc.input}
                        onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                        placeholder="Input"
                        className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                      />
                      <input
                        type="text"
                        value={tc.expectedOutput}
                        onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                        placeholder="Expected Output"
                        className="px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tc.isHidden}
                          onChange={(e) => updateTestCase(index, 'isHidden', e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-primary focus:ring-primary/40"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">Hidden from student</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Points:</span>
                        <input
                          type="number"
                          value={tc.points}
                          onChange={(e) => updateTestCase(index, 'points', parseInt(e.target.value, 10) || 0)}
                          min="0"
                          className="w-16 px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addTestCase} className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium">
                  <Plus size={14} /> Add Test Case
                </button>
              </div>
            </div>
          </div>
        );

      case 'ORDERING':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Items in Correct Order *</label>
            <div className="space-y-2">
              {formData.orderingItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold shrink-0">
                    {item.correctPosition || index + 1}
                  </span>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateOrderingItem(index, 'text', e.target.value)}
                    placeholder={`Item ${index + 1}`}
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    required
                  />
                  <input
                    type="number"
                    value={item.correctPosition}
                    onChange={(e) => updateOrderingItem(index, 'correctPosition', parseInt(e.target.value, 10) || 1)}
                    min="1"
                    className="w-20 px-2 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    title="Correct position"
                  />
                  {formData.orderingItems.length > 1 && (
                    <button type="button" onClick={() => removeOrderingItem(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addOrderingItem} className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium">
                <Plus size={14} /> Add Item
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Questions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">Manage questions for online exams</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Download size={16} />
              Export
            </button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FileJson size={16} /> Export as JSON
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 border-t border-gray-100 dark:border-gray-700"
                  >
                    <Download size={16} /> Export as CSV
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => setShowBulkImport(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Upload size={16} />
            Bulk Import
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FileUp size={16} />
            CSV Import
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 active:scale-95 transition-all"
          >
            <Plus size={16} />
            Create Question
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ListChecks size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
              <TrendingUp size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Easy</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.byDifficulty.EASY}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center">
              <Zap size={20} className="text-yellow-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Medium</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{stats.byDifficulty.MEDIUM}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Hard</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.byDifficulty.HARD}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <BarChart3 size={20} className="text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Types</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{Object.keys(stats.byType).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <HelpCircle size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Questions</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Create and manage exam questions</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary w-48"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              <option value="">All Types</option>
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <select
              value={filterDifficulty}
              onChange={(e) => { setFilterDifficulty(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              <option value="">All Difficulty</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
            <select
              value={filterBank}
              onChange={(e) => { setFilterBank(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            >
              <option value="">All Banks</option>
              {banksList.map((bank) => (
                <option key={bank._id} value={bank._id}>{bank.name}</option>
              ))}
            </select>
            {(filterType || filterDifficulty || filterBank || searchQuery) && (
              <button
                onClick={() => { setFilterType(''); setFilterDifficulty(''); setFilterBank(''); setSearchQuery(''); setPage(1); }}
                className="flex items-center gap-1 px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg font-medium transition-colors"
              >
                <X size={14} /> Clear
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={10} columns={5} />
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center">
            <HelpCircle size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No questions found</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Create your first question to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {questions.map((question) => (
              <div key={question._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${TYPE_BADGE_COLORS[question.questionType] || ''}`}>
                        {TYPE_SHORT[question.questionType] || question.questionType}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${DIFFICULTY_COLORS[question.difficulty] || ''}`}>
                        {question.difficulty}
                      </span>
                      {question.bloomLevel && (
                        <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${BLOOM_COLORS[question.bloomLevel] || ''}`}>
                          {question.bloomLevel}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{question.points} pts</span>
                      {question.timeLimit && (
                        <span className="flex items-center gap-0.5 text-xs text-gray-400 dark:text-gray-500">
                          <Timer size={12} /> {question.timeLimit}s
                        </span>
                      )}
                      {question.negativeMarking && (
                        <span className="flex items-center gap-0.5 text-xs text-red-400">
                          <AlertTriangle size={12} /> -{question.negativeMarkingPenalty} penalty
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{question.questionText}</h3>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      {question.subject?.name && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{question.subject.name}</span>
                      )}
                      {question.class?.name && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{question.class.name}</span>
                      )}
                      {question.questionBank?.name && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">{question.questionBank.name}</span>
                      )}
                      {question.topic && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">Topic: {question.topic}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4 shrink-0">
                    <button
                      onClick={() => setShowPreview(question)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(question)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    {question.status === 'ARCHIVED' || question.isDeleted ? (
                      <button
                        onClick={() => handleRestore(question._id)}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                        title="Restore"
                      >
                        <RotateCcw size={16} />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleArchive(question._id)}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"
                          title="Archive"
                        >
                          <Archive size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(question)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, totalQuestions)} of {totalQuestions}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      page === pageNum
                        ? 'bg-primary text-white'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Question</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this question? &quot;{confirmDelete.questionText?.substring(0, 80)}...&quot;
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete._id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl z-10">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Question Preview</h3>
              <button onClick={() => setShowPreview(null)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${TYPE_BADGE_COLORS[showPreview.questionType] || ''}`}>
                  {QUESTION_TYPES.find((t) => t.value === showPreview.questionType)?.label || showPreview.questionType}
                </span>
                <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${DIFFICULTY_COLORS[showPreview.difficulty] || ''}`}>
                  {showPreview.difficulty}
                </span>
                {showPreview.bloomLevel && (
                  <span className={`px-2.5 py-1 text-xs rounded-full font-semibold ${BLOOM_COLORS[showPreview.bloomLevel] || ''}`}>
                    {showPreview.bloomLevel}
                  </span>
                )}
                <span className="px-2.5 py-1 text-xs rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {showPreview.points} pts
                </span>
                {showPreview.timeLimit && (
                  <span className="px-2.5 py-1 text-xs rounded-full font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    <Timer size={12} /> {showPreview.timeLimit}s
                  </span>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-900 dark:text-white whitespace-pre-wrap">{showPreview.questionText}</p>
                {showPreview.questionImageUrl && (
                  <img src={showPreview.questionImageUrl} alt="Question" className="mt-3 max-h-48 rounded-lg object-contain" />
                )}
              </div>

              {showPreview.learningObjective && (
                <div className="flex items-start gap-2 text-sm">
                  <Target size={16} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Learning Objective: </span>
                    <span className="text-gray-600 dark:text-gray-400">{showPreview.learningObjective}</span>
                  </div>
                </div>
              )}

              {/* Type-specific preview */}
              {showPreview.questionType === 'MULTIPLE_CHOICE' && showPreview.options && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Options</p>
                  {showPreview.options.map((opt, i) => (
                    <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-sm ${opt.isCorrect ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">{opt.optionText}</span>
                      {opt.isCorrect && <CheckCircle2 size={16} className="text-green-500 ml-auto shrink-0" />}
                    </div>
                  ))}
                </div>
              )}

              {showPreview.questionType === 'TRUE_FALSE' && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Correct Answer</p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold ${showPreview.correctAnswer ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                    {showPreview.correctAnswer ? <CheckCircle2 size={16} /> : <X size={16} />}
                    {showPreview.correctAnswer ? 'True' : 'False'}
                  </div>
                </div>
              )}

              {(showPreview.questionType === 'SHORT_ANSWER' || showPreview.questionType === 'ESSAY') && showPreview.correctAnswerText && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{showPreview.questionType === 'ESSAY' ? 'Answer Key / Reference' : 'Correct Answer'}</p>
                  <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400 whitespace-pre-wrap">
                    {showPreview.correctAnswerText}
                  </div>
                </div>
              )}

              {showPreview.questionType === 'MATCHING' && showPreview.matchingPairs && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Matching Pairs</p>
                  <div className="grid grid-cols-1 gap-2">
                    {showPreview.matchingPairs.map((pair, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{pair.leftItem}</span>
                        <span className="text-primary font-bold">→</span>
                        <span className="text-gray-700 dark:text-gray-300">{pair.rightItem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showPreview.questionType === 'FILL_BLANK' && showPreview.blanks && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Correct Answers</p>
                  {showPreview.blanks.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500 font-medium">Blank {i + 1}:</span>
                      <span className="px-3 py-1 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg text-pink-700 dark:text-pink-400 font-semibold">{b.correctAnswer}</span>
                    </div>
                  ))}
                </div>
              )}

              {showPreview.questionType === 'NUMERIC' && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Numeric Answer</p>
                  <div className="px-4 py-3 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl text-sm space-y-1">
                    <p className="text-cyan-700 dark:text-cyan-400 font-semibold">Correct: {showPreview.numericCorrectValue}{showPreview.numericUnit ? ` ${showPreview.numericUnit}` : ''}</p>
                    {showPreview.numericTolerance && <p className="text-cyan-600 dark:text-cyan-500">Tolerance: ±{showPreview.numericTolerance}</p>}
                    {(showPreview.numericMin || showPreview.numericMax) && (
                      <p className="text-cyan-600 dark:text-cyan-500">Range: {showPreview.numericMin ?? '—'} to {showPreview.numericMax ?? '—'}</p>
                    )}
                  </div>
                </div>
              )}

              {showPreview.questionType === 'CODING' && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Coding Details</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-full font-semibold">{showPreview.codingLanguage}</span>
                  </div>
                  {showPreview.codingTemplate && (
                    <pre className="px-4 py-3 bg-gray-900 dark:bg-gray-950 rounded-xl text-sm text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">{showPreview.codingTemplate}</pre>
                  )}
                  {showPreview.codingTestCases?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Test Cases ({showPreview.codingTestCases.length})</p>
                      {showPreview.codingTestCases.map((tc, i) => (
                        <div key={i} className="p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-xs space-y-1">
                          <p className="text-gray-500">Case {i + 1}{tc.isHidden ? ' (Hidden)' : ''}</p>
                          <p className="font-mono">Input: {tc.input || '—'}</p>
                          <p className="font-mono">Expected: {tc.expectedOutput || '—'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {showPreview.questionType === 'ORDERING' && showPreview.orderingItems && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Correct Order</p>
                  <div className="space-y-2">
                    {showPreview.orderingItems.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
                        <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold shrink-0">{item.correctPosition || i + 1}</span>
                        <span className="text-gray-700 dark:text-gray-300">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                {showPreview.topic && (
                  <div><span className="font-semibold text-gray-500 dark:text-gray-400">Topic: </span><span className="text-gray-700 dark:text-gray-300">{showPreview.topic}</span></div>
                )}
                {showPreview.chapter && (
                  <div><span className="font-semibold text-gray-500 dark:text-gray-400">Chapter: </span><span className="text-gray-700 dark:text-gray-300">{showPreview.chapter}</span></div>
                )}
                {showPreview.subject?.name && (
                  <div><span className="font-semibold text-gray-500 dark:text-gray-400">Subject: </span><span className="text-gray-700 dark:text-gray-300">{showPreview.subject.name}</span></div>
                )}
                {showPreview.class?.name && (
                  <div><span className="font-semibold text-gray-500 dark:text-gray-400">Class: </span><span className="text-gray-700 dark:text-gray-300">{showPreview.class.name}</span></div>
                )}
              </div>

              {showPreview.tags?.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {showPreview.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">{tag}</span>
                  ))}
                </div>
              )}

              {showPreview.negativeMarking && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertTriangle size={16} />
                  <span>Negative marking: -{showPreview.negativeMarkingPenalty} penalty for wrong answers</span>
                </div>
              )}

              {showPreview.explanation && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1">Explanation</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 whitespace-pre-wrap">{showPreview.explanation}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end sticky bottom-0 bg-white dark:bg-gray-800 rounded-b-2xl">
              <button
                onClick={() => setShowPreview(null)}
                className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-xl">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                  <Upload size={18} className="text-purple-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Bulk Import Questions</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Paste a JSON array of questions</p>
                </div>
              </div>
              <button onClick={() => { setShowBulkImport(false); setBulkJson(''); }} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <textarea
                value={bulkJson}
                onChange={(e) => setBulkJson(e.target.value)}
                rows={12}
                placeholder={'[\n  {\n    "questionText": "What is 2 + 2?",\n    "questionType": "MULTIPLE_CHOICE",\n    "difficulty": "EASY",\n    "points": 1,\n    "options": [\n      { "optionText": "3", "isCorrect": false },\n      { "optionText": "4", "isCorrect": true },\n      { "optionText": "5", "isCorrect": false }\n    ]\n  }\n]'}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
              />
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <FileJson size={14} />
                <span>Supported formats: JSON array of question objects or {'{ "questions": [...] }'}</span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => { setShowBulkImport(false); setBulkJson(''); }}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkImport}
                disabled={!bulkJson.trim() || isBulkCreating}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBulkCreating ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                Import Questions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl shadow-xl my-8">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl z-10">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingQuestion ? 'Edit Question' : 'Create Question'}
              </h3>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Row 1: Type, Difficulty, Bloom */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Question Type *</label>
                  <select
                    value={formData.questionType}
                    onChange={(e) => updateField('questionType', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                    required
                  >
                    {QUESTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => updateField('difficulty', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bloom's Level</label>
                  <select
                    value={formData.bloomLevel}
                    onChange={(e) => updateField('bloomLevel', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                  >
                    <option value="">Select Level</option>
                    {BLOOM_LEVELS.map((l) => (
                      <option key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Question Text *</label>
                <textarea
                  value={formData.questionText}
                  onChange={(e) => updateField('questionText', e.target.value)}
                  rows={3}
                  placeholder="Enter your question text..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm resize-none"
                  required
                />
              </div>

              {/* Question Image URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Question Image URL</label>
                <input
                  type="url"
                  value={formData.questionImageUrl}
                  onChange={(e) => updateField('questionImageUrl', e.target.value)}
                  placeholder="https://example.com/image.png"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                />
                {formData.questionImageUrl && (
                  <img src={formData.questionImageUrl} alt="Preview" className="mt-2 max-h-32 rounded-lg object-contain" />
                )}
              </div>

              {/* Learning Objective */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Learning Objective</label>
                <input
                  type="text"
                  value={formData.learningObjective}
                  onChange={(e) => updateField('learningObjective', e.target.value)}
                  placeholder="e.g., Students will be able to solve quadratic equations"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                />
              </div>

              {/* Type-Specific Fields */}
              {renderTypeSpecificFields()}

              {/* Row: Points, Time Limit, Bank */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Points *</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => updateField('points', e.target.value)}
                    min="0"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Time Limit (sec)</label>
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => updateField('timeLimit', e.target.value)}
                    min="0"
                    placeholder="No limit"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Question Bank</label>
                  <select
                    value={formData.questionBank}
                    onChange={(e) => updateField('questionBank', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                  >
                    <option value="">Select Bank</option>
                    {banksList.map((bank) => (
                      <option key={bank._id} value={bank._id}>{bank.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row: Subject, Class */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => updateField('subject', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjectsList.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Class *</label>
                  <select
                    value={formData.class}
                    onChange={(e) => updateField('class', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                    required
                  >
                    <option value="">Select Class</option>
                    {classesList.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row: Topic, Chapter */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Topic</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => updateField('topic', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Chapter</label>
                  <input
                    type="text"
                    value={formData.chapter}
                    onChange={(e) => updateField('chapter', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => updateField('tags', e.target.value)}
                  placeholder="e.g., algebra, chapter1, important"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                />
              </div>

              {/* Negative Marking */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.negativeMarking}
                      onChange={(e) => updateField('negativeMarking', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Negative Marking</span>
                </div>
                {formData.negativeMarking && (
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Penalty Points</label>
                    <input
                      type="number"
                      value={formData.negativeMarkingPenalty}
                      onChange={(e) => updateField('negativeMarkingPenalty', e.target.value)}
                      min="0"
                      step="0.5"
                      placeholder="0"
                      className="w-32 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    />
                  </div>
                )}
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Explanation (shown after exam)</label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => updateField('explanation', e.target.value)}
                  rows={3}
                  placeholder="Provide an explanation for the correct answer..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2 sticky bottom-0 bg-white dark:bg-gray-800 pb-4 -mx-6 px-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating || isUpdating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      {editingQuestion ? 'Update' : 'Create'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowImportModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileUp size={20} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Import from CSV</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-300">
                <p className="font-semibold mb-1">CSV Format:</p>
                <p className="text-xs">Headers: <code>type, question, option1, option2, option3, option4, correct, difficulty, points, explanation</code></p>
                <p className="text-xs mt-1">type: MULTIPLE_CHOICE, TRUE_FALSE, SHORT_ANSWER, ESSAY, FILL_BLANK, NUMERIC, CODING, ORDERING</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select CSV File</label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer"
                />
              </div>
              {importFile && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Selected: {importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => { setShowImportModal(false); setImportFile(null); }}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCSVImport}
                disabled={!importFile || isImporting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {isImporting ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;
