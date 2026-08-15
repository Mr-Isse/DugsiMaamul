import { baseApi } from './baseApi'

export const admissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get admissions list
    getAdmissions: builder.query({
      query: (params) => ({
        url: '/admin/admissions',
        params,
      }),
      providesTags: ['Admissions'],
    }),

    // Get single admission
    getAdmission: builder.query({
      query: (id) => `/admin/admissions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Admissions', id }],
    }),

    // Create admission
    createAdmission: builder.mutation({
      query: (data) => ({
        url: '/admin/admissions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Admissions'],
    }),

    // Update admission
    updateAdmission: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/admissions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Admissions',
        { type: 'Admissions', id },
      ],
    }),

    // Update admission status
    updateAdmissionStatus: builder.mutation({
      query: ({ id, status, reviewNotes }) => ({
        url: `/admin/admissions/${id}/status`,
        method: 'PATCH',
        body: { status, reviewNotes },
      }),
      invalidatesTags: (result, error, { id }) => [
        'Admissions',
        { type: 'Admissions', id },
      ],
    }),

    // Delete admission
    deleteAdmission: builder.mutation({
      query: (id) => ({
        url: `/admin/admissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admissions'],
    }),
  }),
})

export const {
  useGetAdmissionsQuery,
  useGetAdmissionQuery,
  useCreateAdmissionMutation,
  useUpdateAdmissionMutation,
  useUpdateAdmissionStatusMutation,
  useDeleteAdmissionMutation,
} = admissionsApi
