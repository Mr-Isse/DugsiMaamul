import React, { useState, useMemo } from 'react'
import { ShieldAlert, Plus, Search, Edit2, Trash2, RefreshCw, AlertCircle, X } from 'lucide-react'
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
  useGetDisciplineRecordsQuery,
  useCreateDisciplineRecordMutation,
  useUpdateDisciplineRecordMutation,
  useDeleteDisciplineRecordMutation,
} from '@/services/api'

const SEVERITY_STYLES = {
  Low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const STATUS_STYLES = {
  Pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Closed: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
}

const DisciplineModal = ({ initial, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    student: initial?.student?.name || initial?.student || '',
    type: initial?.type || 'Warning',
    date: initial?.date ? new Date(initial.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    description: initial?.description || '',
    actionTaken: initial?.actionTaken || '',
    severity: initial?.severity || 'Medium',
    status: initial?.status || 'Pending',
    notes: initial?.notes || '',
  })

  const [createDiscipline, { isLoading: creating }] = useCreateDisciplineRecordMutation()
  const [updateDiscipline, { isLoading: updating }] = useUpdateDisciplineRecordMutation()

  const isEdit = Boolean(initial)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.student.trim()) return toast.error('Student name is required')
    if (!form.type.trim()) return toast.error('Type is required')
    if (!form.date) return toast.error('Date is required')
    try {
      if (isEdit) {
        await updateDiscipline({ id: initial._id, ...form }).unwrap()
        toast.success('Discipline record updated')
      } else {
        await createDiscipline(form).unwrap()
        toast.success('Discipline record created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save discipline record')
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Discipline Record' : 'New Discipline Record'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update discipline record information' : 'Create a new discipline record'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="student">Student Name / ID *</Label>
          <Input
            id="student"
            value={form.student}
            onChange={(e) => setForm({ ...form, student: e.target.value })}
            placeholder="Enter student name or ID"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              required
            >
              <option value="Warning">Warning</option>
              <option value="Minor Offense">Minor Offense</option>
              <option value="Major Offense">Major Offense</option>
              <option value="Suspension">Suspension</option>
              <option value="Expulsion">Expulsion</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Input
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the incident"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="actionTaken">Action Taken</Label>
          <Input
            id="actionTaken"
            value={form.actionTaken}
            onChange={(e) => setForm({ ...form, actionTaken: e.target.value })}
            placeholder="Actions taken"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="severity">Severity</Label>
            <select
              id="severity"
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
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
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Additional notes"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Record'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const DeleteConfirmDialog = ({ record, onClose, onSuccess }) => {
  const [deleteDiscipline, { isLoading }] = useDeleteDisciplineRecordMutation()

  const handleDelete = async () => {
    try {
      await deleteDiscipline(record._id).unwrap()
      toast.success('Discipline record deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete discipline record')
    }
  }

  return (
    <DialogContent className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <DialogTitle>Delete Discipline Record</DialogTitle>
        <DialogDescription className="mt-2">
          Are you sure you want to delete this discipline record for <span className="font-bold">"{record.student?.name || record.student}"</span>?
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

const DisciplinePage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: disciplineData, isLoading, refetch } = useGetDisciplineRecordsQuery()
  const disciplineRecords = Array.isArray(disciplineData) ? disciplineData : disciplineData?.data || []

  const filteredRecords = useMemo(() => {
    if (!disciplineRecords) return []
    return disciplineRecords.filter((record) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (record.student?.name || record.student || '').toLowerCase().includes(q) ||
          (record.type || '').toLowerCase().includes(q) ||
          (record.description || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (severityFilter && record.severity !== severityFilter) return false
      if (statusFilter && record.status !== statusFilter) return false
      return true
    })
  }, [disciplineRecords, searchTerm, severityFilter, statusFilter])

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditRecord(record)
    setIsModalOpen(true)
  }

  const handleDelete = (record) => {
    setDeleteRecord(record)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discipline Records</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track and manage student discipline records
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Record
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by student, type, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-sm"
          >
            <option value="">All Severities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-sm"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                </TableRow>
              ))
            ) : filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No discipline records found
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record._id}>
                  <TableCell className="font-medium">{record.student?.name || record.student || '—'}</TableCell>
                  <TableCell>{record.type || '—'}</TableCell>
                  <TableCell>{formatDate(record.date)}</TableCell>
                  <TableCell>
                    <Badge className={SEVERITY_STYLES[record.severity] || 'bg-gray-100'}>
                      {record.severity || '—'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_STYLES[record.status] || 'bg-gray-100'}>
                      {record.status || '—'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{record.description || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(record)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
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
        <DisciplineModal
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

export default DisciplinePage
