import { baseApi } from './baseApi'

export const rbacApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get roles
    getRoles: builder.query({
      query: () => '/admin/roles',
      providesTags: ['Roles'],
    }),

    // Get single role
    getRole: builder.query({
      query: (id) => `/admin/roles/${id}`,
      providesTags: (result, error, id) => [{ type: 'Roles', id }],
    }),

    // Create role
    createRole: builder.mutation({
      query: (data) => ({
        url: '/admin/roles',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Roles'],
    }),

    // Update role
    updateRole: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/roles/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Roles',
        { type: 'Roles', id },
      ],
    }),

    // Delete role
    deleteRole: builder.mutation({
      query: (id) => ({
        url: `/admin/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles'],
    }),

    // Get permissions
    getPermissions: builder.query({
      query: () => '/admin/permissions',
      providesTags: ['Permissions'],
    }),

    // Get single permission
    getPermission: builder.query({
      query: (id) => `/admin/permissions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Permissions', id }],
    }),

    // Create permission
    createPermission: builder.mutation({
      query: (data) => ({
        url: '/admin/permissions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Permissions'],
    }),

    // Update permission
    updatePermission: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/permissions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Permissions',
        { type: 'Permissions', id },
      ],
    }),

    // Delete permission
    deletePermission: builder.mutation({
      query: (id) => ({
        url: `/admin/permissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Permissions'],
    }),
  }),
})

export const {
  useGetRolesQuery,
  useGetRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
  useGetPermissionQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
} = rbacApi
