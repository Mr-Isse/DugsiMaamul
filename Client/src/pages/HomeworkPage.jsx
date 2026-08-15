import React, { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2, AlertCircle, RefreshCw, FileText, Calendar } from 'lucide-react'
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
  useGetHomeworksQuery,
  useCreateHomeworkMutation,
  useUpdateHomeworkMutation,
  useDeleteHomeworkMutation,
  useGetClassesQuery,
  useGetSubjectsQuery,
} from '@/services/api'

const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const HomeworkModal = ({ isOpen, initial, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    class: initial?.class?._id || initial?.class || '',
    subject: initial?.subject?._id || initial?.subject || '',
    dueDate: initial?.dueDate ? new Date(initial.dueDate).toISOString().split('T')[0] : '',
    totalMarks: initial?.totalMarks || '',
  })

  const { data: classesData } = useGetClassesQuery()
  const { data: subjectsData } = useGetSubjectsQuery()
  const classes = Array.isArray(classesData) ? classesData : classesData?.data || []
  const subjects = Array.isArray(subjectsData) ? subjectsData : subjectsData?.data || []

  const [createHomework, { isLoading: creating }] = useCreateHomeworkMutation()
  const [updateHomework, { isLoading: updating }] = useUpdateHomeworkMutation()

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
    
    if (form.description && form.description.length > 1000) {
      return toast.error('Description cannot exceed 1000 characters')
    }
    
    if (!form.class) {
      return toast.error('Class is required')
    }
    
    if (!form.subject) {
      return toast.error('Subject is required')
    }
    
    if (!form.dueDate) {
      return toast.error('Due date is required')
    }
    const dueDate = new Date(form.dueDate)
    if (isNaN(dueDate.getTime())) {
      return toast.error('Invalid due date')
    }
    if (dueDate < new Date().setHours(0,0,0,0)) {
      return toast.error('Due date cannot be in the past')
    }
    
    if (form.totalMarks) {
      if (!/^\d+$/.test(form.totalMarks)) {
        return toast.error('Total marks must be a valid number')
      }
      if (parseInt(form.totalMarks) < 0) {
        return toast.error('Total marks cannot be negative')
      }
      if (parseInt(form.totalMarks) > 1000) {
        return toast.error('Total marks cannot exceed 1000')
      }
    }
    
    try {
      const payload = {
        ...form,
        totalMarks: form.totalMarks ? Number(form.totalMarks) : undefined,
      }
      if (isEdit) {
        await updateHomework({ id: initial._id, ...payload }).unwrap()
        toast.success('Homework updated')
      } else {
        await createHomework(payload).unwrap()
        toast.success('Homework created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save homework')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Homework' : 'New Homework'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update homework assignment' : 'Create a new homework assignment'}
          </DialogDescription>
        </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Chapter 5 Exercises"
            required
          />
          <p className="text-xs text-gray-500">3-200 characters, letters, numbers and basic punctuation only</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Instructions for students..."
            className="w-full px-3 py-2 rounded-md border border-input bg-background resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-gray-500">Max 1000 characters</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="class">Class *</Label>
            <select
              id="class"
              value={form.class}
              onChange={(e) => setForm({ ...form, class: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              required
            >
              <option value="">Select class</option>
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
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalMarks">Total Marks</Label>
            <Input
              id="totalMarks"
              type="number"
              min="0"
              max="1000"
              value={form.totalMarks}
              onChange={(e) => setForm({ ...form, totalMarks: e.target.value })}
              placeholder="e.g. 20"
            />
            <p className="text-xs text-gray-500">0-1000</p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Homework'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
  )
}

const DeleteConfirmDialog = ({ isOpen, homework, onClose, onSuccess }) => {
  const [deleteHomework, { isLoading }] = useDeleteHomeworkMutation()

  const handleDelete = async () => {
    try {
      await deleteHomework(homework._id).unwrap()
      toast.success('Homework deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete homework')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle>Delete Homework</DialogTitle>
          <DialogDescription className="mt-2">
            Are you sure you want to delete <span className="font-bold">"{homework.title}"</span>?
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

const HomeworkPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: homeworksData, isLoading, refetch } = useGetHomeworksQuery()
  const { data: classesData } = useGetClassesQuery()
  const { data: subjectsData } = useGetSubjectsQuery()

  const homeworks = Array.isArray(homeworksData) ? homeworksData : homeworksData?.data || []
  const classes = Array.isArray(classesData) ? classesData : classesData?.data || []
  const subjects = Array.isArray(subjectsData) ? subjectsData : subjectsData?.data || []

  const filteredHomeworks = useMemo(() => {
    if (!homeworks) return []
    return homeworks.filter((homework) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (homework.title || '').toLowerCase().includes(q) ||
          (homework.description || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (classFilter && homework.class !== classFilter) return false
      if (subjectFilter && homework.subject !== subjectFilter) return false
      return true
    })
  }, [homeworks, searchTerm, classFilter, subjectFilter])

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (homework) => {
    setEditRecord(homework)
    setIsModalOpen(true)
  }

  const handleDelete = (homework) => {
    setDeleteRecord(homework)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Homework</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage homework assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Assignment
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search homework..."
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
              <TableHead>Due Date</TableHead>
              <TableHead>Total Marks</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredHomeworks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No homework found
                </TableCell>
              </TableRow>
            ) : (
              filteredHomeworks.map((homework) => {
                const classInfo = classes.find((c) => c._id === homework.class)
                const subjectInfo = subjects.find((s) => s._id === homework.subject)

                return (
                  <TableRow key={homework._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{homework.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{homework.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{classInfo?.name || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{subjectInfo?.name || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{formatDate(homework.dueDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{homework.totalMarks || '—'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(homework)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(homework)} className="text-red-600">
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
          <HomeworkModal
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
            homework={deleteRecord}
            onClose={() => setDeleteRecord(null)}
            onSuccess={() => refetch()}
          />
        </Dialog>
      )}
    </div>
  )
}

export default HomeworkPage
