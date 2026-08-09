import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const SCRIPT_PATH = fileURLToPath(import.meta.url)
const REPO_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..", "..")

export const REQUIRED_CANONICAL_IDENTIFIERS = Object.freeze([
  "fabric.task_id",
  "fabric.task_capsule_digest",
  "fabric.execution_id",
  "fabric.invocation_id",
  "fabric.principal_id",
  "fabric.session_id",
  "fabric.agent_id",
  "fabric.agent_archetype",
  "fabric.capability_id",
  "fabric.model_id",
  "fabric.provider_id",
  "fabric.operation_type",
  "fabric.artifact_id",
  "fabric.output_digest",
  "fabric.auth_verdict",
  "fabric.evidence_receipt_ref",
  "fabric.review_verdict",
  "fabric.latency_ms",
  "fabric.token_count",
  "fabric.cost_usd",
  "fabric.retries",
  "fabric.error_type",
  "fabric.outcome_correlation_id"
])

export const REQUIRED_MEASUREMENT_LAYERS = Object.freeze([
  "signal",
  "step",
  "execution",
  "task",
  "capability_product",
  "outcome"
])

export function validateCanonicalTelemetryContract(options = {}) {
  const contractPath = options.contractPath || path.join(REPO_ROOT, ".agents", "canonical-telemetry-contract.yaml")
  const errors = []
  const warnings = []

  let rawYaml = ""
  try {
    rawYaml = readFileSync(contractPath, "utf-8")
  } catch (err) {
    return { success: false, errors: [`Failed to read telemetry contract at ${contractPath}: ${err.message}`], warnings }
  }

  if (!rawYaml.includes("kind: canonical-telemetry-contract")) {
    errors.push("Invalid kind in telemetry contract (expected 'kind: canonical-telemetry-contract')")
  }

  const requiredSections = [
    "vendor_neutrality:",
    "canonical_identifiers:",
    "measurement_hierarchy:",
    "tracing:",
    "operation_taxonomy:",
    "resilience:",
    "privacy_and_control_plane_security:",
    "cardinality_budget_policy:"
  ]

  for (const section of requiredSections) {
    if (!rawYaml.includes(section)) {
      errors.push(`Missing required telemetry contract section '${section.slice(0, -1)}'`)
    }
  }

  // 1. Verify complete canonical identifier coverage (23/23)
  for (const id of REQUIRED_CANONICAL_IDENTIFIERS) {
    if (!rawYaml.includes(id)) {
      errors.push(`Telemetry contract missing required canonical identifier '${id}'`)
    }
  }

  // 2. Verify 6-layer measurement hierarchy
  for (const layer of REQUIRED_MEASUREMENT_LAYERS) {
    if (!rawYaml.includes(`name: ${layer}`)) {
      errors.push(`Telemetry contract measurement hierarchy missing layer '${layer}'`)
    }
  }

  // 3. Verify high-cardinality dimension policy & control-plane ID hashing
  if (!rawYaml.includes("metric_dimensions_labels: STRICTLY_FORBIDDEN")) {
    errors.push("Cardinality policy missing rule: high-cardinality IDs strictly forbidden as metric dimensions/labels")
  }
  if (!rawYaml.includes("raw_fencing_token_export: FORBIDDEN") || !rawYaml.includes("raw_lease_id_export: FORBIDDEN")) {
    errors.push("Control-plane privacy policy must strictly forbid exporting raw fencing tokens or lease IDs")
  }

  // 4. Verify resilience invariants
  if (!rawYaml.includes("exporter_outage_policy: FAIL_SAFE_CONTINUE_EXECUTION")) {
    errors.push("Resilience section missing 'FAIL_SAFE_CONTINUE_EXECUTION' exporter outage policy")
  }
  if (!rawYaml.includes("OBSERVABILITY != EVIDENCE != AUTH")) {
    errors.push("Resilience section missing invariant 'OBSERVABILITY != EVIDENCE != AUTH'")
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    canonicalIdentifiersCount: REQUIRED_CANONICAL_IDENTIFIERS.length,
    measurementLayersCount: REQUIRED_MEASUREMENT_LAYERS.length
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  const result = validateCanonicalTelemetryContract()
  if (result.success) {
    console.log("🟢 H6 Canonical OpenTelemetry Contract PASS")
    console.log(`Validated ${result.canonicalIdentifiersCount} canonical identifiers across ${result.measurementLayersCount} measurement hierarchy layers.`)
    process.exit(0)
  } else {
    console.error("🔴 H6 Canonical OpenTelemetry Contract FAIL")
    for (const err of result.errors) {
      console.error(`  - ${err}`)
    }
    process.exit(1)
  }
}
