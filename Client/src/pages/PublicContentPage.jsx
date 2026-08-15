import React, { useState, useMemo } from 'react'
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  Globe,
  Calendar,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetPublicContentQuery,
  useCreateContentPageMutation,
  useUpdateContentPageMutation,
  useDeleteContentPageMutation,
  usePublishContentPageMutation,
  useUnpublishContentPageMutation,
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
import ContentFormModal from '@/components/content/ContentFormModal'

const PublicContentPage = () => {
  const { userInfo } = useSelector((state) => state.auth)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedContent, setSelectedContent] = useState(null)

  const { data: content, isLoading, isError, error, refetch } = useGetPublicContentQuery()
  
  const [createContent, { isLoading: isCreating }] = useCreateContentPageMutation()
  const [updateContent, { isLoading: isUpdating }] = useUpdateContentPageMutation()
  const [deleteContent, { isLoading: isDeleting }] = useDeleteContentPageMutation()
  const [publishContent, { isLoading: isPublishing }] = usePublishContentPageMutation()
  const [unpublishContent, { isLoading: isUnpublishing }] = useUnpublishContentPageMutation()

  const filteredContent = useMemo(() => {
    if (!content) return []
    const list = Array.isArray(content) ? content : content.data || []
    return list.filter((c) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (c.title || '').toLowerCase().includes(q) ||
          (c.slug || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (typeFilter !== 'all' && c.type !== typeFilter) return false
      if (statusFilter !== 'all') {
        if (statusFilter === 'published' && !c.isPublished) return false
        if (statusFilter === 'draft' && c.isPublished) return false
      }
      return true
    })
  }, [content, searchTerm, typeFilter, statusFilter])

  const handleCreateContent = async (data) => {
    try {
      await createContent(data).unwrap()
      toast.success('Content page created successfully')
      setIsModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create content page')
    }
  }

  const handleUpdateContent = async (data) => {
    try {
      await updateContent({ id: selectedContent._id, ...data }).unwrap()
      toast.success('Content page updated successfully')
      setIsModalOpen(false)
      setSelectedContent(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update content page')
    }
  }

  const handleDeleteContent = async (contentItem) => {
    if (!confirm(`Are you sure you want to delete "${contentItem.title}"?`)) return
    try {
      await deleteContent(contentItem._id).unwrap()
      toast.success('Content page deleted successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete content page')
    }
  }

  const handlePublishContent = async (contentItem) => {
    try {
      await publishContent(contentItem._id).unwrap()
      toast.success('Content page published successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to publish content page')
    }
  }

  const handleUnpublishContent = async (contentItem) => {
    try {
      await unpublishContent(contentItem._id).unwrap()
      toast.success('Content page unpublished successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to unpublish content page')
    }
  }

  const openCreateModal = () => {
    setSelectedContent(null)
    setIsModalOpen(true)
  }

  const openEditModal = (contentItem) => {
    setSelectedContent(contentItem)
    setIsModalOpen(true)
  }

  const getStatusBadge = (contentItem) => {
    if (contentItem.isPublished) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>
    }
    return <Badge variant="outline">Draft</Badge>
  }

  const getTypeBadge = (type) => {
    const colors = {
      page: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      news: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      event: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
      policy: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    }
    return (
      <Badge className={colors[type] || 'bg-gray-100 text-gray-800 hover:bg-gray-100'}>
        {type?.charAt(0).toUpperCase() + type?.slice(1) || 'Page'}
      </Badge>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error?.data?.message || 'Failed to load content pages. Please try again.'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Public Content</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage public-facing pages and content
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Page
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{content?.length || 0}</div>
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
              {content?.filter((c) => c.isPublished).length || 0}
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
              {content?.filter((c) => !c.isPublished).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="page">Page</SelectItem>
              <SelectItem value="news">News</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="policy">Policy</SelectItem>
            </SelectContent>
          </Select>
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
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last Updated</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredContent.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No content pages found
                </TableCell>
              </TableRow>
            ) : (
              filteredContent.map((contentItem) => (
                <TableRow key={contentItem._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div className="font-medium text-gray-900 dark:text-white">
                        {contentItem.title}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      <Globe className="h-3 w-3 mr-1" />
                      /{contentItem.slug}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getTypeBadge(contentItem.type)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {contentItem.updatedAt ? new Date(contentItem.updatedAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(contentItem)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(contentItem)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {!contentItem.isPublished ? (
                          <DropdownMenuItem onClick={() => handlePublishContent(contentItem)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleUnpublishContent(contentItem)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Unpublish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteContent(contentItem)}
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

      {/* Content Form Modal */}
      <ContentFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedContent(null)
        }}
        onSubmit={selectedContent ? handleUpdateContent : handleCreateContent}
        defaultValues={selectedContent}
        isEdit={!!selectedContent}
        isLoading={isCreating || isUpdating}
      />
    </div>
  )
}

export default PublicContentPage
