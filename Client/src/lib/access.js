/**
 * Access control helpers (UX only).
 * Backend authorization remains mandatory — never trust frontend-only checks for security.
 */

export function normalizeRole(role) {
  if (!role) return ''
  return String(role).toLowerCase().replace(/[\s-]+/g, '_')
}

export function hasRole(userRoles = [], allowedRoles = []) {
  if (!allowedRoles?.length) return true
  const normalizedUser = (userRoles || []).map(normalizeRole)
  const normalizedAllowed = allowedRoles.map(normalizeRole)
  return normalizedAllowed.some((role) => normalizedUser.includes(role))
}

export function hasPermission(userPermissions = [], required = []) {
  if (!required?.length) return true
  const perms = new Set(userPermissions || [])
  // Super-permission shorthand if backend grants it
  if (perms.has('*') || perms.has('all')) return true
  return required.every((p) => perms.has(p))
}

export function hasAnyPermission(userPermissions = [], required = []) {
  if (!required?.length) return true
  const perms = new Set(userPermissions || [])
  if (perms.has('*') || perms.has('all')) return true
  return required.some((p) => perms.has(p))
}

export function hasFeature(features = [], featureKey) {
  if (!featureKey) return true
  if (!Array.isArray(features)) return false
  return features.includes(featureKey) || features.includes('*')
}

export function hasTenantContext(tenantId) {
  return Boolean(tenantId)
}

export function hasBranchContext(branchId, { required = false } = {}) {
  if (!required) return true
  return Boolean(branchId)
}

export function isSubscriptionActive(subscription) {
  if (!subscription) return true
  if (subscription.isBlocked) return false
  if (subscription.status === 'expired' && !subscription.isRestricted) {
    return false
  }
  return true
}
