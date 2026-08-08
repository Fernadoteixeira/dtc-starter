import { createHash, randomUUID } from "node:crypto"
import { existsSync, lstatSync, readFileSync, realpathSync, renameSync, unlinkSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

export const ROUTE_KIND = "canonical-agent-route"
export const LOAD_KIND = "canonical-execution-load-bundle"
export const REGISTRY_PATH = ".agents/canonical-agent-shortcuts.yaml"
export const AGENT_ROOT = ".agents/ollama-superpowers-pack-v1.0.0/agents"
export const SKILL_ROOT = ".agents/ollama-superpowers-pack-v1.0.0/skills"
export const ORCHESTRATION_MANIFEST_PATH = ".agents/product-lifecycle-canonical-skills-315/manifest/orchestrations.json"
export const ORCHESTRATION_ROOT = ".agents/product-lifecycle-canonical-skills-315"
export const NOS_MANIFEST_PATH = ".agents/nos-gallery-canonical-skills-205/manifest/skills.json"
export const NOS_ROOT = ".agents/nos-gallery-canonical-skills-205"

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
    throw new Error(`${label} must be a UUID`)
  }
  return value
}

export function assertIsoTimestamp(value, label) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
    throw new Error(`${label} must be an ISO-8601 UTC timestamp`)
  }
  if (Number.isNaN(Date.parse(value))) {
    throw new Error(`${label} is not a valid timestamp`)
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

function assertPhysicalConfinement(absolutePath, repoPath) {
  const relative = path.relative(REPO_ROOT, absolutePath)
  if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
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
    const physicalParent = realpathSync(parentPath)
    assertPhysicalConfinement(physicalParent, repoPath)
  }

  return absolutePath
}

export function canonicalRepoPath(repoPath, options = {}) {
  const absolutePath = resolveRepoPath(repoPath, options)
  return toPosixPath(path.relative(REPO_ROOT, absolutePath))
}

export function hashFile(repoPath) {
  const absolutePath = resolveRepoPath(repoPath)
  return createHash("sha256").update(readFileSync(absolutePath)).digest("hex")
}

export function readUtf8(repoPath) {
  return readFileSync(resolveRepoPath(repoPath), "utf8")
}

export function readJson(repoPath, label = repoPath) {
  let value
  try {
    value = JSON.parse(readUtf8(repoPath))
  } catch (error) {
    throw new Error(`Invalid JSON in ${label}: ${error.message}`)
  }
  return value
}

export function writeJson(repoPath, value) {
  const canonicalPath = canonicalRepoPath(repoPath, { mustExist: false })
  const absolutePath = resolveRepoPath(canonicalPath, { mustExist: false })
  const temporaryPath = `${absolutePath}.${randomUUID()}.tmp`
  const serialized = `${JSON.stringify(value, null, 2)}\n`
  try {
    writeFileSync(temporaryPath, serialized, { encoding: "utf8", flag: "wx" })
    renameSync(temporaryPath, absolutePath)
  } catch (error) {
    if (existsSync(temporaryPath)) {
      unlinkSync(temporaryPath)
    }
    throw error
  }
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
  if (value === "true") {
    return true
  }
  if (value === "false") {
    return false
  }
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
  if (body.length === 0) {
    return []
  }
  return body.split(",").map((item) => parseYamlScalar(item, lineNumber))
}

export function parseShortcutRegistry(source) {
  if (typeof source !== "string") {
    throw new Error("Registry source must be a string")
  }
  if (source.includes("\t")) {
    throw new Error("Tabs are not allowed in the shortcut registry")
  }
  const lines = source.replace(/^\uFEFF/, "").split(/\r?\n/)
  const shortcutsLine = lines.findIndex((line) => line === "shortcuts:")
  if (shortcutsLine === -1) {
    throw new Error("Registry is missing the top-level shortcuts: section")
  }
  if (lines.findIndex((line, index) => index !== shortcutsLine && line === "shortcuts:") !== -1) {
    throw new Error("Registry contains more than one shortcuts: section")
  }

  const shortcuts = {}
  let currentShortcut = null
  let pendingList = null

  for (let index = shortcutsLine + 1; index < lines.length; index += 1) {
    const line = lines[index]
    const lineNumber = index + 1
    if (line.trim().length === 0) {
      continue
    }
    if (/^[^ ]/.test(line)) {
      break
    }

    const shortcutMatch = /^  ([A-Za-z0-9]+(?::[A-Za-z0-9]+)*):$/.exec(line)
    if (shortcutMatch) {
      currentShortcut = shortcutMatch[1]
      if (Object.hasOwn(shortcuts, currentShortcut)) {
        throw new Error(`Duplicate shortcut at line ${lineNumber}: ${currentShortcut}`)
      }
      shortcuts[currentShortcut] = {}
      pendingList = null
      continue
    }

    if (!currentShortcut) {
      throw new Error(`Shortcut property appears before a shortcut at line ${lineNumber}`)
    }

    const propertyMatch = /^    ([a-z][a-z0-9_]*):(.*)$/.exec(line)
    if (propertyMatch) {
      const [, field, rawValue] = propertyMatch
      if (!ARRAY_FIELDS.has(field) && !SCALAR_FIELDS.has(field)) {
        throw new Error(`Unsupported shortcut property at line ${lineNumber}: ${field}`)
      }
      if (Object.hasOwn(shortcuts[currentShortcut], field)) {
        throw new Error(`Duplicate property at line ${lineNumber}: ${field}`)
      }
      const value = rawValue.trim()
      if (value.length === 0) {
        if (!ARRAY_FIELDS.has(field)) {
          throw new Error(`Only array properties may use block lists at line ${lineNumber}`)
        }
        shortcuts[currentShortcut][field] = []
        pendingList = field
      } else {
        const parsed = value.startsWith("[") ? parseInlineArray(value, lineNumber) : parseYamlScalar(value, lineNumber)
        if (ARRAY_FIELDS.has(field) !== Array.isArray(parsed)) {
          throw new Error(`Invalid value type for ${field} at line ${lineNumber}`)
        }
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

  if (Object.keys(shortcuts).length === 0) {
    throw new Error("Registry shortcuts: section is empty")
  }
  for (const [shortcut, entry] of Object.entries(shortcuts)) {
    assertNonEmptyString(entry.canonical_agent, `shortcuts.${shortcut}.canonical_agent`)
    if (entry.writer !== undefined && typeof entry.writer !== "boolean") {
      throw new Error(`shortcuts.${shortcut}.writer must be a boolean`)
    }
    for (const field of ARRAY_FIELDS) {
      if (entry[field] !== undefined) {
        assertStringArray(entry[field], `shortcuts.${shortcut}.${field}`)
      }
    }
  }
  return shortcuts
}

export function loadRegistry() {
  const source = readUtf8(REGISTRY_PATH)
  return {
    path: REGISTRY_PATH,
    sha256: hashFile(REGISTRY_PATH),
    shortcuts: parseShortcutRegistry(source)
  }
}

export function normalizeShortcut(value) {
  const shortcut = assertNonEmptyString(value, "shortcut").replace(/^@/, "")
  if (!/^[A-Za-z0-9]+(?::[A-Za-z0-9]+)*$/.test(shortcut)) {
    throw new Error(`Invalid shortcut: ${value}`)
  }
  return shortcut
}

export function resolveShortcut(shortcutValue, registry = loadRegistry()) {
  const shortcut = normalizeShortcut(shortcutValue)
  const entry = registry.shortcuts[shortcut]
  if (!entry) {
    throw new Error(`Unknown canonical agent shortcut: ${shortcut}`)
  }
  const contracts = entry.contracts ?? []
  const contractPaths = {}
  for (const contract of contracts) {
    const contractPath = CONTRACT_PATHS[contract]
    if (!contractPath) {
      throw new Error(`Unknown contract in shortcut ${shortcut}: ${contract}`)
    }
    canonicalRepoPath(contractPath)
    contractPaths[contract] = contractPath
  }
  const specialistAgents = entry.specialist_agents ?? []
  for (const specialistPath of specialistAgents) {
    canonicalRepoPath(specialistPath)
  }
  const externalSkills = entry.external_skills ?? []
  for (const externalPath of externalSkills) {
    canonicalRepoPath(externalPath)
  }
  return {
    shortcut,
    canonical_agent: entry.canonical_agent,
    core_skills: [...(entry.core_skills ?? [])],
    external_skills: [...externalSkills],
    orchestrations: [...(entry.orchestrations ?? [])],
    contracts: [...contracts],
    contract_paths: contractPaths,
    specialist_agents: [...specialistAgents],
    nos_domains: [...(entry.nos_domains ?? [])],
    mode: entry.mode ?? null,
    writer: entry.writer ?? false
  }
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
  if (matches.length !== 1) {
    throw new Error(`${type} must appear exactly once`)
  }
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
  const registry = loadRegistry()
  const resolved = resolveShortcut(bundle.shortcut, registry)
  const scalarFields = ["shortcut", "canonical_agent", "mode", "writer"]
  for (const field of scalarFields) {
    if (bundle[field] !== resolved[field]) {
      throw new Error(`Route field does not match the registry: ${field}`)
    }
  }
  const arrayFields = ["core_skills", "external_skills", "orchestrations", "contracts", "specialist_agents", "nos_domains"]
  for (const field of arrayFields) {
    if (!equalStringArrays(bundle[field], resolved[field])) {
      throw new Error(`Route field does not match the registry: ${field}`)
    }
  }
  if (JSON.stringify(bundle.contract_paths) !== JSON.stringify(resolved.contract_paths)) {
    throw new Error("Route contract_paths do not match the registry")
  }

  const routeReceipt = findReceipt(bundle, "ROUTE-E")
  const agentReceipt = findReceipt(bundle, "AGENT-LOAD-E")
  for (const [receipt, label] of [[routeReceipt, "ROUTE-E"], [agentReceipt, "AGENT-LOAD-E"]]) {
    assertUuid(receipt.receipt_id, `${label}.receipt_id`)
    assertUuid(receipt.invocation_id, `${label}.invocation_id`)
    assertIsoTimestamp(receipt.timestamp, `${label}.timestamp`)
    if (receipt.invocation_id !== bundle.invocation_id || receipt.status !== "LOADED") {
      throw new Error(`${label} has an invalid invocation_id or status`)
    }
  }
  if (routeReceipt.task_id !== bundle.task_id || routeReceipt.shortcut !== bundle.shortcut) {
    throw new Error("ROUTE-E does not identify its route")
  }
  if (routeReceipt.path !== REGISTRY_PATH || routeReceipt.sha256 !== registry.sha256) {
    throw new Error("ROUTE-E registry path or hash is stale")
  }
  assertSha256(routeReceipt.sha256, "ROUTE-E.sha256")
  if (hashFile(routeReceipt.path) !== routeReceipt.sha256) {
    throw new Error("ROUTE-E registry hash mismatch")
  }

  const agentPath = `${AGENT_ROOT}/${resolved.canonical_agent}/agent.json`
  if (agentReceipt.agent_id !== resolved.canonical_agent || agentReceipt.path !== agentPath) {
    throw new Error("AGENT-LOAD-E does not identify the canonical agent definition")
  }
  assertSha256(agentReceipt.sha256, "AGENT-LOAD-E.sha256")
  if (hashFile(agentReceipt.path) !== agentReceipt.sha256) {
    throw new Error("AGENT-LOAD-E agent definition hash mismatch")
  }
  const agentDefinition = assertObject(readJson(agentPath, agentPath), "agent definition")
  if (agentDefinition.id !== resolved.canonical_agent) {
    throw new Error("Canonical agent definition id mismatch")
  }
  return { bundle, resolved, registry, routeReceipt, agentReceipt }
}

export function validateReceiptFileHash(receipt, label) {
  const value = assertObject(receipt, label)
  assertNonEmptyString(value.path, `${label}.path`)
  assertSha256(value.sha256, `${label}.sha256`)
  const canonicalPath = canonicalRepoPath(value.path)
  if (value.path !== canonicalPath) {
    throw new Error(`${label}.path must be canonical: ${canonicalPath}`)
  }
  const actualHash = hashFile(value.path)
  if (actualHash !== value.sha256) {
    throw new Error(`${label} hash mismatch for ${value.path}`)
  }
  return value
}

export function failCli(error) {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`ERROR: ${message}\n`)
  process.exitCode = 1
}
