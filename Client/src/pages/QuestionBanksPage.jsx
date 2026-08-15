import React, { useState, useMemo } from 'react'
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  Send,
  CheckCircle2,
  Archive,
  RefreshCw,
  AlertCircle,
  X,
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
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  useGetQuestionBanksQuery,
  useCreateQuestionBankMutation,
  useUpdateQuestionBankMutation,
  useDeleteQuestionBankMutation,
  useCloneQuestionBankMutation,
  useSubmitBankForApprovalMutation,
  useApproveQuestionBankMutation,
  useGetSubjectsQuery,
  useGetClassesQuery,
} from '@/services/api'

const STATUS_STYLES = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  PUBLISHED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  ARCHIVED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

const APPROVAL_STYLES = {
  NOT_REQUIRED: 'bg-gray-100 text-gray-600',
  PENDING_REVIEW: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}

const QuestionBankModal = ({ initial, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    subject: initial?.subject?._id || initial?.subject || '',
    class: initial?.class?._id || initial?.class || '',
    tags: initial?.tags ? initial.tags.join(', ') : '',
    category: initial?.category || '',
    approvalRequired: initial?.approvalRequired || false,
  })

  const { data: subjectsData } = useGetSubjectsQuery()
  const { data: classesData } = useGetClassesQuery()
  const subjects = Array.isArray(subjectsData) ? subjectsData : subjectsData?.data || []
  const classes = Array.isArray(classesData) ? classesData : classesData?.data || []

  const [createBank, { isLoading: creating }] = useCreateQuestionBankMutation()
  const [updateBank, { isLoading: updating }] = useUpdateQuestionBankMutation()

  const isEdit = Boolean(initial)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Bank name is required')
    try {
      const data = {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      }
      if (isEdit) {
        await updateBank({ id: initial._id, ...data }).unwrap()
        toast.success('Question bank updated')
      } else {
        await createBank(data).unwrap()
        toast.success('Question bank created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save question bank')
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Question Bank' : 'New Question Bank'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update question bank information' : 'Create a new question bank'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Mathematics Chapter 1"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Question bank description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <select
              id="subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <select
              id="class"
              value={form.class}
              onChange={(e) => setForm({ ...form, class: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} - {c.section}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="e.g. Midterm, Final"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            placeholder="e.g. algebra, geometry, calculus"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="approvalRequired"
            checked={form.approvalRequired}
            onChange={(e) => setForm({ ...form, approvalRequired: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <Label htmlFor="approvalRequired" className="cursor-pointer">
            Require approval before publishing
          </Label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Bank'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const DeleteConfirmDialog = ({ bank, onClose, onSuccess }) => {
  const [deleteBank, { isLoading }] = useDeleteQuestionBankMutation()

  const handleDelete = async () => {
    try {
      await deleteBank(bank._id).unwrap()
      toast.success('Question bank deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete question bank')
    }
  }

  return (
    <DialogContent className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <DialogTitle>Delete Question Bank</DialogTitle>
        <DialogDescription className="mt-2">
          Are you sure you want to delete <span className="font-bold">"{bank.name}"</span>?
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
  )
}

const QuestionBanksPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: banksData, isLoading, refetch } = useGetQuestionBanksQuery({
    subject: subjectFilter || undefined,
    class: classFilter || undefined,
  })
  const { data: subjectsData } = useGetSubjectsQuery()
  const { data: classesData } = useGetClassesQuery()

  const banks = Array.isArray(banksData) ? banksData : banksData?.questionBanks || []
  const subjects = Array.isArray(subjectsData) ? subjectsData : subjectsData?.data || []
  const classes = Array.isArray(classesData) ? classesData : classesData?.data || []

  const [cloneBank] = useCloneQuestionBankMutation()
  const [submitApproval] = useSubmitBankForApprovalMutation()
  const [approveBank] = useApproveQuestionBankMutation()

  const filteredBanks = useMemo(() => {
    if (!banks) return []
    return banks.filter((bank) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (bank.name || '').toLowerCase().includes(q) ||
          (bank.description || '').toLowerCase().includes(q) ||
          (bank.tags || []).some((t) => t.toLowerCase().includes(q))
        if (!match) return false
      }
      if (statusFilter && bank.status !== statusFilter) return false
      return true
    })
  }, [banks, searchTerm, statusFilter])

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (bank) => {
    setEditRecord(bank)
    setIsModalOpen(true)
  }

  const handleDelete = (bank) => {
    setDeleteRecord(bank)
  }

  const handleClone = async (bank) => {
    try {
      await cloneBank({ id: bank._id, name: `${bank.name} (Copy)` }).unwrap()
      toast.success('Question bank cloned')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to clone')
    }
  }

  const handleSubmitApproval = async (bank) => {
    try {
      await submitApproval(bank._id).unwrap()
      toast.success('Submitted for approval')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to submit')
    }
  }

  const handleApprove = async (bank, status) => {
    try {
      await approveBank({ id: bank._id, status }).unwrap()
      toast.success(`Bank ${status.toLowerCase()}`)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to approve')
    }
  }

  const stats = useMemo(() => {
    return {
      total: banks.length,
      published: banks.filter((b) => b.status === 'PUBLISHED').length,
      draft: banks.filter((b) => b.status === 'DRAFT').length,
      archived: banks.filter((b) => b.status === 'ARCHIVED').length,
    }
  }, [banks])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Question Banks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage question banks for exams
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Bank
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Banks</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Published</p>
          <p className="text-2xl font-bold text-green-600">{stats.published}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Drafts</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Archived</p>
          <p className="text-2xl font-bold text-gray-600">{stats.archived}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search banks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name} - {c.section}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
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
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBanks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No question banks found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBanks.map((bank) => (
                  <TableRow key={bank._id}>
                    <TableCell className="font-medium">{bank.name}</TableCell>
                    <TableCell>{bank.subject?.name || '-'}</TableCell>
                    <TableCell>
                      {bank.class ? `${bank.class.name} - ${bank.class.section}` : '-'}
                    </TableCell>
                    <TableCell>{bank.totalQuestions || 0}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[bank.status] || STATUS_STYLES.DRAFT}>
                        {bank.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={APPROVAL_STYLES[bank.approvalStatus] || APPROVAL_STYLES.NOT_REQUIRED}
                      >
                        {bank.approvalStatus || 'NOT_REQUIRED'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(bank)}
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleClone(bank)}
                          title="Clone"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {bank.approvalStatus === 'PENDING_REVIEW' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleApprove(bank, 'APPROVED')}
                            title="Approve"
                          >
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        {bank.status === 'DRAFT' && bank.approvalRequired && !bank.approvalStatus && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSubmitApproval(bank)}
                            title="Submit for Approval"
                          >
                            <Send className="h-4 w-4 text-blue-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(bank)}
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
        <QuestionBankModal
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
          bank={deleteRecord}
          onClose={() => setDeleteRecord(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  )
}

export default QuestionBanksPage
