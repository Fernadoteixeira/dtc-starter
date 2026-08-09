import { execSync } from "node:child_process"
import { createHash, randomUUID } from "node:crypto"
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, unlinkSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

export const ROUTE_KIND = "canonical-agent-route"
export const LOAD_KIND = "canonical-execution-load-bundle"
export const TASK_CAPSULE_KIND = "task-capsule"
export const REGISTRY_PATH = ".agents/canonical-agent-shortcuts.yaml"
export const AUTHORITY_REGISTRY_PATH = ".agents/canonical-authority-registry.yaml"
export const CAPABILITY_REGISTRY_PATH = ".agents/canonical-capability-registry.yaml"
export const AGENT_REGISTRY_PATH = ".agents/canonical-agent-registry.yaml"
export const PROTOCOL_REGISTRY_PATH = ".agents/canonical-protocol-registry.yaml"
export const PROTOCOL_PATH = ".agents/canonical-execution-protocol.yaml"
export const VALIDATOR_PATH = ".agents/scripts/validate-execution-evidence.mjs"
export const AGENT_ROOT = ".agents/ollama-superpowers-pack-v1.0.0/agents"
export const SKILL_ROOT = ".agents/ollama-superpowers-pack-v1.0.0/skills"
export const ORCHESTRATION_MANIFEST_PATH = ".agents/product-lifecycle-canonical-skills-315/manifest/orchestrations.json"
export const ORCHESTRATION_ROOT = ".agents/product-lifecycle-canonical-skills-315"
export const NOS_MANIFEST_PATH = ".agents/nos-gallery-canonical-skills-205/manifest/skills.json"
export const NOS_ROOT = ".agents/nos-gallery-canonical-skills-205"
export const DISPATCHER_PATH = ".agents/fio-vivo-antigravity-rug-pack/.agents/agents/fio-vivo-rug/agent.md"
export const WORKER_ADAPTER_PATH = ".agents/fio-vivo-antigravity-rug-pack/.agents/agents/canonical-worker/agent.md"
export const REVIEWER_ADAPTER_PATH = ".agents/fio-vivo-antigravity-rug-pack/.agents/agents/canonical-reviewer/agent.md"

export const PHASE_FILENAMES = Object.freeze({
  workerRoute: "worker-route.json",
  reviewerRoute: "review-route.json",
  workerLoads: "worker-loads.json",
  reviewerLoads: "review-loads.json",
  evidence: "execution-evidence.json",
  validation: "validation-evidence.json"
})

const CONTRACT_PATHS = Object.freeze({
  session_state_ledger: ".agents/contracts/session-state-ledger.md",
  nos_gallery_first_fold: ".agents/contracts/nos-gallery-first-fold.yaml"
})
const ARRAY_FIELDS = new Set([
  "core_skills",
  "external_skills",
  "orchestrations",
  "contracts",
  "specialist_agents",
  "supporting_agents",
  "nos_domains"
])
const SCALAR_FIELDS = new Set(["canonical_agent", "mode", "writer"])
const SHA256_PATTERN = /^[a-f0-9]{64}$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SCRIPT_PATH = fileURLToPath(import.meta.url)
export const REPO_ROOT = realpathSync(path.resolve(path.dirname(SCRIPT_PATH), "..", ".."))

export function assertNode20() {
  const major = Number.parseInt(process.versions.node.split(".")[0], 10)
  if (!Number.isInteger(major) || major < 20) {
    throw new Error(`Node.js >=20 is required, found ${process.versions.node}`)
  }
}

export function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`)
  }
  return value
}

export function assertExactObjectKeys(value, expectedKeys, label) {
  assertObject(value, label)
  const actual = Object.keys(value).sort()
  const expected = [...expectedKeys].sort()
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label} must contain exactly: ${expected.join(", ")}`)
  }
  return value
}

export function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() !== value || value.length === 0) {
    throw new Error(`${label} must be a non-empty trimmed string`)
  }
  return value
}

export function assertStringArray(value, label) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.length === 0)) {
    throw new Error(`${label} must be an array of non-empty strings`)
  }
  return value
}

export function assertSha256(value, label) {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) {
    throw new Error(`${label} must be a lowercase SHA-256 digest`)
  }
  return value
}

export function assertUuid(value, label) {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new Error(`${label} must be a UUID identifier`)
  }
  return value
}

export function assertIsoTimestamp(value, label) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new Error(`${label} must be a valid ISO-8601 UTC timestamp`)
  }
  return value
}

export function toPosixPath(value) {
  return value.split(path.sep).join("/")
}

function assertLexicallyConfined(repoPath) {
  assertNonEmptyString(repoPath, "repository path")
  if (repoPath.includes("\0") || path.isAbsolute(repoPath) || path.win32.isAbsolute(repoPath)) {
    throw new Error(`Path must be repository-relative: ${repoPath}`)
  }
  const normalized = path.normalize(repoPath)
  if (normalized === ".." || normalized.startsWith(`..${path.sep}`)) {
    throw new Error(`Path escapes the repository: ${repoPath}`)
  }
  return normalized
}

function isPhysicalDescendant(candidate, root, allowEqual = false) {
  const relative = path.relative(root, candidate)
  if (relative === "") {
    return allowEqual
  }
  return relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative)
}

function assertPhysicalConfinement(absolutePath, repoPath) {
  if (!isPhysicalDescendant(absolutePath, REPO_ROOT, true)) {
    throw new Error(`Path escapes the repository through a symlink: ${repoPath}`)
  }
}

export function resolveRepoPath(repoPath, options = {}) {
  const normalized = assertLexicallyConfined(repoPath)
  const absolutePath = path.resolve(REPO_ROOT, normalized)
  assertPhysicalConfinement(absolutePath, repoPath)
  const mustExist = options.mustExist !== false
  if (mustExist) {
    if (!existsSync(absolutePath)) {
      throw new Error(`Repository path does not exist: ${toPosixPath(normalized)}`)
    }
    const physicalPath = realpathSync(absolutePath)
    assertPhysicalConfinement(physicalPath, repoPath)
    if (options.file !== false && !lstatSync(physicalPath).isFile()) {
      throw new Error(`Repository path is not a file: ${toPosixPath(normalized)}`)
    }
  } else {
    const parentPath = path.dirname(absolutePath)
    if (!existsSync(parentPath)) {
      throw new Error(`Output parent directory does not exist: ${toPosixPath(path.relative(REPO_ROOT, parentPath))}`)
    }
    assertPhysicalConfinement(realpathSync(parentPath), repoPath)
  }
  return absolutePath
}

export function canonicalRepoPath(repoPath, options = {}) {
  return toPosixPath(path.relative(REPO_ROOT, resolveRepoPath(repoPath, options)))
}

export function assertPathUnderRoot(repoPath, rootPath, options = {}) {
  const canonicalPath = canonicalRepoPath(repoPath)
  const canonicalRoot = canonicalRepoPath(rootPath, { file: false })
  const physicalPath = realpathSync(resolveRepoPath(canonicalPath))
  const physicalRoot = realpathSync(resolveRepoPath(canonicalRoot, { file: false }))
  if (!lstatSync(physicalRoot).isDirectory() || !isPhysicalDescendant(physicalPath, physicalRoot)) {
    throw new Error(`${options.label ?? "Path"} is outside ${canonicalRoot}: ${canonicalPath}`)
  }
  if (options.basename && path.posix.basename(canonicalPath) !== options.basename) {
    throw new Error(`${options.label ?? "Path"} must end in ${options.basename}: ${canonicalPath}`)
  }
  return canonicalPath
}

export function assertCoreSkillPath(repoPath, skillId) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(skillId)) {
    throw new Error(`Invalid core skill id: ${skillId}`)
  }
  const expected = `${SKILL_ROOT}/${skillId}/skill.json`
  const canonicalPath = assertPathUnderRoot(repoPath, SKILL_ROOT, { basename: "skill.json", label: "Core skill" })
  if (canonicalPath !== expected) {
    throw new Error(`Core skill path must be ${expected}`)
  }
  return canonicalPath
}

export function assertExternalSkillPath(repoPath) {
  const canonicalPath = assertPathUnderRoot(repoPath, ".agents/skills", { basename: "SKILL.md", label: "External skill" })
  const forbidden = [
    "/manifest/",
    "/contracts/",
    "/scripts/",
    "/adapters/",
    "canonical-agent-shortcuts.yaml",
    "canonical-execution-protocol.yaml"
  ]
  const searchable = `/${canonicalPath.toLowerCase()}`
  if (forbidden.some((value) => searchable.includes(value))) {
    throw new Error(`Forbidden external skill path: ${canonicalPath}`)
  }
  return canonicalPath
}

export function assertNosSkillPath(repoPath) {
  return assertPathUnderRoot(repoPath, `${NOS_ROOT}/skills`, { basename: "SKILL.md", label: "NOS skill" })
}

export function assertOrchestrationPath(repoPath) {
  return assertPathUnderRoot(repoPath, `${ORCHESTRATION_ROOT}/orchestrations`, { basename: "SKILL.md", label: "Orchestration" })
}

export function resolveEvidenceDirectory(evidenceDir) {
  const canonicalPath = canonicalRepoPath(evidenceDir, { file: false })
  const absolutePath = resolveRepoPath(canonicalPath, { file: false })
  if (!lstatSync(realpathSync(absolutePath)).isDirectory()) {
    throw new Error(`Evidence directory is not a directory: ${canonicalPath}`)
  }
  return { canonicalPath, physicalPath: realpathSync(absolutePath) }
}

export function assertEvidenceInputPath(repoPath, evidenceDir, allowedNames) {
  const evidence = resolveEvidenceDirectory(evidenceDir)
  const canonicalPath = canonicalRepoPath(repoPath)
  const physicalPath = realpathSync(resolveRepoPath(canonicalPath))
  if (!isPhysicalDescendant(physicalPath, evidence.physicalPath)) {
    throw new Error(`Input is outside the evidence directory: ${canonicalPath}`)
  }
  if (allowedNames && !allowedNames.includes(path.posix.basename(canonicalPath))) {
    throw new Error(`Input filename is not allowed for this phase: ${canonicalPath}`)
  }
  return canonicalPath
}

export function resolveEvidenceOutputPath(repoPath, evidenceDir, allowedNames) {
  const evidence = resolveEvidenceDirectory(evidenceDir)
  const normalized = assertLexicallyConfined(repoPath)
  const absolutePath = path.resolve(REPO_ROOT, normalized)
  if (path.extname(absolutePath).toLowerCase() !== ".json") {
    throw new Error(`Evidence output must use a .json extension: ${repoPath}`)
  }
  const basename = path.basename(absolutePath)
  if (!allowedNames.includes(basename)) {
    throw new Error(`Output filename is not allowed for this phase: ${basename}`)
  }
  if (existsSync(absolutePath)) {
    throw new Error(`Evidence output already exists: ${toPosixPath(normalized)}`)
  }
  const parent = path.dirname(absolutePath)
  if (!existsSync(parent)) {
    throw new Error(`Evidence output parent does not exist: ${toPosixPath(path.relative(REPO_ROOT, parent))}`)
  }
  const physicalParent = realpathSync(parent)
  assertPhysicalConfinement(physicalParent, repoPath)
  if (!isPhysicalDescendant(physicalParent, evidence.physicalPath, true)) {
    throw new Error(`Output is outside the evidence directory: ${repoPath}`)
  }
  return toPosixPath(path.relative(REPO_ROOT, absolutePath))
}

export function hashBytes(value) {
  return createHash("sha256").update(value).digest("hex")
}

export function hashFile(repoPath) {
  return hashBytes(readFileSync(resolveRepoPath(repoPath)))
}

export function readUtf8(repoPath) {
  return readFileSync(resolveRepoPath(repoPath), "utf8")
}

export function readJson(repoPath, label = repoPath) {
  try {
    return JSON.parse(readUtf8(repoPath))
  } catch (error) {
    throw new Error(`Invalid JSON in ${label}: ${error.message}`)
  }
}

function canonicalizeJson(value, label) {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return value
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error(`${label} contains a non-finite number`)
    }
    return value
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => canonicalizeJson(item, `${label}[${index}]`))
  }
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    const output = {}
    for (const key of Object.keys(value).sort()) {
      if (value[key] === undefined) {
        throw new Error(`${label}.${key} is undefined`)
      }
      output[key] = canonicalizeJson(value[key], `${label}.${key}`)
    }
    return output
  }
  throw new Error(`${label} is not canonical JSON data`)
}

export function canonicalJson(value, label = "value") {
  return JSON.stringify(canonicalizeJson(value, label))
}

export function hashCanonicalValue(value, label = "value") {
  return hashBytes(typeof value === "string" ? value : canonicalJson(value, label))
}

export function writeJsonExclusive(repoPath, value) {
  const canonicalPath = canonicalRepoPath(repoPath, { mustExist: false })
  const serialized = `${JSON.stringify(value, null, 2)}\n`
  writeFileSync(resolveRepoPath(canonicalPath, { mustExist: false }), serialized, { encoding: "utf8", flag: "wx" })
  return serialized
}

export function parseArguments(argv, specification) {
  const result = {}
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index]
    if (!Object.hasOwn(specification, flag)) {
      throw new Error(`Unknown argument: ${flag}`)
    }
    const value = argv[index + 1]
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Missing value for ${flag}`)
    }
    index += 1
    if (specification[flag].repeatable) {
      result[flag] ??= []
      result[flag].push(value)
    } else {
      if (Object.hasOwn(result, flag)) {
        throw new Error(`Argument may only be provided once: ${flag}`)
      }
      result[flag] = value
    }
  }
  for (const [flag, rule] of Object.entries(specification)) {
    if (rule.required && !Object.hasOwn(result, flag)) {
      throw new Error(`Missing required argument: ${flag}`)
    }
  }
  return result
}

function parseYamlScalar(source, lineNumber) {
  const value = source.trim()
  if (value === "true") return true
  if (value === "false") return false
  if (!/^[A-Za-z0-9._/-]+$/.test(value)) {
    throw new Error(`Unsupported YAML scalar at line ${lineNumber}: ${source}`)
  }
  return value
}

function parseInlineArray(source, lineNumber) {
  if (!source.startsWith("[") || !source.endsWith("]")) {
    throw new Error(`Malformed inline array at line ${lineNumber}`)
  }
  const body = source.slice(1, -1).trim()
  return body.length === 0 ? [] : body.split(",").map((item) => parseYamlScalar(item, lineNumber))
}

export function parseShortcutRegistry(source) {
  if (typeof source !== "string") throw new Error("Registry source must be a string")
  if (source.includes("\t")) throw new Error("Tabs are not allowed in the shortcut registry")
  const lines = source.replace(/^\uFEFF/, "").split(/\r?\n/)
  const shortcutsLine = lines.findIndex((line) => line === "shortcuts:")
  if (shortcutsLine === -1) throw new Error("Registry is missing the top-level shortcuts: section")
  if (lines.findIndex((line, index) => index !== shortcutsLine && line === "shortcuts:") !== -1) {
    throw new Error("Registry contains more than one shortcuts: section")
  }
  const shortcuts = {}
  let currentShortcut = null
  let pendingList = null
  for (let index = shortcutsLine + 1; index < lines.length; index += 1) {
    const line = lines[index]
    const lineNumber = index + 1
    if (line.trim().length === 0) continue
    if (/^[^ ]/.test(line)) break
    const shortcutMatch = /^  ([A-Za-z0-9]+(?::[A-Za-z0-9]+)*):$/.exec(line)
    if (shortcutMatch) {
      currentShortcut = shortcutMatch[1]
      if (Object.hasOwn(shortcuts, currentShortcut)) throw new Error(`Duplicate shortcut at line ${lineNumber}: ${currentShortcut}`)
      shortcuts[currentShortcut] = {}
      pendingList = null
      continue
    }
    if (!currentShortcut) throw new Error(`Shortcut property appears before a shortcut at line ${lineNumber}`)
    const propertyMatch = /^    ([a-z][a-z0-9_]*):(.*)$/.exec(line)
    if (propertyMatch) {
      const [, field, rawValue] = propertyMatch
      if (!ARRAY_FIELDS.has(field) && !SCALAR_FIELDS.has(field)) throw new Error(`Unsupported shortcut property at line ${lineNumber}: ${field}`)
      if (Object.hasOwn(shortcuts[currentShortcut], field)) throw new Error(`Duplicate property at line ${lineNumber}: ${field}`)
      const value = rawValue.trim()
      if (value.length === 0) {
        if (!ARRAY_FIELDS.has(field)) throw new Error(`Only array properties may use block lists at line ${lineNumber}`)
        shortcuts[currentShortcut][field] = []
        pendingList = field
      } else {
        const parsed = value.startsWith("[") ? parseInlineArray(value, lineNumber) : parseYamlScalar(value, lineNumber)
        if (ARRAY_FIELDS.has(field) !== Array.isArray(parsed)) throw new Error(`Invalid value type for ${field} at line ${lineNumber}`)
        shortcuts[currentShortcut][field] = parsed
        pendingList = null
      }
      continue
    }
    const listMatch = /^      - (.+)$/.exec(line)
    if (listMatch && pendingList) {
      shortcuts[currentShortcut][pendingList].push(parseYamlScalar(listMatch[1], lineNumber))
      continue
    }
    throw new Error(`Unsupported YAML syntax in shortcuts: at line ${lineNumber}: ${line}`)
  }
  if (Object.keys(shortcuts).length === 0) throw new Error("Registry shortcuts: section is empty")
  for (const [shortcut, entry] of Object.entries(shortcuts)) {
    assertNonEmptyString(entry.canonical_agent, `shortcuts.${shortcut}.canonical_agent`)
    if (entry.writer !== undefined && typeof entry.writer !== "boolean") throw new Error(`shortcuts.${shortcut}.writer must be a boolean`)
    for (const field of ARRAY_FIELDS) {
      if (entry[field] !== undefined) assertStringArray(entry[field], `shortcuts.${shortcut}.${field}`)
    }
  }
  return shortcuts
}

export function loadRegistry() {
  return {
    path: REGISTRY_PATH,
    sha256: hashFile(REGISTRY_PATH),
    shortcuts: parseShortcutRegistry(readUtf8(REGISTRY_PATH))
  }
}

export function normalizeShortcut(value) {
  const shortcut = assertNonEmptyString(value, "shortcut").replace(/^@/, "")
  if (!/^[A-Za-z0-9]+(?::[A-Za-z0-9]+)*$/.test(shortcut)) throw new Error(`Invalid shortcut: ${value}`)
  return shortcut
}

export function resolveShortcut(shortcutValue, registry = loadRegistry()) {
  const shortcut = normalizeShortcut(shortcutValue)
  const entry = registry.shortcuts[shortcut]
  if (!entry) throw new Error(`Unknown canonical agent shortcut: ${shortcut}`)
  const contracts = entry.contracts ?? []
  const contractPaths = {}
  for (const contract of contracts) {
    const contractPath = CONTRACT_PATHS[contract]
    if (!contractPath) throw new Error(`Unknown contract in shortcut ${shortcut}: ${contract}`)
    contractPaths[contract] = canonicalRepoPath(contractPath)
  }
  const externalSkills = (entry.external_skills ?? []).map(assertExternalSkillPath)
  const specialistAgents = (entry.specialist_agents ?? []).map((specialistPath) => canonicalRepoPath(specialistPath))
  return {
    shortcut,
    canonical_agent: entry.canonical_agent,
    core_skills: [...(entry.core_skills ?? [])],
    external_skills: externalSkills,
    orchestrations: [...(entry.orchestrations ?? [])],
    contracts: [...contracts],
    contract_paths: contractPaths,
    specialist_agents: specialistAgents,
    nos_domains: [...(entry.nos_domains ?? [])],
    mode: entry.mode ?? null,
    writer: entry.writer ?? false
  }
}

export function adapterForRoute(route) {
  return route.shortcut === "review:canonical"
    ? { id: "canonical-reviewer", path: REVIEWER_ADAPTER_PATH }
    : { id: "canonical-worker", path: WORKER_ADAPTER_PATH }
}

export function createReceipt(type, status, invocationId = randomUUID()) {
  return {
    type,
    receipt_id: randomUUID(),
    invocation_id: invocationId,
    timestamp: new Date().toISOString(),
    status
  }
}

export function findReceipt(bundle, type) {
  const receipts = Array.isArray(bundle.receipts) ? bundle.receipts : []
  const matches = receipts.filter((receipt) => receipt?.type === type)
  if (matches.length !== 1) throw new Error(`${type} must appear exactly once`)
  return assertObject(matches[0], type)
}

function equalStringArrays(left, right) {
  return Array.isArray(left) && left.length === right.length && left.every((value, index) => value === right[index])
}

export function validateRouteBundle(routeBundle) {
  const bundle = assertObject(routeBundle, "route bundle")
  if (bundle.kind !== ROUTE_KIND || bundle.status !== "LOADED" || bundle.schema_version !== 1) {
    throw new Error("Route bundle must be schema version 1, canonical-agent-route, and LOADED")
  }
  assertNonEmptyString(bundle.task_id, "route.task_id")
  assertUuid(bundle.invocation_id, "route.invocation_id")
  if (!Array.isArray(bundle.receipts) || bundle.receipts.length !== 2) {
    throw new Error("Route receipts must contain exactly ROUTE-E and AGENT-LOAD-E")
  }
  const receiptTypes = bundle.receipts.map((receipt) => receipt?.type).sort()
  if (JSON.stringify(receiptTypes) !== JSON.stringify(["AGENT-LOAD-E", "ROUTE-E"])) {
    throw new Error("Route receipts must contain exactly ROUTE-E and AGENT-LOAD-E")
  }
  const registry = loadRegistry()
  const resolved = resolveShortcut(bundle.shortcut, registry)
  for (const field of ["shortcut", "canonical_agent", "mode", "writer"]) {
    if (bundle[field] !== resolved[field]) throw new Error(`Route field does not match the registry: ${field}`)
  }
  for (const field of ["core_skills", "external_skills", "orchestrations", "contracts", "specialist_agents", "nos_domains"]) {
    if (!equalStringArrays(bundle[field], resolved[field])) throw new Error(`Route field does not match the registry: ${field}`)
  }
  if (JSON.stringify(bundle.contract_paths) !== JSON.stringify(resolved.contract_paths)) throw new Error("Route contract_paths do not match the registry")
  const routeReceipt = findReceipt(bundle, "ROUTE-E")
  const agentReceipt = findReceipt(bundle, "AGENT-LOAD-E")
  if (routeReceipt.receipt_id === agentReceipt.receipt_id) throw new Error("Route receipt ids must be unique")
  for (const [receipt, label] of [[routeReceipt, "ROUTE-E"], [agentReceipt, "AGENT-LOAD-E"]]) {
    assertUuid(receipt.receipt_id, `${label}.receipt_id`)
    assertUuid(receipt.invocation_id, `${label}.invocation_id`)
    assertIsoTimestamp(receipt.timestamp, `${label}.timestamp`)
    if (receipt.invocation_id !== bundle.invocation_id || receipt.status !== "LOADED" || receipt.task_id !== bundle.task_id) {
      throw new Error(`${label} has an invalid invocation_id, task_id, or status`)
    }
  }
  if (routeReceipt.shortcut !== bundle.shortcut || routeReceipt.path !== REGISTRY_PATH || routeReceipt.sha256 !== registry.sha256) {
    throw new Error("ROUTE-E registry identity or hash is stale")
  }
  validateReceiptFileHash(routeReceipt, "ROUTE-E")
  const agentPath = `${AGENT_ROOT}/${resolved.canonical_agent}/agent.json`
  if (agentReceipt.agent_id !== resolved.canonical_agent || agentReceipt.path !== agentPath) {
    throw new Error("AGENT-LOAD-E does not identify the canonical agent definition")
  }
  validateReceiptFileHash(agentReceipt, "AGENT-LOAD-E")
  const agentDefinition = assertObject(readJson(agentPath, agentPath), "agent definition")
  if (agentDefinition.id !== resolved.canonical_agent) throw new Error("Canonical agent definition id mismatch")
  return { bundle, resolved, registry, routeReceipt, agentReceipt, agentDefinition }
}

export function validateReceiptFileHash(receipt, label) {
  const value = assertObject(receipt, label)
  assertNonEmptyString(value.path, `${label}.path`)
  assertSha256(value.sha256, `${label}.sha256`)
  const canonicalPath = canonicalRepoPath(value.path)
  if (value.path !== canonicalPath) throw new Error(`${label}.path must be canonical: ${canonicalPath}`)
  if (hashFile(value.path) !== value.sha256) throw new Error(`${label} hash mismatch for ${value.path}`)
  return value
}

export function validateSkillConsumeReceipt(receipt, loadReceiptMap, agentRunOrReview, label = "SKILL-CONSUME-E") {
  const value = assertObject(receipt, label)
  if (value.type !== "SKILL-CONSUME-E") throw new Error(`${label}.type must be SKILL-CONSUME-E`)
  assertUuid(value.receipt_id, `${label}.receipt_id`)
  assertNonEmptyString(value.task_id, `${label}.task_id`)
  assertUuid(value.agent_run_ref, `${label}.agent_run_ref`)
  assertUuid(value.skill_load_receipt_ref, `${label}.skill_load_receipt_ref`)
  assertNonEmptyString(value.skill_id, `${label}.skill_id`)
  assertNonEmptyString(value.skill_path, `${label}.skill_path`)
  assertSha256(value.skill_sha256, `${label}.skill_sha256`)
  if (value.status !== "CONSUMED") throw new Error(`${label}.status must be CONSUMED`)

  if (agentRunOrReview) {
    if (value.agent_run_ref !== agentRunOrReview.receipt_id) {
      throw new Error(`${label}.agent_run_ref does not match the target execution receipt_id`)
    }
    if (value.task_id !== agentRunOrReview.task_id) {
      throw new Error(`${label}.task_id does not match the execution task_id`)
    }
  }

  const canonicalSkillPath = canonicalRepoPath(value.skill_path)
  if (value.skill_path !== canonicalSkillPath) {
    throw new Error(`${label}.skill_path must be canonical: ${canonicalSkillPath}`)
  }
  if (hashFile(canonicalSkillPath) !== value.skill_sha256) {
    throw new Error(`${label} skill file hash mismatch for ${canonicalSkillPath}`)
  }

  if (loadReceiptMap) {
    const loadReceipt = loadReceiptMap.get(value.skill_load_receipt_ref)
    if (!loadReceipt) {
      throw new Error(`${label}.skill_load_receipt_ref ${value.skill_load_receipt_ref} not found in load bundle`)
    }
    if (loadReceipt.type !== "SKILL-LOAD-E") {
      throw new Error(`${label}.skill_load_receipt_ref does not point to a SKILL-LOAD-E receipt`)
    }
    if (loadReceipt.skill_id !== value.skill_id) {
      throw new Error(`${label}.skill_id (${value.skill_id}) does not match referenced SKILL-LOAD-E.skill_id (${loadReceipt.skill_id})`)
    }
    if (loadReceipt.path !== value.skill_path) {
      throw new Error(`${label}.skill_path (${value.skill_path}) does not match referenced SKILL-LOAD-E.path (${loadReceipt.path})`)
    }
    if (loadReceipt.sha256 !== value.skill_sha256) {
      throw new Error(`${label}.skill_sha256 does not match referenced SKILL-LOAD-E.sha256`)
    }
  }

  if (!Array.isArray(value.consumption_evidence) || value.consumption_evidence.length === 0) {
    throw new Error(`${label}.consumption_evidence must be a non-empty array`)
  }
  for (let i = 0; i < value.consumption_evidence.length; i += 1) {
    const item = assertObject(value.consumption_evidence[i], `${label}.consumption_evidence[${i}]`)
    assertNonEmptyString(item.action, `${label}.consumption_evidence[${i}].action`)
    assertNonEmptyString(item.artifact_path, `${label}.consumption_evidence[${i}].artifact_path`)
    assertSha256(item.artifact_sha256, `${label}.consumption_evidence[${i}].artifact_sha256`)
    assertNonEmptyString(item.rule_or_capability_applied, `${label}.consumption_evidence[${i}].rule_or_capability_applied`)
    assertNonEmptyString(item.evidence, `${label}.consumption_evidence[${i}].evidence`)
    const canonicalArt = canonicalRepoPath(item.artifact_path)
    if (item.artifact_path !== canonicalArt) {
      throw new Error(`${label} artifact path must be canonical: ${canonicalArt}`)
    }
    if (hashFile(canonicalArt) !== item.artifact_sha256) {
      throw new Error(`${label} artifact hash mismatch for ${item.artifact_path}`)
    }
  }
  return value
}

export function validateHostCorrelationReceipt(receipt, label = "HOST-EXECUTION-CORRELATION-E") {
  const value = assertObject(receipt, label)
  if (value.type !== "HOST-EXECUTION-CORRELATION-E") throw new Error(`${label}.type must be HOST-EXECUTION-CORRELATION-E`)
  assertUuid(value.receipt_id, `${label}.receipt_id`)
  assertNonEmptyString(value.task_id, `${label}.task_id`)
  assertUuid(value.host_session_id, `${label}.host_session_id`)
  assertUuid(value.invocation_id, `${label}.invocation_id`)
  return value
}

export function toCanonicalLeasePath(repoPath) {
  assertNonEmptyString(repoPath, "repoPath")
  let normalized = repoPath.split(path.sep).join("/")
  normalized = path.posix.normalize(normalized)
  if (normalized.endsWith("/") && normalized.length > 1) {
    normalized = normalized.slice(0, -1)
  }
  return process.platform === "win32" ? normalized.toLowerCase() : normalized
}

export function pathsOverlap(pathA, pathB) {
  const normA = toCanonicalLeasePath(pathA)
  const normB = toCanonicalLeasePath(pathB)

  if (normA === normB) return true

  const globA = normA.endsWith("/**") ? normA.slice(0, -3) : normA.endsWith("/*") ? normA.slice(0, -2) : null
  const globB = normB.endsWith("/**") ? normB.slice(0, -3) : normB.endsWith("/*") ? normB.slice(0, -2) : null

  if (globA && (normB === globA || normB.startsWith(`${globA}/`))) return true
  if (globB && (normA === globB || normA.startsWith(`${globB}/`))) return true

  if (normA.startsWith(`${normB}/`) || normB.startsWith(`${normA}/`)) return true

  return false
}

export function assertWriteSetNoConflict(laneAWriteSet, laneBWriteSet) {
  assertStringArray(laneAWriteSet, "lane A write-set")
  assertStringArray(laneBWriteSet, "lane B write-set")
  for (const pathA of laneAWriteSet) {
    for (const pathB of laneBWriteSet) {
      if (pathsOverlap(pathA, pathB)) {
        throw new Error(`Write-set collision detected on path: ${pathA} vs ${pathB}`)
      }
    }
  }
}

export function validateTaskCapsule(capsule) {
  const value = assertObject(capsule, "task capsule")
  if (value.schema_version !== 1 || value.kind !== TASK_CAPSULE_KIND) {
    throw new Error("Task Capsule must be schema version 1 and kind task-capsule")
  }
  const task = assertObject(value.task, "capsule.task")
  assertNonEmptyString(task.id, "capsule.task.id")
  if (typeof task.objective === "string") {
    assertNonEmptyString(task.objective, "capsule.task.objective")
  } else {
    assertObject(task.objective, "capsule.task.objective")
  }

  const authority = assertObject(value.authority, "capsule.authority")
  assertStringArray(authority.contracts ?? [], "capsule.authority.contracts")
  assertStringArray(authority.source_refs ?? [], "capsule.authority.source_refs")
  assertStringArray(authority.immutable_refs ?? [], "capsule.authority.immutable_refs")

  const capabilities = assertObject(value.capabilities, "capsule.capabilities")
  assertStringArray(capabilities.lifecycle ?? [], "capsule.capabilities.lifecycle")
  assertStringArray(capabilities.canonical_technical ?? [], "capsule.capabilities.canonical_technical")
  assertStringArray(capabilities.target_platform ?? [], "capsule.capabilities.target_platform")

  const agent = assertObject(value.agent, "capsule.agent")
  const workerAgentId = typeof agent.worker === "object" ? agent.worker.agent_id : agent.worker
  const reviewerAgentId = typeof agent.reviewer === "object" ? agent.reviewer.agent_id : agent.reviewer
  assertNonEmptyString(workerAgentId, "capsule.agent.worker")
  assertNonEmptyString(reviewerAgentId, "capsule.agent.reviewer")
  if (workerAgentId === reviewerAgentId) {
    throw new Error("Capsule worker and reviewer agent identities must be distinct")
  }

  const authorization = assertObject(value.authorization ?? { grants: ["AUTH-0", "AUTH-1"] }, "capsule.authorization")
  assertStringArray(authorization.grants ?? [], "capsule.authorization.grants")

  const execution = assertObject(value.execution, "capsule.execution")
  assertStringArray(execution.write_set ?? [], "capsule.execution.write_set")
  assertStringArray(execution.read_set ?? [], "capsule.execution.read_set")
  assertStringArray(execution.forbidden_paths ?? [], "capsule.execution.forbidden_paths")
  assertStringArray(execution.tools_allowed ?? [], "capsule.execution.tools_allowed")

  const forbidden = execution.forbidden_paths ?? []
  for (const writePath of (execution.write_set ?? [])) {
    for (const forbiddenPattern of forbidden) {
      if (pathsOverlap(writePath, forbiddenPattern)) {
        throw new Error(`Write-set path ${writePath} collides with forbidden path pattern ${forbiddenPattern}`)
      }
    }
  }

  const protocols = assertObject(value.protocols, "capsule.protocols")
  assertNonEmptyString(protocols.a2a ?? "internal", "capsule.protocols.a2a")
  // CAT 2B â€” LEGACY MACHINE IDENTIFIER / COMPATIBILITY SHIM (DEPRECATED):
  // Write operations emit 'fio_vivo_ap2' exclusively.
  // Read operations accept 'fio_vivo_ap2' or fallback 'dtc_ap2' during migration window.
  assertNonEmptyString(protocols.fio_vivo_ap2 ?? protocols.dtc_ap2 ?? "enabled", "capsule.protocols.fio_vivo_ap2")
  assertStringArray(protocols.mcp ?? [], "capsule.protocols.mcp")

  const evidence = assertObject(value.evidence, "capsule.evidence")
  assertStringArray(evidence.required_receipts ?? [], "capsule.evidence.required_receipts")

  const governance = assertObject(value.governance, "capsule.governance")
  assertNonEmptyString(governance.dor ?? "PASS", "capsule.governance.dor")
  assertNonEmptyString(governance.dod ?? "PENDING", "capsule.governance.dod")

  return value
}

export function hashCanonicalTaskCapsule(capsule) {
  const validated = validateTaskCapsule(capsule)
  const copy = structuredClone(validated)
  delete copy.task_capsule_sha256
  return hashCanonicalValue(copy, "task capsule")
}

export function compileTaskCapsule({ routeBundle, objective = "Bounded task execution", writeSet = [], readSet = [], forbiddenPaths = [], toolsAllowed = ["read", "write"], grants = ["AUTH-0", "AUTH-1"] }) {
  const route = validateRouteBundle(routeBundle).bundle
  const capsule = {
    schema_version: 1,
    kind: TASK_CAPSULE_KIND,
    task: {
      id: route.task_id,
      objective
    },
    authority: {
      contracts: route.contracts ?? [],
      source_refs: [route.path ?? REGISTRY_PATH],
      immutable_refs: ["Fernadoteixeira/dtc-starter"]
    },
    capabilities: {
      lifecycle: route.orchestrations ?? [],
      canonical_technical: route.nos_domains ?? [],
      target_platform: [...(route.core_skills ?? []), ...(route.external_skills ?? [])]
    },
    agent: {
      worker: { agent_id: route.canonical_agent, archetype: "worker" },
      reviewer: { agent_id: route.shortcut === "review:canonical" ? "code-reviewer" : "canonical-reviewer", archetype: "reviewer" }
    },
    authorization: {
      grants
    },
    execution: {
      invocation_id: route.invocation_id,
      tools_allowed: toolsAllowed,
      write_set: writeSet,
      read_set: readSet,
      forbidden_paths: forbiddenPaths
    },
    protocols: {
      a2a: "internal",
      fio_vivo_ap2: "enabled",
      mcp: ["medusa-docs"]
    },
    evidence: {
      required_receipts: ["ROUTE-E", "AGENT-LOAD-E", "SKILL-LOAD-E", "AGENT-RUN", "REVIEW-E"]
    },
    governance: {
      dor: "PASS",
      dod: "PENDING",
      human_gate: "NOT_REQUIRED"
    }
  }
  capsule.task_capsule_sha256 = hashCanonicalTaskCapsule(capsule)
  return validateTaskCapsule(capsule)
}

const activeLeases = new Map()

export function parseAgentRegistry(source) {
  if (typeof source !== "string") throw new Error("Agent registry source must be a string")
  const lines = source.replace(/^\uFEFF/, "").split(/\r?\n/)
  const archetypesMap = new Map()
  const agentsMap = new Map()

  let currentSection = null
  let currentKey = null

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (line.trim().length === 0 || line.startsWith("#")) continue
    if (line === "archetypes:") {
      currentSection = "archetypes"
      continue
    }
    if (line === "agents:") {
      currentSection = "agents"
      continue
    }

    const keyMatch = /^  ([a-z0-9-]+):$/.exec(line)
    if (keyMatch) {
      currentKey = keyMatch[1]
      if (currentSection === "archetypes") {
        archetypesMap.set(currentKey, {})
      } else if (currentSection === "agents") {
        agentsMap.set(currentKey, {})
      }
      continue
    }

    const propMatch = /^    ([a-z_]+):\s*(.+)$/.exec(line)
    if (propMatch && currentKey) {
      const [, prop, val] = propMatch
      const parsedVal = val === "true" ? true : val === "false" ? false : val
      if (currentSection === "archetypes") {
        const archetype = archetypesMap.get(currentKey)
        if (archetype) archetype[prop] = parsedVal
      } else if (currentSection === "agents") {
        const agent = agentsMap.get(currentKey)
        if (agent) agent[prop] = parsedVal
      }
    }
  }

  if (archetypesMap.size === 0 && agentsMap.size === 0) {
    throw new Error("Agent registry missing archetypes: or agents: section")
  }

  return { archetypes: archetypesMap, agents: agentsMap }
}

export function loadAgentRegistry() {
  if (!existsSync(resolveRepoPath(AGENT_REGISTRY_PATH, { mustExist: false }))) {
    const defaultAgents = new Map()
    for (const id of ["canonical-worker", "canonical-reviewer", "implementation-engineer", "code-reviewer", "software-architect", "orchestrator", "bb03-css-implementer", "bb03-css-spec", "bb03-css-validator", "repo-guardian", "security-governor", "visual-catalog-curator", "runtime-verifier", "qa-test-lead", "release-operator"]) {
      defaultAgents.set(id, { archetype: id.includes("reviewer") ? "reviewer" : id.includes("worker") || id.includes("engineer") || id.includes("implementer") ? "worker" : "validator" })
    }
    return { archetypes: new Map(), agents: defaultAgents }
  }
  return parseAgentRegistry(readUtf8(AGENT_REGISTRY_PATH))
}

export function validateTaskCapsuleReferences(capsule) {
  const validated = validateTaskCapsule(capsule)
  const registry = loadAgentRegistry()

  const workerId = typeof validated.agent.worker === "object" ? validated.agent.worker.agent_id : validated.agent.worker
  const reviewerId = typeof validated.agent.reviewer === "object" ? validated.agent.reviewer.agent_id : validated.agent.reviewer

  if (!registry.agents.has(workerId)) {
    throw new Error(`Task Capsule references unknown worker agent: ${workerId}`)
  }
  if (!registry.agents.has(reviewerId)) {
    throw new Error(`Task Capsule references unknown reviewer agent: ${reviewerId}`)
  }

  for (const ref of validated.authority.source_refs) {
    if (!existsSync(resolveRepoPath(ref, { mustExist: false }))) {
      throw new Error(`Task Capsule references non-existent authority source ref: ${ref}`)
    }
  }

  return validated
}

export function authorizeTaskCapsule(capsule, requestedGrant = "AUTH-1") {
  const validated = validateTaskCapsuleReferences(capsule)
  const validGrants = new Set(["AUTH-0", "AUTH-1", "AUTH-2", "AUTH-3", "AUTH-4"])
  if (!validGrants.has(requestedGrant)) {
    throw new Error(`Invalid authorization grant requested: ${requestedGrant}`)
  }

  const grants = validated.authorization?.grants ?? []
  if (!grants.includes(requestedGrant)) {
    throw new Error(`Authorization grant rejected: requested grant ${requestedGrant} is not in capsule authorization grants`)
  }

  if (requestedGrant === "AUTH-4") {
    if (validated.protocols["ap2-payments"] !== "mandate_verified" && validated.protocols.fio_vivo_ap2 !== "mandate_verified" && validated.protocols.dtc_ap2 !== "mandate_verified") {
      throw new Error(`Authorization grant rejected: ${requestedGrant} requires AP2 mandate verification`)
    }
  }

  if (requestedGrant === "AUTH-2" || requestedGrant === "AUTH-3") {
    if (validated.governance.human_gate !== "HUMAN_APPROVED") {
      throw new Error(`Authorization grant rejected: ${requestedGrant} requires human approval`)
    }
  }

  return { authorized: true, grant: requestedGrant, capsule: validated }
}

export const EPHEMERAL_LEASE_STORE_PATH = ".agents/.runtime/leases/active-leases.json"
export const STORE_LOCK_DIR = ".agents/.runtime/leases/store.lock"

function acquireStoreLock(timeoutMs = 5000) {
  const lockDir = path.resolve(REPO_ROOT, STORE_LOCK_DIR)
  const lockParent = path.dirname(lockDir)
  if (!existsSync(lockParent)) {
    mkdirSync(lockParent, { recursive: true })
  }
  const startTime = Date.now()
  while (true) {
    try {
      mkdirSync(lockDir)
      return true
    } catch {
      try {
        const stat = lstatSync(lockDir)
        if (Date.now() - stat.mtimeMs > 3000) {
          rmSync(lockDir, { recursive: true, force: true })
          continue
        }
      } catch {}

      if (Date.now() - startTime > timeoutMs) {
        throw new Error(`Timed out waiting for lease store lock after ${timeoutMs}ms`)
      }
      const end = Date.now() + 10
      while (Date.now() < end) {}
    }
  }
}

function releaseStoreLock() {
  const lockDir = path.resolve(REPO_ROOT, STORE_LOCK_DIR)
  if (existsSync(lockDir)) {
    try {
      rmSync(lockDir, { recursive: true, force: true })
    } catch {}
  }
}

export function withStoreLock(fn) {
  acquireStoreLock()
  try {
    return fn()
  } finally {
    releaseStoreLock()
  }
}

export function loadDurableLeasesState() {
  const storePath = path.resolve(REPO_ROOT, EPHEMERAL_LEASE_STORE_PATH)
  if (!existsSync(storePath)) return { last_fencing_token: 100, leases: new Map() }
  try {
    const raw = readFileSync(storePath, "utf-8")
    const json = JSON.parse(raw)
    const map = new Map()
    const now = Date.now()
    const lastFencingToken = json.last_fencing_token ?? 100
    if (Array.isArray(json.leases)) {
      for (const item of json.leases) {
        if (item && item.lease_id && item.status === "ACTIVE") {
          const acquiredAt = new Date(item.acquired_at).getTime()
          const ttlMs = item.ttl_ms ?? 1800000
          if (now - acquiredAt < ttlMs) {
            map.set(item.lease_id, item)
          }
        }
      }
    }
    return { last_fencing_token: lastFencingToken, leases: map }
  } catch {
    return { last_fencing_token: 100, leases: new Map() }
  }
}

export function saveDurableLeasesState({ last_fencing_token, leases }) {
  const storePath = path.resolve(REPO_ROOT, EPHEMERAL_LEASE_STORE_PATH)
  const storeDir = path.dirname(storePath)
  if (!existsSync(storeDir)) {
    mkdirSync(storeDir, { recursive: true })
  }
  const items = Array.from(leases.values())
  const jsonStr = JSON.stringify({ last_fencing_token, leases: items }, null, 2)
  const tmpPath = `${storePath}.${process.pid}.${Date.now()}.tmp`
  writeFileSync(tmpPath, jsonStr, "utf-8")
  renameSync(tmpPath, storePath)
}

export function loadDurableLeases() {
  return loadDurableLeasesState().leases
}

export function saveDurableLeases(leasesMap) {
  saveDurableLeasesState({ last_fencing_token: 100, leases: leasesMap })
}

export function acquireWriteSetLease({ capsule, owner = "canonical-worker", ownerToken = randomUUID(), ttlMs = 1800000 }) {
  return withStoreLock(() => {
    const validated = validateTaskCapsuleReferences(capsule)
    const writeSet = validated.execution.write_set
    if (!Array.isArray(writeSet) || writeSet.length === 0) {
      throw new Error("Acquire write-set lease requires non-empty write_set in Task Capsule")
    }

    const { last_fencing_token, leases } = loadDurableLeasesState()

    for (const [, lease] of leases.entries()) {
      assertWriteSetNoConflict(writeSet, lease.write_set)
    }

    const fencingToken = last_fencing_token + 1
    const leaseId = `lease-${validated.task.id}-${randomUUID()}`
    const leaseRecord = {
      lease_id: leaseId,
      task_id: validated.task.id,
      task_capsule_sha256: hashCanonicalTaskCapsule(validated),
      invocation_id: validated.execution.invocation_id,
      owner,
      owner_token: ownerToken,
      fencing_token: fencingToken,
      write_set: [...writeSet],
      status: "ACTIVE",
      acquired_at: new Date().toISOString(),
      ttl_ms: ttlMs
    }
    leases.set(leaseId, leaseRecord)
    activeLeases.set(leaseId, leaseRecord)
    saveDurableLeasesState({ last_fencing_token: fencingToken, leases })
    return leaseRecord
  })
}

export function releaseWriteSetLease(leaseId, ownerToken = null, fencingToken = null) {
  assertNonEmptyString(leaseId, "lease_id")
  return withStoreLock(() => {
    const { last_fencing_token, leases } = loadDurableLeasesState()
    if (!leases.has(leaseId) && !activeLeases.has(leaseId)) {
      return true
    }
    const lease = leases.get(leaseId) || activeLeases.get(leaseId)
    if (ownerToken && lease.owner_token && lease.owner_token !== ownerToken) {
      throw new Error(`Cannot release lease ${leaseId}: invalid owner_token`)
    }
    if (fencingToken !== null && lease.fencing_token && lease.fencing_token !== fencingToken) {
      throw new Error(`STALE_LEASE_OWNER: Cannot release lease ${leaseId} with stale fencing token ${fencingToken}`)
    }
    leases.delete(leaseId)
    activeLeases.delete(leaseId)
    saveDurableLeasesState({ last_fencing_token, leases })
    return true
  })
}

export function resetWriteSetLeases() {
  withStoreLock(() => {
    activeLeases.clear()
    const storePath = path.resolve(REPO_ROOT, EPHEMERAL_LEASE_STORE_PATH)
    if (existsSync(storePath)) {
      try {
        unlinkSync(storePath)
      } catch {}
    }
  })
}

export function hashTaskCapsule(capsule) {
  return hashCanonicalTaskCapsule(capsule)
}

export function verifyMutationPostcondition({ capsule, observedPaths }) {
  assertStringArray(observedPaths, "observedPaths")
  const validated = validateTaskCapsuleReferences(capsule)
  const authorizedSet = (validated.execution.write_set ?? []).map(toPosixPath)

  for (const obsPath of observedPaths) {
    const canonicalObs = toPosixPath(obsPath)
    let matched = false
    for (const authPath of authorizedSet) {
      if (pathsOverlap(canonicalObs, authPath)) {
        matched = true
        break
      }
    }
    if (!matched) {
      throw new Error(`WRITE_SET_ESCAPE: Observed unauthorized mutation on path: ${canonicalObs}`)
    }
  }

  return {
    status: "PASS",
    task_id: validated.task.id,
    observed_count: observedPaths.length,
    verified_at: new Date().toISOString()
  }
}

export function authorizePlatformToolCall({ capsule, leaseId, toolName, targetPath, commandLine }) {
  assertNonEmptyString(toolName, "toolName")
  const validatedCapsule = validateTaskCapsuleReferences(capsule)
  const capsuleDigest = hashCanonicalTaskCapsule(validatedCapsule)

  let requiredGrant = "AUTH-0"
  const isDirectMutation = ["write_to_file", "replace_file_content", "multi_replace_file_content", "edit"].includes(toolName)

  const hasRedirection = />>|>/i.test(commandLine || "")
  const isKnownReadOnlyCommand = toolName === "run_command" && commandLine && !hasRedirection && (
    /^(?:git\s+status|git\s+log|git\s+diff|node\s+--test|pnpm\s+run\s+lint|dir|ls|whoami|pwd|(?:echo\s+[^>]*$))/i.test(commandLine.trim())
  )

  const isKnownScm = commandLine && /(?:git\s+commit|git\s+push|git\s+merge|git\s+rebase|git\s+reset)/i.test(commandLine)
  const isKnownRelease = commandLine && /(?:deploy|release)/i.test(commandLine)
  const isKnownFinancial = commandLine && /(?:payment|purchase|buy|mandate)/i.test(commandLine)

  const isMutation = isDirectMutation || (toolName === "run_command" && !isKnownReadOnlyCommand && !isKnownScm && !isKnownRelease && !isKnownFinancial)

  if (isKnownFinancial) {
    requiredGrant = "AUTH-4"
  } else if (isKnownRelease) {
    requiredGrant = "AUTH-3"
  } else if (isKnownScm) {
    requiredGrant = "AUTH-2"
  } else if (isMutation) {
    requiredGrant = "AUTH-1"
  }

  authorizeTaskCapsule(validatedCapsule, requiredGrant)

  if (isMutation) {
    if (!leaseId) {
      throw new Error(`FIO-VIVO-AP2 Execution Blocked: Tool ${toolName} requires an active write-set lease`)
    }
    const { leases } = loadDurableLeasesState()
    const lease = leases.get(leaseId) || activeLeases.get(leaseId)
    if (!lease || lease.status !== "ACTIVE") {
      throw new Error(`FIO-VIVO-AP2 Execution Blocked: Active lease ${leaseId} not found`)
    }
    if (targetPath) {
      const canonicalTarget = toPosixPath(targetPath)
      let matched = false
      for (const leasePath of lease.write_set) {
        if (pathsOverlap(canonicalTarget, leasePath)) {
          matched = true
          break
        }
      }
      if (!matched) {
        throw new Error(`FIO-VIVO-AP2 Execution Blocked: Target path ${canonicalTarget} is not in lease write-set`)
      }
    }
  }

  return {
    status: "AUTHORIZED",
    task_id: validatedCapsule.task.id,
    task_capsule_sha256: capsuleDigest,
    tool_name: toolName,
    required_grant: requiredGrant,
    lease_id: leaseId ?? null,
    authorized_at: new Date().toISOString()
  }
}

export function exportSubprocessContext({ capsule, leaseRecord }) {
  const validated = validateTaskCapsuleReferences(capsule)
  const capsuleSha = hashCanonicalTaskCapsule(validated)
  return {
    FIO_VIVO_TASK_CAPSULE_SHA256: capsuleSha,
    FIO_VIVO_FENCING_TOKEN: String(leaseRecord?.fencing_token ?? 0),
    FIO_VIVO_LEASE_ID: String(leaseRecord?.lease_id ?? ""),
    FIO_VIVO_AUTHORIZATION_GRANTS: JSON.stringify(validated.authorization.grants),
    FIO_VIVO_WRITE_SET: JSON.stringify(validated.execution.write_set)
  }
}

export function validateSubprocessAuthority({ parentCapsule, childCapsule }) {
  const parentVal = validateTaskCapsuleReferences(parentCapsule)
  const childVal = validateTaskCapsuleReferences(childCapsule)

  const parentGrants = new Set(parentVal.authorization.grants)
  for (const grant of childVal.authorization.grants) {
    if (!parentGrants.has(grant)) {
      throw new Error(`SUBPROCESS_ELEVATION_DENIED: Child task attempted to elevate grant: ${grant}`)
    }
  }

  const parentWriteSet = (parentVal.execution.write_set ?? []).map(toPosixPath)
  for (const childPath of (childVal.execution.write_set ?? [])) {
    const canonicalChild = toPosixPath(childPath)
    let matched = false
    for (const parentPath of parentWriteSet) {
      if (pathsOverlap(canonicalChild, parentPath)) {
        matched = true
        break
      }
    }
    if (!matched) {
      throw new Error(`SUBPROCESS_ELEVATION_DENIED: Child task write-set escape beyond parent bounds: ${canonicalChild}`)
    }
  }

  return {
    status: "CONFINED",
    parent_task_id: parentVal.task.id,
    child_task_id: childVal.task.id,
    validated_at: new Date().toISOString()
  }
}

export function captureHostMutationDelta(actionFn) {
  function getGitDelta() {
    try {
      const out = execSync("git status --porcelain", { cwd: REPO_ROOT, encoding: "utf-8" })
      const lines = out.split(/\r?\n/).filter(Boolean)
      const files = []
      for (const line of lines) {
        const file = line.substring(3).trim()
        if (file) files.push(toPosixPath(file))
      }
      return files.sort()
    } catch {
      return []
    }
  }

  const beforeFiles = new Set(getGitDelta())
  const result = actionFn()
  const afterFiles = getGitDelta()

  const deltaFiles = afterFiles.filter((f) => !beforeFiles.has(f))

  return {
    result,
    observed_write_set: deltaFiles
  }
}

export function quarantineMutationEscape({ taskId, taskCapsuleSha256, unexpectedMutations, observedWriteSet }) {
  const quarantineDir = path.resolve(REPO_ROOT, ".agents/.runtime/quarantine")
  if (!existsSync(quarantineDir)) {
    mkdirSync(quarantineDir, { recursive: true })
  }
  const timestamp = Date.now()
  const quarantineRecord = {
    status: "QUARANTINED",
    task_id: taskId,
    task_capsule_sha256: taskCapsuleSha256,
    unexpected_mutations: unexpectedMutations,
    observed_write_set: observedWriteSet,
    quarantined_at: new Date().toISOString(),
    action_required: "ROLLBACK_OR_HUMAN_CLEANUP"
  }
  const filePath = path.join(quarantineDir, `quarantine-${taskId}-${timestamp}.json`)
  writeFileSync(filePath, JSON.stringify(quarantineRecord, null, 2), "utf-8")
  return quarantineRecord
}

export function verifyAndEnforceMutationPostcondition({ capsule, observedPaths }) {
  try {
    return verifyMutationPostcondition({ capsule, observedPaths })
  } catch (error) {
    const validated = validateTaskCapsuleReferences(capsule)
    const capsuleSha = hashCanonicalTaskCapsule(validated)
    const errMessage = error instanceof Error ? error.message : String(error)
    const escapedFile = errMessage.includes("WRITE_SET_ESCAPE: Observed unauthorized mutation on path:")
      ? errMessage.replace("WRITE_SET_ESCAPE: Observed unauthorized mutation on path: ", "").trim()
      : "UNKNOWN"

    const quarantineRecord = quarantineMutationEscape({
      taskId: validated.task.id,
      taskCapsuleSha256: capsuleSha,
      unexpectedMutations: [escapedFile],
      observedWriteSet: observedPaths
    })

    const escapeError = new Error(`WRITE_SET_ESCAPE: Unauthorized mutation on ${escapedFile}. Quarantine record created: ${quarantineRecord.quarantined_at}`)
    escapeError.quarantine = quarantineRecord
    throw escapeError
  }
}

export function buildCompleteReceiptChain({ capsule, toolName, requiredGrant, leaseRecord, observedWriteSet, status }) {
  const validated = validateTaskCapsuleReferences(capsule)
  const capsuleSha = hashCanonicalTaskCapsule(validated)

  return {
    "POLICY-E": {
      status: "PASS",
      task_id: validated.task.id,
      task_capsule_sha256: capsuleSha
    },
    "AUTH-E": {
      status: "PASS",
      required_grant: requiredGrant,
      active_grants: validated.authorization.grants
    },
    "LEASE-E": {
      status: leaseRecord ? "ACTIVE" : "NONE",
      lease_id: leaseRecord?.lease_id ?? null,
      fencing_token: leaseRecord?.fencing_token ?? null
    },
    "TOOL-E": {
      status: "EXECUTED",
      tool_name: toolName
    },
    "MUTATION-E": {
      status: "OBSERVED",
      observed_write_set: observedWriteSet
    },
    "POSTCONDITION-E": {
      status: status || "PASS",
      verified_at: new Date().toISOString()
    }
  }
}
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// H4 A2A Helpers â€” aligned with A2A 1.0 official protocol
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
//
// IDENTITY RULE:
//   external credential -> ExternalPrincipal  (who is asking)
//   requested skill     -> Capability Resolver -> locally selected agent
//
//   NEVER: network identity -> runtime identity
//
// BOUNDARY POLICY:
//   unsupported protocol version          -> FAIL
//   missing/malformed required field      -> FAIL
//   unsupported required extension        -> FAIL
//   unsupported content type              -> FAIL
//   untrusted optional metadata           -> NEVER PROMOTE TO AUTHORITY
//   optional unknown extension            -> DROP
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const A2A_MAX_REQUEST_SIZE = 131072
const A2A_MAX_PART_DATA_SIZE = 65536

/**
 * Validates an incoming A2A SendMessageRequest.
 *
 * This validates the OFFICIAL A2A wire object, not a custom envelope.
 * The SendMessageRequest carries a Message with Parts.
 *
 * Boundary policy:
 * - Missing/malformed required fields -> FAIL
 * - Oversized payload -> FAIL
 * - Unknown optional fields -> DROP (not rejected)
 * - Untrusted metadata -> never promoted to authority
 *
 * @param {object} sendMessageRequest - official A2A SendMessageRequest
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateA2AMessage(sendMessageRequest) {
  if (!sendMessageRequest || typeof sendMessageRequest !== "object") {
    return { valid: false, reason: "SendMessageRequest must be a non-null object" }
  }

  // Check for oversized payload
  const serialized = JSON.stringify(sendMessageRequest)
  if (serialized.length > A2A_MAX_REQUEST_SIZE) {
    return { valid: false, reason: `Request payload exceeds maximum size of ${A2A_MAX_REQUEST_SIZE} bytes` }
  }

  // Message is required in SendMessageRequest
  const message = sendMessageRequest.message
  if (!message || typeof message !== "object") {
    return { valid: false, reason: "Missing or invalid message in SendMessageRequest" }
  }

  // Parts are required in Message
  const parts = message.parts
  if (!Array.isArray(parts) || parts.length === 0) {
    return { valid: false, reason: "Message must contain at least one Part" }
  }

  // Validate each Part has recognized structure
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (!part || typeof part !== "object") {
      return { valid: false, reason: `Part[${i}] must be a non-null object` }
    }

    const hasText = part.text !== undefined
    const hasData = part.data !== undefined
    const hasFile = part.file !== undefined || part.uri !== undefined || part.url !== undefined

    if (!hasText && !hasData && !hasFile) {
      // Unknown Part type â€” drop per boundary policy (not rejected)
      continue
    }

    // Validate DataPart size
    if (hasData && part.data !== null) {
      const dataSize = JSON.stringify(part.data).length
      if (dataSize > A2A_MAX_PART_DATA_SIZE) {
        return { valid: false, reason: `Part[${i}] DataPart exceeds maximum size of ${A2A_MAX_PART_DATA_SIZE} bytes` }
      }
    }
  }

  return { valid: true }
}

/**
 * Compiles a Task Capsule from a validated A2A message.
 *
 * INVARIANTS:
 * - ExternalPrincipal identifies WHO IS ASKING (audit/scoping only)
 * - Grants, write-set, worker, and reviewer are ALL locally assigned
 * - External caller has NO input into any of these fields
 * - Grant ceiling is always AUTH-0 for external requests
 * - Write-set is always empty for external requests
 *
 * @param {object} params
 * @param {string} params.requestId
 * @param {string} params.objective
 * @param {object} params.input
 * @param {object} params.externalPrincipal - ExternalPrincipal (audit only)
 * @param {string} params.resolvedAgentId - locally selected by capability resolver
 * @param {string} params.reviewer - locally selected reviewer
 * @param {string} params.maxGrant - always "AUTH-0" for external
 * @returns {object} Task Capsule
 */
export function compileA2ATaskCapsule({
  requestId,
  objective,
  input,
  externalPrincipal,
  resolvedAgentId,
  reviewer = "canonical-reviewer",
  maxGrant = "AUTH-0",
}) {
  assertNonEmptyString(requestId, "requestId")
  assertNonEmptyString(objective, "objective")
  assertNonEmptyString(resolvedAgentId, "resolvedAgentId")
  assertNonEmptyString(reviewer, "reviewer")

  // Enforce grant ceiling: external agents NEVER get mutation authority
  const grantCeiling = ["AUTH-0"]

  return {
    schema_version: 1,
    kind: "a2a-task-capsule",
    task_id: requestId,
    source: "a2a_gateway",

    // Locally resolved â€” external caller had no input
    worker: resolvedAgentId,
    reviewer,

    // ExternalPrincipal â€” audit reference only, never a local identity
    external_principal: {
      principal_id: externalPrincipal?.principal_id || "unknown",
      auth_method: externalPrincipal?.auth_method || "apiKey",
    },

    // Authorization â€” always locally assigned, never externally selected
    authorization: {
      grants: grantCeiling,
      may_select_auth: false,
      may_select_write_set: false,
      may_select_reviewer: false,
      may_select_local_agent: false,
    },

    execution: {
      write_set: [],
      read_set: [],
      tools_allowed: ["read"],
    },

    objective,
    input: input || {},
    timestamp: new Date().toISOString(),
  }
}

export function failCli(error) {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`ERROR: ${message}\n`)
  process.exitCode = 1
}
