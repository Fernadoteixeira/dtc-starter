# Execution Provenance Discovery & Host Environment Analysis

**Task:** ARCH-EF-03-R1 Provenance Discovery  
**Date:** 2026-08-08  
**Scope:** Antigravity / Node.js 24 Execution Fabric  

## 1. Objective

Identify, inspect, and classify execution authority surfaces exposed by the host runtime environment to eliminate synthetic, repository-generated identity (`randomUUID()`) in `AGENT-RUN` and `REVIEW-E`.

## 2. Discovered Execution Surfaces

Inspection of the host process environment (`process.env`) and Antigravity runtime interfaces revealed the following candidate authority sources:

1. **`process.env.ANTIGRAVITY_CONVERSATION_ID`**
   - Value: `fa624d2a-ab82-4e18-85fd-6fc8aaf28f65`
   - Classification: `HOST_ISSUED`
   - Description: Host-level conversation identifier injected by the host runtime environment into every spawned process.

2. **`process.env.ANTIGRAVITY_TRAJECTORY_ID`**
   - Value: `e01b51fe-bd23-4b36-9f94-31def3ae5fff`
   - Classification: `HOST_ISSUED`
   - Description: Unique trajectory execution UUID assigned by the host runtime engine.

3. **`process.env.ANTIGRAVITY_PROJECT_ID`**
   - Value: `02cba1c9-f079-4ebe-922e-e51c9bc43563`
   - Classification: `HOST_ISSUED`
   - Description: Host workspace project identifier.

4. **`process.env.ANTIGRAVITY_SOURCE_METADATA`**
   - Classification: `HOST_ISSUED`
   - Description: JSON metadata injected into tool execution processes containing host step index, conversation ID, and tool call IDs.

5. **Subagent Host Runtime Interface (`invoke_subagent` / `manage_subagents`)**
   - Classification: `HOST_ISSUED`
   - Description: The host agent platform manages subagent sessions and returns distinct host-authenticated `conversationID`s per subagent lifecycle.

6. **Local `crypto.randomUUID()` / `randomUUID()`**
   - Classification: `REPOSITORY_ISSUED` / `FORBIDDEN FOR PROVENANCE`
   - Description: Ephemeral, repository-side UUID generation. Valid for local receipt references, but rejected as a substitute for host execution authority.

## 3. Provenance Selection Matrix

| Source | Classification | Forgeable by Repo | Selected as Authority |
|---|---|---|---|
| `ANTIGRAVITY_CONVERSATION_ID` | `HOST_ISSUED` | No | Yes (Host Session Identity) |
| `ANTIGRAVITY_TRAJECTORY_ID` | `HOST_ISSUED` | No | Yes (Host Trajectory Identity) |
| `ANTIGRAVITY_PROJECT_ID` | `HOST_ISSUED` | No | Yes (Host Project Context) |
| Subagent `conversationID` | `HOST_ISSUED` | No | Yes (Distinct Worker / Reviewer Session) |
| OS Process PID/PPID | `PROCESS_LOCAL` | No | No (Local process table only) |
| `crypto.randomUUID()` | `REPOSITORY_ISSUED` | Yes | No (Forbidden for host authority) |

## 4. Bridge Design

The host provenance capture bridge will:
1. Extract host-issued metadata (`host_session_id`, `host_trajectory_id`, `host_project_id`, `host_authority: "antigravity-runtime"`) directly from the host environment.
2. Validate that these values are non-empty, match host UUID shapes, and are injected by the host rather than generated inside repository tests.
3. Validate that worker and reviewer executions run with distinct, verifiable session/invocation provenance.
