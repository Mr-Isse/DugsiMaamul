import React, { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Calendar, ClipboardCheck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const MarkAttendanceModal = ({ isOpen, onClose, onSubmit, classes, students, selectedClass, isLoading }) => {
  const [selectedClassId, setSelectedClassId] = useState(selectedClass?._id || '')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceData, setAttendanceData] = useState({})

  const classStudents = useMemo(() => {
    if (!selectedClassId || !students) return []
    return students.filter((s) => s.class === selectedClassId || s.class?._id === selectedClassId)
  }, [selectedClassId, students])

  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  const handleMarkAllPresent = () => {
    const allPresent = classStudents.reduce((acc, student) => {
      acc[student._id] = 'present'
      return acc
    }, {})
    setAttendanceData(allPresent)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const studentsAttendance = Object.entries(attendanceData).map(([studentId, status]) => ({
      student: studentId,
      status,
    }))
    onSubmit({ 
      classId: selectedClassId, 
      subjectId: selectedSubjectId || null,
      studentsAttendance, 
      date 
    })
  }

  const handleClose = () => {
    setSelectedClassId('')
    setSelectedSubjectId('')
    setDate(new Date().toISOString().split('T')[0])
    setAttendanceData({})
    onClose()
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
        return <Badge variant="outline">Not Marked</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Mark Attendance</DialogTitle>
          <DialogDescription>
            Record attendance for students
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          {/* Class, Subject and Date Selection */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Class</label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
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
            <div>
              <label className="text-sm font-medium mb-1 block">Subject</label>
              <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Subjects</SelectItem>
                  {/* This would need to be populated with actual subjects */}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Quick Actions */}
          {classStudents.length > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleMarkAllPresent}
              className="w-fit"
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Mark All Present
            </Button>
          )}

          {/* Students List */}
          {selectedClassId ? (
            <ScrollArea className="flex-1 border rounded-lg">
              <div className="p-4 space-y-3">
                {classStudents.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No students in this class
                  </div>
                ) : (
                  classStudents.map((student) => (
                    <div
                      key={student._id}
                      className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>
                          {(student.name || 'S').split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {student.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {student.customId}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {['present', 'absent', 'late', 'excused'].map((status) => (
                          <Button
                            key={status}
                            type="button"
                            variant={attendanceData[student._id] === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleStatusChange(student._id, status)}
                            className={
                              attendanceData[student._id] === status
                                ? status === 'present'
                                  ? 'bg-green-600 hover:bg-green-700'
                                  : status === 'absent'
                                  ? 'bg-red-600 hover:bg-red-700'
                                  : status === 'late'
                                  ? 'bg-yellow-600 hover:bg-yellow-700'
                                  : 'bg-blue-600 hover:bg-blue-700'
                                : ''
                            }
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Button>
                        ))}
                      </div>
                      {attendanceData[student._id] && getStatusBadge(attendanceData[student._id])}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex items-center justify-center border rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="text-center text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select a class to view students</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {Object.keys(attendanceData).length} student(s) marked
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || Object.keys(attendanceData).length === 0}
            >
              {isLoading ? 'Saving...' : 'Save Attendance'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MarkAttendanceModal
