import { baseApi } from './baseApi'

export const hrApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get payroll records
    getPayroll: builder.query({
      query: (params) => ({
        url: '/admin/hr/payroll',
        params,
      }),
      providesTags: ['Payroll'],
    }),

    // Get single payroll record
    getPayrollRecord: builder.query({
      query: (id) => `/admin/hr/payroll/${id}`,
      providesTags: (result, error, id) => [{ type: 'Payroll', id }],
    }),

    // Create payroll record
    createPayrollRecord: builder.mutation({
      query: (data) => ({
        url: '/admin/hr/payroll',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payroll'],
    }),

    // Update payroll record
    updatePayrollRecord: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/hr/payroll/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Payroll',
        { type: 'Payroll', id },
      ],
    }),

    // Delete payroll record
    deletePayrollRecord: builder.mutation({
      query: (id) => ({
        url: `/admin/hr/payroll/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Payroll'],
    }),

    // Process payroll
    processPayroll: builder.mutation({
      query: (data) => ({
        url: '/admin/hr/payroll/process',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payroll'],
    }),

    // Get payroll summary
    getPayrollSummary: builder.query({
      query: (params) => ({
        url: '/admin/hr/payroll/summary',
        params,
      }),
      providesTags: ['PayrollSummary'],
    }),

    // Employee Loans
    getLoans: builder.query({
      query: (params) => ({
        url: '/admin/hr/loans',
        params,
      }),
      providesTags: ['Loans'],
    }),

    getLoan: builder.query({
      query: (id) => `/admin/hr/loans/${id}`,
      providesTags: (result, error, id) => [{ type: 'Loans', id }],
    }),

    createLoan: builder.mutation({
      query: (data) => ({
        url: '/admin/hr/loans',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Loans'],
    }),

    updateLoan: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/hr/loans/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['Loans', { type: 'Loans', id }],
    }),

    deleteLoan: builder.mutation({
      query: (id) => ({
        url: `/admin/hr/loans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Loans'],
    }),

    approveLoan: builder.mutation({
      query: (id) => ({
        url: `/admin/hr/loans/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => ['Loans', { type: 'Loans', id }],
    }),

    rejectLoan: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/admin/hr/loans/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => ['Loans', { type: 'Loans', id }],
    }),

    // Performance Reviews
    getReviews: builder.query({
      query: (params) => ({
        url: '/admin/hr/reviews',
        params,
      }),
      providesTags: ['Reviews'],
    }),

    getReview: builder.query({
      query: (id) => `/admin/hr/reviews/${id}`,
      providesTags: (result, error, id) => [{ type: 'Reviews', id }],
    }),

    createReview: builder.mutation({
      query: (data) => ({
        url: '/admin/hr/reviews',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Reviews'],
    }),

    updateReview: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/hr/reviews/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['Reviews', { type: 'Reviews', id }],
    }),

    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/admin/hr/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reviews'],
    }),

    // Recruitment (Job Postings)
    getJobPostings: builder.query({
      query: (params) => ({
        url: '/admin/hr/recruitment',
        params,
      }),
      providesTags: ['JobPostings'],
    }),

    getJobPosting: builder.query({
      query: (id) => `/admin/hr/recruitment/${id}`,
      providesTags: (result, error, id) => [{ type: 'JobPostings', id }],
    }),

    createJobPosting: builder.mutation({
      query: (data) => ({
        url: '/admin/hr/recruitment',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['JobPostings'],
    }),

    updateJobPosting: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/hr/recruitment/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['JobPostings', { type: 'JobPostings', id }],
    }),

    deleteJobPosting: builder.mutation({
      query: (id) => ({
        url: `/admin/hr/recruitment/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['JobPostings'],
    }),

    // Employee Contracts
    getContracts: builder.query({
      query: (params) => ({
        url: '/admin/hr/contracts',
        params,
      }),
      providesTags: ['Contracts'],
    }),

    getContract: builder.query({
      query: (id) => `/admin/hr/contracts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Contracts', id }],
    }),

    createContract: builder.mutation({
      query: (data) => ({
        url: '/admin/hr/contracts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Contracts'],
    }),

    updateContract: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/hr/contracts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['Contracts', { type: 'Contracts', id }],
    }),

    deleteContract: builder.mutation({
      query: (id) => ({
        url: `/admin/hr/contracts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Contracts'],
    }),
  }),
})

export const {
  useGetPayrollQuery,
  useGetPayrollRecordQuery,
  useCreatePayrollRecordMutation,
  useUpdatePayrollRecordMutation,
  useDeletePayrollRecordMutation,
  useProcessPayrollMutation,
  useGetPayrollSummaryQuery,
  useGetLoansQuery,
  useGetLoanQuery,
  useCreateLoanMutation,
  useUpdateLoanMutation,
  useDeleteLoanMutation,
  useApproveLoanMutation,
  useRejectLoanMutation,
  useGetReviewsQuery,
  useGetReviewQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useGetJobPostingsQuery,
  useGetJobPostingQuery,
  useCreateJobPostingMutation,
  useUpdateJobPostingMutation,
  useDeleteJobPostingMutation,
  useGetContractsQuery,
  useGetContractQuery,
  useCreateContractMutation,
  useUpdateContractMutation,
  useDeleteContractMutation,
} = hrApi
