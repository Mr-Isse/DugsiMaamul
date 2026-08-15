import React, { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2, CalendarClock, RefreshCw, AlertCircle, X } from 'lucide-react'
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
  useGetAcademicTermsQuery,
  useCreateAcademicTermMutation,
  useUpdateAcademicTermMutation,
  useDeleteAcademicTermMutation,
  useActivateAcademicTermMutation,
  useArchiveAcademicTermMutation,
  useGetAcademicYearsQuery,
} from '@/services/api'

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  upcoming: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  archived: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
}

const AcademicTermModal = ({ initial, onClose, onSuccess, academicYears }) => {
  const [form, setForm] = useState({
    name: initial?.name || '',
    code: initial?.code || '',
    academicYear: initial?.academicYear?._id || initial?.academicYear || '',
    startDate: initial?.startDate ? initial.startDate.split('T')[0] : '',
    endDate: initial?.endDate ? initial.endDate.split('T')[0] : '',
    order: initial?.order || 1,
    status: initial?.status || 'upcoming',
  })

  const [formErrors, setFormErrors] = useState({})

  const [createTerm, { isLoading: creating }] = useCreateAcademicTermMutation()
  const [updateTerm, { isLoading: updating }] = useUpdateAcademicTermMutation()

  const isEdit = Boolean(initial)

  const validateForm = () => {
    const errors = {}
    const name = form.name.trim()
    const code = form.code.trim()
    const start = form.startDate ? new Date(form.startDate) : null
    const end = form.endDate ? new Date(form.endDate) : null
    const selectedAcademicYear = academicYears.find((year) => year._id === form.academicYear)

    if (name.length < 2) errors.name = 'Enter a term name with at least 2 characters.'
    if (code.length > 20) errors.code = 'Term code cannot exceed 20 characters.'
    if (!form.academicYear) errors.academicYear = 'Select an academic year.'
    if (!form.startDate) errors.startDate = 'Select a start date.'
    if (!form.endDate) errors.endDate = 'Select an end date.'
    if (start && end && end < start) errors.endDate = 'End date must be on or after start date.'
    if (selectedAcademicYear && start && end) {
      const yearStart = new Date(selectedAcademicYear.startDate)
      const yearEnd = new Date(selectedAcademicYear.endDate)
      if (start < yearStart || end > yearEnd) {
        errors.endDate = 'Term dates must stay inside the selected academic year.'
      }
    }
    if (!Number.isInteger(Number(form.order)) || Number(form.order) < 1) {
      errors.order = 'Order must be a whole number greater than 0.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const payload = {
      ...form,
      name: form.name.trim(),
      code: form.code.trim(),
      order: Number(form.order),
    }

    try {
      if (isEdit) {
        await updateTerm({ id: initial._id, ...payload }).unwrap()
        toast.success('Academic term updated')
      } else {
        await createTerm(payload).unwrap()
        toast.success('Academic term created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save academic term')
    }
  }

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Academic Term' : 'New Academic Term'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update academic term information' : 'Create a new academic term'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Term Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g. First Semester"
            required
          />
          {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Term Code</Label>
          <Input
            id="code"
            value={form.code}
            onChange={(e) => updateField('code', e.target.value.toUpperCase())}
            placeholder="e.g. SEM1"
          />
          {formErrors.code && <p className="text-sm text-red-500">{formErrors.code}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="academicYear">Academic Year *</Label>
          <select
            id="academicYear"
            value={form.academicYear}
            onChange={(e) => updateField('academicYear', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
            required
          >
            <option value="">Select an academic year</option>
            {academicYears.map((year) => (
              <option key={year._id} value={year._id}>
                {year.name}
              </option>
            ))}
          </select>
          {formErrors.academicYear && <p className="text-sm text-red-500">{formErrors.academicYear}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={form.startDate}
              onChange={(e) => updateField('startDate', e.target.value)}
              required
            />
            {formErrors.startDate && <p className="text-sm text-red-500">{formErrors.startDate}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date *</Label>
            <Input
              id="endDate"
              type="date"
              value={form.endDate}
              onChange={(e) => updateField('endDate', e.target.value)}
              required
            />
            {formErrors.endDate && <p className="text-sm text-red-500">{formErrors.endDate}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Order *</Label>
          <Input
            id="order"
            type="number"
            min="1"
            step="1"
            value={form.order}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '')
              updateField('order', value)
            }}
            placeholder="e.g. 1"
            required
          />
          {formErrors.order && <p className="text-sm text-red-500">{formErrors.order}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => updateField('status', e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
          >
            <option value="upcoming">Upcoming</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Academic Term'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const DeleteConfirmDialog = ({ term, onClose, onSuccess }) => {
  const [deleteTerm, { isLoading }] = useDeleteAcademicTermMutation()

  const handleDelete = async () => {
    try {
      await deleteTerm(term._id).unwrap()
      toast.success('Academic term deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete academic term')
    }
  }

  return (
    <DialogContent className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <DialogTitle>Delete Academic Term</DialogTitle>
        <DialogDescription className="mt-2">
          Are you sure you want to delete <span className="font-bold">"{term.name}"</span>?
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

const AcademicTermsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: yearsData } = useGetAcademicYearsQuery()
  const { data: termsData, isLoading, refetch } = useGetAcademicTermsQuery(
    selectedYear ? { academicYearId: selectedYear } : undefined
  )

  const academicYears = Array.isArray(yearsData) ? yearsData : yearsData?.data || []
  const terms = Array.isArray(termsData) ? termsData : termsData?.data || []

  const filteredTerms = useMemo(() => {
    if (!terms) return []
    return terms.filter((term) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (term.name || '').toLowerCase().includes(q) ||
          (term.code || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter && term.status !== statusFilter) return false
      return true
    })
  }, [terms, searchTerm, statusFilter])

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (term) => {
    setEditRecord(term)
    setIsModalOpen(true)
  }

  const handleDelete = (term) => {
    setDeleteRecord(term)
  }

  const handleQuickAction = async (term, action) => {
    try {
      if (action === 'activate') {
        await useActivateAcademicTermMutation(term._id).unwrap()
        toast.success('Academic term activated')
      } else if (action === 'archive') {
        await useArchiveAcademicTermMutation(term._id).unwrap()
        toast.success('Academic term archived')
      }
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Terms</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage academic terms (semesters, quarters, etc.) for each academic year
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Academic Term
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search academic terms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="">All Academic Years</option>
          {academicYears.map((year) => (
            <option key={year._id} value={year._id}>
              {year.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
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
                <TableHead>Term Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTerms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <CalendarClock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No academic terms found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTerms.map((term) => (
                  <TableRow key={term._id}>
                    <TableCell className="font-medium">{term.name}</TableCell>
                    <TableCell>{term.code || 'N/A'}</TableCell>
                    <TableCell>
                      {term.academicYear?.name || term.academicYear || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{term.startDate ? new Date(term.startDate).toLocaleDateString() : 'N/A'}</div>
                        <div className="text-gray-500">
                          {term.endDate ? new Date(term.endDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{term.order}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[term.status] || STATUS_STYLES.upcoming}>
                        {term.status?.toUpperCase() || 'UPCOMING'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {term.status !== 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickAction(term, 'activate')}
                          >
                            Activate
                          </Button>
                        )}
                        {term.status !== 'archived' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickAction(term, 'archive')}
                          >
                            Archive
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(term)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(term)}>
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
        <AcademicTermModal
          initial={editRecord}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
          academicYears={academicYears}
        />
      )}

      {deleteRecord && (
        <DeleteConfirmDialog
          term={deleteRecord}
          onClose={() => setDeleteRecord(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  )
}

export default AcademicTermsPage
