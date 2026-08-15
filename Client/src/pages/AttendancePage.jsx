import React, { useState, useMemo } from 'react'
import {
  ClipboardCheck,
  Search,
  Calendar,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Download,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetAttendanceQuery,
  useGetClassesQuery,
  useGetStudentsQuery,
  useMarkClassAttendanceMutation,
  useGetAttendanceStatsQuery,
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import MarkAttendanceModal from '@/components/attendance/MarkAttendanceModal'

const AttendancePage = () => {
  const { selectedBranch } = useSelector((state) => state.branch)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [statusFilter, setStatusFilter] = useState('all')
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState(null)

  const { data: attendance, isLoading, isError, error, refetch } = useGetAttendanceQuery({
    date: dateFilter,
    classId: classFilter !== 'all' ? classFilter : undefined,
  })
  const { data: classes } = useGetClassesQuery()
  const { data: students } = useGetStudentsQuery()
  const { data: stats } = useGetAttendanceStatsQuery({
    date: dateFilter,
    classId: classFilter !== 'all' ? classFilter : undefined,
  })
  
  const [markClassAttendance, { isLoading: isMarking }] = useMarkClassAttendanceMutation()

  const filteredAttendance = useMemo(() => {
    if (!attendance) return []
    const list = Array.isArray(attendance) ? attendance : attendance.data || []
    return list.filter((a) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const student = students?.find((s) => s._id === a.student)
        const match =
          (student?.name || '').toLowerCase().includes(q) ||
          (student?.customId || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      return true
    })
  }, [attendance, searchTerm, statusFilter, students])

  const handleMarkAttendance = async (data) => {
    try {
      await markClassAttendance(data).unwrap()
      toast.success('Attendance marked successfully')
      setIsMarkModalOpen(false)
      setSelectedClass(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to mark attendance')
    }
  }

  const openMarkModal = (classData) => {
    setSelectedClass(classData)
    setIsMarkModalOpen(true)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Present</Badge>
      case 'absent':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Absent</Badge>
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Late</Badge>
      case 'excused':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Excused</Badge>
      default:
        return <Badge variant="outline">{status || 'Not Marked'}</Badge>
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            {error?.data?.message || 'Failed to load attendance. Please try again.'}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track and manage student attendance
          </p>
        </div>
        <Button onClick={() => openMarkModal(null)} className="gap-2">
          <ClipboardCheck className="h-4 w-4" />
          Mark Attendance
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Present
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.present || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Absent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.absent || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.rate ? `${stats.rate.toFixed(1)}%` : '0%'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-auto"
          />
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
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="excused">Excused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remarks</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredAttendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No attendance records found
                </TableCell>
              </TableRow>
            ) : (
              filteredAttendance.map((record) => {
                const student = students?.find((s) => s._id === record.student)
                const studentClass = classes?.find((c) => c._id === student?.class)
                return (
                  <TableRow key={record._id}>
                    <TableCell>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {student?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student?.customId || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {studentClass ? (
                        <Badge variant="outline">
                          {studentClass.name} - {studentClass.section}
                        </Badge>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(record.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        {getStatusBadge(record.status)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {record.remarks || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
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

      {/* Mark Attendance Modal */}
      <MarkAttendanceModal
        isOpen={isMarkModalOpen}
        onClose={() => {
          setIsMarkModalOpen(false)
          setSelectedClass(null)
        }}
        onSubmit={handleMarkAttendance}
        classes={classes}
        students={students}
        selectedClass={selectedClass}
        isLoading={isMarking}
      />
    </div>
  )
}

export default AttendancePage
