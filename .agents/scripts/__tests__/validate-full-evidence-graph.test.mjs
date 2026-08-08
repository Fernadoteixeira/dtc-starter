import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { after, test } from "node:test"
import { fileURLToPath } from "node:url"
import { hashCanonicalValue, hashFile, writeJsonExclusive } from "../canonical-execution-lib.mjs"
import { validateFullEvidenceGraph } from "../validate-full-evidence-graph.mjs"

const SCRIPT_PATH = fileURLToPath(import.meta.url)
const REPO_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..", "..", "..")
const tempDir = mkdtempSync(path.join(REPO_ROOT, ".agents", "scripts", "__tests__", "graph-test-"))

after(() => {
  rmSync(tempDir, { recursive: true, force: true })
})

function buildMockProofChain(targetDir) {
  const gates = ["ef-01", "arch-ef-r1", "ef-02", "ef-03", "ef-04"]
  for (const g of gates) {
    const gPath = path.join(targetDir, g)
    mkdirSync(gPath, { recursive: true })
  }

  // EF-01 verdict
  writeFileSync(path.join(targetDir, "ef-01", "ef-01-verdict.md"), "# EF-01 Verdict\nStatus: PASS: EXPECTED_FAIL_CLOSED\n")
  // ARCH-EF verdict
  writeFileSync(path.join(targetDir, "arch-ef-r1", "arch-ef-r1-verdict.md"), "# ARCH-EF-R1 Verdict\nStatus: PASS\n")
  // EF-02 verdict
  writeFileSync(path.join(targetDir, "ef-02", "ef-02-verdict.md"), "# EF-02 Verdict\nStatus: PASS\n")
  // EF-03 verdict
  writeFileSync(path.join(targetDir, "ef-03", "ef-03-verdict.md"), "# EF-03 Verdict\nStatus: PASS\n")
  // EF-04 verdict
  writeFileSync(path.join(targetDir, "ef-04", "ef-04-verdict.md"), "# EF-04 Verdict\nStatus: PASS\n")

  // Connected receipt chain
  const routeReceiptId = randomUUID()
  const agentLoadReceiptId = randomUUID()
  const workerInvocationId = randomUUID()
  const workerSessionId = randomUUID()
  const agentRunReceiptId = randomUUID()
  const valReceiptId = randomUUID()

  const routeBundle = {
    schema_version: 1,
    kind: "canonical-agent-route",
    status: "LOADED",
    task_id: "TEST-CHAIN",
    invocation_id: workerInvocationId,
    receipts: [
      { type: "ROUTE-E", receipt_id: routeReceiptId, invocation_id: workerInvocationId, status: "LOADED", timestamp: new Date().toISOString() },
      { type: "AGENT-LOAD-E", receipt_id: agentLoadReceiptId, invocation_id: workerInvocationId, status: "LOADED", timestamp: new Date().toISOString() }
    ]
  }
  writeFileSync(path.join(targetDir, "arch-ef-r1", "worker-route.json"), JSON.stringify(routeBundle, null, 2))

  const agentRun = {
    type: "AGENT-RUN",
    receipt_id: agentRunReceiptId,
    invocation_id: workerInvocationId,
    status: "COMPLETED",
    task_id: "TEST-CHAIN",
    route_receipt_ref: routeReceiptId,
    agent_load_receipt_ref: agentLoadReceiptId,
    provenance: {
      authority: "antigravity-host",
      host_session_id: workerSessionId,
      invocation_id: workerInvocationId,
      execution_kind: "worker"
    }
  }
  writeFileSync(path.join(targetDir, "arch-ef-r1", "execution-evidence.json"), JSON.stringify(agentRun, null, 2))

  const validation = {
    type: "VALIDATION-E",
    receipt_id: valReceiptId,
    invocation_id: workerInvocationId,
    status: "VALIDATED",
    execution_evidence_receipt_ref: agentRunReceiptId,
    provenance: {
      authority: "antigravity-host",
      host_session_id: workerSessionId,
      invocation_id: workerInvocationId,
      execution_kind: "worker"
    }
  }
  writeFileSync(path.join(targetDir, "arch-ef-r1", "validation-evidence.json"), JSON.stringify(validation, null, 2))

  return {
    gates,
    routeReceiptId,
    agentLoadReceiptId,
    agentRunReceiptId,
    valReceiptId,
    workerInvocationId,
    workerSessionId
  }
}

test("1. Negative Test: fails for dangling receipt ref", () => {
  const caseDir = mkdtempSync(path.join(tempDir, "case1-"))
  const chain = buildMockProofChain(caseDir)
  const badRun = {
    type: "AGENT-RUN",
    receipt_id: randomUUID(),
    invocation_id: randomUUID(),
    status: "COMPLETED",
    task_id: "TEST",
    route_receipt_ref: "00000000-0000-0000-0000-000000000000",
    provenance: {
      authority: "antigravity-host",
      host_session_id: randomUUID(),
      invocation_id: randomUUID(),
      execution_kind: "worker"
    }
  }
  writeFileSync(path.join(caseDir, "ef-02", "dangling-run.json"), JSON.stringify(badRun, null, 2))
  const result = validateFullEvidenceGraph({ baseDir: caseDir, gateDirs: chain.gates })
  assert.equal(result.computed_status, "FAIL")
  assert.ok(result.metrics.dangling_references_count > 0)
})

test("2. Negative Test: fails for duplicate receipt collision", () => {
  const caseDir = mkdtempSync(path.join(tempDir, "case2-"))
  const chain = buildMockProofChain(caseDir)
  const dupReceipt = {
    type: "AGENT-RUN",
    receipt_id: chain.agentRunReceiptId,
    invocation_id: randomUUID(),
    status: "COMPLETED"
  }
  writeFileSync(path.join(caseDir, "ef-02", "duplicate.json"), JSON.stringify(dupReceipt, null, 2))
  const result = validateFullEvidenceGraph({ baseDir: caseDir, gateDirs: chain.gates })
  assert.equal(result.computed_status, "FAIL")
  assert.ok(result.metrics.duplicate_receipt_collisions_count > 0)
})

test("3. Negative Test: fails for artifact hash mutation", () => {
  const caseDir = mkdtempSync(path.join(tempDir, "case3-"))
  const chain = buildMockProofChain(caseDir)
  const hashReceipt = {
    type: "REVIEW-E",
    receipt_id: randomUUID(),
    invocation_id: randomUUID(),
    status: "COMPLETED",
    path: ".agents/canonical-execution-protocol.yaml",
    sha256: "0".repeat(64),
    worker_run_ref: chain.agentRunReceiptId,
    provenance: {
      authority: "antigravity-host",
      host_session_id: randomUUID(),
      invocation_id: randomUUID(),
      execution_kind: "reviewer"
    }
  }
  writeFileSync(path.join(caseDir, "ef-04", "hash-mutated.json"), JSON.stringify(hashReceipt, null, 2))
  const result = validateFullEvidenceGraph({ baseDir: caseDir, gateDirs: chain.gates })
  assert.equal(result.computed_status, "FAIL")
  assert.ok(result.metrics.hash_mismatches_count > 0)
})

test("4. Negative Test: fails for missing gate directory or verdict", () => {
  const caseDir = mkdtempSync(path.join(tempDir, "case4-"))
  const chain = buildMockProofChain(caseDir)
  rmSync(path.join(caseDir, "ef-04", "ef-04-verdict.md"))
  const result = validateFullEvidenceGraph({ baseDir: caseDir, gateDirs: chain.gates })
  assert.equal(result.computed_status, "FAIL")
  assert.ok(result.metrics.predecessor_failures_count > 0)
})

test("5. Negative Test: fails for false predecessor PASS (verdict mismatch)", () => {
  const caseDir = mkdtempSync(path.join(tempDir, "case5-"))
  const chain = buildMockProofChain(caseDir)
  writeFileSync(path.join(caseDir, "ef-03", "ef-03-verdict.md"), "# EF-03 Verdict\nStatus: BLOCKED\n")
  const result = validateFullEvidenceGraph({ baseDir: caseDir, gateDirs: chain.gates })
  assert.equal(result.computed_status, "FAIL")
  assert.equal(result.all_terms_satisfied, false)
  assert.ok(result.metrics.predecessor_failures_count > 0)
})

test("6. Negative Test: fails for reused invocation identity between worker and reviewer", () => {
  const caseDir = mkdtempSync(path.join(tempDir, "case6-"))
  const chain = buildMockProofChain(caseDir)
  const revReceipt = {
    type: "REVIEW-E",
    receipt_id: randomUUID(),
    invocation_id: chain.workerInvocationId,
    status: "COMPLETED",
    worker_run_ref: chain.agentRunReceiptId,
    provenance: {
      authority: "antigravity-host",
      host_session_id: randomUUID(),
      invocation_id: chain.workerInvocationId,
      execution_kind: "reviewer"
    }
  }
  writeFileSync(path.join(caseDir, "arch-ef-r1", "review-evidence.json"), JSON.stringify(revReceipt, null, 2))
  const result = validateFullEvidenceGraph({ baseDir: caseDir, gateDirs: chain.gates })
  assert.equal(result.computed_status, "FAIL")
  assert.ok(result.metrics.invocation_collisions_count > 0)
})

test("7. Negative Test: fails for invalid review target", () => {
  const caseDir = mkdtempSync(path.join(tempDir, "case7-"))
  const chain = buildMockProofChain(caseDir)
  const revReceipt = {
    type: "REVIEW-E",
    receipt_id: randomUUID(),
    invocation_id: randomUUID(),
    status: "COMPLETED",
    review_target: "deadbeef-dead-beef-dead-beefdeadbeef",
    provenance: {
      authority: "antigravity-host",
      host_session_id: randomUUID(),
      invocation_id: randomUUID(),
      execution_kind: "reviewer"
    }
  }
  writeFileSync(path.join(caseDir, "ef-04", "invalid-target.json"), JSON.stringify(revReceipt, null, 2))
  const result = validateFullEvidenceGraph({ baseDir: caseDir, gateDirs: chain.gates })
  assert.equal(result.computed_status, "FAIL")
  assert.ok(result.metrics.dangling_references_count > 0)
})

test("8. Negative Test: fails for missing provenance", () => {
  const caseDir = mkdtempSync(path.join(tempDir, "case8-"))
  const chain = buildMockProofChain(caseDir)
  const unprovenRun = {
    type: "AGENT-RUN",
    receipt_id: randomUUID(),
    invocation_id: randomUUID(),
    status: "COMPLETED",
    route_receipt_ref: chain.routeReceiptId,
    provenance: {
      authority: "antigravity-host",
      host_session_id: "",
      invocation_id: randomUUID(),
      execution_kind: "worker"
    }
  }
  writeFileSync(path.join(caseDir, "ef-02", "unproven.json"), JSON.stringify(unprovenRun, null, 2))
  const result = validateFullEvidenceGraph({ baseDir: caseDir, gateDirs: chain.gates })
  assert.equal(result.computed_status, "FAIL")
  assert.ok(result.metrics.provenance_errors_count > 0)
})

test("9. Negative Test: fails for orphan receipt", () => {
  const caseDir = mkdtempSync(path.join(tempDir, "case9-"))
  const chain = buildMockProofChain(caseDir)
  const orphan = {
    type: "AGENT-RUN",
    receipt_id: randomUUID(),
    invocation_id: randomUUID(),
    status: "COMPLETED"
  }
  writeFileSync(path.join(caseDir, "ef-02", "orphan.json"), JSON.stringify(orphan, null, 2))
  const result = validateFullEvidenceGraph({ baseDir: caseDir, gateDirs: chain.gates })
  assert.equal(result.computed_status, "FAIL")
  assert.ok(result.metrics.orphan_receipts_count > 0)
})

test("10. Negative Test: fails for manipulated closure equation (missing required gate)", () => {
  const caseDir = mkdtempSync(path.join(tempDir, "case10-"))
  const chain = buildMockProofChain(caseDir)
  rmSync(path.join(caseDir, "ef-01", "ef-01-verdict.md"))
  const result = validateFullEvidenceGraph({ baseDir: caseDir, gateDirs: chain.gates })
  assert.equal(result.execution_fabric_001_eligible_for_closure, false)
  assert.equal(result.all_terms_satisfied, false)
})

test("11. Negative Test: EF-03-16 SELF_CERTIFIED_PASS blocked", () => {
  const caseDir = mkdtempSync(path.join(tempDir, "case11-"))
  const chain = buildMockProofChain(caseDir)
  const selfCertified = {
    type: "VALIDATION-E",
    receipt_id: randomUUID(),
    invocation_id: chain.workerInvocationId,
    status: "VALIDATED",
    all_terms_satisfied: true,
    orphan_receipts: 0,
    dangling_references: 0
  }
  writeFileSync(path.join(caseDir, "ef-04", "self-cert.json"), JSON.stringify(selfCertified, null, 2))
  const result = validateFullEvidenceGraph({ baseDir: caseDir, gateDirs: chain.gates })
  // If self-cert receipt is not referencing / referenced, it is flagged as orphan or duplicate
  assert.equal(result.computed_status, "FAIL")
})
