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
├── README.md                 ← this file
├── CATALOG.md                ← 18-skill catalog with plugin, version, MCP, adaptation limits
├── provenance/
│   ├── SOURCE.json           ← 107-entry manifest: originalPath, sha256, size
│   ├── root/                 ← 4 root-level files from clone HEAD (with .source suffix)
│   │   ├── README.source.md
│   │   ├── .gitignore.source
│   │   ├── skills-stats-to-posthog.source.mjs
│   │   └── skills-stats-to-posthog.source.yml
│   ├── manifests/            ← 5 plugin/marketplace manifests (with .source.json suffix)
│   │   ├── marketplace.source.json
│   │   ├── medusa-dev.plugin.source.json
│   │   ├── learn-medusa.plugin.source.json
│   │   ├── medusa-cloud.plugin.source.json
│   │   └── ecommerce-storefront.plugin.source.json
│   └── mcps/                 ← 2 MCP configurations (with .source.json suffix)
│       ├── medusa-dev.mcp.claude.source.json
│       └── learn-medusa.mcp.claude.source.json
└── (canonical SKILL.md files — to be added in a subsequent batch)
```

## Skill Mapping (18 skills)

| # | Canonical name | Source plugin | Source path |
|---|---|---|---|
| 1 | `storefront-best-practices` | ecommerce-storefront v1.0.8 | `plugins/ecommerce-storefront/skills/storefront-best-practices/` |
| 2 | `learning-medusa` | learn-medusa v1.0.8 | `plugins/learn-medusa/skills/learning-medusa/` |
| 3 | `mcloud-auth` | medusa-cloud v1.2.0 | `plugins/medusa-cloud/skills/mcloud-auth/` |
| 4 | `mcloud-deployments` | medusa-cloud v1.2.0 | `plugins/medusa-cloud/skills/mcloud-deployments/` |
| 5 | `mcloud-environments` | medusa-cloud v1.2.0 | `plugins/medusa-cloud/skills/mcloud-environments/` |
| 6 | `mcloud-local` | medusa-cloud v1.2.0 | `plugins/medusa-cloud/skills/mcloud-local/` |
| 7 | `mcloud-logs` | medusa-cloud v1.2.0 | `plugins/medusa-cloud/skills/mcloud-logs/` |
| 8 | `mcloud-organizations` | medusa-cloud v1.2.0 | `plugins/medusa-cloud/skills/mcloud-organizations/` |
| 9 | `mcloud-projects` | medusa-cloud v1.2.0 | `plugins/medusa-cloud/skills/mcloud-projects/` |
| 10 | `mcloud-variables` | medusa-cloud v1.2.0 | `plugins/medusa-cloud/skills/mcloud-variables/` |
| 11 | `using-medusa-cloud` | medusa-cloud v1.2.0 | `plugins/medusa-cloud/skills/using-medusa-cloud/` |
| 12 | `building-admin-dashboard-customizations` | medusa-dev v1.0.9 | `plugins/medusa-dev/skills/building-admin-dashboard-customizations/` |
| 13 | `building-storefronts` | medusa-dev v1.0.9 | `plugins/medusa-dev/skills/building-storefronts/` |
| 14 | `building-with-medusa` | medusa-dev v1.0.9 | `plugins/medusa-dev/skills/building-with-medusa/` |
| 15 | `creating-internal-agents` | medusa-dev v1.0.9 | `plugins/medusa-dev/skills/creating-internal-agents/` |
| 16 | `db-generate` | medusa-dev v1.0.9 | `plugins/medusa-dev/skills/db-generate/` |
| 17 | `db-migrate` | medusa-dev v1.0.9 | `plugins/medusa-dev/skills/db-migrate/` |
| 18 | `new-user` | medusa-dev v1.0.9 | `plugins/medusa-dev/skills/new-user/` |

> **Note:** Skill #15 (`creating-internal-agents`) has `name: creating-agents-in-medusa` in its original frontmatter. The canonical directory name is `creating-internal-agents`. The canonical SKILL.md (to be created in the next batch) must reconcile the `name` field to match the directory for VS Code Copilot discovery (`^[a-z0-9-]{1,64}$`).

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