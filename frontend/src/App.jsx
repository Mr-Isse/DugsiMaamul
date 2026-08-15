import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import AdminLayout from './layouts/AdminLayout';
import MarketingLayout from './layouts/MarketingLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';
import FeatureGate from './components/FeatureGate';
import { DesignSystemProvider } from './lib/DesignSystemProvider';
import { TooltipProvider } from './components/ui/tooltip';

// Parent Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import StudentsManagement from './pages/StudentsManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import ExamsManagement from './pages/ExamsManagement';
import StudentResults from './pages/StudentResults';
import PaymentsManagement from './pages/PaymentsManagement';
import StudentPayments from './components/StudentPayments';
import SchoolSettings from './pages/SchoolSettings';
import SecuritySettings from './pages/SecuritySettings';
import CommunicationSettings from './pages/CommunicationSettings';
import CommunicationMessages from './pages/CommunicationMessages';
import ErrorBoundary from './components/ErrorBoundary';
import TeachersManagement from './pages/TeachersManagement';
import ClassesManagement from './pages/ClassesManagement';
import SubjectsManagement from './pages/SubjectsManagement';
import ScheduleManagement from './pages/ScheduleManagement';
import ClassDetail from './pages/ClassDetail';
import ParentsManagement from './pages/ParentsManagement';
import BranchesManagement from './pages/BranchesManagement';
import AnnouncementsManagement from './pages/AnnouncementsManagement';
import PublicContentManagement from './pages/PublicContentManagement';
import EventsManagement from './pages/EventsManagement';
import ExamHallsManagement from './pages/ExamHallsManagement';
import AcademicYearsManagement from './pages/AcademicYearsManagement';
import AcademicTermsManagement from './pages/AcademicTermsManagement';
import StudentPromotions from './pages/StudentPromotions';
import StudentExamPage from './pages/StudentExamPage';

import ActivityCenter from './pages/ActivityCenter';
import AuditLogViewer from './pages/AuditLogViewer';
import FinanceAuditViewer from './pages/FinanceAuditViewer';
import Plans from './pages/Plans';
import SupportTickets from './pages/SupportTickets';
import CertificatesManagement from './pages/CertificatesManagement';
import IDCardsManagement from './pages/IDCardsManagement';
import AdmissionsManagement from './pages/AdmissionsManagement';
import HostelManagement from './pages/HostelManagement';
import TransportManagement from './pages/TransportManagement';
import LibraryManagement from './pages/LibraryManagement';
import AssetsManagement from './pages/AssetsManagement';
import DiscountsManagement from './pages/DiscountsManagement';
import InvoicesManagement from './pages/InvoicesManagement';
import RevenueReports from './pages/RevenueReports';
import ReportsCenter from './pages/ReportsCenter';
import DocumentsManagement from './pages/DocumentsManagement';
import NotificationCenter from './pages/NotificationCenter';
import NotificationTemplatesManagement from './pages/NotificationTemplatesManagement';
import DataRecoveryCenter from './pages/DataRecoveryCenter';
import EnterpriseSuite from './pages/EnterpriseSuite';
import RoleManagement from './pages/RoleManagement';
import PermissionManagement from './pages/PermissionManagement';
import BackupManager from './pages/BackupManager';

// New Enterprise Pages
import DisciplineManagement from './pages/DisciplineManagement';
import HealthRecordsManagement from './pages/HealthRecordsManagement';
import PortfoliosManagement from './pages/PortfoliosManagement';
import AlumniManagement from './pages/AlumniManagement';
import VisitorsManagement from './pages/VisitorsManagement';
import PayrollManagement from './pages/PayrollManagement';
import ProcurementManagement from './pages/ProcurementManagement';
import LeaveManagement from './pages/LeaveManagement';
import ExpenseManagement from './pages/ExpenseManagement';
import QuestionBankManagement from './pages/QuestionBankManagement';
import QuestionManagement from './pages/QuestionManagement';
import ExamResults from './pages/ExamResults';
import DeliveryReports from './pages/DeliveryReports';

// Enterprise Phase 2-17 Pages
import DepartmentsManagement from './pages/DepartmentsManagement';
import DesignationsManagement from './pages/DesignationsManagement';
import HomeworkManagement from './pages/HomeworkManagement';
import LessonPlansManagement from './pages/LessonPlansManagement';
import CurriculumManagement from './pages/CurriculumManagement';
import AccountingManagement from './pages/AccountingManagement';
import EmployeeLoansManagement from './pages/EmployeeLoansManagement';
import PerformanceReviewsManagement from './pages/PerformanceReviewsManagement';
import RecruitmentManagement from './pages/RecruitmentManagement';
import EmployeeContractsManagement from './pages/EmployeeContractsManagement';
import FuelLogsManagement from './pages/FuelLogsManagement';
import VehicleMaintenanceManagement from './pages/VehicleMaintenanceManagement';
import TransportStudentsManagement from './pages/TransportStudentsManagement';
import HostelAttendancePage from './pages/HostelAttendancePage';
import BedAllocationsManagement from './pages/BedAllocationsManagement';
import SuppliersManagement from './pages/SuppliersManagement';
import InventoryManagement from './pages/InventoryManagement';
import ApiKeysManagement from './pages/ApiKeysManagement';
import LoginHistoryPage from './pages/LoginHistoryPage';
import IpRestrictionsManagement from './pages/IpRestrictionsManagement';
import PasswordPolicyPage from './pages/PasswordPolicyPage';

// Phase 18-30 Enterprise Pages
import WorkflowManagement from './pages/WorkflowManagement';
import AutomationEngine from './pages/AutomationEngine';
import AIDashboard from './pages/AIDashboard';
import BIDashboard from './pages/BIDashboard';
import DocumentManagement from './pages/DocumentManagement';
import SecurityDashboard from './pages/SecurityDashboard';
import APIPlatform from './pages/APIPlatform';
import SystemHealthDashboard from './pages/SystemHealthDashboard';
import BackupManagementPage from './pages/BackupManagement';
import WhiteLabelSettings from './pages/WhiteLabelSettings';
import DynamicConfigBuilder from './pages/DynamicConfigBuilder';
import TicketSystem from './pages/TicketSystem';
import TaskManagementPage from './pages/TaskManagement';
import AnnouncementsCenter from './pages/AnnouncementsCenter';
import ComplaintManagement from './pages/ComplaintManagement';
import SuggestionBox from './pages/SuggestionBox';
import RiskRegisterPage from './pages/RiskRegister';
import KnowledgeBasePage from './pages/KnowledgeBase';
import MeetingScheduler from './pages/MeetingScheduler';
import IncidentManagement from './pages/IncidentManagement';

// Lazy-loaded Enterprise Pages
const EnterpriseFinanceManagement = lazy(() => import('./pages/EnterpriseFinanceManagement'));
const RevenueForecast = lazy(() => import('./pages/RevenueForecast'));
const AILearningAssistant = lazy(() => import('./pages/AILearningAssistant'));
const RiskAssessment = lazy(() => import('./pages/RiskAssessment'));
const AIParentReports = lazy(() => import('./pages/AIParentReports'));
const PerformanceTracking = lazy(() => import('./pages/PerformanceTracking'));
const AutomaticTimetabling = lazy(() => import('./pages/AutomaticTimetabling'));
const BusinessIntelligence = lazy(() => import('./pages/BusinessIntelligence'));
const ExecutiveDashboard = lazy(() => import('./pages/ExecutiveDashboard'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));
const RestrictedAccess = lazy(() => import('./pages/RestrictedAccess'));
const Maintenance = lazy(() => import('./pages/Maintenance'));
import { Toaster } from 'sonner';
import SchoolProfileSetup from './pages/SchoolProfileSetup';
import OnboardingWizard from './pages/OnboardingWizard';
import {
  SchoolAdminProtectedRoute,
  SuperAdminProtectedRoute,
  SuperAdminPublicRoute,
} from './components/routing/ProtectedRoutes';
import { Skeleton } from './components/ui/skeleton';
import { setSchoolTenantFromUser } from './store/tenantSlice';
import VerifyEmail from './pages/VerifyEmail';

// Parent Portal Pages
import ParentLayout from './pages/parent/ParentLayout';
import ParentLogin from './pages/parent/ParentLogin';
import ParentDashboard from './pages/parent/ParentDashboard';
import ParentChildDetail from './pages/parent/ParentChildDetail';
import ParentAnnouncements from './pages/parent/ParentAnnouncements';

const LandingPage = lazy(() => import('./pages/marketing/LandingPage'));
const PlatformPage = lazy(() => import('./pages/marketing/PlatformPage'));
const PricingPage = lazy(() => import('./pages/marketing/PricingPage'));
const ContactPage = lazy(() => import('./pages/marketing/ContactPage'));
const AboutPage = lazy(() => import('./pages/marketing/AboutPage'));
const FAQPage = lazy(() => import('./pages/marketing/FAQPage'));
const PrivacyPolicy = lazy(() => import('./pages/marketing/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/marketing/TermsOfService'));
const SuperAdminLogin = lazy(() => import('./pages/superadmin/SuperAdminLogin'));
const SuperAdminRegister = lazy(() => import('./pages/superadmin/SuperAdminRegister'));
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/SuperAdminDashboard'));
const SuperAdminSchools = lazy(() => import('./pages/superadmin/Schools'));
const SuperAdminSchoolAdmins = lazy(() => import('./pages/superadmin/SchoolAdmins'));
const RegisterSchoolAdmin = lazy(() => import('./pages/superadmin/RegisterSchoolAdmin'));
const SuperAdminPlans = lazy(() => import('./pages/superadmin/PlansManagement'));
const SuperAdminSubscriptions = lazy(() => import('./pages/superadmin/SubscriptionsManagement'));
const SuperAdminLeads = lazy(() => import('./pages/superadmin/LeadsManagement'));
const SuperAdminTickets = lazy(() => import('./pages/superadmin/TicketsManagement'));
const SuperAdminErrors = lazy(() => import('./pages/superadmin/ErrorLogs'));
const SystemManagement = lazy(() => import('./pages/superadmin/SystemManagement'));
const SchoolFeatures = lazy(() => import('./pages/superadmin/SchoolFeatures'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <Skeleton className="h-12 w-48" />
  </div>
);

function SchoolAdminDashboardRoutes() {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/school-profile-setup" element={<SchoolProfileSetup />} />
      <Route path="/restricted" element={
        <SchoolAdminProtectedRoute>
          <RestrictedAccess />
        </SchoolAdminProtectedRoute>
      } />
      <Route path="/onboarding" element={
        <SchoolAdminProtectedRoute>
          <OnboardingWizard />
        </SchoolAdminProtectedRoute>
      } />
      <Route
        path="/"
        element={
          <SchoolAdminProtectedRoute>
            <AdminLayout />
          </SchoolAdminProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="branches" element={
          <SchoolAdminProtectedRoute>
            <BranchesManagement />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="classes" element={
          <SchoolAdminProtectedRoute>
            <ClassesManagement />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="classes/:id" element={
          <SchoolAdminProtectedRoute>
            <ClassDetail />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="subjects" element={
          <SchoolAdminProtectedRoute>
            <SubjectsManagement />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="teachers" element={
          <SchoolAdminProtectedRoute>
            <TeachersManagement />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="students" element={
          <SchoolAdminProtectedRoute>
            <StudentsManagement />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="parents" element={
          <SchoolAdminProtectedRoute>
            <ParentsManagement />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="attendance" element={
          <SchoolAdminProtectedRoute>
            <AttendanceManagement />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="academic-years" element={
          <SchoolAdminProtectedRoute>
            <AcademicYearsManagement />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="academic-terms" element={
          <SchoolAdminProtectedRoute>
            <AcademicTermsManagement />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="promotions" element={
          <SchoolAdminProtectedRoute>
            <StudentPromotions />
          </SchoolAdminProtectedRoute>
        } />
        <Route
          path="exams"
          element={
            <SchoolAdminProtectedRoute>
              {userInfo?.role === 'student' ? <StudentResults /> : <ExamsManagement />}
            </SchoolAdminProtectedRoute>
          }
        />
        <Route
          path="online-exams"
          element={
            <SchoolAdminProtectedRoute>
              <FeatureGate feature="online-exams">
                <StudentExamPage />
              </FeatureGate>
            </SchoolAdminProtectedRoute>
          }
        />
        <Route path="question-banks" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="question-banks">
              <QuestionBankManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="questions" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="question-banks">
              <QuestionManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="exam-results" element={
          <SchoolAdminProtectedRoute>
            <ExamResults />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="schedule" element={
          <SchoolAdminProtectedRoute>
            <ScheduleManagement />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="payments" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="finance">
              {userInfo?.role === 'student' ? <StudentPayments /> : <PaymentsManagement />}
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="announcements" element={
          <SchoolAdminProtectedRoute>
            <AnnouncementsManagement />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="public-content" element={
          <SchoolAdminProtectedRoute>
            <PublicContentManagement />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="events" element={
          <SchoolAdminProtectedRoute>
            <EventsManagement />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="exam-halls" element={
          <SchoolAdminProtectedRoute>
            <ExamHallsManagement />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="settings" element={
          <SchoolAdminProtectedRoute>
            <SchoolSettings />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="security-settings" element={
          <SchoolAdminProtectedRoute>
            <SecuritySettings />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="communication-settings" element={
          <SchoolAdminProtectedRoute>
            <CommunicationSettings />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="communication-messages" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="messaging">
              <CommunicationMessages />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="activity" element={
          <SchoolAdminProtectedRoute>
            <ActivityCenter />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="audit" element={
          <SchoolAdminProtectedRoute>
            <AuditLogViewer />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="finance-audit" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="finance-audit">
              <FinanceAuditViewer />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="plans" element={
          <SchoolAdminProtectedRoute>
            <Plans />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="certificates" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="certificates">
              <CertificatesManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="id-cards" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="id-cards">
              <IDCardsManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="admissions" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="admissions">
              <AdmissionsManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="hostel" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="hostel">
              <HostelManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="transport" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="transport">
              <TransportManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="library" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="library">
              <LibraryManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="departments" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="departments">
              <DepartmentsManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="designations" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="designations">
              <DesignationsManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="homework" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="homework">
              <HomeworkManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="lesson-plans" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="lesson-plans">
              <LessonPlansManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="curriculum" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="curriculum">
              <CurriculumManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="accounting" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="accounting">
              <AccountingManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="employee-loans" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="employee-loans">
              <EmployeeLoansManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="performance-reviews" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="performance-reviews">
              <PerformanceReviewsManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="recruitment" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="recruitment">
              <RecruitmentManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="employee-contracts" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="employee-contracts">
              <EmployeeContractsManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="transport-students" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="transport-students">
              <TransportStudentsManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="fuel-logs" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="fuel-logs">
              <FuelLogsManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="vehicle-maintenance" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="vehicle-maintenance">
              <VehicleMaintenanceManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="hostel-attendance" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="hostel-attendance">
              <HostelAttendancePage />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="bed-allocations" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="bed-allocation">
              <BedAllocationsManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="suppliers" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="suppliers">
              <SuppliersManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="inventory" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="inventory">
              <InventoryManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="api-keys" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="api-keys">
              <ApiKeysManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="login-history" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="login-history">
              <LoginHistoryPage />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="ip-restrictions" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="ip-restrictions">
              <IpRestrictionsManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="password-policies" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="password-policies">
              <PasswordPolicyPage />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="assets" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="assets">
              <AssetsManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="discounts" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="discounts">
              <DiscountsManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="invoices" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="invoices">
              <InvoicesManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="revenue-reports" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="revenue-reports">
              <RevenueReports />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="reports" element={
          <SchoolAdminProtectedRoute>
            <ReportsCenter />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="enterprise-suite" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="enterprise-suite">
              <EnterpriseSuite />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="notification-center" element={
          <SchoolAdminProtectedRoute>
            <NotificationCenter />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="documents" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="documents">
              <DocumentsManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="notification-templates" element={
          <SchoolAdminProtectedRoute>
            <NotificationTemplatesManagement />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="delivery-reports" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="delivery-reports">
              <DeliveryReports />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="data-recovery" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="data-recovery">
              <DataRecoveryCenter />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="backups" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="backups">
              <BackupManager />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="support" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="support">
              <SupportTickets />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="help" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="help-center">
              <HelpCenter />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="roles" element={
          <SchoolAdminProtectedRoute>
            <RoleManagement />
          </SchoolAdminProtectedRoute>
        } />
        <Route path="permissions" element={
          <SchoolAdminProtectedRoute>
            <PermissionManagement />
          </SchoolAdminProtectedRoute>
        } />
        {/* New Enterprise Routes */}
        <Route path="discipline" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="discipline">
              <DisciplineManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="health-records" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="health">
              <HealthRecordsManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="portfolios" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="portfolios">
              <PortfoliosManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="alumni" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="alumni">
              <AlumniManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="visitors" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="visitors">
              <VisitorsManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="payroll" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="payroll">
              <PayrollManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="leave-management" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="leave-management">
              <LeaveManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="expenses" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="expenses">
              <ExpenseManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="procurement" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="procurement">
              <ProcurementManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        {/* Lazy-loaded Enterprise Routes */}
        <Route path="enterprise-finance" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="enterprise-finance">
              <Suspense fallback={<PageLoader />}><EnterpriseFinanceManagement /></Suspense>
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="revenue-forecast" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="revenue-forecast">
              <Suspense fallback={<PageLoader />}><RevenueForecast /></Suspense>
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="ai-learning-assistant" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="ai-learning-assistant">
              <AILearningAssistant />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="risk-assessment" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="risk-assessment">
              <RiskAssessment />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="ai-parent-reports" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="ai-parent-reports">
              <AIParentReports />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="performance-tracking" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="performance-tracking">
              <Suspense fallback={<PageLoader />}><PerformanceTracking /></Suspense>
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="automatic-timetabling" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="automatic-timetabling">
              <Suspense fallback={<PageLoader />}><AutomaticTimetabling /></Suspense>
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="business-intelligence" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="business-intelligence">
              <Suspense fallback={<PageLoader />}><BusinessIntelligence /></Suspense>
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="executive-dashboard" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="executive-dashboard">
              <Suspense fallback={<PageLoader />}><ExecutiveDashboard /></Suspense>
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        {/* Phase 18-30 Enterprise Routes */}
        <Route path="workflow" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="workflow-automation">
              <WorkflowManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="automation" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="automation-engine">
              <AutomationEngine />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="ai-dashboard" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="ai-learning-assistant">
              <AIDashboard />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="bi-dashboard" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="performance-tracking">
              <BIDashboard />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="document-management" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="documents">
              <DocumentManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="advanced-security" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="advanced-security">
              <SecurityDashboard />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="api-platform" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="api-platform">
              <APIPlatform />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="system-health" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="system-health">
              <SystemHealthDashboard />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="backup-management" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="backup">
              <BackupManagementPage />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="white-label" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="white-label">
              <WhiteLabelSettings />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="dynamic-config" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="dynamic-config">
              <DynamicConfigBuilder />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="tickets" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="ticketing">
              <TicketSystem />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="tasks" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="task-management">
              <TaskManagementPage />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="announcements-management" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="announcements">
              <AnnouncementsCenter />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="complaints" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="complaints">
              <ComplaintManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="suggestions" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="suggestions">
              <SuggestionBox />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="risk-register" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="risk-register">
              <RiskRegisterPage />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="knowledge-base" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="knowledge-base">
              <KnowledgeBasePage />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="meetings" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="meeting-scheduler">
              <MeetingScheduler />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="incidents" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="incident-management">
              <IncidentManagement />
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="cross-school-analytics" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="cross-school-analytics">
              <Suspense fallback={<PageLoader />}><BusinessIntelligence /></Suspense>
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
        <Route path="regional-dashboard" element={
          <SchoolAdminProtectedRoute>
            <FeatureGate feature="regional-dashboard">
              <Suspense fallback={<PageLoader />}><ExecutiveDashboard /></Suspense>
            </FeatureGate>
          </SchoolAdminProtectedRoute>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ParentPortalRoutes() {
  const { userInfo } = useSelector((state) => state.auth);

  if (!userInfo || userInfo.role !== 'parent') {
    return <Navigate to="/parent/login" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<ParentLogin />} />
      <Route path="/" element={<ParentLayout />}>
        <Route index element={<ParentDashboard />} />
        <Route path="announcements" element={<ParentAnnouncements />} />
        <Route path="child/:childId" element={<ParentChildDetail />} />
        <Route path="child/:childId/profile" element={<ParentChildDetail />} />
        <Route path="child/:childId/attendance" element={<ParentChildDetail />} />
        <Route path="child/:childId/results" element={<ParentChildDetail />} />
        <Route path="child/:childId/fees" element={<ParentChildDetail />} />
        <Route path="child/:childId/timetable" element={<ParentChildDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/parent" replace />} />
    </Routes>
  );
}

function PlatformPublicRoutes() {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        <Route element={<MarketingLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="platform" element={<PlatformPage />} />
          <Route path="pricing" element={<PricingPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="terms" element={<TermsOfService />} />
        <Route path="maintenance" element={<Maintenance />} />
      </Route>

        <Route path="/login" element={<Login />} />

        {/* Parent Login */}
        <Route path="/parent/login" element={<ParentLogin />} />

        {/* Redirect common app routes to login if unauthenticated */}
        <Route path="/dashboard" element={<Navigate to="/login" replace />} />
        <Route path="/students" element={<Navigate to="/login" replace />} />
        <Route path="/teachers" element={<Navigate to="/login" replace />} />
        <Route path="/attendance" element={<Navigate to="/login" replace />} />
        <Route path="/payments" element={<Navigate to="/login" replace />} />
        <Route path="/exams" element={<Navigate to="/login" replace />} />
        <Route path="/online-exams" element={<Navigate to="/login" replace />} />
        <Route path="/reports" element={<Navigate to="/login" replace />} />
        <Route path="/settings" element={<Navigate to="/login" replace />} />
        <Route path="/branches" element={<Navigate to="/login" replace />} />
        <Route path="/academic-years" element={<Navigate to="/login" replace />} />

        <Route
          path="/admin/login"
          element={
            <SuperAdminPublicRoute>
              <SuperAdminLogin />
            </SuperAdminPublicRoute>
          }
        />
        <Route
          path="/admin/register"
          element={
            <SuperAdminPublicRoute>
              <SuperAdminRegister />
            </SuperAdminPublicRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <SuperAdminProtectedRoute>
              <SuperAdminLayout />
            </SuperAdminProtectedRoute>
          }
        >
          <Route index element={<SuperAdminDashboard />} />
          <Route path="schools" element={<SuperAdminSchools />} />
          <Route path="features" element={<SchoolFeatures />} />
          <Route path="admins" element={<SuperAdminSchoolAdmins />} />
          <Route path="admins/register" element={<RegisterSchoolAdmin />} />
          <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
          <Route path="plans" element={<SuperAdminPlans />} />
          <Route path="leads" element={<SuperAdminLeads />} />
          <Route path="tickets" element={<SuperAdminTickets />} />
          <Route path="errors" element={<SuperAdminErrors />} />
          <Route path="system" element={<SystemManagement />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function AppRoutes() {
  const dispatch = useDispatch();
  const { isSuperAdmin, tenantInfo } = useSelector((state) => state.tenant);
  const { userInfo } = useSelector((state) => state.auth);

  const isPlatformHost = isSuperAdmin || tenantInfo?.type === 'dev';

  const isSchoolUser = ['schooladmin', 'school_admin', 'admin', 'branch_manager', 'branchmanager', 'teacher', 'student'].includes(userInfo?.role);

  useEffect(() => {
    if (isSchoolUser && userInfo?.school) {
      dispatch(setSchoolTenantFromUser(userInfo.school));
    }
  }, [userInfo, dispatch, isSchoolUser]);

  if (userInfo) {
    if (userInfo?.role === 'parent') {
      return <ParentPortalRoutes />;
    }
    if (isSchoolUser) {
      return <SchoolAdminDashboardRoutes />;
    }
    if (userInfo?.role === 'superadmin' || userInfo?.role === 'super_admin') {
      return <PlatformPublicRoutes />;
    }
  }

  // Handle tenant-specific host redirection
  if (tenantInfo?.type === 'school') {
    // For school subdomains, default to login if unauthenticated
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return <PlatformPublicRoutes />;
}

function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
        />
        <Router>
          <AppRoutes />
        </Router>
      </TooltipProvider>
    </ErrorBoundary>
  );
}

export default App;
