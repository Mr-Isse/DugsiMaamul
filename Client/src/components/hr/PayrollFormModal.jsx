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

const payrollFormSchema = z.object({
  teacher: z.string().min(1, 'Employee is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  month: z.string().min(1, 'Month is required'),
  basicSalary: z.string().min(1, 'Basic salary is required'),
  allowances: z.string().min(0, 'Allowances must be a number'),
  deductions: z.string().min(0, 'Deductions must be a number'),
  status: z.string().min(1, 'Status is required'),
})

const PayrollFormModal = ({ isOpen, onClose, onSubmit, defaultValues, isEdit, isLoading, teachers }) => {
  const form = useForm({
    resolver: zodResolver(payrollFormSchema),
    defaultValues: defaultValues || {
      teacher: '',
      employeeId: '',
      month: new Date().toISOString().slice(0, 7),
      basicSalary: '0',
      allowances: '0',
      deductions: '0',
      status: 'pending',
    },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        teacher: defaultValues.teacher || '',
        employeeId: defaultValues.employeeId || '',
        month: defaultValues.month ? defaultValues.month.slice(0, 7) : new Date().toISOString().slice(0, 7),
        basicSalary: defaultValues.basicSalary || '0',
        allowances: defaultValues.allowances || '0',
        deductions: defaultValues.deductions || '0',
        status: defaultValues.status || 'pending',
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
          <DialogTitle>{isEdit ? 'Edit Payroll' : 'Add Payroll Record'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update payroll record details' : 'Create a new payroll record'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="teacher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers?.map((t) => (
                        <SelectItem key={t._id} value={t._id}>
                          {t.name}
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
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID *</FormLabel>
                  <FormControl>
                    <Input placeholder="EMP-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Month *</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="basicSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Basic Salary *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowances"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allowances</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deductions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deductions</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
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
                {isLoading ? 'Saving...' : isEdit ? 'Update Payroll' : 'Add Payroll'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default PayrollFormModal
