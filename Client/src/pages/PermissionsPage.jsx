import React, { useState, useMemo } from 'react'
import {
  Lock,
  Plus,
  Search,
  Edit2,
  Trash2,
  ShieldCheck,
  MoreVertical,
  Filter,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import PermissionFormModal from '@/components/rbac/PermissionFormModal'

const PermissionsPage = () => {
  const { userInfo } = useSelector((state) => state.auth)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState(null)

  const { data: permissions, isLoading, isError, error, refetch } = useGetPermissionsQuery()
  
  const [createPermission, { isLoading: isCreating }] = useCreatePermissionMutation()
  const [updatePermission, { isLoading: isUpdating }] = useUpdatePermissionMutation()
  const [deletePermission, { isLoading: isDeleting }] = useDeletePermissionMutation()

  const filteredPermissions = useMemo(() => {
    if (!permissions) return []
    const list = Array.isArray(permissions) ? permissions : permissions.data || []
    return list.filter((p) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (p.name || '').toLowerCase().includes(q) ||
          (p.code || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (moduleFilter !== 'all') {
        const module = p.code?.split('.')[0]
        if (module !== moduleFilter) return false
      }
      return true
    })
  }, [permissions, searchTerm, moduleFilter])

  const modules = useMemo(() => {
    if (!permissions) return []
    const list = Array.isArray(permissions) ? permissions : permissions.data || []
    const uniqueModules = [...new Set(list.map((p) => p.code?.split('.')[0]).filter(Boolean))]
    return uniqueModules.sort()
  }, [permissions])

  const handleCreatePermission = async (data) => {
    try {
      await createPermission(data).unwrap()
      toast.success('Permission created successfully')
      setIsModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create permission')
    }
  }

  const handleUpdatePermission = async (data) => {
    try {
      await updatePermission({ id: selectedPermission._id, ...data }).unwrap()
      toast.success('Permission updated successfully')
      setIsModalOpen(false)
      setSelectedPermission(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update permission')
    }
  }

  const handleDeletePermission = async (permission) => {
    if (!confirm(`Are you sure you want to delete "${permission.name}"?`)) return
    try {
      await deletePermission(permission._id).unwrap()
      toast.success('Permission deleted successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete permission')
    }
  }

  const openCreateModal = () => {
    setSelectedPermission(null)
    setIsModalOpen(true)
  }

  const openEditModal = (permission) => {
    setSelectedPermission(permission)
    setIsModalOpen(true)
  }

  const getModuleBadge = (code) => {
    const module = code?.split('.')[0] || 'general'
    return (
      <Badge variant="outline" className="capitalize">
        {module}
      </Badge>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error?.data?.message || 'Failed to load permissions. Please try again.'}
          </p>
          <Button onClick={() => refetch()} className="mt-2" variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Permissions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage system permissions and access controls
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Permission
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              {modules.map((module) => (
                <SelectItem key={module} value={module}>
                  {module.charAt(0).toUpperCase() + module.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Permission Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Module</TableHead>
              <TableHead>Description</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredPermissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No permissions found
                </TableCell>
              </TableRow>
            ) : (
              filteredPermissions.map((permission) => (
                <TableRow key={permission._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-gray-500" />
                      <div className="font-medium text-gray-900 dark:text-white">
                        {permission.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{permission.code}</Badge>
                  </TableCell>
                  <TableCell>
                    {getModuleBadge(permission.code)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {permission.description || '-'}
                  </TableCell>
                  <TableCell>
                    {permission.isSystem ? (
                      <Badge variant="secondary">System</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(permission)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {!permission.isSystem && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeletePermission(permission)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Permission Form Modal */}
      <PermissionFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPermission(null)
        }}
        onSubmit={selectedPermission ? handleUpdatePermission : handleCreatePermission}
        defaultValues={selectedPermission}
        isEdit={!!selectedPermission}
        isLoading={isCreating || isUpdating}
      />
    </div>
  )
}

export default PermissionsPage
