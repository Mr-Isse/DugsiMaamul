import React, { useState, useMemo } from 'react'
import {
  ShieldCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  MoreVertical,
  Lock,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetRolesQuery,
  useGetPermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from '@/services/api'
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
import RoleFormModal from '@/components/rbac/RoleFormModal'

const RolesPage = () => {
  const { userInfo } = useSelector((state) => state.auth)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)

  const { data: roles, isLoading, isError, error, refetch } = useGetRolesQuery()
  const { data: permissions } = useGetPermissionsQuery()
  
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation()
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation()
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation()

  const filteredRoles = useMemo(() => {
    if (!roles) return []
    const list = Array.isArray(roles) ? roles : roles.data || []
    return list.filter((r) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (r.name || '').toLowerCase().includes(q) ||
          (r.description || '').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [roles, searchTerm])

  const handleCreateRole = async (data) => {
    try {
      await createRole(data).unwrap()
      toast.success('Role created successfully')
      setIsModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create role')
    }
  }

  const handleUpdateRole = async (data) => {
    try {
      await updateRole({ id: selectedRole._id, ...data }).unwrap()
      toast.success('Role updated successfully')
      setIsModalOpen(false)
      setSelectedRole(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update role')
    }
  }

  const handleDeleteRole = async (role) => {
    if (!confirm(`Are you sure you want to delete "${role.name}"?`)) return
    try {
      await deleteRole(role._id).unwrap()
      toast.success('Role deleted successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete role')
    }
  }

  const openCreateModal = () => {
    setSelectedRole(null)
    setIsModalOpen(true)
  }

  const openEditModal = (role) => {
    setSelectedRole(role)
    setIsModalOpen(true)
  }

  const getPermissionCount = (role) => {
    return role.permissions?.length || 0
  }

  const getUserCount = (role) => {
    return role.userCount || 0
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error?.data?.message || 'Failed to load roles. Please try again.'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage user roles and their permissions
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Role
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No roles found
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role) => (
                <TableRow key={role._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-gray-500" />
                      <div className="font-medium text-gray-900 dark:text-white">
                        {role.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {role.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      <Lock className="h-3 w-3 mr-1" />
                      {getPermissionCount(role)} permissions
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {getUserCount(role)} users
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {role.isSystem ? (
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
                        <DropdownMenuItem onClick={() => openEditModal(role)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {!role.isSystem && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteRole(role)}
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

      {/* Role Form Modal */}
      <RoleFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRole(null)
        }}
        onSubmit={selectedRole ? handleUpdateRole : handleCreateRole}
        defaultValues={selectedRole}
        isEdit={!!selectedRole}
        isLoading={isCreating || isUpdating}
        permissions={permissions}
      />
    </div>
  )
}

export default RolesPage
