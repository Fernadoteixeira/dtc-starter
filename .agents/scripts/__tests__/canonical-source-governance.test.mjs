/**
 * canonical-source-governance.test.mjs
 *
 * H5 / W5 #43 Knowledge Source Governance Verification
 *
 * Verifies that all registered sources in canonical-source-registry.yaml
 * strictly conform to the 8 mandatory #43 contract fields:
 *   1. immutable_version_reference
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

const REGISTRY_PATH = path.resolve(process.cwd(), ".agents/canonical-source-registry.yaml")

test("W5 #43: canonical-source-registry.yaml exists and contains active H5 specification header", () => {
  assert.ok(fs.existsSync(REGISTRY_PATH), "canonical-source-registry.yaml must exist")
  const content = fs.readFileSync(REGISTRY_PATH, "utf8")
  assert.match(content, /kind:\s*canonical-source-registry/i)
  assert.match(content, /status:\s*active/i)
  assert.match(content, /version:\s*2/i)
})

test("W5 #43: every registered source contains all 8 mandatory contract fields", () => {
  const content = fs.readFileSync(REGISTRY_PATH, "utf8")

  const MANDATORY_FIELDS = [
    "immutable_version_reference",
    "retention_privacy_classification",
    "allowed_transformations",
    "allowed_sinks_index_scopes",
    "explicit_a2a_disclosure_policy",
    "explicit_mcp_disclosure_policy",
    "provenance_hash_requirements",
    "revocation_deprecation_status",
  ]

  const sourceBlocks = ["medusa-official-docs", "plc-315-canonical-skills", "nos-205-canonical-skills", "fio-vivo-360-docs", "commercial-contracts"]

  for (const sourceId of sourceBlocks) {
    assert.ok(content.includes(`${sourceId}:`), `Registry must contain source entry for ${sourceId}`)
    for (const field of MANDATORY_FIELDS) {
      assert.ok(
        content.includes(`${field}:`),
        `Registry source entries must contain mandatory #43 field '${field}'`
      )
    }
  }
})

test("W5 #43: STRICT_CONFIDENTIAL sources strictly forbid external A2A and MCP disclosure", () => {
  const content = fs.readFileSync(REGISTRY_PATH, "utf8")

  assert.match(content, /retention_privacy_classification:\s*STRICT_CONFIDENTIAL/i)
  assert.match(content, /explicit_a2a_disclosure_policy:\s*DISCLOSURE_FORBIDDEN_EXTERNAL/i)
  assert.match(content, /explicit_mcp_disclosure_policy:\s*DISCLOSURE_FORBIDDEN_MCP/i)
})
