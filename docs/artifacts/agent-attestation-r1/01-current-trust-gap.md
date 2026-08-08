# 01-CURRENT-TRUST-GAP — Analysis of the Provenance Boundary

## 1. The Core Architectural Fallacy

The previous implementation suffered from a classic self-referential authorization loop:
```text
[Repository Code] passes arbitrary UUIDs ---> [host-provenance-adapter.mjs]
                                                      |
                                                      v
                                            Emits authority="antigravity-host"
                                                      |
                                                      v
[validate-execution-evidence.mjs] <--------------------+
Checks authority === "antigravity-host"
Sets trust_level = "host_provenance_verified"
Sets platform_attestation_verified = true
```

In this architecture, **the repository was declaring the authority to the adapter and then verifying the string it had just emitted**.

---

## 2. Identified Forensic Gaps

1. **Self-Asserted Authority String:** The string `"antigravity-host"` was assigned inside repository code without querying an external host daemon, signing key, or token endpoint.
2. **Missing `SKILL-CONSUME-E`:** `resolve-agent-skills.mjs` loaded definitions and computed hashes (`SKILL-LOAD-E`), but the wrapper set `instructions_acknowledged: true` as a constant boolean without checking whether the worker generated actionable consumption evidence.
3. **No External Transcript Attestation:** While the host records executions in `<appDataDir>\brain\<conversation-id>\.system_generated\logs\transcript.jsonl`, this external source was never parsed or correlated against receipts to confirm tool invocations.
4. **Over-Promoted Trust Levels:** `validate-execution-evidence.mjs` allowed promotion to `host_provenance_verified` based solely on structural validity of UUIDs.

---

## 3. Remediated Architecture

```text
[Host Layer (Immutable Outside Repo)]
  invoke_subagent -> transcript.jsonl (HOST_EXTERNAL_IMMUTABLE)

[Repository Layer (Reads and Verifies)]
  1. SKILL-LOAD-E (Retrieval & Hash)
  2. SKILL-CONSUME-E (Action Evidence & Modified Artifact Hashes)
  3. HOST-EXECUTION-CORRELATION-E (Matches invocation in transcript.jsonl)
  4. Explicit Trust Level Hierarchy:
     - structural_integrity_only
     - host_provenance_claimed
     - host_provenance_correlated
     - host_provenance_verified (Requires cryptographic / non-forgeable external proof)
```
