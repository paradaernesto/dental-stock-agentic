# Spec 003: Implement stock in/out movements with server-side
validation

**ADW ID:** q3fg3ssz  
**Issue:** #9  
**Type:** /feature

**Status:** 🔄 In Progress

## Overview

Implement a stock movement
tracking system that allows updating supply inventory through tracked IN/OUT
movements rather than manual edits. The system must enforce server-side
validation to prevent negative stock levels and ensure all stock updates are
atomic operations.

## Requirements

- [REQ-1] Create `StockMovement` Prisma
model with fields: id, supplyId, type (IN|OUT), quantity, createdAt
- [REQ-2]
Stock updates must be atomic using Prisma transactions ($transaction)
- [REQ-3]
Server-side validation must prevent negative stock (reject OUT movement if
supply.quantity < movement.quantity)
- [REQ-4] Create POST
`/api/stock-movements` API endpoint for creating movements
- [REQ-5] IN
movements must increase supply stock quantity
- [REQ-6] OUT movements must
decrease supply stock quantity
- [REQ-7] Input validation using Zod schemas for
movement data
- [REQ-8] Return appropriate error responses for validation
failures (400) and not found (404)

## Implementation Plan

- [ ] Update
Prisma schema with `StockMovement` model and relation to `Supply`
- [ ] Create
database migration and regenerate Prisma client
- [ ] Create Zod validation
schema for stock movement input in `lib/validations/stock-movements.ts`
- [ ]
Implement `createStockMovement` service function with atomic transaction in
`lib/services/stock-movements.ts`
- [ ] Implement stock calculation logic with
negative stock prevention
- [ ] Create POST API route handler at
`app/api/stock-movements/route.ts`
- [ ] Write unit tests for stock calculation
rules in `tests/services/stock-movements.test.ts`
- [ ] Write edge case tests
for negative stock prevention
- [ ] Write API integration tests in
`tests/api/stock-movements.test.ts`
- [ ] Run full test suite and ensure `pnpm
test` passes

## Files to Modify

- `prisma/schema.prisma` - Add
`StockMovement` model with relation to `Supply`, add `stockMovements` relation
to `Supply` model
- `lib/validations/stock-movements.ts` - Create Zod schema
for movement input validation (supplyId, type enum, quantity positive int)
-
`lib/services/stock-movements.ts` - Create service with `createStockMovement()`
function using Prisma $transaction for atomic update
-
`app/api/stock-movements/route.ts` - Create POST route handler, validate input,
call service, return 201 on success or appropriate error codes
-
`tests/services/stock-movements.test.ts` - Add unit tests for stock calculation
rules and validation logic
- `tests/api/stock-movements.test.ts` - Add
integration tests for API endpoint including error cases

## Acceptance
Criteria

- [ ] POST `/api/stock-movements` with type=IN and quantity=10
increases supply stock by 10
- [ ] POST `/api/stock-movements` with type=OUT
and quantity=5 decreases supply stock by 5
- [ ] POST `/api/stock-movements`
with type=OUT where quantity > current stock returns 400 error with
"Insufficient stock" message
- [ ] Attempting to create movement for
non-existent supply returns 404 error
- [ ] Movement record is persisted to
`StockMovement` table with correct supplyId, type, quantity, and timestamp
- [
] Stock update and movement creation happen atomically (both succeed or both
fail)
- [ ] Invalid input (missing fields, negative quantity, invalid type)
returns 400 with validation error details
- [ ] All tests pass with `pnpm test`
including edge cases for zero quantity and boundary conditions

## Notes

-
**Atomic Updates:** Use Prisma's `$transaction` to ensure stock quantity update
and movement record creation are atomic - prevents data inconsistency if one
operation fails
- **Validation Strategy:** All business rules (negative stock
prevention) must be enforced server-side in the service layer, not just at API
level
- **Stock Calculation:** For OUT movements, calculate new stock as
`currentQuantity - movementQuantity` and validate `newQuantity >= 0` before
transaction
- **Relation Design:** Add `stockMovements` relation to `Supply`
model for potential history queries; use `@relation` with `onDelete: Cascade` if
supply deletion should clean up movements
- **Error Handling:** Return
structured error responses with `error` and optional `details` fields for
validation failures
- **Type Safety:** Use Prisma's generated types for
`StockMovement` and define custom TypeScript types for service inputs/outputs
-
**Future Considerations:** This design enables future features like movement
history, stock audit trails, and reporting on inventory changes over time