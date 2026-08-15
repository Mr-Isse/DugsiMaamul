# DugsiMaamul Client (Module 1 Foundation)

React + Vite + JavaScript frontend for DugsiMaamul School ERP.

## Stack

- React, Vite, JavaScript (no TypeScript)
- Tailwind CSS v4
- Shadcn UI
- Redux Toolkit + RTK Query
- React Router
- React Hook Form + Zod
- Sonner, Lucide React, next-themes

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

API base URL is configured via `VITE_API_BASE_URL`.

## Notes

- Backend remains the source of truth for auth, roles, permissions, tenant, branch, subscription, and validation.
- Module 1 is foundation only — no Dashboard / Students / Teachers / Finance / Super Admin pages.
