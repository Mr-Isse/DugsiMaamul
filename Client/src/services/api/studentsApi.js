import { baseApi } from './baseApi'

export const studentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get students list
    getStudents: builder.query({
      query: (params) => ({
        url: '/admin/students',
        params,
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.students)) return response.students;
        return response;
      },
      providesTags: ['Students'],
    }),

    // Get single student
    getStudent: builder.query({
      query: (id) => `/admin/students/${id}`,
      providesTags: (result, error, id) => [{ type: 'Students', id }],
    }),

    // Create student
    createStudent: builder.mutation({
      query: (data) => ({
        url: '/admin/students',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Students'],
    }),

    // Update student
    updateStudent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/students/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Students',
        { type: 'Students', id },
      ],
    }),

    // Delete student
    deleteStudent: builder.mutation({
      query: (id) => ({
        url: `/admin/students/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Students'],
    }),

    // Generate bulk credentials
    generateBulkCredentials: builder.mutation({
      query: () => ({
        url: '/admin/students/generate-credentials',
        method: 'POST',
      }),
      invalidatesTags: ['Students'],
    }),

    // Generate single student credentials
    generateStudentLogin: builder.mutation({
      query: (id) => ({
        url: `/admin/students/${id}/generate-login`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Students', id }],
    }),

    // Bulk import students
    bulkImportStudents: builder.mutation({
      query: (formData) => ({
        url: '/admin/students/import',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['Students'],
    }),
  }),
})

export const {
  useGetStudentsQuery,
  useGetStudentQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGenerateBulkCredentialsMutation,
  useGenerateStudentLoginMutation,
  useBulkImportStudentsMutation,
} = studentsApi
