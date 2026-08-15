import React, { useState, useMemo } from 'react'
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Link as LinkIcon,
  Phone,
  Mail,
  Key,
  UserPlus,
  MoreVertical,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetParentsQuery,
  useGetStudentsQuery,
  useCreateParentMutation,
  useUpdateParentMutation,
  useDeleteParentMutation,
  useResetParentPasswordMutation,
  useLinkParentToStudentsMutation,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import ParentFormModal from '@/components/parents/ParentFormModal'
import LinkStudentsModal from '@/components/parents/LinkStudentsModal'
import ResetPasswordModal from '@/components/parents/ResetPasswordModal'

const ParentsPage = () => {
  const { selectedBranch } = useSelector((state) => state.branch)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [selectedParent, setSelectedParent] = useState(null)

  const { data: parents, isLoading, isError, error, refetch } = useGetParentsQuery()
  const { data: students } = useGetStudentsQuery()
  
  const [createParent, { isLoading: isCreating }] = useCreateParentMutation()
  const [updateParent, { isLoading: isUpdating }] = useUpdateParentMutation()
  const [deleteParent, { isLoading: isDeleting }] = useDeleteParentMutation()
  const [resetParentPassword, { isLoading: isResetting }] = useResetParentPasswordMutation()
  const [linkParentToStudents, { isLoading: isLinking }] = useLinkParentToStudentsMutation()

  const filteredParents = useMemo(() => {
    if (!parents) return []
    const list = Array.isArray(parents) ? parents : parents.data || []
    return list.filter((p) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (p.name || '').toLowerCase().includes(q) ||
          (p.customId || '').toLowerCase().includes(q) ||
          (p.phone || '').includes(q) ||
          (p.email || '').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [parents, searchTerm])

  const handleCreateParent = async (data) => {
    try {
      await createParent(data).unwrap()
      toast.success('Parent account created successfully')
      setIsModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create parent')
    }
  }

  const handleUpdateParent = async (data) => {
    try {
      await updateParent({ id: selectedParent._id, ...data }).unwrap()
      toast.success('Parent account updated successfully')
      setIsModalOpen(false)
      setSelectedParent(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update parent')
    }
  }

  const handleDeleteParent = async (parent) => {
    try {
      await deleteParent(parent._id).unwrap()
      toast.success('Parent deleted successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete parent')
    }
  }

  const handleResetPassword = async (data) => {
    try {
      await resetParentPassword({ id: selectedParent._id, ...data }).unwrap()
      toast.success('Password reset successfully')
      setIsResetModalOpen(false)
      setSelectedParent(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to reset password')
    }
  }

  const handleLinkStudents = async (data) => {
    try {
      await linkParentToStudents({ parentId: selectedParent._id, studentIds: data.studentIds }).unwrap()
      toast.success('Students linked successfully')
      setIsLinkModalOpen(false)
      setSelectedParent(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to link students')
    }
  }

  const openCreateModal = () => {
    setSelectedParent(null)
    setIsModalOpen(true)
  }

  const openEditModal = (parent) => {
    setSelectedParent(parent)
    setIsModalOpen(true)
  }

  const openLinkModal = (parent) => {
    setSelectedParent(parent)
    setIsLinkModalOpen(true)
  }

  const openResetModal = (parent) => {
    setSelectedParent(parent)
    setIsResetModalOpen(true)
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error?.data?.message || 'Failed to load parents. Please try again.'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parents</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage parent accounts and link them to students
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Parent
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search parents..."
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
              <TableHead>Parent</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Custom ID</TableHead>
              <TableHead>Linked Students</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredParents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No parents found
                </TableCell>
              </TableRow>
            ) : (
              filteredParents.map((parent) => (
                <TableRow key={parent._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={parent.avatar} />
                        <AvatarFallback>
                          {(parent.name || 'P').split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {parent.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {parent.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Phone className="h-3 w-3" />
                        {parent.phone || 'No phone'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{parent.customId || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {parent.linkedStudents?.length || 0} students
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(parent)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openLinkModal(parent)}>
                          <LinkIcon className="h-4 w-4 mr-2" />
                          Link Students
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openResetModal(parent)}>
                          <Key className="h-4 w-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteParent(parent)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Parent Form Modal */}
      <ParentFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedParent(null)
        }}
        onSubmit={selectedParent ? handleUpdateParent : handleCreateParent}
        defaultValues={selectedParent}
        isEdit={!!selectedParent}
        isLoading={isCreating || isUpdating}
      />

      {/* Link Students Modal */}
      <LinkStudentsModal
        isOpen={isLinkModalOpen}
        onClose={() => {
          setIsLinkModalOpen(false)
          setSelectedParent(null)
        }}
        onSubmit={handleLinkStudents}
        parent={selectedParent}
        students={students}
        isLoading={isLinking}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false)
          setSelectedParent(null)
        }}
        onSubmit={handleResetPassword}
        parent={selectedParent}
        isLoading={isResetting}
      />
    </div>
  )
}

export default ParentsPage
