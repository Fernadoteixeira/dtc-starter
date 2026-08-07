# Medusa Agent Skills — Canonical Tree

> **Runtime source of truth:** `.agents/skills/medusa/`
> **Nested clone (reference only):** `.agents/medusa-agent-skills/` (Git submodule-style clone at commit `c584f79`)

## Provenance

This directory is the canonical home for Medusa agent skills in this repository. It was derived from a nested Git clone of [`medusajs/medusa-agent-skills`](https://github.com/medusajs/medusa-agent-skills), forked to [`boldfernando/medusa-agent-skills`](https://github.com/boldfernando/medusa-agent-skills).

| Field | Value |
|---|---|
| Clone path | `.agents/medusa-agent-skills/` |
| Commit (short) | `c584f79` |
| Commit (full) | `c584f7993b696d82eab6dbcfadff8ece9a02a521` |
| Commit date | 2026-07-16T11:41:26+03:00 |
| Branch | `main` |
| Origin remote | `https://github.com/boldfernando/medusa-agent-skills.git` |
| Upstream remote | `https://github.com/medusajs/medusa-agent-skills.git` |
| Tracked files at HEAD | 107 |
| SKILL.md files | 18 |
| Clone marketplace version | 1.0.11 |

## Update Policy

1. **The canonical tree (`.agents/skills/medusa/`) is the runtime source.** VS Code Copilot discovers skills here via `SKILL.md` frontmatter.
2. **The nested clone (`.agents/medusa-agent-skills/`) is reference-only.** It preserves the original bytes, history, and structure for auditing and re-derivation. Never edit it directly.
3. **Updates flow clone → canonical.** To refresh: pull the clone to a new commit, re-derive provenance files, then regenerate canonical `SKILL.md` files with any Copilot-specific adaptations.
4. **Provenance is immutable.** Files under `provenance/` are byte-exact copies from `git show HEAD:<path>`. They use `.source` suffixes to distinguish them from canonical content.
5. **SOURCE.json is the manifest of record.** Every file in the clone at HEAD is listed with its SHA-256 hash and size. Any update must produce a new SOURCE.json.

## Directory Structure

```text
.agents/skills/medusa/
├── README.md                                    ← this file
├── CATALOG.md                                    ← 18-skill catalog with plugin, version, MCP, adaptation limits
├── medusa-cloud-auth/                            ← SKILL.md (name: medusa-cloud-auth)
├── medusa-cloud-deployments/                     ← SKILL.md (name: medusa-cloud-deployments)
├── medusa-cloud-environments/                    ← SKILL.md (name: medusa-cloud-environments)
├── medusa-cloud-local/                           ← SKILL.md (name: medusa-cloud-local)
├── medusa-cloud-logs/                            ← SKILL.md (name: medusa-cloud-logs)
├── medusa-cloud-organizations/                   ← SKILL.md (name: medusa-cloud-organizations)
├── medusa-cloud-projects/                        ← SKILL.md (name: medusa-cloud-projects)
├── medusa-cloud-using/                           ← SKILL.md (name: medusa-cloud-using)
├── medusa-cloud-variables/                       ← SKILL.md (name: medusa-cloud-variables)
├── medusa-dev-building-admin-dashboard-customizations/ ← SKILL.md
├── medusa-dev-building-storefronts/              ← SKILL.md (name: medusa-dev-building-storefronts)
├── medusa-dev-building-with-medusa/              ← SKILL.md (name: medusa-dev-building-with-medusa)
├── medusa-dev-creating-internal-agents/          ← SKILL.md (name: medusa-dev-creating-internal-agents)
├── medusa-dev-db-generate/                       ← SKILL.md (name: medusa-dev-db-generate)
├── medusa-dev-db-migrate/                        ← SKILL.md (name: medusa-dev-db-migrate)
├── medusa-dev-new-user/                          ← SKILL.md (name: medusa-dev-new-user)
├── medusa-ecommerce-storefront-best-practices/   ← SKILL.md (name: medusa-ecommerce-storefront-best-practices)
├── medusa-learning-medusa/                       ← SKILL.md (name: medusa-learning-medusa)
└── provenance/
    ├── SOURCE.json           ← 107-entry manifest: originalPath, sha256, size
    ├── root/                 ← 4 root-level files from clone HEAD (with .source suffix)
    │   ├── README.source.md
    │   ├── .gitignore.source
    │   ├── skills-stats-to-posthog.source.mjs
    │   └── skills-stats-to-posthog.source.yml
    ├── manifests/            ← 5 plugin/marketplace manifests (with .source.json suffix)
    │   ├── marketplace.source.json
    │   ├── medusa-dev.plugin.source.json
    │   ├── learn-medusa.plugin.source.json
    │   ├── medusa-cloud.plugin.source.json
    │   └── ecommerce-storefront.plugin.source.json
    └── mcps/                 ← 2 MCP configurations (with .source.json suffix)
        ├── medusa-dev.mcp.claude.source.json
        └── learn-medusa.mcp.claude.source.json
```

All 18 skill directories contain canonical `SKILL.md` files with validated frontmatter (`name` matches the parent directory and conforms to `^[a-z0-9-]{1,64}$`).

## Skill Mapping (18 skills)

| # | Canonical directory | `name` in frontmatter | Source plugin | Source path |
|---|---|---|---|---|
| 1 | `medusa-ecommerce-storefront-best-practices` | `medusa-ecommerce-storefront-best-practices` | ecommerce-storefront v1.0.8 | `plugins/ecommerce-storefront/skills/storefront-best-practices/` |
| 2 | `medusa-learning-medusa` | `medusa-learning-medusa` | learn-medusa v1.0.8 | `plugins/learn-medusa/skills/learning-medusa/` |
| 3 | `medusa-cloud-auth` | `medusa-cloud-auth` | medusa-cloud v1.2.0 | `plugins/medusa-cloud/skills/mcloud-auth/` |
| 4 | `medusa-cloud-deployments` | `medusa-cloud-deployments` | medusa-cloud v1.2.0 | `plugins/medusa-cloud/skills/mcloud-deployments/` |
| 5 | `medusa-cloud-environments` | `medusa-cloud-environments` | medusa-cloud v1.2.0 | `plugins/medusa-cloud/skills/mcloud-environments/` |
| 6 | `medusa-cloud-local` | `medusa-cloud-local` | medusa-cloud v1.2.0 | `plugins/medusa-cloud/skills/mcloud-local/` |
| 7 | `medusa-cloud-logs` | `medusa-cloud-logs` | medusa-cloud v1.2.0 | `plugins/medusa-cloud/skills/mcloud-logs/` |
| 8 | `medusa-cloud-organizations` | `medusa-cloud-organizations` | medusa-cloud v1.2.0 | `plugins/medusa-cloud/skills/mcloud-organizations/` |
| 9 | `medusa-cloud-projects` | `medusa-cloud-projects` | medusa-cloud v1.2.0 | `plugins/medusa-cloud/skills/mcloud-projects/` |
| 10 | `medusa-cloud-variables` | `medusa-cloud-variables` | medusa-cloud v1.2.0 | `plugins/medusa-cloud/skills/mcloud-variables/` |
| 11 | `medusa-cloud-using` | `medusa-cloud-using` | medusa-cloud v1.2.0 | `plugins/medusa-cloud/skills/using-medusa-cloud/` |
| 12 | `medusa-dev-building-admin-dashboard-customizations` | `medusa-dev-building-admin-dashboard-customizations` | medusa-dev v1.0.9 | `plugins/medusa-dev/skills/building-admin-dashboard-customizations/` |
| 13 | `medusa-dev-building-storefronts` | `medusa-dev-building-storefronts` | medusa-dev v1.0.9 | `plugins/medusa-dev/skills/building-storefronts/` |
| 14 | `medusa-dev-building-with-medusa` | `medusa-dev-building-with-medusa` | medusa-dev v1.0.9 | `plugins/medusa-dev/skills/building-with-medusa/` |
| 15 | `medusa-dev-creating-internal-agents` | `medusa-dev-creating-internal-agents` | medusa-dev v1.0.9 | `plugins/medusa-dev/skills/creating-internal-agents/` |
| 16 | `medusa-dev-db-generate` | `medusa-dev-db-generate` | medusa-dev v1.0.9 | `plugins/medusa-dev/skills/db-generate/` |
| 17 | `medusa-dev-db-migrate` | `medusa-dev-db-migrate` | medusa-dev v1.0.9 | `plugins/medusa-dev/skills/db-migrate/` |
| 18 | `medusa-dev-new-user` | `medusa-dev-new-user` | medusa-dev v1.0.9 | `plugins/medusa-dev/skills/new-user/` |

> **Note:** Skill #15's original source frontmatter had `name: creating-agents-in-medusa`. The canonical SKILL.md reconciles the `name` field to `medusa-dev-creating-internal-agents`, matching the directory and conforming to `^[a-z0-9-]{1,64}$` for VS Code Copilot discovery.

## MCP Server

The Medusa docs MCP server is configured in `.vscode/mcp.json`:

```json
{
  "servers": {
    "medusa-docs": {
      "type": "http",
      "url": "https://docs.medusajs.com/mcp"
    }
  }
}
```

This provides documentation-backed answers for Medusa API, config, and upgrade questions directly in VS Code Copilot.

## Validation

Run the validator to check canonical SKILL.md files for compliance:

```bash
node scripts/validate-medusa-skills.mjs
```

The validator checks:
- SKILL.md count under `.agents/skills/medusa/` (excluding `provenance/`)
- `name` field matches parent directory and matches `^[a-z0-9-]{1,64}$`
- No duplicate names
- `description` field present in frontmatter
- Relative Markdown links resolve against the SKILL.md directory
- `SOURCE.json` and `.vscode/mcp.json` are valid JSON