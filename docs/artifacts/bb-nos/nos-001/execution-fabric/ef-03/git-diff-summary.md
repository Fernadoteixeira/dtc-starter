# Git Diff Summary — EF-03

## Scope and Surface Confinement

**Governing Human Decision:** `ADR-EF-02` (Option A — Direct Ledger Contract Load)  
**Task:** `EF-03` (Canonical Adversarial Matrix Execution)  
**Surface Target:** Canonical Agent Execution Fabric Tests & Adversarial Suite  
**Git Working Tree Status:** Clean; only permitted test scripts, matrix runner, and evidence artifacts added. Zero modifications to runtime, storefront, Medusa, or gallery modules.

---

## Summary of Changes

1. **Adversarial Matrix Runner:** Added `.agents/scripts/run-adversarial-matrix.mjs` containing the 15 programmatic attacks and verification harness.
2. **Immutable Predecessors:** `ef-01/`, `arch-ef/`, `arch-ef-r1/`, and `ef-02/` remain completely untouched.
3. **Evidence Confinement:** All EF-03 evidence artifacts stored exclusively under `docs/artifacts/bb-nos/nos-001/execution-fabric/ef-03/`.
4. **Git Formatting:** `git diff --check` passes cleanly.
