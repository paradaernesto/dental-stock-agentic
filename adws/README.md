# Agentic Development Workflow (ADW) System

Simplified ADW for the Dental Inventory project.

## Overview

ADW automates software development using structured workflows:

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  PLAN   │ →  │  BUILD  │ →  │  TEST   │ →  │  REVIEW │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
```

## Quick Start

### Environment Setup

```bash
export GITHUB_REPO_URL="https://github.com/yourusername/dental-inventory"
export ANTHROPIC_API_KEY="sk-ant-..."
```

### Run Workflows

```bash
# Plan + Build (most common)
python adws/adw_plan_build.py <issue-number>

# Full SDLC
python adws/adw_sdlc.py <issue-number>

# Individual phases
python adws/adw_plan.py <issue-number>
python adws/adw_build.py <issue-number> <adw-id>
python adws/adw_test.py <issue-number> <adw-id>
```

## Workflow Scripts

| Script | Purpose |
|--------|---------|
| `adw_plan.py` | Create implementation plan |
| `adw_build.py` | Implement from plan |
| `adw_test.py` | Run tests |
| `adw_review.py` | Review against spec |
| `adw_pr.py` | Create pull request |
| `adw_plan_build.py` | Plan + Build |
| `adw_sdlc.py` | Full SDLC |

## Slash Commands

Commands live in `.claude/commands/`:

- `/feature` - New feature
- `/bug` - Bug fix
- `/chore` - Maintenance
- `/implement` - Implement from spec
- `/test` - Run tests
- `/review` - Review work
- `/commit` - Generate commit
- `/pull_request` - Create PR

## State Management

ADW tracks state in `agents/{adw_id}/adw_state.json`:

```json
{
  "adw_id": "abc123",
  "issue_number": "1",
  "branch_name": "feat-1-supply-crud",
  "plan_file": "specs/001-supply-crud.md",
  "issue_class": "/feature"
}
```

## Directory Structure

```
adws/
├── README.md              # This file
├── adw_modules/           # Core modules
│   ├── __init__.py
│   ├── data_types.py     # Pydantic models
│   ├── state.py          # State management
│   ├── github.py         # GitHub API
│   ├── agent.py          # Claude Code integration
│   └── utils.py          # Utilities
├── adw_*.py              # Workflow scripts
└── adw_tests/            # Tests
    └── test_adw.py
```

## Branch Naming

```
<type>-<issue_number>-<slug>
```

Examples:
- `feat-1-supply-crud`
- `fix-2-stock-bug`
- `chore-3-update-deps`

## Issue Classification

Issues are classified as:
- `/feature` - New functionality
- `/bug` - Bug fixes
- `/chore` - Maintenance/config

Classify by adding label or including keyword in issue.

## Testing ADW

```bash
python adws/adw_tests/test_adw.py
```
