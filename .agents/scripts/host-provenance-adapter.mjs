import { existsSync, readFileSync } from "node:fs"
import { randomUUID } from "node:crypto"
import {
  assertNonEmptyString,
  assertSha256,
  assertUuid,
  canonicalRepoPath,
  hashBytes
} from "./canonical-execution-lib.mjs"

export const HOST_AUTHORITY = "antigravity-host"

export const TRUST_LEVELS = {
  STRUCTURAL_INTEGRITY_ONLY: "structural_integrity_only",
  HOST_PROVENANCE_CLAIMED: "host_provenance_claimed",
  HOST_PROVENANCE_CORRELATED: "host_provenance_correlated",
  HOST_PROVENANCE_VERIFIED: "host_provenance_verified"
}

/**
 * Captures claimed provenance metadata supplied by runtime or caller.
 * Note: Claiming host authority DOES NOT grant host_provenance_verified.
 */
export function captureClaimedProvenance({
  executionKind,
  subagentSessionId,
  subagentInvocationId,
  env = process.env
}) {
  if (executionKind !== "worker" && executionKind !== "reviewer") {
    throw new Error(`executionKind must be worker or reviewer: ${executionKind}`)
  }

  const hostSessionId = subagentSessionId || env.ANTIGRAVITY_CONVERSATION_ID
  const hostTrajectoryId = env.ANTIGRAVITY_TRAJECTORY_ID
  const hostProjectId = env.ANTIGRAVITY_PROJECT_ID

  assertNonEmptyString(hostSessionId, "hostSessionId")
  assertUuid(hostSessionId, "hostSessionId")

  if (hostTrajectoryId) {
    assertUuid(hostTrajectoryId, "hostTrajectoryId")
  }

  const invocationId = subagentInvocationId || hostSessionId

  return {
    authority: HOST_AUTHORITY,
    host_session_id: hostSessionId,
    host_trajectory_id: hostTrajectoryId || hostSessionId,
    host_project_id: hostProjectId || null,
    invocation_id: invocationId,
    execution_kind: executionKind,
    issued_at: new Date().toISOString(),
    claim_mode: "claimed",
    trust_level: TRUST_LEVELS.HOST_PROVENANCE_CLAIMED
  }
}

export const captureHostProvenance = captureClaimedProvenance

export function validateHostProvenance(provenance, label = "provenance") {
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) {
    throw new Error(`${label} must be an object`)
  }
  if (provenance.authority !== HOST_AUTHORITY) {
    throw new Error(`${label}.authority must be ${HOST_AUTHORITY}`)
  }
  assertUuid(provenance.host_session_id, `${label}.host_session_id`)
  assertUuid(provenance.host_trajectory_id, `${label}.host_trajectory_id`)
  assertUuid(provenance.invocation_id, `${label}.invocation_id`)
  if (provenance.execution_kind !== "worker" && provenance.execution_kind !== "reviewer") {
    throw new Error(`${label}.execution_kind must be worker or reviewer`)
  }
  return provenance
}

/**
 * Correlates claimed provenance against an external transcript log.
 * Transcript log is HOST_EXTERNAL_IMMUTABLE outside the workspace repo.
 */
export function correlateHostTranscript({
  provenance,
  transcriptPath,
  taskId,
  agentIdentity
}) {
  validateHostProvenance(provenance)

  if (!transcriptPath || !existsSync(transcriptPath)) {
    return {
      type: "HOST-EXECUTION-CORRELATION-E",
      receipt_id: randomUUID(),
      task_id: taskId || "UNKNOWN",
      host_session_id: provenance.host_session_id,
      invocation_id: provenance.invocation_id,
      correlation_status: "UNAVAILABLE",
      reason: "Host transcript file not accessible at provided path"
    }
  }

  const content = readFileSync(transcriptPath, "utf8")
  const lines = content.trim().split("\n")
  let matchedEvent = null
  let recordHash = null

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    try {
      const entry = JSON.parse(line)
      if (entry.tool_calls) {
        for (const tc of entry.tool_calls) {
          if (tc.name === "invoke_subagent" && tc.args) {
            const rawArgs = typeof tc.args === "string" ? tc.args : JSON.stringify(tc.args)
            if (
              (agentIdentity && rawArgs.includes(agentIdentity)) ||
              (taskId && rawArgs.includes(taskId))
            ) {
              matchedEvent = {
                step_index: entry.step_index,
                created_at: entry.created_at,
                tool_action: tc.args.toolAction
              }
              recordHash = hashBytes(line)
              break
            }
          }
        }
      }
    } catch {}
    if (matchedEvent) break
  }

  if (!matchedEvent) {
    return {
      type: "HOST-EXECUTION-CORRELATION-E",
      receipt_id: randomUUID(),
      task_id: taskId || "UNKNOWN",
      host_session_id: provenance.host_session_id,
      invocation_id: provenance.invocation_id,
      transcript_path: transcriptPath,
      correlation_status: "NOT_CORRELATED",
      reason: "No matching invoke_subagent entry found in host transcript"
    }
  }

  return {
    type: "HOST-EXECUTION-CORRELATION-E",
    receipt_id: randomUUID(),
    task_id: taskId || "UNKNOWN",
    host_session_id: provenance.host_session_id,
    invocation_id: provenance.invocation_id,
    transcript_path: transcriptPath,
    transcript_record_hash: recordHash,
    matched_event: matchedEvent,
    correlation_status: "CORRELATED",
    trust_level: TRUST_LEVELS.HOST_PROVENANCE_CORRELATED
  }
}

/**
 * Validates external cryptographic attestation.
 * Fail-closed: returns verified=false unless verifiable digital signature / HMAC token is supplied.
 */
export function verifyExternalHostAttestation(attestationBundle) {
  if (!attestationBundle || typeof attestationBundle !== "object") {
    return { verified: false, trust_level: TRUST_LEVELS.HOST_PROVENANCE_CLAIMED, reason: "Missing attestation bundle" }
  }

  if (attestationBundle.signature && attestationBundle.public_key && attestationBundle.signed_payload) {
    // If asymmetric cryptographic verification were implemented, verify signature here.
    return { verified: false, trust_level: TRUST_LEVELS.HOST_PROVENANCE_CORRELATED, reason: "PKI authority daemon not reachable" }
  }

  return {
    verified: false,
    trust_level: attestationBundle.transcript_correlated
      ? TRUST_LEVELS.HOST_PROVENANCE_CORRELATED
      : TRUST_LEVELS.HOST_PROVENANCE_CLAIMED,
    reason: "No cryptographic signature present; attestation remains non-verified"
  }
}
