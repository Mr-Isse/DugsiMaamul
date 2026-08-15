import React, { useState, useMemo } from 'react'
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  MoreVertical,
  Eye,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  usePublishEventMutation,
  useUnpublishEventMutation,
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
import EventFormModal from '@/components/events/EventFormModal'

const EventsPage = () => {
  const { userInfo } = useSelector((state) => state.auth)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  const { data: events, isLoading, isError, error, refetch } = useGetEventsQuery()
  
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation()
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation()
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation()
  const [publishEvent, { isLoading: isPublishing }] = usePublishEventMutation()
  const [unpublishEvent, { isLoading: isUnpublishing }] = useUnpublishEventMutation()

  const filteredEvents = useMemo(() => {
    if (!events) return []
    const list = Array.isArray(events) ? events : events.data || []
    return list.filter((e) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (e.title || '').toLowerCase().includes(q) ||
          (e.location || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter !== 'all') {
        if (statusFilter === 'published' && !e.isPublished) return false
        if (statusFilter === 'draft' && e.isPublished) return false
      }
      return true
    })
  }, [events, searchTerm, statusFilter])

  const handleCreateEvent = async (data) => {
    try {
      await createEvent(data).unwrap()
      toast.success('Event created successfully')
      setIsModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create event')
    }
  }

  const handleUpdateEvent = async (data) => {
    try {
      await updateEvent({ id: selectedEvent._id, ...data }).unwrap()
      toast.success('Event updated successfully')
      setIsModalOpen(false)
      setSelectedEvent(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update event')
    }
  }

  const handleDeleteEvent = async (event) => {
    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) return
    try {
      await deleteEvent(event._id).unwrap()
      toast.success('Event deleted successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete event')
    }
  }

  const handlePublishEvent = async (event) => {
    try {
      await publishEvent(event._id).unwrap()
      toast.success('Event published successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to publish event')
    }
  }

  const handleUnpublishEvent = async (event) => {
    try {
      await unpublishEvent(event._id).unwrap()
      toast.success('Event unpublished successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to unpublish event')
    }
  }

  const openCreateModal = () => {
    setSelectedEvent(null)
    setIsModalOpen(true)
  }

  const openEditModal = (event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const getStatusBadge = (event) => {
    if (event.isPublished) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>
    }
    return <Badge variant="outline">Draft</Badge>
  }

  const isUpcoming = (event) => {
    return new Date(event.startDate) > new Date()
  }

  const isPast = (event) => {
    return new Date(event.endDate) < new Date()
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error?.data?.message || 'Failed to load events. Please try again.'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Events</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage school events and activities
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {events?.filter((e) => isUpcoming(e)).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {events?.filter((e) => e.isPublished).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search events..."
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
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event) => (
                <TableRow key={event._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div className="font-medium text-gray-900 dark:text-white">
                        {event.title}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'N/A'}
                      </div>
                      {event.endDate && (
                        <div className="text-xs text-gray-400">
                          to {new Date(event.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {event.location || 'TBD'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {event.type || 'General'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(event)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(event)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {!event.isPublished ? (
                          <DropdownMenuItem onClick={() => handlePublishEvent(event)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleUnpublishEvent(event)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Unpublish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteEvent(event)}
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

      {/* Event Form Modal */}
      <EventFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedEvent(null)
        }}
        onSubmit={selectedEvent ? handleUpdateEvent : handleCreateEvent}
        defaultValues={selectedEvent}
        isEdit={!!selectedEvent}
        isLoading={isCreating || isUpdating}
      />
    </div>
  )
}

export default EventsPage
