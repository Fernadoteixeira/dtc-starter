import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { mkdtempSync, rmSync } from "node:fs"
import path from "node:path"
import { after, test } from "node:test"
import {
  PHASE_FILENAMES,
  PROTOCOL_PATH,
  REGISTRY_PATH,
  REPO_ROOT,
  assertExternalSkillPath,
  hashCanonicalValue,
  hashFile,
  parseShortcutRegistry,
  resolveEvidenceOutputPath,
  validateRouteBundle,
  writeJsonExclusive
} from "../canonical-execution-lib.mjs"
import { buildRouteBundle } from "../resolve-agent-shortcut.mjs"
import { buildLoadBundle } from "../resolve-agent-skills.mjs"
import {
  validateAgentRunSchema,
  validateCompletedValidationRecords,
  validateLoadBundle,
  validateReviewDecision,
  validateReviewedArtifacts,
  validateReviewerRoutePolicy,
  validateTaskValue
} from "../validate-execution-evidence.mjs"
import { validateExecutionLoads } from "../validate-execution-loads.mjs"

const temporaryDirectory = mkdtempSync(path.join(REPO_ROOT, ".agents", "scripts", "__tests__", "evidence-"))

after(() => {
  rmSync(temporaryDirectory, { recursive: true, force: true })
})

function createEvidenceDirectory() {
  const absolutePath = mkdtempSync(path.join(temporaryDirectory, "case-"))
  return path.relative(REPO_ROOT, absolutePath).split(path.sep).join("/")
}

function createWorkerPhase(taskId = "TEST-PREFLIGHT") {
  const evidenceDir = createEvidenceDirectory()
  const routePath = `${evidenceDir}/${PHASE_FILENAMES.workerRoute}`
  const loadPath = `${evidenceDir}/${PHASE_FILENAMES.workerLoads}`
  const route = buildRouteBundle({ shortcut: "impl", taskId })
  writeJsonExclusive(routePath, route)
  const loadBundle = buildLoadBundle({ routePath })
  writeJsonExclusive(loadPath, loadBundle)
  return { evidenceDir, routePath, loadPath, route, loadBundle }
}

function validAgentRun(overrides = {}) {
  const task = "Perform the bounded task"
  return {
    type: "AGENT-RUN",
    receipt_id: randomUUID(),
    invocation_id: randomUUID(),
    timestamp: new Date().toISOString(),
    status: "COMPLETED",
    task_id: "TEST-AGENT",
    adapter: "canonical-worker",
    canonical_identity: "implementation-engineer",
    route_receipt_ref: randomUUID(),
    agent_load_receipt_ref: randomUUID(),
    protocol_receipt_ref: randomUUID(),
    dispatcher_receipt_ref: randomUUID(),
    adapter_receipt_ref: randomUUID(),
    skill_receipt_refs: [],
    orchestration_receipt_refs: [],
    contract_receipt_refs: [],
    instructions_acknowledged: true,
    task,
    task_sha256: hashCanonicalValue(task),
    input_bundle_sha256: "0".repeat(64),
    artifact_refs: [REGISTRY_PATH],
    self_critique: "Checked the bounded result",
    auto_improve_iterations: 0,
    validation: [{ command: "node --test", status: "PASS", output: "passed" }],
    stop_condition_satisfied: true,
    ...overrides
  }
}

test("PHASE_FILENAMES exposes only the canonical phase names", () => {
  assert.deepEqual(PHASE_FILENAMES, {
    workerRoute: "worker-route.json",
    reviewerRoute: "review-route.json",
    workerLoads: "worker-loads.json",
    reviewerLoads: "review-loads.json",
    evidence: "execution-evidence.json",
    validation: "validation-evidence.json"
  })
})

test("canonical helpers accept stable JSON and strict shortcut YAML", () => {
  assert.equal(hashCanonicalValue({ beta: 2, alpha: 1 }), hashCanonicalValue({ alpha: 1, beta: 2 }))
  const shortcuts = parseShortcutRegistry([
    "shortcuts:",
    "  review:canonical:",
    "    canonical_agent: code-reviewer",
    "    core_skills: [code-review]",
    "    mode: read_only",
    "next_section:",
    "  ignored: true"
  ].join("\n"))
  assert.deepEqual(shortcuts["review:canonical"].core_skills, ["code-review"])
})

test("reviewer route policy accepts the canonical reviewer route", () => {
  const route = buildRouteBundle({ shortcut: "review:canonical", taskId: "TEST-001:review" })
  assert.equal(validateReviewerRoutePolicy(validateRouteBundle(route), "TEST-001"), "TEST-001:review")
})

test("evidence output rejects traversal outside its physical directory", () => {
  const evidenceDir = createEvidenceDirectory()
  const traversal = `${evidenceDir}/../${PHASE_FILENAMES.workerRoute}`
  assert.throws(
    () => resolveEvidenceOutputPath(traversal, evidenceDir, [PHASE_FILENAMES.workerRoute]),
    /outside the evidence directory/
  )
})

test("evidence output uses exclusive no-replace writes", () => {
  const evidenceDir = createEvidenceDirectory()
  const output = `${evidenceDir}/${PHASE_FILENAMES.workerRoute}`
  const resolved = resolveEvidenceOutputPath(output, evidenceDir, [PHASE_FILENAMES.workerRoute])
  writeJsonExclusive(resolved, { status: "first" })
  assert.throws(() => resolveEvidenceOutputPath(output, evidenceDir, [PHASE_FILENAMES.workerRoute]), /already exists/)
  assert.throws(() => writeJsonExclusive(resolved, { status: "second" }))
})

test("external skill policy rejects a contract disguised as a skill", () => {
  assert.throws(() => assertExternalSkillPath(".agents/contracts/session-state-ledger.md"), /outside \.agents\/skills/)
})

test("reviewer policy rejects a different read-only reviewer shortcut", () => {
  const route = buildRouteBundle({ shortcut: "css:validate", taskId: "TEST-002:review" })
  assert.throws(() => validateReviewerRoutePolicy(validateRouteBundle(route), "TEST-002"), /exactly review:canonical/)
})

test("strict AGENT-RUN schema rejects a fake receipt with missing fields", () => {
  assert.throws(() => validateAgentRunSchema({ type: "AGENT-RUN" }), /must contain exactly/)
})

test("completed AGENT-RUN rejects FAIL and BLOCKED validation records", () => {
  for (const status of ["FAIL", "BLOCKED"]) {
    assert.throws(
      () => validateCompletedValidationRecords([{ command: "check", status, output: "not passed" }]),
      /must be PASS/
    )
    assert.throws(
      () => validateAgentRunSchema(validAgentRun({ validation: [{ command: "check", status, output: "not passed" }] })),
      /must be PASS/
    )
  }
})

test("task accepts trimmed strings and non-empty plain objects", () => {
  assert.equal(validateTaskValue("bounded task"), "bounded task")
  assert.deepEqual(validateTaskValue({ objective: "bounded task" }), { objective: "bounded task" })
})

test("task rejects null, arrays, booleans, numbers, empty objects, and untrimmed strings", () => {
  for (const task of [null, [], true, 42, {}, " untrimmed", ""]) {
    assert.throws(() => validateTaskValue(task), /AGENT-RUN\.task/)
  }
})

test("reviewed artifacts must exactly match worker artifacts", () => {
  const workerArtifacts = [{ path: REGISTRY_PATH, sha256: hashFile(REGISTRY_PATH) }]
  const reviewedArtifacts = [{ path: PROTOCOL_PATH, sha256: hashFile(PROTOCOL_PATH) }]
  assert.throws(() => validateReviewedArtifacts(reviewedArtifacts, workerArtifacts), /does not exactly match/)
})

test("review PASS rejects a blocking finding", () => {
  const findings = [{
    severity: "high",
    path: REGISTRY_PATH,
    summary: "Blocking structural issue",
    blocking: true
  }]
  assert.throws(() => validateReviewDecision(findings, "PASS", "Reviewed"), /cannot PASS with blocking findings/)
})

test("load validation rejects a stale infrastructure receipt", () => {
  const phase = createWorkerPhase("TEST-STALE")
  const stale = structuredClone(phase.loadBundle)
  const protocolReceipt = stale.receipts.find((receipt) => receipt.type === "PROTOCOL-LOAD-E")
  protocolReceipt.sha256 = "0".repeat(64)
  assert.throws(() => validateLoadBundle(stale, phase.route, { evidenceDir: phase.evidenceDir }), /hash mismatch/)
})

test("preflight validates a correctly paired worker route and load bundle", () => {
  const phase = createWorkerPhase()
  const receipt = validateExecutionLoads({
    routePath: phase.routePath,
    loadBundlePath: phase.loadPath,
    evidenceDir: phase.evidenceDir
  })
  assert.equal(receipt.type, "LOAD-VALIDATION-E")
  assert.equal(receipt.status, "VALIDATED")
  assert.equal(receipt.trust_level, "structural_integrity_only")
})

test("preflight rejects worker route paired with reviewer load filename", () => {
  const phase = createWorkerPhase("TEST-PAIRING")
  const wrongLoadPath = `${phase.evidenceDir}/${PHASE_FILENAMES.reviewerLoads}`
  writeJsonExclusive(wrongLoadPath, phase.loadBundle)
  assert.throws(
    () => validateExecutionLoads({ routePath: phase.routePath, loadBundlePath: wrongLoadPath, evidenceDir: phase.evidenceDir }),
    /filename is not allowed/
  )
})
