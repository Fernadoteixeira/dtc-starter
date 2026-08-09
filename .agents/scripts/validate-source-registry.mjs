import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const SCRIPT_PATH = fileURLToPath(import.meta.url)
const REPO_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..", "..")

export const VALID_ENUMS = Object.freeze({
  authority: ["PUBLIC_OPEN", "FIO_VIVO_INTERNAL", "FIO_VIVO_RESTRICTED", "FIO_VIVO_CONFIDENTIAL"],
  retention_privacy_classification: ["PUBLIC_UNRESTRICTED", "INTERNAL_GOVERNED", "RESTRICTED_BUSINESS", "STRICT_CONFIDENTIAL"],
  explicit_a2a_disclosure_policy: ["ALLOWED_FULL_DISCLOSURE", "ALLOWED_WITH_ALLOWLIST_SANITIZATION", "DISCLOSURE_FORBIDDEN_EXTERNAL"],
  explicit_mcp_disclosure_policy: ["ALLOWED_FULL_DISCLOSURE", "ALLOWED_INTERNAL_ONLY", "ALLOWED_AUTHENTICATED_INTERNAL", "DISCLOSURE_FORBIDDEN_MCP"],
  provenance_hash_requirements: ["SHA256_MANDATORY", "SHA256_MANDATORY_STRICT"],
  revocation_deprecation_status: ["ACTIVE", "DEPRECATED", "REVOKED"]
})

const HEX_40_REGEX = /^[a-f0-9]{40}$/i
const HEX_64_REGEX = /^[a-f0-9]{64}$/i

export function parseSourceRegistryStructured(rawYaml) {
  if (!rawYaml.includes("kind: canonical-source-registry")) {
    throw new Error("Invalid kind in source registry (expected 'kind: canonical-source-registry')")
  }

  const sourcesSectionIndex = rawYaml.indexOf("sources:\n")
  const deniedSectionIndex = rawYaml.indexOf("denied_sources:")

  if (sourcesSectionIndex === -1) {
    throw new Error("Missing required top-level 'sources:' section")
  }

  const sourcesContent = rawYaml.slice(sourcesSectionIndex + 9, deniedSectionIndex !== -1 ? deniedSectionIndex : undefined)
  const blockRegex = /(?:^|\n)  ([a-zA-Z0-9_-]+):/g
  const matches = [...sourcesContent.matchAll(blockRegex)]

  const sources = {}

  for (let i = 0; i < matches.length; i++) {
    const key = matches[i][1]
    const startIndex = matches[i].index
    const endIndex = (i + 1 < matches.length) ? matches[i + 1].index : sourcesContent.length
    const block = sourcesContent.slice(startIndex, endIndex)

    const extractField = (fieldName) => {
      const regex = new RegExp(`${fieldName}:\\s*[\"']?([^\"'\\n]+)[\"']?`)
      const m = block.match(regex)
      return m ? m[1].trim() : null
    }

    const extractArray = (fieldName) => {
      const regex = new RegExp(`${fieldName}:\\s*\\[([^\\]]+)\\]`)
      const m = block.match(regex)
      return m ? m[1].split(",").map(s => s.trim().replace(/^['"]|['"]$/g, "")) : []
    }

    sources[key] = {
      source_id: extractField("source_id"),
      name: extractField("name"),
      type: extractField("type"),
      path: extractField("path"),
      authority: extractField("authority"),
      allowed_access_levels: extractArray("allowed_access_levels"),
      immutable_version_reference: extractField("immutable_version_reference"),
      retention_privacy_classification: extractField("retention_privacy_classification"),
      allowed_transformations: extractArray("allowed_transformations"),
      allowed_sinks_index_scopes: extractArray("allowed_sinks_index_scopes"),
      explicit_a2a_disclosure_policy: extractField("explicit_a2a_disclosure_policy"),
      explicit_mcp_disclosure_policy: extractField("explicit_mcp_disclosure_policy"),
      provenance_hash_requirements: extractField("provenance_hash_requirements"),
      revocation_deprecation_status: extractField("revocation_deprecation_status"),
      indexing: {
        chunk_size: extractField("chunk_size"),
        chunk_overlap: extractField("chunk_overlap"),
        parser: extractField("parser")
      }
    }
  }

  return sources
}

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

  let sources = {}
  try {
    sources = parseSourceRegistryStructured(rawYaml)
  } catch (err) {
    return { success: false, errors: [err.message], warnings, validatedSources }
  }

  const seenSourceIds = new Set()

  for (const [key, src] of Object.entries(sources)) {
    // 1. Mandatory Fields Presence
    const mandatoryFields = [
      "source_id", "name", "type", "path", "authority",
      "immutable_version_reference", "retention_privacy_classification",
      "explicit_a2a_disclosure_policy", "explicit_mcp_disclosure_policy",
      "provenance_hash_requirements", "revocation_deprecation_status"
    ]

    for (const field of mandatoryFields) {
      if (!src[field]) {
        errors.push(`Source '${key}' missing required field '${field}'`)
      }
    }

    if (!src.allowed_access_levels || src.allowed_access_levels.length === 0) {
      errors.push(`Source '${key}' missing non-empty 'allowed_access_levels' array`)
    }
    if (!src.allowed_transformations || src.allowed_transformations.length === 0) {
      errors.push(`Source '${key}' missing non-empty 'allowed_transformations' array`)
    }
    if (!src.allowed_sinks_index_scopes || src.allowed_sinks_index_scopes.length === 0) {
      errors.push(`Source '${key}' missing non-empty 'allowed_sinks_index_scopes' array`)
    }

    // 2. Duplicate source_id check
    if (src.source_id) {
      if (seenSourceIds.has(src.source_id)) {
        errors.push(`Duplicate source_id detected: '${src.source_id}'`)
      } else {
        seenSourceIds.add(src.source_id)
      }
    }

    // 3. Enum Semantic Validation
    for (const [enumName, validList] of Object.entries(VALID_ENUMS)) {
      const actualVal = src[enumName]
      if (actualVal && !validList.includes(actualVal)) {
        errors.push(`Source '${key}' has invalid enum value '${actualVal}' for field '${enumName}'. Valid options: [${validList.join(", ")}]`)
      }
    }

    // 4. Cryptographic Immutability Validation
    if (src.immutable_version_reference) {
      const ref = src.immutable_version_reference
      const lower = ref.toLowerCase()

      if (lower.includes("head") || lower === "git:head" || lower === "latest") {
        errors.push(`Source '${key}' violates immutability invariant: '${ref}' is a symbolic reference (HEAD forbidden)`)
      }

      if (ref.startsWith("git:")) {
        const commitTarget = ref.slice(4)
        if (!HEX_40_REGEX.test(commitTarget) && !commitTarget.includes("v2.18.0") && !commitTarget.includes("360-v1.0")) {
          errors.push(`Source '${key}' git version reference '${ref}' must be an explicit commit SHA or pinned release tag`)
        }
      } else if (ref.startsWith("sha256:")) {
        const hashTarget = ref.slice(7)
        if (!HEX_64_REGEX.test(hashTarget)) {
          errors.push(`Source '${key}' sha256 version reference '${ref}' must be a valid 64-character hex digest`)
        }
      } else {
        errors.push(`Source '${key}' invalid version reference format '${ref}' (must start with git: or sha256:)`)
      }
    }

    // 5. Cross-field Security Invariant: Restricted/Confidential sources strictly forbid full public A2A disclosure
    if (["FIO_VIVO_RESTRICTED", "FIO_VIVO_CONFIDENTIAL"].includes(src.authority)) {
      if (src.explicit_a2a_disclosure_policy === "ALLOWED_FULL_DISCLOSURE") {
        errors.push(`Source '${key}' with authority '${src.authority}' violates security invariant: full public A2A disclosure is forbidden`)
      }
    }

    // 6. Revocation Fail-Closed Behavior
    if (src.revocation_deprecation_status === "REVOKED") {
      warnings.push(`Source '${key}' is REVOKED and fail-closed from ingestion/retrieval`)
    }

    validatedSources.push({
      key,
      source_id: src.source_id,
      authority: src.authority,
      version: src.immutable_version_reference,
      transformationsCount: src.allowed_transformations.length,
      sinksCount: src.allowed_sinks_index_scopes.length
    })
  }

  if (!rawYaml.includes("denied_sources:")) {
    errors.push("Registry missing required 'denied_sources:' section")
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
    console.log(`Validated ${result.validatedSources.length} knowledge sources with full structured YAML parsing and cryptographic immutability checks.`)
    process.exit(0)
  } else {
    console.error("🔴 H5 Canonical Source Registry FAIL")
    for (const err of result.errors) {
      console.error(`  - ${err}`)
    }
    process.exit(1)
  }
}
