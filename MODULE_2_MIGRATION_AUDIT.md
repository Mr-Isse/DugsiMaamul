# MODULE 2 — FRONTEND MIGRATION AUDIT REPORT

## EXECUTIVE SUMMARY

The old frontend (`frontend/`) is a comprehensive School ERP system with **150+ pages**, **3 distinct user portals**, **complex RBAC**, **tenant isolation**, and **plan-based feature access**. This audit identifies all functionality that must be migrated to the new Client (`Client/`) while preserving the approved new UI design.

---

## 1. ARCHITECTURE OVERVIEW

### 1.1 User Portals

| Portal | Base Route | Layout | Target Users |
|--------|------------|--------|--------------|
| School Admin | `/` | AdminLayout | schooladmin, admin, branch_manager, teacher, student |
| Super Admin | `/admin` | SuperAdminLayout | superadmin, super_admin |
| Parent Portal | `/parent` | ParentLayout | parent |
| Public Marketing | `/` | MarketingLayout | Unauthenticated visitors |

### 1.2 Route Protection

- **SchoolAdminProtectedRoute**: Requires auth, redirects superadmins to /admin, enforces profile setup
- **SuperAdminProtectedRoute**: Requires superadmin role only
- **SuperAdminPublicRoute**: Redirects logged-in superadmins away from auth pages
- **FeatureGate**: Route-level feature access control based on subscription plan

### 1.3 Tenant Detection

**Multi-tenant architecture with three detection methods:**

1. **Subdomain-based**: `schoolname.example.com` → extracts `schoolname`
2. **Query parameter**: `?school=slug` or `?tenantId=slug`
3. **User-based**: Falls back to `user.school.subdomain`

**Headers sent to API:**
- `X-School-Slug`: School identifier
- `X-Tenant-ID`: Tenant identifier
- `x-branch-id`: Selected branch (if applicable)
- `x-academic-year-id`: Selected academic year (if applicable)
- `Authorization`: Bearer token

---

## 2. SCHOOL ADMIN FUNCTIONALITY

### 2.1 Core Academic Management

| Old Route | Old Page | API Endpoints | Permission | Feature | Priority |
|-----------|----------|---------------|------------|---------|----------|
| `/` | Dashboard | `/admin/dashboard/stats` | - | - | HIGH |
| `/students` | StudentsManagement | `/admin/students` (CRUD) | `students.view` | `students` | HIGH |
| `/teachers` | TeachersManagement | `/admin/teachers` (CRUD) | `teachers.view` | `teachers` | HIGH |
| `/parents` | ParentsManagement | `/admin/parents` (CRUD) | `students.view` | `parents` | HIGH |
| `/classes` | ClassesManagement | `/admin/classes` (CRUD) | `classes.view` | `classes` | HIGH |
| `/subjects` | SubjectsManagement | `/admin/subjects` (CRUD) | `subjects.view` | `subjects` | HIGH |
| `/branches` | BranchesManagement | `/branches` | `settings.manage` | - | HIGH |
| `/academic-years` | AcademicYearsManagement | `/academic/years` | `settings.manage` | - | HIGH |
| `/academic-terms` | AcademicTermsManagement | `/academic/terms` | `settings.manage` | - | HIGH |
| `/schedule` | ScheduleManagement | `/admin/schedule` | `classes.view` | - | MEDIUM |
| `/attendance` | AttendanceManagement | `/admin/attendance` | `attendance.view` | `attendance` | HIGH |

### 2.2 Examination System

| Old Route | Old Page | API Endpoints | Permission | Feature | Priority |
|-----------|----------|---------------|------------|---------|----------|
| `/exams` | ExamsManagement | `/admin/exams` | `exams.view` | `exams` | HIGH |
| `/online-exams` | StudentExamPage | `/admin/online-exams` | `exams.view` | `online-exams` | MEDIUM |
| `/question-banks` | QuestionBankManagement | `/admin/question-banks` | `exams.view` | `question-banks` | MEDIUM |
| `/questions` | QuestionManagement | `/admin/questions` | `exams.view` | `question-banks` | MEDIUM |
| `/exam-results` | ExamResults | `/admin/exam-results` | `exams.view` | - | HIGH |
| `/exam-halls` | ExamHallsManagement | `/admin/exam-halls` | `exams.view` | - | MEDIUM |
| `/promotions` | StudentPromotions | `/admin/promotions` | `students.view` | - | MEDIUM |
| `/certificates` | CertificatesManagement | `/admin/certificates` | `exams.view` | `certificates` | LOW |
| `/id-cards` | IDCardsManagement | `/admin/id-cards` | `students.view` | `id-cards` | LOW |
| `/portfolios` | PortfoliosManagement | `/admin/portfolios` | `students.view` | `portfolios` | LOW |

### 2.3 Finance Module

| Old Route | Old Page | API Endpoints | Permission | Feature | Priority |
|-----------|----------|---------------|------------|---------|----------|
| `/payments` | PaymentsManagement | `/admin/payments` | `finance.view` | `finance` | HIGH |
| `/invoices` | InvoicesManagement | `/admin/invoices` | `finance.view` | `invoices` | MEDIUM |
| `/discounts` | DiscountsManagement | `/admin/discounts` | `finance.manage` | `discounts` | MEDIUM |
| `/accounting` | AccountingManagement | `/admin/accounting` | `finance.manage` | `accounting` | MEDIUM |
| `/expenses` | ExpenseManagement | `/admin/expenses` | `finance.manage` | `expenses` | MEDIUM |
| `/procurement` | ProcurementManagement | `/admin/procurement` | `finance.manage` | `procurement` | LOW |
| `/revenue-reports` | RevenueReports | `/admin/revenue-reports` | `finance.view` | `revenue-reports` | MEDIUM |
| `/enterprise-finance` | EnterpriseFinanceManagement | `/admin/enterprise-finance` | `finance.manage` | `enterprise-finance` | LOW |
| `/revenue-forecast` | RevenueForecast | `/admin/revenue-forecast` | `finance.manage` | `revenue-forecast` | LOW |

### 2.4 HR & Payroll

| Old Route | Old Page | API Endpoints | Permission | Feature | Priority |
|-----------|----------|---------------|------------|---------|----------|
| `/payroll` | PayrollManagement | `/admin/payroll` | `finance.manage` | `payroll` | MEDIUM |
| `/leave-management` | LeaveManagement | `/admin/leave` | `teachers.view` | `leave-management` | MEDIUM |
| `/employee-loans` | EmployeeLoansManagement | `/admin/employee-loans` | `finance.manage` | `employee-loans` | LOW |
| `/performance-reviews` | PerformanceReviewsManagement | `/admin/performance-reviews` | `teachers.view` | `performance-reviews` | LOW |
| `/recruitment` | RecruitmentManagement | `/admin/recruitment` | `teachers.view` | `recruitment` | LOW |
| `/employee-contracts` | EmployeeContractsManagement | `/admin/employee-contracts` | `teachers.view` | `employee-contracts` | LOW |

### 2.5 Operations

| Old Route | Old Page | API Endpoints | Permission | Feature | Priority |
|-----------|----------|---------------|------------|---------|----------|
| `/library` | LibraryManagement | `/admin/library` | `settings.view` | `library` | LOW |
| `/transport` | TransportManagement | `/admin/transport` | `settings.view` | `transport` | LOW |
| `/transport-students` | TransportStudentsManagement | `/admin/transport-students` | `settings.view` | `transport-students` | LOW |
| `/fuel-logs` | FuelLogsManagement | `/admin/fuel-logs` | `settings.view` | `fuel-logs` | LOW |
| `/vehicle-maintenance` | VehicleMaintenanceManagement | `/admin/vehicle-maintenance` | `settings.view` | `vehicle-maintenance` | LOW |
| `/hostel` | HostelManagement | `/admin/hostel` | `settings.view` | `hostel` | LOW |
| `/hostel-attendance` | HostelAttendancePage | `/admin/hostel-attendance` | `settings.view` | `hostel-attendance` | LOW |
| `/bed-allocations` | BedAllocationsManagement | `/admin/bed-allocations` | `settings.view` | `bed-allocation` | LOW |
| `/inventory` | InventoryManagement | `/admin/inventory` | `settings.view` | `inventory` | LOW |
| `/suppliers` | SuppliersManagement | `/admin/suppliers` | `settings.view` | `suppliers` | LOW |
| `/assets` | AssetsManagement | `/admin/assets` | `settings.view` | `assets` | LOW |

### 2.6 Student Welfare

| Old Route | Old Page | API Endpoints | Permission | Feature | Priority |
|-----------|----------|---------------|------------|---------|----------|
| `/discipline` | DisciplineManagement | `/admin/discipline` | `students.view` | `discipline` | LOW |
| `/health-records` | HealthRecordsManagement | `/admin/health-records` | `students.view` | `health` | LOW |
| `/alumni` | AlumniManagement | `/admin/alumni` | `students.view` | `alumni` | LOW |
| `/visitors` | VisitorsManagement | `/admin/visitors` | `settings.view` | `visitors` | LOW |

### 2.7 Communication

| Old Route | Old Page | API Endpoints | Permission | Feature | Priority |
|-----------|----------|---------------|------------|---------|----------|
| `/communication-messages` | CommunicationMessages | `/admin/communication` | `settings.manage` | `messaging` | MEDIUM |
| `/announcements` | AnnouncementsManagement | `/admin/announcements` | `settings.manage` | - | HIGH |
| `/announcements-management` | AnnouncementsCenter | `/admin/announcements-mgmt` | `settings.manage` | `announcements` | LOW |
| `/notification-center` | NotificationCenter | `/admin/notifications` | `settings.manage` | - | MEDIUM |
| `/notification-templates` | NotificationTemplatesManagement | `/admin/notification-templates` | `settings.manage` | - | MEDIUM |
| `/events` | EventsManagement | `/admin/events` | `settings.view` | - | MEDIUM |
| `/public-content` | PublicContentManagement | `/admin/public-content` | `settings.manage` | - | MEDIUM |
| `/complaints` | ComplaintManagement | `/admin/complaints` | `settings.manage` | `complaints` | LOW |
| `/suggestions` | SuggestionBox | `/admin/suggestions` | `settings.view` | `suggestions` | LOW |
| `/meetings` | MeetingScheduler | `/admin/meetings` | `settings.view` | `meeting-scheduler` | LOW |

### 2.8 Enterprise & Analytics

| Old Route | Old Page | API Endpoints | Permission | Feature | Priority |
|-----------|----------|---------------|------------|---------|----------|
| `/reports` | ReportsCenter | `/admin/reports` | `settings.view` | `reports` | MEDIUM |
| `/business-intelligence` | BusinessIntelligence | `/admin/bi` | `settings.view` | `business-intelligence` | LOW |
| `/executive-dashboard` | ExecutiveDashboard | `/admin/executive-dashboard` | `settings.view` | `executive-dashboard` | LOW |
| `/ai-learning-assistant` | AILearningAssistant | `/admin/ai-learning` | `students.view` | `ai-learning-assistant` | LOW |
| `/ai-dashboard` | AIDashboard | `/admin/ai-dashboard` | `students.view` | `ai-learning-assistant` | LOW |
| `/bi-dashboard` | BIDashboard | `/admin/bi-dashboard` | `settings.view` | `performance-tracking` | LOW |
| `/ai-parent-reports` | AIParentReports | `/admin/ai-parent-reports` | `students.view` | `ai-parent-reports` | LOW |
| `/risk-assessment` | RiskAssessment | `/admin/risk-assessment` | `settings.manage` | `risk-assessment` | LOW |
| `/risk-register` | RiskRegisterPage | `/admin/risk-register` | `settings.manage` | `risk-register` | LOW |
| `/incidents` | IncidentManagement | `/admin/incidents` | `settings.manage` | `incident-management` | LOW |
| `/performance-tracking` | PerformanceTracking | `/admin/performance-tracking` | `settings.view` | `performance-tracking` | LOW |
| `/cross-school-analytics` | BusinessIntelligence | `/admin/cross-school-analytics` | `settings.view` | `cross-school-analytics` | LOW |
| `/regional-dashboard` | ExecutiveDashboard | `/admin/regional-dashboard` | `settings.view` | `regional-dashboard` | LOW |
| `/enterprise-suite` | EnterpriseSuite | `/admin/enterprise-suite` | `settings.manage` | `enterprise-suite` | LOW |

### 2.9 Workflow & Automation

| Old Route | Old Page | API Endpoints | Permission | Feature | Priority |
|-----------|----------|---------------|------------|---------|----------|
| `/workflow` | WorkflowManagement | `/admin/workflow` | `settings.manage` | `workflow-automation` | LOW |
| `/automation` | AutomationEngine | `/admin/automation` | `settings.manage` | `automation-engine` | LOW |
| `/tasks` | TaskManagementPage | `/admin/tasks` | `settings.view` | `task-management` | LOW |
| `/tickets` | TicketSystem | `/admin/tickets` | `settings.manage` | `ticketing` | LOW |
| `/support` | SupportTickets | `/admin/support` | `settings.view` | `support` | LOW |
| `/help` | HelpCenter | `/admin/help` | `settings.view` | `help-center` | LOW |
| `/knowledge-base` | KnowledgeBasePage | `/admin/knowledge-base` | `settings.view` | `knowledge-base` | LOW |

### 2.10 Administration & Settings

| Old Route | Old Page | API Endpoints | Permission | Feature | Priority |
|-----------|----------|---------------|------------|---------|----------|
| `/activity` | ActivityCenter | `/admin/activity` | `settings.view` | - | MEDIUM |
| `/audit` | AuditLogViewer | `/admin/audit` | `settings.manage` | - | MEDIUM |
| `/finance-audit` | FinanceAuditViewer | `/admin/finance-audit` | `finance.manage` | `finance-audit` | LOW |
| `/documents` | DocumentsManagement | `/admin/documents` | `settings.view` | `documents` | LOW |
| `/document-management` | DocumentManagement | `/admin/document-mgmt` | `settings.view` | `documents` | LOW |
| `/roles` | RoleManagement | `/admin/roles` | `settings.manage` | - | HIGH |
| `/permissions` | PermissionManagement | `/admin/permissions` | `settings.manage` | - | HIGH |
| `/plans` | Plans | `/admin/plans` | `settings.view` | - | MEDIUM |
| `/settings` | SchoolSettings | `/admin/settings` | `settings.manage` | `settings` | HIGH |
| `/security-settings` | SecuritySettings | `/admin/security-settings` | `settings.manage` | - | HIGH |
| `/communication-settings` | CommunicationSettings | `/admin/communication-settings` | `settings.manage` | - | MEDIUM |
| `/advanced-security` | SecurityDashboard | `/admin/advanced-security` | `settings.manage` | `advanced-security` | LOW |
| `/api-keys` | ApiKeysManagement | `/admin/api-keys` | `settings.manage` | `api-keys` | LOW |
| `/api-platform` | APIPlatform | `/admin/api-platform` | `settings.manage` | `api-platform` | LOW |
| `/login-history` | LoginHistoryPage | `/admin/login-history` | `settings.manage` | `login-history` | LOW |
| `/ip-restrictions` | IpRestrictionsManagement | `/admin/ip-restrictions` | `settings.manage` | `ip-restrictions` | LOW |
| `/password-policies` | PasswordPolicyPage | `/admin/password-policies` | `settings.manage` | `password-policies` | LOW |
| `/system-health` | SystemHealthDashboard | `/admin/system-health` | `settings.view` | `system-health` | LOW |
| `/backups` | BackupManager | `/admin/backups` | `settings.manage` | `backups` | LOW |
| `/backup-management` | BackupManagementPage | `/admin/backup-mgmt` | `settings.manage` | `backup` | LOW |
| `/data-recovery` | DataRecoveryCenter | `/admin/data-recovery` | `settings.manage` | `data-recovery` | LOW |
| `/white-label` | WhiteLabelSettings | `/admin/white-label` | `settings.manage` | `white-label` | LOW |
| `/dynamic-config` | DynamicConfigBuilder | `/admin/dynamic-config` | `settings.manage` | `dynamic-config` | LOW |

### 2.11 Additional Features

| Old Route | Old Page | API Endpoints | Permission | Feature | Priority |
|-----------|----------|---------------|------------|---------|----------|
| `/admissions` | AdmissionsManagement | `/admin/admissions` | `students.view` | `admissions` | MEDIUM |
| `/departments` | DepartmentsManagement | `/admin/departments` | `teachers.view` | `departments` | MEDIUM |
| `/designations` | DesignationsManagement | `/admin/designations` | `teachers.view` | `designations` | MEDIUM |
| `/homework` | HomeworkManagement | `/admin/homework` | `students.view` | `homework` | LOW |
| `/lesson-plans` | LessonPlansManagement | `/admin/lesson-plans` | `teachers.view` | `lesson-plans` | LOW |
| `/curriculum` | CurriculumManagement | `/admin/curriculum` | `subjects.view` | `curriculum` | LOW |
| `/automatic-timetabling` | AutomaticTimetabling | `/admin/automatic-timetabling` | `classes.view` | `automatic-timetabling` | LOW |
| `/delivery-reports` | DeliveryReports | `/admin/delivery-reports` | `exams.view` | `delivery-reports` | LOW |

---

## 3. SUPER ADMIN FUNCTIONALITY

### 3.1 Super Admin Routes

| Old Route | Old Page | API Endpoints | Permission | Priority |
|-----------|----------|---------------|------------|----------|
| `/admin` | SuperAdminDashboard | `/super-admin/dashboard/stats` | superadmin only | HIGH |
| `/admin/schools` | Schools | `/super-admin/schools` | superadmin only | HIGH |
| `/admin/features` | SchoolFeatures | `/super-admin/feature-registry` | superadmin only | HIGH |
| `/admin/admins` | SchoolAdmins | `/super-admin/admins` | superadmin only | HIGH |
| `/admin/admins/register` | RegisterSchoolAdmin | `/super-admin/register-school-admin` | superadmin only | HIGH |
| `/admin/subscriptions` | SubscriptionsManagement | `/super-admin/subscriptions` | superadmin only | HIGH |
| `/admin/plans` | PlansManagement | `/super-admin/plans` | superadmin only | HIGH |
| `/admin/leads` | LeadsManagement | `/super-admin/leads` | superadmin only | MEDIUM |
| `/admin/tickets` | TicketsManagement | `/super-admin/tickets` | superadmin only | MEDIUM |
| `/admin/errors` | ErrorLogs | `/super-admin/errors` | superadmin only | MEDIUM |
| `/admin/system` | SystemManagement | `/super-admin/system` | superadmin only | MEDIUM |

### 3.2 Super Admin API Endpoints

**From `superAdminApiSlice.js`:**
- `getDashboardStats`: `/super-admin/dashboard/stats`
- `getSchools`: `/super-admin/schools`
- `getSaasAnalytics`: `/super-admin/analytics`
- `getSchoolAdmins`: `/super-admin/admins`
- `createSchoolAdmin`: `/super-admin/register-school-admin`
- `deleteSchoolAdmin`: `/super-admin/admins/{id}`
- `toggleSchoolAdminStatus`: `/super-admin/admins/{id}/toggle-status`
- `getPlans`: `/super-admin/plans`
- `createPlan`: `/super-admin/plans`
- `updatePlan`: `/super-admin/plans/{id}`
- `archivePlan`: `/super-admin/plans/{id}`
- `getFeatureRegistry`: `/super-admin/feature-registry`
- `assignPlanToSchool`: `/super-admin/schools/{schoolId}/assign-plan`
- Subscriptions management endpoints
- Leads management endpoints

---

## 4. PARENT PORTAL FUNCTIONALITY

### 4.1 Parent Routes

| Old Route | Old Page | API Endpoints | Permission | Priority |
|-----------|----------|---------------|------------|----------|
| `/parent/login` | ParentLogin | `/enterprise/parent/login` | public | HIGH |
| `/parent` | ParentDashboard | `/enterprise/parent/dashboard` | parent only | HIGH |
| `/parent/announcements` | ParentAnnouncements | `/enterprise/parent/announcements` | parent only | MEDIUM |
| `/parent/child/:childId` | ParentChildDetail | `/enterprise/parent/children/{id}/*` | parent only | HIGH |

### 4.2 Parent API Endpoints

**From `parentApiSlice.js`:**
- `getParentChildren`: `/enterprise/parent/children`
- `getChildProfile`: `/enterprise/parent/children/{studentId}/profile`
- `getChildAttendance`: `/enterprise/parent/children/{studentId}/attendance`
- `getChildResults`: `/enterprise/parent/children/{studentId}/results`
- `getChildFees`: `/enterprise/parent/children/{studentId}/fees`
- `getChildTimetable`: `/enterprise/parent/children/{studentId}/timetable`
- `getParentAnnouncements`: `/enterprise/parent/announcements`

---

## 5. PUBLIC MARKETING PAGES

| Old Route | Old Page | API Endpoints | Priority |
|-----------|----------|---------------|----------|
| `/` | LandingPage | - | HIGH |
| `/platform` | PlatformPage | - | MEDIUM |
| `/pricing` | PricingPage | `/public/pricing` | HIGH |
| `/contact` | ContactPage | `/public/contact` | MEDIUM |
| `/about` | AboutPage | - | LOW |
| `/faq` | FAQPage | - | LOW |
| `/privacy` | PrivacyPolicy | - | LOW |
| `/terms` | TermsOfService | - | LOW |
| `/maintenance` | Maintenance | - | LOW |

---

## 6. AUTHENTICATION & AUTHENTICATION FLOW

### 6.1 Authentication Endpoints

**From `apiSlice.js`:**
- Login: `/auth/login`
- Refresh: `/auth/refresh`
- Logout: `/auth/logout`
- Verify Email: `/auth/verify-email`

### 6.2 Authentication State

**Auth Slice (`authSlice.js`):**
- `userInfo`: Stored in localStorage
- `setCredentials`: Sets user info
- `logout`: Clears user info

### 6.3 Role-Based Routing Logic

**From `App.jsx`:**
```javascript
// Role detection
isSchoolUser = ['schooladmin', 'school_admin', 'admin', 'branch_manager', 'branchmanager', 'teacher', 'student']
isSuperAdmin = ['superadmin', 'super_admin']
isParent = ['parent']

// Route selection based on role
if (userInfo?.role === 'parent') → ParentPortalRoutes
if (isSchoolUser) → SchoolAdminDashboardRoutes
if (isSuperAdmin) → PlatformPublicRoutes (which includes SuperAdmin routes)
```

---

## 7. RBAC & PERMISSIONS SYSTEM

### 7.1 Permission Structure

**Format:** `module.action` (e.g., `students.view`, `finance.manage`)

**Wildcards:**
- `module.*`: All actions for a module
- `*.manage`: All manage actions
- `*.*`: All permissions

### 7.2 Permission Hierarchy

1. **Super Admin**: All permissions automatically
2. **School Admin**: All permissions for their school
3. **Branch Manager**: Branch-scoped permissions
4. **Teachers/Students**: Specific role-based permissions
5. **Parents**: Read-only access to their children's data

### 7.3 Permission Utilities

**From `permissions.js`:**
- `hasPermission(user, permission)`: Check single permission
- `hasAnyPermission(user, permissions)`: Check if user has any of the permissions
- `hasAllPermissions(user, permissions)`: Check if user has all permissions
- `getEffectivePermissions(user)`: Get all permissions (direct + role + overrides)
- `canAccessModule(user, module)`: Check if user can access a module
- `PermissionGuard`: Component wrapper for permission-based rendering
- `RoleGuard`: Component wrapper for role-based rendering

### 7.4 Permission Overrides

Users can have permission overrides:
- `granted: true`: Add permission
- `granted: false`: Remove permission

---

## 8. FEATURE ACCESS & PLAN-BASED ACCESS

### 8.1 Feature Access System

**From `featureAccess.js`:**

**Communication Features (always allowed):**
- announcements, notifications, push-notifications, sms, email-automation, whatsapp, bulk-messaging, automated-alerts

**Feature Check Logic:**
1. Super admins → Always allowed
2. Communication features → Always allowed
3. Check `school.enabledFeatures` from backend
4. Fallback to `school.subscription.plan.features` + `school.settings.enabledModules`
5. If plan has `ALL_MODULES` → Everything allowed

### 8.2 Feature Gate Component

**From `FeatureGate.jsx`:**
- Route-level feature gate
- Redirects to `/` if feature not enabled
- Super admins always pass
- Communication features always pass

### 8.3 Subscription Expiration

**From `featureAccess.js`:**
- `isSubscriptionExpired(user)`: Check if subscription is expired
- `EXPIRED_ALLOWED_FEATURES`: Features still accessible when expired (support, settings, communication)

---

## 9. TENANT DETECTION & ISOLATION

### 9.1 Tenant Detection Methods

**From `apiSlice.js`:**

1. **Subdomain**: Extract from `window.location.hostname`
   - `schoolname.example.com` → `schoolname`

2. **Query Parameter**: `?school=slug` or `?tenantId=slug`

3. **User-Based**: `user.school.subdomain`

### 9.2 Tenant Headers

Headers sent with every API request:
- `X-School-Slug`: School identifier
- `X-Tenant-ID`: Tenant identifier
- `x-branch-id`: Selected branch (from Redux branch slice)
- `x-academic-year-id`: Selected academic year (from Redux academic slice)

### 9.3 Tenant State

**From `tenantSlice.js`:**
- `tenantInfo`: Tenant information
- `isSuperAdmin`: Boolean flag
- `setSchoolTenantFromUser`: Set tenant from logged-in user's school

### 9.4 Branch & Academic Year Selection

**From Redux slices:**
- `branchSlice`: `selectedBranch`
- `academicSlice`: `selectedYear`

These are sent as headers to scope API requests to specific branches/years.

---

## 10. API STRUCTURE

### 10.1 Admin API Slice

**File:** `store/adminApiSlice.js`

**Tag Types:** User, School, Student, Teacher, Parent, Class, Subject, Attendance, Exam, Mark, Payment, Report, Dashboard, Schedule, Announcement, Branch, AcademicYear, AcademicTerm, Notification, Document, Admission, Asset, Discount, LibraryBook, TransportRoute, Enterprise, Certificate, Hostel, FeeStructure, CalendarEvent, IDCard, IDCardDesign, Payroll, SalaryStructure, Leave, ReportCard, Expense, and many more...

**Key Endpoints:**
- Parents: `/admin/parents` (CRUD)
- Branches: `/branches`
- Academic Years: `/academic/years`
- Academic Terms: `/academic/terms`
- Parent Portal: `/enterprise/parent/*`

### 10.2 Super Admin API Slice

**File:** `store/superAdminApiSlice.js`

**Tag Types:** SuperStats, SuperSchools, SuperAdmins, SuperPlans, SuperAnalytics, SuperSubscriptions, SchoolFeatures

**Key Endpoints:**
- Dashboard Stats: `/super-admin/dashboard/stats`
- Schools: `/super-admin/schools`
- School Admins: `/super-admin/admins`
- Plans: `/super-admin/plans`
- Feature Registry: `/super-admin/feature-registry`
- Subscriptions: `/super-admin/subscriptions`

### 10.3 Parent API Slice

**File:** `store/parentApiSlice.js`

**Key Endpoints:**
- Children: `/enterprise/parent/children`
- Child Profile: `/enterprise/parent/children/{id}/profile`
- Child Attendance: `/enterprise/parent/children/{id}/attendance`
- Child Results: `/enterprise/parent/children/{id}/results`
- Child Fees: `/enterprise/parent/children/{id}/fees`
- Child Timetable: `/enterprise/parent/children/{id}/timetable`
- Announcements: `/enterprise/parent/announcements`

---

## 11. NAVIGATION STRUCTURE

### 11.1 School Navigation Categories

**From `config/navigation.js`:**

1. **Overview** - Dashboard
2. **Academic Management** - Students, Teachers, Departments, Designations, Parents, Classes, Subjects, Curriculum, Schedule, Automatic Timetabling, Attendance, Homework, Lesson Plans
3. **Examinations** - Exams, Online Exams, Question Banks, Questions, Exam Results, Exam Halls, Promotions, Certificates, ID Cards, Portfolios, Delivery Reports
4. **Student Welfare** - Discipline, Health Records, Alumni, Visitors
5. **Finance** - Finance, Invoices, Discounts, Accounting, Expenses, Procurement, Revenue Reports, Enterprise Finance, Revenue Forecast
6. **HR & Payroll** - Payroll, Leave Management, Employee Loans, Performance Reviews, Recruitment, Employee Contracts
7. **Operations** - Library, Transport, Transport Students, Fuel Logs, Vehicle Maintenance, Hostel, Hostel Attendance, Bed Allocations, Inventory, Suppliers, Assets
8. **Academic Administration** - Branches, Academic Years, Academic Terms
9. **Communication** - Communication, Announcements, Announcements Mgmt, Notification Center, Notification Templates, Events, Public Content, Complaints, Suggestions, Meetings
10. **Enterprise** - Reports, Analytics, Executive Dashboard, AI Learning, AI Dashboard, BI Dashboard, AI Parent Reports, Risk Assessment, Risk Register, Incidents, Performance Tracking, Cross-School Analytics, Regional Dashboard, Enterprise Suite
11. **Workflow & Automation** - Workflow, Automation, Tasks, Tickets, Support Tickets, Help Center, Knowledge Base
12. **Administration** - Activity Center, Audit Logs, Finance Audit, Documents, Document Mgmt, Roles, Permissions, Plans, Settings, Security Settings, Communication Settings, Advanced Security, API Keys, API Platform, Login History, IP Restrictions, Password Policies, System Health, Backups, Backup Mgmt, Data Recovery, White Label, Dynamic Config

### 11.2 Super Admin Navigation Categories

1. **Platform Overview** - Overview, Schools, Features, Admins
2. **Billing & Plans** - Subscriptions, Plans, Leads
3. **Operations** - Support, Monitoring, System

### 11.3 Navigation Item Structure

```javascript
{
  title: 'Students',
  href: '/students',
  icon: Users,
  permission: 'students.view',
  feature: 'students'
}
```

---

## 12. VALIDATIONS & FORM SCHEMAS

### 12.1 Student Form Validations

**From `StudentsManagement.jsx`:**
- Name: min 2 characters
- Email: valid email format (optional)
- Custom ID: required
- Phone: required
- Parent Name: required
- Parent Phone: required
- Class: required
- Monthly Fees: required
- Gender: enum ['Male', 'Female']
- Age: optional
- Address: optional
- Mode: enum ['Full-time', 'Part-time']
- Place of Birth: optional
- Entry Date: optional
- Mother Name: optional
- Emergency Contact: optional
- Branch: optional
- Password: min 8 characters (optional)

### 12.2 Teacher Form Validations

**From `TeachersManagement.jsx`:**
- Name: min 2 characters
- Email: valid email format (optional)
- Custom ID: required
- Phone: required
- Gender: enum ['Male', 'Female']
- Address: optional
- Qualification: optional
- Experience: optional
- Branch: optional
- Subjects: array of strings (optional)

### 12.3 Class Form Validations

**From `ClassesManagement.jsx`:**
- Name: required
- Section: required
- Class Teacher: optional
- Capacity: optional
- Branch: optional

---

## 13. CURRENT CLIENT STATUS

### 13.1 Already Implemented

**From previous work:**
- ✅ Basic routing structure (`src/routes/index.jsx`)
- ✅ Authentication flow (login, logout)
- ✅ Redux store setup
- ✅ RTK Query API structure (`src/services/api/`)
- ✅ Sidebar with navigation config
- ✅ Dashboard with KPI cards
- ✅ Students page with table view
- ✅ Teachers page with table view
- ✅ Classes page with table view
- ✅ Student form modal with password field
- ✅ Teacher form modal
- ✅ Class form modal
- ✅ Branch selection
- ✅ Academic year selection
- ✅ Feature access logic
- ✅ Permission checking utilities
- ✅ Tenant detection logic
- ✅ API slices for students, teachers, classes, branches, subjects

### 13.2 Missing Components

Based on the audit, the following need to be implemented:

**HIGH PRIORITY:**
- Parents management page
- Attendance management page
- Exams management page
- Settings page
- Security settings page
- Role management page
- Permission management page
- Academic terms management page

**MEDIUM PRIORITY:**
- Finance/Payments page
- Announcements page
- Schedule management page
- Communication settings page
- Reports center
- Public content management
- Events management

**LOW PRIORITY:**
- All enterprise features (AI, BI, automation, etc.)
- Operations features (library, transport, hostel, etc.)
- Advanced admin features (backups, data recovery, white label, etc.)

---

## 14. MIGRATION RECOMMENDATIONS

### 14.1 Phase 1: Core Academic (HIGH PRIORITY)

**Target:** Complete the core school management functionality

1. **Parents Management** - `/parents`
   - CRUD operations for parents
   - Link parents to students
   - Parent profile management

2. **Attendance Management** - `/attendance`
   - Daily attendance recording
   - Attendance reports
   - Attendance statistics

3. **Exams Management** - `/exams`
   - Exam creation and scheduling
   - Exam results entry
   - Exam reports

4. **Settings** - `/settings`
   - School profile settings
   - General configuration

5. **Security Settings** - `/security-settings`
   - Password policies
   - Security configuration

6. **Role Management** - `/roles`
   - Role creation and management
   - Role permissions assignment

7. **Permission Management** - `/permissions`
   - Permission definition
   - Permission assignment

8. **Academic Terms** - `/academic-terms`
   - Term creation and management
   - Term activation

### 14.2 Phase 2: Finance & Communication (MEDIUM PRIORITY)

**Target:** Add financial and communication features

1. **Finance/Payments** - `/payments`
2. **Announcements** - `/announcements`
3. **Schedule Management** - `/schedule`
4. **Communication Settings** - `/communication-settings`
5. **Reports Center** - `/reports`
6. **Public Content** - `/public-content`
7. **Events** - `/events`

### 14.3 Phase 3: Operations & Enterprise (LOW PRIORITY)

**Target:** Add advanced features as needed

1. Library, Transport, Hostel modules
2. Enterprise features (AI, BI, automation)
3. Advanced admin features

### 14.4 Phase 4: Super Admin (HIGH PRIORITY)

**Target:** Implement Super Admin portal

1. Super Admin Dashboard
2. Schools management
3. Plans management
4. School admins management
5. Subscriptions management
6. Feature registry

### 14.5 Phase 5: Parent Portal (HIGH PRIORITY)

**Target:** Implement Parent Portal

1. Parent login
2. Parent dashboard
3. Child profile view
4. Child attendance view
5. Child results view
6. Child fees view
7. Child timetable view

### 14.6 Phase 6: Public Pages (MEDIUM PRIORITY)

**Target:** Implement public marketing pages

1. Landing page
2. Pricing page
3. Contact page
4. About page
5. FAQ page

---

## 15. CRITICAL MIGRATION NOTES

### 15.1 DO NOT CHANGE

- ✅ Keep current Dashboard UI and KPI cards
- ✅ Keep current Sidebar design
- ✅ Keep current design system (Shadcn UI)
- ✅ Keep current routing structure

### 15.2 MUST PRESERVE

- ✅ Tenant detection logic (subdomain, query param, user-based)
- ✅ Permission checking system
- ✅ Feature access system
- ✅ Role-based routing
- ✅ Branch and academic year selection
- ✅ API header structure (X-School-Slug, x-branch-id, etc.)
- ✅ Token refresh logic
- ✅ Error handling

### 15.3 MUST IMPLEMENT

- ✅ All protected routes with proper guards
- ✅ Feature gates for subscription-based features
- ✅ Permission checks for UI elements
- ✅ Tenant isolation in all API calls
- ✅ Branch and academic year scoping
- ✅ Form validations matching backend rules
- ✅ Loading states and error states
- ✅ Empty states for no data

---

## 16. NEXT STEPS

1. **Review this audit** with the user to confirm understanding
2. **Prioritize migration phases** based on user requirements
3. **Begin Phase 1** with core academic features
4. **Test each feature** before moving to the next
5. **Maintain the approved UI design** throughout migration

---

## 17. QUESTIONS FOR USER

1. Which migration phase should we start with?
2. Are there any specific features from the old frontend that should NOT be migrated?
3. Should we implement all 150+ pages, or focus on a subset?
4. What is the priority order for the different user portals (School Admin, Super Admin, Parent, Public)?
5. Are there any backend endpoints that are deprecated or should be avoided?

---

**AUDIT COMPLETED**
**Date:** 2025-08-10
**Auditor:** Cascade AI
**Scope:** Complete old frontend functionality audit for migration to new Client
