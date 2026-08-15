import React, { useState, useMemo } from 'react'
import { Plus, Search, Tag, Edit2, Trash2, RefreshCw, AlertCircle, X, UserPlus, Percent } from 'lucide-react'
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
  useGetDiscountsQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
  useGetStudentsQuery,
  useGetClassesQuery,
  useGetDiscountAssignmentsQuery,
  useAssignDiscountMutation,
  useRemoveDiscountAssignmentMutation,
  useGetDiscountReportsQuery,
} from '@/services/api'

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const TYPE_STYLES = {
  percentage: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  fixed: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

const DiscountModal = ({ initial, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: initial?.name || '',
    type: initial?.type || 'percentage',
    value: initial?.value || '',
    code: initial?.code || '',
    description: initial?.description || '',
    isActive: initial?.isActive !== undefined ? initial.isActive : true,
  })

  const [createDiscount, { isLoading: creating }] = useCreateDiscountMutation()
  const [updateDiscount, { isLoading: updating }] = useUpdateDiscountMutation()

  const isEdit = Boolean(initial)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Discount name is required')
    if (!form.value || Number(form.value) <= 0) return toast.error('Please enter a valid value')
    try {
      const payload = {
        ...form,
        value: Number(form.value),
      }
      if (isEdit) {
        await updateDiscount({ id: initial._id, ...payload }).unwrap()
        toast.success('Discount updated')
      } else {
        await createDiscount(payload).unwrap()
        toast.success('Discount created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save discount')
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Discount' : 'New Discount'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update discount information' : 'Create a new discount'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Early Bird Discount"
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
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Value *</Label>
            <Input
              id="value"
              type="number"
              min="0"
              step="0.01"
              value={form.value}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '')
                setForm({ ...form, value })
              }}
              placeholder={form.type === 'percentage' ? '10' : '100'}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="e.g. EARLYBIRD10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Discount description"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="isActive">Status</Label>
          <select
            id="isActive"
            value={form.isActive ? 'active' : 'inactive'}
            onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Discount'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const DeleteConfirmDialog = ({ discount, onClose, onSuccess }) => {
  const [deleteDiscount, { isLoading }] = useDeleteDiscountMutation()

  const handleDelete = async () => {
    try {
      await deleteDiscount(discount._id).unwrap()
      toast.success('Discount deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete discount')
    }
  }

  return (
    <DialogContent className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <DialogTitle>Delete Discount</DialogTitle>
        <DialogDescription className="mt-2">
          Are you sure you want to delete <span className="font-bold">"{discount.name}"</span>?
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

const AssignDiscountModal = ({ discounts, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    discountId: '',
    scope: 'student',
    studentId: '',
    classId: '',
    duration: 'permanent',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    reason: '',
  })

  const { data: studentsData } = useGetStudentsQuery()
  const { data: classesData } = useGetClassesQuery()
  const students = Array.isArray(studentsData) ? studentsData : studentsData?.data || []
  const classes = Array.isArray(classesData) ? classesData : classesData?.data || []
  const [assignDiscount, { isLoading }] = useAssignDiscountMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.discountId) return toast.error('Please select a discount')
    if (form.scope === 'student' && !form.studentId) return toast.error('Please select a student')
    if (form.scope === 'class' && !form.classId) return toast.error('Please select a class')
    try {
      await assignDiscount({
        ...form,
        endDate: form.duration === 'custom' ? form.endDate : undefined,
      }).unwrap()
      toast.success('Discount assigned')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to assign discount')
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>Assign Discount</DialogTitle>
        <DialogDescription>Assign a discount to students or classes</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="discountId">Discount *</Label>
          <select
            id="discountId"
            value={form.discountId}
            onChange={(e) => setForm({ ...form, discountId: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
            required
          >
            <option value="">Select a discount</option>
            {discounts.filter(d => d.isActive).map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.type === 'percentage' ? `${d.value}%` : `$${d.value}`})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scope">Scope *</Label>
          <select
            id="scope"
            value={form.scope}
            onChange={(e) => setForm({ ...form, scope: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
            required
          >
            <option value="student">Individual Student</option>
            <option value="class">Entire Class</option>
          </select>
        </div>

        {form.scope === 'student' && (
          <div className="space-y-2">
            <Label htmlFor="studentId">Student *</Label>
            <select
              id="studentId"
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              required
            >
              <option value="">Select a student</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {form.scope === 'class' && (
          <div className="space-y-2">
            <Label htmlFor="classId">Class *</Label>
            <select
              id="classId"
              value={form.classId}
              onChange={(e) => setForm({ ...form, classId: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              required
            >
              <option value="">Select a class</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration</Label>
            <select
              id="duration"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            >
              <option value="permanent">Permanent</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
        </div>

        {form.duration === 'custom' && (
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="reason">Reason</Label>
          <Input
            id="reason"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Reason for discount"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Assigning...' : 'Assign Discount'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const DiscountsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: discountsData, isLoading, refetch } = useGetDiscountsQuery()
  const { data: assignmentsData, refetch: refetchAssignments } = useGetDiscountAssignmentsQuery({ active: true })
  const { data: reportsData } = useGetDiscountReportsQuery()

  const discounts = Array.isArray(discountsData) ? discountsData : discountsData?.data || []
  const assignments = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData?.data || []
  const reportSummary = reportsData?.summary || {}

  const filteredDiscounts = useMemo(() => {
    if (!discounts) return []
    return discounts.filter((discount) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (discount.name || '').toLowerCase().includes(q) ||
          (discount.code || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter === 'active' && !discount.isActive) return false
      if (statusFilter === 'inactive' && discount.isActive) return false
      return true
    })
  }, [discounts, searchTerm, statusFilter])

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (discount) => {
    setEditRecord(discount)
    setIsModalOpen(true)
  }

  const handleDelete = (discount) => {
    setDeleteRecord(discount)
  }

  const handleRemoveAssignment = async (id) => {
    try {
      await useRemoveDiscountAssignmentMutation()[0](id).unwrap()
      toast.success('Assignment removed')
      refetchAssignments()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to remove assignment')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discounts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage discounts and offers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setIsAssignModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Discount
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Discount
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Discounts</p>
          <p className="text-2xl font-bold">{discounts.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">Active Discounts</p>
          <p className="text-2xl font-bold">{discounts.filter(d => d.isActive).length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">Active Assignments</p>
          <p className="text-2xl font-bold">{assignments.length}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search discounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredDiscounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No discounts found
                </TableCell>
              </TableRow>
            ) : (
              filteredDiscounts.map((discount) => (
                <TableRow key={discount._id}>
                  <TableCell className="font-medium">{discount.name}</TableCell>
                  <TableCell>
                    <Badge className={TYPE_STYLES[discount.type] || TYPE_STYLES.percentage}>
                      {discount.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value}`}
                  </TableCell>
                  <TableCell>{discount.code || '—'}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_STYLES[discount.isActive ? 'active' : 'inactive']}>
                      {discount.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(discount)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(discount)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
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
        <DiscountModal
          initial={editRecord}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
        />
      )}

      {deleteRecord && (
        <DeleteConfirmDialog
          discount={deleteRecord}
          onClose={() => setDeleteRecord(null)}
          onSuccess={() => refetch()}
        />
      )}

      {isAssignModalOpen && (
        <AssignDiscountModal
          discounts={discounts}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={() => {
            refetch()
            refetchAssignments()
          }}
        />
      )}
    </div>
  )
}

export default DiscountsPage
