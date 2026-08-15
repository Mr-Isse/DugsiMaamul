import { baseApi } from './baseApi'

export const studentWelfareApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get health records
    getHealthRecords: builder.query({
      query: (params) => ({
        url: '/admin/student-welfare/health',
        params,
      }),
      providesTags: ['HealthRecords'],
    }),

    // Create health record
    createHealthRecord: builder.mutation({
      query: (data) => ({
        url: '/admin/student-welfare/health',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['HealthRecords'],
    }),

    // Update health record
    updateHealthRecord: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/student-welfare/health/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'HealthRecords',
        { type: 'HealthRecords', id },
      ],
    }),

    // Delete health record
    deleteHealthRecord: builder.mutation({
      query: (id) => ({
        url: `/admin/student-welfare/health/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['HealthRecords'],
    }),

    // Get discipline records
    getDisciplineRecords: builder.query({
      query: (params) => ({
        url: '/admin/student-welfare/discipline',
        params,
      }),
      providesTags: ['DisciplineRecords'],
    }),

    // Create discipline record
    createDisciplineRecord: builder.mutation({
      query: (data) => ({
        url: '/admin/student-welfare/discipline',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['DisciplineRecords'],
    }),

    // Update discipline record
    updateDisciplineRecord: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/student-welfare/discipline/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'DisciplineRecords',
        { type: 'DisciplineRecords', id },
      ],
    }),

    // Delete discipline record
    deleteDisciplineRecord: builder.mutation({
      query: (id) => ({
        url: `/admin/student-welfare/discipline/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DisciplineRecords'],
    }),
  }),
})

export const {
  useGetHealthRecordsQuery,
  useCreateHealthRecordMutation,
  useUpdateHealthRecordMutation,
  useDeleteHealthRecordMutation,
  useGetDisciplineRecordsQuery,
  useCreateDisciplineRecordMutation,
  useUpdateDisciplineRecordMutation,
  useDeleteDisciplineRecordMutation,
} = studentWelfareApi
