import { baseApi } from './baseApi'

export const lessonPlansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get lesson plans list
    getLessonPlans: builder.query({
      query: (params) => ({
        url: '/admin/lesson-plans',
        params,
      }),
      providesTags: ['LessonPlans'],
    }),

    // Get single lesson plan
    getLessonPlan: builder.query({
      query: (id) => `/admin/lesson-plans/${id}`,
      providesTags: (result, error, id) => [{ type: 'LessonPlans', id }],
    }),

    // Create lesson plan
    createLessonPlan: builder.mutation({
      query: (data) => ({
        url: '/admin/lesson-plans',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LessonPlans'],
    }),

    // Update lesson plan
    updateLessonPlan: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/lesson-plans/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'LessonPlans',
        { type: 'LessonPlans', id },
      ],
    }),

    // Delete lesson plan
    deleteLessonPlan: builder.mutation({
      query: (id) => ({
        url: `/admin/lesson-plans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LessonPlans'],
    }),
  }),
})

export const {
  useGetLessonPlansQuery,
  useGetLessonPlanQuery,
  useCreateLessonPlanMutation,
  useUpdateLessonPlanMutation,
  useDeleteLessonPlanMutation,
} = lessonPlansApi
