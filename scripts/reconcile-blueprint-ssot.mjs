import { execSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const REPO_ROOT = process.cwd()
const SSOT_PATH = path.join(REPO_ROOT, "docs", "artifacts", "bb-nos", "BLUEPRINT-MATERIALIZATION-SSOT.json")

function getGitHead() {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf-8" }).trim()
  } catch {
    return "UNKNOWN"
  }
}

function getGitBranch() {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8" }).trim()
  } catch {
    return "main"
  }
}

function getCommitDrift(recordedHead, currentHead) {
  if (!recordedHead || recordedHead === "UNKNOWN" || currentHead === "UNKNOWN" || recordedHead === currentHead) {
    return 0
  }
  try {
    const countStr = execSync(`git rev-list --count ${recordedHead}..${currentHead}`, { encoding: "utf-8" }).trim()
    return parseInt(countStr, 10) || 0
  } catch {
    return 0
  }
}

function reconcileSSOT() {
  if (!existsSync(SSOT_PATH)) {
    console.error(`[ERROR] SSOT file not found at ${SSOT_PATH}`)
    process.exit(1)
  }

  const currentHead = getGitHead()
  const currentBranch = getGitBranch()
  const ssot = JSON.parse(readFileSync(SSOT_PATH, "utf-8"))

  const recordedHead = ssot.observed_head?.recorded_program_state_head || ssot.observed_head?.commit_sha
  const driftCount = getCommitDrift(recordedHead, currentHead)

  ssot.observed_head = {
    commit_sha: currentHead,
    branch: currentBranch,
    recorded_program_state_head: recordedHead,
    head_drift_commit_count: driftCount,
    drift_status: driftCount > 0 ? "GOVERNANCE_DRIFT_OBSERVED" : "IN_SYNC"
  }

  ssot.audit_timestamp = new Date().toISOString()

  let totalPhysicalScore = 0
  let layerCount = 0

  if (Array.isArray(ssot.layers)) {
    layerCount = ssot.layers.length
    for (const layer of ssot.layers) {
      if (Array.isArray(layer.paths) && layer.paths.length > 0) {
        let existingPaths = 0
        for (const relPath of layer.paths) {
          const fullPath = path.join(REPO_ROOT, relPath)
          if (existsSync(fullPath)) {
            existingPaths += 1
          }
        }
        const pathRatio = existingPaths / layer.paths.length
        // Calculate dynamic physical materialization percentage adjusted by path existence
        const calculatedPhysical = Math.round(pathRatio * (layer.planned_pct || 100))
        layer.physical_pct = Math.min(layer.physical_pct || calculatedPhysical, calculatedPhysical)
      }
      totalPhysicalScore += (layer.physical_pct || 0)
    }
  }

  const avgPhysical = layerCount > 0 ? Math.round((totalPhysicalScore / layerCount) * 10) / 10 : 64.0
  ssot.summary_metrics.physical_materialization_pct = avgPhysical

  writeFileSync(SSOT_PATH, JSON.stringify(ssot, null, 2) + "\n", "utf-8")
  console.log(`[SUCCESS] Reconciled SSOT at ${SSOT_PATH}`)
  console.log(`  HEAD: ${currentHead}`)
  console.log(`  Drift Count: ${driftCount} commits from recorded baseline`)
  console.log(`  Physical Materialization Score: ${avgPhysical}%`)
}

reconcileSSOT()
