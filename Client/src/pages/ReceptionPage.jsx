import React, { useState, useMemo } from 'react'
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreVertical,
  MessageSquare,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetAppointmentsQuery,
  useGetInquiriesQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
  useCreateInquiryMutation,
  useUpdateInquiryMutation,
  useDeleteInquiryMutation,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import AppointmentModal from '@/components/reception/AppointmentModal'
import InquiryModal from '@/components/reception/InquiryModal'

const ReceptionPage = () => {
  const { userInfo } = useSelector((state) => state.auth)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('appointments')
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false)
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [selectedInquiry, setSelectedInquiry] = useState(null)

  const { data: appointments, isLoading: appointmentsLoading, isError: appointmentsError, refetch: refetchAppointments } = useGetAppointmentsQuery()
  const { data: inquiries, isLoading: inquiriesLoading, isError: inquiriesError, refetch: refetchInquiries } = useGetInquiriesQuery()
  
  const [createAppointment, { isLoading: isCreatingAppointment }] = useCreateAppointmentMutation()
  const [updateAppointment, { isLoading: isUpdatingAppointment }] = useUpdateAppointmentMutation()
  const [deleteAppointment, { isLoading: isDeletingAppointment }] = useDeleteAppointmentMutation()
  const [createInquiry, { isLoading: isCreatingInquiry }] = useCreateInquiryMutation()
  const [updateInquiry, { isLoading: isUpdatingInquiry }] = useUpdateInquiryMutation()
  const [deleteInquiry, { isLoading: isDeletingInquiry }] = useDeleteInquiryMutation()

  const filteredAppointments = useMemo(() => {
    if (!appointments) return []
    const list = Array.isArray(appointments) ? appointments : appointments.data || []
    return list.filter((apt) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (apt.name || '').toLowerCase().includes(q) ||
          (apt.purpose || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter !== 'all' && apt.status !== statusFilter) return false
      return true
    })
  }, [appointments, searchTerm, statusFilter])

  const filteredInquiries = useMemo(() => {
    if (!inquiries) return []
    const list = Array.isArray(inquiries) ? inquiries : inquiries.data || []
    return list.filter((inq) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (inq.name || '').toLowerCase().includes(q) ||
          (inq.subject || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter !== 'all' && inq.status !== statusFilter) return false
      return true
    })
  }, [inquiries, searchTerm, statusFilter])

  const handleCreateAppointment = async (data) => {
    try {
      await createAppointment(data).unwrap()
      toast.success('Appointment created successfully')
      setIsAppointmentModalOpen(false)
      refetchAppointments()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create appointment')
    }
  }

  const handleUpdateAppointment = async (data) => {
    try {
      await updateAppointment({ id: selectedAppointment._id, ...data }).unwrap()
      toast.success('Appointment updated successfully')
      setIsAppointmentModalOpen(false)
      setSelectedAppointment(null)
      refetchAppointments()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update appointment')
    }
  }

  const handleDeleteAppointment = async (appointment) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return
    try {
      await deleteAppointment(appointment._id).unwrap()
      toast.success('Appointment deleted successfully')
      refetchAppointments()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete appointment')
    }
  }

  const handleCreateInquiry = async (data) => {
    try {
      await createInquiry(data).unwrap()
      toast.success('Inquiry recorded successfully')
      setIsInquiryModalOpen(false)
      refetchInquiries()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to record inquiry')
    }
  }

  const handleUpdateInquiry = async (data) => {
    try {
      await updateInquiry({ id: selectedInquiry._id, ...data }).unwrap()
      toast.success('Inquiry updated successfully')
      setIsInquiryModalOpen(false)
      setSelectedInquiry(null)
      refetchInquiries()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update inquiry')
    }
  }

  const handleDeleteInquiry = async (inquiry) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return
    try {
      await deleteInquiry(inquiry._id).unwrap()
      toast.success('Inquiry deleted successfully')
      refetchInquiries()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete inquiry')
    }
  }

  const openCreateAppointmentModal = () => {
    setSelectedAppointment(null)
    setIsAppointmentModalOpen(true)
  }

  const openEditAppointmentModal = (appointment) => {
    setSelectedAppointment(appointment)
    setIsAppointmentModalOpen(true)
  }

  const openCreateInquiryModal = () => {
    setSelectedInquiry(null)
    setIsInquiryModalOpen(true)
  }

  const openEditInquiryModal = (inquiry) => {
    setSelectedInquiry(inquiry)
    setIsInquiryModalOpen(true)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (appointmentsError || inquiriesError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            Failed to load reception data. Please try again.
          </p>
          <Button onClick={() => { refetchAppointments(); refetchInquiries() }} className="mt-2" variant="outline" size="sm">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Front Desk / Reception</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage appointments and inquiries
          </p>
        </div>
        {activeTab === 'appointments' ? (
          <Button onClick={openCreateAppointmentModal} className="gap-2">
            <Plus className="h-4 w-4" />
            New Appointment
          </Button>
        ) : (
          <Button onClick={openCreateInquiryModal} className="gap-2">
            <Plus className="h-4 w-4" />
            New Inquiry
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Appointments Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointments?.filter((a) => {
                const today = new Date().toDateString()
                return new Date(a.date).toDateString() === today
              }).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Pending Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {inquiries?.filter((i) => i.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {(appointments?.filter((a) => {
                const now = new Date()
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                return new Date(a.date) >= weekAgo
              }).length || 0) + (inquiries?.filter((i) => {
                const now = new Date()
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                return new Date(i.createdAt) >= weekAgo
              }).length || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(appointments?.length || 0) + (inquiries?.length || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
        </TabsList>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateAppointmentModal} className="gap-2">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointmentsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No appointments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <div className="font-medium text-gray-900 dark:text-white">
                            {appointment.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {appointment.purpose || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {appointment.date ? new Date(appointment.date).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {appointment.time || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {appointment.phone || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(appointment.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditAppointmentModal(appointment)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteAppointment(appointment)}
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
        </TabsContent>

        {/* Inquiries Tab */}
        <TabsContent value="inquiries" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateInquiryModal} className="gap-2">
              <Plus className="h-4 w-4" />
              New Inquiry
            </Button>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiriesLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredInquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No inquiries found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInquiries.map((inquiry) => (
                    <TableRow key={inquiry._id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-500" />
                          <div className="font-medium text-gray-900 dark:text-white">
                            {inquiry.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {inquiry.subject || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {inquiry.phone || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(inquiry.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditInquiryModal(inquiry)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteInquiry(inquiry)}
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
        </TabsContent>
      </Tabs>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => {
          setIsAppointmentModalOpen(false)
          setSelectedAppointment(null)
        }}
        onSubmit={selectedAppointment ? handleUpdateAppointment : handleCreateAppointment}
        defaultValues={selectedAppointment}
        isEdit={!!selectedAppointment}
        isLoading={isCreatingAppointment || isUpdatingAppointment}
      />

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => {
          setIsInquiryModalOpen(false)
          setSelectedInquiry(null)
        }}
        onSubmit={selectedInquiry ? handleUpdateInquiry : handleCreateInquiry}
        defaultValues={selectedInquiry}
        isEdit={!!selectedInquiry}
        isLoading={isCreatingInquiry || isUpdatingInquiry}
      />
    </div>
  )
}

export default ReceptionPage
