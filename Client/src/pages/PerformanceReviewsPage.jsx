import React, { useState, useMemo } from 'react'
import {
  Star,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  Award,
  TrendingUp,
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
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  useGetReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useGetTeachersQuery,
} from '@/services/api'

const RATINGS = ['Excellent', 'Good', 'Average', 'Needs Improvement', 'Unsatisfactory']
const STATUSES = ['Draft', 'In Progress', 'Completed', 'Archived']

const STATUS_STYLES = {
  Draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Archived: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
}

const RATING_STYLES = {
  Excellent: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Good: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Average: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Needs Improvement': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Unsatisfactory: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const ReviewModal = ({ initial, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    employeeName: initial?.employeeName || '',
    employeeId: initial?.employeeId || '',
    department: initial?.department || '',
    period: initial?.period || '',
    reviewDate: initial?.reviewDate
      ? new Date(initial.reviewDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    overallScore: initial?.overallScore || '',
    rating: initial?.rating || '',
    status: initial?.status || 'Draft',
    strengths: initial?.strengths || '',
    improvements: initial?.improvements || '',
    goals: initial?.goals || '',
    comments: initial?.comments || '',
    criteria: initial?.criteria?.length > 0
      ? initial.criteria
      : [{ name: '', score: '', weight: '', comments: '' }],
  })

  const { data: teachersData } = useGetTeachersQuery()
  const teachers = Array.isArray(teachersData) ? teachersData : teachersData?.data || []
  const [createReview, { isLoading: creating }] = useCreateReviewMutation()
  const [updateReview, { isLoading: updating }] = useUpdateReviewMutation()

  const isEdit = Boolean(initial)

  const updateCriterion = (index, key, value) => {
    setForm((prev) => {
      const criteria = [...prev.criteria]
      criteria[index] = { ...criteria[index], [key]: value }
      return { ...prev, criteria }
    })
  }

  const addCriterion = () => {
    setForm((prev) => ({
      ...prev,
      criteria: [...prev.criteria, { name: '', score: '', weight: '', comments: '' }],
    }))
  }

  const removeCriterion = (index) => {
    if (form.criteria.length <= 1) return
    setForm((prev) => ({
      ...prev,
      criteria: prev.criteria.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.employeeName.trim()) return toast.error('Employee name is required')
    if (!form.period.trim()) return toast.error('Review period is required')
    try {
      const payload = {
        ...form,
        overallScore: Number(form.overallScore) || 0,
        criteria: form.criteria.map((c) => ({
          ...c,
          score: Number(c.score) || 0,
          weight: Number(c.weight) || 0,
        })),
      }
      if (isEdit) {
        await updateReview({ id: initial._id, ...payload }).unwrap()
        toast.success('Review updated')
      } else {
        await createReview(payload).unwrap()
        toast.success('Review created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save review')
    }
  }

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Review' : 'New Review'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update performance review' : 'Create a new performance review'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employeeName">Employee Name *</Label>
            <select
              id="employeeName"
              value={form.employeeName}
              onChange={(e) => {
                const teacher = teachers.find((t) => t._id === e.target.value)
                setForm({
                  ...form,
                  employeeName: teacher?.name || e.target.value,
                  employeeId: teacher?.customId || '',
                  department: teacher?.department || '',
                })
              }}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              required
            >
              <option value="">Select employee</option>
              {teachers.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name || `${t.firstName} ${t.lastName || ''}`}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              placeholder="Employee ID"
              disabled
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="Department"
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="period">Review Period *</Label>
            <Input
              id="period"
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
              placeholder="e.g. Q1 2026"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reviewDate">Review Date</Label>
            <Input
              id="reviewDate"
              type="date"
              value={form.reviewDate}
              onChange={(e) => setForm({ ...form, reviewDate: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="overallScore">Overall Score (0-100)</Label>
            <Input
              id="overallScore"
              type="number"
              min="0"
              max="100"
              value={form.overallScore}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '')
                setForm({ ...form, overallScore: value })
              }}
              placeholder="0-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <select
              id="rating"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            >
              <option value="">Select</option>
              {RATINGS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Review Criteria</Label>
          {form.criteria.map((criterion, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 items-start">
              <Input
                placeholder="Criteria name"
                value={criterion.name}
                onChange={(e) => updateCriterion(index, 'name', e.target.value)}
              />
              <Input
                type="number"
                placeholder="Score"
                value={criterion.score}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '')
                  updateCriterion(index, 'score', value)
                }}
              />
              <Input
                type="number"
                placeholder="Weight"
                value={criterion.weight}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '')
                  updateCriterion(index, 'weight', value)
                }}
              />
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addCriterion}
                  className="h-9 w-9"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                {form.criteria.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeCriterion(index)}
                    className="h-9 w-9"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="strengths">Strengths</Label>
          <Input
            id="strengths"
            value={form.strengths}
            onChange={(e) => setForm({ ...form, strengths: e.target.value })}
            placeholder="Key strengths"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="improvements">Areas for Improvement</Label>
          <Input
            id="improvements"
            value={form.improvements}
            onChange={(e) => setForm({ ...form, improvements: e.target.value })}
            placeholder="Areas needing improvement"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="goals">Goals</Label>
          <Input
            id="goals"
            value={form.goals}
            onChange={(e) => setForm({ ...form, goals: e.target.value })}
            placeholder="Goals for next period"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="comments">Comments</Label>
          <Input
            id="comments"
            value={form.comments}
            onChange={(e) => setForm({ ...form, comments: e.target.value })}
            placeholder="Additional comments"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Review'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const DeleteConfirmDialog = ({ record, onClose, onSuccess }) => {
  const [deleteReview, { isLoading }] = useDeleteReviewMutation()

  const handleDelete = async () => {
    try {
      await deleteReview(record._id).unwrap()
      toast.success('Review deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete review')
    }
  }

  return (
    <DialogContent className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <DialogTitle>Delete Review</DialogTitle>
        <DialogDescription className="mt-2">
          Are you sure you want to delete this review? This action cannot be undone.
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

const PerformanceReviewsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: reviewsData, isLoading, refetch } = useGetReviewsQuery()
  const reviews = Array.isArray(reviewsData) ? reviewsData : reviewsData?.data || []

  const filteredReviews = useMemo(() => {
    if (!reviews) return []
    return reviews.filter((review) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (review.employeeName || '').toLowerCase().includes(q) ||
          (review.employeeId || '').toLowerCase().includes(q) ||
          (review.period || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter && review.status !== statusFilter) return false
      if (ratingFilter && review.rating !== ratingFilter) return false
      return true
    })
  }, [reviews, searchTerm, statusFilter, ratingFilter])

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (review) => {
    setEditRecord(review)
    setIsModalOpen(true)
  }

  const handleDelete = (review) => {
    setDeleteRecord(review)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Reviews</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage staff performance reviews</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Review
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by employee, period..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background sm:w-48"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background sm:w-48"
        >
          <option value="">All Ratings</option>
          {RATINGS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Review Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No reviews found
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow key={review._id}>
                    <TableCell className="font-medium">{review.employeeName}</TableCell>
                    <TableCell>{review.period}</TableCell>
                    <TableCell>{formatDate(review.reviewDate)}</TableCell>
                    <TableCell>{review.overallScore || '—'}</TableCell>
                    <TableCell>
                      <Badge className={RATING_STYLES[review.rating] || ''}>{review.rating || '—'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[review.status] || ''}>{review.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(review)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(review)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {isModalOpen && (
        <ReviewModal
          initial={editRecord}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
        />
      )}

      {deleteRecord && (
        <DeleteConfirmDialog
          record={deleteRecord}
          onClose={() => setDeleteRecord(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  )
}

export default PerformanceReviewsPage
