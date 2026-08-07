---
name: medusa-cloud-organizations
description: Execute mcloud organizations commands to list or get Cloud organizations. Use when discovering organizations, resolving organization IDs by name, or retrieving organization details including members and subscription. Read-only operations — safe to run without confirmation, but any downstream context mutation (mcloud use) requires explicit human confirmation.
---

# Cloud CLI: Organizations Commands

Execute `mcloud organizations` commands to list and retrieve Cloud organizations.

## Constraints

- `organizations list` requires **personal auth** (browser login or personal access key). Organization access keys return 401 on this command.
- When authenticated with `MCLOUD_TOKEN` using an org access key, use `mcloud whoami --json` to get the organization ID instead.

## Commands

### organizations list

List all organizations your account has access to.

```bash
mcloud organizations list --json
```

**Options:**
- `--json` — Output as JSON

### organizations get

Retrieve a single organization by ID. Returns metadata, subscription details, and members.

```bash
mcloud organizations get <organization-id> --json
```

**Arguments:**
- `organization` — Organization ID (required)

**Options:**
- `-o/--organization <id>` — Override the organization in active context (must match the argument)
- `--json` — Output as JSON

## Organization Fields (JSON)

| Field | Description |
|-------|-------------|
| `id` | Organization ID |
| `name` | Organization display name |
| `billing_email` | Billing contact email |
| `status` | `active` or otherwise |
| `members` | Array of member objects with `id`, `role`, `user.email` |
| `subscription` | Current plan, period, and `is_active` flag |
| `account_holder` | Billing account holder details |

## Examples

```bash
# List all organizations
mcloud organizations list --json

# Set context to first organization
ORGANIZATION_ID=$(
  mcloud organizations list --json \
    | jq -r '.[0].id'
)
mcloud use --organization "$ORGANIZATION_ID"

# Find organization ID by name
ORGANIZATION_ID=$(
  mcloud organizations list --json \
    | jq -r '.[] | select(.name == "My Organization") | .id'
)

# Get organization details (subscription, members)
mcloud organizations get org_123 --json

# List member emails
mcloud organizations get org_123 --json \
  | jq -r '.members[].user.email'

# Check subscription plan
mcloud organizations get org_123 --json \
  | jq '{plan: .subscription.plan.name, status: .subscription.is_active}'
```

## Copilot Adaptation

This skill was migrated from the Claude plugin `medusa-cloud` (origin: `medusajs/medusa-agent-skills`, commit `c584f79`) to the VS Code Copilot skill format. The canonical name is `medusa-cloud-organizations`.

**Key differences from the Claude original:**

- **No `/plugin` commands:** Claude-specific commands like `/plugin marketplace add` and `/plugin install` do not apply. In VS Code Copilot, skills are discovered automatically from `.agents/skills/medusa/` when the `SKILL.md` file has valid YAML frontmatter with `name` and `description` fields.
- **No `allowed-tools` restriction:** The Claude original frontmatter included `allowed-tools: Bash(mcloud organizations*), Bash(mcloud use*), Bash(jq*)`. Copilot does not support this field. Copilot uses normal terminal approval workflows — the user is prompted before terminal commands execute. The intended scope is documented here: this skill should only run `mcloud organizations` commands, `mcloud use` for context setting, and `jq` for output parsing.
- **Cloud operations and context mutations may be irreversible and require explicit human confirmation:** The `organizations list` and `organizations get` commands are **read-only** and safe to run without confirmation. However, any downstream `mcloud use` command that sets the active organization context is a **state-changing operation** that must be explicitly confirmed by the user before execution. Never run `mcloud use` automatically — always ask the user first. If this skill is used as a prerequisite for other `medusa-cloud-*` skills that perform mutations (create, delete, deploy), those mutations also require explicit human confirmation per their respective skill adaptation notes.
- **Canonical name:** The `name` field is `medusa-cloud-organizations` (matching the directory name), not `mcloud-organizations` from the original. When referencing this skill, use the canonical name.

The original unmodified file (including the `allowed-tools` frontmatter) is preserved at [original/SKILL.source.md](original/SKILL.source.md) for provenance and auditing.