---
name: medusa-cloud-environments
description: Execute mcloud environments commands to list, get, create, delete, redeploy, or trigger builds for Cloud environments. Use when managing environment lifecycle, redeploying after variable changes, or starting new builds from source. Mutating operations (create, delete, redeploy, trigger-build) are irreversible Cloud actions that require explicit human confirmation before execution.
---

# Cloud CLI: Environments Commands

Execute `mcloud environments` commands to manage environment lifecycle and deployments.

## Constraints

- **Production environments cannot be deleted.** Always check `type` via `environments get --json` before attempting delete in automation.
- Use `--yes` for destructive operations (`delete`) in non-interactive contexts.
- `redeploy` vs `trigger-build` are not interchangeable — choose the right one based on where the fix is.

## Commands

### environments list

List all environments in a project.

```bash
mcloud environments list --organization <org-id> --project <project-id-or-handle> --json
```

**Options:**
- `-o/--organization <id>` — Organization ID (falls back to active context)
- `-p/--project <id-or-handle>` — Project ID or handle (falls back to active context)
- `--json` — Output as JSON

### environments get

Retrieve a single environment by its ID or handle.

```bash
mcloud environments get <environment-id-or-handle> --organization <org-id> --project <project-id-or-handle> --json
```

**Arguments:**
- `environment` — Environment ID or handle (required)

**Options:**
- `-o/--organization <id>`, `-p/--project <id-or-handle>`, `--json`

### environments create

Create a new long-lived environment.

```bash
mcloud environments create \
  --organization <org-id> \
  --project <project-id-or-handle> \
  --name "Staging" \
  --branch develop \
  --json
```

**Options:**
- `-o/--organization <id>`, `-p/--project <id-or-handle>`
- `-n/--name <name>` — Environment name (required)
- `-b/--branch <branch>` — Git branch to track (required)
- `--custom-subdomain <subdomain>` — Optional custom subdomain
- `--json` — Output as JSON

### environments delete

Delete an environment. **Cannot delete production environments.**

```bash
mcloud environments delete <environment-id-or-handle> \
  --organization <org-id> \
  --project <project-id-or-handle> \
  --yes
```

**Arguments:**
- `environment` — Environment ID or handle (required)

**Options:**
- `-o/--organization <id>`, `-p/--project <id-or-handle>`
- `-y/--yes` — Skip confirmation prompt (required in non-interactive mode)
- `--json` — Output as JSON

### environments redeploy

Re-run an existing build for the active deployment. Use when the fix is environment-side (variable change, infra issue) — does NOT start a new build.

```bash
mcloud environments redeploy <environment-id-or-handle> \
  --organization <org-id> \
  --project <project-id-or-handle> \
  --json
```

**Arguments:**
- `environment` — Environment ID or handle (required)

**Options:**
- `-o/--organization <id>`, `-p/--project <id-or-handle>`, `--json`

> Requires the environment to have an active deployment. If it doesn't, use `trigger-build` first.

### environments trigger-build

Start a new build from the tracked branch. Use when the fix is committed code — creates a new deployment.

```bash
mcloud environments trigger-build <environment-id-or-handle> \
  --organization <org-id> \
  --project <project-id-or-handle> \
  --json
```

**Arguments:**
- `environment` — Environment ID or handle (required)

**Options:**
- `-o/--organization <id>`, `-p/--project <id-or-handle>`, `--json`

## Redeploy vs Trigger-Build Decision

| Command | When to use |
|---------|-------------|
| `redeploy` | Fix is environment-side (variable change, infra config) — reruns existing build |
| `trigger-build` | Fix is in source code on the tracked branch — starts a new build |

## Examples

```bash
# List all environments
mcloud environments list --json

# Get environment details and check type before deleting
mcloud environments get staging --json | jq '{id, name, type, status}'

# Create a new environment tracking the develop branch
mcloud environments create --name "Staging" --branch develop --json

# Delete a non-production environment
mcloud environments delete staging --yes

# Redeploy after a variable change
mcloud environments redeploy production --json

# Trigger a fresh build from source
mcloud environments trigger-build production --json

# Find environment handles by name
mcloud environments list --json \
  | jq -r '.[] | select(.name == "Production") | .handle'

# Verify new build started
mcloud deployments list --environment production --limit 5 --json \
  | jq '.[] | {id, backend_status, updated_at}'
```

## Copilot Adaptation

This skill was migrated from the Claude plugin `medusa-cloud` (origin: `medusajs/medusa-agent-skills`, commit `c584f79`) to the VS Code Copilot skill format. The canonical name is `medusa-cloud-environments`.

**Key differences from the Claude original:**

- **No `/plugin` commands:** Claude-specific commands like `/plugin marketplace add` and `/plugin install` do not apply. In VS Code Copilot, skills are discovered automatically from `.agents/skills/medusa/` when the `SKILL.md` file has valid YAML frontmatter with `name` and `description` fields.
- **No `allowed-tools` restriction:** The Claude original frontmatter included `allowed-tools: Bash(mcloud environments*), Bash(mcloud use*), Bash(jq*)`. Copilot does not support this field. Copilot uses normal terminal approval workflows — the user is prompted before terminal commands execute. The intended scope is documented here: this skill should only run `mcloud environments` commands (`list`, `get`, `create`, `delete`, `redeploy`, `trigger-build`), `mcloud use` for context switching, and `jq` for output parsing.
- **Read before write, confirm before delete:** Always run `environments list --json` or `environments get --json` to inspect the current state before running any mutating command (`create`, `delete`, `redeploy`, `trigger-build`). **Exclusions are irreversible** — `environments delete` permanently destroys the environment and its data. Never run `delete` without first verifying the environment `type` is not `production` via `environments get --json`. Always ask the user for explicit confirmation before executing `delete`, `create`, `redeploy`, or `trigger-build`.
- **Cloud operations are irreversible and require explicit human confirmation:** Commands such as `environments create`, `environments delete`, `environments redeploy`, and `environments trigger-build` are **state-changing operations** that modify live Cloud infrastructure. These must be explicitly confirmed by the user before execution. Never run any mutating command automatically — always ask the user first. Read-only commands (`list`, `get`) are safe to run without confirmation.
- **Canonical name:** The `name` field is `medusa-cloud-environments` (matching the directory name), not `mcloud-environments` from the original. When referencing this skill, use the canonical name.

The original unmodified file (including the `allowed-tools` frontmatter) is preserved at [original/SKILL.source.md](original/SKILL.source.md) for provenance and auditing.