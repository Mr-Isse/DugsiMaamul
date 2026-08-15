import React, { useState, useMemo } from 'react'
import { Users, Plus, Search, Edit2, Trash2, RefreshCw, AlertCircle, X, LogOut } from 'lucide-react'
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
  useGetVisitorsQuery,
  useCreateVisitorMutation,
  useUpdateVisitorMutation,
  useDeleteVisitorMutation,
  useCheckoutVisitorMutation,
} from '@/services/api'

const STATUS_STYLES = {
  'checked-in': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  'checked-out': 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
}

const VisitorModal = ({ initial, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: initial?.name || '',
    phone: initial?.phone || '',
    email: initial?.email || '',
    purpose: initial?.purpose || '',
    visitTo: initial?.visitTo || '',
    status: initial?.status || 'checked-in',
    notes: initial?.notes || '',
  })

  const [createVisitor, { isLoading: creating }] = useCreateVisitorMutation()
  const [updateVisitor, { isLoading: updating }] = useUpdateVisitorMutation()

  const isEdit = Boolean(initial)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Visitor name is required')
    if (!form.purpose.trim()) return toast.error('Purpose is required')
    if (!form.visitTo.trim()) return toast.error('Visiting whom is required')
    try {
      if (isEdit) {
        await updateVisitor({ id: initial._id, ...form }).unwrap()
        toast.success('Visitor updated')
      } else {
        await createVisitor(form).unwrap()
        toast.success('Visitor checked in')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save visitor')
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Visitor' : 'Check In Visitor'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update visitor information' : 'Register a new visitor'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Visitor Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full name"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9+\-\s]/g, '')
                setForm({ ...form, phone: value })
              }}
              placeholder="+1234567890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="purpose">Purpose of Visit *</Label>
          <Input
            id="purpose"
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            placeholder="e.g. Meeting with principal"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="visitTo">Visiting Whom *</Label>
          <Input
            id="visitTo"
            value={form.visitTo}
            onChange={(e) => setForm({ ...form, visitTo: e.target.value })}
            placeholder="Principal / Teacher Name"
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
            <option value="checked-in">Checked In</option>
            <option value="checked-out">Checked Out</option>
          </select>
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
            {creating || updating ? 'Saving...' : isEdit ? 'Update Visitor' : 'Check In'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const DeleteConfirmDialog = ({ record, onClose, onSuccess }) => {
  const [deleteVisitor, { isLoading }] = useDeleteVisitorMutation()

  const handleDelete = async () => {
    try {
      await deleteVisitor(record._id).unwrap()
      toast.success('Visitor record deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete visitor')
    }
  }

  return (
    <DialogContent className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <DialogTitle>Delete Visitor Record</DialogTitle>
        <DialogDescription className="mt-2">
          Are you sure you want to delete the visitor record for <span className="font-bold">"{record.name}"</span>?
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

const VisitorPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: visitorsData, isLoading, refetch } = useGetVisitorsQuery()
  const visitors = Array.isArray(visitorsData) ? visitorsData : visitorsData?.data || []

  const [checkoutVisitor, { isLoading: checkingOut }] = useCheckoutVisitorMutation()

  const filteredVisitors = useMemo(() => {
    if (!visitors) return []
    return visitors.filter((visitor) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (visitor.name || '').toLowerCase().includes(q) ||
          (visitor.purpose || '').toLowerCase().includes(q) ||
          (visitor.phone || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter && visitor.status !== statusFilter) return false
      return true
    })
  }, [visitors, searchTerm, statusFilter])

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

  const handleCheckout = async (record) => {
    try {
      await checkoutVisitor(record._id).unwrap()
      toast.success('Visitor checked out successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to check out visitor')
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Visitor Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track visitors and check-ins
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Check In Visitor
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search visitors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-sm"
          >
            <option value="">All Statuses</option>
            <option value="checked-in">Checked In</option>
            <option value="checked-out">Checked Out</option>
          </select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Visiting Whom</TableHead>
              <TableHead>Check In Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                </TableRow>
              ))
            ) : filteredVisitors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No visitors found
                </TableCell>
              </TableRow>
            ) : (
              filteredVisitors.map((record) => (
                <TableRow key={record._id}>
                  <TableCell className="font-medium">{record.name || '—'}</TableCell>
                  <TableCell>{record.phone || '—'}</TableCell>
                  <TableCell>{record.purpose || '—'}</TableCell>
                  <TableCell>{record.visitTo || '—'}</TableCell>
                  <TableCell>{formatDateTime(record.checkInTime)}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_STYLES[record.status] || 'bg-gray-100'}>
                      {record.status === 'checked-in' ? 'Checked In' : 'Checked Out'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {record.status === 'checked-in' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCheckout(record)}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          title="Check Out"
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      )}
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
        <VisitorModal
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

export default VisitorPage
