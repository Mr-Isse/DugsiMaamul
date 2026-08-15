import React, { useState, useMemo } from 'react'
import { Bed, Plus, Search, Edit2, Trash2, RefreshCw, AlertCircle, X } from 'lucide-react'
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
  useGetBedAllocationsQuery,
  useCreateBedAllocationMutation,
  useUpdateBedAllocationMutation,
  useDeleteBedAllocationMutation,
  useGetHostelsQuery,
  useGetRoomsQuery,
  useGetStudentsQuery,
} from '@/services/api'

const STATUSES = ['Active', 'Inactive', 'Reserved']

const STATUS_STYLES = {
  Active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  Reserved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
}

const AllocationModal = ({ initial, onClose, onSuccess, hostels, rooms, students }) => {
  const [selectedHostel, setSelectedHostel] = useState(initial?.hostel?._id || initial?.hostel || '')
  const [form, setForm] = useState({
    student: initial?.student?._id || initial?.student || '',
    room: initial?.room?._id || initial?.room || '',
    bed: initial?.bed || '',
    status: initial?.status || 'Active',
  })

  const [createBedAllocation, { isLoading: creating }] = useCreateBedAllocationMutation()
  const [updateBedAllocation, { isLoading: updating }] = useUpdateBedAllocationMutation()

  const isEdit = Boolean(initial)

  const filteredRooms = useMemo(() => {
    if (!selectedHostel) return []
    return rooms.filter((r) => {
      const hostelId = r.hostel?._id || r.hostel
      return hostelId === selectedHostel
    })
  }, [selectedHostel, rooms])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.student) return toast.error('Student is required')
    if (!selectedHostel) return toast.error('Hostel is required')
    if (!form.room) return toast.error('Room is required')
    try {
      const payload = { ...form, hostelId: selectedHostel }
      if (isEdit) {
        await updateBedAllocation({ id: initial._id, ...payload }).unwrap()
        toast.success('Bed allocation updated')
      } else {
        await createBedAllocation(payload).unwrap()
        toast.success('Bed allocation created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save bed allocation')
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Bed Allocation' : 'New Bed Allocation'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update bed allocation details' : 'Assign a student to a bed'}
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
          <Label htmlFor="hostel">Hostel *</Label>
          <select
            id="hostel"
            value={selectedHostel}
            onChange={(e) => {
              setSelectedHostel(e.target.value)
              setForm({ ...form, room: '' })
            }}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
            required
          >
            <option value="">Select hostel</option>
            {hostels.map((h) => (
              <option key={h._id} value={h._id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="room">Room *</Label>
            <select
              id="room"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              required
            >
              <option value="">Select room</option>
              {filteredRooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.roomNumber || r.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bed">Bed Number</Label>
            <Input
              id="bed"
              value={form.bed}
              onChange={(e) => setForm({ ...form, bed: e.target.value })}
              placeholder="e.g. B1"
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
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
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
  const [deleteBedAllocation, { isLoading }] = useDeleteBedAllocationMutation()

  const handleDelete = async () => {
    try {
      await deleteBedAllocation(allocation._id).unwrap()
      toast.success('Bed allocation deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete bed allocation')
    }
  }

  return (
    <DialogContent className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <DialogTitle>Delete Bed Allocation</DialogTitle>
        <DialogDescription className="mt-2">
          Are you sure you want to delete this bed allocation?
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

const BedAllocationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: allocationsData, isLoading, refetch } = useGetBedAllocationsQuery()
  const { data: hostelsData } = useGetHostelsQuery()
  const { data: roomsData } = useGetRoomsQuery()
  const { data: studentsData } = useGetStudentsQuery()

  const allocations = Array.isArray(allocationsData) ? allocationsData : allocationsData?.data || []
  const hostels = Array.isArray(hostelsData) ? hostelsData : hostelsData?.data || []
  const rooms = Array.isArray(roomsData) ? roomsData : roomsData?.data || []
  const students = Array.isArray(studentsData) ? studentsData : studentsData?.data || []

  const filteredAllocations = useMemo(() => {
    if (!allocations) return []
    return allocations.filter((alloc) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (alloc.student?.name || alloc.student?.firstName || '').toLowerCase().includes(q) ||
          (alloc.hostel?.name || '').toLowerCase().includes(q) ||
          (alloc.room?.roomNumber || alloc.room?.name || '').toLowerCase().includes(q)
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bed Allocations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage student bed assignments in hostels
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
            placeholder="Search by student, hostel, room..."
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
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
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
                <TableHead>Hostel</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Bed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAllocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No bed allocations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAllocations.map((alloc) => (
                  <TableRow key={alloc._id}>
                    <TableCell className="font-medium">
                      {alloc.student?.name || `${alloc.student?.firstName || ''} ${alloc.student?.lastName || ''}`}
                    </TableCell>
                    <TableCell>{alloc.hostel?.name || '-'}</TableCell>
                    <TableCell>{alloc.room?.roomNumber || alloc.room?.name || '-'}</TableCell>
                    <TableCell>{alloc.bed || '-'}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[alloc.status] || STATUS_STYLES.Active}>
                        {alloc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(alloc)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(alloc)}>
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
          hostels={hostels}
          rooms={rooms}
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

export default BedAllocationsPage
