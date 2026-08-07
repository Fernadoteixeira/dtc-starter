---
name: medusa-cloud-projects
description: Execute mcloud projects commands to list, get, or delete Cloud projects. Use when discovering projects, resolving project handles by name, or retrieving project details including linked environments. Read-only operations (list, get) are safe to run without confirmation; projects delete is irreversible and requires explicit human confirmation before execution.
---

# Cloud CLI: Projects Commands

Execute `mcloud projects` commands to manage Cloud projects.

## Constraints

- `projects delete` is **irreversible** — removes all associated environments, deployments, and resources. Always confirm the project ID/handle before deleting.
- Use `--yes` with `delete` in non-interactive contexts (scripts, pipelines, agents).

## Commands

### projects list

List projects in an organization. If `--organization` is omitted (and no active context org is set), lists projects across all organizations you have access to, grouped by organization.

```bash
mcloud projects list --organization <org-id> --json
```

**Options:**
- `-o/--organization <id>` — Organization ID (falls back to active context; if unset, lists across all your organizations)
- `--json` — Output as JSON

### projects get

Retrieve a single project by its ID or handle.

```bash
mcloud projects get <project-id-or-handle> --organization <org-id> --json
```

**Arguments:**
- `project` — Project ID or handle (required)

**Options:**
- `-o/--organization <id>` — Organization ID (falls back to active context; **required**)
- `--json` — Output as JSON

### projects delete

Delete a project by its ID or handle. **Irreversible.**

```bash
mcloud projects delete <project-id-or-handle> \
  --organization <org-id> \
  --yes
```

**Arguments:**
- `project` — Project ID or handle (required)

**Options:**
- `-o/--organization <id>` — Organization ID (falls back to active context; **required**)
- `-y/--yes` — Skip confirmation prompt (required in non-interactive mode)
- `--json` — Output as JSON

## Project Fields (JSON)

| Field | Description |
|-------|-------------|
| `id` | Project ID |
| `handle` | URL-safe project handle (used in most commands) |
| `name` | Display name |
| `status` | `ready` when healthy |
| `region` | Deployment region (e.g. `us-east-1`) |
| `repository` | Linked GitHub repository (`owner/repo`) |
| `root_path` | Root path within the repository |
| `organization` | Owning organization (`id`, `name`, `created_at`) |
| `environments` | Array of associated environments (each may include `storefront_environments`) |

## Examples

```bash
# List all projects in an organization
mcloud projects list --organization org_123 --json

# Set context to a project by name
PROJECT_HANDLE=$(
  mcloud projects list --organization org_123 --json \
    | jq -r '.[] | select(.name == "My Store") | .handle'
)
mcloud use --project "$PROJECT_HANDLE"

# Get project details including environments
mcloud projects get my-store --organization org_123 --json

# List all environment handles for a project
mcloud projects get my-store --organization org_123 --json \
  | jq -r '.environments[].handle'

# Find project handle by name
mcloud projects list --organization org_123 --json \
  | jq -r '.[] | select(.name == "My Store") | .handle'

# Delete a project (irreversible — confirm before running)
mcloud projects delete old-project --organization org_123 --yes
```

## Copilot Adaptation

This skill was migrated from the Claude plugin `medusa-cloud` (origin: `medusajs/medusa-agent-skills`, commit `c584f79`) to the VS Code Copilot skill format. The canonical name is `medusa-cloud-projects`.

**Key differences from the Claude original:**

- **No `/plugin` commands:** Claude-specific commands like `/plugin marketplace add` and `/plugin install` do not apply. In VS Code Copilot, skills are discovered automatically from `.agents/skills/medusa/` when the `SKILL.md` file has valid YAML frontmatter with `name` and `description` fields.
- **No `allowed-tools` restriction:** The Claude original frontmatter included `allowed-tools: Bash(mcloud projects*), Bash(mcloud use*), Bash(jq*)`. Copilot does not support this field. Copilot uses normal terminal approval workflows — the user is prompted before terminal commands execute. The intended scope is documented here: this skill should only run `mcloud projects` commands, `mcloud use` for context switching, and `jq` for output parsing.
- **Read before write, confirm before delete:** Always run `projects list --json` or `projects get --json` to inspect the current state before running `projects delete`. **Project deletion is irreversible** — `projects delete` permanently removes all associated environments, deployments, and resources. Never run `delete` without first verifying the project ID/handle via `projects get --json`. Always ask the user for explicit confirmation before executing `delete`.
- **Cloud operations are irreversible and require explicit human confirmation:** The `projects delete` command is a **state-changing operation** that destroys live Cloud infrastructure. It must be explicitly confirmed by the user before execution. Never run `delete` automatically — always ask the user first, including the exact project ID/handle and organization. Read-only commands (`list`, `get`) are safe to run without confirmation. Additionally, any downstream `mcloud use --project` context mutation should be confirmed by the user.
- **Canonical name:** The `name` field is `medusa-cloud-projects` (matching the directory name), not `mcloud-projects` from the original. When referencing this skill, use the canonical name.

The original unmodified file (including the `allowed-tools` frontmatter) is preserved at [original/SKILL.source.md](original/SKILL.source.md) for provenance and auditing.