import React, { useEffect, useState } from 'react'
import { Users, Search, Check, X, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAssignStudentsMutation, useGetStudentsQuery } from '@/services/api'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

const AssignStudentModal = ({ isOpen, onClose, classData }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStudentIds, setSelectedStudentIds] = useState([])
  const [assignStudents, { isLoading: isAssigning }] = useAssignStudentsMutation()
  const { data: students, isLoading: isLoadingStudents } = useGetStudentsQuery()

  useEffect(() => {
    if (classData?.students) {
      setSelectedStudentIds(classData.students.map((s) => typeof s === 'object' ? s._id : s))
    } else {
      setSelectedStudentIds([])
    }
  }, [classData])

  const filteredStudents = students?.filter((student) => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (
      (student.name || '').toLowerCase().includes(q) ||
      (student.customId || '').toLowerCase().includes(q)
    )
  }) || []

  const toggleStudent = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleAssign = async () => {
    try {
      await assignStudents({ id: classData._id, students: selectedStudentIds }).unwrap()
      toast.success(`${selectedStudentIds.length} students assigned successfully`)
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to assign students')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Assign Students to Class</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Class Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{classData?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Section: {classData?.section}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Grade: {classData?.grade}</p>
                <Badge variant="secondary" className="mt-2">
                  {selectedStudentIds.length} students selected
                </Badge>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search by name or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Student List */}
          <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            {isLoadingStudents ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-gray-400" size={24} />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">No students found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredStudents.map((student) => {
                  const isSelected = selectedStudentIds.includes(student._id)
                  return (
                    <div
                      key={student._id}
                      onClick={() => toggleStudent(student._id)}
                      className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="w-5 h-5 rounded border-2 flex items-center justify-center">
                        {isSelected ? (
                          <div className="w-3 h-3 bg-indigo-600 rounded-sm" />
                        ) : null}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{student.customId}</p>
                      </div>
                      {isSelected ? (
                        <Check size={16} className="text-indigo-600 dark:text-indigo-400" />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={() => setSelectedStudentIds([])}>
              Clear Selection
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleAssign} disabled={isAssigning || selectedStudentIds.length === 0}>
                {isAssigning ? 'Assigning...' : `Assign ${selectedStudentIds.length} Students`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AssignStudentModal
