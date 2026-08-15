# Multi-tenant setup (white-label)

One codebase, many schools — change **only** `.env` / EAS env, not source.

## Per-school `.env` example

```env
TENANT_ID=hamar-boarding
APP_NAME=Hamar Boarding School
PRIMARY_COLOR=#0A84FF
API_URL=http://YOUR_IP:5000/api
```

Other schools:

```env
TENANT_ID=alpha-school
APP_NAME=Alpha School
PRIMARY_COLOR=#2563EB
```

## Run

```bash
npm run start:hamar
# or
cross-env ENVFILE=.env.hamar expo start
```

## Backend (required for Expo Go / local API)

In `backend/.env`:

```env
ALLOW_DEV_TENANT_HEADER=true
# optional production mobile builds:
# ALLOW_MOBILE_TENANT_HEADER=true
```

Mobile sends on **every** request:

- `Authorization: Bearer <token>` (when logged in)
- `x-tenant-id: <TENANT_ID>`

## Startup flow

1. Read `TENANT_ID` from env → `app.config.js` → `extra.tenantId`
2. `bootstrapTenantSchool()` → `GET /api/mobile/tenant/config/:tenantId`
3. Theme/branding from merged build + API config
4. Public home/events use `selectedSchool._id` (Mongo id)

## API

| Endpoint | Purpose |
|----------|---------|
| `GET /api/mobile/tenant/config/:tenantId` | School branding + home + events preview |
| `GET /api/auth/tenant` | Legacy fallback (with `x-tenant-id`) |
