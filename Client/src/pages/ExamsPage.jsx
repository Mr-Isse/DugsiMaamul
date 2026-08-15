import React, { useState, useMemo } from 'react'
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  MoreVertical,
  Calendar,
  Clock,
  Users,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetExamsQuery,
  useGetClassesQuery,
  useGetSubjectsQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
  usePublishExamMutation,
  useUnpublishExamMutation,
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
import ExamFormModal from '@/components/exams/ExamFormModal'

const ExamsPage = () => {
  const { selectedBranch } = useSelector((state) => state.branch)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedExam, setSelectedExam] = useState(null)

  const { data: exams, isLoading, isError, error, refetch } = useGetExamsQuery()
  const { data: classes } = useGetClassesQuery()
  const { data: subjects } = useGetSubjectsQuery()
  
  const [createExam, { isLoading: isCreating }] = useCreateExamMutation()
  const [updateExam, { isLoading: isUpdating }] = useUpdateExamMutation()
  const [deleteExam, { isLoading: isDeleting }] = useDeleteExamMutation()
  const [publishExam, { isLoading: isPublishing }] = usePublishExamMutation()
  const [unpublishExam, { isLoading: isUnpublishing }] = useUnpublishExamMutation()

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
      if (classFilter !== 'all' && e.class !== classFilter) return false
      if (statusFilter !== 'all') {
        if (statusFilter === 'published' && !e.isPublished) return false
        if (statusFilter === 'draft' && e.isPublished) return false
      }
      return true
    })
  }, [exams, searchTerm, classFilter, statusFilter])

  const handleCreateExam = async (data) => {
    try {
      await createExam(data).unwrap()
      toast.success('Exam created successfully')
      setIsModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create exam')
    }
  }

  const handleUpdateExam = async (data) => {
    try {
      await updateExam({ id: selectedExam._id, ...data }).unwrap()
      toast.success('Exam updated successfully')
      setIsModalOpen(false)
      setSelectedExam(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update exam')
    }
  }

  const handleDeleteExam = async (exam) => {
    if (!confirm(`Are you sure you want to delete "${exam.name}"?`)) return
    try {
      await deleteExam(exam._id).unwrap()
      toast.success('Exam deleted successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete exam')
    }
  }

  const handlePublishExam = async (exam) => {
    try {
      await publishExam(exam._id).unwrap()
      toast.success('Exam published successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to publish exam')
    }
  }

  const handleUnpublishExam = async (exam) => {
    try {
      await unpublishExam(exam._id).unwrap()
      toast.success('Exam unpublished successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to unpublish exam')
    }
  }

  const openCreateModal = () => {
    setSelectedExam(null)
    setIsModalOpen(true)
  }

  const openEditModal = (exam) => {
    setSelectedExam(exam)
    setIsModalOpen(true)
  }

  const getStatusBadge = (exam) => {
    if (exam.isPublished) {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Published</Badge>
    }
    return <Badge variant="outline">Draft</Badge>
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error?.data?.message || 'Failed to load exams. Please try again.'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exams</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage exams and assessments
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Exam
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Exams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams?.length || 0}</div>
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
              {exams?.filter((e) => e.isPublished).length || 0}
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
              {exams?.filter((e) => !e.isPublished).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
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
        <div className="flex gap-2">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes?.map((c) => (
                <SelectItem key={c._id} value={c._id}>
                  {c.name} - {c.section}
                </SelectItem>
              ))}
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
              <TableHead>Exam Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Subject</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredExams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No exams found
                </TableCell>
              </TableRow>
            ) : (
              filteredExams.map((exam) => (
                <TableRow key={exam._id}>
                  <TableCell>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {exam.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{exam.code || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    {classes?.find((c) => c._id === exam.class) ? (
                      <Badge variant="outline">
                        {classes.find((c) => c._id === exam.class).name} -{' '}
                        {classes.find((c) => c._id === exam.class).section}
                      </Badge>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    {subjects?.find((s) => s._id === exam.subject)?.name || 'N/A'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {exam.examDate ? new Date(exam.examDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(exam)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(exam)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {!exam.isPublished ? (
                          <DropdownMenuItem onClick={() => handlePublishExam(exam)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleUnpublishExam(exam)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Unpublish
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

      {/* Exam Form Modal */}
      <ExamFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedExam(null)
        }}
        onSubmit={selectedExam ? handleUpdateExam : handleCreateExam}
        defaultValues={selectedExam}
        isEdit={!!selectedExam}
        isLoading={isCreating || isUpdating}
        classes={classes}
        subjects={subjects}
      />
    </div>
  )
}

export default ExamsPage
