import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import path from "node:path"
import { after, test } from "node:test"
import {
  DISPATCHER_PATH,
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
  validateExecutionEvidence,
  validateLoadBundle,
  validateReviewDecision,
  validateReviewedArtifacts,
  validateReviewerRoutePolicy,
  validateTaskValue,
  hashExecutionInputBundle
} from "../validate-execution-evidence.mjs"
import { validateExecutionLoads } from "../validate-execution-loads.mjs"
import {
  HOST_AUTHORITY,
  captureHostProvenance,
  validateHostProvenance
} from "../host-provenance-adapter.mjs"
import {
  emitReviewerReview,
  emitWorkerAgentRun
} from "../canonical-invocation-wrapper.mjs"

const temporaryDirectory = mkdtempSync(path.join(REPO_ROOT, ".agents", "scripts", "__tests__", "evidence-"))

after(() => {
  try {
    rmSync(temporaryDirectory, { recursive: true, force: true, maxRetries: 5, retryDelay: 50 })
  } catch {}
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

test("protocol and dispatcher documentation stay aligned with PHASE_FILENAMES", () => {
  const protocol = readFileSync(path.join(REPO_ROOT, PROTOCOL_PATH), "utf8")
  const dispatcher = readFileSync(path.join(REPO_ROOT, DISPATCHER_PATH), "utf8")
  const phaseNames = Object.values(PHASE_FILENAMES)
  const documentaryCorpus = `${protocol}\n${dispatcher}`

  for (const phaseName of phaseNames) {
    assert.ok(protocol.includes(phaseName), `protocol must reference canonical phase ${phaseName}`)
    assert.ok(documentaryCorpus.includes(phaseName), `documentation must reference canonical phase ${phaseName}`)
  }

  const documentedPhasePattern = /(?:worker|review|execution|validation)-[a-z0-9-]+\.json/g
  const dispatcherPhaseNames = [...new Set(dispatcher.match(documentedPhasePattern) ?? [])]
  assert.ok(dispatcherPhaseNames.length > 0, "dispatcher must reference canonical phase filenames")
  for (const documentedName of dispatcherPhaseNames) {
    assert.ok(phaseNames.includes(documentedName), `dispatcher uses unknown phase filename ${documentedName}`)
    assert.ok(protocol.includes(documentedName), `dispatcher phase ${documentedName} must match the protocol`)
  }
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

function createEvidenceBundleWithProvenance(options = {}) {
  const phase = createWorkerPhase(options.taskId || "TEST-PROV")
  const reviewerRoutePath = `${phase.evidenceDir}/${PHASE_FILENAMES.reviewerRoute}`
  const reviewerLoadPath = `${phase.evidenceDir}/${PHASE_FILENAMES.reviewerLoads}`
  const reviewerRoute = buildRouteBundle({ shortcut: "review:canonical", taskId: `${options.taskId || "TEST-PROV"}:review` })
  writeJsonExclusive(reviewerRoutePath, reviewerRoute)
  const reviewerLoadBundle = buildLoadBundle({ routePath: reviewerRoutePath })
  writeJsonExclusive(reviewerLoadPath, reviewerLoadBundle)

  const workerInvocationId = options.workerInvocationId || phase.route.invocation_id
  const reviewerInvocationId = options.reviewerInvocationId || reviewerRoute.invocation_id
  phase.route.invocation_id = workerInvocationId
  phase.loadBundle.invocation_id = workerInvocationId
  reviewerRoute.invocation_id = reviewerInvocationId
  reviewerLoadBundle.invocation_id = reviewerInvocationId
  const artifactPath = REGISTRY_PATH
  const artifacts = [{ path: artifactPath, sha256: hashFile(artifactPath) }]

  const workerReceipt = phase.route.receipts.find((r) => r.type === "ROUTE-E")
  const workerAgentReceipt = phase.route.receipts.find((r) => r.type === "AGENT-LOAD-E")
  const workerProto = phase.loadBundle.receipts.find((r) => r.type === "PROTOCOL-LOAD-E")
  const workerDisp = phase.loadBundle.receipts.find((r) => r.type === "DISPATCHER-LOAD-E")
  const workerAdap = phase.loadBundle.receipts.find((r) => r.type === "ADAPTER-LOAD-E")
  const workerSkills = phase.loadBundle.receipts.filter((r) => r.type === "SKILL-LOAD-E").map((r) => r.receipt_id)

  const revReceipt = reviewerRoute.receipts.find((r) => r.type === "ROUTE-E")
  const revAgentReceipt = reviewerRoute.receipts.find((r) => r.type === "AGENT-LOAD-E")
  const revProto = reviewerLoadBundle.receipts.find((r) => r.type === "PROTOCOL-LOAD-E")
  const revDisp = reviewerLoadBundle.receipts.find((r) => r.type === "DISPATCHER-LOAD-E")
  const revAdap = reviewerLoadBundle.receipts.find((r) => r.type === "ADAPTER-LOAD-E")
  const revSkills = reviewerLoadBundle.receipts.filter((r) => r.type === "SKILL-LOAD-E").map((r) => r.receipt_id)
  const revOrchs = reviewerLoadBundle.receipts.filter((r) => r.type === "ORCHESTRATION-LOAD-E").map((r) => r.receipt_id)

  const agentRunReceiptId = randomUUID()
  const task = "Perform bounded worker task"

  const agentRun = {
    type: "AGENT-RUN",
    receipt_id: agentRunReceiptId,
    invocation_id: workerInvocationId,
    timestamp: new Date().toISOString(),
    status: "COMPLETED",
    task_id: options.taskId || "TEST-PROV",
    adapter: "canonical-worker",
    canonical_identity: "implementation-engineer",
    route_receipt_ref: workerReceipt.receipt_id,
    agent_load_receipt_ref: workerAgentReceipt.receipt_id,
    protocol_receipt_ref: workerProto.receipt_id,
    dispatcher_receipt_ref: workerDisp.receipt_id,
    adapter_receipt_ref: workerAdap.receipt_id,
    skill_receipt_refs: workerSkills,
    orchestration_receipt_refs: [],
    contract_receipt_refs: [],
    instructions_acknowledged: true,
    task,
    task_sha256: hashCanonicalValue(task),
    input_bundle_sha256: hashExecutionInputBundle(phase.route, phase.loadBundle),
    artifact_refs: [artifactPath],
    self_critique: "Self critique checked",
    auto_improve_iterations: 0,
    validation: [{ command: "node --test", status: "PASS", output: "passed" }],
    stop_condition_satisfied: true,
    ...(options.workerProv !== undefined ? { provenance: options.workerProv } : {})
  }

  const review = {
    type: "REVIEW-E",
    receipt_id: randomUUID(),
    invocation_id: reviewerInvocationId,
    timestamp: new Date().toISOString(),
    status: "COMPLETED",
    task_id: `${options.taskId || "TEST-PROV"}:review`,
    adapter: "canonical-reviewer",
    canonical_identity: "code-reviewer",
    review_target: agentRunReceiptId,
    route_receipt_ref: revReceipt.receipt_id,
    agent_load_receipt_ref: revAgentReceipt.receipt_id,
    protocol_receipt_ref: revProto.receipt_id,
    dispatcher_receipt_ref: revDisp.receipt_id,
    adapter_receipt_ref: revAdap.receipt_id,
    skill_receipt_refs: revSkills,
    orchestration_receipt_refs: revOrchs,
    contract_receipt_refs: [],
    instructions_acknowledged: true,
    reviewed_artifacts: artifacts,
    findings: [],
    verdict: "PASS",
    pass_justification: "All receipts verified",
    ...(options.reviewerProv !== undefined ? { provenance: options.reviewerProv } : {})
  }

  const evidence = {
    schema_version: 1,
    kind: "canonical-execution-evidence",
    task_id: options.taskId || "TEST-PROV",
    execution: {
      route: phase.route,
      load_bundle: phase.loadBundle,
      agent_run: agentRun,
      artifacts
    },
    review_execution: {
      route: reviewerRoute,
      load_bundle: reviewerLoadBundle,
      review
    }
  }
  const evidencePath = `${phase.evidenceDir}/${PHASE_FILENAMES.evidence}`
  writeJsonExclusive(evidencePath, evidence)
  return { phase, reviewerRoute, reviewerLoadBundle, evidence, evidencePath, agentRun, review }
}

test("validateHostProvenance rejects non-antigravity-host authority", () => {
  assert.throws(
    () => validateHostProvenance({ authority: "fake-host", host_session_id: randomUUID(), host_trajectory_id: randomUUID(), invocation_id: randomUUID(), execution_kind: "worker" }),
    /must be antigravity-host|Invalid provenance authority/
  )
})

test("validateHostProvenance rejects empty or invalid host_session_id", () => {
  assert.throws(
    () => validateHostProvenance({ authority: HOST_AUTHORITY, host_session_id: "not-a-uuid", host_trajectory_id: randomUUID(), invocation_id: randomUUID(), execution_kind: "worker" }),
    /must be a UUID/
  )
})

test("validateHostProvenance rejects invalid execution_kind", () => {
  assert.throws(
    () => validateHostProvenance({ authority: HOST_AUTHORITY, host_session_id: randomUUID(), host_trajectory_id: randomUUID(), invocation_id: randomUUID(), execution_kind: "invalid-kind" }),
    /must be worker or reviewer/
  )
})

test("captureHostProvenance requires valid host session id", () => {
  assert.throws(
    () => captureHostProvenance({ executionKind: "worker", subagentSessionId: "not-a-uuid" }),
    /must be a UUID/
  )
})

test("validateExecutionEvidence rejects partial host provenance where only worker has provenance", () => {
  const workerInvocationId = randomUUID()
  const workerProv = {
    authority: HOST_AUTHORITY,
    host_session_id: randomUUID(),
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: workerInvocationId,
    execution_kind: "worker",
    issued_at: new Date().toISOString()
  }
  const bundle = createEvidenceBundleWithProvenance({ workerInvocationId, workerProv })
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidenceDir: bundle.phase.evidenceDir, evidencePath: bundle.evidencePath }),
    /Partial host provenance is invalid/
  )
})

test("validateExecutionEvidence rejects worker and reviewer sharing host session id", () => {
  const sharedSessionId = randomUUID()
  const workerInvocationId = randomUUID()
  const reviewerInvocationId = randomUUID()
  const workerProv = {
    authority: HOST_AUTHORITY,
    host_session_id: sharedSessionId,
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: workerInvocationId,
    execution_kind: "worker",
    issued_at: new Date().toISOString()
  }
  const reviewerProv = {
    authority: HOST_AUTHORITY,
    host_session_id: sharedSessionId,
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: reviewerInvocationId,
    execution_kind: "reviewer",
    issued_at: new Date().toISOString()
  }
  const bundle = createEvidenceBundleWithProvenance({ workerInvocationId, reviewerInvocationId, workerProv, reviewerProv })
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidenceDir: bundle.phase.evidenceDir, evidencePath: bundle.evidencePath }),
    /Worker and reviewer must not reuse the same host session id/
  )
})

test("validateExecutionEvidence rejects worker and reviewer sharing host invocation id", () => {
  const sharedInvocationId = randomUUID()
  const workerProv = {
    authority: HOST_AUTHORITY,
    host_session_id: randomUUID(),
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: sharedInvocationId,
    execution_kind: "worker",
    issued_at: new Date().toISOString()
  }
  const reviewerProv = {
    authority: HOST_AUTHORITY,
    host_session_id: randomUUID(),
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: sharedInvocationId,
    execution_kind: "reviewer",
    issued_at: new Date().toISOString()
  }
  const bundle = createEvidenceBundleWithProvenance({ workerInvocationId: sharedInvocationId, reviewerInvocationId: sharedInvocationId, workerProv, reviewerProv })
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidenceDir: bundle.phase.evidenceDir, evidencePath: bundle.evidencePath }),
    /Worker and reviewer must not reuse the same host session id|Worker and reviewer must not reuse the same host invocation id|invocation_id must differ/
  )
})

test("validateExecutionEvidence rejects worker invocation id mismatching host provenance", () => {
  const workerInvocationId = randomUUID()
  const reviewerInvocationId = randomUUID()
  const workerProv = {
    authority: HOST_AUTHORITY,
    host_session_id: randomUUID(),
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: randomUUID(),
    execution_kind: "worker",
    issued_at: new Date().toISOString()
  }
  const reviewerProv = {
    authority: HOST_AUTHORITY,
    host_session_id: randomUUID(),
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: reviewerInvocationId,
    execution_kind: "reviewer",
    issued_at: new Date().toISOString()
  }
  const bundle = createEvidenceBundleWithProvenance({ workerInvocationId, reviewerInvocationId, workerProv, reviewerProv })
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidenceDir: bundle.phase.evidenceDir, evidencePath: bundle.evidencePath }),
    /Worker invocation id does not match host provenance invocation id/
  )
})

test("validateExecutionEvidence rejects reviewer invocation id mismatching host provenance", () => {
  const workerInvocationId = randomUUID()
  const reviewerInvocationId = randomUUID()
  const workerProv = {
    authority: HOST_AUTHORITY,
    host_session_id: randomUUID(),
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: workerInvocationId,
    execution_kind: "worker",
    issued_at: new Date().toISOString()
  }
  const reviewerProv = {
    authority: HOST_AUTHORITY,
    host_session_id: randomUUID(),
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: randomUUID(),
    execution_kind: "reviewer",
    issued_at: new Date().toISOString()
  }
  const bundle = createEvidenceBundleWithProvenance({ workerInvocationId, reviewerInvocationId, workerProv, reviewerProv })
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidenceDir: bundle.phase.evidenceDir, evidencePath: bundle.evidencePath }),
    /Reviewer invocation id does not match host provenance invocation id/
  )
})

test("validateExecutionEvidence rejects invalid authority name in provenance", () => {
  const workerInvocationId = randomUUID()
  const reviewerInvocationId = randomUUID()
  const workerProv = {
    authority: "fake-host",
    host_session_id: randomUUID(),
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: workerInvocationId,
    execution_kind: "worker",
    issued_at: new Date().toISOString()
  }
  const reviewerProv = {
    authority: "fake-host",
    host_session_id: randomUUID(),
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: reviewerInvocationId,
    execution_kind: "reviewer",
    issued_at: new Date().toISOString()
  }
  const bundle = createEvidenceBundleWithProvenance({ workerInvocationId, reviewerInvocationId, workerProv, reviewerProv })
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidenceDir: bundle.phase.evidenceDir, evidencePath: bundle.evidencePath }),
    /Invalid provenance authority/
  )
})

test("validateExecutionEvidence rejects forged execution_kind in provenance", () => {
  const workerInvocationId = randomUUID()
  const reviewerInvocationId = randomUUID()
  const workerProv = {
    authority: HOST_AUTHORITY,
    host_session_id: randomUUID(),
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: workerInvocationId,
    execution_kind: "reviewer",
    issued_at: new Date().toISOString()
  }
  const reviewerProv = {
    authority: HOST_AUTHORITY,
    host_session_id: randomUUID(),
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: reviewerInvocationId,
    execution_kind: "worker",
    issued_at: new Date().toISOString()
  }
  const bundle = createEvidenceBundleWithProvenance({ workerInvocationId, reviewerInvocationId, workerProv, reviewerProv })
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidenceDir: bundle.phase.evidenceDir, evidencePath: bundle.evidencePath }),
    /Provenance execution_kind mismatch/
  )
})

test("validateExecutionEvidence preserves structural_integrity_only when provenance is omitted", () => {
  const bundle = createEvidenceBundleWithProvenance()
  const result = validateExecutionEvidence(bundle.evidence, { evidenceDir: bundle.phase.evidenceDir, evidencePath: bundle.evidencePath })
  assert.equal(result.trust_level, "structural_integrity_only")
  assert.equal(result.platform_attestation_verified, false)
  assert.equal(result.status, "VALIDATED")
})

test("validateExecutionEvidence sets host_provenance_verified when real distinct host provenance is provided", () => {
  const workerInvocationId = randomUUID()
  const reviewerInvocationId = randomUUID()
  const workerProv = {
    authority: HOST_AUTHORITY,
    host_session_id: randomUUID(),
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: workerInvocationId,
    execution_kind: "worker",
    issued_at: new Date().toISOString()
  }
  const reviewerProv = {
    authority: HOST_AUTHORITY,
    host_session_id: randomUUID(),
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: reviewerInvocationId,
    execution_kind: "reviewer",
    issued_at: new Date().toISOString()
  }
  const bundle = createEvidenceBundleWithProvenance({ workerInvocationId, reviewerInvocationId, workerProv, reviewerProv })
  const result = validateExecutionEvidence(bundle.evidence, { evidenceDir: bundle.phase.evidenceDir, evidencePath: bundle.evidencePath })
  assert.equal(result.trust_level, "host_provenance_verified")
  assert.equal(result.platform_attestation_verified, true)
  assert.equal(result.status, "VALIDATED")
})

test("emitWorkerAgentRun rejects execution without passing load validation", () => {
  const phase = createWorkerPhase("TEST-BAD-RUN")
  const wrongLoad = structuredClone(phase.loadBundle)
  wrongLoad.status = "FAILED"
  writeJsonExclusive(`${phase.evidenceDir}/corrupted-loads.json`, wrongLoad)
  assert.throws(
    () => emitWorkerAgentRun({
      routePath: phase.routePath,
      loadBundlePath: `${phase.evidenceDir}/corrupted-loads.json`,
      evidenceDir: phase.evidenceDir,
      subagentSessionId: randomUUID(),
      task: "Task",
      selfCritique: "Checked",
      validationRecords: [{ command: "test", status: "PASS", output: "ok" }]
    }),
    /must be schema version 1, canonical-execution-load-bundle, and LOADED|filename is not allowed/
  )
})

test("emitReviewerReview rejects worker and reviewer session reuse", () => {
  const sharedSessionId = randomUUID()
  const workerAgentRun = {
    receipt_id: randomUUID(),
    provenance: {
      authority: HOST_AUTHORITY,
      host_session_id: sharedSessionId,
      invocation_id: randomUUID()
    }
  }
  const phase = createWorkerPhase("TEST-REV-REUSE")
  const reviewerRoutePath = `${phase.evidenceDir}/${PHASE_FILENAMES.reviewerRoute}`
  const reviewerLoadPath = `${phase.evidenceDir}/${PHASE_FILENAMES.reviewerLoads}`
  const reviewerRoute = buildRouteBundle({ shortcut: "review:canonical", taskId: "TEST-REV-REUSE:review" })
  writeJsonExclusive(reviewerRoutePath, reviewerRoute)
  const reviewerLoadBundle = buildLoadBundle({ routePath: reviewerRoutePath })
  writeJsonExclusive(reviewerLoadPath, reviewerLoadBundle)

  assert.throws(
    () => emitReviewerReview({
      routePath: reviewerRoutePath,
      loadBundlePath: reviewerLoadPath,
      evidenceDir: phase.evidenceDir,
      subagentSessionId: sharedSessionId,
      subagentInvocationId: workerAgentRun.provenance.invocation_id,
      workerAgentRun,
      workerArtifacts: [{ path: REGISTRY_PATH, sha256: hashFile(REGISTRY_PATH) }],
      passJustification: "Checked"
    }),
    /Reviewer must not reuse the worker host session and invocation identity/
  )
})
