---
name: medusa-dev-new-user
description: Create an admin user in Medusa. Executes `pnpm exec medusa user -e <email> -p <password>` to create a new admin user and reports results including confirmation, email, errors, and next steps.
---

# Create Admin User

Create a new admin user in Medusa with the specified email and password.

The user will provide two arguments:
- First argument: email address
- Second argument: password

For example: `/medusa-dev:new-user admin@test.com supersecret`

Use the terminal to execute the command `pnpm exec medusa user -e <email> -p <password>`, replacing `<email>` with the first argument and `<password>` with the second argument.

Report the results to the user, including:

- Confirmation that the admin user was created successfully
- The email address of the created user
- Any errors that occurred
- Next steps (e.g., logging in to the admin dashboard)

## Copilot Adaptation

This skill was migrated from the Claude plugin `medusa-dev` (origin: `medusajs/medusa-agent-skills`, commit `c584f79`) to the VS Code Copilot skill format. The canonical name is `medusa-dev-new-user`.

**Key differences from the Claude original:**

- **No `/plugin` commands:** Claude-specific commands like `/plugin marketplace add` and `/plugin install` do not apply. In VS Code Copilot, skills are discovered automatically from `.agents/skills/medusa/` when the `SKILL.md` file has valid YAML frontmatter with `name` and `description` fields.
- **No `allowed-tools` restriction:** The Claude original frontmatter included `allowed-tools: Bash(npx medusa user:*)`. Copilot does not support this field. Copilot uses normal terminal approval workflows — the user is prompted before terminal commands execute. The intended scope is documented here: this skill should only run `medusa user` commands.
- **No `argument-hint` field:** The Claude original included `argument-hint: <email> <password>`. Copilot does not support this field. The email and password arguments are described in the body instead.
- **Package manager convention:** This workspace uses **pnpm** (pinned at `pnpm@10.11.1`). When running the user creation command, use `pnpm exec medusa user -e <email> -p <password>` instead of `npx medusa user`. Run from the `apps/backend` directory.
- **Password security — CRITICAL adaptation:** The Claude original assumed passwords could be passed directly through the chat interface as arguments. In VS Code Copilot, **never collect passwords through the chat**. Instead, instruct the user to type the password directly in the terminal. The recommended flow is:
  1. Ask the user for the email address (this can be provided in chat).
  2. Tell the user to run the command themselves in the terminal: `cd apps/backend; pnpm exec medusa user -e <email> -p <password>` — replacing `<email>` and `<password>` with their actual values typed directly in the terminal, not through the chat.
  3. Alternatively, if the user provides both email and password in the chat and explicitly asks to run the command, you may run it in the terminal, but warn the user that passwords in chat history are visible in logs.
- **Canonical name:** The `name` field is `medusa-dev-new-user` (matching the directory name), not `new-user` from the original. When referencing this skill, use the canonical name.

The original unmodified file is preserved at [original/SKILL.source.md](original/SKILL.source.md) for provenance and auditing.