# MODULE 2 — FRONTEND MIGRATION MAP

## AUDIT SUMMARY

**Old Frontend Location:** `frontend/`
**New Client Location:** `Client/`

---

## ROLES IDENTIFIED

| Role | Description | Access Level |
|------|-------------|--------------|
| `superadmin` / `super_admin` | Platform administrator | All schools, all features |
| `schooladmin` / `school_admin` / `admin` | School owner/tenant admin | Their school only, all features |
| `branch_manager` / `branchmanager` | Branch administrator | Their branch only, school features |
| `teacher` | Teacher | Their classes, limited features |
| `student` | Student | Their data, limited features |
| `parent` | Parent | Their children's data, limited features |

---

## ROUTE STRUCTURE

### PUBLIC ROUTES

| Old Route | Page | Role | Auth | Feature | New Route | Notes |
|-----------|------|------|------|---------|-----------|-------|
| `/` | LandingPage | Public | No | None | `/` | Marketing landing page |
| `/platform` | PlatformPage | Public | No | None | `/platform` | Platform overview |
| `/pricing` | PricingPage | Public | No | None | `/pricing` | Subscription plans |
| `/contact` | ContactPage | Public | No | None | `/contact` | Contact form |
| `/about` | AboutPage | Public | No | None | `/about` | About page |
| `/faq` | FAQPage | Public | No | None | `/faq` | FAQ |
| `/privacy` | PrivacyPolicy | Public | No | None | `/privacy` | Privacy policy |
| `/terms` | TermsOfService | Public | No | None | `/terms` | Terms of service |
| `/maintenance` | Maintenance | Public | No | None | `/maintenance` | Maintenance mode |

### AUTH ROUTES

| Old Route | Page | Role | Auth | Feature | New Route | Notes |
|-----------|------|------|------|---------|-----------|-------|
| `/login` | Login | School Admin | No | None | `/login` | School admin login |
| `/parent/login` | ParentLogin | Parent | No | None | `/parent/login` | Parent portal login |
| `/admin/login` | SuperAdminLogin | Super Admin | No | None | `/admin/login` | Super admin login |
| `/admin/register` | SuperAdminRegister | Super Admin | No | None | `/admin/register` | Super admin registration |
| `/verify-email` | VerifyEmail | Public | No | None | `/verify-email` | Email verification |
| `/school-profile-setup` | SchoolProfileSetup | School Admin | Yes | None | `/app/onboarding` | First-time school setup |
| `/onboarding` | OnboardingWizard | School Admin | Yes | None | `/app/onboarding` | Onboarding wizard |

### SCHOOL ADMIN ROUTES - CORE ACADEMIC

| Old Route | Page | API | Role | Permission | Feature | Tenant | Branch | New Route | Priority |
|-----------|------|-----|------|------------|---------|--------|--------|----------|----------|
| `/` | Dashboard | `/admin/dashboard-stats` | School Admin | None | None | School | Optional | `/app/dashboard` | ✅ DONE |
| `/students` | StudentsManagement | `/admin/students` | School Admin | `students.view` | `students` | School | Optional | `/app/students` | HIGH |
| `/teachers` | TeachersManagement | `/admin/teachers` | School Admin | `teachers.view` | `teachers` | School | Optional | `/app/teachers` | HIGH |
| `/parents` | ParentsManagement | `/admin/parents` | School Admin | `students.view` | `parents` | School | Optional | `/app/parents` | HIGH |
| `/classes` | ClassesManagement | `/admin/classes` | School Admin | `classes.view` | `classes` | School | Optional | `/app/classes` | HIGH |
| `/classes/:id` | ClassDetail | `/admin/classes/:id` | School Admin | `classes.view` | `classes` | School | Optional | `/app/classes/:id` | HIGH |
| `/subjects` | SubjectsManagement | `/admin/subjects` | School Admin | `subjects.view` | `subjects` | School | Optional | `/app/subjects` | MEDIUM |
| `/branches` | BranchesManagement | `/branches` | School Admin | `settings.manage` | None | School | None | `/app/branches` | HIGH |
| `/academic-years` | AcademicYearsManagement | `/academic/years` | School Admin | `settings.manage` | None | School | None | `/app/academic-years` | MEDIUM |
| `/academic-terms` | AcademicTermsManagement | `/academic/terms` | School Admin | `settings.manage` | None | School | None | `/app/academic-terms` | MEDIUM |
| `/promotions` | StudentPromotions | TBD | School Admin | `students.view` | None | School | Optional | `/app/promotions` | MEDIUM |

### SCHOOL ADMIN ROUTES - EXAMINATIONS

| Old Route | Page | API | Role | Permission | Feature | Tenant | Branch | New Route | Priority |
|-----------|------|-----|------|------------|---------|--------|--------|----------|----------|
| `/exams` | ExamsManagement | `/admin/exams` | School Admin | `exams.view` | `exams` | School | Optional | `/app/exams` | HIGH |
| `/online-exams` | StudentExamPage | TBD | School Admin | `exams.view` | `online-exams` | School | Optional | `/app/online-exams` | MEDIUM |
| `/question-banks` | QuestionBankManagement | TBD | School Admin | `exams.view` | `question-banks` | School | Optional | `/app/question-banks` | MEDIUM |
| `/questions` | QuestionManagement | TBD | School Admin | `exams.view` | `question-banks` | School | Optional | `/app/questions` | MEDIUM |
| `/exam-results` | ExamResults | TBD | School Admin | `exams.view` | None | School | Optional | `/app/exam-results` | MEDIUM |
| `/exam-halls` | ExamHallsManagement | TBD | School Admin | `exams.view` | None | School | Optional | `/app/exam-halls` | LOW |
| `/certificates` | CertificatesManagement | TBD | School Admin | `exams.view` | `certificates` | School | Optional | `/app/certificates` | LOW |
| `/id-cards` | IDCardsManagement | TBD | School Admin | `students.view` | `id-cards` | School | Optional | `/app/id-cards` | LOW |
| `/portfolios` | PortfoliosManagement | TBD | School Admin | `students.view` | `portfolios` | School | Optional | `/app/portfolios` | LOW |
| `/delivery-reports` | DeliveryReports | TBD | School Admin | `exams.view` | `delivery-reports` | School | Optional | `/app/delivery-reports` | LOW |

### SCHOOL ADMIN ROUTES - STUDENT WELFARE

| Old Route | Page | API | Role | Permission | Feature | Tenant | Branch | New Route | Priority |
|-----------|------|-----|------|------------|---------|--------|--------|----------|----------|
| `/discipline` | DisciplineManagement | TBD | School Admin | `students.view` | `discipline` | School | Optional | `/app/discipline` | LOW |
| `/health-records` | HealthRecordsManagement | TBD | School Admin | `students.view` | `health` | School | Optional | `/app/health-records` | LOW |
| `/alumni` | AlumniManagement | TBD | School Admin | `students.view` | `alumni` | School | Optional | `/app/alumni` | LOW |
| `/visitors` | VisitorsManagement | TBD | School Admin | `settings.view` | `visitors` | School | Optional | `/app/visitors` | LOW |

### SCHOOL ADMIN ROUTES - FINANCE

| Old Route | Page | API | Role | Permission | Feature | Tenant | Branch | New Route | Priority |
|-----------|------|-----|------|------------|---------|--------|--------|----------|----------|
| `/payments` | PaymentsManagement | `/admin/payments` | School Admin | `finance.view` | `finance` | School | Optional | `/app/finance` | HIGH |
| `/invoices` | InvoicesManagement | TBD | School Admin | `finance.view` | `invoices` | School | Optional | `/app/invoices` | MEDIUM |
| `/discounts` | DiscountsManagement | TBD | School Admin | `finance.manage` | `discounts` | School | Optional | `/app/discounts` | MEDIUM |
| `/accounting` | AccountingManagement | TBD | School Admin | `finance.manage` | `accounting` | School | Optional | `/app/accounting` | MEDIUM |
| `/expenses` | ExpenseManagement | TBD | School Admin | `finance.manage` | `expenses` | School | Optional | `/app/expenses` | MEDIUM |
| `/procurement` | ProcurementManagement | TBD | School Admin | `finance.manage` | `procurement` | School | Optional | `/app/procurement` | LOW |
| `/revenue-reports` | RevenueReports | TBD | School Admin | `finance.view` | `revenue-reports` | School | Optional | `/app/revenue-reports` | MEDIUM |
| `/enterprise-finance` | EnterpriseFinanceManagement | TBD | School Admin | `finance.manage` | `enterprise-finance` | School | Optional | `/app/enterprise-finance` | LOW |
| `/revenue-forecast` | RevenueForecast | TBD | School Admin | `finance.manage` | `revenue-forecast` | School | Optional | `/app/revenue-forecast` | LOW |

### SCHOOL ADMIN ROUTES - HR & PAYROLL

| Old Route | Page | API | Role | Permission | Feature | Tenant | Branch | New Route | Priority |
|-----------|------|-----|------|------------|---------|--------|--------|----------|----------|
| `/payroll` | PayrollManagement | TBD | School Admin | `finance.manage` | `payroll` | School | Optional | `/app/payroll` | MEDIUM |
| `/leave-management` | LeaveManagement | TBD | School Admin | `teachers.view` | `leave-management` | School | Optional | `/app/leave-management` | MEDIUM |
| `/employee-loans` | EmployeeLoansManagement | TBD | School Admin | `finance.manage` | `employee-loans` | School | Optional | `/app/employee-loans` | LOW |
| `/performance-reviews` | PerformanceReviewsManagement | TBD | School Admin | `teachers.view` | `performance-reviews` | School | Optional | `/app/performance-reviews` | LOW |
| `/recruitment` | RecruitmentManagement | TBD | School Admin | `teachers.view` | `recruitment` | School | Optional | `/app/recruitment` | LOW |
| `/employee-contracts` | EmployeeContractsManagement | TBD | School Admin | `teachers.view` | `employee-contracts` | School | Optional | `/app/employee-contracts` | LOW |

### SCHOOL ADMIN ROUTES - OPERATIONS

| Old Route | Page | API | Role | Permission | Feature | Tenant | Branch | New Route | Priority |
|-----------|------|-----|------|------------|---------|--------|--------|----------|----------|
| `/library` | LibraryManagement | TBD | School Admin | `settings.view` | `library` | School | Optional | `/app/library` | LOW |
| `/transport` | TransportManagement | TBD | School Admin | `settings.view` | `transport` | School | Optional | `/app/transport` | LOW |
| `/transport-students` | TransportStudentsManagement | TBD | School Admin | `settings.view` | `transport-students` | School | Optional | `/app/transport-students` | LOW |
| `/fuel-logs` | FuelLogsManagement | TBD | School Admin | `settings.view` | `fuel-logs` | School | Optional | `/app/fuel-logs` | LOW |
| `/vehicle-maintenance` | VehicleMaintenanceManagement | TBD | School Admin | `settings.view` | `vehicle-maintenance` | School | Optional | `/app/vehicle-maintenance` | LOW |
| `/hostel` | HostelManagement | TBD | School Admin | `settings.view` | `hostel` | School | Optional | `/app/hostel` | LOW |
| `/hostel-attendance` | HostelAttendancePage | TBD | School Admin | `settings.view` | `hostel-attendance` | School | Optional | `/app/hostel-attendance` | LOW |
| `/bed-allocations` | BedAllocationsManagement | TBD | School Admin | `settings.view` | `bed-allocation` | School | Optional | `/app/bed-allocations` | LOW |
| `/inventory` | InventoryManagement | TBD | School Admin | `settings.view` | `inventory` | School | Optional | `/app/inventory` | LOW |
| `/suppliers` | SuppliersManagement | TBD | School Admin | `settings.view` | `suppliers` | School | Optional | `/app/suppliers` | LOW |
| `/assets` | AssetsManagement | TBD | School Admin | `settings.view` | `assets` | School | Optional | `/app/assets` | LOW |

### SCHOOL ADMIN ROUTES - COMMUNICATION

| Old Route | Page | API | Role | Permission | Feature | Tenant | Branch | New Route | Priority |
|-----------|------|-----|------||---------|--------|--------|----------|----------|
| `/communication-messages` | CommunicationMessages | TBD | School Admin | `settings.manage` | `messaging` | School | Optional | `/app/communication` | MEDIUM |
| `/announcements` | AnnouncementsManagement | TBD | School Admin | `settings.manage` | None | School | Optional | `/app/announcements` | MEDIUM |
| `/announcements-management` | AnnouncementsCenter | TBD | School Admin | `settings.manage` | `announcements` | School | Optional | `/app/announcements-center` | LOW |
| `/notification-center` | NotificationCenter | TBD | School Admin | `settings.manage` | None | School | Optional | `/app/notifications` | LOW |
| `/notification-templates` | NotificationTemplatesManagement | TBD | School Admin | `settings.manage` | None | School | Optional | `/app/notification-templates` | LOW |
| `/events` | EventsManagement | TBD | School Admin | `settings.view` | None | School | Optional | `/app/events` | MEDIUM |
| `/public-content` | PublicContentManagement | TBD | School Admin | `settings.manage` | None | School | Optional | `/app/public-content` | LOW |
| `/complaints` | ComplaintManagement | TBD | School Admin | `settings.manage` | `complaints` | School | Optional | `/app/complaints` | LOW |
| `/suggestions` | SuggestionBox | TBD | School Admin | `settings.view` | `suggestions` | School | Optional | `/app/suggestions` | LOW |
| `/meetings` | MeetingScheduler | TBD | School Admin | `settings.view` | `meeting-scheduler` | School | Optional | `/app/meetings` | LOW |

### SCHOOL ADMIN ROUTES - ENTERPRISE

| Old Route | Page | API | Role | Permission | Feature | Tenant | Branch | New Route | Priority |
|-----------|------|-----|------|------------|---------|--------|--------|----------|----------|
| `/reports` | ReportsCenter | TBD | School Admin | `settings.view` | `reports` | School | Optional | `/app/reports` | MEDIUM |
| `/business-intelligence` | BusinessIntelligence | TBD | School Admin | `settings.view` | `business-intelligence` | School | Optional | `/app/analytics` | LOW |
| `/executive-dashboard` | ExecutiveDashboard | TBD | School Admin | `settings.view` | `executive-dashboard` | School | Optional | `/app/executive-dashboard` | LOW |
| `/ai-learning-assistant` | AILearningAssistant | TBD | School Admin | `students.view` | `ai-learning-assistant` | School | Optional | `/app/ai-learning` | LOW |
| `/ai-dashboard` | AIDashboard | TBD | School Admin | `students.view` | `ai-learning-assistant` | School | Optional | `/app/ai-dashboard` | LOW |
| `/bi-dashboard` | BIDashboard | TBD | School Admin | `settings.view` | `performance-tracking` | School | Optional | `/app/bi-dashboard` | LOW |
| `/ai-parent-reports` | AIParentReports | TBD | School Admin | `students.view` | `ai-parent-reports` | School | Optional | `/app/ai-parent-reports` | LOW |
| `/risk-assessment` | RiskAssessment | TBD | School Admin | `settings.manage` | `risk-assessment` | School | Optional | `/app/risk-assessment` | LOW |
| `/risk-register` | RiskRegisterPage | TBD | School Admin | `settings.manage` | `risk-register` | School | Optional | `/app/risk-register` | LOW |
| `/incidents` | IncidentManagement | TBD | School Admin | `settings.manage` | `incident-management` | School | Optional | `/app/incidents` | LOW |
| `/performance-tracking` | PerformanceTracking | TBD | School Admin | `settings.view` | `performance-tracking` | School | Optional | `/app/performance-tracking` | LOW |
| `/cross-school-analytics` | BusinessIntelligence | TBD | School Admin | `settings.view` | `cross-school-analytics` | School | Optional | `/app/cross-school-analytics` | LOW |
| `/regional-dashboard` | ExecutiveDashboard | TBD | School Admin | `settings.view` | `regional-dashboard` | School | Optional | `/app/regional-dashboard` | LOW |
| `/enterprise-suite` | EnterpriseSuite | TBD | School Admin | `settings.manage` | `enterprise-suite` | School | Optional | `/app/enterprise-suite` | LOW |

### SCHOOL ADMIN ROUTES - WORKFLOW & AUTOMATION

| Old Route | Page | API | Role | Permission | Feature | Tenant | Branch | New Route | Priority |
|-----------|------|-----|------|------------|---------|--------|--------|----------|----------|
| `/workflow` | WorkflowManagement | TBD | School Admin | `settings.manage` | `workflow-automation` | School | Optional | `/app/workflow` | LOW |
| `/automation` | AutomationEngine | TBD | School Admin | `settings.manage` | `automation-engine` | School | Optional | `/app/automation` | LOW |
| `/tasks` | TaskManagementPage | TBD | School Admin | `settings.view` | `task-management` | School | Optional | `/app/tasks` | LOW |
| `/tickets` | TicketSystem | TBD | School Admin | `settings.manage` | `ticketing` | School | Optional | `/app/tickets` | LOW |
| `/support` | SupportTickets | TBD | School Admin | `settings.view` | `support` | School | Optional | `/app/support` | LOW |
| `/help` | HelpCenter | TBD | School Admin | `settings.view` | `help-center` | School | Optional | `/app/help` | LOW |
| `/knowledge-base` | KnowledgeBasePage | TBD | School Admin | `settings.view` | `knowledge-base` | School | Optional | `/app/knowledge-base` | LOW |

### SCHOOL ADMIN ROUTES - ADMINISTRATION

| Old Route | Page | API | Role | Permission | Feature | Tenant | Branch | New Route | Priority |
|-----------|------|-----|------|------------|---------|--------|--------|----------|----------|
| `/activity` | ActivityCenter | TBD | School Admin | `settings.view` | None | School | Optional | `/app/activity` | LOW |
| `/audit` | AuditLogViewer | TBD | School Admin | `settings.manage` | None | School | Optional | `/app/audit` | LOW |
| `/finance-audit` | FinanceAuditViewer | TBD | School Admin | `finance.manage` | `finance-audit` | School | Optional | `/app/finance-audit` | LOW |
| `/documents` | DocumentsManagement | TBD | School Admin | `settings.view` | `documents` | School | Optional | `/app/documents` | LOW |
| `/document-management` | DocumentManagement | TBD | School Admin | `settings.view` | `documents` | School | Optional | `/app/document-management` | LOW |
| `/roles` | RoleManagement | TBD | School Admin | `settings.manage` | None | School | Optional | `/app/roles` | MEDIUM |
| `/permissions` | PermissionManagement | TBD | School Admin | `settings.manage` | None | School | Optional | `/app/permissions` | MEDIUM |
| `/plans` | Plans | TBD | School Admin | `settings.view` | None | School | Optional | `/app/plans` | LOW |
| `/settings` | SchoolSettings | TBD | School Admin | `settings.manage` | `settings` | School | Optional | `/app/settings` | HIGH |
| `/security-settings` | SecuritySettings | TBD | School Admin | `settings.manage` | None | School | Optional | `/app/security-settings` | MEDIUM |
| `/communication-settings` | CommunicationSettings | TBD | School Admin | `settings.manage` | None | School | Optional | `/app/communication-settings` | MEDIUM |
| `/advanced-security` | SecurityDashboard | TBD | School Admin | `settings.manage` | `advanced-security` | School | Optional | `/app/advanced-security` | LOW |
| `/api-keys` | ApiKeysManagement | TBD | School Admin | `settings.manage` | `api-keys` | School | Optional | `/app/api-keys` | LOW |
| `/api-platform` | APIPlatform | TBD | School Admin | `settings.manage` | `api-platform` | School | Optional | `/app/api-platform` | LOW |
| `/login-history` | LoginHistoryPage | TBD | School Admin | `settings.manage` | `login-history` | School | Optional | `/app/login-history` | LOW |
| `/ip-restrictions` | IpRestrictionsManagement | TBD | School Admin | `settings.manage` | `ip-restrictions` | School | Optional | `/app/ip-restrictions` | LOW |
| `/password-policies` | PasswordPolicyPage | TBD | School Admin | `settings.manage` | `password-policies` | School | Optional | `/app/password-policies` | LOW |
| `/system-health` | SystemHealthDashboard | TBD | School Admin | `settings.view` | `system-health` | School | Optional | `/app/system-health` | LOW |
| `/backups` | BackupManager | TBD | School Admin | `settings.manage` | `backups` | School | Optional | `/app/backups` | LOW |
| `/backup-management` | BackupManagementPage | TBD | School Admin | `settings.manage` | `backup` | School | Optional | `/app/backup-management` | LOW |
| `/data-recovery` | DataRecoveryCenter | TBD | School Admin | `settings.manage` | `data-recovery` | School | Optional | `/app/data-recovery` | LOW |
| `/white-label` | WhiteLabelSettings | TBD | School Admin | `settings.manage` | `white-label` | School | Optional | `/app/white-label` | LOW |
| `/dynamic-config` | DynamicConfigBuilder | TBD | School Admin | `settings.manage` | `dynamic-config` | School | Optional | `/app/dynamic-config` | LOW |

### SCHOOL ADMIN ROUTES - ACADEMIC MANAGEMENT (ADDITIONAL)

| Old Route | Page | API | Role | Permission | Feature | Tenant | Branch | New Route | Priority |
|-----------|------|-----|------|------------|---------|--------|--------|----------|----------|
| `/departments` | DepartmentsManagement | TBD | School Admin | `teachers.view` | `departments` | School | Optional | `/app/departments` | MEDIUM |
| `/designations` | DesignationsManagement | TBD | School Admin | `teachers.view` | `designations` | School | Optional | `/app/designations` | MEDIUM |
| `/homework` | HomeworkManagement | TBD | School Admin | `students.view` | `homework` | School | Optional | `/app/homework` | LOW |
| `/lesson-plans` | LessonPlansManagement | TBD | School Admin | `teachers.view` | `lesson-plans` | School | Optional | `/app/lesson-plans` | LOW |
| `/curriculum` | CurriculumManagement | TBD | School Admin | `subjects.view` | `curriculum` | School | Optional | `/app/curriculum` | LOW |
| `/schedule` | ScheduleManagement | TBD | School Admin | `classes.view` | None | School | Optional | `/app/schedule` | MEDIUM |
| `/automatic-timetabling` | AutomaticTimetabling | TBD | School Admin | `classes.view` | `automatic-timetabling` | School | Optional | `/app/automatic-timetabling` | LOW |
| `/admissions` | AdmissionsManagement | TBD | School Admin | `students.view` | `admissions` | School | Optional | `/app/admissions` | MEDIUM |

### SUPER ADMIN ROUTES

| Old Route | Page | API | Role | Permission | Feature | Tenant | Branch | New Route | Priority |
|-----------|------|-----|------|------------|---------|--------|--------|----------|----------|
| `/admin` | SuperAdminDashboard | TBD | Super Admin | None | None | Platform | None | `/super-admin/dashboard` | HIGH |
| `/admin/schools` | SuperAdminSchools | TBD | Super Admin | None | None | Platform | None | `/super-admin/schools` | HIGH |
| `/admin/features` | SchoolFeatures | TBD | Super Admin | None | None | Platform | None | `/super-admin/features` | HIGH |
| `/admin/admins` | SuperAdminSchoolAdmins | TBD | Super Admin | None | None | Platform | None | `/super-admin/admins` | HIGH |
| `/admin/admins/register` | RegisterSchoolAdmin | TBD | Super Admin | None | None | Platform | None | `/super-admin/admins/register` | HIGH |
| `/admin/subscriptions` | SuperAdminSubscriptions | TBD | Super Admin | None | None | Platform | None | `/super-admin/subscriptions` | HIGH |
| `/admin/plans` | SuperAdminPlans | TBD | Super Admin | None | None | Platform | None | `/super-admin/plans` | HIGH |
| `/admin/leads` | SuperAdminLeads | TBD | Super Admin | None | None | Platform | None | `/super-admin/leads` | MEDIUM |
| `/admin/tickets` | SuperAdminTickets | TBD | Super Admin | None | None | Platform | None | `/super-admin/tickets` | MEDIUM |
| `/admin/errors` | SuperAdminErrors | TBD | Super Admin | None | None | Platform | None | `/super-admin/errors` | MEDIUM |
| `/admin/system` | SystemManagement | TBD | Super Admin | None | None | Platform | None | `/super-admin/system` | MEDIUM |

### PARENT PORTAL ROUTES

| Old Route | Page | API | Role | Permission | Feature | Tenant | Branch | New Route | Priority |
|-----------|------|-----|------|------------|---------|--------|--------|----------|----------|
| `/parent` | ParentDashboard | TBD | Parent | None | None | School | None | `/parent/dashboard` | MEDIUM |
| `/parent/announcements` | ParentAnnouncements | TBD | Parent | None | None | School | None | `/parent/announcements` | MEDIUM |
| `/parent/child/:childId` | ParentChildDetail | TBD | Parent | None | None | School | None | `/parent/child/:childId` | MEDIUM |
| `/parent/child/:childId/profile` | ParentChildDetail | TBD | Parent | None | None | School | None | `/parent/child/:childId/profile` | MEDIUM |
| `/parent/child/:childId/attendance` | ParentChildDetail | TBD | Parent | None | None | School | None | `/parent/child/:childId/attendance` | MEDIUM |
| `/parent/child/:childId/results` | ParentChildDetail | TBD | Parent | None | None | School | None | `/parent/child/:childId/results` | MEDIUM |
| `/parent/child/:childId/fees` | ParentChildDetail | TBD | Parent | None | None | School | None | `/parent/child/:childId/fees` | MEDIUM |
| `/parent/child/:childId/timetable` | ParentChildDetail | TBD | Parent | None | None | School | None | `/parent/child/:childId/timetable` | MEDIUM |

---

## API STRUCTURE (from adminApiSlice.js)

### Core API Endpoints

| Endpoint | Method | Purpose | Auth | Tenant | Branch |
|----------|--------|---------|------|--------|--------|
| `/admin/dashboard-stats` | GET | Dashboard statistics | Yes | School | Optional |
| `/admin/students` | GET/POST/PUT/DELETE | Student CRUD | Yes | School | Optional |
| `/admin/teachers` | GET/POST/PUT/DELETE | Teacher CRUD | Yes | School | Optional |
| `/admin/parents` | GET/POST/PUT/DELETE | Parent CRUD | Yes | School | Optional |
| `/admin/classes` | GET/POST/PUT/DELETE | Class CRUD | Yes | School | Optional |
| `/admin/subjects` | GET/POST/PUT/DELETE | Subject CRUD | Yes | School | Optional |
| `/branches` | GET | Branch list | Yes | School | None |
| `/academic/years` | GET/POST/PUT | Academic years | Yes | School | None |
| `/academic/terms` | GET/POST/PUT/DELETE | Academic terms | Yes | School | None |
| `/admin/exams` | GET/POST/PUT/DELETE | Exam CRUD | Yes | School | Optional |
| `/admin/payments` | GET/POST/PUT/DELETE | Payment CRUD | Yes | School | Optional |
| `/admin/attendance` | GET/POST | Attendance | Yes | School | Optional |

### API Headers

- `Authorization: Bearer {token}` - Required for authenticated requests
- `X-School-Slug` / `X-Tenant-ID` - School subdomain/tenant ID
- `x-branch-id` - Branch ID (optional, for branch-scoped requests)
- `x-academic-year-id` - Academic year ID (optional)

---

## FEATURE ACCESS SYSTEM

### Feature Codes

| Feature Code | Description | Plan Level |
|-------------|-------------|------------|
| `students` | Student management | Basic+ |
| `teachers` | Teacher management | Basic+ |
| `parents` | Parent management | Basic+ |
| `classes` | Class management | Basic+ |
| `subjects` | Subject management | Basic+ |
| `departments` | Department management | Standard+ |
| `designations` | Designation management | Standard+ |
| `attendance` | Attendance tracking | Basic+ |
| `exams` | Exam management | Basic+ |
| `online-exams` | Online exams | Premium+ |
| `question-banks` | Question banks | Premium+ |
| `finance` | Finance module | Standard+ |
| `invoices` | Invoice management | Standard+ |
| `discounts` | Discount management | Standard+ |
| `accounting` | Accounting | Premium+ |
| `expenses` | Expense tracking | Standard+ |
| `procurement` | Procurement | Enterprise |
| `revenue-reports` | Revenue reports | Standard+ |
| `enterprise-finance` | Enterprise finance | Enterprise |
| `revenue-forecast` | Revenue forecasting | Enterprise |
| `payroll` | Payroll management | Premium+ |
| `leave-management` | Leave management | Standard+ |
| `employee-loans` | Employee loans | Premium+ |
| `performance-reviews` | Performance reviews | Premium+ |
| `recruitment` | Recruitment | Enterprise |
| `employee-contracts` | Employee contracts | Premium+ |
| `library` | Library management | Standard+ |
| `transport` | Transport management | Standard+ |
| `transport-students` | Transport students | Standard+ |
| `fuel-logs` | Fuel logs | Standard+ |
| `vehicle-maintenance` | Vehicle maintenance | Standard+ |
| `hostel` | Hostel management | Premium+ |
| `hostel-attendance` | Hostel attendance | Premium+ |
| `bed-allocation` | Bed allocation | Premium+ |
| `inventory` | Inventory management | Enterprise |
| `suppliers` | Supplier management | Enterprise |
| `assets` | Asset management | Standard+ |
| `messaging` | Messaging system | Standard+ |
| `announcements` | Announcements center | Basic+ |
| `documents` | Document management | Standard+ |
| `reports` | Reports center | Standard+ |
| `business-intelligence` | Business intelligence | Enterprise |
| `executive-dashboard` | Executive dashboard | Enterprise |
| `ai-learning-assistant` | AI learning assistant | Enterprise |
| `risk-assessment` | Risk assessment | Enterprise |
| `risk-register` | Risk register | Enterprise |
| `incident-management` | Incident management | Enterprise |
| `performance-tracking` | Performance tracking | Enterprise |
| `cross-school-analytics` | Cross-school analytics | Enterprise |
| `regional-dashboard` | Regional dashboard | Enterprise |
| `enterprise-suite` | Enterprise suite | Enterprise |
| `workflow-automation` | Workflow automation | Enterprise |
| `automation-engine` | Automation engine | Enterprise |
| `task-management` | Task management | Enterprise |
| `ticketing` | Ticketing system | Standard+ |
| `support` | Support center | Basic+ |
| `help-center` | Help center | Basic+ |
| `knowledge-base` | Knowledge base | Standard+ |
| `meeting-scheduler` | Meeting scheduler | Enterprise |
| `complaints` | Complaints management | Standard+ |
| `suggestions` | Suggestions box | Standard+ |
| `discipline` | Discipline management | Standard+ |
| `health` | Health records | Standard+ |
| `alumni` | Alumni management | Premium+ |
| `visitors` | Visitor management | Standard+ |
| `certificates` | Certificate generation | Standard+ |
| `id-cards` | ID card generation | Standard+ |
| `portfolios` | Student portfolios | Premium+ |
| `delivery-reports` | Delivery reports | Standard+ |
| `homework` | Homework management | Standard+ |
| `lesson-plans` | Lesson plans | Standard+ |
| `curriculum` | Curriculum management | Premium+ |
| `automatic-timetabling` | Automatic timetabling | Enterprise |
| `admissions` | Admissions management | Standard+ |
| `settings` | Settings | Basic+ |
| `advanced-security` | Advanced security | Enterprise |
| `api-keys` | API keys | Enterprise |
| `api-platform` | API platform | Enterprise |
| `login-history` | Login history | Standard+ |
| `ip-restrictions` | IP restrictions | Enterprise |
| `password-policies` | Password policies | Enterprise |
| `system-health` | System health | Enterprise |
| `backups` | Backups | Enterprise |
| `backup` | Backup management | Enterprise |
| `data-recovery` | Data recovery | Enterprise |
| `white-label` | White label | Enterprise |
| `dynamic-config` | Dynamic config | Enterprise |
| `finance-audit` | Finance audit | Enterprise |

### Communication Features (Always Enabled)

- `announcements`
- `notifications`
- `push-notifications`
- `sms`
- `email-automation`
- `whatsapp`
- `bulk-messaging`
- `automated-alerts`

---

## PERMISSION SYSTEM

### Permission Format: `{module}.{action}`

| Module | Actions | Description |
|--------|--------|-------------|
| `students` | view, create, edit, delete, manage | Student operations |
| `teachers` | view, create, edit, delete, manage | Teacher operations |
| `parents` | view, create, edit, delete, manage | Parent operations |
| `classes` | view, create, edit, delete, manage | Class operations |
| `subjects` | view, create, edit, delete, manage | Subject operations |
| `attendance` | view, create, edit, delete, manage | Attendance operations |
| `exams` | view, create, edit, delete, manage | Exam operations |
| `finance` | view, create, edit, delete, manage | Finance operations |
| `branches` | view, create, edit, delete, manage | Branch operations |
| `settings` | view, create, edit, delete, manage | Settings operations |
| `rbac` | view, create, edit, delete, manage | RBAC operations |

### Wildcard Permissions

- `{module}.*` - All actions for a module
- `*.manage` - All manage actions across modules
- `*.*` - All permissions

---

## TENANT DETECTION

### Detection Methods

1. **Subdomain Detection** (Production)
   - Extract subdomain from `window.location.hostname`
   - Example: `schoolname.dugsi.com` → `schoolname`

2. **Query Parameter** (Development)
   - `?school=` or `?tenantId=` parameter
   - Example: `localhost:3000?school=testschool`

3. **User Context** (After Login)
   - From `userInfo.school.subdomain`
   - Fallback for authenticated users

### Tenant Types

- `superadmin` - Super admin platform host
- `school` - School tenant (subdomain)
- `dev` - Development/preview environment

---

## BRANCH ISOLATION

### Branch Selection

- Stored in Redux: `state.branch.selectedBranch`
- Sent via header: `x-branch-id`
- Optional for school-wide operations
- Required for branch-specific operations

### Branch-Aware Operations

- Student lists (branch-specific)
- Teacher lists (branch-specific)
- Attendance (branch-specific)
- Payments (branch-specific)
- Classes (branch-specific)

---

## ACADEMIC YEAR CONTEXT

### Academic Year Selection

- Stored in Redux: `state.academic.selectedYear`
- Sent via header: `x-academic-year-id`
- Optional (uses current year if not specified)
- Required for year-specific operations

### Academic Year-Aware Operations

- Student promotions
- Exam results
- Attendance records
- Payment periods

---

## VALIDATION REQUIREMENTS

### Common Validations

- **Email**: Valid email format
- **Phone**: Valid phone number format
- **Date**: Valid date, not in past for certain fields
- **Required fields**: Cannot be empty
- **Numeric fields**: Must be numbers, not strings
- **IDs**: Valid MongoDB ObjectId format

### Form Validation Tools

- React Hook Form
- Zod schemas
- Backend validation (always enforced)

---

## CURRENT CLIENT STATUS

### ✅ Already Implemented

- **Authentication**: Login page with RTK Query integration
- **Dashboard**: School admin dashboard with KPI cards and charts
- **Layout**: AppLayout with sidebar navigation
- **Redux**: authSlice, tenantSlice configured
- **RTK Query**: baseApi with tenant/branch/academic year headers
- **Protected Routes**: Basic route protection

### 🔜 To Implement

- Public pages (Landing, Pricing, Contact, FAQ)
- Super Admin routes and functionality
- All School Admin CRUD pages (Students, Teachers, Classes, etc.)
- Parent Portal
- Feature access integration in sidebar
- Permission-based UI guards
- Branch selector
- Academic year selector
- All enterprise features

---

## MIGRATION PRIORITY

### Phase 1: Foundation (HIGH PRIORITY)
1. ✅ Authentication (DONE)
2. ✅ Dashboard (DONE)
3. ✅ Layout/Sidebar (DONE)
4. 🔜 Public pages
5. 🔜 Super Admin Dashboard
6. 🔜 Settings page

### Phase 2: Core Academic (HIGH PRIORITY)
1. 🔜 Students Management
2. 🔜 Teachers Management
3. 🔜 Classes Management
4. 🔜 Attendance Management
5. 🔜 Finance/Payments

### Phase 3: Academic Management (MEDIUM PRIORITY)
1. 🔜 Subjects
2. 🔜 Branches
3. 🔜 Academic Years/Terms
4. 🔜 Schedule
5. 🔜 Exams

### Phase 4: Enterprise Features (LOW PRIORITY)
1. 🔜 All enterprise modules
2. 🔜 AI features
3. 🔜 Advanced analytics
4. 🔜 Workflow automation

---

## NOTES

- **DO NOT** copy old UI - use new Shadcn UI design system
- **DO NOT** change current Dashboard card design
- **DO NOT** replace current Sidebar - enhance functionality only
- **MUST** preserve all backend API contracts
- **MUST** implement feature access checks
- **MUST** implement permission checks
- **MUST** respect tenant isolation
- **MUST** respect branch isolation where applicable
- **USE** RTK Query for all API calls
- **USE** React Hook Form + Zod for forms
- **USE** Shadcn UI components (install if missing)
