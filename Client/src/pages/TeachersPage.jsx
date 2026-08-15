import React, { useState, useMemo } from 'react'
import {
  Users,
  Plus,
  Search,
  FileSpreadsheet,
  Upload,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Key,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import {
  useGetTeachersQuery,
  useGetBranchesQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import TeacherFormModal from '@/components/teachers/TeacherFormModal'
import PasswordResetModal from '@/components/teachers/PasswordResetModal'
import BulkImportModal from '@/components/teachers/BulkImportModal'

const TeachersPage = () => {
  const { selectedBranch } = useSelector((state) => state.branch)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const { data: teachers, isLoading, isError, error, refetch } = useGetTeachersQuery()
  const { data: branches } = useGetBranchesQuery()
  
  const [createTeacher, { isLoading: isCreating }] = useCreateTeacherMutation()
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation()
  const [deleteTeacher, { isLoading: isDeleting }] = useDeleteTeacherMutation()

  const filteredTeachers = useMemo(() => {
    if (!teachers) return []
    const list = Array.isArray(teachers) ? teachers : teachers.data || []
    return list.filter((t) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (t.name || '').toLowerCase().includes(q) ||
          (t.customId || '').toLowerCase().includes(q) ||
          (t.phone || '').includes(q) ||
          (t.email || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (subjectFilter !== 'all') {
        const subjects = t.subjects || []
        if (!subjects.some((s) => s._id === subjectFilter || s.name === subjectFilter)) return false
      }
      if (branchFilter !== 'all') {
        const tbId = typeof t.branch === 'object' ? t.branch?._id : t.branch
        if (tbId !== branchFilter) return false
      }
      return true
    })
  }, [teachers, searchTerm, subjectFilter, branchFilter])

  const teacherKpis = useMemo(() => {
    const list = Array.isArray(teachers) ? teachers : teachers?.data || []
    const total = list.length
    const male = list.filter((t) => (t.gender || '').toLowerCase() === 'male').length
    const female = list.filter((t) => (t.gender || '').toLowerCase() === 'female').length
    const withSubjects = list.filter((t) => t.subjects && t.subjects.length > 0).length
    return { total, male, female, withSubjects }
  }, [teachers])

  const formatNumber = (v) => new Intl.NumberFormat('en-US').format(v || 0)

  const handleDeleteTeacher = async (teacher) => {
    if (!confirm(`Are you sure you want to delete ${teacher.name}?`)) return
    try {
      await deleteTeacher(teacher._id).unwrap()
      toast.success('Teacher deleted successfully')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete teacher')
    }
  }

  const handleExport = (format) => {
    if (filteredTeachers.length === 0) {
      toast.error('No teachers to export')
      return
    }

    const data = filteredTeachers.map((t) => ({
      'Teacher ID': t.customId,
      'Name': t.name,
      'Phone': t.phone || '',
      'Email': t.email || '',
      'Gender': t.gender || '',
      'Subjects': t.subjects?.map((s) => s.name).join(', ') || '',
      'Branch': t.branch?.name || 'Main',
      'Status': t.status || 'active',
    }))

    if (format === 'excel' || format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Teachers')
      XLSX.writeFile(wb, `teachers_export.${format === 'excel' ? 'xlsx' : 'csv'}`)
      toast.success(`Exported ${filteredTeachers.length} teachers to ${format.toUpperCase()}`)
    }
  }

  const handleCreateTeacher = async (data) => {
    try {
      await createTeacher(data).unwrap()
      toast.success('Teacher created successfully')
      setIsModalOpen(false)
      setSelectedTeacher(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create teacher')
    }
  }

  const handleUpdateTeacher = async (data) => {
    try {
      await updateTeacher({ id: selectedTeacher._id, ...data }).unwrap()
      toast.success('Teacher updated successfully')
      setIsModalOpen(false)
      setSelectedTeacher(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update teacher')
    }
  }

  const handleEditClick = (teacher) => {
    setSelectedTeacher(teacher)
    setIsModalOpen(true)
  }

  const handleAddTeacher = () => {
    setSelectedTeacher(null)
    setIsModalOpen(true)
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Failed to load teachers</p>
          <p className="text-sm text-gray-500 mt-1">{error?.data?.message || 'There was a problem fetching teacher records'}</p>
          <Button onClick={refetch} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teachers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage teacher records, subject assignments, and credentials
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
            <Upload size={16} className="mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
            <FileSpreadsheet size={16} className="mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsPasswordModalOpen(true)}>
            <Key size={16} className="mr-2" />
            Reset Passwords
          </Button>
          <Button size="sm" onClick={handleAddTeacher}>
            <Plus size={16} className="mr-2" />
            Add Teacher
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatNumber(teacherKpis.total)}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Male Teachers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatNumber(teacherKpis.male)}</p>
              <p className="text-xs text-gray-400 mt-1">
                {teacherKpis.total > 0 ? Math.round((teacherKpis.male / teacherKpis.total) * 100) : 0}% of total
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <Users size={24} className="text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Female Teachers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatNumber(teacherKpis.female)}</p>
              <p className="text-xs text-gray-400 mt-1">
                {teacherKpis.total > 0 ? Math.round((teacherKpis.female / teacherKpis.total) * 100) : 0}% of total
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center">
              <Users size={24} className="text-fuchsia-600 dark:text-fuchsia-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">With Subjects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatNumber(teacherKpis.withSubjects)}</p>
              <p className="text-xs text-gray-400 mt-1">
                {teacherKpis.total > 0 ? Math.round((teacherKpis.withSubjects / teacherKpis.total) * 100) : 0}% assigned
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Users size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search by name, ID, phone, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {/* Will be populated from subjects data */}
              </SelectContent>
            </Select>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {(branches?.data || branches || []).map((b) => (
                  <SelectItem key={b._id} value={b._id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                {!selectedBranch && <TableHead>Branch</TableHead>}
                <TableHead>Subjects</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : filteredTeachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <p className="text-gray-500">No teachers found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTeachers.map((teacher) => (
                  <TableRow key={teacher._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={teacher.imageUrl} />
                          <AvatarFallback className="bg-slate-100 text-slate-500">
                            {teacher.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{teacher.name}</p>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400">{teacher.customId}</p>
                        </div>
                      </div>
                    </TableCell>
                    {!selectedBranch && (
                      <TableCell>
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                          {teacher.branch?.name || 'Main'}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects?.slice(0, 2).map((subject) => (
                          <Badge key={subject._id} variant="outline" className="text-xs">
                            {subject.name}
                          </Badge>
                        ))}
                        {teacher.subjects?.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{teacher.subjects.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{teacher.gender || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>{teacher.phone || 'N/A'}</p>
                        <p className="text-xs">{teacher.email || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={(teacher.status || 'active') === 'active' ? 'default' : 'destructive'}
                      >
                        {teacher.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye size={14} className="mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(teacher)}>
                            <Edit2 size={14} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Key size={14} className="mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteTeacher(teacher)}
                          >
                            <Trash2 size={14} className="mr-2" />
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
      </div>

      {/* Teacher Form Modal */}
      <TeacherFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedTeacher(null)
        }}
        onSubmit={selectedTeacher ? handleUpdateTeacher : handleCreateTeacher}
        defaultValues={selectedTeacher}
        isEdit={!!selectedTeacher}
      />

      {/* Password Reset Modal */}
      <PasswordResetModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  )
}

export default TeachersPage
