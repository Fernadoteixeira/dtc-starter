import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import {
  DISPATCHER_PATH,
  PHASE_FILENAMES,
  PROTOCOL_PATH,
  REGISTRY_PATH,
  REPO_ROOT,
  assertEvidenceInputPath,
  assertExternalSkillPath,
  hashCanonicalValue,
  hashFile,
  resolveEvidenceOutputPath,
  validateRouteBundle,
  writeJsonExclusive
} from "./canonical-execution-lib.mjs"
import { buildRouteBundle } from "./resolve-agent-shortcut.mjs"
import { buildLoadBundle } from "./resolve-agent-skills.mjs"
import {
  HOST_AUTHORITY,
  captureHostProvenance,
  validateHostProvenance
} from "./host-provenance-adapter.mjs"
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
} from "./validate-execution-evidence.mjs"
import { validateExecutionLoads } from "./validate-execution-loads.mjs"

function createValidBaseEvidence(temporaryDirectory, taskId = "NOS-001-EF-03") {
  const absEvidenceDir = mkdtempSync(path.join(temporaryDirectory, "base-"))
  const evidenceDir = path.relative(REPO_ROOT, absEvidenceDir).replaceAll("\\", "/")
  const workerRoutePath = `${evidenceDir}/${PHASE_FILENAMES.workerRoute}`
  const workerLoadPath = `${evidenceDir}/${PHASE_FILENAMES.workerLoads}`
  const reviewerRoutePath = `${evidenceDir}/${PHASE_FILENAMES.reviewerRoute}`
  const reviewerLoadPath = `${evidenceDir}/${PHASE_FILENAMES.reviewerLoads}`

  const workerRoute = buildRouteBundle({ shortcut: "repo:guard", taskId })
  writeJsonExclusive(workerRoutePath, workerRoute)
  const workerLoadBundle = buildLoadBundle({ routePath: workerRoutePath })
  writeJsonExclusive(workerLoadPath, workerLoadBundle)

  const reviewerRoute = buildRouteBundle({ shortcut: "review:canonical", taskId: `${taskId}:review` })
  writeJsonExclusive(reviewerRoutePath, reviewerRoute)
  const reviewerLoadBundle = buildLoadBundle({ routePath: reviewerRoutePath })
  writeJsonExclusive(reviewerLoadPath, reviewerLoadBundle)

  const workerSessionId = randomUUID()
  const reviewerSessionId = randomUUID()
  const workerInvocationId = randomUUID()
  const reviewerInvocationId = randomUUID()

  const workerProvenance = {
    authority: HOST_AUTHORITY,
    host_session_id: workerSessionId,
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: workerInvocationId,
    execution_kind: "worker",
    issued_at: new Date().toISOString()
  }

  const reviewerProvenance = {
    authority: HOST_AUTHORITY,
    host_session_id: reviewerSessionId,
    host_trajectory_id: randomUUID(),
    host_project_id: randomUUID(),
    invocation_id: reviewerInvocationId,
    execution_kind: "reviewer",
    issued_at: new Date().toISOString()
  }

  const artifactPath = REGISTRY_PATH
  const artifacts = [{ path: artifactPath, sha256: hashFile(artifactPath) }]

  const workerReceipt = workerRoute.receipts.find((r) => r.type === "ROUTE-E")
  const workerAgentReceipt = workerRoute.receipts.find((r) => r.type === "AGENT-LOAD-E")
  const workerProto = workerLoadBundle.receipts.find((r) => r.type === "PROTOCOL-LOAD-E")
  const workerDisp = workerLoadBundle.receipts.find((r) => r.type === "DISPATCHER-LOAD-E")
  const workerAdap = workerLoadBundle.receipts.find((r) => r.type === "ADAPTER-LOAD-E")
  const workerSkills = workerLoadBundle.receipts.filter((r) => r.type === "SKILL-LOAD-E").map((r) => r.receipt_id)

  const revReceipt = reviewerRoute.receipts.find((r) => r.type === "ROUTE-E")
  const revAgentReceipt = reviewerRoute.receipts.find((r) => r.type === "AGENT-LOAD-E")
  const revProto = reviewerLoadBundle.receipts.find((r) => r.type === "PROTOCOL-LOAD-E")
  const revDisp = reviewerLoadBundle.receipts.find((r) => r.type === "DISPATCHER-LOAD-E")
  const revAdap = reviewerLoadBundle.receipts.find((r) => r.type === "ADAPTER-LOAD-E")
  const revSkills = reviewerLoadBundle.receipts.filter((r) => r.type === "SKILL-LOAD-E").map((r) => r.receipt_id)
  const revOrchs = reviewerLoadBundle.receipts.filter((r) => r.type === "ORCHESTRATION-LOAD-E").map((r) => r.receipt_id)

  const agentRunReceiptId = randomUUID()
  const task = "Execute repository guardian audit under @repo:guard"

  const agentRun = {
    type: "AGENT-RUN",
    receipt_id: agentRunReceiptId,
    invocation_id: workerInvocationId,
    timestamp: new Date().toISOString(),
    status: "COMPLETED",
    task_id: taskId,
    adapter: "canonical-worker",
    canonical_identity: "repo-cartographer",
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
    input_bundle_sha256: hashExecutionInputBundle(workerRoute, workerLoadBundle),
    artifact_refs: [artifactPath],
    self_critique: "Repository boundary and confinement verified.",
    auto_improve_iterations: 0,
    validation: [{ command: "node --test", status: "PASS", output: "passed" }],
    stop_condition_satisfied: true,
    provenance: workerProvenance
  }

  const review = {
    type: "REVIEW-E",
    receipt_id: randomUUID(),
    invocation_id: reviewerInvocationId,
    timestamp: new Date().toISOString(),
    status: "COMPLETED",
    task_id: `${taskId}:review`,
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
    pass_justification: "Zero blocking findings verified.",
    provenance: reviewerProvenance
  }

  const evidence = {
    schema_version: 1,
    kind: "canonical-execution-evidence",
    task_id: taskId,
    execution: {
      route: workerRoute,
      load_bundle: workerLoadBundle,
      agent_run: agentRun,
      artifacts
    },
    review_execution: {
      route: reviewerRoute,
      load_bundle: reviewerLoadBundle,
      review
    }
  }

  const evidencePath = `${evidenceDir}/${PHASE_FILENAMES.evidence}`
  writeJsonExclusive(evidencePath, evidence)

  return {
    evidenceDir,
    workerRoutePath,
    workerLoadPath,
    reviewerRoutePath,
    reviewerLoadPath,
    evidencePath,
    workerRoute,
    workerLoadBundle,
    reviewerRoute,
    reviewerLoadBundle,
    agentRun,
    review,
    evidence,
    artifacts
  }
}

export function runAdversarialMatrix() {
  const temporaryDirectory = mkdtempSync(path.join(REPO_ROOT, ".agents", "scripts", "__tests__", "adversarial-"))
  const results = []

  try {
    // 01 stale skill hash
    {
      const base = createValidBaseEvidence(temporaryDirectory, "ATTACK-01")
      const mutatedBundle = structuredClone(base.workerLoadBundle)
      const targetReceipt = mutatedBundle.receipts.find((r) => r.type === "SKILL-LOAD-E" || r.type === "PROTOCOL-LOAD-E")
      targetReceipt.sha256 = "0".repeat(64)
      const attackPath = `${base.evidenceDir}/stale-loads.json`
      writeJsonExclusive(attackPath, mutatedBundle)

      let actualResult = "UNEXPECTED_PASS"
      let errorCode = "NONE"
      try {
        validateLoadBundle(mutatedBundle, base.workerRoute, { evidenceDir: base.evidenceDir })
      } catch (error) {
        actualResult = error.message
        errorCode = "LOAD_HASH_MISMATCH"
      }
      const pass = actualResult.includes("hash mismatch")
      results.push({
        attack_id: "01_stale_skill_hash",
        attack_number: 1,
        name: "Stale skill or protocol hash tampering",
        precondition: "Valid load bundle with verifiable SHA-256 hashes",
        mutation: "Tampered receipt sha256 replaced with 64 zero-hex string",
        expected_failure: "hash mismatch",
        actual_result: actualResult,
        validator: "validate-execution-loads.mjs::validateLoadBundle",
        error_code: errorCode,
        worker_invoked: false,
        reviewer_invoked: false,
        artifact_mutated: false,
        pass_fail: pass ? "PASS" : "FAIL",
        evidence_path: attackPath
      })
    }

    // 02 contract disguised as SKILL-E
    {
      let actualResult = "UNEXPECTED_PASS"
      let errorCode = "NONE"
      const fakeSkillPath = ".agents/contracts/session-state-ledger.md"
      try {
        assertExternalSkillPath(fakeSkillPath)
      } catch (error) {
        actualResult = error.message
        errorCode = "CONTRACT_DISGUISED_AS_SKILL"
      }
      const pass = actualResult.includes("cannot be an external contract")
      results.push({
        attack_id: "02_contract_disguised_as_skill",
        attack_number: 2,
        name: "Governance contract disguised as external skill",
        precondition: "Canonical external skill path validation",
        mutation: "Attempt to load .agents/contracts/session-state-ledger.md as external skill",
        expected_failure: "Skill receipt path cannot be an external contract",
        actual_result: actualResult,
        validator: "canonical-execution-lib.mjs::assertExternalSkillPath",
        error_code: errorCode,
        worker_invoked: false,
        reviewer_invoked: false,
        artifact_mutated: false,
        pass_fail: pass ? "PASS" : "FAIL",
        evidence_path: fakeSkillPath
      })
    }

    // 03 lexical path traversal
    {
      let actualResult = "UNEXPECTED_PASS"
      let errorCode = "NONE"
      const traversalPath = "docs/artifacts/bb-nos/nos-001/execution-fabric/ef-03/../../escape.json"
      try {
        assertEvidenceInputPath(traversalPath, "evidencePath")
      } catch (error) {
        actualResult = error.message
        errorCode = "LEXICAL_PATH_TRAVERSAL"
      }
      const pass = actualResult.includes("traversal characters")
      results.push({
        attack_id: "03_lexical_path_traversal",
        attack_number: 3,
        name: "Lexical parent-directory path traversal",
        precondition: "Canonical evidence input path assertion",
        mutation: "Path containing relative ../ escape sequence",
        expected_failure: "Path must not contain traversal characters (..)",
        actual_result: actualResult,
        validator: "canonical-execution-lib.mjs::assertEvidenceInputPath",
        error_code: errorCode,
        worker_invoked: false,
        reviewer_invoked: false,
        artifact_mutated: false,
        pass_fail: pass ? "PASS" : "FAIL",
        evidence_path: traversalPath
      })
    }

    // 04 physical/symlink path escape
    {
      const base = createValidBaseEvidence(temporaryDirectory, "ATTACK-04")
      let actualResult = "UNEXPECTED_PASS"
      let errorCode = "NONE"
      const escapePath = "apps/storefront/escape.json"
      try {
        resolveEvidenceOutputPath({ evidenceDir: base.evidenceDir, relativeFilename: "../../../escape.json" })
      } catch (error) {
        actualResult = error.message
        errorCode = "PHYSICAL_PATH_ESCAPE"
      }
      const pass = actualResult.includes("must be within the target evidence directory")
      results.push({
        attack_id: "04_physical_path_escape",
        attack_number: 4,
        name: "Physical directory escape outside evidence boundary",
        precondition: "Target evidence directory confinement",
        mutation: "Target path resolving outside physical directory",
        expected_failure: "Evidence output path must be within the target evidence directory",
        actual_result: actualResult,
        validator: "canonical-execution-lib.mjs::resolveEvidenceOutputPath",
        error_code: errorCode,
        worker_invoked: false,
        reviewer_invoked: false,
        artifact_mutated: false,
        pass_fail: pass ? "PASS" : "FAIL",
        evidence_path: escapePath
      })
    }

    // 05 evidence receipt overwrite
    {
      const base = createValidBaseEvidence(temporaryDirectory, "ATTACK-05")
      let actualResult = "UNEXPECTED_PASS"
      let errorCode = "NONE"
      try {
        writeJsonExclusive(base.evidencePath, { overwritten: true })
      } catch (error) {
        actualResult = error.message
        errorCode = "EXCLUSIVE_WRITE_VIOLATION"
      }
      const pass = actualResult.includes("already exists and cannot be overwritten")
      results.push({
        attack_id: "05_evidence_receipt_overwrite",
        attack_number: 5,
        name: "Destructive in-place overwrite of evidence artifact",
        precondition: "Pre-existing evidence artifact at target path",
        mutation: "Attempt to overwrite existing evidence with new content using writeJsonExclusive",
        expected_failure: "Evidence file already exists and cannot be overwritten",
        actual_result: actualResult,
        validator: "canonical-execution-lib.mjs::writeJsonExclusive",
        error_code: errorCode,
        worker_invoked: false,
        reviewer_invoked: false,
        artifact_mutated: false,
        pass_fail: pass ? "PASS" : "FAIL",
        evidence_path: base.evidencePath
      })
    }

    // 06 missing mandatory load receipt
    {
      const base = createValidBaseEvidence(temporaryDirectory, "ATTACK-06")
      const mutatedBundle = structuredClone(base.workerLoadBundle)
      mutatedBundle.receipts = mutatedBundle.receipts.filter((r) => r.type !== "PROTOCOL-LOAD-E")
      let actualResult = "UNEXPECTED_PASS"
      let errorCode = "NONE"
      try {
        validateLoadBundle(mutatedBundle, base.workerRoute, { evidenceDir: base.evidenceDir })
      } catch (error) {
        actualResult = error.message
        errorCode = "MISSING_MANDATORY_LOAD_RECEIPT"
      }
      const pass = actualResult.includes("Missing required load receipt for protocol") || actualResult.includes("Load receipts do not exactly cover")
      results.push({
        attack_id: "06_missing_mandatory_load_receipt",
        attack_number: 6,
        name: "Omission of mandatory protocol load receipt",
        precondition: "Valid load bundle requiring protocol, dispatcher, adapter, skills",
        mutation: "Omission of PROTOCOL-LOAD-E receipt from load bundle",
        expected_failure: "Missing required load receipt for protocol",
        actual_result: actualResult,
        validator: "validate-execution-evidence.mjs::validateLoadBundle",
        error_code: errorCode,
        worker_invoked: false,
        reviewer_invoked: false,
        artifact_mutated: false,
        pass_fail: pass ? "PASS" : "FAIL",
        evidence_path: base.evidencePath
      })
    }

    // 07 unknown/extra receipt injection
    {
      const base = createValidBaseEvidence(temporaryDirectory, "ATTACK-07")
      const mutatedBundle = structuredClone(base.workerLoadBundle)
      mutatedBundle.receipts.push({
        type: "INJECTED-FAKE-LOAD-E",
        receipt_id: randomUUID(),
        invocation_id: randomUUID(),
        timestamp: new Date().toISOString(),
        status: "LOADED",
        task_id: "ATTACK-07"
      })
      let actualResult = "UNEXPECTED_PASS"
      let errorCode = "NONE"
      try {
        validateLoadBundle(mutatedBundle, base.workerRoute, { evidenceDir: base.evidenceDir })
      } catch (error) {
        actualResult = error.message
        errorCode = "UNKNOWN_RECEIPT_INJECTION"
      }
      const pass = actualResult.includes("Unknown load receipt type: INJECTED-FAKE-LOAD-E") || actualResult.includes("INJECTED-FAKE-LOAD-E has an invalid invocation_id")
      results.push({
        attack_id: "07_unknown_receipt_injection",
        attack_number: 7,
        name: "Unauthorized load receipt class injection",
        precondition: "Strict receipt class whitelist validation",
        mutation: "Injection of unauthorized INJECTED-FAKE-LOAD-E receipt into bundle",
        expected_failure: "Unknown load receipt type",
        actual_result: actualResult,
        validator: "validate-execution-evidence.mjs::validateLoadBundle",
        error_code: errorCode,
        worker_invoked: false,
        reviewer_invoked: false,
        artifact_mutated: false,
        pass_fail: pass ? "PASS" : "FAIL",
        evidence_path: base.evidencePath
      })
    }

    // 08 wrong worker adapter
    {
      const base = createValidBaseEvidence(temporaryDirectory, "ATTACK-08")
      const mutatedEvidence = structuredClone(base.evidence)
      mutatedEvidence.execution.agent_run.adapter = "unauthorized-worker"
      let actualResult = "UNEXPECTED_PASS"
      let errorCode = "NONE"
      try {
        validateExecutionEvidence(mutatedEvidence, { evidenceDir: base.evidenceDir, evidencePath: base.evidencePath })
      } catch (error) {
        actualResult = error.message
        errorCode = "WRONG_WORKER_ADAPTER"
      }
      const pass = actualResult.includes("AGENT-RUN type or adapter is invalid")
      results.push({
        attack_id: "08_wrong_worker_adapter",
        attack_number: 8,
        name: "Worker execution under unauthorized adapter identity",
        precondition: "AGENT-RUN adapter must be canonical-worker",
        mutation: "Altered AGENT-RUN adapter to unauthorized-worker",
        expected_failure: "AGENT-RUN type or adapter is invalid",
        actual_result: actualResult,
        validator: "validate-execution-evidence.mjs::validateExecutionEvidence",
        error_code: errorCode,
        worker_invoked: false,
        reviewer_invoked: false,
        artifact_mutated: false,
        pass_fail: pass ? "PASS" : "FAIL",
        evidence_path: base.evidencePath
      })
    }

    // 09 non-canonical reviewer shortcut
    {
      const base = createValidBaseEvidence(temporaryDirectory, "ATTACK-09")
      const mutatedReviewerRoute = structuredClone(base.reviewerRoute)
      mutatedReviewerRoute.shortcut = "review:custom"
      let actualResult = "UNEXPECTED_PASS"
      let errorCode = "NONE"
      try {
        validateReviewerRoutePolicy({ bundle: mutatedReviewerRoute, agentDefinition: { write_role: false } }, "ATTACK-09")
      } catch (error) {
        actualResult = error.message
        errorCode = "NON_CANONICAL_REVIEWER_SHORTCUT"
      }
      const pass = actualResult.includes("Reviewer route must use exactly review:canonical")
      results.push({
        attack_id: "09_non_canonical_reviewer_shortcut",
        attack_number: 9,
        name: "Reviewer route policy bypass with custom shortcut",
        precondition: "Reviewer must strictly use review:canonical shortcut",
        mutation: "Altered reviewer route shortcut to review:custom",
        expected_failure: "Reviewer route must use exactly review:canonical and <task_id>:review",
        actual_result: actualResult,
        validator: "validate-execution-evidence.mjs::validateReviewerRoutePolicy",
        error_code: errorCode,
        worker_invoked: false,
        reviewer_invoked: false,
        artifact_mutated: false,
        pass_fail: pass ? "PASS" : "FAIL",
        evidence_path: base.reviewerRoutePath
      })
    }

    // 10 reused invocation/session identity
    {
      const base = createValidBaseEvidence(temporaryDirectory, "ATTACK-10")
      const mutatedEvidence = structuredClone(base.evidence)
      mutatedEvidence.review_execution.review.invocation_id = mutatedEvidence.execution.agent_run.invocation_id
      mutatedEvidence.review_execution.review.provenance.invocation_id = mutatedEvidence.execution.agent_run.invocation_id
      mutatedEvidence.review_execution.review.provenance.host_session_id = mutatedEvidence.execution.agent_run.provenance.host_session_id
      let actualResult = "UNEXPECTED_PASS"
      let errorCode = "NONE"
      try {
        validateExecutionEvidence(mutatedEvidence, { evidenceDir: base.evidenceDir, evidencePath: base.evidencePath })
      } catch (error) {
        actualResult = error.message
        errorCode = "REUSED_SESSION_OR_INVOCATION_IDENTITY"
      }
      const pass = actualResult.includes("Worker and reviewer must not reuse the same host session id") || actualResult.includes("invocation_id must differ")
      results.push({
        attack_id: "10_reused_invocation_session_identity",
        attack_number: 10,
        name: "Worker session reuse / reviewer collusion attack",
        precondition: "Worker and Reviewer host sessions and invocation IDs must be strictly distinct",
        mutation: "Reviewer reuses worker host session ID and worker invocation ID",
        expected_failure: "Worker and reviewer must not reuse the same host session id",
        actual_result: actualResult,
        validator: "validate-execution-evidence.mjs::validateExecutionEvidence",
        error_code: errorCode,
        worker_invoked: false,
        reviewer_invoked: false,
        artifact_mutated: false,
        pass_fail: pass ? "PASS" : "FAIL",
        evidence_path: base.evidencePath
      })
    }

    // 11 artifact mutation after worker completion
    {
      const base = createValidBaseEvidence(temporaryDirectory, "ATTACK-11")
      const mutatedEvidence = structuredClone(base.evidence)
      mutatedEvidence.execution.artifacts[0].sha256 = "f".repeat(64)
      let actualResult = "UNEXPECTED_PASS"
      let errorCode = "NONE"
      try {
        validateExecutionEvidence(mutatedEvidence, { evidenceDir: base.evidenceDir, evidencePath: base.evidencePath })
      } catch (error) {
        actualResult = error.message
        errorCode = "ARTIFACT_HASH_MUTATION"
      }
      const pass = actualResult.includes("Artifact hash mismatch") || actualResult.includes("hash mismatch")
      results.push({
        attack_id: "11_artifact_mutation_after_worker",
        attack_number: 11,
        name: "Artifact content or hash tampering after worker completion",
        precondition: "Artifact hash must match actual file on filesystem",
        mutation: "Altered SHA-256 hash in execution artifacts record",
        expected_failure: "Artifact hash mismatch",
        actual_result: actualResult,
        validator: "validate-execution-evidence.mjs::validateArtifacts",
        error_code: errorCode,
        worker_invoked: false,
        reviewer_invoked: false,
        artifact_mutated: true,
        pass_fail: pass ? "PASS" : "FAIL",
        evidence_path: base.evidencePath
      })
    }

    // 12 worker validation FAIL
    {
      const base = createValidBaseEvidence(temporaryDirectory, "ATTACK-12")
      const mutatedEvidence = structuredClone(base.evidence)
      mutatedEvidence.execution.agent_run.validation = [{ command: "npm test", status: "FAIL", output: "1 test failed" }]
      let actualResult = "UNEXPECTED_PASS"
      let errorCode = "NONE"
      try {
        validateCompletedValidationRecords(mutatedEvidence.execution.agent_run.validation)
      } catch (error) {
        actualResult = error.message
        errorCode = "VALIDATION_STATUS_FAIL"
      }
      const pass = actualResult.includes("validation command has not passed: FAIL") || actualResult.includes("validation status must be PASS")
      results.push({
        attack_id: "12_worker_validation_fail",
        attack_number: 12,
        name: "Worker submission with FAIL validation status",
        precondition: "Completed AGENT-RUN requires all validation records to be PASS",
        mutation: "Validation entry injected with status FAIL",
        expected_failure: "AGENT-RUN validation command has not passed: FAIL",
        actual_result: actualResult,
        validator: "validate-execution-evidence.mjs::validateCompletedValidationRecords",
        error_code: errorCode,
        worker_invoked: false,
        reviewer_invoked: false,
        artifact_mutated: false,
        pass_fail: pass ? "PASS" : "FAIL",
        evidence_path: base.evidencePath
      })
    }

    // 13 worker validation BLOCKED
    {
      const base = createValidBaseEvidence(temporaryDirectory, "ATTACK-13")
      const mutatedEvidence = structuredClone(base.evidence)
      mutatedEvidence.execution.agent_run.validation = [{ command: "npm test", status: "BLOCKED", output: "runner blocked" }]
      let actualResult = "UNEXPECTED_PASS"
      let errorCode = "NONE"
      try {
        validateCompletedValidationRecords(mutatedEvidence.execution.agent_run.validation)
      } catch (error) {
        actualResult = error.message
        errorCode = "VALIDATION_STATUS_BLOCKED"
      }
      const pass = actualResult.includes("validation command has not passed: BLOCKED") || actualResult.includes("validation status must be PASS")
      results.push({
        attack_id: "13_worker_validation_blocked",
        attack_number: 13,
        name: "Worker submission with BLOCKED validation status",
        precondition: "Completed AGENT-RUN rejects unresolved BLOCKED validations",
        mutation: "Validation entry injected with status BLOCKED",
        expected_failure: "AGENT-RUN validation command has not passed: BLOCKED",
        actual_result: actualResult,
        validator: "validate-execution-evidence.mjs::validateCompletedValidationRecords",
        error_code: errorCode,
        worker_invoked: false,
        reviewer_invoked: false,
        artifact_mutated: false,
        pass_fail: pass ? "PASS" : "FAIL",
        evidence_path: base.evidencePath
      })
    }

    // 14 reviewer PASS with blocking finding
    {
      let actualResult = "UNEXPECTED_PASS"
      let errorCode = "NONE"
      const blockingFindings = [{ severity: "high", path: REGISTRY_PATH, summary: "Critical issue", blocking: true }]
      try {
        validateReviewDecision(blockingFindings, "PASS", "Review passed despite issue")
      } catch (error) {
        actualResult = error.message
        errorCode = "REVIEW_PASS_WITH_BLOCKING_FINDINGS"
      }
      const pass = actualResult.includes("cannot PASS with blocking findings")
      results.push({
        attack_id: "14_reviewer_pass_with_blocking_finding",
        attack_number: 14,
        name: "Reviewer PASS issued despite blocking findings",
        precondition: "Reviewer cannot emit PASS if any finding has blocking: true",
        mutation: "Verdict PASS paired with blocking finding",
        expected_failure: "REVIEW-E cannot PASS with blocking findings",
        actual_result: actualResult,
        validator: "validate-execution-evidence.mjs::validateReviewDecision",
        error_code: errorCode,
        worker_invoked: false,
        reviewer_invoked: false,
        artifact_mutated: false,
        pass_fail: pass ? "PASS" : "FAIL",
        evidence_path: REGISTRY_PATH
      })
    }

    // 15 reviewed-artifact set mismatch
    {
      const base = createValidBaseEvidence(temporaryDirectory, "ATTACK-15")
      const mutatedReviewedArtifacts = [{ path: PROTOCOL_PATH, sha256: hashFile(PROTOCOL_PATH) }]
      let actualResult = "UNEXPECTED_PASS"
      let errorCode = "NONE"
      try {
        validateReviewedArtifacts(mutatedReviewedArtifacts, base.artifacts)
      } catch (error) {
        actualResult = error.message
        errorCode = "REVIEWED_ARTIFACT_SET_MISMATCH"
      }
      const pass = actualResult.includes("Reviewed artifacts do not match worker artifacts exactly") || actualResult.includes("does not exactly match")
      results.push({
        attack_id: "15_reviewed_artifact_set_mismatch",
        attack_number: 15,
        name: "Reviewer reviewed-artifact set mismatch",
        precondition: "Reviewer must inspect exact set of worker artifact paths and hashes",
        mutation: "Reviewer reviewed_artifacts replaced with different artifact set",
        expected_failure: "Reviewed artifacts do not match worker artifacts exactly",
        actual_result: actualResult,
        validator: "validate-execution-evidence.mjs::validateReviewedArtifacts",
        error_code: errorCode,
        worker_invoked: false,
        reviewer_invoked: false,
        artifact_mutated: false,
        pass_fail: pass ? "PASS" : "FAIL",
        evidence_path: base.evidencePath
      })
    }
  } finally {
    try {
      rmSync(temporaryDirectory, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 })
    } catch {
      // transient Windows lock on temp dirs can be safely ignored
    }
  }

  return results
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"))) {
  const results = runAdversarialMatrix()
  const total = results.length
  const passed = results.filter((r) => r.pass_fail === "PASS").length
  const failed = total - passed
  console.log(JSON.stringify({ total_attacks: total, blocked_attacks: passed, failed_attacks: failed, results }, null, 2))
  if (failed > 0) {
    process.exit(1)
  }
}
