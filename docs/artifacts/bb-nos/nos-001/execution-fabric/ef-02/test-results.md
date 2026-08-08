# EF-02 Test Results

**Task:** NOS-001-EF-02 Second Canonical Profile Validation  
**Shortcut:** `@repo:guard`  
**Worker Identity:** `repo-cartographer`  
**Reviewer Identity:** `code-reviewer`  
**Test Suite:** `.agents/scripts/__tests__/canonical-execution-fabric.test.mjs`  
**Total Tests:** 32  
**Passing Tests:** 32  
**Failing Tests:** 0  
**Status:** PASS  

---

## Suite Summary

| Category | Count | Status | Notes |
|---|---|---|---|
| Phase Filenames & Protocol Alignment | 2 | PASS | Standard phase nomenclature |
| Shortcut Resolution & Canonical Helpers | 4 | PASS | Tests YAML registry resolution including `@repo:guard` |
| Confinement & Exclusive Write Controls | 2 | PASS | Rejects path escapes and prevents overwrites |
| Contract Disguise & Policy Defense | 2 | PASS | Prevents skills from masquerading as contracts |
| AGENT-RUN Schema & Validation Strictness | 4 | PASS | Rejects malformed receipts and failed validations |
| REVIEW-E Schema & Blocking Invariants | 2 | PASS | Verifies artifact matching and blocks PASS on findings |
| Load Receipt Integrity & Stale Protection | 3 | PASS | Rejects stale hashes and improper pairings |
| Host Provenance Capture & Validation | 4 | PASS | Validates `antigravity-host` authority and UUIDs |
| Adversarial Session & Identity Isolation | 7 | PASS | Rejects shared sessions, shared invocations, and forged kinds |
| Trust Level Differentiation & Platform Attestation | 2 | PASS | Preserves fallback and grants `host_provenance_verified` |

---

## Negative Isolation Checks

1. **ARCH-EF Worker vs EF-02 Worker Session:**
   - ARCH-EF Worker Host Session: `940ad311-eca5-4fbe-bc7f-85a324d58a62`
   - EF-02 Worker Host Session: `dae94c16-fc9f-4ccb-9c66-a4ca940df7a2`
   - Outcome: **Distinct (No session reuse)**

2. **ARCH-EF Reviewer vs EF-02 Reviewer Session:**
   - ARCH-EF Reviewer Host Session: `16222bd8-c9f1-4e50-88c1-504932ced6fd`
   - EF-02 Reviewer Host Session: `3d65ed4e-709d-4c3f-80fa-f4b4ac4b6439`
   - Outcome: **Distinct (No session reuse)**

3. **EF-02 Worker vs EF-02 Reviewer Session:**
   - EF-02 Worker: `dae94c16-fc9f-4ccb-9c66-a4ca940df7a2`
   - EF-02 Reviewer: `3d65ed4e-709d-4c3f-80fa-f4b4ac4b6439`
   - Outcome: **Distinct (Zero self-review / zero shared session)**
