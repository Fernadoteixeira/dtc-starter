---
name: medusa-dev-db-generate
description: Generate database migrations for a Medusa module. The user provides the module name as an argument (e.g., brand, product, custom-module). Runs `pnpm exec medusa db:generate <module-name>` and reports results including migration file location, errors, and next steps.
argument-hint: <module-name>
---

# Generate Database Migrations

Generate database migrations for the specified Medusa module.

The user will provide the module name as an argument (e.g., `brand`, `product`, `custom-module`).

For example: `/medusa-dev:db-generate brand`

Use the Bash tool to execute the command `npx medusa db:generate <module-name>`, replacing `<module-name>` with the provided argument.

Report the results to the user, including:

- The module name for which migrations were generated
- Migration file name or location
- Any errors or warnings
- Next steps (running `npx medusa db:migrate` to apply the migrations)

## Copilot Adaptation

This skill was migrated from the Claude plugin `medusa-dev` (origin: `medusajs/medusa-agent-skills`, commit `c584f79`) to the VS Code Copilot skill format. The canonical name is `medusa-dev-db-generate`.

**Key differences from the Claude original:**

- **No `/plugin` commands:** Claude-specific commands like `/plugin marketplace add` and `/plugin install` do not apply. In VS Code Copilot, skills are discovered automatically from `.agents/skills/medusa/` when the `SKILL.md` file has valid YAML frontmatter with `name` and `description` fields.
- **No `allowed-tools` restriction:** The Claude original frontmatter included `allowed-tools: Bash(npx medusa db:generate:*)`. Copilot does not support this field. Copilot uses normal terminal approval workflows — the user is prompted before terminal commands execute. The intended scope is documented here: this skill should only run `medusa db:generate` commands.
- **Destructive operations require human confirmation:** `db:generate` creates migration files but does not modify the database schema directly. However, it is still a workspace-modifying operation. Always confirm with the user before executing.
- **Package manager convention:** This workspace uses **pnpm** (pinned at `pnpm@10.11.1`). When running the migration generation command, use `pnpm exec medusa db:generate <module-name>` instead of `npx medusa db:generate <module-name>`. Run from the `apps/backend` directory or the repo root depending on context. The `argument-hint` field is preserved for compatibility.
- **Canonical name:** The `name` field is `medusa-dev-db-generate` (matching the directory name), not `db-generate` from the original. When referencing this skill, use the canonical name.

The original unmodified file is preserved at [original/SKILL.source.md](original/SKILL.source.md) for provenance and auditing.