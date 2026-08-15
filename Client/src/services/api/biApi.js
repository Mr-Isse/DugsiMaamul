import { baseApi } from './baseApi'

export const biApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExecutiveDashboard: builder.query({
      query: (params) => ({
        url: '/bi/executive',
        params,
      }),
      providesTags: ['Enterprise'],
    }),
    getKpiDashboard: builder.query({
      query: (params) => ({
        url: '/bi/kpi',
        params,
      }),
      providesTags: ['Enterprise'],
    }),
    getFinancialAnalytics: builder.query({
      query: (params) => ({
        url: '/bi/financial',
        params,
      }),
      providesTags: ['Enterprise'],
    }),
    getAcademicAnalytics: builder.query({
      query: (params) => ({
        url: '/bi/academic',
        params,
      }),
      providesTags: ['Enterprise'],
    }),
    getComparativeReports: builder.query({
      query: (params) => ({
        url: '/bi/comparative',
        params,
      }),
      providesTags: ['Enterprise'],
    }),
    getBiReports: builder.query({
      query: (params) => ({
        url: '/bi/reports',
        params,
      }),
      providesTags: ['Enterprise'],
    }),
    generateBiReport: builder.mutation({
      query: (data) => ({
        url: '/bi/reports',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Enterprise'],
    }),
    deleteBiReport: builder.mutation({
      query: (id) => ({
        url: `/bi/reports/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Enterprise'],
    }),
  }),
})

export const {
  useGetExecutiveDashboardQuery,
  useGetKpiDashboardQuery,
  useGetFinancialAnalyticsQuery,
  useGetAcademicAnalyticsQuery,
  useGetComparativeReportsQuery,
  useGetBiReportsQuery,
  useGenerateBiReportMutation,
  useDeleteBiReportMutation,
} = biApi
