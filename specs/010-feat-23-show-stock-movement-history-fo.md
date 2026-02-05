# Spec 010: Show stock movement history for each supply

**ADW ID:**
o3x8tkg7  
**Issue:** #23  
**Type:** /feature  
**Status:** 🔄 In
Progress

## Overview

Add a "View history" action to each supply that opens
a modal displaying the complete stock movement history. The history shows all
IN/OUT operations with date, type, quantity, and reason, ordered by most recent
first. This provides users with full auditability and traceability of stock
level changes.

## Requirements

- [REQ-1] Add a "View history"
button/action per supply in the SuppliesTable component
- [REQ-2] Create a
modal component to display stock movement history with columns: Date, Type
(IN/OUT), Quantity, Reason
- [REQ-3] Create a new API endpoint `GET
/api/stock-movements?supplyId={id}` to fetch movements for a specific supply
-
[REQ-4] Order movements by `createdAt` descending (most recent first)
- [REQ-5]
Handle empty history gracefully with an appropriate message
- [REQ-6] Display
type as a colored tag (green for IN, red for OUT)
- [REQ-7] Format dates in a
human-readable format (e.g., "Jan 15, 2024, 10:30 AM")

## Implementation
Plan

- [ ] **Analyze the codebase** - Review existing stock movement service
and components
- [ ] **Add StockMovementHistory type** - Create DTO type in
`lib/types/supplies.ts`
- [ ] **Create API endpoint** - Add `GET` handler to
`app/api/stock-movements/route.ts`
- [ ] **Create history modal component** -
Build `StockMovementHistoryModal.tsx` with AntD Table
- [ ] **Update
SuppliesTable** - Add "View history" button alongside existing "Register
movement"
- [ ] **Integrate into InventoryDashboard** - Add state management
and handlers for the history modal
- [ ] **Add API tests** - Test the GET
endpoint for stock movements
- [ ] **Manual verification** - Verify UI works
correctly with data and empty states

## Files to Modify

### Backend
-
`app/api/stock-movements/route.ts` - Add `GET` handler to fetch movements by
supplyId
  - Query parameter validation for `supplyId`
  - Call
`getStockMovementsBySupplyId()` service function
  - Return 200 with movements
array or appropriate error codes
  - Handle database errors consistently with
existing patterns

### Types
- `lib/types/supplies.ts` - Add
`StockMovementDTO` and `GetStockMovementsResult` types
  ```typescript

export interface StockMovementDTO {
    id: string;
    supplyId: string;

type: "IN" | "OUT";
    quantity: number;
    reason?: string | null;

createdAt: string;
  }
  ```

### Frontend Components
-
`app/components/SuppliesTable.tsx` - Add "View history" action button
  - Add
new column or update Actions column to include history button
  - Add
`onViewHistory?: (supply: SupplyDTO) => void` prop
  - Use `HistoryOutlined`
icon from Ant Design
  
- `app/components/StockMovementHistoryModal.tsx` -
Create new modal component
  - Props: `supply: SupplyDTO | null`, `open:
boolean`, `onClose: () => void`
  - Fetch data from `GET
/api/stock-movements?supplyId={id}` when opened
  - Display data in AntD Table
with columns: Date, Type (Tag), Quantity, Reason
  - Show loading state during
fetch
  - Show empty state when no movements exist
  - Use AntD Tag with
`green` color for IN, `red` for OUT

- `app/components/InventoryDashboard.tsx`
- Integrate history modal
  - Add state for history modal (`historyModalOpen`,
`selectedSupplyForHistory`)
  - Add `handleViewHistory` callback
  - Pass
`onViewHistory` prop to SuppliesTable
  - Render
StockMovementHistoryModal

### Tests
- `tests/api/stock-movements.test.ts` -
Add tests for GET endpoint
  - Test successful fetch with movements
  - Test
empty movements array
  - Test missing supplyId parameter (400)
  - Test
non-existent supply (empty array, 200)
  - Test database error handling
(500)

## Acceptance Criteria

- [ ] **AC-1:** Each supply row in the table
displays a "View history" button alongside "Register movement"
- [ ] **AC-2:**
Clicking "View history" opens a modal showing all stock movements for that
supply
- [ ] **AC-3:** Movements are displayed in descending chronological
order (newest first)
- [ ] **AC-4:** Each movement shows: formatted date/time,
type badge (IN=green, OUT=red), quantity, and reason (or "-" if empty)
- [ ]
**AC-5:** Supplies with no movement history display an empty state message: "No
movement history for this supply"
- [ ] **AC-6:** The modal closes when
clicking the X, close button, or clicking outside
- [ ] **AC-7:** Loading state
is shown while fetching history data
- [ ] **AC-8:** API returns 400 if
supplyId query parameter is missing
- [ ] **AC-9:** API returns 200 with empty
array for valid supplyId with no movements
- [ ] **AC-10:** All existing tests
continue to pass (`pnpm test`)
- [ ] **AC-11:** Build passes without errors
(`pnpm build`)

## Notes

### Technical Considerations
- **Reuse existing
service**: The `getStockMovementsBySupplyId()` function already exists in
`lib/services/stock-movements.ts` and supports pagination options
-
**Consistent error handling**: Follow existing patterns in the codebase for
database error handling and API responses
- **Type safety**: Use the existing
`StockMovement` type from Prisma and create a DTO for client-side usage
- **UI
consistency**: Use Ant Design components (Modal, Table, Tag, Empty) to match
existing design system

### Dependencies
- Relies on existing `StockMovement`
model in Prisma schema
- Uses existing Ant Design setup (already configured in
the project)
- No new dependencies required

### Performance
Considerations
- Consider adding pagination to the history modal if a supply
has many movements (100+)
- The existing service supports `limit` and `offset`
parameters for future enhancement

### Future Enhancements (out of scope)
-
Export movement history to CSV/PDF
- Filter movements by date range
- Show
running balance column in history