import { baseApi } from './baseApi'

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get school settings
    getSchoolSettings: builder.query({
      query: () => '/admin/settings',
      providesTags: ['Settings'],
    }),

    // Update school settings
    updateSchoolSettings: builder.mutation({
      query: (data) => ({
        url: '/admin/settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Settings'],
    }),

    // Get school profile
    getSchoolProfile: builder.query({
      query: () => '/admin/school-profile',
      providesTags: ['SchoolProfile'],
    }),

    // Update school profile
    updateSchoolProfile: builder.mutation({
      query: (data) => ({
        url: '/admin/school-profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SchoolProfile'],
    }),

    // Get security settings
    getSecuritySettings: builder.query({
      query: () => '/admin/security-settings',
      providesTags: ['SecuritySettings'],
    }),

    // Update security settings
    updateSecuritySettings: builder.mutation({
      query: (data) => ({
        url: '/admin/security-settings',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['SecuritySettings'],
    }),

    // Get password policies
    getPasswordPolicies: builder.query({
      query: () => '/admin/password-policies',
      providesTags: ['PasswordPolicies'],
    }),

    // Update password policies
    updatePasswordPolicies: builder.mutation({
      query: (data) => ({
        url: '/admin/password-policies',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['PasswordPolicies'],
    }),
  }),
})

export const {
  useGetSchoolSettingsQuery,
  useUpdateSchoolSettingsMutation,
  useGetSchoolProfileQuery,
  useUpdateSchoolProfileMutation,
  useGetSecuritySettingsQuery,
  useUpdateSecuritySettingsMutation,
  useGetPasswordPoliciesQuery,
  useUpdatePasswordPoliciesMutation,
} = settingsApi
