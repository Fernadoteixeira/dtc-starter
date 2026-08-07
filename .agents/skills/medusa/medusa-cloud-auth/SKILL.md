---
name: medusa-cloud-auth
description: Execute mcloud authentication and context commands: login, logout, whoami, use, version, and signup. Use when setting up the CLI, switching accounts, verifying auth state, setting the active org/project/environment context, or checking the CLI version. Auth and context commands (login, logout, use, signup) modify local credentials and active scope — require explicit human confirmation before execution.
---

# Cloud CLI: Auth and Context Commands

Execute authentication and context commands for the Medusa Cloud CLI.

## Constraints

- `mcloud login`, `mcloud signup`, and `mcloud use` (without flags) require a **TTY** — they fail in CI, Docker, or piped input. Use `MCLOUD_TOKEN` or pass flags explicitly instead.
- When `MCLOUD_TOKEN` is set, file-based credentials are ignored and `mcloud login` is rejected. Unset it to switch accounts.
- Always verify auth before any state-changing command: `mcloud whoami --json | jq -e '.auth.kind != "none"'`

## Commands

### whoami

Show authenticated user, auth method, and active context (organization, project, environment).

```bash
mcloud whoami --json
```

**Options:**
- `--json` — Output as JSON

**Use to verify auth and scope:**
```bash
mcloud whoami --json | jq -e '.auth.kind != "none" and .organization.id != null'
```
Exit code `0` = authenticated and scoped. Non-zero = stop and prompt the user.

### use

Set the active organization, project, and/or environment so subsequent commands skip those flags.

```bash
mcloud use \
  --organization <org-id> \
  --project <project-id-or-handle> \
  --environment <environment-handle>
```

**CRITICAL:** `mcloud use` without flags is interactive and fails in CI/Docker/piped input. Always pass flags explicitly.

**Options:**
- `-o/--organization <id>` — Set active organization
- `-p/--project <id-or-handle>` — Set active project
- `-e/--environment <handle>` — Set active environment
- `--clear` — Clear all active context
- `--json` — Output as JSON

**Clear context:**
```bash
mcloud use --clear
```

### version

Print CLI version and platform metadata.

```bash
mcloud version --json
```

**Options:**
- `--json` — Output as JSON

### login

Authenticate with Medusa Cloud. Opens a browser to complete auth.

> **TTY required.** Cannot be run in CI, Docker, or non-interactive environments. Use `MCLOUD_TOKEN` instead for non-interactive auth.

```bash
mcloud login
```

**Non-interactive alternative:**
```bash
export MCLOUD_TOKEN=<access-key>
```

**Options:**
- `-t/--token <token>` — Authenticate using an access key without browser (non-interactive)
- `--json` — Output as JSON

### logout

Remove stored credentials.

```bash
mcloud logout --json
```

**Options:**
- `--json` — Output as JSON

### signup

Create a new Medusa Cloud account. Opens a browser.

> **TTY required.** Cannot be run in non-interactive environments.

```bash
mcloud signup
```

## Auth Methods

| Method | When to use |
|--------|-------------|
| `mcloud login` (browser) | Interactive setup; requires TTY |
| `mcloud login --token <key>` | Non-interactive login with access key |
| `MCLOUD_TOKEN=<key>` env var | CI/CD, Docker, scripted environments |

## Examples

```bash
# Check authentication and active context
mcloud whoami --json

# Verify auth before running commands
mcloud whoami --json | jq -e '.auth.kind != "none" and .organization.id != null'

# Set full context (org + project + environment)
mcloud use \
  --organization org_123 \
  --project my-store \
  --environment production

# Set context by resolving names
ORGANIZATION_ID=$(mcloud organizations list --json | jq -r '.[] | select(.name == "My Org") | .id')
PROJECT_HANDLE=$(mcloud projects list --organization "$ORGANIZATION_ID" --json | jq -r '.[] | select(.name == "My Store") | .handle')
ENVIRONMENT_HANDLE=$(mcloud environments list --organization "$ORGANIZATION_ID" --project "$PROJECT_HANDLE" --json | jq -r '.[] | select(.name == "Production") | .handle')

mcloud use \
  --organization "$ORGANIZATION_ID" \
  --project "$PROJECT_HANDLE" \
  --environment "$ENVIRONMENT_HANDLE"

# Clear context
mcloud use --clear

# Check CLI version
mcloud version --json

# Non-interactive login with token
mcloud login --token <access-key>

# Logout
mcloud logout
```

## Copilot Adaptation

This skill was migrated from the Claude plugin `medusa-cloud` (origin: `medusajs/medusa-agent-skills`, commit `c584f79`) to the VS Code Copilot skill format. The canonical name is `medusa-cloud-auth`.

**Key differences from the Claude original:**

- **No `/plugin` commands:** Claude-specific commands like `/plugin marketplace add` and `/plugin install` do not apply. In VS Code Copilot, skills are discovered automatically from `.agents/skills/medusa/` when the `SKILL.md` file has valid YAML frontmatter with `name` and `description` fields.
- **No `allowed-tools` restriction:** The Claude original frontmatter included `allowed-tools: Bash(mcloud whoami*), Bash(mcloud use*), Bash(mcloud version*), Bash(mcloud logout*), Bash(jq*)`. Copilot does not support this field. Copilot uses normal terminal approval workflows — the user is prompted before terminal commands execute. The intended scope is documented here: this skill should only run `mcloud` auth/context commands (`whoami`, `use`, `version`, `login`, `logout`, `signup`) and `jq` for output parsing.
- **Auth and context operations may be irreversible and require explicit human confirmation:** Commands such as `mcloud login`, `mcloud logout`, `mcloud use` (setting or clearing context), and `mcloud signup` modify local credentials and active scope. These are **state-changing operations** that must be explicitly confirmed by the user before execution. Never run `login`, `logout`, `use`, or `signup` automatically — always ask the user first. Read-only commands (`whoami`, `version`) are safe to run without confirmation.
- **Canonical name:** The `name` field is `medusa-cloud-auth` (matching the directory name), not `mcloud-auth` from the original. When referencing this skill, use the canonical name.

The original unmodified file (including the `allowed-tools` frontmatter) is preserved at [original/SKILL.source.md](original/SKILL.source.md) for provenance and auditing.