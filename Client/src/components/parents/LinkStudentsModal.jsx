import React, { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, UserPlus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const LinkStudentsModal = ({ isOpen, onClose, onSubmit, parent, students, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudentIds, setSelectedStudentIds] = useState([])

  const filteredStudents = useMemo(() => {
    if (!students) return []
    const list = Array.isArray(students) ? students : students.data || []
    return list.filter((s) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (s.name || '').toLowerCase().includes(q) ||
          (s.customId || '').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [students, searchTerm])

  const handleToggleStudent = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ studentIds: selectedStudentIds })
  }

  const handleClose = () => {
    setSearchTerm('')
    setSelectedStudentIds([])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Link Students to Parent</DialogTitle>
          <DialogDescription>
            Select students to link to {parent?.name || 'this parent'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Students List */}
          <ScrollArea className="flex-1 border rounded-lg">
            <div className="p-4 space-y-3">
              {filteredStudents.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No students found
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const isSelected = selectedStudentIds.includes(student._id)
                  const isLinked = parent?.linkedStudents?.some(
                    (ls) => ls._id === student._id || ls === student._id
                  )

                  return (
                    <div
                      key={student._id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Checkbox
                        id={`student-${student._id}`}
                        checked={isSelected || isLinked}
                        onCheckedChange={() => handleToggleStudent(student._id)}
                        disabled={isLinked}
                      />
                      <Avatar className="h-8 w-8">
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
                      {isLinked && (
                        <Badge variant="secondary" className="text-xs">
                          Linked
                        </Badge>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500">
            {selectedStudentIds.length} student(s) selected
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || selectedStudentIds.length === 0}
            >
              {isLoading ? 'Linking...' : 'Link Students'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default LinkStudentsModal
