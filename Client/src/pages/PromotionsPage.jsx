import React, { useState, useMemo } from 'react'
import {
  ArrowRightLeft,
  Plus,
  Search,
  Users,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  useGetStudentsQuery,
  useGetClassesQuery,
  usePromoteStudentsMutation,
  useHoldStudentsBackMutation,
  useGetPromotionPreviewQuery,
} from '@/services/api'

const PROMOTION_TYPES = ['Regular', 'Conditional', 'Probationary']

const PromotionModal = ({ isOpen, onClose, onSuccess, classes }) => {
  const [fromClass, setFromClass] = useState('')
  const [toClass, setToClass] = useState('')
  const [selectedStudentIds, setSelectedStudentIds] = useState([])
  const [promotionType, setPromotionType] = useState('Regular')
  const [showPreview, setShowPreview] = useState(false)

  const { data: studentsData, isLoading: isLoadingStudents } = useGetStudentsQuery()
  const { data: previewData, isLoading: isLoadingPreview } = useGetPromotionPreviewQuery(
    { fromClassId: fromClass, toClassId: toClass },
    { skip: !fromClass || !toClass || !showPreview }
  )
  const [promoteStudents, { isLoading: isPromoting }] = usePromoteStudentsMutation()

  const students = Array.isArray(studentsData) ? studentsData : studentsData?.data || []
  const filteredStudents = students.filter((s) => s.class === fromClass)

  const toggleStudent = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handlePromote = async () => {
    if (selectedStudentIds.length === 0) {
      return toast.error('Please select at least one student')
    }
    if (!fromClass || !toClass) {
      return toast.error('Please select both source and destination classes')
    }
    try {
      await promoteStudents({
        studentIds: selectedStudentIds,
        fromClassId: fromClass,
        toClassId: toClass,
        promotionType,
      }).unwrap()
      toast.success(`${selectedStudentIds.length} students promoted successfully`)
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to promote students')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Promote Students</DialogTitle>
          <DialogDescription>
            Move students to the next class level
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Class Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Class *</Label>
              <Select value={fromClass} onValueChange={setFromClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source class" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name} - {c.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>To Class *</Label>
              <Select value={toClass} onValueChange={setToClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination class" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name} - {c.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Promotion Type</Label>
            <Select value={promotionType} onValueChange={setPromotionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select promotion type" />
              </SelectTrigger>
              <SelectContent>
                {PROMOTION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Student Selection */}
          <div className="flex-1 overflow-hidden flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <Label>Students</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStudentIds(filteredStudents.map((s) => s._id))}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStudentIds([])}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto border rounded-lg">
              {isLoadingStudents ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="animate-spin text-gray-400" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  No students found in selected class
                </div>
              ) : (
                <div className="divide-y">
                  {filteredStudents.map((student) => (
                    <div
                      key={student._id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Checkbox
                        checked={selectedStudentIds.includes(student._id)}
                        onCheckedChange={() => toggleStudent(student._id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.customId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-500">
            {selectedStudentIds.length} students selected
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handlePromote} disabled={isPromoting || selectedStudentIds.length === 0}>
            {isPromoting ? 'Promoting...' : 'Promote Students'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const PromotionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: studentsData, isLoading, refetch } = useGetStudentsQuery()
  const { data: classesData } = useGetClassesQuery()

  const students = Array.isArray(studentsData) ? studentsData : studentsData?.data || []
  const classes = Array.isArray(classesData) ? classesData : classesData?.data || []

  const filteredStudents = useMemo(() => {
    if (!students) return []
    return students.filter((s) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (s.name || '').toLowerCase().includes(q) ||
          (s.customId || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (classFilter !== 'all' && s.class !== classFilter) return false
      return true
    })
  }, [students, searchTerm, classFilter])

  const promotionStats = useMemo(() => {
    const total = students.length
    const promoted = students.filter((s) => s.promotedAt).length
    const pending = total - promoted
    return { total, promoted, pending }
  }, [students])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Promotions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage student promotions between classes
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Promote Students
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-bold">{promotionStats.total}</p>
            </div>
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Promoted</p>
              <p className="text-2xl font-bold text-green-600">{promotionStats.promoted}</p>
            </div>
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{promotionStats.pending}</p>
            </div>
          </div>
        </div>
      </div>

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
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="max-w-[200px]">
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
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Current Class</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Promoted Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.customId}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {student.class?.name || 'N/A'} - {student.class?.section || ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{student.grade || 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                    {student.promotedAt ? (
                      <Badge className="bg-green-100 text-green-700">Promoted</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {student.promotedAt
                        ? new Date(student.promotedAt).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <PromotionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            refetch()
            setIsModalOpen(false)
          }}
          classes={classes}
        />
      )}
    </div>
  )
}

export default PromotionsPage