import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const SCRIPT_PATH = fileURLToPath(import.meta.url)
const REPO_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..", "..")

export function validateCanonicalSourceRegistry(options = {}) {
  const registryPath = options.registryPath || path.join(REPO_ROOT, ".agents", "canonical-source-registry.yaml")
  const errors = []
  const warnings = []
  const validatedSources = []

  let rawYaml = ""
  try {
    rawYaml = readFileSync(registryPath, "utf-8")
  } catch (err) {
    return { success: false, errors: [`Failed to read source registry at ${registryPath}: ${err.message}`], warnings, validatedSources }
  }

  if (!rawYaml.includes("kind: canonical-source-registry")) {
    errors.push("Invalid kind in source registry (expected 'kind: canonical-source-registry')")
  }

  const sourcesSectionIndex = rawYaml.indexOf("sources:\n")
  const deniedSectionIndex = rawYaml.indexOf("denied_sources:\n")

  if (sourcesSectionIndex === -1) {
    errors.push("Missing required top-level 'sources:' section")
    return { success: false, errors, warnings, validatedSources }
  }

  if (deniedSectionIndex === -1) {
    errors.push("Registry missing required 'denied_sources:' list")
  }

  const sourcesContent = rawYaml.slice(sourcesSectionIndex + 9, deniedSectionIndex !== -1 ? deniedSectionIndex : undefined)
  
  // Split into source blocks (lines starting with '  ' followed by word and colon)
  const blockRegex = /\n  ([a-zA-Z0-9_-]+):\n/g
  const matches = [...sourcesContent.matchAll(blockRegex)]

  const mandatoryFields = [
    "source_id:",
    "name:",
    "type:",
    "path:",
    "authority:",
    "allowed_access_levels:",
    "immutable_version_reference:",
    "retention_privacy_classification:",
    "allowed_transformations:",
    "allowed_sinks_index_scopes:",
    "explicit_a2a_disclosure_policy:",
    "explicit_mcp_disclosure_policy:",
    "provenance_hash_requirements:",
    "revocation_deprecation_status:",
    "indexing:"
  ]

  const seenSourceIds = new Set()

  for (let i = 0; i < matches.length; i++) {
    const sourceKey = matches[i][1]
    const startIndex = matches[i].index
    const endIndex = (i + 1 < matches.length) ? matches[i + 1].index : sourcesContent.length
    const block = sourcesContent.slice(startIndex, endIndex)

    for (const field of mandatoryFields) {
      if (!block.includes(field)) {
        errors.push(`Source block '${sourceKey}' missing required field '${field.slice(0, -1)}'`)
      }
    }

    const sourceIdMatch = block.match(/source_id:\s*([^\s]+)/)
    if (sourceIdMatch) {
      const sourceId = sourceIdMatch[1]
      if (seenSourceIds.has(sourceId)) {
        errors.push(`Duplicate source_id detected: '${sourceId}'`)
      } else {
        seenSourceIds.add(sourceId)
      }
    }

    validatedSources.push({
      key: sourceKey,
      source_id: sourceIdMatch ? sourceIdMatch[1] : undefined
    })
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    validatedSources
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  const result = validateCanonicalSourceRegistry()
  if (result.success) {
    console.log("🟢 H5 Canonical Source Registry PASS")
    console.log(`Validated ${result.validatedSources.length} knowledge sources against #43 contract.`)
    process.exit(0)
  } else {
    console.error("🔴 H5 Canonical Source Registry FAIL")
    for (const err of result.errors) {
      console.error(`  - ${err}`)
    }
    process.exit(1)
  }
}
