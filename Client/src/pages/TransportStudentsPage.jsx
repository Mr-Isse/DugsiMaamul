import React, { useState, useMemo } from 'react'
import { Bus, Plus, Search, Edit2, Trash2, RefreshCw, AlertCircle, X, MapPin, CheckCircle } from 'lucide-react'
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
  useGetTransportAllocationsQuery,
  useCreateTransportAllocationMutation,
  useUpdateTransportAllocationMutation,
  useDeleteTransportAllocationMutation,
  useGetRoutesQuery,
  useGetStudentsQuery,
} from '@/services/api'

const STATUS_STYLES = {
  Active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
}

const AllocationModal = ({ initial, onClose, onSuccess, routes, students }) => {
  const [form, setForm] = useState({
    student: initial?.student?._id || initial?.student || '',
    route: initial?.route?._id || initial?.route || '',
    pickupPoint: initial?.pickupPoint || '',
    dropPoint: initial?.dropPoint || '',
    transportFee: initial?.transportFee || '',
    status: initial?.status || 'Active',
  })

  const [createAllocation, { isLoading: creating }] = useCreateTransportAllocationMutation()
  const [updateAllocation, { isLoading: updating }] = useUpdateTransportAllocationMutation()

  const isEdit = Boolean(initial)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.student) return toast.error('Student is required')
    if (!form.route) return toast.error('Route is required')
    try {
      const payload = { ...form, transportFee: form.transportFee ? Number(form.transportFee) : undefined }
      if (isEdit) {
        await updateAllocation({ id: initial._id, ...payload }).unwrap()
        toast.success('Allocation updated')
      } else {
        await createAllocation(payload).unwrap()
        toast.success('Allocation created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save allocation')
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Allocation' : 'New Allocation'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update transport allocation details' : 'Assign a student to a transport route'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="student">Student *</Label>
          <select
            id="student"
            value={form.student}
            onChange={(e) => setForm({ ...form, student: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
            required
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name || `${s.firstName} ${s.lastName || ''}`}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="route">Route *</Label>
          <select
            id="route"
            value={form.route}
            onChange={(e) => setForm({ ...form, route: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
            required
          >
            <option value="">Select route</option>
            {routes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name || r.routeName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pickupPoint">Pickup Point</Label>
            <Input
              id="pickupPoint"
              value={form.pickupPoint}
              onChange={(e) => setForm({ ...form, pickupPoint: e.target.value })}
              placeholder="e.g. Main Gate"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dropPoint">Drop Point</Label>
            <Input
              id="dropPoint"
              value={form.dropPoint}
              onChange={(e) => setForm({ ...form, dropPoint: e.target.value })}
              placeholder="e.g. School Gate"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="transportFee">Transport Fee</Label>
            <Input
              id="transportFee"
              type="number"
              min="0"
              step="0.01"
              value={form.transportFee}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '')
                setForm({ ...form, transportFee: value })
              }}
              placeholder="0.00"
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Allocation'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const DeleteConfirmDialog = ({ allocation, onClose, onSuccess }) => {
  const [deleteAllocation, { isLoading }] = useDeleteTransportAllocationMutation()

  const handleDelete = async () => {
    try {
      await deleteAllocation(allocation._id).unwrap()
      toast.success('Allocation deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete allocation')
    }
  }

  return (
    <DialogContent className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <DialogTitle>Delete Allocation</DialogTitle>
        <DialogDescription className="mt-2">
          Are you sure you want to delete this transport allocation?
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

const TransportStudentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: allocationsData, isLoading, refetch } = useGetTransportAllocationsQuery()
  const { data: routesData } = useGetRoutesQuery()
  const { data: studentsData } = useGetStudentsQuery()

  const allocations = Array.isArray(allocationsData) ? allocationsData : allocationsData?.data || []
  const routes = Array.isArray(routesData) ? routesData : routesData?.data || []
  const students = Array.isArray(studentsData) ? studentsData : studentsData?.data || []

  const filteredAllocations = useMemo(() => {
    if (!allocations) return []
    return allocations.filter((alloc) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (alloc.student?.name || alloc.student?.firstName || '').toLowerCase().includes(q) ||
          (alloc.route?.name || alloc.route?.routeName || '').toLowerCase().includes(q) ||
          (alloc.pickupPoint || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter && alloc.status !== statusFilter) return false
      return true
    })
  }, [allocations, searchTerm, statusFilter])

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (allocation) => {
    setEditRecord(allocation)
    setIsModalOpen(true)
  }

  const handleDelete = (allocation) => {
    setDeleteRecord(allocation)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transport Students</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage student transport allocations
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Allocation
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by student, route..."
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
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Pickup Point</TableHead>
                <TableHead>Drop Point</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAllocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No allocations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAllocations.map((alloc) => (
                  <TableRow key={alloc._id}>
                    <TableCell className="font-medium">
                      {alloc.student?.name || `${alloc.student?.firstName || ''} ${alloc.student?.lastName || ''}`}
                    </TableCell>
                    <TableCell>{alloc.route?.name || alloc.route?.routeName || '-'}</TableCell>
                    <TableCell>{alloc.pickupPoint || '-'}</TableCell>
                    <TableCell>{alloc.dropPoint || '-'}</TableCell>
                    <TableCell>${alloc.transportFee?.toFixed(2) || '0.00'}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[alloc.status] || STATUS_STYLES.Active}>
                        {alloc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(alloc)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(alloc)}
                        >
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
        <AllocationModal
          initial={editRecord}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
          routes={routes}
          students={students}
        />
      )}

      {deleteRecord && (
        <DeleteConfirmDialog
          allocation={deleteRecord}
          onClose={() => setDeleteRecord(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  )
}

export default TransportStudentsPage
