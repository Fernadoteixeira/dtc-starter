/**
 * a2a-message-translator.mjs
 *
 * H4.3 — Message -> Task Capsule Translation
 *
 * Translates an official A2A SendMessageRequest through the full
 * FIO-VIVO local authorization chain:
 *
 *   API key credential (initial) / OAuth credential (future)
 *       -> ExternalPrincipal
 *       -> SendMessageRequest validation
 *       -> Part allowlisting
 *       -> NormalizedA2AIntent
 *       -> Capability Resolver
 *       -> locally selected execution agent
 *       -> locally selected reviewer
 *       -> Task Capsule
 *
 * INVARIANTS:
 *   - External identity NEVER maps to local agent identity
 *   - Remote caller becomes ExternalPrincipal only
 *   - Grants, write-set, and reviewer are ALWAYS locally assigned
 *   - API key / OAuth scope NEVER becomes FIO-VIVO AUTH
 *   - Artifact != internal receipt
 *
 * IDENTITY RULE:
 *   external credential -> ExternalPrincipal  (who is asking)
 *   requested skill     -> Capability Resolver -> locally selected agent  (who executes)
 *
 *   NEVER: external identity -> local archetype
 */

import { randomUUID } from "node:crypto"
import {
  validateA2AMessage,
  compileA2ATaskCapsule,
} from "./canonical-execution-lib.mjs"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const A2A_PROTOCOL_VERSION = "1.0"
const A2A_SPEC_RELEASE = "1.0.1"
const A2A_CONTENT_TYPE = "application/a2a+json"
const EXTERNAL_AUTH_CEILING = "AUTH-0"
const DEFAULT_REVIEWER = "canonical-reviewer"

const DEFAULT_SERVICE_PROFILE = Object.freeze({
  advertised_skills: [
    { name: "architecture-query", handler: "repo-cartographer", reviewer: "code-reviewer" },
    { name: "capability-query", handler: "repo-cartographer", reviewer: "code-reviewer" },
    { name: "evidence-summary", handler: "repo-cartographer", reviewer: "code-reviewer" },
    { name: "task-status", handler: "repo-cartographer", reviewer: "code-reviewer" }
  ]
})

// Official A2A TaskState enum
const TASK_STATE = Object.freeze({
  UNSPECIFIED:    "TASK_STATE_UNSPECIFIED",
  SUBMITTED:     "TASK_STATE_SUBMITTED",
  WORKING:       "TASK_STATE_WORKING",
  COMPLETED:     "TASK_STATE_COMPLETED",
  FAILED:        "TASK_STATE_FAILED",
  CANCELED:      "TASK_STATE_CANCELED",
  INPUT_REQUIRED: "TASK_STATE_INPUT_REQUIRED",
  REJECTED:      "TASK_STATE_REJECTED",
  AUTH_REQUIRED:  "TASK_STATE_AUTH_REQUIRED",
})

// FIO-VIVO initial emission subset
const EMITTED_STATES = new Set([
  TASK_STATE.SUBMITTED,
  TASK_STATE.WORKING,
  TASK_STATE.COMPLETED,
  TASK_STATE.FAILED,
  TASK_STATE.REJECTED,
])

const MAX_JSON_PART_BYTES = 65536

// ---------------------------------------------------------------------------
// ExternalPrincipal
// ---------------------------------------------------------------------------

/**
 * Creates an ExternalPrincipal from authenticated credentials.
 *
 * The remote caller becomes an ExternalPrincipal, NEVER a local agent.
 * ExternalPrincipal identifies WHO IS ASKING.
 * The capability resolver decides WHO EXECUTES.
 *
 * Supports apiKey (initial) and OAuth2 (future).
 *
 * @param {object} authResult
 * @param {string} authResult.method - "apiKey" or "oauth2"
 * @param {string} [authResult.principal_id] - authenticated principal ID
 * @param {string} [authResult.client_id] - OAuth client ID (future)
 * @param {string[]} [authResult.scopes] - OAuth scopes (future)
 * @param {string} [authResult.agent_name] - external agent name (audit)
 * @returns {object} ExternalPrincipal
 */
export function createExternalPrincipal(authResult) {
  if (!authResult || typeof authResult !== "object") {
    throw new Error("Missing authentication result")
  }

  const method = authResult.method || (authResult.keyId ? "apiKey" : "unknown")
  const principalId = authResult.principal_id || authResult.keyId || authResult.client_id || "unknown"

  return {
    kind: "external-principal",
    principal_id: principalId,
    authenticated_at: new Date().toISOString(),
    auth_method: method,
    a2a_agent_name: authResult.agent_name || null,
  }
}

// ---------------------------------------------------------------------------
// A2A-Version validation
// ---------------------------------------------------------------------------

/**
 * Validates the A2A-Version header.
 * A2A-Version uses Major.Minor format. Clients 1.x MUST send it.
 *
 * @param {string} versionHeader
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateA2AVersion(versionHeader) {
  if (!versionHeader || typeof versionHeader !== "string") {
    return { valid: false, reason: "Missing A2A-Version header" }
  }

  const trimmed = versionHeader.trim()
  if (trimmed !== A2A_PROTOCOL_VERSION) {
    return { valid: false, reason: `Unsupported A2A-Version: ${trimmed}. Expected: ${A2A_PROTOCOL_VERSION}` }
  }

  return { valid: true }
}

// ---------------------------------------------------------------------------
// Part allowlisting
// ---------------------------------------------------------------------------

/**
 * Validates and sanitizes Message Parts.
 * Denies arbitrary file URLs (SSRF risk) and raw binary.
 * Unknown optional Part types are dropped (not rejected).
 *
 * @param {Array} parts
 * @returns {{ valid: boolean, sanitized?: Array, reason?: string }}
 */
export function allowlistParts(parts) {
  if (!Array.isArray(parts) || parts.length === 0) {
    return { valid: false, reason: "Message must contain at least one Part" }
  }

  const sanitized = []

  for (const part of parts) {
    if (!part || typeof part !== "object") {
      return { valid: false, reason: "Each Part must be a non-null object" }
    }

    // TextPart
    if (part.text !== undefined) {
      if (typeof part.text !== "string") {
        return { valid: false, reason: "TextPart.text must be a string" }
      }
      sanitized.push({ kind: "text", text: part.text })
      continue
    }

    // DataPart
    if (part.data !== undefined) {
      if (typeof part.data !== "object" || part.data === null) {
        return { valid: false, reason: "DataPart.data must be a non-null object" }
      }
      const serialized = JSON.stringify(part.data)
      if (serialized.length > MAX_JSON_PART_BYTES) {
        return { valid: false, reason: `DataPart exceeds maximum size of ${MAX_JSON_PART_BYTES} bytes` }
      }
      sanitized.push({ kind: "data", data: part.data })
      continue
    }

    // FilePart — DENY (SSRF risk)
    if (part.file !== undefined || part.uri !== undefined || part.url !== undefined) {
      return { valid: false, reason: "FilePart with remote URL is denied (SSRF prevention)" }
    }

    // Unknown Part type — drop per boundary policy
    // Optional unknown parts are never promoted to authority
  }

  if (sanitized.length === 0) {
    return { valid: false, reason: "No supported Parts after allowlisting" }
  }

  return { valid: true, sanitized }
}

// ---------------------------------------------------------------------------
// NormalizedA2AIntent
// ---------------------------------------------------------------------------

/**
 * Compiles a NormalizedA2AIntent from sanitized Parts and context.
 * This is the handoff from A2A wire to FIO-VIVO capability resolution.
 *
 * @param {Array} sanitizedParts
 * @param {string} requestedSkill
 * @param {object} externalPrincipal
 * @returns {object} NormalizedA2AIntent
 */
export function compileNormalizedIntent(sanitizedParts, requestedSkill, externalPrincipal) {
  const textParts = sanitizedParts.filter(p => p.kind === "text")
  const dataParts = sanitizedParts.filter(p => p.kind === "data")

  return {
    kind: "normalized-a2a-intent",
    sanitized_text: textParts.map(p => p.text).join("\n"),
    sanitized_data: dataParts.length > 0 ? dataParts[0].data : {},
    requested_skill: requestedSkill,
    external_principal_ref: externalPrincipal.principal_id,
    timestamp: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Capability resolution
// ---------------------------------------------------------------------------

/**
 * Resolves a requested public skill to an internal execution agent.
 *
 * IDENTITY RULE:
 *   external credential -> ExternalPrincipal  (who is asking)
 *   requested skill     -> Capability Resolver -> locally selected agent
 *
 * The external caller CANNOT select the local executing agent.
 * The external caller CANNOT select the reviewer.
 *
 * @param {string} requestedSkill
 * @param {object} serviceProfile - advertised skills and config
 * @returns {{ resolved: boolean, agentId?: string, reviewerId?: string, reason?: string }}
 */
export function resolveCapability(requestedSkill, serviceProfile = DEFAULT_SERVICE_PROFILE) {
  if (!requestedSkill || typeof requestedSkill !== "string") {
    return { resolved: false, reason: "Missing requested skill" }
  }

  const profile = serviceProfile || DEFAULT_SERVICE_PROFILE
  const skills = profile.advertised_skills || profile.advertisedSkills
  if (!skills || !Array.isArray(skills)) {
    return { resolved: false, reason: "No service profile configured" }
  }
  const skillEntry = skills.find(s =>
    (typeof s === "string" && s === requestedSkill) ||
    (typeof s === "object" && s.name === requestedSkill)
  )

  if (!skillEntry) {
    return { resolved: false, reason: `Unknown skill: ${requestedSkill}` }
  }

  // Locally selected agent and reviewer
  // The external caller has NO input into either of these
  const resolvedAgent = typeof skillEntry === "object" && skillEntry.handler
    ? skillEntry.handler
    : "canonical-worker"

  const resolvedReviewer = typeof skillEntry === "object" && skillEntry.reviewer
    ? skillEntry.reviewer
    : DEFAULT_REVIEWER

  return { resolved: true, agentId: resolvedAgent, reviewerId: resolvedReviewer }
}

// ---------------------------------------------------------------------------
// Full translation pipeline
// ---------------------------------------------------------------------------

/**
 * Translates a SendMessageRequest through the full FIO-VIVO
 * authorization chain.
 *
 * Pipeline:
 *   API key -> ExternalPrincipal -> SendMessageRequest validation
 *   -> Part allowlisting -> NormalizedA2AIntent -> Capability Resolver
 *   -> locally selected agent -> Task Capsule
 *
 * Invalid requests are rejected BEFORE Task Capsule compilation.
 * EVERY ACCEPTED request MUST compile to a valid Task Capsule.
 *
 * @param {object} params
 * @param {string} params.a2aVersion - A2A-Version header value
 * @param {object} params.authResult - authenticated credential result
 * @param {object} params.sendMessageRequest - official A2A SendMessageRequest
 * @param {string} params.requestedSkill - skill name from request metadata
 * @param {object} params.serviceProfile - FIO-VIVO service profile
 * @returns {{ success: boolean, capsule?: object, task?: object, principal?: object, error?: object }}
 */
export function translateMessage({
  a2aVersion,
  authResult,
  sendMessageRequest,
  requestedSkill,
  serviceProfile,
}) {
  // Step 1: A2A-Version gate
  const versionCheck = validateA2AVersion(a2aVersion)
  if (!versionCheck.valid) {
    return { success: false, error: { code: "UNSUPPORTED_VERSION", message: versionCheck.reason } }
  }

  // Step 2: ExternalPrincipal from authenticated credential
  // The principal identifies WHO IS ASKING, nothing more
  let principal
  try {
    principal = createExternalPrincipal(authResult)
  } catch (err) {
    return { success: false, error: { code: "AUTH_FAILED", message: err.message } }
  }

  // Step 3: SendMessageRequest validation
  const validation = validateA2AMessage(sendMessageRequest)
  if (!validation.valid) {
    return { success: false, error: { code: "INVALID_REQUEST", message: validation.reason } }
  }

  // Step 4: Part allowlisting
  const message = sendMessageRequest.message || sendMessageRequest
  const parts = message.parts || []
  const partResult = allowlistParts(parts)
  if (!partResult.valid) {
    return { success: false, error: { code: "UNSUPPORTED_CONTENT", message: partResult.reason } }
  }

  // Step 5: NormalizedA2AIntent
  const intent = compileNormalizedIntent(
    partResult.sanitized,
    requestedSkill,
    principal,
  )

  // Step 6: Capability resolution — locally selects agent AND reviewer
  const capResult = resolveCapability(requestedSkill, serviceProfile)
  if (!capResult.resolved) {
    return { success: false, error: { code: "UNKNOWN_CAPABILITY", message: capResult.reason } }
  }

  // Step 7: Task Capsule compilation
  // Grants, write-set, worker, and reviewer are ALL locally assigned
  const capsule = compileA2ATaskCapsule({
    requestId: sendMessageRequest.id || randomUUID(),
    objective: intent.sanitized_text,
    input: intent.sanitized_data,
    externalPrincipal: principal,
    resolvedAgentId: capResult.agentId,
    reviewer: capResult.reviewerId,
    maxGrant: EXTERNAL_AUTH_CEILING,
  })

  // A2A Task stub for response — uses official TaskState enum
  const task = {
    id: capsule.task_id || randomUUID(),
    status: { state: TASK_STATE.SUBMITTED },
    artifacts: [],
  }

  return { success: true, capsule, task, principal }
}

// ---------------------------------------------------------------------------
// Exports for direct use
// ---------------------------------------------------------------------------

export { TASK_STATE, EMITTED_STATES, A2A_PROTOCOL_VERSION, A2A_SPEC_RELEASE }

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (process.argv[1] === import.meta.filename) {
  console.log("a2a-message-translator: Use as a library via import.")
  console.log("  translateMessage({ a2aVersion, authResult, sendMessageRequest, requestedSkill, serviceProfile })")
  console.log("  createExternalPrincipal(authResult)")
  console.log("  allowlistParts(parts)")
  console.log("  compileNormalizedIntent(sanitizedParts, requestedSkill, principal)")
  console.log("  resolveCapability(requestedSkill, serviceProfile)")
}
