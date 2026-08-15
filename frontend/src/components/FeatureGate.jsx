import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { hasFeatureAccess } from '../utils/featureAccess';

/**
 * Route-level feature gate.
 * Renders children only if the school's plan includes the feature.
 * Redirects to / if feature is not enabled.
 * 
 * Super admins always pass.
 * Communication features always pass.
 */
const FeatureGate = ({ feature, children }) => {
  const { userInfo } = useSelector((state) => state.auth);

  if (!hasFeatureAccess(userInfo, feature)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default FeatureGate;
