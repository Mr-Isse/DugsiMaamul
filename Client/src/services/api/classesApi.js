import { baseApi } from './baseApi'

export const classesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get classes list
    getClasses: builder.query({
      query: (params) => ({
        url: '/admin/classes',
        params,
      }),
      providesTags: ['Classes'],
    }),

    // Get single class
    getClass: builder.query({
      query: (id) => `/admin/classes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Classes', id }],
    }),

    // Get class with subjects (alternative endpoint)
    getClassById: builder.query({
      query: (id) => `/admin/classes/${id}`,
      providesTags: (result, error, id) => [{ type: 'Classes', id }],
    }),

    // Get students in class
    getStudentsInClass: builder.query({
      query: (classId) => `/admin/class-students/${classId}`,
      providesTags: ['Students'],
    }),

    // Create class
    createClass: builder.mutation({
      query: (data) => ({
        url: '/admin/classes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Classes'],
    }),

    // Update class
    updateClass: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/classes/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Classes',
        { type: 'Classes', id },
      ],
    }),

    // Delete class
    deleteClass: builder.mutation({
      query: (id) => ({
        url: `/admin/classes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Classes'],
    }),

    // Assign subject to class
    assignSubjectToClass: builder.mutation({
      query: ({ classId, subjectId, teacherId }) => ({
        url: '/admin/subjects/assign',
        method: 'POST',
        body: { classId, subjectId, teacherId },
      }),
      invalidatesTags: ['Classes', 'Subjects'],
    }),

    // Update class subject assignment
    updateClassSubjectAssignment: builder.mutation({
      query: ({ id, teacherId }) => ({
        url: `/admin/class-subjects/${id}`,
        method: 'PUT',
        body: { teacherId },
      }),
      invalidatesTags: ['Classes', 'Subjects'],
    }),

    // Transfer student
    transferStudent: builder.mutation({
      query: ({ studentId, newClassId }) => ({
        url: `/admin/students/${studentId}/transfer`,
        method: 'POST',
        body: { newClassId },
      }),
      invalidatesTags: ['Students', 'Classes'],
    }),

    // Assign students to class
    assignStudents: builder.mutation({
      query: ({ id, students }) => ({
        url: `/admin/classes/${id}/students`,
        method: 'POST',
        body: { students },
      }),
      invalidatesTags: (result, error, { id }) => [
        'Classes',
        { type: 'Classes', id },
        'Students',
      ],
    }),

    // Assign teacher to class
    assignTeacher: builder.mutation({
      query: ({ id, teacherId }) => ({
        url: `/admin/classes/${id}/teacher`,
        method: 'POST',
        body: { teacherId },
      }),
      invalidatesTags: (result, error, { id }) => [
        'Classes',
        { type: 'Classes', id },
      ],
    }),

    // Remove student from class
    removeStudent: builder.mutation({
      query: ({ classId, studentId }) => ({
        url: `/admin/classes/${classId}/students/${studentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { classId }) => [
        'Classes',
        { type: 'Classes', classId },
        'Students',
      ],
    }),
  }),
})

export const {
  useGetClassesQuery,
  useGetClassQuery,
  useGetClassByIdQuery,
  useGetStudentsInClassQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useAssignSubjectToClassMutation,
  useUpdateClassSubjectAssignmentMutation,
  useTransferStudentMutation,
  useAssignStudentsMutation,
  useAssignTeacherMutation,
  useRemoveStudentMutation,
} = classesApi
