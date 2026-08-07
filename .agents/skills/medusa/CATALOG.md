# Medusa Agent Skills — Catalog

> 18 skills across 4 plugins, derived from `medusajs/medusa-agent-skills` commit `c584f79` (marketplace v1.0.11).

## Plugins

| Plugin | Version | Description | Skills |
|---|---|---|---|
| `medusa-dev` | 1.0.9 | Backend, admin UI, storefront SDK integration | 7 |
| `learn-medusa` | 1.0.8 | Interactive guided tutorial | 1 |
| `ecommerce-storefront` | 1.0.8 | Storefront UI/UX best practices | 1 |
| `medusa-cloud` | 1.2.0 | Medusa Cloud CLI operations | 9 |

## Skill Catalog

| # | Canonical name | Plugin | Plugin ver | Function / Trigger | MCP | Adaptation limits (Copilot) |
|---|---|---|---|---|---|---|
| 1 | `storefront-best-practices` | ecommerce-storefront | 1.0.8 | ALWAYS use for ANY storefront work: checkout, cart, product pages, listings, navigation, homepage. Framework-agnostic (Next.js, SvelteKit, TanStack Start, React, Vue). | medusa-docs | Replace Claude-specific `allowed-tools` (none in original). Keep framework-agnostic guidance. Preserve all `reference/` sub-files. Adapt trigger wording for Copilot auto-discovery. |
| 2 | `learning-medusa` | learn-medusa | 1.0.8 | Load when user asks to learn Medusa ("teach me", "guide me", "I want to learn"). Interactive tutorial with checkpoints. | medusa-docs | Remove Claude-specific bootcamp-instructor persona if it conflicts with Copilot tone. Keep all lessons/, checkpoints/, architecture/, troubleshooting/ content. |
| 3 | `mcloud-auth` | medusa-cloud | 1.2.0 | Execute mcloud auth commands: login, logout, whoami, use, version, signup. | medusa-docs | Replace `Bash(...)` allowed-tools with Copilot tool-call equivalent. Keep command reference. Preserve `allowed-tools` as documentation of intended scope. |
| 4 | `mcloud-deployments` | medusa-cloud | 1.2.0 | List deployments, get details, fetch build logs. Use for deployment status and build debugging. | medusa-docs | Replace `Bash(...)` allowed-tools. Keep deployment command reference. |
| 5 | `mcloud-environments` | medusa-cloud | 1.2.0 | List, get, create, delete, redeploy environments. Manage environment lifecycle. | medusa-docs | Replace `Bash(...)` allowed-tools. Keep environment management reference. |
| 6 | `mcloud-local` | medusa-cloud | 1.2.0 | Reproduce Cloud build locally via `mcloud local`. Debug build-failed deployments. Requires Docker. | medusa-docs | Replace `Bash(...)` allowed-tools. Preserve Docker requirement note and Git repo constraint. |
| 7 | `mcloud-logs` | medusa-cloud | 1.2.0 | Fetch and stream runtime logs for Cloud environments. Filter by time range, search errors. | medusa-docs | Replace `Bash(...)` allowed-tools. Keep log streaming reference. |
| 8 | `mcloud-organizations` | medusa-cloud | 1.2.0 | List/get Cloud organizations. Resolve org IDs by name. | medusa-docs | Replace `Bash(...)` allowed-tools. Keep organization discovery reference. |
| 9 | `mcloud-projects` | medusa-cloud | 1.2.0 | List, get, delete Cloud projects. Resolve project handles by name. | medusa-docs | Replace `Bash(...)` allowed-tools. Keep project management reference. |
| 10 | `mcloud-variables` | medusa-cloud | 1.2.0 | List, get, set, delete environment variables. Never pass `--reveal` unless user explicitly requests. | medusa-docs | Replace `Bash(...)` allowed-tools. CRITICAL: preserve `--reveal` security constraint. |
| 11 | `using-medusa-cloud` | medusa-cloud | 1.2.0 | Manages Medusa Cloud via mcloud CLI. CRITICAL for mcloud commands, deployment failures, build logs, CI/CD. | medusa-docs | Umbrella skill — keep all `reference/` sub-files (debugging-deployments.md, environments-and-variables.md, setup.md). |
| 12 | `building-admin-dashboard-customizations` | medusa-dev | 1.0.9 | Load automatically for ANY Medusa Admin UI work: widgets, custom pages, forms, tables, data loading, navigation. | medusa-docs | Keep all `references/` sub-files (data-loading, display-patterns, forms, navigation, table-selection, typography). Adapt auto-load trigger for Copilot. |
| 13 | `building-storefronts` | medusa-dev | 1.0.9 | Load automatically for Medusa storefront features: custom API routes, SDK integration, React Query, data fetching. | medusa-docs | Keep `references/frontend-integration.md`. Adapt auto-load trigger for Copilot. |
| 14 | `building-with-medusa` | medusa-dev | 1.0.9 | Load automatically for ANY Medusa backend work: modules, API routes, workflows, data models, module links, business logic. | medusa-docs | Keep all `reference/` sub-files (api-routes, authentication, custom-modules, data-models, error-handling, frontend-integration, module-links, querying-data, scheduled-jobs, subscribers-and-events, troubleshooting, workflow-hooks, workflows). Adapt auto-load trigger for Copilot. |
| 15 | `creating-internal-agents` | medusa-dev | 1.0.9 | Use when building internal admin-facing AI agents in Medusa. Merchants/operators, not customers. Covers data models, module service, agent runtime (tools, streamText), NDJSON streaming, admin UI chat. | medusa-docs | **Name mismatch:** original `name: creating-agents-in-medusa`, directory `creating-internal-agents`. Canonical must use `creating-internal-agents`. Keep `reference/` sub-files (admin-extension, agent-setup, api-route, data-models, streaming). Remove `allowed-tools` Claude-specifics. |
| 16 | `db-generate` | medusa-dev | 1.0.9 | Generate database migrations for a Medusa module. Argument: `<module-name>`. | medusa-docs | Replace `Bash(npx medusa db:generate:*)` with Copilot terminal-call equivalent. Keep `argument-hint`. |
| 17 | `db-migrate` | medusa-dev | 1.0.9 | Run database migrations in Medusa. | medusa-docs | Replace `Bash(npx medusa db:migrate:*)` with Copilot terminal-call equivalent. |
| 18 | `new-user` | medusa-dev | 1.0.9 | Create an admin user in Medusa. Arguments: `<email> <password>`. | medusa-docs | Replace `Bash(npx medusa user:*)` with Copilot terminal-call equivalent. Keep `argument-hint`. |

## Adaptation Notes

### Claude-specific fields to transform

| Original field | Copilot equivalent | Action |
|---|---|---|
| `allowed-tools: Bash(...)` | Terminal tool calls | Remove from frontmatter; document intended scope in body |
| `argument-hint: <...>` | Keep as-is | Compatible with Copilot discovery |
| Auto-load triggers ("Load automatically when...") | Copilot activation wording | Rephrase to match Copilot's skill-matching behavior |

### Reference files

Each skill may have a `reference/` or `references/` subdirectory with supporting Markdown files. These must be copied alongside the canonical SKILL.md and their relative links must resolve. The validator (`scripts/validate-medusa-skills.mjs`) checks link integrity.

### MCP association

All 18 skills associate with the `medusa-docs` MCP server (`https://docs.medusajs.com/mcp`), configured in `.vscode/mcp.json`. The original clone had two `.mcp.json` files (medusa-dev, learn-medusa) both pointing to the same endpoint under the key `MedusaDocs`. The canonical tree uses the VS Code MCP format with key `medusa-docs`.