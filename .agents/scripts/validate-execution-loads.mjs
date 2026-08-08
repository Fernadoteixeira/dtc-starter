import { pathToFileURL } from "node:url"
import {
  PHASE_FILENAMES,
  assertEvidenceInputPath,
  assertNode20,
  createReceipt,
  failCli,
  hashFile,
  parseArguments,
  readJson,
  validateRouteBundle
} from "./canonical-execution-lib.mjs"
import { validateLoadBundle } from "./validate-execution-evidence.mjs"

export function validateExecutionLoads({ routePath, loadBundlePath, evidenceDir }) {
  assertNode20()
  const canonicalRoutePath = assertEvidenceInputPath(
    routePath,
    evidenceDir,
    [PHASE_FILENAMES.workerRoute, PHASE_FILENAMES.reviewerRoute]
  )
  const route = readJson(canonicalRoutePath, canonicalRoutePath)
  const routeValidation = validateRouteBundle(route)
  const reviewer = route.shortcut === "review:canonical"
  const expectedRouteName = reviewer ? PHASE_FILENAMES.reviewerRoute : PHASE_FILENAMES.workerRoute
  if (canonicalRoutePath.split("/").at(-1) !== expectedRouteName) {
    throw new Error(`Route shortcut and phase filename do not match: expected ${expectedRouteName}`)
  }
  const expectedLoadName = reviewer ? PHASE_FILENAMES.reviewerLoads : PHASE_FILENAMES.workerLoads
  const canonicalLoadPath = assertEvidenceInputPath(loadBundlePath, evidenceDir, [expectedLoadName])
  const loadBundle = readJson(canonicalLoadPath, canonicalLoadPath)
  if (loadBundle.route_path !== canonicalRoutePath) {
    throw new Error("Load bundle route_path must exactly match the preflight route path")
  }
  validateLoadBundle(loadBundle, routeValidation.bundle, { evidenceDir })
  return {
    schema_version: 1,
    kind: "canonical-execution-load-validation",
    ...createReceipt("LOAD-VALIDATION-E", "VALIDATED"),
    task_id: route.task_id,
    shortcut: route.shortcut,
    route_path: canonicalRoutePath,
    route_sha256: hashFile(canonicalRoutePath),
    load_bundle_path: canonicalLoadPath,
    load_bundle_sha256: hashFile(canonicalLoadPath),
    trust_level: "structural_integrity_only",
    platform_attestation_verified: false
  }
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArguments(argv, {
    "--route": { required: true },
    "--load-bundle": { required: true },
    "--evidence-dir": { required: true }
  })
  const receipt = validateExecutionLoads({
    routePath: args["--route"],
    loadBundlePath: args["--load-bundle"],
    evidenceDir: args["--evidence-dir"]
  })
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`)
  return receipt
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  try {
    main()
  } catch (error) {
    failCli(error)
  }
}
