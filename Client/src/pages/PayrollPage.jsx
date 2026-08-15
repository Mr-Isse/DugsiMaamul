import React, { useState, useMemo } from 'react'
import {
  CreditCard,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
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
  useGetPayrollQuery,
  useCreatePayrollRecordMutation,
  useUpdatePayrollRecordMutation,
  useDeletePayrollRecordMutation,
  useGetTeachersQuery,
} from '@/services/api'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const STATUS_STYLES = {
  Draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount || 0)
}

const PayrollModal = ({ initial, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    userId: initial?.user?._id || initial?.userId || '',
    month: initial?.month || new Date().getMonth() + 1,
    year: initial?.year || new Date().getFullYear(),
    basicSalary: initial?.basicSalary || '',
    paymentMethod: initial?.paymentMethod || 'Bank Transfer',
    bankName: initial?.bankName || '',
    accountNumber: initial?.accountNumber || '',
    remarks: initial?.remarks || '',
    status: initial?.status || 'Draft',
  })

  const { data: teachersData } = useGetTeachersQuery()
  const teachers = Array.isArray(teachersData) ? teachersData : teachersData?.data || []
  const [createPayroll, { isLoading: creating }] = useCreatePayrollRecordMutation()
  const [updatePayroll, { isLoading: updating }] = useUpdatePayrollRecordMutation()

  const isEdit = Boolean(initial)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.userId) return toast.error('Employee is required')
    if (!form.basicSalary || Number(form.basicSalary) < 0)
      return toast.error('Enter a valid basic salary')
    try {
      const payload = {
        ...form,
        basicSalary: Number(form.basicSalary),
      }
      if (isEdit) {
        await updatePayroll({ id: initial._id, ...payload }).unwrap()
        toast.success('Payroll record updated')
      } else {
        await createPayroll(payload).unwrap()
        toast.success('Payroll record created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save payroll')
    }
  }

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Payroll Record' : 'New Payroll Record'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update payroll information' : 'Create a new payroll record'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userId">Employee *</Label>
          <select
            id="userId"
            value={form.userId}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="month">Month *</Label>
            <select
              id="month"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              required
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              type="number"
              min="2020"
              max="2030"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="basicSalary">Basic Salary *</Label>
          <Input
            id="basicSalary"
            type="number"
            min="0"
            step="0.01"
            value={form.basicSalary}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9.]/g, '')
              setForm({ ...form, basicSalary: value })
            }}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <select
            id="paymentMethod"
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
          >
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cash">Cash</option>
            <option value="Cheque">Cheque</option>
            <option value="Mobile Money">Mobile Money</option>
          </select>
        </div>

        {form.paymentMethod === 'Bank Transfer' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={form.bankName}
                onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                placeholder="Bank name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={form.accountNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '')
                  setForm({ ...form, accountNumber: value })
                }}
                placeholder="Account number"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
          >
            <option value="Draft">Draft</option>
            <option value="Approved">Approved</option>
            <option value="Paid">Paid</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Input
            id="remarks"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
            placeholder="Additional notes"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Payroll'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const DeleteConfirmDialog = ({ record, onClose, onSuccess }) => {
  const [deletePayroll, { isLoading }] = useDeletePayrollRecordMutation()

  const handleDelete = async () => {
    try {
      await deletePayroll(record._id).unwrap()
      toast.success('Payroll record deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete payroll')
    }
  }

  return (
    <DialogContent className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <DialogTitle>Delete Payroll Record</DialogTitle>
        <DialogDescription className="mt-2">
          Are you sure you want to delete this payroll record? This action cannot be undone.
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

const PayrollPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: payrollData, isLoading, refetch } = useGetPayrollQuery()
  const { data: teachersData } = useGetTeachersQuery()
  const teachers = Array.isArray(teachersData) ? teachersData : teachersData?.data || []
  const payroll = Array.isArray(payrollData) ? payrollData : payrollData?.data || []

  const filteredPayroll = useMemo(() => {
    if (!payroll) return []
    return payroll.filter((record) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const teacher = teachers.find((t) => t._id === record.userId || t._id === record.user?._id)
        const name = teacher?.name || teacher?.firstName || ''
        const match =
          name.toLowerCase().includes(q) ||
          (record.remarks || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter && record.status !== statusFilter) return false
      return true
    })
  }, [payroll, searchTerm, statusFilter, teachers])

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage staff payroll</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Payroll
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by employee, remarks..."
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
          <option value="Draft">Draft</option>
          <option value="Approved">Approved</option>
          <option value="Paid">Paid</option>
          <option value="Cancelled">Cancelled</option>
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
                <TableHead>Basic Salary</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayroll.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No payroll records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayroll.map((record) => {
                  const teacher = teachers.find((t) => t._id === record.userId || t._id === record.user?._id)
                  return (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">
                        {teacher?.name || teacher?.firstName || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {MONTHS[record.month - 1]} {record.year}
                      </TableCell>
                      <TableCell>{formatCurrency(record.basicSalary)}</TableCell>
                      <TableCell>{record.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_STYLES[record.status] || ''}>{record.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(record)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(record)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
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
      )}

      {isModalOpen && (
        <PayrollModal
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

export default PayrollPage
