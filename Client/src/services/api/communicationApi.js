import { baseApi } from './baseApi'

export const communicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get announcements
    getAnnouncements: builder.query({
      query: (params) => ({
        url: '/admin/announcements',
        params,
      }),
      providesTags: ['Announcements'],
    }),

    // Get single announcement
    getAnnouncement: builder.query({
      query: (id) => `/admin/announcements/${id}`,
      providesTags: (result, error, id) => [{ type: 'Announcements', id }],
    }),

    // Create announcement
    createAnnouncement: builder.mutation({
      query: (data) => ({
        url: '/admin/announcements',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Announcements'],
    }),

    // Update announcement
    updateAnnouncement: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/announcements/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Announcements',
        { type: 'Announcements', id },
      ],
    }),

    // Delete announcement
    deleteAnnouncement: builder.mutation({
      query: (id) => ({
        url: `/admin/announcements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Announcements'],
    }),

    // Publish announcement
    publishAnnouncement: builder.mutation({
      query: (id) => ({
        url: `/admin/announcements/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'Announcements',
        { type: 'Announcements', id },
      ],
    }),

    // Unpublish announcement
    unpublishAnnouncement: builder.mutation({
      query: (id) => ({
        url: `/admin/announcements/${id}/unpublish`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'Announcements',
        { type: 'Announcements', id },
      ],
    }),

    // Get communication settings
    getCommunicationSettings: builder.query({
      query: () => '/admin/communication-settings',
      providesTags: ['CommunicationSettings'],
    }),

    // Update communication settings
    updateCommunicationSettings: builder.mutation({
      query: (data) => ({
        url: '/admin/communication-settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['CommunicationSettings'],
    }),

    // Communication Messages
    getCommunicationMessages: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString()
        return `/v1/communication/messages${qs ? `?${qs}` : ''}`
      },
      providesTags: ['CommunicationMessages'],
    }),

    getCommunicationMessageById: builder.query({
      query: (id) => `/v1/communication/messages/${id}`,
      providesTags: (result, error, id) => [{ type: 'CommunicationMessages', id }],
    }),

    createCommunicationMessage: builder.mutation({
      query: (data) => ({
        url: '/v1/communication/messages',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CommunicationMessages'],
    }),

    updateCommunicationMessage: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/v1/communication/messages/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'CommunicationMessages',
        { type: 'CommunicationMessages', id },
      ],
    }),

    deleteCommunicationMessage: builder.mutation({
      query: (id) => ({
        url: `/v1/communication/messages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CommunicationMessages'],
    }),

    duplicateCommunicationMessage: builder.mutation({
      query: (id) => ({
        url: `/v1/communication/messages/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: ['CommunicationMessages'],
    }),

    sendCommunicationMessage: builder.mutation({
      query: (id) => ({
        url: `/v1/communication/messages/${id}/send`,
        method: 'POST',
      }),
      invalidatesTags: ['CommunicationMessages'],
    }),

    // Notifications
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notifications'],
    }),

    getNotificationHistory: builder.query({
      query: () => '/notifications/history',
      providesTags: ['Notifications'],
    }),

    getNotificationRecipients: builder.query({
      query: (role = 'all') => `/notifications/recipients${role ? `?role=${role}` : ''}`,
      providesTags: ['Notifications', 'Users'],
    }),

    createNotification: builder.mutation({
      query: (data) => ({
        url: '/notifications',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Notifications'],
    }),

    getUnreadCount: builder.query({
      query: () => '/notifications/unread-count',
      providesTags: ['Notifications'],
    }),

    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),

    markAllAsRead: builder.mutation({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),

    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Notification Templates
    getNotificationTemplates: builder.query({
      query: () => '/enterprise/notification-templates',
      providesTags: ['NotificationTemplates'],
    }),

    getNotificationTemplateById: builder.query({
      query: (id) => `/enterprise/notification-templates/${id}`,
      providesTags: (result, error, id) => [{ type: 'NotificationTemplates', id }],
    }),

    createNotificationTemplate: builder.mutation({
      query: (data) => ({
        url: '/enterprise/notification-templates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['NotificationTemplates'],
    }),

    updateNotificationTemplate: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/enterprise/notification-templates/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'NotificationTemplates',
        { type: 'NotificationTemplates', id },
      ],
    }),

    deleteNotificationTemplate: builder.mutation({
      query: (id) => ({
        url: `/enterprise/notification-templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['NotificationTemplates'],
    }),

    seedNotificationTemplates: builder.mutation({
      query: () => ({
        url: '/enterprise/notification-templates/seed',
        method: 'POST',
      }),
      invalidatesTags: ['NotificationTemplates'],
    }),

    // Complaints
    getComplaints: builder.query({
      query: (params) => ({
        url: '/enterprise/complaints',
        params,
      }),
      providesTags: ['Complaints'],
    }),

    createComplaint: builder.mutation({
      query: (data) => ({
        url: '/enterprise/complaints',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Complaints'],
    }),

    updateComplaint: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/enterprise/complaints/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Complaints',
        { type: 'Complaints', id },
      ],
    }),

    deleteComplaint: builder.mutation({
      query: (id) => ({
        url: `/enterprise/complaints/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Complaints'],
    }),

    // Suggestions
    getSuggestions: builder.query({
      query: (params) => ({
        url: '/enterprise/suggestions',
        params,
      }),
      providesTags: ['Suggestions'],
    }),

    createSuggestion: builder.mutation({
      query: (data) => ({
        url: '/enterprise/suggestions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Suggestions'],
    }),

    updateSuggestion: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/enterprise/suggestions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Suggestions',
        { type: 'Suggestions', id },
      ],
    }),

    deleteSuggestion: builder.mutation({
      query: (id) => ({
        url: `/enterprise/suggestions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Suggestions'],
    }),

    upvoteSuggestion: builder.mutation({
      query: (id) => ({
        url: `/enterprise/suggestions/${id}/upvote`,
        method: 'POST',
      }),
      invalidatesTags: ['Suggestions'],
    }),

    // Meetings
    getMeetings: builder.query({
      query: (params) => ({
        url: '/enterprise/meetings',
        params,
      }),
      providesTags: ['Meetings'],
    }),

    createMeeting: builder.mutation({
      query: (data) => ({
        url: '/enterprise/meetings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Meetings'],
    }),

    updateMeeting: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/enterprise/meetings/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Meetings',
        { type: 'Meetings', id },
      ],
    }),

    deleteMeeting: builder.mutation({
      query: (id) => ({
        url: `/enterprise/meetings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Meetings'],
    }),
  }),
})

export const {
  useGetAnnouncementsQuery,
  useGetAnnouncementQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  usePublishAnnouncementMutation,
  useUnpublishAnnouncementMutation,
  useGetCommunicationSettingsQuery,
  useUpdateCommunicationSettingsMutation,
  useGetCommunicationMessagesQuery,
  useGetCommunicationMessageByIdQuery,
  useCreateCommunicationMessageMutation,
  useUpdateCommunicationMessageMutation,
  useDeleteCommunicationMessageMutation,
  useDuplicateCommunicationMessageMutation,
  useSendCommunicationMessageMutation,
  useGetNotificationsQuery,
  useGetNotificationHistoryQuery,
  useGetNotificationRecipientsQuery,
  useCreateNotificationMutation,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useGetNotificationTemplatesQuery,
  useGetNotificationTemplateByIdQuery,
  useCreateNotificationTemplateMutation,
  useUpdateNotificationTemplateMutation,
  useDeleteNotificationTemplateMutation,
  useSeedNotificationTemplatesMutation,
  useGetComplaintsQuery,
  useCreateComplaintMutation,
  useUpdateComplaintMutation,
  useDeleteComplaintMutation,
  useGetSuggestionsQuery,
  useCreateSuggestionMutation,
  useUpdateSuggestionMutation,
  useDeleteSuggestionMutation,
  useUpvoteSuggestionMutation,
  useGetMeetingsQuery,
  useCreateMeetingMutation,
  useUpdateMeetingMutation,
  useDeleteMeetingMutation,
} = communicationApi
