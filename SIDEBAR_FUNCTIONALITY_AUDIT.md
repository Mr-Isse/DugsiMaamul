# SIDEBAR FUNCTIONALITY AUDIT

## OLD FRONTEND SIDEBAR: EnterpriseSidebar.jsx

### FUNCTIONALITY TO MIGRATE TO CURRENT CLIENT SIDEBAR

---

## 1. NAVIGATION STRUCTURE

### School Admin Navigation (SCHOOL_NAVIGATION from navigation.js)

**Groups and Items:**

- **Overview** (no title group)
  - Overview → `/`

- **Academic Management**
  - Students → `/students` (permission: `students.view`, feature: `students`)
  - Admissions → `/admissions` (permission: `students.view`, feature: `admissions`)
  - Teachers → `/teachers` (permission: `teachers.view`, feature: `teachers`)
  - Departments → `/departments` (permission: `teachers.view`, feature: `departments`)
  - Designations → `/designations` (permission: `teachers.view`, feature: `designations`)
  - Parents → `/parents` (permission: `students.view`, feature: `parents`)
  - Classes → `/classes` (permission: `classes.view`, feature: `classes`)
  - Subjects → `/subjects` (permission: `subjects.view`, feature: `subjects`)
  - Curriculum → `/curriculum` (permission: `subjects.view`, feature: `curriculum`)
  - Schedule → `/schedule` (permission: `classes.view`)
  - Automatic Timetabling → `/automatic-timetabling` (permission: `classes.view`, feature: `automatic-timetabling`)
  - Attendance → `/attendance` (permission: `attendance.view`, feature: `attendance`)
  - Homework → `/homework` (permission: `students.view`, feature: `homework`)
  - Lesson Plans → `/lesson-plans` (permission: `teachers.view`, feature: `lesson-plans`)

- **Examinations**
  - Exams → `/exams` (permission: `exams.view`, feature: `exams`)
  - Online Exams → `/online-exams` (permission: `exams.view`, feature: `online-exams`)
  - Question Banks → `/question-banks` (permission: `exams.view`, feature: `question-banks`)
  - Questions → `/questions` (permission: `exams.view`, feature: `question-banks`)
  - Exam Results → `/exam-results` (permission: `exams.view`)
  - Exam Halls → `/exam-halls` (permission: `exams.view`)
  - Promotions → `/promotions` (permission: `students.view`)
  - Certificates → `/certificates` (permission: `exams.view`, feature: `certificates`)
  - ID Cards → `/id-cards` (permission: `students.view`, feature: `id-cards`)
  - Portfolios → `/portfolios` (permission: `students.view`, feature: `portfolios`)
  - Delivery Reports → `/delivery-reports` (permission: `exams.view`, feature: `delivery-reports`)

- **Student Welfare**
  - Discipline → `/discipline` (permission: `students.view`, feature: `discipline`)
  - Health Records → `/health-records` (permission: `students.view`, feature: `health`)
  - Alumni → `/alumni` (permission: `students.view`, feature: `alumni`)
  - Visitors → `/visitors` (permission: `settings.view`, feature: `visitors`)

- **Finance**
  - Finance → `/payments` (permission: `finance.view`, feature: `finance`)
  - Invoices → `/invoices` (permission: `finance.view`, feature: `invoices`)
  - Discounts → `/discounts` (permission: `finance.manage`, feature: `discounts`)
  - Accounting → `/accounting` (permission: `finance.manage`, feature: `accounting`)
  - Expenses → `/expenses` (permission: `finance.manage`, feature: `expenses`)
  - Procurement → `/procurement` (permission: `finance.manage`, feature: `procurement`)
  - Revenue Reports → `/revenue-reports` (permission: `finance.view`, feature: `revenue-reports`)
  - Enterprise Finance → `/enterprise-finance` (permission: `finance.manage`, feature: `enterprise-finance`)
  - Revenue Forecast → `/revenue-forecast` (permission: `finance.manage`, feature: `revenue-forecast`)

- **HR & Payroll**
  - Payroll → `/payroll` (permission: `finance.manage`, feature: `payroll`)
  - Leave Management → `/leave-management` (permission: `teachers.view`, feature: `leave-management`)
  - Employee Loans → `/employee-loans` (permission: `finance.manage`, feature: `employee-loans`)
  - Performance Reviews → `/performance-reviews` (permission: `teachers.view`, feature: `performance-reviews`)
  - Recruitment → `/recruitment` (permission: `teachers.view`, feature: `recruitment`)
  - Employee Contracts → `/employee-contracts` (permission: `teachers.view`, feature: `employee-contracts`)

- **Operations**
  - Library → `/library` (permission: `settings.view`, feature: `library`)
  - Transport → `/transport` (permission: `settings.view`, feature: `transport`)
  - Transport Students → `/transport-students` (permission: `settings.view`, feature: `transport-students`)
  - Fuel Logs → `/fuel-logs` (permission: `settings.view`, feature: `fuel-logs`)
  - Vehicle Maintenance → `/vehicle-maintenance` (permission: `settings.view`, feature: `vehicle-maintenance`)
  - Hostel → `/hostel` (permission: `settings.view`, feature: `hostel`)
  - Hostel Attendance → `/hostel-attendance` (permission: `settings.view`, feature: `hostel-attendance`)
  - Bed Allocations → `/bed-allocations` (permission: `settings.view`, feature: `bed-allocation`)
  - Inventory → `/inventory` (permission: `settings.view`, feature: `inventory`)
  - Suppliers → `/suppliers` (permission: `settings.view`, feature: `suppliers`)
  - Assets → `/assets` (permission: `settings.view`, feature: `assets`)

- **Academic Administration**
  - Branches → `/branches` (permission: `settings.manage`)
  - Academic Years → `/academic-years` (permission: `settings.manage`)
  - Academic Terms → `/academic-terms` (permission: `settings.manage`)

- **Communication**
  - Communication → `/communication-messages` (permission: `settings.manage`, feature: `messaging`)
  - Announcements → `/announcements` (permission: `settings.manage`)
  - Announcements Mgmt → `/announcements-management` (permission: `settings.manage`, feature: `announcements`)
  - Notification Center → `/notification-center` (permission: `settings.manage`)
  - Notification Templates → `/notification-templates` (permission: `settings.manage`)
  - Events → `/events` (permission: `settings.view`)
  - Public Content → `/public-content` (permission: `settings.manage`)
  - Complaints → `/complaints` (permission: `settings.manage`, feature: `complaints`)
  - Suggestions → `/suggestions` (permission: `settings.view`, feature: `suggestions`)
  - Meetings → `/meetings` (permission: `settings.view`, feature: `meeting-scheduler`)

- **Enterprise**
  - Reports → `/reports` (permission: `settings.view`, feature: `reports`)
  - Analytics → `/business-intelligence` (permission: `settings.view`, feature: `business-intelligence`)
  - Executive Dashboard → `/executive-dashboard` (permission: `settings.view`, feature: `executive-dashboard`)
  - AI Learning → `/ai-learning-assistant` (permission: `students.view`, feature: `ai-learning-assistant`)
  - AI Dashboard → `/ai-dashboard` (permission: `students.view`, feature: `ai-learning-assistant`)
  - BI Dashboard → `/bi-dashboard` (permission: `settings.view`, feature: `performance-tracking`)
  - AI Parent Reports → `/ai-parent-reports` (permission: `students.view`, feature: `ai-parent-reports`)
  - Risk Assessment → `/risk-assessment` (permission: `settings.manage`, feature: `risk-assessment`)
  - Risk Register → `/risk-register` (permission: `settings.manage`, feature: `risk-register`)
  - Incidents → `/incidents` (permission: `settings.manage`, feature: `incident-management`)
  - Performance Tracking → `/performance-tracking` (permission: `settings.view`, feature: `performance-tracking`)
  - Cross-School Analytics → `/cross-school-analytics` (permission: `settings.view`, feature: `cross-school-analytics`)
  - Regional Dashboard → `/regional-dashboard` (permission: `settings.view`, feature: `regional-dashboard`)
  - Enterprise Suite → `/enterprise-suite` (permission: `settings.manage`, feature: `enterprise-suite`)

- **Workflow & Automation**
  - Workflow → `/workflow` (permission: `settings.manage`, feature: `workflow-automation`)
  - Automation → `/automation` (permission: `settings.manage`, feature: `automation-engine`)
  - Tasks → `/tasks` (permission: `settings.view`, feature: `task-management`)
  - Tickets → `/tickets` (permission: `settings.manage`, feature: `ticketing`)
  - Support Tickets → `/support` (permission: `settings.view`, feature: `support`)
  - Help Center → `/help` (permission: `settings.view`, feature: `help-center`)
  - Knowledge Base → `/knowledge-base` (permission: `settings.view`, feature: `knowledge-base`)

- **Administration**
  - Activity Center → `/activity` (permission: `settings.view`)
  - Audit Logs → `/audit` (permission: `settings.manage`)
  - Finance Audit → `/finance-audit` (permission: `finance.manage`, feature: `finance-audit`)
  - Documents → `/documents` (permission: `settings.view`, feature: `documents`)
  - Document Mgmt → `/document-management` (permission: `settings.view`, feature: `documents`)
  - Roles → `/roles` (permission: `settings.manage`)
  - Permissions → `/permissions` (permission: `settings.manage`)
  - Plans → `/plans` (permission: `settings.view`)
  - Settings → `/settings` (permission: `settings.manage`, feature: `settings`)
  - Security Settings → `/security-settings` (permission: `settings.manage`)
  - Communication Settings → `/communication-settings` (permission: `settings.manage`)
  - Advanced Security → `/advanced-security` (permission: `settings.manage`, feature: `advanced-security`)
  - API Keys → `/api-keys` (permission: `settings.manage`, feature: `api-keys`)
  - API Platform → `/api-platform` (permission: `settings.manage`, feature: `api-platform`)
  - Login History → `/login-history` (permission: `settings.manage`, feature: `login-history`)
  - IP Restrictions → `/ip-restrictions` (permission: `settings.manage`, feature: `ip-restrictions`)
  - Password Policies → `/password-policies` (permission: `settings.manage`, feature: `password-policies`)
  - System Health → `/system-health` (permission: `settings.view`, feature: `system-health`)
  - Backups → `/backups` (permission: `settings.manage`, feature: `backups`)
  - Backup Mgmt → `/backup-management` (permission: `settings.manage`, feature: `backup`)
  - Data Recovery → `/data-recovery` (permission: `settings.manage`, feature: `data-recovery`)
  - White Label → `/white-label` (permission: `settings.manage`, feature: `white-label`)
  - Dynamic Config → `/dynamic-config` (permission: `settings.manage`, feature: `dynamic-config`)

### Super Admin Navigation (SUPER_ADMIN_NAVIGATION from navigation.js)

**Groups and Items:**

- **Platform Overview**
  - Overview → `/admin`
  - Schools → `/admin/schools`
  - Features → `/admin/features`
  - Admins → `/admin/admins`

- **Billing & Plans**
  - Subscriptions → `/admin/subscriptions`
  - Plans → `/admin/plans`
  - Leads → `/admin/leads`

- **Operations**
  - Support → `/admin/tickets`
  - Monitoring → `/admin/errors`
  - System → `/admin/system`

---

## 2. VISIBILITY LOGIC

### isVisible(item) Function

```javascript
const isVisible = (item) => {
  if (item.feature && !hasFeatureAccess(userInfo, item.feature)) return false;
  if (item.permission && !hasPermission(userInfo, item.permission)) return false;
  return true;
};
```

**Rules:**
- If item has `feature` property → Check `hasFeatureAccess(userInfo, item.feature)`
- If item has `permission` property → Check `hasPermission(userInfo, item.permission)`
- Both checks must pass for item to be visible
- Groups with no visible items are hidden entirely

### Permission Logic (from permissions.js)

**hasPermission(user, permission):**
- Super admins always return true
- School admins always return true
- Other roles check against `user.permissions` and `user.rbacRole.permissions`
- Supports wildcards: `{module}.*`, `*.manage`, `*.*`

### Feature Access Logic (from featureAccess.js)

**hasFeatureAccess(user, featureCode):**
- Super admins always return true
- Communication features always return true
- Checks against `user.school.enabledFeatures` from backend
- Falls back to `school.subscription.plan.features` + `school.settings.enabledModules`
- If plan has `ALL_MODULES`, everything is enabled

---

## 3. ACTIVE STATE LOGIC

### isItemActive(item) Function

```javascript
const isItemActive = (item) => {
  if (item.href === (variant === 'superadmin' ? '/admin' : '/')) {
    return location.pathname === item.href;
  }
  return location.pathname.startsWith(item.href);
};
```

**Rules:**
- Root path (`/` or `/admin`) requires exact match
- All other paths use prefix match (`startsWith`)
- Active state highlights the item visually

### Group Expansion Logic

```javascript
const hasActiveChild = (items) =>
  items.some((item) => isItemActive(item));
```

**Rules:**
- Groups auto-expand if any child is active
- Groups can be manually toggled via `expandedGroups` Set
- Expanded state persists during session

---

## 4. HEADER FUNCTIONALITY

### School Header (variant='school')

**Elements:**
- School logo (from `userInfo.school.logo.url` or `userInfo.school.logo`)
- Fallback: Shield icon with gradient background
- School name (from `userInfo.school.name`)
- Subtitle: "School Management System"

### Super Admin Header (variant='superadmin')

**Elements:**
- Platform icon (Globe icon with gradient)
- Branding: "DugsiKabe Admin"
- Subtitle: "Platform Control Center"

---

## 5. FOOTER FUNCTIONALITY

### School Footer (variant='school')

**Elements:**
- Academic Year Display:
  - Icon: CalendarDays
  - Label: "Current Session"
  - Value: From `selectedYear.yearName` or `userInfo.academicYear.name` or fallback "2024/2025"
- User Profile:
  - Avatar with initials (first 2 letters of name)
  - User name
  - User role (capitalized)
  - Dropdown menu with:
    - "Profile Settings" → navigates to `/settings`
    - "Sign Out" → dispatches logout + clearTenant + navigate to `/login`

### Super Admin Footer (variant='superadmin')

**Elements:**
- System Status:
  - Animated green pulse indicator
  - Text: "All systems OK" / "System operational"
  - Badge: "ONLINE"
- Logout Button:
  - Red text styling
  - Navigates to `/admin/login` on logout

---

## 6. MOBILE FUNCTIONALITY

### Mobile Toggle Button

- Fixed position: bottom-4 right-4
- z-index: 50
- Circular button (h-12 w-12)
- Indigo background
- Menu icon
- Opens Sheet sidebar

### Mobile Sidebar (Sheet)

- Width: w-72
- Side: left
- Close button in header
- Same content as desktop sidebar
- Auto-closes on navigation

---

## 7. REDUX STATE DEPENDENCIES

### Required State

```javascript
const { userInfo } = useSelector((state) => state.auth);
const { selectedYear } = useSelector((state) => state.academic);
```

**userInfo provides:**
- User name
- User role
- User avatar
- User permissions
- User rbacRole
- School info (name, logo, enabledFeatures, subscription)
- Academic year info

**selectedYear provides:**
- Current academic year context
- Displayed in footer

---

## 8. NAVIGATION BEHAVIOR

### Desktop Navigation

- Uses NavLink from react-router-dom
- Active state styling (indigo background)
- Hover state styling (slate background)
- Truncate long text

### Mobile Navigation

- Same as desktop but in Sheet
- Closes sidebar on navigation
- Close button in header

---

## 9. LOGOUT FUNCTIONALITY

### handleLogout()

```javascript
const handleLogout = () => {
  dispatch(logout());
  dispatch(clearTenant());
  navigate(variant === 'superadmin' ? '/admin/login' : '/login');
  setIsMobileOpen(false);
};
```

**Actions:**
- Dispatch `logout()` from authSlice
- Dispatch `clearTenant()` from tenantSlice
- Navigate to appropriate login page
- Close mobile sidebar if open

---

## 10. GROUP COLLAPSE/EXPAND

### toggleGroup(groupTitle)

```javascript
const toggleGroup = (groupTitle) => {
  setExpandedGroups((prev) => {
    const next = new Set(prev);
    if (next.has(groupTitle)) {
      next.delete(groupTitle);
    } else {
      next.add(groupTitle);
    }
    return next;
  });
};
```

**Behavior:**
- Toggles group title in Set
- Auto-expands if group has active child
- Manual toggle persists during session

---

## MIGRATION CHECKLIST FOR CURRENT CLIENT SIDEBAR

### ✅ Already Implemented in Current Client Sidebar

- [x] Basic navigation structure
- [x] Active state highlighting
- [x] Mobile responsive sidebar (Sheet)
- [x] User profile section
- [x] Logout functionality
- [x] School branding display

### 🔜 To Add to Current Client Sidebar

- [ ] Full navigation structure from SCHOOL_NAVIGATION
- [ ] Full navigation structure from SUPER_ADMIN_NAVIGATION
- [ ] Group collapse/expand functionality
- [ ] `isVisible()` function with permission checks
- [ ] `isVisible()` function with feature access checks
- [ ] Academic year display in footer
- [ ] System status display for Super Admin
- [ ] Dropdown menu with Profile Settings option
- [ ] Role-based navigation variant (school vs superadmin)
- [ ] Integration with `hasPermission()` utility
- [ ] Integration with `hasFeatureAccess()` utility
- [ ] Auto-expand groups with active children
- [ ] Hide groups with no visible items
- [ ] School logo display
- [ ] Super Admin branding display

### 🔜 Required Utilities to Port

- [ ] `hasPermission()` from `frontend/src/utils/permissions.js`
- [ ] `hasFeatureAccess()` from `frontend/src/utils/featureAccess.js`
- [ ] Navigation config from `frontend/src/config/navigation.js`

### 🔜 Required Redux State

- [ ] `auth.userInfo` (already exists in Client)
- [ ] `academic.selectedYear` (needs to be added to Client)
- [ ] `tenantSlice` (already exists in Client)

---

## IMPLEMENTATION NOTES

1. **DO NOT** change the current Client Sidebar UI design
2. **DO NOT** copy the old Sidebar visual components
3. **ONLY** migrate the functionality listed above
4. **USE** the current Client Sidebar as the base
5. **ADD** the missing functionality incrementally
6. **TEST** each functionality addition separately
7. **PRESERVE** the current Shadcn UI styling
