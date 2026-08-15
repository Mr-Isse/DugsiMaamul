import { baseApi } from './baseApi'

export const automationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAutomationStats: builder.query({
      query: () => '/automation/stats',
      providesTags: ['Enterprise'],
    }),
    getAutomationLogs: builder.query({
      query: (params) => ({
        url: '/automation/logs',
        params,
      }),
      providesTags: ['Enterprise'],
    }),
    getScheduledJobs: builder.query({
      query: (params) => ({
        url: '/automation/jobs',
        params,
      }),
      providesTags: ['Enterprise'],
    }),
    createScheduledJob: builder.mutation({
      query: (data) => ({
        url: '/automation/jobs',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Enterprise'],
    }),
    updateScheduledJob: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/automation/jobs/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Enterprise'],
    }),
    deleteScheduledJob: builder.mutation({
      query: (id) => ({
        url: `/automation/jobs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Enterprise'],
    }),
    toggleScheduledJob: builder.mutation({
      query: (id) => ({
        url: `/automation/jobs/${id}/toggle`,
        method: 'POST',
      }),
      invalidatesTags: ['Enterprise'],
    }),
    runScheduledJobNow: builder.mutation({
      query: (id) => ({
        url: `/automation/jobs/${id}/run`,
        method: 'POST',
      }),
      invalidatesTags: ['Enterprise'],
    }),
  }),
})

export const {
  useGetAutomationStatsQuery,
  useGetAutomationLogsQuery,
  useGetScheduledJobsQuery,
  useCreateScheduledJobMutation,
  useUpdateScheduledJobMutation,
  useDeleteScheduledJobMutation,
  useToggleScheduledJobMutation,
  useRunScheduledJobNowMutation,
} = automationApi
