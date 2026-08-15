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
import { useGetClassesQuery } from '@/services/api'
import { useSelector } from 'react-redux'

const studentFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  customId: z.string().min(1, 'Student ID is required'),
  phone: z.string().min(1, 'Phone is required'),
  parentName: z.string().min(1, 'Parent name is required'),
  parentPhone: z.string().min(1, 'Parent phone is required'),
  class: z.string().min(1, 'Class is required'),
  monthlyFees: z.number().min(0, 'Monthly fees must be a positive number'),
  gender: z.enum(['Male', 'Female']),
  age: z.number().min(0).max(100).optional(),
  address: z.string().optional(),
  mode: z.enum(['Full-time', 'Part-time']),
  placeOfBirth: z.string().optional(),
  entryDate: z.string().optional(),
  motherName: z.string().optional(),
  emergencyContact: z.string().optional(),
  branch: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
})

const StudentFormModal = ({ isOpen, onClose, onSubmit, defaultValues, isEdit }) => {
  const { selectedBranch } = useSelector((state) => state.branch)
  const { data: classes } = useGetClassesQuery()

  const form = useForm({
    resolver: zodResolver(studentFormSchema),
    defaultValues: defaultValues || {
      name: '',
      email: '',
      customId: '',
      phone: '',
      parentName: '',
      parentPhone: '',
      class: '',
      monthlyFees: 0,
      gender: 'Male',
      age: undefined,
      address: '',
      mode: 'Full-time',
      placeOfBirth: '',
      entryDate: '',
      motherName: '',
      emergencyContact: '',
      branch: selectedBranch ? (typeof selectedBranch === 'object' ? selectedBranch._id : selectedBranch) : '',
      password: '',
    },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues)
    }
  }, [defaultValues, form])

  const handleSubmit = (data) => {
    onSubmit({
      ...data,
      classId: data.class,
      monthlyFees: typeof data.monthlyFees === 'string' ? Number(data.monthlyFees) : data.monthlyFees,
      age: typeof data.age === 'string' ? (data.age ? Number(data.age) : undefined) : data.age,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Student' : 'Add New Student'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update student information' : 'Fill in the details to register a new student'}
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
                        <Input placeholder="Fatima Omar Said" {...field} />
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
                          <Input placeholder="student@school.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter password (min 8 characters)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student ID *</FormLabel>
                        <FormControl>
                          <Input placeholder="HJSTD277043" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="15" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Class & Fees */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Class & Fees</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="class"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {classes?.map((c) => (
                              <SelectItem key={c._id} value={c._id}>
                                {c.name} - {c.section}
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
                    name="monthlyFees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Fees *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="50" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                            value={field.value || 0}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <FormField
                    control={form.control}
                    name="mode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mode</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Mode" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="placeOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Place of Birth</FormLabel>
                      <FormControl>
                        <Input placeholder="Hargeisa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="District 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="entryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Family & Contact */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Family & Contact</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="motherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mother's Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Mother's full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent/Guardian *</FormLabel>
                        <FormControl>
                          <Input placeholder="Omar Said" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="parentPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent's Phone *</FormLabel>
                        <FormControl>
                          <Input placeholder="0612345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact</FormLabel>
                        <FormControl>
                          <Input placeholder="0612345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEdit ? 'Update Student' : 'Add Student'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default StudentFormModal
