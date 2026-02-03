# Generate Git Commit

## Variables

agent_name: $1
issue_class: $2
issue: $3

## Instructions

- Generate commit message: `<agent_name>: <issue_class>: <message>`
- Message should be:
  - Present tense ("add", "fix", "update")
  - 50 characters or less
  - No period at end
  - Descriptive of changes

## Run

1. `git diff HEAD` - see changes
2. `git add -A` - stage all
3. `git commit -m "<message>"` - commit

## Report

Return ONLY the commit message used.
