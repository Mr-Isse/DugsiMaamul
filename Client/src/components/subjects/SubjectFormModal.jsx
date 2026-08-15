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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const subjectFormSchema = z.object({
  name: z.string().min(2, 'Subject name must be at least 2 characters').max(100, 'Subject name cannot exceed 100 characters'),
  code: z.string().min(2, 'Subject code must be at least 2 characters').max(10, 'Subject code cannot exceed 10 characters').regex(/^[A-Z0-9]+$/, 'Subject code can only contain uppercase letters and numbers'),
})

const SubjectFormModal = ({ isOpen, initial, onClose, onSubmit, isEdit }) => {
  const form = useForm({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: initial || {
      name: '',
      code: '',
    },
  })

  useEffect(() => {
    if (initial) {
      form.reset({
        name: initial.name || '',
        code: initial.code || '',
      })
    }
  }, [initial, form])

  const handleSubmit = (data) => {
    onSubmit({
      ...data,
      code: data.code.toUpperCase(),
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update subject information' : 'Fill in the details to create a new subject'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Mathematics" {...field} />
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
                  <FormLabel>Subject Code *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="MATH" 
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
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
              <Button type="submit">
                {isEdit ? 'Update Subject' : 'Add Subject'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default SubjectFormModal
