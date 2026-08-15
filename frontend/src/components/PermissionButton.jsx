import { useSelector } from 'react-redux';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permissions';

/**
 * Permission-based Button Component
 * Hides the button if user lacks the required permission
 */
export const PermissionButton = ({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
  ...props
}) => {
  const { userInfo } = useSelector((state) => state.auth);

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(userInfo, permission);
  } else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(userInfo, permissions)
      : hasAnyPermission(userInfo, permissions);
  } else {
    // No permission required, always show
    hasAccess = true;
  }

  if (!hasAccess) {
    return fallback;
  }

  return (
    <button {...props}>
      {children}
    </button>
  );
};

/**
 * Permission-based Action Component
 * Hides the action (div, span, etc.) if user lacks permission
 */
export const PermissionAction = ({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
  as: Component = 'div',
  ...props
}) => {
  const { userInfo } = useSelector((state) => state.auth);

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(userInfo, permission);
  } else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(userInfo, permissions)
      : hasAnyPermission(userInfo, permissions);
  } else {
    // No permission required, always show
    hasAccess = true;
  }

  if (!hasAccess) {
    return fallback;
  }

  return (
    <Component {...props}>
      {children}
    </Component>
  );
};

/**
 * Permission-based Link Component
 * Hides the link if user lacks permission
 */
export const PermissionLink = ({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
  ...props
}) => {
  const { userInfo } = useSelector((state) => state.auth);

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(userInfo, permission);
  } else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(userInfo, permissions)
      : hasAnyPermission(userInfo, permissions);
  } else {
    // No permission required, always show
    hasAccess = true;
  }

  if (!hasAccess) {
    return fallback;
  }

  return (
    <a {...props}>
      {children}
    </a>
  );
};

/**
 * Permission-based Icon Button Component
 * Specifically for icon-only buttons (edit, delete, etc.)
 */
export const PermissionIconButton = ({
  permission,
  permissions,
  requireAll = false,
  children,
  fallback = null,
  ...props
}) => {
  const { userInfo } = useSelector((state) => state.auth);

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(userInfo, permission);
  } else if (permissions) {
    hasAccess = requireAll 
      ? hasAllPermissions(userInfo, permissions)
      : hasAnyPermission(userInfo, permissions);
  } else {
    // No permission required, always show
    hasAccess = true;
  }

  if (!hasAccess) {
    return fallback;
  }

  return (
    <button {...props} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
      {children}
    </button>
  );
};

export default PermissionButton;
