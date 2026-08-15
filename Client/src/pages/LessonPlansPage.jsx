import React, { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2, AlertCircle, RefreshCw, ClipboardList, Target } from 'lucide-react'
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
  useGetLessonPlansQuery,
  useCreateLessonPlanMutation,
  useUpdateLessonPlanMutation,
  useDeleteLessonPlanMutation,
  useGetClassesQuery,
  useGetSubjectsQuery,
} from '@/services/api'

const LessonPlanModal = ({ isOpen, initial, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: initial?.title || '',
    class: initial?.class?._id || initial?.class || '',
    subject: initial?.subject?._id || initial?.subject || '',
    week: initial?.week || '',
    objectives: (initial?.objectives || []).join('\n'),
    topics: (initial?.topics || []).join('\n'),
  })

  const { data: classesData } = useGetClassesQuery()
  const { data: subjectsData } = useGetSubjectsQuery()
  const classes = Array.isArray(classesData) ? classesData : classesData?.data || []
  const subjects = Array.isArray(subjectsData) ? subjectsData : subjectsData?.data || []

  const [createLessonPlan, { isLoading: creating }] = useCreateLessonPlanMutation()
  const [updateLessonPlan, { isLoading: updating }] = useUpdateLessonPlanMutation()

  const isEdit = Boolean(initial)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Strong validations
    if (!form.title.trim()) {
      return toast.error('Title is required')
    }
    if (!/^[a-zA-Z0-9\s\-.,!?]+$/.test(form.title)) {
      return toast.error('Title can only contain letters, numbers, spaces, and basic punctuation')
    }
    if (form.title.length < 3) {
      return toast.error('Title must be at least 3 characters')
    }
    if (form.title.length > 200) {
      return toast.error('Title cannot exceed 200 characters')
    }
    
    if (!form.class) {
      return toast.error('Class is required')
    }
    
    if (!form.subject) {
      return toast.error('Subject is required')
    }
    
    if (form.week) {
      if (!/^\d+$/.test(form.week)) {
        return toast.error('Week must be a valid number')
      }
      if (parseInt(form.week) < 1) {
        return toast.error('Week must be at least 1')
      }
      if (parseInt(form.week) > 52) {
        return toast.error('Week cannot exceed 52')
      }
    }
    
    if (form.objectives && form.objectives.length > 2000) {
      return toast.error('Objectives cannot exceed 2000 characters')
    }
    
    if (form.topics && form.topics.length > 2000) {
      return toast.error('Topics cannot exceed 2000 characters')
    }
    
    try {
      const payload = {
        ...form,
        week: form.week ? Number(form.week) : undefined,
        objectives: form.objectives.split('\n').map((s) => s.trim()).filter(Boolean),
        topics: form.topics.split('\n').map((s) => s.trim()).filter(Boolean),
      }
      if (isEdit) {
        await updateLessonPlan({ id: initial._id, ...payload }).unwrap()
        toast.success('Lesson plan updated')
      } else {
        await createLessonPlan(payload).unwrap()
        toast.success('Lesson plan created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save lesson plan')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Lesson Plan' : 'New Lesson Plan'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update lesson plan' : 'Create a new lesson plan'}
          </DialogDescription>
        </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Introduction to Fractions"
            required
          />
          <p className="text-xs text-gray-500">3-200 characters, letters, numbers and basic punctuation only</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="class">Class *</Label>
            <select
              id="class"
              value={form.class}
              onChange={(e) => setForm({ ...form, class: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              required
            >
              <option value="">Select</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <select
              id="subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              required
            >
              <option value="">Select</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="week">Week</Label>
            <Input
              id="week"
              type="number"
              min="1"
              max="52"
              value={form.week}
              onChange={(e) => setForm({ ...form, week: e.target.value })}
              placeholder="1"
            />
            <p className="text-xs text-gray-500">1-52</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="objectives">Objectives</Label>
          <textarea
            id="objectives"
            rows={4}
            value={form.objectives}
            onChange={(e) => setForm({ ...form, objectives: e.target.value })}
            placeholder="One objective per line..."
            className="w-full px-3 py-2 rounded-md border border-input bg-background resize-none"
            maxLength={2000}
          />
          <p className="text-xs text-gray-500">Max 2000 characters, one per line</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="topics">Topics</Label>
          <textarea
            id="topics"
            rows={4}
            value={form.topics}
            onChange={(e) => setForm({ ...form, topics: e.target.value })}
            placeholder="One topic per line..."
            className="w-full px-3 py-2 rounded-md border border-input bg-background resize-none"
            maxLength={2000}
          />
          <p className="text-xs text-gray-500">Max 2000 characters, one per line</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Lesson Plan'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
  )
}

const DeleteConfirmDialog = ({ isOpen, lessonPlan, onClose, onSuccess }) => {
  const [deleteLessonPlan, { isLoading }] = useDeleteLessonPlanMutation()

  const handleDelete = async () => {
    try {
      await deleteLessonPlan(lessonPlan._id).unwrap()
      toast.success('Lesson plan deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete lesson plan')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle>Delete Lesson Plan</DialogTitle>
          <DialogDescription className="mt-2">
            Are you sure you want to delete <span className="font-bold">"{lessonPlan.title}"</span>?
            This action cannot be undone.
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
    </Dialog>
  )
}

const LessonPlansPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: lessonPlansData, isLoading, refetch } = useGetLessonPlansQuery()
  const { data: classesData } = useGetClassesQuery()
  const { data: subjectsData } = useGetSubjectsQuery()

  const lessonPlans = Array.isArray(lessonPlansData) ? lessonPlansData : lessonPlansData?.data || []
  const classes = Array.isArray(classesData) ? classesData : classesData?.data || []
  const subjects = Array.isArray(subjectsData) ? subjectsData : subjectsData?.data || []

  const filteredLessonPlans = useMemo(() => {
    if (!lessonPlans) return []
    return lessonPlans.filter((lessonPlan) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (lessonPlan.title || '').toLowerCase().includes(q) ||
          (lessonPlan.objectives || []).some((o) => o.toLowerCase().includes(q)) ||
          (lessonPlan.topics || []).some((t) => t.toLowerCase().includes(q))
        if (!match) return false
      }
      if (classFilter && lessonPlan.class !== classFilter) return false
      if (subjectFilter && lessonPlan.subject !== subjectFilter) return false
      return true
    })
  }, [lessonPlans, searchTerm, classFilter, subjectFilter])

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (lessonPlan) => {
    setEditRecord(lessonPlan)
    setIsModalOpen(true)
  }

  const handleDelete = (lessonPlan) => {
    setDeleteRecord(lessonPlan)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lesson Plans</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage lesson plans and teaching materials
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Lesson Plan
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search lesson plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background max-w-[180px]"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background max-w-[180px]"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Week</TableHead>
              <TableHead>Objectives</TableHead>
              <TableHead>Topics</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredLessonPlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No lesson plans found
                </TableCell>
              </TableRow>
            ) : (
              filteredLessonPlans.map((lessonPlan) => {
                const classInfo = classes.find((c) => c._id === lessonPlan.class)
                const subjectInfo = subjects.find((s) => s._id === lessonPlan.subject)

                return (
                  <TableRow key={lessonPlan._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white">
                          <ClipboardList className="h-5 w-5" />
                        </div>
                        <div className="font-medium">{lessonPlan.title}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{classInfo?.name || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{subjectInfo?.name || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Week {lessonPlan.week || '—'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{lessonPlan.objectives?.length || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{lessonPlan.topics?.length || 0}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(lessonPlan)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(lessonPlan)} className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <LessonPlanModal
            isOpen={isModalOpen}
            initial={editRecord}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => refetch()}
          />
        </Dialog>
      )}

      {deleteRecord && (
        <Dialog open={!!deleteRecord} onOpenChange={() => setDeleteRecord(null)}>
          <DeleteConfirmDialog
            isOpen={!!deleteRecord}
            lessonPlan={deleteRecord}
            onClose={() => setDeleteRecord(null)}
            onSuccess={() => refetch()}
          />
        </Dialog>
      )}
    </div>
  )
}

export default LessonPlansPage
