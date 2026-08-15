import { apiSlice } from './apiSlice';
import { getBuildTenantId } from '../tenant/config';

export const mobileApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        body: { ...data, tenantId: getBuildTenantId() },
      }),
    }),
    studentLogin: builder.mutation({
      query: (data) => ({
        url: '/auth/student-login',
        method: 'POST',
        body: { ...data, tenantId: getBuildTenantId() },
      }),
    }),
    teacherLogin: builder.mutation({
      query: (data) => ({
        url: '/auth/teacher-login',
        method: 'POST',
        body: { ...data, tenantId: getBuildTenantId() },
      }),
    }),
    adminLogin: builder.mutation({
      query: (data) => ({
        url: '/auth/admin-login',
        method: 'POST',
        body: { ...data, tenantId: getBuildTenantId() },
      }),
    }),
    parentLogin: builder.mutation({
      query: (data) => ({
        url: '/auth/parent-login',
        method: 'POST',
        body: { ...data, tenantId: getBuildTenantId() },
      }),
    }),
    branchLogin: builder.mutation({
      query: (data) => ({
        url: '/auth/branch-login',
        method: 'POST',
        body: { ...data, tenantId: getBuildTenantId() },
      }),
    }),
    getStudentProfile: builder.query({
      query: () => '/students/profile',
      providesTags: ['User'],
    }),
    // Same endpoint — backend returns role-aware data (class for students, subjects for teachers)
    getStudentProfileById: builder.query({
      query: (customId) => `/teachers/student-profile/${customId || 'missing-id'}`,
      providesTags: ['User'],
    }),
    getTeacherProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: ['User'],
    }),
    getParentProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: ['User'],
    }),
    // Student endpoints
    getStudentClass: builder.query({
      query: () => '/students/class-subjects',
      providesTags: ['Class', 'Subject'],
    }),
    getStudentAttendance: builder.query({
      query: () => '/students/attendance',
      providesTags: ['Attendance'],
    }),
    getStudentResults: builder.query({
      query: () => '/students/exams',
      providesTags: ['Mark'],
    }),
    getStudentDashboardStats: builder.query({
      query: () => '/students/dashboard-stats',
      providesTags: ['User', 'Class', 'Attendance', 'Mark', 'Payment'],
    }),
    getStudentSchedule: builder.query({
      query: () => '/students/schedule',
      providesTags: ['Schedule'],
    }),
    getTeacherSchedule: builder.query({
      query: () => '/teachers/schedule',
      providesTags: ['Schedule'],
    }),
    // Parent endpoints
    getParentChildren: builder.query({
      query: () => '/parents/children',
      providesTags: ['User'],
    }),
    getChildProfile: builder.query({
      query: (studentId) => `/parents/children/${studentId}/profile`,
      providesTags: ['User'],
    }),
    getChildAttendance: builder.query({
      query: (studentId) => `/parents/children/${studentId}/attendance`,
      providesTags: ['Attendance'],
    }),
    getChildResults: builder.query({
      query: (studentId) => `/parents/children/${studentId}/results`,
      providesTags: ['Mark'],
    }),
    getChildFees: builder.query({
      query: (studentId) => `/parents/children/${studentId}/fees`,
      providesTags: ['Payment'],
    }),
    getChildTimetable: builder.query({
      query: (studentId) => `/parents/children/${studentId}/timetable`,
      providesTags: ['Schedule'],
    }),
    getParentAnnouncements: builder.query({
      query: () => '/parents/announcements',
      providesTags: ['Notification'],
    }),
    // ── Monthly Payment (new) ────────────────────────────────────────
    /**
     * GET /students/payments
     * Returns { payments: MonthlyPayment[], summary: { paidTotal, unpaidTotal, totalDue, paidCount, unpaidCount } }
     */
    getMyMonthlyPayments: builder.query({
      query: () => '/students/payments',
      providesTags: ['Payment'],
    }),
    /**
     * PUT /students/my-payments/:id/pay
     * Body: { studentId: string }
     */
    payMonthlyFee: builder.mutation({
      query: ({ id, studentId }) => ({
        url: `/students/my-payments/${id || 'missing-id'}/pay`,
        method: 'PUT',
        body: { studentId },
      }),
      invalidatesTags: ['Payment'],
    }),
    /**
     * GET /students/payment-methods
     * Returns { providers: [ { id, name, description } ] }
     */
    getStudentPaymentMethods: builder.query({
      query: () => '/students/payment-methods',
      providesTags: ['Payment'],
    }),
    /**
     * POST /students/payments/initiate
     * Body: { monthlyPaymentId, providerId, studentId }
     */
    initiateStudentPayment: builder.mutation({
      query: (data) => ({
        url: '/students/payments/initiate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment', 'Transaction'],
    }),
    /**
     * GET /students/payments/verify/:transactionId
     */
    verifyStudentPayment: builder.query({
      query: (transactionId) => `/students/payments/verify/${transactionId}`,
    }),
    /**
     * GET /students/transactions
     */
    getStudentTransactionHistory: builder.query({
      query: () => '/students/transactions',
      providesTags: ['Transaction'],
    }),
    /**
     * POST /students/payments/instructions/:providerId
     * Body: { amount, studentId }
     */
    getStudentPaymentInstructions: builder.mutation({
      query: ({ providerId, ...data }) => ({
        url: `/students/payments/instructions/${providerId}`,
        method: 'POST',
        body: data,
      }),
    }),
    // ── Parent Payment Hooks ────────────────────────────────────────────────
    getParentPaymentMethods: builder.query({
      query: (studentId) => `/parents/children/${studentId}/payment-methods`,
      providesTags: ['Payment'],
    }),
    initiateParentPayment: builder.mutation({
      query: ({ studentId, ...data }) => ({
        url: `/parents/children/${studentId}/payments/initiate`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment', 'Transaction'],
    }),
    verifyParentPayment: builder.query({
      query: ({ studentId, transactionId }) => `/parents/children/${studentId}/payments/verify/${transactionId}`,
    }),
    getParentTransactionHistory: builder.query({
      query: (studentId) => `/parents/children/${studentId}/transactions`,
      providesTags: ['Transaction'],
    }),
    getParentPaymentInstructions: builder.mutation({
      query: ({ studentId, providerId, ...data }) => ({
        url: `/parents/children/${studentId}/payments/instructions/${providerId}`,
        method: 'POST',
        body: data,
      }),
    }),
    payChildMonthlyFee: builder.mutation({
      query: ({ studentId, id, studentId: studentIdParam }) => ({
        url: `/parents/children/${studentId}/my-payments/${id}/pay`,
        method: 'PUT',
        body: { studentId: studentIdParam },
      }),
      invalidatesTags: ['Payment'],
    }),
    // ────────────────────────────────────────────────────────────────

    // Legacy (kept for backward compat)
    getFeesDue: builder.query({
      query: () => '/students/fees-due',
      providesTags: ['Payment'],
    }),
    payFees: builder.mutation({
      query: (data) => ({
        url: '/students/pay-fees',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment'],
    }),
    // Public Endpoints (school-specific content)
    getSchools: builder.query({
      query: () => '/public/schools',
    }),
    getPublicBranches: builder.query({
      query: (schoolId) => `/public/branches/${schoolId || 'missing-id'}`,
    }),
    getPublicContent: builder.query({
      query: (schoolId) => `/public/content/${schoolId || 'missing-id'}`,
    }),
    getPublicEvents: builder.query({
      query: (schoolId) => `/public/events/${schoolId || 'missing-id'}`,
    }),
    getPaymentHistory: builder.query({
      query: () => '/students/payment-history',
      providesTags: ['Payment'],
    }),

    // Teacher endpoints
    getAssignedClasses: builder.query({
      query: () => '/teachers/classes',
      providesTags: ['Class'],
    }),
    getTaughtSubjects: builder.query({
      query: () => '/teachers/taught-subjects',
      providesTags: ['Subject'],
    }),
    takeAttendance: builder.mutation({
      query: (data) => ({
        url: '/teachers/attendance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Attendance'],
    }),
    submitMarks: builder.mutation({
      query: (data) => ({
        url: '/teachers/marks',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Mark'],
    }),
    getStudentsInClass: builder.query({
      query: (classId) => `/teachers/class-students/${classId || 'missing-id'}`,
      providesTags: ['User'],
    }),
    getClassAttendance: builder.query({
      query: ({ classId, date, subjectId }) => {
        let url = `/teachers/class-attendance/${classId || 'missing-id'}/${date || 'missing-date'}`;
        if (subjectId) url += `/${subjectId}`;
        return url;
      },
      providesTags: ['Attendance'],
    }),
    getClassSubjectMarks: builder.query({
      query: ({ classId, subjectId }) => `/teachers/class-subject-marks/${classId || 'missing-id'}/${subjectId || 'missing-id'}`,
      providesTags: ['Mark'],
    }),
    getTeacherDashboardStats: builder.query({
      query: () => '/teachers/dashboard-stats',
      providesTags: ['User', 'Class', 'Subject'],
    }),
    getExams: builder.query({
      query: () => '/teachers/exams',
      providesTags: ['Exam'],
    }),
    markExamAsPresent: builder.mutation({
      query: (examId) => ({
        url: `/teachers/exams/${examId || 'missing-id'}/present`,
        method: 'PUT',
      }),
      invalidatesTags: ['Exam'],
    }),
    // ── Exam Hall ─────────────────────────────────────────────────────
    getExamHalls: builder.query({
      query: (role) => {
        const prefix = (role === 'teacher') ? '/teachers' : '/students';
        return `${prefix}/exam-halls`;
      },
      providesTags: ['ExamHall'],
    }),
    getExamHallById: builder.query({
      query: ({ id, role }) => {
        const prefix = (role === 'teacher') ? '/teachers' : '/students';
        return `${prefix}/exam-halls/${id || 'missing-id'}`;
      },
      providesTags: ['ExamHall'],
    }),
    grantTemporaryClearance: builder.mutation({
      query: (data) => ({
        url: '/teachers/exam-halls/temporary-clearance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ExamHall', 'User'],
    }),
    revokeTemporaryClearance: builder.mutation({
      query: (data) => ({
        url: '/teachers/exam-halls/revoke-clearance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ExamHall', 'User'],
    }),
    // ── WaafiPay Specific Hooks ──────────────────────────────────────────────
    initiateWaafiPayPurchase: builder.mutation({
      query: (data) => ({
        url: '/payments/waafipay/purchase',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment', 'Transaction'],
    }),
    getWaafiPaySettings: builder.query({
      query: () => '/payments/waafipay/settings',
      providesTags: ['Payment'],
    }),
    getSchoolFeatures: builder.query({
      query: () => '/school-admin/enabled-features',
      providesTags: ['SchoolFeatures'],
    }),
  }),
});

export const {
  useLoginMutation,
  useStudentLoginMutation,
  useTeacherLoginMutation,
  useAdminLoginMutation,
  useParentLoginMutation,
  useBranchLoginMutation,
  useGetStudentProfileQuery,
  useGetStudentProfileByIdQuery,
  useGetTeacherProfileQuery,
  useGetParentProfileQuery,
  useGetStudentClassQuery,
  useGetStudentAttendanceQuery,
  useGetStudentResultsQuery,
  useGetStudentDashboardStatsQuery,
  useGetStudentScheduleQuery,
  useGetTeacherScheduleQuery,
  // Parent hooks
  useGetParentChildrenQuery,
  useGetChildProfileQuery,
  useGetChildAttendanceQuery,
  useGetChildResultsQuery,
  useGetChildFeesQuery,
  useGetChildTimetableQuery,
  useGetParentAnnouncementsQuery,
  // New monthly payment hooks
  useGetMyMonthlyPaymentsQuery,
  usePayMonthlyFeeMutation,
  useGetStudentPaymentMethodsQuery,
  useInitiateStudentPaymentMutation,
  useVerifyStudentPaymentQuery,
  useGetStudentTransactionHistoryQuery,
  useGetStudentPaymentInstructionsMutation,
  // Parent payment hooks
  useGetParentPaymentMethodsQuery,
  useInitiateParentPaymentMutation,
  useVerifyParentPaymentQuery,
  useGetParentTransactionHistoryQuery,
  useGetParentPaymentInstructionsMutation,
  usePayChildMonthlyFeeMutation,
  // Exam Hall
  useGetExamHallsQuery,
  useGetExamHallByIdQuery,
  useGrantTemporaryClearanceMutation,
  useRevokeTemporaryClearanceMutation,
  // Legacy
  useGetFeesDueQuery,
  usePayFeesMutation,
  useGetPublicBranchesQuery,
  useGetPublicContentQuery,
  useGetPublicEventsQuery,
  useGetPaymentHistoryQuery,
  useGetAssignedClassesQuery,
  useGetTaughtSubjectsQuery,
  useGetSchoolsQuery,
  useTakeAttendanceMutation,
  useGetClassAttendanceQuery,
  useSubmitMarksMutation,
  useGetStudentsInClassQuery,
  useGetClassSubjectMarksQuery,
  useGetTeacherDashboardStatsQuery,
  useGetExamsQuery,
  useMarkExamAsPresentMutation,
  // WaafiPay Hooks
  useInitiateWaafiPayPurchaseMutation,
  useGetWaafiPaySettingsQuery,
  // School Features
  useGetSchoolFeaturesQuery,
} = mobileApiSlice;
