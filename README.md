# Dental Inventory System

A simplified inventory management system for dental clinics, built with an **agentic workflow** approach.

## Goal

Track dental supplies, manage stock movements (in/out), and monitor low stock levels with minimal complexity.

## Agentic Workflow (ADW)

This project uses the Agentic Development Workflow system:

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  PLAN   │ →  │  BUILD  │ →  │  TEST   │ →  │  REVIEW │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
```

### Quick Start with ADW

```bash
# Plan + Build for an issue
python adws/adw_plan_build.py <issue-number>

# Full SDLC
python adws/adw_sdlc.py <issue-number>

# Individual phases
python adws/adw_plan.py <issue-number>
python adws/adw_build.py <issue-number> <adw-id>
python adws/adw_test.py <issue-number> <adw-id>
```

### Slash Commands

Available in `.claude/commands/`:

| Command | Purpose |
|---------|---------|
| `/feature` | New feature from spec |
| `/bug` | Bug fix |
| `/chore` | Maintenance task |
| `/implement` | Implement from spec |
| `/test` | Run test suite |
| `/review` | Review against spec |
| `/commit` | Generate commit message |
| `/pull_request` | Create PR |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | SQLite + Prisma ORM |
| Testing | Vitest |
| CI/CD | GitHub Actions |
| Workflow | ADW (Agentic Development) |

## Running Locally

### Prerequisites

- Node.js 20+
- pnpm 9+
- Python 3.10+ (for ADW)

### Setup

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env

# Setup database
pnpm db:push

# Seed with test data (optional)
pnpm db:seed

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`.

## Project Structure

```
├── .claude/commands/     # Slash command templates
├── adws/                 # ADW system scripts
│   ├── adw_modules/      # Core ADW modules
│   ├── adw_tests/        # ADW tests
│   └── adw_*.py          # Workflow scripts
├── agents/               # ADW state (gitignored)
├── app/                  # Next.js app router
├── lib/                  # Utilities
├── prisma/               # Database schema
├── specs/                # Generated plans
├── tests/                # Test files
└── scripts/              # Utility scripts
```

## CI/CD

GitHub Actions runs on every PR and push to `main`/`develop`:

1. **Lint** - ESLint checks
2. **Build** - Next.js build
3. **Test** - Vitest test suite

See `.github/workflows/ci.yml`.

## Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm test` | Run tests |
| `pnpm lint` | Run linter |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Prisma Studio |
| `python adws/adw_plan_build.py <n>` | Plan + build issue |

## Contributing (Agentic Style)

1. **Create a GitHub issue** describing what you need
2. **Run ADW**: `python adws/adw_plan_build.py <issue-number>`
3. **Review the generated spec** in `specs/`
4. **ADW implements** following the spec
5. **Tests run automatically**
6. **PR is created** for final review

Or manually:

1. **Pick a command template** from `.claude/commands/`
2. **Generate a plan** in `specs/`
3. **Implement** incrementally
4. **Test** your changes
5. **Commit** with clear messages

## License

MIT
