import { baseApi } from './baseApi'

export const alumniApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get alumni
    getAlumni: builder.query({
      query: (params) => ({
        url: '/admin/alumni',
        params,
      }),
      providesTags: ['Alumni'],
    }),

    // Get single alumni
    getAlumniRecord: builder.query({
      query: (id) => `/admin/alumni/${id}`,
      providesTags: (result, error, id) => [{ type: 'Alumni', id }],
    }),

    // Create alumni record
    createAlumniRecord: builder.mutation({
      query: (data) => ({
        url: '/admin/alumni',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Alumni'],
    }),

    // Update alumni record
    updateAlumniRecord: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/alumni/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Alumni',
        { type: 'Alumni', id },
      ],
    }),

    // Delete alumni record
    deleteAlumniRecord: builder.mutation({
      query: (id) => ({
        url: `/admin/alumni/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Alumni'],
    }),
  }),
})

export const {
  useGetAlumniQuery,
  useGetAlumniRecordQuery,
  useCreateAlumniRecordMutation,
  useUpdateAlumniRecordMutation,
  useDeleteAlumniRecordMutation,
} = alumniApi
