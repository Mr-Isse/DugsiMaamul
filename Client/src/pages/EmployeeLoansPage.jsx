import React, { useState, useMemo } from 'react'
import {
  HandCoins,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
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
  useGetLoansQuery,
  useCreateLoanMutation,
  useUpdateLoanMutation,
  useDeleteLoanMutation,
  useApproveLoanMutation,
  useRejectLoanMutation,
  useGetTeachersQuery,
} from '@/services/api'

const LOAN_TYPES = ['Personal', 'Emergency', 'Salary Advance', 'Education', 'Housing', 'Other']
const REPAYMENT_METHODS = ['Monthly Deduction', 'Lump Sum', 'Installments']

const STATUS_STYLES = {
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Disbursed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Closed: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
}

const TYPE_STYLES = {
  Personal: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  Emergency: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Salary Advance': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Education: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Housing: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Other: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(amount || 0)
}

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const LoanModal = ({ initial, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    employeeName: initial?.employeeName || '',
    employeeId: initial?.employeeId || '',
    type: initial?.type || 'Personal',
    amount: initial?.amount || '',
    outstandingBalance: initial?.outstandingBalance || '',
    interestRate: initial?.interestRate || '',
    term: initial?.term || '',
    repaymentMethod: initial?.repaymentMethod || 'Monthly Deduction',
    reason: initial?.reason || '',
    startDate: initial?.startDate
      ? new Date(initial.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  })

  const { data: teachersData } = useGetTeachersQuery()
  const teachers = Array.isArray(teachersData) ? teachersData : teachersData?.data || []
  const [createLoan, { isLoading: creating }] = useCreateLoanMutation()
  const [updateLoan, { isLoading: updating }] = useUpdateLoanMutation()

  const isEdit = Boolean(initial)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.employeeName.trim()) return toast.error('Employee name is required')
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Enter a valid amount')
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        outstandingBalance: Number(form.outstandingBalance) || Number(form.amount),
        interestRate: Number(form.interestRate) || 0,
        term: Number(form.term) || 12,
      }
      if (isEdit) {
        await updateLoan({ id: initial._id, ...payload }).unwrap()
        toast.success('Loan updated')
      } else {
        await createLoan(payload).unwrap()
        toast.success('Loan created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save loan')
    }
  }

  return (
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Loan' : 'New Loan'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update loan information' : 'Create a new loan'}
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

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Loan Type *</Label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            >
              {LOAN_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '')
                setForm({ ...form, amount: value })
              }}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate %</Label>
            <Input
              id="interestRate"
              type="number"
              min="0"
              step="0.1"
              value={form.interestRate}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '')
                setForm({ ...form, interestRate: value })
              }}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="term">Term (months)</Label>
            <Input
              id="term"
              type="number"
              min="1"
              value={form.term}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '')
                setForm({ ...form, term: value })
              }}
              placeholder="12"
            />
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

        <div className="space-y-2">
          <Label htmlFor="repaymentMethod">Repayment Method</Label>
          <select
            id="repaymentMethod"
            value={form.repaymentMethod}
            onChange={(e) => setForm({ ...form, repaymentMethod: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
          >
            {REPAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason</Label>
          <Input
            id="reason"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Reason for loan"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Loan'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const DeleteConfirmDialog = ({ record, onClose, onSuccess }) => {
  const [deleteLoan, { isLoading }] = useDeleteLoanMutation()

  const handleDelete = async () => {
    try {
      await deleteLoan(record._id).unwrap()
      toast.success('Loan deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete loan')
    }
  }

  return (
    <DialogContent className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <DialogTitle>Delete Loan</DialogTitle>
        <DialogDescription className="mt-2">
          Are you sure you want to delete this loan? This action cannot be undone.
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

const EmployeeLoansPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: loansData, isLoading, refetch } = useGetLoansQuery()
  const loans = Array.isArray(loansData) ? loansData : loansData?.data || []

  const filteredLoans = useMemo(() => {
    if (!loans) return []
    return loans.filter((loan) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (loan.employeeName || '').toLowerCase().includes(q) ||
          (loan.employeeId || '').toLowerCase().includes(q) ||
          (loan.reason || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter && loan.status !== statusFilter) return false
      return true
    })
  }, [loans, searchTerm, statusFilter])

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (loan) => {
    setEditRecord(loan)
    setIsModalOpen(true)
  }

  const handleDelete = (loan) => {
    setDeleteRecord(loan)
  }

  const handleApprove = async (loan) => {
    try {
      await useApproveLoanMutation()(loan._id).unwrap()
      toast.success('Loan approved')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to approve loan')
    }
  }

  const handleReject = async (loan) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return
    try {
      await useRejectLoanMutation()({ id: loan._id, reason }).unwrap()
      toast.success('Loan rejected')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to reject loan')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Loans</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage employee loans</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Loan
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by employee, reason..."
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
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Disbursed">Disbursed</option>
          <option value="Closed">Closed</option>
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
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No loans found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLoans.map((loan) => (
                  <TableRow key={loan._id}>
                    <TableCell className="font-medium">{loan.employeeName}</TableCell>
                    <TableCell>
                      <Badge className={TYPE_STYLES[loan.type] || ''}>{loan.type}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(loan.amount)}</TableCell>
                    <TableCell>{formatCurrency(loan.outstandingBalance)}</TableCell>
                    <TableCell>{formatDate(loan.startDate)}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[loan.status] || ''}>{loan.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {loan.status === 'Pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(loan)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReject(loan)}
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(loan)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(loan)}>
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
        <LoanModal
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

export default EmployeeLoansPage
