# 05-AGENT-SKILL-CLAIM-MATRIX — Audit of Agent Claims and Verified Consumption

| Agent Shortcut | Canonical Agent | Agent Definition Hash | Loaded Skills | Actionable Consumption Evidence | Transcript Corroboration | Derived Trust Level |
|---|---|---|---|---|---|---|
| `architect:nos` | `software-architect` | `3cb4022...` | `issue-to-plan`, `research-synthesis`, `dependency-audit`, `structured-output` | `SKILL-CONSUME-E` with action logs & target artifact hashes | Step 161 (`940ad311-...`) | `host_provenance_correlated` |
| `repo:guard` | `repo-cartographer` | `4b684cb...` | `repo-map`, `dependency-audit` | `SKILL-CONSUME-E` with boundary audit records | Step 277 (`dae94c16-...`) | `host_provenance_correlated` |
| `review:canonical` | `code-reviewer` | `49547d2...` | `code-review`, `static-analysis`, `dependency-audit`, `structured-output` | `SKILL-CONSUME-E` with cross-agent review records | Step 417 (`287bee96-...`) | `host_provenance_correlated` |

---

## Key Invariants Enforced:
1. `SKILL-LOAD-E` $\neq$ `SKILL-CONSUME-E`.
2. Loaded skills without an accompanying `SKILL-CONSUME-E` receipt are classified as `AVAILABLE_ONLY`.
3. `host_provenance_verified` is strictly withheld because transcript correlation is non-cryptographic.
4. `platform_attestation_verified` = `false`.
