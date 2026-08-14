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
  "test-execution-playwright-e2e.json",
)

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

export function summarizePlaywrightReport(report) {
  const stats = report?.stats
  for (const key of ["expected", "unexpected", "flaky", "skipped"]) {
    if (!Number.isInteger(stats?.[key])) {
      throw new Error(`Playwright report is missing integer stats.${key}`)
    }
  }
  const executed = stats.expected + stats.unexpected + stats.flaky
  return {
    discovered_test_cases: executed + stats.skipped,
    executed_test_cases: executed,
    passed_test_cases: stats.expected + stats.flaky,
    failed_test_cases: stats.unexpected,
    flaky_test_cases: stats.flaky,
    skipped_test_cases: stats.skipped,
    duration_ms: Number.isFinite(stats.duration) ? stats.duration : null,
  }
}

export function collectPlaywrightTestEvidence({
  repoRoot = REPO_ROOT,
  generatedAt = new Date().toISOString(),
} = {}) {
  const allTests = discoverTrackedTests({ repoRoot })
  const suiteId = "playwright-e2e"
  const suiteTests = allTests.filter((test) => test.suite === suiteId)
  if (suiteTests.length === 0) throw new Error("No Playwright tests discovered")

  const result = spawnPnpm(
    ["exec", "playwright", "test", "--reporter=json"],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        CI: "1",
        DATABASE_URL:
          "postgresql://postgres:postgrespassword@localhost:5432/postgres",
        JWT_SECRET: "integration-test-secret",
        COOKIE_SECRET: "integration-test-secret",
        STORE_CORS: "http://localhost:8000",
        ADMIN_CORS: "http://localhost:9000",
        AUTH_CORS: "http://localhost:9000",
        NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: "pk_test_dummy",
      },
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 20 * 1024 * 1024,
    },
  )
  if (result.error) {
    throw new Error(`Unable to start Playwright: ${result.error.message}`)
  }

  let parsedReport
  try {
    parsedReport = JSON.parse(result.stdout)
  } catch (error) {
    const detail = String(result.stderr ?? "").trim().slice(-4000)
    throw new Error(
      `Playwright did not produce valid JSON: ${error.message}${detail ? `; ${detail}` : ""}`,
    )
  }
  const summary = summarizePlaywrightReport(parsedReport)
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
      name: "playwright",
      executable: process.platform === "win32" ? "pnpm.cmd" : "pnpm",
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

export function writePlaywrightTestEvidence(report, outputPath = OUTPUT_PATH) {
  mkdirSync(path.dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8")
  return outputPath
}

function main() {
  const report = collectPlaywrightTestEvidence()
  writePlaywrightTestEvidence(report)
  console.log(`[${report.status}] Playwright evidence written to ${OUTPUT_PATH}`)
  console.log(
    `  Executed/Passed: ${report.summary.executed_test_cases}/${report.summary.passed_test_cases}`,
  )
  if (report.status !== "PASS") process.exitCode = 1
}

if (path.resolve(process.argv[1] ?? "") === SCRIPT_PATH) {
  main()
}
