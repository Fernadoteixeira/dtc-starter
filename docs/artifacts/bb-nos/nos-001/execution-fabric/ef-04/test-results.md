# EF-04 Test Results & Execution Report

**Task:** NOS-001-EF-04 Distinct Canonical Reviewer Execution  
**Test Suite:** `.agents/scripts/__tests__/canonical-execution-fabric.test.mjs`  
**Total Unit/Integration Tests:** 32  
**Passing Tests:** 32  
**Failing Tests:** 0  
**Status:** PASS 🟢  

---

## 1. Automated Test Breakdown (32/32 Passing)

| Test Group | Tests | Result | Notes |
|---|---|---|---|
| Phase Filenames & Protocol Alignment | 2 | PASS | Validates canonical phase nomenclature |
| Shortcut Resolution & Helpers | 4 | PASS | Tests YAML shortcut resolution |
| Confinement & Exclusive Writes | 2 | PASS | Rejects path escapes and overwrites |
| Contract Disguise & Policy Defense | 2 | PASS | Blocks contract masquerade |
| AGENT-RUN Schema & Strictness | 4 | PASS | Validates receipt envelope and fields |
| REVIEW-E Schema & Blocking Invariants | 2 | PASS | Enforces finding blocking rules |
| Load Receipt Integrity & Stale Protection | 3 | PASS | Rejects stale hashes |
| Host Provenance Capture & Validation | 4 | PASS | Validates `antigravity-host` authority |
| Adversarial Session & Identity Isolation | 7 | PASS | Rejects shared sessions / forged kinds |
| Trust Level Differentiation & Attestation | 2 | PASS | Validates `host_provenance_verified` |
