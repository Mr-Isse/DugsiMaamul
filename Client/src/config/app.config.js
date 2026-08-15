/**
 * Application configuration from environment variables.
 * Never hardcode production API URLs.
 */

const requiredEnv = ['VITE_API_BASE_URL']

requiredEnv.forEach((key) => {
  if (!import.meta.env[key]) {
    console.warn(`[config] Missing environment variable: ${key}`)
  }
})

export const appConfig = {
  appName: import.meta.env.VITE_APP_NAME || 'DugsiMaamul',
  env: import.meta.env.VITE_APP_ENV || import.meta.env.MODE || 'development',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5004/api/v1',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}

export const STORAGE_KEYS = {
  accessToken: 'dm_access_token',
  refreshToken: 'dm_refresh_token',
  theme: 'dm_theme',
  tenantId: 'dm_tenant_id',
  branchId: 'dm_branch_id',
  academicYearId: 'dm_academic_year_id',
  redirectPath: 'dm_redirect_path',
}

export const API_HEADERS = {
  authorization: 'Authorization',
  tenantId: 'x-tenant-id',
  branchId: 'x-branch-id',
  academicYearId: 'x-academic-year-id',
}
