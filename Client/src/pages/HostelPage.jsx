import React, { useState, useMemo } from 'react'
import {
  Building,
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreVertical,
  Bed,
  Users,
  UserMinus,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetRoomsQuery,
  useGetStudentsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useAssignStudentToRoomMutation,
  useRemoveStudentFromRoomMutation,
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
import RoomFormModal from '@/components/hostel/RoomFormModal'
import AssignStudentModal from '@/components/hostel/AssignStudentModal'

const HostelPage = () => {
  const { userInfo } = useSelector((state) => state.auth)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState(null)

  const { data: rooms, isLoading, isError, error, refetch } = useGetRoomsQuery()
  const { data: students } = useGetStudentsQuery()
  
  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation()
  const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomMutation()
  const [deleteRoom, { isLoading: isDeleting }] = useDeleteRoomMutation()
  const [assignStudent, { isLoading: isAssigning }] = useAssignStudentToRoomMutation()
  const [removeStudent, { isLoading: isRemoving }] = useRemoveStudentFromRoomMutation()

  const filteredRooms = useMemo(() => {
    if (!rooms) return []
    const list = Array.isArray(rooms) ? rooms : rooms.data || []
    return list.filter((r) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (r.name || '').toLowerCase().includes(q) ||
          (r.building || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter !== 'all') {
        if (statusFilter === 'available' && r.occupied >= r.capacity) return false
        if (statusFilter === 'full' && r.occupied < r.capacity) return false
      }
      return true
    })
  }, [rooms, searchTerm, statusFilter])

  const handleCreateRoom = async (data) => {
    try {
      await createRoom(data).unwrap()
      toast.success('Room created successfully')
      setIsModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create room')
    }
  }

  const handleUpdateRoom = async (data) => {
    try {
      await updateRoom({ id: selectedRoom._id, ...data }).unwrap()
      toast.success('Room updated successfully')
      setIsModalOpen(false)
      setSelectedRoom(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update room')
    }
  }

  const handleDeleteRoom = async (room) => {
    if (!confirm(`Are you sure you want to delete room "${room.name}"?`)) return
    try {
      await deleteRoom(room._id).unwrap()
      toast.success('Room deleted successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete room')
    }
  }

  const handleAssignStudent = async (data) => {
    try {
      await assignStudent(data).unwrap()
      toast.success('Student assigned successfully')
      setIsAssignModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to assign student')
    }
  }

  const handleRemoveStudent = async (room, studentId) => {
    if (!confirm('Remove this student from the room?')) return
    try {
      await removeStudent({ roomId: room._id, studentId }).unwrap()
      toast.success('Student removed successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to remove student')
    }
  }

  const openCreateModal = () => {
    setSelectedRoom(null)
    setIsModalOpen(true)
  }

  const openEditModal = (room) => {
    setSelectedRoom(room)
    setIsModalOpen(true)
  }

  const openAssignModal = (room) => {
    setSelectedRoom(room)
    setIsAssignModalOpen(true)
  }

  const getOccupancyBadge = (room) => {
    const isFull = room.occupied >= room.capacity
    if (isFull) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Full</Badge>
    }
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Available</Badge>
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error?.data?.message || 'Failed to load rooms. Please try again.'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hostel Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage hostel rooms and student assignments
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Room
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rooms?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {rooms?.filter((r) => r.occupied < r.capacity).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Occupied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {rooms?.filter((r) => r.occupied > 0).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rooms?.reduce((sum, r) => sum + (r.occupied || 0), 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search rooms..."
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
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="full">Full</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room</TableHead>
              <TableHead>Building</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Occupied</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredRooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No rooms found
                </TableCell>
              </TableRow>
            ) : (
              filteredRooms.map((room) => (
                <TableRow key={room._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <div className="font-medium text-gray-900 dark:text-white">
                        {room.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {room.building || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{room.floor || '1'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{room.capacity || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{room.occupied || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getOccupancyBadge(room)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(room)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {room.occupied < room.capacity && (
                          <DropdownMenuItem onClick={() => openAssignModal(room)}>
                            <Users className="h-4 w-4 mr-2" />
                            Assign Student
                          </DropdownMenuItem>
                        )}
                        {room.occupied > 0 && (
                          <DropdownMenuItem onClick={() => handleRemoveStudent(room, room.students?.[0]?._id)}>
                            <UserMinus className="h-4 w-4 mr-2" />
                            Remove Student
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteRoom(room)}
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

      {/* Room Form Modal */}
      <RoomFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedRoom(null)
        }}
        onSubmit={selectedRoom ? handleUpdateRoom : handleCreateRoom}
        defaultValues={selectedRoom}
        isEdit={!!selectedRoom}
        isLoading={isCreating || isUpdating}
      />

      {/* Assign Student Modal */}
      <AssignStudentModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false)
          setSelectedRoom(null)
        }}
        onSubmit={handleAssignStudent}
        room={selectedRoom}
        isLoading={isAssigning}
        students={students}
      />
    </div>
  )
}

export default HostelPage
