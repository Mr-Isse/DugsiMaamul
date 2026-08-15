import React, { useState, useMemo } from 'react'
import { Heart, Plus, Search, Edit2, Trash2, RefreshCw, AlertCircle, X, PlusCircle, MinusCircle } from 'lucide-react'
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
  useGetHealthRecordsQuery,
  useCreateHealthRecordMutation,
  useUpdateHealthRecordMutation,
  useDeleteHealthRecordMutation,
} from '@/services/api'

const HealthRecordModal = ({ initial, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    student: initial?.student?.name || initial?.student || '',
    bloodGroup: initial?.bloodGroup || 'Unknown',
    allergies: (initial?.allergies || []).join(', '),
    medications: (initial?.medications || []).join(', '),
    medicalConditions: (initial?.medicalConditions || []).join(', '),
    emergencyContacts: initial?.emergencyContacts?.length > 0
      ? initial.emergencyContacts.map(c => ({ name: c.name || '', relationship: c.relationship || '', phone: c.phone || '', email: c.email || '' }))
      : [{ name: '', relationship: '', phone: '', email: '' }],
    lastCheckupDate: initial?.lastCheckupDate ? new Date(initial.lastCheckupDate).toISOString().split('T')[0] : '',
    notes: initial?.notes || '',
    isConfidential: initial?.isConfidential ?? true,
  })

  const [createHealthRecord, { isLoading: creating }] = useCreateHealthRecordMutation()
  const [updateHealthRecord, { isLoading: updating }] = useUpdateHealthRecordMutation()

  const isEdit = Boolean(initial)

  const addContact = () => {
    setForm({ ...form, emergencyContacts: [...form.emergencyContacts, { name: '', relationship: '', phone: '', email: '' }] })
  }

  const removeContact = (idx) => {
    setForm({ ...form, emergencyContacts: form.emergencyContacts.filter((_, i) => i !== idx) })
  }

  const updateContact = (idx, field, value) => {
    const updated = [...form.emergencyContacts]
    updated[idx] = { ...updated[idx], [field]: value }
    setForm({ ...form, emergencyContacts: updated })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.student.trim()) return toast.error('Student name is required')
    try {
      const payload = {
        student: form.student,
        bloodGroup: form.bloodGroup,
        allergies: form.allergies ? form.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        medications: form.medications ? form.medications.split(',').map(s => s.trim()).filter(Boolean) : [],
        medicalConditions: form.medicalConditions ? form.medicalConditions.split(',').map(s => s.trim()).filter(Boolean) : [],
        emergencyContacts: form.emergencyContacts.filter(c => c.name.trim()),
        lastCheckupDate: form.lastCheckupDate || undefined,
        notes: form.notes,
        isConfidential: form.isConfidential,
      }
      if (isEdit) {
        await updateHealthRecord({ id: initial._id, ...payload }).unwrap()
        toast.success('Health record updated')
      } else {
        await createHealthRecord(payload).unwrap()
        toast.success('Health record created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save health record')
    }
  }

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Health Record' : 'New Health Record'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update health record information' : 'Create a new health record'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="student">Student Name / ID *</Label>
          <Input
            id="student"
            value={form.student}
            onChange={(e) => setForm({ ...form, student: e.target.value })}
            placeholder="Enter student name or ID"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bloodGroup">Blood Group</Label>
            <select
              id="bloodGroup"
              value={form.bloodGroup}
              onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            >
              <option value="Unknown">Unknown</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastCheckupDate">Last Checkup Date</Label>
            <Input
              id="lastCheckupDate"
              type="date"
              value={form.lastCheckupDate}
              onChange={(e) => setForm({ ...form, lastCheckupDate: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies (comma-separated)</Label>
          <Input
            id="allergies"
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
            placeholder="e.g. Peanuts, Dust, Pollen"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="medications">Current Medications (comma-separated)</Label>
          <Input
            id="medications"
            value={form.medications}
            onChange={(e) => setForm({ ...form, medications: e.target.value })}
            placeholder="e.g. Insulin, Aspirin"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicalConditions">Medical Conditions (comma-separated)</Label>
          <Input
            id="medicalConditions"
            value={form.medicalConditions}
            onChange={(e) => setForm({ ...form, medicalConditions: e.target.value })}
            placeholder="e.g. Asthma, Diabetes"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Emergency Contacts</Label>
            <Button type="button" variant="outline" size="sm" onClick={addContact} className="gap-1">
              <PlusCircle className="h-4 w-4" />
              Add Contact
            </Button>
          </div>
          {form.emergencyContacts.map((contact, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Name *</Label>
                <Input
                  value={contact.name}
                  onChange={(e) => updateContact(idx, 'name', e.target.value)}
                  placeholder="Contact name"
                  required={idx === 0}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Relationship</Label>
                <Input
                  value={contact.relationship}
                  onChange={(e) => updateContact(idx, 'relationship', e.target.value)}
                  placeholder="e.g. Parent"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Phone</Label>
                <Input
                  value={contact.phone}
                  onChange={(e) => updateContact(idx, 'phone', e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">Email</Label>
                <Input
                  value={contact.email}
                  onChange={(e) => updateContact(idx, 'email', e.target.value)}
                  placeholder="Email address"
                />
              </div>
              {form.emergencyContacts.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeContact(idx)}
                  className="col-span-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <MinusCircle className="h-4 w-4 mr-1" />
                  Remove Contact
                </Button>
              )}
            </div>
          ))}
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

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isConfidential"
            checked={form.isConfidential}
            onChange={(e) => setForm({ ...form, isConfidential: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300"
          />
          <Label htmlFor="isConfidential" className="cursor-pointer">Mark as Confidential</Label>
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
  const [deleteHealthRecord, { isLoading }] = useDeleteHealthRecordMutation()

  const handleDelete = async () => {
    try {
      await deleteHealthRecord(record._id).unwrap()
      toast.success('Health record deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete health record')
    }
  }

  return (
    <DialogContent className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <DialogTitle>Delete Health Record</DialogTitle>
        <DialogDescription className="mt-2">
          Are you sure you want to delete the health record for <span className="font-bold">"{record.student?.name || record.student}"</span>?
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

const HealthRecordsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [bloodGroupFilter, setBloodGroupFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: healthData, isLoading, refetch } = useGetHealthRecordsQuery()
  const healthRecords = Array.isArray(healthData) ? healthData : healthData?.data || []

  const filteredRecords = useMemo(() => {
    if (!healthRecords) return []
    return healthRecords.filter((record) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (record.student?.name || record.student || '').toLowerCase().includes(q) ||
          (record.bloodGroup || '').toLowerCase().includes(q) ||
          (record.allergies || []).join(' ').toLowerCase().includes(q)
        if (!match) return false
      }
      if (bloodGroupFilter && record.bloodGroup !== bloodGroupFilter) return false
      return true
    })
  }, [healthRecords, searchTerm, bloodGroupFilter])

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

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Health Records</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage student health records and emergency contacts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            New Record
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by student, blood group, or allergies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={bloodGroupFilter}
            onChange={(e) => setBloodGroupFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-sm"
          >
            <option value="">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Blood Group</TableHead>
              <TableHead>Allergies</TableHead>
              <TableHead>Medications</TableHead>
              <TableHead>Last Checkup</TableHead>
              <TableHead>Emergency Contacts</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                </TableRow>
              ))
            ) : filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No health records found
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record._id}>
                  <TableCell className="font-medium">{record.student?.name || record.student || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={record.bloodGroup !== 'Unknown' ? 'default' : 'secondary'}>
                      {record.bloodGroup || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {record.allergies?.length > 0 ? record.allergies.join(', ') : '—'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {record.medications?.length > 0 ? record.medications.join(', ') : '—'}
                  </TableCell>
                  <TableCell>{formatDate(record.lastCheckupDate)}</TableCell>
                  <TableCell>
                    {record.emergencyContacts?.length > 0 ? (
                      <span className="text-sm text-gray-600">{record.emergencyContacts.length} contact(s)</span>
                    ) : '—'}
                  </TableCell>
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
        <HealthRecordModal
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

export default HealthRecordsPage
