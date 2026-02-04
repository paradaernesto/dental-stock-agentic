# Spec 002: [ADW] Agregar feature de búsqueda de supplies

**ADW
ID:** e97e2a9l  
**Issue:** #2  
**Type:** /feature  
**Status:** 🔄 In
Progress

## Overview

Implement a search functionality that allows users to
find dental supplies by name and code. This feature requires creating the Supply
database model, a search API endpoint, and a UI component with real-time search
capabilities.

## Requirements

- [REQ-1] Users can search supplies by
partial name match (case-insensitive)
- [REQ-2] Users can search supplies by
partial code match (case-insensitive)
- [REQ-3] Search should support combined
filters (name OR code in single query)
- [REQ-4] API endpoint must return
paginated results (default 20 items)
- [REQ-5] UI must show search input with
loading state and results list
- [REQ-6] Empty search should return all
supplies

## Implementation Plan

- [ ] Create Supply model in Prisma schema
with name, code, stock, minStock fields
- [ ] Run database migration and
generate Prisma client
- [ ] Create `lib/db.ts` for Prisma client singleton
-
[ ] Create API route `app/api/supplies/search/route.ts` with GET handler
- [ ]
Implement search logic with Prisma OR using `contains` filter
- [ ] Create
React component `app/components/SupplySearch.tsx`
- [ ] Add debounced search
input with loading state
- [ ] Display search results in a table format
- [ ]
Add tests for API endpoint and search component
- [ ] Update main page to
include the search component

## Files to Modify

- `prisma/schema.prisma` -
Add Supply model with id, name, code, stock, minStock, createdAt, updatedAt
fields
- `lib/db.ts` - Create Prisma client singleton (new file)
-
`app/api/supplies/search/route.ts` - Create search API endpoint (new file)
-
`app/components/SupplySearch.tsx` - Create search UI component (new file)
-
`app/page.tsx` - Integrate search component into main page
-
`tests/supplies.test.ts` - Add tests for search functionality (new file)
-
`prisma/seed.ts` - Add sample supplies for testing (new file)

## Acceptance
Criteria

- [ ] `GET /api/supplies/search?q=xyz` returns supplies matching
name or code
- [ ] Search is case-insensitive (e.g., "GLOVES" matches
"gloves")
- [ ] Partial matches work (e.g., "glove" matches "Nitrile
Gloves")
- [ ] Results include id, name, code, stock, and minStock fields
- [
] API returns max 20 results by default with pagination support
- [ ] UI shows
search input with placeholder text
- [ ] Search triggers on input change with
300ms debounce
- [ ] Loading state is shown while fetching results
- [ ] Empty
results show "No supplies found" message
- [ ] All tests pass (`pnpm
test`)

## Notes

- Supply model should include: `id` (UUID), `name`
(String), `code` (String unique), `stock` (Int), `minStock` (Int), `createdAt`,
`updatedAt`
- Use Prisma's `OR` operator to search both name and code
fields
- Consider adding database index on name and code for better search
performance
- Use `useEffect` with cleanup for debounce implementation
-
Follow existing project patterns from Spec 001 for consistency