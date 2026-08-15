import React, { useState, useMemo } from 'react'
import { GraduationCap, Plus, Search, Edit2, Trash2, RefreshCw, AlertCircle, X } from 'lucide-react'
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
  useGetAlumniQuery,
  useCreateAlumniRecordMutation,
  useUpdateAlumniRecordMutation,
  useDeleteAlumniRecordMutation,
} from '@/services/api'

const AlumniModal = ({ initial, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: initial?.name || '',
    graduationYear: initial?.graduationYear || new Date().getFullYear().toString(),
    profession: initial?.profession || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    location: initial?.location || '',
    notes: initial?.notes || '',
  })

  const [createAlumni, { isLoading: creating }] = useCreateAlumniRecordMutation()
  const [updateAlumni, { isLoading: updating }] = useUpdateAlumniRecordMutation()

  const isEdit = Boolean(initial)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required')
    if (!form.graduationYear) return toast.error('Graduation year is required')
    try {
      const payload = {
        ...form,
        graduationYear: Number(form.graduationYear),
      }
      if (isEdit) {
        await updateAlumni({ id: initial._id, ...payload }).unwrap()
        toast.success('Alumni record updated')
      } else {
        await createAlumni(payload).unwrap()
        toast.success('Alumni record created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save alumni record')
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Alumni Record' : 'New Alumni Record'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update alumni information' : 'Create a new alumni record'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="graduationYear">Graduation Year *</Label>
          <Input
            id="graduationYear"
            type="number"
            value={form.graduationYear}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '')
              setForm({ ...form, graduationYear: value })
            }}
            placeholder="e.g. 2023"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profession">Profession</Label>
          <Input
            id="profession"
            value={form.profession}
            onChange={(e) => setForm({ ...form, profession: e.target.value })}
            placeholder="e.g. Software Engineer"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g. New York, USA"
          />
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
  const [deleteAlumni, { isLoading }] = useDeleteAlumniRecordMutation()

  const handleDelete = async () => {
    try {
      await deleteAlumni(record._id).unwrap()
      toast.success('Alumni record deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete alumni record')
    }
  }

  return (
    <DialogContent className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <DialogTitle>Delete Alumni Record</DialogTitle>
        <DialogDescription className="mt-2">
          Are you sure you want to delete <span className="font-bold">"{record.name}"</span>?
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

const AlumniPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: alumniData, isLoading, refetch } = useGetAlumniQuery()
  const alumni = Array.isArray(alumniData) ? alumniData : alumniData?.data || []

  const filteredAlumni = useMemo(() => {
    if (!alumni) return []
    return alumni.filter((a) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (a.name || '').toLowerCase().includes(q) ||
          (a.email || '').toLowerCase().includes(q) ||
          (a.profession || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (yearFilter && a.graduationYear !== Number(yearFilter)) return false
      return true
    })
  }, [alumni, searchTerm, yearFilter])

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

  const currentYear = new Date().getFullYear()
  const yearOptions = [...Array(20)].map((_, i) => currentYear - i)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alumni</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage school alumni records
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Alumni
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, or profession..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-sm"
          >
            <option value="">All Years</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Graduation Year</TableHead>
              <TableHead>Profession</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                </TableRow>
              ))
            ) : filteredAlumni.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No alumni records found
                </TableCell>
              </TableRow>
            ) : (
              filteredAlumni.map((record) => (
                <TableRow key={record._id}>
                  <TableCell className="font-medium">{record.name || '—'}</TableCell>
                  <TableCell>{record.graduationYear || '—'}</TableCell>
                  <TableCell>{record.profession || '—'}</TableCell>
                  <TableCell>{record.email || '—'}</TableCell>
                  <TableCell>{record.phone || '—'}</TableCell>
                  <TableCell>{record.location || '—'}</TableCell>
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
        <AlumniModal
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

export default AlumniPage
