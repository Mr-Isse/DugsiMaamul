import { baseApi } from './baseApi'

export const teachersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get teachers list
    getTeachers: builder.query({
      query: (params) => ({
        url: '/admin/teachers',
        params,
      }),
      providesTags: ['Teachers'],
    }),

    // Get single teacher
    getTeacher: builder.query({
      query: (id) => `/admin/teachers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Teachers', id }],
    }),

    // Create teacher
    createTeacher: builder.mutation({
      query: (data) => ({
        url: '/admin/teachers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Teachers'],
    }),

    // Update teacher
    updateTeacher: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/teachers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Teachers',
        { type: 'Teachers', id },
      ],
    }),

    // Delete teacher
    deleteTeacher: builder.mutation({
      query: (id) => ({
        url: `/admin/teachers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Teachers'],
    }),

    // Bulk password reset
    bulkResetPasswords: builder.mutation({
      query: () => ({
        url: '/admin/teachers/reset-passwords',
        method: 'POST',
      }),
      invalidatesTags: ['Teachers'],
    }),

    // Reset single teacher password
    resetTeacherPassword: builder.mutation({
      query: (id) => ({
        url: `/admin/teachers/${id}/reset-password`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Teachers', id }],
    }),

    // Assign subjects to teacher
    assignSubjects: builder.mutation({
      query: ({ id, subjects }) => ({
        url: `/admin/teachers/${id}/subjects`,
        method: 'POST',
        body: { subjects },
      }),
      invalidatesTags: (result, error, { id }) => [
        'Teachers',
        { type: 'Teachers', id },
      ],
    }),

    // Bulk import teachers
    bulkImportTeachers: builder.mutation({
      query: (formData) => ({
        url: '/admin/teachers/import',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['Teachers'],
    }),
  }),
})

export const {
  useGetTeachersQuery,
  useGetTeacherQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useBulkResetPasswordsMutation,
  useResetTeacherPasswordMutation,
  useAssignSubjectsMutation,
  useBulkImportTeachersMutation,
  useTakeAttendanceMutation,
} = teachersApi
