import { baseApi } from './baseApi'

export const scheduleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get schedule
    getSchedule: builder.query({
      query: (params) => ({
        url: '/admin/schedule',
        params,
      }),
      providesTags: ['Schedule'],
    }),

    // Get schedule for class
    getClassSchedule: builder.query({
      query: (classId) => `/admin/schedule/class/${classId}`,
      providesTags: (result, error, classId) => [{ type: 'Schedule', id: classId }],
    }),

    // Get schedule for teacher
    getTeacherSchedule: builder.query({
      query: (teacherId) => `/admin/schedule/teacher/${teacherId}`,
      providesTags: (result, error, teacherId) => [{ type: 'Schedule', id: teacherId }],
    }),

    // Create schedule item
    createScheduleItem: builder.mutation({
      query: (data) => ({
        url: '/admin/schedule',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Schedule'],
    }),

    // Update schedule item
    updateScheduleItem: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/schedule/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Schedule',
        { type: 'Schedule', id },
      ],
    }),

    // Delete schedule item
    deleteScheduleItem: builder.mutation({
      query: (id) => ({
        url: `/admin/schedule/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Schedule'],
    }),
  }),
})

export const {
  useGetScheduleQuery,
  useGetClassScheduleQuery,
  useGetTeacherScheduleQuery,
  useCreateScheduleItemMutation,
  useUpdateScheduleItemMutation,
  useDeleteScheduleItemMutation,
} = scheduleApi
