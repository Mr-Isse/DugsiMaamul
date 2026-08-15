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

const roomFormSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  building: z.string().min(1, 'Building is required'),
  floor: z.string().min(1, 'Floor is required'),
  capacity: z.string().min(1, 'Capacity is required'),
  type: z.string().min(1, 'Room type is required'),
  facilities: z.string().optional(),
})

const RoomFormModal = ({ isOpen, onClose, onSubmit, defaultValues, isEdit, isLoading }) => {
  const form = useForm({
    resolver: zodResolver(roomFormSchema),
    defaultValues: defaultValues || {
      name: '',
      building: '',
      floor: '1',
      capacity: '4',
      type: 'shared',
      facilities: '',
    },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        name: defaultValues.name || '',
        building: defaultValues.building || '',
        floor: defaultValues.floor || '1',
        capacity: defaultValues.capacity || '4',
        type: defaultValues.type || 'shared',
        facilities: defaultValues.facilities || '',
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
          <DialogTitle>{isEdit ? 'Edit Room' : 'Add New Room'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update room details' : 'Add a new room to the hostel'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Room 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="building"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Building *</FormLabel>
                  <FormControl>
                    <Input placeholder="Building A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="floor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Floor *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select floor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[...Array(5)].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            Floor {i + 1}
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
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="shared">Shared</SelectItem>
                      <SelectItem value="dormitory">Dormitory</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="facilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facilities</FormLabel>
                  <FormControl>
                    <Input placeholder="AC, WiFi, Bathroom" {...field} />
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
                {isLoading ? 'Saving...' : isEdit ? 'Update Room' : 'Add Room'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default RoomFormModal
