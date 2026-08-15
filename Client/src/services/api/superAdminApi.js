import { baseApi } from './baseApi'

export const superAdminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Schools Management
    getSchools: builder.query({
      query: (params) => ({
        url: '/super-admin/schools',
        params,
      }),
      providesTags: ['Tenant'],
    }),
    getSchoolById: builder.query({
      query: (id) => `/super-admin/schools/${id}`,
      providesTags: (result, error, id) => [{ type: 'Tenant', id }],
    }),
    updateSchool: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/super-admin/schools/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tenant', id }, 'Tenant'],
    }),
    toggleSchoolBlock: builder.mutation({
      query: (id) => ({
        url: `/super-admin/schools/${id}/toggle-block`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Tenant', id }, 'Tenant'],
    }),
    deleteSchool: builder.mutation({
      query: (id) => ({
        url: `/super-admin/schools/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tenant'],
    }),

    // School Admins Management
    getSchoolAdmins: builder.query({
      query: (params) => ({
        url: '/super-admin/admins',
        params,
      }),
      providesTags: ['User'],
    }),
    createSchoolAdmin: builder.mutation({
      query: (data) => ({
        url: '/super-admin/register-school-admin',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    updateSchoolAdmin: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/super-admin/admins/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
    }),
    toggleSchoolAdminStatus: builder.mutation({
      query: (id) => ({
        url: `/super-admin/admins/${id}/toggle-status`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id }, 'User'],
    }),
    deleteSchoolAdmin: builder.mutation({
      query: (id) => ({
        url: `/super-admin/admins/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Plans Management
    getPlans: builder.query({
      query: (params) => ({
        url: '/super-admin/plans',
        params,
      }),
      providesTags: ['Subscription'],
    }),
    createPlan: builder.mutation({
      query: (data) => ({
        url: '/super-admin/plans',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscription'],
    }),
    updatePlan: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/super-admin/plans/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Subscription', id }, 'Subscription'],
    }),
    deletePlan: builder.mutation({
      query: (id) => ({
        url: `/super-admin/plans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subscription'],
    }),

    // Features
    getFeatureRegistry: builder.query({
      query: () => '/super-admin/feature-registry',
    }),
  }),
})

export const {
  useGetSchoolsQuery,
  useGetSchoolByIdQuery,
  useUpdateSchoolMutation,
  useToggleSchoolBlockMutation,
  useDeleteSchoolMutation,
  useGetSchoolAdminsQuery,
  useCreateSchoolAdminMutation,
  useUpdateSchoolAdminMutation,
  useToggleSchoolAdminStatusMutation,
  useDeleteSchoolAdminMutation,
  useGetPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useDeletePlanMutation,
  useGetFeatureRegistryQuery,
} = superAdminApi
