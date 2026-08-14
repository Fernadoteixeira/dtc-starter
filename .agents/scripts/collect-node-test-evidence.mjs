import { spawnSync } from "node:child_process"
import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  discoverTrackedTests,
  hashDiscoverySubject,
  REPO_ROOT,
} from "./generate-test-manifest.mjs"

const SCRIPT_PATH = fileURLToPath(import.meta.url)
const OUTPUT_PATH = path.join(
  REPO_ROOT,
  ".agents",
  "artifacts",
  "test-execution-node.json",
)

export function parseTapSummary(output) {
  const fields = {}
  for (const key of ["tests", "pass", "fail", "cancelled", "skipped", "todo"]) {
    const matches = [...output.matchAll(new RegExp(`^# ${key} (\\d+)$`, "gm"))]
    if (matches.length > 0) {
      fields[key] = Number(matches.at(-1)[1])
    }
  }
  if (!Number.isInteger(fields.tests) || !Number.isInteger(fields.pass)) {
    throw new Error("TAP summary is missing tests or pass totals")
  }
  return {
    discovered_test_cases: fields.tests,
    executed_test_cases: fields.tests,
    passed_test_cases: fields.pass,
    failed_test_cases: fields.fail ?? 0,
    cancelled_test_cases: fields.cancelled ?? 0,
    skipped_test_cases: fields.skipped ?? 0,
    todo_test_cases: fields.todo ?? 0,
  }
}

export function collectNodeTestEvidence({
  repoRoot = REPO_ROOT,
  generatedAt = new Date().toISOString(),
  execute = true,
} = {}) {
  const allTests = discoverTrackedTests({ repoRoot })
  const nodeTests = allTests.filter((test) => test.runner === "node:test")
  if (nodeTests.length === 0) {
    throw new Error("No tracked node:test files were discovered")
  }

  const args = [
    "--test",
    "--test-reporter=tap",
    ...nodeTests.map((test) => path.join(repoRoot, ...test.path.split("/"))),
  ]
  const result = execute
    ? spawnSync(process.execPath, args, {
        cwd: repoRoot,
        encoding: "utf8",
        windowsHide: true,
      })
    : { status: 0, stdout: "", stderr: "" }
  const combinedOutput = `${result.stdout ?? ""}${result.stderr ?? ""}`
  const summary = execute
    ? parseTapSummary(combinedOutput)
    : {
        discovered_test_cases: null,
        executed_test_cases: null,
        passed_test_cases: null,
        failed_test_cases: null,
        cancelled_test_cases: null,
        skipped_test_cases: null,
        todo_test_cases: null,
      }
  const status =
    result.status === 0 && summary.failed_test_cases === 0 ? "PASS" : "FAIL"

  return {
    kind: "canonical-test-execution-report",
    version: "1.0.0",
    generated_at: generatedAt,
    issue_reference: "#51",
    status,
    discovery_subject_sha256: hashDiscoverySubject(allTests),
    runner: {
      name: "node:test",
      executable: process.execPath,
      node_version: process.version,
      arguments: ["--test", "--test-reporter=tap", "<discovered-node-test-files>"],
    },
    scope: {
      suite_ids: [...new Set(nodeTests.map((test) => test.suite))].sort(),
      discovered_files: nodeTests.length,
      files: nodeTests.map(({ path: filePath, sha256 }) => ({
        path: filePath,
        sha256,
      })),
    },
    summary,
    exit_code: result.status,
    output_digest_only: true,
  }
}

export function writeNodeTestEvidence(report, outputPath = OUTPUT_PATH) {
  mkdirSync(path.dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8")
  return outputPath
}

function main() {
  const report = collectNodeTestEvidence()
  writeNodeTestEvidence(report)
  console.log(`[${report.status}] Node test evidence written to ${OUTPUT_PATH}`)
  console.log(
    `  Executed/Passed: ${report.summary.executed_test_cases}/${report.summary.passed_test_cases}`,
  )
  console.log(`  Subject: ${report.discovery_subject_sha256}`)
  if (report.status !== "PASS") process.exitCode = 1
}

if (path.resolve(process.argv[1] ?? "") === SCRIPT_PATH) {
  main()
}
