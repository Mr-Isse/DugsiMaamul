import React, { useState, useMemo } from 'react'
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  User,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetLeaveRequestsQuery,
  useGetStudentsQuery,
  useGetTeachersQuery,
  useCreateLeaveRequestMutation,
  useUpdateLeaveRequestMutation,
  useDeleteLeaveRequestMutation,
  useApproveLeaveRequestMutation,
  useRejectLeaveRequestMutation,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import LeaveRequestModal from '@/components/leave/LeaveRequestModal'

const LeavePage = () => {
  const { userInfo } = useSelector((state) => state.auth)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)

  const { data: leaveRequests, isLoading, isError, error, refetch } = useGetLeaveRequestsQuery()
  const { data: students } = useGetStudentsQuery()
  const { data: teachers } = useGetTeachersQuery()
  
  const [createLeaveRequest, { isLoading: isCreating }] = useCreateLeaveRequestMutation()
  const [updateLeaveRequest, { isLoading: isUpdating }] = useUpdateLeaveRequestMutation()
  const [deleteLeaveRequest, { isLoading: isDeleting }] = useDeleteLeaveRequestMutation()
  const [approveLeaveRequest, { isLoading: isApproving }] = useApproveLeaveRequestMutation()
  const [rejectLeaveRequest, { isLoading: isRejecting }] = useRejectLeaveRequestMutation()

  const filteredLeaveRequests = useMemo(() => {
    if (!leaveRequests) return []
    const list = Array.isArray(leaveRequests) ? leaveRequests : leaveRequests.data || []
    return list.filter((request) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const student = students?.find((s) => s._id === request.student)
        const teacher = teachers?.find((t) => t._id === request.teacher)
        const name = student?.name || teacher?.name || ''
        const match =
          name.toLowerCase().includes(q) ||
          (request.reason || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter !== 'all' && request.status !== statusFilter) return false
      if (typeFilter !== 'all' && request.type !== typeFilter) return false
      return true
    })
  }, [leaveRequests, searchTerm, statusFilter, typeFilter, students, teachers])

  const handleCreateLeaveRequest = async (data) => {
    try {
      await createLeaveRequest(data).unwrap()
      toast.success('Leave request created successfully')
      setIsModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create leave request')
    }
  }

  const handleUpdateLeaveRequest = async (data) => {
    try {
      await updateLeaveRequest({ id: selectedRequest._id, ...data }).unwrap()
      toast.success('Leave request updated successfully')
      setIsModalOpen(false)
      setSelectedRequest(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update leave request')
    }
  }

  const handleDeleteLeaveRequest = async (request) => {
    if (!confirm('Are you sure you want to delete this leave request?')) return
    try {
      await deleteLeaveRequest(request._id).unwrap()
      toast.success('Leave request deleted successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete leave request')
    }
  }

  const handleApprove = async (request) => {
    try {
      await approveLeaveRequest(request._id).unwrap()
      toast.success('Leave request approved')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to approve leave request')
    }
  }

  const handleReject = async (request) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return
    try {
      await rejectLeaveRequest({ id: request._id, reason }).unwrap()
      toast.success('Leave request rejected')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to reject leave request')
    }
  }

  const openCreateModal = () => {
    setSelectedRequest(null)
    setIsModalOpen(true)
  }

  const openEditModal = (request) => {
    setSelectedRequest(request)
    setIsModalOpen(true)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error?.data?.message || 'Failed to load leave requests. Please try again.'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage student and staff leave requests
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          New Leave Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveRequests?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {leaveRequests?.filter((r) => r.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {leaveRequests?.filter((r) => r.status === 'approved').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              On Leave Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {leaveRequests?.filter((r) => {
                const today = new Date()
                const start = new Date(r.startDate)
                const end = new Date(r.endDate)
                return r.status === 'approved' && today >= start && today <= end
              }).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sick">Sick Leave</SelectItem>
              <SelectItem value="casual">Casual Leave</SelectItem>
              <SelectItem value="vacation">Vacation</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredLeaveRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No leave requests found
                </TableCell>
              </TableRow>
            ) : (
              filteredLeaveRequests.map((request) => {
                const student = students?.find((s) => s._id === request.student)
                const teacher = teachers?.find((t) => t._id === request.teacher)
                const name = student?.name || teacher?.name || 'Unknown'
                const days = Math.ceil((new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1
                return (
                  <TableRow key={request._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div className="font-medium text-gray-900 dark:text-white">
                          {name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {request.type || 'Other'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {request.startDate ? new Date(request.startDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {request.endDate ? new Date(request.endDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{days} day{days > 1 ? 's' : ''}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 max-w-xs truncate">
                      {request.reason || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {request.status === 'pending' && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(request)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReject(request)}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onClick={() => openEditModal(request)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteLeaveRequest(request)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Leave Request Modal */}
      <LeaveRequestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRequest(null)
        }}
        onSubmit={selectedRequest ? handleUpdateLeaveRequest : handleCreateLeaveRequest}
        defaultValues={selectedRequest}
        isEdit={!!selectedRequest}
        isLoading={isCreating || isUpdating}
        students={students}
        teachers={teachers}
      />
    </div>
  )
}

export default LeavePage
