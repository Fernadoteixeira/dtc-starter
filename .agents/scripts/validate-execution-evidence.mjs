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
  writeJsonExclusive
} from "./canonical-execution-lib.mjs"

const AGENT_RUN_KEYS = [
  "type", "receipt_id", "invocation_id", "timestamp", "status", "task_id",
  "adapter", "canonical_identity", "route_receipt_ref", "agent_load_receipt_ref",
  "protocol_receipt_ref", "dispatcher_receipt_ref", "adapter_receipt_ref",
  "skill_receipt_refs", "orchestration_receipt_refs", "contract_receipt_refs",
  "instructions_acknowledged", "task", "task_sha256", "input_bundle_sha256",
  "artifact_refs", "self_critique", "auto_improve_iterations", "validation",
  "stop_condition_satisfied"
]
const REVIEW_KEYS = [
  "type", "receipt_id", "invocation_id", "timestamp", "status", "task_id",
  "adapter", "canonical_identity", "review_target", "route_receipt_ref",
  "agent_load_receipt_ref", "protocol_receipt_ref", "dispatcher_receipt_ref",
  "adapter_receipt_ref", "skill_receipt_refs", "orchestration_receipt_refs",
  "contract_receipt_refs", "instructions_acknowledged", "reviewed_artifacts",
  "findings", "verdict", "pass_justification"
]

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
  assertSha256(entry.sha256, `${receipt.type} ${id} manifest entry hash`)
  const expectedPath = pathValidator(`${root}/${entry.path}`)
  if (receipt.path !== expectedPath || receipt.sha256 !== entry.sha256) {
    throw new Error(`${receipt.type} ${id} does not match its manifest entry`)
  }
}

function keyForLoadReceipt(receipt) {
  if (receipt.type === "PROTOCOL-LOAD-E") return receipt.type
  if (receipt.type === "DISPATCHER-LOAD-E") return receipt.type
  if (receipt.type === "ADAPTER-LOAD-E") return receipt.type
  if (receipt.type === "SKILL-LOAD-E") return `${receipt.type}:${receipt.source}:${receipt.skill_id}`
  if (receipt.type === "ORCHESTRATION-LOAD-E") return `${receipt.type}:${receipt.orchestration_id}`
  if (receipt.type === "CONTRACT-LOAD-E") return `${receipt.type}:${receipt.contract_id}`
  throw new Error(`Unsupported load receipt type: ${receipt.type}`)
}

function validateInfrastructureReceipt(receipt, routeBundle) {
  const reviewer = routeBundle.shortcut === "review:canonical"
  if (receipt.type === "PROTOCOL-LOAD-E") {
    if (receipt.protocol_id !== "canonical-execution-protocol" || receipt.path !== PROTOCOL_PATH) throw new Error("Invalid PROTOCOL-LOAD-E identity")
  } else if (receipt.type === "DISPATCHER-LOAD-E") {
    if (receipt.dispatcher_id !== "fio-vivo-rug" || receipt.path !== DISPATCHER_PATH) throw new Error("Invalid DISPATCHER-LOAD-E identity")
  } else if (receipt.type === "ADAPTER-LOAD-E") {
    const expectedId = reviewer ? "canonical-reviewer" : "canonical-worker"
    const expectedPath = reviewer ? REVIEWER_ADAPTER_PATH : WORKER_ADAPTER_PATH
    if (receipt.adapter_id !== expectedId || receipt.path !== expectedPath) throw new Error("Invalid ADAPTER-LOAD-E identity")
  } else {
    return false
  }
  return true
}

export function validateLoadBundle(loadBundle, routeBundle, options = {}) {
  const bundle = assertObject(loadBundle, "load bundle")
  if (bundle.schema_version !== 1 || bundle.kind !== LOAD_KIND || bundle.status !== "LOADED") {
    throw new Error("Load bundle must be schema version 1, canonical-execution-load-bundle, and LOADED")
  }
  assertUuid(bundle.invocation_id, "load_bundle.invocation_id")
  if (bundle.instructions_acknowledged !== false) throw new Error("Load bundle instructions_acknowledged must remain false")
  if (bundle.task_id !== routeBundle.task_id) throw new Error("Load bundle task_id does not match the route")
  const expectedRouteName = routeBundle.shortcut === "review:canonical" ? PHASE_FILENAMES.reviewerRoute : PHASE_FILENAMES.workerRoute
  const routePath = options.evidenceDir
    ? assertEvidenceInputPath(bundle.route_path, options.evidenceDir, [expectedRouteName])
    : canonicalRepoPath(bundle.route_path)
  if (routePath !== bundle.route_path) throw new Error("load_bundle.route_path is not canonical")
  assertSha256(bundle.route_sha256, "load_bundle.route_sha256")
  if (hashFile(routePath) !== bundle.route_sha256) throw new Error("Persisted route hash mismatch")
  const persistedRoute = readJson(routePath, routePath)
  validateRouteBundle(persistedRoute)
  if (JSON.stringify(persistedRoute) !== JSON.stringify(routeBundle) || JSON.stringify(bundle.route) !== JSON.stringify(routeBundle)) {
    throw new Error("Embedded, persisted, and evidence route bundles differ")
  }
  if (!Array.isArray(bundle.receipts)) throw new Error("load_bundle.receipts must be an array")

  const { resolved } = validateRouteBundle(routeBundle)
  const orchestrationManifest = indexManifest(ORCHESTRATION_MANIFEST_PATH, "id", "orchestration manifest")
  const orchestrationManifestHash = hashFile(ORCHESTRATION_MANIFEST_PATH)
  const nosManifest = indexManifest(NOS_MANIFEST_PATH, "capability_id", "NOS skill manifest")
  const nosManifestHash = hashFile(NOS_MANIFEST_PATH)
  const expectedKeys = new Set(["PROTOCOL-LOAD-E", "DISPATCHER-LOAD-E", "ADAPTER-LOAD-E"])
  for (const skillId of resolved.core_skills) expectedKeys.add(`SKILL-LOAD-E:core:${skillId}`)
  for (const externalPath of resolved.external_skills) expectedKeys.add(`SKILL-LOAD-E:external:${externalPath}`)
  for (const orchestrationId of resolved.orchestrations) expectedKeys.add(`ORCHESTRATION-LOAD-E:${orchestrationId}`)
  for (const contractId of resolved.contracts) expectedKeys.add(`CONTRACT-LOAD-E:${contractId}`)
  const seenKeys = new Set()
  const seenReceiptIds = new Set()

  for (let index = 0; index < bundle.receipts.length; index += 1) {
    const receipt = assertReceiptEnvelope(bundle.receipts[index], `load_bundle.receipts[${index}]`, "LOADED")
    if (receipt.invocation_id !== bundle.invocation_id || receipt.task_id !== bundle.task_id) throw new Error(`${receipt.type} has an invalid invocation_id or task_id`)
    if (receipt.instructions_acknowledged !== false) throw new Error(`${receipt.type} instructions_acknowledged must be false before execution`)
    if (seenReceiptIds.has(receipt.receipt_id)) throw new Error(`Duplicate load receipt id: ${receipt.receipt_id}`)
    seenReceiptIds.add(receipt.receipt_id)
    const key = keyForLoadReceipt(receipt)
    if (seenKeys.has(key)) throw new Error(`Duplicate load receipt: ${key}`)
    seenKeys.add(key)
    validateReceiptFileHash(receipt, key)

    if (validateInfrastructureReceipt(receipt, routeBundle)) {
      continue
    } else if (receipt.type === "SKILL-LOAD-E" && receipt.source === "core") {
      const expectedPath = assertCoreSkillPath(`${SKILL_ROOT}/${receipt.skill_id}/skill.json`, receipt.skill_id)
      if (!resolved.core_skills.includes(receipt.skill_id) || receipt.path !== expectedPath) throw new Error(`Unexpected core skill receipt: ${receipt.skill_id}`)
      const definition = assertObject(readJson(receipt.path, receipt.path), `core skill ${receipt.skill_id}`)
      if (definition.id !== receipt.skill_id) throw new Error(`Core skill definition id mismatch: ${receipt.skill_id}`)
    } else if (receipt.type === "SKILL-LOAD-E" && receipt.source === "external") {
      const expectedPath = assertExternalSkillPath(receipt.path)
      if (receipt.skill_id !== expectedPath || !resolved.external_skills.includes(expectedPath)) throw new Error(`Unexpected external skill receipt: ${receipt.path}`)
    } else if (receipt.type === "SKILL-LOAD-E" && receipt.source === "nos") {
      if (!/^SK-\d{3}$/.test(receipt.skill_id)) throw new Error(`Invalid exact NOS skill id: ${receipt.skill_id}`)
      const entry = nosManifest.get(receipt.skill_id)
      if (!entry) throw new Error(`NOS skill is absent from its manifest: ${receipt.skill_id}`)
      if (receipt.domain !== entry.domain || !resolved.nos_domains.includes(entry.domain)) throw new Error(`NOS skill uses a forbidden or mismatched domain: ${receipt.skill_id}`)
      assertNosSkillPath(receipt.path)
      assertManifestBackedReceipt(receipt, NOS_MANIFEST_PATH, nosManifestHash, NOS_ROOT, entry, receipt.skill_id, assertNosSkillPath)
      expectedKeys.add(key)
    } else if (receipt.type === "ORCHESTRATION-LOAD-E") {
      const entry = orchestrationManifest.get(receipt.orchestration_id)
      if (!entry || !resolved.orchestrations.includes(receipt.orchestration_id)) throw new Error(`Unexpected orchestration receipt: ${receipt.orchestration_id}`)
      assertOrchestrationPath(receipt.path)
      assertManifestBackedReceipt(receipt, ORCHESTRATION_MANIFEST_PATH, orchestrationManifestHash, ORCHESTRATION_ROOT, entry, receipt.orchestration_id, assertOrchestrationPath)
    } else if (receipt.type === "CONTRACT-LOAD-E") {
      const expectedPath = resolved.contract_paths[receipt.contract_id]
      if (!expectedPath || receipt.path !== expectedPath) throw new Error(`Unexpected contract receipt: ${receipt.contract_id}`)
    } else {
      throw new Error(`Invalid load receipt category: ${key}`)
    }
  }
  if (seenKeys.size !== expectedKeys.size || [...expectedKeys].some((key) => !seenKeys.has(key))) {
    throw new Error("Load receipts do not exactly cover infrastructure, route loads, and requested NOS skills")
  }
  return bundle.receipts
}

function receiptIdsByType(receipts, type) {
  return receipts.filter((receipt) => receipt.type === type).map((receipt) => receipt.receipt_id)
}

function exactlyOneReceiptId(receipts, type, label) {
  const ids = receiptIdsByType(receipts, type)
  if (ids.length !== 1) throw new Error(`${label} requires exactly one ${type} receipt`)
  return ids[0]
}

function validateExecutionReceiptRefs(receipt, routeValidation, loadReceipts, label) {
  if (receipt.route_receipt_ref !== routeValidation.routeReceipt.receipt_id) throw new Error(`${label}.route_receipt_ref does not match ROUTE-E`)
  if (receipt.agent_load_receipt_ref !== routeValidation.agentReceipt.receipt_id) throw new Error(`${label}.agent_load_receipt_ref does not match AGENT-LOAD-E`)
  if (receipt.protocol_receipt_ref !== exactlyOneReceiptId(loadReceipts, "PROTOCOL-LOAD-E", label)) throw new Error(`${label}.protocol_receipt_ref does not match PROTOCOL-LOAD-E`)
  if (receipt.dispatcher_receipt_ref !== exactlyOneReceiptId(loadReceipts, "DISPATCHER-LOAD-E", label)) throw new Error(`${label}.dispatcher_receipt_ref does not match DISPATCHER-LOAD-E`)
  if (receipt.adapter_receipt_ref !== exactlyOneReceiptId(loadReceipts, "ADAPTER-LOAD-E", label)) throw new Error(`${label}.adapter_receipt_ref does not match ADAPTER-LOAD-E`)
  assertExactSet(receipt.skill_receipt_refs, receiptIdsByType(loadReceipts, "SKILL-LOAD-E"), `${label}.skill_receipt_refs`)
  assertExactSet(receipt.orchestration_receipt_refs, receiptIdsByType(loadReceipts, "ORCHESTRATION-LOAD-E"), `${label}.orchestration_receipt_refs`)
  assertExactSet(receipt.contract_receipt_refs, receiptIdsByType(loadReceipts, "CONTRACT-LOAD-E"), `${label}.contract_receipt_refs`)
}

export function hashExecutionInputBundle(route, loadBundle) {
  return hashCanonicalValue({ route, load_bundle: loadBundle }, "execution input bundle")
}

function validateValidationRecords(records) {
  if (!Array.isArray(records) || records.length === 0) throw new Error("AGENT-RUN.validation must be a non-empty array")
  for (let index = 0; index < records.length; index += 1) {
    const record = assertExactObjectKeys(records[index], ["command", "status", "output"], `AGENT-RUN.validation[${index}]`)
    assertNonEmptyString(record.command, `AGENT-RUN.validation[${index}].command`)
    assertNonEmptyString(record.output, `AGENT-RUN.validation[${index}].output`)
    if (!["PASS", "FAIL", "BLOCKED"].includes(record.status)) throw new Error(`AGENT-RUN.validation[${index}].status is invalid`)
  }
}

function validateArtifacts(artifacts, agentRun) {
  if (!Array.isArray(artifacts) || artifacts.length === 0) throw new Error("execution.artifacts must contain at least one artifact")
  const paths = []
  for (let index = 0; index < artifacts.length; index += 1) {
    const artifact = assertExactObjectKeys(artifacts[index], ["path", "sha256"], `execution.artifacts[${index}]`)
    validateReceiptFileHash(artifact, `execution.artifacts[${index}]`)
    if (paths.includes(artifact.path)) throw new Error(`Duplicate artifact path: ${artifact.path}`)
    paths.push(artifact.path)
  }
  assertExactSet(agentRun.artifact_refs, paths, "AGENT-RUN.artifact_refs")
  return artifacts
}

function validateReviewedArtifacts(reviewedArtifacts, workerArtifacts) {
  if (!Array.isArray(reviewedArtifacts)) throw new Error("REVIEW-E.reviewed_artifacts must be an array")
  const workerPairs = workerArtifacts.map((artifact) => `${artifact.path}:${artifact.sha256}`)
  const reviewedPairs = reviewedArtifacts.map((artifact, index) => {
    assertExactObjectKeys(artifact, ["path", "sha256"], `REVIEW-E.reviewed_artifacts[${index}]`)
    validateReceiptFileHash(artifact, `REVIEW-E.reviewed_artifacts[${index}]`)
    return `${artifact.path}:${artifact.sha256}`
  })
  assertExactSet(reviewedPairs, workerPairs, "REVIEW-E.reviewed_artifacts")
}

function validateFindings(findings) {
  if (!Array.isArray(findings)) throw new Error("REVIEW-E.findings must be an array")
  for (let index = 0; index < findings.length; index += 1) {
    const finding = assertExactObjectKeys(findings[index], ["severity", "path", "summary", "blocking"], `REVIEW-E.findings[${index}]`)
    if (!["critical", "high", "medium", "low", "info"].includes(finding.severity)) throw new Error(`REVIEW-E.findings[${index}].severity is invalid`)
    const findingPath = canonicalRepoPath(finding.path)
    if (finding.path !== findingPath) throw new Error(`REVIEW-E.findings[${index}].path is not canonical`)
    assertNonEmptyString(finding.summary, `REVIEW-E.findings[${index}].summary`)
    if (typeof finding.blocking !== "boolean") throw new Error(`REVIEW-E.findings[${index}].blocking must be boolean`)
  }
  return findings
}

function assertDistinctInvocations(entries) {
  const seen = new Map()
  for (const [label, invocationId] of entries) {
    assertUuid(invocationId, `${label}.invocation_id`)
    if (seen.has(invocationId)) throw new Error(`${label}.invocation_id must differ from ${seen.get(invocationId)}.invocation_id`)
    seen.set(invocationId, label)
  }
}

function validateGlobalReceiptIds(receiptGroups) {
  const seen = new Set()
  let count = 0
  for (const receipts of receiptGroups) {
    for (const receipt of receipts) {
      assertUuid(receipt.receipt_id, `${receipt.type}.receipt_id`)
      if (seen.has(receipt.receipt_id)) throw new Error(`Receipt ids must be globally unique: ${receipt.receipt_id}`)
      seen.add(receipt.receipt_id)
      count += 1
    }
  }
  return count
}

export function validateAgentRunSchema(receipt) {
  const agentRun = assertExactObjectKeys(receipt, AGENT_RUN_KEYS, "AGENT-RUN")
  assertReceiptEnvelope(agentRun, "AGENT-RUN", "COMPLETED")
  return agentRun
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
  validateValidationRecords(agentRun.validation)
  assertSha256(agentRun.task_sha256, "AGENT-RUN.task_sha256")
  if (agentRun.task_sha256 !== hashCanonicalValue(agentRun.task, "AGENT-RUN.task")) throw new Error("AGENT-RUN.task_sha256 does not match the canonical task")
  assertSha256(agentRun.input_bundle_sha256, "AGENT-RUN.input_bundle_sha256")
  if (agentRun.input_bundle_sha256 !== hashExecutionInputBundle(workerRoute, execution.load_bundle)) throw new Error("AGENT-RUN.input_bundle_sha256 does not match route and load_bundle")
  validateExecutionReceiptRefs(agentRun, workerRouteValidation, workerLoadReceipts, "AGENT-RUN")
  const workerArtifacts = validateArtifacts(execution.artifacts, agentRun)

  const reviewExecution = assertExactObjectKeys(value.review_execution, ["route", "load_bundle", "review"], "review_execution")
  const reviewerRouteValidation = validateRouteBundle(reviewExecution.route)
  const reviewerRoute = reviewerRouteValidation.bundle
  const reviewerTaskId = validateReviewerRoutePolicy(reviewerRouteValidation, taskId)
  const reviewerLoadReceipts = validateLoadBundle(reviewExecution.load_bundle, reviewerRoute, context)
  const review = assertExactObjectKeys(reviewExecution.review, REVIEW_KEYS, "REVIEW-E")
  assertReceiptEnvelope(review, "REVIEW-E", "COMPLETED")
  if (review.type !== "REVIEW-E" || review.adapter !== "canonical-reviewer") throw new Error("REVIEW-E type or adapter is invalid")
  if (review.canonical_identity !== reviewerRoute.canonical_agent || review.task_id !== reviewerTaskId) throw new Error("REVIEW-E canonical identity or task_id is invalid")
  if (review.instructions_acknowledged !== true) throw new Error("REVIEW-E.instructions_acknowledged must be true")
  validateExecutionReceiptRefs(review, reviewerRouteValidation, reviewerLoadReceipts, "REVIEW-E")
  if (review.review_target !== agentRun.receipt_id) throw new Error("REVIEW-E.review_target must equal the worker AGENT-RUN receipt_id")
  validateReviewedArtifacts(review.reviewed_artifacts, workerArtifacts)
  const findings = validateFindings(review.findings)
  if (review.verdict !== "PASS" && review.verdict !== "NEEDS_REMEDIATION") throw new Error("REVIEW-E.verdict must be PASS or NEEDS_REMEDIATION")
  if (typeof review.pass_justification !== "string") throw new Error("REVIEW-E.pass_justification must be a string")
  const blockingFindings = findings.filter((finding) => finding.blocking)
  if (review.verdict === "PASS") {
    assertNonEmptyString(review.pass_justification, "REVIEW-E.pass_justification")
    if (blockingFindings.length > 0) throw new Error("REVIEW-E cannot PASS with blocking findings")
  }

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
    trust_level: "structural_integrity_only",
    platform_attestation_verified: false
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
