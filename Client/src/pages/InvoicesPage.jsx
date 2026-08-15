import React, { useState, useMemo } from 'react'
import { Plus, Search, Download, Receipt, Edit2, Trash2, RefreshCw, AlertCircle, X, MoreVertical } from 'lucide-react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import {
  useGetInvoicesQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useGetStudentsQuery,
} from '@/services/api'

const STATUS_STYLES = {
  paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
}

const generateInvoiceNumber = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `INV-${year}${month}-${random}`
}

const InvoiceModal = ({ initial, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    invoiceNumber: initial?.invoiceNumber || generateInvoiceNumber(),
    studentId: initial?.student?._id || initial?.studentId || '',
    studentName: initial?.student?.name || initial?.studentName || '',
    amount: initial?.amount || '',
    dueDate: initial?.dueDate ? new Date(initial.dueDate).toISOString().split('T')[0] : '',
    status: initial?.status || 'pending',
    description: initial?.description || '',
  })

  const { data: studentsData } = useGetStudentsQuery()
  const students = Array.isArray(studentsData) ? studentsData : studentsData?.data || []
  const [createInvoice, { isLoading: creating }] = useCreateInvoiceMutation()
  const [updateInvoice, { isLoading: updating }] = useUpdateInvoiceMutation()

  const isEdit = Boolean(initial)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.studentId.trim()) return toast.error('Student is required')
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Please enter a valid amount')
    if (!form.dueDate) return toast.error('Due date is required')
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        student: form.studentId,
      }
      if (isEdit) {
        await updateInvoice({ id: initial._id, ...payload }).unwrap()
        toast.success('Invoice updated')
      } else {
        await createInvoice(payload).unwrap()
        toast.success('Invoice created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save invoice')
    }
  }

  const handleStudentChange = (studentId) => {
    const student = students.find(s => s._id === studentId)
    setForm({
      ...form,
      studentId,
      studentName: student?.name || '',
    })
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Invoice' : 'New Invoice'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update invoice information' : 'Create a new invoice'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input
            id="invoiceNumber"
            value={form.invoiceNumber}
            onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
            placeholder="INV-202601-0001"
            disabled={isEdit}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="student">Student *</Label>
          <select
            id="student"
            value={form.studentId}
            onChange={(e) => handleStudentChange(e.target.value)}
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

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Invoice description"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Invoice'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const DeleteConfirmDialog = ({ invoice, onClose, onSuccess }) => {
  const [deleteInvoice, { isLoading }] = useDeleteInvoiceMutation()

  const handleDelete = async () => {
    try {
      await deleteInvoice(invoice._id).unwrap()
      toast.success('Invoice deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete invoice')
    }
  }

  return (
    <DialogContent className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogDescription className="mt-2">
          Are you sure you want to delete invoice <span className="font-bold">"{invoice.invoiceNumber}"</span>?
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

const InvoicesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: invoicesData, isLoading, refetch } = useGetInvoicesQuery()
  const invoices = Array.isArray(invoicesData) ? invoicesData : invoicesData?.data || []

  const filteredInvoices = useMemo(() => {
    if (!invoices) return []
    return invoices.filter((invoice) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (invoice.invoiceNumber || '').toLowerCase().includes(q) ||
          (invoice.student?.name || invoice.studentName || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter && invoice.status !== statusFilter) return false
      return true
    })
  }, [invoices, searchTerm, statusFilter])

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (invoice) => {
    setEditRecord(invoice)
    setIsModalOpen(true)
  }

  const handleDelete = (invoice) => {
    setDeleteRecord(invoice)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage student invoices and payments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search invoices..."
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
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{invoice.invoiceNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>{invoice.student?.name || invoice.studentName}</TableCell>
                  <TableCell>${Number(invoice.amount || 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_STYLES[invoice.status] || STATUS_STYLES.pending}>
                      {invoice.status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(invoice)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <InvoiceModal
          initial={editRecord}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
        />
      )}

      {deleteRecord && (
        <DeleteConfirmDialog
          invoice={deleteRecord}
          onClose={() => setDeleteRecord(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  )
}

export default InvoicesPage
