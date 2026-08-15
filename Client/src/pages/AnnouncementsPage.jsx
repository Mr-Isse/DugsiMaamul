import React, { useState, useMemo } from 'react'
import {
  Megaphone,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  Calendar,
  Send,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  usePublishAnnouncementMutation,
  useUnpublishAnnouncementMutation,
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
import AnnouncementFormModal from '@/components/communication/AnnouncementFormModal'

const AnnouncementsPage = () => {
  const { userInfo } = useSelector((state) => state.auth)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [audienceFilter, setAudienceFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)

  const { data: announcements, isLoading, isError, error, refetch } = useGetAnnouncementsQuery()
  
  const [createAnnouncement, { isLoading: isCreating }] = useCreateAnnouncementMutation()
  const [updateAnnouncement, { isLoading: isUpdating }] = useUpdateAnnouncementMutation()
  const [deleteAnnouncement, { isLoading: isDeleting }] = useDeleteAnnouncementMutation()
  const [publishAnnouncement, { isLoading: isPublishing }] = usePublishAnnouncementMutation()
  const [unpublishAnnouncement, { isLoading: isUnpublishing }] = useUnpublishAnnouncementMutation()

  const filteredAnnouncements = useMemo(() => {
    if (!announcements) return []
    const list = Array.isArray(announcements) ? announcements : announcements.data || []
    return list.filter((a) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (a.title || '').toLowerCase().includes(q) ||
          (a.content || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter !== 'all') {
        if (statusFilter === 'published' && !a.isPublished) return false
        if (statusFilter === 'draft' && a.isPublished) return false
      }
      if (audienceFilter !== 'all' && a.audience !== audienceFilter) return false
      return true
    })
  }, [announcements, searchTerm, statusFilter, audienceFilter])

  const handleCreateAnnouncement = async (data) => {
    try {
      await createAnnouncement(data).unwrap()
      toast.success('Announcement created successfully')
      setIsModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create announcement')
    }
  }

  const handleUpdateAnnouncement = async (data) => {
    try {
      await updateAnnouncement({ id: selectedAnnouncement._id, ...data }).unwrap()
      toast.success('Announcement updated successfully')
      setIsModalOpen(false)
      setSelectedAnnouncement(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update announcement')
    }
  }

  const handleDeleteAnnouncement = async (announcement) => {
    if (!confirm(`Are you sure you want to delete "${announcement.title}"?`)) return
    try {
      await deleteAnnouncement(announcement._id).unwrap()
      toast.success('Announcement deleted successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete announcement')
    }
  }

  const handlePublishAnnouncement = async (announcement) => {
    try {
      await publishAnnouncement(announcement._id).unwrap()
      toast.success('Announcement published successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to publish announcement')
    }
  }

  const handleUnpublishAnnouncement = async (announcement) => {
    try {
      await unpublishAnnouncement(announcement._id).unwrap()
      toast.success('Announcement unpublished successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to unpublish announcement')
    }
  }

  const openCreateModal = () => {
    setSelectedAnnouncement(null)
    setIsModalOpen(true)
  }

  const openEditModal = (announcement) => {
    setSelectedAnnouncement(announcement)
    setIsModalOpen(true)
  }

  const getStatusBadge = (announcement) => {
    if (announcement.isPublished) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>
    }
    return <Badge variant="outline">Draft</Badge>
  }

  const getAudienceBadge = (audience) => {
    const colors = {
      all: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      students: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      teachers: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
      parents: 'bg-pink-100 text-pink-800 hover:bg-pink-100',
    }
    return (
      <Badge className={colors[audience] || 'bg-gray-100 text-gray-800 hover:bg-gray-100'}>
        {audience?.charAt(0).toUpperCase() + audience?.slice(1) || 'All'}
      </Badge>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error?.data?.message || 'Failed to load announcements. Please try again.'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Announcements</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create and manage school announcements
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements?.length || 0}</div>
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
              {announcements?.filter((a) => a.isPublished).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {announcements?.filter((a) => !a.isPublished).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search announcements..."
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
          <Select value={audienceFilter} onValueChange={setAudienceFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Audience</SelectItem>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="students">Students</SelectItem>
              <SelectItem value="teachers">Teachers</SelectItem>
              <SelectItem value="parents">Parents</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Audience</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Date</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredAnnouncements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No announcements found
                </TableCell>
              </TableRow>
            ) : (
              filteredAnnouncements.map((announcement) => (
                <TableRow key={announcement._id}>
                  <TableCell>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {announcement.title}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {announcement.content}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getAudienceBadge(announcement.audience)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={announcement.priority === 'urgent' ? 'destructive' : 'secondary'}
                    >
                      {announcement.priority?.charAt(0).toUpperCase() + announcement.priority?.slice(1) || 'Normal'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {announcement.date ? new Date(announcement.date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(announcement)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(announcement)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {!announcement.isPublished ? (
                          <DropdownMenuItem onClick={() => handlePublishAnnouncement(announcement)}>
                            <Send className="h-4 w-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleUnpublishAnnouncement(announcement)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Unpublish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteAnnouncement(announcement)}
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

      {/* Announcement Form Modal */}
      <AnnouncementFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedAnnouncement(null)
        }}
        onSubmit={selectedAnnouncement ? handleUpdateAnnouncement : handleCreateAnnouncement}
        defaultValues={selectedAnnouncement}
        isEdit={!!selectedAnnouncement}
        isLoading={isCreating || isUpdating}
      />
    </div>
  )
}

export default AnnouncementsPage
