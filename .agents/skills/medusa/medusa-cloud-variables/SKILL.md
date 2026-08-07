---
name: medusa-cloud-variables
description: Execute mcloud variables commands to list, get, set, and delete environment variables for a Cloud environment. Use when inspecting, reading, creating, updating, deleting, or exporting environment variables. Read-only operations (list, get) are safe to run without confirmation; set and delete are irreversible mutations requiring explicit human confirmation. Never pass --reveal unless the user explicitly requests secret values.
---

# Cloud CLI: Variables Commands

Execute `mcloud variables` commands to inspect and manage environment variables for Cloud environments.

## Constraints

- **Never pass `--reveal` unless the user explicitly asks.** Secret values appear in terminal scrollback, log aggregators, and process listings.
- **Variable changes need a deploy to apply.** `set`/`delete` don't rebuild or redeploy. Run `mcloud environments redeploy <env>` for a **runtime** variable, or `mcloud environments trigger-build <env>` for a **build** variable (a redeploy reuses the existing image and won't pick up build-variable changes).
- **System variables can't be deleted**, and `delete` requires `--yes` in non-interactive mode.
- Looking up or creating a variable by key requires `--project` and `--environment` (or the equivalent in active context). Referencing by ID (`var_...`) works without project/environment context.
- `set` and `delete` require mcloud CLI v0.1.10+.

## Commands

### variables list

List all environment variables for a Cloud environment.

```bash
mcloud variables list \
  --organization <org-id> \
  --project <project-id-or-handle> \
  --environment <environment-handle> \
  --json
```

**Options:**
- `-o/--organization <id>` — Organization ID (falls back to active context)
- `-p/--project <id-or-handle>` — Project ID or handle (falls back to active context)
- `-e/--environment <handle>` — Environment handle (falls back to active context)
- `-t/--type <backend|storefront>` — Which variable set to list (default: `backend`)
- `--scope <build|runtime>` — Filter by scope; repeatable (default: both scopes)
- `--include-system` — Include system variables Medusa auto-injects (default: `false`)
- `--reveal` — Print secret values in plaintext instead of masking (**use only when explicitly asked**)
- `--dotenv` — Output `.env`-formatted `KEY=VALUE` lines instead of a table
- `--json` — Output as JSON

### variables get

Retrieve a single variable by its ID (`var_...`) or key.

```bash
# By key (requires project + environment context)
mcloud variables get ADMIN_CORS \
  --organization <org-id> \
  --project <project-id-or-handle> \
  --environment <environment-handle> \
  --json

# By ID (works without project/environment context)
mcloud variables get var_01XYZ --json
```

**Arguments:**
- `variable` — Variable ID (`var_...`) or key (required)

**Options:**
- `-o/--organization <id>`, `-p/--project <id-or-handle>`, `-e/--environment <handle>`
- `-t/--type <backend|storefront>` — Which variable set to read (default: `backend`)
- `--reveal` — Print secret value in plaintext (**use only when explicitly asked**)
- `--json` — Output as JSON

### variables set

Create or update one or more variables. The CLI updates when you reference an existing key or a `var_...` ID, and creates otherwise.

```bash
# Single variable
mcloud variables set API_KEY pk_123 \
  --organization <org-id> \
  --project <project-id-or-handle> \
  --environment <environment-handle>

# Multiple at once
mcloud variables set -v API_KEY=pk_123 -v CLIENT_ID=my_app

# From a .env file
mcloud variables set --env-file .env
```

**Arguments:**
- `variable` — Variable ID (`var_...`) or key to set (omit when using `--var`/`--env-file`)
- `value` — Value to set (required when a `variable` argument is passed)

**Options:**
- `-o/--organization <id>`, `-p/--project <id-or-handle>`, `-e/--environment <handle>`
- `-t/--type <backend|storefront>` — Which variable set to write (default: `backend`)
- `-v/--var <KEY=VALUE|ID=VALUE>` — A variable to set; repeatable
- `--env-file <path>` — Set all variables from a `.env` file
- `--secret`, `--no-secret` — Mark as secret (default: `false` for new variables)
- `--build`, `--no-build` — Available at build time (default: `false` for new variables)
- `--runtime`, `--no-runtime` — Available at runtime (default: `true` for new variables)
- `--json` — Output as JSON

> Redeploy (runtime) or trigger-build (build) afterward — see Constraints.

### variables delete

Delete a variable by its ID (`var_...`) or key. **Irreversible; system variables can't be deleted.**

```bash
mcloud variables delete API_KEY \
  --organization <org-id> \
  --project <project-id-or-handle> \
  --environment <environment-handle> \
  --yes
```

**Arguments:**
- `variable` — Variable ID (`var_...`) or key to delete (required)

**Options:**
- `-o/--organization <id>`, `-p/--project <id-or-handle>`, `-e/--environment <handle>`
- `-t/--type <backend|storefront>` — Which variable set to delete from (default: `backend`)
- `-y/--yes` — Skip confirmation prompt (required in non-interactive mode)
- `--json` — Output as JSON

## Variable Fields (JSON)

| Field | Description |
|-------|-------------|
| `id` | Variable ID (`var_...`) |
| `key` | Variable name (e.g. `ADMIN_CORS`) |
| `value` | Variable value (masked if `is_secret` and `--reveal` not passed) |
| `is_secret` | Whether the variable is treated as a secret |
| `is_build` | Available at build time |
| `is_runtime` | Available at runtime |
| `environment_id` | The environment ID this variable belongs to |
| `source` | `user` for user-set variables, `system` for auto-injected ones |

## Examples

```bash
# List all variables for the active environment
mcloud variables list --json

# List only runtime variables, including system ones
mcloud variables list --scope runtime --include-system --json

# List storefront variables
mcloud variables list --type storefront --json

# Get a variable by key (with active context)
mcloud variables get DATABASE_URL --json

# Get a variable by ID (no env context needed)
mcloud variables get var_01XYZ --json

# Set a single variable, then redeploy to apply (runtime)
mcloud variables set REDIS_URL redis://cache:6379
mcloud environments redeploy production

# Set a secret build-only variable, then trigger a build to apply
mcloud variables set STRIPE_SECRET_KEY sk_live_123 --secret --build --no-runtime
mcloud environments trigger-build production

# Set multiple variables from a .env file
mcloud variables set --env-file .env

# Delete a variable (irreversible — confirm before running)
mcloud variables delete OLD_FLAG --yes

# Only reveal secrets when user explicitly asks
mcloud variables get STRIPE_SECRET_KEY --reveal --json | jq -r '.value'

# Export all variables to a .env file (user must explicitly request --reveal)
mcloud variables list --reveal --dotenv > .env

# Check if a specific variable exists
mcloud variables list --json | jq '.[] | select(.key == "REDIS_URL")'
```

## Copilot Adaptation

This skill was migrated from the Claude plugin `medusa-cloud` (origin: `medusajs/medusa-agent-skills`, commit `c584f79`) to the VS Code Copilot skill format. The canonical name is `medusa-cloud-variables`.

**Key differences from the Claude original:**

- **No `/plugin` commands:** Claude-specific commands like `/plugin marketplace add` and `/plugin install` do not apply. In VS Code Copilot, skills are discovered automatically from `.agents/skills/medusa/` when the `SKILL.md` file has valid YAML frontmatter with `name` and `description` fields.
- **No `allowed-tools` restriction:** The Claude original frontmatter included `allowed-tools: Bash(mcloud variables*), Bash(mcloud environments*), Bash(jq*)`. Copilot does not support this field. Copilot uses normal terminal approval workflows — the user is prompted before terminal commands execute. The intended scope is documented here: this skill should only run `mcloud variables` commands, `mcloud environments` for post-change deploys, and `jq` for output parsing.
- **Read before write, confirm before delete:** Always run `variables list --json` or `variables get --json` to inspect the current state before running `variables set` or `variables delete`. **Variable deletion is irreversible** — `variables delete` permanently removes the variable and cannot be undone. Never run `delete` without first verifying the variable key/ID. Always ask the user for explicit confirmation before executing `delete` or `set`.
- **Cloud operations are irreversible and require explicit human confirmation:** The `variables set` and `variables delete` commands are **state-changing operations** that modify live Cloud environment configuration. They must be explicitly confirmed by the user before execution. Never run `set` or `delete` automatically — always ask the user first, including the exact variable key, value (for `set`), and target environment. Read-only commands (`list`, `get`) are safe to run without confirmation. Additionally, any downstream `mcloud environments redeploy` or `mcloud environments trigger-build` needed to apply variable changes also requires explicit human confirmation per the `medusa-cloud-environments` skill.
- **Never pass `--reveal` unless the user explicitly asks:** Secret values exposed with `--reveal` appear in terminal scrollback, log aggregators, and process listings — creating a security risk. Never add `--reveal` to any command unless the user has explicitly requested to see secret values in the current conversation. If the user asks to "check" or "list" variables, use masked output (the default). Only use `--reveal` when the user's request unambiguously asks for the actual secret value (e.g. "show me the value of `STRIPE_SECRET_KEY`").
- **Canonical name:** The `name` field is `medusa-cloud-variables` (matching the directory name), not `mcloud-variables` from the original. When referencing this skill, use the canonical name.

The original unmodified file (including the `allowed-tools` frontmatter) is preserved at [original/SKILL.source.md](original/SKILL.source.md) for provenance and auditing.