import React, { useState, useMemo } from 'react'
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Key,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  FileSpreadsheet,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import {
  useGetStudentsQuery,
  useGetClassesQuery,
  useGetBranchesQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
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
import StudentFormModal from '@/components/students/StudentFormModal'
import BulkImportModal from '@/components/students/BulkImportModal'
import CredentialsModal from '@/components/students/CredentialsModal'
import StudentProfileModal from '@/components/students/StudentProfileModal'

const StudentsPage = () => {
  const { selectedBranch } = useSelector((state) => state.branch)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [genderFilter, setGenderFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [branchFilter, setBranchFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [viewingStudent, setViewingStudent] = useState(null)

  const { data: students, isLoading, isError, error, refetch } = useGetStudentsQuery()
  const { data: classes } = useGetClassesQuery()
  const { data: branches } = useGetBranchesQuery()
  
  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation()
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation()
  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation()

  const filteredStudents = useMemo(() => {
    if (!students) return []
    const list = Array.isArray(students) ? students : students.data || []
    return list.filter((s) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (s.name || '').toLowerCase().includes(q) ||
          (s.customId || '').toLowerCase().includes(q) ||
          (s.phone || '').includes(q) ||
          (s.email || '').toLowerCase().includes(q) ||
          (s.parentName || '').toLowerCase().includes(q) ||
          (s.parentPhone || '').includes(q)
        if (!match) return false
      }
      if (classFilter !== 'all' && s.class?._id !== classFilter && s.class !== classFilter) return false
      if (genderFilter !== 'all' && (s.gender || '').toLowerCase() !== genderFilter) return false
      if (statusFilter !== 'all' && (s.status || 'active').toLowerCase() !== statusFilter) return false
      if (branchFilter !== 'all') {
        const sbId = typeof s.branch === 'object' ? s.branch?._id : s.branch
        if (sbId !== branchFilter) return false
      }
      return true
    })
  }, [students, searchTerm, classFilter, genderFilter, statusFilter, branchFilter])

  const studentKpis = useMemo(() => {
    const list = Array.isArray(students) ? students : students?.data || []
    const total = list.length
    const active = list.filter((s) => (s.status || 'active') === 'active').length
    const male = list.filter((s) => (s.gender || '').toLowerCase() === 'male').length
    const female = list.filter((s) => (s.gender || '').toLowerCase() === 'female').length
    return { total, active, male, female }
  }, [students])

  const formatNumber = (v) => new Intl.NumberFormat('en-US').format(v || 0)

  const handleCreateStudent = async (data) => {
    try {
      await createStudent(data).unwrap()
      toast.success('Student created successfully')
      setIsModalOpen(false)
      setSelectedStudent(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create student')
    }
  }

  const handleUpdateStudent = async (data) => {
    try {
      await updateStudent({ id: selectedStudent._id, ...data }).unwrap()
      toast.success('Student updated successfully')
      setIsModalOpen(false)
      setSelectedStudent(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update student')
    }
  }

  const handleDeleteStudent = async (student) => {
    if (!confirm(`Are you sure you want to delete ${student.name}?`)) return
    try {
      await deleteStudent(student._id).unwrap()
      toast.success('Student deleted successfully')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete student')
    }
  }

  const handleEditClick = (student) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

  const handleAddStudent = () => {
    setSelectedStudent(null)
    setIsModalOpen(true)
  }

  const handleViewProfile = (student) => {
    setViewingStudent(student)
    setIsProfileModalOpen(true)
  }

  const handleExport = (format) => {
    if (filteredStudents.length === 0) {
      toast.error('No students to export')
      return
    }

    const data = filteredStudents.map((s) => ({
      'Student ID': s.customId,
      'Name': s.name,
      'Phone': s.phone || '',
      'Email': s.email || '',
      'Gender': s.gender || '',
      'Class': s.class ? `${s.class.name} ${s.class.section}` : '',
      'Branch': s.branch?.name || 'Main',
      'Parent Name': s.parentName || '',
      'Parent Phone': s.parentPhone || '',
      'Monthly Fees': s.monthlyFees || 0,
      'Status': s.status || 'active',
    }))

    if (format === 'excel' || format === 'csv') {
      const ws = XLSX.utils.json_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Students')
      XLSX.writeFile(wb, `students_export.${format === 'excel' ? 'xlsx' : 'csv'}`)
      toast.success(`Exported ${filteredStudents.length} students to ${format.toUpperCase()}`)
    }
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Failed to load students</p>
          <p className="text-sm text-gray-500 mt-1">{error?.data?.message || 'There was a problem fetching student records'}</p>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage student records, profiles, and credentials
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
          <Button variant="outline" size="sm" onClick={() => setIsCredentialsModalOpen(true)}>
            <Key size={16} className="mr-2" />
            Credentials
          </Button>
          <Button size="sm" onClick={handleAddStudent}>
            <Plus size={16} className="mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatNumber(studentKpis.total)}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Users size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatNumber(studentKpis.active)}</p>
              <p className="text-xs text-gray-400 mt-1">
                {studentKpis.total > 0 ? Math.round((studentKpis.active / studentKpis.total) * 100) : 0}% active
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Users size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Male Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatNumber(studentKpis.male)}</p>
              <p className="text-xs text-gray-400 mt-1">
                {studentKpis.total > 0 ? Math.round((studentKpis.male / studentKpis.total) * 100) : 0}% of total
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Female Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatNumber(studentKpis.female)}</p>
              <p className="text-xs text-gray-400 mt-1">
                {studentKpis.total > 0 ? Math.round((studentKpis.female / studentKpis.total) * 100) : 0}% of total
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center">
              <Users size={24} className="text-fuchsia-600 dark:text-fuchsia-400" />
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
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes?.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name} {c.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
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
                <TableHead>Student</TableHead>
                {!selectedBranch && <TableHead>Branch</TableHead>}
                <TableHead>Class</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Fee</TableHead>
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
                    <TableCell><Skeleton className="h-10 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-10 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <p className="text-gray-500">No students found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={
                              student.imageUrl ||
                              (typeof student.profileImage === 'string'
                                ? student.profileImage
                                : student.profileImage?.url)
                            }
                          />
                          <AvatarFallback className="bg-slate-100 text-slate-500">
                            {student.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                          <p className="text-xs text-indigo-600 dark:text-indigo-400">{student.customId}</p>
                        </div>
                      </div>
                    </TableCell>
                    {!selectedBranch && (
                      <TableCell>
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                          {student.branch?.name || 'Main'}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge variant="secondary">{student.class?.name} {student.class?.section}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{student.gender || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p>{student.phone || 'N/A'}</p>
                        <p className="text-xs">{student.email || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ${student.monthlyFees || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={(student.status || 'active') === 'active' ? 'default' : 'destructive'}
                      >
                        {student.status || 'active'}
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
                          <DropdownMenuItem onClick={() => handleViewProfile(student)}>
                            <Eye size={14} className="mr-2" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(student)}>
                            <Edit2 size={14} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Key size={14} className="mr-2" />
                            Generate Credentials
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteStudent(student)}
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

      {/* Student Form Modal */}
      <StudentFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedStudent(null)
        }}
        onSubmit={selectedStudent ? handleUpdateStudent : handleCreateStudent}
        defaultValues={selectedStudent}
        isEdit={!!selectedStudent}
      />

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />

      {/* Credentials Modal */}
      <CredentialsModal
        isOpen={isCredentialsModalOpen}
        onClose={() => setIsCredentialsModalOpen(false)}
      />

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false)
          setViewingStudent(null)
        }}
        student={viewingStudent}
      />
    </div>
  )
}

export default StudentsPage
