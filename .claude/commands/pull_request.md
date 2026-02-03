# Create Pull Request

## Variables

branch_name: $1
issue: $2
plan_file: $3
adw_id: $4

## Instructions

- PR title format: `<issue_type>: #<issue_number> - <issue_title>`
- PR body should include:
  - Summary
  - Link to plan_file
  - Closes #<issue_number>
  - ADW tracking ID
  - Checklist of changes

## Run

1. `git diff origin/main...HEAD --stat` - see changed files
2. `git log origin/main..HEAD --oneline` - see commits
3. `git push -u origin <branch_name>` - push branch
4. `gh pr create --title "..." --body "..." --base main` - create PR

## Report

Return ONLY the PR URL.
