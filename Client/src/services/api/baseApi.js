import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { appConfig, API_HEADERS } from '@/config/app.config'
import { getAccessToken, getStoredContext } from '@/lib/token'
import { logout } from '@/store/slices/authSlice'
import { extractApiError } from './errorHandler'

/**
 * Centralized RTK Query base API.
 * Injects Authorization + tenant/branch/academic-year headers when available.
 * Endpoint definitions for ERP modules will be injected later via injectEndpoints.
 */

const rawBaseQuery = fetchBaseQuery({
  baseUrl: appConfig.apiBaseUrl,
  prepareHeaders: (headers, { getState, endpoint }) => {
    const state = getState()
    const token = state.auth?.accessToken || getAccessToken()
    const stored = getStoredContext()

    const tenantId = state.tenant?.tenantId || stored.tenantId
    const branchId = state.branch?.branchId || stored.branchId
    const academicYearId =
      state.branch?.academicYearId || stored.academicYearId

    if (token) {
      headers.set(API_HEADERS.authorization, `Bearer ${token}`)
    }

    if (tenantId) {
      headers.set(API_HEADERS.tenantId, tenantId)
    }

    if (branchId && branchId !== 'all') {
      headers.set(API_HEADERS.branchId, branchId)
    }

    if (academicYearId) {
      headers.set(API_HEADERS.academicYearId, academicYearId)
    }

    // Don't set Content-Type for FormData (let browser set multipart/form-data with boundary)
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json')
    }

    // Avoid unused var lint for endpoint in foundation
    void endpoint

    return headers
  },
})

const baseQueryWithErrorHandling = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)

  if (result.error) {
    const parsed = extractApiError(result.error)

    // Centralized auth expiry handling — UX only; backend still enforces auth
    if (parsed.status === 401) {
      api.dispatch(logout())
    }

    result.error = {
      ...result.error,
      parsed,
    }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: [
    'Auth',
    'User',
    'Tenant',
    'Branch',
    'Subscription',
    'AcademicYear',
  ],
  endpoints: () => ({}),
})

export const {
  util: apiUtil,
} = baseApi
