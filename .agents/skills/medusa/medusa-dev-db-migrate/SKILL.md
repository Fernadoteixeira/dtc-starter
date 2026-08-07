---
name: medusa-dev-db-migrate
description: Run database migrations in Medusa. Executes `pnpm exec medusa db:migrate` to apply pending migrations and reports results including number of migrations applied, errors, and success confirmation. Destructive operation — requires explicit user confirmation before running.
---

# Run Database Migrations

Execute the Medusa database migration command to apply pending migrations.

Use the Bash tool to execute: `npx medusa db:migrate`

Report the migration results to the user, including:

- Number of migrations applied
- Any errors that occurred
- Success confirmation

## Copilot Adaptation

This skill was migrated from the Claude plugin `medusa-dev` (origin: `medusajs/medusa-agent-skills`, commit `c584f79`) to the VS Code Copilot skill format. The canonical name is `medusa-dev-db-migrate`.

**Key differences from the Claude original:**

- **No `/plugin` commands:** Claude-specific commands like `/plugin marketplace add` and `/plugin install` do not apply. In VS Code Copilot, skills are discovered automatically from `.agents/skills/medusa/` when the `SKILL.md` file has valid YAML frontmatter with `name` and `description` fields.
- **No `allowed-tools` restriction:** The Claude original frontmatter included `allowed-tools: Bash(npx medusa db:migrate:*)`. Copilot does not support this field. Copilot uses normal terminal approval workflows — the user is prompted before terminal commands execute. The intended scope is documented here: this skill should only run `medusa db:migrate` commands.
- **Destructive operations require human confirmation:** `db:migrate` modifies the database schema by applying pending migrations. This is a **destructive operation** that must be explicitly confirmed by the user before execution. Never run `db:migrate` automatically — always ask the user first. Per the AGENTS.md off-limits section: "Don't run destructive DB commands (drops, `db:migrate --help`-style flags that reset state) against the user's database without explicit confirmation."
- **Package manager convention:** This workspace uses **pnpm** (pinned at `pnpm@10.11.1`). When running the migration command, use `pnpm exec medusa db:migrate` instead of `npx medusa db:migrate`. Run from the `apps/backend` directory or the repo root depending on context.
- **Canonical name:** The `name` field is `medusa-dev-db-migrate` (matching the directory name), not `db-migrate` from the original. When referencing this skill, use the canonical name.

The original unmodified file is preserved at [original/SKILL.source.md](original/SKILL.source.md) for provenance and auditing.