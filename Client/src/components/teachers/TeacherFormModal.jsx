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
import { useGetSubjectsQuery } from '@/services/api'
import { useSelector } from 'react-redux'

const teacherFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  customId: z.string().min(1, 'Teacher ID is required'),
  phone: z.string().min(1, 'Phone is required'),
  gender: z.enum(['Male', 'Female']),
  address: z.string().optional(),
  qualification: z.string().optional(),
  experience: z.string().optional(),
  branch: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
})

const TeacherFormModal = ({ isOpen, onClose, onSubmit, defaultValues, isEdit }) => {
  const { selectedBranch } = useSelector((state) => state.branch)
  const { data: subjects } = useGetSubjectsQuery()

  const form = useForm({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: defaultValues || {
      name: '',
      email: '',
      customId: '',
      phone: '',
      gender: 'Male',
      address: '',
      qualification: '',
      experience: '',
      branch: selectedBranch ? (typeof selectedBranch === 'object' ? selectedBranch._id : selectedBranch) : '',
      subjects: [],
      password: '',
    },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
        subjects: defaultValues.subjects?.map((s) => (typeof s === 'object' ? s._id : s)) || [],
      })
    }
  }, [defaultValues, form])

  const handleSubmit = (data) => {
    onSubmit(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update teacher information' : 'Fill in the details to register a new teacher'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Profile Photo Section - Placeholder for now */}
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Photo</span>
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ahmed Mohamed Ali" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone *</FormLabel>
                        <FormControl>
                          <Input placeholder="0698765432" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="teacher@school.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {!isEdit && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password *</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Enter password (min 6 characters)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher ID *</FormLabel>
                        <FormControl>
                          <Input placeholder="HJTCH277043" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Professional Information</h3>
                
                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <Input placeholder="Bachelor's Degree in Education" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience (years)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Subject Assignment */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Subject Assignment</h3>
                
                <FormField
                  control={form.control}
                  name="subjects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subjects</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          {subjects?.map((subject) => (
                            <div key={subject._id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`subject-${subject._id}`}
                                checked={field.value?.includes(subject._id)}
                                onChange={(e) => {
                                  const newValue = e.target.checked
                                    ? [...(field.value || []), subject._id]
                                    : (field.value || []).filter((id) => id !== subject._id)
                                  field.onChange(newValue)
                                }}
                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              <label
                                htmlFor={`subject-${subject._id}`}
                                className="text-sm text-gray-700 dark:text-gray-300"
                              >
                                {subject.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Location</h3>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="District 5, Hargeisa" {...field} />
                      </FormControl>
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
                  {isEdit ? 'Update Teacher' : 'Add Teacher'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TeacherFormModal
