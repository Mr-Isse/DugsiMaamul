import { Navigate, Outlet } from 'react-router-dom'
import { useSubscriptionAccess } from '@/hooks/useAccess'
import { ForbiddenState } from '@/components/states'

/**
 * Subscription / feature guards — UX only.
 * Backend subscription & feature middleware remain authoritative.
 */
export function SubscriptionRoute({ children }) {
  const { isActive, subscription } = useSubscriptionAccess()

  if (!isActive) {
    return (
      <ForbiddenState
        title="Subscription unavailable"
        description={
          subscription?.blockedReason ||
          'Your school subscription is inactive or blocked. Please contact your administrator.'
        }
      />
    )
  }

  return children ? children : <Outlet />
}

export function FeatureRoute({
  feature,
  children,
  fallback = '/forbidden',
}) {
  const { hasFeature } = useSubscriptionAccess()

  if (feature && !hasFeature(feature)) {
    return <Navigate to={fallback} replace />
  }

  return children ? children : <Outlet />
}
