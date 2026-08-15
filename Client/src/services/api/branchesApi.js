import { baseApi } from './baseApi'

/**
 * Branches API endpoints
 * Handles branch management and data
 */
export const branchesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Branches
    getBranches: builder.query({
      query: () => '/branches',
      providesTags: ['Branches'],
      transformResponse: (response) => {
        return {
          success: true,
          data: response.data || response,
        }
      },
    }),

    // Create Branch
    createBranch: builder.mutation({
      query: (data) => ({
        url: '/branches',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Branches'],
    }),

    // Update Branch
    updateBranch: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/branches/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Branches',
        { type: 'Branches', id },
      ],
    }),

    // Delete Branch
    deleteBranch: builder.mutation({
      query: (id) => ({
        url: `/branches/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Branches'],
    }),

    // Toggle Branch Status
    toggleBranchStatus: builder.mutation({
      query: (id) => ({
        url: `/branches/${id}/toggle-status`,
        method: 'POST',
      }),
      invalidatesTags: ['Branches'],
    }),
  }),
})

export const {
  useGetBranchesQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useToggleBranchStatusMutation,
} = branchesApi
