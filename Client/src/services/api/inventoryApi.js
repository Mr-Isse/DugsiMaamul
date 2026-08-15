import { baseApi } from './baseApi'

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get inventory items
    getInventory: builder.query({
      query: (params) => ({
        url: '/admin/inventory',
        params,
      }),
      providesTags: ['Inventory'],
    }),

    // Get single item
    getInventoryItem: builder.query({
      query: (id) => `/admin/inventory/${id}`,
      providesTags: (result, error, id) => [{ type: 'Inventory', id }],
    }),

    // Create inventory item
    createInventoryItem: builder.mutation({
      query: (data) => ({
        url: '/admin/inventory',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Inventory'],
    }),

    // Update inventory item
    updateInventoryItem: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/inventory/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Inventory',
        { type: 'Inventory', id },
      ],
    }),

    // Delete inventory item
    deleteInventoryItem: builder.mutation({
      query: (id) => ({
        url: `/admin/inventory/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Inventory'],
    }),

    // Update stock
    updateStock: builder.mutation({
      query: ({ id, quantity, type }) => ({
        url: `/admin/inventory/${id}/stock`,
        method: 'POST',
        body: { quantity, type },
      }),
      invalidatesTags: (result, error, { id }) => [
        'Inventory',
        { type: 'Inventory', id },
      ],
    }),

    // Get suppliers
    getSuppliers: builder.query({
      query: (params) => ({
        url: '/admin/inventory/suppliers',
        params,
      }),
      providesTags: ['Suppliers'],
    }),

    // Create supplier
    createSupplier: builder.mutation({
      query: (data) => ({
        url: '/admin/inventory/suppliers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Suppliers'],
    }),

    // Update supplier
    updateSupplier: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/inventory/suppliers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Suppliers',
        { type: 'Suppliers', id },
      ],
    }),

    // Delete supplier
    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `/admin/inventory/suppliers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Suppliers'],
    }),

    // Get assets
    getAssets: builder.query({
      query: (params) => ({
        url: '/admin/inventory/assets',
        params,
      }),
      providesTags: ['Assets'],
    }),

    // Create asset
    createAsset: builder.mutation({
      query: (data) => ({
        url: '/admin/inventory/assets',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Assets'],
    }),

    // Update asset
    updateAsset: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/inventory/assets/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Assets',
        { type: 'Assets', id },
      ],
    }),

    // Delete asset
    deleteAsset: builder.mutation({
      query: (id) => ({
        url: `/admin/inventory/assets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Assets'],
    }),
  }),
})

export const {
  useGetInventoryQuery,
  useGetInventoryItemQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
  useUpdateStockMutation,
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useGetAssetsQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
} = inventoryApi
