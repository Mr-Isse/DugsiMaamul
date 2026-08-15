/**
 * API service barrel.
 * Module-specific APIs should inject endpoints into baseApi.
 */
export { baseApi } from './baseApi'
export {
  extractApiError,
  isUnauthorized,
  isForbidden,
  isNotFound,
  isLocked,
  isValidationError,
  isNetworkError,
} from './errorHandler'
export { dashboardApi } from './dashboardApi'
export { authApi } from './authApi'
export { publicApi, useGetAvailablePlansQuery, useSubmitLeadMutation } from './publicApi'
export { studentsApi, useGetStudentsQuery, useGetStudentQuery, useCreateStudentMutation, useUpdateStudentMutation, useDeleteStudentMutation, useGenerateBulkCredentialsMutation, useGenerateStudentLoginMutation, useBulkImportStudentsMutation } from './studentsApi'
export { teachersApi, useGetTeachersQuery, useGetTeacherQuery, useCreateTeacherMutation, useUpdateTeacherMutation, useDeleteTeacherMutation, useBulkResetPasswordsMutation, useResetTeacherPasswordMutation, useAssignSubjectsMutation, useBulkImportTeachersMutation } from './teachersApi'
export { classesApi, useGetClassesQuery, useGetClassQuery, useGetClassByIdQuery, useGetStudentsInClassQuery, useCreateClassMutation, useUpdateClassMutation, useDeleteClassMutation, useAssignSubjectToClassMutation, useUpdateClassSubjectAssignmentMutation, useTransferStudentMutation, useAssignStudentsMutation, useAssignTeacherMutation, useRemoveStudentMutation } from './classesApi'
export { academicApi, useGetAcademicYearsQuery, useCreateAcademicYearMutation, useUpdateAcademicYearMutation, useDeleteAcademicYearMutation, useGetAcademicTermsQuery, useCreateAcademicTermMutation, useUpdateAcademicTermMutation, useDeleteAcademicTermMutation, useActivateAcademicTermMutation, useArchiveAcademicTermMutation } from './academicApi'
export { branchesApi, useGetBranchesQuery, useCreateBranchMutation, useUpdateBranchMutation, useDeleteBranchMutation, useToggleBranchStatusMutation } from './branchesApi'
export { subjectsApi, useGetSubjectsQuery, useGetSubjectQuery, useCreateSubjectMutation, useUpdateSubjectMutation, useDeleteSubjectMutation } from './subjectsApi'
export { parentsApi, useGetParentsQuery, useGetParentQuery, useCreateParentMutation, useUpdateParentMutation, useDeleteParentMutation, useResetParentPasswordMutation, useLinkParentToStudentsMutation } from './parentsApi'
export { attendanceApi, useGetAttendanceQuery, useGetStudentAttendanceQuery, useGetClassAttendanceQuery, useGetAttendanceByDateQuery, useMarkAttendanceMutation, useMarkClassAttendanceMutation, useUpdateAttendanceMutation, useDeleteAttendanceMutation, useGetAttendanceStatsQuery } from './attendanceApi'
export { 
  examsApi, 
  useGetExamsQuery, 
  useGetExamQuery, 
  useCreateExamMutation, 
  useUpdateExamMutation, 
  useDeleteExamMutation, 
  usePublishExamMutation, 
  useUnpublishExamMutation,
  useGetOnlineExamsQuery,
  useGetOnlineExamQuery,
  useCreateOnlineExamMutation,
  useUpdateOnlineExamMutation,
  useDeleteOnlineExamMutation,
  usePublishOnlineExamMutation,
  useStartOnlineExamMutation,
  useGetExamAnalyticsQuery,
  useGetQuestionBanksQuery,
  useGetQuestionBankQuery,
  useCreateQuestionBankMutation,
  useUpdateQuestionBankMutation,
  useDeleteQuestionBankMutation,
  useCloneQuestionBankMutation,
  useSubmitBankForApprovalMutation,
  useApproveQuestionBankMutation,
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
  useGetExamResultsQuery,
  useGetExamResultQuery,
  useGradeExamMutation,
  useBulkGradeExamsMutation,
  usePublishExamResultsMutation,
  useGetExamRankingsQuery,
  useCalculateStudentGPAQuery,
  useCalculateStudentCGPAQuery,
  useGetMeritListQuery,
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
  useGetPortfoliosQuery,
  useGetPortfolioQuery,
  useCreatePortfolioMutation,
  useUpdatePortfolioMutation,
  useDeletePortfolioMutation,
  useGetPromotionPreviewQuery,
  usePromoteStudentsMutation,
  useHoldStudentsBackMutation,
  useGraduateStudentsMutation,
  useGetDeliveryReportsQuery,
} from './examsApi'
export { settingsApi, useGetSchoolSettingsQuery, useUpdateSchoolSettingsMutation, useGetSchoolProfileQuery, useUpdateSchoolProfileMutation, useGetSecuritySettingsQuery, useUpdateSecuritySettingsMutation, useGetPasswordPoliciesQuery, useUpdatePasswordPoliciesMutation } from './settingsApi'
export { rbacApi, useGetRolesQuery, useGetRoleQuery, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation, useGetPermissionsQuery, useGetPermissionQuery, useCreatePermissionMutation, useUpdatePermissionMutation, useDeletePermissionMutation } from './rbacApi'
export { financeApi, useGetPaymentsQuery, useGetPaymentQuery, useCreatePaymentMutation, useUpdatePaymentMutation, useDeletePaymentMutation, useGetInvoicesQuery, useGetInvoiceQuery, useCreateInvoiceMutation, useUpdateInvoiceMutation, useDeleteInvoiceMutation, useGetDiscountsQuery, useGetDiscountQuery, useCreateDiscountMutation, useUpdateDiscountMutation, useDeleteDiscountMutation, useGetDiscountAssignmentsQuery, useAssignDiscountMutation, useRemoveDiscountAssignmentMutation, useGetDiscountReportsQuery, useGetAccountsQuery, useGetAccountQuery, useCreateAccountMutation, useUpdateAccountMutation, useDeleteAccountMutation, useGetJournalEntriesQuery, useCreateJournalEntryMutation, usePostJournalEntryMutation, useReverseJournalEntryMutation, useGetTrialBalanceQuery, useGetProfitAndLossQuery, useGetBalanceSheetQuery, useGetCashFlowQuery, useGetFiscalPeriodsQuery, useCreateFiscalPeriodMutation, useCloseFiscalPeriodMutation, useGetExpensesQuery, useGetExpenseQuery, useGetExpenseStatsQuery, useCreateExpenseMutation, useUpdateExpenseMutation, useDeleteExpenseMutation, useGetProcurementsQuery, useGetProcurementQuery, useCreateProcurementMutation, useUpdateProcurementMutation, useDeleteProcurementMutation, useGetMonthlyPaymentsQuery, useGetPaymentStatsQuery, useGetRevenueForecastsQuery, useGetRevenueForecastQuery, useCreateRevenueForecastMutation, useUpdateRevenueForecastMutation, useDeleteRevenueForecastMutation, useGetEnterpriseFinanceQuery, useGetEnterpriseFinanceRecordQuery, useCreateEnterpriseFinanceMutation, useUpdateEnterpriseFinanceMutation, useDeleteEnterpriseFinanceMutation, useGetFinanceStatsQuery } from './financeApi'
export { communicationApi, useGetAnnouncementsQuery, useGetAnnouncementQuery, useCreateAnnouncementMutation, useUpdateAnnouncementMutation, useDeleteAnnouncementMutation, usePublishAnnouncementMutation, useUnpublishAnnouncementMutation, useGetCommunicationSettingsQuery, useUpdateCommunicationSettingsMutation, useGetCommunicationMessagesQuery, useGetCommunicationMessageByIdQuery, useCreateCommunicationMessageMutation, useUpdateCommunicationMessageMutation, useDeleteCommunicationMessageMutation, useDuplicateCommunicationMessageMutation, useSendCommunicationMessageMutation, useGetNotificationsQuery, useGetNotificationHistoryQuery, useGetNotificationRecipientsQuery, useCreateNotificationMutation, useGetUnreadCountQuery, useMarkAsReadMutation, useMarkAllAsReadMutation, useDeleteNotificationMutation, useGetNotificationTemplatesQuery, useGetNotificationTemplateByIdQuery, useCreateNotificationTemplateMutation, useUpdateNotificationTemplateMutation, useDeleteNotificationTemplateMutation, useSeedNotificationTemplatesMutation, useGetComplaintsQuery, useCreateComplaintMutation, useUpdateComplaintMutation, useDeleteComplaintMutation, useGetSuggestionsQuery, useCreateSuggestionMutation, useUpdateSuggestionMutation, useDeleteSuggestionMutation, useUpvoteSuggestionMutation, useGetMeetingsQuery, useCreateMeetingMutation, useUpdateMeetingMutation, useDeleteMeetingMutation } from './communicationApi'
export { scheduleApi, useGetScheduleQuery, useGetClassScheduleQuery, useGetTeacherScheduleQuery, useCreateScheduleItemMutation, useUpdateScheduleItemMutation, useDeleteScheduleItemMutation } from './scheduleApi'
export { reportsApi, useGetReportsQuery, useGenerateReportMutation, useDownloadReportMutation, useGetReportHistoryQuery } from './reportsApi'
export { contentApi, useGetPublicContentQuery, useGetContentPageQuery, useCreateContentPageMutation, useUpdateContentPageMutation, useDeleteContentPageMutation, usePublishContentPageMutation, useUnpublishContentPageMutation } from './contentApi'
export { eventsApi, useGetEventsQuery, useGetEventQuery, useCreateEventMutation, useUpdateEventMutation, useDeleteEventMutation, usePublishEventMutation, useUnpublishEventMutation } from './eventsApi'
export { libraryApi, useGetBooksQuery, useGetBookQuery, useCreateBookMutation, useUpdateBookMutation, useDeleteBookMutation, useIssueBookMutation, useReturnBookMutation, useGetLibraryTransactionsQuery } from './libraryApi'
export { transportApi, useGetVehiclesQuery, useGetVehicleQuery, useCreateVehicleMutation, useUpdateVehicleMutation, useDeleteVehicleMutation, useGetRoutesQuery, useCreateRouteMutation, useUpdateRouteMutation, useDeleteRouteMutation, useAssignStudentToRouteMutation, useGetTransportAllocationsQuery, useCreateTransportAllocationMutation, useUpdateTransportAllocationMutation, useDeleteTransportAllocationMutation, useGetFuelLogsQuery, useCreateFuelLogMutation, useGetVehicleMaintenanceQuery, useCreateVehicleMaintenanceMutation, useUpdateVehicleMaintenanceMutation } from './transportApi'
export { inventoryApi, useGetInventoryQuery, useGetInventoryItemQuery, useCreateInventoryItemMutation, useUpdateInventoryItemMutation, useDeleteInventoryItemMutation, useUpdateStockMutation, useGetSuppliersQuery, useCreateSupplierMutation, useUpdateSupplierMutation, useDeleteSupplierMutation, useGetAssetsQuery, useCreateAssetMutation, useUpdateAssetMutation, useDeleteAssetMutation } from './inventoryApi'
export { hrApi, useGetPayrollQuery, useGetPayrollRecordQuery, useCreatePayrollRecordMutation, useUpdatePayrollRecordMutation, useDeletePayrollRecordMutation, useProcessPayrollMutation, useGetPayrollSummaryQuery, useGetLoansQuery, useGetLoanQuery, useCreateLoanMutation, useUpdateLoanMutation, useDeleteLoanMutation, useApproveLoanMutation, useRejectLoanMutation, useGetReviewsQuery, useGetReviewQuery, useCreateReviewMutation, useUpdateReviewMutation, useDeleteReviewMutation, useGetJobPostingsQuery, useGetJobPostingQuery, useCreateJobPostingMutation, useUpdateJobPostingMutation, useDeleteJobPostingMutation, useGetContractsQuery, useGetContractQuery, useCreateContractMutation, useUpdateContractMutation, useDeleteContractMutation } from './hrApi'
export { studentWelfareApi, useGetHealthRecordsQuery, useCreateHealthRecordMutation, useUpdateHealthRecordMutation, useDeleteHealthRecordMutation, useGetDisciplineRecordsQuery, useCreateDisciplineRecordMutation, useUpdateDisciplineRecordMutation, useDeleteDisciplineRecordMutation } from './studentWelfareApi'
export { alumniApi, useGetAlumniQuery, useGetAlumniRecordQuery, useCreateAlumniRecordMutation, useUpdateAlumniRecordMutation, useDeleteAlumniRecordMutation } from './alumniApi'
export { hostelApi, useGetRoomsQuery, useGetRoomQuery, useCreateRoomMutation, useUpdateRoomMutation, useDeleteRoomMutation, useAssignStudentToRoomMutation, useRemoveStudentFromRoomMutation, useGetHostelsQuery, useGetHostelAttendanceQuery, useMarkHostelAttendanceMutation, useGetBedAllocationsQuery, useCreateBedAllocationMutation, useUpdateBedAllocationMutation, useDeleteBedAllocationMutation } from './hostelApi'
export { canteenApi, useGetMenuItemsQuery, useGetMenuItemQuery, useCreateMenuItemMutation, useUpdateMenuItemMutation, useDeleteMenuItemMutation, useGetOrdersQuery, useCreateOrderMutation, useUpdateOrderStatusMutation } from './canteenApi'
export { leaveApi, useGetLeaveRequestsQuery, useGetLeaveRequestQuery, useCreateLeaveRequestMutation, useUpdateLeaveRequestMutation, useDeleteLeaveRequestMutation, useApproveLeaveRequestMutation, useRejectLeaveRequestMutation } from './leaveApi'
export { visitorApi, useGetVisitorsQuery, useGetVisitorQuery, useCreateVisitorMutation, useUpdateVisitorMutation, useDeleteVisitorMutation, useCheckoutVisitorMutation } from './visitorApi'
export { receptionApi, useGetAppointmentsQuery, useCreateAppointmentMutation, useUpdateAppointmentMutation, useDeleteAppointmentMutation, useGetInquiriesQuery, useCreateInquiryMutation, useUpdateInquiryMutation, useDeleteInquiryMutation } from './receptionApi'
export { superAdminApi, useGetSchoolsQuery, useGetSchoolByIdQuery, useUpdateSchoolMutation, useToggleSchoolBlockMutation, useDeleteSchoolMutation, useGetSchoolAdminsQuery, useCreateSchoolAdminMutation, useUpdateSchoolAdminMutation, useToggleSchoolAdminStatusMutation, useDeleteSchoolAdminMutation, useGetPlansQuery, useCreatePlanMutation, useUpdatePlanMutation, useDeletePlanMutation, useGetFeatureRegistryQuery } from './superAdminApi'
export { aiApi, useGetAiInsightsQuery, useGetAiRecommendationsQuery, useGetAiPredictionsQuery, useGeneratePredictionsMutation, useGetAiChatSessionsQuery, useGetAiChatMessagesQuery, useSendAiChatMessageMutation } from './aiApi'
export { biApi, useGetExecutiveDashboardQuery, useGetKpiDashboardQuery, useGetFinancialAnalyticsQuery, useGetAcademicAnalyticsQuery, useGetComparativeReportsQuery, useGetBiReportsQuery, useGenerateBiReportMutation, useDeleteBiReportMutation } from './biApi'
export { automationApi, useGetAutomationStatsQuery, useGetAutomationLogsQuery, useGetScheduledJobsQuery, useCreateScheduledJobMutation, useUpdateScheduledJobMutation, useDeleteScheduledJobMutation, useToggleScheduledJobMutation, useRunScheduledJobNowMutation } from './automationApi'
export { admissionsApi, useGetAdmissionsQuery, useGetAdmissionQuery, useCreateAdmissionMutation, useUpdateAdmissionMutation, useUpdateAdmissionStatusMutation, useDeleteAdmissionMutation } from './admissionsApi'
export { departmentsApi, useGetDepartmentsQuery, useGetDepartmentQuery, useCreateDepartmentMutation, useUpdateDepartmentMutation, useDeleteDepartmentMutation } from './departmentsApi'
export { designationsApi, useGetDesignationsQuery, useGetDesignationQuery, useCreateDesignationMutation, useUpdateDesignationMutation, useDeleteDesignationMutation } from './designationsApi'
export { curriculumApi, useGetCurriculumsQuery, useGetCurriculumQuery, useCreateCurriculumMutation, useUpdateCurriculumMutation, useDeleteCurriculumMutation } from './curriculumApi'
export { homeworkApi, useGetHomeworksQuery, useGetHomeworkQuery, useCreateHomeworkMutation, useUpdateHomeworkMutation, useDeleteHomeworkMutation } from './homeworkApi'
export { lessonPlansApi, useGetLessonPlansQuery, useGetLessonPlanQuery, useCreateLessonPlanMutation, useUpdateLessonPlanMutation, useDeleteLessonPlanMutation } from './lessonPlansApi'
export { idCardApi, useGetIdCardsQuery, useGetIdCardQuery, useCreateIdCardMutation, useUpdateIdCardMutation, useDeleteIdCardMutation, useUpdateIdCardStatusMutation, useMarkIdCardPrintedMutation, useGetIdCardDesignsQuery, useCreateIdCardDesignMutation, useGetUsersForIdCardQuery, useReprintIdCardMutation } from './idCardApi'
export { certificateApi, useGetCertificatesQuery, useGetCertificateQuery, useGenerateCertificateMutation, useUpdateCertificateMutation, useDeleteCertificateMutation } from './certificateApi'
