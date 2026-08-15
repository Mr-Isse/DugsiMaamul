import React, { useState, useMemo } from 'react'
import {
  DollarSign,
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreVertical,
  Play,
  Download,
  Calendar,
  Users,
  TrendingUp,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetPayrollQuery,
  useGetTeachersQuery,
  useCreatePayrollRecordMutation,
  useUpdatePayrollRecordMutation,
  useDeletePayrollRecordMutation,
  useProcessPayrollMutation,
  useGetPayrollSummaryQuery,
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
import PayrollFormModal from '@/components/hr/PayrollFormModal'

const HrPage = () => {
  const { userInfo } = useSelector((state) => state.auth)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)

  const { data: payroll, isLoading, isError, error, refetch } = useGetPayrollQuery()
  const { data: teachers } = useGetTeachersQuery()
  const { data: summary } = useGetPayrollSummaryQuery()
  
  const [createRecord, { isLoading: isCreating }] = useCreatePayrollRecordMutation()
  const [updateRecord, { isLoading: isUpdating }] = useUpdatePayrollRecordMutation()
  const [deleteRecord, { isLoading: isDeleting }] = useDeletePayrollRecordMutation()
  const [processPayroll, { isLoading: isProcessing }] = useProcessPayrollMutation()

  const filteredPayroll = useMemo(() => {
    if (!payroll) return []
    const list = Array.isArray(payroll) ? payroll : payroll.data || []
    return list.filter((p) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const teacher = teachers?.find((t) => t._id === p.teacher)
        const match =
          (teacher?.name || '').toLowerCase().includes(q) ||
          (p.employeeId || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (monthFilter !== 'all') {
        const recordMonth = p.month ? new Date(p.month).toISOString().slice(0, 7) : ''
        if (recordMonth !== monthFilter) return false
      }
      return true
    })
  }, [payroll, searchTerm, statusFilter, monthFilter, teachers])

  const handleCreateRecord = async (data) => {
    try {
      await createRecord(data).unwrap()
      toast.success('Payroll record created successfully')
      setIsModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create payroll record')
    }
  }

  const handleUpdateRecord = async (data) => {
    try {
      await updateRecord({ id: selectedRecord._id, ...data }).unwrap()
      toast.success('Payroll record updated successfully')
      setIsModalOpen(false)
      setSelectedRecord(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update payroll record')
    }
  }

  const handleDeleteRecord = async (record) => {
    if (!confirm('Are you sure you want to delete this payroll record?')) return
    try {
      await deleteRecord(record._id).unwrap()
      toast.success('Payroll record deleted successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete payroll record')
    }
  }

  const handleProcessPayroll = async (record) => {
    try {
      await processPayroll({ id: record._id }).unwrap()
      toast.success('Payroll processed successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to process payroll')
    }
  }

  const openCreateModal = () => {
    setSelectedRecord(null)
    setIsModalOpen(true)
  }

  const openEditModal = (record) => {
    setSelectedRecord(record)
    setIsModalOpen(true)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error?.data?.message || 'Failed to load payroll data. Please try again.'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HR & Payroll</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage employee payroll and compensation
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Payroll Record
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Payroll
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary?.totalPayroll?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Paid This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${summary?.paidThisMonth?.toLocaleString() || 0}
            </div>
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
              ${summary?.pendingAmount?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teachers?.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search payroll..."
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
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
            </SelectContent>
          </Select>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              <SelectItem value="2024-01">January 2024</SelectItem>
              <SelectItem value="2024-02">February 2024</SelectItem>
              <SelectItem value="2024-03">March 2024</SelectItem>
              <SelectItem value="2024-04">April 2024</SelectItem>
              <SelectItem value="2024-05">May 2024</SelectItem>
              <SelectItem value="2024-06">June 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Basic Salary</TableHead>
              <TableHead>Allowances</TableHead>
              <TableHead>Deductions</TableHead>
              <TableHead>Net Salary</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredPayroll.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No payroll records found
                </TableCell>
              </TableRow>
            ) : (
              filteredPayroll.map((record) => {
                const teacher = teachers?.find((t) => t._id === record.teacher)
                const netSalary = (record.basicSalary || 0) + (record.allowances || 0) - (record.deductions || 0)
                return (
                  <TableRow key={record._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {teacher?.name || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {record.employeeId || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {record.month ? new Date(record.month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      ${record.basicSalary?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-sm text-green-600">
                      +${record.allowances?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="text-sm text-red-600">
                      -${record.deductions?.toLocaleString() || 0}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${netSalary.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(record.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(record)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {record.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleProcessPayroll(record)}>
                              <Play className="h-4 w-4 mr-2" />
                              Process
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteRecord(record)}
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

      {/* Payroll Form Modal */}
      <PayrollFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRecord(null)
        }}
        onSubmit={selectedRecord ? handleUpdateRecord : handleCreateRecord}
        defaultValues={selectedRecord}
        isEdit={!!selectedRecord}
        isLoading={isCreating || isUpdating}
        teachers={teachers}
      />
    </div>
  )
}

export default HrPage
