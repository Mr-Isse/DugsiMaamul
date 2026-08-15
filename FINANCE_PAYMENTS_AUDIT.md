# FINANCE/PAYMENTS AUDIT

## OLD FRONTEND FINANCE/PAYMENTS MODULES

### EnterpriseFinanceManagement.jsx

**Route:** `/enterprise-finance` (likely)

**Functionality:**
- **List View:** Table view with finance records
- **Search:** Search by fiscal year or status
- **CRUD Operations:**
  - Create finance record (inline form)
  - Edit finance record (inline form)
  - Delete finance record (confirmation)
- **Finance Record Fields:**
  - Fiscal year (required, e.g., 2025-2026)
  - Status (Draft, Approved, Active, Closed)
  - Budget items (dynamic list):
    - Category (required)
    - Allocated amount (required, number)
    - Spent amount (optional, number)
    - Description (optional)
  - Notes (optional, textarea)
- **Budget Items Management:**
  - Add/remove budget items
  - Calculate total allocated and total spent
- **Display:**
  - Fiscal year
  - Number of budget items
  - Total allocated (sum of allocated amounts)
  - Total spent (sum of spent amounts)
  - Status badge
  - Edit/Delete actions

**API Calls:**
- `useGetEnterpriseFinanceQuery` - Fetch enterprise finance records
- `useCreateEnterpriseFinanceMutation` - Create finance record
- `useUpdateEnterpriseFinanceMutation` - Update finance record
- `useDeleteEnterpriseFinanceMutation` - Delete finance record

**Dependencies:**
- RTK Query for API calls
- framer-motion for animations
- lucide-react for icons
- useToast for notifications

**Business Logic:**
- Enterprise-level finance management (not school-specific)
- Budget tracking with categories
- Fiscal year planning
- Status workflow (Draft → Approved → Active → Closed)
- Client-side calculations for totals

---

### PaymentsManagement.jsx

**Route:** `/payments`

**Functionality:**
- **Tabs:**
  - Fee Management (student payment records)
  - Payment Months (monthly payment batches)
  - Transactions (transaction history)
  - Payment Settings (if payment-integration feature enabled)
- **Automatic Monthly Billing:**
  - System automatically generates payment records on 1st of each month
  - Manual "Generate Payments" button to trigger for current month
  - Uses student's assigned monthly fee
- **Filters:**
  - Month (All Months, January-December)
  - Year (current year ± 1)
  - Class (All Classes or specific class)
  - Status (All Status, PAID, UNPAID)
  - Search (student name or ID)
- **Stats Cards:**
  - Expected Revenue (sum of all payment amounts)
  - Collected (sum of paid payments)
  - Unpaid Balance (sum of unpaid payments)
  - Collection Rate (percentage of paid vs expected)
- **Charts:**
  - Monthly Collection Trend (line chart)
  - Revenue By Branch (pie chart)
- **Fee Management Tab:**
  - Table view of student payment records
  - Mark payment as PAID
  - Revert payment to UNPAID
  - Print receipt (placeholder)
  - Branch-aware column
- **Payment Months Tab:**
  - Grid view of payment month batches
  - Collection rate progress bar
  - Total students, paid count, unpaid count
  - Delete payment month (with confirmation)
- **Transactions Tab:**
  - Transaction history component
- **Payment Settings Tab:**
  - Payment settings component (if feature enabled)
- **Export:**
  - Export to Excel
  - Export to CSV
  - Print PDF (window.print)
- **Feature Access:**
  - Payment Settings tab only shown if `payment-integration` feature is enabled

**API Calls:**
- `useGetStatsQuery` - Fetch dashboard stats
- `useGetClassesQuery` - Fetch classes for filter
- `useGetPaymentMonthsQuery` - Fetch payment month batches
- `useGetMonthlyPaymentsQuery` - Fetch student payment records
- `useGenerateMonthlyPaymentsMutation` - Generate payments for a month
- `useDeletePaymentMonthMutation` - Delete payment month batch
- `useMarkPaymentPaidMutation` - Mark payment as paid
- `useMarkPaymentUnpaidMutation` - Revert payment to unpaid

**Dependencies:**
- RTK Query for API calls
- Shadcn UI components (Skeleton)
- PageLayout, PageHeader, ContentCard, StatsGrid2
- RevenueCharts (MonthlyRevenueLine, RevenueByBranchPie)
- ConfirmModal
- PaymentSettingsPage component
- TransactionHistory component
- PaymentModal component
- framer-motion for animations
- xlsx for Excel export
- sonner for toast notifications
- lucide-react for icons
- hasFeatureAccess utility for feature checks

**Business Logic:**
- Tenant-aware (school context)
- Branch-aware (shows branch column if not in branch scope)
- Permission checks (implied via auth)
- Feature access (payment-integration feature)
- Automatic monthly billing system
- Payment generation for all active students
- Collection rate calculation
- Client-side search and filtering
- Export functionality
- Payment integration feature gating

---

## BACKEND API ENDPOINTS

### Enterprise Finance
- **Endpoint:** `GET /enterprise/finance`
- **Purpose:** Fetch enterprise finance records
- **Response:** Array of finance objects

- **Endpoint:** `POST /enterprise/finance`
- **Purpose:** Create finance record
- **Request Body:** `{ fiscalYear, budgetItems, status, notes }`
- **Response:** Created finance object

- **Endpoint:** `PUT /enterprise/finance/:id`
- **Purpose:** Update finance record
- **Request Body:** Finance data object
- **Response:** Updated finance object

- **Endpoint:** `DELETE /enterprise/finance/:id`
- **Purpose:** Delete finance record
- **Response:** Success message

### Payments
- **Endpoint:** `GET /admin/payments/months`
- **Purpose:** Fetch payment month batches
- **Query Params:** classId, status
- **Response:** Array of payment month objects

- **Endpoint:** `GET /admin/payments/monthly`
- **Purpose:** Fetch student payment records
- **Query Params:** month, year, classId, status
- **Response:** Array of payment objects

- **Endpoint:** `POST /admin/payments/generate`
- **Purpose:** Generate payments for a month
- **Request Body:** `{ month, year }`
- **Response:** Success message

- **Endpoint:** `DELETE /admin/payments/months/:id`
- **Purpose:** Delete payment month batch
- **Response:** Success message

- **Endpoint:** `PUT /admin/payments/:id/mark-paid`
- **Purpose:** Mark payment as paid
- **Response:** Success message

- **Endpoint:** `PUT /admin/payments/:id/mark-unpaid`
- **Purpose:** Revert payment to unpaid
- **Response:** Success message

### Related Data
- **Endpoint:** `GET /admin/classes`
- **Purpose:** Fetch classes for filter
- **Response:** Array of class objects

- **Endpoint:** `GET /admin/stats`
- **Purpose:** Fetch dashboard stats
- **Response:** Stats object

---

## NEW CLIENT IMPLEMENTATION PLAN

### Design Requirements
- Use current Client UI system (Shadcn UI)
- Use current Dashboard card design system
- DO NOT copy old UI visually
- Preserve functionality and backend integration
- Use RTK Query for API calls
- Use React Hook Form + Zod for form validation

### Implementation Order
1. **Create financeApiSlice** - RTK Query endpoints for enterprise finance
2. **Create paymentsApiSlice** - RTK Query endpoints for payments
3. **Create Enterprise Finance page** - List view, form, budget items management
4. **Create Payments page** - Tabs, filters, stats, charts
5. **Create Fee Management tab** - Payment records table, mark paid/unpaid
6. **Create Payment Months tab** - Grid view, delete month
7. **Create Transactions tab** - Transaction history
8. **Create Payment Settings tab** - Payment settings (if feature enabled)
9. **Add export** - Excel/CSV export functionality

### Key Considerations
- Tenant-aware (school context from Redux)
- Branch-aware (branch filter from Redux)
- Permission checks (finance.view, finance.create, finance.edit, finance.delete, payments.view, payments.manage)
- Feature access (payment-integration feature for Payment Settings tab)
- Automatic monthly billing system
- Payment generation for all active students
- Collection rate calculation
- Budget items management (dynamic list)
- Fiscal year planning
- Status workflow
- Export functionality
