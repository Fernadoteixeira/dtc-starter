import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { after, test } from "node:test"
import {
  DISPATCHER_PATH,
  PHASE_FILENAMES,
  PROTOCOL_PATH,
  REGISTRY_PATH,
  REPO_ROOT,
  SKILL_ROOT,
  VALIDATOR_PATH,
  assertExternalSkillPath,
  hashCanonicalValue,
  hashFile,
  resolveEvidenceOutputPath,
  validateRouteBundle,
  validateSkillConsumeReceipt,
  writeJsonExclusive
} from "../canonical-execution-lib.mjs"
import { buildRouteBundle } from "../resolve-agent-shortcut.mjs"
import { buildLoadBundle } from "../resolve-agent-skills.mjs"
import {
  hashExecutionInputBundle,
  validateAgentRunSchema,
  validateCompletedValidationRecords,
  validateExecutionEvidence,
  validateLoadBundle,
  validateReviewDecision,
  validateReviewedArtifacts,
  validateReviewerRoutePolicy,
  validateTaskValue
} from "../validate-execution-evidence.mjs"
import { validateExecutionLoads } from "../validate-execution-loads.mjs"
import {
  HOST_AUTHORITY,
  TRUST_LEVELS,
  captureHostProvenance,
  correlateHostTranscript,
  validateHostProvenance,
  verifyExternalHostAttestation
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

function createWorkerPhase(taskId = "ADV-001") {
  const evidenceDir = createEvidenceDirectory()
  const routePath = `${evidenceDir}/${PHASE_FILENAMES.workerRoute}`
  const loadPath = `${evidenceDir}/${PHASE_FILENAMES.workerLoads}`
  const route = buildRouteBundle({ shortcut: "architect:nos", taskId })
  writeJsonExclusive(routePath, route)
  const loadBundle = buildLoadBundle({ routePath })
  writeJsonExclusive(loadPath, loadBundle)
  return { evidenceDir, routePath, loadPath, route, loadBundle }
}

function createValidSkillConsumeReceipt(loadReceipt, agentRunReceiptId, taskId, invocationId) {
  return {
    type: "SKILL-CONSUME-E",
    receipt_id: randomUUID(),
    task_id: taskId,
    agent_run_ref: agentRunReceiptId,
    skill_load_receipt_ref: loadReceipt.receipt_id,
    skill_id: loadReceipt.skill_id,
    skill_path: loadReceipt.path,
    skill_sha256: loadReceipt.sha256,
    status: "CONSUMED",
    timestamp: new Date().toISOString(),
    invocation_id: invocationId,
    consumption_evidence: [
      {
        action: "Audited architecture requirements and validated schemas",
        artifact_path: REGISTRY_PATH,
        artifact_sha256: hashFile(REGISTRY_PATH),
        rule_or_capability_applied: "architecture-design-rule-1",
        evidence: "Verified registry entries and contract schemas"
      }
    ]
  }
}

function createCompleteEvidenceBundle(options = {}) {
  const phase = createWorkerPhase(options.taskId || "ADV-TEST")
  const reviewerRoutePath = `${phase.evidenceDir}/${PHASE_FILENAMES.reviewerRoute}`
  const reviewerLoadPath = `${phase.evidenceDir}/${PHASE_FILENAMES.reviewerLoads}`
  const reviewerRoute = buildRouteBundle({ shortcut: "review:canonical", taskId: `${options.taskId || "ADV-TEST"}:review` })
  writeJsonExclusive(reviewerRoutePath, reviewerRoute)
  const reviewerLoadBundle = buildLoadBundle({ routePath: reviewerRoutePath })
  writeJsonExclusive(reviewerLoadPath, reviewerLoadBundle)

  const workerInvocationId = options.workerInvocationId || randomUUID()
  const reviewerInvocationId = options.reviewerInvocationId || randomUUID()
  const workerHostSessionId = options.workerHostSessionId || randomUUID()
  const reviewerHostSessionId = options.reviewerHostSessionId || randomUUID()
  const artifactPath = REGISTRY_PATH
  const artifacts = [{ path: artifactPath, sha256: hashFile(artifactPath) }]

  const workerReceipt = phase.route.receipts.find((r) => r.type === "ROUTE-E")
  const workerAgentReceipt = phase.route.receipts.find((r) => r.type === "AGENT-LOAD-E")
  const workerProto = phase.loadBundle.receipts.find((r) => r.type === "PROTOCOL-LOAD-E")
  const workerDisp = phase.loadBundle.receipts.find((r) => r.type === "DISPATCHER-LOAD-E")
  const workerAdap = phase.loadBundle.receipts.find((r) => r.type === "ADAPTER-LOAD-E")
  const workerSkillReceipts = phase.loadBundle.receipts.filter((r) => r.type === "SKILL-LOAD-E")
  const workerOrchs = phase.loadBundle.receipts.filter((r) => r.type === "ORCHESTRATION-LOAD-E").map((r) => r.receipt_id)
  const workerContracts = phase.loadBundle.receipts.filter((r) => r.type === "CONTRACT-LOAD-E").map((r) => r.receipt_id)

  const revReceipt = reviewerRoute.receipts.find((r) => r.type === "ROUTE-E")
  const revAgentReceipt = reviewerRoute.receipts.find((r) => r.type === "AGENT-LOAD-E")
  const revProto = reviewerLoadBundle.receipts.find((r) => r.type === "PROTOCOL-LOAD-E")
  const revDisp = reviewerLoadBundle.receipts.find((r) => r.type === "DISPATCHER-LOAD-E")
  const revAdap = reviewerLoadBundle.receipts.find((r) => r.type === "ADAPTER-LOAD-E")
  const revSkillReceipts = reviewerLoadBundle.receipts.filter((r) => r.type === "SKILL-LOAD-E")
  const revOrchs = reviewerLoadBundle.receipts.filter((r) => r.type === "ORCHESTRATION-LOAD-E").map((r) => r.receipt_id)
  const revContracts = reviewerLoadBundle.receipts.filter((r) => r.type === "CONTRACT-LOAD-E").map((r) => r.receipt_id)

  const agentRunReceiptId = randomUUID()
  const reviewReceiptId = randomUUID()
  const task = "Perform complete adversarial test validation task"

  const workerConsumeReceipts = workerSkillReceipts.map((loadReceipt) =>
    createValidSkillConsumeReceipt(loadReceipt, agentRunReceiptId, phase.route.task_id, workerInvocationId)
  )
  const reviewerConsumeReceipts = revSkillReceipts.map((loadReceipt) =>
    createValidSkillConsumeReceipt(loadReceipt, reviewReceiptId, reviewerRoute.task_id, reviewerInvocationId)
  )

  const workerProv = options.workerProv !== undefined ? options.workerProv : {
    authority: HOST_AUTHORITY,
    host_session_id: workerHostSessionId,
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: workerInvocationId,
    execution_kind: "worker",
    issued_at: new Date().toISOString()
  }

  const reviewerProv = options.reviewerProv !== undefined ? options.reviewerProv : {
    authority: HOST_AUTHORITY,
    host_session_id: reviewerHostSessionId,
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: reviewerInvocationId,
    execution_kind: "reviewer",
    issued_at: new Date().toISOString()
  }

  const agentRun = {
    type: "AGENT-RUN",
    receipt_id: agentRunReceiptId,
    invocation_id: workerInvocationId,
    timestamp: new Date().toISOString(),
    status: "COMPLETED",
    task_id: phase.route.task_id,
    adapter: "canonical-worker",
    canonical_identity: "software-architect",
    route_receipt_ref: workerReceipt.receipt_id,
    agent_load_receipt_ref: workerAgentReceipt.receipt_id,
    protocol_receipt_ref: workerProto.receipt_id,
    dispatcher_receipt_ref: workerDisp.receipt_id,
    adapter_receipt_ref: workerAdap.receipt_id,
    skill_receipt_refs: workerSkillReceipts.map((r) => r.receipt_id),
    skill_consume_receipt_refs: workerConsumeReceipts.map((r) => r.receipt_id),
    skill_consume_receipts: workerConsumeReceipts,
    orchestration_receipt_refs: workerOrchs,
    contract_receipt_refs: workerContracts,
    instructions_acknowledged: true,
    task,
    task_sha256: hashCanonicalValue(task, "AGENT-RUN.task"),
    input_bundle_sha256: hashExecutionInputBundle(phase.route, phase.loadBundle),
    artifact_refs: [artifactPath],
    self_critique: "Self critique verified complete core skill consumption",
    auto_improve_iterations: 0,
    validation: [{ validator: "node --test", status: "PASS", evidence_path: VALIDATOR_PATH, evidence_sha256: hashFile(VALIDATOR_PATH) }],
    stop_condition_satisfied: true,
    ...(workerProv ? { provenance: workerProv } : {}),
    ...(options.workerCorrelation !== undefined ? { host_correlation: options.workerCorrelation } : {})
  }

  const review = {
    type: "REVIEW-E",
    receipt_id: reviewReceiptId,
    invocation_id: reviewerInvocationId,
    timestamp: new Date().toISOString(),
    status: "COMPLETED",
    task_id: reviewerRoute.task_id,
    adapter: "canonical-reviewer",
    canonical_identity: "code-reviewer",
    review_target: agentRunReceiptId,
    route_receipt_ref: revReceipt.receipt_id,
    agent_load_receipt_ref: revAgentReceipt.receipt_id,
    protocol_receipt_ref: revProto.receipt_id,
    dispatcher_receipt_ref: revDisp.receipt_id,
    adapter_receipt_ref: revAdap.receipt_id,
    skill_receipt_refs: revSkillReceipts.map((r) => r.receipt_id),
    skill_consume_receipt_refs: reviewerConsumeReceipts.map((r) => r.receipt_id),
    skill_consume_receipts: reviewerConsumeReceipts,
    orchestration_receipt_refs: revOrchs,
    contract_receipt_refs: revContracts,
    instructions_acknowledged: true,
    reviewed_artifacts: artifacts,
    findings: [],
    verdict: "PASS",
    pass_justification: "All receipts and artifacts verified",
    ...(reviewerProv ? { provenance: reviewerProv } : {}),
    ...(options.reviewerCorrelation !== undefined ? { host_correlation: options.reviewerCorrelation } : {})
  }

  const evidence = {
    schema_version: 1,
    kind: "canonical-execution-evidence",
    task_id: phase.route.task_id,
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
  return { phase, evidence, evidencePath, agentRun, review, workerConsumeReceipts, reviewerConsumeReceipts }
}

// -----------------------------------------------------------------------------
// ADVERSARIAL TEST SUITE: 32 ATTACK VECTORS
// -----------------------------------------------------------------------------

test("ADV-01: Forged signature without PKI verification fails to promote to host_provenance_verified", () => {
  const forgedWorkerProv = {
    authority: HOST_AUTHORITY,
    host_session_id: randomUUID(),
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: randomUUID(),
    execution_kind: "worker",
    issued_at: new Date().toISOString(),
    signature: "FORGED-SIGNATURE-PLAINTEXT",
    public_key: "FORGED-PUBLIC-KEY",
    signed_payload: "FORGED-PAYLOAD"
  }
  const attestation = verifyExternalHostAttestation(forgedWorkerProv)
  assert.equal(attestation.verified, false)
  assert.equal(attestation.trust_level, TRUST_LEVELS.HOST_PROVENANCE_CORRELATED)
})

test("ADV-02: Claimed host provenance without signature or correlation caps at host_provenance_claimed", () => {
  const bundle = createCompleteEvidenceBundle()
  const result = validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath })
  assert.equal(result.trust_level, "host_provenance_claimed")
  assert.equal(result.platform_attestation_verified, false)
})

test("ADV-03: Transcript unbound session returns UNBOUND_SESSION and caps trust level", () => {
  const fakeSessionId = randomUUID()
  const transcriptPath = path.join(temporaryDirectory, "transcript-unbound.jsonl")
  writeFileSync(transcriptPath, JSON.stringify({
    step_index: 10,
    created_at: new Date().toISOString(),
    tool_calls: [{ name: "invoke_subagent", args: { toolAction: "Run", Subagents: [{ TypeName: "canonical-worker", Role: "software-architect" }] } }]
  }) + "\n")

  const prov = {
    authority: HOST_AUTHORITY,
    host_session_id: fakeSessionId,
    host_trajectory_id: randomUUID(),
    invocation_id: randomUUID(),
    execution_kind: "worker"
  }
  const correlation = correlateHostTranscript({ provenance: prov, transcriptPath, taskId: "TASK-1", agentIdentity: "software-architect" })
  assert.equal(correlation.correlation_status, "UNBOUND_SESSION")
  assert.equal(correlation.trust_level, TRUST_LEVELS.HOST_PROVENANCE_CLAIMED)
})

test("ADV-04: Transcript missing invoke_subagent returns NOT_CORRELATED", () => {
  const transcriptPath = path.join(temporaryDirectory, "transcript-empty.jsonl")
  writeFileSync(transcriptPath, JSON.stringify({ step_index: 1, content: "Unrelated message" }) + "\n")
  const prov = {
    authority: HOST_AUTHORITY,
    host_session_id: randomUUID(),
    host_trajectory_id: randomUUID(),
    invocation_id: randomUUID(),
    execution_kind: "worker"
  }
  const correlation = correlateHostTranscript({ provenance: prov, transcriptPath, taskId: "TASK-1", agentIdentity: "software-architect" })
  assert.equal(correlation.correlation_status, "NOT_CORRELATED")
})

test("ADV-05: Non-existent transcript file returns UNAVAILABLE status", () => {
  const prov = {
    authority: HOST_AUTHORITY,
    host_session_id: randomUUID(),
    host_trajectory_id: randomUUID(),
    invocation_id: randomUUID(),
    execution_kind: "worker"
  }
  const correlation = correlateHostTranscript({ provenance: prov, transcriptPath: "/non/existent/path/transcript.jsonl" })
  assert.equal(correlation.correlation_status, "UNAVAILABLE")
})

test("ADV-06: SKILL-CONSUME-E with mismatched skill_id against referenced SKILL-LOAD-E throws", () => {
  const bundle = createCompleteEvidenceBundle()
  const targetConsume = bundle.evidence.execution.agent_run.skill_consume_receipts[0]
  targetConsume.skill_id = "fake-skill-id"
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /does not match referenced SKILL-LOAD-E\.skill_id/
  )
})

test("ADV-07: SKILL-CONSUME-E referencing non-existent skill_load_receipt_ref throws", () => {
  const bundle = createCompleteEvidenceBundle()
  const targetConsume = bundle.evidence.execution.agent_run.skill_consume_receipts[0]
  targetConsume.skill_load_receipt_ref = randomUUID()
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /not found in load bundle/
  )
})

test("ADV-08: SKILL-CONSUME-E with tampered skill_path throws", () => {
  const bundle = createCompleteEvidenceBundle()
  const targetConsume = bundle.evidence.execution.agent_run.skill_consume_receipts[0]
  targetConsume.skill_path = `${SKILL_ROOT}/fake/skill.json`
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /hash mismatch|does not match referenced SKILL-LOAD-E/
  )
})

test("ADV-09: SKILL-CONSUME-E with tampered skill_sha256 throws", () => {
  const bundle = createCompleteEvidenceBundle()
  const targetConsume = bundle.evidence.execution.agent_run.skill_consume_receipts[0]
  targetConsume.skill_sha256 = "0".repeat(64)
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /skill file hash mismatch|does not match referenced SKILL-LOAD-E\.sha256/
  )
})

test("ADV-10: SKILL-CONSUME-E with empty consumption_evidence array throws", () => {
  const bundle = createCompleteEvidenceBundle()
  const targetConsume = bundle.evidence.execution.agent_run.skill_consume_receipts[0]
  targetConsume.consumption_evidence = []
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /consumption_evidence must be a non-empty array/
  )
})

test("ADV-11: SKILL-CONSUME-E with stale artifact_sha256 in evidence throws", () => {
  const bundle = createCompleteEvidenceBundle()
  const targetConsume = bundle.evidence.execution.agent_run.skill_consume_receipts[0]
  targetConsume.consumption_evidence[0].artifact_sha256 = "0".repeat(64)
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /artifact hash mismatch/
  )
})

test("ADV-12: SKILL-CONSUME-E with non-canonical artifact_path in evidence throws", () => {
  const bundle = createCompleteEvidenceBundle()
  const targetConsume = bundle.evidence.execution.agent_run.skill_consume_receipts[0]
  targetConsume.consumption_evidence[0].artifact_path = `.${REGISTRY_PATH}`
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /artifact path must be canonical/
  )
})

test("ADV-13: Incomplete core skill consumption with instructions_acknowledged=true throws", () => {
  const bundle = createCompleteEvidenceBundle()
  // Drop all but 1 consume receipt
  bundle.evidence.execution.agent_run.skill_consume_receipts = [bundle.evidence.execution.agent_run.skill_consume_receipts[0]]
  bundle.evidence.execution.agent_run.skill_consume_receipt_refs = [bundle.evidence.execution.agent_run.skill_consume_receipts[0].receipt_id]
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /all required core skills consumed/
  )
})

test("ADV-14: Zero consume receipts with instructions_acknowledged=true throws", () => {
  const bundle = createCompleteEvidenceBundle()
  bundle.evidence.execution.agent_run.skill_consume_receipts = []
  bundle.evidence.execution.agent_run.skill_consume_receipt_refs = []
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /all required core skills consumed/
  )
})

test("ADV-15: SKILL-CONSUME-E with mismatched agent_run_ref throws", () => {
  const bundle = createCompleteEvidenceBundle()
  const targetConsume = bundle.evidence.execution.agent_run.skill_consume_receipts[0]
  targetConsume.agent_run_ref = randomUUID()
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /agent_run_ref does not match the target execution receipt_id/
  )
})

test("ADV-16: SKILL-CONSUME-E with mismatched task_id throws", () => {
  const bundle = createCompleteEvidenceBundle()
  const targetConsume = bundle.evidence.execution.agent_run.skill_consume_receipts[0]
  targetConsume.task_id = "DIFFERENT-TASK-ID"
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /task_id does not match the execution task_id/
  )
})

test("ADV-17: Reviewer reusing worker host session ID throws", () => {
  const sharedSessionId = randomUUID()
  const bundle = createCompleteEvidenceBundle({ workerHostSessionId: sharedSessionId, reviewerHostSessionId: sharedSessionId })
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /Worker and reviewer must not reuse the same host session id/
  )
})

test("ADV-18: Reviewer reusing worker invocation ID throws", () => {
  const sharedInvocationId = randomUUID()
  const bundle = createCompleteEvidenceBundle({ workerInvocationId: sharedInvocationId, reviewerInvocationId: sharedInvocationId })
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /Worker and reviewer must not reuse the same host invocation id|Invocation id collision/
  )
})

test("ADV-19: Invalid provenance authority name throws", () => {
  const invalidProv = {
    authority: "untrusted-authority",
    host_session_id: randomUUID(),
    host_trajectory_id: randomUUID(),
    invocation_id: randomUUID(),
    execution_kind: "worker"
  }
  assert.throws(
    () => validateHostProvenance(invalidProv),
    /authority must be antigravity-host/
  )
})

test("ADV-20: Mismatched execution_kind in worker provenance throws", () => {
  const invalidProv = {
    authority: HOST_AUTHORITY,
    host_session_id: randomUUID(),
    host_trajectory_id: randomUUID(),
    invocation_id: randomUUID(),
    execution_kind: "reviewer" // worker claims reviewer
  }
  const bundle = createCompleteEvidenceBundle({ workerProv: invalidProv })
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /Provenance execution_kind mismatch/
  )
})

test("ADV-21: Tampered task_sha256 in AGENT-RUN throws", () => {
  const bundle = createCompleteEvidenceBundle()
  bundle.evidence.execution.agent_run.task_sha256 = "0".repeat(64)
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /task_sha256 does not match/
  )
})

test("ADV-22: Tampered input_bundle_sha256 in AGENT-RUN throws", () => {
  const bundle = createCompleteEvidenceBundle()
  bundle.evidence.execution.agent_run.input_bundle_sha256 = "0".repeat(64)
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /input_bundle_sha256 does not match/
  )
})

test("ADV-23: Stale protocol receipt hash in load bundle throws", () => {
  const bundle = createCompleteEvidenceBundle()
  const proto = bundle.evidence.execution.load_bundle.receipts.find((r) => r.type === "PROTOCOL-LOAD-E")
  proto.sha256 = "0".repeat(64)
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /PROTOCOL-LOAD-E hash mismatch/
  )
})

test("ADV-24: Review verdict PASS with blocking P0 finding throws", () => {
  const bundle = createCompleteEvidenceBundle()
  bundle.evidence.review_execution.review.findings = [{
    id: "F-P0-01",
    severity: "P0",
    description: "Critical security boundary violation",
    blocking: true
  }]
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /verdict cannot be PASS with blocking findings/
  )
})

test("ADV-25: Review verdict PASS with blocking P1 finding throws", () => {
  const bundle = createCompleteEvidenceBundle()
  bundle.evidence.review_execution.review.findings = [{
    id: "F-P1-01",
    severity: "P1",
    description: "Incomplete validation coverage",
    blocking: true
  }]
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /verdict cannot be PASS with blocking findings/
  )
})

test("ADV-26: Reviewer reviewing mismatched worker artifact hash throws", () => {
  const bundle = createCompleteEvidenceBundle()
  bundle.evidence.review_execution.review.reviewed_artifacts[0].sha256 = "0".repeat(64)
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /hash mismatch/
  )
})

test("ADV-27: Incomplete reviewer core skill consumption throws", () => {
  const bundle = createCompleteEvidenceBundle()
  bundle.evidence.review_execution.review.skill_consume_receipts = []
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /all required reviewer core skills consumed/
  )
})

test("ADV-28: Path traversal outside evidence directory throws", () => {
  const evidenceDir = createEvidenceDirectory()
  assert.throws(
    () => resolveEvidenceOutputPath(`${evidenceDir}/../escape.json`, evidenceDir, ["escape.json"]),
    /outside the evidence directory/
  )
})

test("ADV-29: Reused receipt_id across different receipt groups throws", () => {
  const bundle = createCompleteEvidenceBundle()
  const duplicateId = bundle.evidence.execution.load_bundle.receipts[0].receipt_id
  bundle.evidence.review_execution.load_bundle.receipts[0].receipt_id = duplicateId
  assert.throws(
    () => validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath }),
    /Duplicate receipt_id detected/
  )
})

test("ADV-30: Correlation requires both worker and reviewer to be correlated", () => {
  const workerCorrelation = { correlation_status: "CORRELATED", host_session_id: randomUUID() }
  const reviewerCorrelation = { correlation_status: "NOT_CORRELATED", host_session_id: randomUUID() }
  const bundle = createCompleteEvidenceBundle({ workerCorrelation, reviewerCorrelation })
  const result = validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath })
  assert.equal(result.trust_level, "host_provenance_claimed")
})

test("ADV-31: Dual transcript correlation promotes trust level to host_provenance_correlated", () => {
  const workerCorrelation = { correlation_status: "CORRELATED", host_session_id: randomUUID() }
  const reviewerCorrelation = { correlation_status: "CORRELATED", host_session_id: randomUUID() }
  const bundle = createCompleteEvidenceBundle({ workerCorrelation, reviewerCorrelation })
  const result = validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath })
  assert.equal(result.trust_level, "host_provenance_correlated")
  assert.equal(result.platform_attestation_verified, false)
  assert.equal(result.status, "VALIDATED")
})

test("ADV-32: Full valid execution evidence validates with 0 blocking findings", () => {
  const bundle = createCompleteEvidenceBundle()
  const result = validateExecutionEvidence(bundle.evidence, { evidencePath: bundle.evidencePath })
  assert.equal(result.status, "VALIDATED")
  assert.equal(result.verdict, "PASS")
  assert.equal(result.blocking_findings, 0)
  assert.ok(result.validated_receipt_count > 0)
})
