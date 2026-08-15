# CLASSES MANAGEMENT AUDIT

## OLD FRONTEND CLASSES MANAGEMENT

### ClassesManagement.jsx

**Route:** `/classes`

**Functionality:**
- **List View:** Grid view with cards
- **Search:** Search by class name or section
- **CRUD Operations:**
  - Create class (modal form)
  - View class detail (navigate to `/classes/:id`)
- **Class Form Fields:**
  - Class name (required, alphanumeric with spaces)
  - Section (required, single letter A-D only)
  - Maximum students (required, positive integer, 1-99999)
- **Validation:**
  - Strict validation utilities (alphanumericWithSpaces, classSectionABCD, digitsOnlyUnsignedInt)
  - Form error display with visual feedback
  - Section restricted to A, B, C, D only (uppercase)
- **Display:**
  - Class cards with name, section, max students
  - Branch badge (if not in branch scope)
  - Assigned subjects count
  - Navigation to class detail page
- **Animations:** framer-motion for card hover effects and modal transitions

**API Calls:**
- `useGetClassesQuery` - Fetch classes list
- `useCreateClassMutation` - Create class

**Dependencies:**
- RTK Query for API calls
- Shadcn UI components (Button)
- PageLayout, PageHeader, ContentCard, SectionHeader
- SearchInput, FilterBar from DataTable
- framer-motion for animations
- lucide-react for icons
- strictValidation utilities for form validation
- useAppToast hook for notifications

**Business Logic:**
- Tenant-aware (school context)
- Branch-aware (shows branch badge if not in branch scope)
- Permission checks (implied via auth)
- Feature access (implied via subscription)
- Section restricted to A-D only
- Max students validation (1-99999)
- Client-side search and filtering
- Navigation to class detail page

---

## BACKEND API ENDPOINTS

### Classes CRUD
- **Endpoint:** `GET /admin/classes`
- **Purpose:** Fetch classes list
- **Response:** Array of class objects

- **Endpoint:** `POST /admin/classes`
- **Purpose:** Create new class
- **Request Body:** `{ className, section, maxStudents }`
- **Response:** Created class object

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
1. **Create classesApiSlice** - RTK Query endpoints for classes
2. **Create Classes page** - Grid view with search, stats
3. **Create Class form** - Create modal with validation
4. **Create Class detail page** - Navigate to `/classes/:id`
5. **Add edit/delete** - Edit and delete class functionality

### Key Considerations
- Tenant-aware (school context from Redux)
- Branch-aware (branch filter from Redux)
- Permission checks (classes.view, classes.create, classes.edit, classes.delete)
- Feature access (classes feature code)
- Section restricted to A-D only
- Max students validation (1-99999)
- Subject assignment tracking
- Student count tracking
- Class teacher assignment
