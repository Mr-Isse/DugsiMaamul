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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const examSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(1, 'Code is required'),
  term: z.enum(['Monthly1', 'Midterm', 'Monthly2', 'Final'], { required_error: 'Term is required' }),
  classes: z.array(z.string()).min(1, 'At least one class is required'),
  subjects: z.array(z.string()).min(1, 'At least one subject is required'),
  date: z.string().min(1, 'Exam date is required'),
  duration: z.string().min(1, 'Duration is required'),
  maxMarks: z.string().min(1, 'Total marks is required'),
  passingScore: z.string().min(1, 'Passing marks is required'),
  description: z.string().optional(),
})

const ExamFormModal = ({ isOpen, onClose, onSubmit, defaultValues, isEdit, isLoading, classes, subjects }) => {
  const form = useForm({
    resolver: zodResolver(examSchema),
    defaultValues: defaultValues || {
      name: '',
      code: '',
      term: 'Midterm',
      classes: [],
      subjects: [],
      date: '',
      duration: '',
      maxMarks: '',
      passingScore: '',
      description: '',
    },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        ...defaultValues,
        classes: defaultValues.classes || (defaultValues.class ? [defaultValues.class] : []),
        subjects: defaultValues.subjects || (defaultValues.subject ? [defaultValues.subject] : []),
        date: defaultValues.date ? defaultValues.date.split('T')[0] : '',
      })
    }
  }, [defaultValues, form])

  const handleSubmit = (data) => {
    onSubmit(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Exam' : 'Add New Exam'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update exam information' : 'Fill in the details to create a new exam'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Mid-Term Examination" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="MID2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="term"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Monthly1">Monthly 1</SelectItem>
                      <SelectItem value="Midterm">Midterm</SelectItem>
                      <SelectItem value="Monthly2">Monthly 2</SelectItem>
                      <SelectItem value="Final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classes *</FormLabel>
                  <div className="space-y-2">
                    {classes?.map((c) => (
                      <div key={c._id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`class-${c._id}`}
                          checked={field.value?.includes(c._id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...(field.value || []), c._id])
                            } else {
                              field.onChange(field.value?.filter((id) => id !== c._id) || [])
                            }
                          }}
                        />
                        <label
                          htmlFor={`class-${c._id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {c.name} - {c.section}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subjects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subjects *</FormLabel>
                  <div className="space-y-2">
                    {subjects?.map((s) => (
                      <div key={s._id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`subject-${s._id}`}
                          checked={field.value?.includes(s._id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...(field.value || []), s._id])
                            } else {
                              field.onChange(field.value?.filter((id) => id !== s._id) || [])
                            }
                          }}
                        />
                        <label
                          htmlFor={`subject-${s._id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {s.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration *</FormLabel>
                    <FormControl>
                      <Input placeholder="2 hours" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxMarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Marks *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="passingScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passing Marks *</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="40" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter exam description..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEdit ? 'Update Exam' : 'Add Exam'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default ExamFormModal
