# ARCH-EF-03-R1 Test Results

**Test Suite:** `.agents/scripts/__tests__/canonical-execution-fabric.test.mjs`  
**Total Tests:** 32  
**Passing Tests:** 32  
**Failing Tests:** 0  
**Status:** PASS  
**Execution Runtime:** Node.js (v20+) built-in test runner  

---

## Suite Summary

| Test Category | Count | Status | Description |
|---|---|---|---|
| Phase Filenames & Protocol Alignment | 2 | PASS | Validates canonical phase nomenclature and protocol document matching |
| Shortcut Resolution & Canonical Helpers | 4 | PASS | Tests YAML shortcut resolution, reviewer policy, and stable serialization |
| Confinement & Exclusive Write Controls | 2 | PASS | Enforces physical evidence directory confinement and non-destructive writes |
| Contract Disguise & Policy Defense | 2 | PASS | Prevents skills from masquerading as contracts or unauthorized read/write roles |
| AGENT-RUN Schema & Validation Strictness | 4 | PASS | Rejects malformed receipts, empty tasks, untrimmed strings, and failed validations |
| REVIEW-E Schema & Blocking Invariants | 2 | PASS | Verifies artifact matching and blocks PASS verdicts with unresolved findings |
| Load Receipt Integrity & Stale Protection | 3 | PASS | Rejects stale hashes, route/load bundle mismatches, and improper pairings |
| Host Provenance Capture & Validation | 4 | PASS | Validates `antigravity-host` authority, UUID integrity, and execution kinds |
| Adversarial Session & Identity Isolation | 7 | PASS | Rejects shared sessions, shared invocation IDs, kind mismatches, and forged authority |
| Trust Level Differentiation & Platform Attestation | 2 | PASS | Preserves `structural_integrity_only` fallback; verifies `host_provenance_verified` |

---

## Key Adversarial Verifications

1. **Rejection of Non-Host Authority:** Rejects `authority: "fake-host"` or synthetic sources.
2. **Rejection of Shared Worker/Reviewer Sessions:** Fails if worker and reviewer share the same host subagent session ID.
3. **Rejection of Shared Invocations:** Fails if worker and reviewer share the same invocation ID.
4. **Rejection of Mismatched Invocations:** Fails if worker/reviewer receipt invocation ID disagrees with host provenance invocation ID.
5. **Rejection of Partial Provenance:** Fails if worker provides host provenance but reviewer does not, or vice-versa.
6. **Exclusive Write Protection:** Prevents overwriting previously committed receipt artifacts in the evidence graph.
