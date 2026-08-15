import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { FoundationHomePage } from '@/pages/FoundationHomePage'
import { LoginPage } from '@/pages/LoginPage'
import { AppShellPage } from '@/pages/AppShellPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { DevAccessPage } from '@/pages/DevAccessPage'
import { LandingPage } from '@/pages/LandingPage'
import { PricingPage } from '@/pages/PricingPage'
import { ContactPage } from '@/pages/ContactPage'
import { FAQPage } from '@/pages/FAQPage'
import Dashboard from '@/features/dashboard/Dashboard'
import SuperAdminDashboard from '@/features/dashboard/SuperAdminDashboard'
import SuperAdminSchoolsPage from '@/pages/SuperAdminSchoolsPage'
import SuperAdminAdminsPage from '@/pages/SuperAdminAdminsPage'
import SuperAdminPlansPage from '@/pages/SuperAdminPlansPage'
import SuperAdminFeaturesPage from '@/pages/SuperAdminFeaturesPage'

// Enterprise Pages
import EnterpriseSuitePage from '@/pages/enterprise/EnterpriseSuitePage'
import AiDashboardPage from '@/pages/enterprise/AiDashboardPage'
import BiDashboardPage from '@/pages/enterprise/BiDashboardPage'
import AutomationEnginePage from '@/pages/enterprise/AutomationEnginePage'

import {
  ProtectedRoute,
  GuestRoute,
} from '@/routes/guards/AuthGuards'
import { TenantRoute } from '@/routes/guards/TenantGuards'
import { SubscriptionRoute } from '@/routes/guards/SubscriptionGuards'

// Direct imports instead of lazy loading
import StudentsPage from '@/pages/StudentsPage'
import TeachersPage from '@/pages/TeachersPage'
import ClassesPage from '@/pages/ClassesPage'
import ParentsPage from '@/pages/ParentsPage'
import AttendancePage from '@/pages/AttendancePage'
import AcademicTermsPage from '@/pages/AcademicTermsPage'
import ExamsPage from '@/pages/ExamsPage'
import SettingsPage from '@/pages/SettingsPage'
import SecuritySettingsPage from '@/pages/SecuritySettingsPage'
import RolesPage from '@/pages/RolesPage'
import PermissionsPage from '@/pages/PermissionsPage'
import PaymentsPage from '@/pages/PaymentsPage'
import AnnouncementsPage from '@/pages/AnnouncementsPage'
import SchedulePage from '@/pages/SchedulePage'
import CommunicationSettingsPage from '@/pages/CommunicationSettingsPage'
import ReportsPage from '@/pages/ReportsPage'
import PublicContentPage from '@/pages/PublicContentPage'
import EventsPage from '@/pages/EventsPage'
import LibraryPage from '@/pages/LibraryPage'
import TransportPage from '@/pages/TransportPage'
import InventoryPage from '@/pages/InventoryPage'
import HrPage from '@/pages/HrPage'
import StudentWelfarePage from '@/pages/StudentWelfarePage'
import AlumniPage from '@/pages/AlumniPage'
import HostelPage from '@/pages/HostelPage'
import CanteenPage from '@/pages/CanteenPage'
import IdCardsPage from '@/pages/IdCardsPage'
import LeavePage from '@/pages/LeavePage'
import VisitorPage from '@/pages/VisitorPage'
import ReceptionPage from '@/pages/ReceptionPage'
import AdmissionsPage from '@/pages/AdmissionsPage'
import DepartmentsPage from '@/pages/DepartmentsPage'
import DesignationsPage from '@/pages/DesignationsPage'
import ClassDetailPage from '@/pages/ClassDetailPage'
import SubjectsPage from '@/pages/SubjectsPage'
import CurriculumPage from '@/pages/CurriculumPage'
import HomeworkPage from '@/pages/HomeworkPage'
import LessonPlansPage from '@/pages/LessonPlansPage'
import InvoicesPage from '@/pages/InvoicesPage'
import DiscountsPage from '@/pages/DiscountsPage'
import AccountingPage from '@/pages/AccountingPage'
import ExpensesPage from '@/pages/ExpensesPage'
import ProcurementPage from '@/pages/ProcurementPage'
import PayrollPage from '@/pages/PayrollPage'
import EmployeeLoansPage from '@/pages/EmployeeLoansPage'
import PerformanceReviewsPage from '@/pages/PerformanceReviewsPage'
import RecruitmentPage from '@/pages/RecruitmentPage'
import EmployeeContractsPage from '@/pages/EmployeeContractsPage'
import OnlineExamsPage from '@/pages/OnlineExamsPage'
import QuestionBanksPage from '@/pages/QuestionBanksPage'
import QuestionsPage from '@/pages/QuestionsPage'
import ExamResultsPage from '@/pages/ExamResultsPage'
import ExamHallsPage from '@/pages/ExamHallsPage'
import PromotionsPage from '@/pages/PromotionsPage'
import CertificatesPage from '@/pages/CertificatesPage'
import PortfoliosPage from '@/pages/PortfoliosPage'
import DeliveryReportsPage from '@/pages/DeliveryReportsPage'
import DisciplinePage from '@/pages/DisciplinePage'
import HealthRecordsPage from '@/pages/HealthRecordsPage'
import BranchesPage from '@/pages/BranchesPage'
import AcademicYearsPage from '@/pages/AcademicYearsPage'
import CommunicationMessagesPage from '@/pages/CommunicationMessagesPage'
import NotificationCenterPage from '@/pages/NotificationCenterPage'
import NotificationTemplatesPage from '@/pages/NotificationTemplatesPage'
import ComplaintsPage from '@/pages/ComplaintsPage'
import SuggestionsPage from '@/pages/SuggestionsPage'
import MeetingsPage from '@/pages/MeetingsPage'
import TransportStudentsPage from '@/pages/TransportStudentsPage'
import FuelLogsPage from '@/pages/FuelLogsPage'
import VehicleMaintenancePage from '@/pages/VehicleMaintenancePage'
import HostelAttendancePage from '@/pages/HostelAttendancePage'
import BedAllocationsPage from '@/pages/BedAllocationsPage'
import SuppliersPage from '@/pages/SuppliersPage'
import AssetsPage from '@/pages/AssetsPage'

/**
 * Application router.
 * Future modules should register via registerModuleRoutes() and be composed here.
 */
export function createAppRouter() {
  return createBrowserRouter([
    {
      path: '/',
      element: <LandingPage />,
    },
    {
      path: '/pricing',
      element: <PricingPage />,
    },
    {
      path: '/contact',
      element: <ContactPage />,
    },
    {
      path: '/faq',
      element: <FAQPage />,
    },
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/dashboard',
      element: <AppLayout />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: 'students', element: <StudentsPage /> },
        { path: 'admissions', element: <AdmissionsPage /> },
        { path: 'teachers', element: <TeachersPage /> },
        { path: 'departments', element: <DepartmentsPage /> },
        { path: 'designations', element: <DesignationsPage /> },
        { path: 'classes', element: <ClassesPage /> },
        { path: 'classes/:id', element: <ClassDetailPage /> },
        { path: 'subjects', element: <SubjectsPage /> },
        { path: 'curriculum', element: <CurriculumPage /> },
        { path: 'schedule', element: <SchedulePage /> },
        { path: 'automatic-timetabling', element: <SchedulePage /> },
        { path: 'attendance', element: <AttendancePage /> },
        { path: 'homework', element: <HomeworkPage /> },
        { path: 'lesson-plans', element: <LessonPlansPage /> },
        { path: 'exams', element: <ExamsPage /> },
        { path: 'online-exams', element: <OnlineExamsPage /> },
        { path: 'question-banks', element: <QuestionBanksPage /> },
        { path: 'questions', element: <QuestionsPage /> },
        { path: 'exam-results', element: <ExamResultsPage /> },
        { path: 'exam-halls', element: <ExamHallsPage /> },
        { path: 'promotions', element: <PromotionsPage /> },
        { path: 'certificates', element: <CertificatesPage /> },
        { path: 'id-cards', element: <IdCardsPage /> },
        { path: 'portfolios', element: <PortfoliosPage /> },
        { path: 'delivery-reports', element: <DeliveryReportsPage /> },
        { path: 'discipline', element: <DisciplinePage /> },
        { path: 'health-records', element: <HealthRecordsPage /> },
        { path: 'parents', element: <ParentsPage /> },
        { path: 'payments', element: <PaymentsPage /> },
        { path: 'invoices', element: <InvoicesPage /> },
        { path: 'discounts', element: <DiscountsPage /> },
        { path: 'accounting', element: <AccountingPage /> },
        { path: 'expenses', element: <ExpensesPage /> },
        { path: 'procurement', element: <ProcurementPage /> },
        { path: 'payroll', element: <PayrollPage /> },
        { path: 'leave-management', element: <LeavePage /> },
        { path: 'employee-loans', element: <EmployeeLoansPage /> },
        { path: 'performance-reviews', element: <PerformanceReviewsPage /> },
        { path: 'recruitment', element: <RecruitmentPage /> },
        { path: 'employee-contracts', element: <EmployeeContractsPage /> },
        { path: 'library', element: <LibraryPage /> },
        { path: 'transport', element: <TransportPage /> },
        { path: 'transport-students', element: <TransportStudentsPage /> },
        { path: 'fuel-logs', element: <FuelLogsPage /> },
        { path: 'vehicle-maintenance', element: <VehicleMaintenancePage /> },
        { path: 'hostel', element: <HostelPage /> },
        { path: 'hostel-attendance', element: <HostelAttendancePage /> },
        { path: 'bed-allocations', element: <BedAllocationsPage /> },
        { path: 'inventory', element: <InventoryPage /> },
        { path: 'suppliers', element: <SuppliersPage /> },
        { path: 'assets', element: <AssetsPage /> },
        { path: 'branches', element: <BranchesPage /> },
        { path: 'academic-years', element: <AcademicYearsPage /> },
        { path: 'academic-terms', element: <AcademicTermsPage /> },
        { path: 'communication-messages', element: <CommunicationMessagesPage /> },
        { path: 'announcements', element: <AnnouncementsPage /> },
        { path: 'announcements-management', element: <AnnouncementsPage /> },
        { path: 'notification-center', element: <NotificationCenterPage /> },
        { path: 'notification-templates', element: <NotificationTemplatesPage /> },
        { path: 'events', element: <EventsPage /> },
        { path: 'public-content', element: <PublicContentPage /> },
        { path: 'complaints', element: <ComplaintsPage /> },
        { path: 'suggestions', element: <SuggestionsPage /> },
        { path: 'meetings', element: <MeetingsPage /> },
        { path: 'reports', element: <ReportsPage /> },
        { path: 'settings', element: <SettingsPage /> },
        { path: 'security-settings', element: <SecuritySettingsPage /> },
        { path: 'communication-settings', element: <CommunicationSettingsPage /> },
        { path: 'roles', element: <RolesPage /> },
        { path: 'permissions', element: <PermissionsPage /> },
        { path: 'student-welfare', element: <StudentWelfarePage /> },
        { path: 'alumni', element: <AlumniPage /> },
        { path: 'visitors', element: <VisitorPage /> },
        { path: 'reception', element: <ReceptionPage /> },
        { path: 'canteen', element: <CanteenPage /> },
        { path: 'id-card', element: <IdCardsPage /> },
        { path: 'leave', element: <LeavePage /> },
        { path: 'hr', element: <HrPage /> },
      ],
    },
    {
      path: '/admin',
      element: <AppLayout />,
      children: [
        { path: 'dashboard', element: <SuperAdminDashboard /> },
        { path: 'schools', element: <SuperAdminSchoolsPage /> },
        { path: 'admins', element: <SuperAdminAdminsPage /> },
        { path: 'plans', element: <SuperAdminPlansPage /> },
        { path: 'features', element: <SuperAdminFeaturesPage /> },
      ],
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <TenantRoute requireTenant={false} />,
          children: [
            {
              element: <SubscriptionRoute />,
              children: [
                {
                  path: 'dashboard',
                  element: <AppLayout />,
                  children: [
                    { index: true, element: <Dashboard /> },
                    { path: 'students', element: <StudentsPage /> },
                    { path: 'admissions', element: <AdmissionsPage /> },
                    { path: 'teachers', element: <TeachersPage /> },
                    { path: 'departments', element: <DepartmentsPage /> },
                    { path: 'designations', element: <DesignationsPage /> },
                    { path: 'classes', element: <ClassesPage /> },
                    { path: 'classes/:id', element: <ClassDetailPage /> },
                    { path: 'subjects', element: <SubjectsPage /> },
                    { path: 'curriculum', element: <CurriculumPage /> },
                    { path: 'schedule', element: <SchedulePage /> },
                    { path: 'automatic-timetabling', element: <SchedulePage /> },
                    { path: 'attendance', element: <AttendancePage /> },
                    { path: 'homework', element: <HomeworkPage /> },
                    { path: 'lesson-plans', element: <LessonPlansPage /> },
                    { path: 'exams', element: <ExamsPage /> },
                    { path: 'online-exams', element: <OnlineExamsPage /> },
                    { path: 'question-banks', element: <QuestionBanksPage /> },
                    { path: 'questions', element: <QuestionsPage /> },
                    { path: 'exam-results', element: <ExamResultsPage /> },
                    { path: 'exam-halls', element: <ExamHallsPage /> },
                    { path: 'promotions', element: <PromotionsPage /> },
                    { path: 'certificates', element: <CertificatesPage /> },
                    { path: 'id-cards', element: <IdCardsPage /> },
                    { path: 'portfolios', element: <PortfoliosPage /> },
                    { path: 'delivery-reports', element: <DeliveryReportsPage /> },
                    { path: 'discipline', element: <DisciplinePage /> },
                    { path: 'health-records', element: <HealthRecordsPage /> },
                    { path: 'parents', element: <ParentsPage /> },
                    { path: 'payments', element: <PaymentsPage /> },
                    { path: 'invoices', element: <InvoicesPage /> },
                    { path: 'discounts', element: <DiscountsPage /> },
                    { path: 'accounting', element: <AccountingPage /> },
                    { path: 'expenses', element: <ExpensesPage /> },
                    { path: 'procurement', element: <ProcurementPage /> },
                    { path: 'payroll', element: <PayrollPage /> },
                    { path: 'leave-management', element: <LeavePage /> },
                    { path: 'employee-loans', element: <EmployeeLoansPage /> },
                    { path: 'performance-reviews', element: <PerformanceReviewsPage /> },
                    { path: 'recruitment', element: <RecruitmentPage /> },
                    { path: 'employee-contracts', element: <EmployeeContractsPage /> },
                    { path: 'library', element: <LibraryPage /> },
                    { path: 'transport', element: <TransportPage /> },
                    { path: 'transport-students', element: <TransportStudentsPage /> },
                    { path: 'fuel-logs', element: <FuelLogsPage /> },
                    { path: 'vehicle-maintenance', element: <VehicleMaintenancePage /> },
                    { path: 'hostel', element: <HostelPage /> },
                    { path: 'hostel-attendance', element: <HostelAttendancePage /> },
                    { path: 'bed-allocations', element: <BedAllocationsPage /> },
                    { path: 'inventory', element: <InventoryPage /> },
                    { path: 'suppliers', element: <SuppliersPage /> },
                    { path: 'assets', element: <AssetsPage /> },
                    { path: 'branches', element: <BranchesPage /> },
                    { path: 'academic-years', element: <AcademicYearsPage /> },
                    { path: 'academic-terms', element: <AcademicTermsPage /> },
                    { path: 'communication-messages', element: <CommunicationMessagesPage /> },
                    { path: 'announcements', element: <AnnouncementsPage /> },
                    { path: 'announcements-management', element: <AnnouncementsPage /> },
                    { path: 'notification-center', element: <NotificationCenterPage /> },
                    { path: 'notification-templates', element: <NotificationTemplatesPage /> },
                    { path: 'events', element: <EventsPage /> },
                    { path: 'public-content', element: <PublicContentPage /> },
                    { path: 'complaints', element: <ComplaintsPage /> },
                    { path: 'suggestions', element: <SuggestionsPage /> },
                    { path: 'meetings', element: <MeetingsPage /> },
                    { path: 'reports', element: <ReportsPage /> },
                    { path: 'settings', element: <SettingsPage /> },
                    { path: 'security-settings', element: <SecuritySettingsPage /> },
                    { path: 'communication-settings', element: <CommunicationSettingsPage /> },
                    { path: 'roles', element: <RolesPage /> },
                    { path: 'permissions', element: <PermissionsPage /> },
                    { path: 'student-welfare', element: <StudentWelfarePage /> },
                    { path: 'alumni', element: <AlumniPage /> },
                    { path: 'visitors', element: <VisitorPage /> },
                    { path: 'reception', element: <ReceptionPage /> },
                    { path: 'canteen', element: <CanteenPage /> },
                    { path: 'id-card', element: <IdCardsPage /> },
                    { path: 'leave', element: <LeavePage /> },
                    { path: 'hr', element: <HrPage /> },
                    {
                      path: 'enterprise',
                      children: [
                        { index: true, element: <EnterpriseSuitePage /> },
                        { path: 'ai', element: <AiDashboardPage /> },
                        { path: 'bi', element: <BiDashboardPage /> },
                        { path: 'automation', element: <AutomationEnginePage /> },
                      ],
                    },
                  ],
                },
                {
                  path: 'admin',
                  element: <AppLayout />,
                  children: [
                    { path: 'dashboard', element: <SuperAdminDashboard /> },
                    { path: 'schools', element: <SuperAdminSchoolsPage /> },
                    { path: 'admins', element: <SuperAdminAdminsPage /> },
                    { path: 'plans', element: <SuperAdminPlansPage /> },
                    { path: 'features', element: <SuperAdminFeaturesPage /> },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    { path: '/home', element: <Navigate to="/" replace /> },
    { path: '*', element: <NotFoundPage /> },
  ])
}
