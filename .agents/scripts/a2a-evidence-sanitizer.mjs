/**
 * a2a-evidence-sanitizer.mjs
 *
 * H4.4 / Wave 3 #41 — Allowlist-Based Artifact & Evidence Sanitization
 *
 * Enforces strict separation between:
 *   1. Internal Execution Result -> Allowlist-Projected A2A Artifacts (Parts)
 *   2. Internal Evidence Graph   -> Bounded Assurance Summary
 *
 * LAWS & INVARIANTS:
 *   - ARTIFACT != EVIDENCE GRAPH
 *   - SANITIZER IS ALLOWLIST-BASED (Constructed exclusively from explicit safe fields)
 *   - Internal agent IDs, filesystem paths, lease IDs, fencing tokens,
 *     receipt chains, reviewer identities, and prompts are NEVER serialized externally.
 */

import { randomUUID } from "node:crypto"

// Forbidden leakage regex patterns for output sanitization verification
const FORBIDDEN_PATTERNS = [
  /\.agents\//,
  /\.mjs/,
  /\.yaml/,
  /\.json/,
  /\/scripts\//,
  /fencing.token/i,
  /lease.?id/i,
  /write.?set/i,
  /invocation.?id/i,
  /host.?session/i,
  /prompt/i,
  /archetype/i,
  /skill.?path/i,
  /hook/i,
  /canonical-worker/i,
  /canonical-reviewer/i,
  /AUTH-4/i,
  /POLICY-E/i,
  /AUTH-E/i,
  /LEASE-E/i,
  /TOOL-E/i,
  /POSTCONDITION-E/i,
]

// Allowlisted data property keys permitted in public DataParts
const ALLOWLISTED_DATA_KEYS = new Set([
  "fabric",
  "status",
  "name",
  "version",
  "summary",
  "description",
  "max_grant",
  "mutations_allowed",
  "public_url",
  "result_count",
])

/**
 * Sanitizes a raw text string by redacting internal filesystem paths, leases, and tokens.
 *
 * @param {string} text
 * @returns {string} Sanitized string
 */
export function sanitizeText(text) {
  if (typeof text !== "string") return ""

  return text
    .replace(/[C-Z]:\\[^\s"']+/gi, "[REDACTED_PATH]")
    .replace(/\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/\.agents\/[^\s"']+/gi, "[REDACTED_PATH]")
    .replace(/lease-[a-f0-9-]+/gi, "[REDACTED_LEASE]")
    .replace(/fence-[a-f0-9-]+/gi, "[REDACTED_FENCE]")
    .replace(/tok_[a-zA-Z0-9_-]+/gi, "[REDACTED_TOKEN]")
}

/**
 * Project an internal data payload using an explicit ALLOWLIST of safe keys.
 * Unrecognized or internal properties are excluded by construction.
 *
 * @param {object} rawData
 * @returns {object} Allowlist-projected data payload
 */
export function projectAllowlistedData(rawData) {
  if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) {
    return {}
  }

  const projected = {}
  for (const [key, val] of Object.entries(rawData)) {
    // Strict allowlist key check
    if (ALLOWLISTED_DATA_KEYS.has(key)) {
      if (typeof val === "string") {
        projected[key] = sanitizeText(val)
      } else if (typeof val === "number" || typeof val === "boolean") {
        projected[key] = val
      } else if (val === null) {
        projected[key] = null
      }
    }
  }

  return projected
}

/**
 * Compiles a raw internal execution result into official A2A Artifacts
 * using strict allowlist-based projection.
 *
 * Artifact = sanitized task deliverable (Text/Data Parts only).
 *
 * @param {object} executionResult
 * @param {string} [executionResult.text]
 * @param {object} [executionResult.data]
 * @returns {Array<object>} Array of official A2A Artifact objects
 */
export function buildSanitizedArtifacts(executionResult) {
  if (!executionResult || typeof executionResult !== "object") {
    return []
  }

  const parts = []

  // Allowlist projection 1: Text Part
  if (typeof executionResult.text === "string" && executionResult.text.trim().length > 0) {
    parts.push({
      kind: "text",
      text: sanitizeText(executionResult.text),
    })
  }

  // Allowlist projection 2: Data Part (Strict key projection)
  if (executionResult.data && typeof executionResult.data === "object" && !Array.isArray(executionResult.data)) {
    const projectedData = projectAllowlistedData(executionResult.data)
    if (Object.keys(projectedData).length > 0) {
      parts.push({
        kind: "data",
        data: projectedData,
      })
    }
  }

  if (parts.length === 0) {
    parts.push({
      kind: "text",
      text: "Task completed with no public payload.",
    })
  }

  return [
    {
      id: randomUUID(),
      parts,
    },
  ]
}

/**
 * Builds a safe, bounded assurance summary from an internal Evidence Graph.
 *
 * Internal Evidence Graph (POLICY-E, AUTH-E, LEASE-E, TOOL-E, POSTCONDITION-E)
 * is NEVER returned raw. Only a bounded assurance decision is disclosed via allowlist projection.
 *
 * @param {object} evidenceGraph
 * @returns {object} Bounded assurance summary
 */
export function buildBoundedAssuranceSummary(evidenceGraph) {
  if (!evidenceGraph || typeof evidenceGraph !== "object") {
    return {
      verified: false,
      assurance_level: "UNVERIFIED",
      timestamp: new Date().toISOString(),
    }
  }

  const isVerified = evidenceGraph.status === "CLOSED" || evidenceGraph.verified === true
  const reviewPassed = evidenceGraph.review_passed !== false

  return {
    verified: isVerified && reviewPassed,
    assurance_level: isVerified ? "P5_GOVERNED" : "UNVERIFIED",
    review_status: reviewPassed ? "APPROVED" : "REJECTED",
    timestamp: new Date().toISOString(),
  }
}

/**
 * Verifies that sanitized artifacts and assurance summaries contain NO internal details.
 *
 * @param {Array<object>} artifacts
 * @param {object} assuranceSummary
 * @returns {{ valid: boolean, violations: string[] }}
 */
export function validateSanitizedOutput(artifacts, assuranceSummary) {
  const violations = []
  const serialized = JSON.stringify({ artifacts, assuranceSummary })

  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(serialized)) {
      violations.push(`Sanitized output leaked internal detail matching: ${pattern}`)
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (process.argv[1] === import.meta.filename) {
  const sampleInternalResult = {
    text: "Processed query for FIO-VIVO architecture at C:\\Users\\fjuni\\Documents\\GitHub\\02-medusa-halls\\dtc-starter\\.agents\\canonical-agent-registry.yaml",
    data: {
      status: "success",
      fabric: "FIO-VIVO Agentic Fabric",
      agent_id: "canonical-worker-01",
      lease_id: "lease-12345",
      fencing_token: "fence-9999",
      result: "FIO-VIVO Fabric operational",
    },
  }

  const sampleEvidenceGraph = {
    status: "CLOSED",
    verified: true,
    review_passed: true,
    nodes: ["POLICY-E", "AUTH-E", "LEASE-E"],
  }

  const artifacts = buildSanitizedArtifacts(sampleInternalResult)
  const summary = buildBoundedAssuranceSummary(sampleEvidenceGraph)
  const validation = validateSanitizedOutput(artifacts, summary)

  console.log("Sanitized Artifacts:", JSON.stringify(artifacts, null, 2))
  console.log("Bounded Summary:", JSON.stringify(summary, null, 2))

  if (!validation.valid) {
    console.error("\nLEAKAGE DETECTED:")
    for (const v of validation.violations) {
      console.error(`  - ${v}`)
    }
    process.exit(1)
  }

  console.log("\nEvidence Sanitizer: 0 leakage violations. Allowlist Sanitization PASS.")
}
