# Review Implementation

Review work done against a specification file.

## Variables

adw_id: $1
spec_file: $2

## Instructions

1. Read the spec file
2. Check git diff to see changes
3. Compare implementation against spec
4. Identify any discrepancies
5. Report success or issues

## Setup

Run `.claude/commands/prepare_app.md` to start the application for review.

## Report

```json
{
  "success": true,
  "review_summary": "2-4 sentences describing what was built vs spec",
  "review_issues": [
    {
      "issue_number": 1,
      "issue_description": "description",
      "issue_resolution": "how to fix",
      "issue_severity": "skippable|tech_debt|blocker"
    }
  ]
}
```
