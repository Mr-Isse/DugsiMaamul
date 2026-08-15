import { baseApi } from './baseApi'

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get events
    getEvents: builder.query({
      query: (params) => ({
        url: '/admin/events',
        params,
      }),
      providesTags: ['Events'],
    }),

    // Get single event
    getEvent: builder.query({
      query: (id) => `/admin/events/${id}`,
      providesTags: (result, error, id) => [{ type: 'Events', id }],
    }),

    // Create event
    createEvent: builder.mutation({
      query: (data) => ({
        url: '/admin/events',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Events'],
    }),

    // Update event
    updateEvent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/events/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Events',
        { type: 'Events', id },
      ],
    }),

    // Delete event
    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `/admin/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Events'],
    }),

    // Publish event
    publishEvent: builder.mutation({
      query: (id) => ({
        url: `/admin/events/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'Events',
        { type: 'Events', id },
      ],
    }),

    // Unpublish event
    unpublishEvent: builder.mutation({
      query: (id) => ({
        url: `/admin/events/${id}/unpublish`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'Events',
        { type: 'Events', id },
      ],
    }),
  }),
})

export const {
  useGetEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  usePublishEventMutation,
  useUnpublishEventMutation,
} = eventsApi
