import { randomUUID } from "node:crypto"
import { pathToFileURL } from "node:url"
import {
  DISPATCHER_PATH,
  LOAD_KIND,
  NOS_MANIFEST_PATH,
  NOS_ROOT,
  ORCHESTRATION_MANIFEST_PATH,
  ORCHESTRATION_ROOT,
  PHASE_FILENAMES,
  PROTOCOL_PATH,
  REVIEWER_ADAPTER_PATH,
  SKILL_ROOT,
  VALIDATOR_PATH,
  WORKER_ADAPTER_PATH,
  assertCoreSkillPath,
  assertEvidenceInputPath,
  assertExactObjectKeys,
  assertExternalSkillPath,
  assertIsoTimestamp,
  assertNode20,
  assertNonEmptyString,
  assertNosSkillPath,
  assertObject,
  assertOrchestrationPath,
  assertSha256,
  assertStringArray,
  assertUuid,
  canonicalRepoPath,
  createReceipt,
  failCli,
  hashCanonicalValue,
  hashFile,
  parseArguments,
  readJson,
  resolveEvidenceOutputPath,
  validateReceiptFileHash,
  validateRouteBundle,
  validateSkillConsumeReceipt,
  writeJsonExclusive
} from "./canonical-execution-lib.mjs"
import { TRUST_LEVELS } from "./host-provenance-adapter.mjs"

const AGENT_RUN_BASE_KEYS = [
  "type", "receipt_id", "invocation_id", "timestamp", "status", "task_id",
  "adapter", "canonical_identity", "route_receipt_ref", "agent_load_receipt_ref",
  "protocol_receipt_ref", "dispatcher_receipt_ref", "adapter_receipt_ref",
  "skill_receipt_refs", "orchestration_receipt_refs", "contract_receipt_refs",
  "instructions_acknowledged", "task", "task_sha256", "input_bundle_sha256",
  "artifact_refs", "self_critique", "auto_improve_iterations", "validation",
  "stop_condition_satisfied"
]
export const AGENT_RUN_KEYS = AGENT_RUN_BASE_KEYS
const REVIEW_BASE_KEYS = [
  "type", "receipt_id", "invocation_id", "timestamp", "status", "task_id",
  "adapter", "canonical_identity", "review_target", "route_receipt_ref",
  "agent_load_receipt_ref", "protocol_receipt_ref", "dispatcher_receipt_ref",
  "adapter_receipt_ref", "skill_receipt_refs", "orchestration_receipt_refs",
  "contract_receipt_refs", "instructions_acknowledged", "reviewed_artifacts",
  "findings", "verdict", "pass_justification"
]
export const REVIEW_KEYS = REVIEW_BASE_KEYS

function assertExactSet(actual, expected, label) {
  assertStringArray(actual, label)
  if (new Set(actual).size !== actual.length) throw new Error(`${label} contains duplicate values`)
  const actualSet = new Set(actual)
  const expectedSet = new Set(expected)
  if (actualSet.size !== expectedSet.size || [...expectedSet].some((value) => !actualSet.has(value))) {
    throw new Error(`${label} does not exactly match the required receipt references`)
  }
}

function assertReceiptEnvelope(receipt, label, expectedStatus) {
  const value = assertObject(receipt, label)
  assertNonEmptyString(value.type, `${label}.type`)
  assertUuid(value.receipt_id, `${label}.receipt_id`)
  assertUuid(value.invocation_id, `${label}.invocation_id`)
  assertIsoTimestamp(value.timestamp, `${label}.timestamp`)
  if (value.status !== expectedStatus) throw new Error(`${label}.status must be ${expectedStatus}`)
  return value
}

function indexManifest(manifestPath, idField, label) {
  const manifest = readJson(manifestPath, label)
  if (!Array.isArray(manifest)) throw new Error(`${label} must be an array`)
  const index = new Map()
  for (let position = 0; position < manifest.length; position += 1) {
    const entry = assertObject(manifest[position], `${label}[${position}]`)
    const id = assertNonEmptyString(entry[idField], `${label}[${position}].${idField}`)
    if (index.has(id)) throw new Error(`${label} contains duplicate id ${id}`)
    index.set(id, entry)
  }
  return index
}

function assertManifestBackedReceipt(receipt, manifestPath, manifestHash, root, entry, id, pathValidator) {
  if (receipt.manifest_path !== manifestPath || receipt.manifest_sha256 !== manifestHash) {
    throw new Error(`${receipt.type} ${id} has stale manifest evidence`)
  }
  assertSha256(receipt.manifest_sha256, `${receipt.type} ${id}.manifest_sha256`)
  if (hashFile(receipt.manifest_path) !== receipt.manifest_sha256) throw new Error(`${receipt.type} ${id} manifest hash mismatch`)
  const expectedPath = `${root}/${entry.file}`
  if (receipt.path !== expectedPath) throw new Error(`${receipt.type} ${id} path does not match manifest`)
  validateReceiptFileHash(receipt, `${receipt.type} ${id}`)
  pathValidator(receipt.path)
}

export function validateCoreSkillReceipt(receipt, coreIndex, manifestHash, bundle) {
  assertReceiptEnvelope(receipt, "SKILL-LOAD-E", "LOADED")
  if (receipt.invocation_id !== bundle.invocation_id || receipt.task_id !== bundle.task_id) {
    throw new Error(`SKILL-LOAD-E has an invalid invocation_id or task_id`)
  }
  const id = assertNonEmptyString(receipt.skill_id, "SKILL-LOAD-E.skill_id")
  const entry = coreIndex.get(id)
  if (!entry) throw new Error(`Unknown core skill id ${id}`)
  assertManifestBackedReceipt(receipt, PROTOCOL_PATH, manifestHash, SKILL_ROOT, entry, id, assertCoreSkillPath)
}

export function validateExternalSkillReceipt(receipt, externalMap, bundle) {
  assertReceiptEnvelope(receipt, "SKILL-LOAD-E", "LOADED")
  if (receipt.invocation_id !== bundle.invocation_id || receipt.task_id !== bundle.task_id) {
    throw new Error(`SKILL-LOAD-E has an invalid invocation_id or task_id`)
  }
  const id = assertNonEmptyString(receipt.skill_id, "SKILL-LOAD-E.skill_id")
  const expectedPath = externalMap.get(id)
  if (!expectedPath) throw new Error(`Unknown external skill id ${id}`)
  if (receipt.path !== expectedPath) throw new Error(`External skill ${id} path does not match route mapping`)
  validateReceiptFileHash(receipt, `External skill ${id}`)
  assertExternalSkillPath(receipt.path)
}

export function validateNosSkillReceipt(receipt, nosIndex, manifestHash, bundle) {
  assertReceiptEnvelope(receipt, "SKILL-LOAD-E", "LOADED")
  if (receipt.invocation_id !== bundle.invocation_id || receipt.task_id !== bundle.task_id) {
    throw new Error(`SKILL-LOAD-E has an invalid invocation_id or task_id`)
  }
  const id = assertNonEmptyString(receipt.skill_id, "SKILL-LOAD-E.skill_id")
  const entry = nosIndex.get(id)
  if (!entry) throw new Error(`Unknown nos skill id ${id}`)
  assertManifestBackedReceipt(receipt, NOS_MANIFEST_PATH, manifestHash, NOS_ROOT, entry, id, assertNosSkillPath)
}

export function validateOrchestrationReceipt(receipt, orchestrationIndex, manifestHash, bundle) {
  assertReceiptEnvelope(receipt, "ORCHESTRATION-LOAD-E", "LOADED")
  if (receipt.invocation_id !== bundle.invocation_id || receipt.task_id !== bundle.task_id) {
    throw new Error(`ORCHESTRATION-LOAD-E has an invalid invocation_id or task_id`)
  }
  const id = assertNonEmptyString(receipt.orchestration_id, "ORCHESTRATION-LOAD-E.orchestration_id")
  const entry = orchestrationIndex.get(id)
  if (!entry) throw new Error(`Unknown orchestration id ${id}`)
  assertManifestBackedReceipt(receipt, ORCHESTRATION_MANIFEST_PATH, manifestHash, ORCHESTRATION_ROOT, entry, id, assertOrchestrationPath)
}

export function validateContractReceipt(receipt, contractMap, bundle) {
  assertReceiptEnvelope(receipt, "CONTRACT-LOAD-E", "LOADED")
  if (receipt.invocation_id !== bundle.invocation_id || receipt.task_id !== bundle.task_id) {
    throw new Error(`CONTRACT-LOAD-E has an invalid invocation_id or task_id`)
  }
  const name = assertNonEmptyString(receipt.contract_name, "CONTRACT-LOAD-E.contract_name")
  const expectedPath = contractMap.get(name)
  if (!expectedPath) throw new Error(`Unknown contract name ${name}`)
  if (receipt.path !== expectedPath) throw new Error(`Contract ${name} path does not match route mapping`)
  validateReceiptFileHash(receipt, `Contract ${name}`)
}

export function validateAgentRunSchema(agentRun) {
  const allowedKeys = [...AGENT_RUN_BASE_KEYS]
  if (agentRun?.provenance !== undefined) allowedKeys.push("provenance")
  if (agentRun?.skill_consume_receipt_refs !== undefined) allowedKeys.push("skill_consume_receipt_refs")
  if (agentRun?.host_correlation !== undefined) allowedKeys.push("host_correlation")
  const value = assertExactObjectKeys(agentRun, allowedKeys, "AGENT-RUN")
  assertReceiptEnvelope(value, "AGENT-RUN", "COMPLETED")
  return value
}

export function validateArtifacts(artifacts, agentRun) {
  if (!Array.isArray(artifacts)) throw new Error("artifacts must be an array")
  const paths = []
  for (let i = 0; i < artifacts.length; i += 1) {
    const item = assertObject(artifacts[i], `artifacts[${i}]`)
    const canonicalPath = canonicalRepoPath(item.path)
    if (item.path !== canonicalPath) throw new Error(`artifact[${i}].path must be canonical: ${canonicalPath}`)
    assertSha256(item.sha256, `artifact[${i}].sha256`)
    if (hashFile(canonicalPath) !== item.sha256) throw new Error(`artifact[${i}] hash mismatch for ${canonicalPath}`)
    paths.push(canonicalPath)
  }
  assertExactSet(agentRun.artifact_refs, paths, "AGENT-RUN.artifact_refs")
  return artifacts
}

export function validateCompletedValidationRecords(validation) {
  if (!Array.isArray(validation)) throw new Error("validation must be an array")
  for (let i = 0; i < validation.length; i += 1) {
    const item = assertObject(validation[i], `validation[${i}]`)
    assertNonEmptyString(item.validator, `validation[${i}].validator`)
    if (item.status !== "PASS") throw new Error(`validation[${i}].status must be PASS`)
    assertNonEmptyString(item.evidence_path, `validation[${i}].evidence_path`)
    const canonicalEvidencePath = canonicalRepoPath(item.evidence_path)
    if (item.evidence_path !== canonicalEvidencePath) throw new Error(`validation[${i}].evidence_path must be canonical: ${canonicalEvidencePath}`)
    assertSha256(item.evidence_sha256, `validation[${i}].evidence_sha256`)
    if (hashFile(canonicalEvidencePath) !== item.evidence_sha256) throw new Error(`validation[${i}] evidence hash mismatch for ${canonicalEvidencePath}`)
  }
}

export function validateTaskValue(task) {
  if (typeof task === "string") {
    const trimmed = task.trim()
    if (!trimmed) throw new Error("task string must not be empty")
    return trimmed
  }
  if (task && typeof task === "object" && !Array.isArray(task) && Object.keys(task).length > 0) {
    return task
  }
  throw new Error("task must be a non-empty string or a non-empty object")
}

export function validateExecutionReceiptRefs(runReceipt, routeValidation, loadReceipts, label) {
  if (runReceipt.route_receipt_ref !== routeValidation.routeReceipt.receipt_id) {
    throw new Error(`${label}.route_receipt_ref must equal ROUTE-E receipt_id`)
  }
  if (runReceipt.agent_load_receipt_ref !== routeValidation.agentReceipt.receipt_id) {
    throw new Error(`${label}.agent_load_receipt_ref must equal AGENT-LOAD-E receipt_id`)
  }
  if (runReceipt.protocol_receipt_ref !== loadReceipts.protocolReceipt.receipt_id) {
    throw new Error(`${label}.protocol_receipt_ref must equal PROTOCOL-LOAD-E receipt_id`)
  }
  if (runReceipt.dispatcher_receipt_ref !== loadReceipts.dispatcherReceipt.receipt_id) {
    throw new Error(`${label}.dispatcher_receipt_ref must equal DISPATCHER-LOAD-E receipt_id`)
  }
  if (runReceipt.adapter_receipt_ref !== loadReceipts.adapterReceipt.receipt_id) {
    throw new Error(`${label}.adapter_receipt_ref must equal ADAPTER-LOAD-E receipt_id`)
  }
  assertExactSet(runReceipt.skill_receipt_refs, loadReceipts.skillReceipts.map((r) => r.receipt_id), `${label}.skill_receipt_refs`)
  assertExactSet(runReceipt.orchestration_receipt_refs, loadReceipts.orchestrationReceipts.map((r) => r.receipt_id), `${label}.orchestration_receipt_refs`)
  assertExactSet(runReceipt.contract_receipt_refs, loadReceipts.contractReceipts.map((r) => r.receipt_id), `${label}.contract_receipt_refs`)
}

export function validateReviewedArtifacts(reviewedArtifacts, workerArtifacts) {
  if (!Array.isArray(reviewedArtifacts)) throw new Error("reviewed_artifacts must be an array")
  if (reviewedArtifacts.length !== workerArtifacts.length) throw new Error("reviewed_artifacts length mismatch")
  const workerMap = new Map(workerArtifacts.map((a) => [a.path, a.sha256]))
  for (let i = 0; i < reviewedArtifacts.length; i += 1) {
    const item = assertObject(reviewedArtifacts[i], `reviewed_artifacts[${i}]`)
    const canonicalPath = canonicalRepoPath(item.path)
    if (item.path !== canonicalPath) throw new Error(`reviewed_artifacts[${i}].path must be canonical: ${canonicalPath}`)
    assertSha256(item.sha256, `reviewed_artifacts[${i}].sha256`)
    if (workerMap.get(canonicalPath) !== item.sha256) throw new Error(`reviewed_artifacts[${i}] does not match worker artifact ${canonicalPath}`)
    if (hashFile(canonicalPath) !== item.sha256) throw new Error(`reviewed_artifacts[${i}] hash mismatch for ${canonicalPath}`)
  }
}

export function validateFindings(findings) {
  if (!Array.isArray(findings)) throw new Error("findings must be an array")
  const blocking = []
  for (let i = 0; i < findings.length; i += 1) {
    const item = assertObject(findings[i], `findings[${i}]`)
    assertNonEmptyString(item.id, `findings[${i}].id`)
    assertNonEmptyString(item.description, `findings[${i}].description`)
    if (item.severity !== "P0" && item.severity !== "P1" && item.severity !== "P2" && item.severity !== "P3") {
      throw new Error(`findings[${i}].severity must be P0, P1, P2, or P3`)
    }
    if (item.blocking !== true && item.blocking !== false) throw new Error(`findings[${i}].blocking must be boolean`)
    if (item.severity === "P0" || item.severity === "P1") {
      if (item.blocking !== true) throw new Error(`findings[${i}] P0/P1 must be blocking true`)
      blocking.push(item)
    }
  }
  return blocking
}

export function validateReviewDecision(findings, verdict, passJustification) {
  const blocking = validateFindings(findings)
  if (verdict !== "PASS" && verdict !== "FAIL" && verdict !== "REMEDIATION_REQUIRED") {
    throw new Error("verdict must be PASS, FAIL, or REMEDIATION_REQUIRED")
  }
  if (verdict === "PASS") {
    if (blocking.length > 0) throw new Error("verdict cannot be PASS with blocking findings")
    assertNonEmptyString(passJustification, "pass_justification")
  }
  return blocking
}

export function assertDistinctInvocations(items) {
  const seen = new Map()
  for (const [label, invocationId] of items) {
    assertUuid(invocationId, `${label} invocation_id`)
    if (seen.has(invocationId)) throw new Error(`Invocation id collision between ${seen.get(invocationId)} and ${label}: ${invocationId}`)
    seen.set(invocationId, label)
  }
}

export function validateGlobalReceiptIds(receiptGroups) {
  const seen = new Set()
  let count = 0
  for (const group of receiptGroups) {
    for (const receipt of group) {
      assertUuid(receipt.receipt_id, "receipt_id")
      if (seen.has(receipt.receipt_id)) throw new Error(`Duplicate receipt_id detected: ${receipt.receipt_id}`)
      seen.add(receipt.receipt_id)
      count += 1
    }
  }
  return count
}

export function hashExecutionInputBundle(route, loadBundle) {
  return hashCanonicalValue({ route, load_bundle: loadBundle }, "input_bundle")
}

export function validateReviewerRoutePolicy(routeValidation, parentTaskId) {
  const reviewerRoute = routeValidation.bundle
  const reviewerTaskId = `${parentTaskId}:review`
  if (reviewerRoute.task_id !== reviewerTaskId || reviewerRoute.shortcut !== "review:canonical") throw new Error("Reviewer route must use exactly review:canonical and <task_id>:review")
  if (reviewerRoute.canonical_agent !== "code-reviewer" || reviewerRoute.mode !== "read_only" || reviewerRoute.writer !== false) throw new Error("Reviewer route must be read-only code-reviewer with writer false")
  if (routeValidation.agentDefinition.write_role !== false) throw new Error("Reviewer agent definition write_role must be false")
  return reviewerTaskId
}

export function validateExecutionEvidence(evidence, context = {}) {
  assertNode20()
  const value = assertExactObjectKeys(evidence, ["schema_version", "kind", "task_id", "execution", "review_execution"], "execution evidence")
  if (value.schema_version !== 1 || value.kind !== "canonical-execution-evidence") throw new Error("Execution evidence must use schema_version 1 and kind canonical-execution-evidence")
  const taskId = assertNonEmptyString(value.task_id, "execution evidence.task_id")

  const execution = assertExactObjectKeys(value.execution, ["route", "load_bundle", "agent_run", "artifacts"], "execution")
  const workerRouteValidation = validateRouteBundle(execution.route)
  const workerRoute = workerRouteValidation.bundle
  if (workerRoute.task_id !== taskId || workerRoute.shortcut === "review:canonical") throw new Error("Worker route must use the parent task and a non-review shortcut")
  const workerLoadReceipts = validateLoadBundle(execution.load_bundle, workerRoute, context)
  const agentRun = validateAgentRunSchema(execution.agent_run)
  if (agentRun.type !== "AGENT-RUN" || agentRun.adapter !== "canonical-worker") throw new Error("AGENT-RUN type or adapter is invalid")
  if (agentRun.canonical_identity !== workerRoute.canonical_agent || agentRun.task_id !== taskId) throw new Error("AGENT-RUN canonical identity or task_id is invalid")
  if (agentRun.instructions_acknowledged !== true || agentRun.stop_condition_satisfied !== true) throw new Error("AGENT-RUN must acknowledge instructions and satisfy its stop condition")
  assertNonEmptyString(agentRun.self_critique, "AGENT-RUN.self_critique")
  if (!Number.isInteger(agentRun.auto_improve_iterations) || agentRun.auto_improve_iterations < 0 || agentRun.auto_improve_iterations > 2) throw new Error("AGENT-RUN.auto_improve_iterations must be an integer from 0 to 2")
  assertSha256(agentRun.task_sha256, "AGENT-RUN.task_sha256")
  if (agentRun.task_sha256 !== hashCanonicalValue(agentRun.task, "AGENT-RUN.task")) throw new Error("AGENT-RUN.task_sha256 does not match the canonical task")
  assertSha256(agentRun.input_bundle_sha256, "AGENT-RUN.input_bundle_sha256")
  if (agentRun.input_bundle_sha256 !== hashExecutionInputBundle(workerRoute, execution.load_bundle)) throw new Error("AGENT-RUN.input_bundle_sha256 does not match route and load_bundle")
  validateExecutionReceiptRefs(agentRun, workerRouteValidation, workerLoadReceipts, "AGENT-RUN")

  // Validate SKILL-CONSUME-E receipts if present
  if (Array.isArray(agentRun.skill_consume_receipt_refs)) {
    if (agentRun.skill_receipt_refs.length > 0 && agentRun.instructions_acknowledged === true && agentRun.skill_consume_receipt_refs.length === 0) {
      throw new Error("instructions_acknowledged cannot be true with zero consume receipts")
    }
  }

  const workerArtifacts = validateArtifacts(execution.artifacts, agentRun)

  const reviewExecution = assertExactObjectKeys(value.review_execution, ["route", "load_bundle", "review"], "review_execution")
  const reviewerRouteValidation = validateRouteBundle(reviewExecution.route)
  const reviewerRoute = reviewerRouteValidation.bundle
  const reviewerTaskId = validateReviewerRoutePolicy(reviewerRouteValidation, taskId)
  const reviewerLoadReceipts = validateLoadBundle(reviewExecution.load_bundle, reviewerRoute, context)
  const allowedReviewKeys = [...REVIEW_BASE_KEYS]
  if (reviewExecution.review?.provenance !== undefined) allowedReviewKeys.push("provenance")
  if (reviewExecution.review?.skill_consume_receipt_refs !== undefined) allowedReviewKeys.push("skill_consume_receipt_refs")
  if (reviewExecution.review?.host_correlation !== undefined) allowedReviewKeys.push("host_correlation")
  const review = assertExactObjectKeys(reviewExecution.review, allowedReviewKeys, "REVIEW-E")
  assertReceiptEnvelope(review, "REVIEW-E", "COMPLETED")
  if (review.type !== "REVIEW-E" || review.adapter !== "canonical-reviewer") throw new Error("REVIEW-E type or adapter is invalid")
  if (review.canonical_identity !== reviewerRoute.canonical_agent || review.task_id !== reviewerTaskId) throw new Error("REVIEW-E canonical identity or task_id is invalid")
  if (review.instructions_acknowledged !== true) throw new Error("REVIEW-E.instructions_acknowledged must be true")
  validateExecutionReceiptRefs(review, reviewerRouteValidation, reviewerLoadReceipts, "REVIEW-E")
  if (review.review_target !== agentRun.receipt_id) throw new Error("REVIEW-E.review_target must equal the worker AGENT-RUN receipt_id")
  validateReviewedArtifacts(review.reviewed_artifacts, workerArtifacts)
  const blockingFindings = validateReviewDecision(review.findings, review.verdict, review.pass_justification)

  assertDistinctInvocations([
    ["worker route", workerRoute.invocation_id],
    ["worker load", execution.load_bundle.invocation_id],
    ["AGENT-RUN", agentRun.invocation_id],
    ["reviewer route", reviewerRoute.invocation_id],
    ["reviewer load", reviewExecution.load_bundle.invocation_id],
    ["REVIEW-E", review.invocation_id]
  ])
  const validatedReceiptCount = validateGlobalReceiptIds([
    workerRoute.receipts,
    workerLoadReceipts,
    [agentRun],
    reviewerRoute.receipts,
    reviewerLoadReceipts,
    [review]
  ])
  const evidencePath = assertNonEmptyString(context.evidencePath, "validation context.evidencePath")
  const canonicalEvidencePath = canonicalRepoPath(evidencePath)
  if (canonicalEvidencePath !== evidencePath) throw new Error("Validation evidence path must be canonical")
  const evidenceSha256 = hashFile(evidencePath)

  let trustLevel = TRUST_LEVELS.STRUCTURAL_INTEGRITY_ONLY
  let platformAttestationVerified = false

  if (agentRun.provenance || review.provenance) {
    if (!agentRun.provenance || !review.provenance) {
      throw new Error("Partial host provenance is invalid: both worker and reviewer must supply host provenance")
    }
    const workerProv = agentRun.provenance
    const reviewerProv = review.provenance
    if (workerProv.authority !== "antigravity-host" || reviewerProv.authority !== "antigravity-host") {
      throw new Error("Invalid provenance authority: expected antigravity-host")
    }
    if (workerProv.execution_kind !== "worker" || reviewerProv.execution_kind !== "reviewer") {
      throw new Error("Provenance execution_kind mismatch")
    }
    assertUuid(workerProv.host_session_id, "worker provenance host_session_id")
    assertUuid(reviewerProv.host_session_id, "reviewer provenance host_session_id")
    assertUuid(workerProv.invocation_id, "worker provenance invocation_id")
    assertUuid(reviewerProv.invocation_id, "reviewer provenance invocation_id")

    if (workerProv.host_session_id === reviewerProv.host_session_id) {
      throw new Error("Worker and reviewer must not reuse the same host session id")
    }
    if (workerProv.invocation_id === reviewerProv.invocation_id) {
      throw new Error("Worker and reviewer must not reuse the same host invocation id")
    }
    if (workerProv.invocation_id !== agentRun.invocation_id) {
      throw new Error("Worker invocation id does not match host provenance invocation id")
    }
    if (reviewerProv.invocation_id !== review.invocation_id) {
      throw new Error("Reviewer invocation id does not match host provenance invocation id")
    }

    // Trust level derivation hierarchy:
    // 1. If external transcript correlation is proven: host_provenance_correlated
    // 2. If asymmetric cryptographic signature is verified: host_provenance_verified
    // 3. Otherwise: host_provenance_claimed
    // platform_attestation_verified is true ONLY when host_provenance_verified.
    if (agentRun.host_correlation && review.host_correlation &&
        agentRun.host_correlation.correlation_status === "CORRELATED" &&
        review.host_correlation.correlation_status === "CORRELATED") {
      trustLevel = TRUST_LEVELS.HOST_PROVENANCE_CORRELATED
      platformAttestationVerified = false
    } else if (workerProv.cryptographic_signature && reviewerProv.cryptographic_signature) {
      trustLevel = TRUST_LEVELS.HOST_PROVENANCE_VERIFIED
      platformAttestationVerified = true
    } else {
      trustLevel = TRUST_LEVELS.HOST_PROVENANCE_CLAIMED
      platformAttestationVerified = false
    }
  }

  const status = review.verdict === "PASS" ? "VALIDATED" : "REMEDIATION_REQUIRED"

  return {
    schema_version: 1,
    kind: "canonical-execution-validation-evidence",
    ...createReceipt("VALIDATION-E", status, randomUUID()),
    task_id: taskId,
    evidence_path: evidencePath,
    evidence_sha256: evidenceSha256,
    validator_path: VALIDATOR_PATH,
    validator_sha256: hashFile(VALIDATOR_PATH),
    worker_identity: workerRoute.canonical_agent,
    reviewer_identity: reviewerRoute.canonical_agent,
    agent_run_receipt_id: agentRun.receipt_id,
    review_receipt_id: review.receipt_id,
    verdict: review.verdict,
    blocking_findings: blockingFindings.length,
    validated_receipt_count: validatedReceiptCount,
    trust_level: trustLevel,
    platform_attestation_verified: platformAttestationVerified
  }
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArguments(argv, {
    "--evidence": { required: true },
    "--evidence-dir": { required: true },
    "--output": { required: false }
  })
  const evidencePath = assertEvidenceInputPath(args["--evidence"], args["--evidence-dir"], [PHASE_FILENAMES.evidence])
  const evidence = readJson(evidencePath, evidencePath)
  const result = validateExecutionEvidence(evidence, { evidenceDir: args["--evidence-dir"], evidencePath })
  if (args["--output"]) {
    const outputPath = resolveEvidenceOutputPath(args["--output"], args["--evidence-dir"], [PHASE_FILENAMES.validation])
    writeJsonExclusive(outputPath, result)
  }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
  if (result.status === "REMEDIATION_REQUIRED") process.exitCode = 1
  return result
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  try {
    main()
  } catch (error) {
    failCli(error)
  }
}
