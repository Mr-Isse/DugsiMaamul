import { baseApi } from './baseApi'

export const homeworkApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get homeworks list
    getHomeworks: builder.query({
      query: (params) => ({
        url: '/admin/homework',
        params,
      }),
      providesTags: ['Homework'],
    }),

    // Get single homework
    getHomework: builder.query({
      query: (id) => `/admin/homework/${id}`,
      providesTags: (result, error, id) => [{ type: 'Homework', id }],
    }),

    // Create homework
    createHomework: builder.mutation({
      query: (data) => ({
        url: '/admin/homework',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Homework'],
    }),

    // Update homework
    updateHomework: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/homework/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Homework',
        { type: 'Homework', id },
      ],
    }),

    // Delete homework
    deleteHomework: builder.mutation({
      query: (id) => ({
        url: `/admin/homework/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Homework'],
    }),
  }),
})

export const {
  useGetHomeworksQuery,
  useGetHomeworkQuery,
  useCreateHomeworkMutation,
  useUpdateHomeworkMutation,
  useDeleteHomeworkMutation,
} = homeworkApi
