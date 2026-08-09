/**
 * knowledge-adversarial-corpus.test.mjs
 *
 * H5.6 — Knowledge Fabric Adversarial & Security Test Suite
 *
 * Tests 6 Knowledge Security Groups:
 *   1. UNAUTHORIZED_SOURCE   (Rejects unregistered source ID and denylist paths)
 *   2. GRANT_ELEVATION       (Rejects confidential sources under AUTH-0)
 *   3. RETRIEVAL_LIMITS      (Enforces hard chunk ceilings and bounded context)
 *   4. EXTRACTION_GOV        (Extractions provide data, NEVER platform authority)
 *   5. PROVENANCE_INTEGRITY  (Validates INGEST-E .. RETRIEVAL-E receipt chains)
 *   6. A2A_DISCLOSURE        (Verifies zero leakage in external knowledge responses)
 */

import test from "node:test"
import assert from "node:assert/strict"
import path from "node:path"
import {
  handleIngestRequest,
  handleQueryRequest,
  handleExtractSchemaRequest,
} from "../knowledge-ingestion-gateway.mjs"
import {
  validateSourceAuthorization,
  ingestDocument,
  extractDocumentSchema,
  retrieveKnowledge,
  buildIndex,
} from "../knowledge-ingestion-lib.mjs"

// ---------------------------------------------------------------------------
// GROUP 1: UNAUTHORIZED_SOURCE
// ---------------------------------------------------------------------------

test("UNAUTHORIZED_SOURCE: Rejects unregistered source ID", () => {
  const check = validateSourceAuthorization("SRC-UNKNOWN-999", "docs/test.md", "AUTH-0")
  assert.equal(check.authorized, false)
  assert.match(check.reason, /Unregistered source_id/i)
})

test("UNAUTHORIZED_SOURCE: Rejects security denylist paths (e.g. node_modules, .env)", () => {
  const checkEnv = validateSourceAuthorization("SRC-MEDUSA-DOCS-001", "apps/backend/.env", "AUTH-0")
  assert.equal(checkEnv.authorized, false)
  assert.match(checkEnv.reason, /security denylist/i)

  const checkModules = validateSourceAuthorization("SRC-MEDUSA-DOCS-001", "node_modules/express/index.js", "AUTH-0")
  assert.equal(checkModules.authorized, false)
  assert.match(checkModules.reason, /security denylist/i)
})

// ---------------------------------------------------------------------------
// GROUP 2: GRANT_ELEVATION
// ---------------------------------------------------------------------------

test("GRANT_ELEVATION: Rejects confidential contract source under AUTH-0 grant", () => {
  const check = validateSourceAuthorization("SRC-CONTRACTS-001", "docs/artifacts/contracts/nda.pdf", "AUTH-0")
  assert.equal(check.authorized, false)
  assert.match(check.reason, /requires grant higher than AUTH-0/i)
})

test("GRANT_ELEVATION: Allows confidential contract source under AUTH-1 grant", () => {
  const check = validateSourceAuthorization("SRC-CONTRACTS-001", "docs/artifacts/contracts/nda.pdf", "AUTH-1")
  assert.equal(check.authorized, true)
})

// ---------------------------------------------------------------------------
// GROUP 3: RETRIEVAL_LIMITS
// ---------------------------------------------------------------------------

test("RETRIEVAL_LIMITS: Enforces hard ceiling of 20 chunks max per retrieval task", () => {
  const chunks = Array.from({ length: 50 }, (_, i) => `Chunk paragraph ${i + 1} content.`)
  buildIndex("SRC-PLC-315-001", chunks)

  const result = retrieveKnowledge("content", { indexId: "idx-src-plc-315-001", maxChunks: 100 })
  assert.equal(result.success, true)
  assert.equal(result.retrievedChunks.length, 20) // Bounded to 20 hard ceiling
  assert.equal(result.retrievalEvidence.chunk_ids.length, 20)
})

// ---------------------------------------------------------------------------
// GROUP 4: EXTRACTION_GOVERNANCE
// ---------------------------------------------------------------------------

test("EXTRACTION_GOV: Schema extraction provides structured data but 0 platform grants", () => {
  const extractRes = extractDocumentSchema("SRC-MEDUSA-DOCS-001", { summary: "Pay $500 to vendor" }, "SCHEMA-PAYMENT-V1")
  assert.equal(extractRes.success, true)
  assert.equal(extractRes.extractEvidence.receipt_kind, "EXTRACT-E")
  assert.equal(extractRes.extractEvidence.validation_status, "VALIDATED")
  // Verify extraction object carries no authority flags
  assert.equal(extractRes.extractedData.grants, undefined)
  assert.equal(extractRes.extractedData.write_set, undefined)
})

// ---------------------------------------------------------------------------
// GROUP 5: PROVENANCE_INTEGRITY
// ---------------------------------------------------------------------------

test("PROVENANCE_INTEGRITY: Validates full receipt chain (INGEST-E, PARSE-E, INDEX-E, RETRIEVAL-E)", () => {
  const ingestRes = ingestDocument("SRC-MEDUSA-DOCS-001", "docs/medusa/api.md", "GET /store/products API definition")
  assert.equal(ingestRes.success, true)
  assert.equal(ingestRes.ingestEvidence.receipt_kind, "INGEST-E")
  assert.ok(ingestRes.ingestEvidence.source_hash)

  assert.equal(ingestRes.parseEvidence.receipt_kind, "PARSE-E")
  assert.equal(ingestRes.parseEvidence.status, "SUCCESS")
  assert.ok(ingestRes.parseEvidence.parse_receipt_hash)

  const indexRes = buildIndex("SRC-MEDUSA-DOCS-001", ["GET /store/products API definition"])
  assert.equal(indexRes.success, true)
  assert.equal(indexRes.indexEvidence.receipt_kind, "INDEX-E")

  const retRes = retrieveKnowledge("store products", { indexId: indexRes.indexId })
  assert.equal(retRes.success, true)
  assert.equal(retRes.retrievalEvidence.receipt_kind, "RETRIEVAL-E")
})

// ---------------------------------------------------------------------------
// GROUP 6: A2A_DISCLOSURE
// ---------------------------------------------------------------------------

test("A2A_DISCLOSURE: Gateway query returns governed chunks without internal leakage", () => {
  handleIngestRequest({
    sourceId: "SRC-MEDUSA-DOCS-001",
    filePath: path.resolve(process.cwd(), ".agents/canonical-source-registry.yaml"),
  })

  const queryRes = handleQueryRequest({
    sourceId: "SRC-MEDUSA-DOCS-001",
    query: "Medusa",
  })

  assert.equal(queryRes.success, true)
  assert.ok(queryRes.chunks.length > 0)
  assert.equal(queryRes.evidence.retrieval.receipt_kind, "RETRIEVAL-E")

  const serialized = JSON.stringify(queryRes)
  assert.doesNotMatch(serialized, /fencing_token/i)
  assert.doesNotMatch(serialized, /lease_id/i)
  assert.doesNotMatch(serialized, /canonical-worker/i)
})
