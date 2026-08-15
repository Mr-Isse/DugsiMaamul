import { Navigate, Outlet } from 'react-router-dom'
import { useTenantAccess, useBranchAccess } from '@/hooks/useAccess'
import { ForbiddenState } from '@/components/states'

/**
 * Tenant / branch awareness for UX routing.
 * Backend tenant middleware remains the security boundary.
 */
export function TenantRoute({ children, requireTenant = true }) {
  const { hasTenant } = useTenantAccess()

  if (requireTenant && !hasTenant) {
    return (
      <ForbiddenState
        title="School context required"
        description="A valid school (tenant) context is required to continue."
      />
    )
  }

  return children ? children : <Outlet />
}

export function BranchRoute({
  children,
  requireBranch = false,
  fallback = '/forbidden',
}) {
  const { hasBranch } = useBranchAccess()

  if (requireBranch && !hasBranch) {
    return <Navigate to={fallback} replace />
  }

  return children ? children : <Outlet />
}
