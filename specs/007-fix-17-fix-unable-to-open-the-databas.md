# Spec 007: Fix "Unable to open the database file" (SQLite/Prisma) in
API routes + add resilient DB path & bootstrap

**ADW ID:** f00cmxax

**Issue:** #17  
**Type:** /bug  
**Status:** 🔄 In Progress

##
Overview

Fix the "Error code 14: Unable to open the database file" error that
occurs in API routes when Prisma cannot open the SQLite database file. This
happens on Vercel due to read-only filesystem (except `/tmp`) and missing
database initialization. The solution involves normalizing the database URL
based on environment (local vs Vercel), ensuring the database file path is valid
and writable, adding automatic schema initialization for serverless
environments, and implementing a health check endpoint for monitoring database
connectivity.

## Requirements

- [REQ-1] **Environment-aware DB URL
normalization**: Create a helper module that computes the correct SQLite
database URL based on environment - using `/tmp/stock.db` for Vercel serverless
and `file:./prisma/dev.db` for local development
- [REQ-2] **Directory
initialization**: Ensure the database parent directory exists before Prisma
attempts to connect (create `/prisma` folder locally if needed; `/tmp` on Vercel
always exists)
- [REQ-3] **Runtime database bootstrap**: On Vercel, implement
automatic database initialization on first API request - either by running
`prisma migrate deploy` or using a lightweight "create tables if not exist"
approach with seed data
- [REQ-4] **DB health endpoint**: Create
`/api/health/db` endpoint that checks Prisma connectivity, returns database
status, and safely logs the resolved DB path (with redaction for security)
-
[REQ-5] **Explicit error handling**: Update API routes to catch database
connection errors and return clear JSON error messages that include diagnostic
information without exposing sensitive paths
- [REQ-6] **Build-time
migration**: Configure the build process to run `prisma generate` and optionally
`prisma db push` to ensure schema is ready
- [REQ-7] **Documentation**: Update
README with clear instructions for local setup (creating DB + running
migrations) and Vercel deployment strategy (ephemeral `/tmp` database with
limitations)

## Implementation Plan

- [ ] **Analyze codebase**: Review
current `lib/db.ts`, API routes, and Prisma schema to understand connection
patterns and identify all database touchpoints
- [ ] **Design DB URL
normalization**: Create `lib/db-url.ts` helper that detects Vercel environment
via `process.env.VERCEL` and returns appropriate `DATABASE_URL`
- [ ]
**Implement directory initialization**: Add filesystem check in `lib/db.ts` to
ensure parent directory of DB file exists using Node.js `fs` module
- [ ]
**Create bootstrap module**: Implement `lib/db-bootstrap.ts` with functions to
check if database is initialized, run migrations, and seed with sample data for
Vercel demo environment
- [ ] **Update Prisma client**: Modify `lib/db.ts` to
use the normalized URL, add initialization check, and expose a
`ensureDatabase()` function for API routes
- [ ] **Create health endpoint**:
Implement `app/api/health/db/route.ts` that connects via Prisma, runs a simple
query (e.g., `SELECT 1`), and returns status with sanitized DB path info
- [ ]
**Update API routes**: Add try-catch wrappers in `/api/supplies/route.ts`,
`/api/supplies/search/route.ts`, and `/api/stock-movements/route.ts` to handle
`Prisma.PrismaClientInitializationError` with informative error messages
- [ ]
**Update package.json scripts**: Verify `db:generate`, `db:migrate`, `db:push`,
and `db:seed` scripts work correctly; add `db:init` convenience script
- [ ]
**Write tests**: Add unit tests for `lib/db-url.ts` and integration tests for
`/api/health/db` endpoint
- [ ] **Update README**: Document the local
development workflow (`pnpm db:push` → `pnpm db:seed` → `pnpm dev`) and Vercel
deployment strategy (ephemeral `/tmp` database, data resets on each
deploy)

## Files to Modify

- `lib/db-url.ts` (new) - Environment-aware
database URL resolver with Vercel detection and path normalization
-
`lib/db-bootstrap.ts` (new) - Database initialization utilities including schema
creation and seeding for serverless environments
- `lib/db.ts` - Update to use
normalized URL, add directory creation, expose initialization function
-
`app/api/health/db/route.ts` (new) - Health check endpoint that verifies
database connectivity and returns diagnostic info
- `app/api/supplies/route.ts`
- Add database error handling with clear error messages in GET handler
-
`app/api/supplies/search/route.ts` - Add database error handling with clear
error messages in GET handler
- `app/api/stock-movements/route.ts` - Add
database error handling with clear error messages in POST handler
-
`package.json` - Verify existing scripts, potentially add `db:init` convenience
script
- `README.md` - Update "Running Locally" and "Deployment" sections with
database setup instructions and Vercel strategy documentation

## Acceptance
Criteria

- [ ] Running `rm -f prisma/dev.db && pnpm db:push && pnpm dev`
locally results in working API routes without "Unable to open database file"
errors
- [ ] The `/api/health/db` endpoint returns
`{"status":"ok","database":"connected"}` when database is accessible and
includes sanitized path information
- [ ] When database file cannot be opened,
API routes return HTTP 500 with JSON `{"error":"Database
unavailable","details":"Unable to open database at configured path"}` instead of
crashing
- [ ] On Vercel deployment, API routes work without manual database
setup (using `/tmp/stock.db` with auto-initialization)
- [ ] README clearly
explains the two deployment strategies (local persistent DB vs Vercel ephemeral
DB) and their trade-offs
- [ ] All existing tests pass (`pnpm test`)
- [ ] New
tests for `lib/db-url.ts` and `/api/health/db` endpoint pass with proper
coverage

## Notes

- **Vercel filesystem constraints**: Vercel's
serverless functions have a read-only filesystem except for `/tmp` which is
ephemeral (cleared between invocations). This means data will not persist
between requests in production, which is acceptable for a demo but must be
documented clearly.
- **Prisma migration strategy**: Running full migrations at
runtime on serverless is slow and may timeout. For Vercel demo, recommend using
`prisma db push --accept-data-loss` during build or a lightweight table creation
check at runtime. The build step in Vercel should run `prisma generate` to
ensure the client is available.
- **Security consideration**: Never expose full
filesystem paths in error messages or health responses. Use path.basename() or
similar to show only the filename, or redact entirely in production.
-
**Environment detection**: Use `process.env.VERCEL === "1"` to detect Vercel
environment specifically, as `NODE_ENV=production` may also be true in other
environments.
- **Alternative for production**: The issue mentions Option 3
(Postgres via Neon/Supabase) as a future enhancement. Keep this implementation
minimal and SQLite-focused, but structure the code so switching to Postgres
later only requires changing the `DATABASE_URL` format.
- **Testing strategy**:
Use Vitest's environment configuration to mock different environment variables
(`VERCEL`, `DATABASE_URL`) when testing the URL normalization logic.