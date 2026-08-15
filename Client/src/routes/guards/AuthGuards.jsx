import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAccess'
import { getSafeRedirectPath } from '@/lib/security'
import { STORAGE_KEYS } from '@/config/app.config'
import { LoadingState } from '@/components/states'
import { useSelector } from 'react-redux'
import { selectAuthHydrated } from '@/store/slices/authSlice'

/**
 * Requires authentication. Frontend guard for UX — backend auth is mandatory.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const authHydrated = useSelector(selectAuthHydrated)

  // Wait for auth hydration before making auth decisions
  if (!authHydrated) {
    return <LoadingState label="Restoring session..." fullPage />
  }

  if (!isAuthenticated) {
    const redirect = getSafeRedirectPath(
      `${location.pathname}${location.search}`
    )
    sessionStorage.setItem(STORAGE_KEYS.redirectPath, redirect)
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children ? children : <Outlet />
}

/**
 * Redirects authenticated users away from auth pages.
 */
export function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const authHydrated = useSelector(selectAuthHydrated)

  // Wait for auth hydration before making auth decisions
  if (!authHydrated) {
    return <LoadingState label="Restoring session..." fullPage />
  }

  if (isAuthenticated) {
    const from =
      getSafeRedirectPath(location.state?.from?.pathname, '/') || '/'
    return <Navigate to={from} replace />
  }

  return children ? children : <Outlet />
}

export function RoleRoute({ roles = [], children, fallback = '/forbidden' }) {
  const { isAuthenticated, hasRole, user } = useAuth()
  const authHydrated = useSelector(selectAuthHydrated)

  // Wait for auth hydration before making auth decisions
  if (!authHydrated) {
    return <LoadingState label="Restoring session..." fullPage />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Wait for user payload if token exists but profile not hydrated yet
  if (!user) {
    return <LoadingState label="Checking access…" fullPage />
  }

  if (!hasRole(roles)) {
    return <Navigate to={fallback} replace />
  }

  return children ? children : <Outlet />
}

export function PermissionRoute({
  permissions = [],
  mode = 'all',
  children,
  fallback = '/forbidden',
}) {
  const { isAuthenticated, hasPermission, hasAnyPermission, user } = useAuth()
  const authHydrated = useSelector(selectAuthHydrated)

  // Wait for auth hydration before making auth decisions
  if (!authHydrated) {
    return <LoadingState label="Restoring session..." fullPage />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user) {
    return <LoadingState label="Checking permissions…" fullPage />
  }

  const allowed =
    mode === 'any'
      ? hasAnyPermission(permissions)
      : hasPermission(permissions)

  if (!allowed) {
    return <Navigate to={fallback} replace />
  }

  return children ? children : <Outlet />
}
