import React, { useEffect, useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { Lock } from 'lucide-react'

const roleFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
})

const RoleFormModal = ({ isOpen, onClose, onSubmit, defaultValues, isEdit, isLoading, permissions }) => {
  const form = useForm({
    resolver: zodResolver(roleFormSchema),
    defaultValues: defaultValues || {
      name: '',
      description: '',
      permissions: [],
    },
  })

  const [selectedPermissions, setSelectedPermissions] = useState(defaultValues?.permissions || [])

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        name: defaultValues.name || '',
        description: defaultValues.description || '',
        permissions: defaultValues.permissions || [],
      })
      setSelectedPermissions(defaultValues.permissions || [])
    }
  }, [defaultValues, form])

  const handleTogglePermission = (permissionId) => {
    setSelectedPermissions((prev) => {
      const newPermissions = prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
      form.setValue('permissions', newPermissions)
      return newPermissions
    })
  }

  const handleSubmit = (data) => {
    onSubmit({
      ...data,
      permissions: selectedPermissions,
    })
  }

  const groupedPermissions = permissions?.reduce((acc, perm) => {
    const module = perm.code.split('.')[0]
    if (!acc[module]) acc[module] = []
    acc[module].push(perm)
    return acc
  }, {}) || {}

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update role information and permissions' : 'Create a new role and assign permissions'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 flex flex-col min-h-0 space-y-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Teacher" {...field} />
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
                          placeholder="Describe the role's responsibilities..."
                          className="resize-none"
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>Permissions *</FormLabel>
                  <Badge variant="secondary">
                    <Lock className="h-3 w-3 mr-1" />
                    {selectedPermissions.length} selected
                  </Badge>
                </div>
                <ScrollArea className="flex-1 border rounded-lg">
                  <div className="p-4 space-y-4">
                    {Object.keys(groupedPermissions).length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        No permissions available
                      </div>
                    ) : (
                      Object.entries(groupedPermissions).map(([module, perms]) => (
                        <div key={module} className="space-y-2">
                          <div className="font-medium text-sm capitalize text-gray-700 dark:text-gray-300">
                            {module}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {perms.map((perm) => (
                              <div
                                key={perm._id}
                                className="flex items-center space-x-2 p-2 rounded border hover:bg-gray-50 dark:hover:bg-gray-800"
                              >
                                <Checkbox
                                  id={`perm-${perm._id}`}
                                  checked={selectedPermissions.includes(perm._id)}
                                  onCheckedChange={() => handleTogglePermission(perm._id)}
                                />
                                <label
                                  htmlFor={`perm-${perm._id}`}
                                  className="text-sm cursor-pointer flex-1"
                                >
                                  {perm.name || perm.code}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : isEdit ? 'Update Role' : 'Add Role'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RoleFormModal
