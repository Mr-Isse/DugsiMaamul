import React, { useState, useMemo } from 'react'
import {
  CreditCard,
  Plus,
  Search,
  Edit2,
  Trash2,
  Download,
  MoreVertical,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetPaymentsQuery,
  useGetStudentsQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
  useGetFinanceStatsQuery,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import PaymentFormModal from '@/components/finance/PaymentFormModal'

const PaymentsPage = () => {
  const { selectedBranch } = useSelector((state) => state.branch)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)

  const { data: payments, isLoading, isError, error, refetch } = useGetPaymentsQuery()
  const { data: students } = useGetStudentsQuery()
  const { data: stats } = useGetFinanceStatsQuery()
  
  const [createPayment, { isLoading: isCreating }] = useCreatePaymentMutation()
  const [updatePayment, { isLoading: isUpdating }] = useUpdatePaymentMutation()
  const [deletePayment, { isLoading: isDeleting }] = useDeletePaymentMutation()

  const filteredPayments = useMemo(() => {
    if (!payments) return []
    const list = Array.isArray(payments) ? payments : payments.data || []
    return list.filter((p) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const student = students?.find((s) => s._id === p.student)
        const match =
          (p.referenceNumber || '').toLowerCase().includes(q) ||
          (student?.name || '').toLowerCase().includes(q) ||
          (student?.customId || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (typeFilter !== 'all' && p.type !== typeFilter) return false
      return true
    })
  }, [payments, searchTerm, statusFilter, typeFilter, students])

  const handleCreatePayment = async (data) => {
    try {
      await createPayment(data).unwrap()
      toast.success('Payment recorded successfully')
      setIsModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to record payment')
    }
  }

  const handleUpdatePayment = async (data) => {
    try {
      await updatePayment({ id: selectedPayment._id, ...data }).unwrap()
      toast.success('Payment updated successfully')
      setIsModalOpen(false)
      setSelectedPayment(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update payment')
    }
  }

  const handleDeletePayment = async (payment) => {
    if (!confirm(`Are you sure you want to delete this payment?`)) return
    try {
      await deletePayment(payment._id).unwrap()
      toast.success('Payment deleted successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete payment')
    }
  }

  const openCreateModal = () => {
    setSelectedPayment(null)
    setIsModalOpen(true)
  }

  const openEditModal = (payment) => {
    setSelectedPayment(payment)
    setIsModalOpen(true)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Refunded</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error?.data?.message || 'Failed to load payments. Please try again.'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track and manage fee payments
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Record Payment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalRevenue || 0}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from last month
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
            <div className="text-2xl font-bold text-yellow-600">${stats?.pending || 0}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats?.pendingCount || 0} pending payments
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats?.collected || 0}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats?.collectedCount || 0} payments
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${stats?.overdue || 0}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats?.overdueCount || 0} overdue
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search payments..."
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
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="tuition">Tuition</SelectItem>
              <SelectItem value="fees">Fees</SelectItem>
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
              <TableHead>Reference</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => {
                const student = students?.find((s) => s._id === payment.student)
                return (
                  <TableRow key={payment._id}>
                    <TableCell>
                      <Badge variant="outline">{payment.referenceNumber || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {student?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student?.customId || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {payment.type || 'Other'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${payment.amount?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {payment.date ? new Date(payment.date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(payment)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download Receipt
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeletePayment(payment)}
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

      {/* Payment Form Modal */}
      <PaymentFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPayment(null)
        }}
        onSubmit={selectedPayment ? handleUpdatePayment : handleCreatePayment}
        defaultValues={selectedPayment}
        isEdit={!!selectedPayment}
        isLoading={isCreating || isUpdating}
        students={students}
      />
    </div>
  )
}

export default PaymentsPage
