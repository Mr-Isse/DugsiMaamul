import { baseApi } from './baseApi'

export const leaveApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get leave requests
    getLeaveRequests: builder.query({
      query: (params) => ({
        url: '/admin/leave',
        params,
      }),
      providesTags: ['LeaveRequests'],
    }),

    // Get single leave request
    getLeaveRequest: builder.query({
      query: (id) => `/admin/leave/${id}`,
      providesTags: (result, error, id) => [{ type: 'LeaveRequests', id }],
    }),

    // Create leave request
    createLeaveRequest: builder.mutation({
      query: (data) => ({
        url: '/admin/leave',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LeaveRequests'],
    }),

    // Update leave request
    updateLeaveRequest: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/leave/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'LeaveRequests',
        { type: 'LeaveRequests', id },
      ],
    }),

    // Delete leave request
    deleteLeaveRequest: builder.mutation({
      query: (id) => ({
        url: `/admin/leave/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LeaveRequests'],
    }),

    // Approve leave request
    approveLeaveRequest: builder.mutation({
      query: (id) => ({
        url: `/admin/leave/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'LeaveRequests',
        { type: 'LeaveRequests', id },
      ],
    }),

    // Reject leave request
    rejectLeaveRequest: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/admin/leave/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        'LeaveRequests',
        { type: 'LeaveRequests', id },
      ],
    }),
  }),
})

export const {
  useGetLeaveRequestsQuery,
  useGetLeaveRequestQuery,
  useCreateLeaveRequestMutation,
  useUpdateLeaveRequestMutation,
  useDeleteLeaveRequestMutation,
  useApproveLeaveRequestMutation,
  useRejectLeaveRequestMutation,
} = leaveApi
