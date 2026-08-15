import { baseApi } from './baseApi'

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get available reports
    getReports: builder.query({
      query: () => '/admin/reports',
      providesTags: ['Reports'],
    }),

    // Generate report
    generateReport: builder.mutation({
      query: (data) => ({
        url: '/admin/reports/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Reports'],
    }),

    // Download report
    downloadReport: builder.mutation({
      query: (reportId) => ({
        url: `/admin/reports/${reportId}/download`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Get report history
    getReportHistory: builder.query({
      query: (params) => ({
        url: '/admin/reports/history',
        params,
      }),
      providesTags: ['ReportHistory'],
    }),
  }),
})

export const {
  useGetReportsQuery,
  useGenerateReportMutation,
  useDownloadReportMutation,
  useGetReportHistoryQuery,
} = reportsApi
