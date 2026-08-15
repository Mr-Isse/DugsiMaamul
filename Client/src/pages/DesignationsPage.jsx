import React, { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, AlertCircle, RefreshCw, Briefcase } from 'lucide-react'
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
  useGetDesignationsQuery,
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
  useDeleteDesignationMutation,
  useGetDepartmentsQuery,
} from '@/services/api'
import { useSelector } from 'react-redux'
import { hasPermission } from '@/utils/permissions'
import { hasFeatureAccess } from '@/utils/featureAccess'

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const LEVEL_OPTIONS = [
  { value: 0, label: 'Junior' },
  { value: 1, label: 'Mid-Level' },
  { value: 2, label: 'Senior' },
  { value: 3, label: 'Lead' },
  { value: 4, label: 'Manager' },
  { value: 5, label: 'Director' },
  { value: 6, label: 'Executive' },
]

const DesignationModal = ({ isOpen, initial, onClose, onSuccess, canCreate, canEdit }) => {
  const [form, setForm] = useState({
    name: initial?.name || '',
    code: initial?.code || '',
    description: initial?.description || '',
    department: initial?.department?._id || initial?.department || '',
    level: initial?.level || 0,
    status: initial?.status || 'active',
  })

  const { data: deptData } = useGetDepartmentsQuery()
  const departments = Array.isArray(deptData) ? deptData : deptData?.data || []
  const [createDesignation, { isLoading: creating }] = useCreateDesignationMutation()
  const [updateDesignation, { isLoading: updating }] = useUpdateDesignationMutation()

  const isEdit = Boolean(initial)

  // Update form when initial data changes (for edit mode)
  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        code: initial.code || '',
        description: initial.description || '',
        department: initial.department?._id || initial.department || '',
        level: initial.level || 0,
        status: initial.status || 'active',
      })
    } else {
      // Reset form for create mode
      setForm({
        name: '',
        code: '',
        description: '',
        department: '',
        level: 0,
        status: 'active',
      })
    }
  }, [initial])

  // Reset form when modal opens in create mode
  useEffect(() => {
    if (isOpen && !initial) {
      setForm({
        name: '',
        code: '',
        description: '',
        department: '',
        level: 0,
        status: 'active',
      })
    }
  }, [isOpen, initial])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Permission check
    if (isEdit && !canEdit) {
      return toast.error('You do not have permission to edit designations')
    }
    if (!isEdit && !canCreate) {
      return toast.error('You do not have permission to create designations')
    }
    
    // Simple validations matching OLD frontend
    if (!form.name.trim()) {
      return toast.error('Designation name is required')
    }
    if (!form.code.trim()) {
      return toast.error('Designation code is required')
    }
    if (!form.department) {
      return toast.error('Department is required')
    }
    
    try {
      if (isEdit) {
        await updateDesignation({ id: initial._id, ...form }).unwrap()
        toast.success('Designation updated')
      } else {
        await createDesignation(form).unwrap()
        toast.success('Designation created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save designation')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Designation' : 'New Designation'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update designation information' : 'Create a new designation'}
          </DialogDescription>
        </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Senior Teacher"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Code *</Label>
          <Input
            id="code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="e.g. ST"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Designation description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <select
              id="department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
              required
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <select
              id="level"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            >
              {LEVEL_OPTIONS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Designation'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
  )
}

const DeleteConfirmDialog = ({ isOpen, designation, onClose, onSuccess, canDelete }) => {
  const [deleteDesignation, { isLoading }] = useDeleteDesignationMutation()

  const handleDelete = async () => {
    if (!canDelete) {
      return toast.error('You do not have permission to delete designations')
    }
    
    try {
      await deleteDesignation(designation._id).unwrap()
      toast.success('Designation deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete designation')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle>Delete Designation</DialogTitle>
          <DialogDescription className="mt-2">
            Are you sure you want to delete <span className="font-bold">"{designation.name}"</span>?
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
    </Dialog>
  )
}

const DesignationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { user } = useSelector((state) => state.auth)

  // Permission and feature access checks
  const canCreate = hasPermission(user, 'settings.manage')
  const canEdit = hasPermission(user, 'settings.manage')
  const canDelete = hasPermission(user, 'settings.manage')
  const hasFeature = hasFeatureAccess(user, 'designations')

  // Feature gate - if feature not enabled, show message
  if (!hasFeature) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Feature Not Available
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            The Designations module is not available in your current plan.
          </p>
        </div>
      </div>
    )
  }

  const queryArgs = useMemo(() => {
    const params = {}
    if (searchTerm) params.search = searchTerm
    if (deptFilter) params.department = deptFilter
    if (statusFilter) params.status = statusFilter
    return params
  }, [searchTerm, deptFilter, statusFilter])

  const { data: designationsData, isLoading, refetch } = useGetDesignationsQuery(queryArgs)
  const designations = Array.isArray(designationsData) ? designationsData : designationsData?.data || designationsData?.designations || []

  const { data: deptData } = useGetDepartmentsQuery()
  const departments = Array.isArray(deptData) ? deptData : deptData?.data || deptData?.departments || []

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (designation) => {
    setEditRecord(designation)
    setIsModalOpen(true)
  }

  const handleDelete = (designation) => {
    setDeleteRecord(designation)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Designations</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage job titles and designations for staff
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {canCreate && (
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Designation
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search designations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background max-w-[150px]"
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background max-w-[150px]"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Status</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : designations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No designations found
                </TableCell>
              </TableRow>
            ) : (
              designations.map((designation) => (
                <TableRow key={designation._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{designation.name}</div>
                      {designation.description && (
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{designation.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{designation.code}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{designation.department?.name || '—'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{LEVEL_OPTIONS.find(l => l.value === designation.level)?.label || '—'}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[designation.status] || ''}`}>
                      {designation.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canEdit && (
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(designation)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(designation)} className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <DesignationModal
          isOpen={isModalOpen}
          initial={editRecord}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
          canCreate={canCreate}
          canEdit={canEdit}
        />
      )}

      {deleteRecord && (
        <Dialog open={!!deleteRecord} onOpenChange={() => setDeleteRecord(null)}>
          <DeleteConfirmDialog
            isOpen={!!deleteRecord}
            designation={deleteRecord}
            onClose={() => setDeleteRecord(null)}
            onSuccess={() => refetch()}
            canDelete={canDelete}
          />
        </Dialog>
      )}
    </div>
  )
}

export default DesignationsPage
