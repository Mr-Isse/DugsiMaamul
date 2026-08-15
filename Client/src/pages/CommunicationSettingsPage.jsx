import React, { useState, useEffect } from 'react'
import {
  Mail,
  Bell,
  MessageSquare,
  Save,
  Loader2,
  CheckCircle,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetCommunicationSettingsQuery,
  useUpdateCommunicationSettingsMutation,
} from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

const emailSettingsSchema = z.object({
  smtpHost: z.string().min(1, 'SMTP host is required'),
  smtpPort: z.string().min(1, 'SMTP port is required'),
  smtpUser: z.string().min(1, 'SMTP username is required'),
  smtpPassword: z.string().min(1, 'SMTP password is required'),
  fromEmail: z.string().email('Invalid email address'),
  fromName: z.string().min(1, 'From name is required'),
  enableEmailNotifications: z.boolean(),
})

const smsSettingsSchema = z.object({
  smsProvider: z.string().min(1, 'SMS provider is required'),
  apiKey: z.string().min(1, 'API key is required'),
  senderId: z.string().min(1, 'Sender ID is required'),
  enableSmsNotifications: z.boolean(),
})

const notificationSettingsSchema = z.object({
  enablePushNotifications: z.boolean(),
  enableInAppNotifications: z.boolean(),
  notificationRetentionDays: z.string().min(1, 'Retention days is required'),
})

const CommunicationSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('email')

  const { data: settings, isLoading, refetch } = useGetCommunicationSettingsQuery()
  const [updateSettings, { isLoading: isUpdating }] = useUpdateCommunicationSettingsMutation()

  const emailForm = useForm({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      smtpHost: '',
      smtpPort: '587',
      smtpUser: '',
      smtpPassword: '',
      fromEmail: '',
      fromName: '',
      enableEmailNotifications: true,
    },
  })

  const smsForm = useForm({
    resolver: zodResolver(smsSettingsSchema),
    defaultValues: {
      smsProvider: '',
      apiKey: '',
      senderId: '',
      enableSmsNotifications: false,
    },
  })

  const notificationForm = useForm({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      enablePushNotifications: true,
      enableInAppNotifications: true,
      notificationRetentionDays: '30',
    },
  })

  useEffect(() => {
    if (settings) {
      emailForm.reset({
        smtpHost: settings.email?.smtpHost || '',
        smtpPort: settings.email?.smtpPort || '587',
        smtpUser: settings.email?.smtpUser || '',
        smtpPassword: settings.email?.smtpPassword || '',
        fromEmail: settings.email?.fromEmail || '',
        fromName: settings.email?.fromName || '',
        enableEmailNotifications: settings.email?.enableEmailNotifications !== false,
      })
      smsForm.reset({
        smsProvider: settings.sms?.smsProvider || '',
        apiKey: settings.sms?.apiKey || '',
        senderId: settings.sms?.senderId || '',
        enableSmsNotifications: settings.sms?.enableSmsNotifications || false,
      })
      notificationForm.reset({
        enablePushNotifications: settings.notifications?.enablePushNotifications !== false,
        enableInAppNotifications: settings.notifications?.enableInAppNotifications !== false,
        notificationRetentionDays: settings.notifications?.notificationRetentionDays || '30',
      })
    }
  }, [settings, emailForm, smsForm, notificationForm])

  const handleEmailSubmit = async (data) => {
    try {
      await updateSettings({ email: data }).unwrap()
      toast.success('Email settings updated successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update email settings')
    }
  }

  const handleSmsSubmit = async (data) => {
    try {
      await updateSettings({ sms: data }).unwrap()
      toast.success('SMS settings updated successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update SMS settings')
    }
  }

  const handleNotificationSubmit = async (data) => {
    try {
      await updateSettings({ notifications: data }).unwrap()
      toast.success('Notification settings updated successfully')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update notification settings')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Communication Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure email, SMS, and notification preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Email Settings Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>
                Configure SMTP settings for sending emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={emailForm.control}
                        name="smtpHost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Host *</FormLabel>
                            <FormControl>
                              <Input placeholder="smtp.gmail.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailForm.control}
                        name="smtpPort"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Port *</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="587" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={emailForm.control}
                      name="smtpUser"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Username *</FormLabel>
                          <FormControl>
                            <Input placeholder="your-email@gmail.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={emailForm.control}
                      name="smtpPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Password *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={emailForm.control}
                        name="fromEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Email *</FormLabel>
                            <FormControl>
                              <Input placeholder="noreply@school.edu" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={emailForm.control}
                        name="fromName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Dugsimaamul School" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={emailForm.control}
                      name="enableEmailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable Email Notifications</FormLabel>
                            <p className="text-sm text-gray-500">
                              Send email notifications for important events
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
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Email Settings
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

        {/* SMS Settings Tab */}
        <TabsContent value="sms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                SMS Configuration
              </CardTitle>
              <CardDescription>
                Configure SMS gateway for sending text messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Form {...smsForm}>
                  <form onSubmit={smsForm.handleSubmit(handleSmsSubmit)} className="space-y-4">
                    <FormField
                      control={smsForm.control}
                      name="smsProvider"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMS Provider *</FormLabel>
                          <FormControl>
                            <Input placeholder="Twilio, Nexmo, etc." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={smsForm.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key *</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={smsForm.control}
                      name="senderId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sender ID *</FormLabel>
                          <FormControl>
                            <Input placeholder="SCHOOL" {...field} />
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-gray-500">
                            Maximum 11 characters, alphanumeric only
                          </p>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={smsForm.control}
                      name="enableSmsNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Enable SMS Notifications</FormLabel>
                            <p className="text-sm text-gray-500">
                              Send SMS notifications for urgent alerts
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
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save SMS Settings
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

        {/* Notifications Settings Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Configure in-app and push notification settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(handleNotificationSubmit)} className="space-y-4">
                    <FormField
                      control={notificationForm.control}
                      name="enablePushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Push Notifications</FormLabel>
                            <p className="text-sm text-gray-500">
                              Enable browser push notifications
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
                      control={notificationForm.control}
                      name="enableInAppNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">In-App Notifications</FormLabel>
                            <p className="text-sm text-gray-500">
                              Show notifications within the application
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
                      control={notificationForm.control}
                      name="notificationRetentionDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notification Retention (days) *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="30" {...field} />
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-gray-500">
                            How long to keep notification history
                          </p>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Notification Settings
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

export default CommunicationSettingsPage
