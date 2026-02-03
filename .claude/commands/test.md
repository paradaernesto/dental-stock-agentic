# Application Validation Test Suite

Execute comprehensive validation tests.

## Purpose

Proactively identify and fix issues before they impact users.

## Test Execution Sequence

### 1. TypeScript Check
- Command: `pnpm tsc --noEmit`
- Purpose: Validate TypeScript types

### 2. Lint Check
- Command: `pnpm lint`
- Purpose: Check code quality

### 3. Unit Tests
- Command: `pnpm test`
- Purpose: Run all unit tests

### 4. Build Test
- Command: `pnpm build`
- Purpose: Verify production build

## Report

Return results as JSON:

```json
[
  {
    "test_name": "typescript_check",
    "passed": true,
    "execution_command": "pnpm tsc --noEmit",
    "test_purpose": "Validate TypeScript types"
  }
]
```
