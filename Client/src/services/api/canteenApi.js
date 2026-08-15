import { baseApi } from './baseApi'

export const canteenApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get menu items
    getMenuItems: builder.query({
      query: (params) => ({
        url: '/admin/canteen/menu',
        params,
      }),
      providesTags: ['CanteenMenu'],
    }),

    // Get single menu item
    getMenuItem: builder.query({
      query: (id) => `/admin/canteen/menu/${id}`,
      providesTags: (result, error, id) => [{ type: 'CanteenMenu', id }],
    }),

    // Create menu item
    createMenuItem: builder.mutation({
      query: (data) => ({
        url: '/admin/canteen/menu',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CanteenMenu'],
    }),

    // Update menu item
    updateMenuItem: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/canteen/menu/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'CanteenMenu',
        { type: 'CanteenMenu', id },
      ],
    }),

    // Delete menu item
    deleteMenuItem: builder.mutation({
      query: (id) => ({
        url: `/admin/canteen/menu/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['CanteenMenu'],
    }),

    // Get orders
    getOrders: builder.query({
      query: (params) => ({
        url: '/admin/canteen/orders',
        params,
      }),
      providesTags: ['CanteenOrders'],
    }),

    // Create order
    createOrder: builder.mutation({
      query: (data) => ({
        url: '/admin/canteen/orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CanteenOrders'],
    }),

    // Update order status
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/canteen/orders/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        'CanteenOrders',
        { type: 'CanteenOrders', id },
      ],
    }),
  }),
})

export const {
  useGetMenuItemsQuery,
  useGetMenuItemQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useGetOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
} = canteenApi
