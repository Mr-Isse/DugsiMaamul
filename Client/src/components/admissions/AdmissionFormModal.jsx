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

const admissionFormSchema = z.object({
  studentName: z.string().min(2, 'Student name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  class: z.string().min(1, 'Class is required'),
  parentName: z.string().min(2, 'Parent name must be at least 2 characters'),
  parentPhone: z.string().min(1, 'Parent phone is required'),
  address: z.string().optional(),
  previousSchool: z.string().optional(),
})

const AdmissionFormModal = ({ isOpen, initial, classes, onClose, onSubmit }) => {
  const isEdit = Boolean(initial)

  const form = useForm({
    resolver: zodResolver(admissionFormSchema),
    defaultValues: initial || {
      studentName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      class: '',
      parentName: '',
      parentPhone: '',
      address: '',
      previousSchool: '',
    },
  })

  useEffect(() => {
    if (initial) {
      form.reset({
        studentName: initial.studentName || '',
        email: initial.email || '',
        phone: initial.phone || '',
        dateOfBirth: initial.dateOfBirth ? initial.dateOfBirth.split('T')[0] : '',
        gender: initial.gender || '',
        class: initial.class?._id || initial.class || '',
        parentName: initial.parentName || '',
        parentPhone: initial.parentPhone || '',
        address: initial.address || '',
        previousSchool: initial.previousSchool || '',
      })
    }
  }, [initial, form])

  const handleSubmit = (data) => {
    onSubmit({
      studentName: data.studentName,
      email: data.email || undefined,
      phone: data.phone || undefined,
      dateOfBirth: data.dateOfBirth || undefined,
      gender: data.gender || undefined,
      class: data.class,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      address: data.address || undefined,
      previousSchool: data.previousSchool || undefined,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Admission' : 'New Admission'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update admission information' : 'Fill in the details to create a new admission'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Student Information</h3>
                
                <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student Name *</FormLabel>
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="student@school.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="0698765432" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
              </div>

              {/* Parent Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Parent Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="parentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent/Guardian Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Omar Said" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="parentPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Phone *</FormLabel>
                        <FormControl>
                          <Input placeholder="0612345678" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Additional Information</h3>
                
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
                  name="previousSchool"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous School</FormLabel>
                      <FormControl>
                        <Input placeholder="Previous school name" {...field} />
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
                  {isEdit ? 'Update Admission' : 'Create Admission'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AdmissionFormModal
