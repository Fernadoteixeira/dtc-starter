# NOS-001 — Auto-Improve Iteration 2: Canonical Agent Execution Fabric

**Date:** 2026-08-07  
**Trigger:** human finding `EXECUTION-FABRIC-001`  
**Status:** MATERIALIZED / RUNTIME VALIDATION BLOCKED

## Problem confirmed

The shortcut registry was declarative routing only. It did not load exact skills, invoke canonical execution adapters, emit receipts, or enforce independent review. Therefore the registry alone could not produce `AGENT-E`, `SKILL-E`, or `REVIEW-E`.

## Materialized architecture

| Layer | Artifact | Status |
|---|---|---|
| Registry | `.agents/canonical-agent-shortcuts.yaml` | extended with execution protocol, adapters and rigid evidence invariants |
| Protocol | `.agents/canonical-execution-protocol.yaml` | created |
| Dispatcher | `fio-vivo-rug/agent.md` | evolved to resolve, dispatch and validate |
| Worker adapter | `canonical-worker/agent.md` | created |
| Reviewer adapter | `canonical-reviewer/agent.md` | created |
| Route resolver | `.agents/scripts/resolve-agent-shortcut.mjs` | created and hardened |
| Skill/load resolver | `.agents/scripts/resolve-agent-skills.mjs` | created and hardened |
| Load preflight | `.agents/scripts/validate-execution-loads.mjs` | created and hardened |
| Evidence validator | `.agents/scripts/validate-execution-evidence.mjs` | created and hardened |
| Shared runtime | `.agents/scripts/canonical-execution-lib.mjs` | created |
| Security tests | `.agents/scripts/__tests__/canonical-execution-fabric.test.mjs` | created; not executed |

## Enforced local invariants

```text
NO SKILL-LOAD-E RECEIPT → NO SKILL-E
NO COMPLETED AGENT-RUN → NO AGENT-E
NO DISTINCT review:canonical ROUTE + LOAD + INVOCATION → NO REVIEW-E
CONTRACT/MANIFEST/PROTOCOL/ADAPTER LOADS → NEVER SKILL-E
VALIDATOR FAILURE OR NEEDS_REMEDIATION → NO DoD / NO GO
```

## Hardening delta after independent audit

| Audit finding | Resolution |
|---|---|
| Outputs could overwrite arbitrary repository files | `--evidence-dir`, physical descendant checks, phase filenames, `.json` only and exclusive no-replace writes |
| Contract/manifest could masquerade as external skill | approved roots, basename/schema policy, category-specific physical confinement |
| Protocol/dispatcher/adapters were unhashed | `PROTOCOL-LOAD-E`, `DISPATCHER-LOAD-E`, `ADAPTER-LOAD-E` |
| Agent run omitted self-critique/validation | strict schema, task/input hashes, self-critique, 0–2 iterations, validation records, stop condition |
| Reviewer route was not exact | requires `review:canonical`, `code-reviewer`, read-only, writer false |
| Reviewer did not bind artifacts | exact reviewed path/hash set and structured findings |
| Validator emitted no receipt | full `VALIDATION-E` with evidence and validator hashes |
| Local validation overclaimed authenticity | explicit `trust_level: structural_integrity_only` and `platform_attestation_verified: false` |
| Protocol filenames drifted from runtime | all six phase filenames aligned and covered by a documentary drift test |
| Completed run allowed FAIL/BLOCKED validation | completed AGENT-RUN now requires every validation record to PASS |
| No pre-execution bundle validator | `validate-execution-loads.mjs` emits `LOAD-VALIDATION-E` before worker/reviewer invocation |

## Real delegated executions in this iteration

- Script implementation/hardening session: `190d9dee-a601-4af8-b17e-0415695f5bcc`
- Independent fabric audit session: `19e837af-9631-45d9-b6d0-5f90bedcf7ba`

These are real platform session IDs from this Zed execution. They are not retroactively converted into canonical fabric receipts because the fabric was not yet run and no exact skill load bundles were produced.

## Validation performed

- Zed diagnostics: zero errors/warnings for all four `.mjs` runtime files and both YAML control-plane files.
- Independent audit: first hardened cut returned `FAIL` with one platform-authenticity P0 and local P1/P2 findings.
- Addressable local P1/P2 findings were remediated.
- Final independent local re-audit: `PASS_WITH_NON_BLOCKING_FINDINGS`; the remaining documentary-drift P2 was covered by an additional regression test.
- Node test suite and end-to-end receipt generation were not run because every terminal command is intercepted by a broken Zed launcher (`libasound.so.2` missing).

## Trust boundary and residual blocker

Repository code can verify structural integrity, current hashes, path confinement, exact receipt coverage and reviewer separation. It cannot cryptographically prove that a host subagent session occurred unless the host supplies a signed attestation or an external trusted audit record.

Therefore:

```text
FABRIC MATERIALIZED                 YES
STATIC DIAGNOSTICS                  PASS
FABRIC NODE TESTS                   NOT RUN
REAL FABRIC WORKER RUN              NOT RUN
REAL FABRIC REVIEWER RUN            NOT RUN
PLATFORM ATTESTATION VERIFIED       NO
EXECUTION-FABRIC-001                OPEN
#13 DoD                              BLOCKED
```

## Required unblock sequence

1. Restore executable Node/PowerShell terminal integration.
2. Run the fabric tests.
3. Generate worker route/load bundles in an evidence directory.
4. Invoke `canonical-worker` and capture the host-returned session record.
5. Generate `review:canonical` route/load bundles.
6. Invoke `canonical-reviewer` in a different session.
7. Assemble and validate `execution-evidence.json`.
8. Record `VALIDATION-E` and only then resume T21/T22.

## Verdict

`NO-GO — EXECUTION FABRIC MATERIALIZED BUT NOT YET EXECUTED`
