import {
  assertNonEmptyString,
  assertUuid
} from "./canonical-execution-lib.mjs"

export const HOST_AUTHORITY = "antigravity-host"

export function captureHostProvenance({
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
    issued_at: new Date().toISOString()
  }
}

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
