# TEACHERS MANAGEMENT AUDIT

## OLD FRONTEND TEACHERS MANAGEMENT

### TeachersManagement.jsx

**Route:** `/teachers`

**Functionality:**
- **List View:** Table view with sticky columns
- **Grid View:** Card view alternative with animations
- **Search:** Search by name, custom ID, email, phone, subject
- **Stats Cards:**
  - Total Teachers
  - Active Teachers
  - With Subjects (teachers who have assigned subjects)
  - Avg Subjects (average subjects per teacher)
- **Charts:**
  - Subject distribution pie chart (shows teachers grouped by number of subjects)
- **CRUD Operations:**
  - Create teacher (modal form)
  - Edit teacher (modal form)
  - Delete teacher (confirmation modal)
- **Password Management:**
  - Reset password (generate random or manual)
  - View credentials (copy username)
- **Bulk Operations:**
  - Bulk import (Excel/CSV)
  - Export to Excel
- **Teacher Form Fields:**
  - Profile photo (image upload)
  - Full name (required, letters only)
  - Phone (required, numbers only)
  - Age (required, 18-70)
  - Email (optional, valid email format)
  - Teacher ID (required, alphanumeric, auto-generated with school prefix)
  - Password (required for create, min 8 chars)
  - Working start time (required, HH:MM format)
  - Working end time (required, HH:MM format)
  - Subjects (required, multi-select from available subjects)
- **Validation:**
  - Strict validation utilities (lettersAndSpacesOnly, numbersOnly, alphanumericId, etc.)
  - Real-time teacher ID availability check (debounced)
  - School prefix requirement for teacher ID
  - Form error display with visual feedback

**API Calls:**
- `useGetTeachersQuery` - Fetch teachers list
- `useCreateTeacherMutation` - Create teacher
- `useUpdateTeacherMutation` - Update teacher
- `useDeleteTeacherMutation` - Delete teacher
- `useResetTeacherPasswordMutation` - Reset teacher password
- `useGetSubjectsQuery` - Fetch subjects for dropdown
- `useLazyCheckTeacherIdQuery` - Check teacher ID availability

**Dependencies:**
- RTK Query for API calls
- Shadcn UI components (Button, Input, Dialog)
- PageLayout, PageHeader, KpiCard, KpiGrid, SummaryWidget
- recharts for pie chart
- xlsx for Excel export
- sonner for toast notifications
- framer-motion for animations
- lucide-react for icons
- strictValidation utilities for form validation

**Business Logic:**
- Tenant-aware (school context)
- Branch-aware (shows branch column if not in branch scope)
- Permission checks (implied via auth)
- Feature access (implied via subscription)
- Teacher ID auto-generation with school prefix
- Real-time ID availability check
- Subject assignment (multi-select)
- Working hours tracking
- Password reset with generate or manual option
- Client-side search and filtering
- Export functionality
- Bulk import support

---

## BACKEND API ENDPOINTS

### Teachers CRUD
- **Endpoint:** `GET /admin/teachers`
- **Purpose:** Fetch teachers list
- **Response:** Array of teacher objects

- **Endpoint:** `POST /admin/teachers`
- **Purpose:** Create new teacher
- **Request Body:** Teacher data object
- **Response:** Created teacher object

- **Endpoint:** `PUT /admin/teachers/:id`
- **Purpose:** Update teacher
- **Request Body:** Teacher data object
- **Response:** Updated teacher object

- **Endpoint:** `DELETE /admin/teachers/:id`
- **Purpose:** Delete teacher
- **Response:** Success message

### Teachers Operations
- **Endpoint:** `POST /admin/teachers/:id/reset-password`
- **Purpose:** Reset teacher password
- **Request Body:** `{ generateRandom: boolean, newPassword?: string }`
- **Response:** Success message or generated password

- **Endpoint:** `GET /admin/teachers/check-id?customId=xxx&excludeId=xxx`
- **Purpose:** Check teacher ID availability
- **Response:** `{ available: boolean, message: string }`

### Related Data
- **Endpoint:** `GET /admin/subjects`
- **Purpose:** Fetch subjects for dropdown
- **Response:** Array of subject objects

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
1. **Create teachersApiSlice** - RTK Query endpoints for teachers
2. **Create Teachers page** - List view with table, grid toggle, stats
3. **Create Teacher form** - Create/Edit modal with validation
4. **Add password reset** - Generate or manual password reset
5. **Add bulk import** - Excel/CSV import functionality
6. **Add export** - Excel export functionality
7. **Add teacher ID check** - Real-time ID availability check

### Key Considerations
- Tenant-aware (school context from Redux)
- Branch-aware (branch filter from Redux)
- Permission checks (teachers.view, teachers.create, teachers.edit, teachers.delete)
- Feature access (teachers feature code)
- Teacher ID auto-generation with school prefix
- Real-time ID availability check
- Subject assignment (multi-select)
- Working hours tracking
- Password reset with generate or manual option
- Image upload for profile photos
- Strict form validation
