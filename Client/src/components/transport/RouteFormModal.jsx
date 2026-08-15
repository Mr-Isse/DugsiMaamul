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

const routeFormSchema = z.object({
  name: z.string().min(2, 'Route name must be at least 2 characters'),
  startPoint: z.string().min(1, 'Start point is required'),
  endPoint: z.string().min(1, 'End point is required'),
  vehicle: z.string().optional(),
  distance: z.string().optional(),
  estimatedTime: z.string().optional(),
})

const RouteFormModal = ({ isOpen, onClose, onSubmit, defaultValues, isEdit, isLoading, vehicles }) => {
  const form = useForm({
    resolver: zodResolver(routeFormSchema),
    defaultValues: defaultValues || {
      name: '',
      startPoint: '',
      endPoint: '',
      vehicle: '',
      distance: '',
      estimatedTime: '',
    },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        name: defaultValues.name || '',
        startPoint: defaultValues.startPoint || '',
        endPoint: defaultValues.endPoint || '',
        vehicle: defaultValues.vehicle || '',
        distance: defaultValues.distance || '',
        estimatedTime: defaultValues.estimatedTime || '',
      })
    }
  }, [defaultValues, form])

  const handleSubmit = (data) => {
    onSubmit(data)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Route' : 'Add New Route'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update route information' : 'Create a new transport route'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Route Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Route 1 - North Campus" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startPoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Point *</FormLabel>
                    <FormControl>
                      <Input placeholder="Main Gate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endPoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Point *</FormLabel>
                    <FormControl>
                      <Input placeholder="North Campus" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="vehicle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Vehicle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No Vehicle</SelectItem>
                      {vehicles?.map((v) => (
                        <SelectItem key={v._id} value={v._id}>
                          {v.plateNumber} - {v.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="distance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Distance (km)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Est. Time (min)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEdit ? 'Update Route' : 'Add Route'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default RouteFormModal
