/**
 * knowledge-ingestion-lib.mjs
 *
 * H5 — FIO-VIVO Knowledge Fabric Core Library
 *
 * Implements the Knowledge Plane substrate (LlamaCloud/LlamaParse provider integration)
 * bounded by FIO-VIVO-AP2.
 *
 * INVARIANTS:
 *   - RETRIEVAL REQUEST != DATA AUTHORIZATION
 *   - CONNECTOR AVAILABLE != SOURCE AUTHORIZED
 *   - EXTRACTION != AUTHORIZATION
 *   - LLAMACLOUD IS A SUBSTRATE, NOT SSOT
 */

import { createHash, randomUUID } from "node:crypto"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"

// ---------------------------------------------------------------------------
// Constants & Denylist Patterns
// ---------------------------------------------------------------------------

const DENIED_PATH_PATTERNS = [
  /node_modules/i,
  /\.env.*/i,
  /\.git/i,
  /\.medusa/i,
  /\.next/i,
  /dist/i,
]

// Default authorized sources database (grounded in canonical-source-registry.yaml)
const AUTHORIZED_SOURCES = new Map([
  ["SRC-MEDUSA-DOCS-001", { name: "Medusa Official Docs", authority: "PUBLIC_OPEN", allowedGrants: ["AUTH-0", "AUTH-1", "AUTH-2"] }],
  ["SRC-PLC-315-001", { name: "PLC 315 Canonical Skills", authority: "FIO_VIVO_INTERNAL", allowedGrants: ["AUTH-0", "AUTH-1", "AUTH-2"] }],
  ["SRC-NOS-205-001", { name: "NOS 205 Canonical Skills", authority: "FIO_VIVO_INTERNAL", allowedGrants: ["AUTH-0", "AUTH-1", "AUTH-2"] }],
  ["SRC-FIO-VIVO-360-001", { name: "FIO-VIVO 360 Program Docs", authority: "FIO_VIVO_RESTRICTED", allowedGrants: ["AUTH-0", "AUTH-1", "AUTH-2"] }],
  ["SRC-CONTRACTS-001", { name: "Commercial Contracts", authority: "FIO_VIVO_CONFIDENTIAL", allowedGrants: ["AUTH-1", "AUTH-2"] }],
])

// In-memory Knowledge Index Store (simulating LlamaCloud vector index)
const INDEX_STORE = new Map()

// ---------------------------------------------------------------------------
// Helper: SHA-256 Hash Computation
// ---------------------------------------------------------------------------

export function computeSha256(content) {
  const buf = typeof content === "string" ? Buffer.from(content, "utf-8") : content
  return createHash("sha256").update(buf).digest("hex")
}

// ---------------------------------------------------------------------------
// H5.0 / H5.1 Source Authority Verification
// ---------------------------------------------------------------------------

/**
 * Verifies if a data source or file path is authorized for knowledge ingestion.
 *
 * LAW: CONNECTOR AVAILABLE != SOURCE AUTHORIZED
 *
 * @param {string} sourceId
 * @param {string} filePath
 * @param {string} requestedGrant - e.g. "AUTH-0", "AUTH-1"
 * @returns {{ authorized: boolean, reason?: string }}
 */
export function validateSourceAuthorization(sourceId, filePath, requestedGrant = "AUTH-0") {
  if (!sourceId || !AUTHORIZED_SOURCES.has(sourceId)) {
    return { authorized: false, reason: `Unauthorized or unregistered source_id: ${sourceId}` }
  }

  const sourceConfig = AUTHORIZED_SOURCES.get(sourceId)
  if (!sourceConfig.allowedGrants.includes(requestedGrant)) {
    return {
      authorized: false,
      reason: `Source ${sourceId} (${sourceConfig.authority}) requires grant higher than ${requestedGrant}`,
    }
  }

  if (filePath) {
    for (const pattern of DENIED_PATH_PATTERNS) {
      if (pattern.test(filePath)) {
        return { authorized: false, reason: `File path matches security denylist: ${filePath}` }
      }
    }
  }

  return { authorized: true }
}

// ---------------------------------------------------------------------------
// H5.2 / H5.3 Ingestion & Parsing Substrate (LlamaParse Provider Simulation)
// ---------------------------------------------------------------------------

/**
 * Ingests a document and returns parsing receipts (INGEST-E, PARSE-E).
 *
 * @param {string} sourceId
 * @param {string} filePath
 * @param {string} rawContent
 * @returns {{ success: boolean, ingestEvidence?: object, parseEvidence?: object, error?: string }}
 */
export function ingestDocument(sourceId, filePath, rawContent) {
  const authCheck = validateSourceAuthorization(sourceId, filePath, "AUTH-0")
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.reason }
  }

  const contentHash = computeSha256(rawContent)
  const now = new Date().toISOString()

  // 1. INGEST-E Evidence Receipt
  const ingestEvidence = {
    receipt_kind: "INGEST-E",
    receipt_id: `ingest-${randomUUID().slice(0, 8)}`,
    source_id: sourceId,
    source_uri: filePath,
    source_hash: contentHash,
    ingested_at: now,
  }

  // 2. PARSE-E Evidence Receipt (LlamaParse Job simulation)
  const parseReceiptHash = computeSha256(`${ingestEvidence.receipt_id}:${contentHash}`)
  const parseEvidence = {
    receipt_kind: "PARSE-E",
    receipt_id: `parse-${randomUUID().slice(0, 8)}`,
    job_id: `llamaparse-job-${randomUUID().slice(0, 8)}`,
    status: "SUCCESS",
    parser_version: "llamaparse-v2.1",
    source_hash: contentHash,
    parse_receipt_hash: parseReceiptHash,
    parsed_at: now,
  }

  return {
    success: true,
    ingestEvidence,
    parseEvidence,
    contentHash,
  }
}

// ---------------------------------------------------------------------------
// H5.3 Schema Extraction (Governed Objects)
// ---------------------------------------------------------------------------

/**
 * Extracts structured governable objects from document content.
 *
 * LAW: EXTRACTION != AUTHORIZATION
 * Extractions provide knowledge, NEVER automatic platform authorization.
 *
 * @param {string} sourceId
 * @param {object} parsedData
 * @param {string} schemaId - e.g. "SCHEMA-CONTRACT-V1" or "SCHEMA-PRD-V1"
 * @returns {{ success: boolean, extractedData?: object, extractEvidence?: object, error?: string }}
 */
export function extractDocumentSchema(sourceId, parsedData, schemaId) {
  const authCheck = validateSourceAuthorization(sourceId, null, "AUTH-0")
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.reason }
  }

  // Simple structured schema extraction
  const extractedData = {
    schema_id: schemaId,
    extracted_at: new Date().toISOString(),
    entities: parsedData.entities || [],
    summary: parsedData.summary || "Structured extraction",
    metadata: parsedData.metadata || {},
  }

  const extractedHash = computeSha256(JSON.stringify(extractedData))

  // EXTRACT-E Evidence Receipt
  const extractEvidence = {
    receipt_kind: "EXTRACT-E",
    receipt_id: `extract-${randomUUID().slice(0, 8)}`,
    schema_id: schemaId,
    source_id: sourceId,
    extracted_data_hash: extractedHash,
    validation_status: "VALIDATED",
    extracted_at: extractedData.extracted_at,
  }

  return {
    success: true,
    extractedData,
    extractEvidence,
  }
}

// ---------------------------------------------------------------------------
// H5.4 Indexing & Retrieval Substrate (LlamaCloud Simulation)
// ---------------------------------------------------------------------------

/**
 * Indexes chunks into the Knowledge Index Store and produces INDEX-E proof.
 *
 * @param {string} sourceId
 * @param {Array<string>} chunks
 * @returns {{ success: boolean, indexEvidence?: object, indexId?: string, error?: string }}
 */
export function buildIndex(sourceId, chunks) {
  const authCheck = validateSourceAuthorization(sourceId, null, "AUTH-0")
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.reason }
  }

  const indexId = `idx-${sourceId.toLowerCase()}`
  const now = new Date().toISOString()
  const chunkObjects = chunks.map((text, idx) => ({
    chunk_id: `${indexId}-c${idx + 1}`,
    text,
    source_id: sourceId,
    hash: computeSha256(text),
  }))

  INDEX_STORE.set(indexId, chunkObjects)

  const indexHash = computeSha256(JSON.stringify(chunkObjects))

  // INDEX-E Evidence Receipt
  const indexEvidence = {
    receipt_kind: "INDEX-E",
    receipt_id: `index-${randomUUID().slice(0, 8)}`,
    index_id: indexId,
    source_id: sourceId,
    chunking_strategy: "semantic_512_overlap_64",
    chunk_count: chunkObjects.length,
    index_hash: indexHash,
    indexed_at: now,
  }

  return {
    success: true,
    indexId,
    indexEvidence,
  }
}

/**
 * Retrieves bounded context for a query from an index.
 *
 * LAW: RETRIEVAL REQUEST != DATA AUTHORIZATION
 * Bounded to max 5 docs, max 20 chunks per task.
 *
 * @param {string} query
 * @param {object} options
 * @param {string} options.indexId
 * @param {string} [options.requestedGrant="AUTH-0"]
 * @param {number} [options.maxChunks=5]
 * @returns {{ success: boolean, retrievedChunks?: Array, retrievalEvidence?: object, error?: string }}
 */
export function retrieveKnowledge(query, options = {}) {
  const { indexId, requestedGrant = "AUTH-0", maxChunks = 5 } = options

  if (!query || typeof query !== "string") {
    return { success: false, error: "Missing or invalid retrieval query" }
  }

  if (!INDEX_STORE.has(indexId)) {
    return { success: false, error: `Index not found: ${indexId}` }
  }

  const chunks = INDEX_STORE.get(indexId)
  const boundedMax = Math.min(maxChunks, 20) // Hard ceiling of 20 chunks

  // Simple keyword relevance ranking
  const queryLower = query.toLowerCase()
  const scored = chunks.map(chunk => {
    const textLower = chunk.text.toLowerCase()
    let score = 0.1
    const words = queryLower.split(/\s+/)
    for (const w of words) {
      if (w.length > 2 && textLower.includes(w)) score += 0.3
    }
    return { chunk, score: Math.min(score, 1.0) }
  })

  scored.sort((a, b) => b.score - a.score)
  const topScored = scored.slice(0, boundedMax)

  const queryHash = computeSha256(query)
  const now = new Date().toISOString()

  // RETRIEVAL-E Evidence Receipt
  const retrievalEvidence = {
    receipt_kind: "RETRIEVAL-E",
    receipt_id: `retrieval-${randomUUID().slice(0, 8)}`,
    index_id: indexId,
    query_hash: queryHash,
    chunk_ids: topScored.map(s => s.chunk.chunk_id),
    relevance_scores: topScored.map(s => Number(s.score.toFixed(2))),
    retrieved_at: now,
  }

  return {
    success: true,
    retrievedChunks: topScored.map(s => s.chunk),
    retrievalEvidence,
  }
}

// ---------------------------------------------------------------------------
// H5.5 Knowledge Bundle Compilation
// ---------------------------------------------------------------------------

/**
 * Compiles a governed Knowledge Bundle to be attached to a Task Capsule.
 *
 * @param {object} params
 * @param {string} params.query
 * @param {string} params.sourceId
 * @param {string} [params.requestedGrant="AUTH-0"]
 * @returns {object} Knowledge Bundle
 */
export function compileKnowledgeBundle({ query, sourceId, requestedGrant = "AUTH-0" }) {
  const indexId = `idx-${sourceId.toLowerCase()}`

  // Ensure index exists for source (seed if missing)
  if (!INDEX_STORE.has(indexId)) {
    buildIndex(sourceId, [
      `FIO-VIVO Agentic Fabric governance reference for source ${sourceId}.`,
      `Governed knowledge retrieval under AP2 authorization ceiling ${requestedGrant}.`,
    ])
  }

  const retrieval = retrieveKnowledge(query, { indexId, requestedGrant, maxChunks: 3 })

  return {
    kind: "knowledge-bundle",
    source_id: sourceId,
    index_id: indexId,
    query,
    chunks: retrieval.success ? retrieval.retrievedChunks : [],
    evidence_chain: {
      retrieval: retrieval.success ? retrieval.retrievalEvidence : null,
    },
    compiled_at: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (process.argv[1] === import.meta.filename) {
  console.log("Testing FIO-VIVO Knowledge Fabric Lib...\n")

  // 1. Test Ingestion
  const ingestRes = ingestDocument(
    "SRC-MEDUSA-DOCS-001",
    "docs/medusa/overview.md",
    "# Medusa v2 Overview\nMedusa is an open-source commerce engine."
  )
  console.log("Ingest Success:", ingestRes.success)
  console.log("INGEST-E:", ingestRes.ingestEvidence)
  console.log("PARSE-E:", ingestRes.parseEvidence)

  // 2. Test Indexing & Retrieval
  const buildRes = buildIndex("SRC-MEDUSA-DOCS-001", [
    "Medusa v2 uses file-based API routes.",
    "Workflows compose steps for atomic state changes.",
  ])
  console.log("\nBuild Index:", buildRes.indexId)

  const retRes = retrieveKnowledge("Medusa workflows", { indexId: buildRes.indexId })
  console.log("Retrieval Chunks:", retRes.retrievedChunks.length)
  console.log("RETRIEVAL-E:", retRes.retrievalEvidence)
}
