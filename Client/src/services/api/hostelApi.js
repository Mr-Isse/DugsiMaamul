import { baseApi } from './baseApi'

export const hostelApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get rooms
    getRooms: builder.query({
      query: (params) => ({
        url: '/admin/hostel/rooms',
        params,
      }),
      providesTags: ['HostelRooms'],
    }),

    // Get single room
    getRoom: builder.query({
      query: (id) => `/admin/hostel/rooms/${id}`,
      providesTags: (result, error, id) => [{ type: 'HostelRooms', id }],
    }),

    // Create room
    createRoom: builder.mutation({
      query: (data) => ({
        url: '/admin/hostel/rooms',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['HostelRooms'],
    }),

    // Update room
    updateRoom: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/hostel/rooms/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'HostelRooms',
        { type: 'HostelRooms', id },
      ],
    }),

    // Delete room
    deleteRoom: builder.mutation({
      query: (id) => ({
        url: `/admin/hostel/rooms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['HostelRooms'],
    }),

    // Assign student to room
    assignStudentToRoom: builder.mutation({
      query: (data) => ({
        url: '/admin/hostel/assign',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['HostelRooms'],
    }),

    // Remove student from room
    removeStudentFromRoom: builder.mutation({
      query: (data) => ({
        url: '/admin/hostel/unassign',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['HostelRooms'],
    }),

    // Get hostels
    getHostels: builder.query({
      query: (params) => ({
        url: '/admin/hostel',
        params,
      }),
      providesTags: ['Hostels'],
    }),

    // Get hostel attendance
    getHostelAttendance: builder.query({
      query: (params) => ({
        url: '/admin/hostel/attendance',
        params,
      }),
      providesTags: ['HostelAttendance'],
    }),

    // Mark hostel attendance
    markHostelAttendance: builder.mutation({
      query: (data) => ({
        url: '/admin/hostel/attendance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['HostelAttendance'],
    }),

    // Get bed allocations
    getBedAllocations: builder.query({
      query: (params) => ({
        url: '/admin/hostel/bed-allocations',
        params,
      }),
      providesTags: ['BedAllocations'],
    }),

    // Create bed allocation
    createBedAllocation: builder.mutation({
      query: (data) => ({
        url: '/admin/hostel/bed-allocations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['BedAllocations'],
    }),

    // Update bed allocation
    updateBedAllocation: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/hostel/bed-allocations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'BedAllocations',
        { type: 'BedAllocations', id },
      ],
    }),

    // Delete bed allocation
    deleteBedAllocation: builder.mutation({
      query: (id) => ({
        url: `/admin/hostel/bed-allocations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BedAllocations'],
    }),
  }),
})

export const {
  useGetRoomsQuery,
  useGetRoomQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useAssignStudentToRoomMutation,
  useRemoveStudentFromRoomMutation,
  useGetHostelsQuery,
  useGetHostelAttendanceQuery,
  useMarkHostelAttendanceMutation,
  useGetBedAllocationsQuery,
  useCreateBedAllocationMutation,
  useUpdateBedAllocationMutation,
  useDeleteBedAllocationMutation,
} = hostelApi
