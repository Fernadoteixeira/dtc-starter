# 00-BASELINE — Agent Attestation Baseline & Scope

**Task:** `EXECUTION-ATTESTATION-R1 — Forensic Implementation & Fail-Closed Validation`  
**Repository:** `Fernadoteixeira/dtc-starter`  
**Git HEAD SHA:** `5c665f8dda600c083b0979e3ca373fe032346c2b`  
**Branch:** `main`  
**Operating Mode:** `FORENSIC IMPLEMENTATION + FAIL-CLOSED VALIDATION`  
**Governing Rule:** `HOST EXECUTES → HOST PRODUCES EXTERNAL EVIDENCE → REPOSITORY VERIFIES`  

---

## 1. Frozen Baseline State

The following components are validated as `PROVEN` on disk and will NOT be re-opened:
- Agent Discovery & Shortcut Resolution: `architect:nos`, `repo:guard`, `review:canonical`
- Agent File Retrieval: `AGENT-LOAD-E` with verified path and SHA-256
- Skill Resolution & Retrieval: `SKILL-LOAD-E` with verified IDs, paths, and SHA-256
- Agent-Run & Review-E Structural Schemas
- Historical evidence files in `docs/artifacts/bb-nos/nos-001/execution-fabric/` (immutable)

---

## 2. Unproven Baseline Items (Relegated to Forensic Scope)

- `SKILL ACTUAL CONSUMPTION`: Previously conflated with `SKILL-LOAD-E`; now separated into `SKILL-CONSUME-E`.
- `REAL HOST WORKER INVOCATION`: Claimed via UUID parameters, but without independent cryptographic host proof.
- `REAL HOST REVIEWER INVOCATION`: Distinct session recorded, but authority string was repository-asserted.
- `HOST PROVENANCE`: Formally downgraded to `host_provenance_claimed` / `host_provenance_correlated`.
- `PLATFORM ATTESTATION`: Formally locked to `false` until an external, non-forgeable host authority proves execution.
