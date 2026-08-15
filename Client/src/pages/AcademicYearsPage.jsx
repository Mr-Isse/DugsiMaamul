import React, { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2, Calendar, RefreshCw, AlertCircle, X } from 'lucide-react'
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
import { useGetAcademicYearsQuery, useCreateAcademicYearMutation, useUpdateAcademicYearMutation, useDeleteAcademicYearMutation } from '@/services/api'

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  archived: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const AcademicYearModal = ({ initial, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: initial?.name || '',
    startDate: initial?.startDate ? initial.startDate.split('T')[0] : '',
    endDate: initial?.endDate ? initial.endDate.split('T')[0] : '',
    status: initial?.status || 'inactive',
  })

  const [createYear, { isLoading: creating }] = useCreateAcademicYearMutation()
  const [updateYear, { isLoading: updating }] = useUpdateAcademicYearMutation()

  const isEdit = Boolean(initial)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Session name is required')
    if (!form.startDate) return toast.error('Start date is required')
    if (!form.endDate) return toast.error('End date is required')

    // Validate date range
    const start = new Date(form.startDate)
    const end = new Date(form.endDate)
    if (end < start) {
      return toast.error('End date must be after start date')
    }

    try {
      if (isEdit) {
        await updateYear({ id: initial._id, ...form }).unwrap()
        toast.success('Academic year updated')
      } else {
        await createYear(form).unwrap()
        toast.success('Academic year created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save academic year')
    }
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Academic Year' : 'New Academic Year'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update academic year information' : 'Create a new academic year'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Session Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. 2024-2025"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date *</Label>
            <Input
              id="endDate"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
          >
            <option value="inactive">Inactive</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Academic Year'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const DeleteConfirmDialog = ({ year, onClose, onSuccess }) => {
  const [deleteYear, { isLoading }] = useDeleteAcademicYearMutation()

  const handleDelete = async () => {
    try {
      await deleteYear(year._id).unwrap()
      toast.success('Academic year deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete academic year')
    }
  }

  return (
    <DialogContent className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <DialogTitle>Delete Academic Year</DialogTitle>
        <DialogDescription className="mt-2">
          Are you sure you want to delete <span className="font-bold">"{year.name}"</span>?
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

const AcademicYearsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: yearsData, isLoading, refetch } = useGetAcademicYearsQuery()
  const [updateYear] = useUpdateAcademicYearMutation()
  const years = Array.isArray(yearsData) ? yearsData : yearsData?.data || []

  const filteredYears = useMemo(() => {
    if (!years) return []
    return years.filter((year) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match = (year.name || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter && year.status !== statusFilter) return false
      return true
    })
  }, [years, searchTerm, statusFilter])

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (year) => {
    setEditRecord(year)
    setIsModalOpen(true)
  }

  const handleDelete = (year) => {
    setDeleteRecord(year)
  }

  const handleQuickAction = async (year, newStatus) => {
    try {
      await updateYear({ id: year._id, status: newStatus }).unwrap()
      toast.success(`Academic year marked as ${newStatus}`)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Years</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage school academic sessions and current active year
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Academic Year
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search academic years..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session Name</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredYears.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No academic years found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredYears.map((year) => (
                  <TableRow key={year._id}>
                    <TableCell className="font-medium">{year.name}</TableCell>
                    <TableCell>
                      {year.startDate ? new Date(year.startDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {year.endDate ? new Date(year.endDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[year.status] || STATUS_STYLES.inactive}>
                        {year.status?.toUpperCase() || 'INACTIVE'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {year.status !== 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickAction(year, 'active')}
                          >
                            Activate
                          </Button>
                        )}
                        {year.status !== 'archived' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickAction(year, 'archived')}
                          >
                            Archive
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(year)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(year)}>
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
        <AcademicYearModal
          initial={editRecord}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
        />
      )}

      {deleteRecord && (
        <DeleteConfirmDialog
          year={deleteRecord}
          onClose={() => setDeleteRecord(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  )
}

export default AcademicYearsPage
