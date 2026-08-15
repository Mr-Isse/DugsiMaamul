import React, { useState, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  BookOpen,
  Calendar,
  RefreshCw,
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { Chart } from '@/components/ui/chart'
import {
  useGetStatsQuery,
  useGetStudentsQuery,
  useGetTeachersQuery,
  useGetClassesQuery,
} from '@/services/api'

const AnalyticsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState('30d')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)

  const { data: stats, isLoading: statsLoading, refetch } = useGetStatsQuery()
  const { data: studentsData } = useGetStudentsQuery()
  const { data: teachersData } = useGetTeachersQuery()
  const { data: classesData } = useGetClassesQuery()

  const students = Array.isArray(studentsData) ? studentsData : studentsData?.data || []
  const teachers = Array.isArray(teachersData) ? teachersData : teachersData?.data || []
  const classes = Array.isArray(classesData) ? classesData : classesData?.data || []

  const chartData = useMemo(() => {
    if (!stats) return []
    return [
      { name: 'Students', value: stats.students || 0, color: '#6366f1' },
      { name: 'Teachers', value: stats.teachers || 0, color: '#10b981' },
      { name: 'Classes', value: stats.classes || 0, color: '#f59e0b' },
      { name: 'Parents', value: stats.parents || 0, color: '#ec4899' },
    ]
  }, [stats])

  const attendanceData = useMemo(() => {
    return [
      { month: 'Jan', present: 85, absent: 15 },
      { month: 'Feb', present: 88, absent: 12 },
      { month: 'Mar', present: 92, absent: 8 },
      { month: 'Apr', present: 90, absent: 10 },
      { month: 'May', present: 87, absent: 13 },
      { month: 'Jun', present: 95, absent: 5 },
    ]
  }, [])

  const financialData = useMemo(() => {
    return [
      { month: 'Jan', revenue: 45000, expenses: 32000 },
      { month: 'Feb', revenue: 48000, expenses: 35000 },
      { month: 'Mar', revenue: 52000, expenses: 38000 },
      { month: 'Apr', revenue: 49000, expenses: 36000 },
      { month: 'May', revenue: 55000, expenses: 40000 },
      { month: 'Jun', revenue: 58000, expenses: 42000 },
    ]
  }, [])

  const filteredStudents = useMemo(() => {
    if (!students) return []
    return students.filter((student) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (student.name || '').toLowerCase().includes(q) ||
          (student.email || '').toLowerCase().includes(q) ||
          (student.class?.name || '').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [students, searchTerm])

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditRecord(record)
    setIsModalOpen(true)
  }

  const handleDelete = (record) => {
    toast.success('Record deleted successfully')
  }

  const AnalyticsModal = ({ initial, onClose }) => {
    const [form, setForm] = useState({
      title: initial?.title || '',
      type: initial?.type || 'Student',
      value: initial?.value || '',
    })

    const handleSubmit = (e) => {
      e.preventDefault()
      if (!form.title.trim()) return toast.error('Title is required')
      toast.success(initial ? 'Analytics updated' : 'Analytics created')
      onClose()
    }

    return (
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Analytics' : 'New Analytics'}</DialogTitle>
          <DialogDescription>
            {initial ? 'Update analytics configuration' : 'Create new analytics configuration'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Analytics title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 rounded-md border border-input bg-background"
            >
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Class">Class</option>
              <option value="Financial">Financial</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value.replace(/[^0-9]/g, '') })}
              placeholder="Numeric value"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{initial ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    )
  }

  const DeleteConfirmDialog = ({ record, onClose }) => {
    const handleDelete = () => {
      toast.success('Record deleted')
      onClose()
    }

    return (
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle>Delete Record</DialogTitle>
          <DialogDescription className="mt-2">
            Are you sure you want to delete this record? This action cannot be undone.
          </DialogDescription>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Comprehensive school performance analytics and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Analytics
          </Button>
        </div>
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
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              <div className="text-2xl font-bold">{stats?.students || 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Teachers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              <div className="text-2xl font-bold">{stats?.teachers || 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-600" />
              <div className="text-2xl font-bold">{stats?.classes || 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-pink-600" />
              <div className="text-2xl font-bold">${stats?.revenue?.toLocaleString() || 0}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overview Distribution</CardTitle>
            <CardDescription>Breakdown of school entities</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <Chart
                data={chartData}
                type="pie"
                config={{
                  value: {
                    label: 'Count',
                  },
                }}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Monthly attendance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              data={attendanceData}
              type="bar"
              config={{
                present: {
                  label: 'Present',
                  color: '#10b981',
                },
                absent: {
                  label: 'Absent',
                  color: '#ef4444',
                },
              }}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Financial Performance</CardTitle>
            <CardDescription>Revenue vs Expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              data={financialData}
              type="line"
              config={{
                revenue: {
                  label: 'Revenue',
                  color: '#6366f1',
                },
                expenses: {
                  label: 'Expenses',
                  color: '#f59e0b',
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Performance Data</CardTitle>
          <CardDescription>Detailed analytics records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 rounded-md border border-input bg-background max-w-[150px]"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statsLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      No records found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.slice(0, 10).map((student) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.class?.name || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>
                          {student.status || 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(student)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AnalyticsModal
          initial={editRecord}
          onClose={() => setIsModalOpen(false)}
        />
      </Dialog>
    </div>
  )
}

export default AnalyticsPage
