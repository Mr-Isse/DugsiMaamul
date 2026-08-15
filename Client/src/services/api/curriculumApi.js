import { baseApi } from './baseApi'

export const curriculumApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get curriculums list
    getCurriculums: builder.query({
      query: (params) => ({
        url: '/admin/curriculum',
        params,
      }),
      providesTags: ['Curriculum'],
    }),

    // Get single curriculum
    getCurriculum: builder.query({
      query: (id) => `/admin/curriculum/${id}`,
      providesTags: (result, error, id) => [{ type: 'Curriculum', id }],
    }),

    // Create curriculum
    createCurriculum: builder.mutation({
      query: (data) => ({
        url: '/admin/curriculum',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Curriculum'],
    }),

    // Update curriculum
    updateCurriculum: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/curriculum/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Curriculum',
        { type: 'Curriculum', id },
      ],
    }),

    // Delete curriculum
    deleteCurriculum: builder.mutation({
      query: (id) => ({
        url: `/admin/curriculum/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Curriculum'],
    }),
  }),
})

export const {
  useGetCurriculumsQuery,
  useGetCurriculumQuery,
  useCreateCurriculumMutation,
  useUpdateCurriculumMutation,
  useDeleteCurriculumMutation,
} = curriculumApi
