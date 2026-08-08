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

function collectFinalReceipts(evidence) {
  const receipts = []
  if (evidence.receipts !== undefined) {
    if (!Array.isArray(evidence.receipts)) {
      throw new Error("evidence.receipts must be an array")
    }
    receipts.push(...evidence.receipts)
  }
  if (evidence.agent_run !== undefined) {
    receipts.push(evidence.agent_run)
  }
  if (evidence.review !== undefined) {
    receipts.push(evidence.review)
  }
  const ids = new Set()
  for (const receipt of receipts) {
    const value = assertObject(receipt, "final receipt")
    if (typeof value.receipt_id === "string" && ids.has(value.receipt_id)) {
      throw new Error(`Final receipt appears more than once: ${value.receipt_id}`)
    }
    if (typeof value.receipt_id === "string") {
      ids.add(value.receipt_id)
    }
  }
  return receipts
}

function exactlyOneReceipt(receipts, type) {
  const matches = receipts.filter((receipt) => receipt?.type === type)
  if (matches.length !== 1) {
    throw new Error(`${type} must appear exactly once in final evidence`)
  }
  return matches[0]
}

function validateArtifacts(evidence, agentRun) {
  const artifacts = evidence.artifacts ?? agentRun.artifacts
  if (!Array.isArray(artifacts) || artifacts.length === 0) {
    throw new Error("Execution evidence must contain at least one artifact")
  }
  if (evidence.artifacts !== undefined && agentRun.artifacts !== undefined && JSON.stringify(evidence.artifacts) !== JSON.stringify(agentRun.artifacts)) {
    throw new Error("Top-level and AGENT-RUN artifacts differ")
  }
  const paths = []
  for (let index = 0; index < artifacts.length; index += 1) {
    const artifact = validateReceiptFileHash(artifacts[index], `artifacts[${index}]`)
    if (paths.includes(artifact.path)) {
      throw new Error(`Duplicate artifact path: ${artifact.path}`)
    }
    paths.push(artifact.path)
  }
  if (agentRun.artifact_refs !== undefined) {
    assertExactSet(agentRun.artifact_refs, paths, "AGENT-RUN.artifact_refs")
  } else if (agentRun.artifacts === undefined) {
    throw new Error("AGENT-RUN must bind artifacts through artifacts or artifact_refs")
  }
  return artifacts
}

export function validateExecutionEvidence(evidence) {
  assertNode20()
  const value = assertObject(evidence, "execution evidence")
  const routeBundle = assertObject(value.route, "evidence.route")
  validateRouteBundle(routeBundle)
  const loadBundle = assertObject(value.load_bundle, "evidence.load_bundle")
  const loadReceipts = validateLoadBundle(loadBundle, routeBundle)
  if (value.task_id !== undefined && value.task_id !== routeBundle.task_id) {
    throw new Error("Evidence task_id does not match the route")
  }

  const finalReceipts = collectFinalReceipts(value)
  const agentRun = assertReceiptEnvelope(exactlyOneReceipt(finalReceipts, "AGENT-RUN"), "AGENT-RUN", "COMPLETED")
  const review = assertReceiptEnvelope(exactlyOneReceipt(finalReceipts, "REVIEW-E"), "REVIEW-E", "COMPLETED")
  if (finalReceipts.length !== 2) {
    throw new Error("Final evidence may only contain one AGENT-RUN and one REVIEW-E receipt")
  }
  if (agentRun.task_id !== routeBundle.task_id || review.task_id !== routeBundle.task_id) {
    throw new Error("Final receipt task_id does not match the route")
  }
  if (agentRun.instructions_acknowledged !== true) {
    throw new Error("AGENT-RUN.instructions_acknowledged must be true")
  }
  const skillReceiptIds = loadReceipts
    .filter((receipt) => receipt.type === "SKILL-LOAD-E")
    .map((receipt) => receipt.receipt_id)
  assertExactSet(agentRun.skill_receipt_refs, skillReceiptIds, "AGENT-RUN.skill_receipt_refs")
  validateArtifacts(value, agentRun)

  if (review.invocation_id === agentRun.invocation_id) {
    throw new Error("REVIEW-E must use an invocation_id different from AGENT-RUN")
  }
  if (review.review_target !== agentRun.receipt_id) {
    throw new Error("REVIEW-E.review_target must equal the AGENT-RUN receipt_id")
  }
  if (review.verdict !== "PASS" && review.verdict !== "NEEDS_REMEDIATION") {
    throw new Error("REVIEW-E.verdict must be PASS or NEEDS_REMEDIATION")
  }

  const allReceiptIds = [
    ...routeBundle.receipts.map((receipt) => receipt.receipt_id),
    ...loadReceipts.map((receipt) => receipt.receipt_id),
    agentRun.receipt_id,
    review.receipt_id
  ]
  if (new Set(allReceiptIds).size !== allReceiptIds.length) {
    throw new Error("Receipt ids must be globally unique")
  }

  return {
    schema_version: 1,
    kind: "canonical-execution-evidence-validation",
    status: "VALID",
    task_id: routeBundle.task_id,
    agent_run_receipt_id: agentRun.receipt_id,
    review_receipt_id: review.receipt_id,
    verdict: review.verdict,
    validated_receipt_count: allReceiptIds.length
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
