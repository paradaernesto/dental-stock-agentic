# Spec 008: Add stock in/out operations from the inventory
dashboard

**ADW ID:** 7ow0ro8c  
**Issue:** #19  
**Type:** /bug

**Status:** 🔄 In Progress

## Overview

Add UI functionality to the
inventory dashboard allowing clinic staff to register stock movements (IN/OUT)
directly from the supplies table. This includes a modal form for entering
movement details, API integration, and real-time dashboard updates after
successful operations.

## Requirements

- [REQ-1] Add "Register movement"
action button to each supply row in the supplies table
- [REQ-2] Create a modal
form with Ant Design Modal containing:
  - Movement type selector (IN | OUT)

- Quantity input (positive integer)
  - Optional reason/note text field
-
[REQ-3] Submit stock movement to `/api/stock-movements` endpoint (no direct DB
access)
- [REQ-4] Server-side validation must prevent negative stock (reject
OUT if quantity > current stock)
- [REQ-5] Update dashboard data immediately
after successful operation (refresh supplies list)
- [REQ-6] Add `reason` field
to StockMovement model and support it in API/service layer
- [REQ-7] Display
clear error messages for validation failures (insufficient stock, invalid
input)

## Implementation Plan

- [ ] Update Prisma schema to add optional
`reason` field to `StockMovement` model
- [ ] Create and run database
migration
- [ ] Update `lib/validations/stock-movements.ts` to include optional
`reason` field in schema
- [ ] Update `lib/services/stock-movements.ts` to
handle `reason` field in `createStockMovement`
- [ ] Update
`app/api/stock-movements/route.ts` to accept and pass `reason` field
- [ ]
Create `app/components/StockMovementModal.tsx` component with form:
  -
Movement type radio/select (IN/OUT)
  - Quantity number input with validation

- Reason text area (optional)
  - Submit/Cancel buttons
  - Loading states
-
[ ] Update `app/components/SuppliesTable.tsx` to add actions column with
"Register movement" button
- [ ] Update `app/components/InventoryDashboard.tsx`
to:
  - Handle modal open/close state
  - Pass refresh callback to modal for
post-submit updates
  - Update supplies list after successful movement
- [ ]
Add unit tests for updated stock movement service with reason field
- [ ] Add
component tests for `StockMovementModal`
- [ ] Add integration tests for API
with reason field
- [ ] Run `pnpm build` and `pnpm test` to verify all tests
pass

## Files to Modify

- `prisma/schema.prisma` - Add optional `reason`
field to `StockMovement` model
- `lib/validations/stock-movements.ts` - Add
optional `reason` string field to schema
- `lib/services/stock-movements.ts` -
Include `reason` in `CreateStockMovementInput` and pass to Prisma create
-
`app/api/stock-movements/route.ts` - Extract `reason` from request and pass to
service
- `app/components/StockMovementModal.tsx` - **New file** - Modal form
component for registering movements
- `app/components/SuppliesTable.tsx` - Add
actions column with button to open modal per supply
-
`app/components/InventoryDashboard.tsx` - Add modal state management and refresh
logic
- `tests/services/stock-movements.test.ts` - Add tests for reason field
handling
- `tests/api/stock-movements.test.ts` - Add tests for API with reason
field
- `tests/components/StockMovementModal.test.tsx` - **New file** -
Component tests for modal

## Acceptance Criteria

- [ ] Supplies table
displays "Register movement" button for each supply row
- [ ] Clicking button
opens modal with supply name displayed, type selector, quantity input, and
optional reason field
- [ ] IN movement increases supply stock quantity in the
database and updates UI immediately
- [ ] OUT movement decreases supply stock
quantity in the database and updates UI immediately
- [ ] Attempting OUT
movement with quantity > current stock shows clear error message and rejects
operation
- [ ] Reason field is optional and persisted to database when
provided
- [ ] Modal closes and dashboard refreshes automatically after
successful movement
- [ ] Loading state shown during API call, form disabled
while submitting
- [ ] Validation errors displayed inline for invalid quantity
(non-integer, negative, zero)
- [ ] All existing and new tests pass with `pnpm
test`
- [ ] Build succeeds with `pnpm build` with no errors or warnings

##
Notes

- **Database Migration:** Adding `reason` field requires `prisma
migrate dev` or `prisma db push` depending on environment
- **UI Pattern:** Use
Ant Design Modal (not Drawer) for consistency with form-based workflows; use
`Form` component with validation rules
- **State Management:** Keep modal state
in `InventoryDashboard` to allow parent to refresh supplies list after
mutation
- **Optimistic Updates:** Consider optimistic UI update for immediate
feedback, or use `mutate` pattern to refetch supplies
- **Error Handling:**
Display API errors (insufficient stock, not found) using Ant Design
`message.error()` or inline form errors
- **Type Safety:** Define TypeScript
interface for form values separate from API types
- **Future Considerations:**
The reason field enables future audit trails and reporting on why stock
movements occurred