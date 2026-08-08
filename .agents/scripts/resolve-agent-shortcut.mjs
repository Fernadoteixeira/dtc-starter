import { randomUUID } from "node:crypto"
import { pathToFileURL } from "node:url"
import {
  AGENT_ROOT,
  PHASE_FILENAMES,
  ROUTE_KIND,
  assertNode20,
  assertNonEmptyString,
  canonicalRepoPath,
  createReceipt,
  failCli,
  hashFile,
  loadRegistry,
  parseArguments,
  readJson,
  resolveEvidenceOutputPath,
  resolveShortcut,
  writeJsonExclusive
} from "./canonical-execution-lib.mjs"

export function buildRouteBundle({ shortcut: shortcutValue, taskId }) {
  assertNode20()
  assertNonEmptyString(taskId, "task id")
  const registry = loadRegistry()
  const route = resolveShortcut(shortcutValue, registry)
  const invocationId = randomUUID()
  const agentPath = `${AGENT_ROOT}/${route.canonical_agent}/agent.json`
  canonicalRepoPath(agentPath)
  const agentDefinition = readJson(agentPath, agentPath)
  if (!agentDefinition || typeof agentDefinition !== "object" || Array.isArray(agentDefinition)) {
    throw new Error(`Agent definition must be an object: ${agentPath}`)
  }
  if (agentDefinition.id !== route.canonical_agent) {
    throw new Error(`Agent definition id mismatch: expected ${route.canonical_agent}`)
  }
  const routeReceipt = {
    ...createReceipt("ROUTE-E", "LOADED", invocationId),
    task_id: taskId,
    shortcut: route.shortcut,
    path: registry.path,
    sha256: registry.sha256
  }
  const agentReceipt = {
    ...createReceipt("AGENT-LOAD-E", "LOADED", invocationId),
    task_id: taskId,
    agent_id: route.canonical_agent,
    path: agentPath,
    sha256: hashFile(agentPath)
  }
  return {
    schema_version: 1,
    kind: ROUTE_KIND,
    status: "LOADED",
    invocation_id: invocationId,
    task_id: taskId,
    ...route,
    receipts: [routeReceipt, agentReceipt]
  }
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArguments(argv, {
    "--shortcut": { required: true },
    "--task-id": { required: true },
    "--evidence-dir": { required: true },
    "--output": { required: true }
  })
  const bundle = buildRouteBundle({ shortcut: args["--shortcut"], taskId: args["--task-id"] })
  const allowedName = bundle.shortcut === "review:canonical" ? PHASE_FILENAMES.reviewerRoute : PHASE_FILENAMES.workerRoute
  const outputPath = resolveEvidenceOutputPath(args["--output"], args["--evidence-dir"], [allowedName])
  const serialized = writeJsonExclusive(outputPath, bundle)
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
