import { spawnSync } from "node:child_process"
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  discoverTrackedTests,
  hashDiscoverySubject,
  REPO_ROOT,
} from "./generate-test-manifest.mjs"

const SCRIPT_PATH = fileURLToPath(import.meta.url)
const SUITES = Object.freeze({
  "backend-unit": {
    cwd: "apps/backend",
    env: { TEST_TYPE: "unit", NODE_OPTIONS: "--experimental-vm-modules" },
    args: ["exec", "jest", "--silent", "--runInBand", "--forceExit"],
  },
  "backend-integration-http": {
    cwd: "apps/backend",
    env: {
      TEST_TYPE: "integration:http",
      NODE_OPTIONS: "--experimental-vm-modules",
      DATABASE_URL:
        "postgresql://postgres:postgrespassword@localhost:5432/postgres",
      JWT_SECRET: "integration-test-secret",
      COOKIE_SECRET: "integration-test-secret",
      STORE_CORS: "http://localhost:8000",
      ADMIN_CORS: "http://localhost:9000",
      AUTH_CORS: "http://localhost:9000",
    },
    args: ["exec", "jest", "--silent=false", "--runInBand", "--forceExit"],
  },
  "storefront-unit": {
    cwd: "apps/storefront",
    env: {},
    args: ["exec", "jest", "--config", "jest.config.js", "--runInBand"],
  },
})

function pnpmExecutable() {
  return process.platform === "win32" ? "pnpm.cmd" : "pnpm"
}

function spawnPnpm(args, options) {
  if (process.platform !== "win32") {
    return spawnSync("pnpm", args, options)
  }
  return spawnSync(
    process.env.ComSpec ?? "cmd.exe",
    ["/d", "/c", "pnpm.cmd", ...args],
    options,
  )
}

export function summarizeJestReport(report) {
  for (const key of ["numTotalTests", "numPassedTests", "numFailedTests"]) {
    if (!Number.isInteger(report?.[key])) {
      throw new Error(`Jest report is missing integer ${key}`)
    }
  }
  return {
    discovered_test_cases: report.numTotalTests,
    executed_test_cases: report.numTotalTests,
    passed_test_cases: report.numPassedTests,
    failed_test_cases: report.numFailedTests,
    pending_test_cases: Number.isInteger(report.numPendingTests)
      ? report.numPendingTests
      : 0,
    todo_test_cases: Number.isInteger(report.numTodoTests)
      ? report.numTodoTests
      : 0,
    test_suites_total: report.numTotalTestSuites ?? null,
    test_suites_passed: report.numPassedTestSuites ?? null,
    test_suites_failed: report.numFailedTestSuites ?? null,
  }
}

export function collectJestTestEvidence(
  suiteId,
  { repoRoot = REPO_ROOT, generatedAt = new Date().toISOString() } = {},
) {
  const suite = SUITES[suiteId]
  if (!suite) throw new Error(`Unsupported Jest suite: ${suiteId}`)
  const allTests = discoverTrackedTests({ repoRoot })
  const suiteTests = allTests.filter((test) => test.suite === suiteId)
  if (suiteTests.length === 0) throw new Error(`No tests discovered for ${suiteId}`)

  const tempReportPath = path.join(
    repoRoot,
    ".agents",
    "artifacts",
    `.jest-${suiteId}-${process.pid}.json`,
  )
  mkdirSync(path.dirname(tempReportPath), { recursive: true })
  const result = spawnPnpm(
    [
      "--dir",
      path.join(repoRoot, suite.cwd),
      ...suite.args,
      "--json",
      "--outputFile",
      tempReportPath,
    ],
    {
      cwd: repoRoot,
      env: { ...process.env, ...suite.env },
      encoding: "utf8",
      windowsHide: true,
    },
  )

  if (result.error) {
    rmSync(tempReportPath, { force: true })
    throw new Error(`Unable to start Jest for ${suiteId}: ${result.error.message}`)
  }
  if (!existsSync(tempReportPath)) {
    const detail = `${result.stderr ?? ""}${result.stdout ?? ""}`.trim()
    throw new Error(
      `Jest did not produce a JSON report for ${suiteId}${detail ? `: ${detail}` : ""}`,
    )
  }

  let parsedReport
  try {
    parsedReport = JSON.parse(readFileSync(tempReportPath, "utf8"))
  } finally {
    rmSync(tempReportPath, { force: true })
  }
  const summary = summarizeJestReport(parsedReport)
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
      name: "jest",
      executable: pnpmExecutable(),
      node_version: process.version,
      suite_id: suiteId,
    },
    scope: {
      suite_ids: [suiteId],
      discovered_files: suiteTests.length,
      files: suiteTests.map(({ path: filePath, sha256 }) => ({
        path: filePath,
        sha256,
      })),
    },
    summary,
    exit_code: result.status,
    output_digest_only: true,
  }
}

export function writeJestTestEvidence(report, outputPath) {
  mkdirSync(path.dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8")
  return outputPath
}

function main() {
  const suiteId = process.argv[2]
  if (!SUITES[suiteId]) {
    console.error(`Usage: node ${SCRIPT_PATH} <${Object.keys(SUITES).join("|")}>`)
    process.exitCode = 2
    return
  }
  const report = collectJestTestEvidence(suiteId)
  const outputPath = path.join(
    REPO_ROOT,
    ".agents",
    "artifacts",
    `test-execution-${suiteId}.json`,
  )
  writeJestTestEvidence(report, outputPath)
  console.log(`[${report.status}] Jest evidence written to ${outputPath}`)
  console.log(
    `  Executed/Passed: ${report.summary.executed_test_cases}/${report.summary.passed_test_cases}`,
  )
  if (report.status !== "PASS") process.exitCode = 1
}

if (path.resolve(process.argv[1] ?? "") === SCRIPT_PATH) {
  main()
}
