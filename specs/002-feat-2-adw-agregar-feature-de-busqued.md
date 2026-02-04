# Spec 002: [ADW] Agregar feature de búsqueda de supplies

**ADW ID:** 75hh7y1a
**Issue:** #2
**Type:** /feature
**Status:** 🔄 In Progress

## Overview

Implement a supply search feature that enables users to search and filter dental supplies by name and code. This feature will serve as the foundation for inventory management, allowing quick lookup and retrieval of supply information through both API endpoints and a user-friendly web interface.

## Requirements

- [REQ-1] Create a Supply data model in Prisma schema with fields for name, code, description, quantity, unit price, and supplier information
- [REQ-2] Implement a REST API endpoint (`/api/supplies/search`) that accepts query parameters for name and code searches with case-insensitive partial matching
- [REQ-3] Build a responsive React search component with real-time filtering, displaying results in a structured table or card layout
- [REQ-4] Support search by either name (partial match) or code (exact/partial match) with proper input validation and error handling
- [REQ-5] Return search results with pagination support (limit 50 results by default) and relevant supply details including stock levels
- [REQ-6] Implement comprehensive test coverage for search API, database queries, and frontend components
- [REQ-7] Add database seed data with at least 20 sample dental supplies for testing and demonstration

## Implementation Plan

- [ ] Define Supply Prisma model with fields: id, code, name, description, quantity, unit, unitPrice, supplier, category, createdAt, updatedAt
- [ ] Generate Prisma migration and create database tables
- [ ] Create seed script (`prisma/seed.ts`) with sample dental supplies data (syringes, gloves, amalgam, etc.)
- [ ] Implement API route handler at `app/api/supplies/search/route.ts` with GET method supporting `name` and `code` query parameters
- [ ] Add search logic using Prisma `contains` filter with case-insensitive matching (`mode: 'insensitive'`)
- [ ] Create `SupplySearch.tsx` component with search input, debouncing (300ms), and loading states
- [ ] Create `SearchResults.tsx` component to display supplies in a responsive table with columns: code, name, quantity, unit, price
- [ ] Build supplies page at `app/supplies/page.tsx` integrating the search components
- [ ] Write API integration tests for search endpoint in `tests/api/supplies.test.ts`
- [ ] Write component tests for SupplySearch and SearchResults in `tests/components/`
- [ ] Add TypeScript types/interfaces for Supply model in `lib/types.ts`
- [ ] Update `lib/utils.ts` with search-related helper functions (normalize strings, format supply codes)
- [ ] Test end-to-end search functionality with seed data
- [ ] Update project README with supply search feature documentation

## Files to Modify

- `prisma/schema.prisma` - Add Supply model with searchable fields (code, name) and inventory tracking fields
- `prisma/seed.ts` - Create seed script with 20+ sample dental supply records
- `app/api/supplies/search/route.ts` - New file: implement search endpoint with query parameter handling
- `app/components/SupplySearch.tsx` - New file: search input component with debouncing and state management
- `app/components/SearchResults.tsx` - New file: results display component with responsive table/cards
- `app/supplies/page.tsx` - New file: supplies page integrating search functionality
- `lib/types.ts` - New file: TypeScript interfaces for Supply and SearchParams
- `lib/utils.ts` - Add utility functions: `normalizeSearchTerm()`, `formatSupplyCode()`
- `tests/api/supplies.test.ts` - New file: API endpoint tests for search functionality
- `tests/components/SupplySearch.test.tsx` - New file: component tests for search UI
- `tests/components/SearchResults.test.tsx` - New file: component tests for results display
- `package.json` - Update seed script command if needed

## Acceptance Criteria

- [ ] Users can search supplies by entering a partial name (e.g., "glove" finds "Nitrile Gloves", "Latex Gloves")
- [ ] Users can search supplies by entering a code (e.g., "SUP-001" finds exact match, "SUP" finds all matching codes)
- [ ] Search is case-insensitive and supports partial matching for both name and code
- [ ] Search returns results within 500ms with proper loading indicators during fetch
- [ ] Empty search query returns all supplies (up to pagination limit)
- [ ] No results state displays appropriate message when search yields no matches
- [ ] API returns proper error responses (400 for invalid input, 500 for server errors) with descriptive messages
- [ ] Search input debounces to avoid excessive API calls (waits 300ms after user stops typing)
- [ ] All tests pass (`pnpm test`) with >80% code coverage for new files
- [ ] Database seed script successfully populates at least 20 diverse dental supply records
- [ ] Search results display all relevant supply information: code, name, quantity, unit, price
- [ ] UI is responsive and works on mobile, tablet, and desktop viewports

## Notes
