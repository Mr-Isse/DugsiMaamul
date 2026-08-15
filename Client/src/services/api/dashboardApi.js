import { baseApi } from './baseApi'

/**
 * Dashboard API endpoints
 * Provides dashboard statistics and analytics for different user roles
 */
export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Admin/School Admin Dashboard Statistics
    getDashboardStats: builder.query({
      query: () => '/admin/dashboard-stats',
      providesTags: ['Dashboard'],
      transformResponse: (response) => {
        // Backend returns direct object, wrap in standard format
        return {
          success: true,
          data: response,
        }
      },
    }),

    // Teacher Dashboard Statistics
    getTeacherDashboardStats: builder.query({
      query: () => '/admin/teacher-dashboard-stats',
      providesTags: ['Dashboard', 'Teacher'],
      transformResponse: (response) => {
        return {
          success: true,
          data: response,
        }
      },
    }),

    // Super Admin Business Metrics
    getBusinessMetrics: builder.query({
      query: () => '/super-admin/business-metrics',
      providesTags: ['Dashboard', 'SuperAdmin'],
      transformResponse: (response) => response,
    }),

    // Super Admin System Health
    getSystemHealth: builder.query({
      query: () => '/super-admin/system-health',
      providesTags: ['Dashboard', 'SystemHealth'],
      transformResponse: (response) => response,
    }),

    // Student Dashboard Statistics
    getStudentDashboardStats: builder.query({
      query: () => '/student/dashboard-stats',
      providesTags: ['Dashboard', 'Student'],
      transformResponse: (response) => {
        return {
          success: true,
          data: response,
        }
      },
    }),
  }),
})

export const {
  useGetDashboardStatsQuery,
  useGetTeacherDashboardStatsQuery,
  useGetBusinessMetricsQuery,
  useGetSystemHealthQuery,
  useGetStudentDashboardStatsQuery,
} = dashboardApi
