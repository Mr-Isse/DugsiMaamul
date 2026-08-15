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
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const bookFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  author: z.string().min(2, 'Author is required'),
  isbn: z.string().min(10, 'ISBN must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  publisher: z.string().optional(),
  publicationYear: z.string().optional(),
  totalCopies: z.string().min(1, 'Total copies is required'),
  description: z.string().optional(),
})

const BookFormModal = ({ isOpen, onClose, onSubmit, defaultValues, isEdit, isLoading }) => {
  const form = useForm({
    resolver: zodResolver(bookFormSchema),
    defaultValues: defaultValues || {
      title: '',
      author: '',
      isbn: '',
      category: 'general',
      publisher: '',
      publicationYear: '',
      totalCopies: '1',
      description: '',
    },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        title: defaultValues.title || '',
        author: defaultValues.author || '',
        isbn: defaultValues.isbn || '',
        category: defaultValues.category || 'general',
        publisher: defaultValues.publisher || '',
        publicationYear: defaultValues.publicationYear || '',
        totalCopies: defaultValues.totalCopies || '1',
        description: defaultValues.description || '',
      })
    }
  }, [defaultValues, form])

  const handleSubmit = (data) => {
    onSubmit(data)
  }

  const categories = [
    'general',
    'science',
    'mathematics',
    'literature',
    'history',
    'geography',
    'technology',
    'arts',
    'sports',
    'reference',
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Book' : 'Add New Book'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update book information' : 'Add a new book to the library'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Book Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author *</FormLabel>
                  <FormControl>
                    <Input placeholder="Author Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isbn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ISBN *</FormLabel>
                  <FormControl>
                    <Input placeholder="978-0-123456-78-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
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
                name="totalCopies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Copies *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="publisher"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publisher</FormLabel>
                    <FormControl>
                      <Input placeholder="Publisher Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="publicationYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Publication Year</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Book description..."
                      className="resize-none"
                      rows={3}
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
                {isLoading ? 'Saving...' : isEdit ? 'Update Book' : 'Add Book'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default BookFormModal
