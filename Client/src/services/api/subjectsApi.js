import { baseApi } from './baseApi'

export const subjectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get subjects list
    getSubjects: builder.query({
      query: (params) => ({
        url: '/admin/subjects',
        params,
      }),
      providesTags: ['Subjects'],
    }),

    // Get single subject
    getSubject: builder.query({
      query: (id) => `/admin/subjects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Subjects', id }],
    }),

    // Create subject
    createSubject: builder.mutation({
      query: (data) => ({
        url: '/admin/subjects',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subjects'],
    }),

    // Update subject
    updateSubject: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/subjects/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Subjects',
        { type: 'Subjects', id },
      ],
    }),

    // Delete subject
    deleteSubject: builder.mutation({
      query: (id) => ({
        url: `/admin/subjects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subjects'],
    }),
  }),
})

export const {
  useGetSubjectsQuery,
  useGetSubjectQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
} = subjectsApi
