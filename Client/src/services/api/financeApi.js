import { baseApi } from './baseApi'

export const financeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get payments
    getPayments: builder.query({
      query: (params) => ({
        url: '/admin/payments',
        params,
      }),
      providesTags: ['Payments'],
    }),

    // Get single payment
    getPayment: builder.query({
      query: (id) => `/admin/payments/${id}`,
      providesTags: (result, error, id) => [{ type: 'Payments', id }],
    }),

    // Create payment
    createPayment: builder.mutation({
      query: (data) => ({
        url: '/admin/payments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payments'],
    }),

    // Update payment
    updatePayment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/payments/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Payments',
        { type: 'Payments', id },
      ],
    }),

    // Delete payment
    deletePayment: builder.mutation({
      query: (id) => ({
        url: `/admin/payments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Payments'],
    }),

    // Get invoices
    getInvoices: builder.query({
      query: (params) => ({
        url: '/admin/invoices',
        params,
      }),
      providesTags: ['Invoices'],
    }),

    // Get single invoice
    getInvoice: builder.query({
      query: (id) => `/admin/invoices/${id}`,
      providesTags: (result, error, id) => [{ type: 'Invoices', id }],
    }),

    // Create invoice
    createInvoice: builder.mutation({
      query: (data) => ({
        url: '/admin/invoices',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Invoices', 'Payments'],
    }),

    // Update invoice
    updateInvoice: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/invoices/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Invoices',
        { type: 'Invoices', id },
      ],
    }),

    // Delete invoice
    deleteInvoice: builder.mutation({
      query: (id) => ({
        url: `/admin/invoices/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Invoices'],
    }),

    // Get discounts
    getDiscounts: builder.query({
      query: (params) => ({
        url: '/admin/discounts',
        params,
      }),
      providesTags: ['Discounts'],
    }),

    // Get single discount
    getDiscount: builder.query({
      query: (id) => `/admin/discounts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Discounts', id }],
    }),

    // Create discount
    createDiscount: builder.mutation({
      query: (data) => ({
        url: '/admin/discounts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Discounts'],
    }),

    // Update discount
    updateDiscount: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/discounts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Discounts',
        { type: 'Discounts', id },
      ],
    }),

    // Delete discount
    deleteDiscount: builder.mutation({
      query: (id) => ({
        url: `/admin/discounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Discounts'],
    }),

    // Get discount assignments
    getDiscountAssignments: builder.query({
      query: (params) => ({
        url: '/admin/discount-assignments',
        params,
      }),
      providesTags: ['DiscountAssignments'],
    }),

    // Assign discount
    assignDiscount: builder.mutation({
      query: (data) => ({
        url: '/admin/discount-assignments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['DiscountAssignments'],
    }),

    // Remove discount assignment
    removeDiscountAssignment: builder.mutation({
      query: (id) => ({
        url: `/admin/discount-assignments/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DiscountAssignments'],
    }),

    // Get discount reports
    getDiscountReports: builder.query({
      query: (params) => ({
        url: '/admin/discounts/reports',
        params,
      }),
      providesTags: ['DiscountReports'],
    }),

    // Get accounts (accounting)
    getAccounts: builder.query({
      query: (params) => ({
        url: '/admin/accounts',
        params,
      }),
      providesTags: ['Accounts'],
    }),

    // Get single account
    getAccount: builder.query({
      query: (id) => `/admin/accounts/${id}`,
      providesTags: (result, error, id) => [{ type: 'Accounts', id }],
    }),

    // Create account
    createAccount: builder.mutation({
      query: (data) => ({
        url: '/admin/accounts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Accounts'],
    }),

    // Update account
    updateAccount: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/accounts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Accounts',
        { type: 'Accounts', id },
      ],
    }),

    // Delete account
    deleteAccount: builder.mutation({
      query: (id) => ({
        url: `/admin/accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Accounts'],
    }),

    // Get journal entries
    getJournalEntries: builder.query({
      query: (params) => ({
        url: '/admin/journal-entries',
        params,
      }),
      providesTags: ['JournalEntries'],
    }),

    // Create journal entry
    createJournalEntry: builder.mutation({
      query: (data) => ({
        url: '/admin/journal-entries',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['JournalEntries'],
    }),

    // Post journal entry
    postJournalEntry: builder.mutation({
      query: (id) => ({
        url: `/admin/journal-entries/${id}/post`,
        method: 'POST',
      }),
      invalidatesTags: ['JournalEntries'],
    }),

    // Reverse journal entry
    reverseJournalEntry: builder.mutation({
      query: (id) => ({
        url: `/admin/journal-entries/${id}/reverse`,
        method: 'POST',
      }),
      invalidatesTags: ['JournalEntries'],
    }),

    // Get trial balance
    getTrialBalance: builder.query({
      query: (params) => ({
        url: '/admin/reports/trial-balance',
        params,
      }),
      providesTags: ['Reports'],
    }),

    // Get profit and loss
    getProfitAndLoss: builder.query({
      query: (params) => ({
        url: '/admin/reports/profit-loss',
        params,
      }),
      providesTags: ['Reports'],
    }),

    // Get balance sheet
    getBalanceSheet: builder.query({
      query: (params) => ({
        url: '/admin/reports/balance-sheet',
        params,
      }),
      providesTags: ['Reports'],
    }),

    // Get cash flow
    getCashFlow: builder.query({
      query: (params) => ({
        url: '/admin/reports/cash-flow',
        params,
      }),
      providesTags: ['Reports'],
    }),

    // Get fiscal periods
    getFiscalPeriods: builder.query({
      query: (params) => ({
        url: '/admin/fiscal-periods',
        params,
      }),
      providesTags: ['FiscalPeriods'],
    }),

    // Create fiscal period
    createFiscalPeriod: builder.mutation({
      query: (data) => ({
        url: '/admin/fiscal-periods',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['FiscalPeriods'],
    }),

    // Close fiscal period
    closeFiscalPeriod: builder.mutation({
      query: (id) => ({
        url: `/admin/fiscal-periods/${id}/close`,
        method: 'POST',
      }),
      invalidatesTags: ['FiscalPeriods'],
    }),

    // Get expenses
    getExpenses: builder.query({
      query: (params) => ({
        url: '/admin/expenses',
        params,
      }),
      providesTags: ['Expenses'],
    }),

    // Get single expense
    getExpense: builder.query({
      query: (id) => `/admin/expenses/${id}`,
      providesTags: (result, error, id) => [{ type: 'Expenses', id }],
    }),

    // Get expense stats
    getExpenseStats: builder.query({
      query: (params) => ({
        url: '/admin/expenses/stats',
        params,
      }),
      providesTags: ['ExpenseStats'],
    }),

    // Create expense
    createExpense: builder.mutation({
      query: (data) => ({
        url: '/admin/expenses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Expenses'],
    }),

    // Update expense
    updateExpense: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/expenses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Expenses',
        { type: 'Expenses', id },
      ],
    }),

    // Delete expense
    deleteExpense: builder.mutation({
      query: (id) => ({
        url: `/admin/expenses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Expenses'],
    }),

    // Get procurements
    getProcurements: builder.query({
      query: (params) => ({
        url: '/admin/procurements',
        params,
      }),
      providesTags: ['Procurements'],
    }),

    // Get single procurement
    getProcurement: builder.query({
      query: (id) => `/admin/procurements/${id}`,
      providesTags: (result, error, id) => [{ type: 'Procurements', id }],
    }),

    // Create procurement
    createProcurement: builder.mutation({
      query: (data) => ({
        url: '/admin/procurements',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Procurements'],
    }),

    // Update procurement
    updateProcurement: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/procurements/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Procurements',
        { type: 'Procurements', id },
      ],
    }),

    // Delete procurement
    deleteProcurement: builder.mutation({
      query: (id) => ({
        url: `/admin/procurements/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Procurements'],
    }),

    // Get monthly payments (for revenue reports)
    getMonthlyPayments: builder.query({
      query: (params) => ({
        url: '/admin/payments/monthly',
        params,
      }),
      providesTags: ['Payments'],
    }),

    // Get payment stats (for revenue reports)
    getPaymentStats: builder.query({
      query: (params) => ({
        url: '/admin/payments/stats',
        params,
      }),
      providesTags: ['PaymentStats'],
    }),

    // Get revenue forecasts
    getRevenueForecasts: builder.query({
      query: (params) => ({
        url: '/admin/revenue-forecasts',
        params,
      }),
      providesTags: ['RevenueForecasts'],
    }),

    // Get single revenue forecast
    getRevenueForecast: builder.query({
      query: (id) => `/admin/revenue-forecasts/${id}`,
      providesTags: (result, error, id) => [{ type: 'RevenueForecasts', id }],
    }),

    // Create revenue forecast
    createRevenueForecast: builder.mutation({
      query: (data) => ({
        url: '/admin/revenue-forecasts',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['RevenueForecasts'],
    }),

    // Update revenue forecast
    updateRevenueForecast: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/revenue-forecasts/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'RevenueForecasts',
        { type: 'RevenueForecasts', id },
      ],
    }),

    // Delete revenue forecast
    deleteRevenueForecast: builder.mutation({
      query: (id) => ({
        url: `/admin/revenue-forecasts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RevenueForecasts'],
    }),

    // Get enterprise finance records
    getEnterpriseFinance: builder.query({
      query: (params) => ({
        url: '/admin/enterprise-finance',
        params,
      }),
      providesTags: ['EnterpriseFinance'],
    }),

    // Get single enterprise finance record
    getEnterpriseFinanceRecord: builder.query({
      query: (id) => `/admin/enterprise-finance/${id}`,
      providesTags: (result, error, id) => [{ type: 'EnterpriseFinance', id }],
    }),

    // Create enterprise finance record
    createEnterpriseFinance: builder.mutation({
      query: (data) => ({
        url: '/admin/enterprise-finance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['EnterpriseFinance'],
    }),

    // Update enterprise finance record
    updateEnterpriseFinance: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/enterprise-finance/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'EnterpriseFinance',
        { type: 'EnterpriseFinance', id },
      ],
    }),

    // Delete enterprise finance record
    deleteEnterpriseFinance: builder.mutation({
      query: (id) => ({
        url: `/admin/enterprise-finance/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EnterpriseFinance'],
    }),

    // Get finance stats
    getFinanceStats: builder.query({
      query: (params) => ({
        url: '/admin/finance/stats',
        params,
      }),
      providesTags: ['FinanceStats'],
    }),
  }),
})

export const {
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
  useGetInvoicesQuery,
  useGetInvoiceQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useGetDiscountsQuery,
  useGetDiscountQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
  useGetDiscountAssignmentsQuery,
  useAssignDiscountMutation,
  useRemoveDiscountAssignmentMutation,
  useGetDiscountReportsQuery,
  useGetAccountsQuery,
  useGetAccountQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  useGetJournalEntriesQuery,
  useCreateJournalEntryMutation,
  usePostJournalEntryMutation,
  useReverseJournalEntryMutation,
  useGetTrialBalanceQuery,
  useGetProfitAndLossQuery,
  useGetBalanceSheetQuery,
  useGetCashFlowQuery,
  useGetFiscalPeriodsQuery,
  useCreateFiscalPeriodMutation,
  useCloseFiscalPeriodMutation,
  useGetExpensesQuery,
  useGetExpenseQuery,
  useGetExpenseStatsQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
  useGetProcurementsQuery,
  useGetProcurementQuery,
  useCreateProcurementMutation,
  useUpdateProcurementMutation,
  useDeleteProcurementMutation,
  useGetMonthlyPaymentsQuery,
  useGetPaymentStatsQuery,
  useGetRevenueForecastsQuery,
  useGetRevenueForecastQuery,
  useCreateRevenueForecastMutation,
  useUpdateRevenueForecastMutation,
  useDeleteRevenueForecastMutation,
  useGetEnterpriseFinanceQuery,
  useGetEnterpriseFinanceRecordQuery,
  useCreateEnterpriseFinanceMutation,
  useUpdateEnterpriseFinanceMutation,
  useDeleteEnterpriseFinanceMutation,
  useGetFinanceStatsQuery,
} = financeApi
