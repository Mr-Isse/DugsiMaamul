import { baseApi } from './baseApi'

export const designationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get designations list
    getDesignations: builder.query({
      query: (params) => ({
        url: '/admin/designations',
        params,
      }),
      providesTags: ['Designations'],
    }),

    // Get single designation
    getDesignation: builder.query({
      query: (id) => `/admin/designations/${id}`,
      providesTags: (result, error, id) => [{ type: 'Designations', id }],
    }),

    // Create designation
    createDesignation: builder.mutation({
      query: (data) => ({
        url: '/admin/designations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Designations'],
    }),

    // Update designation
    updateDesignation: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/designations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Designations',
        { type: 'Designations', id },
      ],
    }),

    // Delete designation
    deleteDesignation: builder.mutation({
      query: (id) => ({
        url: `/admin/designations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Designations'],
    }),
  }),
})

export const {
  useGetDesignationsQuery,
  useGetDesignationQuery,
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
  useDeleteDesignationMutation,
} = designationsApi
