import { baseApi } from './baseApi'

export const parentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get parents list
    getParents: builder.query({
      query: (params) => ({
        url: '/admin/parents',
        params,
      }),
      providesTags: ['Parents'],
    }),

    // Get single parent
    getParent: builder.query({
      query: (id) => `/admin/parents/${id}`,
      providesTags: (result, error, id) => [{ type: 'Parents', id }],
    }),

    // Create parent
    createParent: builder.mutation({
      query: (data) => ({
        url: '/admin/parents',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Parents'],
    }),

    // Update parent
    updateParent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/parents/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Parents',
        { type: 'Parents', id },
      ],
    }),

    // Delete parent
    deleteParent: builder.mutation({
      query: (id) => ({
        url: `/admin/parents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Parents'],
    }),

    // Reset parent password
    resetParentPassword: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/parents/${id}/reset-password`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Parents'],
    }),

    // Link parent to students
    linkParentToStudents: builder.mutation({
      query: (data) => ({
        url: '/enterprise/parent/link-students',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Parents', 'Students'],
    }),
  }),
})

export const {
  useGetParentsQuery,
  useGetParentQuery,
  useCreateParentMutation,
  useUpdateParentMutation,
  useDeleteParentMutation,
  useResetParentPasswordMutation,
  useLinkParentToStudentsMutation,
} = parentsApi
