import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getApiBaseUrl } from '../utils/apiConfig';

const parentBaseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.userInfo?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
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
    }
    if (schoolSlug) {
      headers.set('X-School-Slug', schoolSlug);
      headers.set('X-Tenant-ID', schoolSlug);
    }
    return headers;
  },
});

export const parentApiSlice = createApi({
  reducerPath: 'parentApi',
  baseQuery: parentBaseQuery,
  tagTypes: ['Child', 'Attendance', 'Mark', 'Fee', 'Timetable', 'Announcement'],
  endpoints: (builder) => ({
    getParentChildren: builder.query({
      query: () => '/parent/children',
      providesTags: ['Child'],
    }),
    getChildProfile: builder.query({
      query: (studentId) => `/parent/children/${studentId}/profile`,
      providesTags: (result, error, id) => [{ type: 'Child', id }],
    }),
    getChildAttendance: builder.query({
      query: (studentId) => `/parent/children/${studentId}/attendance`,
      providesTags: (result, error, id) => [{ type: 'Attendance', id }],
    }),
    getChildResults: builder.query({
      query: (studentId) => `/parent/children/${studentId}/results`,
      providesTags: (result, error, id) => [{ type: 'Mark', id }],
    }),
    getChildFees: builder.query({
      query: (studentId) => `/parent/children/${studentId}/fees`,
      providesTags: (result, error, id) => [{ type: 'Fee', id }],
    }),
    getChildTimetable: builder.query({
      query: (studentId) => `/parent/children/${studentId}/timetable`,
      providesTags: (result, error, id) => [{ type: 'Timetable', id }],
    }),
    getParentAnnouncements: builder.query({
      query: () => '/parent/announcements',
      providesTags: ['Announcement'],
    }),
    getParentPaymentMethods: builder.query({
      query: (studentId) => `/parent/children/${studentId}/payment-methods`,
    }),
    initiateParentPayment: builder.mutation({
      query: ({ studentId, ...data }) => ({
        url: `/parent/children/${studentId}/payments/initiate`,
        method: 'POST',
        body: data,
      }),
    }),
    payChildMonthlyFee: builder.mutation({
      query: ({ studentId, id, ...data }) => ({
        url: `/parent/children/${studentId}/my-payments/${id}/pay`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { studentId }) => [{ type: 'Fee', id: studentId }],
    }),
    getParentTransactions: builder.query({
      query: (studentId) => `/parent/children/${studentId}/transactions`,
    }),
  }),
});

export const {
  useGetParentChildrenQuery,
  useGetChildProfileQuery,
  useGetChildAttendanceQuery,
  useGetChildResultsQuery,
  useGetChildFeesQuery,
  useGetChildTimetableQuery,
  useGetParentAnnouncementsQuery,
  useGetParentPaymentMethodsQuery,
  useInitiateParentPaymentMutation,
  usePayChildMonthlyFeeMutation,
  useGetParentTransactionsQuery,
} = parentApiSlice;
