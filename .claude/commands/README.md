# Claude Code Commands

This folder contains slash command templates for the Agentic Development Workflow (ADW).

## Available Commands

### Setup & Installation
- `/install` - Install and prime the application
- `/prime` - Understand the codebase structure
- `/start` - Start the application

### Issue Classification
- `/classify_issue` - Classify GitHub issue type
- `/chore` - Execute chore workflow
- `/bug` - Execute bug fix workflow  
- `/feature` - Execute feature workflow

### Development Workflow
- `/implement` - Implement from spec
- `/commit` - Generate git commit
- `/pull_request` - Create pull request
- `/test` - Run test suite
- `/test_e2e` - Run E2E tests
- `/review` - Review against spec
- `/document` - Generate documentation

### Utilities
- `/health_check` - Run system health check
- `/prepare_app` - Prepare app for review/testing
- `/generate_branch_name` - Generate branch name

## Usage

Commands can be run via:

```bash
# Direct execution
claude /feature specs/001-supply-crud.md

# Or via ADW scripts
./adws/adw_plan_build_iso.py <issue-number>
```

## Command Format

Each command follows this structure:

```markdown
# Command Name

## Variables
$1, $2, etc. - Arguments passed to command

## Instructions
What the agent should do

## Run
Commands to execute

## Report
Expected output format
```
