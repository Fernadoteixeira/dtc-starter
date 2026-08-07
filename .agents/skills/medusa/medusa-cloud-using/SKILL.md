---
name: medusa-cloud-using
description: Manages Medusa Cloud resources through the Cloud CLI (mcloud). Use when deploying, debugging deployments, managing environments, environment variables, or any Medusa Cloud operation. CRITICAL for mcloud commands, deployment failures, build logs, Cloud setup, and CI/CD workflows. Cloud operations may be irreversible — requires explicit human confirmation before any mutation (create, delete, deploy, redeploy, trigger-build).
---

# Managing Medusa Cloud Resources

Operational guide for AI agents managing Medusa Cloud infrastructure through the `mcloud` CLI. Covers setup, deployments, debugging, environments, and variables.

## Constraints

- **Always pass `--json`** when parsing CLI output. Plaintext output is for humans and may change without warning.
- **Confirm context before mutating.** Run `mcloud whoami --json` before any state change.
- **Read before you write.** Run a `get` or `list` before any `delete`, `redeploy`, or `trigger-build`.
- **Use `--yes` for destructive operations.** `delete` commands (including `variables delete`) require `--yes` in non-interactive mode.
- **Variable changes need a deploy to apply.** `variables set`/`delete` don't rebuild or redeploy: `redeploy` for runtime changes, `trigger-build` for build changes.
- **Production environments cannot be deleted.** `mcloud environments delete` errors on production by design.
- **Never pass `--reveal` unless the user explicitly asks.** Secret values appear in terminal scrollback and logs.
- **`--json` and `--follow` are incompatible.** Use bounded time windows (`--from`/`--to`) with `--json` for programmatic log ingestion.

## CRITICAL: Load Reference Files When Needed

**Load these references based on what you're doing:**

- **Setting up the CLI?** → MUST load [reference/setup.md](reference/setup.md) first
- **Debugging a failed deployment?** → MUST load [reference/debugging-deployments.md](reference/debugging-deployments.md) first
- **Managing environments or variables?** → MUST load [reference/environments-and-variables.md](reference/environments-and-variables.md) first

**Minimum requirement:** Load at least one reference file before executing multi-step workflows.

## Quick Reference

### Authentication Check

Always verify auth and scope before mutating state:

```bash
mcloud whoami --json | jq -e '.auth.kind != "none" and .organization.id != null'
```

Exit code `0` = authenticated and scoped. Non-zero = stop and ask the user.

### Set Context Once

```bash
mcloud use \
  --organization org_123 \
  --project proj_123 \
  --environment production
```

> **CRITICAL:** `mcloud use` without flags is interactive and fails in CI/Docker/piped input. Always pass flags.

### Deployment Status Routing

Route on `backend_status` (or `storefront_status`):

| Status | Meaning | Logs to check |
|--------|---------|---------------|
| `build-failed` | Build step failed | `mcloud deployments build-logs <id>` |
| `deployment-failed` | Runtime crashed after build | `mcloud logs --deployment <id>` |
| `timed-out` | Exceeded time budget | Both: build-logs first, then runtime logs |

### Redeployment Decision

| Command | When to use |
|---------|-------------|
| `mcloud environments redeploy <env>` | Fix is environment-side (variable change, infra) — reruns existing build |
| `mcloud environments trigger-build <env>` | Fix is in source code on the tracked branch — starts new build |

## Common Pitfalls

- **TTY-only commands.** `mcloud login`, `mcloud use` (without flags), and `delete` without `--yes` require a TTY. They fail in CI, Docker, or piped input.
- **`MCLOUD_TOKEN` precedence.** When set, file-based credentials are ignored and `mcloud login` is rejected. Unset it to switch accounts.
- **Personal vs org access keys.** Personal keys require `--organization`; org keys are pre-scoped.
- **`organizations list` requires personal auth.** Org access keys return 401 on this command.
- **Build IDs vs deployment IDs.** `depl_*` = deployment ID; anything else = build ID (resolved to latest deployment). `mcloud logs --deployment` accepts both; other commands take build IDs only.
- **`mcloud local build` has no `--json`.** It streams plaintext and reports success via its exit code (`0` = success). Requires Docker and must run inside the project's Git repo. Use it to reproduce `build-failed` failures locally — see [reference/debugging-deployments.md](reference/debugging-deployments.md).

## Reference Files

- [reference/setup.md](reference/setup.md) — CLI installation, authentication, context setup
- [reference/debugging-deployments.md](reference/debugging-deployments.md) — Build/deployment failure recipes and log analysis
- [reference/environments-and-variables.md](reference/environments-and-variables.md) — Environment lifecycle and variable management

## Copilot Adaptation

This skill was migrated from the Claude plugin `medusa-cloud` (origin: `medusajs/medusa-agent-skills`, commit `c584f79`) to the VS Code Copilot skill format. The canonical name is `medusa-cloud-using`.

**Key differences from the Claude original:**

- **No `/plugin` commands:** Claude-specific commands like `/plugin marketplace add` and `/plugin install` do not apply. In VS Code Copilot, skills are discovered automatically from `.agents/skills/medusa/` when the `SKILL.md` file has valid YAML frontmatter with `name` and `description` fields.
- **No `allowed-tools` restriction:** The Claude original frontmatter did not include `allowed-tools`, and Copilot does not support this field. Copilot uses normal terminal approval workflows — the user is prompted before terminal commands execute. The intended scope (all `mcloud` CLI commands) is documented here: this skill should only run `mcloud` CLI commands and `jq` for output parsing.
- **Cloud operations may be irreversible and require explicit human confirmation:** Medusa Cloud operations such as `environments create`, `environments delete`, `environments redeploy`, `environments trigger-build`, `variables set`, `variables delete`, and `mcloud local build` are **potentially irreversible mutations** that affect production infrastructure. Every mutating command must be explicitly confirmed by the user before execution. Never run `delete`, `redeploy`, `trigger-build`, `variables set`, `variables delete`, or `environments create` automatically — always ask the user first. Read-only commands (`list`, `get`, `whoami`, `logs`, `build-logs`, `version`) are safe to run without confirmation.
- **Canonical name:** The `name` field is `medusa-cloud-using` (matching the directory name), not `using-medusa-cloud` from the original. When referencing this skill, use the canonical name.

**Auxiliary reference files copied alongside this skill:**

- [reference/setup.md](reference/setup.md) — CLI installation, authentication, context setup
- [reference/debugging-deployments.md](reference/debugging-deployments.md) — Build/deployment failure recipes and log analysis
- [reference/environments-and-variables.md](reference/environments-and-variables.md) — Environment lifecycle and variable management

The original unmodified file is preserved at [original/SKILL.source.md](original/SKILL.source.md) for provenance and auditing. Original reference files are preserved under [original/reference/](original/reference/).