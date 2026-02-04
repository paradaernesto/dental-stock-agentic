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

## Autonomous GitHub Issues → ADW 🤖

Este proyecto soporta **agentic coding autónomo**. Cuando creas una issue en GitHub con la label `adw` o incluyes `[ADW]` en el título, se dispara automáticamente:

```
GitHub Issue (label: adw) 
    ↓
GitHub Actions workflow
    ↓
ADW Plan → Build → Test
    ↓
Pull Request automático
```

### Setup para modo autónomo

1. **Obtener API Keys:**
   - GitHub Token: https://github.com/settings/tokens (scopes: `repo`, `workflow`)
   - Elige tu AI Provider:
     - **Claude** (recomendado): https://console.anthropic.com/settings/keys
     - **Kimi** (alternativa): https://platform.moonshot.cn/

2. **Configurar secrets en el repositorio:**
   ```
   Settings → Secrets and variables → Actions → New repository secret
   
   # Opcional: elegir provider (default: claude)
   AI_PROVIDER = claude  # o "kimi"
   
   # Para Claude:
   ANTHROPIC_API_KEY = sk-ant-...
   
   # Para Kimi:
   KIMI_API_KEY = sk-kimi-...
   ```

3. **Crear una issue con ADW:**
   - Título: `[ADW] Agregar feature de búsqueda de supplies`
   - O agregar label: `adw`
   - Describe lo que necesitas en el cuerpo de la issue

4. **El workflow se ejecuta automáticamente** y crea una PR con la implementación.

### Testing local del workflow

```bash
# Configurar variables
cp .env.example .env
# Editar .env con tus tokens (ANTHROPIC_API_KEY o KIMI_API_KEY)

# Configurar provider (claude o kimi)
export AI_PROVIDER=claude  # o kimi

# Testear workflow de issues localmente
./scripts/act-issues.sh 42

# O testear el workflow completo
./scripts/act-local.sh test
```

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

## Deployment

### Vercel

#### Environment Variables

When deploying to Vercel, you must configure the `DATABASE_URL` environment variable:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: `file:./prisma/dev.db` (for SQLite)

4. Redeploy your application for changes to take effect

⚠️ **Important: SQLite Limitations on Vercel**

SQLite on Vercel has significant limitations due to Vercel's serverless architecture:

- **Ephemeral filesystem**: Data written during a request may not persist to the next request
- **Read-only in most cases**: The filesystem is read-only in many scenarios
- **Data resets on redeploy**: Your database will be reset every time you deploy

**For production use, consider migrating to PostgreSQL** (Vercel Postgres, Supabase, etc.) which provides persistent storage compatible with serverless environments.

#### Build Configuration

The application uses a centralized Prisma client (`lib/db.ts`) that provides a safe fallback for `DATABASE_URL`. This ensures the build process completes successfully even if the environment variable is temporarily unavailable during build time.

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

### Local CI Testing with Act

Test GitHub Actions locally using [act](https://github.com/nektos/act):

```bash
# Install act (macOS)
brew install act

# Run full CI locally
pnpm ci:local
# or: ./scripts/act-local.sh

# Run specific job
pnpm ci:test
# or: act -j test

# List available jobs
pnpm ci:list

# Dry run (see what would execute)
pnpm ci:dry
```

Requirements: Docker must be running.

## Scripts Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production (includes prisma generate) |
| `pnpm test` | Run tests |
| `pnpm lint` | Run linter |
| `pnpm db:push` | Push schema to database |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:studio` | Open Prisma Studio |
| `python adws/adw_plan_build.py <n>` | Plan + build issue (uses AI_PROVIDER env) |

## AI Providers

ADW soporta dos providers de IA:

| Provider | Ventajas | Configuración |
|----------|----------|---------------|
| **Claude** | Mejor para código complejo, tiene comandos slash nativos | `AI_PROVIDER=claude` + `ANTHROPIC_API_KEY` |
| **Kimi** | Más rápido, buen razonamiento con `--thinking` | `AI_PROVIDER=kimi` + `KIMI_API_KEY` |

### Cambiar de Provider

**Localmente:**
```bash
export AI_PROVIDER=kimi  # o claude
python adws/adw_plan_build.py 2
```

**En GitHub Actions:**
Configura el secret `AI_PROVIDER` en Settings → Secrets → Actions.

**Notas:**
- Kimi requiere configuración adicional en `~/.kimi/config.toml` para la API key
- El workflow de CI instala automáticamente el CLI correspondiente según `AI_PROVIDER`

## Contributing (Agentic Style)

### Modo Autónomo (Recomendado)

1. **Create a GitHub issue** with label `adw` or `[ADW]` in title
2. **ADW ejecuta automáticamente** vía GitHub Actions
3. **Revisa la PR generada** y aprueba si está correcta

### Modo Manual (Desarrollo local)

1. **Configurar variables de entorno** según tu provider:

   **Para Claude (default):**
   ```bash
   export AI_PROVIDER=claude
   export ANTHROPIC_API_KEY=sk-ant-...
   export CLAUDE_CODE_PATH=$(which claude)  # opcional
   ```

   **Para Kimi:**
   ```bash
   export AI_PROVIDER=kimi
   export KIMI_API_KEY=sk-kimi-...
   export KIMI_CODE_PATH=$(which kimi)  # opcional
   
   # Configurar API key en archivo de config
   mkdir -p ~/.kimi
   echo 'api_key = "'$KIMI_API_KEY'"' >> ~/.kimi/config.toml
   ```

2. **Crear una GitHub issue** describiendo lo que necesitas
3. **Ejecutar ADW**: `python adws/adw_plan_build.py <issue-number>`
4. **Revisar el spec generado** en `specs/`
5. **ADW implementa** siguiendo el spec
6. **Se ejecutan tests automáticamente**
7. **Se crea la PR** para revisión final

### Modo Manual (con comandos individuales):

Si prefieres controlar cada paso:

```bash
# Plan: Generar spec
python adws/adw_plan.py <issue-number>

# Build: Implementar desde el spec
python adws/adw_build.py <issue-number> <adw-id>

# Test: Ejecutar tests
python adws/adw_test.py <issue-number> <adw-id>

# Review: Revisar contra el spec
python adws/adw_review.py <issue-number> <adw-id>

# PR: Crear pull request
python adws/adw_pr.py <issue-number> <adw-id>

# O todo junto:
python adws/adw_sdlc.py <issue-number>  # Plan → Build → Test → Review → PR
```

## License

MIT
