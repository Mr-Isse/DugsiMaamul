/**
 * Permission Utilities for Frontend RBAC
 * Provides helper functions to check user permissions and hide/show UI elements
 */

/**
 * Check if user has a specific permission
 * @param {Object} user - User object from auth state
 * @param {string} permission - Permission code to check (e.g., 'students.view')
 * @returns {boolean} - True if user has permission
 */
export const hasPermission = (user, permission) => {
  if (!user) return false;

  // Super admins have all permissions
  if (user.role === 'superadmin' || user.role === 'super_admin') {
    return true;
  }

  // School admins (Tenant Owners) have all permissions for their school
  if (['schooladmin', 'school_admin', 'admin'].includes(user.role)) {
    return true;
  }

  // Get effective permissions list
  const userPermissions = getEffectivePermissions(user);

  // Check direct and role permissions
  if (userPermissions.includes(permission)) {
    return true;
  }

  // Check wildcard matches (e.g., 'students.*' matches 'students.view')
  const [module] = permission.split('.');
  if (userPermissions.includes(`${module}.*`)) {
    return true;
  }

  if (userPermissions.includes('*.manage') || userPermissions.includes('*.*')) {
    return true;
  }

  return false;
};

/**
 * Check if user has any of the specified permissions
 * @param {Object} user - User object from auth state
 * @param {string[]} permissions - Array of permission codes
 * @returns {boolean} - True if user has any of the permissions
 */
export const hasAnyPermission = (user, permissions) => {
  if (!user || !permissions || permissions.length === 0) return false;

  return permissions.some(permission => hasPermission(user, permission));
};

/**
 * Check if user has all of the specified permissions
 * @param {Object} user - User object from auth state
 * @param {string[]} permissions - Array of permission codes
 * @returns {boolean} - True if user has all permissions
 */
export const hasAllPermissions = (user, permissions) => {
  if (!user || !permissions || permissions.length === 0) return false;

  return permissions.every(permission => hasPermission(user, permission));
};

/**
 * Get all effective permissions for a user (direct + role + overrides)
 * @param {Object} user - User object from auth state
 * @returns {string[]} - Array of all effective permissions
 */
export const getEffectivePermissions = (user) => {
  if (!user) return [];

  let permissions = [...(user.permissions || [])];

  // Add role permissions
  if (user.rbacRole && user.rbacRole.permissions) {
    permissions = [...permissions, ...user.rbacRole.permissions];
  }

  // Apply permission overrides
  if (user.permissionOverrides && user.permissionOverrides.length > 0) {
    user.permissionOverrides.forEach(override => {
      if (override.granted) {
        if (!permissions.includes(override.permission)) {
          permissions.push(override.permission);
        }
      } else {
        permissions = permissions.filter(p => p !== override.permission);
      }
    });
  }

  // Remove duplicates
  return [...new Set(permissions)];
};

/**
 * Permission-based component wrapper
 * Hides children if user lacks permission
 */
export const PermissionGuard = ({ user, permission, fallback = null, children }) => {
  if (hasPermission(user, permission)) {
    return children;
  }
  return fallback;
};

/**
 * Role-based component wrapper
 * Hides children if user doesn't have the required role
 */
export const RoleGuard = ({ user, roles, fallback = null, children }) => {
  if (!user) return fallback;
  
  const userRole = user.role;
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
  if (allowedRoles.includes(userRole)) {
    return children;
  }
  
  return fallback;
};

/**
 * Check if user can access a specific module based on permissions
 * @param {Object} user - User object from auth state
 * @param {string} module - Module name (e.g., 'students', 'finance')
 * @returns {boolean} - True if user has any permission for the module
 */
export const canAccessModule = (user, module) => {
  if (!user || !module) return false;

  // Super admins, school admins, and branch managers can access all modules
  if (['superadmin', 'super_admin', 'schooladmin', 'school_admin', 'admin', 'branch_manager', 'branchmanager'].includes(user.role)) {
    return true;
  }

  const effectivePermissions = getEffectivePermissions(user);
  
  // Check if user has any permission for this module
  return effectivePermissions.some(permission => permission.startsWith(`${module}.`));
};

/**
 * Get user-friendly permission label
 * @param {string} permission - Permission code (e.g., 'students.view')
 * @returns {string} - Human-readable label
 */
export const getPermissionLabel = (permission) => {
  if (!permission) return '';
  
  const parts = permission.split('.');
  if (parts.length < 2) return permission;
  
  const [module, action] = parts;
  
  const moduleLabels = {
    students: 'Students',
    teachers: 'Teachers',
    classes: 'Classes',
    subjects: 'Subjects',
    attendance: 'Attendance',
    exams: 'Exams',
    finance: 'Finance',
    branches: 'Branches',
    rbac: 'RBAC',
    settings: 'Settings'
  };
  
  const actionLabels = {
    view: 'View',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    manage: 'Manage',
    approve: 'Approve',
    export: 'Export',
    import: 'Import'
  };
  
  const moduleLabel = moduleLabels[module] || module;
  const actionLabel = actionLabels[action] || action;
  
  return `${actionLabel} ${moduleLabel}`;
};
