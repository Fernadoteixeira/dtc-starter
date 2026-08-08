# .agents/ Infrastructure Index

> Auto-generated catalog of all agents, skills, hooks, contracts, and packs
> in the `.agents/` directory. Last verified: 2026-08-07.

---

## Directory Map

```
.agents/
├── hooks.json                              # PreToolUse firewall + Stop gate config
├── canonical-agent-shortcuts.yaml          # Canonical shortcut and issue-binding registry
├── canonical-execution-protocol.yaml       # Load/run/review receipt contract
├── scripts/
│   ├── pretool-firewall.ps1                 # Blocks unauthorized git ops, protects paths
│   ├── stop-gate.ps1                       # Checks for uncommitted protected files
│   ├── canonical-execution-lib.mjs         # Strict resolver/hash/path-confinement runtime
│   ├── resolve-agent-shortcut.mjs          # Emits ROUTE-E and AGENT-LOAD-E
│   ├── resolve-agent-skills.mjs            # Emits exact load receipts by category
│   ├── validate-execution-loads.mjs        # Preflight route/load validation
│   ├── validate-execution-evidence.mjs     # Final AGENT-RUN/REVIEW-E validation
│   └── __tests__/canonical-execution-fabric.test.mjs
├── skills/
│   ├── web-design-guidelines/SKILL.md      # Vercel web interface guidelines review
│   └── medusa/                             # 18 Copilot-discoverable Medusa skills (canonical tree)
│       ├── README.md                        # Provenance, update policy, skill mapping
│       ├── CATALOG.md                       # 18-skill catalog with plugins, versions, MCP, adaptation limits
│       ├── provenance/
│       │   ├── SOURCE.json                  # 107-entry manifest: originalPath, sha256, size
│       │   ├── root/                        # 4 root-level files from clone HEAD (.source suffix)
│       │   ├── manifests/                   # 5 plugin/marketplace manifests (.source.json suffix)
│       │   └── mcps/                        # 2 MCP configurations (.source.json suffix)
│       ├── medusa-dev-building-admin-dashboard-customizations/
│       ├── medusa-dev-building-storefronts/
│       ├── medusa-dev-building-with-medusa/
│       ├── medusa-dev-creating-internal-agents/
│       ├── medusa-dev-db-generate/
│       ├── medusa-dev-db-migrate/
│       ├── medusa-dev-new-user/
│       ├── medusa-ecommerce-storefront-best-practices/
│       ├── medusa-learning-medusa/
│       ├── medusa-cloud-auth/
│       ├── medusa-cloud-deployments/
│       ├── medusa-cloud-environments/
│       ├── medusa-cloud-local/
│       ├── medusa-cloud-logs/
│       ├── medusa-cloud-organizations/
│       ├── medusa-cloud-projects/
│       ├── medusa-cloud-using/
│       └── medusa-cloud-variables/
├── contracts/
│   ├── session-state-ledger.md             # Gate state contract (10 sections)
│   ├── session-state-ledger.schema.yaml     # YAML schema for the ledger
│   └── nos-gallery-first-fold.yaml          # BB03 visual contract (3-zone, palette, ratio)
├── templates/
│   └── session-state-ledger.yaml           # Blank ledger instance
├── medusa-agent-skills/                    # Clone Git de referência (boldfernando/medusa-agent-skills, commit c584f79, read-only)
├── fio-vivo-antigravity-rug-pack/           # RUG dispatcher, canonical worker/reviewer + BB03 specialists
├── ollama-superpowers-pack-v1.0.0/         # 18 agents, 28 skills, 15 tools (multilingual)
├── nos-gallery-canonical-skills-205/       # 205 atomic skills across 8 domains
└── product-lifecycle-canonical-skills-315/  # 315 atomic skills across 22 domains
```

---

## 1. Hooks

### PreToolUse: `fio-vivo-pretool-firewall`

**Script:** `scripts/pretool-firewall.ps1`
**Purpose:** Blocks unauthorized Git history/remote operations and protects critical paths.

**Blocked commands** (deny):
- `git commit`, `git push`, `git reset`, `git rebase`, `git merge`, `git revert`, `git clean`, `git cherry-pick`

**Protected paths** (force_ask — requires explicit user approval):
- `apps/storefront/src/app/globals.css`
- `pnpm-lock.yaml`
- `package.json`
- `.github/workflows/*`
- `playwright.config.*`
- `apps/storefront/src/modules/nos-gallery/*`

### Stop: `fio-vivo-stop-gate`

**Script:** `scripts/stop-gate.ps1`
**Purpose:** Prevents session end if protected paths have uncommitted modifications.
**Decision:** `continue` (block stop) if dirty, `allow` if clean.

---

## 2. Skills

### web-design-guidelines

- **Location:** `skills/web-design-guidelines/SKILL.md`
- **Trigger:** "review my UI", "check accessibility", "audit design", "review UX"
- **Purpose:** Reviews UI code against Vercel's Web Interface Guidelines (accessibility, typography, layout, interaction patterns).

### Medusa Agent Skills (18 Copilot-discoverable skills)

- **Location:** `skills/medusa/` (canonical runtime tree)
- **Provenance clone:** `medusa-agent-skills/` (read-only Git clone at commit `c584f79`, origin `boldfernando/medusa-agent-skills`, upstream `medusajs/medusa-agent-skills`, marketplace v1.0.11)
- **Format:** One directory per skill, each with `SKILL.md` + optional `reference/` or `references/` sub-files
- **MCP server:** `.vscode/mcp.json` configures `medusa-docs` (HTTP, `https://docs.medusajs.com/mcp`) — all 18 skills associate with it
- **Validator:** `scripts/validate-medusa-skills.mjs` checks SKILL.md frontmatter, link integrity, and provenance consistency
- **Catalog:** `skills/medusa/CATALOG.md` has the full 18-skill table with plugins, versions, triggers, and adaptation limits
- **Provenance manifest:** `skills/medusa/provenance/SOURCE.json` lists all 107 tracked files at HEAD with SHA-256 hashes

**18 skills across 4 plugins:**

| # | Canonical name | Plugin | Trigger |
|---|---|---|---|
| 1 | `medusa-ecommerce-storefront-best-practices` | ecommerce-storefront v1.0.8 | ANY storefront work (checkout, cart, product pages, listings) |
| 2 | `medusa-learning-medusa` | learn-medusa v1.0.8 | "teach me", "guide me", "I want to learn" |
| 3 | `medusa-cloud-auth` | medusa-cloud v1.2.0 | mcloud auth commands (login, logout, whoami) |
| 4 | `medusa-cloud-deployments` | medusa-cloud v1.2.0 | List deployments, get details, fetch build logs |
| 5 | `medusa-cloud-environments` | medusa-cloud v1.2.0 | List, get, create, delete, redeploy environments |
| 6 | `medusa-cloud-local` | medusa-cloud v1.2.0 | Reproduce Cloud build locally via `mcloud local` |
| 7 | `medusa-cloud-logs` | medusa-cloud v1.2.0 | Fetch and stream runtime logs for Cloud environments |
| 8 | `medusa-cloud-organizations` | medusa-cloud v1.2.0 | List/get Cloud organizations, resolve org IDs |
| 9 | `medusa-cloud-projects` | medusa-cloud v1.2.0 | List, get, delete Cloud projects |
| 10 | `medusa-cloud-variables` | medusa-cloud v1.2.0 | List, get, set, delete environment variables |
| 11 | `medusa-cloud-using` | medusa-cloud v1.2.0 | Umbrella skill for mcloud CLI operations |
| 12 | `medusa-dev-building-admin-dashboard-customizations` | medusa-dev v1.0.9 | ANY Medusa Admin UI work (widgets, custom pages, forms) |
| 13 | `medusa-dev-building-storefronts` | medusa-dev v1.0.9 | Medusa storefront features (custom API routes, SDK integration) |
| 14 | `medusa-dev-building-with-medusa` | medusa-dev v1.0.9 | ANY Medusa backend work (modules, API routes, workflows, data models) |
| 15 | `medusa-dev-creating-internal-agents` | medusa-dev v1.0.9 | Building internal admin-facing AI agents in Medusa |
| 16 | `medusa-dev-db-generate` | medusa-dev v1.0.9 | Generate database migrations (`medusa db:generate <module>`) |
| 17 | `medusa-dev-db-migrate` | medusa-dev v1.0.9 | Run database migrations (`medusa db:migrate`) |
| 18 | `medusa-dev-new-user` | medusa-dev v1.0.9 | Create an admin user (`medusa user -e <email> -p <password>`) |

> **Update flow:** clone → canonical. The nested clone (`medusa-agent-skills/`) is reference-only; never edit it directly. Updates pull the clone to a new commit, re-derive provenance files, then regenerate canonical `SKILL.md` files.

---

## 3. Contracts

### session-state-ledger

- **Files:** `contracts/session-state-ledger.md` (spec), `.schema.yaml` (schema), `templates/session-state-ledger.yaml` (blank)
- **Purpose:** Canonical gate-state tracking for multi-round BB executions.
- **State flow:** `READY_FOR_HUMAN_APPROVAL` -> `HUMAN_APPROVED` -> `GIT_AUTHORIZED` -> `PR_CREATED` -> `MERGE_AUTHORIZED` -> `MERGED`
- **Sections:** scope, participants, gates, authorization, evidence, risk-register, changelog, sign-offs, audit-trail, metadata

### nos-gallery-first-fold

- **File:** `contracts/nos-gallery-first-fold.yaml`
- **Purpose:** Visual contract for BB03 nos-gallery first fold.
- **Requirements:** Three-zone asymmetric grid, copper/umber/linen palette, active/neighbor ratio >= 1.30

---

## 4. Packs

### 4a. Fio Vivo Antigravity RUG Pack

**Path:** `fio-vivo-antigravity-rug-pack/`
**Format:** `agent.md` with YAML frontmatter (name, description, tools, mainAgent/subagent, model, commandExecutionPolicy)
**Self-contained:** Has its own `.agents/` with hooks.json + scripts (identical to root).

| Agent | Role | Type |
|-------|------|------|
| `fio-vivo-rug` | Pure orchestrator (delegates, validates, retries) | main |
| `bb03-css-spec` | Read-only CSS composition specialist | sub |
| `bb03-css-implementer` | CSS writer | sub |
| `bb03-css-validator` | CSS validation | sub |
| `build-verifier` | Build verification | sub |
| `repo-guardian` | Repository protection | sub |
| `visual-auditor` | Visual audit | sub |

### 4b. Ollama Superpowers Pack v1.0.0

**Path:** `ollama-superpowers-pack-v1.0.0/`
**Format:** `agent.json` + locale `.md` files (pt-BR, en, es, fr)
**Target models:** `gpt-oss:20b` (local), `glm-5.2:cloud` (cloud escalation)
**Has:** `manifest.json`, Python venv, `requirements.txt`, `scripts/install.ps1`

**18 Agents:**

| Agent | Purpose |
|-------|---------|
| orchestrator | Multi-agent task decomposition and coordination |
| dev-environment-operator | Docker, dev servers, dependency management |
| implementation-engineer | Code implementation |
| code-reviewer | Code review and quality checks |
| context-librarian | Context gathering and compaction |
| incident-debugger | Runtime error diagnosis |
| localization-editor | i18n/l10n content management |
| media-inspector | Image/media analysis |
| product-pricing-analyst | Pricing strategy and scenarios |
| qa-test-lead | Test planning and execution |
| regression-auditor | Regression detection |
| release-operator | Release management |
| repo-cartographer | Repository mapping |
| research-analyst | Research and synthesis |
| runtime-verifier | Runtime verification |
| security-governor | Security review |
| software-architect | Architecture design |
| visual-catalog-curator | Visual catalog management |

**28 Skills:** code-review, context-compaction, cost-governance, debugging, dependency-audit, dev-env-bringup, documentation, git-workflow, issue-to-plan, localization, media-analysis, multilingual-qa, performance-analysis, plan-to-patch, pricing-scenarios, product-catalog, rag-pipeline, regression-attribution, release-readiness, repo-map, research-synthesis, root-cause-analysis, runtime-verification, security-review, structured-output, test-generation, tool-design, web-research

**15 Tools:** filesystem, git, package-managers, docker, process, http, browser, playwright, database, search, media, code-intelligence, testing, ci-cd, monitoring

### 4c. nos-gallery Canonical Skills 205

**Path:** `nos-gallery-canonical-skills-205/`
**Format:** One directory per domain, one `.md` per atomic skill
**Manifests:** `skills.json`, `skills.csv`, `domain-summary.json`, `package-summary.json`, `integrity-report.json`
**Base:** Fernadoteixeira/nos-gallery dependency baseline

| Domain | Skills | Coverage |
|--------|--------|----------|
| 01-web-runtime | ~60 | next, react, react-dom, server-only |
| 02-identity-auth | ~10 | clerk-nextjs, input-otp |
| 03-data-contracts-forms | ~30 | date-fns, hookform-resolvers, pg, react-day-picker, react-hook-form, zod |
| 04-radix-ui | ~30 | All Radix UI primitives (accordion, dialog, dropdown, etc.) |
| 05-styles-themes-css | ~20 | Tailwind, CSS, theming |
| 06-interaction-visualization-ux | ~20 | Framer Motion alternatives, UX patterns |
| 07-analytics-performance | ~15 | Analytics, performance monitoring |
| 08-quality-engineering | ~20 | Testing, linting, CI/CD |

### 4d. Product Lifecycle Canonical Skills 315

**Path:** `product-lifecycle-canonical-skills-315/`
**Format:** One directory per domain, one `.md` per atomic skill
**Manifests:** `skills.json`, `skills.csv`, `domains.json`, `capability-packs.json`, `orchestrations.json`, `lifecycle-coverage.csv`, `integrity-report.json`
**Scope:** 315 skills across 22 domains, 78 capability packs, 24 cross-domain orchestrations

| Domain Range | Coverage |
|-------------|----------|
| 01-05 | Product strategy, portfolio, discovery, requirements, roadmap |
| 06-10 | Design system, architecture, implementation, integration, testing |
| 11-15 | Deployment, release, monitoring, analytics, optimization |
| 16-22 | Security, compliance, localization, accessibility, documentation, migration, deprecation |

---

## 5. Activation Status

| Component | Status | Notes |
|-----------|--------|-------|
| PreToolUse firewall | Active | Hooks configured in `hooks.json`, scripts verified functional |
| Stop gate | Active | Script runs, checks git status for protected paths |
| web-design-guidelines skill | Available | Listed in Copilot CLI available skills |
| Medusa agent skills (18) | Available | Copilot-discoverable via `skills/medusa/*/SKILL.md`, validated by `scripts/validate-medusa-skills.mjs` |
| medusa-agent-skills clone | Referência (read-only clone) | Git clone at commit `c584f79`, origin `boldfernando/medusa-agent-skills` |
| medusa-docs MCP server | Configured | `.vscode/mcp.json` — HTTP endpoint `https://docs.medusajs.com/mcp` |
| Fio Vivo RUG pack | Available | 7 agents defined, self-contained hooks |
| Ollama Superpowers pack | Installed | Files present, Python venv + requirements ready |
| nos-gallery skills 205 | Available | 205 skill files catalogued in manifests |
| Product lifecycle skills 315 | Available | 315 skill files catalogued in manifests |
| Session state ledger | Available | Contract + schema + template in place |

---

## 6. Usage

### For Copilot CLI sessions

The root `AGENTS.md` is the primary context file. The hooks fire on every tool call
(PreToolUse) and at session end (Stop). Skills are loaded on demand.

### For Ollama / local model workflows

The ollama superpowers pack provides agents and skills for `gpt-oss:20b` (local) with
`glm-5.2:cloud` escalation. Install with:

```powershell
cd .agents/ollama-superpowers-pack-v1.0.0
./scripts/install.ps1
```

### For RUG orchestration (BB03 CSS work)

The fio-vivo-antigravity-rug-pack provides a pure orchestrator (`fio-vivo-rug`) that
delegates to BB03 CSS specialists. Agents use `agent.md` format with YAML frontmatter.

### For canonical skill reference

The nos-gallery (205) and product-lifecycle (315) skill packs provide atomic, framework-
specific guidance. Use manifests (`skills.json`) to look up skills by domain or package.

### For Medusa development

The 18 Medusa agent skills in `skills/medusa/` are auto-discovered by VS Code Copilot
via `SKILL.md` frontmatter. They cover backend development (`building-with-medusa`,
`building-admin-dashboard-customizations`), storefront work (`building-storefronts`,
`storefront-best-practices`), database operations (`db-generate`, `db-migrate`,
`new-user`), and Medusa Cloud CLI operations (`medusa-cloud-*`). All skills associate
with the `medusa-docs` MCP server (`https://docs.medusajs.com/mcp`). Validate the
canonical tree with:

```bash
node scripts/validate-medusa-skills.mjs
```

The read-only clone at `medusa-agent-skills/` preserves the original source bytes and
Git history for auditing and re-derivation. Never edit it directly.