/**
 * canonical-source-governance.test.mjs
 *
 * H5 / W5 #43 Knowledge Source Governance Verification
 */

import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { validateCanonicalSourceRegistry } from "../validate-source-registry.mjs"

const REGISTRY_PATH = path.resolve(process.cwd(), ".agents/canonical-source-registry.yaml")

test("W5 #43: canonical-source-registry.yaml passes strict semantic validation", () => {
  const result = validateCanonicalSourceRegistry({ registryPath: REGISTRY_PATH })
  assert.equal(result.success, true, `Validation failed: ${result.errors.join("; ")}`)
  assert.equal(result.validatedSources.length, 5)
})

test("W5 #43: rejects symbolic HEAD references", () => {
  const tempPath = path.resolve(process.cwd(), ".agents/scripts/__tests__/temp-bad-registry.yaml")
  const badYaml = `kind: canonical-source-registry
sources:
  bad-source:
    source_id: SRC-BAD-001
    name: Bad Source
    type: skill_pack
    path: .agents/bad/
    authority: FIO_VIVO_INTERNAL
    allowed_access_levels: [AUTH-0]
    immutable_version_reference: "git:head"
    retention_privacy_classification: INTERNAL_GOVERNED
    allowed_transformations: [embed]
    allowed_sinks_index_scopes: [skill_index]
    explicit_a2a_disclosure_policy: ALLOWED_WITH_ALLOWLIST_SANITIZATION
    explicit_mcp_disclosure_policy: ALLOWED_INTERNAL_ONLY
    provenance_hash_requirements: SHA256_MANDATORY
    revocation_deprecation_status: ACTIVE
    indexing:
      chunk_size: 512
denied_sources: []
`
  fs.writeFileSync(tempPath, badYaml)
  try {
    const res = validateCanonicalSourceRegistry({ registryPath: tempPath })
    assert.equal(res.success, false, "Must fail for symbolic git:head")
    assert.ok(res.errors.some(e => e.includes("symbolic reference")), "Error must mention symbolic reference")
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
  }
})

test("W5 #43: STRICT_CONFIDENTIAL sources strictly forbid external A2A and MCP disclosure", () => {
  const content = fs.readFileSync(REGISTRY_PATH, "utf8")
  assert.match(content, /retention_privacy_classification:\s*STRICT_CONFIDENTIAL/i)
  assert.match(content, /explicit_a2a_disclosure_policy:\s*DISCLOSURE_FORBIDDEN_EXTERNAL/i)
  assert.match(content, /explicit_mcp_disclosure_policy:\s*DISCLOSURE_FORBIDDEN_MCP/i)
})
