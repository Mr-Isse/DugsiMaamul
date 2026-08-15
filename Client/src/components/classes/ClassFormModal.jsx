import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useGetTeachersQuery, useGetBranchesQuery } from '@/services/api'
import { useSelector } from 'react-redux'

const classFormSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  section: z.string().min(1, 'Section is required'),
  grade: z.string().min(1, 'Grade is required'),
  branch: z.string().optional(),
  teacher: z.string().optional(),
  maxStudents: z.number().min(1, 'Max students must be at least 1').max(100, 'Max students cannot exceed 100'),
  roomNumber: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

const ClassFormModal = ({ isOpen, onClose, onSubmit, defaultValues, isEdit }) => {
  const { selectedBranch } = useSelector((state) => state.branch)
  const { data: teachers } = useGetTeachersQuery()
  const { data: branches } = useGetBranchesQuery()

  const form = useForm({
    resolver: zodResolver(classFormSchema),
    defaultValues: defaultValues || {
      name: '',
      section: '',
      grade: '',
      branch: selectedBranch ? (typeof selectedBranch === 'object' ? selectedBranch._id : selectedBranch) : '',
      teacher: '',
      maxStudents: 40,
      roomNumber: '',
      status: 'active',
    },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
        teacher: defaultValues.teacher?._id || defaultValues.teacher || '',
        branch: defaultValues.branch?._id || defaultValues.branch || '',
        maxStudents: defaultValues.maxStudents || defaultValues.capacity || 40,
      })
    }
  }, [defaultValues, form])

  const handleSubmit = (data) => {
    onSubmit({
      ...data,
      maxStudents: typeof data.maxStudents === 'string' ? Number(data.maxStudents) : data.maxStudents,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Class' : 'Add New Class'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update class information' : 'Fill in the details to create a new class'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Primary" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="section"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section *</FormLabel>
                        <FormControl>
                          <Input placeholder="A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Grade 1">Grade 1</SelectItem>
                          <SelectItem value="Grade 2">Grade 2</SelectItem>
                          <SelectItem value="Grade 3">Grade 3</SelectItem>
                          <SelectItem value="Grade 4">Grade 4</SelectItem>
                          <SelectItem value="Grade 5">Grade 5</SelectItem>
                          <SelectItem value="Grade 6">Grade 6</SelectItem>
                          <SelectItem value="Grade 7">Grade 7</SelectItem>
                          <SelectItem value="Grade 8">Grade 8</SelectItem>
                          <SelectItem value="Grade 9">Grade 9</SelectItem>
                          <SelectItem value="Grade 10">Grade 10</SelectItem>
                          <SelectItem value="Grade 11">Grade 11</SelectItem>
                          <SelectItem value="Grade 12">Grade 12</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Assignment */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Assignment</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="teacher"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class Teacher</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Teacher" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Not Assigned</SelectItem>
                            {teachers?.map((teacher) => (
                              <SelectItem key={teacher._id} value={teacher._id}>
                                {teacher.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="branch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Branch</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Branch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Main Branch</SelectItem>
                            {(branches?.data || branches || []).map((branch) => (
                              <SelectItem key={branch._id} value={branch._id}>
                                {branch.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="maxStudents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Students *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="40" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 40)}
                            value={field.value || 40}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="roomNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Number</FormLabel>
                        <FormControl>
                          <Input placeholder="101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEdit ? 'Update Class' : 'Add Class'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ClassFormModal
