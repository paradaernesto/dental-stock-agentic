# Spec 003: Initialize server-side inventory persistence using Prisma
+ SQLite

**ADW ID:** 15kohtgp  
**Issue:** #7  
**Type:** /feature

**Status:** 🔄 In Progress

## Overview

Set up a minimal, server-side
persistence layer using Prisma with SQLite to manage dental supplies. Create
server-side API routes for CRUD operations while ensuring Prisma is used
exclusively in server-side code (API routes / server actions) and never in the
browser. The Supply model needs to be updated to match the requirements with
category, unit, stock, and minimumStock fields.

## Requirements

- [REQ-1]
Prisma schema must define Supply model with: id, name, category, unit, stock,
minimumStock fields
- [REQ-2] Prisma client must be used only in server-side
code (lib/services/, app/api/)
- [REQ-3] Add GET /api/supplies endpoint to list
all supplies with pagination
- [REQ-4] Add POST /api/supplies endpoint to
create new supplies with validation
- [REQ-5] Run migrations locally and ensure
database schema is up to date
- [REQ-6] Add unit test for Supply creation logic
in lib/services/supplies.ts
- [REQ-7] Add API route integration tests for GET
and POST /api/supplies
- [REQ-8] No Prisma imports in client-side components
(use type imports only or shared types)

## Implementation Plan

- [x]
Analyze the codebase and understand current structure
- [ ] Update Prisma
schema to match required Supply model fields
- [ ] Create singleton Prisma
client instance in lib/db.ts
- [ ] Add createSupply service function with
validation
- [ ] Create GET /api/supplies route with pagination support
- [ ]
Create POST /api/supplies route with Zod validation
- [ ] Add Zod validation
schema for supply creation (createSupplySchema)
- [ ] Write unit tests for
createSupply service function
- [ ] Write integration tests for API routes
- [
] Refactor client components to avoid importing Prisma client directly
- [ ]
Run pnpm test to verify all tests pass
- [ ] Run migrations with pnpm
db:migrate

## Files to Modify

- `prisma/schema.prisma` - Update Supply
model: rename quantity→stock, minStock→minimumStock, add category and unit
fields
- `prisma/seed.ts` - Update seed data to use new field names
-
`lib/db.ts` - Create singleton Prisma client instance (NEW FILE)
-
`lib/services/supplies.ts` - Add createSupply function; update searchSupplies to
use singleton prisma client
- `lib/validations/supplies.ts` - Add
createSupplySchema for POST request validation
- `app/api/supplies/route.ts` -
Create GET and POST handlers (NEW FILE)
- `app/api/supplies/search/route.ts` -
Update to use singleton prisma client from lib/db.ts
- `app/supplies/page.tsx`
- Change `import type { Supply } from "@prisma/client"` to use local type or
shared types
- `app/components/SuppliesList.tsx` - Change `import type { Supply
} from "@prisma/client"` to use local type or shared types
-
`tests/services/supplies.test.ts` - Add tests for createSupply function
-
`tests/api/supplies.test.ts` - Add tests for GET /api/supplies and POST
/api/supplies
- `lib/types.ts` - Create shared Supply type for client
components (NEW FILE, optional)

## Acceptance Criteria

- [ ] Database
schema is defined via Prisma with fields: id, name, category, unit, stock,
minimumStock
- [ ] Migrations run locally with `pnpm db:migrate` without
errors
- [ ] GET /api/supplies returns valid JSON with supplies array and
pagination metadata
- [ ] POST /api/supplies creates a new supply and returns
the created supply with 201 status
- [ ] POST /api/supplies returns 400 for
invalid input (missing required fields, invalid types)
- [ ] Unit test for
createSupply logic passes with mocked Prisma client
- [ ] API route tests for
GET and POST /api/supplies pass
- [ ] `pnpm test` passes in CI with all tests
green
- [ ] No `@prisma/client` runtime imports exist in client-side components
(only type imports allowed)
- [ ] Search functionality continues to work after
schema changes

## Notes

### Current State Analysis
- Prisma is already
initialized with SQLite provider
- Supply model exists but with different
fields: `quantity` and `minStock` instead of `stock` and `minimumStock`
-
Missing fields: `category`, `unit`
- Search API exists at
`/api/supplies/search` using server-side service
- Client components currently
import `type { Supply } from "@prisma/client"` which is acceptable for types but
runtime imports must be avoided

### Schema Migration Strategy
The schema
needs field renaming which is a breaking change:
- `quantity` → `stock`
-
`minStock` → `minimumStock`
- Add `category: String` (required)
- Add `unit:
String` (required)

Since this appears to be pre-production (dev database), we
can use `pnpm db:push` to reset or create a migration that handles the data
transformation.

### Server-Side Only Prisma
Create a singleton Prisma client
in `lib/db.ts`:
```typescript
import { PrismaClient } from
"@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma:
PrismaClient };
export const prisma = globalForPrisma.prisma ?? new
PrismaClient();
if (process.env.NODE_ENV !== "production")
globalForPrisma.prisma = prisma;
```

All server code should import from
`lib/db.ts` instead of creating new instances.

### Client Type Safety
Option
1: Create `lib/types.ts` with shared Supply interface matching Prisma
model
Option 2: Use `import type { Supply } from "@prisma/client"` (type-only
imports are stripped at build)

Both approaches are valid; type-only imports
are simpler but explicit shared types provide better decoupling.

### Testing
Strategy
- Service tests: Mock Prisma client using vi.mock("@prisma/client")
-
API tests: Mock the service layer using vi.mock("@/lib/services/supplies")
-
Keep existing search tests working after schema changes

### Dependencies
-
@prisma/client ^6.0.0 (already installed)
- zod ^3.24.0 (already installed) for
validation
- vitest ^2.1.0 (already installed) for testing