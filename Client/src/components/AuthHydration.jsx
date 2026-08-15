import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useGetProfileQuery } from '@/services/api/authApi'
import { setCredentials, setAuthHydrated, logout } from '@/store/slices/authSlice'
import { setTenant } from '@/store/slices/tenantSlice'
import { setAcademicYears } from '@/store/slices/academicSlice'
import { selectIsAuthenticated, selectUser, selectAuthHydrated } from '@/store/slices/authSlice'

/**
 * AuthHydration Component
 * 
 * Restores authenticated user state after browser refresh:
 * 1. Checks if token exists
 * 2. Fetches user profile from backend
 * 3. Restores user, permissions, tenant, and academic context
 * 4. Marks auth as hydrated so UI can render correctly
 * 
 * This ensures the Sidebar and ProtectedRoutes wait for full auth restoration
 * before deciding on access control.
 */
export function AuthHydration({ children }) {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectUser)
  const authHydrated = useSelector(selectAuthHydrated)

  // Skip profile fetch if already hydrated or not authenticated
  const skipProfileQuery = !isAuthenticated || (user && authHydrated)

  const { data: profileData, error: profileError, isLoading: profileLoading } = useGetProfileQuery(undefined, {
    skip: skipProfileQuery,
  })

  useEffect(() => {
    // If not authenticated, mark as hydrated (no auth needed)
    if (!isAuthenticated && !profileLoading) {
      dispatch(setAuthHydrated(true))
      return
    }

    // If profile fetch succeeded, restore user data
    if (profileData?.success && profileData?.data) {
      const userData = profileData.data

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
          academicYear: userData.academicYear,
        },
        accessToken: userData.token,
        permissions: userData.permissions || [],
        roles: [userData.role],
      }))

      // Restore tenant info if available
      if (userData.school) {
        dispatch(setTenant({
          tenantId: userData.school._id || userData.school,
          school: userData.school,
          branches: userData.school.branches || [],
        }))
      }

      // Restore academic years for school admin
      if (!userData.isSuperAdmin && userData.role !== 'superadmin' && userData.role !== 'super_admin') {
        if (userData.school?.academicYears) {
          dispatch(setAcademicYears(userData.school.academicYears))
        } else if (userData.academicYear) {
          dispatch(setAcademicYears([userData.academicYear]))
        }
      }

      // Mark auth as hydrated
      dispatch(setAuthHydrated(true))
    }

    // If profile fetch fails with 401, token is invalid - logout
    if (profileError?.status === 401) {
      dispatch(logout())
      dispatch(setAuthHydrated(true))
    }

    // If profile fetch fails with other error, still mark as hydrated to avoid infinite loading
    if (profileError && profileError?.status !== 401) {
      dispatch(setAuthHydrated(true))
    }
  }, [profileData, profileError, isAuthenticated, dispatch, profileLoading])

  // Show loading state while hydrating auth
  if (isAuthenticated && !authHydrated && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Restoring session...</p>
        </div>
      </div>
    )
  }

  return children
}
