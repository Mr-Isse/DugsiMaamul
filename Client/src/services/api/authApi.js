import { baseApi } from './baseApi'

/**
 * Authentication API endpoints
 * Handles login, logout, and user authentication
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // General Login (handles both super admin and school admin)
    // More flexible than admin-login for development without subdomain
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response) => {
        return {
          success: true,
          data: response,
        }
      },
    }),

    // Admin Login (strict - requires school subdomain)
    adminLogin: builder.mutation({
      query: (credentials) => ({
        url: '/auth/admin-login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response) => {
        // Backend returns user data with token
        return {
          success: true,
          data: response,
        }
      },
    }),

    // Get User Profile
    getProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: ['Auth', 'User'],
      transformResponse: (response) => {
        return {
          success: true,
          data: response,
        }
      },
    }),

    // Logout
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
  }),
})

export const {
  useAdminLoginMutation,
  useLoginMutation,
  useGetProfileQuery,
  useLogoutMutation,
} = authApi
