import { baseApi } from './baseApi'

export const examsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ========== EXAMS ==========
    // Get exams list
    getExams: builder.query({
      query: (params) => ({
        url: '/admin/exams',
        params,
      }),
      providesTags: ['Exams'],
    }),

    // Get single exam
    getExam: builder.query({
      query: (id) => `/admin/exams/${id}`,
      providesTags: (result, error, id) => [{ type: 'Exams', id }],
    }),

    // Create exam
    createExam: builder.mutation({
      query: (data) => ({
        url: '/admin/exams',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Exams'],
    }),

    // Update exam
    updateExam: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/exams/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Exams',
        { type: 'Exams', id },
      ],
    }),

    // Delete exam
    deleteExam: builder.mutation({
      query: (id) => ({
        url: `/admin/exams/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Exams'],
    }),

    // Publish exam
    publishExam: builder.mutation({
      query: (id) => ({
        url: `/admin/exams/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'Exams',
        { type: 'Exams', id },
      ],
    }),

    // Unpublish exam
    unpublishExam: builder.mutation({
      query: (id) => ({
        url: `/admin/exams/${id}/unpublish`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'Exams',
        { type: 'Exams', id },
      ],
    }),

    // ========== ONLINE EXAMS ==========
    getOnlineExams: builder.query({
      query: (params) => ({
        url: '/admin/online-exams',
        params,
      }),
      providesTags: ['OnlineExams'],
    }),

    getOnlineExam: builder.query({
      query: (id) => `/admin/online-exams/${id}`,
      providesTags: (result, error, id) => [{ type: 'OnlineExams', id }],
    }),

    createOnlineExam: builder.mutation({
      query: (data) => ({
        url: '/admin/online-exams',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['OnlineExams'],
    }),

    updateOnlineExam: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/online-exams/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'OnlineExams',
        { type: 'OnlineExams', id },
      ],
    }),

    deleteOnlineExam: builder.mutation({
      query: (id) => ({
        url: `/admin/online-exams/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OnlineExams'],
    }),

    publishOnlineExam: builder.mutation({
      query: (id) => ({
        url: `/admin/online-exams/${id}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'OnlineExams',
        { type: 'OnlineExams', id },
      ],
    }),

    startOnlineExam: builder.mutation({
      query: (id) => ({
        url: `/admin/online-exams/${id}/start`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'OnlineExams',
        { type: 'OnlineExams', id },
      ],
    }),

    getExamAnalytics: builder.query({
      query: (id) => `/admin/online-exams/${id}/analytics`,
      providesTags: (result, error, id) => [{ type: 'OnlineExams', id }],
    }),

    // ========== QUESTION BANKS ==========
    getQuestionBanks: builder.query({
      query: (params) => ({
        url: '/admin/question-banks',
        params,
      }),
      providesTags: ['QuestionBanks'],
    }),

    getQuestionBank: builder.query({
      query: (id) => `/admin/question-banks/${id}`,
      providesTags: (result, error, id) => [{ type: 'QuestionBanks', id }],
    }),

    createQuestionBank: builder.mutation({
      query: (data) => ({
        url: '/admin/question-banks',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['QuestionBanks'],
    }),

    updateQuestionBank: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/question-banks/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'QuestionBanks',
        { type: 'QuestionBanks', id },
      ],
    }),

    deleteQuestionBank: builder.mutation({
      query: (id) => ({
        url: `/admin/question-banks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['QuestionBanks'],
    }),

    cloneQuestionBank: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/question-banks/${id}/clone`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['QuestionBanks'],
    }),

    submitBankForApproval: builder.mutation({
      query: (id) => ({
        url: `/admin/question-banks/${id}/submit-approval`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'QuestionBanks',
        { type: 'QuestionBanks', id },
      ],
    }),

    approveQuestionBank: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/question-banks/${id}/approve`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        'QuestionBanks',
        { type: 'QuestionBanks', id },
      ],
    }),

    // ========== QUESTIONS ==========
    getQuestions: builder.query({
      query: (params) => ({
        url: '/admin/questions',
        params,
      }),
      providesTags: ['Questions'],
    }),

    getQuestion: builder.query({
      query: (id) => `/admin/questions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Questions', id }],
    }),

    createQuestion: builder.mutation({
      query: (data) => ({
        url: '/admin/questions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Questions'],
    }),

    updateQuestion: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/questions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Questions',
        { type: 'Questions', id },
      ],
    }),

    deleteQuestion: builder.mutation({
      query: (id) => ({
        url: `/admin/questions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Questions'],
    }),

    bulkCreateQuestions: builder.mutation({
      query: (data) => ({
        url: '/admin/questions/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Questions'],
    }),

    exportQuestions: builder.query({
      query: (params) => ({
        url: '/admin/questions/export',
        params,
      }),
      providesTags: ['Questions'],
    }),

    importQuestions: builder.mutation({
      query: (data) => ({
        url: '/admin/questions/import',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Questions'],
    }),

    archiveQuestion: builder.mutation({
      query: (id) => ({
        url: `/admin/questions/${id}/archive`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'Questions',
        { type: 'Questions', id },
      ],
    }),

    restoreQuestion: builder.mutation({
      query: (id) => ({
        url: `/admin/questions/${id}/restore`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'Questions',
        { type: 'Questions', id },
      ],
    }),

    // ========== EXAM RESULTS ==========
    importExamResults: builder.mutation({
      query: (formData) => ({
        url: '/admin/exams/import',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['ExamResults'],
    }),

    getExamResults: builder.query({
      query: (params) => ({
        url: '/admin/exam-results',
        params,
      }),
      providesTags: ['ExamResults'],
    }),

    getExamResult: builder.query({
      query: (id) => `/admin/exam-results/${id}`,
      providesTags: (result, error, id) => [{ type: 'ExamResults', id }],
    }),

    gradeExam: builder.mutation({
      query: (data) => ({
        url: '/admin/exam-results/grade',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ExamResults'],
    }),

    bulkGradeExams: builder.mutation({
      query: (data) => ({
        url: '/admin/exam-results/bulk-grade',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ExamResults'],
    }),

    publishExamResults: builder.mutation({
      query: (data) => ({
        url: '/admin/exam-results/publish',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ExamResults'],
    }),

    getExamRankings: builder.query({
      query: (params) => ({
        url: '/admin/exam-results/rankings',
        params,
      }),
      providesTags: ['ExamResults'],
    }),

    calculateStudentGPA: builder.query({
      query: (params) => ({
        url: '/admin/exam-results/gpa',
        params,
      }),
      providesTags: ['ExamResults'],
    }),

    calculateStudentCGPA: builder.query({
      query: (params) => ({
        url: '/admin/exam-results/cgpa',
        params,
      }),
      providesTags: ['ExamResults'],
    }),

    getMeritList: builder.query({
      query: (params) => ({
        url: '/admin/exam-results/merit-list',
        params,
      }),
      providesTags: ['ExamResults'],
    }),

    // ========== EXAM HALLS ==========
    getExamHalls: builder.query({
      query: (params) => ({
        url: '/admin/exam-halls',
        params,
      }),
      transformResponse: (response) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.halls)) return response.halls;
        return response;
      },
      providesTags: ['ExamHalls'],
    }),

    getExamHall: builder.query({
      query: (id) => `/admin/exam-halls/${id}`,
      providesTags: (result, error, id) => [{ type: 'ExamHalls', id }],
    }),

    createExamHall: builder.mutation({
      query: (data) => ({
        url: '/admin/exam-halls',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ExamHalls'],
    }),

    updateExamHall: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/exam-halls/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'ExamHalls',
        { type: 'ExamHalls', id },
      ],
    }),

    deleteExamHall: builder.mutation({
      query: (id) => ({
        url: `/admin/exam-halls/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ExamHalls'],
    }),

    assignStudentToHall: builder.mutation({
      query: (data) => ({
        url: '/admin/exam-halls/assign-student',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ExamHalls'],
    }),

    removeStudentFromHall: builder.mutation({
      query: (data) => ({
        url: '/admin/exam-halls/remove-student',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ExamHalls'],
    }),

    grantTemporaryClearance: builder.mutation({
      query: (data) => ({
        url: '/admin/exam-halls/grant-clearance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ExamHalls'],
    }),

    revokeTemporaryClearance: builder.mutation({
      query: (data) => ({
        url: '/admin/exam-halls/revoke-clearance',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['ExamHalls'],
    }),

    verifyIDCard: builder.query({
      query: (token) => `/admin/exam-halls/verify-id/${token}`,
      providesTags: ['ExamHalls'],
    }),

    // ========== CERTIFICATES ==========
    getCertificates: builder.query({
      query: (params) => ({
        url: '/admin/certificates',
        params,
      }),
      providesTags: ['Certificates'],
    }),

    getCertificate: builder.query({
      query: (id) => `/admin/certificates/${id}`,
      providesTags: (result, error, id) => [{ type: 'Certificates', id }],
    }),

    generateCertificate: builder.mutation({
      query: (data) => ({
        url: '/admin/certificates/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Certificates'],
    }),

    updateCertificate: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/certificates/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Certificates',
        { type: 'Certificates', id },
      ],
    }),

    deleteCertificate: builder.mutation({
      query: (id) => ({
        url: `/admin/certificates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Certificates'],
    }),

    // ========== ID CARDS ==========
    getIdCards: builder.query({
      query: (params) => ({
        url: '/admin/id-cards',
        params,
      }),
      providesTags: ['IdCards'],
    }),

    getIdCard: builder.query({
      query: (id) => `/admin/id-cards/${id}`,
      providesTags: (result, error, id) => [{ type: 'IdCards', id }],
    }),

    generateIdCard: builder.mutation({
      query: (data) => ({
        url: '/admin/id-cards/generate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['IdCards'],
    }),

    updateIdCard: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/id-cards/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'IdCards',
        { type: 'IdCards', id },
      ],
    }),

    deleteIdCard: builder.mutation({
      query: (id) => ({
        url: `/admin/id-cards/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['IdCards'],
    }),

    updateIdCardStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/id-cards/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        'IdCards',
        { type: 'IdCards', id },
      ],
    }),

    markIdCardPrinted: builder.mutation({
      query: (id) => ({
        url: `/admin/id-cards/${id}/mark-printed`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        'IdCards',
        { type: 'IdCards', id },
      ],
    }),

    getIdCardDesigns: builder.query({
      query: (params) => ({
        url: '/admin/id-cards/designs',
        params,
      }),
      providesTags: ['IdCardDesigns'],
    }),

    createIdCardDesign: builder.mutation({
      query: (data) => ({
        url: '/admin/id-cards/designs',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['IdCardDesigns'],
    }),

    getUsersForIdCard: builder.query({
      query: (params) => ({
        url: '/admin/id-cards/users',
        params,
      }),
      providesTags: ['IdCards'],
    }),

    // ========== PORTFOLIOS ==========
    getPortfolios: builder.query({
      query: (params) => ({
        url: '/admin/portfolios',
        params,
      }),
      providesTags: ['Portfolios'],
    }),

    getPortfolio: builder.query({
      query: (id) => `/admin/portfolios/${id}`,
      providesTags: (result, error, id) => [{ type: 'Portfolios', id }],
    }),

    createPortfolio: builder.mutation({
      query: (data) => ({
        url: '/admin/portfolios',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Portfolios'],
    }),

    updatePortfolio: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/portfolios/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Portfolios',
        { type: 'Portfolios', id },
      ],
    }),

    deletePortfolio: builder.mutation({
      query: (id) => ({
        url: `/admin/portfolios/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Portfolios'],
    }),

    // ========== PROMOTIONS ==========
    getPromotionPreview: builder.query({
      query: (params) => ({
        url: '/admin/promotions/preview',
        params,
      }),
      providesTags: ['Promotions'],
    }),

    promoteStudents: builder.mutation({
      query: (data) => ({
        url: '/admin/promotions/promote',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Promotions'],
    }),

    holdStudentsBack: builder.mutation({
      query: (data) => ({
        url: '/admin/promotions/hold',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Promotions'],
    }),

    graduateStudents: builder.mutation({
      query: (data) => ({
        url: '/admin/promotions/graduate',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Promotions'],
    }),

    // ========== DELIVERY REPORTS ==========
    getDeliveryReports: builder.query({
      query: (params) => ({
        url: '/admin/delivery-reports',
        params,
      }),
      providesTags: ['DeliveryReports'],
    }),
  }),
})

export const {
  // Exams
  useGetExamsQuery,
  useGetExamQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
  usePublishExamMutation,
  useUnpublishExamMutation,
  // Online Exams
  useGetOnlineExamsQuery,
  useGetOnlineExamQuery,
  useCreateOnlineExamMutation,
  useUpdateOnlineExamMutation,
  useDeleteOnlineExamMutation,
  usePublishOnlineExamMutation,
  useStartOnlineExamMutation,
  useGetExamAnalyticsQuery,
  // Question Banks
  useGetQuestionBanksQuery,
  useGetQuestionBankQuery,
  useCreateQuestionBankMutation,
  useUpdateQuestionBankMutation,
  useDeleteQuestionBankMutation,
  useCloneQuestionBankMutation,
  useSubmitBankForApprovalMutation,
  useApproveQuestionBankMutation,
  // Questions
  useGetQuestionsQuery,
  useGetQuestionQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useBulkCreateQuestionsMutation,
  useExportQuestionsQuery,
  useImportQuestionsMutation,
  useArchiveQuestionMutation,
  useRestoreQuestionMutation,
  // Exam Results
  useImportExamResultsMutation,
  useGetExamResultsQuery,
  useGetExamResultQuery,
  useGradeExamMutation,
  useBulkGradeExamsMutation,
  usePublishExamResultsMutation,
  useGetExamRankingsQuery,
  useCalculateStudentGPAQuery,
  useCalculateStudentCGPAQuery,
  useGetMeritListQuery,
  // Exam Halls
  useGetExamHallsQuery,
  useGetExamHallQuery,
  useCreateExamHallMutation,
  useUpdateExamHallMutation,
  useDeleteExamHallMutation,
  useAssignStudentToHallMutation,
  useRemoveStudentFromHallMutation,
  useGrantTemporaryClearanceMutation,
  useRevokeTemporaryClearanceMutation,
  useVerifyIDCardQuery,
  // Certificates
  useGetCertificatesQuery,
  useGetCertificateQuery,
  useGenerateCertificateMutation,
  useUpdateCertificateMutation,
  useDeleteCertificateMutation,
  // ID Cards
  useGetIdCardsQuery,
  useGetIdCardQuery,
  useGenerateIdCardMutation,
  useUpdateIdCardMutation,
  useDeleteIdCardMutation,
  useUpdateIdCardStatusMutation,
  useMarkIdCardPrintedMutation,
  useGetIdCardDesignsQuery,
  useCreateIdCardDesignMutation,
  useGetUsersForIdCardQuery,
  // Portfolios
  useGetPortfoliosQuery,
  useGetPortfolioQuery,
  useCreatePortfolioMutation,
  useUpdatePortfolioMutation,
  useDeletePortfolioMutation,
  // Promotions
  useGetPromotionPreviewQuery,
  usePromoteStudentsMutation,
  useHoldStudentsBackMutation,
  useGraduateStudentsMutation,
  // Delivery Reports
  useGetDeliveryReportsQuery,
} = examsApi
