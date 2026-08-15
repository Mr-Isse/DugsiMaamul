import { useSelector } from 'react-redux'
import {
  selectIsAuthenticated,
  selectPermissions,
  selectRoles,
  selectUser,
} from '@/store/slices/authSlice'
import { selectTenantId } from '@/store/slices/tenantSlice'
import { selectBranchId } from '@/store/slices/branchSlice'
import { selectSubscription, selectFeatures } from '@/store/slices/subscriptionSlice'
import {
  hasRole,
  hasPermission,
  hasAnyPermission,
  hasFeature,
  hasTenantContext,
  isSubscriptionActive,
} from '@/lib/access'

/**
 * Access hooks for route guards and UI gating (UX only).
 */
export function useAuth() {
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const permissions = useSelector(selectPermissions)
  const roles = useSelector(selectRoles)

  return {
    user,
    isAuthenticated,
    permissions,
    roles,
    hasRole: (allowed) => hasRole(roles, allowed),
    hasPermission: (required) => hasPermission(permissions, required),
    hasAnyPermission: (required) => hasAnyPermission(permissions, required),
  }
}

export function useTenantAccess() {
  const tenantId = useSelector(selectTenantId)
  return {
    tenantId,
    hasTenant: hasTenantContext(tenantId),
  }
}

export function useBranchAccess() {
  const branchId = useSelector(selectBranchId)
  return {
    branchId,
    hasBranch: Boolean(branchId),
  }
}

export function useSubscriptionAccess() {
  const subscription = useSelector(selectSubscription)
  const features = useSelector(selectFeatures)

  return {
    subscription,
    features,
    isActive: isSubscriptionActive(subscription),
    hasFeature: (key) => hasFeature(features, key),
  }
}
