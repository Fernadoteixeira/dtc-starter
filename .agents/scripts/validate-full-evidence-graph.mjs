import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import {
  assertObject,
  canonicalRepoPath,
  failCli,
  hashFile,
  readJson,
  writeJsonExclusive
} from "./canonical-execution-lib.mjs"

const SCRIPT_PATH = fileURLToPath(import.meta.url)
const REPO_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..", "..")

export const HISTORICAL_GATE_DIRS = Object.freeze([
  "ef-01",
  "arch-ef",
  "arch-ef-r1",
  "ef-02",
  "ef-03",
  "ef-04"
])

export function validateFullEvidenceGraph(options = {}) {
  const baseDir = options.baseDir || path.join(REPO_ROOT, "docs", "artifacts", "bb-nos", "nos-001", "execution-fabric")
  const gateDirs = options.gateDirs || HISTORICAL_GATE_DIRS

  const nodes = []
  const edges = []
  const indexedReceipts = new Map() // receipt_id -> { file, receipt, gate }
  const indexedArtifacts = new Map() // relative_path -> { sha256, gate }
  const recordedSessionsByGate = new Map() // gate -> { worker: Set, reviewer: Set }

  const danglingReferences = []
  const orphanReceipts = []
  const duplicateReceiptCollisions = []
  const hashMismatches = []
  const sessionCollisions = []
  const invocationCollisions = []
  const brokenArtifactReferences = []
  const reviewedArtifactMismatches = []
  const predecessorFailures = []
  const provenanceErrors = []

  // 1. Index all files across historical gates
  for (const gate of gateDirs) {
    const gatePath = path.join(baseDir, gate)
    if (!existsSync(gatePath)) {
      predecessorFailures.push({ gate, error: `Gate directory does not exist: ${gatePath}` })
      continue
    }

    const files = readdirSync(gatePath)
    if (!recordedSessionsByGate.has(gate)) {
      recordedSessionsByGate.set(gate, { workerSessions: new Set(), reviewerSessions: new Set(), workerInvocations: new Set(), reviewerInvocations: new Set() })
    }
    const gateSessions = recordedSessionsByGate.get(gate)

    for (const file of files) {
      const fullPath = path.join(gatePath, file)
      if (statSync(fullPath).isDirectory()) continue

      const relativeRepoPath = path.relative(REPO_ROOT, fullPath).split(path.sep).join("/")
      const canonicalPath = canonicalRepoPath(relativeRepoPath)
      const realSha256 = hashFile(canonicalPath)
      indexedArtifacts.set(canonicalPath, { gate, file, sha256: realSha256 })
      nodes.push({
        id: canonicalPath,
        kind: "artifact",
        gate,
        sha256: realSha256
      })

      if (file.endsWith(".json")) {
        try {
          const content = readJson(canonicalPath)
          if (content && typeof content === "object") {
            // Check if it's a receipt or bundle
            const receiptsToProcess = []
            if (content.receipt_id && content.type) {
              receiptsToProcess.push(content)
            }
            if (Array.isArray(content.receipts)) {
              for (const r of content.receipts) {
                if (r && r.receipt_id && r.type) receiptsToProcess.push(r)
              }
            }

            for (const receipt of receiptsToProcess) {
              const receiptId = receipt.receipt_id
              if (indexedReceipts.has(receiptId)) {
                duplicateReceiptCollisions.push({
                  receipt_id: receiptId,
                  gate,
                  first_seen: indexedReceipts.get(receiptId).file,
                  colliding_file: relativeRepoPath
                })
              } else {
                indexedReceipts.set(receiptId, { gate, file: relativeRepoPath, receipt })
                nodes.push({
                  id: receiptId,
                  kind: "receipt",
                  type: receipt.type,
                  gate,
                  status: receipt.status
                })
              }

              // Check hash integrity if receipt records sha256
              if (receipt.path && receipt.sha256) {
                const targetPath = canonicalRepoPath(receipt.path)
                if (!existsSync(path.join(REPO_ROOT, targetPath))) {
                  brokenArtifactReferences.push({
                    gate,
                    receipt_id: receiptId,
                    referenced_path: targetPath,
                    error: "Referenced path does not exist on disk"
                  })
                } else {
                  const actualHash = hashFile(targetPath)
                  if (actualHash !== receipt.sha256) {
                    hashMismatches.push({
                      gate,
                      receipt_id: receiptId,
                      path: targetPath,
                      expected_sha256: receipt.sha256,
                      actual_sha256: actualHash
                    })
                  }
                }
              }

              // Check for self-certified pass / fake validation constants
              if (receipt.all_terms_satisfied !== undefined || (receipt.orphan_receipts !== undefined && typeof receipt.orphan_receipts === "number")) {
                provenanceErrors.push({
                  gate,
                  receipt_id: receiptId,
                  error: "SELF_CERTIFIED_PASS detected: receipt contains hardcoded validation constants"
                })
              }

              // Check provenance isolation
              if (receipt.provenance) {
                const prov = receipt.provenance
                const execKind = prov.execution_kind || (receipt.type === "REVIEW-E" ? "reviewer" : "worker")
                const sessId = prov.host_session_id
                const invId = prov.invocation_id || receipt.invocation_id

                if (!sessId || typeof sessId !== "string" || sessId.length === 0) {
                  provenanceErrors.push({ gate, receipt_id: receiptId, error: "Missing or invalid host_session_id in provenance" })
                }

                if (execKind === "worker") {
                  if (sessId) gateSessions.workerSessions.add(sessId)
                  if (invId) gateSessions.workerInvocations.add(invId)
                } else if (execKind === "reviewer") {
                  if (sessId) {
                    gateSessions.reviewerSessions.add(sessId)
                    if (gateSessions.workerSessions.has(sessId)) {
                      sessionCollisions.push({
                        gate,
                        receipt_id: receiptId,
                        host_session_id: sessId,
                        error: "Worker and Reviewer share the same host_session_id"
                      })
                    }
                  }
                  if (invId) {
                    gateSessions.reviewerInvocations.add(invId)
                    if (gateSessions.workerInvocations.has(invId)) {
                      invocationCollisions.push({
                        gate,
                        receipt_id: receiptId,
                        invocation_id: invId,
                        error: "Worker and Reviewer share the same invocation_id"
                      })
                    }
                  }
                }
              }
            }
          }
        } catch (e) {
          predecessorFailures.push({ gate, file: relativeRepoPath, error: e.message })
        }
      }
    }
  }

  // 2. Validate all reference edges and detect dangling references
  for (const [receiptId, entry] of indexedReceipts.entries()) {
    const { receipt, gate, file } = entry

    // Reference properties to inspect
    const refFields = [
      "route_receipt_ref",
      "agent_load_receipt_ref",
      "protocol_receipt_ref",
      "dispatcher_receipt_ref",
      "adapter_receipt_ref",
      "review_target",
      "worker_run_ref"
    ]

    for (const field of refFields) {
      if (receipt[field] && typeof receipt[field] === "string") {
        const targetRef = receipt[field]
        if (!indexedReceipts.has(targetRef)) {
          danglingReferences.push({
            source_gate: gate,
            source_file: file,
            source_receipt_id: receiptId,
            reference_field: field,
            target_ref: targetRef,
            error: "Referenced receipt_id is not indexed in evidence graph"
          })
        } else {
          edges.push({
            source: receiptId,
            target: targetRef,
            kind: field
          })
        }
      }
    }

    // Array refs
    const arrayRefFields = [
      "skill_receipt_refs",
      "orchestration_receipt_refs",
      "contract_receipt_refs"
    ]
    for (const field of arrayRefFields) {
      if (Array.isArray(receipt[field])) {
        for (const targetRef of receipt[field]) {
          if (!indexedReceipts.has(targetRef)) {
            danglingReferences.push({
              source_gate: gate,
              source_file: file,
              source_receipt_id: receiptId,
              reference_field: field,
              target_ref: targetRef,
              error: "Referenced array receipt_id is not indexed in evidence graph"
            })
          } else {
            edges.push({
              source: receiptId,
              target: targetRef,
              kind: field
            })
          }
        }
      }
    }

    // Reviewed artifacts validation
    if (receipt.type === "REVIEW-E" && Array.isArray(receipt.reviewed_artifacts)) {
      for (const item of receipt.reviewed_artifacts) {
        if (item.path && item.sha256) {
          const canonicalP = canonicalRepoPath(item.path)
          if (!existsSync(path.join(REPO_ROOT, canonicalP))) {
            brokenArtifactReferences.push({
              gate,
              receipt_id: receiptId,
              path: canonicalP,
              error: "Reviewed artifact path does not exist on disk"
            })
          } else {
            const actualH = hashFile(canonicalP)
            if (actualH !== item.sha256) {
              reviewedArtifactMismatches.push({
                gate,
                receipt_id: receiptId,
                path: canonicalP,
                expected_sha256: item.sha256,
                actual_sha256: actualH
              })
            }
          }
        }
      }
    }
  }

  // 3. Compute orphan receipts (receipts that have no edges in or out and are not root / terminal receipts)
  const referencedReceiptIds = new Set(edges.map((e) => e.target))
  const referencingReceiptIds = new Set(edges.map((e) => e.source))
  for (const [receiptId, entry] of indexedReceipts.entries()) {
    const { receipt } = entry
    // Route and validation receipts are roots/terminals; others must participate in graph
    if (!referencedReceiptIds.has(receiptId) && !referencingReceiptIds.has(receiptId)) {
      if (receipt.type !== "ROUTE-E" && receipt.type !== "VALIDATION-E") {
        orphanReceipts.push({
          receipt_id: receiptId,
          type: receipt.type,
          file: entry.file,
          error: "Receipt is neither referenced nor referencing any other node"
        })
      }
    }
  }

  // 4. Validate gate verdicts
  const verifiedTerms = []
  const requiredGates = [
    { name: "EF-01", expected: "PASS: EXPECTED_FAIL_CLOSED", verdictFile: "ef-01/ef-01-verdict.md" },
    { name: "ARCH-EF", expected: "PASS", verdictFile: "arch-ef-r1/arch-ef-r1-verdict.md" },
    { name: "EF-02", expected: "PASS", verdictFile: "ef-02/ef-02-verdict.md" },
    { name: "EF-03", expected: "PASS", verdictFile: "ef-03/ef-03-verdict.md" },
    { name: "EF-04", expected: "PASS", verdictFile: "ef-04/ef-04-verdict.md" }
  ]

  for (const g of requiredGates) {
    const vPath = path.join(baseDir, g.verdictFile)
    if (!existsSync(vPath)) {
      predecessorFailures.push({ gate: g.name, error: `Verdict file missing: ${vPath}` })
      verifiedTerms.push({ gate: g.name, verified_verdict_pass: false, reason: "Verdict file missing" })
    } else {
      const vText = readFileSync(vPath, "utf8")
      const matchesExpected = vText.includes(g.expected)
      if (!matchesExpected) {
        predecessorFailures.push({ gate: g.name, error: `Verdict file does not contain expected verdict '${g.expected}'` })
        verifiedTerms.push({ gate: g.name, verified_verdict_pass: false, reason: "Verdict text mismatch" })
      } else {
        const relVPath = path.relative(REPO_ROOT, vPath).split(path.sep).join("/")
        verifiedTerms.push({
          gate: g.name,
          verified_verdict_pass: true,
          verdict_file: g.verdictFile,
          sha256: hashFile(canonicalRepoPath(relVPath))
        })
      }
    }
  }

  // Compute summary metrics dynamically
  const errorCount =
    danglingReferences.length +
    orphanReceipts.length +
    duplicateReceiptCollisions.length +
    hashMismatches.length +
    sessionCollisions.length +
    invocationCollisions.length +
    brokenArtifactReferences.length +
    reviewedArtifactMismatches.length +
    predecessorFailures.length +
    provenanceErrors.length

  const allTermsSatisfied = verifiedTerms.length === requiredGates.length && verifiedTerms.every((t) => t.verified_verdict_pass === true)
  const isPass = errorCount === 0 && allTermsSatisfied

  return {
    schema_version: 1,
    kind: "canonical-full-evidence-graph-validation",
    computed_status: isPass ? "PASS" : "FAIL",
    total_nodes: nodes.length,
    total_edges: edges.length,
    total_artifacts_indexed: indexedArtifacts.size,
    total_receipts_indexed: indexedReceipts.size,
    metrics: {
      dangling_references_count: danglingReferences.length,
      orphan_receipts_count: orphanReceipts.length,
      duplicate_receipt_collisions_count: duplicateReceiptCollisions.length,
      hash_mismatches_count: hashMismatches.length,
      session_collisions_count: sessionCollisions.length,
      invocation_collisions_count: invocationCollisions.length,
      broken_artifact_references_count: brokenArtifactReferences.length,
      reviewed_artifact_mismatches_count: reviewedArtifactMismatches.length,
      predecessor_failures_count: predecessorFailures.length,
      provenance_errors_count: provenanceErrors.length,
      total_errors: errorCount
    },
    errors: {
      dangling_references: danglingReferences,
      orphan_receipts: orphanReceipts,
      duplicate_receipt_collisions: duplicateReceiptCollisions,
      hash_mismatches: hashMismatches,
      session_collisions: sessionCollisions,
      invocation_collisions: invocationCollisions,
      broken_artifact_references: brokenArtifactReferences,
      reviewed_artifact_mismatches: reviewedArtifactMismatches,
      predecessor_failures: predecessorFailures,
      provenance_errors: provenanceErrors
    },
    verified_terms: verifiedTerms,
    all_terms_satisfied: allTermsSatisfied,
    execution_fabric_001_eligible_for_closure: isPass
  }
}

// CLI execution
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const result = validateFullEvidenceGraph()
    if (result.computed_status !== "PASS") {
      process.stderr.write(`Validation failed with ${result.metrics.total_errors} errors:\n${JSON.stringify(result.errors, null, 2)}\n`)
      process.exitCode = 1
    } else {
      process.stdout.write(JSON.stringify(result, null, 2) + "\n")
    }
  } catch (err) {
    failCli(err)
  }
}
