import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getErrorMessage } from '../utils/errorMessageMapper';
import { getActiveTenantSubdomain } from '../utils/activeTenant';
import { getApiBaseUrl } from '../utils/apiConfig';

const baseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.userInfo?.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
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

    if (schoolSlug) {
      headers.set('X-School-Slug', schoolSlug);
      headers.set('X-Tenant-ID', schoolSlug);
    }

    // Add Branch ID to headers if selected
    const selectedBranch = getState().branch.selectedBranch;
    if (selectedBranch) {
      // If selectedBranch is an object with _id, use it, otherwise use it directly as the ID
      const branchId = typeof selectedBranch === 'object' ? selectedBranch._id : selectedBranch;
      if (branchId) {
        headers.set('x-branch-id', branchId);
      }
    }

    // Add Academic Year ID to headers if selected
    const selectedYear = getState().academic?.selectedYear;
    if (selectedYear) {
      const yearId = typeof selectedYear === 'object' ? selectedYear._id : selectedYear;
      if (yearId) {
        headers.set('x-academic-year-id', yearId);
      }
    }

    // No dev-only headers — production uses Railway

    const isAdmin = ['schooladmin', 'school_admin', 'admin'].includes(user?.role);
    if (isAdmin) {
      const subdomain = getActiveTenantSubdomain(user);
      if (subdomain) {
        headers.set('x-tenant-id', subdomain);
        headers.set('X-Dev-Tenant-Subdomain', subdomain);
      }
    }
    return headers;
  },
});

// Enhanced base query with global error handling
const baseQueryWithErrorHandling = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  
  if (result.error) {
    const technicalMsg = result.error.data?.message || result.error.error || '';
    const userMsg = result.error.data?.userMessage || '';
    result.error.userMessage = getErrorMessage(technicalMsg, userMsg);
    
    if (result.error.status === 401) {
      const msg = (result.error.data?.message || '').toLowerCase();
      // Only auto-logout for genuinely expired/invalid sessions, not transient errors
      if (msg.includes('session invalidated') || 
          msg.includes('token expired') || 
          msg.includes('invalid token') ||
          msg.includes('no longer exists')) {
        api.dispatch({ type: 'auth/logout' });
      }
    }

    // Profile incomplete — backend is forcing redirect to profile setup
    if (result.error.status === 403 && result.error.data?.requiresProfileCompletion) {
      // Update Redux so client-side guards also trigger
      const currentState = api.getState();
      const userInfo = currentState.auth?.userInfo;
      if (userInfo) {
        api.dispatch({
          type: 'auth/setCredentials',
          payload: { ...userInfo, schoolProfileCompleted: false }
        });
      }
      // Redirect if not already on the profile setup page
      if (!window.location.pathname.includes('school-profile-setup')) {
        window.location.href = '/school-profile-setup';
      }
    }
  }
  
  return result;
};

// Create API slice — single source of truth, no duplicate endpoints
export const adminApiSlice = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: [
    'User', 'School', 'Student', 'Teacher', 'Parent', 'Class', 'Subject',
    'Attendance', 'AttendanceDevice', 'AttendanceRules',
    'QRAttendance', 'RFIDAttendance', 'NFCAttendance', 'FaceAttendance', 'FingerprintAttendance',
    'Exam', 'Mark', 'Payment', 'PaymentMonth',
    'Report', 'Dashboard', 'SchoolProfile', 'Schedule', 'Announcement', 'PublicContent', 'Event', 'ExamHall', 'Branch', 'AcademicYear', 'AcademicTerm', 'Stream', 'Notification', 'Document', 'Admission', 'Asset', 'Discount', 'LibraryBook', 'TransportRoute', 'TransportVehicle', 'Enterprise', 'Certificate', 'Hostel', 'FeeStructure', 'CalendarEvent', 'IDCard', 'IDCardDesign',
    'Payroll', 'SalaryStructure', 'Leave', 'ReportCard', 'Expense',
    'Cafeteria', 'Club', 'Sport', 'Competition', 'LostFound',
    'CareerGuidance', 'Internship', 'Scholarship', 'Graduation',
    'EventTicket', 'Counseling', 'Incident', 'Donor', 'Uniform', 'Store', 'Visitor',
    'Workflow', 'Automation', 'AI', 'BI', 'Security', 'Webhook', 'SystemHealth', 'Backup', 'WhiteLabel', 'DynamicConfig', 'Ticket', 'Task', 'Complaint', 'Suggestion', 'Risk', 'KnowledgeBase', 'Meeting',
  ],
  endpoints: (builder) => ({
    globalSearch: builder.query({
      query: ({ query = '', tenantId, branchId } = {}) => {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (tenantId) params.set('tenantId', tenantId);
        if (branchId) params.set('branchId', branchId);
        return `/search/global?${params.toString()}`;
      },
      keepUnusedDataFor: 60,
    }),

    // ── Parent Management ─────────────────────────────────────────────────
    getParents: builder.query({
      query: () => '/admin/parents',
      providesTags: ['Parent'],
    }),
    createParent: builder.mutation({
      query: (data) => ({
        url: '/admin/parents',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Parent'],
    }),
    updateParent: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/parents/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Parent'],
    }),
    deleteParent: builder.mutation({
      query: (id) => ({ url: `/admin/parents/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Parent'],
    }),
    resetParentPassword: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/parents/${id}/reset-password`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Parent'],
    }),
    linkParentToStudents: builder.mutation({
      query: (data) => ({
        url: '/enterprise/parent/link-students',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Parent', 'Student'],
    }),

    // ── Parent Portal ───────────────────────────────────────────────────
    getParentChildren: builder.query({
      query: () => '/enterprise/parent/children',
      providesTags: ['Parent'],
    }),
    getChildProfile: builder.query({
      query: (studentId) => `/enterprise/parent/children/${studentId}/profile`,
      providesTags: ['Student'],
    }),
    getChildAttendance: builder.query({
      query: (studentId) => `/enterprise/parent/children/${studentId}/attendance`,
      providesTags: ['Attendance'],
    }),
    getChildResults: builder.query({
      query: (studentId) => `/enterprise/parent/children/${studentId}/results`,
      providesTags: ['Mark'],
    }),
    getChildFees: builder.query({
      query: (studentId) => `/enterprise/parent/children/${studentId}/fees`,
      providesTags: ['Payment'],
    }),
    getChildTimetable: builder.query({
      query: (studentId) => `/enterprise/parent/children/${studentId}/timetable`,
      providesTags: ['Schedule'],
    }),
    getParentAnnouncements: builder.query({
      query: () => '/enterprise/parent/announcements',
      providesTags: ['Announcement'],
    }),

    // ── Branch Management ─────────────────────────────────────────────────
    getBranches: builder.query({
      query: () => '/branches',
      transformResponse: (response) => {
        if (Array.isArray(response)) return { data: response };
        if (Array.isArray(response?.data)) return { data: response.data };
        if (Array.isArray(response?.branches)) return { data: response.branches };
        return response;
      },
      providesTags: ['Branch'],
    }),

    // Academic Year Endpoints
    getAcademicYears: builder.query({
      query: () => '/academic/years',
      transformResponse: (response) => {
        if (Array.isArray(response)) return { data: response };
        if (Array.isArray(response?.data)) return { data: response.data };
        if (Array.isArray(response?.academicYears)) return { data: response.academicYears };
        return response;
      },
      providesTags: ['AcademicYear'],
    }),
    createAcademicYear: builder.mutation({
      query: (data) => ({
        url: '/academic/years',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AcademicYear'],
    }),
    updateAcademicYear: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/academic/years/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['AcademicYear'],
    }),

    // Academic Term Endpoints
    getAcademicTerms: builder.query({
      query: (params) => {
        const qs = params ? new URLSearchParams(params).toString() : '';
        return `/academic/terms${qs ? `?${qs}` : ''}`;
      },
      transformResponse: (response) => {
        if (Array.isArray(response)) return { data: response };
        if (Array.isArray(response?.data)) return { data: response.data };
        return response;
      },
      providesTags: ['AcademicTerm'],
    }),
    createAcademicTerm: builder.mutation({
      query: (data) => ({
        url: '/academic/terms',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AcademicTerm'],
    }),
    updateAcademicTerm: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/academic/terms/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['AcademicTerm'],
    }),
    deleteAcademicTerm: builder.mutation({
      query: (id) => ({
        url: `/academic/terms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AcademicTerm'],
    }),
    activateAcademicTerm: builder.mutation({
      query: (id) => ({
        url: `/academic/terms/${id}/activate`,
        method: 'POST',
      }),
      invalidatesTags: ['AcademicTerm'],
    }),
    archiveAcademicTerm: builder.mutation({
      query: (id) => ({
        url: `/academic/terms/${id}/archive`,
        method: 'POST',
      }),
      invalidatesTags: ['AcademicTerm'],
    }),

    // Stream Endpoints
    getStreams: builder.query({
      query: () => '/academic/streams',
      transformResponse: (response) => {
        if (Array.isArray(response)) return { data: response };
        if (Array.isArray(response?.data)) return { data: response.data };
        return response;
      },
      providesTags: ['Stream'],
    }),
    createStream: builder.mutation({
      query: (data) => ({
        url: '/academic/streams',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Stream'],
    }),
    updateStream: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/academic/streams/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Stream'],
    }),
    deleteStream: builder.mutation({
      query: (id) => ({
        url: `/academic/streams/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Stream'],
    }),

    // Student Lifecycle
    getPromotionPreview: builder.query({
      query: (params) => {
        const qs = params ? new URLSearchParams(params).toString() : '';
        return `/academic/promotion-preview${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Student', 'Class', 'AcademicYear'],
    }),
    promoteStudents: builder.mutation({
      query: (data) => ({
        url: '/academic/promote',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Student', 'Class'],
    }),
    holdStudentsBack: builder.mutation({
      query: (data) => ({
        url: '/academic/hold-students',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Student'],
    }),
    graduateStudents: builder.mutation({
      query: (data) => ({
        url: '/academic/graduate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Student'],
    }),
    transferStudentLifecycle: builder.mutation({
      query: (data) => ({
        url: '/academic/transfer',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Student', 'Branch', 'Class'],
    }),
    getPromotionHistory: builder.query({
      query: () => '/academic/promotion-history',
      providesTags: ['Student', 'Class', 'AcademicYear'],
    }),
    createBranch: builder.mutation({
      query: (data) => ({ url: '/branches', method: 'POST', body: data }),
      invalidatesTags: ['Branch'],
    }),
    updateBranch: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/branches/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Branch'],
    }),
    deleteBranch: builder.mutation({
      query: (id) => ({ url: `/branches/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Branch'],
    }),
    toggleBranchStatus: builder.mutation({
      query: (id) => ({
        url: `/branches/${id}/toggle-status`,
        method: 'PUT',
      }),
      invalidatesTags: ['Branch'],
    }),
    getBranchStats: builder.query({
      query: (id) => `/branches/${id}/stats`,
      providesTags: ['Branch'],
    }),

    // Subscription & SaaS
    getSubscription: builder.query({
      query: () => '/subscription',
      providesTags: ['SchoolProfile'],
    }),
    getSubscriptionSummary: builder.query({
      query: () => '/subscription/summary',
      providesTags: ['SchoolProfile'],
    }),
    getAvailablePlans: builder.query({
      query: () => '/public/plans',
    }),
    requestPlanUpgrade: builder.mutation({
      query: (data) => ({ url: '/subscription/upgrade-request', method: 'POST', body: data }),
      invalidatesTags: ['SchoolProfile'],
    }),


    // ── Public Content Management ─────────────────────────────────────────
    getPublicContent: builder.query({
      query: (schoolId) => `/public/content/${schoolId}`,
      providesTags: ['PublicContent', 'Event'],
    }),
    updateHomeContent: builder.mutation({
      query: (data) => ({ url: '/school-admin/public-content/home', method: 'PUT', body: data }),
      invalidatesTags: ['PublicContent'],
    }),
    updateAboutContent: builder.mutation({
      query: (data) => ({ url: '/school-admin/public-content/about', method: 'PUT', body: data }),
      invalidatesTags: ['PublicContent'],
    }),
    getEvents: builder.query({
      query: (schoolId) => `/public/events/${schoolId}`,
      providesTags: ['Event'],
    }),
    createEvent: builder.mutation({
      query: (data) => ({ url: '/school-admin/public-content/events', method: 'POST', body: data }),
      invalidatesTags: ['Event'],
    }),
    updateEvent: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/school-admin/public-content/events/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Event'],
    }),
    deleteEvent: builder.mutation({
      query: (id) => ({ url: `/school-admin/public-content/events/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Event'],
    }),
    uploadImage: builder.mutation({
      query: (formData) => ({
        url: '/school-admin/public-content/upload',
        method: 'POST',
        body: formData,
      }),
    }),

    // ── Exam Hall Management ─────────────────────────────────────────────
    getExamHalls: builder.query({
      query: () => '/school-admin/exam-halls',
      providesTags: ['ExamHall'],
    }),
    getExamHallById: builder.query({
      query: (id) => `/school-admin/exam-halls/${id}`,
      providesTags: ['ExamHall'],
    }),
    createExamHall: builder.mutation({
      query: (data) => ({ url: '/school-admin/exam-halls', method: 'POST', body: data }),
      invalidatesTags: ['ExamHall'],
    }),
    updateExamHall: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/school-admin/exam-halls/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['ExamHall'],
    }),
    deleteExamHall: builder.mutation({
      query: (id) => ({ url: `/school-admin/exam-halls/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ExamHall'],
    }),
    assignStudentToHall: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/school-admin/exam-halls/${id}/assign-student`, method: 'POST', body: data }),
      invalidatesTags: ['ExamHall'],
    }),
    removeStudentFromHall: builder.mutation({
      query: ({ id, studentId }) => ({ url: `/school-admin/exam-halls/${id}/students/${studentId}`, method: 'DELETE' }),
      invalidatesTags: ['ExamHall'],
    }),
    grantTemporaryClearance: builder.mutation({
      query: (data) => ({ url: '/school-admin/exam-halls/temporary-clearance', method: 'POST', body: data }),
      invalidatesTags: ['ExamHall', 'User'],
    }),
    revokeTemporaryClearance: builder.mutation({
      query: (data) => ({ url: '/school-admin/exam-halls/revoke-clearance', method: 'POST', body: data }),
      invalidatesTags: ['ExamHall', 'User'],
    }),

    // ── Authentication ───────────────────────────────────────────────────
    login: builder.mutation({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        body: data,
      }),
    }),
    verify2FA: builder.mutation({
      query: (data) => ({
        url: '/auth/verify-2fa',
        method: 'POST',
        body: data,
      }),
    }),
    resend2FA: builder.mutation({
      query: (data) => ({
        url: '/auth/resend-2fa',
        method: 'POST',
        body: data,
      }),
    }),
    studentLogin: builder.mutation({
      query: (data) => ({ url: '/auth/student-login', method: 'POST', body: data }),
    }),
    teacherLogin: builder.mutation({
      query: (data) => ({ url: '/auth/teacher-login', method: 'POST', body: data }),
    }),
    schoolAdminLogin: builder.mutation({
      query: (data) => ({ url: '/school-admin/login', method: 'POST', body: data }),
    }),
    parentLogin: builder.mutation({
      query: (data) => ({ url: '/auth/parent-login', method: 'POST', body: data }),
    }),
    updatePreferences: builder.mutation({
      query: (data) => ({
        url: '/auth/preferences',
        method: 'PUT',
        body: data,
      }),
    }),

    // ── School Profile ───────────────────────────────────────────────────
    getSchoolProfileStatus: builder.query({
      query: () => '/school-admin/profile-status',
      providesTags: ['SchoolProfile'],
    }),
    completeSchoolProfile: builder.mutation({
      query: (data) => ({ url: '/admin/complete-school-profile', method: 'POST', body: data }),
      invalidatesTags: ['SchoolProfile'],
    }),
    updateOnboarding: builder.mutation({
      query: (data) => ({ url: '/school-admin/onboarding', method: 'PUT', body: data }),
      invalidatesTags: ['SchoolProfile', 'Dashboard'],
    }),

    // Support Tickets
    getSupportTickets: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/school-admin/tickets${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Dashboard'],
    }),
    createSupportTicket: builder.mutation({
      query: (data) => ({ url: '/school-admin/tickets', method: 'POST', body: data }),
      invalidatesTags: ['Dashboard'],
    }),
    respondToTicket: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/school-admin/tickets/${id}/respond`, method: 'POST', body }),
      invalidatesTags: ['Dashboard'],
    }),

    // ── Dashboard ────────────────────────────────────────────────────────
    getStats: builder.query({
      query: () => '/admin/dashboard-stats',
      transformResponse: (response) => {
        if (response?.data && typeof response.data === 'object' && !response?.students && !response?.teachers && !response?.classes) {
          return response.data;
        }
        return response;
      },
      providesTags: ['Dashboard', 'Payment', 'User', 'Class'],
    }),
    getTeacherStats: builder.query({
      query: () => '/admin/teacher-dashboard-stats',
      providesTags: ['Dashboard'],
    }),

    // ── Student Management ───────────────────────────────────────────────
    getStudents: builder.query({
      query: () => '/admin/students',
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.students)) return response.students;
        return response;
      },
      providesTags: ['User'],
    }),
    createStudent: builder.mutation({
      query: (data) => ({ url: '/admin/students', method: 'POST', body: data }),
      invalidatesTags: ['User', 'Class'],
    }),
    updateStudent: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/admin/students/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['User'],
    }),
    deleteStudent: builder.mutation({
      query: (id) => ({ url: `/admin/students/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User', 'Class'],
    }),
    transferStudent: builder.mutation({
      query: (data) => ({ url: '/admin/students/transfer', method: 'POST', body: data }),
      invalidatesTags: ['User', 'Class'],
    }),
    getStudentProfile: builder.query({
      query: (customId) => `/admin/student-profile/${customId}`,
      providesTags: ['User', 'Attendance', 'Mark', 'Payment'],
    }),
    getStudentsInClass: builder.query({
      query: (classId) => `/admin/class-students/${classId}`,
      providesTags: ['User'],
    }),

    // ── Bulk Import ──────────────────────────────────────────────────────
    importStudents: builder.mutation({
      query: (formData) => ({ url: '/admin/students/import', method: 'POST', body: formData }),
      invalidatesTags: ['User', 'Class'],
    }),
    importExamResults: builder.mutation({
      query: (formData) => ({ url: '/admin/exams/import', method: 'POST', body: formData }),
      invalidatesTags: ['Mark'],
    }),
    generateBulkCredentials: builder.mutation({
      query: () => ({ url: '/admin/students/generate-credentials', method: 'POST' }),
      invalidatesTags: ['User'],
    }),
    generateStudentLogin: builder.mutation({
      query: (id) => ({ url: `/admin/students/${id}/generate-login`, method: 'POST' }),
      invalidatesTags: ['User'],
    }),
    resetStudentPassword: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/students/${id}/reset-password`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    downloadCredentialsFile: builder.mutation({
      query: (credentials) => ({
        url: '/admin/students/credentials/download',
        method: 'POST',
        body: { credentials },
        responseHandler: (response) => response.blob(),
      }),
    }),
    downloadStudentErrors: builder.mutation({
      query: (errors) => ({
        url: '/admin/students/errors/download',
        method: 'POST',
        body: { errors },
        responseHandler: (response) => response.blob(),
      }),
    }),
    downloadExamErrors: builder.mutation({
      query: (errors) => ({
        url: '/admin/exams/errors/download',
        method: 'POST',
        body: { errors },
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ── Teacher Management ───────────────────────────────────────────────
    getTeachers: builder.query({
      query: () => '/admin/teachers',
      providesTags: ['User'],
    }),
    getTeacherProfile: builder.query({
      query: (customId) => `/admin/teacher-profile/${customId}`,
      providesTags: ['User', 'Schedule', 'Class', 'Subject'],
    }),
    createTeacher: builder.mutation({
      query: (data) => ({ url: '/admin/teachers', method: 'POST', body: data }),
      invalidatesTags: ['User'],
    }),
    updateTeacher: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/admin/teachers/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['User'],
    }),
    deleteTeacher: builder.mutation({
      query: (id) => ({ url: `/admin/teachers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
    resetTeacherPassword: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/teachers/${id}/reset-password`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    checkTeacherId: builder.query({
      query: ({ customId, excludeId }) => ({
        url: '/admin/teachers/check-id',
        params: { customId, excludeId },
      }),
    }),
    importTeachers: builder.mutation({
      query: (formData) => ({ url: '/admin/teachers/import', method: 'POST', body: formData }),
      invalidatesTags: ['User'],
    }),
    downloadTeacherErrors: builder.mutation({
      query: (errors) => ({
        url: '/admin/teachers/errors/download',
        method: 'POST',
        body: { errors },
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ── Class Management ─────────────────────────────────────────────────
    getClasses: builder.query({
      query: () => '/admin/classes',
      providesTags: ['Class'],
    }),
    getClassById: builder.query({
      query: (id) => `/admin/classes/${id}`,
      providesTags: ['Class'],
    }),
    createClass: builder.mutation({
      query: (data) => ({ url: '/admin/classes', method: 'POST', body: data }),
      invalidatesTags: ['Class'],
    }),
    updateClass: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/admin/classes/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Class'],
    }),
    deleteClass: builder.mutation({
      query: (id) => ({ url: `/admin/classes/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Class'],
    }),

    // ── Subject Management ───────────────────────────────────────────────
    getSubjects: builder.query({
      query: () => '/admin/subjects',
      providesTags: ['Subject'],
    }),
    createSubject: builder.mutation({
      query: (data) => ({ url: '/admin/subjects', method: 'POST', body: data }),
      invalidatesTags: ['Subject', 'Class'],
    }),
    updateSubject: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/admin/subjects/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Subject', 'Class'],
    }),
    deleteSubject: builder.mutation({
      query: (id) => ({ url: `/admin/subjects/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Subject', 'Class'],
    }),
    checkSubjectCode: builder.query({
      query: ({ code, excludeId }) => ({
        url: '/admin/subjects/check-code',
        params: { code, excludeId },
      }),
    }),
    assignSubjectToClass: builder.mutation({
      query: ({ classId, subjectId, teacherId }) => ({
        // Backend route: POST /admin/subjects/assign  (not /classes/:id/subjects)
        url: '/admin/subjects/assign',
        method: 'POST',
        body: { classId, subjectId, teacherId },
      }),
      invalidatesTags: ['Class', 'Subject'],
    }),
    updateClassSubjectAssignment: builder.mutation({
      query: ({ id, teacherId }) => ({
        url: `/admin/class-subjects/${id}`,
        method: 'PUT',
        body: { teacherId },
      }),
      invalidatesTags: ['Class'],
    }),
    removeClassSubjectAssignment: builder.mutation({
      query: (id) => ({ url: `/admin/class-subjects/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Class'],
    }),

    // ── Attendance ───────────────────────────────────────────────────────
    getAttendance: builder.query({
      query: () => '/admin/attendance',
      providesTags: ['Attendance'],
    }),
    takeAttendance: builder.mutation({
      query: (data) => ({
        url: data.isAdmin ? '/admin/attendance' : '/teachers/attendance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    updateAttendance: builder.mutation({
      query: ({ id, status }) => ({ url: `/admin/attendance/${id}`, method: 'PUT', body: { status } }),
      invalidatesTags: ['Attendance'],
    }),
    deleteAttendance: builder.mutation({
      query: (id) => ({ url: `/admin/attendance/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Attendance'],
    }),

    // ── Exams & Marks ────────────────────────────────────────────────────
    getExams: builder.query({
      query: () => '/admin/exams',
      providesTags: ['Exam'],
    }),
    createExam: builder.mutation({
      query: (data) => ({ url: '/admin/exams', method: 'POST', body: data }),
      invalidatesTags: ['Exam'],
    }),
    publishExam: builder.mutation({
      query: (id) => ({ url: `/admin/exams/${id}/publish`, method: 'PUT' }),
      invalidatesTags: ['Exam'],
    }),
    getExamMarks: builder.query({
      query: (id) => `/admin/exams/${id}/marks`,
      providesTags: ['Mark'],
    }),
    updateExamMarks: builder.mutation({
      query: ({ id, studentMarks }) => ({ url: `/admin/exams/${id}/marks`, method: 'PUT', body: { studentMarks } }),
      invalidatesTags: ['Mark'],
    }),
    getMarks: builder.query({
      query: () => '/admin/marks',
      providesTags: ['Mark'],
    }),
    submitMarks: builder.mutation({
      query: (data) => ({ url: '/teachers/submit-marks', method: 'POST', body: data }),
      invalidatesTags: ['Mark'],
    }),
    bulkSubmitMarks: builder.mutation({
      query: (data) => ({ url: '/admin/bulk-submit-marks', method: 'POST', body: data }),
      invalidatesTags: ['Mark'],
    }),
    getClassResults: builder.query({
      query: ({ classId, examName }) => `/admin/class-results/${classId}/${examName}`,
      providesTags: ['Mark'],
    }),
    getStudentResults: builder.query({
      query: () => '/student/exams',
      providesTags: ['Mark'],
    }),

    // ── Student Payment Endpoints ─────────────────────────────────────
    getMyMonthlyPayments: builder.query({
      query: () => '/student/my-payments',
      providesTags: ['Payment'],
    }),
    payMonthlyFee: builder.mutation({
      query: ({ id, studentId }) => ({
        url: `/student/my-payments/${id}/pay`,
        method: 'PUT',
        body: { studentId },
      }),
      invalidatesTags: ['Payment', 'PaymentMonth'],
    }),
    getStudentPaymentMethods: builder.query({
      query: () => '/student/payment-methods',
    }),
    initiateStudentPayment: builder.mutation({
      query: (data) => ({
        url: '/student/payments/initiate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment', 'Transaction'],
    }),
    verifyStudentPayment: builder.query({
      query: (transactionId) => `/student/payments/verify/${transactionId}`,
    }),
    getStudentTransactionHistory: builder.query({
      query: () => '/student/transactions',
      providesTags: ['Transaction'],
    }),
    getStudentPaymentInstructions: builder.mutation({
      query: ({ providerId, ...data }) => ({
        url: `/student/payments/instructions/${providerId}`,
        method: 'POST',
        body: data,
      }),
    }),

    // ── Exam Sessions (Horizontal Marks Entry) ──────────────────────────
    createExamSession: builder.mutation({
      query: (data) => ({ url: '/admin/exam-sessions', method: 'POST', body: data }),
      invalidatesTags: ['Exam'],
    }),
    getExamSessions: builder.query({
      query: () => '/admin/exam-sessions',
      providesTags: ['Exam'],
    }),
    getExamSessionById: builder.query({
      query: (id) => `/admin/exam-sessions/${id}`,
      providesTags: ['Exam'],
    }),
    getClassExamMarks: builder.query({
      query: ({ examSessionId, classId }) =>
        `/admin/exam-sessions/${examSessionId}/class/${classId}/marks`,
      providesTags: ['Mark'],
    }),
    submitClassExamMarks: builder.mutation({
      query: (data) => ({ url: '/admin/exam-sessions/marks', method: 'POST', body: data }),
      invalidatesTags: ['Mark'],
    }),
    deleteClassExamMarks: builder.mutation({
      query: (data) => ({ url: '/admin/exam-sessions/marks', method: 'DELETE', body: data }),
      invalidatesTags: ['Mark'],
    }),

    // ── Monthly Payment Management ──────────────────────────────────────
    getPaymentMonths: builder.query({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.classId) params.append('classId', filters.classId);
        if (filters.status) params.append('status', filters.status);
        const qs = params.toString();
        return `/admin/payment-months${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['PaymentMonth'],
    }),
    createPaymentMonth: builder.mutation({
      query: (data) => ({ url: '/admin/payment-months', method: 'POST', body: data }),
      invalidatesTags: ['PaymentMonth', 'Payment'],
    }),
    deletePaymentMonth: builder.mutation({
      query: (id) => ({ url: `/admin/payment-months/${id}`, method: 'DELETE' }),
      invalidatesTags: ['PaymentMonth', 'Payment'],
    }),
    getMonthlyPayments: builder.query({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.month) params.append('month', filters.month);
        if (filters.year) params.append('year', filters.year);
        if (filters.classId) params.append('classId', filters.classId);
        if (filters.status) params.append('status', filters.status);
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        const qs = params.toString();
        return `/admin/monthly-payments${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Payment'],
    }),
    markPaymentPaid: builder.mutation({
      query: ({ id, remarks }) => ({
        url: `/admin/monthly-payments/${id}/mark-paid`,
        method: 'PUT',
        body: { remarks },
      }),
      invalidatesTags: ['Payment', 'PaymentMonth'],
    }),
    markPaymentUnpaid: builder.mutation({
      query: (id) => ({ url: `/admin/monthly-payments/${id}/mark-unpaid`, method: 'PUT' }),
      invalidatesTags: ['Payment', 'PaymentMonth'],
    }),
    generateMonthlyPayments: builder.mutation({
      query: (data) => ({ url: '/admin/generate-monthly-payments', method: 'POST', body: data }),
      invalidatesTags: ['Payment', 'PaymentMonth'],
    }),
    getPaymentStats: builder.query({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.month) params.append('month', filters.month);
        if (filters.year) params.append('year', filters.year);
        if (filters.classId) params.append('classId', filters.classId);
        const qs = params.toString();
        return `/admin/payment-stats${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Payment'],
    }),

    // ── Discounts ──────────────────────────────────────────────────────
    getDiscounts: builder.query({
      query: () => '/admin/discounts',
      transformResponse: (response) => {
        if (Array.isArray(response)) return { data: response };
        if (Array.isArray(response?.data)) return { data: response.data };
        return response;
      },
      providesTags: ['Discount'],
    }),
    createDiscount: builder.mutation({
      query: (data) => ({ url: '/admin/discounts', method: 'POST', body: data }),
      invalidatesTags: ['Discount'],
    }),
    updateDiscount: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/admin/discounts/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Discount', 'Payment'],
    }),
    getDiscountAssignments: builder.query({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.studentId) params.append('studentId', filters.studentId);
        if (filters.discountId) params.append('discountId', filters.discountId);
        if (filters.active !== undefined) params.append('active', filters.active);
        const qs = params.toString();
        return `/admin/discount-assignments${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Discount'],
    }),
    assignDiscount: builder.mutation({
      query: (data) => ({ url: '/admin/discount-assignments', method: 'POST', body: data }),
      invalidatesTags: ['Discount', 'Payment', 'User'],
    }),
    updateDiscountAssignment: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/admin/discount-assignments/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Discount', 'Payment'],
    }),
    removeDiscountAssignment: builder.mutation({
      query: (id) => ({ url: `/admin/discount-assignments/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Discount', 'Payment'],
    }),
    getDiscountReports: builder.query({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.startDate) params.append('startDate', filters.startDate);
        if (filters.endDate) params.append('endDate', filters.endDate);
        if (filters.type) params.append('type', filters.type);
        const qs = params.toString();
        return `/admin/discount-reports${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Discount', 'Payment'],
    }),

    // ── Library ────────────────────────────────────────────────────────
    getLibraryBooks: builder.query({
      query: () => '/admin/library/books',
      transformResponse: (response) => {
        if (Array.isArray(response)) return { data: response };
        if (Array.isArray(response?.data)) return { data: response.data };
        return response;
      },
      providesTags: ['LibraryBook'],
    }),
    createLibraryBook: builder.mutation({
      query: (data) => ({ url: '/admin/library/books', method: 'POST', body: data }),
      invalidatesTags: ['LibraryBook'],
    }),
    issueLibraryBook: builder.mutation({
      query: (data) => ({ url: '/admin/library/issues', method: 'POST', body: data }),
      invalidatesTags: ['LibraryBook'],
    }),
    returnLibraryBook: builder.mutation({
      query: (id) => ({ url: `/admin/library/issues/${id}/return`, method: 'PUT' }),
      invalidatesTags: ['LibraryBook'],
    }),

    // ── Transport ─────────────────────────────────────────────────────
    getTransportRoutes: builder.query({
      query: () => '/admin/transport/routes',
      transformResponse: (response) => {
        if (Array.isArray(response)) return { data: response };
        if (Array.isArray(response?.data)) return { data: response.data };
        return response;
      },
      providesTags: ['TransportRoute'],
    }),
    createTransportRoute: builder.mutation({
      query: (data) => ({ url: '/admin/transport/routes', method: 'POST', body: data }),
      invalidatesTags: ['TransportRoute'],
    }),
    getTransportVehicles: builder.query({
      query: () => '/admin/transport/vehicles',
      transformResponse: (response) => {
        if (Array.isArray(response)) return { data: response };
        if (Array.isArray(response?.data)) return { data: response.data };
        return response;
      },
      providesTags: ['TransportVehicle'],
    }),
    createTransportVehicle: builder.mutation({
      query: (data) => ({ url: '/admin/transport/vehicles', method: 'POST', body: data }),
      invalidatesTags: ['TransportVehicle'],
    }),

    // ── Schedule Management ─────────────────────────────────────────────
    getSchedules: builder.query({
      query: (classId) => `/admin/schedules${classId ? `?classId=${classId}` : ''}`,
      providesTags: ['Schedule'],
    }),
    createSchedule: builder.mutation({
      query: (data) => ({ url: '/admin/schedules', method: 'POST', body: data }),
      invalidatesTags: ['Schedule'],
    }),
    updateSchedule: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/admin/schedules/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Schedule'],
    }),
    deleteSchedule: builder.mutation({
      query: (id) => ({ url: `/admin/schedules/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Schedule'],
    }),
    getTeacherSchedule: builder.query({
      query: () => '/teachers/schedule',
      providesTags: ['Schedule'],
    }),
    getStudentSchedule: builder.query({
      query: () => '/student/schedule',
      providesTags: ['Schedule'],
    }),

    // ── School Settings ─────────────────────────────────────────────────
    getSchoolSettings: builder.query({
      query: () => '/admin/school-settings',
      providesTags: ['School'],
    }),
    updateSchoolSettings: builder.mutation({
      query: (data) => ({ url: '/admin/school-settings', method: 'PUT', body: data }),
      invalidatesTags: ['School'],
    }),
    // ── Communication Settings ──────────────────────────────────────────
    getCommunicationSettings: builder.query({
      query: () => '/admin/communication-settings',
      providesTags: ['School'],
    }),
    updateCommunicationSettings: builder.mutation({
      query: (data) => ({ 
        url: '/admin/communication-settings', 
        method: 'PUT', 
        body: data 
      }),
      invalidatesTags: ['School'],
    }),
    upsertChannelProvider: builder.mutation({
      query: (data) => ({ 
        url: '/admin/communication-settings/providers', 
        method: 'POST', 
        body: data 
      }),
      invalidatesTags: ['School'],
    }),
    deleteChannelProvider: builder.mutation({
      query: (id) => ({ 
        url: `/admin/communication-settings/providers/${id}`, 
        method: 'DELETE' 
      }),
      invalidatesTags: ['School'],
    }),

    // ── Communication Health Dashboard ──────────────────────────────────
    getCommunicationHealth: builder.query({
      query: () => '/v1/communication/health',
      providesTags: ['School'],
    }),

    // ── Communication Messages ──────────────────────────────────────────
    getCommunicationMessages: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/v1/communication/messages${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['School'],
    }),
    getCommunicationMessageById: builder.query({
      query: (id) => `/v1/communication/messages/${id}`,
      providesTags: ['School'],
    }),
    createCommunicationMessage: builder.mutation({
      query: (data) => ({
        url: '/v1/communication/messages',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['School'],
    }),
    updateCommunicationMessage: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/v1/communication/messages/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['School'],
    }),
    deleteCommunicationMessage: builder.mutation({
      query: (id) => ({
        url: `/v1/communication/messages/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['School'],
    }),
    duplicateCommunicationMessage: builder.mutation({
      query: (id) => ({
        url: `/v1/communication/messages/${id}/duplicate`,
        method: 'POST',
      }),
      invalidatesTags: ['School'],
    }),
    previewMessage: builder.mutation({
      query: (data) => ({
        url: '/v1/communication/preview',
        method: 'POST',
        body: data,
      }),
    }),
    sendCommunicationMessage: builder.mutation({
      query: (id) => ({
        url: `/v1/communication/messages/${id}/send`,
        method: 'POST',
      }),
      invalidatesTags: ['School'],
    }),

    // ── Communication Usage ─────────────────────────────────────────────
    getCommunicationUsage: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/v1/communication/usage${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['School'],
    }),

    // ── Delivery Reports ─────────────────────────────────────────────────
    getDeliveryReports: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/v1/communication/delivery-reports${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['School'],
    }),

    // ── Invalid Contacts ─────────────────────────────────────────────────
    getInvalidContacts: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/v1/communication/invalid-contacts${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['School'],
    }),
    resolveInvalidContact: builder.mutation({
      query: ({ id, notes }) => ({
        url: `/v1/communication/invalid-contacts/${id}/resolve`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: ['School'],
    }),

    // ── Communication Preferences ─────────────────────────────────────────
    getUserCommunicationPreferences: builder.query({
      query: (userId) => 
        userId ? `/v1/communication/preferences/${userId}` : '/v1/communication/preferences',
      providesTags: ['User'],
    }),
    updateUserCommunicationPreferences: builder.mutation({
      query: ({ userId, ...data }) => ({
        url: userId ? `/v1/communication/preferences/${userId}` : '/v1/communication/preferences',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // ── Smart Recipient Filters ──────────────────────────────────────────
    getSmartRecipientFilters: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/v1/communication/recipients/filters${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['User'],
    }),

    // ── Global Communication Search ───────────────────────────────────────
    globalCommunicationSearch: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/v1/communication/search${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['School'],
    }),

    // ── Announcements ───────────────────────────────────────────────────
    getAnnouncements: builder.query({
      query: () => '/admin/announcements',
      providesTags: ['Announcement'],
    }),
    createAnnouncement: builder.mutation({
      query: (data) => ({ url: '/admin/announcements', method: 'POST', body: data }),
      invalidatesTags: ['Announcement'],
    }),
    updateAnnouncement: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/admin/announcements/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Announcement'],
    }),
    deleteAnnouncement: builder.mutation({
      query: (id) => ({ url: `/admin/announcements/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Announcement'],
    }),

    // ── Teacher-specific ────────────────────────────────────────────────
    getAssignedClasses: builder.query({
      query: () => '/teachers/assigned-classes',
      providesTags: ['Class'],
    }),
    getTaughtSubjects: builder.query({
      query: () => '/teachers/taught-subjects',
      providesTags: ['Subject'],
    }),

    // ── Enterprise / Audit ─────────────────────────────────────────────
    getEnterpriseActivityFeed: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/enterprise/activity-feed${qs ? `?${qs}` : ''}`;
      },
    }),
    getEnterpriseAuditLogs: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/enterprise/audit-logs${qs ? `?${qs}` : ''}`;
      },
    }),
    getEnterpriseFinanceAuditLogs: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/enterprise/finance-audit-logs${qs ? `?${qs}` : ''}`;
      },
    }),
    getSaaSPlans: builder.query({
      query: () => '/enterprise/plans',
    }),
    getEnterpriseFinalOverview: builder.query({
      query: () => '/enterprise/final/overview',
      providesTags: ['Enterprise'],
    }),
    getEnterpriseTranscript: builder.query({
      query: ({ studentId, ...params }) => {
        const qs = new URLSearchParams(params).toString();
        return `/enterprise/final/transcripts/${studentId}${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Enterprise'],
    }),
    getEnterpriseStudentLifecycle: builder.query({
      query: (studentId) => `/enterprise/final/students/${studentId}/lifecycle`,
      providesTags: ['Enterprise'],
    }),
    getEnterpriseTeacherPerformance: builder.query({
      query: () => '/enterprise/final/teacher-performance',
      providesTags: ['Enterprise'],
    }),
    getEnterpriseStudentRisk: builder.query({
      query: () => '/enterprise/final/student-risk',
      providesTags: ['Enterprise'],
    }),
    getEnterpriseFeeForecast: builder.query({
      query: () => '/enterprise/final/fee-forecast',
      providesTags: ['Enterprise'],
    }),
    getEnterpriseDefaulters: builder.query({
      query: () => '/enterprise/final/defaulters',
      providesTags: ['Enterprise'],
    }),
    getEnterpriseStorage: builder.query({
      query: () => '/enterprise/final/storage',
      providesTags: ['Enterprise'],
    }),
    getEnterpriseApiActivity: builder.query({
      query: () => '/enterprise/final/api-activity',
      providesTags: ['Enterprise'],
    }),
    getEnterpriseConsents: builder.query({
      query: () => '/enterprise/final/consents',
      providesTags: ['Enterprise'],
    }),
    createEnterpriseConsent: builder.mutation({
      query: (data) => ({ url: '/enterprise/final/consents', method: 'POST', body: data }),
      invalidatesTags: ['Enterprise'],
    }),
    updateEnterpriseConsent: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/enterprise/final/consents/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Enterprise'],
    }),
    deleteEnterpriseConsent: builder.mutation({
      query: (id) => ({ url: `/enterprise/final/consents/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Enterprise'],
    }),
    getEnterpriseScheduledReports: builder.query({
      query: () => '/enterprise/final/scheduled-reports',
      providesTags: ['Enterprise'],
    }),
    createEnterpriseScheduledReport: builder.mutation({
      query: (data) => ({ url: '/enterprise/final/scheduled-reports', method: 'POST', body: data }),
      invalidatesTags: ['Enterprise'],
    }),
    updateEnterpriseScheduledReport: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/enterprise/final/scheduled-reports/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Enterprise'],
    }),
    deleteEnterpriseScheduledReport: builder.mutation({
      query: (id) => ({ url: `/enterprise/final/scheduled-reports/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Enterprise'],
    }),
    getEnterpriseArchives: builder.query({
      query: () => '/enterprise/final/archives',
      providesTags: ['Enterprise'],
    }),
    createEnterpriseArchive: builder.mutation({
      query: (data) => ({ url: '/enterprise/final/archives', method: 'POST', body: data }),
      invalidatesTags: ['Enterprise'],
    }),
    restoreEnterpriseArchive: builder.mutation({
      query: (id) => ({ url: `/enterprise/final/archives/${id}/restore`, method: 'POST' }),
      invalidatesTags: ['Enterprise'],
    }),

    // ── Enabled Features (Plan-based) ────────────────────────────────────
    getEnabledFeatures: builder.query({
      query: () => '/school-admin/enabled-features',
      providesTags: ['SchoolProfile'],
    }),
    
    // ── School Feature Overrides (Super Admin) ────────────────────────────
    getSchoolFeatures: builder.query({
      query: (schoolId) => `/school-features/${schoolId}`,
      providesTags: ['SchoolProfile'],
    }),
    updateSchoolFeature: builder.mutation({
      query: ({ schoolId, featureKey, isEnabled }) => ({
        url: `/school-features/${schoolId}/${featureKey}`,
        method: 'PUT',
        body: { isEnabled },
      }),
      invalidatesTags: ['SchoolProfile'],
    }),
    resetSchoolFeatures: builder.mutation({
      query: (schoolId) => ({
        url: `/school-features/${schoolId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SchoolProfile'],
    }),

    // ── Notifications ───────────────────────────────────────────────────
    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),
    getNotificationHistory: builder.query({
      query: () => '/notifications/history',
      providesTags: ['Notification'],
    }),
    getNotificationRecipients: builder.query({
      query: (role = 'all') => `/notifications/recipients${role ? `?role=${role}` : ''}`,
      providesTags: ['Notification', 'User'],
    }),
    createNotification: builder.mutation({
      query: (data) => ({ url: '/notifications', method: 'POST', body: data }),
      invalidatesTags: ['Notification'],
    }),
    getUnreadCount: builder.query({
      query: () => '/notifications/unread-count',
      providesTags: ['Notification'],
    }),
    markAsRead: builder.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PUT' }),
      invalidatesTags: ['Notification'],
    }),
    markAllAsRead: builder.mutation({
      query: () => ({ url: '/notifications/mark-all-read', method: 'PUT' }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({ url: `/notifications/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Notification'],
    }),

    // ── Document Management ───────────────────────────────────────────────
    getDocuments: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/enterprise/documents${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Document'],
    }),
    createDocument: builder.mutation({
      query: (data) => ({
        url: '/enterprise/documents',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Document'],
    }),
    updateDocument: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/enterprise/documents/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Document'],
    }),
    deleteDocument: builder.mutation({
      query: (id) => ({
        url: `/enterprise/documents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Document'],
    }),
    restoreDocument: builder.mutation({
      query: (id) => ({
        url: `/enterprise/documents/${id}/restore`,
        method: 'POST',
      }),
      invalidatesTags: ['Document'],
    }),

    // ── Notification Templates ───────────────────────────────────────────────────
    getNotificationTemplates: builder.query({
      query: () => '/enterprise/notification-templates',
      providesTags: ['Notification'],
    }),
    getNotificationTemplateById: builder.query({
      query: (id) => `/enterprise/notification-templates/${id}`,
      providesTags: ['Notification'],
    }),
    createNotificationTemplate: builder.mutation({
      query: (data) => ({
        url: '/enterprise/notification-templates',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Notification'],
    }),
    updateNotificationTemplate: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/enterprise/notification-templates/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotificationTemplate: builder.mutation({
      query: (id) => ({
        url: `/enterprise/notification-templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
    seedNotificationTemplates: builder.mutation({
      query: () => ({
        url: '/enterprise/notification-templates/seed',
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),

    // ── Data Recovery Center ───────────────────────────────────────────────────
    getDataRecoverySummary: builder.query({
      query: () => '/enterprise/data-recovery/summary',
    }),
    getDeletedRecords: builder.query({
      query: (type) => `/enterprise/data-recovery/deleted/${type}`,
    }),
    restoreRecord: builder.mutation({
      query: ({ type, id }) => ({
        url: `/enterprise/data-recovery/restore/${type}/${id}`,
        method: 'POST',
      }),
    }),
    permanentDeleteRecord: builder.mutation({
      query: ({ type, id }) => ({
        url: `/enterprise/data-recovery/permanent/${type}/${id}`,
        method: 'DELETE',
      }),
    }),

    // ── Duplicate Detection Engine ───────────────────────────────────────────────────
    checkDuplicates: builder.mutation({
      query: (data) => ({
        url: '/enterprise/duplicate-check',
        method: 'POST',
        body: data,
      }),
    }),
    checkBulkDuplicates: builder.mutation({
      query: (data) => ({
        url: '/enterprise/duplicate-check/bulk',
        method: 'POST',
        body: data,
      }),
    }),
    
    // ── Admissions ───────────────────────────────────────────────────────
    getAdmissions: builder.query({
      query: () => '/admin/admissions',
      providesTags: ['Admission'],
    }),
    updateAdmissionStatus: builder.mutation({
      query: ({ id, status, reviewNotes }) => ({
        url: `/admin/admissions/${id}/status`,
        method: 'PUT',
        body: { status, reviewNotes }
      }),
      invalidatesTags: ['Admission', 'Student'],
    }),
    
    // ── Certificates ────────────────────────────────────────────────────
    generateCertificate: builder.mutation({
      query: (data) => ({
        url: '/admin/certificates/generate',
        method: 'POST',
        body: data,
        responseHandler: (response) => response.blob(),
      })
    }),
    
    // ── Calendar Events ─────────────────────────────────────────────────
    getCalendarEvents: builder.query({
      query: () => '/admin/calendar-events',
      providesTags: ['CalendarEvent']
    }),
    createCalendarEvent: builder.mutation({
      query: (data) => ({
        url: '/admin/calendar-events',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CalendarEvent']
    }),
    
    // ── Assets ──────────────────────────────────────────────────────────
    getAssets: builder.query({
      query: () => '/admin/assets',
      providesTags: ['Asset']
    }),
    createAsset: builder.mutation({
      query: (data) => ({
        url: '/admin/assets',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Asset']
    }),
    updateAsset: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/admin/assets/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Asset']
    }),
    deleteAsset: builder.mutation({
      query: (id) => ({ url: `/admin/assets/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Asset']
    }),
    
    // MFA
    setupMFA: builder.mutation({
      query: () => ({
        url: '/auth/mfa/setup',
        method: 'POST'
      })
    }),
    enableMFA: builder.mutation({
      query: (data) => ({
        url: '/auth/mfa/enable',
        method: 'POST',
        body: data
      })
    }),
    disableMFA: builder.mutation({
      query: (data) => ({
        url: '/auth/mfa/disable',
        method: 'POST',
        body: data
      })
    }),
    verifyMFA: builder.mutation({
      query: (data) => ({
        url: '/auth/mfa/verify',
        method: 'POST',
        body: data
      })
    }),
    getMFAStatus: builder.query({
      query: () => '/auth/mfa/status'
    }),
    
    // QR Attendance - Complete Enterprise
    generateAttendanceQR: builder.mutation({
      query: (data) => ({
        url: '/attendance/qr/generate',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['QRAttendance']
    }),
    getActiveQR: builder.query({
      query: (params) => {
        const qp = new URLSearchParams();
        if (params?.classId) qp.set('classId', params.classId);
        if (params?.subjectId) qp.set('subjectId', params.subjectId);
        if (params?.date) qp.set('date', params.date);
        return `/attendance/qr/active?${qp.toString()}`;
      },
      providesTags: ['QRAttendance']
    }),
    verifyQRAttendance: builder.mutation({
      query: (data) => ({
        url: '/attendance/qr/verify',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['QRAttendance', 'Attendance']
    }),
    checkOutQR: builder.mutation({
      query: ({ attendanceId, ...data }) => ({
        url: `/attendance/qr/check-out/${attendanceId}`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['QRAttendance', 'Attendance']
    }),
    revokeQR: builder.mutation({
      query: (data) => ({
        url: '/attendance/qr/revoke',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['QRAttendance']
    }),
    getQRAttendanceHistory: builder.query({
      query: (params) => {
        const qp = new URLSearchParams();
        if (params?.classId) qp.set('classId', params.classId);
        if (params?.subjectId) qp.set('subjectId', params.subjectId);
        if (params?.startDate) qp.set('startDate', params.startDate);
        if (params?.endDate) qp.set('endDate', params.endDate);
        if (params?.studentId) qp.set('studentId', params.studentId);
        if (params?.status) qp.set('status', params.status);
        if (params?.page) qp.set('page', params.page);
        if (params?.limit) qp.set('limit', params.limit);
        return `/attendance/qr/history?${qp.toString()}`;
      },
      providesTags: ['QRAttendance']
    }),
    getQRDailyReport: builder.query({
      query: (params) => {
        const qp = new URLSearchParams();
        if (params?.date) qp.set('date', params.date);
        if (params?.classId) qp.set('classId', params.classId);
        if (params?.subjectId) qp.set('subjectId', params.subjectId);
        return `/attendance/qr/daily-report?${qp.toString()}`;
      }
    }),
    getQRMonthlyReport: builder.query({
      query: (params) => {
        const qp = new URLSearchParams();
        if (params?.month) qp.set('month', params.month);
        if (params?.year) qp.set('year', params.year);
        if (params?.classId) qp.set('classId', params.classId);
        if (params?.subjectId) qp.set('subjectId', params.subjectId);
        return `/attendance/qr/monthly-report?${qp.toString()}`;
      }
    }),
    generatePersonalQR: builder.mutation({
      query: (data) => ({
        url: '/attendance/qr/personal',
        method: 'POST',
        body: data
      })
    }),
    verifyPersonalQR: builder.mutation({
      query: (data) => ({
        url: '/attendance/qr/personal/verify',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Attendance']
    }),
    bulkQRAttendance: builder.mutation({
      query: (data) => ({
        url: '/attendance/qr/bulk',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['QRAttendance', 'Attendance']
    }),
    getAttendanceMethodStats: builder.query({
      query: (params) => {
        const qp = new URLSearchParams();
        if (params?.startDate) qp.set('startDate', params.startDate);
        if (params?.endDate) qp.set('endDate', params.endDate);
        if (params?.classId) qp.set('classId', params.classId);
        if (params?.academicYearId) qp.set('academicYearId', params.academicYearId);
        return `/attendance/stats/methods?${qp.toString()}`;
      },
      providesTags: ['QRAttendance']
    }),
    getAttendanceByMethod: builder.query({
      query: (params) => {
        const qp = new URLSearchParams();
        if (params?.method) qp.set('method', params.method);
        if (params?.classId) qp.set('classId', params.classId);
        if (params?.studentId) qp.set('studentId', params.studentId);
        if (params?.startDate) qp.set('startDate', params.startDate);
        if (params?.endDate) qp.set('endDate', params.endDate);
        if (params?.page) qp.set('page', params.page);
        if (params?.limit) qp.set('limit', params.limit);
        return `/attendance/by-method?${qp.toString()}`;
      }
    }),
    exportAttendance: builder.query({
      query: (params) => {
        const qp = new URLSearchParams();
        if (params?.method) qp.set('method', params.method);
        if (params?.classId) qp.set('classId', params.classId);
        if (params?.subjectId) qp.set('subjectId', params.subjectId);
        if (params?.startDate) qp.set('startDate', params.startDate);
        if (params?.endDate) qp.set('endDate', params.endDate);
        if (params?.format) qp.set('format', params.format);
        return `/attendance/export?${qp.toString()}`;
      }
    }),
    getModuleAttendanceReport: builder.query({
      query: (params) => {
        const qp = new URLSearchParams();
        if (params?.method) qp.set('method', params.method);
        if (params?.classId) qp.set('classId', params.classId);
        if (params?.sectionId) qp.set('sectionId', params.sectionId);
        if (params?.startDate) qp.set('startDate', params.startDate);
        if (params?.endDate) qp.set('endDate', params.endDate);
        return `/attendance/module-report?${qp.toString()}`;
      },
      providesTags: ['Attendance']
    }),
    validateGeofence: builder.mutation({
      query: (data) => ({
        url: '/attendance/geofence/validate',
        method: 'POST',
        body: data
      })
    }),
    getStaffAttendanceAnalytics: builder.query({
      query: (params = {}) => {
        const qp = new URLSearchParams();
        if (params?.startDate) qp.set('startDate', params.startDate);
        if (params?.endDate) qp.set('endDate', params.endDate);
        if (params?.month) qp.set('month', params.month);
        if (params?.year) qp.set('year', params.year);
        if (params?.department) qp.set('department', params.department);
        if (params?.method) qp.set('method', params.method);
        return `/attendance/staff/analytics?${qp.toString()}`;
      },
      providesTags: ['Attendance'],
    }),
    getTodayStaffAttendance: builder.query({
      query: () => '/attendance/staff/today',
      providesTags: ['Attendance'],
    }),
    
    // ═══════════════════════════════════════════════════════════════════
    // Enterprise Biometric Attendance System
    // ═══════════════════════════════════════════════════════════════════

    // ── Backward-Compat: Old Attendance Rules (for AttendanceConfiguration.jsx) ──
    getAttendanceRules: builder.query({
      query: () => '/attendance/rules',
      providesTags: ['AttendanceRules'],
    }),
    updateAttendanceRules: builder.mutation({
      query: (data) => ({ url: '/attendance/rules', method: 'PUT', body: data }),
      invalidatesTags: ['AttendanceRules'],
    }),
    addHoliday: builder.mutation({
      query: (data) => ({ url: '/attendance/rules/holidays', method: 'POST', body: data }),
      invalidatesTags: ['AttendanceRules'],
    }),
    removeHoliday: builder.mutation({
      query: (holidayId) => ({ url: `/attendance/rules/holidays/${holidayId}`, method: 'DELETE' }),
      invalidatesTags: ['AttendanceRules'],
    }),
    // ── Backward-Compat: Old Device Queries (for AttendanceLogs.jsx) ──
    getAttendanceDevices: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/biometric-attendance/devices${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['BiometricDevice'],
    }),

    // ── Attendance Registrations ──────────────────────────────────────
    getRegistrations: builder.query({
      query: (params = {}) => {
        const qp = new URLSearchParams();
        if (params?.branch) qp.set('branch', params.branch);
        if (params?.method) qp.set('method', params.method);
        if (params?.page) qp.set('page', params.page);
        if (params?.limit) qp.set('limit', params.limit);
        return `/biometric-attendance/registrations?${qp.toString()}`;
      },
      providesTags: ['BiometricRegistration'],
    }),
    getRegistrationStats: builder.query({
      query: () => '/biometric-attendance/registrations/stats',
      providesTags: ['BiometricRegistration'],
    }),
    getRegistration: builder.query({
      query: (employeeId) => `/biometric-attendance/registrations/${employeeId}`,
      providesTags: ['BiometricRegistration'],
    }),
    createOrUpdateRegistration: builder.mutation({
      query: (data) => ({
        url: '/biometric-attendance/registrations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['BiometricRegistration'],
    }),
    unregisterMethod: builder.mutation({
      query: ({ employeeId, method }) => ({
        url: `/biometric-attendance/registrations/${employeeId}/${method}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BiometricRegistration'],
    }),
    searchStaff: builder.query({
      query: (params = {}) => {
        const qp = new URLSearchParams();
        if (params?.search) qp.set('search', params.search);
        if (params?.branch) qp.set('branch', params.branch);
        if (params?.page) qp.set('page', params.page);
        return `/biometric-attendance/staff/search?${qp.toString()}`;
      },
      providesTags: ['BiometricRegistration'],
    }),

    // ── Attendance Dashboard ──────────────────────────────────────────
    getAttendanceDashboard: builder.query({
      query: (params = {}) => {
        const qp = new URLSearchParams();
        if (params?.branch) qp.set('branch', params.branch);
        if (params?.date) qp.set('date', params.date);
        return `/biometric-attendance/dashboard?${qp.toString()}`;
      },
      providesTags: ['BiometricAttendance'],
    }),
    getLiveAttendanceFeed: builder.query({
      query: (params = {}) => {
        const qp = new URLSearchParams();
        if (params?.branch) qp.set('branch', params.branch);
        if (params?.limit) qp.set('limit', params.limit);
        return `/biometric-attendance/live?${qp.toString()}`;
      },
      providesTags: ['BiometricAttendance'],
    }),

    // ── Attendance Logs ───────────────────────────────────────────────
    getAttendanceLogs: builder.query({
      query: (params = {}) => {
        const qp = new URLSearchParams();
        if (params?.branch) qp.set('branch', params.branch);
        if (params?.device) qp.set('device', params.device);
        if (params?.method) qp.set('method', params.method);
        if (params?.date) qp.set('date', params.date);
        if (params?.startDate) qp.set('startDate', params.startDate);
        if (params?.endDate) qp.set('endDate', params.endDate);
        if (params?.employee) qp.set('employee', params.employee);
        if (params?.page) qp.set('page', params.page);
        return `/biometric-attendance/logs?${qp.toString()}`;
      },
      providesTags: ['BiometricAttendance'],
    }),

    // ── Reports ───────────────────────────────────────────────────────
    getAttendanceReport: builder.query({
      query: (params = {}) => {
        const qp = new URLSearchParams();
        if (params?.startDate) qp.set('startDate', params.startDate);
        if (params?.endDate) qp.set('endDate', params.endDate);
        if (params?.branch) qp.set('branch', params.branch);
        if (params?.employee) qp.set('employee', params.employee);
        return `/biometric-attendance/reports?${qp.toString()}`;
      },
      providesTags: ['BiometricAttendance'],
    }),
    getLateAnalytics: builder.query({
      query: (params = {}) => {
        const qp = new URLSearchParams();
        if (params?.startDate) qp.set('startDate', params.startDate);
        if (params?.endDate) qp.set('endDate', params.endDate);
        if (params?.branch) qp.set('branch', params.branch);
        return `/biometric-attendance/reports/late?${qp.toString()}`;
      },
      providesTags: ['BiometricAttendance'],
    }),
    getPayrollAttendance: builder.query({
      query: (params = {}) => {
        const qp = new URLSearchParams();
        if (params?.startDate) qp.set('startDate', params.startDate);
        if (params?.endDate) qp.set('endDate', params.endDate);
        if (params?.branch) qp.set('branch', params.branch);
        return `/biometric-attendance/reports/payroll?${qp.toString()}`;
      },
      providesTags: ['BiometricAttendance'],
    }),

    // ── Attendance Rules ──────────────────────────────────────────────
    getBiometricRules: builder.query({
      query: () => '/biometric-attendance/rules',
      providesTags: ['BiometricRules'],
    }),
    createBiometricRule: builder.mutation({
      query: (data) => ({ url: '/biometric-attendance/rules', method: 'POST', body: data }),
      invalidatesTags: ['BiometricRules'],
    }),
    updateBiometricRule: builder.mutation({
      query: ({ ruleId, ...data }) => ({ url: `/biometric-attendance/rules/${ruleId}`, method: 'PUT', body: data }),
      invalidatesTags: ['BiometricRules'],
    }),
    deleteBiometricRule: builder.mutation({
      query: (ruleId) => ({ url: `/biometric-attendance/rules/${ruleId}`, method: 'DELETE' }),
      invalidatesTags: ['BiometricRules'],
    }),

    // ── Biometric Device Management ───────────────────────────────────
    getBiometricDevices: builder.query({
      query: (params = {}) => {
        const qp = new URLSearchParams();
        if (params?.branch) qp.set('branch', params.branch);
        if (params?.status) qp.set('status', params.status);
        if (params?.model) qp.set('model', params.model);
        if (params?.page) qp.set('page', params.page);
        return `/biometric-attendance/devices?${qp.toString()}`;
      },
      providesTags: ['BiometricDevice'],
    }),
    getBiometricDeviceHealthOverview: builder.query({
      query: () => '/biometric-attendance/devices/health',
      providesTags: ['BiometricDevice'],
    }),
    getBiometricDeviceLogs: builder.query({
      query: (params = {}) => {
        const qp = new URLSearchParams();
        if (params?.device) qp.set('device', params.device);
        if (params?.type) qp.set('type', params.type);
        if (params?.page) qp.set('page', params.page);
        return `/biometric-attendance/devices/logs?${qp.toString()}`;
      },
      providesTags: ['BiometricDevice'],
    }),
    getBiometricDevice: builder.query({
      query: (deviceId) => `/biometric-attendance/devices/${deviceId}`,
      providesTags: ['BiometricDevice'],
    }),
    addBiometricDevice: builder.mutation({
      query: (data) => ({ url: '/biometric-attendance/devices', method: 'POST', body: data }),
      invalidatesTags: ['BiometricDevice'],
    }),
    updateBiometricDevice: builder.mutation({
      query: ({ deviceId, ...data }) => ({ url: `/biometric-attendance/devices/${deviceId}`, method: 'PUT', body: data }),
      invalidatesTags: ['BiometricDevice'],
    }),
    deleteBiometricDevice: builder.mutation({
      query: (deviceId) => ({ url: `/biometric-attendance/devices/${deviceId}`, method: 'DELETE' }),
      invalidatesTags: ['BiometricDevice'],
    }),
    connectBiometricDevice: builder.mutation({
      query: (deviceId) => ({ url: `/biometric-attendance/devices/${deviceId}/connect`, method: 'POST' }),
      invalidatesTags: ['BiometricDevice'],
    }),
    disconnectBiometricDevice: builder.mutation({
      query: (deviceId) => ({ url: `/biometric-attendance/devices/${deviceId}/disconnect`, method: 'POST' }),
      invalidatesTags: ['BiometricDevice'],
    }),
    getBiometricDeviceHealth: builder.query({
      query: (deviceId) => `/biometric-attendance/devices/${deviceId}/health`,
      providesTags: ['BiometricDevice'],
    }),
    syncBiometricDevice: builder.mutation({
      query: ({ deviceId, since }) => ({
        url: `/biometric-attendance/devices/${deviceId}/sync${since ? `?since=${since}` : ''}`,
        method: 'POST',
      }),
      invalidatesTags: ['BiometricDevice'],
    }),

    // ── Engine Control ────────────────────────────────────────────────
    startAttendanceEngine: builder.mutation({
      query: (data = {}) => ({ url: '/biometric-attendance/engine/start', method: 'POST', body: data }),
    }),
    stopAttendanceEngine: builder.mutation({
      query: () => ({ url: '/biometric-attendance/engine/stop', method: 'POST' }),
    }),

    // Question Banks
    createQuestionBank: builder.mutation({
      query: (data) => ({
        url: '/exams/question-banks',
        method: 'POST',
        body: data
      })
    }),
    getQuestionBanks: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.subject) queryParams.set('subject', params.subject);
        if (params?.class) queryParams.set('class', params.class);
        if (params?.page) queryParams.set('page', params.page);
        if (params?.limit) queryParams.set('limit', params.limit);
        return `/exams/question-banks?${queryParams.toString()}`;
      }
    }),
    getQuestionBankById: builder.query({
      query: (id) => `/exams/question-banks/${id}`
    }),
    updateQuestionBank: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/exams/question-banks/${id}`,
        method: 'PUT',
        body: data
      })
    }),
    deleteQuestionBank: builder.mutation({
      query: (id) => ({
        url: `/exams/question-banks/${id}`,
        method: 'DELETE'
      })
    }),
    
    // Questions
    createQuestion: builder.mutation({
      query: (data) => ({
        url: '/exams/questions',
        method: 'POST',
        body: data
      })
    }),
    getQuestions: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.questionBank) queryParams.set('questionBank', params.questionBank);
        if (params?.subject) queryParams.set('subject', params.subject);
        if (params?.class) queryParams.set('class', params.class);
        if (params?.difficulty) queryParams.set('difficulty', params.difficulty);
        if (params?.questionType) queryParams.set('questionType', params.questionType);
        if (params?.page) queryParams.set('page', params.page);
        if (params?.limit) queryParams.set('limit', params.limit);
        return `/exams/questions?${queryParams.toString()}`;
      }
    }),
    getQuestionById: builder.query({
      query: (id) => `/exams/questions/${id}`
    }),
    updateQuestion: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/exams/questions/${id}`,
        method: 'PUT',
        body: data
      })
    }),
    deleteQuestion: builder.mutation({
      query: (id) => ({
        url: `/exams/questions/${id}`,
        method: 'DELETE'
      })
    }),
    restoreQuestion: builder.mutation({
      query: ({ questionId }) => ({
        url: `/exams/questions/${questionId}/restore`,
        method: 'PUT'
      }),
      invalidatesTags: ['Questions']
    }),
    archiveQuestion: builder.mutation({
      query: ({ questionId }) => ({
        url: `/exams/questions/${questionId}/archive`,
        method: 'PUT'
      }),
      invalidatesTags: ['Questions']
    }),
    importQuestions: builder.mutation({
      query: (data) => ({
        url: '/exams/questions/import',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Questions', 'QuestionBank']
    }),
    
    // Exams
    createOnlineExam: builder.mutation({
      query: (data) => ({
        url: '/exams/exams',
        method: 'POST',
        body: data
      })
    }),
    getOnlineExams: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.class) queryParams.set('class', params.class);
        if (params?.subject) queryParams.set('subject', params.subject);
        if (params?.examType) queryParams.set('examType', params.examType);
        if (params?.status) queryParams.set('status', params.status);
        if (params?.page) queryParams.set('page', params.page);
        if (params?.limit) queryParams.set('limit', params.limit);
        return `/exams/exams?${queryParams.toString()}`;
      }
    }),
    getOnlineExamById: builder.query({
      query: (id) => `/exams/exams/${id}`
    }),
    updateOnlineExam: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/exams/exams/${id}`,
        method: 'PUT',
        body: data
      })
    }),
    deleteOnlineExam: builder.mutation({
      query: (id) => ({
        url: `/exams/exams/${id}`,
        method: 'DELETE'
      })
    }),
    startOnlineExam: builder.mutation({
      query: ({ examId, studentId }) => ({
        url: `/exams/exams/${examId}/start`,
        method: 'POST',
        body: { studentId }
      })
    }),
    submitOnlineExam: builder.mutation({
      query: ({ examResultId, responses }) => ({
        url: `/exams/exam-results/${examResultId}/submit`,
        method: 'POST',
        body: { responses }
      })
    }),
    
    // Exam Results
    getExamResults: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.examId) queryParams.set('examId', params.examId);
        if (params?.studentId) queryParams.set('studentId', params.studentId);
        if (params?.status) queryParams.set('status', params.status);
        if (params?.page) queryParams.set('page', params.page);
        if (params?.limit) queryParams.set('limit', params.limit);
        return `/exams/exam-results?${queryParams.toString()}`;
      }
    }),
    getExamResultById: builder.query({
      query: (id) => `/exams/exam-results/${id}`
    }),
    gradeExam: builder.mutation({
      query: ({ examResultId, ...data }) => ({
        url: `/exams/exam-results/${examResultId}/grade`,
        method: 'POST',
        body: data
      })
    }),
    bulkCreateQuestions: builder.mutation({
      query: (data) => ({
        url: '/exams/questions/bulk',
        method: 'POST',
        body: data
      })
    }),
    exportQuestions: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.questionBank) queryParams.set('questionBank', params.questionBank);
        if (params?.subject) queryParams.set('subject', params.subject);
        if (params?.class) queryParams.set('class', params.class);
        if (params?.difficulty) queryParams.set('difficulty', params.difficulty);
        if (params?.questionType) queryParams.set('questionType', params.questionType);
        if (params?.format) queryParams.set('format', params.format);
        return `/exams/questions/export?${queryParams.toString()}`;
      }
    }),
    cloneQuestionBank: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/exams/question-banks/${id}/clone`,
        method: 'POST',
        body: data
      })
    }),
    submitBankForApproval: builder.mutation({
      query: (id) => ({
        url: `/exams/question-banks/${id}/submit-approval`,
        method: 'POST'
      })
    }),
    approveQuestionBank: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/exams/question-banks/${id}/approve`,
        method: 'POST',
        body: data
      })
    }),
    publishOnlineExam: builder.mutation({
      query: (id) => ({
        url: `/exams/exams/${id}/publish`,
        method: 'POST'
      })
    }),
    getExamAnalytics: builder.query({
      query: (examId) => `/exams/exams/${examId}/analytics`
    }),
    getExamRankings: builder.query({
      query: ({ examId, classId, page, limit }) => {
        const queryParams = new URLSearchParams();
        if (classId) queryParams.set('classId', classId);
        if (page) queryParams.set('page', page);
        if (limit) queryParams.set('limit', limit);
        return `/exams/exams/${examId}/rankings?${queryParams.toString()}`;
      }
    }),
    calculateStudentGPA: builder.query({
      query: ({ studentId, term, academicYearId }) => {
        const queryParams = new URLSearchParams();
        if (term) queryParams.set('term', term);
        if (academicYearId) queryParams.set('academicYearId', academicYearId);
        return `/exams/students/${studentId}/gpa?${queryParams.toString()}`;
      }
    }),
    calculateStudentCGPA: builder.query({
      query: ({ studentId, academicYearId }) => {
        const queryParams = new URLSearchParams();
        if (academicYearId) queryParams.set('academicYearId', academicYearId);
        return `/exams/students/${studentId}/cgpa?${queryParams.toString()}`;
      }
    }),
    publishExamResults: builder.mutation({
      query: ({ examId, ...data }) => ({
        url: `/exams/exam-results/${examId}/publish`,
        method: 'POST',
        body: data
      })
    }),
    bulkGradeExams: builder.mutation({
      query: (data) => ({
        url: '/exams/exam-results/bulk-grade',
        method: 'POST',
        body: data
      })
    }),
    getMeritList: builder.query({
      query: (params) => {
        const qp = new URLSearchParams();
        if (params?.examId) qp.set('examId', params.examId);
        if (params?.classId) qp.set('classId', params.classId);
        if (params?.limit) qp.set('limit', params.limit);
        return `/exams/exam-results/merit-list?${qp.toString()}`;
      },
      providesTags: ['ExamResult']
    }),

    // ── Library CRUD ──────────────────────────────────────────────────────
    updateLibraryBook: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/admin/library/books/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['LibraryBook']
    }),
    deleteLibraryBook: builder.mutation({
      query: (id) => ({ url: `/admin/library/books/${id}`, method: 'DELETE' }),
      invalidatesTags: ['LibraryBook']
    }),

    // ── Transport CRUD ────────────────────────────────────────────────────
    updateTransportRoute: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/admin/transport/routes/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['TransportRoute']
    }),
    deleteTransportRoute: builder.mutation({
      query: (id) => ({ url: `/admin/transport/routes/${id}`, method: 'DELETE' }),
      invalidatesTags: ['TransportRoute']
    }),
    updateTransportVehicle: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/admin/transport/vehicles/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['TransportVehicle']
    }),
    deleteTransportVehicle: builder.mutation({
      query: (id) => ({ url: `/admin/transport/vehicles/${id}`, method: 'DELETE' }),
      invalidatesTags: ['TransportVehicle']
    }),

    // ── Certificate CRUD ────────────────────────────────────────────────
    getCertificates: builder.query({
      query: () => '/admin/certificates',
      providesTags: ['Certificate']
    }),
    updateCertificate: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/admin/certificates/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Certificate']
    }),
    deleteCertificate: builder.mutation({
      query: (id) => ({ url: `/admin/certificates/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Certificate']
    }),

    // ── ID Card Management ───────────────────────────────────────────────
    getUsersForIDCard: builder.query({
      query: () => '/admin/users-for-id-card',
      providesTags: ['User']
    }),
    getIDCards: builder.query({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.type) params.append('type', filters.type);
        if (filters.search) params.append('search', filters.search);
        const qs = params.toString();
        return `/id-cards${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['IDCard']
    }),
    generateIDCard: builder.mutation({
      query: (data) => ({ url: '/id-cards', method: 'POST', body: data }),
      invalidatesTags: ['IDCard']
    }),
    updateIDCardStatus: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/id-cards/${id}/status`, method: 'PATCH', body: data }),
      invalidatesTags: ['IDCard']
    }),
    markIDCardPrinted: builder.mutation({
      query: (id) => ({ url: `/id-cards/${id}/printed`, method: 'PATCH' }),
      invalidatesTags: ['IDCard']
    }),
    deleteIDCard: builder.mutation({
      query: (id) => ({ url: `/id-cards/${id}`, method: 'DELETE' }),
      invalidatesTags: ['IDCard']
    }),
    getIDCardDesigns: builder.query({
      query: () => '/id-cards/designs',
      providesTags: ['IDCardDesign']
    }),
    verifyIDCard: builder.query({
      query: (token) => `/id-cards/verify/${token}`,
    }),
    createIDCardDesign: builder.mutation({
      query: (data) => ({ url: '/id-cards/designs', method: 'POST', body: data }),
      invalidatesTags: ['IDCardDesign']
    }),

    // ── Hostel Management ─────────────────────────────────────────────────
    getHostels: builder.query({
      query: () => '/admin/hostels',
      providesTags: ['Hostel']
    }),
    createHostel: builder.mutation({
      query: (data) => ({ url: '/admin/hostels', method: 'POST', body: data }),
      invalidatesTags: ['Hostel']
    }),
    updateHostel: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/admin/hostels/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Hostel']
    }),
    deleteHostel: builder.mutation({
      query: (id) => ({ url: `/admin/hostels/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Hostel']
    }),
    getHostelRooms: builder.query({
      query: (hostelId) => `/admin/hostels/${hostelId}/rooms`,
      providesTags: ['Hostel']
    }),
    createHostelRoom: builder.mutation({
      query: ({ hostelId, ...data }) => ({ url: `/admin/hostels/${hostelId}/rooms`, method: 'POST', body: data }),
      invalidatesTags: ['Hostel']
    }),
    updateHostelRoom: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/admin/hostels/rooms/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Hostel']
    }),
    deleteHostelRoom: builder.mutation({
      query: (id) => ({ url: `/admin/hostels/rooms/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Hostel']
    }),

    // ── Usage Analytics ───────────────────────────────────────────────────
    getUsageAnalytics: builder.query({
      query: () => '/admin/analytics/usage',
      providesTags: ['Dashboard']
    }),

    // ── Enterprise BI Endpoints ───────────────────────────────────────────
    getExecutiveDashboard: builder.query({
      query: () => '/bi/executive',
      providesTags: ['BI']
    }),
    getKPIDashboard: builder.query({
      query: () => '/bi/kpi',
      providesTags: ['BI']
    }),
    getFinancialAnalytics: builder.query({
      query: () => '/bi/financial',
      providesTags: ['BI']
    }),
    getAcademicAnalytics: builder.query({
      query: () => '/bi/academic',
      providesTags: ['BI']
    }),
    getComparativeReports: builder.query({
      query: () => '/bi/comparative',
      providesTags: ['BI']
    }),
    getBIReports: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/bi/reports${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['BI']
    }),
    generateBIReport: builder.mutation({
      query: (data) => ({
        url: '/bi/reports',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['BI']
    }),
    deleteBIReport: builder.mutation({
      query: (id) => ({
        url: `/bi/reports/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['BI']
    }),

    // ── System Health Endpoints ───────────────────────────────────────────
    getHealthDashboard: builder.query({
      query: () => '/system-health',
      providesTags: ['SystemHealth']
    }),
    getQueueMonitoring: builder.query({
      query: () => '/system-health/queues',
      providesTags: ['SystemHealth']
    }),
    getCacheMonitoring: builder.query({
      query: () => '/system-health/cache',
      providesTags: ['SystemHealth']
    }),
    getDatabaseMonitoring: builder.query({
      query: () => '/system-health/database',
      providesTags: ['SystemHealth']
    }),
    getStorageMonitoring: builder.query({
      query: () => '/system-health/storage',
      providesTags: ['SystemHealth']
    }),
    getErrorMonitoring: builder.query({
      query: () => '/system-health/errors',
      providesTags: ['SystemHealth']
    }),
    
    // ── Fee Structures ────────────────────────────────────────────────────
    getFeeStructures: builder.query({
      query: () => '/admin/fee-structures',
      providesTags: ['FeeStructure']
    }),
    createFeeStructure: builder.mutation({
      query: (data) => ({ url: '/admin/fee-structures', method: 'POST', body: data }),
      invalidatesTags: ['FeeStructure']
    }),
    calculateStudentFee: builder.mutation({
      query: (data) => ({ url: '/admin/calculate-fee', method: 'POST', body: data }),
    }),
    
    // ── Payment Matrix ─────────────────────────────────────────────────────
    getPaymentMatrix: builder.query({
      query: () => '/admin/payment-matrix',
      providesTags: ['PaymentMonth']
    }),
    
    // ── Active Sessions ────────────────────────────────────────────────────
    getActiveSessions: builder.query({
      query: () => '/admin/security/sessions',
      providesTags: ['User']
    }),
    revokeSession: builder.mutation({
      query: (sessionId) => ({
        url: `/admin/security/sessions/${sessionId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['User']
    }),
    
    // ── Data Export ────────────────────────────────────────────────────────
    exportData: builder.mutation({
      query: (data) => ({
        url: '/admin/export',
        method: 'POST',
        body: data,
        responseHandler: (response) => response.blob(),
      }),
    }),
    
    // ── Misc ─────────────────────────────────────────────────────────────
    resetPassword: builder.mutation({
      query: (data) => ({ url: '/auth/reset-password', method: 'PUT', body: data }),
    }),

    // ── Payroll ───────────────────────────────────────────────────────────
    getPayrolls: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/payroll${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Payroll'],
    }),
    getPayrollById: builder.query({
      query: (id) => `/payroll/${id}`,
      providesTags: ['Payroll'],
    }),
    createPayroll: builder.mutation({
      query: (data) => ({ url: '/payroll', method: 'POST', body: data }),
      invalidatesTags: ['Payroll'],
    }),
    updatePayroll: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/payroll/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Payroll'],
    }),
    deletePayroll: builder.mutation({
      query: (id) => ({ url: `/payroll/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Payroll'],
    }),
    approvePayroll: builder.mutation({
      query: (id) => ({ url: `/payroll/${id}/approve`, method: 'POST' }),
      invalidatesTags: ['Payroll'],
    }),
    markPayrollPaid: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/payroll/${id}/mark-paid`, method: 'POST', body: data }),
      invalidatesTags: ['Payroll'],
    }),
    runBulkPayroll: builder.mutation({
      query: (data) => ({ url: '/payroll/bulk-run', method: 'POST', body: data }),
      invalidatesTags: ['Payroll'],
    }),
    getPayrollStats: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/payroll/stats${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Payroll'],
    }),

    // ── Salary Structures ─────────────────────────────────────────────────
    getSalaryStructures: builder.query({
      query: () => '/payroll/salary-structures',
      providesTags: ['SalaryStructure'],
    }),
    getSalaryStructureById: builder.query({
      query: (id) => `/payroll/salary-structures/${id}`,
      providesTags: ['SalaryStructure'],
    }),
    createSalaryStructure: builder.mutation({
      query: (data) => ({ url: '/payroll/salary-structures', method: 'POST', body: data }),
      invalidatesTags: ['SalaryStructure'],
    }),
    updateSalaryStructure: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/payroll/salary-structures/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['SalaryStructure'],
    }),
    deleteSalaryStructure: builder.mutation({
      query: (id) => ({ url: `/payroll/salary-structures/${id}`, method: 'DELETE' }),
      invalidatesTags: ['SalaryStructure'],
    }),
    previewSalaryCalculation: builder.mutation({
      query: (data) => ({ url: '/payroll/salary-structures/preview', method: 'POST', body: data }),
    }),

    // ── Leave Management ──────────────────────────────────────────────────
    getLeaves: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/leaves${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Leave'],
    }),
    getMyLeaves: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/leaves/my-leaves${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Leave'],
    }),
    getLeaveById: builder.query({
      query: (id) => `/leaves/${id}`,
      providesTags: ['Leave'],
    }),
    getLeaveStats: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/leaves/stats${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Leave'],
    }),
    applyLeave: builder.mutation({
      query: (data) => ({ url: '/leaves/apply', method: 'POST', body: data }),
      invalidatesTags: ['Leave'],
    }),
    createLeaveForEmployee: builder.mutation({
      query: (data) => ({ url: '/leaves', method: 'POST', body: data }),
      invalidatesTags: ['Leave'],
    }),
    updateLeave: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/leaves/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Leave'],
    }),
    approveLeaveViaAdmin: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/leaves/${id}/approve`, method: 'POST', body: data }),
      invalidatesTags: ['Leave'],
    }),
    rejectLeave: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/leaves/${id}/reject`, method: 'POST', body: data }),
      invalidatesTags: ['Leave'],
    }),
    cancelLeave: builder.mutation({
      query: (id) => ({ url: `/leaves/${id}/cancel`, method: 'POST' }),
      invalidatesTags: ['Leave'],
    }),
    deleteLeave: builder.mutation({
      query: (id) => ({ url: `/leaves/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Leave'],
    }),

    // ── Expenses ─────────────────────────────────────────────────────────
    getExpenses: builder.query({
      query: ({ page = 1, limit = 20, search, category, status, dateFrom, dateTo } = {}) => {
        const params = new URLSearchParams({ page, limit });
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (status) params.append('status', status);
        if (dateFrom) params.append('dateFrom', dateFrom);
        if (dateTo) params.append('dateTo', dateTo);
        return `/expenses?${params.toString()}`;
      },
      providesTags: ['Expense'],
    }),
    getExpenseStats: builder.query({
      query: () => '/expenses/stats',
      providesTags: ['Expense'],
    }),
    createExpense: builder.mutation({
      query: (data) => ({ url: '/expenses', method: 'POST', body: data }),
      invalidatesTags: ['Expense'],
    }),
    updateExpense: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/expenses/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Expense'],
    }),
    deleteExpense: builder.mutation({
      query: (id) => ({ url: `/expenses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Expense'],
    }),

    // ── Report Cards ──────────────────────────────────────────────────────
    generateReportCard: builder.mutation({
      query: (data) => ({
        url: '/admin/report-cards/generate',
        method: 'POST',
        body: data,
        responseHandler: (response) => response.blob(),
      }),
    }),
    getReportCards: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/admin/report-cards${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['ReportCard'],
    }),

    // ── Cafeteria Management ──────────────────────────────────────────────
    getCafeteriaItems: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/cafeteria/items${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Cafeteria'],
    }),
    createCafeteriaItem: builder.mutation({
      query: (data) => ({ url: '/cafeteria/items', method: 'POST', body: data }),
      invalidatesTags: ['Cafeteria'],
    }),
    updateCafeteriaItem: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/cafeteria/items/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Cafeteria'],
    }),
    deleteCafeteriaItem: builder.mutation({
      query: (id) => ({ url: `/cafeteria/items/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Cafeteria'],
    }),
    getCafeteriaOrders: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/cafeteria/orders${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Cafeteria'],
    }),
    createCafeteriaOrder: builder.mutation({
      query: (data) => ({ url: '/cafeteria/orders', method: 'POST', body: data }),
      invalidatesTags: ['Cafeteria'],
    }),
    updateCafeteriaOrder: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/cafeteria/orders/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Cafeteria'],
    }),
    getCafeteriaStats: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/cafeteria/stats${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Cafeteria'],
    }),

    // ── Club Management ───────────────────────────────────────────────────
    getClubs: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/clubs${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Club'],
    }),
    getClubById: builder.query({
      query: (id) => `/clubs/${id}`,
      providesTags: ['Club'],
    }),
    createClub: builder.mutation({
      query: (data) => ({ url: '/clubs', method: 'POST', body: data }),
      invalidatesTags: ['Club'],
    }),
    updateClub: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/clubs/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Club'],
    }),
    deleteClub: builder.mutation({
      query: (id) => ({ url: `/clubs/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Club'],
    }),
    enrollClubMember: builder.mutation({
      query: ({ clubId, ...data }) => ({ url: `/clubs/${clubId}/members`, method: 'POST', body: data }),
      invalidatesTags: ['Club'],
    }),
    removeClubMember: builder.mutation({
      query: ({ clubId, userId }) => ({ url: `/clubs/${clubId}/members/${userId}`, method: 'DELETE' }),
      invalidatesTags: ['Club'],
    }),

    // ── Sports Management ─────────────────────────────────────────────────
    getSports: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/sports${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Sport'],
    }),
    createSport: builder.mutation({
      query: (data) => ({ url: '/sports', method: 'POST', body: data }),
      invalidatesTags: ['Sport'],
    }),
    updateSport: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/sports/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Sport'],
    }),
    deleteSport: builder.mutation({
      query: (id) => ({ url: `/sports/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Sport'],
    }),
    getSportTeams: builder.query({
      query: (sportId) => `/sports/${sportId}/teams`,
      providesTags: ['Sport'],
    }),
    createSportTeam: builder.mutation({
      query: ({ sportId, ...data }) => ({ url: `/sports/${sportId}/teams`, method: 'POST', body: data }),
      invalidatesTags: ['Sport'],
    }),
    enrollSportPlayer: builder.mutation({
      query: ({ teamId, ...data }) => ({ url: `/sports/teams/${teamId}/players`, method: 'POST', body: data }),
      invalidatesTags: ['Sport'],
    }),
    removeSportPlayer: builder.mutation({
      query: ({ teamId, userId }) => ({ url: `/sports/teams/${teamId}/players/${userId}`, method: 'DELETE' }),
      invalidatesTags: ['Sport'],
    }),

    // ── Competition Management ────────────────────────────────────────────
    getCompetitions: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/competitions${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Competition'],
    }),
    createCompetition: builder.mutation({
      query: (data) => ({ url: '/competitions', method: 'POST', body: data }),
      invalidatesTags: ['Competition'],
    }),
    updateCompetition: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/competitions/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Competition'],
    }),
    deleteCompetition: builder.mutation({
      query: (id) => ({ url: `/competitions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Competition'],
    }),
    enrollCompetitionParticipant: builder.mutation({
      query: ({ competitionId, ...data }) => ({ url: `/competitions/${competitionId}/participants`, method: 'POST', body: data }),
      invalidatesTags: ['Competition'],
    }),
    removeCompetitionParticipant: builder.mutation({
      query: ({ competitionId, userId }) => ({ url: `/competitions/${competitionId}/participants/${userId}`, method: 'DELETE' }),
      invalidatesTags: ['Competition'],
    }),

    // ── Lost and Found ────────────────────────────────────────────────────
    getLostFoundItems: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/lost-found${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['LostFound'],
    }),
    createLostFoundItem: builder.mutation({
      query: (data) => ({ url: '/lost-found', method: 'POST', body: data }),
      invalidatesTags: ['LostFound'],
    }),
    updateLostFoundItem: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/lost-found/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['LostFound'],
    }),
    deleteLostFoundItem: builder.mutation({
      query: (id) => ({ url: `/lost-found/${id}`, method: 'DELETE' }),
      invalidatesTags: ['LostFound'],
    }),
    claimLostFoundItem: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/lost-found/${id}/claim`, method: 'POST', body: data }),
      invalidatesTags: ['LostFound'],
    }),

    // ── Career Guidance ───────────────────────────────────────────────────
    getCareerGuidance: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/career-guidance${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['CareerGuidance'],
    }),
    createCareerGuidance: builder.mutation({
      query: (data) => ({ url: '/career-guidance', method: 'POST', body: data }),
      invalidatesTags: ['CareerGuidance'],
    }),
    updateCareerGuidance: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/career-guidance/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['CareerGuidance'],
    }),
    deleteCareerGuidance: builder.mutation({
      query: (id) => ({ url: `/career-guidance/${id}`, method: 'DELETE' }),
      invalidatesTags: ['CareerGuidance'],
    }),

    // ── Internship Management ─────────────────────────────────────────────
    getInternships: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/internships${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Internship'],
    }),
    createInternship: builder.mutation({
      query: (data) => ({ url: '/internships', method: 'POST', body: data }),
      invalidatesTags: ['Internship'],
    }),
    updateInternship: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/internships/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Internship'],
    }),
    deleteInternship: builder.mutation({
      query: (id) => ({ url: `/internships/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Internship'],
    }),
    applyForInternship: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/internships/${id}/apply`, method: 'POST', body: data }),
      invalidatesTags: ['Internship'],
    }),

    // ── Scholarship Management ────────────────────────────────────────────
    getScholarships: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/scholarships${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Scholarship'],
    }),
    createScholarship: builder.mutation({
      query: (data) => ({ url: '/scholarships', method: 'POST', body: data }),
      invalidatesTags: ['Scholarship'],
    }),
    updateScholarship: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/scholarships/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Scholarship'],
    }),
    deleteScholarship: builder.mutation({
      query: (id) => ({ url: `/scholarships/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Scholarship'],
    }),
    applyForScholarship: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/scholarships/${id}/apply`, method: 'POST', body: data }),
      invalidatesTags: ['Scholarship'],
    }),
    reviewScholarshipApplication: builder.mutation({
      query: ({ scholarshipId, applicationId, ...data }) => ({
        url: `/scholarships/${scholarshipId}/applications/${applicationId}/review`,
        method: 'POST', body: data,
      }),
      invalidatesTags: ['Scholarship'],
    }),
    getScholarshipApplications: builder.query({
      query: (scholarshipId) => `/scholarships/${scholarshipId}/applications`,
      providesTags: ['Scholarship'],
    }),

    // ── Graduation Management ─────────────────────────────────────────────
    getGraduations: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/graduations${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Graduation'],
    }),
    createGraduation: builder.mutation({
      query: (data) => ({ url: '/graduations', method: 'POST', body: data }),
      invalidatesTags: ['Graduation'],
    }),
    updateGraduation: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/graduations/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Graduation'],
    }),
    deleteGraduation: builder.mutation({
      query: (id) => ({ url: `/graduations/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Graduation'],
    }),

    // ── Event Ticketing ───────────────────────────────────────────────────
    getEventTickets: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/event-tickets${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['EventTicket'],
    }),
    createEventTicket: builder.mutation({
      query: (data) => ({ url: '/event-tickets', method: 'POST', body: data }),
      invalidatesTags: ['EventTicket'],
    }),
    updateEventTicket: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/event-tickets/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['EventTicket'],
    }),
    deleteEventTicket: builder.mutation({
      query: (id) => ({ url: `/event-tickets/${id}`, method: 'DELETE' }),
      invalidatesTags: ['EventTicket'],
    }),
    issueEventTicket: builder.mutation({
      query: (data) => ({ url: '/event-tickets/issue', method: 'POST', body: data }),
      invalidatesTags: ['EventTicket'],
    }),
    verifyEventTicket: builder.mutation({
      query: (data) => ({ url: '/event-tickets/verify', method: 'POST', body: data }),
      invalidatesTags: ['EventTicket'],
    }),

    // ── Counseling Management ─────────────────────────────────────────────
    getCounselingSessions: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/counseling${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Counseling'],
    }),
    createCounselingSession: builder.mutation({
      query: (data) => ({ url: '/counseling', method: 'POST', body: data }),
      invalidatesTags: ['Counseling'],
    }),
    updateCounselingSession: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/counseling/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Counseling'],
    }),
    deleteCounselingSession: builder.mutation({
      query: (id) => ({ url: `/counseling/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Counseling'],
    }),

    // ── Anti-Bullying / Incident Reporting ────────────────────────────────
    getIncidentReports: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/incidents${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Incident'],
    }),
    createIncidentReport: builder.mutation({
      query: (data) => ({ url: '/incidents', method: 'POST', body: data }),
      invalidatesTags: ['Incident'],
    }),
    updateIncidentReport: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/incidents/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Incident'],
    }),
    deleteIncidentReport: builder.mutation({
      query: (id) => ({ url: `/incidents/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Incident'],
    }),
    submitAnonymousIncident: builder.mutation({
      query: (data) => ({ url: '/incidents/anonymous', method: 'POST', body: data }),
    }),

    // ── Donor and Sponsorship ─────────────────────────────────────────────
    getDonors: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/donors${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Donor'],
    }),
    createDonor: builder.mutation({
      query: (data) => ({ url: '/donors', method: 'POST', body: data }),
      invalidatesTags: ['Donor'],
    }),
    updateDonor: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/donors/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Donor'],
    }),
    deleteDonor: builder.mutation({
      query: (id) => ({ url: `/donors/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Donor'],
    }),
    getSponsorships: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/donors/sponsorships${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Donor'],
    }),
    createSponsorship: builder.mutation({
      query: (data) => ({ url: '/donors/sponsorships', method: 'POST', body: data }),
      invalidatesTags: ['Donor'],
    }),

    // ── Uniform Management ────────────────────────────────────────────────
    getUniformItems: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/uniforms/items${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Uniform'],
    }),
    createUniformItem: builder.mutation({
      query: (data) => ({ url: '/uniforms/items', method: 'POST', body: data }),
      invalidatesTags: ['Uniform'],
    }),
    updateUniformItem: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/uniforms/items/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Uniform'],
    }),
    deleteUniformItem: builder.mutation({
      query: (id) => ({ url: `/uniforms/items/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Uniform'],
    }),
    getUniformOrders: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/uniforms/orders${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Uniform'],
    }),
    createUniformOrder: builder.mutation({
      query: (data) => ({ url: '/uniforms/orders', method: 'POST', body: data }),
      invalidatesTags: ['Uniform'],
    }),
    updateUniformOrder: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/uniforms/orders/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Uniform'],
    }),

    // ── School Store / POS ────────────────────────────────────────────────
    getStoreProducts: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/store/products${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Store'],
    }),
    createStoreProduct: builder.mutation({
      query: (data) => ({ url: '/store/products', method: 'POST', body: data }),
      invalidatesTags: ['Store'],
    }),
    updateStoreProduct: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/store/products/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Store'],
    }),
    deleteStoreProduct: builder.mutation({
      query: (id) => ({ url: `/store/products/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Store'],
    }),
    getStoreOrders: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/store/orders${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Store'],
    }),
    createStoreOrder: builder.mutation({
      query: (data) => ({ url: '/store/orders', method: 'POST', body: data }),
      invalidatesTags: ['Store'],
    }),
    updateStoreOrder: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/store/orders/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Store'],
    }),
    getStoreSalesReport: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/store/reports${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Store'],
    }),

    // ── Visitor QR Pass ───────────────────────────────────────────────────
    generateVisitorQRPass: builder.mutation({
      query: (id) => ({ url: `/visitors/${id}/qr-pass`, method: 'POST' }),
      invalidatesTags: ['Visitor'],
    }),
    verifyVisitorQRPass: builder.mutation({
      query: (data) => ({ url: '/visitors/verify-qr', method: 'POST', body: data }),
    }),
    getVisitors: builder.query({
      query: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return `/enterprise/visitors${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Visitor'],
    }),
    createVisitor: builder.mutation({
      query: (data) => ({ url: '/enterprise/visitors', method: 'POST', body: data }),
      invalidatesTags: ['Visitor'],
    }),
    updateVisitor: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/enterprise/visitors/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Visitor'],
    }),
    deleteVisitor: builder.mutation({
      query: (id) => ({ url: `/enterprise/visitors/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Visitor'],
    }),

    // ── Departments & Designations ────────────────────────────────────────
    getDepartments: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/departments/departments${qs ? `?${qs}` : ''}`; },
      providesTags: ['Department'],
    }),
    createDepartment: builder.mutation({
      query: (data) => ({ url: '/departments/departments', method: 'POST', body: data }),
      invalidatesTags: ['Department'],
    }),
    updateDepartment: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/departments/departments/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Department'],
    }),
    deleteDepartment: builder.mutation({
      query: (id) => ({ url: `/departments/departments/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Department'],
    }),
    getDesignations: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/departments/designations${qs ? `?${qs}` : ''}`; },
      providesTags: ['Designation'],
    }),
    createDesignation: builder.mutation({
      query: (data) => ({ url: '/departments/designations', method: 'POST', body: data }),
      invalidatesTags: ['Designation'],
    }),
    updateDesignation: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/departments/designations/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Designation'],
    }),
    deleteDesignation: builder.mutation({
      query: (id) => ({ url: `/departments/designations/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Designation'],
    }),

    // ── Homework ──────────────────────────────────────────────────────────
    getHomeworks: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/academic-content/homework${qs ? `?${qs}` : ''}`; },
      providesTags: ['Homework'],
    }),
    createHomework: builder.mutation({
      query: (data) => ({ url: '/academic-content/homework', method: 'POST', body: data }),
      invalidatesTags: ['Homework'],
    }),
    updateHomework: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/academic-content/homework/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Homework'],
    }),
    deleteHomework: builder.mutation({
      query: (id) => ({ url: `/academic-content/homework/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Homework'],
    }),
    // ── Lesson Plans ──────────────────────────────────────────────────────
    getLessonPlans: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/academic-content/lesson-plans${qs ? `?${qs}` : ''}`; },
      providesTags: ['LessonPlan'],
    }),
    createLessonPlan: builder.mutation({
      query: (data) => ({ url: '/academic-content/lesson-plans', method: 'POST', body: data }),
      invalidatesTags: ['LessonPlan'],
    }),
    updateLessonPlan: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/academic-content/lesson-plans/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['LessonPlan'],
    }),
    deleteLessonPlan: builder.mutation({
      query: (id) => ({ url: `/academic-content/lesson-plans/${id}`, method: 'DELETE' }),
      invalidatesTags: ['LessonPlan'],
    }),
    // ── Curriculum ────────────────────────────────────────────────────────
    getCurriculums: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/academic-content/curriculum${qs ? `?${qs}` : ''}`; },
      providesTags: ['Curriculum'],
    }),
    createCurriculum: builder.mutation({
      query: (data) => ({ url: '/academic-content/curriculum', method: 'POST', body: data }),
      invalidatesTags: ['Curriculum'],
    }),
    updateCurriculum: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/academic-content/curriculum/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Curriculum'],
    }),
    deleteCurriculum: builder.mutation({
      query: (id) => ({ url: `/academic-content/curriculum/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Curriculum'],
    }),

    // ── Accounting ────────────────────────────────────────────────────────
    getAccounts: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/accounting/accounts${qs ? `?${qs}` : ''}`; },
      providesTags: ['Account'],
    }),
    createAccount: builder.mutation({
      query: (data) => ({ url: '/accounting/accounts', method: 'POST', body: data }),
      invalidatesTags: ['Account'],
    }),
    updateAccount: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/accounting/accounts/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Account'],
    }),
    deleteAccount: builder.mutation({
      query: (id) => ({ url: `/accounting/accounts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Account'],
    }),
    getJournalEntries: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/accounting/journal-entries${qs ? `?${qs}` : ''}`; },
      providesTags: ['JournalEntry'],
    }),
    createJournalEntry: builder.mutation({
      query: (data) => ({ url: '/accounting/journal-entries', method: 'POST', body: data }),
      invalidatesTags: ['JournalEntry'],
    }),
    postJournalEntry: builder.mutation({
      query: (id) => ({ url: `/accounting/journal-entries/${id}/post`, method: 'POST' }),
      invalidatesTags: ['JournalEntry'],
    }),
    reverseJournalEntry: builder.mutation({
      query: (id) => ({ url: `/accounting/journal-entries/${id}/reverse`, method: 'POST' }),
      invalidatesTags: ['JournalEntry'],
    }),
    getTrialBalance: builder.query({
      query: () => '/accounting/trial-balance',
      providesTags: ['AccountingReport'],
    }),
    getProfitAndLoss: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/accounting/profit-and-loss${qs ? `?${qs}` : ''}`; },
      providesTags: ['AccountingReport'],
    }),
    getBalanceSheet: builder.query({
      query: () => '/accounting/balance-sheet',
      providesTags: ['AccountingReport'],
    }),
    getCashFlow: builder.query({
      query: () => '/accounting/cash-flow',
      providesTags: ['AccountingReport'],
    }),
    getFiscalPeriods: builder.query({
      query: () => '/accounting/fiscal-periods',
      providesTags: ['FiscalPeriod'],
    }),
    createFiscalPeriod: builder.mutation({
      query: (data) => ({ url: '/accounting/fiscal-periods', method: 'POST', body: data }),
      invalidatesTags: ['FiscalPeriod'],
    }),
    closeFiscalPeriod: builder.mutation({
      query: (id) => ({ url: `/accounting/fiscal-periods/${id}/close`, method: 'POST' }),
      invalidatesTags: ['FiscalPeriod'],
    }),

    // ── HR ────────────────────────────────────────────────────────────────
    getLoans: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/hr/loans${qs ? `?${qs}` : ''}`; },
      providesTags: ['Loan'],
    }),
    createLoan: builder.mutation({
      query: (data) => ({ url: '/hr/loans', method: 'POST', body: data }),
      invalidatesTags: ['Loan'],
    }),
    approveLoan: builder.mutation({
      query: (id) => ({ url: `/hr/loans/${id}/approve`, method: 'POST' }),
      invalidatesTags: ['Loan'],
    }),
    rejectLoan: builder.mutation({
      query: (id) => ({ url: `/hr/loans/${id}/reject`, method: 'POST' }),
      invalidatesTags: ['Loan'],
    }),
    getReviews: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/hr/reviews${qs ? `?${qs}` : ''}`; },
      providesTags: ['Review'],
    }),
    createReview: builder.mutation({
      query: (data) => ({ url: '/hr/reviews', method: 'POST', body: data }),
      invalidatesTags: ['Review'],
    }),
    updateReview: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/hr/reviews/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Review'],
    }),
    getContracts: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/hr/contracts${qs ? `?${qs}` : ''}`; },
      providesTags: ['Contract'],
    }),
    createContract: builder.mutation({
      query: (data) => ({ url: '/hr/contracts', method: 'POST', body: data }),
      invalidatesTags: ['Contract'],
    }),
    updateContract: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/hr/contracts/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Contract'],
    }),
    getJobPostings: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/hr/job-postings${qs ? `?${qs}` : ''}`; },
      providesTags: ['JobPosting'],
    }),
    createJobPosting: builder.mutation({
      query: (data) => ({ url: '/hr/job-postings', method: 'POST', body: data }),
      invalidatesTags: ['JobPosting'],
    }),
    updateJobPosting: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/hr/job-postings/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['JobPosting'],
    }),
    deleteJobPosting: builder.mutation({
      query: (id) => ({ url: `/hr/job-postings/${id}`, method: 'DELETE' }),
      invalidatesTags: ['JobPosting'],
    }),

    // ── Transport Extensions ──────────────────────────────────────────────
    getFuelLogs: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/transport/fuel-logs${qs ? `?${qs}` : ''}`; },
      providesTags: ['FuelLog'],
    }),
    createFuelLog: builder.mutation({
      query: (data) => ({ url: '/transport/fuel-logs', method: 'POST', body: data }),
      invalidatesTags: ['FuelLog'],
    }),
    getVehicleMaintenance: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/transport/maintenance${qs ? `?${qs}` : ''}`; },
      providesTags: ['Maintenance'],
    }),
    createVehicleMaintenance: builder.mutation({
      query: (data) => ({ url: '/transport/maintenance', method: 'POST', body: data }),
      invalidatesTags: ['Maintenance'],
    }),
    updateVehicleMaintenance: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/transport/maintenance/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Maintenance'],
    }),
    getTransportAllocations: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/transport/allocations${qs ? `?${qs}` : ''}`; },
      providesTags: ['TransportAllocation'],
    }),
    createTransportAllocation: builder.mutation({
      query: (data) => ({ url: '/transport/allocations', method: 'POST', body: data }),
      invalidatesTags: ['TransportAllocation'],
    }),
    updateTransportAllocation: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/transport/allocations/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['TransportAllocation'],
    }),
    deleteTransportAllocation: builder.mutation({
      query: (id) => ({ url: `/transport/allocations/${id}`, method: 'DELETE' }),
      invalidatesTags: ['TransportAllocation'],
    }),

    // ── Hostel Extensions ─────────────────────────────────────────────────
    getHostelAttendance: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/hostel/attendance${qs ? `?${qs}` : ''}`; },
      providesTags: ['HostelAttendance'],
    }),
    markHostelAttendance: builder.mutation({
      query: (data) => ({ url: '/hostel/attendance', method: 'POST', body: data }),
      invalidatesTags: ['HostelAttendance'],
    }),
    getBedAllocations: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/hostel/bed-allocations${qs ? `?${qs}` : ''}`; },
      providesTags: ['BedAllocation'],
    }),
    createBedAllocation: builder.mutation({
      query: (data) => ({ url: '/hostel/bed-allocations', method: 'POST', body: data }),
      invalidatesTags: ['BedAllocation'],
    }),
    updateBedAllocation: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/hostel/bed-allocations/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['BedAllocation'],
    }),
    deleteBedAllocation: builder.mutation({
      query: (id) => ({ url: `/hostel/bed-allocations/${id}`, method: 'DELETE' }),
      invalidatesTags: ['BedAllocation'],
    }),
    getHostelOccupancy: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/hostel/occupancy${qs ? `?${qs}` : ''}`; },
      providesTags: ['BedAllocation'],
    }),

    // ── Inventory ─────────────────────────────────────────────────────────
    getSuppliers: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/inventory/suppliers${qs ? `?${qs}` : ''}`; },
      providesTags: ['Supplier'],
    }),
    createSupplier: builder.mutation({
      query: (data) => ({ url: '/inventory/suppliers', method: 'POST', body: data }),
      invalidatesTags: ['Supplier'],
    }),
    updateSupplier: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/inventory/suppliers/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Supplier'],
    }),
    deleteSupplier: builder.mutation({
      query: (id) => ({ url: `/inventory/suppliers/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Supplier'],
    }),
    getInventoryItems: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/inventory/items${qs ? `?${qs}` : ''}`; },
      providesTags: ['InventoryItem'],
    }),
    createInventoryItem: builder.mutation({
      query: (data) => ({ url: '/inventory/items', method: 'POST', body: data }),
      invalidatesTags: ['InventoryItem'],
    }),
    updateInventoryItem: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/inventory/items/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['InventoryItem'],
    }),
    deleteInventoryItem: builder.mutation({
      query: (id) => ({ url: `/inventory/items/${id}`, method: 'DELETE' }),
      invalidatesTags: ['InventoryItem'],
    }),
    getStockMovements: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/inventory/movements${qs ? `?${qs}` : ''}`; },
      providesTags: ['StockMovement'],
    }),
    createStockMovement: builder.mutation({
      query: (data) => ({ url: '/inventory/movements', method: 'POST', body: data }),
      invalidatesTags: ['StockMovement'],
    }),
    getInventoryStats: builder.query({
      query: () => '/inventory/items/stats',
      providesTags: ['InventoryItem'],
    }),

    // ── Security Admin ────────────────────────────────────────────────────
    getApiKeys: builder.query({
      query: () => '/security-admin/api-keys',
      providesTags: ['ApiKey'],
    }),
    createApiKey: builder.mutation({
      query: (data) => ({ url: '/security-admin/api-keys', method: 'POST', body: data }),
      invalidatesTags: ['ApiKey'],
    }),
    revokeApiKey: builder.mutation({
      query: (id) => ({ url: `/security-admin/api-keys/${id}/revoke`, method: 'POST' }),
      invalidatesTags: ['ApiKey'],
    }),
    deleteApiKey: builder.mutation({
      query: (id) => ({ url: `/security-admin/api-keys/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ApiKey'],
    }),
    getLoginHistory: builder.query({
      query: (params = {}) => { const qs = new URLSearchParams(params).toString(); return `/security-admin/login-history${qs ? `?${qs}` : ''}`; },
      providesTags: ['LoginHistory'],
    }),
    getLoginStats: builder.query({
      query: () => '/security-admin/login-stats',
      providesTags: ['LoginHistory'],
    }),
    getIpRestrictions: builder.query({
      query: () => '/security-admin/ip-restrictions',
      providesTags: ['IpRestriction'],
    }),
    createIpRestriction: builder.mutation({
      query: (data) => ({ url: '/security-admin/ip-restrictions', method: 'POST', body: data }),
      invalidatesTags: ['IpRestriction'],
    }),
    updateIpRestriction: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/security-admin/ip-restrictions/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['IpRestriction'],
    }),
    deleteIpRestriction: builder.mutation({
      query: (id) => ({ url: `/security-admin/ip-restrictions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['IpRestriction'],
    }),
    getPasswordPolicy: builder.query({
      query: () => '/security-admin/password-policy',
      providesTags: ['PasswordPolicy'],
    }),
    updatePasswordPolicy: builder.mutation({
      query: (data) => ({ url: '/security-admin/password-policy', method: 'PUT', body: data }),
      invalidatesTags: ['PasswordPolicy'],
    }),

    // ── Phase 18: Workflow Automation ──────────────────────────────────
    getWorkflows: builder.query({
      query: () => '/workflow/templates',
      providesTags: ['Workflow'],
    }),
    createWorkflow: builder.mutation({
      query: (data) => ({ url: '/workflow/templates', method: 'POST', body: data }),
      invalidatesTags: ['Workflow'],
    }),
    updateWorkflow: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/workflow/templates/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Workflow'],
    }),
    deleteWorkflow: builder.mutation({
      query: (id) => ({ url: `/workflow/templates/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Workflow'],
    }),
    getWorkflowInstances: builder.query({
      query: () => '/workflow/instances',
      providesTags: ['Workflow'],
    }),
    createWorkflowInstance: builder.mutation({
      query: (data) => ({ url: '/workflow/instances', method: 'POST', body: data }),
      invalidatesTags: ['Workflow'],
    }),
    approveWorkflowStep: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/workflow/instances/${id}/approve`, method: 'POST', body: data }),
      invalidatesTags: ['Workflow'],
    }),
    rejectWorkflowStep: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/workflow/instances/${id}/reject`, method: 'POST', body: data }),
      invalidatesTags: ['Workflow'],
    }),

    // ── Phase 19: Automation Engine ────────────────────────────────────
    getScheduledJobs: builder.query({
      query: () => '/automation/jobs',
      providesTags: ['Automation'],
    }),
    createScheduledJob: builder.mutation({
      query: (data) => ({ url: '/automation/jobs', method: 'POST', body: data }),
      invalidatesTags: ['Automation'],
    }),
    updateScheduledJob: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/automation/jobs/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Automation'],
    }),
    deleteScheduledJob: builder.mutation({
      query: (id) => ({ url: `/automation/jobs/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Automation'],
    }),
    toggleScheduledJob: builder.mutation({
      query: (id) => ({ url: `/automation/jobs/${id}/toggle`, method: 'POST' }),
      invalidatesTags: ['Automation'],
    }),
    runScheduledJobNow: builder.mutation({
      query: (id) => ({ url: `/automation/jobs/${id}/run`, method: 'POST' }),
      invalidatesTags: ['Automation'],
    }),
    getAutomationLogs: builder.query({
      query: () => '/automation/logs',
      providesTags: ['Automation'],
    }),
    getAutomationStats: builder.query({
      query: () => '/automation/stats',
      providesTags: ['Automation'],
    }),

    // ── Phase 20: AI ──────────────────────────────────────────────────
    getAIPredictions: builder.query({
      query: () => '/ai/predictions',
      providesTags: ['AI'],
    }),
    generatePredictions: builder.mutation({
      query: (data) => ({ url: '/ai/predictions', method: 'POST', body: data }),
      invalidatesTags: ['AI'],
    }),
    getAIInsights: builder.query({
      query: () => '/ai/insights',
      providesTags: ['AI'],
    }),
    getAIChatSessions: builder.query({
      query: () => '/ai/chat/sessions',
      providesTags: ['AI'],
    }),
    getAIChatMessages: builder.query({
      query: (sessionId) => `/ai/chat/${sessionId}`,
      providesTags: ['AI'],
    }),
    sendAIChatMessage: builder.mutation({
      query: (data) => ({ url: '/ai/chat', method: 'POST', body: data }),
      invalidatesTags: ['AI'],
    }),
    getAIRecommendations: builder.query({
      query: () => '/ai/recommendations',
      providesTags: ['AI'],
    }),

    // ── Phase 21: BI ──────────────────────────────────────────────────
    getBIReports: builder.query({
      query: () => '/bi/reports',
      providesTags: ['BI'],
    }),
    generateBIReport: builder.mutation({
      query: (data) => ({ url: '/bi/reports', method: 'POST', body: data }),
      invalidatesTags: ['BI'],
    }),
    deleteBIReport: builder.mutation({
      query: (id) => ({ url: `/bi/reports/${id}`, method: 'DELETE' }),
      invalidatesTags: ['BI'],
    }),
    getExecutiveDashboard: builder.query({
      query: () => '/bi/executive',
      providesTags: ['BI'],
    }),
    getKPIDashboard: builder.query({
      query: () => '/bi/kpi',
      providesTags: ['BI'],
    }),
    getFinancialAnalytics: builder.query({
      query: () => '/bi/financial',
      providesTags: ['BI'],
    }),
    getAcademicAnalytics: builder.query({
      query: () => '/bi/academic',
      providesTags: ['BI'],
    }),
    getComparativeReports: builder.query({
      query: () => '/bi/comparative',
      providesTags: ['BI'],
    }),

    // ── Phase 22: Document Workflow ────────────────────────────────────
    getDocumentStats: builder.query({
      query: () => '/documents/stats',
      providesTags: ['Document'],
    }),
    approveDocument: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/documents/${id}/approve`, method: 'POST', body: data }),
      invalidatesTags: ['Document'],
    }),
    rejectDocument: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/documents/${id}/reject`, method: 'POST', body: data }),
      invalidatesTags: ['Document'],
    }),
    addDocumentVersion: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/documents/${id}/versions`, method: 'POST', body: data }),
      invalidatesTags: ['Document'],
    }),

    // ── Phase 23: Advanced Security ───────────────────────────────────
    getActiveSessions: builder.query({
      query: () => '/advanced-security/sessions',
      providesTags: ['Security'],
    }),
    revokeSession: builder.mutation({
      query: (id) => ({ url: `/advanced-security/sessions/${id}/revoke`, method: 'POST' }),
      invalidatesTags: ['Security'],
    }),
    revokeAllSessions: builder.mutation({
      query: () => ({ url: '/advanced-security/sessions/revoke-all', method: 'POST' }),
      invalidatesTags: ['Security'],
    }),
    getAPITokens: builder.query({
      query: () => '/advanced-security/api-tokens',
      providesTags: ['Security'],
    }),
    createAPIToken: builder.mutation({
      query: (data) => ({ url: '/advanced-security/api-tokens', method: 'POST', body: data }),
      invalidatesTags: ['Security'],
    }),
    revokeAPIToken: builder.mutation({
      query: (id) => ({ url: `/advanced-security/api-tokens/${id}/revoke`, method: 'POST' }),
      invalidatesTags: ['Security'],
    }),
    deleteAPIToken: builder.mutation({
      query: (id) => ({ url: `/advanced-security/api-tokens/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Security'],
    }),
    getSecurityDashboard: builder.query({
      query: () => '/advanced-security/dashboard',
      providesTags: ['Security'],
    }),

    // ── Phase 24: API Platform ────────────────────────────────────────
    getWebhooks: builder.query({
      query: () => '/api-platform/webhooks',
      providesTags: ['Webhook'],
    }),
    createWebhook: builder.mutation({
      query: (data) => ({ url: '/api-platform/webhooks', method: 'POST', body: data }),
      invalidatesTags: ['Webhook'],
    }),
    updateWebhook: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/api-platform/webhooks/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Webhook'],
    }),
    deleteWebhook: builder.mutation({
      query: (id) => ({ url: `/api-platform/webhooks/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Webhook'],
    }),
    testWebhook: builder.mutation({
      query: (id) => ({ url: `/api-platform/webhooks/${id}/test`, method: 'POST' }),
      invalidatesTags: ['Webhook'],
    }),
    getWebhookLogs: builder.query({
      query: () => '/api-platform/webhook-logs',
      providesTags: ['Webhook'],
    }),
    getAPIUsageStats: builder.query({
      query: () => '/api-platform/usage',
      providesTags: ['Webhook'],
    }),

    // ── Phase 25: System Health ───────────────────────────────────────
    getHealthDashboard: builder.query({
      query: () => '/system-health',
      providesTags: ['SystemHealth'],
    }),
    getQueueMonitoring: builder.query({
      query: () => '/system-health/queues',
      providesTags: ['SystemHealth'],
    }),
    getCacheMonitoring: builder.query({
      query: () => '/system-health/cache',
      providesTags: ['SystemHealth'],
    }),
    getDatabaseMonitoring: builder.query({
      query: () => '/system-health/database',
      providesTags: ['SystemHealth'],
    }),
    getStorageMonitoring: builder.query({
      query: () => '/system-health/storage',
      providesTags: ['SystemHealth'],
    }),
    getErrorMonitoring: builder.query({
      query: () => '/system-health/errors',
      providesTags: ['SystemHealth'],
    }),

    // ── Phase 26: Backup ──────────────────────────────────────────────
    getBackups: builder.query({
      query: () => '/backup',
      providesTags: ['Backup'],
    }),
    createBackup: builder.mutation({
      query: (data) => ({ url: '/backup', method: 'POST', body: data }),
      invalidatesTags: ['Backup'],
    }),
    restoreBackup: builder.mutation({
      query: (id) => ({ url: `/backup/${id}/restore`, method: 'POST' }),
      invalidatesTags: ['Backup'],
    }),
    verifyBackup: builder.mutation({
      query: (id) => ({ url: `/backup/${id}/verify`, method: 'POST' }),
      invalidatesTags: ['Backup'],
    }),
    deleteBackup: builder.mutation({
      query: (id) => ({ url: `/backup/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Backup'],
    }),
    getBackupStats: builder.query({
      query: () => '/backup/stats',
      providesTags: ['Backup'],
    }),

    // ── Phase 27-28: White Label ──────────────────────────────────────
    getWhiteLabelConfig: builder.query({
      query: () => '/white-label/config',
      providesTags: ['WhiteLabel'],
    }),
    updateWhiteLabelConfig: builder.mutation({
      query: (data) => ({ url: '/white-label/config', method: 'PUT', body: data }),
      invalidatesTags: ['WhiteLabel'],
    }),
    getCrossSchoolAnalytics: builder.query({
      query: () => '/white-label/cross-school',
      providesTags: ['WhiteLabel'],
    }),
    getRegionalDashboard: builder.query({
      query: () => '/white-label/regional',
      providesTags: ['WhiteLabel'],
    }),
    getSchoolBenchmarks: builder.query({
      query: () => '/white-label/benchmarks',
      providesTags: ['WhiteLabel'],
    }),

    // ── Phase 29: Dynamic Config ──────────────────────────────────────
    getDynamicConfigs: builder.query({
      query: () => '/dynamic-config',
      providesTags: ['DynamicConfig'],
    }),
    getDynamicConfig: builder.query({
      query: (module) => `/dynamic-config/module/${module}`,
      providesTags: ['DynamicConfig'],
    }),
    upsertDynamicConfig: builder.mutation({
      query: ({ module, ...data }) => ({ url: `/dynamic-config/module/${module}`, method: 'PUT', body: data }),
      invalidatesTags: ['DynamicConfig'],
    }),
    deleteDynamicConfig: builder.mutation({
      query: (id) => ({ url: `/dynamic-config/${id}`, method: 'DELETE' }),
      invalidatesTags: ['DynamicConfig'],
    }),

    // ── Phase 30: Enterprise Features ─────────────────────────────────
    getTickets: builder.query({
      query: () => '/enterprise/tickets',
      providesTags: ['Ticket'],
    }),
    createTicket: builder.mutation({
      query: (data) => ({ url: '/enterprise/tickets', method: 'POST', body: data }),
      invalidatesTags: ['Ticket'],
    }),
    updateTicket: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/enterprise/tickets/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Ticket'],
    }),
    addTicketComment: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/enterprise/tickets/${id}/comments`, method: 'POST', body: data }),
      invalidatesTags: ['Ticket'],
    }),
    deleteTicket: builder.mutation({
      query: (id) => ({ url: `/enterprise/tickets/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Ticket'],
    }),
    getTasks: builder.query({
      query: () => '/enterprise/tasks',
      providesTags: ['Task'],
    }),
    createTask: builder.mutation({
      query: (data) => ({ url: '/enterprise/tasks', method: 'POST', body: data }),
      invalidatesTags: ['Task'],
    }),
    updateTask: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/enterprise/tasks/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Task'],
    }),
    deleteTask: builder.mutation({
      query: (id) => ({ url: `/enterprise/tasks/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Task'],
    }),
    getAnnouncementsAdmin: builder.query({
      query: () => '/enterprise/announcements',
      providesTags: ['Announcement'],
    }),
    createAnnouncementAdmin: builder.mutation({
      query: (data) => ({ url: '/enterprise/announcements', method: 'POST', body: data }),
      invalidatesTags: ['Announcement'],
    }),
    updateAnnouncementAdmin: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/enterprise/announcements/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Announcement'],
    }),
    deleteAnnouncementAdmin: builder.mutation({
      query: (id) => ({ url: `/enterprise/announcements/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Announcement'],
    }),
    getComplaints: builder.query({
      query: () => '/enterprise/complaints',
      providesTags: ['Complaint'],
    }),
    createComplaint: builder.mutation({
      query: (data) => ({ url: '/enterprise/complaints', method: 'POST', body: data }),
      invalidatesTags: ['Complaint'],
    }),
    updateComplaint: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/enterprise/complaints/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Complaint'],
    }),
    getSuggestions: builder.query({
      query: () => '/enterprise/suggestions',
      providesTags: ['Suggestion'],
    }),
    createSuggestion: builder.mutation({
      query: (data) => ({ url: '/enterprise/suggestions', method: 'POST', body: data }),
      invalidatesTags: ['Suggestion'],
    }),
    upvoteSuggestion: builder.mutation({
      query: (id) => ({ url: `/enterprise/suggestions/${id}/upvote`, method: 'POST' }),
      invalidatesTags: ['Suggestion'],
    }),
    updateSuggestion: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/enterprise/suggestions/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Suggestion'],
    }),
    getRiskRegisters: builder.query({
      query: () => '/enterprise/risks',
      providesTags: ['Risk'],
    }),
    createRisk: builder.mutation({
      query: (data) => ({ url: '/enterprise/risks', method: 'POST', body: data }),
      invalidatesTags: ['Risk'],
    }),
    updateRisk: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/enterprise/risks/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Risk'],
    }),
    deleteRisk: builder.mutation({
      query: (id) => ({ url: `/enterprise/risks/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Risk'],
    }),
    getKnowledgeBase: builder.query({
      query: () => '/enterprise/knowledge-base',
      providesTags: ['KnowledgeBase'],
    }),
    createKnowledgeBaseArticle: builder.mutation({
      query: (data) => ({ url: '/enterprise/knowledge-base', method: 'POST', body: data }),
      invalidatesTags: ['KnowledgeBase'],
    }),
    updateKnowledgeBaseArticle: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/enterprise/knowledge-base/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['KnowledgeBase'],
    }),
    deleteKnowledgeBaseArticle: builder.mutation({
      query: (id) => ({ url: `/enterprise/knowledge-base/${id}`, method: 'DELETE' }),
      invalidatesTags: ['KnowledgeBase'],
    }),
    getMeetings: builder.query({
      query: () => '/enterprise/meetings',
      providesTags: ['Meeting'],
    }),
    createMeeting: builder.mutation({
      query: (data) => ({ url: '/enterprise/meetings', method: 'POST', body: data }),
      invalidatesTags: ['Meeting'],
    }),
    updateMeeting: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/enterprise/meetings/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Meeting'],
    }),
    deleteMeeting: builder.mutation({
      query: (id) => ({ url: `/enterprise/meetings/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Meeting'],
    }),
    getIncidents: builder.query({
      query: () => '/enterprise/incidents',
      providesTags: ['Incident'],
    }),
    createIncident: builder.mutation({
      query: (data) => ({ url: '/enterprise/incidents', method: 'POST', body: data }),
      invalidatesTags: ['Incident'],
    }),
    updateIncident: builder.mutation({
      query: ({ id, ...data }) => ({ url: `/enterprise/incidents/${id}`, method: 'PUT', body: data }),
      invalidatesTags: ['Incident'],
    }),
    deleteIncident: builder.mutation({
      query: (id) => ({ url: `/enterprise/incidents/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Incident'],
    }),
  }),
});

export const {
  useGlobalSearchQuery,
  useLazyGlobalSearchQuery,
  // Auth
  useLoginMutation,
  useVerify2FAMutation,
  useResend2FAMutation,
  useStudentLoginMutation,
  useTeacherLoginMutation,
  useSchoolAdminLoginMutation,
  useParentLoginMutation,
  useUpdatePreferencesMutation,
  // School Profile
  useGetSchoolProfileStatusQuery,
  useCompleteSchoolProfileMutation,
  useUpdateOnboardingMutation,
  useGetSupportTicketsQuery,
  useCreateSupportTicketMutation,
  useRespondToTicketMutation,
  // Branches
  useGetBranchesQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useToggleBranchStatusMutation,
  useGetBranchStatsQuery,
  useGetSubscriptionQuery,
  useGetSubscriptionSummaryQuery,
  useGetAvailablePlansQuery,
  useRequestPlanUpgradeMutation,
  // Dashboard
  useGetStatsQuery,
  useGetTeacherStatsQuery,
  // Parents
  useGetParentsQuery,
  useCreateParentMutation,
  useUpdateParentMutation,
  useDeleteParentMutation,
  useResetParentPasswordMutation,
  useLinkParentToStudentsMutation,
  useGetParentChildrenQuery,
  useGetChildProfileQuery,
  useGetChildAttendanceQuery,
  useGetChildResultsQuery,
  useGetChildFeesQuery,
  useGetChildTimetableQuery,
  useGetParentAnnouncementsQuery,
  // Students
  useGetStudentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useTransferStudentMutation,
  useGetStudentProfileQuery,
  useLazyGetStudentProfileQuery,
  useGetStudentsInClassQuery,
  // Bulk Import
  useImportStudentsMutation,
  useImportExamResultsMutation,
  useGenerateBulkCredentialsMutation,
  useGenerateStudentLoginMutation,
  useResetStudentPasswordMutation,
  useDownloadCredentialsFileMutation,
  useDownloadStudentErrorsMutation,
  useDownloadExamErrorsMutation,
  // Teachers
  useGetTeachersQuery,
  useGetTeacherProfileQuery,
  useLazyGetTeacherProfileQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useResetTeacherPasswordMutation,
  useCheckTeacherIdQuery,
  useLazyCheckTeacherIdQuery,
  useImportTeachersMutation,
  useDownloadTeacherErrorsMutation,
  // Classes
  useGetClassesQuery,
  useGetClassByIdQuery,
  useCreateClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  // Subjects
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useCheckSubjectCodeQuery,
  useLazyCheckSubjectCodeQuery,
  useAssignSubjectToClassMutation,
  useUpdateClassSubjectAssignmentMutation,
  useRemoveClassSubjectAssignmentMutation,
  // Attendance
  useGetAttendanceQuery,
  useTakeAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  // Exams & Marks
  useGetExamsQuery,
  useCreateExamMutation,
  usePublishExamMutation,
  useGetExamMarksQuery,
  useUpdateExamMarksMutation,
  useGetMarksQuery,
  useSubmitMarksMutation,
  useBulkSubmitMarksMutation,
  useGetClassResultsQuery,
  useGetStudentResultsQuery,
  // Exam Sessions
  useCreateExamSessionMutation,
  useGetExamSessionsQuery,
  useGetExamSessionByIdQuery,
  useGetClassExamMarksQuery,
  useSubmitClassExamMarksMutation,
  useDeleteClassExamMarksMutation,
  // Monthly Payments
  useGetPaymentMonthsQuery,
  useCreatePaymentMonthMutation,
  useDeletePaymentMonthMutation,
  useGetMonthlyPaymentsQuery,
  useMarkPaymentPaidMutation,
  useMarkPaymentUnpaidMutation,
  useGenerateMonthlyPaymentsMutation,
  useGetPaymentStatsQuery,
  // Discounts & Library & Transport
  useGetDiscountsQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useGetDiscountAssignmentsQuery,
  useAssignDiscountMutation,
  useUpdateDiscountAssignmentMutation,
  useRemoveDiscountAssignmentMutation,
  useGetDiscountReportsQuery,
  useGetLibraryBooksQuery,
  useCreateLibraryBookMutation,
  useIssueLibraryBookMutation,
  useReturnLibraryBookMutation,
  useGetTransportRoutesQuery,
  useCreateTransportRouteMutation,
  useGetTransportVehiclesQuery,
  useCreateTransportVehicleMutation,
  // Schedule
  useGetSchedulesQuery,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
  useGetTeacherScheduleQuery,
  useGetStudentScheduleQuery,
  // School Settings
  useGetSchoolSettingsQuery,
  useUpdateSchoolSettingsMutation,
  // Communication Settings
  useGetCommunicationSettingsQuery,
  useLazyGetCommunicationSettingsQuery,
  useUpdateCommunicationSettingsMutation,
  useUpsertChannelProviderMutation,
  useDeleteChannelProviderMutation,
  // Communication Health
  useGetCommunicationHealthQuery,
  // Communication Messages
  useGetCommunicationMessagesQuery,
  useGetCommunicationMessageByIdQuery,
  useCreateCommunicationMessageMutation,
  useUpdateCommunicationMessageMutation,
  useDeleteCommunicationMessageMutation,
  useDuplicateCommunicationMessageMutation,
  usePreviewMessageMutation,
  useSendCommunicationMessageMutation,
  // Communication Usage
  useGetCommunicationUsageQuery,
  // Delivery Reports
  useGetDeliveryReportsQuery,
  // Invalid Contacts
  useGetInvalidContactsQuery,
  useResolveInvalidContactMutation,
  // Communication Preferences
  useGetUserCommunicationPreferencesQuery,
  useUpdateUserCommunicationPreferencesMutation,
  // Smart Recipient Filters
  useGetSmartRecipientFiltersQuery,
  // Global Search
  useGlobalCommunicationSearchQuery,
  // Announcements
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  // Teacher-specific
  useGetAssignedClassesQuery,
  useGetTaughtSubjectsQuery,
  // Public Content
  useGetPublicContentQuery,
  useUpdateHomeContentMutation,
  useUpdateAboutContentMutation,
  useGetEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useUploadImageMutation,
  // Exam Halls
  useGetExamHallsQuery,
  useGetExamHallByIdQuery,
  useCreateExamHallMutation,
  useUpdateExamHallMutation,
  useDeleteExamHallMutation,
  useAssignStudentToHallMutation,
  useRemoveStudentFromHallMutation,
  useGrantTemporaryClearanceMutation,
  useRevokeTemporaryClearanceMutation,
  // Academic Years
  useGetAcademicYearsQuery,
  useCreateAcademicYearMutation,
  useUpdateAcademicYearMutation,
  // Academic Terms
  useGetAcademicTermsQuery,
  useCreateAcademicTermMutation,
  useUpdateAcademicTermMutation,
  useDeleteAcademicTermMutation,
  useActivateAcademicTermMutation,
  useArchiveAcademicTermMutation,
  // Student Lifecycle
  useGetPromotionPreviewQuery,
  usePromoteStudentsMutation,
  useHoldStudentsBackMutation,
  useGraduateStudentsMutation,
  useTransferStudentLifecycleMutation,
  useGetPromotionHistoryQuery,
  // Misc
  useResetPasswordMutation,
  // Enterprise
  useGetEnterpriseActivityFeedQuery,
  useGetEnterpriseAuditLogsQuery,
  useGetEnterpriseFinanceAuditLogsQuery,
  useGetSaaSPlansQuery,
  useGetNotificationTemplatesQuery,
  useGetNotificationTemplateByIdQuery,
  useCreateNotificationTemplateMutation,
  useUpdateNotificationTemplateMutation,
  useDeleteNotificationTemplateMutation,
  useSeedNotificationTemplatesMutation,
  // Usage Analytics
  useGetUsageAnalyticsQuery,
  // Fee Structures
  useGetFeeStructuresQuery,
  useCreateFeeStructureMutation,
  useCalculateStudentFeeMutation,
  // Student Payments
  useGetMyMonthlyPaymentsQuery,
  usePayMonthlyFeeMutation,
  useGetStudentPaymentMethodsQuery,
  useInitiateStudentPaymentMutation,
  useGetStudentPaymentInstructionsMutation,
  useGetStudentTransactionHistoryQuery,
  // Payment Matrix
  useGetPaymentMatrixQuery,
  // Data Export
  useExportDataMutation,
  useGetDataRecoverySummaryQuery,
  useGetDeletedRecordsQuery,
  useRestoreRecordMutation,
  usePermanentDeleteRecordMutation,
  useGetEnterpriseFinalOverviewQuery,
  useGetEnterpriseTranscriptQuery,
  useGetEnterpriseStudentLifecycleQuery,
  useGetEnterpriseTeacherPerformanceQuery,
  useGetEnterpriseStudentRiskQuery,
  useGetEnterpriseFeeForecastQuery,
  useGetEnterpriseDefaultersQuery,
  useGetEnterpriseStorageQuery,
  useGetEnterpriseApiActivityQuery,
  useGetEnterpriseConsentsQuery,
  useCreateEnterpriseConsentMutation,
  useUpdateEnterpriseConsentMutation,
  useDeleteEnterpriseConsentMutation,
  useGetEnterpriseScheduledReportsQuery,
  useCreateEnterpriseScheduledReportMutation,
  useUpdateEnterpriseScheduledReportMutation,
  useDeleteEnterpriseScheduledReportMutation,
  useGetEnterpriseArchivesQuery,
  useCreateEnterpriseArchiveMutation,
  useRestoreEnterpriseArchiveMutation,
  // Features
  useGetEnabledFeaturesQuery,
  useLazyGetEnabledFeaturesQuery,
  useGetSchoolFeaturesQuery,
  useUpdateSchoolFeatureMutation,
  useResetSchoolFeaturesMutation,
  // Notifications
  useGetNotificationsQuery,
  useGetNotificationHistoryQuery,
  useGetNotificationRecipientsQuery,
  useCreateNotificationMutation,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  // Document Management
  useGetDocumentsQuery,
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
  useRestoreDocumentMutation,
  
  // Admissions
  useGetAdmissionsQuery,
  useUpdateAdmissionStatusMutation,
  
  // Certificates
  useGenerateCertificateMutation,
  
  // Calendar Events
  useGetCalendarEventsQuery,
  useCreateCalendarEventMutation,
  
  // Assets
  useGetAssetsQuery,
  useCreateAssetMutation,
  useUpdateAssetMutation,
  useDeleteAssetMutation,
  
  // MFA
  useSetupMFAMutation,
  useEnableMFAMutation,
  useDisableMFAMutation,
  useVerifyMFAMutation,
  useGetMFAStatusQuery,
  // QR Attendance - Enterprise
  useGenerateAttendanceQRMutation,
  useGetActiveQRQuery,
  useVerifyQRAttendanceMutation,
  useCheckOutQRMutation,
  useRevokeQRMutation,
  useGetQRAttendanceHistoryQuery,
  useGetQRDailyReportQuery,
  useGetQRMonthlyReportQuery,
  useGeneratePersonalQRMutation,
  useVerifyPersonalQRMutation,
  useBulkQRAttendanceMutation,
  useGetAttendanceMethodStatsQuery,
  useGetAttendanceByMethodQuery,
  useExportAttendanceQuery,
  useGetModuleAttendanceReportQuery,
  useValidateGeofenceMutation,
  useGetStaffAttendanceAnalyticsQuery,
  useGetTodayStaffAttendanceQuery,
  // Backward-Compat: Old Rules & Device Queries
  useGetAttendanceRulesQuery,
  useUpdateAttendanceRulesMutation,
  useAddHolidayMutation,
  useRemoveHolidayMutation,
  useGetAttendanceDevicesQuery,
  // Enterprise Biometric Attendance System
  useGetRegistrationsQuery,
  useGetRegistrationStatsQuery,
  useGetRegistrationQuery,
  useCreateOrUpdateRegistrationMutation,
  useUnregisterMethodMutation,
  useSearchStaffQuery,
  useGetAttendanceDashboardQuery,
  useGetLiveAttendanceFeedQuery,
  useGetAttendanceLogsQuery,
  useGetAttendanceReportQuery,
  useGetLateAnalyticsQuery,
  useGetPayrollAttendanceQuery,
  useGetBiometricRulesQuery,
  useCreateBiometricRuleMutation,
  useUpdateBiometricRuleMutation,
  useDeleteBiometricRuleMutation,
  useGetBiometricDevicesQuery,
  useGetBiometricDeviceHealthOverviewQuery,
  useGetBiometricDeviceLogsQuery,
  useGetBiometricDeviceQuery,
  useAddBiometricDeviceMutation,
  useUpdateBiometricDeviceMutation,
  useDeleteBiometricDeviceMutation,
  useConnectBiometricDeviceMutation,
  useDisconnectBiometricDeviceMutation,
  useGetBiometricDeviceHealthQuery,
  useSyncBiometricDeviceMutation,
  useStartAttendanceEngineMutation,
  useStopAttendanceEngineMutation,
  // Question Banks
  useCreateQuestionBankMutation,
  useGetQuestionBanksQuery,
  useGetQuestionBankByIdQuery,
  useUpdateQuestionBankMutation,
  useDeleteQuestionBankMutation,
  // Questions
  useCreateQuestionMutation,
  useGetQuestionsQuery,
  useGetQuestionByIdQuery,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useRestoreQuestionMutation,
  useArchiveQuestionMutation,
  useImportQuestionsMutation,
  // Exams
  useCreateOnlineExamMutation,
  useGetOnlineExamsQuery,
  useGetOnlineExamByIdQuery,
  useUpdateOnlineExamMutation,
  useDeleteOnlineExamMutation,
  useStartOnlineExamMutation,
  useSubmitOnlineExamMutation,
  // Exam Results
  useGetExamResultsQuery,
  useGetExamResultByIdQuery,
  useGradeExamMutation,
  // Exam Enterprise
  useBulkCreateQuestionsMutation,
  useExportQuestionsQuery,
  useCloneQuestionBankMutation,
  useSubmitBankForApprovalMutation,
  useApproveQuestionBankMutation,
  usePublishOnlineExamMutation,
  useGetExamAnalyticsQuery,
  useGetExamRankingsQuery,
  useCalculateStudentGPAQuery,
  useCalculateStudentCGPAQuery,
  usePublishExamResultsMutation,
  useBulkGradeExamsMutation,
  useGetMeritListQuery,
  // Library CRUD
  useUpdateLibraryBookMutation,
  useDeleteLibraryBookMutation,
  // Transport CRUD
  useUpdateTransportRouteMutation,
  useDeleteTransportRouteMutation,
  useUpdateTransportVehicleMutation,
  useDeleteTransportVehicleMutation,
  // Certificates CRUD
  useGetCertificatesQuery,
  useUpdateCertificateMutation,
  useDeleteCertificateMutation,
  // ID Card Management
  useGetIDCardsQuery,
  useVerifyIDCardQuery,
  useLazyVerifyIDCardQuery,
  useGenerateIDCardMutation,
  useUpdateIDCardStatusMutation,
  useMarkIDCardPrintedMutation,
  useDeleteIDCardMutation,
  useGetIDCardDesignsQuery,
  useCreateIDCardDesignMutation,
  useGetUsersForIDCardQuery,
  // Hostel Management
  useGetHostelsQuery,
  useCreateHostelMutation,
  useUpdateHostelMutation,
  useDeleteHostelMutation,
  useGetHostelRoomsQuery,
  useCreateHostelRoomMutation,
  useUpdateHostelRoomMutation,
  useDeleteHostelRoomMutation,

  // ── Payroll ───────────────────────────────────────────────────────────
  useGetPayrollsQuery,
  useGetPayrollByIdQuery,
  useCreatePayrollMutation,
  useUpdatePayrollMutation,
  useDeletePayrollMutation,
  useApprovePayrollMutation,
  useMarkPayrollPaidMutation,
  useRunBulkPayrollMutation,
  useGetPayrollStatsQuery,

  // ── Salary Structures ─────────────────────────────────────────────────
  useGetSalaryStructuresQuery,
  useGetSalaryStructureByIdQuery,
  useCreateSalaryStructureMutation,
  useUpdateSalaryStructureMutation,
  useDeleteSalaryStructureMutation,
  usePreviewSalaryCalculationMutation,

  // ── Leave Management ──────────────────────────────────────────────────
  useGetLeavesQuery,
  useGetMyLeavesQuery,
  useGetLeaveByIdQuery,
  useGetLeaveStatsQuery,
  useApplyLeaveMutation,
  useCreateLeaveForEmployeeMutation,
  useUpdateLeaveMutation,
  useApproveLeaveViaAdminMutation,
  useRejectLeaveMutation,
  useCancelLeaveMutation,
  useDeleteLeaveMutation,

  // ── Expenses ─────────────────────────────────────────────────────────
  useGetExpensesQuery,
  useGetExpenseStatsQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,

  // ── Report Cards ──────────────────────────────────────────────────────
  useGenerateReportCardMutation,
  useGetReportCardsQuery,

  // ── Cafeteria ─────────────────────────────────────────────────────────
  useGetCafeteriaItemsQuery,
  useCreateCafeteriaItemMutation,
  useUpdateCafeteriaItemMutation,
  useDeleteCafeteriaItemMutation,
  useGetCafeteriaOrdersQuery,
  useCreateCafeteriaOrderMutation,
  useUpdateCafeteriaOrderMutation,
  useGetCafeteriaStatsQuery,

  // ── Clubs ─────────────────────────────────────────────────────────────
  useGetClubsQuery,
  useGetClubByIdQuery,
  useCreateClubMutation,
  useUpdateClubMutation,
  useDeleteClubMutation,
  useEnrollClubMemberMutation,
  useRemoveClubMemberMutation,

  // ── Sports ────────────────────────────────────────────────────────────
  useGetSportsQuery,
  useCreateSportMutation,
  useUpdateSportMutation,
  useDeleteSportMutation,
  useGetSportTeamsQuery,
  useCreateSportTeamMutation,
  useEnrollSportPlayerMutation,
  useRemoveSportPlayerMutation,

  // ── Competitions ──────────────────────────────────────────────────────
  useGetCompetitionsQuery,
  useCreateCompetitionMutation,
  useUpdateCompetitionMutation,
  useDeleteCompetitionMutation,
  useEnrollCompetitionParticipantMutation,
  useRemoveCompetitionParticipantMutation,

  // ── Lost and Found ────────────────────────────────────────────────────
  useGetLostFoundItemsQuery,
  useCreateLostFoundItemMutation,
  useUpdateLostFoundItemMutation,
  useDeleteLostFoundItemMutation,
  useClaimLostFoundItemMutation,

  // ── Career Guidance ───────────────────────────────────────────────────
  useGetCareerGuidanceQuery,
  useCreateCareerGuidanceMutation,
  useUpdateCareerGuidanceMutation,
  useDeleteCareerGuidanceMutation,

  // ── Internships ───────────────────────────────────────────────────────
  useGetInternshipsQuery,
  useCreateInternshipMutation,
  useUpdateInternshipMutation,
  useDeleteInternshipMutation,
  useApplyForInternshipMutation,

  // ── Scholarships ──────────────────────────────────────────────────────
  useGetScholarshipsQuery,
  useCreateScholarshipMutation,
  useUpdateScholarshipMutation,
  useDeleteScholarshipMutation,
  useApplyForScholarshipMutation,
  useReviewScholarshipApplicationMutation,
  useGetScholarshipApplicationsQuery,

  // ── Graduations ───────────────────────────────────────────────────────
  useGetGraduationsQuery,
  useCreateGraduationMutation,
  useUpdateGraduationMutation,
  useDeleteGraduationMutation,

  // ── Event Ticketing ───────────────────────────────────────────────────
  useGetEventTicketsQuery,
  useCreateEventTicketMutation,
  useUpdateEventTicketMutation,
  useDeleteEventTicketMutation,
  useIssueEventTicketMutation,
  useVerifyEventTicketMutation,

  // ── Counseling ────────────────────────────────────────────────────────
  useGetCounselingSessionsQuery,
  useCreateCounselingSessionMutation,
  useUpdateCounselingSessionMutation,
  useDeleteCounselingSessionMutation,

  // ── Incidents / Anti-Bullying ─────────────────────────────────────────
  useGetIncidentReportsQuery,
  useCreateIncidentReportMutation,
  useUpdateIncidentReportMutation,
  useDeleteIncidentReportMutation,
  useSubmitAnonymousIncidentMutation,

  // ── Donors / Sponsorships ─────────────────────────────────────────────
  useGetDonorsQuery,
  useCreateDonorMutation,
  useUpdateDonorMutation,
  useDeleteDonorMutation,
  useGetSponsorshipsQuery,
  useCreateSponsorshipMutation,

  // ── Uniforms ──────────────────────────────────────────────────────────
  useGetUniformItemsQuery,
  useCreateUniformItemMutation,
  useUpdateUniformItemMutation,
  useDeleteUniformItemMutation,
  useGetUniformOrdersQuery,
  useCreateUniformOrderMutation,
  useUpdateUniformOrderMutation,

  // ── School Store / POS ────────────────────────────────────────────────
  useGetStoreProductsQuery,
  useCreateStoreProductMutation,
  useUpdateStoreProductMutation,
  useDeleteStoreProductMutation,
  useGetStoreOrdersQuery,
  useCreateStoreOrderMutation,
  useUpdateStoreOrderMutation,
  useGetStoreSalesReportQuery,

  // ── Visitors (with QR) ────────────────────────────────────────────────
  useGetVisitorsQuery,
  useCreateVisitorMutation,
  useUpdateVisitorMutation,
  useDeleteVisitorMutation,
  useGenerateVisitorQRPassMutation,
  useVerifyVisitorQRPassMutation,

  // ── Departments & Designations ──────────────────────────────────────
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetDesignationsQuery,
  useCreateDesignationMutation,
  useUpdateDesignationMutation,
  useDeleteDesignationMutation,

  // ── Homework, Lesson Plans, Curriculum ──────────────────────────────
  useGetHomeworksQuery,
  useCreateHomeworkMutation,
  useUpdateHomeworkMutation,
  useDeleteHomeworkMutation,
  useGetLessonPlansQuery,
  useCreateLessonPlanMutation,
  useUpdateLessonPlanMutation,
  useDeleteLessonPlanMutation,
  useGetCurriculumsQuery,
  useCreateCurriculumMutation,
  useUpdateCurriculumMutation,
  useDeleteCurriculumMutation,

  // ── Accounting ──────────────────────────────────────────────────────
  useGetAccountsQuery,
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

  // ── HR (Loans, Reviews, Contracts, Recruitment) ─────────────────────
  useGetLoansQuery,
  useCreateLoanMutation,
  useApproveLoanMutation,
  useRejectLoanMutation,
  useGetReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useGetContractsQuery,
  useCreateContractMutation,
  useUpdateContractMutation,
  useGetJobPostingsQuery,
  useCreateJobPostingMutation,
  useUpdateJobPostingMutation,
  useDeleteJobPostingMutation,

  // ── Transport Extensions ────────────────────────────────────────────
  useGetFuelLogsQuery,
  useCreateFuelLogMutation,
  useGetVehicleMaintenanceQuery,
  useCreateVehicleMaintenanceMutation,
  useUpdateVehicleMaintenanceMutation,
  useGetTransportAllocationsQuery,
  useCreateTransportAllocationMutation,
  useUpdateTransportAllocationMutation,
  useDeleteTransportAllocationMutation,

  // ── Hostel Extensions ───────────────────────────────────────────────
  useGetHostelAttendanceQuery,
  useMarkHostelAttendanceMutation,
  useGetBedAllocationsQuery,
  useCreateBedAllocationMutation,
  useUpdateBedAllocationMutation,
  useDeleteBedAllocationMutation,
  useGetHostelOccupancyQuery,

  // ── Inventory ───────────────────────────────────────────────────────
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  useDeleteSupplierMutation,
  useGetInventoryItemsQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
  useGetStockMovementsQuery,
  useCreateStockMovementMutation,
  useGetInventoryStatsQuery,

  // ── Security Admin ──────────────────────────────────────────────────
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
  useDeleteApiKeyMutation,
  useGetLoginHistoryQuery,
  useGetLoginStatsQuery,
  useGetIpRestrictionsQuery,
  useCreateIpRestrictionMutation,
  useUpdateIpRestrictionMutation,
  useDeleteIpRestrictionMutation,
  useGetPasswordPolicyQuery,
  useUpdatePasswordPolicyMutation,

  // ── Phase 18: Workflow Automation ──────────────────────────────────
  useGetWorkflowsQuery,
  useCreateWorkflowMutation,
  useUpdateWorkflowMutation,
  useDeleteWorkflowMutation,
  useGetWorkflowInstancesQuery,
  useCreateWorkflowInstanceMutation,
  useApproveWorkflowStepMutation,
  useRejectWorkflowStepMutation,

  // ── Phase 19: Automation Engine ────────────────────────────────────
  useGetScheduledJobsQuery,
  useCreateScheduledJobMutation,
  useUpdateScheduledJobMutation,
  useDeleteScheduledJobMutation,
  useToggleScheduledJobMutation,
  useRunScheduledJobNowMutation,
  useGetAutomationLogsQuery,
  useGetAutomationStatsQuery,

  // ── Phase 20: AI ──────────────────────────────────────────────────
  useGetAIPredictionsQuery,
  useGeneratePredictionsMutation,
  useGetAIInsightsQuery,
  useGetAIChatSessionsQuery,
  useGetAIChatMessagesQuery,
  useSendAIChatMessageMutation,
  useGetAIRecommendationsQuery,

  // ── Phase 21: BI ──────────────────────────────────────────────────
  useGetBIReportsQuery,
  useGenerateBIReportMutation,
  useDeleteBIReportMutation,
  useGetExecutiveDashboardQuery,
  useGetKPIDashboardQuery,
  useGetFinancialAnalyticsQuery,
  useGetAcademicAnalyticsQuery,
  useGetComparativeReportsQuery,

  // ── Phase 22: Document Workflow ────────────────────────────────────
  useGetDocumentStatsQuery,
  useApproveDocumentMutation,
  useRejectDocumentMutation,
  useAddDocumentVersionMutation,

  // ── Phase 23: Advanced Security ───────────────────────────────────
  useGetActiveSessionsQuery,
  useRevokeSessionMutation,
  useRevokeAllSessionsMutation,
  useGetAPITokensQuery,
  useCreateAPITokenMutation,
  useRevokeAPITokenMutation,
  useDeleteAPITokenMutation,
  useGetSecurityDashboardQuery,

  // ── Phase 24: API Platform ────────────────────────────────────────
  useGetWebhooksQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  useTestWebhookMutation,
  useGetWebhookLogsQuery,
  useGetAPIUsageStatsQuery,

  // ── Phase 25: System Health ───────────────────────────────────────
  useGetHealthDashboardQuery,
  useGetQueueMonitoringQuery,
  useGetCacheMonitoringQuery,
  useGetDatabaseMonitoringQuery,
  useGetStorageMonitoringQuery,
  useGetErrorMonitoringQuery,

  // ── Phase 26: Backup ──────────────────────────────────────────────
  useGetBackupsQuery,
  useCreateBackupMutation,
  useRestoreBackupMutation,
  useVerifyBackupMutation,
  useDeleteBackupMutation,
  useGetBackupStatsQuery,

  // ── Phase 27-28: White Label ──────────────────────────────────────
  useGetWhiteLabelConfigQuery,
  useUpdateWhiteLabelConfigMutation,
  useGetCrossSchoolAnalyticsQuery,
  useGetRegionalDashboardQuery,
  useGetSchoolBenchmarksQuery,

  // ── Phase 29: Dynamic Config ──────────────────────────────────────
  useGetDynamicConfigsQuery,
  useGetDynamicConfigQuery,
  useUpsertDynamicConfigMutation,
  useDeleteDynamicConfigMutation,

  // ── Phase 30: Enterprise Features ─────────────────────────────────
  useGetTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useAddTicketCommentMutation,
  useDeleteTicketMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetAnnouncementsAdminQuery,
  useCreateAnnouncementAdminMutation,
  useUpdateAnnouncementAdminMutation,
  useDeleteAnnouncementAdminMutation,
  useGetComplaintsQuery,
  useCreateComplaintMutation,
  useUpdateComplaintMutation,
  useGetSuggestionsQuery,
  useCreateSuggestionMutation,
  useUpvoteSuggestionMutation,
  useUpdateSuggestionMutation,
  useGetRiskRegistersQuery,
  useCreateRiskMutation,
  useUpdateRiskMutation,
  useDeleteRiskMutation,
  useGetKnowledgeBaseQuery,
  useCreateKnowledgeBaseArticleMutation,
  useUpdateKnowledgeBaseArticleMutation,
  useDeleteKnowledgeBaseArticleMutation,
  useGetMeetingsQuery,
  useCreateMeetingMutation,
  useUpdateMeetingMutation,
  useDeleteMeetingMutation,
  useGetIncidentsQuery,
  useCreateIncidentMutation,
  useUpdateIncidentMutation,
  useDeleteIncidentMutation,
} = adminApiSlice;
