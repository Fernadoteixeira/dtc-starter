# 02-HOST-AUTHORITY-DISCOVERY — External Host Surfaces Discovery

## 1. Discovered Surfaces and Taxonomy

| Surface | Path / Location | Scope | Classification | Readable by Repo | Writable by Repo | Cryptographically Signed |
|---|---|---|---|---|---|---|
| **Host Transcript** | `<appDataDir>\brain\<conversation-id>\.system_generated\logs\transcript.jsonl` | External host log | `HOST_EXTERNAL_IMMUTABLE` | `true` (if path provided) | `false` | `false` (plain JSONL) |
| **Host Environment** | `process.env.ANTIGRAVITY_*` | Process environment | `PROCESS_LOCAL` | `true` | `false` (in runtime) | `false` |
| **Workspace Repo** | `dtc-starter/` | Git working tree | `REPOSITORY_WRITABLE` | `true` | `true` | `false` |
| **Git Working Tree** | Git HEAD & Commits | Version Control | `REPOSITORY_VISIBLE` | `true` | `true` | `false` (unless GPG signed) |
| **External PKI / HMAC API** | Not configured | Network/Host daemon | `UNKNOWN / NOT_IMPLEMENTED` | `false` | `false` | `false` |

---

## 2. Selection Rationale

- **`transcript.jsonl`** is classified as `HOST_EXTERNAL_IMMUTABLE` because it resides outside the repository workspace and records `invoke_subagent` calls with chronological timestamps, step indices, and subagent specs.
- Because it lacks asymmetric digital signatures / HMAC tokens, correlating against it yields **`host_provenance_correlated`**, which provides strong corroboration without over-claiming cryptographic verification.
