import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  BookOpen,
  Users,
  Plus,
  Check,
  ArrowLeft,
  Edit2,
  Trash2,
  ArrowRightLeft,
  Layers,
  UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetClassByIdQuery,
  useGetTeachersQuery,
  useGetSubjectsQuery,
  useGetStudentsInClassQuery,
  useGetClassesQuery,
  useAssignSubjectToClassMutation,
  useUpdateClassSubjectAssignmentMutation,
  useTransferStudentMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const tabs = [
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'teachers', label: 'Teachers', icon: Users },
  { id: 'students', label: 'Students', icon: Users },
]

const ClassDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [activeTab, setActiveTab] = useState('subjects')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditClassOpen, setIsEditClassOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [assignForm, setAssignForm] = useState({ subjectId: '', teacherId: '' })
  const [editClassForm, setEditClassForm] = useState({ name: '', section: '', maxStudents: '' })
  const [transferClassId, setTransferClassId] = useState('')

  const { data: cls, isLoading, error } = useGetClassByIdQuery(id)
  const { data: teachers } = useGetTeachersQuery()
  const { data: allSubjects } = useGetSubjectsQuery()
  const { data: students, isLoading: studentsLoading } = useGetStudentsInClassQuery(id, { skip: activeTab !== 'students' })
  const { data: allClasses } = useGetClassesQuery()

  const [assignSubjectToClass, { isLoading: isAssigning }] = useAssignSubjectToClassMutation()
  const [updateClassSubjectAssignment, { isLoading: isUpdating }] = useUpdateClassSubjectAssignmentMutation()
  const [transferStudent, { isLoading: isTransferring }] = useTransferStudentMutation()
  const [updateClass, { isLoading: isUpdatingClass }] = useUpdateClassMutation()
  const [deleteClass, { isLoading: isDeletingClass }] = useDeleteClassMutation()

  const subjects = cls?.subjects || []

  const assignedSubjectIds = useMemo(
    () => new Set(subjects.map((s) => String(s._id)).filter(Boolean)),
    [subjects]
  )

  const availableSubjects = useMemo(
    () => (allSubjects || []).filter((s) => !assignedSubjectIds.has(String(s._id))),
    [allSubjects, assignedSubjectIds]
  )

  const teachersMap = useMemo(() => {
    const map = new Map()
    ;(teachers || []).forEach((t) => map.set(t._id, t))
    return map
  }, [teachers])

  const teacherAssignments = useMemo(() => {
    const byTeacher = new Map()
    subjects.forEach((s) => {
      const tid = s.teacher?._id || s.teacher
      if (!tid) return
      if (!byTeacher.has(tid)) byTeacher.set(tid, [])
      byTeacher.get(tid).push(s)
    })
    return [...byTeacher.entries()].map(([teacherId, subs]) => ({
      teacherId,
      teacherName: teachersMap.get(teacherId)?.name || subs[0]?.teacher?.name || 'Teacher',
      subjects: subs,
    }))
  }, [subjects, teachersMap])

  const availableTeachers = useMemo(() => {
    if (!assignForm.subjectId) return []
    return (teachers || []).filter((t) => {
      const teachesSubject = t.subjects?.some((sub) => (sub._id || sub) === assignForm.subjectId)
      return teachesSubject
    })
  }, [teachers, assignForm.subjectId])

  const onAssignSubject = async (e) => {
    e.preventDefault()
    const subjectId = assignForm.subjectId
    const teacherId = assignForm.teacherId

    if (!subjectId) {
      toast.error('Select a subject')
      return
    }
    if (!teacherId) {
      toast.error('Select a teacher')
      return
    }

    console.log('Assigning subject:', { classId: cls._id, subjectId, teacherId })

    try {
      await assignSubjectToClass({
        classId: cls._id,
        subjectId,
        teacherId,
      }).unwrap()
      toast.success('Subject assigned to class')
      setIsAddOpen(false)
      setAssignForm({ subjectId: '', teacherId: '' })
    } catch (err) {
      console.error('Assignment error:', err)
      toast.error(err?.data?.message || err?.message || 'Failed to assign subject')
    }
  }

  const onChangeTeacher = async (assignmentId, teacherId) => {
    if (!teacherId || !assignmentId) return
    try {
      await updateClassSubjectAssignment({
        id: assignmentId,
        teacherId,
      }).unwrap()
      toast.success('Teacher updated')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update teacher')
    }
  }

  const onUpdateClass = async (e) => {
    e.preventDefault()
    try {
      await updateClass({
        id: cls._id,
        name: editClassForm.name,
        section: editClassForm.section,
        maxStudents: parseInt(editClassForm.maxStudents),
      }).unwrap()
      toast.success('Class updated successfully')
      setIsEditClassOpen(false)
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update class')
    }
  }

  const onDeleteClass = async () => {
    try {
      await deleteClass(cls._id).unwrap()
      toast.success('Class deleted successfully')
      navigate('/dashboard/classes')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete class')
    }
  }

  const onTransferStudent = async (e) => {
    e.preventDefault()
    if (!transferClassId) {
      toast.error('Please select a class')
      return
    }
    try {
      await transferStudent({
        studentId: selectedStudent._id,
        newClassId: transferClassId,
      }).unwrap()
      toast.success('Student transferred successfully')
      setIsTransferOpen(false)
      setSelectedStudent(null)
      setTransferClassId('')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to transfer student')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Failed to load class</p>
          <p className="text-sm text-gray-500 mt-1">{error?.data?.message || 'There was a problem fetching class details'}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/classes')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {cls?.name} - Section {cls?.section}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Max Students: {cls?.maxStudents}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditClassOpen(true)}>
            <Edit2 size={16} className="mr-2" />
            Edit Class
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
            <Trash2 size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
              <tab.icon size={16} />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Assigned Subjects</h2>
            <Button size="sm" onClick={() => setIsAddOpen(true)}>
              <Plus size={16} className="mr-2" />
              Assign Subject
            </Button>
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <BookOpen size={40} className="mx-auto mb-3 text-gray-300" />
              <p>No subjects assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subjects.map((s) => (
                <div key={s._id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-gray-500">
                      Teacher: {s.teacher?.name || 'Not Assigned'}
                    </p>
                  </div>
                  <Select
                    value={s.teacher?._id || s.teacher || ''}
                    onValueChange={(v) => onChangeTeacher(s.assignmentId || s._id, v)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select Teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not Assigned</SelectItem>
                      {teachers?.map((t) => (
                        <SelectItem key={t._id} value={t._id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Teachers Tab */}
        <TabsContent value="teachers" className="space-y-4">
          <h2 className="text-lg font-semibold">Teacher Assignments</h2>
          {teacherAssignments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <UserCheck size={40} className="mx-auto mb-3 text-gray-300" />
              <p>No teachers assigned yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teacherAssignments.map(({ teacherId, teacherName, subjects: subs }) => (
                <div key={teacherId} className="p-4 bg-white dark:bg-gray-800 rounded-lg border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <UserCheck size={20} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="font-semibold">{teacherName}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subs.map((s) => (
                      <Badge key={s._id} variant="secondary">
                        {s.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <h2 className="text-lg font-semibold">Students in Class</h2>
          {studentsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : !students || students.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users size={40} className="mx-auto mb-3 text-gray-300" />
              <p>No students in this class</p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div key={student._id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-500">ID: {student.customId || student.studentId}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedStudent(student)
                      setIsTransferOpen(true)
                    }}
                  >
                    <ArrowRightLeft size={16} className="mr-2" />
                    Transfer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Assign Subject Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Subject to Class</DialogTitle>
            <DialogDescription>Select a subject and teacher to assign</DialogDescription>
          </DialogHeader>
          <form onSubmit={onAssignSubject} className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={assignForm.subjectId} onValueChange={(v) => setAssignForm({ ...assignForm, subjectId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((s) => (
                    <SelectItem key={s._id} value={s._id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Teacher</Label>
              <Select value={assignForm.teacherId} onValueChange={(v) => setAssignForm({ ...assignForm, teacherId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {availableTeachers.map((t) => (
                    <SelectItem key={t._id} value={t._id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isAssigning}>
                {isAssigning ? 'Assigning...' : 'Assign'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Class Modal */}
      <Dialog open={isEditClassOpen} onOpenChange={setIsEditClassOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          <form onSubmit={onUpdateClass} className="space-y-4">
            <div className="space-y-2">
              <Label>Class Name</Label>
              <Input
                value={editClassForm.name}
                onChange={(e) => setEditClassForm({ ...editClassForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Input
                value={editClassForm.section}
                onChange={(e) => setEditClassForm({ ...editClassForm, section: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Students</Label>
              <Input
                type="number"
                value={editClassForm.maxStudents}
                onChange={(e) => setEditClassForm({ ...editClassForm, maxStudents: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditClassOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdatingClass}>
                {isUpdatingClass ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Class</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this class? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDeleteClass} disabled={isDeletingClass}>
              {isDeletingClass ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transfer Student Modal */}
      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Student</DialogTitle>
            <DialogDescription>
              Transfer {selectedStudent?.name} to another class
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onTransferStudent} className="space-y-4">
            <div className="space-y-2">
              <Label>Target Class</Label>
              <Select value={transferClassId} onValueChange={setTransferClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {(allClasses || []).map((c) => (
                    c._id !== id && (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name} - Section {c.section}
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsTransferOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isTransferring}>
                {isTransferring ? 'Transferring...' : 'Transfer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ClassDetailPage
