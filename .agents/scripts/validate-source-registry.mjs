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

export function parseSourceRegistry(rawYaml) {
  if (!rawYaml.includes("kind: canonical-source-registry")) {
    throw new Error("Invalid kind in source registry (expected 'kind: canonical-source-registry')")
  }

  const sourcesSectionIndex = rawYaml.indexOf("sources:\n")
  const deniedSectionIndex = rawYaml.indexOf("denied_sources:")

  if (sourcesSectionIndex === -1) {
    throw new Error("Missing required top-level 'sources:' section")
  }

  const sourcesContent = rawYaml.slice(sourcesSectionIndex + 9, deniedSectionIndex !== -1 ? deniedSectionIndex : undefined)
  const blockRegex = /\n  ([a-zA-Z0-9_-]+):/g
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

    sources[key] = {
      source_id: extractField("source_id"),
      name: extractField("name"),
      type: extractField("type"),
      path: extractField("path"),
      authority: extractField("authority"),
      immutable_version_reference: extractField("immutable_version_reference"),
      retention_privacy_classification: extractField("retention_privacy_classification"),
      explicit_a2a_disclosure_policy: extractField("explicit_a2a_disclosure_policy"),
      explicit_mcp_disclosure_policy: extractField("explicit_mcp_disclosure_policy"),
      provenance_hash_requirements: extractField("provenance_hash_requirements"),
      revocation_deprecation_status: extractField("revocation_deprecation_status")
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
    sources = parseSourceRegistry(rawYaml)
  } catch (err) {
    return { success: false, errors: [err.message], warnings, validatedSources }
  }

  const seenSourceIds = new Set()

  for (const [key, src] of Object.entries(sources)) {
    // 1. Mandatory Fields Presence
    for (const [field, val] of Object.entries(src)) {
      if (!val) {
        errors.push(`Source '${key}' missing required field '${field}'`)
      }
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

    // 4. Invariant: immutable_version_reference MUST NOT be symbolic HEAD or unpinned placeholder
    if (src.immutable_version_reference) {
      const ver = src.immutable_version_reference.toLowerCase()
      if (ver.includes("head") || ver === "git:head" || ver === "latest") {
        errors.push(`Source '${key}' violates immutability invariant: '${src.immutable_version_reference}' is a symbolic reference (HEAD forbidden)`)
      }
      if (!ver.startsWith("git:") && !ver.startsWith("sha256:")) {
        errors.push(`Source '${key}' invalid version reference format '${src.immutable_version_reference}' (must start with git: or sha256:)`)
      }
    }

    // 5. Cross-field Invariant: Restricted or Confidential sources strictly forbid full public A2A disclosure
    if (["FIO_VIVO_RESTRICTED", "FIO_VIVO_CONFIDENTIAL"].includes(src.authority)) {
      if (src.explicit_a2a_disclosure_policy === "ALLOWED_FULL_DISCLOSURE") {
        errors.push(`Source '${key}' with authority '${src.authority}' violates security invariant: full public A2A disclosure is forbidden`)
      }
    }

    validatedSources.push({
      key,
      source_id: src.source_id,
      authority: src.authority,
      version: src.immutable_version_reference
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
    console.log(`Validated ${result.validatedSources.length} knowledge sources with strict semantic schema checks.`)
    process.exit(0)
  } else {
    console.error("🔴 H5 Canonical Source Registry FAIL")
    for (const err of result.errors) {
      console.error(`  - ${err}`)
    }
    process.exit(1)
  }
}
