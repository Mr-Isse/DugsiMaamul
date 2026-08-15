import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

/**
 * Build-time tenant id from .env / EAS (TENANT_ID or SCHOOL_SUBDOMAIN).
 * Same codebase, different binary per school — no source changes.
 */
export function getBuildTenantId() {
  const id = extra.tenantId || extra.schoolSubdomain || 'default';
  return String(id).toLowerCase();
}

export const TENANT_ID = getBuildTenantId();

export function getBuildTimeSchoolConfig() {
  return {
    tenantId: getBuildTenantId(),
    tenantSubdomain: getBuildTenantId(),
    appName: extra.appName || Constants.expoConfig?.name || 'School App',
    primaryColor: extra.primaryColor || '#0A84FF',
    secondaryColor: extra.secondaryColor || '#00C7BE',
    accentColor: extra.accentColor || '#FF9500',
    backgroundColor: extra.backgroundColor || '#F5F7FA',
    textColor: extra.textColor || '#1D1D1F',
    splashImage: extra.splashImage || null,
    appIcon: extra.appIcon || null,
    apiUrl: extra.apiUrl || 'https://schoolmangementbackend-deployment.up.railway.app/api/v1',
    features: {
      enableAttendance: true,
      enableExamResults: true,
      enablePayments: true,
      enableSchedule: true,
    },
  };
}

export function isWhitelabelBuild() {
  const id = getBuildTenantId();
  return Boolean(id) && id !== 'default';
}

/** Merge runtime API config over build-time defaults */
export function mergeTenantConfig(runtime = null) {
  const build = getBuildTimeSchoolConfig();
  if (!runtime) return { ...build, source: 'build' };

  return {
    ...build,
    ...runtime,
    tenantId: runtime.tenantId || runtime.subdomain || build.tenantId,
    tenantSubdomain: runtime.subdomain || runtime.tenantId || build.tenantSubdomain,
    appName: runtime.name || runtime.appName || build.appName,
    name: runtime.name || runtime.appName || build.appName,
    primaryColor: runtime.primaryColor || build.primaryColor,
    secondaryColor: runtime.secondaryColor || build.secondaryColor,
    accentColor: runtime.accentColor || build.accentColor,
    backgroundColor: runtime.backgroundColor || build.backgroundColor,
    textColor: runtime.textColor || build.textColor,
    source: 'runtime',
  };
}
