/**
 * knowledge-ingestion-gateway.mjs
 *
 * H5.2 — Knowledge Ingestion & Retrieval Gateway
 *
 * Sovereign gateway for document ingestion, parsing, indexing, and retrieval.
 * All operations cross FIO-VIVO-AP2 authorization checks before execution.
 *
 * INVARIANTS:
 *   - RETRIEVAL REQUEST != DATA AUTHORIZATION
 *   - CONNECTOR AVAILABLE != SOURCE AUTHORIZED
 *   - EXTRACTION != AUTHORIZATION
 */

import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import {
  validateSourceAuthorization,
  ingestDocument,
  extractDocumentSchema,
  buildIndex,
  retrieveKnowledge,
  compileKnowledgeBundle,
} from "./knowledge-ingestion-lib.mjs"

/**
 * Ingests a file through the FIO-VIVO Knowledge Gateway.
 *
 * @param {object} params
 * @param {string} params.sourceId
 * @param {string} params.filePath
 * @param {string} [params.requestedGrant="AUTH-0"]
 * @returns {object} Ingestion result
 */
export function handleIngestRequest({ sourceId, filePath, requestedGrant = "AUTH-0" }) {
  const authCheck = validateSourceAuthorization(sourceId, filePath, requestedGrant)
  if (!authCheck.authorized) {
    return {
      success: false,
      error: { code: "SOURCE_UNAUTHORIZED", message: authCheck.reason },
    }
  }

  if (!existsSync(filePath)) {
    return {
      success: false,
      error: { code: "FILE_NOT_FOUND", message: `File does not exist: ${filePath}` },
    }
  }

  const content = readFileSync(filePath, "utf-8")
  const ingestRes = ingestDocument(sourceId, filePath, content)
  if (!ingestRes.success) {
    return { success: false, error: { code: "INGEST_FAILED", message: ingestRes.error } }
  }

  // Split into simple 512-character chunks
  const chunks = []
  for (let i = 0; i < content.length; i += 512) {
    chunks.push(content.slice(i, i + 512))
  }

  const indexRes = buildIndex(sourceId, chunks)

  return {
    success: true,
    sourceId,
    filePath,
    contentHash: ingestRes.contentHash,
    evidence: {
      ingest: ingestRes.ingestEvidence,
      parse: ingestRes.parseEvidence,
      index: indexRes.indexEvidence,
    },
  }
}

/**
 * Queries knowledge through the FIO-VIVO Knowledge Gateway.
 *
 * @param {object} params
 * @param {string} params.sourceId
 * @param {string} params.query
 * @param {string} [params.requestedGrant="AUTH-0"]
 * @param {number} [params.maxChunks=5]
 * @returns {object} Query result
 */
export function handleQueryRequest({ sourceId, query, requestedGrant = "AUTH-0", maxChunks = 5 }) {
  const authCheck = validateSourceAuthorization(sourceId, null, requestedGrant)
  if (!authCheck.authorized) {
    return {
      success: false,
      error: { code: "SOURCE_UNAUTHORIZED", message: authCheck.reason },
    }
  }

  const indexId = `idx-${sourceId.toLowerCase()}`
  const retrieval = retrieveKnowledge(query, { indexId, requestedGrant, maxChunks })

  if (!retrieval.success) {
    return {
      success: false,
      error: { code: "RETRIEVAL_FAILED", message: retrieval.error },
    }
  }

  return {
    success: true,
    query,
    sourceId,
    chunks: retrieval.retrievedChunks,
    evidence: {
      retrieval: retrieval.retrievalEvidence,
    },
  }
}

/**
 * Extracts structured schema from a document through the FIO-VIVO Knowledge Gateway.
 *
 * @param {object} params
 * @param {string} params.sourceId
 * @param {string} params.filePath
 * @param {string} params.schemaId
 * @param {string} [params.requestedGrant="AUTH-0"]
 * @returns {object} Schema extraction result
 */
export function handleExtractSchemaRequest({ sourceId, filePath, schemaId, requestedGrant = "AUTH-0" }) {
  const authCheck = validateSourceAuthorization(sourceId, filePath, requestedGrant)
  if (!authCheck.authorized) {
    return {
      success: false,
      error: { code: "SOURCE_UNAUTHORIZED", message: authCheck.reason },
    }
  }

  if (!existsSync(filePath)) {
    return {
      success: false,
      error: { code: "FILE_NOT_FOUND", message: `File does not exist: ${filePath}` },
    }
  }

  const content = readFileSync(filePath, "utf-8")
  const mockParsedData = {
    entities: [{ type: "Document", name: path.basename(filePath) }],
    summary: content.slice(0, 200),
    metadata: { line_count: content.split("\n").length },
  }

  const extractRes = extractDocumentSchema(sourceId, mockParsedData, schemaId)
  if (!extractRes.success) {
    return { success: false, error: { code: "EXTRACTION_FAILED", message: extractRes.error } }
  }

  return {
    success: true,
    sourceId,
    filePath,
    schemaId,
    extractedData: extractRes.extractedData,
    evidence: {
      extract: extractRes.extractEvidence,
    },
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (process.argv[1] === import.meta.filename) {
  console.log("Testing Knowledge Ingestion Gateway CLI...\n")

  const targetFile = path.resolve(process.cwd(), "docs/medusa/README.md")
  if (!existsSync(targetFile)) {
    console.log("Creating dummy doc file for gateway test...")
    // Seed test directory if needed
  }

  const ingestResult = handleIngestRequest({
    sourceId: "SRC-MEDUSA-DOCS-001",
    filePath: path.resolve(process.cwd(), ".agents/canonical-source-registry.yaml"),
  })

  console.log("Gateway Ingest Result:", ingestResult.success)
  if (ingestResult.success) {
    console.log("Ingest Evidence:", ingestResult.evidence.ingest.receipt_kind)
    console.log("Parse Evidence:", ingestResult.evidence.parse.receipt_kind)
    console.log("Index Evidence:", ingestResult.evidence.index.receipt_kind)
  }

  const queryResult = handleQueryRequest({
    sourceId: "SRC-MEDUSA-DOCS-001",
    query: "canonical source registry",
  })

  console.log("\nGateway Query Result:", queryResult.success)
  if (queryResult.success) {
    console.log("Retrieved Chunks:", queryResult.chunks.length)
    console.log("Retrieval Evidence:", queryResult.evidence.retrieval.receipt_kind)
  }
}
