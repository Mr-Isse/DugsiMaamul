import React, { useState } from 'react'
import {
  Shield,
  Lock,
  Key,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetSecuritySettingsQuery,
  useUpdateSecuritySettingsMutation,
  useGetPasswordPoliciesQuery,
  useUpdatePasswordPoliciesMutation,
} from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

const securitySettingsSchema = z.object({
  twoFactorAuth: z.boolean(),
  sessionTimeout: z.string().min(1, 'Session timeout is required'),
  maxLoginAttempts: z.string().min(1, 'Max login attempts is required'),
  lockoutDuration: z.string().min(1, 'Lockout duration is required'),
  ipWhitelist: z.string().optional(),
  requireStrongPassword: z.boolean(),
})

const passwordPolicySchema = z.object({
  minLength: z.string().min(1, 'Minimum length is required'),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSpecialChars: z.boolean(),
  passwordExpiryDays: z.string().optional(),
  preventReuse: z.boolean(),
  reuseCount: z.string().optional(),
})

const SecuritySettingsPage = () => {
  const [activeTab, setActiveTab] = useState('general')

  const { data: securitySettings, isLoading: securityLoading, refetch: refetchSecurity } = useGetSecuritySettingsQuery()
  const { data: passwordPolicies, isLoading: passwordLoading, refetch: refetchPassword } = useGetPasswordPoliciesQuery()
  
  const [updateSecuritySettings, { isLoading: isUpdatingSecurity }] = useUpdateSecuritySettingsMutation()
  const [updatePasswordPolicies, { isLoading: isUpdatingPassword }] = useUpdatePasswordPoliciesMutation()

  const securityForm = useForm({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      twoFactorAuth: false,
      sessionTimeout: '30',
      maxLoginAttempts: '5',
      lockoutDuration: '15',
      ipWhitelist: '',
      requireStrongPassword: true,
    },
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordPolicySchema),
    defaultValues: {
      minLength: '8',
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiryDays: '90',
      preventReuse: true,
      reuseCount: '5',
    },
  })

  const handleSecuritySubmit = async (data) => {
    try {
      await updateSecuritySettings(data).unwrap()
      toast.success('Security settings updated successfully')
      refetchSecurity()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update security settings')
    }
  }

  const handlePasswordSubmit = async (data) => {
    try {
      await updatePasswordPolicies(data).unwrap()
      toast.success('Password policies updated successfully')
      refetchPassword()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update password policies')
    }
  }

  // Initialize forms with data when loaded
  React.useEffect(() => {
    if (securitySettings) {
      securityForm.reset({
        twoFactorAuth: securitySettings.twoFactorAuth || false,
        sessionTimeout: securitySettings.sessionTimeout || '30',
        maxLoginAttempts: securitySettings.maxLoginAttempts || '5',
        lockoutDuration: securitySettings.lockoutDuration || '15',
        ipWhitelist: securitySettings.ipWhitelist || '',
        requireStrongPassword: securitySettings.requireStrongPassword !== false,
      })
    }
  }, [securitySettings, securityForm])

  React.useEffect(() => {
    if (passwordPolicies) {
      passwordForm.reset({
        minLength: passwordPolicies.minLength || '8',
        requireUppercase: passwordPolicies.requireUppercase !== false,
        requireLowercase: passwordPolicies.requireLowercase !== false,
        requireNumbers: passwordPolicies.requireNumbers !== false,
        requireSpecialChars: passwordPolicies.requireSpecialChars !== false,
        passwordExpiryDays: passwordPolicies.passwordExpiryDays || '90',
        preventReuse: passwordPolicies.preventReuse !== false,
        reuseCount: passwordPolicies.reuseCount || '5',
      })
    }
  }, [passwordPolicies, passwordForm])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure security policies and password requirements
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Security settings affect all users in your school. Changes will be applied immediately.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="general">General Security</TabsTrigger>
          <TabsTrigger value="password">Password Policies</TabsTrigger>
        </TabsList>

        {/* General Security Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                General Security
              </CardTitle>
              <CardDescription>
                Configure authentication and session security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {securityLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Form {...securityForm}>
                  <form onSubmit={securityForm.handleSubmit(handleSecuritySubmit)} className="space-y-6">
                    <FormField
                      control={securityForm.control}
                      name="twoFactorAuth"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                            <p className="text-sm text-gray-500">
                              Require 2FA for all admin users
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={securityForm.control}
                        name="sessionTimeout"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Session Timeout (minutes)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={securityForm.control}
                        name="maxLoginAttempts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Login Attempts</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={securityForm.control}
                        name="lockoutDuration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lockout Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={securityForm.control}
                      name="ipWhitelist"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>IP Whitelist (comma-separated)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="192.168.1.1, 10.0.0.1"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-gray-500">
                            Leave empty to allow all IPs
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={securityForm.control}
                      name="requireStrongPassword"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Require Strong Passwords</FormLabel>
                            <p className="text-sm text-gray-500">
                              Enforce strong password requirements
                            </p>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isUpdatingSecurity}>
                        {isUpdatingSecurity ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Policies Tab */}
        <TabsContent value="password" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Password Policies
              </CardTitle>
              <CardDescription>
                Configure password complexity and expiration rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              {passwordLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={passwordForm.control}
                        name="minLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Length</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="passwordExpiryDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password Expiry (days)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                            <p className="text-sm text-gray-500">
                              Set to 0 for no expiry
                            </p>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="requireUppercase"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Require Uppercase Letters</FormLabel>
                              <p className="text-sm text-gray-500">
                                Passwords must contain at least one uppercase letter
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="requireLowercase"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Require Lowercase Letters</FormLabel>
                              <p className="text-sm text-gray-500">
                                Passwords must contain at least one lowercase letter
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="requireNumbers"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Require Numbers</FormLabel>
                              <p className="text-sm text-gray-500">
                                Passwords must contain at least one number
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="requireSpecialChars"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Require Special Characters</FormLabel>
                              <p className="text-sm text-gray-500">
                                Passwords must contain at least one special character
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={passwordForm.control}
                        name="preventReuse"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Prevent Password Reuse</FormLabel>
                              <p className="text-sm text-gray-500">
                                Users cannot reuse recent passwords
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="reuseCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reuse Count</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                            <p className="text-sm text-gray-500">
                              Number of previous passwords to remember
                            </p>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isUpdatingPassword}>
                        {isUpdatingPassword ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SecuritySettingsPage
