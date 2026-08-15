import React, { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2, MoreVertical, UserPlus, GraduationCap, FileText } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  useGetAdmissionsQuery,
  useUpdateAdmissionStatusMutation,
  useCreateAdmissionMutation,
  useUpdateAdmissionMutation,
  useDeleteAdmissionMutation,
  useGetClassesQuery,
} from '@/services/api'
import AdmissionFormModal from '@/components/admissions/AdmissionFormModal'

const AdmissionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const { data: admissionsData, isLoading, refetch } = useGetAdmissionsQuery()
  const { data: classesData } = useGetClassesQuery()
  const [updateAdmissionStatus] = useUpdateAdmissionStatusMutation()
  const [createAdmission] = useCreateAdmissionMutation()
  const [updateAdmission] = useUpdateAdmissionMutation()
  const [deleteAdmission] = useDeleteAdmissionMutation()

  const admissions = Array.isArray(admissionsData) ? admissionsData : admissionsData?.data || []
  const classes = Array.isArray(classesData) ? classesData : classesData?.data || []

  const filteredAdmissions = useMemo(() => {
    if (!admissions) return []
    return admissions.filter((admission) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (admission.studentName || admission.name || '').toLowerCase().includes(q) ||
          (admission.email || '').toLowerCase().includes(q) ||
          (admission.phone || '').includes(q)
        if (!match) return false
      }
      return true
    })
  }, [admissions, searchTerm])

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'under_review': return 'bg-blue-100 text-blue-700'
      case 'approved': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleStatusUpdate = async (admission, status) => {
    try {
      await updateAdmissionStatus({ id: admission._id, status }).unwrap()
      toast.success('Admission status updated')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update status')
    }
  }

  const handleDeleteAdmission = async (admission) => {
    try {
      await deleteAdmission(admission._id).unwrap()
      toast.success('Admission deleted successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete admission')
    }
  }

  const handleCreateAdmission = async (data) => {
    try {
      await createAdmission(data).unwrap()
      toast.success('Admission created successfully')
      setIsModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create admission')
    }
  }

  const handleUpdateAdmission = async (data) => {
    try {
      await updateAdmission({ id: editRecord._id, ...data }).unwrap()
      toast.success('Admission updated successfully')
      setIsModalOpen(false)
      setEditRecord(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update admission')
    }
  }

  const handleEditClick = (admission) => {
    setEditRecord(admission)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admissions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage student admissions and applications
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          New Admission
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search admissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Parent Name</TableHead>
              <TableHead>Status</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredAdmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No admissions found
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmissions.map((admission) => (
                <TableRow key={admission._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-semibold">
                        {admission.studentName?.charAt(0) || admission.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div className="font-medium">{admission.studentName || admission.name}</div>
                        <div className="text-sm text-gray-500">{admission.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-slate-600 dark:text-slate-300">
                      {admission.class?.name} - {admission.class?.section}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">
                    {admission.parentName}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(admission.status)}`}>
                      {(admission.status || 'pending').toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(admission)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleStatusUpdate(admission, 'approved')}>
                          <GraduationCap className="h-4 w-4 mr-2" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(admission, 'rejected')}>
                          <FileText className="h-4 w-4 mr-2" />
                          Reject
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteAdmission(admission)}
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

      {isModalOpen && (
        <AdmissionFormModal
          isOpen={isModalOpen}
          initial={editRecord}
          classes={classes}
          onClose={() => {
            setIsModalOpen(false)
            setEditRecord(null)
          }}
          onSubmit={editRecord ? handleUpdateAdmission : handleCreateAdmission}
        />
      )}
    </div>
  )
}

export default AdmissionsPage
