# SUPER ADMIN AUDIT

## OLD FRONTEND SUPER ADMIN PAGES

### 1. SuperAdminDashboard.jsx

**Route:** `/admin`

**Functionality:**
- Dashboard stats cards:
  - Total Schools (with active count)
  - Total Revenue (lifetime)
  - Active Users (last 7 days)
  - Total Students (platform-wide)
- System Health card:
  - Database status
  - Uptime
  - Security status
- Support stats card:
  - Open tickets
  - Pending tickets
  - Resolved tickets (30 days)
- Leads stats card:
  - Total leads
  - Conversion rate
  - New leads
- Quick links to:
  - Schools (`/admin/schools`)
  - Admins (`/admin/admins`)
  - Subscriptions (`/admin/subscriptions`)
  - Plans (`/admin/plans`)
  - Leads (`/admin/leads`)
  - Support (`/admin/tickets`)
  - Features (`/admin/features`)
  - System (`/admin/system`)

**API Calls:**
- `useGetDashboardStatsQuery` - Dashboard stats
- `useGetBusinessAnalyticsQuery` - Business analytics
- `useGetSystemHealthQuery` - System health

**Dependencies:**
- RTK Query for API calls
- Shadcn UI components (Card, Badge, Skeleton, Button)
- lucide-react for icons
- React Router for navigation

**Business Logic:**
- Super Admin only access
- Real-time stats refresh
- Navigation to various admin modules

---

### 2. SuperAdminLogin.jsx

**Route:** `/admin/login`

**Functionality:**
- Email/password login
- 2FA (OTP) verification support
- Resend OTP functionality
- Redirects to `/admin` on success
- Checks if user is superadmin role
- Animated transitions between login and OTP forms

**API Calls:**
- `useLoginMutation` - Login
- `useVerify2FAMutation` - Verify 2FA
- `useResend2FAMutation` - Resend 2FA

**Dependencies:**
- RTK Query for API calls
- Redux for auth state
- framer-motion for animations
- lucide-react for icons
- sonner for toast notifications

**Business Logic:**
- Super Admin only login
- 2FA support for enhanced security
- Role verification before granting access

---

### 3. SuperAdminRegister.jsx

**Route:** `/admin/register`

**Functionality:**
- Initial super admin registration (bootstrap)
- Checks if super admin already exists
- Name, email, password, confirm password fields
- Redirects to `/admin` on success
- Password matching validation

**API Calls:**
- `checkSuperAdminExists` - Check if super admin exists
- `superAdminRegister` - Register super admin

**Dependencies:**
- Custom API service
- Redux for auth state
- lucide-react for icons
- sonner for toast notifications

**Business Logic:**
- One-time bootstrap registration
- Prevents duplicate super admin creation
- Auto-login after registration

---

## BACKEND API ENDPOINTS

### Super Admin Dashboard APIs
- **Endpoint:** `GET /admin/dashboard/stats`
- **Purpose:** Fetch dashboard statistics
- **Response:** Revenue, platform stats, etc.

- **Endpoint:** `GET /admin/analytics/business`
- **Purpose:** Fetch business analytics
- **Response:** School counts, user stats, leads, support stats

- **Endpoint:** `GET /admin/system/health`
- **Purpose:** Fetch system health status
- **Response:** Database status, uptime, security status

### Super Admin Auth APIs
- **Endpoint:** `POST /auth/admin/login`
- **Purpose:** Super admin login
- **Request Body:** `{ email, password }`
- **Response:** User data, token, requires2FA flag

- **Endpoint:** `POST /auth/verify-2fa`
- **Purpose:** Verify 2FA code
- **Request Body:** `{ userId, otp }`
- **Response:** User data, token

- **Endpoint:** `POST /auth/resend-2fa`
- **Purpose:** Resend 2FA code
- **Request Body:** `{ userId }`
- **Response:** Success message

- **Endpoint:** `GET /auth/superadmin-exists`
- **Purpose:** Check if super admin exists
- **Response:** `{ exists: boolean }`

- **Endpoint:** `POST /auth/superadmin-register`
- **Purpose:** Register initial super admin
- **Request Body:** `{ name, email, password }`
- **Response:** User data, token

---

## NEW CLIENT IMPLEMENTATION PLAN

### Design Requirements
- Use current Client UI system (Shadcn UI)
- Use current Dashboard card design system
- DO NOT copy old UI visually
- Preserve functionality and backend integration
- Super Admin branding (different from School Admin)

### Implementation Order
1. **Super Admin Login** - Build new with current UI + 2FA support
2. **Super Admin Dashboard** - Build new with current UI + RTK Query
3. **Super Admin Registration** - Build new with current UI (bootstrap only)
4. **Super Admin Routes** - Add protected routes for super admin

### Key Considerations
- Super Admin has separate login from School Admin
- 2FA support for enhanced security
- Separate branding (DugsiHub vs school branding)
- Platform-wide statistics and analytics
- System health monitoring
- Access to all schools and platform management
