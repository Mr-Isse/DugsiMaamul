import { baseApi } from './baseApi'

export const visitorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get visitors
    getVisitors: builder.query({
      query: (params) => ({
        url: '/admin/visitors',
        params,
      }),
      providesTags: ['Visitors'],
    }),

    // Get single visitor
    getVisitor: builder.query({
      query: (id) => `/admin/visitors/${id}`,
      providesTags: (result, error, id) => [{ type: 'Visitors', id }],
    }),

    // Create visitor
    createVisitor: builder.mutation({
      query: (data) => ({
        url: '/admin/visitors',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Visitors'],
    }),

    // Update visitor
    updateVisitor: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/visitors/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Visitors',
        { type: 'Visitors', id },
      ],
    }),

    // Delete visitor
    deleteVisitor: builder.mutation({
      query: (id) => ({
        url: `/admin/visitors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Visitors'],
    }),

    // Check out visitor
    checkoutVisitor: builder.mutation({
      query: (id) => ({
        url: `/admin/visitors/${id}/checkout`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'Visitors',
        { type: 'Visitors', id },
      ],
    }),
  }),
})

export const {
  useGetVisitorsQuery,
  useGetVisitorQuery,
  useCreateVisitorMutation,
  useUpdateVisitorMutation,
  useDeleteVisitorMutation,
  useCheckoutVisitorMutation,
} = visitorApi
