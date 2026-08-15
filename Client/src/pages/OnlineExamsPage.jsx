import React, { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  Calendar,
  Clock,
  Users,
  Laptop,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetOnlineExamsQuery,
  useGetOnlineExamQuery,
  useCreateOnlineExamMutation,
  useUpdateOnlineExamMutation,
  useDeleteOnlineExamMutation,
  usePublishOnlineExamMutation,
  useStartOnlineExamMutation,
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
import OnlineExamFormModal from '@/components/exams/OnlineExamFormModal'

const OnlineExamsPage = () => {
  const { selectedBranch } = useSelector((state) => state.branch)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)

  const { data: exams, isLoading, isError, error, refetch } = useGetOnlineExamsQuery()
  
  const [createExam, { isLoading: isCreating }] = useCreateOnlineExamMutation()
  const [updateExam, { isLoading: isUpdating }] = useUpdateOnlineExamMutation()
  const [deleteExam, { isLoading: isDeleting }] = useDeleteOnlineExamMutation()
  const [publishExam, { isLoading: isPublishing }] = usePublishOnlineExamMutation()
  const [startExam, { isLoading: isStarting }] = useStartOnlineExamMutation()

  const filteredExams = useMemo(() => {
    if (!exams) return []
    const list = Array.isArray(exams) ? exams : exams.data || []
    return list.filter((e) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (e.name || '').toLowerCase().includes(q) ||
          (e.code || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter !== 'all') {
        if (statusFilter === 'published' && e.status !== 'Published') return false
        if (statusFilter === 'draft' && e.status !== 'Draft') return false
        if (statusFilter === 'active' && e.status !== 'In_Progress') return false
        if (statusFilter === 'completed' && e.status !== 'Completed') return false
      }
      return true
    })
  }, [exams, searchTerm, statusFilter])

  const handleCreateExam = async (data) => {
    try {
      await createExam(data).unwrap()
      toast.success('Online exam created successfully')
      setIsModalOpen(false)
      setSelectedExam(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create online exam')
    }
  }

  const handleUpdateExam = async (data) => {
    try {
      await updateExam({ id: selectedExam._id, ...data }).unwrap()
      toast.success('Online exam updated successfully')
      setIsModalOpen(false)
      setSelectedExam(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update online exam')
    }
  }

  const handleDeleteExam = async (exam) => {
    if (!confirm(`Are you sure you want to delete ${exam.name}?`)) return
    try {
      await deleteExam(exam._id).unwrap()
      toast.success('Online exam deleted successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete online exam')
    }
  }

  const handlePublishExam = async (exam) => {
    try {
      await publishExam(exam._id).unwrap()
      toast.success('Online exam published successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to publish online exam')
    }
  }

  const handleStartExam = async (exam) => {
    try {
      await startExam(exam._id).unwrap()
      toast.success('Online exam started successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to start online exam')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-700'
      case 'Scheduled': return 'bg-blue-100 text-blue-700'
      case 'Published': return 'bg-green-100 text-green-700'
      case 'In_Progress': return 'bg-yellow-100 text-yellow-700'
      case 'Completed': return 'bg-purple-100 text-purple-700'
      case 'Cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const examKpis = useMemo(() => {
    const list = Array.isArray(exams) ? exams : exams?.data || []
    const total = list.length
    const published = list.filter((e) => e.status === 'Published').length
    const inProgress = list.filter((e) => e.status === 'In_Progress').length
    const completed = list.filter((e) => e.status === 'Completed').length
    return { total, published, inProgress, completed }
  }, [exams])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Online Exams</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage online examinations</p>
        </div>
        <Button className="gap-2" onClick={() => setSelectedExam(null) || setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Exam
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{examKpis.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{examKpis.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{examKpis.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{examKpis.completed}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="max-w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="active">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Duration</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredExams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No online exams found
                </TableCell>
              </TableRow>
            ) : (
              filteredExams.map((exam) => (
                <TableRow key={exam._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{exam.name}</div>
                      <div className="text-sm text-gray-500">{exam.code}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{exam.class?.name || 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{exam.subject?.name || 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{exam.date ? new Date(exam.date).toLocaleDateString() : 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{exam.duration || 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(exam.status)}>
                      {exam.status || 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedExam(exam) || setIsModalOpen(true)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {exam.status === 'Published' && (
                          <DropdownMenuItem onClick={() => handleStartExam(exam)}>
                            <Laptop className="h-4 w-4 mr-2" />
                            Start Exam
                          </DropdownMenuItem>
                        )}
                        {exam.status === 'Draft' && (
                          <DropdownMenuItem onClick={() => handlePublishExam(exam)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteExam(exam)}
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
        <OnlineExamFormModal
          isOpen={isModalOpen}
          initial={selectedExam}
          isEdit={Boolean(selectedExam)}
          onClose={() => setIsModalOpen(false) || setSelectedExam(null)}
          onSubmit={selectedExam ? handleUpdateExam : handleCreateExam}
          isLoading={isCreating || isUpdating}
        />
      )}
    </div>
  )
}

export default OnlineExamsPage