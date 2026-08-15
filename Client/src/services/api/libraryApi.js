import { baseApi } from './baseApi'

export const libraryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get books
    getBooks: builder.query({
      query: (params) => ({
        url: '/admin/library/books',
        params,
      }),
      providesTags: ['LibraryBooks'],
    }),

    // Get single book
    getBook: builder.query({
      query: (id) => `/admin/library/books/${id}`,
      providesTags: (result, error, id) => [{ type: 'LibraryBooks', id }],
    }),

    // Create book
    createBook: builder.mutation({
      query: (data) => ({
        url: '/admin/library/books',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LibraryBooks'],
    }),

    // Update book
    updateBook: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/library/books/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'LibraryBooks',
        { type: 'LibraryBooks', id },
      ],
    }),

    // Delete book
    deleteBook: builder.mutation({
      query: (id) => ({
        url: `/admin/library/books/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LibraryBooks'],
    }),

    // Issue book
    issueBook: builder.mutation({
      query: (data) => ({
        url: '/admin/library/books/issue',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LibraryBooks', 'LibraryTransactions'],
    }),

    // Return book
    returnBook: builder.mutation({
      query: (data) => ({
        url: '/admin/library/books/return',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['LibraryBooks', 'LibraryTransactions'],
    }),

    // Get transactions
    getLibraryTransactions: builder.query({
      query: (params) => ({
        url: '/admin/library/transactions',
        params,
      }),
      providesTags: ['LibraryTransactions'],
    }),
  }),
})

export const {
  useGetBooksQuery,
  useGetBookQuery,
  useCreateBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useIssueBookMutation,
  useReturnBookMutation,
  useGetLibraryTransactionsQuery,
} = libraryApi
