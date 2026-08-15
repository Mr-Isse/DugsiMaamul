# 🏫 School Management System — Multi-Tenant Platform

> **Nidaamka Maareynta Dugsiga** · Xalalka Casriga ah ee Waxbarashada

---

## 📋 Dulmar Guud (Overview)

**School Management System (SMS)** waa platform casri ah oo multi-tenant ah oo loogu talagalay maareynta dugsiyada, jaamacadaha, iyo xarumaha waxbarashada. Nidaamku wuxuu siinayaa **dugsi kasta** deegaankiisa gooni ah (tenant) oo ka madax bannaan tennants-kale, halkaas oo xogta, isticmaalayaasha, iyo habayntu ay gaar u yihiin.

```
🌐 Platform
├── 🏫 Dugsi A  (Tenant 1)  ─── xogtiisa gooni
├── 🏫 Dugsi B  (Tenant 2)  ─── xogtiisa gooni
├── 🏫 Dugsi C  (Tenant 3)  ─── xogtiisa gooni
└── 🏫 Dugsi N  (Tenant N)  ─── xogtiisa gooni
```

---

## 🎯 Ujeedooyinka Mashruuca (Project Goals)

| # | Ujeedada | Heerka |
|---|----------|--------|
| 1 | Maamul fudud oo dhakhso leh | 🔴 Muhiim |
| 2 | Multi-tenancy ammaan ah | 🔴 Muhiim |
| 3 | UI/UX casri iyo qurux badan | 🟠 Sare |
| 4 | Mobile-first responsive design | 🟠 Sare |
| 5 | Real-time notifications | 🟡 Dhexdhexaad |
| 6 | Warbixino (Reports) faahfaahsan | 🟡 Dhexdhexaad |

---

## 🧱 Qaab-dhismeedka Nidaamka (System Architecture)

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (React.js)                │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │  Auth UI │  │Dashboard │  │  Module Pages       │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
└────────────────────────┬────────────────────────────┘
                         │ REST API / GraphQL
┌────────────────────────▼────────────────────────────┐
│                  BACKEND (Node.js / Laravel)          │
│  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │  Auth Server │  │   Tenant Management Service  │ │
│  └──────────────┘  └──────────────────────────────┘ │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│              DATABASE LAYER (PostgreSQL)              │
│   Tenant A DB  │  Tenant B DB  │  Tenant C DB        │
└─────────────────────────────────────────────────────┘
```

---

## 🗂️ Qeybaha Nidaamka (Core Modules)

### 1. 🔐 Authentication & Tenant Management

- **Super Admin Portal** — Maamulka dhammaan tenants-ka
- **Tenant Onboarding** — Diiwaan gelinta dugsiga cusub
- **Role-Based Access Control (RBAC)** — Xuquuqda isticmaalaha
- **Single Sign-On (SSO)** — Gal hal mar

### 2. 👨‍🎓 Maamulka Ardayda (Student Management)

- Diiwaan gelinta ardayda cusub
- Warbixinnada aragtida (Attendance)
- Natiijada imtixaanada
- Faahfaahinta qoyska & xiriirka waalidiinta
- Taariikhdda waxbarasho (Academic History)

### 3. 👩‍🏫 Maamulka Macalimiinta (Teacher Management)

- Profile macallinka
- Jadwalka casharka (Timetable)
- Xisaabinta mushaharka
- Qiimeynta waxqabadka
- Aqoonta xirfadeed iyo tababarka

### 4. 📚 Maamulka Xaaladda Waxbarashada (Academic Management)

- Maaddooyinka (Subjects & Curriculum)
- Fasalada & Kooxaha (Classes & Sections)
- Jadwalka imtixaanada
- Natiijada & Shahaadada
- Buugaagta iyo xogta maaddooyinka

### 5. 💰 Maamulka Maaliyadda (Finance Management)

- Kharashka dugsigu (School Fees)
- Lacag-bixinta ardayda
- Warbixinnada xisaabta
- Cashiirka elektaroonig ah
- Dib-u-celinta & xaaladaha gaar ah

### 6. 📊 Dashboard & Analytics

- Tirakoobka guud ee dugsigu
- Graphs & Charts waqtiga dhabta ah
- Warbixinnada ardayda si gaar ah
- Barbardhigga heerarka waxbarashada
- Saadaalinta (Predictive Analytics)

### 7. 📢 Xiriirka & Ogeysiiska (Communication)

- SMS & Email Notifications
- In-app messaging
- Warbaahinta dugsigu (Announcements)
- Portal waalidiinta
- Video conferencing integration

---

## 🖥️ Frontend Stack (Teknoolojiyada)

```json
{
  "framework":     "React.js 18+",
  "state":         "Redux Toolkit",
  "ui_library":    "Tailwind CSS ",
  "routing":       "React Router",
  "forms":         "React Hook Form + Zod",
  "charts":        "Recharts / ApexCharts",
  "api":           "Axios + React Query (TanStack)",
  "auth":          "JWT + Refresh Token",
  "testing":       "Vitest + Testing Library",
  "bundler":       "Vite",
  "icons":         "Lucide React"
}
```

---

## 📁 Qaab-dhismeedka Faylasha (Folder Structure)

```
📦 school-management-frontend/
├── 📂 public/
│   └── assets/
├── 📂 src/
│   ├── 📂 app/
│   │   ├── store.ts
│   │   └── router.tsx
│   ├── 📂 components/
│   │   ├── 📂 common/          # Button, Input, Modal, Table
│   │   ├── 📂 layout/          # Sidebar, Navbar, Footer
│   │   └── 📂 charts/          # LineChart, BarChart, PieChart
│   ├── 📂 features/
│   │   ├── 📂 auth/            # Login, Register, ForgotPassword
│   │   ├── 📂 dashboard/       # Overview, Stats, Recent Activity
│   │   ├── 📂 students/        # List, Detail, Form, Attendance
│   │   ├── 📂 teachers/        # List, Detail, Form, Schedule
│   │   ├── 📂 academics/       # Subjects, Classes, Exams, Results
│   │   ├── 📂 finance/         # Fees, Payments, Reports
│   │   ├── 📂 communication/   # Messages, Announcements
│   │   └── 📂 settings/        # Tenant Config, Profile, Roles
│   ├── 📂 hooks/               # Custom React Hooks
│   ├── 📂 services/            # API calls
│   ├── 📂 types/               # TypeScript interfaces
│   ├── 📂 utils/               # Helper functions
│   └── 📂 styles/              # Global CSS, Tailwind config
├── 📄 .env.example
├── 📄 vite.config.ts
├── 📄 tailwind.config.ts
├── 📄 tsconfig.json
└── 📄 package.json
```

---

## 🔑 Multi-Tenancy Strategy

Nidaamku wuxuu adeegsanayaa habka **Subdomain-based Tenancy**:

```
app.sms.com           → Super Admin
dugsia.sms.com        → Tenant: Dugsi A
dugsihooyada.sms.com  → Tenant: Dugsi Hooyada
xeroqalin.sms.com     → Tenant: Xero Qalin
```

### Sida loo kala soocayo Tenants-ka:

```typescript
// hooks/useTenant.ts
export const useTenant = () => {
  const hostname  = window.location.hostname;
  const subdomain = hostname.split('.')[0];
  
  return {
    tenantId:     subdomain,
    tenantSlug:   subdomain,
    isMainDomain: subdomain === 'app',
  };
};
```

---

## 👥 Doorarka Isticmaalaha (User Roles)

| Door | Magac | Xuquuqda |
|------|-------|----------|
| 🔵 `SUPER_ADMIN` | Maamulka Guud | Dhammaan tenants |
| 🟢 `SCHOOL_ADMIN` | Maamulka Dugsigu | Dugsigiisa oo dhan |
| 🟡 `TEACHER` | Macallinka | Fasalka & ardaydiisa |
| 🟠 `STUDENT` | Ardayga | Xogtaas u gaar ah |
| 🔴 `PARENT` | Waalidka | Xogta ilmihiisa |
| ⚪ `ACCOUNTANT` | Xisaabiyaha | Maaliyadda keliya |

---

## 🎨 Design System

### Midabada (Color Palette)

```css
:root {
  /* Primary */
  --color-primary:     #1E40AF;   /* Buluug Qoto dheer */
  --color-primary-lt:  #3B82F6;   /* Buluug iftiiman */

  /* Secondary */
  --color-secondary:   #0F766E;   /* Cagaaran-Buluug */

  /* Accent */
  --color-accent:      #F59E0B;   /* Jaalle Dahab */

  /* Neutral */
  --color-bg:          #F8FAFC;
  --color-surface:     #FFFFFF;
  --color-text:        #0F172A;
  --color-muted:       #64748B;

  /* Status */
  --color-success:     #16A34A;
  --color-warning:     #D97706;
  --color-danger:      #DC2626;
  --color-info:        #0284C7;
}
```

### Typography

```css
/* Cinwaanada */
font-family: 'Plus Jakarta Sans', sans-serif;
font-weight: 700;

/* Qoraalka Caadiga ah */
font-family: 'DM Sans', sans-serif;
font-weight: 400;

/* Koodka */
font-family: 'JetBrains Mono', monospace;
```

---

## 📱 Responsive Breakpoints

```
📱 Mobile:   < 640px    → Hal tiir, bottom nav
📱 Tablet:   640–1024px → Sidebar la daray
💻 Desktop:  > 1024px   → Full layout + sidebar
🖥️ Wide:     > 1280px   → Dheer oo bannaanbanad badan
```

---

## 🚀 Sida Loo Bilaabo (Getting Started)

### 1. Clone & Install

```bash
# Clone mashruuca
git clone https://github.com/your-org/school-management-frontend.git
cd school-management-frontend

# Ku rakib dependencies-ka
npm install

# Ka koobiye .env
cp .env.example .env.local
```

### 2. Habaynta .env

```env
VITE_APP_NAME=School Management System
VITE_API_BASE_URL=https://api.sms.com/v1
VITE_TENANT_DOMAIN=sms.com
VITE_APP_ENV=development
```

### 3. Bilow Server-ka

```bash
# Development
npm run dev

# Build
npm run build

# Preview
npm run preview

# Tests
npm run test
```

---

## 📊 Xaaladda Mashruuca (Project Status)

```
✅  Xushmad Guud & Auth System           100%  ████████████████████
✅  Maamulka Ardayda                      100%  ████████████████████
✅  Maamulka Macalimiinta                  90%  ██████████████████░░
🔄  Maamulka Xaaladda Waxbarashada         75%  ███████████████░░░░░
🔄  Maamulka Maaliyadda                    60%  ████████████░░░░░░░░
⏳  Dashboard & Analytics                  40%  ████████░░░░░░░░░░░░
⏳  Xiriirka & Ogeysiiska                  20%  ████░░░░░░░░░░░░░░░░
⏳  Super Admin Portal                     15%  ███░░░░░░░░░░░░░░░░░
```

---

## 🔗 Xiriirka Muhiimka ah (Key Links)

| Nooca | Xiriirka |
|-------|---------|
| 📖 Dukumiintigii | [docs.sms.com](https://docs.sms.com) |
| 🎨 Figma Design | [figma.com/sms-design](https://figma.com) |
| 🐛 Issue Tracker | [github.com/issues](https://github.com) |
| 🚀 Staging URL | [staging.sms.com](https://staging.sms.com) |
| 💬 Discord | [discord.gg/sms-dev](https://discord.gg) |

---

## 👨‍💻 Kooxda Horumarinta (Dev Team)

| Magac | Door | Email |
|-------|------|-------|
| Ahmed Hassan | Lead Frontend Dev | ahmed@sms.com |
| Fatima Noor | UI/UX Designer | fatima@sms.com |
| Omar Abdi | Backend Dev | omar@sms.com |
| Maryam Said | QA Engineer | maryam@sms.com |

---

## 📜 Shuruucda Isticmaalka (License)

```
MIT License — Xor baa logu isticmaali karaa waxbarasho & ganacsiga.
Copyright © 2024 School Management System Project
```

---

<div align="center">

**Waxaa Sameyay Kooxda SMS Dev Team** 🚀

*Waxbarashada mustaqbalka — maanta bilow*

⭐ **Star** mashruuca haddaad jecelahay • 🍴 **Fork** oo wax ku dar

</div>