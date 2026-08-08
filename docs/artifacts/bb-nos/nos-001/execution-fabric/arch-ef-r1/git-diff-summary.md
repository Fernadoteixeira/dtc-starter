# Git Diff Summary — ARCH-EF-03-R1

## Scope and Surface Confinement

**Governing Human Decision:** `ADR-EF-02` (Option A — Direct Ledger Contract Load)  
**Task:** `ARCH-EF-03-R1` (Host Provenance Capture Bridge & Attestation)  
**Surface Target:** Canonical Agent Execution Fabric  
**Git Working Tree Status:** Clean; only permitted fabric scripts and tests modified.

---

## Summary of Code Changes

### 1. `.agents/canonical-agent-shortcuts.yaml` (ADR-EF-02 Option A)
- **Diff:** +1 line adding `session_state_ledger` to `@architect:nos.contracts`.
- **Purpose:** Fulfills ADR-EF-02 Option A direct contract load without expanding fabric primitives.

### 2. `.agents/scripts/host-provenance-adapter.mjs` (NEW)
- **Exports:** `HOST_AUTHORITY`, `captureHostProvenance`, `validateHostProvenance`.
- **Purpose:** Extracts immutable host session provenance (`process.env.ANTIGRAVITY_CONVERSATION_ID`, `ANTIGRAVITY_TRAJECTORY_ID`, `ANTIGRAVITY_PROJECT_ID`, and subagent conversation ID) and validates structural integrity against host authority.

### 3. `.agents/scripts/canonical-invocation-wrapper.mjs` (NEW)
- **Exports:** `emitWorkerAgentRun`, `emitReviewerReview`.
- **Purpose:** Enforces preflight verification prior to execution and securely wraps worker `AGENT-RUN` and reviewer `REVIEW-E` with host provenance.

### 4. `.agents/scripts/validate-execution-evidence.mjs` (MODIFIED)
- **Enhancement:** Validates host provenance objects in both worker and reviewer receipts.
- **Enforcement:** Enforces `antigravity-host` authority, UUID validity, distinct worker/reviewer host sessions, distinct invocation IDs, and elevates `trust_level` to `host_provenance_verified` when verified.
- **Backward Compatibility:** Preserves `structural_integrity_only` fallback when host provenance is not present.

### 5. `.agents/scripts/__tests__/canonical-execution-fabric.test.mjs` (MODIFIED)
- **Enhancement:** Added 15 new adversarial test cases (expanding suite from 17 to 32 tests).
- **Result:** 32/32 passing tests.
