# ATTENDANCE MANAGEMENT AUDIT

## OLD FRONTEND ATTENDANCE MANAGEMENT

### AttendanceManagement.jsx

**Route:** `/attendance`

**Functionality:**
- **List View:** Table view (desktop) and card view (mobile)
- **Search:** Search by student name or ID
- **Filters:**
  - Class filter
  - Status filter (All, Present, Absent, Late)
- **Stats Cards:**
  - Present Today
  - Absent Today
  - Monthly Absents (unique students absent this month)
  - Late Arrivals Today
- **Charts:**
  - Attendance Trend (line chart)
  - Present vs Absent (pie chart)
  - Top Absent Students (bar chart)
- **CRUD Operations:**
  - Take attendance (modal form)
  - Edit attendance (modal form)
  - Delete attendance (confirmation modal)
- **Take Attendance Modal:**
  - Select class (dropdown based on role)
  - Select subject (dropdown based on class)
  - Student list with status buttons (Present, Absent, Late, Excused)
  - Bulk submit attendance
- **Edit Attendance Modal:**
  - View student details
  - Change status (Present, Absent, Late, Excused)
- **Attendance Status:**
  - Present (green)
  - Absent (red)
  - Late (amber)
  - Excused (blue)
- **Attendance Rate:** Calculates student attendance percentage (Present + Late count / total records)
- **Role-based Access:**
  - School Admin: Can take attendance for any class and subject
  - Teacher: Can only take attendance for assigned classes and taught subjects
- **Branch-aware:** Shows branch column if not in branch scope

**API Calls:**
- `useGetAttendanceQuery` - Fetch attendance records
- `useGetClassesQuery` - Fetch classes (school admin only)
- `useGetAssignedClassesQuery` - Fetch assigned classes (teacher only)
- `useGetTaughtSubjectsQuery` - Fetch taught subjects (teacher only)
- `useGetStudentsInClassQuery` - Fetch students in selected class
- `useGetClassByIdQuery` - Fetch class details with subjects
- `useGetSubjectsQuery` - Fetch all subjects (school admin only)
- `useTakeAttendanceMutation` - Submit attendance
- `useUpdateAttendanceMutation` - Update attendance record
- `useDeleteAttendanceMutation` - Delete attendance record
- `useGetBranchesQuery` - Fetch branches

**Dependencies:**
- RTK Query for API calls
- Shadcn UI components (Dialog, Skeleton)
- PageLayout, PageHeader, ContentCard, StatsGrid2
- AttendanceCharts (AttendanceTrend, PresentAbsentPie, TopAbsentStudents)
- ConfirmModal
- lucide-react for icons
- sonner for toast notifications

**Business Logic:**
- Tenant-aware (school context)
- Branch-aware (shows branch column if not in branch scope)
- Role-based class/subject selection
- Permission checks (implied via auth)
- Feature access (implied via subscription)
- Duplicate attendance check (error if already recorded)
- Student attendance rate calculation
- Monthly absent tracking (unique students)
- Client-side search and filtering
- Mobile-responsive design (cards on mobile, table on desktop)

---

## BACKEND API ENDPOINTS

### Attendance CRUD
- **Endpoint:** `GET /admin/attendance`
- **Purpose:** Fetch attendance records
- **Query Params:** class, status, date range
- **Response:** Array of attendance objects

- **Endpoint:** `POST /admin/attendance`
- **Purpose:** Take attendance for a class
- **Request Body:** `{ classId, subjectId, studentsAttendance: [{ studentId, status }], date, isAdmin }`
- **Response:** Created attendance records

- **Endpoint:** `PUT /admin/attendance/:id`
- **Purpose:** Update attendance record
- **Request Body:** `{ status }`
- **Response:** Updated attendance record

- **Endpoint:** `DELETE /admin/attendance/:id`
- **Purpose:** Delete attendance record
- **Response:** Success message

### Related Data
- **Endpoint:** `GET /admin/classes`
- **Purpose:** Fetch classes for dropdown
- **Response:** Array of class objects

- **Endpoint:** `GET /admin/subjects`
- **Purpose:** Fetch subjects for dropdown
- **Response:** Array of subject objects

- **Endpoint:** `GET /admin/classes/:id/students`
- **Purpose:** Fetch students in a class
- **Response:** Array of student objects

- **Endpoint:** `GET /admin/teachers/assigned-classes`
- **Purpose:** Fetch assigned classes for teacher
- **Response:** Array of class objects

- **Endpoint:** `GET /admin/teachers/taught-subjects`
- **Purpose:** Fetch taught subjects for teacher
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
1. **Create attendanceApiSlice** - RTK Query endpoints for attendance
2. **Create Attendance page** - List view with table, filters, stats
3. **Create Take Attendance modal** - Class/subject selection, student list, status buttons
4. **Create Edit Attendance modal** - Status change
5. **Add charts** - Attendance trend, present/absent pie, top absent students
6. **Add export** - Excel export functionality

### Key Considerations
- Tenant-aware (school context from Redux)
- Branch-aware (branch filter from Redux)
- Role-based class/subject selection (school admin vs teacher)
- Permission checks (attendance.view, attendance.create, attendance.edit, attendance.delete)
- Feature access (attendance feature code)
- Duplicate attendance check
- Student attendance rate calculation
- Monthly absent tracking
- Mobile-responsive design
