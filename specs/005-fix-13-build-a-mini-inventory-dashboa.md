# Spec 005: Build a mini inventory dashboard using Ant Design
components

**ADW ID:** qlbrn84s  
**Issue:** #13  
**Type:** /bug

**Status:** 🔄 In Progress

## Overview

Create a minimal inventory
dashboard UI using Ant Design (AntD) components to display dental inventory
data. The dashboard will consume data from the existing `/api/supplies`
endpoint, displaying supplies in a table with visual low-stock indicators and
summary statistics. This implementation demonstrates clean separation of
concerns by keeping all database logic server-side.

## Requirements

-
[REQ-1] Install and configure Ant Design (antd) dependency
- [REQ-2] Create
dashboard page at `/dashboard` route displaying supplies table
- [REQ-3]
Display table columns: Name, Category (code), Current Stock, Minimum Stock
-
[REQ-4] Visual low-stock indicator (Tag or Badge) when quantity <= minStock
-
[REQ-5] Quick stats section showing total supplies and low-stock item count
-
[REQ-6] Fetch data from `/api/supplies` endpoint (no direct DB access)
-
[REQ-7] Use AntD components: Table, Tag or Badge, Statistic or Card
- [REQ-8]
Responsive layout with AntD's Grid system
- [REQ-9] Minimal custom styling
(rely on AntD defaults)
- [REQ-10] Build must succeed without including Prisma
in client bundle

## Implementation Plan

- [ ] Install Ant Design
dependency (`pnpm add antd`)
- [ ] Update `app/layout.tsx` - Configure Ant
Design provider and import styles
- [ ] Create `app/dashboard/page.tsx` -
Dashboard page component with data fetching
- [ ] Create
`app/components/InventoryDashboard.tsx` - Main dashboard component using AntD
-
[ ] Create `app/components/DashboardStats.tsx` - Statistics cards component
- [
] Create `app/components/SuppliesTable.tsx` - AntD Table with low-stock
highlighting
- [ ] Add `tests/components/InventoryDashboard.test.tsx` - Basic
render test
- [ ] Run `pnpm build` and verify no Prisma in client bundle
- [ ]
Manual verification via browser at `http://localhost:3000/dashboard`

## Files
to Modify

- `package.json` - Add `antd` dependency
- `app/layout.tsx` - Add
Ant Design ConfigProvider and import antd CSS
- `app/page.tsx` - Add link to
new dashboard page
- `app/dashboard/page.tsx` - Create new dashboard page
(client component with useEffect fetch)
-
`app/components/InventoryDashboard.tsx` - New component assembling Table +
Stats
- `app/components/DashboardStats.tsx` - New component for Statistic
cards
- `app/components/SuppliesTable.tsx` - New AntD Table component with
low-stock Tag
- `tests/components/InventoryDashboard.test.tsx` - New test
file

## Acceptance Criteria

- [ ] Dashboard loads without errors at
`/dashboard` route
- [ ] Supplies are displayed in an AntD Table with correct
columns
- [ ] Low-stock supplies (quantity <= minStock) are visually
highlighted with Tag/Badge
- [ ] Quick stats show total supplies count and
low-stock items count
- [ ] UI updates after page refresh when data changes in
database
- [ ] `pnpm build` completes successfully
- [ ] No Prisma code in
client bundle (verified by build output)
- [ ] Manual verification: Table
renders correctly in browser
- [ ] Optional: Basic render test passes (`pnpm
test`)

## Notes

### Ant Design Installation
Add Ant Design to the
project:
```bash
pnpm add antd
```

### Component
Architecture
```
Dashboard Page (app/dashboard/page.tsx)
  └──
InventoryDashboard (app/components/InventoryDashboard.tsx)
       ├──
DashboardStats (statistics cards)
       └── SuppliesTable (AntD Table with
low-stock tags)
```

### Data Flow
1. Dashboard page fetches from
`/api/supplies` using `fetch()` in `useEffect`
2. Data is stored in React
state
3. Statistics calculated: `lowStockCount = supplies.filter(s =>
s.quantity <= s.minStock).length`
4. Table renders with conditional Tags for
low-stock items

### AntD Components to Use
- `Table` - For supplies list
display
- `Tag` (color="red") - For low-stock indicator
- `Statistic` or
`Card` - For quick stats display
- `Row`, `Col` - For responsive layout
-
`Spin` - For loading state
- `Alert` - For error state

### Low-Stock
Logic
A supply is considered low-stock when:
```typescript
const isLowStock =
(supply: SupplyDTO) => supply.quantity <= supply.minStock;
```

### Prisma
Bundle Safety
- Ensure no `@prisma/client` imports in any client component
-
Use `SupplyDTO` type from `lib/types/supplies.ts` instead of Prisma's
`Supply`
- The existing types already follow this pattern

### Responsive
Layout
Use AntD's 24-column grid system:
- Stats cards: `<Col xs={24}
sm={12}>` (full width on mobile, half on tablet+)
- Table: Full width with
horizontal scroll on small screens

### Category Handling
The current schema
has no `category` field. Use `code` as a proxy for category display in the
table, consistent with the existing `SuppliesList` component.

### Existing
API Endpoint
The `/api/supplies` endpoint is already implemented and
returns:
```typescript
{
  supplies: SupplyDTO[],
  total: number,
  page:
number,
  totalPages: number
}
```