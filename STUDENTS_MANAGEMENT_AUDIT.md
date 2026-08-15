# STUDENTS MANAGEMENT AUDIT

## OLD FRONTEND STUDENTS MANAGEMENT

### StudentsManagement.jsx

**Route:** `/students`

**Functionality:**
- **List View:** Table view with pagination (20 per page)
- **Grid View:** Card view alternative
- **Search:** Search by name, custom ID, phone, email, parent name, parent phone
- **Filters:**
  - Class filter
  - Gender filter (Male/Female)
  - Status filter (Active/Inactive/Graduated/Transferred)
  - Branch filter
- **Stats Cards:**
  - Total Students
  - Active Students (with percentage)
  - Male Students (with percentage)
  - Female Students (with percentage)
- **Charts:**
  - Class distribution pie chart
  - Quick summary widget
- **CRUD Operations:**
  - Create student (modal form)
  - Edit student (modal form)
  - Delete student (confirmation modal)
  - View student profile (modal)
- **Bulk Operations:**
  - Bulk import (Excel/CSV)
  - Generate bulk credentials
  - Generate single student credentials
  - Export to Excel/CSV
  - Multi-select for export
- **Student Form Fields:**
  - Profile photo (image upload)
  - Full name (required)
  - Phone
  - Email
  - Student ID (required, customId)
  - Age
  - Class (required, dropdown)
  - Monthly fees (required, number)
  - Gender (Male/Female)
  - Mode (Full-time/Part-time)
  - Place of birth
  - Address
  - Entry date
  - Mother's name
  - Parent/Guardian name
  - Parent's phone
  - Emergency contact
  - Branch (auto-filled from selected branch)

**API Calls:**
- `useGetStudentsQuery` - Fetch students list
- `useCreateStudentMutation` - Create student
- `useUpdateStudentMutation` - Update student
- `useDeleteStudentMutation` - Delete student
- `useGetClassesQuery` - Fetch classes for dropdown
- `useGenerateBulkCredentialsMutation` - Generate bulk credentials
- `useGenerateStudentLoginMutation` - Generate single student credentials
- `useGetBranchesQuery` - Fetch branches for filter

**Dependencies:**
- RTK Query for API calls
- Shadcn UI components (Card, Badge, Button, Input, Dialog, Select, DropdownMenu, Skeleton)
- EnterprisePageLayout, EnterpriseStatsGrid, EnterpriseTable, EnterpriseFilterPanel
- recharts for pie chart
- xlsx for Excel export
- sonner for toast notifications
- lucide-react for icons

**Business Logic:**
- Tenant-aware (school context)
- Branch-aware (filter by branch)
- Permission checks (implied via auth)
- Feature access (implied via subscription)
- Pagination for large datasets
- Client-side filtering and search
- Export functionality
- Bulk import support
- Credential generation for mobile app access

---

## BACKEND API ENDPOINTS

### Students CRUD
- **Endpoint:** `GET /admin/students`
- **Purpose:** Fetch students list
- **Query Params:** branch, class, status, etc.
- **Response:** Array of student objects

- **Endpoint:** `POST /admin/students`
- **Purpose:** Create new student
- **Request Body:** Student data object
- **Response:** Created student object

- **Endpoint:** `PUT /admin/students/:id`
- **Purpose:** Update student
- **Request Body:** Student data object
- **Response:** Updated student object

- **Endpoint:** `DELETE /admin/students/:id`
- **Purpose:** Delete student
- **Response:** Success message

### Students Operations
- **Endpoint:** `POST /admin/students/generate-credentials`
- **Purpose:** Generate bulk credentials for students
- **Response:** Success message

- **Endpoint:** `POST /admin/students/:id/generate-login`
- **Purpose:** Generate single student credentials
- **Response:** Generated credentials

### Related Data
- **Endpoint:** `GET /admin/classes`
- **Purpose:** Fetch classes for dropdown
- **Response:** Array of class objects

- **Endpoint:** `GET /admin/branches`
- **Purpose:** Fetch branches for filter
- **Response:** Array of branch objects

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
1. **Create studentsApiSlice** - RTK Query endpoints for students
2. **Create Students page** - List view with table, filters, stats
3. **Create Student form** - Create/Edit modal with validation
4. **Add bulk import** - Excel/CSV import functionality
5. **Add credential generation** - Bulk and single credential generation
6. **Add export** - Excel/CSV export functionality
7. **Add profile modal** - Student profile view

### Key Considerations
- Tenant-aware (school context from Redux)
- Branch-aware (branch filter from Redux)
- Permission checks (students.view, students.create, students.edit, students.delete)
- Feature access (students feature code)
- Pagination for large datasets
- Client-side filtering and search
- Export functionality
- Bulk import support
- Credential generation for mobile app access
- Image upload for profile photos
