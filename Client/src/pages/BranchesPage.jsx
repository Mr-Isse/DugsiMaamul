import React, { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2, Building2, RefreshCw, AlertCircle, Phone, Mail, MapPin, User, X } from 'lucide-react'
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
import { useGetBranchesQuery, useCreateBranchMutation, useUpdateBranchMutation, useDeleteBranchMutation, useToggleBranchStatusMutation } from '@/services/api'

const STATUS_STYLES = {
  Active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const BranchModal = ({ initial, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: initial?.name || '',
    code: initial?.code || '',
    phone: initial?.phone || '',
    email: initial?.email || '',
    address: initial?.address || '',
    city: initial?.city || '',
    country: initial?.country || '',
    principalName: initial?.principalName || '',
    loginEmail: initial?.loginEmail || '',
    password: '',
  })

  const [createBranch, { isLoading: creating }] = useCreateBranchMutation()
  const [updateBranch, { isLoading: updating }] = useUpdateBranchMutation()

  const isEdit = Boolean(initial)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Branch name is required')
    if (!form.code.trim()) return toast.error('Branch code is required')
    if (!form.phone.trim()) return toast.error('Phone number is required')
    if (!form.email.trim()) return toast.error('Email is required')
    if (!form.address.trim()) return toast.error('Address is required')
    if (!form.city.trim()) return toast.error('City is required')
    if (!form.country.trim()) return toast.error('Country is required')
    if (!form.principalName.trim()) return toast.error('Principal name is required')
    if (!isEdit && !form.loginEmail.trim()) return toast.error('Login email is required')
    if (!isEdit && !form.password.trim()) return toast.error('Password is required')

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (form.loginEmail && !emailRegex.test(form.loginEmail)) {
      return toast.error('Invalid login email format')
    }
    if (form.email && !emailRegex.test(form.email)) {
      return toast.error('Invalid email format')
    }

    try {
      const payload = { ...form }
      if (isEdit && !payload.password) {
        delete payload.password
      }
      if (isEdit) {
        await updateBranch({ id: initial._id, ...payload }).unwrap()
        toast.success('Branch updated')
      } else {
        await createBranch(payload).unwrap()
        toast.success('Branch created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save branch')
    }
  }

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Branch' : 'New Branch'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Update branch information' : 'Create a new branch'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Main Campus"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Code *</Label>
            <Input
              id="code"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="e.g. MAIN"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9+\-\s()]/g, '')
                setForm({ ...form, phone: value })
              }}
              placeholder="e.g. +1 234 567 8900"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="e.g. contact@school.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Street address"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="e.g. New York"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder="e.g. USA"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="principalName">Principal Name *</Label>
          <Input
            id="principalName"
            value={form.principalName}
            onChange={(e) => setForm({ ...form, principalName: e.target.value })}
            placeholder="e.g. John Smith"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="loginEmail">Login Email {!isEdit && '*'}</Label>
            <Input
              id="loginEmail"
              type="email"
              value={form.loginEmail}
              onChange={(e) => setForm({ ...form, loginEmail: e.target.value })}
              placeholder="e.g. admin@school.com"
              required={!isEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password {!isEdit && '*'}</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={isEdit ? 'Leave blank to keep current' : 'Enter password'}
              required={!isEdit}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Branch'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}

const DeleteConfirmDialog = ({ branch, onClose, onSuccess }) => {
  const [deleteBranch, { isLoading }] = useDeleteBranchMutation()

  const handleDelete = async () => {
    try {
      await deleteBranch(branch._id).unwrap()
      toast.success('Branch deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete branch')
    }
  }

  return (
    <DialogContent className="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <DialogTitle>Delete Branch</DialogTitle>
        <DialogDescription className="mt-2">
          Are you sure you want to delete <span className="font-bold">"{branch.name}"</span>?
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

const BranchesPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: branchesData, isLoading, refetch } = useGetBranchesQuery()
  const [toggleBranchStatus] = useToggleBranchStatusMutation()
  const branches = Array.isArray(branchesData) ? branchesData : branchesData?.data || []

  const filteredBranches = useMemo(() => {
    if (!branches) return []
    return branches.filter((branch) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (branch.name || '').toLowerCase().includes(q) ||
          (branch.code || '').toLowerCase().includes(q) ||
          (branch.city || '').toLowerCase().includes(q) ||
          (branch.country || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter && branch.status !== statusFilter) return false
      return true
    })
  }, [branches, searchTerm, statusFilter])

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (branch) => {
    setEditRecord(branch)
    setIsModalOpen(true)
  }

  const handleDelete = (branch) => {
    setDeleteRecord(branch)
  }

  const handleToggleStatus = async (branch) => {
    try {
      await toggleBranchStatus(branch._id).unwrap()
      toast.success('Branch status updated')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update status')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Branches</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage school campuses and multi-branch isolation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Branch
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search branches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch Details</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBranches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No branches found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBranches.map((branch) => (
                  <TableRow key={branch._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                          {branch.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{branch.name}</div>
                          <div className="text-sm text-gray-500">{branch.code}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {branch.city}, {branch.country}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          {branch.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {branch.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        {branch.principalName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[branch.status] || STATUS_STYLES.Inactive}>
                        {branch.status || 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(branch)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(branch)}>
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
        <BranchModal
          initial={editRecord}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => refetch()}
        />
      )}

      {deleteRecord && (
        <DeleteConfirmDialog
          branch={deleteRecord}
          onClose={() => setDeleteRecord(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  )
}

export default BranchesPage
