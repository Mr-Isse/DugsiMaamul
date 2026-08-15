import { baseApi } from './baseApi'

export const departmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get departments list
    getDepartments: builder.query({
      query: (params) => ({
        url: '/departments/departments',
        params,
      }),
      providesTags: ['Departments'],
    }),

    // Get single department
    getDepartment: builder.query({
      query: (id) => `/departments/departments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Departments', id }],
    }),

    // Create department
    createDepartment: builder.mutation({
      query: (data) => ({
        url: '/departments/departments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Departments'],
    }),

    // Update department
    updateDepartment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/departments/departments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Departments',
        { type: 'Departments', id },
      ],
    }),

    // Delete department
    deleteDepartment: builder.mutation({
      query: (id) => ({
        url: `/departments/departments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Departments'],
    }),
  }),
})

export const {
  useGetDepartmentsQuery,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentsApi
