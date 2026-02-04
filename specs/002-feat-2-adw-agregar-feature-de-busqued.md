# Spec 002: [ADW] Agregar feature de búsqueda de supplies

**ADW
ID:** zexu7mg4  
**Issue:** #2  
**Type:** /feature  
**Status:** 🔄 In
Progress

## Overview

Implement a search feature that allows users to find
dental supplies by name or code. This includes creating the database schema for
supplies, a server-side search API, and a UI component with real-time search
capabilities.

## Requirements

- [REQ-1] Users can search supplies by
partial name match (case-insensitive)
- [REQ-2] Users can search supplies by
exact or partial code match
- [REQ-3] Search should support combined filtering
(name OR code in single query)
- [REQ-4] Results should be returned within
200ms for datasets up to 10k records
- [REQ-5] Search API must validate input
using Zod schemas
- [REQ-6] UI must handle loading, empty, and error states
gracefully

## Implementation Plan

- [ ] Update Prisma schema with Supply
model (name, code, description, quantity, minStock)
- [ ] Create database
migration and generate Prisma client
- [ ] Implement search API endpoint at
`/api/supplies/search`
- [ ] Create search service function with Prisma
queries
- [ ] Build SearchBar React component with debounced input
- [ ]
Create SuppliesList component to display search results
- [ ] Add search page
at `/supplies` integrating components
- [ ] Write unit tests for search service
logic
- [ ] Write integration tests for API endpoint
- [ ] Write component
tests for UI
- [ ] Seed database with sample supplies for manual testing

##
Files to Modify

- `prisma/schema.prisma` - Add Supply model with
search-relevant fields and indexes
- `lib/services/supplies.ts` - Create search
service with `searchSupplies(query: string)` function
-
`lib/validations/supplies.ts` - Add Zod schema for search input validation
-
`app/api/supplies/search/route.ts` - Create API route handler for search
-
`app/components/SearchBar.tsx` - Create debounced search input component
-
`app/components/SuppliesList.tsx` - Create results display component
-
`app/supplies/page.tsx` - Create main search page
-
`tests/services/supplies.test.ts` - Add tests for search service
-
`tests/api/supplies.test.ts` - Add tests for search API
- `prisma/seed.ts` -
Add sample supplies data

## Acceptance Criteria

- [ ] Searching "gloves"
returns supplies with "gloves" in the name (case-insensitive)
- [ ] Searching
"SUP-001" returns the supply with exact code match
- [ ] Searching partial code
"SUP" returns all supplies with codes starting with "SUP"
- [ ] Empty search
query returns all supplies (paginated, max 50 per page)
- [ ] API returns 400
for invalid search queries (e.g., special SQL characters)
- [ ] Search results
display within 1 second on typical network conditions
- [ ] No results state
shows friendly "No supplies found" message
- [ ] All tests pass with `pnpm
test`

## Notes

- **Database Indexing:** Add `@index` on `name` and `code`
fields in Prisma schema for query performance
- **Search Strategy:** Use
Prisma's `contains` mode with `insensitive` for name search, `startsWith` for
code search
- **Debouncing:** Implement 300ms debounce on search input to
reduce API calls
- **Pagination:** Default to 20 results per page, max 100
-
**Security:** Sanitize search input to prevent injection; use parameterized
queries via Prisma
- **Future Considerations:** This search is foundational for
stock movement tracking (Spec 003) and low stock alerts (Spec 004)