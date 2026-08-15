import React, { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2, AlertCircle, RefreshCw, BookOpen } from 'lucide-react'
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
  useGetCurriculumsQuery,
  useCreateCurriculumMutation,
  useUpdateCurriculumMutation,
  useDeleteCurriculumMutation,
  useGetClassesQuery,
  useGetSubjectsQuery,
} from '@/services/api'

const CurriculumModal = ({ isOpen, initial, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    title: initial?.title || '',
    class: initial?.class?._id || initial?.class || '',
    subject: initial?.subject?._id || initial?.subject || '',
    terms: (initial?.terms || [{ name: 'Term 1', topics: [] }]).map((t) => ({
      name: t.name || '',
      topics: (t.topics || []).join('\n'),
    })),
  })

  const { data: classesData } = useGetClassesQuery()
  const { data: subjectsData } = useGetSubjectsQuery()
  const classes = Array.isArray(classesData) ? classesData : classesData?.data || []
  const subjects = Array.isArray(subjectsData) ? subjectsData : subjectsData?.data || []

  const [createCurriculum, { isLoading: creating }] = useCreateCurriculumMutation()
  const [updateCurriculum, { isLoading: updating }] = useUpdateCurriculumMutation()

  const isEdit = Boolean(initial)

  const addTerm = () => {
    setForm((p) => ({
      ...p,
      terms: [...p.terms, { name: `Term ${p.terms.length + 1}`, topics: '' }],
    }))
  }

  const removeTerm = (index) => {
    if (form.terms.length <= 1) return
    setForm((p) => ({
      ...p,
      terms: p.terms.filter((_, i) => i !== index),
    }))
  }

  const updateTerm = (index, key, value) => {
    setForm((p) => ({
      ...p,
      terms: p.terms.map((t, i) => (i === index ? { ...t, [key]: value } : t)),
    }))
  }

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
    
    // Validate terms
    if (!form.terms || form.terms.length === 0) {
      return toast.error('At least one term is required')
    }
    
    for (let i = 0; i < form.terms.length; i++) {
      const term = form.terms[i]
      if (!term.name.trim()) {
        return toast.error(`Term ${i + 1} name is required`)
      }
      if (term.name.length > 100) {
        return toast.error(`Term ${i + 1} name cannot exceed 100 characters`)
      }
      if (term.topics && term.topics.length > 2000) {
        return toast.error(`Term ${i + 1} topics cannot exceed 2000 characters`)
      }
    }
    
    try {
      const payload = {
        ...form,
        terms: form.terms.map((t) => ({
          name: t.name,
          topics: t.topics.split('\n').map((s) => s.trim()).filter(Boolean),
        })),
      }
      if (isEdit) {
        await updateCurriculum({ id: initial._id, ...payload }).unwrap()
        toast.success('Curriculum updated')
      } else {
        await createCurriculum(payload).unwrap()
        toast.success('Curriculum created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save curriculum')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Curriculum' : 'New Curriculum'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update curriculum information' : 'Create a new curriculum'}
          </DialogDescription>
        </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Mathematics Curriculum 2024"
            required
          />
          <p className="text-xs text-gray-500">3-200 characters, letters, numbers and basic punctuation only</p>
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Terms</Label>
            <Button type="button" variant="outline" size="sm" onClick={addTerm}>
              <Plus className="h-4 w-4 mr-1" />
              Add Term
            </Button>
          </div>
          {form.terms.map((term, idx) => (
            <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Input
                  value={term.name}
                  onChange={(e) => updateTerm(idx, 'name', e.target.value)}
                  placeholder="Term name"
                  className="flex-1"
                  maxLength={100}
                />
                {form.terms.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeTerm(idx)} className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500">Max 100 characters</p>
              <textarea
                rows={3}
                value={term.topics}
                onChange={(e) => updateTerm(idx, 'topics', e.target.value)}
                placeholder="Topics (one per line)..."
                className="w-full px-3 py-2 rounded-md border border-input bg-background resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-gray-500">Max 2000 characters, one per line</p>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Curriculum'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
  )
}

const DeleteConfirmDialog = ({ isOpen, curriculum, onClose, onSuccess }) => {
  const [deleteCurriculum, { isLoading }] = useDeleteCurriculumMutation()

  const handleDelete = async () => {
    try {
      await deleteCurriculum(curriculum._id).unwrap()
      toast.success('Curriculum deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete curriculum')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle>Delete Curriculum</DialogTitle>
          <DialogDescription className="mt-2">
            Are you sure you want to delete <span className="font-bold">"{curriculum.title}"</span>?
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

const CurriculumPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: curriculumsData, isLoading, refetch } = useGetCurriculumsQuery()
  const { data: classesData } = useGetClassesQuery()
  const curriculums = Array.isArray(curriculumsData) ? curriculumsData : curriculumsData?.data || []
  const classes = Array.isArray(classesData) ? classesData : classesData?.data || []

  const filteredCurriculums = useMemo(() => {
    if (!curriculums) return []
    return curriculums.filter((curriculum) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (curriculum.title || '').toLowerCase().includes(q) ||
          (curriculum.subject?.name || curriculum.subject || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (classFilter && curriculum.class !== classFilter) return false
      return true
    })
  }, [curriculums, searchTerm, classFilter])

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (curriculum) => {
    setEditRecord(curriculum)
    setIsModalOpen(true)
  }

  const handleDelete = (curriculum) => {
    setDeleteRecord(curriculum)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Curriculum</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage curriculum and syllabus
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Curriculum
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search curriculum..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background max-w-[200px]"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
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
              <TableHead>Terms</TableHead>
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
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredCurriculums.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No curriculum found
                </TableCell>
              </TableRow>
            ) : (
              filteredCurriculums.map((curriculum) => (
                <TableRow key={curriculum._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="font-medium">{curriculum.title}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{curriculum.class?.name || curriculum.class || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{curriculum.subject?.name || curriculum.subject || 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{curriculum.terms?.length || 0} Terms</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(curriculum)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(curriculum)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <CurriculumModal
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
            curriculum={deleteRecord}
            onClose={() => setDeleteRecord(null)}
            onSuccess={() => refetch()}
          />
        </Dialog>
      )}
    </div>
  )
}

export default CurriculumPage
