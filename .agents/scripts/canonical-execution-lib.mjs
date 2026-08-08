import { createHash, randomUUID } from "node:crypto"
import { existsSync, lstatSync, readFileSync, realpathSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

export const ROUTE_KIND = "canonical-agent-route"
export const LOAD_KIND = "canonical-execution-load-bundle"
export const REGISTRY_PATH = ".agents/canonical-agent-shortcuts.yaml"
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

export function failCli(error) {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`ERROR: ${message}\n`)
  process.exitCode = 1
}
