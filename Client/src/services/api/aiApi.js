import { baseApi } from './baseApi'

export const aiApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAiInsights: builder.query({
      query: (params) => ({
        url: '/ai/insights',
        params,
      }),
      providesTags: ['Enterprise'],
    }),
    getAiRecommendations: builder.query({
      query: (params) => ({
        url: '/ai/recommendations',
        params,
      }),
      providesTags: ['Enterprise'],
    }),
    getAiPredictions: builder.query({
      query: (params) => ({
        url: '/ai/predictions',
        params,
      }),
      providesTags: ['Enterprise'],
    }),
    generatePredictions: builder.mutation({
      query: (data) => ({
        url: '/ai/predictions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Enterprise'],
    }),
    getAiChatSessions: builder.query({
      query: () => '/ai/chat/sessions',
      providesTags: ['Enterprise'],
    }),
    getAiChatMessages: builder.query({
      query: (sessionId) => `/ai/chat/${sessionId}`,
      providesTags: (result, error, id) => [{ type: 'Enterprise', id }],
    }),
    sendAiChatMessage: builder.mutation({
      query: (data) => ({
        url: '/ai/chat',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Enterprise', id: arg.sessionId }],
    }),
  }),
})

export const {
  useGetAiInsightsQuery,
  useGetAiRecommendationsQuery,
  useGetAiPredictionsQuery,
  useGeneratePredictionsMutation,
  useGetAiChatSessionsQuery,
  useGetAiChatMessagesQuery,
  useSendAiChatMessageMutation,
} = aiApi
