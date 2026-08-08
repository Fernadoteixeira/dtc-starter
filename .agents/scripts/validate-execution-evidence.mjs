import { pathToFileURL } from "node:url"
import {
  LOAD_KIND,
  NOS_MANIFEST_PATH,
  NOS_ROOT,
  ORCHESTRATION_MANIFEST_PATH,
  ORCHESTRATION_ROOT,
  SKILL_ROOT,
  assertIsoTimestamp,
  assertNode20,
  assertNonEmptyString,
  assertObject,
  assertSha256,
  assertStringArray,
  assertUuid,
  canonicalRepoPath,
  failCli,
  hashFile,
  parseArguments,
  readJson,
  validateReceiptFileHash,
  validateRouteBundle
} from "./canonical-execution-lib.mjs"

function assertExactSet(actual, expected, label) {
  assertStringArray(actual, label)
  if (new Set(actual).size !== actual.length) {
    throw new Error(`${label} contains duplicate values`)
  }
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
  if (value.status !== expectedStatus) {
    throw new Error(`${label}.status must be ${expectedStatus}`)
  }
  return value
}

function indexManifest(path, idField, label) {
  const manifest = readJson(path, label)
  if (!Array.isArray(manifest)) {
    throw new Error(`${label} must be an array`)
  }
  const index = new Map()
  for (let position = 0; position < manifest.length; position += 1) {
    const entry = assertObject(manifest[position], `${label}[${position}]`)
    const id = assertNonEmptyString(entry[idField], `${label}[${position}].${idField}`)
    if (index.has(id)) {
      throw new Error(`${label} contains duplicate id ${id}`)
    }
    index.set(id, entry)
  }
  return index
}

function assertManifestBackedReceipt(receipt, manifestPath, manifestHash, root, entry, id) {
  if (receipt.manifest_path !== manifestPath || receipt.manifest_sha256 !== manifestHash) {
    throw new Error(`${receipt.type} ${id} has stale manifest evidence`)
  }
  assertSha256(receipt.manifest_sha256, `${receipt.type} ${id}.manifest_sha256`)
  if (hashFile(receipt.manifest_path) !== receipt.manifest_sha256) {
    throw new Error(`${receipt.type} ${id} manifest hash mismatch`)
  }
  assertSha256(entry.sha256, `${receipt.type} ${id} manifest entry hash`)
  const expectedPath = canonicalRepoPath(`${root}/${entry.path}`)
  if (receipt.path !== expectedPath || receipt.sha256 !== entry.sha256) {
    throw new Error(`${receipt.type} ${id} does not match its manifest entry`)
  }
}

function keyForLoadReceipt(receipt) {
  if (receipt.type === "SKILL-LOAD-E") {
    return `${receipt.type}:${receipt.source}:${receipt.skill_id}`
  }
  if (receipt.type === "ORCHESTRATION-LOAD-E") {
    return `${receipt.type}:${receipt.orchestration_id}`
  }
  if (receipt.type === "CONTRACT-LOAD-E") {
    return `${receipt.type}:${receipt.contract_id}`
  }
  throw new Error(`Unsupported load receipt type: ${receipt.type}`)
}

export function validateLoadBundle(loadBundle, routeBundle) {
  const bundle = assertObject(loadBundle, "load bundle")
  if (bundle.schema_version !== 1 || bundle.kind !== LOAD_KIND || bundle.status !== "LOADED") {
    throw new Error("Load bundle must be schema version 1, canonical-execution-load-bundle, and LOADED")
  }
  assertUuid(bundle.invocation_id, "load_bundle.invocation_id")
  if (bundle.instructions_acknowledged !== false) {
    throw new Error("Load bundle instructions_acknowledged must remain false")
  }
  if (bundle.task_id !== routeBundle.task_id) {
    throw new Error("Load bundle task_id does not match the route")
  }
  const routePath = canonicalRepoPath(bundle.route_path)
  if (routePath !== bundle.route_path) {
    throw new Error("load_bundle.route_path is not canonical")
  }
  assertSha256(bundle.route_sha256, "load_bundle.route_sha256")
  if (hashFile(routePath) !== bundle.route_sha256) {
    throw new Error("Persisted route hash mismatch")
  }
  const persistedRoute = readJson(routePath, routePath)
  validateRouteBundle(persistedRoute)
  if (JSON.stringify(persistedRoute) !== JSON.stringify(routeBundle) || JSON.stringify(bundle.route) !== JSON.stringify(routeBundle)) {
    throw new Error("Embedded, persisted, and evidence route bundles differ")
  }

  if (!Array.isArray(bundle.receipts)) {
    throw new Error("load_bundle.receipts must be an array")
  }
  const { resolved } = validateRouteBundle(routeBundle)
  const orchestrationManifest = indexManifest(ORCHESTRATION_MANIFEST_PATH, "id", "orchestration manifest")
  const orchestrationManifestHash = hashFile(ORCHESTRATION_MANIFEST_PATH)
  const nosManifest = indexManifest(NOS_MANIFEST_PATH, "capability_id", "NOS skill manifest")
  const nosManifestHash = hashFile(NOS_MANIFEST_PATH)
  const seenKeys = new Set()
  const seenReceiptIds = new Set()
  const expectedKeys = new Set()

  for (const skillId of resolved.core_skills) {
    expectedKeys.add(`SKILL-LOAD-E:core:${skillId}`)
  }
  for (const externalPath of resolved.external_skills) {
    expectedKeys.add(`SKILL-LOAD-E:external:${externalPath}`)
  }
  for (const orchestrationId of resolved.orchestrations) {
    expectedKeys.add(`ORCHESTRATION-LOAD-E:${orchestrationId}`)
  }
  for (const contractId of resolved.contracts) {
    expectedKeys.add(`CONTRACT-LOAD-E:${contractId}`)
  }

  for (let index = 0; index < bundle.receipts.length; index += 1) {
    const receipt = assertReceiptEnvelope(bundle.receipts[index], `load_bundle.receipts[${index}]`, "LOADED")
    if (receipt.invocation_id !== bundle.invocation_id || receipt.task_id !== bundle.task_id) {
      throw new Error(`${receipt.type} has an invalid invocation_id or task_id`)
    }
    if (receipt.instructions_acknowledged !== false) {
      throw new Error(`${receipt.type} instructions_acknowledged must be false before worker execution`)
    }
    if (seenReceiptIds.has(receipt.receipt_id)) {
      throw new Error(`Duplicate load receipt id: ${receipt.receipt_id}`)
    }
    seenReceiptIds.add(receipt.receipt_id)
    const key = keyForLoadReceipt(receipt)
    if (seenKeys.has(key)) {
      throw new Error(`Duplicate load receipt: ${key}`)
    }
    seenKeys.add(key)
    validateReceiptFileHash(receipt, key)

    if (receipt.type === "SKILL-LOAD-E" && receipt.source === "core") {
      const expectedPath = `${SKILL_ROOT}/${receipt.skill_id}/skill.json`
      if (!resolved.core_skills.includes(receipt.skill_id) || receipt.path !== expectedPath) {
        throw new Error(`Unexpected core skill receipt: ${receipt.skill_id}`)
      }
      const definition = assertObject(readJson(receipt.path, receipt.path), `core skill ${receipt.skill_id}`)
      if (definition.id !== receipt.skill_id) {
        throw new Error(`Core skill definition id mismatch: ${receipt.skill_id}`)
      }
    } else if (receipt.type === "SKILL-LOAD-E" && receipt.source === "external") {
      if (receipt.skill_id !== receipt.path || !resolved.external_skills.includes(receipt.path)) {
        throw new Error(`Unexpected external skill receipt: ${receipt.path}`)
      }
    } else if (receipt.type === "SKILL-LOAD-E" && receipt.source === "nos") {
      if (!/^SK-\d{3}$/.test(receipt.skill_id)) {
        throw new Error(`Invalid exact NOS skill id: ${receipt.skill_id}`)
      }
      const entry = nosManifest.get(receipt.skill_id)
      if (!entry) {
        throw new Error(`NOS skill is absent from its manifest: ${receipt.skill_id}`)
      }
      if (receipt.domain !== entry.domain || !resolved.nos_domains.includes(entry.domain)) {
        throw new Error(`NOS skill uses a forbidden or mismatched domain: ${receipt.skill_id}`)
      }
      assertManifestBackedReceipt(receipt, NOS_MANIFEST_PATH, nosManifestHash, NOS_ROOT, entry, receipt.skill_id)
      expectedKeys.add(key)
    } else if (receipt.type === "ORCHESTRATION-LOAD-E") {
      const entry = orchestrationManifest.get(receipt.orchestration_id)
      if (!entry || !resolved.orchestrations.includes(receipt.orchestration_id)) {
        throw new Error(`Unexpected orchestration receipt: ${receipt.orchestration_id}`)
      }
      assertManifestBackedReceipt(receipt, ORCHESTRATION_MANIFEST_PATH, orchestrationManifestHash, ORCHESTRATION_ROOT, entry, receipt.orchestration_id)
    } else if (receipt.type === "CONTRACT-LOAD-E") {
      const expectedPath = resolved.contract_paths[receipt.contract_id]
      if (!expectedPath || receipt.path !== expectedPath) {
        throw new Error(`Unexpected contract receipt: ${receipt.contract_id}`)
      }
    } else {
      throw new Error(`Invalid load receipt category: ${key}`)
    }
  }

  if (seenKeys.size !== expectedKeys.size || [...expectedKeys].some((key) => !seenKeys.has(key))) {
    throw new Error("Load receipts do not exactly cover the route and requested NOS skills")
  }
  return bundle.receipts
}

function assertExactObjectKeys(value, expectedKeys, label) {
  const actualKeys = Object.keys(value).sort()
  const sortedExpected = [...expectedKeys].sort()
  if (JSON.stringify(actualKeys) !== JSON.stringify(sortedExpected)) {
    throw new Error(`${label} must contain exactly: ${sortedExpected.join(", ")}`)
  }
}

function receiptIdsByType(receipts, type) {
  return receipts
    .filter((receipt) => receipt.type === type)
    .map((receipt) => receipt.receipt_id)
}

function validateExecutionReceiptRefs(receipt, routeValidation, loadReceipts, label) {
  if (receipt.route_receipt_ref !== routeValidation.routeReceipt.receipt_id) {
    throw new Error(`${label}.route_receipt_ref does not match its ROUTE-E receipt`)
  }
  if (receipt.agent_load_receipt_ref !== routeValidation.agentReceipt.receipt_id) {
    throw new Error(`${label}.agent_load_receipt_ref does not match its AGENT-LOAD-E receipt`)
  }
  assertExactSet(receipt.skill_receipt_refs, receiptIdsByType(loadReceipts, "SKILL-LOAD-E"), `${label}.skill_receipt_refs`)
  assertExactSet(receipt.orchestration_receipt_refs, receiptIdsByType(loadReceipts, "ORCHESTRATION-LOAD-E"), `${label}.orchestration_receipt_refs`)
  assertExactSet(receipt.contract_receipt_refs, receiptIdsByType(loadReceipts, "CONTRACT-LOAD-E"), `${label}.contract_receipt_refs`)
}

function validateTaskPayload(task) {
  if (typeof task === "string") {
    assertNonEmptyString(task, "AGENT-RUN.task")
    return
  }
  const value = assertObject(task, "AGENT-RUN.task")
  if (Object.keys(value).length === 0) {
    throw new Error("AGENT-RUN.task must not be empty")
  }
}

function validateArtifacts(artifacts, agentRun) {
  if (!Array.isArray(artifacts) || artifacts.length === 0) {
    throw new Error("execution.artifacts must contain at least one artifact")
  }
  const paths = []
  for (let index = 0; index < artifacts.length; index += 1) {
    const artifact = validateReceiptFileHash(artifacts[index], `execution.artifacts[${index}]`)
    if (paths.includes(artifact.path)) {
      throw new Error(`Duplicate artifact path: ${artifact.path}`)
    }
    paths.push(artifact.path)
  }
  assertExactSet(agentRun.artifact_refs, paths, "AGENT-RUN.artifact_refs")
  return artifacts
}

function assertDistinctInvocations(entries) {
  const seen = new Map()
  for (const [label, invocationId] of entries) {
    assertUuid(invocationId, `${label}.invocation_id`)
    if (seen.has(invocationId)) {
      throw new Error(`${label}.invocation_id must differ from ${seen.get(invocationId)}.invocation_id`)
    }
    seen.set(invocationId, label)
  }
}

function validateGlobalReceiptIds(receiptGroups) {
  const seen = new Set()
  let count = 0
  for (const receipts of receiptGroups) {
    for (const receipt of receipts) {
      assertUuid(receipt.receipt_id, `${receipt.type}.receipt_id`)
      if (seen.has(receipt.receipt_id)) {
        throw new Error(`Receipt ids must be globally unique: ${receipt.receipt_id}`)
      }
      seen.add(receipt.receipt_id)
      count += 1
    }
  }
  return count
}

export function validateExecutionEvidence(evidence) {
  assertNode20()
  const value = assertObject(evidence, "execution evidence")
  assertExactObjectKeys(value, ["schema_version", "kind", "task_id", "execution", "review_execution"], "execution evidence")
  if (value.schema_version !== 1 || value.kind !== "canonical-execution-evidence") {
    throw new Error("Execution evidence must use schema_version 1 and kind canonical-execution-evidence")
  }
  const taskId = assertNonEmptyString(value.task_id, "execution evidence.task_id")

  const execution = assertObject(value.execution, "execution")
  assertExactObjectKeys(execution, ["route", "load_bundle", "agent_run", "artifacts"], "execution")
  const workerRoute = assertObject(execution.route, "execution.route")
  const workerRouteValidation = validateRouteBundle(workerRoute)
  if (workerRoute.task_id !== taskId) {
    throw new Error("Worker route task_id must equal the parent task_id")
  }
  const workerLoadBundle = assertObject(execution.load_bundle, "execution.load_bundle")
  const workerLoadReceipts = validateLoadBundle(workerLoadBundle, workerRoute)
  const agentRun = assertReceiptEnvelope(execution.agent_run, "AGENT-RUN", "COMPLETED")
  if (agentRun.type !== "AGENT-RUN") {
    throw new Error("execution.agent_run.type must be AGENT-RUN")
  }
  if (agentRun.adapter !== "canonical-worker") {
    throw new Error("AGENT-RUN.adapter must be canonical-worker")
  }
  if (agentRun.canonical_identity !== workerRoute.canonical_agent) {
    throw new Error("AGENT-RUN.canonical_identity must equal the worker route canonical_agent")
  }
  if (agentRun.task_id !== taskId) {
    throw new Error("AGENT-RUN.task_id must equal the parent task_id")
  }
  if (agentRun.instructions_acknowledged !== true) {
    throw new Error("AGENT-RUN.instructions_acknowledged must be true")
  }
  validateTaskPayload(agentRun.task)
  validateExecutionReceiptRefs(agentRun, workerRouteValidation, workerLoadReceipts, "AGENT-RUN")
  validateArtifacts(execution.artifacts, agentRun)

  const reviewExecution = assertObject(value.review_execution, "review_execution")
  assertExactObjectKeys(reviewExecution, ["route", "load_bundle", "review"], "review_execution")
  const reviewerRoute = assertObject(reviewExecution.route, "review_execution.route")
  const reviewerRouteValidation = validateRouteBundle(reviewerRoute)
  const reviewerTaskId = `${taskId}:review`
  if (reviewerRoute.task_id !== reviewerTaskId) {
    throw new Error(`Reviewer route task_id must be exactly ${reviewerTaskId}`)
  }
  if (reviewerRoute.canonical_agent !== "code-reviewer") {
    throw new Error("Reviewer route canonical_agent must be code-reviewer")
  }
  const reviewerLoadBundle = assertObject(reviewExecution.load_bundle, "review_execution.load_bundle")
  const reviewerLoadReceipts = validateLoadBundle(reviewerLoadBundle, reviewerRoute)
  const review = assertObject(reviewExecution.review, "REVIEW-E")
  assertNonEmptyString(review.type, "REVIEW-E.type")
  assertUuid(review.receipt_id, "REVIEW-E.receipt_id")
  assertUuid(review.invocation_id, "REVIEW-E.invocation_id")
  assertIsoTimestamp(review.timestamp, "REVIEW-E.timestamp")
  if (review.status !== "REVIEWED" && review.status !== "COMPLETED") {
    throw new Error("REVIEW-E.status must be REVIEWED or COMPLETED")
  }
  if (review.type !== "REVIEW-E") {
    throw new Error("review_execution.review.type must be REVIEW-E")
  }
  if (review.adapter !== "canonical-reviewer") {
    throw new Error("REVIEW-E.adapter must be canonical-reviewer")
  }
  if (review.canonical_identity !== reviewerRoute.canonical_agent) {
    throw new Error("REVIEW-E.canonical_identity must equal the reviewer route canonical_agent")
  }
  if (review.task_id !== reviewerTaskId) {
    throw new Error("REVIEW-E.task_id must match the reviewer route task_id")
  }
  if (review.instructions_acknowledged !== true) {
    throw new Error("REVIEW-E.instructions_acknowledged must be true")
  }
  validateExecutionReceiptRefs(review, reviewerRouteValidation, reviewerLoadReceipts, "REVIEW-E")
  if (review.review_target !== agentRun.receipt_id) {
    throw new Error("REVIEW-E.review_target must equal the worker AGENT-RUN receipt_id")
  }
  if (!Array.isArray(review.findings)) {
    throw new Error("REVIEW-E.findings must be an array")
  }
  if (review.verdict !== "PASS" && review.verdict !== "NEEDS_REMEDIATION") {
    throw new Error("REVIEW-E.verdict must be PASS or NEEDS_REMEDIATION")
  }

  assertDistinctInvocations([
    ["worker route", workerRoute.invocation_id],
    ["worker load", workerLoadBundle.invocation_id],
    ["AGENT-RUN", agentRun.invocation_id],
    ["reviewer route", reviewerRoute.invocation_id],
    ["reviewer load", reviewerLoadBundle.invocation_id],
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
  const status = review.verdict === "PASS" ? "VALID" : "REMEDIATION_REQUIRED"

  return {
    schema_version: 1,
    kind: "canonical-execution-evidence-validation",
    status,
    task_id: taskId,
    worker_identity: workerRoute.canonical_agent,
    reviewer_identity: reviewerRoute.canonical_agent,
    agent_run_receipt_id: agentRun.receipt_id,
    review_receipt_id: review.receipt_id,
    verdict: review.verdict,
    validated_receipt_count: validatedReceiptCount
  }
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArguments(argv, {
    "--evidence": { required: true }
  })
  const evidencePath = canonicalRepoPath(args["--evidence"])
  const evidence = readJson(evidencePath, evidencePath)
  const result = validateExecutionEvidence(evidence)
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
  if (result.status === "REMEDIATION_REQUIRED") {
    process.exitCode = 1
  }
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
