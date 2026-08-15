import { baseApi } from './baseApi'

export const receptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get appointments
    getAppointments: builder.query({
      query: (params) => ({
        url: '/admin/reception/appointments',
        params,
      }),
      providesTags: ['ReceptionAppointments'],
    }),

    // Create appointment
    createAppointment: builder.mutation({
      query: (data) => ({
        url: '/admin/reception/appointments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ReceptionAppointments'],
    }),

    // Update appointment
    updateAppointment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/reception/appointments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'ReceptionAppointments',
        { type: 'ReceptionAppointments', id },
      ],
    }),

    // Delete appointment
    deleteAppointment: builder.mutation({
      query: (id) => ({
        url: `/admin/reception/appointments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ReceptionAppointments'],
    }),

    // Get inquiries
    getInquiries: builder.query({
      query: (params) => ({
        url: '/admin/reception/inquiries',
        params,
      }),
      providesTags: ['ReceptionInquiries'],
    }),

    // Create inquiry
    createInquiry: builder.mutation({
      query: (data) => ({
        url: '/admin/reception/inquiries',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ReceptionInquiries'],
    }),

    // Update inquiry
    updateInquiry: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/reception/inquiries/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'ReceptionInquiries',
        { type: 'ReceptionInquiries', id },
      ],
    }),

    // Delete inquiry
    deleteInquiry: builder.mutation({
      query: (id) => ({
        url: `/admin/reception/inquiries/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ReceptionInquiries'],
    }),
  }),
})

export const {
  useGetAppointmentsQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
  useGetInquiriesQuery,
  useCreateInquiryMutation,
  useUpdateInquiryMutation,
  useDeleteInquiryMutation,
} = receptionApi
