import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAppForm } from '@/hooks/useAppForm'
import { loginSchema } from '@/schemas/common.schema'
import { useLoginMutation } from '@/services/api/authApi'
import { useGetAcademicYearsQuery } from '@/services/api/academicApi'
import { useGetBranchesQuery } from '@/services/api/branchesApi'
import { setCredentials } from '@/store/slices/authSlice'
import { setTenant } from '@/store/slices/tenantSlice'
import { setAcademicYears } from '@/store/slices/academicSlice'

/**
 * Login form with backend integration
 * Handles both super admin and school admin login with role-based redirects
 */
export function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const [login, { isLoading, error }] = useLoginMutation()
  
  // Skip these queries for super admin
  const { data: academicYearsData } = useGetAcademicYearsQuery(undefined, {
    skip: true, // Will be enabled after login
  })
  const { data: branchesData } = useGetBranchesQuery(undefined, {
    skip: true, // Will be enabled after login
  })

  const form = useAppForm(loginSchema, {
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    document.title = 'Sign in · DugsiMaamul'
  }, [])

  async function onSubmit(values) {
    try {
      const response = await login(values).unwrap()
      
      if (response.success && response.data) {
        const userData = response.data
        
        // Store credentials in Redux
        dispatch(setCredentials({
          user: {
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            isSuperAdmin: userData.isSuperAdmin,
            school: userData.school,
            branch: userData.branch,
            permissions: userData.permissions || [],
            enabledFeatures: userData.school?.enabledFeatures || [],
          },
          accessToken: userData.token,
          permissions: userData.permissions || [],
          roles: [userData.role],
        }))

        // Store tenant info if available
        if (userData.school) {
          dispatch(setTenant({
            tenantId: userData.school._id || userData.school,
            school: userData.school,
            branches: userData.school.branches || [],
          }))
        }

        // Load academic years and branches for school admin
        if (!userData.isSuperAdmin && userData.role !== 'superadmin' && userData.role !== 'super_admin') {
          // Store academic years from backend data
          if (userData.school?.academicYears) {
            dispatch(setAcademicYears(userData.school.academicYears))
          } else if (userData.academicYear) {
            dispatch(setAcademicYears([userData.academicYear]))
          }
        }

        toast.success('Login successful', {
          description: `Welcome back, ${userData.name}!`,
        })

        // Role-based redirect
        if (userData.isSuperAdmin || userData.role === 'superadmin' || userData.role === 'super_admin') {
          // Super Admin redirect to super admin dashboard
          navigate('/admin/dashboard')
        } else {
          // School Admin redirect to school admin dashboard
          navigate('/dashboard')
        }
      }
    } catch (err) {
      console.error('Login error:', err)
      const errorMessage = err.data?.userMessage || err.data?.message || 'Login failed. Please try again.'
      toast.error('Login failed', {
        description: errorMessage,
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="border-border/80 shadow-sm w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            Enter your credentials to access your school workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="you@school.com"
                        inputMode="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Continue'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
