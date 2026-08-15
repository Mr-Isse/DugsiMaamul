import React, { useState, useMemo } from 'react'
import {
  Award,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  AlertCircle,
  X,
  CheckCircle2,
  TrendingUp,
  GraduationCap,
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
  useGetExamResultsQuery,
  useGradeExamMutation,
  useBulkGradeExamsMutation,
  usePublishExamResultsMutation,
  useGetOnlineExamsQuery,
  useGetStudentsQuery,
} from '@/services/api'

const GRADE_COLORS = {
  A: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  B: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  C: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  D: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  F: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  GRADED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PUBLISHED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

const GradeModal = ({ result, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    score: result?.score || '',
    grade: result?.grade || '',
    gradingNotes: result?.gradingNotes || '',
    feedback: result?.feedback || '',
  })

  const [gradeExam, { isLoading }] = useGradeExamMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.score || parseFloat(form.score) < 0) {
      return toast.error('Please enter a valid score')
    }
    try {
      await gradeExam({
        examResultId: result._id,
        score: parseFloat(form.score),
        grade: form.grade,
        gradingNotes: form.gradingNotes,
        feedback: form.feedback,
      }).unwrap()
      toast.success('Exam graded successfully')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to grade exam')
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Grade Exam</DialogTitle>
        <DialogDescription>
          Grade exam for {result?.student?.name || 'Student'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="score">Score *</Label>
          <Input
            id="score"
            type="number"
            min="0"
            value={form.score}
            onChange={(e) => setForm({ ...form, score: e.target.value })}
            placeholder="Enter score"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grade">Grade</Label>
          <Input
            id="grade"
            value={form.grade}
            onChange={(e) => setForm({ ...form, grade: e.target.value })}
            placeholder="e.g. A, B, C"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gradingNotes">Grading Notes</Label>
          <Textarea
            id="gradingNotes"
            value={form.gradingNotes}
            onChange={(e) => setForm({ ...form, gradingNotes: e.target.value })}
            placeholder="Internal grading notes"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="feedback">Student Feedback</Label>
          <Textarea
            id="feedback"
            value={form.feedback}
            onChange={(e) => setForm({ ...form, feedback: e.target.value })}
            placeholder="Feedback to share with student"
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Submit Grade'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const ExamResultsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [examFilter, setExamFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)
  const [selectedResults, setSelectedResults] = useState(new Set())

  const { data: resultsData, isLoading, refetch } = useGetExamResultsQuery({
    examId: examFilter || undefined,
    status: statusFilter || undefined,
  })
  const { data: examsData } = useGetOnlineExamsQuery()
  const { data: studentsData } = useGetStudentsQuery()

  const results = Array.isArray(resultsData) ? resultsData : resultsData?.examResults || []
  const exams = Array.isArray(examsData) ? examsData : examsData?.exams || []
  const students = Array.isArray(studentsData) ? studentsData : studentsData?.data || []

  const [publishResults] = usePublishExamResultsMutation()

  const filteredResults = useMemo(() => {
    if (!results) return []
    return results.filter((result) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (result.student?.name || '').toLowerCase().includes(q) ||
          (result.exam?.name || '').toLowerCase().includes(q) ||
          (result.student?.customId || '').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [results, searchTerm])

  const handleGrade = (result) => {
    setSelectedResult(result)
    setIsGradeModalOpen(true)
  }

  const handlePublish = async () => {
    if (selectedResults.size === 0) {
      return toast.error('Please select at least one result')
    }
    try {
      await publishResults({
        resultIds: Array.from(selectedResults),
        notifyStudents: true,
        notifyParents: true,
      }).unwrap()
      toast.success('Results published successfully')
      setSelectedResults(new Set())
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to publish results')
    }
  }

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedResults)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedResults(newSelected)
  }

  const stats = useMemo(() => {
    if (!results.length) {
      return { total: 0, avgScore: 0, passed: 0, failed: 0 }
    }
    const scores = results.map((r) => r.score || 0)
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    const passed = results.filter((r) => r.percentage >= 50).length
    const failed = results.length - passed
    return { total: results.length, avgScore, passed, failed }
  }, [results])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Results</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage and grade exam results
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {selectedResults.size > 0 && (
            <Button onClick={handlePublish} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Publish Selected ({selectedResults.size})
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Results</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
          <p className="text-2xl font-bold">{stats.avgScore}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Passed</p>
          <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
          <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search results..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={examFilter}
          onChange={(e) => setExamFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="">All Exams</option>
          {exams.map((exam) => (
            <option key={exam._id} value={exam._id}>
              {exam.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="GRADED">Graded</option>
          <option value="PUBLISHED">Published</option>
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
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={selectedResults.size === filteredResults.length && filteredResults.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedResults(new Set(filteredResults.map((r) => r._id)))
                      } else {
                        setSelectedResults(new Set())
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No exam results found
                  </TableCell>
                </TableRow>
              ) : (
                filteredResults.map((result) => (
                  <TableRow key={result._id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedResults.has(result._id)}
                        onChange={() => toggleSelection(result._id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {result.student?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>{result.exam?.name || '-'}</TableCell>
                    <TableCell>{result.score || 0}</TableCell>
                    <TableCell>{result.percentage ? `${result.percentage}%` : '-'}</TableCell>
                    <TableCell>
                      {result.grade ? (
                        <Badge className={GRADE_COLORS[result.grade] || ''}>{result.grade}</Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_COLORS[result.status] || STATUS_COLORS.PENDING}>
                        {result.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleGrade(result)}
                          title="Grade"
                        >
                          <Edit2 className="h-4 w-4" />
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

      {/* Grade Modal */}
      {isGradeModalOpen && (
        <GradeModal
          result={selectedResult}
          onClose={() => {
            setIsGradeModalOpen(false)
            setSelectedResult(null)
          }}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  )
}

export default ExamResultsPage
