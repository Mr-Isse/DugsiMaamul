import { baseApi } from './baseApi'

export const idCardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get ID cards
    getIdCards: builder.query({
      query: (params) => ({
        url: '/admin/id-cards',
        params,
      }),
      providesTags: ['IDCards'],
    }),

    // Get single ID card
    getIdCard: builder.query({
      query: (id) => `/admin/id-cards/${id}`,
      providesTags: (result, error, id) => [{ type: 'IDCards', id }],
    }),

    // Get users for ID card generation
    getUsersForIdCard: builder.query({
      query: (params) => ({
        url: '/admin/id-cards/users',
        params,
      }),
      providesTags: ['IDCards'],
    }),

    // Create/Generate ID card
    createIdCard: builder.mutation({
      query: (data) => ({
        url: '/admin/id-cards',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['IDCards'],
    }),

    // Update ID card
    updateIdCard: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/id-cards/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'IDCards',
        { type: 'IDCards', id },
      ],
    }),

    // Update ID card status
    updateIdCardStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/id-cards/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        'IDCards',
        { type: 'IDCards', id },
      ],
    }),

    // Mark ID card as printed
    markIdCardPrinted: builder.mutation({
      query: (id) => ({
        url: `/admin/id-cards/${id}/mark-printed`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'IDCards',
        { type: 'IDCards', id },
      ],
    }),

    // Delete ID card
    deleteIdCard: builder.mutation({
      query: (id) => ({
        url: `/admin/id-cards/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['IDCards'],
    }),

    // Reprint ID card
    reprintIdCard: builder.mutation({
      query: (id) => ({
        url: `/admin/id-cards/${id}/reprint`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'IDCards',
        { type: 'IDCards', id },
      ],
    }),

    // Get ID card designs
    getIdCardDesigns: builder.query({
      query: (params) => ({
        url: '/admin/id-card-designs',
        params,
      }),
      providesTags: ['IDCardDesigns'],
    }),

    // Create ID card design
    createIdCardDesign: builder.mutation({
      query: (data) => ({
        url: '/admin/id-card-designs',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['IDCardDesigns'],
    }),
  }),
})

export const {
  useGetIdCardsQuery,
  useGetIdCardQuery,
  useGetUsersForIdCardQuery,
  useCreateIdCardMutation,
  useUpdateIdCardMutation,
  useUpdateIdCardStatusMutation,
  useMarkIdCardPrintedMutation,
  useDeleteIdCardMutation,
  useReprintIdCardMutation,
  useGetIdCardDesignsQuery,
  useCreateIdCardDesignMutation,
  useGetCertificatesQuery,
  useGetCertificateQuery,
  useGenerateCertificateMutation,
  useUpdateCertificateMutation,
  useDeleteCertificateMutation,
} = idCardApi
