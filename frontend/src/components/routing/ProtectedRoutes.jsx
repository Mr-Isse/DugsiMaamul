import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/** School dashboard — supports Admins, Teachers, Students, and Branch Users */
export const SchoolAdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);

  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 1. Redirect SuperAdmins to their dedicated layout if they hit school routes
  if (userInfo.role === 'superadmin' || userInfo.role === 'super_admin') {
    return <Navigate to="/admin" replace />;
  }

  // 2. Profile Setup Check (Only for SchoolAdmins)
  const isSchoolAdmin = ['schooladmin', 'school_admin', 'admin'].includes(userInfo.role);
  const isBranchAdmin = ['branch_manager', 'branchmanager'].includes(userInfo.role);
  
  const isOnProfileSetupPage = location.pathname === '/school-profile-setup';
  if (isSchoolAdmin && userInfo.schoolProfileCompleted !== true && !isOnProfileSetupPage) {
    return <Navigate to="/school-profile-setup" replace />;
  }

  return children;
};

/** Super admin control center */
export const SuperAdminProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { userInfo } = useSelector((state) => state.auth);

  if (!userInfo) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (userInfo.role !== 'superadmin' && userInfo.role !== 'super_admin') {
    if (userInfo.role === 'schooladmin') {
      return <Navigate to="/" replace />;
    }
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

/** Redirect logged-in users away from auth pages */
export const SuperAdminPublicRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);
  if (userInfo?.role === 'superadmin' || userInfo?.role === 'super_admin') {
    return <Navigate to="/admin" replace />;
  }
  return children;
};

export default SchoolAdminProtectedRoute;
