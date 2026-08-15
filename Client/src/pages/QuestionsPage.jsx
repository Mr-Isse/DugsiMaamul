import React, { useState, useMemo } from 'react'
import {
  HelpCircle,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Archive,
  RefreshCw,
  AlertCircle,
  X,
  CheckSquare,
  CircleDot,
  Type,
  AlignLeft,
  Columns,
  Calculator,
  Code,
  ArrowUpDown,
  Box,
  Upload,
  Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  useGetQuestionsQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useGetQuestionBanksQuery,
  useGetSubjectsQuery,
  useGetClassesQuery,
  useArchiveQuestionMutation,
  useRestoreQuestionMutation,
} from '@/services/api'

const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: CheckSquare },
  { value: 'TRUE_FALSE', label: 'True/False', icon: CircleDot },
  { value: 'SHORT_ANSWER', label: 'Short Answer', icon: Type },
  { value: 'ESSAY', label: 'Essay', icon: AlignLeft },
  { value: 'MATCHING', label: 'Matching', icon: Columns },
  { value: 'FILL_BLANK', label: 'Fill in the Blank', icon: Box },
  { value: 'NUMERIC', label: 'Numeric', icon: Calculator },
  { value: 'CODING', label: 'Coding', icon: Code },
  { value: 'ORDERING', label: 'Ordering', icon: ArrowUpDown },
]

const TYPE_COLORS = {
  MULTIPLE_CHOICE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  TRUE_FALSE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  SHORT_ANSWER: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  ESSAY: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  MATCHING: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  FILL_BLANK: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  NUMERIC: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  CODING: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  ORDERING: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
}

const DIFFICULTY_COLORS = {
  EASY: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  HARD: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const QuestionModal = ({ initial, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    questionText: initial?.questionText || '',
    questionType: initial?.questionType || 'MULTIPLE_CHOICE',
    questionBank: initial?.questionBank?._id || initial?.questionBank || '',
    subject: initial?.subject?._id || initial?.subject || '',
    class: initial?.class?._id || initial?.class || '',
    options: initial?.options || [{ optionText: '', isCorrect: false }],
    correctAnswer: initial?.correctAnswer || false,
    correctAnswerText: initial?.correctAnswerText || '',
    difficulty: initial?.difficulty || 'MEDIUM',
    points: initial?.points || 1,
    tags: initial?.tags ? initial.tags.join(', ') : '',
    topic: initial?.topic || '',
    explanation: initial?.explanation || '',
  })

  const { data: banksData } = useGetQuestionBanksQuery()
  const { data: subjectsData } = useGetSubjectsQuery()
  const { data: classesData } = useGetClassesQuery()

  const banks = Array.isArray(banksData) ? banksData : banksData?.questionBanks || []
  const subjects = Array.isArray(subjectsData) ? subjectsData : subjectsData?.data || []
  const classes = Array.isArray(classesData) ? classesData : classesData?.data || []

  const [createQuestion, { isLoading: creating }] = useCreateQuestionMutation()
  const [updateQuestion, { isLoading: updating }] = useUpdateQuestionMutation()

  const isEdit = Boolean(initial)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.questionText.trim()) return toast.error('Question text is required')
    try {
      const data = {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        points: Number(form.points),
      }
      if (isEdit) {
        await updateQuestion({ id: initial._id, ...data }).unwrap()
        toast.success('Question updated')
      } else {
        await createQuestion(data).unwrap()
        toast.success('Question created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save question')
    }
  }

  const addOption = () => {
    setForm({
      ...form,
      options: [...form.options, { optionText: '', isCorrect: false }],
    })
  }

  const updateOption = (index, field, value) => {
    const updated = [...form.options]
    updated[index] = { ...updated[index], [field]: value }
    setForm({ ...form, options: updated })
  }

  const removeOption = (index) => {
    setForm({
      ...form,
      options: form.options.filter((_, i) => i !== index),
    })
  }

  const setCorrectOption = (index) => {
    const updated = form.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }))
    setForm({ ...form, options: updated })
  }

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Question' : 'New Question'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update question details' : 'Create a new question'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="questionText">Question Text *</Label>
          <Textarea
            id="questionText"
            value={form.questionText}
            onChange={(e) => setForm({ ...form, questionText: e.target.value })}
            placeholder="Enter your question here..."
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="questionType">Question Type *</Label>
            <Select
              value={form.questionType}
              onValueChange={(value) => setForm({ ...form, questionType: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUESTION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              value={form.difficulty}
              onValueChange={(value) => setForm({ ...form, difficulty: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="questionBank">Question Bank</Label>
            <Select
              value={form.questionBank}
              onValueChange={(value) => setForm({ ...form, questionBank: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank._id} value={bank._id}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={form.subject}
              onValueChange={(value) => setForm({ ...form, subject: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s._id} value={s._id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select
              value={form.class}
              onValueChange={(value) => setForm({ ...form, class: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name} - {c.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              min="1"
              value={form.points}
              onChange={(e) => setForm({ ...form, points: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              placeholder="e.g. Algebra"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="e.g. math, algebra, equations"
          />
        </div>

        {/* Options for Multiple Choice */}
        {form.questionType === 'MULTIPLE_CHOICE' && (
          <div className="space-y-2">
            <Label>Options</Label>
            {form.options.map((option, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="radio"
                  name="correctOption"
                  checked={option.isCorrect}
                  onChange={() => setCorrectOption(index)}
                  className="w-4 h-4"
                />
                <Input
                  value={option.optionText}
                  onChange={(e) => updateOption(index, 'optionText', e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                />
                {form.options.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addOption} className="w-full">
              Add Option
            </Button>
          </div>
        )}

        {/* Correct Answer for True/False */}
        {form.questionType === 'TRUE_FALSE' && (
          <div className="space-y-2">
            <Label>Correct Answer</Label>
            <Select
              value={form.correctAnswer ? 'true' : 'false'}
              onValueChange={(value) => setForm({ ...form, correctAnswer: value === 'true' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Correct Answer Text for Short Answer, Essay, etc. */}
        {['SHORT_ANSWER', 'ESSAY', 'NUMERIC'].includes(form.questionType) && (
          <div className="space-y-2">
            <Label htmlFor="correctAnswerText">Correct Answer / Model Answer</Label>
            <Textarea
              id="correctAnswerText"
              value={form.correctAnswerText}
              onChange={(e) => setForm({ ...form, correctAnswerText: e.target.value })}
              placeholder="Enter the correct answer or model answer for reference"
              rows={2}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="explanation">Explanation (Optional)</Label>
          <Textarea
            id="explanation"
            value={form.explanation}
            onChange={(e) => setForm({ ...form, explanation: e.target.value })}
            placeholder="Explanation for the correct answer"
            rows={2}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Question'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const DeleteConfirmDialog = ({ question, onClose, onSuccess }) => {
  const [deleteQuestion, { isLoading }] = useDeleteQuestionMutation()

  const handleDelete = async () => {
    try {
      await deleteQuestion(question._id).unwrap()
      toast.success('Question deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete question')
    }
  }

  return (
    <DialogContent className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <DialogTitle>Delete Question</DialogTitle>
        <DialogDescription className="mt-2">
          Are you sure you want to delete this question? This action cannot be undone.
        </DialogDescription>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  )
}

const QuestionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [bankFilter, setBankFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)
  const [showArchived, setShowArchived] = useState(false)

  const { data: questionsData, isLoading, refetch } = useGetQuestionsQuery({
    questionType: typeFilter || undefined,
    difficulty: difficultyFilter || undefined,
    questionBank: bankFilter || undefined,
  })
  const { data: banksData } = useGetQuestionBanksQuery()

  const questions = Array.isArray(questionsData) ? questionsData : questionsData?.questions || []
  const banks = Array.isArray(banksData) ? banksData : banksData?.questionBanks || []

  const [archiveQuestion] = useArchiveQuestionMutation()
  const [restoreQuestion] = useRestoreQuestionMutation()

  const filteredQuestions = useMemo(() => {
    if (!questions) return []
    return questions.filter((question) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (question.questionText || '').toLowerCase().includes(q) ||
          (question.topic || '').toLowerCase().includes(q) ||
          (question.tags || []).some((t) => t.toLowerCase().includes(q))
        if (!match) return false
      }
      if (showArchived && !question.isArchived) return false
      if (!showArchived && question.isArchived) return false
      return true
    })
  }, [questions, searchTerm, showArchived])

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (question) => {
    setEditRecord(question)
    setIsModalOpen(true)
  }

  const handleDelete = (question) => {
    setDeleteRecord(question)
  }

  const handleArchive = async (question) => {
    try {
      await archiveQuestion(question._id).unwrap()
      toast.success('Question archived')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to archive')
    }
  }

  const handleRestore = async (question) => {
    try {
      await restoreQuestion(question._id).unwrap()
      toast.success('Question restored')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to restore')
    }
  }

  const stats = useMemo(() => {
    return {
      total: questions.length,
      byType: questions.reduce((acc, q) => {
        acc[q.questionType] = (acc[q.questionType] || 0) + 1
        return acc
      }, {}),
      byDifficulty: questions.reduce((acc, q) => {
        acc[q.difficulty] = (acc[q.difficulty] || 0) + 1
        return acc
      }, {}),
    }
  }, [questions])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Questions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage exam questions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowArchived(!showArchived)} variant="outline">
            {showArchived ? 'Show Active' : 'Show Archived'}
          </Button>
          <Button onClick={() => refetch()} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Questions</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Easy</p>
          <p className="text-2xl font-bold text-green-600">{stats.byDifficulty.EASY || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Medium</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.byDifficulty.MEDIUM || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Hard</p>
          <p className="text-2xl font-bold text-red-600">{stats.byDifficulty.HARD || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="">All Types</option>
          {QUESTION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <select
          value={bankFilter}
          onChange={(e) => setBankFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="">All Banks</option>
          {banks.map((bank) => (
            <option key={bank._id} value={bank._id}>
              {bank.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Points</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No questions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuestions.map((question) => (
                  <TableRow key={question._id}>
                    <TableCell className="max-w-md">
                      <div className="truncate">{question.questionText}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={TYPE_COLORS[question.questionType] || ''}>
                        {QUESTION_TYPES.find((t) => t.value === question.questionType)?.label ||
                          question.questionType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={DIFFICULTY_COLORS[question.difficulty] || ''}>
                        {question.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>{question.subject?.name || '-'}</TableCell>
                    <TableCell>{question.points}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(question)}
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {question.isArchived ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRestore(question)}
                            title="Restore"
                          >
                            <RefreshCw className="h-4 w-4 text-green-600" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleArchive(question)}
                            title="Archive"
                          >
                            <Archive className="h-4 w-4 text-yellow-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(question)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Modals */}
      {isModalOpen && (
        <QuestionModal
          initial={editRecord}
          onClose={() => {
            setIsModalOpen(false)
            setEditRecord(null)
          }}
          onSuccess={() => refetch()}
        />
      )}

      {deleteRecord && (
        <DeleteConfirmDialog
          question={deleteRecord}
          onClose={() => setDeleteRecord(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  )
}

export default QuestionsPage
