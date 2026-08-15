import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getErrorMessage } from '../utils/errorMessageMapper';
import { getActiveTenantSubdomain } from '../utils/activeTenant';
import { getApiBaseUrl } from '../utils/apiConfig';
import { setCredentials, logout } from './authSlice';

// Create a base query function
const baseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  credentials: 'include',
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = getState().auth.userInfo?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    const user = getState().auth.userInfo;

    // Set school identifier from subdomain, query param, or user info
    const host = window.location.hostname;
    const parts = host.split('.');
    const searchParams = new URLSearchParams(window.location.search);
    const querySchool = searchParams.get('school') || searchParams.get('tenantId');
    
    let schoolSlug = null;
    
    const isPlatformHost = host === 'localhost' || host.endsWith('.vercel.app');

    if (parts.length >= 3 && !isPlatformHost) {
      schoolSlug = parts[0];
    } else if (querySchool) {
      schoolSlug = querySchool;
    } else if (user?.school?.subdomain) {
      schoolSlug = user.school.subdomain;
    }

    // Bypass: For initial tenant detection, don't send stale user-based slug
    // to avoid "School Not Found" errors if the school was deleted/inactive
    const isTenantQuery = endpoint === 'getTenant';
    if (isTenantQuery && !querySchool && parts.length < 3) {
      schoolSlug = null;
    }

    if (schoolSlug) {
      headers.set('X-School-Slug', schoolSlug);
      headers.set('X-Tenant-ID', schoolSlug);
    }

    // Production: do not use dev-only headers

    if (user?.role === 'schooladmin') {
      const subdomain = getActiveTenantSubdomain(user);
      if (subdomain) {
        headers.set('x-tenant-id', subdomain);
        headers.set('X-Dev-Tenant-Subdomain', subdomain);
      }
    }
    return headers;
  },
});

// Enhanced base query with token refresh and error handling
const baseQueryWithRefresh = async (args, api, extraOptions) => {
  // First try the original request
  let result = await baseQuery(args, api, extraOptions);

  // If 401 Unauthorized, try to refresh token
  if (result?.error?.status === 401) {
    // Attempt to refresh the access token
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    );

    if (refreshResult?.data) {
      // Refresh successful - update credentials with new token
      const userInfo = api.getState().auth.userInfo;
      api.dispatch(setCredentials({ ...userInfo, token: refreshResult.data.token }));
      
      // Retry the original request with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed - log the user out
      api.dispatch(logout());
      // Redirect to login page if not already there
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
  }
  
  if (result.error) {
    // Use global error mapper to get user-friendly message
    const technicalMsg = result.error.data?.message || result.error.error || '';
    const userMsg = result.error.data?.userMessage || '';
    result.error.userMessage = getErrorMessage(technicalMsg, userMsg);

    // Handle Maintenance Mode
    if (result.error.status === 503 || result.error.data?.isMaintenance) {
      window.location.href = '/maintenance';
    }
  }
  
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRefresh,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: true,
  tagTypes: ['User', 'School', 'Class', 'Subject', 'Attendance', 'Exam', 'Mark', 'Payment', 'PaymentMonth', 'Schedule', 'SchoolProfile', 'Discipline', 'HealthRecord', 'Portfolio', 'Alumni', 'Visitor', 'Procurement', 'EnterpriseFinance', 'RevenueForecast', 'Payroll', 'PaymentSettings', 'Transaction', 'Backup'],
  endpoints: (builder) => ({
    getTenant: builder.query({
      query: () => '/auth/tenant',
    }),
    verifyEmail: builder.mutation({
      query: (token) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body: { token },
      }),
    }),
    resendVerification: builder.mutation({
      query: (email) => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body: { email },
      }),
    }),
    // Enterprise Features Endpoints
    getDisciplines: builder.query({
      query: () => '/enterprise/discipline',
      providesTags: ['Discipline']
    }),
    createDiscipline: builder.mutation({
      query: (data) => ({
        url: '/enterprise/discipline',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Discipline']
    }),
    updateDiscipline: builder.mutation({
      query: ({ id, data }) => ({
        url: `/enterprise/discipline/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Discipline']
    }),
    deleteDiscipline: builder.mutation({
      query: (id) => ({
        url: `/enterprise/discipline/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Discipline']
    }),
    getHealthRecords: builder.query({
      query: () => '/enterprise/health-records',
      providesTags: ['HealthRecord']
    }),
    createHealthRecord: builder.mutation({
      query: (data) => ({
        url: '/enterprise/health-records',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['HealthRecord']
    }),
    updateHealthRecord: builder.mutation({
      query: ({ id, data }) => ({
        url: `/enterprise/health-records/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['HealthRecord']
    }),
    deleteHealthRecord: builder.mutation({
      query: (id) => ({
        url: `/enterprise/health-records/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['HealthRecord']
    }),
    getPortfolios: builder.query({
      query: () => '/enterprise/portfolios',
      providesTags: ['Portfolio']
    }),
    createPortfolio: builder.mutation({
      query: (data) => ({
        url: '/enterprise/portfolios',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Portfolio']
    }),
    updatePortfolio: builder.mutation({
      query: ({ id, data }) => ({
        url: `/enterprise/portfolios/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Portfolio']
    }),
    deletePortfolio: builder.mutation({
      query: (id) => ({
        url: `/enterprise/portfolios/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Portfolio']
    }),
    getAlumni: builder.query({
      query: () => '/enterprise/alumni',
      providesTags: ['Alumni']
    }),
    createAlumni: builder.mutation({
      query: (data) => ({
        url: '/enterprise/alumni',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Alumni']
    }),
    updateAlumni: builder.mutation({
      query: ({ id, data }) => ({
        url: `/enterprise/alumni/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Alumni']
    }),
    deleteAlumni: builder.mutation({
      query: (id) => ({
        url: `/enterprise/alumni/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Alumni']
    }),
    getVisitors: builder.query({
      query: () => '/enterprise/visitors',
      providesTags: ['Visitor']
    }),
    createVisitor: builder.mutation({
      query: (data) => ({
        url: '/enterprise/visitors',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Visitor']
    }),
    updateVisitor: builder.mutation({
      query: ({ id, data }) => ({
        url: `/enterprise/visitors/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Visitor']
    }),
    deleteVisitor: builder.mutation({
      query: (id) => ({
        url: `/enterprise/visitors/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Visitor']
    }),
    getProcurements: builder.query({
      query: () => '/enterprise/procurement',
      providesTags: ['Procurement']
    }),
    createProcurement: builder.mutation({
      query: (data) => ({
        url: '/enterprise/procurement',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Procurement']
    }),
    updateProcurement: builder.mutation({
      query: ({ id, data }) => ({
        url: `/enterprise/procurement/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Procurement']
    }),
    deleteProcurement: builder.mutation({
      query: (id) => ({
        url: `/enterprise/procurement/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Procurement']
    }),
    getEnterpriseFinance: builder.query({
      query: () => '/enterprise/enterprise-finance',
      providesTags: ['EnterpriseFinance']
    }),
    createEnterpriseFinance: builder.mutation({
      query: (data) => ({
        url: '/enterprise/enterprise-finance',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['EnterpriseFinance']
    }),
    updateEnterpriseFinance: builder.mutation({
      query: ({ id, data }) => ({
        url: `/enterprise/enterprise-finance/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['EnterpriseFinance']
    }),
    deleteEnterpriseFinance: builder.mutation({
      query: (id) => ({
        url: `/enterprise/enterprise-finance/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['EnterpriseFinance']
    }),
    getRevenueForecasts: builder.query({
      query: () => '/enterprise/revenue-forecast',
      providesTags: ['RevenueForecast']
    }),
    createRevenueForecast: builder.mutation({
      query: (data) => ({
        url: '/enterprise/revenue-forecast',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['RevenueForecast']
    }),
    updateRevenueForecast: builder.mutation({
      query: ({ id, data }) => ({
        url: `/enterprise/revenue-forecast/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['RevenueForecast']
    }),
    deleteRevenueForecast: builder.mutation({
      query: (id) => ({
        url: `/enterprise/revenue-forecast/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['RevenueForecast']
    }),
    getPayrolls: builder.query({
      query: () => '/enterprise/payroll',
      providesTags: ['Payroll']
    }),
    createPayroll: builder.mutation({
      query: (data) => ({
        url: '/enterprise/payroll',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Payroll']
    }),
    updatePayroll: builder.mutation({
      query: ({ id, data }) => ({
        url: `/enterprise/payroll/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Payroll']
    }),
    deletePayroll: builder.mutation({
      query: (id) => ({
        url: `/enterprise/payroll/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Payroll']
    }),
    getBusinessIntelligence: builder.query({
      query: () => '/enterprise/business-intelligence'
    }),
    getExecutiveDashboard: builder.query({
      query: () => '/enterprise/executive-dashboard'
    }),
    getStudentRisk: builder.query({
      query: () => '/enterprise/final/student-risk'
    }),
    getEnterpriseOverview: builder.query({
      query: () => '/enterprise/final/overview'
    }),
    getFeeForecast: builder.query({
      query: () => '/enterprise/final/fee-forecast'
    }),
    getSmartDefaulters: builder.query({
      query: () => '/enterprise/final/defaulters'
    }),
    getTeacherPerformance: builder.query({
      query: () => '/enterprise/final/teacher-performance'
    }),
    getStorageUsage: builder.query({
      query: () => '/enterprise/final/storage'
    }),
    getApiActivity: builder.query({
      query: () => '/enterprise/final/api-activity'
    }),
    getStudentLifecycle: builder.query({
      query: (studentId) => `/enterprise/final/students/${studentId}/lifecycle`
    }),
    // Payment System Endpoints
    getPaymentProviders: builder.query({
      query: () => '/payments/providers'
    }),
    getPaymentSettings: builder.query({
      query: (provider) => provider ? `/payments/settings?provider=${provider}` : '/payments/settings',
      providesTags: ['PaymentSettings']
    }),
    savePaymentSettings: builder.mutation({
      query: (data) => ({
        url: '/payments/settings',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['PaymentSettings']
    }),
    initiatePayment: builder.mutation({
      query: (data) => ({
        url: '/payments/initiate',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Transaction', 'Payment', 'PaymentMonth']
    }),
    verifyPayment: builder.mutation({
      query: (transactionId) => ({
        url: `/payments/verify/${transactionId}`,
        method: 'GET'
      }),
      invalidatesTags: ['Transaction', 'Payment', 'PaymentMonth']
    }),
    refundPayment: builder.mutation({
      query: ({ transactionId, amount, reason }) => ({
        url: `/payments/refund/${transactionId}`,
        method: 'POST',
        body: { amount, reason }
      }),
      invalidatesTags: ['Transaction']
    }),
    testWaafiPayConnection: builder.mutation({
      query: () => ({
        url: '/payments/waafipay/test-connection',
        method: 'POST'
      })
    }),
    getTransactionHistory: builder.query({
      query: (filters) => ({
        url: '/payments/transactions',
        params: filters
      }),
      providesTags: ['Transaction']
    }),
    getTransaction: builder.query({
      query: (transactionId) => `/payments/transactions/${transactionId}`,
      providesTags: (result, error, id) => [{ type: 'Transaction', id }]
    }),
    getPaymentInstructions: builder.mutation({
      query: ({ provider, paymentData }) => ({
        url: `/payments/instructions/${provider}`,
        method: 'POST',
        body: paymentData
      })
    }),
    getPaymentStats: builder.query({
      query: () => '/payments/stats'
    }),
    // Backup Endpoints
    getBackups: builder.query({
      query: () => '/enterprise/backups',
      providesTags: ['Backup']
    }),
    createBackup: builder.mutation({
      query: (data) => ({
        url: '/enterprise/backups',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Backup']
    }),
    restoreBackup: builder.mutation({
      query: (data) => ({
        url: '/enterprise/backups/restore',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Backup']
    }),
    verifyBackup: builder.query({
      query: (fileName) => `/enterprise/backups/${encodeURIComponent(fileName)}/verify`,
    }),
  }),
});

export const {
  useGetTenantQuery,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useGetDisciplinesQuery,
  useCreateDisciplineMutation,
  useUpdateDisciplineMutation,
  useDeleteDisciplineMutation,
  useGetHealthRecordsQuery,
  useCreateHealthRecordMutation,
  useUpdateHealthRecordMutation,
  useDeleteHealthRecordMutation,
  useGetPortfoliosQuery,
  useCreatePortfolioMutation,
  useUpdatePortfolioMutation,
  useDeletePortfolioMutation,
  useGetAlumniQuery,
  useCreateAlumniMutation,
  useUpdateAlumniMutation,
  useDeleteAlumniMutation,
  useGetVisitorsQuery,
  useCreateVisitorMutation,
  useUpdateVisitorMutation,
  useDeleteVisitorMutation,
  useGetProcurementsQuery,
  useCreateProcurementMutation,
  useUpdateProcurementMutation,
  useDeleteProcurementMutation,
  useGetEnterpriseFinanceQuery,
  useCreateEnterpriseFinanceMutation,
  useUpdateEnterpriseFinanceMutation,
  useDeleteEnterpriseFinanceMutation,
  useGetRevenueForecastsQuery,
  useCreateRevenueForecastMutation,
  useUpdateRevenueForecastMutation,
  useDeleteRevenueForecastMutation,
  useGetPayrollsQuery,
  useCreatePayrollMutation,
  useUpdatePayrollMutation,
  useDeletePayrollMutation,
  useGetBusinessIntelligenceQuery,
  useGetExecutiveDashboardQuery,
  useGetStudentRiskQuery,
  useGetEnterpriseOverviewQuery,
  useGetFeeForecastQuery,
  useGetSmartDefaultersQuery,
  useGetTeacherPerformanceQuery,
  useGetStorageUsageQuery,
  useGetApiActivityQuery,
  useGetStudentLifecycleQuery,
  // Payment System Hooks
  useGetPaymentProvidersQuery,
  useGetPaymentSettingsQuery,
  useSavePaymentSettingsMutation,
  useInitiatePaymentMutation,
  useVerifyPaymentMutation,
  useRefundPaymentMutation,
  useTestWaafiPayConnectionMutation,
  useGetTransactionHistoryQuery,
  useGetTransactionQuery,
  useGetPaymentInstructionsMutation,
  useGetPaymentStatsQuery,
  // Backup Hooks
  useGetBackupsQuery,
  useCreateBackupMutation,
  useRestoreBackupMutation,
  useVerifyBackupQuery,
} = apiSlice;
