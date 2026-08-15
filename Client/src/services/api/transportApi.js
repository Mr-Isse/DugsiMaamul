import { baseApi } from './baseApi'

export const transportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get vehicles
    getVehicles: builder.query({
      query: (params) => ({
        url: '/admin/transport/vehicles',
        params,
      }),
      providesTags: ['TransportVehicles'],
    }),

    // Get single vehicle
    getVehicle: builder.query({
      query: (id) => `/admin/transport/vehicles/${id}`,
      providesTags: (result, error, id) => [{ type: 'TransportVehicles', id }],
    }),

    // Create vehicle
    createVehicle: builder.mutation({
      query: (data) => ({
        url: '/admin/transport/vehicles',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TransportVehicles'],
    }),

    // Update vehicle
    updateVehicle: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/transport/vehicles/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'TransportVehicles',
        { type: 'TransportVehicles', id },
      ],
    }),

    // Delete vehicle
    deleteVehicle: builder.mutation({
      query: (id) => ({
        url: `/admin/transport/vehicles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TransportVehicles'],
    }),

    // Get routes
    getRoutes: builder.query({
      query: (params) => ({
        url: '/admin/transport/routes',
        params,
      }),
      providesTags: ['TransportRoutes'],
    }),

    // Create route
    createRoute: builder.mutation({
      query: (data) => ({
        url: '/admin/transport/routes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TransportRoutes'],
    }),

    // Update route
    updateRoute: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/transport/routes/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'TransportRoutes',
        { type: 'TransportRoutes', id },
      ],
    }),

    // Delete route
    deleteRoute: builder.mutation({
      query: (id) => ({
        url: `/admin/transport/routes/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TransportRoutes'],
    }),

    // Assign student to route
    assignStudentToRoute: builder.mutation({
      query: (data) => ({
        url: '/admin/transport/assign',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TransportRoutes', 'TransportVehicles'],
    }),

    // Get transport allocations (students)
    getTransportAllocations: builder.query({
      query: (params) => ({
        url: '/admin/transport/allocations',
        params,
      }),
      providesTags: ['TransportAllocations'],
    }),

    // Create transport allocation
    createTransportAllocation: builder.mutation({
      query: (data) => ({
        url: '/admin/transport/allocations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['TransportAllocations'],
    }),

    // Update transport allocation
    updateTransportAllocation: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/transport/allocations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'TransportAllocations',
        { type: 'TransportAllocations', id },
      ],
    }),

    // Delete transport allocation
    deleteTransportAllocation: builder.mutation({
      query: (id) => ({
        url: `/admin/transport/allocations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['TransportAllocations'],
    }),

    // Get fuel logs
    getFuelLogs: builder.query({
      query: (params) => ({
        url: '/admin/transport/fuel-logs',
        params,
      }),
      providesTags: ['FuelLogs'],
    }),

    // Create fuel log
    createFuelLog: builder.mutation({
      query: (data) => ({
        url: '/admin/transport/fuel-logs',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['FuelLogs'],
    }),

    // Get vehicle maintenance
    getVehicleMaintenance: builder.query({
      query: (params) => ({
        url: '/admin/transport/maintenance',
        params,
      }),
      providesTags: ['VehicleMaintenance'],
    }),

    // Create vehicle maintenance
    createVehicleMaintenance: builder.mutation({
      query: (data) => ({
        url: '/admin/transport/maintenance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['VehicleMaintenance'],
    }),

    // Update vehicle maintenance
    updateVehicleMaintenance: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/transport/maintenance/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'VehicleMaintenance',
        { type: 'VehicleMaintenance', id },
      ],
    }),
  }),
})

export const {
  useGetVehiclesQuery,
  useGetVehicleQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
  useGetRoutesQuery,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
  useAssignStudentToRouteMutation,
  useGetTransportAllocationsQuery,
  useCreateTransportAllocationMutation,
  useUpdateTransportAllocationMutation,
  useDeleteTransportAllocationMutation,
  useGetFuelLogsQuery,
  useCreateFuelLogMutation,
  useGetVehicleMaintenanceQuery,
  useCreateVehicleMaintenanceMutation,
  useUpdateVehicleMaintenanceMutation,
} = transportApi
