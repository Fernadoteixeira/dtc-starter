# Session State Ledger — Canonical Contract

Scope: **this repository only.** This is not a general-purpose agent
preference — it governs how any agent session in `dtc-starter` tracks gate
state, human decisions, and Git authorization across a multi-round Building
Block execution.

Adopted 2026-08-06 after the BB-04 Fio Vivo baseline execution, where the
gate state (`READY FOR HUMAN VISUAL APPROVAL` → `HUMAN APPROVED` →
`GIT AUTHORIZED`) had to be re-derived from conversation context on every
turn. This contract replaces that re-derivation with an explicit, versioned
record.

## 1. Purpose

An agent working a Building Block across several turns accumulates state
that is easy to lose track of: what's approved, what's merely proposed,
what Git operations are currently authorized, and what's still blocked. This
contract defines:

- the **shape** of that state (see [`session-state-ledger.schema.yaml`](./session-state-ledger.schema.yaml));
- **when** to read and write it;
- the **gate transition rules** that state must obey;
- the **precedence order** for resolving conflicting instructions;
- a **batch-mutation safety protocol** for heterogeneous file pipelines;
- **operational efficiency rules** to bound investigation and tooling churn.

## 2. When to read and write the ledger

- **Read** the current ledger state at the start of any session (or turn)
  that resumes work on a Building Block already in progress, before taking
  any action.
- **Write** (update) the ledger immediately after any gate transition —
  a human decision, a completed quality gate, a Git operation, or a new
  blocker being opened or resolved. Do not batch multiple transitions into
  one delayed update.
- The ledger reflects **current state**, not history. Git history, the PR,
  and the canonical evidence report are the audit trail; the ledger is the
  live pointer into that trail.

## 3. Where live state lives

The ledger's *shape* is versioned at
[`session-state-ledger.schema.yaml`](./session-state-ledger.schema.yaml).
A blank, ready-to-copy instance of that shape lives at
[`../templates/session-state-ledger.yaml`](../templates/session-state-ledger.yaml).

A **live ledger populated with real session data is not committed to Git**
under either of those paths. Session state is volatile by nature (branch
names, in-progress gate status, timestamps) and does not belong in version
control as a tracked file that churns every turn. When a task's audit
requirements call for a persisted, point-in-time snapshot of the ledger
(e.g. attached to a release), write it as a dated artifact under that task's
own artifact directory (for example `artifacts/bb-04/session-state-*.yaml`)
— never under `.agents/contracts/` or `.agents/templates/`.

## 4. Gate states and transition rules

```text
READY_FOR_HUMAN_APPROVAL
  commit:        forbidden
  push:          forbidden
  pull_request:  forbidden

HUMAN_APPROVED
  baseline_mutation:  forbidden
  git_operations:      depend_on_explicit_authorization

GIT_AUTHORIZED
  stage:      allowed_by_allowlist
  commit:     allowed
  push:       allowed
  draft_pr:   allowed
  merge:      forbidden

PR_CREATED
  implementation_bb_complete:  true
  next_bb:                      forbidden_until_explicit_authorization

MERGE_AUTHORIZED
  merge:  allowed_only_when_explicitly_granted
```

A registered transition **cannot be reverted by inference.** The agent may
only reopen an approved gate when there is:

- objective evidence of regression (a quality gate that was passing now
  fails, on the same surface that was approved);
- a new technical conflict discovered after approval;
- a destructive risk identified after approval;
- explicit human revocation.

**Never reopen a gate out of generic caution.** If the ledger says
`HUMAN_APPROVED` and no regression, conflict, risk, or revocation has been
identified, treat it as approved — do not re-ask, re-present options already
resolved, or re-run work already validated for that gate.

## 5. Authorization precedence

When instructions conflict, resolve in this order:

1. the most recent, explicit human decision in the conversation;
2. the current canonical ledger state;
3. the Building Block's own contract (e.g. a `.agents/contracts/*.yaml`
   scope file for that BB);
4. the nearest `AGENTS.md` in the directory tree;
5. general repository instructions;
6. agent inference.

**The most recent explicit authorization prevails** over an earlier one,
including over the agent's own prior interpretation of an ambiguous
instruction. When a human decision formally changes gate state, update the
ledger *before* taking the next action — don't act first and reconcile
later.

Example:

```text
READY_FOR_HUMAN_APPROVAL
  → human selects "APPROVE"
  → record HUMAN_APPROVED
  → human authorizes commit/push/PR
  → record GIT_AUTHORIZED
  → execute without re-presenting the prior gate
```

## 6. Authorization categories are distinct

Do not conflate these. Each is granted (or withheld) independently, and
granting one does not imply the others:

- **Product / visual approval** — a human confirms the work itself (a
  design, a baseline, a behavior) is correct. Tracked under
  `human_decisions.*` in the schema. This alone never authorizes a Git
  mutation.
- **Git authorization** — a human explicitly authorizes staging, committing,
  pushing, and/or opening a (draft) PR. Tracked under `git_authorization.*`.
  This does **not** imply merge authorization.
- **Merge authorization** — a human explicitly authorizes merging an open
  PR. Tracked under `git_authorization.merge`. This is granted separately
  from PR creation, and by default remains `forbidden` even after
  `GIT_AUTHORIZED`.

A human merging a PR directly on GitHub (outside the agent's own tool
calls) is a valid, real transition to `MERGED` — the agent should detect it
(`git fetch` / `gh pr view`) and update the ledger accordingly rather than
assuming its own last-known state is still current.

## 7. Execution discipline

Before any mutating operation, the agent should be able to state:

```text
current_bb
current_gate
human_approval
git_authorization
allowed_operation
stop_condition
```

- When `allowed_operation` is true and no objective blocker exists: **execute.**
  Do not ask for redundant confirmation, do not re-present options already
  resolved, do not reopen the prior gate.
- When `allowed_operation` is false: **stop**, state the exact restriction,
  and ask only for the missing authorization — not a full re-explanation of
  everything already decided.

## 8. Batch mutation safety protocol (heterogeneous file pipelines)

No batch pipeline may mutate files before completing a **read-only**
inventory and classification pass over 100% of its inputs. This applies to
any operation touching more than one file where the files may not all share
the same format, encoding, or structure (image processing, bulk renames,
codemods over mixed file types, etc.).

Required flow:

```text
inventory
  → metadata classification
  → compatibility matrix
  → dry-run
  → backup
  → representative sample
  → validation
  → controlled batch
  → postflight
```

The classification matrix must record, per input:

```text
path
declared_extension
detected_format
dimensions
channels
has_alpha
color_space
eligible_operation
risk
planned_action
```

If more than one file class is present, partition the batch and use
separate handlers per class — never apply one universal assumption across a
mixed set. (This rule codifies a real incident during BB-04 R2: a batch
image-normalization script assumed uniform "no alpha channel" across all
inputs; a subset already had real alpha, and the first pass began stripping
it before an anomaly in its own output — `background_pct: 0%` — caught the
mismatch and triggered a restore from backup. Zero shipped impact, but the
inventory-first flow above would have prevented the near-miss entirely.)

## 9. Operational efficiency rules

- One primary investigation per hypothesis. If a hypothesis is disproven,
  move to the next one rather than re-probing the same one differently.
- Two tooling attempts maximum before falling back to a different approach
  (e.g. a different library, a manual method, or asking the user).
- Centralize temporary/scratch scripts in a single location for the
  session; remove them during postflight before reporting completion.
- Narrate milestones, blockers, decisions, and results — not every
  intermediate command.
- Do not re-validate a quality gate that is already green when nothing on
  its surface changed.

Distinguish:

- **necessary exploration** — acquiring evidence that does not yet exist
  (a first audit, a root-cause investigation, a novel failure). This is a
  real, expected cost — don't compress it just to look efficient.
- **rework** — repeating an investigation or validation without new
  evidence or a changed surface. This is the pattern to eliminate.

## 10. Relationship to Building Block contracts

A specific Building Block may define its own scope contract (see
[`nos-gallery-first-fold.yaml`](./nos-gallery-first-fold.yaml) for an
example: required/forbidden visual properties and a gate for one BB). Those
contracts define *what "done" looks like* for that BB. This document defines
*how state and authorization are tracked and transitioned* across any BB.
They compose: the BB contract feeds `quality_gates` and `evidence` in the
ledger; this contract governs how the ledger moves between gates.
