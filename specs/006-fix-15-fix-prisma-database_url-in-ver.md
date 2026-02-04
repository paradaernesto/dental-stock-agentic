# Spec 006: Fix Prisma DATABASE_URL in Vercel + make Dashboard default
route (/)

**ADW ID:** ki2ulnbm  
**Issue:** #15  
**Type:** /bug

**Status:** 🔄 In Progress

## Overview

The app currently fails on Vercel
deployment with `PrismaClientInitializationError: Environment variable not
found: DATABASE_URL` because the Prisma schema requires the environment variable
but Vercel doesn't have it configured. Additionally, the root route `/` shows a
basic landing page instead of the inventory dashboard, requiring an extra click
for users to access the main functionality.

## Requirements

- [REQ-1]
Ensure Prisma gets a valid `DATABASE_URL` in all environments (local dev and
Vercel) without crashing at runtime
- [REQ-2] Provide safe fallback for
`DATABASE_URL` when environment variable is missing (e.g., `file:./dev.db`)
-
[REQ-3] Make `/` render the inventory dashboard (move dashboard to root or
redirect `/` → `/dashboard`)
- [REQ-4] Avoid duplicating dashboard logic—reuse
existing `InventoryDashboard` component
- [REQ-5] Document Vercel environment
variable setup in README.md
- [REQ-6] Ensure Prisma client generation works in
Vercel build process

## Implementation Plan

- [ ] **Analyze the codebase**
- Review Prisma configuration, routing structure, and env setup
- [ ] **Create
centralized Prisma client** - Create `lib/db.ts` with singleton pattern and safe
DATABASE_URL fallback
- [ ] **Update Prisma schema** - Modify
`prisma/schema.prisma` to use a fallback-compatible URL configuration
- [ ]
**Update service files** - Replace direct `PrismaClient` instantiation in
`lib/services/supplies.ts` and `lib/services/stock-movements.ts` with import
from `lib/db.ts`
- [ ] **Make dashboard default route** - Move
`app/dashboard/page.tsx` content to `app/page.tsx` (or redirect `/` →
`/dashboard`)
- [ ] **Update .env.example** - Ensure DATABASE_URL is clearly
documented with SQLite file path
- [ ] **Update README.md** - Add section on
Vercel deployment with DATABASE_URL environment variable instructions and SQLite
limitations note
- [ ] **Validate build** - Run `pnpm build`, `pnpm lint`, and
`pnpm test` to ensure no regressions

## Files to Modify

- `lib/db.ts`
(NEW) - Centralized Prisma client with singleton pattern and safe DATABASE_URL
handling
- `prisma/schema.prisma` - Update datasource URL to use fallback for
missing DATABASE_URL
- `lib/services/supplies.ts` - Replace `new
PrismaClient()` with import from `lib/db.ts`
-
`lib/services/stock-movements.ts` - Replace `new PrismaClient()` with import
from `lib/db.ts`
- `app/page.tsx` - Replace landing page with
`InventoryDashboard` component (re-export or inline)
- `app/dashboard/page.tsx`
- Either remove (if moved to root) or keep and re-export same component
-
`.env.example` - Already has DATABASE_URL, verify it's correct for local dev
-
`README.md` - Add Vercel deployment section with environment variable setup
instructions

## Acceptance Criteria

- [ ] App builds successfully on
Vercel without `PrismaClientInitializationError`
- [ ] API routes
(`/api/supplies`, `/api/stock-movements`) work without DATABASE_URL crash when
env var is configured
- [ ] Visiting `/` renders the inventory dashboard (same
UI as `/dashboard`)
- [ ] `/dashboard` route still works (redirects to `/` or
shows same content)
- [ ] No duplicate dashboard logic—`InventoryDashboard`
component is reused
- [ ] README.md contains clear instructions for setting
`DATABASE_URL` in Vercel (Settings → Environment Variables)
- [ ] README.md
documents SQLite limitations on Vercel (ephemeral filesystem, data resets on
redeploy)
- [ ] Local development still works with `pnpm dev` and
`file:./dev.db`
- [ ] All existing tests pass (`pnpm test`)
- [ ] Lint passes
(`pnpm lint`)

## Notes

### Technical Considerations

1. **Prisma
Singleton Pattern**: Next.js in dev mode can hot-reload and create multiple
PrismaClient instances. Use the global singleton pattern:
   ```typescript

const globalForPrisma = globalThis as unknown as {
     prisma: PrismaClient |
undefined;
   };
   export const prisma = globalForPrisma.prisma ?? new
PrismaClient();
   if (process.env.NODE_ENV !== "production")
globalForPrisma.prisma = prisma;
   ```

2. **DATABASE_URL Fallback**: The
safest approach is to provide a default in code rather than modifying
schema.prisma (which expects env()). Create the PrismaClient with explicit
datasource URL override:
   ```typescript
   const databaseUrl =
process.env.DATABASE_URL ?? "file:./prisma/dev.db";
   ```

3. **Vercel +
SQLite Limitations**: SQLite on Vercel has significant limitations—the
filesystem is ephemeral and read-only in most cases. For a demo/POC this is
acceptable, but document that data won't persist across deploys. Consider
mentioning PostgreSQL migration path for production use.

4. **Routing
Options**: 
   - **Option A** (Preferred): Move `app/dashboard/page.tsx` →
`app/page.tsx`, remove `/dashboard` or make it redirect to `/`
   - **Option
B**: Keep dashboard at `/dashboard`, add redirect from `/` → `/dashboard` in
`next.config.ts`
   - Choose Option A for cleaner URLs and SSR benefits

###
Dependencies

- `@prisma/client` - Already installed
- `prisma` - Already
installed

### Verification Commands

```bash
# Local validation
pnpm
lint
pnpm build
pnpm test

# Manual testing
open http://localhost:3000/  #
Should show dashboard
open http://localhost:3000/api/supplies  # Should return
JSON without 500 error
```