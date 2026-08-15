# PUBLIC PAGES AUDIT

## OLD FRONTEND PUBLIC PAGES

### 1. LandingPage.jsx

**Route:** `/`

**Functionality:**
- Hero section with animated text and gradient effects
- Stats display: 500+ schools, 1M+ students, 99.9% uptime, 12+ countries
- Features grid with 4 key features:
  - Multi-Tenant Management
  - Advanced Analytics
  - Enterprise Security
  - White-Label Mobile App
- Mobile ecosystem section with phone mockup
- FAQ section with 4 questions
- Final CTA section
- Links to `/pricing`, `/platform`, `/contact`

**API Calls:** None (static content)

**Dependencies:**
- framer-motion for animations
- lucide-react for icons
- react-router-dom for navigation
- Unsplash images (with fallback to placeholder)

**Business Logic:**
- Pure marketing page
- No authentication required
- No role/permission checks

---

### 2. PricingPage.jsx

**Route:** `/pricing`

**Functionality:**
- Monthly/yearly pricing toggle
- Fetches plans from backend via `useGetAvailablePlansQuery` from adminApiSlice
- Falls back to hardcoded plans if API fails:
  - Starter: $49/month, $470/year (500 students, 20 teachers, 1 branch)
  - Professional: $129/month, $1,238/year (2,000 students, 100 teachers, 5 branches)
  - Business: $299/month, $2,870/year (10,000 students, 500 teachers, 20 branches)
  - Enterprise: Custom (unlimited everything)
- Feature comparison table
- Infrastructure features section
- CTA section with links to `/contact?plan=...`

**API Calls:**
- `GET /admin/plans` (via RTK Query) - fetches available plans

**Dependencies:**
- framer-motion for animations
- lucide-react for icons
- RTK Query for API calls
- react-router-dom for navigation

**Business Logic:**
- Public page (no auth required)
- Displays plan pricing and features
- Links to contact page with plan selection

---

### 3. ContactPage.jsx

**Route:** `/contact`

**Functionality:**
- Contact form with fields:
  - Name (required)
  - Email (required)
  - Phone
  - School Name
  - Country
  - Message (required)
- Supports query params:
  - `?plan=starter|professional|business|enterprise` - pre-fills message with plan interest
  - `?type=contact|demo` - changes form type (contact vs demo request)
- Submits form to `/public/leads` API endpoint
- Toast notifications for success/error
- Displays contact information (email, support type)

**API Calls:**
- `POST /public/leads` - submits lead/contact form

**Dependencies:**
- framer-motion for animations
- lucide-react for icons
- axios for API calls
- sonner for toast notifications
- react-router-dom for navigation and query params

**Business Logic:**
- Public page (no auth required)
- Lead generation for sales
- Demo request handling

---

### 4. FAQPage.jsx

**Route:** `/faq`

**Functionality:**
- Search functionality for FAQs
- Categorized FAQs:
  - General (3 questions)
  - Pricing & Plans (2 questions)
  - Technical & Security (2 questions)
- Accordion-style expand/collapse
- CTA section linking to `/contact`

**API Calls:** None (static content)

**Dependencies:**
- framer-motion for animations
- lucide-react for icons
- react-router-dom for navigation

**Business Logic:**
- Public page (no auth required)
- Static FAQ content
- Search filtering client-side

---

## BACKEND API ENDPOINTS

### Public Leads API
- **Endpoint:** `POST /public/leads`
- **Purpose:** Submit contact/lead form
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "phone": "string",
    "schoolName": "string",
    "country": "string",
    "message": "string",
    "type": "contact|demo"
  }
  ```
- **Response:** Success message or error

### Plans API
- **Endpoint:** `GET /admin/plans`
- **Purpose:** Fetch available subscription plans
- **Response:** Array of plan objects with pricing and features

---

## NEW CLIENT IMPLEMENTATION PLAN

### Design Requirements
- Use current Client UI system (Shadcn UI)
- Use current Dashboard card design system
- Use current spacing/typography
- DO NOT copy old UI visually
- Preserve functionality and backend integration

### Implementation Order
1. **Landing Page** - Build new with current UI
2. **Pricing Page** - Build new with current UI + RTK Query
3. **Contact Page** - Build new with current UI + form validation
4. **FAQ Page** - Build new with current UI

### Key Considerations
- All pages are public (no auth required)
- Pricing page needs RTK Query integration
- Contact page needs form validation (React Hook Form + Zod)
- Contact page needs API integration
- Use Shadcn UI components
- Maintain responsive design
- Support dark mode
