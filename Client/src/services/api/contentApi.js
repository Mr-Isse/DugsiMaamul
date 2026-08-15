import { baseApi } from './baseApi'

export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get public content pages
    getPublicContent: builder.query({
      query: (params) => ({
        url: '/admin/public-content',
        params,
      }),
      providesTags: ['PublicContent'],
    }),

    // Get single content page
    getContentPage: builder.query({
      query: (id) => `/admin/public-content/${id}`,
      providesTags: (result, error, id) => [{ type: 'PublicContent', id }],
    }),

    // Create content page
    createContentPage: builder.mutation({
      query: (data) => ({
        url: '/admin/public-content',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PublicContent'],
    }),

    // Update content page
    updateContentPage: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/public-content/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'PublicContent',
        { type: 'PublicContent', id },
      ],
    }),

    // Delete content page
    deleteContentPage: builder.mutation({
      query: (id) => ({
        url: `/admin/public-content/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PublicContent'],
    }),

    // Publish content page
    publishContentPage: builder.mutation({
      query: (id) => ({
        url: `/admin/public-content/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'PublicContent',
        { type: 'PublicContent', id },
      ],
    }),

    // Unpublish content page
    unpublishContentPage: builder.mutation({
      query: (id) => ({
        url: `/admin/public-content/${id}/unpublish`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'PublicContent',
        { type: 'PublicContent', id },
      ],
    }),
  }),
})

export const {
  useGetPublicContentQuery,
  useGetContentPageQuery,
  useCreateContentPageMutation,
  useUpdateContentPageMutation,
  useDeleteContentPageMutation,
  usePublishContentPageMutation,
  useUnpublishContentPageMutation,
} = contentApi
