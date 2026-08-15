/**
 * Mobile Feature Access — Plan-Based Feature Enforcement
 * Mirrors the backend/frontend feature access logic.
 */

const COMMUNICATION_FEATURES = [
  'announcements',
  'notifications',
  'push-notifications',
  'sms',
  'email-automation',
  'whatsapp',
  'bulk-messaging',
  'automated-alerts',
];

const DEFAULT_FEATURES = [
  'students', 'teachers', 'classes', 'subjects',
  'attendance', 'schedules', 'academic-years',
  'announcements', 'settings', 'support', 'help-center',
  'notifications', 'push-notifications', 'email-automation',
  'bulk-messaging', 'automated-alerts', 'messaging',
  'student-app', 'teacher-app', 'parent-app',
];

/**
 * Check if a feature is enabled for the current school.
 * @param {string[]} enabledFeatures - Array of feature codes from the backend
 * @param {string} featureCode - Feature to check
 * @returns {boolean}
 */
export const hasFeatureAccess = (enabledFeatures, featureCode) => {
  if (!featureCode) return true;
  if (COMMUNICATION_FEATURES.includes(featureCode)) return true;

  const features = enabledFeatures || [];
  if (features.includes('ALL_MODULES')) return true;
  if (features.length === 0) {
    return DEFAULT_FEATURES.includes(featureCode);
  }
  return features.includes(featureCode);
};

/**
 * Filter an array of tab configs, keeping only those whose feature is enabled.
 * @param {Array} tabs - Tab objects with a `feature` property
 * @param {string[]} enabledFeatures - Feature codes from backend
 * @returns {Array} Filtered tabs
 */
export const filterTabsByFeatures = (tabs, enabledFeatures) => {
  return tabs.filter((tab) => {
    if (!tab.feature) return true;
    return hasFeatureAccess(enabledFeatures, tab.feature);
  });
};
