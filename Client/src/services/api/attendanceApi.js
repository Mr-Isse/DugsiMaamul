import { baseApi } from './baseApi'

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get attendance records
    getAttendance: builder.query({
      query: (params) => ({
        url: '/admin/attendance',
        params,
      }),
      providesTags: ['Attendance'],
    }),

    // Get attendance for specific student
    getStudentAttendance: builder.query({
      query: (studentId) => ({
        url: '/admin/attendance',
        params: { studentId },
      }),
      providesTags: (result, error, studentId) => [{ type: 'Attendance', id: studentId }],
    }),

    // Get attendance for specific class
    getClassAttendance: builder.query({
      query: (classId) => ({
        url: '/admin/attendance',
        params: { classId },
      }),
      providesTags: (result, error, classId) => [{ type: 'Attendance', id: classId }],
    }),

    // Get attendance for specific date
    getAttendanceByDate: builder.query({
      query: (date) => ({
        url: '/admin/attendance',
        params: { date },
      }),
      providesTags: ['Attendance'],
    }),

    // Mark attendance (admin endpoint - requires subjectId)
    markAttendance: builder.mutation({
      query: (data) => ({
        url: '/admin/attendance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),

    // Bulk mark attendance for class (uses same endpoint)
    markClassAttendance: builder.mutation({
      query: (data) => ({
        url: '/admin/attendance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),

    // Update attendance record
    updateAttendance: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/attendance/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Attendance',
        { type: 'Attendance', id },
      ],
    }),

    // Delete attendance record
    deleteAttendance: builder.mutation({
      query: (id) => ({
        url: `/admin/attendance/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Attendance'],
    }),

    // Get attendance statistics
    getAttendanceStats: builder.query({
      query: (params) => ({
        url: '/admin/attendance',
        params: { ...params, stats: true },
      }),
      providesTags: ['Attendance'],
    }),
  }),
})

export const {
  useGetAttendanceQuery,
  useGetStudentAttendanceQuery,
  useGetClassAttendanceQuery,
  useGetAttendanceByDateQuery,
  useMarkAttendanceMutation,
  useMarkClassAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useGetAttendanceStatsQuery,
} = attendanceApi
