import React, { useState } from 'react'
import {
  Settings,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Save,
  Loader2,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  useGetSchoolProfileQuery,
  useUpdateSchoolProfileMutation,
  useGetSchoolSettingsQuery,
  useUpdateSchoolSettingsMutation,
} from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

const schoolProfileSchema = z.object({
  name: z.string().min(2, 'School name must be at least 2 characters'),
  subdomain: z.string().min(2, 'Subdomain must be at least 2 characters'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email address'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  description: z.string().optional(),
})

const SettingsPage = () => {
  const { userInfo } = useSelector((state) => state.auth)
  
  const [activeTab, setActiveTab] = useState('profile')

  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useGetSchoolProfileQuery()
  const { data: settings, isLoading: settingsLoading, refetch: refetchSettings } = useGetSchoolSettingsQuery()
  
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateSchoolProfileMutation()
  const [updateSettings, { isLoading: isUpdatingSettings }] = useUpdateSchoolSettingsMutation()

  const profileForm = useForm({
    resolver: zodResolver(schoolProfileSchema),
    defaultValues: {
      name: '',
      subdomain: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      country: '',
      website: '',
      description: '',
    },
  })

  const handleProfileSubmit = async (data) => {
    try {
      await updateProfile(data).unwrap()
      toast.success('School profile updated successfully')
      refetchProfile()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update school profile')
    }
  }

  const handleSettingsSubmit = async (data) => {
    try {
      await updateSettings(data).unwrap()
      toast.success('Settings updated successfully')
      refetchSettings()
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update settings')
    }
  }

  // Initialize form with profile data when loaded
  React.useEffect(() => {
    if (profile) {
      profileForm.reset({
        name: profile.name || '',
        subdomain: profile.subdomain || '',
        phone: profile.phone || '',
        email: profile.email || '',
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || '',
        website: profile.website || '',
        description: profile.description || '',
      })
    }
  }, [profile, profileForm])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your school profile and application settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="profile">School Profile</TabsTrigger>
          <TabsTrigger value="general">General Settings</TabsTrigger>
        </TabsList>

        {/* School Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                School Information
              </CardTitle>
              <CardDescription>
                Update your school's basic information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profileLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>School Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Dugsimaamul School" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="subdomain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subdomain *</FormLabel>
                            <FormControl>
                              <Input placeholder="dugsimaamul" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone *</FormLabel>
                            <FormControl>
                              <Input placeholder="+252 61 234 5678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input placeholder="info@dugsimaamul.edu" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Education Street" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input placeholder="Mogadishu" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country *</FormLabel>
                            <FormControl>
                              <Input placeholder="Somalia" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://www.dugsimaamul.edu" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about your school..."
                              className="resize-none"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isUpdatingProfile}>
                        {isUpdatingProfile ? (
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

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Configure application-wide settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              {settingsLoading ? (
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Academic Settings</h3>
                    <p className="text-sm text-gray-500">
                      Configure academic year and term settings
                    </p>
                    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Academic settings will be configured here. This section is under development.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Notification Settings</h3>
                    <p className="text-sm text-gray-500">
                      Manage notification preferences for students, parents, and teachers
                    </p>
                    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Notification settings will be configured here. This section is under development.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">System Settings</h3>
                    <p className="text-sm text-gray-500">
                      Configure system-wide preferences and defaults
                    </p>
                    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        System settings will be configured here. This section is under development.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsPage
