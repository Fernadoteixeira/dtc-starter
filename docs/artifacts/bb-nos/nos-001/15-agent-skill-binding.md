# 15 — Execution and Provenance Binding (NOS-001, Remediated)

**Issue:** #13 (NOS-001)  
**Protocol:** Canonical Autonomous Execution v4.0  
**Iteration:** Auto-Improve 1

> Evidence categories are disjoint. Availability is not execution, installation is not consumption, and contracts/manifests are not skills.

## Taxonomy

| Category | Required proof | Explicit exclusions |
|---|---|---|
| `AGENT-E` | actual invocation/session ID, task, inputs, outputs and verdict | available profile, path existence, retroactive role assignment |
| `SKILL-E` | exact atomic skill path/ID plus actual load or invocation evidence | manifest, resolver, catalog, installed-only skill |
| `CONTRACT-E` | exact contract path and the binding rules applied | skill consumption claim |
| `GOV-E` | issue/API snapshot, registry, manifest or policy used as authority | executable skill claim |
| `AUTO-E` | reproducible tool operation and observed output | human or agent review |
| `REVIEW-E` | independent reviewer/session, scope, findings and verdict | self-review, automated scan, availability |

## Actual agent executions in this remediation

| Evidence ID | Runtime identity | Session | Scope | Output |
|---|---|---|---|---|
| AGENT-E-R1 | Zed delegated analysis agent | `162eadea-b3c6-40a8-a241-1ed1e4727e33` | Read current GitHub issue bodies #14–#32; derive ownership, hard predecessors, successors and ambiguities | Remediated artifacts 12 and 13 input |
| AGENT-E-R2 | Zed delegated audit agent | `dde947e9-6aab-4532-9f1d-691ad32abaa4` | Audit shortcut registry paths and DRAFT-0 provenance taxonomy | Remediated artifacts 15 and 16 input |

The canonical shortcuts `@architect:nos`, `@orchestrate:nos`, `@repo:guard`, `@visual:audit`, `@qa:nos` and `@regression:nos` describe intended capability profiles. They are not claimed as executed canonical agents unless an invocation record exists.

## DRAFT-0 claims invalidated

The previous `AGENT-E1`–`AGENT-E5` entries are invalid as execution evidence because their paths were stale and the old artifact itself stated that delegated agents produced zero useful turns. Their role descriptions are retained only as historical DRAFT-0 context, not PASS evidence.

Correct profile paths include:

- `.agents/fio-vivo-antigravity-rug-pack/.agents/agents/fio-vivo-rug/agent.md`
- `.agents/fio-vivo-antigravity-rug-pack/.agents/agents/bb03-css-validator/agent.md`
- `.agents/fio-vivo-antigravity-rug-pack/.agents/agents/repo-guardian/agent.md`
- `.agents/ollama-superpowers-pack-v1.0.0/agents/software-architect/agent.json`
- `.agents/ollama-superpowers-pack-v1.0.0/agents/repo-cartographer/agent.json`

Path correctness alone does not create `AGENT-E`.

## Skill evidence

No atomic skill was loaded through an execution mechanism during this remediation. Therefore:

```text
SKILL-E: NONE CLAIMED
```

The following are resolvers/governance inputs, not consumed skills:

- `.agents/nos-gallery-canonical-skills-205/manifest/skills.json`
- `.agents/product-lifecycle-canonical-skills-315/manifest/domains.json`
- `.agents/product-lifecycle-canonical-skills-315/manifest/orchestrations.json`

When a later execution consumes one, it must resolve an exact atomic path such as `skills/.../SKILL.md` or `orchestrations/<slug>/SKILL.md` and capture the invocation evidence.

## Contract and governance evidence

| Evidence ID | Path/source | Applied rule |
|---|---|---|
| CONTRACT-E1 | `.agents/contracts/session-state-ledger.md` | gate state, authorization separation, read/write discipline |
| CONTRACT-E2 | `.agents/contracts/nos-gallery-first-fold.yaml` | first-fold visual requirements and terminal human visual gate |
| GOV-E1 | GitHub issue #13 current body | remediation checklist and freeze restrictions |
| GOV-E2 | GitHub issue bodies #14–#32 | ownership and hard scheduling SSOT |
| GOV-E3 | `.agents/canonical-agent-shortcuts.yaml` | shortcut composition and evidence-category rules |
| GOV-E4 | `.agents/nos-gallery-canonical-skills-205/manifest/skills.json` | resolver only; not skill consumption |
| GOV-E5 | `.agents/product-lifecycle-canonical-skills-315/manifest/orchestrations.json` | resolver only; not orchestration execution |

## Automation evidence

| Evidence ID | Operation | Result |
|---|---|---|
| AUTO-E1 | GitHub API fetch of issue #13 | current remediation requirements captured |
| AUTO-E2 | GitHub API analysis of #14–#32 | ownership matrix and textual hard DAG rebuilt |
| AUTO-E3 | workspace path audit | registry paths validated; stale DRAFT-0 paths identified |
| AUTO-E4 | repository file inventory | only 20 current entries under `nos-001`, not the previously claimed 24 files |
| AUTO-E5 | runtime-surface mutation policy | edits restricted to `.agents` governance, `docs/artifacts/bb-nos/**` and ignored ledger; no `apps/**` or `packages/**` writes |

Git diff/hash claims are not emitted because the terminal integration is blocked by a Zed launcher error. This limitation is explicit rather than replaced by fabricated PASS evidence.

## Canonical Agent Execution Fabric

The registry is now paired with an executable structural fabric:

- `.agents/canonical-execution-protocol.yaml`
- `.agents/scripts/resolve-agent-shortcut.mjs`
- `.agents/scripts/resolve-agent-skills.mjs`
- `.agents/scripts/validate-execution-evidence.mjs`
- `.agents/fio-vivo-antigravity-rug-pack/.agents/agents/canonical-worker/agent.md`
- `.agents/fio-vivo-antigravity-rug-pack/.agents/agents/canonical-reviewer/agent.md`

The fabric resolves and hashes canonical identities and exact skills, separates protocol/dispatcher/adapter/contract loads from skills, requires completed worker and reviewer receipts, and validates a fail-closed evidence envelope. Its validator intentionally declares `trust_level: structural_integrity_only`; host-session authenticity requires a platform invocation record and cannot be inferred from UUID syntax.

## Independent review

A real independent audit ran in session `19e837af-9631-45d9-b6d0-5f90bedcf7ba` and returned `FAIL` against the first fabric cut. Addressable local findings were remediated. It is retained as an audit execution record, not promoted to protocol-compliant `REVIEW-E`, because no reviewer route/load bundle was generated and no fabric validation ran.

Final `REVIEW-E` remains pending until the fabric can execute end to end.
