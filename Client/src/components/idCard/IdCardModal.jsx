import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { QrCode, Printer, Download, Eye } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'

const idCardSchema = z.object({
  student: z.string().min(1, 'Student is required'),
  cardNumber: z.string().min(1, 'Card number is required'),
  type: z.string().min(1, 'Card type is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  status: z.string().min(1, 'Status is required'),
})

const IdCardModal = ({ isOpen, onClose, onSubmit, defaultValues, isEdit, isLoading, students }) => {
  const [showPreview, setShowPreview] = useState(false)
  const form = useForm({
    resolver: zodResolver(idCardSchema),
    defaultValues: defaultValues || {
      student: '',
      cardNumber: '',
      type: 'student',
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
    },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        student: defaultValues.student || '',
        cardNumber: defaultValues.cardNumber || '',
        type: defaultValues.type || 'student',
        issueDate: defaultValues.issueDate ? defaultValues.issueDate.split('T')[0] : new Date().toISOString().split('T')[0],
        expiryDate: defaultValues.expiryDate ? defaultValues.expiryDate.split('T')[0] : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: defaultValues.status || 'active',
      })
    }
  }, [defaultValues, form])

  const handleSubmit = (data) => {
    onSubmit(data)
  }

  const handlePrint = () => {
    window.print()
  }

  const selectedStudent = students?.find((s) => s._id === form.watch('student'))

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(form.watch('cardNumber'))}`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit ID Card' : 'Issue ID Card'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update ID card details' : 'Issue a new ID card'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4">
          {/* Form */}
          <div className="flex-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="student"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select student" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {students?.map((s) => (
                            <SelectItem key={s._id} value={s._id}>
                              {s.name} ({s.customId})
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
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="ID-2024-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="visitor">Visitor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="issueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issue Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : isEdit ? 'Update Card' : 'Issue Card'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Preview */}
          <div className="w-72 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg p-4 text-white flex flex-col gap-3 print:shadow-none">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs opacity-80">School ID Card</p>
                <p className="font-bold text-sm">ID CARD</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {form.watch('type').toUpperCase()}
              </Badge>
            </div>

            {selectedStudent && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden">
                    {selectedStudent.photo ? (
                      <img src={selectedStudent.photo} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-blue-600 font-bold text-lg">
                        {(selectedStudent.name || 'S').split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm truncate">{selectedStudent.name}</p>
                    <p className="text-xs opacity-80">{selectedStudent.customId}</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-80">Class:</span>
                    <span>{selectedStudent.class?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Card No:</span>
                    <span className="font-mono">{form.watch('cardNumber')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Valid Until:</span>
                    <span>{form.watch('expiryDate')}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="bg-white p-2 rounded">
                    <img src={qrCodeUrl} alt="QR Code" className="w-16 h-16" />
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={form.watch('status') === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {form.watch('status').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </>
            )}

            {!selectedStudent && (
              <div className="flex-1 flex items-center justify-center text-xs opacity-80">
                Select a student to preview
              </div>
            )}
          </div>
        </div>

        {/* Print Actions */}
        {selectedStudent && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex-1"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default IdCardModal
