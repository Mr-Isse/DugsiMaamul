/**
 * Feature Access Utilities — Plan-Based Feature Enforcement for the Frontend
 *
 * Access requires BOTH:
 *   1. Plan Feature Enabled  (school.settings.enabledModules includes the code)
 *   2. RBAC Permission Granted (hasPermission returns true)
 *
 * The school object is available in Redux state via `userInfo.school` after login.
 */

// List of all communication features that must never be restricted
const COMMUNICATION_FEATURES = [
  'announcements',
  'notifications',
  'push-notifications',
  'sms',
  'email-automation',
  'whatsapp',
  'bulk-messaging',
  'automated-alerts'
];

/**
 * Get the list of enabled feature codes for the current school.
 * @param {Object} user - User object from auth state (userInfo)
 * @returns {string[]} Array of enabled feature codes
 */
export const getEnabledFeatures = (user) => {
  if (!user) return [];

  // Super admins have access to everything
  if (user.role === 'superadmin' || user.role === 'super_admin') return ['ALL_MODULES'];

  const school = user.school;
  if (!school) return [];

  // If school has enabledFeatures from backend (with overrides applied), use that!
  if (school.enabledFeatures) {
    // Always add communication features if missing
    return [...new Set([...school.enabledFeatures, ...COMMUNICATION_FEATURES])];
  }

  // Fallback to previous logic if enabledFeatures not available
  const plan = school.subscription?.plan;
  const planFeatures = plan?.features || [];
  const enabledModules = school.settings?.enabledModules || [];

  // If plan has ALL_MODULES, everything is enabled
  if (planFeatures.includes('ALL_MODULES')) return ['ALL_MODULES'];

  // Combine both: Features from plan + explicitly enabled modules + always add communication features
  return [...new Set([...planFeatures, ...enabledModules, ...COMMUNICATION_FEATURES])];
};

/**
 * Check if a specific feature is enabled for the school's plan.
 * @param {Object} user - User object from auth state
 * @param {string} featureCode - Feature code to check (e.g., 'exams', 'finance')
 * @returns {boolean}
 */
export const hasFeatureAccess = (user, featureCode) => {
  if (!user) return false;

  // Always allow communication features
  if (COMMUNICATION_FEATURES.includes(featureCode)) {
    return true;
  }

  // Super admins bypass
  if (user.role === 'superadmin' || user.role === 'super_admin') return true;

  const features = getEnabledFeatures(user);
  if (features.includes('ALL_MODULES')) return true;
  return features.includes(featureCode);
};

/**
 * Combined check: Plan Feature AND RBAC Permission must both be true.
 * @param {Object} user - User object from auth state
 * @param {string} featureCode - Feature code (e.g., 'exams')
 * @param {string} permission - Permission code (e.g., 'exams.view')
 * @returns {boolean}
 */
export const canAccessFeature = (user, featureCode, permission) => {
  // Always allow communication features
  if (COMMUNICATION_FEATURES.includes(featureCode)) {
    if (!user) return false;
    // Still require RBAC permissions for communication features
    if (user.role === 'superadmin' || user.role === 'super_admin') return true;
    if (['schooladmin', 'school_admin', 'admin'].includes(user.role)) return true;
    
    const userPermissions = user.permissions || [];
    if (user.rbacRole?.permissions) {
      userPermissions.push(...user.rbacRole.permissions);
    }
    if (!permission) return true;
    if (userPermissions.includes(permission)) return true;
    
    const [module] = permission.split('.');
    if (userPermissions.includes(`${module}.*`)) return true;
    if (userPermissions.includes('*.manage') || userPermissions.includes('*.*')) return true;
    
    return false;
  }

  // Dynamic import would be circular; we inline the permission check here
  if (!user) return false;
  if (!hasFeatureAccess(user, featureCode)) return false;
  if (!permission) return true; // No specific permission needed beyond feature access

  // Inline permission check (mirrors hasPermission from permissions.js)
  if (user.role === 'superadmin' || user.role === 'super_admin') return true;
  if (['schooladmin', 'school_admin', 'admin'].includes(user.role)) return true;

  const userPermissions = user.permissions || [];
  if (user.rbacRole?.permissions) {
    userPermissions.push(...user.rbacRole.permissions);
  }
  if (userPermissions.includes(permission)) return true;

  const [module] = permission.split('.');
  if (userPermissions.includes(`${module}.*`)) return true;
  if (userPermissions.includes('*.manage') || userPermissions.includes('*.*')) return true;

  return false;
};

/**
 * Check if the school subscription is expired.
 * @param {Object} user - User object from auth state
 * @returns {boolean}
 */
export const isSubscriptionExpired = (user) => {
  if (!user?.school?.subscription?.endDate) return false;
  return new Date(user.school.subscription.endDate) < new Date();
};

/**
 * Features that should still be accessible even when subscription is expired.
 */
export const EXPIRED_ALLOWED_FEATURES = ['support', 'settings', ...COMMUNICATION_FEATURES];
