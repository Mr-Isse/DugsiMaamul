import React, { useState, useMemo, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Building2, RefreshCw, AlertCircle, X } from 'lucide-react'
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
import { useGetDepartmentsQuery, useCreateDepartmentMutation, useUpdateDepartmentMutation, useDeleteDepartmentMutation, useGetTeachersQuery } from '@/services/api'
import { useSelector } from 'react-redux'
import { hasPermission } from '@/utils/permissions'
import { hasFeatureAccess } from '@/utils/featureAccess'

const STATUS_STYLES = {
  Active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const DepartmentModal = ({ isOpen, initial, onClose, onSuccess, canCreate, canEdit }) => {
  const [form, setForm] = useState({
    name: initial?.name || '',
    code: initial?.code || '',
    description: initial?.description || '',
    head: initial?.head?._id || initial?.head || '',
    status: initial?.status || 'Active',
  })

  const { data: teachersData } = useGetTeachersQuery()
  const teachers = Array.isArray(teachersData) ? teachersData : teachersData?.data || []
  const [createDepartment, { isLoading: creating }] = useCreateDepartmentMutation()
  const [updateDepartment, { isLoading: updating }] = useUpdateDepartmentMutation()

  const isEdit = Boolean(initial)

  // Update form when initial data changes (for edit mode)
  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || '',
        code: initial.code || '',
        description: initial.description || '',
        head: initial.head?._id || initial.head || '',
        status: initial.status || 'Active',
      })
    } else {
      // Reset form for create mode
      setForm({
        name: '',
        code: '',
        description: '',
        head: '',
        status: 'Active',
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
        head: '',
        status: 'Active',
      })
    }
  }, [isOpen, initial])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Permission check
    if (isEdit && !canEdit) {
      return toast.error('You do not have permission to edit departments')
    }
    if (!isEdit && !canCreate) {
      return toast.error('You do not have permission to create departments')
    }
    
    // Simple validations matching OLD frontend
    if (!form.name.trim()) {
      return toast.error('Department name is required')
    }
    if (!form.code.trim()) {
      return toast.error('Department code is required')
    }
    
    try {
      if (isEdit) {
        await updateDepartment({ id: initial._id, ...form }).unwrap()
        toast.success('Department updated')
      } else {
        await createDepartment(form).unwrap()
        toast.success('Department created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save department')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Department' : 'New Department'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update department information' : 'Create a new department'}
          </DialogDescription>
        </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Science Department"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Code *</Label>
          <Input
            id="code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="e.g. SCI"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Department description"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="head">Head of Department</Label>
          <select
            id="head"
            value={form.head}
            onChange={(e) => setForm({ ...form, head: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
          >
            <option value="">Select a teacher</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name || `${t.firstName} ${t.lastName || ''}`}
              </option>
            ))}
          </select>
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
          </select>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Department'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
  )
}

const DeleteConfirmDialog = ({ isOpen, department, onClose, onSuccess, canDelete }) => {
  const [deleteDepartment, { isLoading }] = useDeleteDepartmentMutation()

  const handleDelete = async () => {
    if (!canDelete) {
      return toast.error('You do not have permission to delete departments')
    }
    
    try {
      await deleteDepartment(department._id).unwrap()
      toast.success('Department deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete department')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle>Delete Department</DialogTitle>
          <DialogDescription className="mt-2">
            Are you sure you want to delete <span className="font-bold">"{department.name}"</span>?
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

const DepartmentsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { user } = useSelector((state) => state.auth)

  // Permission and feature access checks
  const canCreate = hasPermission(user, 'settings.manage')
  const canEdit = hasPermission(user, 'settings.manage')
  const canDelete = hasPermission(user, 'settings.manage')
  const hasFeature = hasFeatureAccess(user, 'departments')

  // Feature gate - if feature not enabled, show message
  if (!hasFeature) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Feature Not Available
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            The Departments module is not available in your current plan.
          </p>
        </div>
      </div>
    )
  }

  const queryArgs = useMemo(() => {
    const params = {}
    if (searchTerm) params.search = searchTerm
    if (statusFilter) params.status = statusFilter
    return params
  }, [searchTerm, statusFilter])

  const { data: departmentsData, isLoading, refetch } = useGetDepartmentsQuery(queryArgs)
  const departments = Array.isArray(departmentsData) ? departmentsData : departmentsData?.data || departmentsData?.departments || []

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (department) => {
    setEditRecord(department)
    setIsModalOpen(true)
  }

  const handleDelete = (department) => {
    setDeleteRecord(department)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Departments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage academic departments and their heads
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          {canCreate && (
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background max-w-[150px]"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Head</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No departments found
                </TableCell>
              </TableRow>
            ) : (
              departments.map((department) => (
                <TableRow key={department._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{department.name}</div>
                      {department.description && (
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">{department.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{department.code}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{department.head?.name || department.head?.firstName || '—'}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[department.status] || ''}`}>
                      {department.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {canEdit && (
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(department)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(department)} className="text-red-600 hover:text-red-700">
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DepartmentModal
          isOpen={isModalOpen}
          initial={editRecord}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
          canCreate={canCreate}
          canEdit={canEdit}
        />
      </Dialog>

      <Dialog open={!!deleteRecord} onOpenChange={() => setDeleteRecord(null)}>
        {deleteRecord && (
          <DeleteConfirmDialog
            isOpen={!!deleteRecord}
            department={deleteRecord}
            onClose={() => setDeleteRecord(null)}
            onSuccess={() => refetch()}
            canDelete={canDelete}
          />
        )}
      </Dialog>
    </div>
  )
}

export default DepartmentsPage
