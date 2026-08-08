import { randomUUID } from "node:crypto"
import { pathToFileURL } from "node:url"
import {
  LOAD_KIND,
  NOS_MANIFEST_PATH,
  NOS_ROOT,
  ORCHESTRATION_MANIFEST_PATH,
  ORCHESTRATION_ROOT,
  SKILL_ROOT,
  assertNode20,
  assertObject,
  assertSha256,
  canonicalRepoPath,
  createReceipt,
  failCli,
  hashFile,
  parseArguments,
  readJson,
  validateRouteBundle,
  writeJson
} from "./canonical-execution-lib.mjs"

function uniqueBy(items, selector, label) {
  const seen = new Set()
  for (const item of items) {
    const key = selector(item)
    if (seen.has(key)) {
      throw new Error(`Duplicate ${label}: ${key}`)
    }
    seen.add(key)
  }
  return items
}

function parseNosSkills(values = []) {
  const skills = []
  for (const value of values) {
    for (const candidate of value.split(",")) {
      const skillId = candidate.trim()
      if (!/^SK-\d{3}$/.test(skillId)) {
        throw new Error(`NOS skill must use exact SK-nnn form: ${candidate}`)
      }
      skills.push(skillId)
    }
  }
  return uniqueBy(skills, (value) => value, "NOS skill")
}

function loadManifest(path, label) {
  const manifest = readJson(path, label)
  if (!Array.isArray(manifest)) {
    throw new Error(`${label} must be a JSON array`)
  }
  return uniqueBy(manifest.map((entry, index) => assertObject(entry, `${label}[${index}]`)), (entry) => entry.id ?? entry.capability_id, `${label} id`)
}

function baseLoadReceipt(type, invocationId, taskId) {
  return {
    ...createReceipt(type, "LOADED", invocationId),
    task_id: taskId,
    instructions_acknowledged: false
  }
}

export function buildLoadBundle({ routePath, nosSkills = [] }) {
  assertNode20()
  const canonicalRoutePath = canonicalRepoPath(routePath)
  const routeBundle = readJson(canonicalRoutePath, canonicalRoutePath)
  const { resolved } = validateRouteBundle(routeBundle)
  const invocationId = randomUUID()
  const receipts = []

  for (const skillId of resolved.core_skills) {
    const skillPath = `${SKILL_ROOT}/${skillId}/skill.json`
    const definition = assertObject(readJson(skillPath, skillPath), `core skill ${skillId}`)
    if (definition.id !== skillId) {
      throw new Error(`Core skill definition id mismatch: ${skillId}`)
    }
    receipts.push({
      ...baseLoadReceipt("SKILL-LOAD-E", invocationId, routeBundle.task_id),
      source: "core",
      skill_id: skillId,
      path: skillPath,
      sha256: hashFile(skillPath)
    })
  }

  for (const externalPath of resolved.external_skills) {
    const canonicalPath = canonicalRepoPath(externalPath)
    receipts.push({
      ...baseLoadReceipt("SKILL-LOAD-E", invocationId, routeBundle.task_id),
      source: "external",
      skill_id: canonicalPath,
      path: canonicalPath,
      sha256: hashFile(canonicalPath)
    })
  }

  const orchestrationManifest = loadManifest(ORCHESTRATION_MANIFEST_PATH, "orchestration manifest")
  const orchestrationManifestHash = hashFile(ORCHESTRATION_MANIFEST_PATH)
  for (const orchestrationId of resolved.orchestrations) {
    const matches = orchestrationManifest.filter((entry) => entry.id === orchestrationId)
    if (matches.length !== 1) {
      throw new Error(`Orchestration id is not unique in the manifest: ${orchestrationId}`)
    }
    const entry = matches[0]
    if (typeof entry.path !== "string") {
      throw new Error(`Orchestration manifest path is invalid: ${orchestrationId}`)
    }
    assertSha256(entry.sha256, `orchestration ${orchestrationId} manifest hash`)
    const orchestrationPath = canonicalRepoPath(`${ORCHESTRATION_ROOT}/${entry.path}`)
    const actualHash = hashFile(orchestrationPath)
    if (actualHash !== entry.sha256) {
      throw new Error(`Orchestration manifest hash mismatch: ${orchestrationId}`)
    }
    receipts.push({
      ...baseLoadReceipt("ORCHESTRATION-LOAD-E", invocationId, routeBundle.task_id),
      orchestration_id: orchestrationId,
      path: orchestrationPath,
      sha256: actualHash,
      manifest_path: ORCHESTRATION_MANIFEST_PATH,
      manifest_sha256: orchestrationManifestHash
    })
  }

  for (const contractId of resolved.contracts) {
    const contractPath = canonicalRepoPath(resolved.contract_paths[contractId])
    receipts.push({
      ...baseLoadReceipt("CONTRACT-LOAD-E", invocationId, routeBundle.task_id),
      contract_id: contractId,
      path: contractPath,
      sha256: hashFile(contractPath)
    })
  }

  const requestedNosSkills = parseNosSkills(nosSkills)
  if (requestedNosSkills.length > 0 && resolved.nos_domains.length === 0) {
    throw new Error(`Shortcut ${resolved.shortcut} does not permit NOS skills`)
  }
  const nosManifest = loadManifest(NOS_MANIFEST_PATH, "NOS skill manifest")
  const nosManifestHash = hashFile(NOS_MANIFEST_PATH)
  for (const skillId of requestedNosSkills) {
    const matches = nosManifest.filter((entry) => entry.capability_id === skillId)
    if (matches.length !== 1) {
      throw new Error(`NOS skill id is not unique in the manifest: ${skillId}`)
    }
    const entry = matches[0]
    if (!resolved.nos_domains.includes(entry.domain)) {
      throw new Error(`NOS skill ${skillId} belongs to forbidden domain ${entry.domain}`)
    }
    if (typeof entry.path !== "string") {
      throw new Error(`NOS skill manifest path is invalid: ${skillId}`)
    }
    assertSha256(entry.sha256, `NOS skill ${skillId} manifest hash`)
    const skillPath = canonicalRepoPath(`${NOS_ROOT}/${entry.path}`)
    const actualHash = hashFile(skillPath)
    if (actualHash !== entry.sha256) {
      throw new Error(`NOS skill manifest hash mismatch: ${skillId}`)
    }
    receipts.push({
      ...baseLoadReceipt("SKILL-LOAD-E", invocationId, routeBundle.task_id),
      source: "nos",
      skill_id: skillId,
      domain: entry.domain,
      path: skillPath,
      sha256: actualHash,
      manifest_path: NOS_MANIFEST_PATH,
      manifest_sha256: nosManifestHash
    })
  }

  return {
    schema_version: 1,
    kind: LOAD_KIND,
    status: "LOADED",
    invocation_id: invocationId,
    task_id: routeBundle.task_id,
    route_path: canonicalRoutePath,
    route_sha256: hashFile(canonicalRoutePath),
    route: routeBundle,
    instructions_acknowledged: false,
    receipts
  }
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArguments(argv, {
    "--route": { required: true },
    "--output": { required: true },
    "--nos-skill": { repeatable: true }
  })
  const bundle = buildLoadBundle({
    routePath: args["--route"],
    nosSkills: args["--nos-skill"] ?? []
  })
  const outputPath = canonicalRepoPath(args["--output"], { mustExist: false })
  const serialized = writeJson(outputPath, bundle)
  process.stdout.write(serialized)
  return bundle
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  try {
    main()
  } catch (error) {
    failCli(error)
  }
}
