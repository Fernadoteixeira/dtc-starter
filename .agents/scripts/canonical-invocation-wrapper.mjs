import { randomUUID } from "node:crypto"
import { readFileSync } from "node:fs"
import { pathToFileURL } from "node:url"
import {
  assertExactObjectKeys,
  assertIsoTimestamp,
  assertNonEmptyString,
  assertSha256,
  assertUuid,
  canonicalRepoPath,
  failCli,
  hashCanonicalValue,
  hashFile,
  parseArguments,
  readJson,
  resolveEvidenceOutputPath,
  validateReceiptFileHash,
  validateRouteBundle,
  writeJsonExclusive
} from "./canonical-execution-lib.mjs"
import {
  hashExecutionInputBundle,
  validateCompletedValidationRecords,
  validateFindings,
  validateReviewDecision,
  validateReviewedArtifacts,
  validateTaskValue
} from "./validate-execution-evidence.mjs"
import { validateExecutionLoads } from "./validate-execution-loads.mjs"
import { captureHostProvenance, validateHostProvenance } from "./host-provenance-adapter.mjs"

export function emitWorkerAgentRun({
  routePath,
  loadBundlePath,
  evidenceDir,
  subagentSessionId,
  subagentInvocationId,
  task,
  artifactPaths = [],
  selfCritique,
  validationRecords = [],
  stopConditionSatisfied = true
}) {
  const loadValidation = validateExecutionLoads({ routePath, loadBundlePath, evidenceDir })
  if (loadValidation.status !== "VALIDATED") {
    throw new Error("Cannot emit AGENT-RUN without passing load validation")
  }

  const canonicalRoutePath = canonicalRepoPath(routePath)
  const canonicalLoadPath = canonicalRepoPath(loadBundlePath)
  const route = readJson(canonicalRoutePath, canonicalRoutePath)
  const loadBundle = readJson(canonicalLoadPath, canonicalLoadPath)

  const { resolved, routeReceipt, agentReceipt } = validateRouteBundle(route)
  const provenance = captureHostProvenance({
    executionKind: "worker",
    subagentSessionId,
    subagentInvocationId
  })

  validateHostProvenance(provenance, "worker provenance")

  const validatedTask = validateTaskValue(task)
  validateCompletedValidationRecords(validationRecords)

  const validatedArtifacts = artifactPaths.map((repoPath) => {
    const canonicalPath = canonicalRepoPath(repoPath)
    return {
      path: canonicalPath,
      sha256: hashFile(canonicalPath)
    }
  })

  const protocolReceipt = loadBundle.receipts.find((r) => r.type === "PROTOCOL-LOAD-E")
  const dispatcherReceipt = loadBundle.receipts.find((r) => r.type === "DISPATCHER-LOAD-E")
  const adapterReceipt = loadBundle.receipts.find((r) => r.type === "ADAPTER-LOAD-E")
  const skillReceipts = loadBundle.receipts.filter((r) => r.type === "SKILL-LOAD-E").map((r) => r.receipt_id)
  const orchestrationReceipts = loadBundle.receipts.filter((r) => r.type === "ORCHESTRATION-LOAD-E").map((r) => r.receipt_id)
  const contractReceipts = loadBundle.receipts.filter((r) => r.type === "CONTRACT-LOAD-E").map((r) => r.receipt_id)

  const agentRun = {
    type: "AGENT-RUN",
    receipt_id: randomUUID(),
    invocation_id: provenance.invocation_id,
    timestamp: new Date().toISOString(),
    status: "COMPLETED",
    task_id: route.task_id,
    adapter: "canonical-worker",
    canonical_identity: resolved.canonical_agent,
    route_receipt_ref: routeReceipt.receipt_id,
    agent_load_receipt_ref: agentReceipt.receipt_id,
    protocol_receipt_ref: protocolReceipt.receipt_id,
    dispatcher_receipt_ref: dispatcherReceipt.receipt_id,
    adapter_receipt_ref: adapterReceipt.receipt_id,
    skill_receipt_refs: skillReceipts,
    orchestration_receipt_refs: orchestrationReceipts,
    contract_receipt_refs: contractReceipts,
    instructions_acknowledged: true,
    task: validatedTask,
    task_sha256: hashCanonicalValue(validatedTask, "AGENT-RUN.task"),
    input_bundle_sha256: hashExecutionInputBundle(route, loadBundle),
    artifact_refs: validatedArtifacts.map((a) => a.path),
    self_critique: assertNonEmptyString(selfCritique, "self_critique"),
    auto_improve_iterations: 0,
    validation: validationRecords,
    stop_condition_satisfied: stopConditionSatisfied === true,
    provenance
  }

  return { agentRun, artifacts: validatedArtifacts, provenance }
}

export function emitReviewerReview({
  routePath,
  loadBundlePath,
  evidenceDir,
  subagentSessionId,
  subagentInvocationId,
  workerAgentRun,
  workerArtifacts,
  findings = [],
  verdict = "PASS",
  passJustification
}) {
  const loadValidation = validateExecutionLoads({ routePath, loadBundlePath, evidenceDir })
  if (loadValidation.status !== "VALIDATED") {
    throw new Error("Cannot emit REVIEW-E without passing load validation")
  }

  const canonicalRoutePath = canonicalRepoPath(routePath)
  const canonicalLoadPath = canonicalRepoPath(loadBundlePath)
  const route = readJson(canonicalRoutePath, canonicalRoutePath)
  const loadBundle = readJson(canonicalLoadPath, canonicalLoadPath)

  const { resolved, routeReceipt, agentReceipt } = validateRouteBundle(route)
  const provenance = captureHostProvenance({
    executionKind: "reviewer",
    subagentSessionId,
    subagentInvocationId
  })

  validateHostProvenance(provenance, "reviewer provenance")

  if (provenance.host_session_id === workerAgentRun?.provenance?.host_session_id && provenance.invocation_id === workerAgentRun?.provenance?.invocation_id) {
    throw new Error("Reviewer must not reuse the worker host session and invocation identity")
  }

  validateReviewedArtifacts(workerArtifacts, workerArtifacts)
  validateReviewDecision(findings, verdict, passJustification)

  const protocolReceipt = loadBundle.receipts.find((r) => r.type === "PROTOCOL-LOAD-E")
  const dispatcherReceipt = loadBundle.receipts.find((r) => r.type === "DISPATCHER-LOAD-E")
  const adapterReceipt = loadBundle.receipts.find((r) => r.type === "ADAPTER-LOAD-E")
  const skillReceipts = loadBundle.receipts.filter((r) => r.type === "SKILL-LOAD-E").map((r) => r.receipt_id)
  const orchestrationReceipts = loadBundle.receipts.filter((r) => r.type === "ORCHESTRATION-LOAD-E").map((r) => r.receipt_id)
  const contractReceipts = loadBundle.receipts.filter((r) => r.type === "CONTRACT-LOAD-E").map((r) => r.receipt_id)

  const review = {
    type: "REVIEW-E",
    receipt_id: randomUUID(),
    invocation_id: provenance.invocation_id,
    timestamp: new Date().toISOString(),
    status: "COMPLETED",
    task_id: route.task_id,
    adapter: "canonical-reviewer",
    canonical_identity: resolved.canonical_agent,
    review_target: workerAgentRun.receipt_id,
    route_receipt_ref: routeReceipt.receipt_id,
    agent_load_receipt_ref: agentReceipt.receipt_id,
    protocol_receipt_ref: protocolReceipt.receipt_id,
    dispatcher_receipt_ref: dispatcherReceipt.receipt_id,
    adapter_receipt_ref: adapterReceipt.receipt_id,
    skill_receipt_refs: skillReceipts,
    orchestration_receipt_refs: orchestrationReceipts,
    contract_receipt_refs: contractReceipts,
    instructions_acknowledged: true,
    reviewed_artifacts: workerArtifacts,
    findings,
    verdict,
    pass_justification: passJustification,
    provenance
  }

  return { review, provenance }
}
