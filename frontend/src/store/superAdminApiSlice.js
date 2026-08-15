import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getApiBaseUrl } from '../utils/apiConfig';

const baseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.userInfo?.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    
    // Production: do not use dev-only headers
    
    return headers;
  },
});

export const superAdminApiSlice = createApi({
  reducerPath: 'superAdminApi',
  baseQuery,
  tagTypes: ['SuperStats', 'SuperSchools', 'SuperAdmins', 'SuperPlans', 'SuperAnalytics', 'SuperSubscriptions', 'SchoolFeatures'],
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => '/super-admin/dashboard/stats',
      transformResponse: (response) => {
        // Normalize: handle both flat { success, schools, revenue, platform } and wrapped { success, data: { ... } }
        if (response?.data && typeof response.data === 'object' && !response.schools && !response.revenue) {
          return response.data;
        }
        return response;
      },
      providesTags: ['SuperStats'],
    }),
    getSchools: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/super-admin/schools${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (res) => res.schools || [],
      providesTags: ['SuperSchools'],
    }),
    getSaasAnalytics: builder.query({
      query: () => '/super-admin/analytics',
      providesTags: ['SuperAnalytics'],
    }),
    getSchoolAdmins: builder.query({
      query: () => '/super-admin/admins',
      transformResponse: (res) => res.admins || [],
      providesTags: ['SuperAdmins'],
    }),
    createSchoolAdmin: builder.mutation({
      query: (body) => ({
        url: '/super-admin/register-school-admin',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SuperAdmins', 'SuperSubscriptions'],
    }),
    deleteSchoolAdmin: builder.mutation({
      query: (id) => ({ url: `/super-admin/admins/${id}`, method: 'DELETE' }),
      invalidatesTags: ['SuperAdmins'],
    }),
    toggleSchoolAdminStatus: builder.mutation({
      query: (id) => ({ url: `/super-admin/admins/${id}/toggle-status`, method: 'POST' }),
      invalidatesTags: ['SuperAdmins'],
    }),
    // Plans API
    getPlans: builder.query({
      query: () => '/super-admin/plans',
      transformResponse: (res) => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        if (res?.plans && Array.isArray(res.plans)) return res.plans;
        return Array.isArray(res?.data?.data) ? res.data.data : [];
      },
      providesTags: ['SuperPlans'],
    }),
    createPlan: builder.mutation({
      query: (body) => ({ url: '/super-admin/plans', method: 'POST', body }),
      invalidatesTags: ['SuperPlans'],
    }),
    updatePlan: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/super-admin/plans/${id}`, method: 'PUT', body }),
      invalidatesTags: ['SuperPlans'],
    }),
    archivePlan: builder.mutation({
      query: (id) => ({ url: `/super-admin/plans/${id}`, method: 'DELETE' }),
      invalidatesTags: ['SuperPlans'],
    }),
    getFeatureRegistry: builder.query({
      query: () => '/super-admin/feature-registry',
      transformResponse: (res) => ({
        features: res?.data || [],
        byCategory: res?.byCategory || {},
      }),
    }),
    assignPlanToSchool: builder.mutation({
      query: ({ schoolId, ...body }) => ({ url: `/super-admin/schools/${schoolId}/assign-plan`, method: 'POST', body }),
      invalidatesTags: ['SuperSchools', 'SuperStats', 'SuperSubscriptions'],
    }),
    // Subscriptions API
    getSubscriptions: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/super-admin/subscriptions${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['SuperSubscriptions'],
    }),
    reviewSubscription: builder.mutation({
      query: ({ schoolId, action, note }) => ({
        url: `/super-admin/schools/${schoolId}/review-subscription`,
        method: 'POST',
        body: { action, note },
      }),
      invalidatesTags: ['SuperSubscriptions', 'SuperSchools', 'SuperStats'],
    }),
    // Health & Analytics
    getSystemHealth: builder.query({
      query: () => '/super-admin/health',
      transformResponse: (response) => {
        // Normalize: unwrap { success, data: { database, uptime, memory } } → { database, uptime, memory }
        if (response?.data && typeof response.data === 'object' && !response.database && !response.uptime) {
          return response.data;
        }
        return response;
      },
      providesTags: ['SuperStats'],
    }),
    getBusinessAnalytics: builder.query({
      query: () => '/super-admin/business-analytics',
      transformResponse: (response) => {
        // Normalize: unwrap { success, data: { summary, revenue, supportStats } } → { summary, revenue, supportStats }
        if (response?.data && typeof response.data === 'object' && !response.summary && !response.supportStats) {
          return response.data;
        }
        return response;
      },
      providesTags: ['SuperAnalytics'],
    }),
    // Leads
    getLeads: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/super-admin/leads${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['SuperAnalytics'],
    }),
    updateLead: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/super-admin/leads/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['SuperAnalytics'],
    }),
    // Support Tickets
    getSupportTickets: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/super-admin/tickets${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['SuperAnalytics'],
    }),
    respondToTicket: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/super-admin/tickets/${id}/respond`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SuperAnalytics'],
    }),
    // Error Monitoring
    getErrorLogs: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/super-admin/errors${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['SuperAnalytics'],
    }),
    updateErrorStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/super-admin/errors/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['SuperAnalytics'],
    }),
    // Advanced SaaS Enhancements
    getAdvancedAnalytics: builder.query({
      query: () => '/super-admin/analytics/advanced',
      providesTags: ['SuperAnalytics'],
    }),
    getAnnouncements: builder.query({
      query: () => '/super-admin/announcements',
      providesTags: ['SuperAnalytics'],
    }),
    createAnnouncement: builder.mutation({
      query: (body) => ({
        url: '/super-admin/announcements',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SuperAnalytics'],
    }),
    getKnowledgeBase: builder.query({
      query: () => '/super-admin/knowledge-base',
      providesTags: ['SuperAnalytics'],
    }),
    manageKnowledgeBase: builder.mutation({
      query: (body) => ({
        url: '/super-admin/knowledge-base',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SuperAnalytics'],
    }),
    toggleMaintenanceMode: builder.mutation({
      query: (isEnabled) => ({
        url: '/super-admin/maintenance/toggle',
        method: 'POST',
        body: { isEnabled },
      }),
      invalidatesTags: ['SuperStats'],
    }),
    getIntegrations: builder.query({
      query: () => '/super-admin/integrations',
      providesTags: ['SuperStats'],
    }),
    updateIntegration: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/super-admin/integrations/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['SuperStats'],
    }),
    getRecoveryStatus: builder.query({
      query: () => '/super-admin/recovery/status',
      providesTags: ['SuperStats'],
    }),
    // School Features API
    getSchoolFeatures: builder.query({
      query: (schoolId) => `/school-features/${schoolId}`,
      transformResponse: (res) => res.data || res,
      providesTags: (result, error, schoolId) => [{ type: 'SchoolFeatures', id: schoolId }],
    }),
    updateSchoolFeature: builder.mutation({
      query: ({ schoolId, featureKey, isEnabled, reason }) => ({
        url: `/school-features/${schoolId}/${featureKey}`,
        method: 'PUT',
        body: { isEnabled, reason },
      }),
      invalidatesTags: (result, error, { schoolId }) => [{ type: 'SchoolFeatures', id: schoolId }, 'SuperSchools'],
    }),
    resetSchoolFeatures: builder.mutation({
      query: (schoolId) => ({
        url: `/school-features/${schoolId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, schoolId) => [{ type: 'SchoolFeatures', id: schoolId }, 'SuperSchools'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetSchoolsQuery,
  useGetSaasAnalyticsQuery,
  useGetSchoolAdminsQuery,
  useCreateSchoolAdminMutation,
  useDeleteSchoolAdminMutation,
  useToggleSchoolAdminStatusMutation,
  useGetPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useArchivePlanMutation,
  useGetFeatureRegistryQuery,
  useAssignPlanToSchoolMutation,
  useGetSubscriptionsQuery,
  useReviewSubscriptionMutation,
  useGetSystemHealthQuery,
  useGetBusinessAnalyticsQuery,
  useGetLeadsQuery,
  useUpdateLeadMutation,
  useGetSupportTicketsQuery,
  useRespondToTicketMutation,
  useGetErrorLogsQuery,
  useUpdateErrorStatusMutation,
  // Advanced hooks
  useGetAdvancedAnalyticsQuery,
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useGetKnowledgeBaseQuery,
  useManageKnowledgeBaseMutation,
  useToggleMaintenanceModeMutation,
  useGetIntegrationsQuery,
  useUpdateIntegrationMutation,
  useGetRecoveryStatusQuery,
  useGetSchoolFeaturesQuery,
  useUpdateSchoolFeatureMutation,
  useResetSchoolFeaturesMutation,
} = superAdminApiSlice;
