import React, { useState } from 'react'
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
import { Key, RefreshCw } from 'lucide-react'

const resetPasswordSchema = z.object({
  mode: z.enum(['generate', 'manual']),
  newPassword: z.string().optional(),
})

const ResetPasswordModal = ({ isOpen, onClose, onSubmit, parent, isLoading }) => {
  const [generatedPassword, setGeneratedPassword] = useState('')

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      mode: 'generate',
      newPassword: '',
    },
  })

  const mode = form.watch('mode')

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setGeneratedPassword(password)
    form.setValue('newPassword', password)
  }

  const handleSubmit = (data) => {
    if (data.mode === 'manual' && !data.newPassword) {
      form.setError('newPassword', { message: 'Password is required' })
      return
    }
    onSubmit({
      mode: data.mode,
      newPassword: data.newPassword || generatedPassword,
    })
  }

  const handleClose = () => {
    form.reset()
    setGeneratedPassword('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Reset password for {parent?.name || 'this parent'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="mode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reset Mode</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="generate">Auto-generate password</SelectItem>
                      <SelectItem value="manual">Set custom password</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === 'generate' ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={generatedPassword}
                    readOnly
                    placeholder="Click generate to create password"
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={generatePassword}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Click the refresh icon to generate a new random password
                </p>
              </div>
            ) : (
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter new password (min 8 characters)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default ResetPasswordModal
