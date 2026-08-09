import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const SCRIPT_PATH = fileURLToPath(import.meta.url)
const REPO_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..", "..")

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
    "tracing:",
    "operation_taxonomy:",
    "correlation:",
    "resilience:",
    "privacy_and_security:",
    "cardinality_budget:"
  ]

  for (const section of requiredSections) {
    if (!rawYaml.includes(section)) {
      errors.push(`Missing required telemetry contract section '${section.slice(0, -1)}'`)
    }
  }

  // Check required operation taxonomy categories (FV-060)
  const requiredCategories = ["llm:", "tool:", "retrieval:", "agent:", "review:"]
  for (const cat of requiredCategories) {
    if (!rawYaml.includes(cat)) {
      errors.push(`Operation taxonomy missing category '${cat.slice(0, -1)}'`)
    }
  }

  // Check resilience invariants (FV-062, FV-063)
  if (!rawYaml.includes("FAIL_SAFE_CONTINUE_EXECUTION")) {
    errors.push("Resilience section missing 'FAIL_SAFE_CONTINUE_EXECUTION' exporter outage policy")
  }
  if (!rawYaml.includes("OBSERVABILITY != EVIDENCE != AUTH")) {
    errors.push("Resilience section missing invariant 'OBSERVABILITY != EVIDENCE != AUTH'")
  }

  // Check cardinality budget (FV-059)
  if (!rawYaml.includes("unbounded_dimensions: FORBIDDEN")) {
    errors.push("Cardinality budget section missing 'unbounded_dimensions: FORBIDDEN'")
  }

  return {
    success: errors.length === 0,
    errors,
    warnings
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  const result = validateCanonicalTelemetryContract()
  if (result.success) {
    console.log("🟢 H6 Canonical OpenTelemetry Contract PASS")
    console.log("Telemetry contract satisfies all Issue #46 vendor-neutrality & resilience laws.")
    process.exit(0)
  } else {
    console.error("🔴 H6 Canonical OpenTelemetry Contract FAIL")
    for (const err of result.errors) {
      console.error(`  - ${err}`)
    }
    process.exit(1)
  }
}
