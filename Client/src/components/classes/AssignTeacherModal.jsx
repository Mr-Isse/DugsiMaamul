import React, { useEffect } from 'react'
import { UserCheck, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAssignTeacherMutation, useGetTeachersQuery } from '@/services/api'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const AssignTeacherModal = ({ isOpen, onClose, classData }) => {
  const [selectedTeacherId, setSelectedTeacherId] = React.useState('')
  const [assignTeacher, { isLoading: isAssigning }] = useAssignTeacherMutation()
  const { data: teachers } = useGetTeachersQuery()

  useEffect(() => {
    if (classData?.teacher) {
      setSelectedTeacherId(classData.teacher._id || classData.teacher)
    } else {
      setSelectedTeacherId('')
    }
  }, [classData])

  const handleAssign = async () => {
    if (!selectedTeacherId) {
      toast.error('Please select a teacher')
      return
    }

    try {
      await assignTeacher({ id: classData._id, teacherId: selectedTeacherId }).unwrap()
      toast.success('Teacher assigned successfully')
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to assign teacher')
    }
  }

  const handleRemove = async () => {
    try {
      await assignTeacher({ id: classData._id, teacherId: null }).unwrap()
      toast.success('Teacher removed successfully')
      onClose()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to remove teacher')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Class Teacher</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Class Info */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <UserCheck size={20} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{classData?.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Section: {classData?.section}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Grade: {classData?.grade}</p>
              </div>
            </div>
          </div>

          {/* Teacher Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Teacher
            </label>
            <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a teacher" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Teacher</SelectItem>
                {teachers?.map((teacher) => (
                  <SelectItem key={teacher._id} value={teacher._id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Teacher Info */}
          {classData?.teacher && selectedTeacherId === (classData.teacher._id || classData.teacher) && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg p-3">
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Currently assigned: <span className="font-semibold">{classData.teacher.name}</span>
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handleRemove}
              disabled={!classData?.teacher || isAssigning}
            >
              Remove Teacher
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleAssign} disabled={!selectedTeacherId || isAssigning}>
                {isAssigning ? 'Assigning...' : 'Assign'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AssignTeacherModal
