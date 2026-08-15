import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  BookOpen,
  Clock,
  Timer,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  Bookmark,
  BookmarkCheck,
  FileText,
  Award,
  Percent,
  Shield,
  Monitor,
  Copy,
  MousePointerClick,
  Info,
  RotateCcw,
  Star,
  ArrowRight,
  GraduationCap,
  Trophy,
  Target,
  Hash,
  Loader2,
  X,
  CircleDot,
  Type,
  AlignLeft,
  Columns,
  Box,
  Calculator,
  CheckSquare,
  ArrowUpDown,
  Code,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  useGetOnlineExamsQuery,
  useGetOnlineExamByIdQuery,
  useStartOnlineExamMutation,
  useSubmitOnlineExamMutation,
  useGetQuestionsQuery,
  useGetExamResultsQuery,
} from '../store/adminApiSlice';

const QUESTION_TYPES = {
  MULTIPLE_CHOICE: { label: 'Multiple Choice', icon: CheckSquare, short: 'MC' },
  TRUE_FALSE: { label: 'True/False', icon: CircleDot, short: 'TF' },
  SHORT_ANSWER: { label: 'Short Answer', icon: Type, short: 'SA' },
  ESSAY: { label: 'Essay', icon: AlignLeft, short: 'Essay' },
  MATCHING: { label: 'Matching', icon: Columns, short: 'Match' },
  FILL_BLANK: { label: 'Fill in the Blank', icon: Box, short: 'Fill' },
  NUMERIC: { label: 'Numeric', icon: Calculator, short: 'Numeric' },
  CODING: { label: 'Coding', icon: Code, short: 'Coding' },
  ORDERING: { label: 'Ordering', icon: ArrowUpDown, short: 'Order' },
};

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

const STATUS_STYLES = {
  Draft: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  Scheduled: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  Published: 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  In_Progress: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  Completed: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  Cancelled: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
};

function formatTime(seconds) {
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getGradeFromPercentage(pct, gradingScale) {
  if (gradingScale && gradingScale.length > 0) {
    for (const g of gradingScale) {
      if (pct >= g.minPercentage && pct <= g.maxPercentage) return g.grade;
    }
  }
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C+';
  if (pct >= 40) return 'C';
  if (pct >= 30) return 'D';
  return 'F';
}

const SkeletonLoader = () => (
  <div className="space-y-6 p-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 animate-pulse">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="flex-1 space-y-3">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-2/3" />
            <div className="flex gap-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-20" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-16" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-24" />
            </div>
          </div>
          <div className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

const ExamCard = ({ exam, onStart, attemptHistory }) => {
  const examType = exam.examType || 'ONLINE';
  const canStart = (exam.status === 'Scheduled' || exam.status === 'Published') && examType === 'ONLINE';
  const lastAttempt = attemptHistory?.find((a) => a.exam?._id === exam._id || a.exam === exam._id);
  const hasPassed = lastAttempt?.passed;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 md:gap-4 min-w-0">
            <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
              <BookOpen size={22} className="text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base md:text-lg truncate group-hover:text-primary transition-colors">
                {exam.name}
              </h3>
              {exam.subject && (
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                  {typeof exam.subject === 'object' ? exam.subject.name : exam.subject}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                <span className="flex items-center gap-1">
                  <Clock size={13} /> {formatDate(exam.date)}
                </span>
                <span className="flex items-center gap-1">
                  <Timer size={13} /> {exam.duration || 60} min
                </span>
                <span className="flex items-center gap-1">
                  <Target size={13} /> {exam.maxMarks || 100} marks
                </span>
                <span className="flex items-center gap-1">
                  <Award size={13} /> Pass: {exam.passingScore || exam.passingPercentage || 50}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${STATUS_STYLES[exam.status] || STATUS_STYLES.Draft}`}>
              {exam.status}
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
              examType === 'ONLINE' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {examType}
            </span>
          </div>
        </div>

        {exam.instructions && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 line-clamp-2">
            {exam.instructions}
          </p>
        )}

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {exam.negativeMarking?.enabled && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-500">
                Negative Marking
              </span>
            )}
            {exam.shuffleQuestions && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-500">
                Shuffled
              </span>
            )}
            {lastAttempt && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                hasPassed ? 'bg-green-50 dark:bg-green-900/30 text-green-500' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-500'
              }`}>
                {hasPassed ? 'Passed' : `Attempted: ${lastAttempt.score || 0}/${exam.maxMarks || 100}`}
              </span>
            )}
          </div>
          {canStart && (
            <button
              onClick={() => onStart(exam)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <ArrowRight size={16} />
              Start Exam
            </button>
          )}
          {!canStart && exam.status === 'Completed' && (
            <span className="text-xs font-bold text-gray-400 px-3 py-2">Exam Ended</span>
          )}
          {!canStart && examType !== 'ONLINE' && (
            <span className="text-xs font-bold text-gray-400 px-3 py-2">Offline Exam</span>
          )}
        </div>
      </div>
    </div>
  );
};

const InstructionsModal = ({ exam, questions, onConfirm, onCancel }) => {
  const totalQuestions = questions?.length || exam.questions?.length || 0;
  const totalPoints = questions?.reduce((sum, q) => sum + (q.points || 1), 0) || exam.maxMarks || 100;
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-700">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Info size={22} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Exam Instructions</h2>
            </div>
            <button onClick={onCancel} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-5">
            <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/10">
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">{exam.name}</h3>
              {exam.subject && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Subject: {typeof exam.subject === 'object' ? exam.subject.name : exam.subject}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                <Timer size={20} className="mx-auto text-primary mb-1" />
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{exam.duration || 60} min</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Duration</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                <Hash size={20} className="mx-auto text-primary mb-1" />
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{totalQuestions}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Questions</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                <Target size={20} className="mx-auto text-primary mb-1" />
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{exam.maxMarks || totalPoints}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Max Marks</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-center">
                <Award size={20} className="mx-auto text-primary mb-1" />
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{exam.passingScore || exam.passingPercentage || 50}%</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pass Score</div>
              </div>
            </div>

            {exam.instructions && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <h4 className="font-bold text-gray-700 dark:text-gray-300 text-sm mb-2">Instructions</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">{exam.instructions}</p>
              </div>
            )}

            {exam.negativeMarking?.enabled && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800/30">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-red-500" />
                  <h4 className="font-bold text-red-700 dark:text-red-400 text-sm">Negative Marking</h4>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Each incorrect answer will deduct {exam.negativeMarking.penaltyPerWrong || 0} marks.
                  {exam.negativeMarking.maxNegativePercentage && (
                    <> Maximum negative marks: {exam.negativeMarking.maxNegativePercentage}% of total.</>
                  )}
                </p>
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800/30">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-amber-500" />
                <h4 className="font-bold text-amber-700 dark:text-amber-400 text-sm">Anti-Cheat Rules</h4>
              </div>
              <ul className="space-y-1.5 text-sm text-amber-700 dark:text-amber-400">
                {exam.antiCheatConfig?.tabSwitchLimit != null && (
                  <li className="flex items-center gap-2">
                    <Monitor size={13} /> Tab switching limited to {exam.antiCheatConfig.tabSwitchLimit} times
                  </li>
                )}
                {exam.antiCheatConfig?.fullScreenRequired && (
                  <li className="flex items-center gap-2">
                    <Maximize size={13} /> Fullscreen mode required
                  </li>
                )}
                {exam.antiCheatConfig?.copyPasteDisabled && (
                  <li className="flex items-center gap-2">
                    <Copy size={13} /> Copy/paste disabled
                  </li>
                )}
                {exam.antiCheatConfig?.rightClickDisabled && (
                  <li className="flex items-center gap-2">
                    <MousePointerClick size={13} /> Right-click disabled
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Eye size={13} /> Tab switches and fullscreen exits are recorded
                </li>
              </ul>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-blue-300 text-primary focus:ring-primary"
              />
              <label htmlFor="agree-terms" className="text-sm text-blue-700 dark:text-blue-400 font-medium cursor-pointer">
                I have read and understood the instructions. I agree to follow all exam rules and anti-cheat policies.
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!agreed}
              className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-95"
            >
              I Understand, Start Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuestionRenderer = ({ question, answer, onChange, questionIndex, showResult, exam }) => {
  const qType = question.questionType;
  const points = question.points || 1;
  const isCorrect = answer?.isCorrect;
  const showCorrect = showResult && exam?.showCorrectAnswers;

  const renderInput = () => {
    switch (qType) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-2.5">
            {(question.options || []).map((opt, idx) => {
              const selected = answer?.selectedOption === idx || answer?.selectedOption === opt._id;
              const isCorrectOpt = showCorrect && opt.isCorrect;
              let optClass = 'border-gray-200 dark:border-gray-600 hover:border-primary/50 hover:bg-primary/5';
              if (selected) optClass = 'border-primary bg-primary/10 ring-2 ring-primary/20';
              if (showResult && selected && !opt.isCorrect) optClass = 'border-red-400 bg-red-50 dark:bg-red-900/20';
              if (isCorrectOpt) optClass = 'border-green-400 bg-green-50 dark:bg-green-900/20';

              return (
                <label
                  key={idx}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${optClass} ${showResult ? 'pointer-events-none' : ''}`}
                >
                  <input
                    type="radio"
                    name={`q-${question._id}`}
                    checked={selected}
                    onChange={() => !showResult && onChange({ selectedOption: idx })}
                    disabled={!!showResult}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{opt.optionText}</span>
                  {showResult && opt.isCorrect && <CheckCircle2 size={16} className="ml-auto text-green-500 shrink-0" />}
                  {showResult && selected && !opt.isCorrect && <XCircle size={16} className="ml-auto text-red-500 shrink-0" />}
                </label>
              );
            })}
          </div>
        );

      case 'TRUE_FALSE':
        return (
          <div className="flex gap-3">
            {[true, false].map((val) => {
              const selected = answer?.selectedAnswer === val;
              const showCorrectTf = showCorrect && question.correctAnswer === val;
              let tfClass = 'border-gray-200 dark:border-gray-600 hover:border-primary/50 hover:bg-primary/5';
              if (selected) tfClass = 'border-primary bg-primary/10 ring-2 ring-primary/20';
              if (showResult && selected && question.correctAnswer !== val) tfClass = 'border-red-400 bg-red-50 dark:bg-red-900/20';
              if (showCorrectTf) tfClass = 'border-green-400 bg-green-50 dark:bg-green-900/20';

              return (
                <label
                  key={String(val)}
                  className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${tfClass} ${showResult ? 'pointer-events-none' : ''}`}
                >
                  <input
                    type="radio"
                    name={`q-${question._id}`}
                    checked={selected}
                    onChange={() => !showResult && onChange({ selectedAnswer: val })}
                    disabled={!!showResult}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                  />
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{val ? 'True' : 'False'}</span>
                  {showResult && question.correctAnswer === val && <CheckCircle2 size={16} className="text-green-500" />}
                </label>
              );
            })}
          </div>
        );

      case 'SHORT_ANSWER':
        return (
          <div>
            <input
              type="text"
              value={answer?.textAnswer || ''}
              onChange={(e) => !showResult && onChange({ textAnswer: e.target.value })}
              disabled={!!showResult}
              placeholder="Type your answer..."
              className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-gray-700 dark:text-gray-300 font-medium transition-all ${showResult ? 'pointer-events-none opacity-70' : ''}`}
            />
            {showCorrect && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                Correct answer: {question.correctAnswerText}
              </p>
            )}
          </div>
        );

      case 'ESSAY':
        return (
          <div>
            <textarea
              value={answer?.textAnswer || ''}
              onChange={(e) => !showResult && onChange({ textAnswer: e.target.value })}
              disabled={!!showResult}
              placeholder="Write your essay answer here..."
              rows={8}
              className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-gray-700 dark:text-gray-300 font-medium transition-all resize-y min-h-[150px] ${showResult ? 'pointer-events-none opacity-70' : ''}`}
            />
            <p className="mt-1 text-xs text-gray-400 text-right">{(answer?.textAnswer || '').length} characters</p>
            {showCorrect && question.correctAnswerText && (
              <div className="mt-3 bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-100 dark:border-green-800/30">
                <p className="text-sm font-bold text-green-700 dark:text-green-400 mb-1">Model Answer:</p>
                <p className="text-sm text-green-600 dark:text-green-400">{question.correctAnswerText}</p>
              </div>
            )}
          </div>
        );

      case 'FILL_BLANK':
        return (
          <div className="space-y-3">
            {(question.blanks || [{ blankIndex: 0, correctAnswer: '' }]).map((blank, idx) => (
              <div key={idx}>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 block">
                  Blank {idx + 1}
                </label>
                <input
                  type="text"
                  value={(answer?.blankAnswers || [])[idx] || ''}
                  onChange={(e) => {
                    if (showResult) return;
                    const newBlanks = [...(answer?.blankAnswers || (question.blanks || []).map(() => ''))];
                    newBlanks[idx] = e.target.value;
                    onChange({ blankAnswers: newBlanks });
                  }}
                  disabled={!!showResult}
                  placeholder={`Enter answer for blank ${idx + 1}...`}
                  className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-gray-700 dark:text-gray-300 font-medium transition-all ${showResult ? 'pointer-events-none opacity-70' : ''}`}
                />
                {showCorrect && blank.correctAnswer && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                    Correct: {blank.correctAnswer}
                  </p>
                )}
              </div>
            ))}
          </div>
        );

      case 'NUMERIC':
        return (
          <div>
            <input
              type="number"
              value={answer?.numericAnswer ?? ''}
              onChange={(e) => !showResult && onChange({ numericAnswer: e.target.value === '' ? '' : Number(e.target.value) })}
              disabled={!!showResult}
              placeholder="Enter numeric answer..."
              step="any"
              className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-gray-700 dark:text-gray-300 font-medium transition-all ${showResult ? 'pointer-events-none opacity-70' : ''}`}
            />
            {showCorrect && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                Correct answer: {question.numericCorrectValue}
                {question.numericUnit && ` ${question.numericUnit}`}
                {question.numericTolerance && ` (±${question.numericTolerance})`}
              </p>
            )}
          </div>
        );

      case 'MATCHING':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Left Items</p>
                {(question.matchingPairs || []).map((pair, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-400 w-6">{idx + 1}.</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium flex-1 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {pair.leftItem}
                    </span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Right Items (select matches)</p>
                {(question.matchingPairs || []).map((pair, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-gray-400 w-6">{idx + 1}.</span>
                    <select
                      value={(answer?.matchAnswers || [])[idx] ?? ''}
                      onChange={(e) => {
                        if (showResult) return;
                        const newMatches = [...(answer?.matchAnswers || (question.matchingPairs || []).map(() => ''))];
                        newMatches[idx] = e.target.value;
                        onChange({ matchAnswers: newMatches });
                      }}
                      disabled={!!showResult}
                      className={`flex-1 px-3 py-2 rounded-lg border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary outline-none text-sm font-medium ${showResult ? 'pointer-events-none opacity-70' : ''}`}
                    >
                      <option value="">Select...</option>
                      {(question.matchingPairs || []).map((p, j) => (
                        <option key={j} value={p.rightItem}>{p.rightItem}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'ORDERING':
        return (
          <div className="space-y-2">
            {(answer?.orderingItems || question.orderingItems || []).map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium flex-1">{typeof item === 'string' ? item : item.text}</span>
              </div>
            ))}
          </div>
        );

      case 'CODING':
        return (
          <div>
            <textarea
              value={answer?.textAnswer || ''}
              onChange={(e) => !showResult && onChange({ textAnswer: e.target.value })}
              disabled={!!showResult}
              placeholder={`Write your ${question.codingLanguage || 'code'} solution here...`}
              rows={12}
              className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-900 border-gray-700 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm text-green-400 font-mono transition-all resize-y min-h-[200px] ${showResult ? 'pointer-events-none opacity-70' : ''}`}
            />
            {showCorrect && question.correctAnswerText && (
              <div className="mt-3 bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-100 dark:border-green-800/30">
                <p className="text-sm font-bold text-green-700 dark:text-green-400 mb-1">Model Solution:</p>
                <pre className="text-sm text-green-600 dark:text-green-400 whitespace-pre-wrap font-mono">{question.correctAnswerText}</pre>
              </div>
            )}
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={answer?.textAnswer || ''}
            onChange={(e) => !showResult && onChange({ textAnswer: e.target.value })}
            disabled={!!showResult}
            placeholder="Type your answer..."
            className={`w-full px-4 py-3 rounded-xl border-2 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-sm ${showResult ? 'pointer-events-none opacity-70' : ''}`}
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Question {questionIndex + 1}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_BADGE_COLORS[qType] || 'bg-gray-100 text-gray-500'}`}>
            {QUESTION_TYPES[qType]?.short || qType}
          </span>
        </div>
        <span className="text-xs font-bold text-primary shrink-0">{points} pt{points !== 1 ? 's' : ''}</span>
      </div>

      <p className="text-gray-800 dark:text-gray-200 font-medium leading-relaxed text-sm md:text-base">
        {question.questionText}
      </p>

      {question.questionImageUrl && (
        <img src={question.questionImageUrl} alt="Question" className="rounded-xl max-h-60 object-contain border border-gray-100 dark:border-gray-700" />
      )}

      {renderInput()}

      {showResult && question.explanation && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800/30 mt-3">
          <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">Explanation:</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};

const ExamResultView = ({ result, exam, questions, onBack }) => {
  if (!result) return null;

  const score = result.score || 0;
  const maxMarks = result.maxMarks || exam?.maxMarks || questions?.reduce((s, q) => s + (q.points || 1), 0) || 100;
  const percentage = result.percentage || Math.round((score / maxMarks) * 100) || 0;
  const passed = result.passed || percentage >= (exam?.passingScore || exam?.passingPercentage || 50);
  const timeTaken = result.timeTaken || 0;
  const responses = result.responses || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className={`p-8 text-center ${passed
          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
          : 'bg-gradient-to-br from-red-500 to-rose-600'
        }`}>
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            {passed ? <Trophy size={40} className="text-white" /> : <AlertTriangle size={40} className="text-white" />}
          </div>
          <h2 className="text-3xl font-black text-white mb-2">{passed ? 'Congratulations!' : 'Keep Trying!'}</h2>
          <p className="text-white/80 text-sm font-medium">{passed ? 'You passed the exam' : 'You did not meet the passing score'}</p>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="text-2xl font-black text-gray-900 dark:text-gray-100">{score}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Score</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="text-2xl font-black text-primary">{percentage}%</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Percentage</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className={`text-2xl font-black ${passed ? 'text-green-500' : 'text-red-500'}`}>
              {getGradeFromPercentage(percentage, exam?.gradingScale)}
            </div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Grade</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="text-2xl font-black text-gray-900 dark:text-gray-100">{formatTime(timeTaken)}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Time Taken</div>
          </div>
        </div>

        {result.tabSwitchCount > 0 && (
          <div className="px-6 md:px-8 pb-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-100 dark:border-amber-800/30 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500 shrink-0" />
              <span className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                Tab switches: {result.tabSwitchCount} | Fullscreen exits: {result.fullscreenExits || 0}
              </span>
            </div>
          </div>
        )}

        <div className="px-6 md:px-8 pb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${passed ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
            <span>0%</span>
            <span className={`font-bold ${passed ? 'text-green-500' : 'text-red-500'}`}>
              Pass: {exam?.passingScore || exam?.passingPercentage || 50}%
            </span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {exam?.showCorrectAnswers && questions?.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Eye size={20} className="text-primary" /> Question Review
          </h3>
          {questions.map((q, idx) => {
            const resp = responses.find((r) => r.questionId === q._id || r.questionId === q.questionId);
            return (
              <div key={q._id || idx} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                <QuestionRenderer
                  question={q}
                  answer={resp || {}}
                  onChange={() => {}}
                  questionIndex={idx}
                  showResult={true}
                  exam={exam}
                />
                {resp?.isCorrect !== undefined && (
                  <div className={`mt-3 flex items-center gap-2 text-sm font-bold ${resp.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                    {resp.isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {resp.isCorrect ? 'Correct' : 'Incorrect'}
                    {resp.marksAwarded != null && ` — ${resp.marksAwarded} / ${q.points || 1} pts`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          Back to Exams
        </button>
      </div>
    </div>
  );
};

export default function StudentExamPage() {
  const { userInfo } = useSelector((state) => state.auth);
  const studentId = userInfo?._id || userInfo?.id;

  const [view, setView] = useState('list');
  const [selectedExam, setSelectedExam] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [examResultId, setExamResultId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [bookmarks, setBookmarks] = useState(new Set());
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examStartTime, setExamStartTime] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [violations, setViolations] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);
  const violationShownRef = useRef(false);

  const { data: examsData, isLoading: examsLoading } = useGetOnlineExamsQuery();
  const [startExam, { isLoading: isStarting }] = useStartOnlineExamMutation();
  const [submitExamMutation, { isLoading: isSubmittingApi }] = useSubmitOnlineExamMutation();

  const { data: examResultsData } = useGetExamResultsQuery(
    { studentId },
    { skip: !studentId }
  );

  const exams = useMemo(() => {
    const list = examsData?.exams || [];
    return list.filter(
      (e) =>
        (e.status === 'Scheduled' || e.status === 'Published') &&
        (e.examType === 'ONLINE' || !e.examType)
    );
  }, [examsData]);

  const attemptHistory = useMemo(() => {
    return examResultsData?.examResults || [];
  }, [examResultsData]);

  const answeredCount = useMemo(() => {
    return Object.values(answers).filter((a) => {
      if (a == null) return false;
      if (a.selectedOption !== undefined) return true;
      if (a.selectedAnswer !== undefined) return true;
      if (a.textAnswer && a.textAnswer.trim()) return true;
      if (a.numericAnswer !== undefined && a.numericAnswer !== '') return true;
      if (a.blankAnswers && a.blankAnswers.some((b) => b && b.trim())) return true;
      if (a.matchAnswers && a.matchAnswers.some((m) => m && m.trim())) return true;
      return false;
    }).length;
  }, [answers]);

  const bookmarkedCount = bookmarks.size;

  const totalQuestions = questions.length;

  const currentQ = questions[currentQuestion];

  const saveToLocalStorage = useCallback(() => {
    if (!selectedExam?._id || view !== 'exam') return;
    const data = {
      examId: selectedExam._id,
      examResultId,
      answers,
      bookmarks: Array.from(bookmarks),
      currentQuestion,
      timeRemaining,
      examStartTime,
      tabSwitchCount,
      fullscreenExits,
      violations,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(`exam_${selectedExam._id}_${studentId}`, JSON.stringify(data));
      setLastSaved(new Date());
    } catch (e) {
      // localStorage full or unavailable
    }
  }, [selectedExam, examResultId, answers, bookmarks, currentQuestion, timeRemaining, examStartTime, tabSwitchCount, fullscreenExits, violations, view, studentId]);

  const restoreFromLocalStorage = useCallback((examId) => {
    try {
      const raw = localStorage.getItem(`exam_${examId}_${studentId}`);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [studentId]);

  const clearLocalStorage = useCallback((examId) => {
    try {
      localStorage.removeItem(`exam_${examId}_${studentId}`);
    } catch {
      // ignore
    }
  }, [studentId]);

  useEffect(() => {
    if (view === 'exam' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [view, examStartTime]);

  useEffect(() => {
    if (timeRemaining === 0 && view === 'exam' && examStartTime) {
      toast.error('Time is up! Auto-submitting exam...');
      handleSubmitExam(true);
    }
  }, [timeRemaining, view, examStartTime]);

  useEffect(() => {
    if (view === 'exam') {
      autoSaveRef.current = setInterval(() => {
        saveToLocalStorage();
      }, 10000);
    }
    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [view, saveToLocalStorage]);

  useEffect(() => {
    if (view !== 'exam') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          const limit = selectedExam?.antiCheatConfig?.tabSwitchLimit ?? 3;
          if (next <= limit && !violationShownRef.current) {
            toast.error(`Tab switch detected! (${next}/${limit} allowed)`, { duration: 5000 });
            violationShownRef.current = true;
            setTimeout(() => { violationShownRef.current = false; }, 3000);
          } else if (next > limit) {
            toast.error(`Tab switch limit exceeded! Your attempt is being flagged.`, { duration: 8000 });
          }
          setViolations((v) => [...v, { type: 'tab_switch', timestamp: new Date().toISOString() }]);
          return next;
        });
      }
    };

    const handleFullscreenChange = () => {
      const fs = !!document.fullscreenElement;
      if (isFullscreen && !fs) {
        setFullscreenExits((prev) => prev + 1);
        setViolations((v) => [...v, { type: 'fullscreen_exit', timestamp: new Date().toISOString() }]);
        toast.error('Fullscreen exited! This is being recorded.', { duration: 5000 });
      }
      setIsFullscreen(fs);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    if (selectedExam?.antiCheatConfig?.fullScreenRequired && !document.fullscreenElement) {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      }
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [view, isFullscreen, selectedExam]);

  useEffect(() => {
    if (view !== 'exam') return;
    const handleContextMenu = (e) => {
      if (selectedExam?.antiCheatConfig?.rightClickDisabled) {
        e.preventDefault();
        toast.error('Right-click is disabled during the exam');
      }
    };
    const handleKeyDown = (e) => {
      if (selectedExam?.antiCheatConfig?.copyPasteDisabled) {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
          e.preventDefault();
          toast.error('Copy/paste is disabled during the exam');
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [view, selectedExam]);

  useEffect(() => {
    if (view !== 'exam' || !selectedExam?._id) return;
    saveToLocalStorage();
  }, [answers, bookmarks, currentQuestion, timeRemaining]);

  const handleStartExam = async (exam) => {
    setSelectedExam(exam);
    const restored = restoreFromLocalStorage(exam._id);
    if (restored && restored.examResultId) {
      const timeLeft = restored.timeRemaining || 0;
      if (timeLeft > 0) {
        toast('Resuming your saved exam session...', { icon: '🔄' });
        setExamResultId(restored.examResultId);
        setAnswers(restored.answers || {});
        setBookmarks(new Set(restored.bookmarks || []));
        setCurrentQuestion(restored.currentQuestion || 0);
        setTimeRemaining(timeLeft);
        setExamStartTime(restored.examStartTime || Date.now());
        setTabSwitchCount(restored.tabSwitchCount || 0);
        setFullscreenExits(restored.fullscreenExits || 0);
        setViolations(restored.violations || []);

        const examQuestions = exam.questions || [];
        setQuestions(examQuestions);
        setView('exam');
        return;
      }
    }
    setShowInstructions(true);
  };

  const handleConfirmStart = async () => {
    setShowInstructions(false);
    try {
      const result = await startExam({
        examId: selectedExam._id,
        studentId,
      }).unwrap();

      setExamResultId(result.examResultId || result._id || result.data?._id);
      const examQuestions = result.questions || result.data?.questions || selectedExam.questions || [];
      setQuestions(examQuestions);
      setAnswers({});
      setBookmarks(new Set());
      setCurrentQuestion(0);

      const durationSec = (selectedExam.duration || 60) * 60;
      setTimeRemaining(durationSec);
      setExamStartTime(Date.now());
      setTabSwitchCount(0);
      setFullscreenExits(0);
      setViolations([]);

      setView('exam');
      toast.success('Exam started! Good luck!');

      if (selectedExam?.antiCheatConfig?.fullScreenRequired) {
        const el = document.documentElement;
        if (el.requestFullscreen && !document.fullscreenElement) {
          el.requestFullscreen().catch(() => {});
        }
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.data?.userMessage || 'Failed to start exam');
    }
  };

  const handleAnswerChange = (answerData) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: {
        ...prev[currentQuestion],
        ...answerData,
        questionId: questions[currentQuestion]?._id,
      },
    }));
  };

  const toggleBookmark = () => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(currentQuestion)) {
        next.delete(currentQuestion);
      } else {
        next.add(currentQuestion);
      }
      return next;
    });
  };

  const handleSubmitExam = async (isAutoSubmit = false) => {
    if (isSubmitting) return;
    if (!isAutoSubmit) {
      const unanswered = totalQuestions - answeredCount;
      if (unanswered > 0) {
        setShowSubmitConfirm(true);
        return;
      }
    }

    setShowSubmitConfirm(false);
    setIsSubmitting(true);

    if (timerRef.current) clearInterval(timerRef.current);
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);

    const timeTaken = examStartTime ? Math.floor((Date.now() - examStartTime) / 1000) : 0;

    const responses = questions.map((q, idx) => {
      const ans = answers[idx] || {};
      return {
        questionId: q._id || q.questionId,
        questionType: q.questionType,
        ...ans,
      };
    });

    try {
      const result = await submitExamMutation({
        examResultId,
        responses,
      }).unwrap();

      const finalResult = {
        ...result,
        ...(result.data || {}),
        score: result.score || result.data?.score || 0,
        maxMarks: result.maxMarks || result.data?.maxMarks || selectedExam?.maxMarks || totalQuestions,
        percentage: result.percentage || result.data?.percentage || 0,
        passed: result.passed || result.data?.passed,
        timeTaken,
        tabSwitchCount,
        fullscreenExits,
        responses,
      };
      finalResult.percentage = finalResult.percentage || Math.round((finalResult.score / finalResult.maxMarks) * 100);

      setResultData(finalResult);
      clearLocalStorage(selectedExam._id);
      setView('result');

      if (selectedExam.showResultsImmediately) {
        toast.success('Exam submitted successfully!');
      } else {
        toast.success('Exam submitted! Results will be available soon.');
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.data?.userMessage || 'Failed to submit exam');
      setIsSubmitting(false);
      if (timerRef.current) {
        timerRef.current = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedExam(null);
    setShowInstructions(false);
    setExamResultId(null);
    setQuestions([]);
    setAnswers({});
    setBookmarks(new Set());
    setCurrentQuestion(0);
    setTimeRemaining(0);
    setExamStartTime(null);
    setResultData(null);
    setIsSubmitting(false);
    setShowSubmitConfirm(false);
    setTabSwitchCount(0);
    setFullscreenExits(0);
    setViolations([]);
    setLastSaved(null);
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const goToQuestion = (idx) => {
    if (idx >= 0 && idx < totalQuestions) {
      setCurrentQuestion(idx);
      setMobileSidebarOpen(false);
    }
  };

  const getQuestionStatus = (idx) => {
    if (idx === currentQuestion) return 'current';
    const ans = answers[idx];
    if (ans) {
      const hasAnswer =
        ans.selectedOption !== undefined ||
        ans.selectedAnswer !== undefined ||
        (ans.textAnswer && ans.textAnswer.trim()) ||
        (ans.numericAnswer !== undefined && ans.numericAnswer !== '') ||
        (ans.blankAnswers && ans.blankAnswers.some((b) => b && b.trim())) ||
        (ans.matchAnswers && ans.matchAnswers.some((m) => m && m.trim()));
      if (hasAnswer) return 'answered';
    }
    if (bookmarks.has(idx)) return 'bookmarked';
    return 'unanswered';
  };

  const statusColors = {
    current: 'bg-primary text-white ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800',
    answered: 'bg-green-500 text-white',
    unanswered: 'bg-red-500 text-white',
    bookmarked: 'bg-amber-400 text-white',
  };

  if (examsLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <SkeletonLoader />
      </div>
    );
  }

  if (view === 'list') {
    return (
      <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
        <div className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <BookOpen size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Online Exams</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                Available exams and your attempt history
              </p>
            </div>
          </div>
        </div>

        {attemptHistory.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-3 flex items-center gap-2">
              <Clock size={16} className="text-primary" /> Recent Attempts
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {attemptHistory.slice(0, 5).map((a, idx) => (
                <div key={idx} className="flex-shrink-0 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 min-w-[180px] border border-gray-100 dark:border-gray-600">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                    {a.exam?.name || 'Exam'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-bold ${a.passed ? 'text-green-500' : 'text-red-500'}`}>
                      {a.score || 0}/{a.maxMarks || 100}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      a.passed ? 'bg-green-50 dark:bg-green-900/30 text-green-500' : 'bg-red-50 dark:bg-red-900/30 text-red-500'
                    }`}>
                      {a.passed ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">{formatDateTime(a.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {exams.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 md:p-16 text-center">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-bold text-gray-500 dark:text-gray-400">No Exams Available</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Check back later for scheduled exams.</p>
            </div>
          ) : (
            exams.map((exam) => (
              <ExamCard
                key={exam._id}
                exam={exam}
                onStart={handleStartExam}
                attemptHistory={attemptHistory}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  if (view === 'exam' && questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12">
          <AlertTriangle size={48} className="mx-auto mb-4 text-amber-400" />
          <p className="text-lg font-bold text-gray-700 dark:text-gray-300">No Questions Found</p>
          <p className="text-sm text-gray-400 mt-1">This exam has no questions assigned.</p>
          <button onClick={handleBackToList} className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all">
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  if (view === 'result') {
    return (
      <div className="p-4 md:p-6">
        <ExamResultView
          result={resultData}
          exam={selectedExam}
          questions={questions}
          onBack={handleBackToList}
        />
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-gray-50 dark:bg-gray-900 flex flex-col h-screen">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm px-3 md:px-6 py-2.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
            >
              {mobileSidebarOpen ? <X size={18} /> : <ChevronDown size={18} />}
            </button>
            <div className="min-w-0">
              <h1 className="text-sm md:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                {selectedExam?.name || 'Exam'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono font-bold text-sm ${
              timeRemaining < 300
                ? 'bg-red-50 dark:bg-red-900/30 text-red-500 animate-pulse'
                : timeRemaining < 900
                  ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-500'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}>
              <Timer size={16} />
              <span className="hidden sm:inline">{formatTime(timeRemaining)}</span>
              <span className="sm:hidden">{formatTime(timeRemaining).substring(3)}</span>
            </div>

            <button
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen().catch(() => {});
                } else {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors hidden md:flex"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>

            {lastSaved && (
              <span className="text-[10px] text-gray-400 hidden lg:block">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}

            <button
              onClick={() => handleSubmitExam(false)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs md:text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span className="hidden sm:inline">Submit Exam</span>
              <span className="sm:hidden">Submit</span>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Side: Question Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {currentQ && (
              <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 md:p-7 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${TYPE_BADGE_COLORS[currentQ.questionType] || 'bg-gray-100 text-gray-500'}`}>
                        {QUESTION_TYPES[currentQ.questionType]?.label || currentQ.questionType}
                      </span>
                      <span className="text-xs font-bold text-gray-400">
                        Q {currentQuestion + 1} of {totalQuestions}
                      </span>
                    </div>
                    <button
                      onClick={toggleBookmark}
                      className={`p-2 rounded-xl transition-all ${
                        bookmarks.has(currentQuestion)
                          ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-500'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'
                      }`}
                      title={bookmarks.has(currentQuestion) ? 'Remove bookmark' : 'Bookmark this question'}
                    >
                      {bookmarks.has(currentQuestion) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                    </button>
                  </div>

                  <QuestionRenderer
                    question={currentQ}
                    answer={answers[currentQuestion]}
                    onChange={handleAnswerChange}
                    questionIndex={currentQuestion}
                    showResult={false}
                    exam={selectedExam}
                  />

                  <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => goToQuestion(currentQuestion - 1)}
                      disabled={currentQuestion === 0}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                    <button
                      onClick={() => goToQuestion(currentQuestion + 1)}
                      disabled={currentQuestion === totalQuestions - 1}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Desktop */}
          <div className={`hidden md:flex flex-col w-72 lg:w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto shrink-0 ${
            sidebarOpen ? '' : 'hidden'
          }`}>
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-mono font-bold text-lg ${
                timeRemaining < 300
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-500'
                  : timeRemaining < 900
                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-500'
                    : 'bg-primary/10 text-primary'
              }`}>
                <Timer size={20} />
                {formatTime(timeRemaining)}
              </div>
            </div>

            <div className="p-4 border-b border-gray-100 dark:border-gray-700 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-400 uppercase tracking-wider">Progress</span>
                <span className="font-bold text-primary">{answeredCount}/{totalQuestions}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalQuestions ? (answeredCount / totalQuestions) * 100 : 0}%` }}
                />
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Answered ({answeredCount})</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Remaining ({totalQuestions - answeredCount})</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Marked ({bookmarkedCount})</span>
              </div>
            </div>

            <div className="p-4 flex-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Question Palette</p>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToQuestion(idx)}
                    className={`w-full aspect-square rounded-xl text-xs font-bold transition-all ${statusColors[getQuestionStatus(idx)]}`}
                    title={`Question ${idx + 1}${bookmarks.has(idx) ? ' (Bookmarked)' : ''}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => handleSubmitExam(false)}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Submit Exam
              </button>
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          {mobileSidebarOpen && (
            <div className="md:hidden fixed inset-0 z-50 flex">
              <div className="w-72 bg-white dark:bg-gray-800 h-full overflow-y-auto shadow-2xl border-r border-gray-200 dark:border-gray-700">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm">Navigation</h3>
                  <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400">
                    <X size={18} />
                  </button>
                </div>

                <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-mono font-bold text-lg ${
                    timeRemaining < 300
                      ? 'bg-red-50 dark:bg-red-900/30 text-red-500'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    <Timer size={20} />
                    {formatTime(timeRemaining)}
                  </div>
                </div>

                <div className="p-4 border-b border-gray-100 dark:border-gray-700 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-400 uppercase tracking-wider">Progress</span>
                    <span className="font-bold text-primary">{answeredCount}/{totalQuestions}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${totalQuestions ? (answeredCount / totalQuestions) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Answered ({answeredCount})</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Remaining ({totalQuestions - answeredCount})</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Marked ({bookmarkedCount})</span>
                  </div>
                </div>

                <div className="p-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Question Palette</p>
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToQuestion(idx)}
                        className={`w-full aspect-square rounded-xl text-xs font-bold transition-all ${statusColors[getQuestionStatus(idx)]}`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4">
                  <button
                    onClick={() => { setMobileSidebarOpen(false); handleSubmitExam(false); }}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    <Send size={16} /> Submit Exam
                  </button>
                </div>
              </div>
              <div
                className="flex-1 bg-black/40"
                onClick={() => setMobileSidebarOpen(false)}
              />
            </div>
          )}
        </div>
      </div>

      {showInstructions && (
        <InstructionsModal
          exam={selectedExam}
          questions={questions}
          onConfirm={handleConfirmStart}
          onCancel={() => {
            setShowInstructions(false);
            setSelectedExam(null);
          }}
        />
      )}

      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700 p-6 md:p-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Submit Exam?</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                You have answered <span className="font-bold text-primary">{answeredCount}</span> out of{' '}
                <span className="font-bold">{totalQuestions}</span> questions.
                {totalQuestions - answeredCount > 0 && (
                  <span className="block mt-1 text-amber-500 font-bold">
                    {totalQuestions - answeredCount} question{totalQuestions - answeredCount !== 1 ? 's' : ''} unanswered!
                  </span>
                )}
              </p>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Time Remaining:</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300 font-mono">{formatTime(timeRemaining)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Questions Answered:</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">{answeredCount}/{totalQuestions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Bookmarked:</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">{bookmarkedCount}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubmitConfirm(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Continue Exam
                </button>
                <button
                  onClick={() => handleSubmitExam(true)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Submit Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
