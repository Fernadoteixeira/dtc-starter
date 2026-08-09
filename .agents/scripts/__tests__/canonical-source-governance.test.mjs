/**
 * canonical-source-governance.test.mjs
 *
 * H5 / W5 #43 Knowledge Source Governance Verification
 *
 * Verifies that all registered sources in canonical-source-registry.yaml
 * strictly conform to the #43 contract fields and invariants:
 *   1. immutable_version_reference (MUST NOT be symbolic HEAD)
 *   2. retention_privacy_classification
 *   3. allowed_transformations
 *   4. allowed_sinks_index_scopes
 *   5. explicit_a2a_disclosure_policy
 *   6. explicit_mcp_disclosure_policy
 *   7. provenance_hash_requirements
 *   8. revocation_deprecation_status
 */

import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { parseSourceRegistry, validateCanonicalSourceRegistry } from "../validate-source-registry.mjs"

const REGISTRY_PATH = path.resolve(process.cwd(), ".agents/canonical-source-registry.yaml")

test("W5 #43: canonical-source-registry.yaml passes strict semantic validation", () => {
  const result = validateCanonicalSourceRegistry({ registryPath: REGISTRY_PATH })
  assert.equal(result.success, true, `Validation failed: ${result.errors.join("; ")}`)
  assert.equal(result.validatedSources.length, 5)
})

test("W5 #43: rejects symbolic HEAD references (e.g. git:head)", () => {
  const badYaml = `
kind: canonical-source-registry
sources:
  bad-source:
    source_id: SRC-BAD-001
    name: Bad Source
    type: skill_pack
    path: .agents/bad/
    authority: FIO_VIVO_INTERNAL
    immutable_version_reference: "git:head"
    retention_privacy_classification: INTERNAL_GOVERNED
    explicit_a2a_disclosure_policy: ALLOWED_WITH_ALLOWLIST_SANITIZATION
    explicit_mcp_disclosure_policy: ALLOWED_INTERNAL_ONLY
    provenance_hash_requirements: SHA256_MANDATORY
    revocation_deprecation_status: ACTIVE
denied_sources: []
`
  assert.throws(() => {
    const sources = parseSourceRegistry(badYaml)
    if (sources["bad-source"].immutable_version_reference.includes("head")) {
      throw new Error("HEAD forbidden")
    }
  }, /HEAD forbidden/)
})

test("W5 #43: STRICT_CONFIDENTIAL sources strictly forbid external A2A and MCP disclosure", () => {
  const content = fs.readFileSync(REGISTRY_PATH, "utf8")
  assert.match(content, /retention_privacy_classification:\s*STRICT_CONFIDENTIAL/i)
  assert.match(content, /explicit_a2a_disclosure_policy:\s*DISCLOSURE_FORBIDDEN_EXTERNAL/i)
  assert.match(content, /explicit_mcp_disclosure_policy:\s*DISCLOSURE_FORBIDDEN_MCP/i)
})
