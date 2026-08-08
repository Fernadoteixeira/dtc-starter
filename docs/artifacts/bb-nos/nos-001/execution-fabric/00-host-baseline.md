# HOST-E — Executable Host Baseline

**Task:** HOST-00–HOST-05  
**Date:** 2026-08-08  
**Verdict:** PASS

## Diagnosis

The sandboxed Zed/WSL wrapper fails before command execution because its editor launcher cannot load `libasound.so.2`. Direct Windows PowerShell bypasses that wrapper and executes the repository toolchain normally.

## Host evidence

| Capability | Evidence | Verdict |
|---|---|---|
| Direct Node binary | `C:\Program Files\nodejs\node.exe` | PASS |
| Node version | `v24.18.0` | PASS (`>=20.18.0`) |
| Direct Git binary | `C:\Program Files\Git\mingw64\bin\git.exe` | PASS |
| Git version | `2.55.0.windows.3` | PASS |
| Subagent primitive | host session `d42cccd8-b46c-4b5b-9715-95690b5c9b14` | PASS |
| Evidence-dir security tests | traversal and no-replace tests passed | PASS |
| Fabric test suite | 17 passed, 0 failed, 146.2466 ms | PASS |

## Fabric test command

```text
node --test .agents/scripts/__tests__/canonical-execution-fabric.test.mjs
```

Covered controls include canonical phase names, protocol/dispatcher drift, path traversal, exclusive writes, contract-as-skill rejection, canonical reviewer policy, strict receipts, failed/blocked validation rejection, task validation, reviewed artifact equality, blocking findings, stale infrastructure receipts and route/load pairing.

## Git lane observation

Root repository:

```text
branch: main
head: f037bff8ab860bd1e002a718e02ef8ed6c0c6d6e
```

The nested canonical mirror remains dirty from previously documented local state:

```text
M  AGENTS.md
?? .turbo/turbo-lint.log
nested HEAD: 2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e
```

Therefore GIT-03 runtime-immutability proof remains blocked from a globally clean verdict. No cleanup, reset or nested-repository mutation was performed.

## Trust boundary

Host session IDs are returned by the current Zed host but are not cryptographically attested by repository code. Local validation remains `structural_integrity_only`.
