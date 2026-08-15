import { baseApi } from './baseApi'

export const certificateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get certificates
    getCertificates: builder.query({
      query: (params) => ({
        url: '/admin/certificates',
        params,
      }),
      providesTags: ['Certificates'],
    }),

    // Get single certificate
    getCertificate: builder.query({
      query: (id) => `/admin/certificates/${id}`,
      providesTags: (result, error, id) => [{ type: 'Certificates', id }],
    }),

    // Generate certificate
    generateCertificate: builder.mutation({
      query: (data) => ({
        url: '/admin/certificates/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Certificates'],
    }),

    // Update certificate
    updateCertificate: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/certificates/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Certificates',
        { type: 'Certificates', id },
      ],
    }),

    // Delete certificate
    deleteCertificate: builder.mutation({
      query: (id) => ({
        url: `/admin/certificates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Certificates'],
    }),
  }),
})

export const {
  useGetCertificatesQuery,
  useGetCertificateQuery,
  useGenerateCertificateMutation,
  useUpdateCertificateMutation,
  useDeleteCertificateMutation,
} = certificateApi