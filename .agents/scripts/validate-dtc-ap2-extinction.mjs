import { readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, "../..")

function scanDirectory(dir, filterFn, outList = []) {
  try {
    const entries = readdirSync(dir)
    for (const entry of entries) {
      if (entry === "node_modules" || entry === ".git" || entry === ".next" || entry === "dist") continue
      const fullPath = path.join(dir, entry)
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        scanDirectory(fullPath, filterFn, outList)
      } else if (stat.isFile() && filterFn(fullPath)) {
        outList.push(fullPath)
      }
    }
  } catch {
    // Ignore unreadable dirs
  }
  return outList
}

export function auditDtcAp2Extinction() {
  const result = {
    persisted_legacy_capsules: 0,
    legacy_fixtures: 0,
    legacy_consumers: 0,
    legacy_consumer_paths: [],
    removal_eligible: false
  }

  // 1. Scan runtime persisted capsules for dtc_ap2 references
  const runtimeDir = path.join(REPO_ROOT, ".agents/.runtime")
  const runtimeFiles = scanDirectory(runtimeDir, (f) => f.endsWith(".json") || f.endsWith(".yaml"))
  for (const file of runtimeFiles) {
    const content = readFileSync(file, "utf8")
    if (content.includes("dtc_ap2") || content.includes("dtc-ap2")) {
      result.persisted_legacy_capsules += 1
    }
  }

  // 2. Scan test fixtures for legacy dtc_ap2 test data
  const testFiles = scanDirectory(path.join(REPO_ROOT, ".agents"), (f) => f.includes("fixture") || f.includes("__tests__"))
  for (const file of testFiles) {
    if (file.endsWith(".mjs") || file.endsWith(".json") || file.endsWith(".yaml")) {
      const content = readFileSync(file, "utf8")
      if (file.includes("validate-dtc-ap2-extinction")) continue
      if (content.includes("dtc_ap2") || content.includes("dtc-ap2")) {
        result.legacy_fixtures += 1
      }
    }
  }

  // 3. Scan code files for active consumers emitting/using dtc_ap2
  const codeFiles = scanDirectory(REPO_ROOT, (f) => f.endsWith(".mjs") || f.endsWith(".js") || f.endsWith(".ts"))
  for (const file of codeFiles) {
    if (file.includes("validate-dtc-ap2-extinction") || file.includes("node_modules")) continue
    const content = readFileSync(file, "utf8")
    if (content.includes("dtc_ap2") || content.includes("dtc-ap2")) {
      result.legacy_consumers += 1
      result.legacy_consumer_paths.push(path.relative(REPO_ROOT, file).replaceAll("\\", "/"))
    }
  }

  result.removal_eligible =
    result.persisted_legacy_capsules === 0 &&
    result.legacy_fixtures === 0 &&
    result.legacy_consumers === 0

  return result
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  const audit = auditDtcAp2Extinction()
  console.log(JSON.stringify(audit, null, 2))
}
