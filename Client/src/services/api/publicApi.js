import { baseApi } from './baseApi'

export const publicApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAvailablePlans: builder.query({
      query: () => '/public/plans',
      providesTags: ['Plans'],
    }),
    submitLead: builder.mutation({
      query: (data) => ({
        url: '/public/leads',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Leads'],
    }),
  }),
})

export const { useGetAvailablePlansQuery, useSubmitLeadMutation } = publicApi
