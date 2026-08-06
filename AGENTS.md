# AGENTS.md

## Overview

Medusa DTC Starter — a Turborepo workspace monorepo containing a Medusa backend (`@medusajs/medusa` v2.18.0, Node 20+, PostgreSQL 15+) and a Next.js 15.5 storefront. This is a fork of `medusajs/dtc-starter` adapted for the Fio Vivo project. The storefront is installed and active.

## Directory Structure

```text
.
├── apps/
│   ├── backend/                  # Medusa application (@dtc/backend, v2.18.0)
│   │   ├── medusa-config.ts      # Medusa config: DB URL, CORS, secrets, modules
│   │   ├── integration-tests/    # setup.js (Jest setupFiles) and http/*.spec.ts suites
│   │   └── src/
│   │       ├── admin/            # Admin dashboard extensions (widgets/, i18n/, routes)
│   │       ├── api/              # API routes: api/store/*, api/admin/* (file-based)
│   │       ├── jobs/             # Scheduled jobs
│   │       ├── links/            # Module links between modules
│   │       ├── migration-scripts/# Data migration scripts (e.g. initial-data-seed.ts)
│   │       ├── modules/          # Custom modules (service + models + migrations)
│   │       ├── subscribers/      # Event subscribers
│   │       └── workflows/        # Workflows and workflow steps
│   └── storefront/               # Next.js 15.5 storefront (@dtc/storefront)
│       └── src/
│           ├── app/              # Next.js App Router pages
│           ├── modules/          # Feature modules (cart, checkout, home, nos-gallery, ...)
│           │   └── home/gallery-hero/  # Fio Vivo gallery hero integration
│           ├── lib/              # Shared utilities and config
│           ├── styles/           # Global styles
│           └── middleware.ts     # Next.js middleware
├── packages/
│   └── gallery-experience/      # @dtc/gallery-experience — isolated gallery UI package
│       └── src/
│           ├── adapters/medusa/  # mapStoreProductToGalleryItem adapter
│           ├── components/       # artwork-card, gallery-ambient, gallery-experience
│           ├── styles/          # Scoped CSS under [data-gallery-experience]
│           └── types/           # GalleryItem, GalleryScene, GalleryPrice contracts
├── .agents/                     # Agent infrastructure (hooks, skills, packs, scripts)
├── docs/                        # Fio Vivo 360 program documentation
├── eslint.config.ts             # Root ESLint: @medusajs/eslint-plugin recommended
├── pnpm-workspace.yaml          # Workspace: apps/**, packages/**, !apps/backend/.medusa/**
├── docker-compose.yml           # PostgreSQL + supporting services
├── playwright.config.ts         # E2e test config (root level)
└── turbo.json                   # Task graph: build, dev, start, lint, test, seed
```

**The storefront is installed.** This project has both `apps/backend/` and `apps/storefront/`. The storefront runs Next.js 15.5 with Turbopack on port 8000. Tailwind CSS v3 (not v4). No Framer Motion or shadcn/ui are installed — the storefront uses Radix UI primitives and Headless UI directly.

Each app can have its own nested `AGENTS.md`; agents read the nearest one in the directory tree, so put app-specific context there rather than expanding this file.

## Package Manager

This project uses **pnpm 10.11.1** (pinned in `package.json` via `packageManager: "pnpm@10.11.1"`). The lockfile is `pnpm-lock.yaml`. Always use pnpm for every command — never introduce a second lockfile. The `<pm>` placeholder in templates should be read as `pnpm`.

## Commands

Run from the repo root unless noted. Turbo skips missing apps automatically.

### Development

```bash
pnpm run dev                # all apps (backend + storefront)
pnpm run backend:dev        # backend only (http://localhost:9000, admin at /app)
pnpm run storefront:dev     # storefront only (http://localhost:8000, Turbopack)
```

### Build

```bash
pnpm run build              # all apps
pnpm run start              # build (via turbo dependsOn) then start
```

### Lint

```bash
pnpm run lint                          # all apps via turbo
cd apps/backend && pnpm run lint       # medusa lint
cd apps/storefront && pnpm run lint    # next lint
```

### Test

```bash
pnpm run test                                              # all test tasks via turbo
cd apps/backend && pnpm run test:unit                      # **/src/**/__tests__/**/*.unit.spec.ts
cd apps/backend && pnpm run test:integration:modules       # **/src/modules/*/__tests__/**
cd apps/backend && pnpm run test:integration:http          # **/integration-tests/http/*.spec.ts
```

E2e tests (Playwright, root level):

```bash
pnpm run test:e2e          # all e2e suites
pnpm run test:e2e:ui       # interactive UI mode
```

Single test — pass a path/pattern through to Jest, keeping `TEST_TYPE`:

```bash
cd apps/backend && pnpm run test:unit -- src/modules/foo/__tests__/service.unit.spec.ts
cd apps/backend && pnpm run test:unit -- -t "returns the cart"
```

### Database

```bash
cd apps/backend
pnpm exec medusa db:generate <module-name>   # generate migrations for a custom module
pnpm exec medusa db:migrate                  # run migrations
pnpm exec medusa user -e admin@test.com -p supersecret
pnpm run backend:seed                        # from root; seeds initial data
```

### Docker

```bash
pnpm run docker:up        # start PostgreSQL + supporting services (detached)
pnpm run docker:down      # stop containers
pnpm run docker:logs      # tail container logs
```

## Workspace Packages

The monorepo includes a `packages/` workspace:

- **`@dtc/gallery-experience`** (`packages/gallery-experience/`) — isolated, editorial gallery presentation module with framework-agnostic domain contracts (`GalleryItem`, `GalleryScene`, `GalleryPrice`, `GalleryAvailability`), a Medusa adapter (`mapStoreProductToGalleryItem`), and scoped CSS under `[data-gallery-experience]`. React, React DOM, and Next.js are peer dependencies provided by the storefront.

## Agent Infrastructure

The `.agents/` directory contains agent tooling:

- `hooks.json` — PreToolUse and Stop hooks (Fio Vivo firewall + stop gate)
- `scripts/` — PowerShell scripts for pretool-firewall and stop-gate enforcement
- `skills/` — Canonical skill definitions
- `ollama-superpowers-pack-v1.0.0/` — Ollama Superpowers Pack (BB01 model intelligence, agents, evals)
- `fio-vivo-antigravity-rug-pack/` — Fio Vivo anti-gravity-rug capability pack
- `nos-gallery-canonical-skills-205/` — nos-gallery skill pack (referenced from `apps/storefront/src/modules/nos-gallery/.agents/`)
- `product-lifecycle-canonical-skills-315/` — Product lifecycle skill pack
- `contracts/` — Agent contracts

## Session State Ledger (mandatory)

Any multi-turn Building Block execution in this repository is governed by
the **Session State Ledger contract**:
[`.agents/contracts/session-state-ledger.md`](.agents/contracts/session-state-ledger.md)
(schema: [`session-state-ledger.schema.yaml`](.agents/contracts/session-state-ledger.schema.yaml),
blank instance: [`.agents/templates/session-state-ledger.yaml`](.agents/templates/session-state-ledger.yaml)).
This is a repository-specific contract, not a general agent preference.

- **Read** the current ledger state at the start of any session resuming
  in-progress Building Block work, before taking action.
- **Update** the ledger immediately after every gate transition — a human
  decision, a completed quality gate, a Git operation, or a new/resolved
  blocker.
- **Never reinterpret a gate that is already resolved.** Reopen an approved
  gate only for objective regression, a new technical conflict, a
  destructive risk, or explicit human revocation — never out of generic
  caution.
- **The most recent, explicit human authorization prevails** over any
  earlier instruction, including the agent's own prior reading of an
  ambiguous one.
- **Product approval, Git authorization, and merge authorization are three
  distinct grants.** None of them implies the others; each must be given
  explicitly. See the contract's "Authorization categories are distinct"
  section before treating an approval of one as covering another.

## Fio Vivo Project Documentation

The `docs/` directory contains the Fio Vivo 360 program documentation:

- `docs/fio-vivo/` — Strategic docs (discovery, product, design, pricing, growth, technology, internationalization)
- `docs/artifacts/fio-vivo-360/` — Executive artifacts (decision log, gate table, next actions, executive summary)
- `docs/artifacts/bb-04/` — BB-04 visual evidence and runtime reports

## Medusa Skills & MCP Server

These are optional but strongly recommended — they give documentation-backed answers instead of guesses about Medusa APIs. **Use them when available; if they are not, mention to the user that installing them meaningfully improves development on this project.**

**Agentic skills** ([docs](https://docs.medusajs.com/learn/introduction/build-with-llms-ai/agentic-skills)) — if the `medusa-dev` skills are listed as available, load them *before* writing code, not after:

- `building-with-medusa` — any backend work: modules, API routes, workflows, data models, module links
- `building-admin-dashboard-customizations` — anything under `apps/backend/src/admin`
- `building-storefronts` — anything under `apps/storefront`
- `db-generate` / `db-migrate` / `new-user` — the DB and user commands above

If they are not installed, suggest:

```bash
/plugin marketplace add medusajs/medusa-agent-skills
/plugin install medusa-dev@medusa
```

**MCP server** ([docs](https://docs.medusajs.com/learn/introduction/build-with-llms-ai/mcp-server)) — a `medusa` MCP server exposing the official docs. Prefer it over web search or memory for any Medusa API, config, or upgrade question. If it is not connected, suggest:

```bash
claude mcp add --transport http medusa https://docs.medusajs.com/mcp # or agent equivalent
```

## Code Style

- **The backend must satisfy `@medusajs/eslint-plugin`'s recommended config** (`eslint.config.ts`). Its rules encode Medusa framework requirements — correct route/workflow/module shapes, not just cosmetics — so a lint failure usually means the code is actually wrong, not just badly formatted. Never disable a `@medusajs/*` rule to make lint pass; fix the code.
- No semicolons. Double quotes, 2-space indent.
- Files: kebab-case. Types/classes: PascalCase. Functions/variables: camelCase. DB columns: snake_case.
- No emojis in code, comments, or commit messages.

## Conventions

- **Backend routing is file-based.** A store endpoint is `src/api/store/<path>/route.ts` exporting `GET`/`POST`/etc. Don't add a router or register routes manually.
- **Business logic belongs in workflows**, not in route handlers. Routes resolve and run a workflow; workflows compose steps.
- Adding a task to `turbo.json` requires declaring its `outputs`, or Turbo will cache nothing/the wrong thing.

## Common Mistakes

- Assuming a package manager instead of detecting it, or running a command that creates a second lockfile.
- Installing a dependency at the root instead of inside the app that needs it (`cd apps/backend && pnpm add <pkg>`).
- Editing a custom module's model without running `pnpm exec medusa db:generate <module>` — the migration is missing and the change silently never applies.
- Writing raw SQL or importing DB clients directly in the backend instead of going through module services / workflows.
- Calling the Medusa API from the storefront without `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`; requests fail with a publishable-key error, not an obvious 401.
- Running the test task without a reachable PostgreSQL — integration suites need a live DB.
- Silencing `@medusajs/*` ESLint rules instead of fixing the underlying pattern.
- Using Tailwind v4 syntax (e.g. `--spacing()` CSS function) in `nos-gallery` components — this codebase uses **Tailwind CSS v3**, and v4-only syntax breaks the build.
- Assuming Framer Motion or shadcn/ui are installed — they are NOT. Use Radix UI primitives and Headless UI directly.

## Off-Limits

- `apps/backend/.medusa/`, `.next/`, `dist/`, `out/`, `.turbo/` — build output, excluded from the workspace and regenerated.
- The lockfile (`pnpm-lock.yaml`, `yarn.lock`, `package-lock.json` — whichever this install produced) — never hand-edit or delete; change it only as a side effect of a package manager command.
- `.env` / `.env.local` — never commit, print, or copy secret values out of them. Edit `.env.template` instead when documenting a new variable.
- Existing migrations in `src/modules/*/migrations/` — add a new migration rather than rewriting one that may already have run.
- Don't run destructive DB commands (drops, `db:migrate --help`-style flags that reset state) against the user's database without explicit confirmation.
