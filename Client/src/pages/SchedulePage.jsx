import React, { useState, useMemo } from 'react'
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useGetScheduleQuery,
  useGetClassesQuery,
  useGetTeachersQuery,
  useGetSubjectsQuery,
  useCreateScheduleItemMutation,
  useUpdateScheduleItemMutation,
  useDeleteScheduleItemMutation,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'

const ScheduleModal = ({ isOpen, initial, classes, teachers, subjects, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    class: initial?.class?._id || initial?.class || '',
    subject: initial?.subject?._id || initial?.subject || '',
    teacher: initial?.teacher?._id || initial?.teacher || '',
    day: initial?.day || 'Monday',
    startTime: initial?.startTime || '',
    endTime: initial?.endTime || '',
    room: initial?.room || '',
  })

  const [createScheduleItem, { isLoading: creating }] = useCreateScheduleItemMutation()
  const [updateScheduleItem, { isLoading: updating }] = useUpdateScheduleItemMutation()

  const isEdit = Boolean(initial)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Strong validations
    if (!form.class) {
      return toast.error('Class is required')
    }
    
    if (!form.subject) {
      return toast.error('Subject is required')
    }
    
    if (!form.teacher) {
      return toast.error('Teacher is required')
    }
    
    if (!form.day) {
      return toast.error('Day is required')
    }
    
    if (!form.startTime) {
      return toast.error('Start time is required')
    }
    
    if (!form.endTime) {
      return toast.error('End time is required')
    }
    
    if (form.endTime <= form.startTime) {
      return toast.error('End time must be after start time')
    }
    
    if (form.room && form.room.length > 50) {
      return toast.error('Room name cannot exceed 50 characters')
    }
    
    if (form.room && !/^[a-zA-Z0-9\s\-]+$/.test(form.room)) {
      return toast.error('Room name can only contain letters, numbers, spaces and hyphens')
    }

    try {
      if (isEdit) {
        await updateScheduleItem({ id: initial._id, ...form }).unwrap()
        toast.success('Schedule updated')
      } else {
        await createScheduleItem(form).unwrap()
        toast.success('Schedule created')
      }
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save schedule')
    }
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Schedule' : 'New Schedule'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update schedule information' : 'Create a new schedule'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="class">Class *</Label>
          <select
            id="class"
            value={form.class}
            onChange={(e) => setForm({ ...form, class: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
            required
          >
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <select
            id="subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
            required
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="teacher">Teacher *</Label>
          <select
            id="teacher"
            value={form.teacher}
            onChange={(e) => setForm({ ...form, teacher: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
            required
          >
            <option value="">Select teacher</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name || `${t.firstName} ${t.lastName || ''}`}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="day">Day *</Label>
          <select
            id="day"
            value={form.day}
            onChange={(e) => setForm({ ...form, day: e.target.value })}
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
            required
          >
            {days.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time *</Label>
            <Input
              id="startTime"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time *</Label>
            <Input
              id="endTime"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="room">Room</Label>
          <Input
            id="room"
            value={form.room}
            onChange={(e) => setForm({ ...form, room: e.target.value })}
            placeholder="e.g. Room 101"
            maxLength={50}
          />
          <p className="text-xs text-gray-500">Max 50 characters, letters, numbers, spaces and hyphens only</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? 'Saving...' : 'Save Schedule'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
  )
}

const DeleteConfirmDialog = ({ isOpen, schedule, onClose, onSuccess }) => {
  const [deleteScheduleItem, { isLoading }] = useDeleteScheduleItemMutation()

  const handleDelete = async () => {
    try {
      await deleteScheduleItem(schedule._id).unwrap()
      toast.success('Schedule deleted')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete schedule')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <DialogTitle>Delete Schedule</DialogTitle>
          <DialogDescription className="mt-2">
            Are you sure you want to delete this schedule item?
            This action cannot be undone.
          </DialogDescription>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const SchedulePage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [dayFilter, setDayFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [deleteRecord, setDeleteRecord] = useState(null)

  const { data: schedule, isLoading, refetch } = useGetScheduleQuery()
  const { data: classesData } = useGetClassesQuery()
  const { data: teachersData } = useGetTeachersQuery()
  const { data: subjectsData } = useGetSubjectsQuery()

  const scheduleList = Array.isArray(schedule) ? schedule : schedule?.data || []
  const classes = Array.isArray(classesData) ? classesData : classesData?.data || []
  const teachers = Array.isArray(teachersData) ? teachersData : teachersData?.data || []
  const subjects = Array.isArray(subjectsData) ? subjectsData : subjectsData?.data || []

  const filteredSchedule = useMemo(() => {
    if (!scheduleList) return []
    return scheduleList.filter((s) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const subject = subjects.find((sub) => sub._id === s.subject)
        const teacher = teachers.find((t) => t._id === s.teacher)
        const match =
          (subject?.name || '').toLowerCase().includes(q) ||
          (teacher?.name || '').toLowerCase().includes(q) ||
          (s.room || '').toLowerCase().includes(q)
        if (!match) return false
      }
      if (classFilter && s.class !== classFilter) return false
      if (dayFilter && s.day !== dayFilter) return false
      return true
    })
  }, [scheduleList, searchTerm, classFilter, dayFilter, subjects, teachers])

  const handleCreate = () => {
    setEditRecord(null)
    setIsModalOpen(true)
  }

  const handleEdit = (schedule) => {
    setEditRecord(schedule)
    setIsModalOpen(true)
  }

  const handleDelete = (schedule) => {
    setDeleteRecord(schedule)
  }

  const getDayBadge = (day) => {
    const colors = {
      Monday: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      Tuesday: 'bg-green-100 text-green-800 hover:bg-green-100',
      Wednesday: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      Thursday: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
      Friday: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      Saturday: 'bg-pink-100 text-pink-800 hover:bg-pink-100',
      Sunday: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    }
    return (
      <Badge className={colors[day] || 'bg-gray-100 text-gray-800 hover:bg-gray-100'}>
        {day}
      </Badge>
    )
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage class schedules and timetables
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Schedule
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search schedule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background max-w-[180px]"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={dayFilter}
          onChange={(e) => setDayFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background max-w-[140px]"
        >
          <option value="">All Days</option>
          {days.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Day</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Room</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredSchedule.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No schedule found
                </TableCell>
              </TableRow>
            ) : (
              filteredSchedule.map((schedule) => {
                const subject = subjects.find((s) => s._id === schedule.subject)
                const teacher = teachers.find((t) => t._id === schedule.teacher)
                const classInfo = classes.find((c) => c._id === schedule.class)

                return (
                  <TableRow key={schedule._id}>
                    <TableCell>{getDayBadge(schedule.day)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{classInfo?.name || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{subject?.name || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{teacher?.name || teacher?.firstName || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{schedule.room || 'TBD'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(schedule)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(schedule)} className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <ScheduleModal
            isOpen={isModalOpen}
            initial={editRecord}
            classes={classes}
            teachers={teachers}
            subjects={subjects}
            onClose={() => setIsModalOpen(false)}
            onSuccess={() => refetch()}
          />
        </Dialog>
      )}

      {deleteRecord && (
        <Dialog open={!!deleteRecord} onOpenChange={() => setDeleteRecord(null)}>
          <DeleteConfirmDialog
            isOpen={!!deleteRecord}
            schedule={deleteRecord}
            onClose={() => setDeleteRecord(null)}
            onSuccess={() => refetch()}
          />
        </Dialog>
      )}
    </div>
  )
}

export default SchedulePage
