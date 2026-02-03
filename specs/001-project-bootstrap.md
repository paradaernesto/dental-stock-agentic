# Spec 001: Project Bootstrap

**ADW ID:** bootstrap  
**Issue:** #1  
**Type:** `/chore`  
**Status:** ✅ Complete

## Overview

Initial project scaffold for the dental inventory system with full ADW (Agentic Development Workflow) support.

## Deliverables

### 1. Project Structure

```
dental-inventory/
├── .claude/commands/       # Slash command templates
│   ├── README.md
│   ├── install.md
│   ├── prime.md
│   ├── start.md
│   ├── classify_issue.md
│   ├── feature.md
│   ├── chore.md
│   ├── bug.md
│   ├── implement.md
│   ├── test.md
│   ├── review.md
│   ├── commit.md
│   ├── pull_request.md
│   ├── prepare_app.md
│   ├── health_check.md
│   ├── generate_branch_name.md
│   └── conditional_docs.md
├── .github/workflows/      # CI/CD
│   └── ci.yml
├── adws/                   # ADW system
│   ├── README.md
│   ├── adw_modules/        # Core modules
│   │   ├── __init__.py
│   │   ├── data_types.py
│   │   ├── state.py
│   │   ├── github.py
│   │   ├── agent.py
│   │   └── utils.py
│   ├── adw_tests/          # ADW tests
│   │   └── test_adw.py
│   ├── adw_plan.py         # Planning phase
│   ├── adw_build.py        # Build phase
│   ├── adw_test.py         # Test phase
│   ├── adw_review.py       # Review phase
│   ├── adw_pr.py           # Create PR
│   ├── adw_plan_build.py   # Combined workflow
│   └── adw_sdlc.py         # Full SDLC
├── agents/                 # State storage (gitignored)
├── app/                    # Next.js app
├── lib/                    # Utilities
├── prisma/                 # Database schema
├── specs/                  # Specifications
├── tests/                  # Tests
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

### 2. ADW System

| Component | Purpose |
|-----------|---------|
| `adw_modules/` | Python modules for ADW |
| `adw_plan.py` | Create implementation plans |
| `adw_build.py` | Implement from plans |
| `adw_test.py` | Run test suites |
| `adw_review.py` | Review against specs |
| `adw_pr.py` | Create pull requests |
| `adw_plan_build.py` | Combined plan+build |
| `adw_sdlc.py` | Full SDLC workflow |

### 3. Slash Commands

| Command | Use For |
|---------|---------|
| `/feature` | New features |
| `/bug` | Bug fixes |
| `/chore` | Maintenance |
| `/implement` | Bounded tasks |
| `/test` | Run tests |
| `/review` | Review work |
| `/commit` | Generate commits |
| `/pull_request` | Create PRs |

### 4. CI/CD

GitHub Actions workflow:
- Install dependencies
- Generate Prisma client
- Run linter
- Build project
- Run tests

### 5. Git Ignore

Excludes:
- `node_modules/`
- `.next/`
- `/transcriptions/`
- `/transcripts/`  
- `/guide/`
- `agents/`

## Implementation Steps

- [x] Create folder structure
- [x] Write `.gitignore` (exclude reference materials)
- [x] Write `package.json` with scripts
- [x] Create GitHub Actions workflow
- [x] Write `README.md`
- [x] Create `.claude/commands/` templates
- [x] Create `adws/` system with modules and scripts
- [x] Create example spec (this file)
- [x] Add Next.js config files

## Verification

```bash
# Should pass
pnpm install
pnpm lint
pnpm build
pnpm test
python adws/adw_tests/test_adw.py
```

## Next Steps

1. **Spec 002**: Database schema (Prisma models)
2. **Spec 003**: Supply CRUD API and UI
3. **Spec 004**: Stock movement tracking
4. **Spec 005**: Low stock indicators

## Notes

- This is a **bootstrap** commit - no business logic yet
- Reference materials excluded from git
- ADW system is simplified from the course version
- CI must be green before merging
