# Generate Branch Name

## Variables

issue_number: $1
issue_title: $2
issue_class: $3

## Instructions

Generate a branch name in format:
`<type>-<issue_number>-<short_slug>`

Types:
- feature → `feat`
- bug → `fix`
- chore → `chore`

## Examples

- `feat-123-add-supply-crud`
- `fix-456-low-stock-bug`
- `chore-789-update-deps`

## Report

Return ONLY the branch name.
