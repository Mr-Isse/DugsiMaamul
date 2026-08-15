import React, { useState, useMemo } from 'react'
import { Plus, Search, Edit2, Trash2, MoreVertical, BookOpen } from 'lucide-react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} from '@/services/api'
import SubjectFormModal from '@/components/subjects/SubjectFormModal'

const SubjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const { data: subjectsData, isLoading, refetch } = useGetSubjectsQuery()
  const [deleteSubject] = useDeleteSubjectMutation()
  const [createSubject] = useCreateSubjectMutation()
  const [updateSubject] = useUpdateSubjectMutation()

  const subjects = Array.isArray(subjectsData) ? subjectsData : subjectsData?.data || []

  const filteredSubjects = useMemo(() => {
    if (!subjects) return []
    return subjects.filter((subject) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase()
        const match =
          (subject.name || '').toLowerCase().includes(q) ||
          (subject.code || '').toLowerCase().includes(q) ||
          (subject.department?.name || subject.department || '').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [subjects, searchTerm])

  const handleDeleteSubject = async (subject) => {
    try {
      await deleteSubject(subject._id).unwrap()
      toast.success('Subject deleted successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to delete subject')
    }
  }

  const handleCreateSubject = async (data) => {
    try {
      await createSubject(data).unwrap()
      toast.success('Subject created successfully')
      setIsModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create subject')
    }
  }

  const handleUpdateSubject = async (data) => {
    try {
      await updateSubject({ id: editRecord._id, ...data }).unwrap()
      toast.success('Subject updated successfully')
      setIsModalOpen(false)
      setEditRecord(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update subject')
    }
  }

  const handleEditClick = (subject) => {
    setEditRecord(subject)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subjects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage subjects and their curriculum
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Subject
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredSubjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No subjects found
                </TableCell>
              </TableRow>
            ) : (
              filteredSubjects.map((subject) => (
                <TableRow key={subject._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center text-white">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{subject.name}</div>
                        <div className="text-sm text-gray-500">{subject.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{subject.code}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{subject.department?.name || subject.department || 'General'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={subject.type === 'core' ? 'default' : 'secondary'}>
                      {subject.type || 'Elective'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(subject)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteSubject(subject)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
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

      {isModalOpen && (
        <SubjectFormModal
          isOpen={isModalOpen}
          initial={editRecord}
          isEdit={Boolean(editRecord)}
          onClose={() => {
            setIsModalOpen(false)
            setEditRecord(null)
          }}
          onSubmit={editRecord ? handleUpdateSubject : handleCreateSubject}
        />
      )}
    </div>
  )
}

export default SubjectsPage
