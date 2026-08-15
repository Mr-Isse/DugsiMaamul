import { baseApi } from './baseApi'

/**
 * Academic API endpoints
 * Handles academic years, terms, and related data
 */
export const academicApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Academic Years
    getAcademicYears: builder.query({
      query: () => '/academic/years',
      providesTags: ['AcademicYears'],
      transformResponse: (response) => {
        return {
          success: true,
          data: response.data || response,
        }
      },
    }),

    // Create Academic Year
    createAcademicYear: builder.mutation({
      query: (data) => ({
        url: '/academic/years',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AcademicYears'],
    }),

    // Update Academic Year
    updateAcademicYear: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/academic/years/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'AcademicYears',
        { type: 'AcademicYears', id },
      ],
    }),

    // Delete Academic Year
    deleteAcademicYear: builder.mutation({
      query: (id) => ({
        url: `/academic/years/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AcademicYears'],
    }),

    // Get Academic Terms
    getAcademicTerms: builder.query({
      query: (params) => {
        const qs = params ? new URLSearchParams(params).toString() : ''
        return `/academic/terms${qs ? `?${qs}` : ''}`
      },
      transformResponse: (response) => {
        if (Array.isArray(response)) return { data: response }
        if (Array.isArray(response?.data)) return { data: response.data }
        return response
      },
      providesTags: ['AcademicTerms'],
    }),

    // Create Academic Term
    createAcademicTerm: builder.mutation({
      query: (data) => ({
        url: '/academic/terms',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AcademicTerms'],
    }),

    // Update Academic Term
    updateAcademicTerm: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/academic/terms/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'AcademicTerms',
        { type: 'AcademicTerms', id },
      ],
    }),

    // Delete Academic Term
    deleteAcademicTerm: builder.mutation({
      query: (id) => ({
        url: `/academic/terms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AcademicTerms'],
    }),

    // Activate Academic Term
    activateAcademicTerm: builder.mutation({
      query: (id) => ({
        url: `/academic/terms/${id}/activate`,
        method: 'POST',
      }),
      invalidatesTags: ['AcademicTerms'],
    }),

    // Archive Academic Term
    archiveAcademicTerm: builder.mutation({
      query: (id) => ({
        url: `/academic/terms/${id}/archive`,
        method: 'POST',
      }),
      invalidatesTags: ['AcademicTerms'],
    }),
  }),
})

export const {
  useGetAcademicYearsQuery,
  useCreateAcademicYearMutation,
  useUpdateAcademicYearMutation,
  useDeleteAcademicYearMutation,
  useGetAcademicTermsQuery,
  useCreateAcademicTermMutation,
  useUpdateAcademicTermMutation,
  useDeleteAcademicTermMutation,
  useActivateAcademicTermMutation,
  useArchiveAcademicTermMutation,
} = academicApi
