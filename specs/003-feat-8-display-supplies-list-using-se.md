# Spec 003: Display supplies list using server API (no direct DB
access)

**ADW ID:** sdkssj7v  
**Issue:** #8  
**Type:** /feature

**Status:** 🔄 In Progress

## Overview

Create a supplies list page that
fetches inventory data exclusively through the `/api/supplies` endpoint. The UI
must display supply name, category, stock, and minimum stock levels while
handling loading and empty states. This implementation ensures clean separation
of concerns by keeping all database logic server-side and preventing any
Prisma-related code from reaching the browser bundle.

## Requirements

-
[REQ-1] Create a new `/api/supplies` API endpoint that returns all supplies with
pagination
- [REQ-2] Display supplies list with columns: name, category, stock,
minimumStock
- [REQ-3] Implement loading state while fetching data
- [REQ-4]
Implement empty state when no supplies exist
- [REQ-5] Use type definitions
that don't depend on `@prisma/client` in client components
- [REQ-6] No Prisma
imports or database logic in any UI component or client-side code
- [REQ-7] Add
at least one UI-level test for the supplies list component
- [REQ-8] Build must
succeed without including Prisma in the browser bundle

## Implementation
Plan

- [ ] Create `app/api/supplies/route.ts` - New API endpoint to list all
supplies
- [ ] Create `lib/types/supplies.ts` - Type definitions independent of
Prisma
- [ ] Update `app/components/SuppliesList.tsx` - Use new types, add
category column, ensure no Prisma import
- [ ] Update or create
`app/supplies/list/page.tsx` - Client-side rendered page fetching from
`/api/supplies`
- [ ] Add `tests/components/SuppliesList.test.tsx` - UI-level
test for the component
- [ ] Update `next.config.ts` - Verify bundle analyzer
if needed to validate no Prisma in client
- [ ] Run build and verify no Prisma
code in browser bundle

## Files to Modify

- `app/api/supplies/route.ts` -
Create new GET endpoint to list all supplies with optional pagination
-
`lib/types/supplies.ts` - Create new file with Supply type definition mirroring
Prisma model but without import
- `lib/services/supplies.ts` - Add
`getAllSupplies()` function to fetch supplies with pagination
-
`app/components/SuppliesList.tsx` - Replace `Supply` from `@prisma/client` with
local type; update table columns to show name, category, stock, minStock; remove
code and description columns
- `app/supplies/list/page.tsx` - Create new page
component that fetches from `/api/supplies` on mount, manages loading/error
states
- `tests/components/SuppliesList.test.tsx` - Create UI tests for
loading, empty, and populated states
- `tests/api/supplies.test.ts` - Add tests
for the new `/api/supplies` endpoint

## Acceptance Criteria

- [ ]
Navigating to `/supplies/list` displays a table with columns: Name, Category,
Stock, Minimum Stock
- [ ] Loading spinner/message appears while data is being
fetched
- [ ] Empty state message displays when no supplies exist in the
database
- [ ] Data is fetched from `/api/supplies` endpoint, not directly from
Prisma
- [ ] Browser bundle contains no `@prisma/client` code (verified via
build output or bundle analyzer)
- [ ] `pnpm test` passes including the new
UI-level test
- [ ] `pnpm build` completes successfully
- [ ] Manual
verification: Starting dev server with `pnpm dev` shows supplies list
correctly

## Notes

### Critical: Prisma Bundle Separation
The existing
`app/components/SuppliesList.tsx` imports `Supply` type from `@prisma/client`.
This must be replaced with a local type definition. Create a type in
`lib/types/supplies.ts`:

```typescript
export interface SupplyDTO {
  id:
string;
  name: string;
  code: string;
  description?: string | null;

quantity: number;
  minStock: number;
  createdAt: string;
  updatedAt:
string;
}
```

The `createdAt` and `updatedAt` should be strings in the API
response (serialized JSON), not Date objects.

### API Response Format
The
`/api/supplies` endpoint should return:

```json
{
  "supplies": [...],

"total": 50,
  "page": 1,
  "totalPages": 5
}
```

### Database Schema
Reference
Current Prisma Supply model:
- `id`: String (UUID)
- `name`:
String
- `code`: String (unique)
- `description`: String? (optional)
-
`quantity`: Int (stock level)
- `minStock`: Int (minimum stock threshold)
-
`createdAt`: DateTime
- `updatedAt`: DateTime

**Note:** The issue mentions
"category" but the current schema has no category field. Either:
1. Add
category field to schema (requires migration)
2. Display code as category proxy
for now
3. Skip category column until schema is updated

Recommended
approach: For this feature, use `code` as a category indicator or omit category
column until the schema supports it.

### Testing Approach
Use
`@testing-library/react` with `vi.fn()` to mock the `fetch` API. Test three
states:
1. Loading state - verify loading message appears
2. Empty state -
verify empty message with empty array
3. Populated state - verify table renders
with supply data

### Existing Code Considerations
- There's already a
`/api/supplies/search` endpoint and `/supplies` search page
- The new
`/api/supplies` endpoint should be simpler (no search, just list)
- Consider
reusing the existing `SuppliesList` component with modified props
- The
existing search page at `/supplies` uses `/api/supplies/search` - leave this
unchanged