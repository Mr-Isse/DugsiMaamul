import React, { useState, useMemo } from 'react'
import {
  CreditCard,
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreVertical,
  Printer,
  User,
  Calendar,
  Shield,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetIdCardsQuery,
  useGetStudentsQuery,
  useCreateIdCardMutation,
  useUpdateIdCardMutation,
  useDeleteIdCardMutation,
  useReprintIdCardMutation,
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
import IdCardModal from '@/components/idCard/IdCardModal'

const IdCardPage = () => {
  const { userInfo } = useSelector((state) => state.auth)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)

  const { data: idCards, isLoading, isError, error, refetch } = useGetIdCardsQuery()
  const { data: students } = useGetStudentsQuery()
  
  const [createIdCard, { isLoading: isCreating }] = useCreateIdCardMutation()
  const [updateIdCard, { isLoading: isUpdating }] = useUpdateIdCardMutation()
  const [deleteIdCard, { isLoading: isDeleting }] = useDeleteIdCardMutation()
  const [reprintIdCard, { isLoading: isReprinting }] = useReprintIdCardMutation()

  const filteredIdCards = useMemo(() => {
    if (!idCards) return []
    const list = Array.isArray(idCards) ? idCards : idCards.data || []
    return list.filter((card) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const student = students?.find((s) => s._id === card.student)
        const match =
          (student?.name || '').toLowerCase().includes(q) ||
          (card.cardNumber || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter !== 'all' && card.status !== statusFilter) return false
      return true
    })
  }, [idCards, searchTerm, statusFilter, students])

  const handleCreateIdCard = async (data) => {
    try {
      await createIdCard(data).unwrap()
      toast.success('ID card created successfully')
      setIsModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create ID card')
    }
  }

  const handleUpdateIdCard = async (data) => {
    try {
      await updateIdCard({ id: selectedCard._id, ...data }).unwrap()
      toast.success('ID card updated successfully')
      setIsModalOpen(false)
      setSelectedCard(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update ID card')
    }
  }

  const handleDeleteIdCard = async (card) => {
    if (!confirm(`Are you sure you want to delete this ID card?`)) return
    try {
      await deleteIdCard(card._id).unwrap()
      toast.success('ID card deleted successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete ID card')
    }
  }

  const handleReprintIdCard = async (card) => {
    try {
      await reprintIdCard(card._id).unwrap()
      toast.success('ID card reprint request submitted')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to request reprint')
    }
  }

  const openCreateModal = () => {
    setSelectedCard(null)
    setIsModalOpen(true)
  }

  const openEditModal = (card) => {
    setSelectedCard(card)
    setIsModalOpen(true)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>
      case 'lost':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Lost</Badge>
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error?.data?.message || 'Failed to load ID cards. Please try again.'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ID Card Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage student and staff ID cards
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Issue ID Card
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{idCards?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {idCards?.filter((c) => c.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {idCards?.filter((c) => c.status === 'expired').length || 0}
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
            <div className="text-2xl font-bold text-blue-600">
              {idCards?.filter((c) => c.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search ID cards..."
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Card Number</TableHead>
              <TableHead>Holder</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredIdCards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No ID cards found
                </TableCell>
              </TableRow>
            ) : (
              filteredIdCards.map((card) => {
                const student = students?.find((s) => s._id === card.student)
                return (
                  <TableRow key={card._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gray-500" />
                        <Badge variant="secondary">{card.cardNumber || 'N/A'}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <div className="font-medium text-gray-900 dark:text-white">
                          {student?.name || 'Unknown'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {card.type || 'Student'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {card.issueDate ? new Date(card.issueDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {card.expiryDate ? new Date(card.expiryDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(card.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(card)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReprintIdCard(card)}>
                            <Printer className="h-4 w-4 mr-2" />
                            Reprint
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteIdCard(card)}
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

      {/* ID Card Modal */}
      <IdCardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCard(null)
        }}
        onSubmit={selectedCard ? handleUpdateIdCard : handleCreateIdCard}
        defaultValues={selectedCard}
        isEdit={!!selectedCard}
        isLoading={isCreating || isUpdating}
        students={students}
      />
    </div>
  )
}

export default IdCardPage
