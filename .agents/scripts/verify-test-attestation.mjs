import { createHash, randomUUID } from "node:crypto"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const SCRIPT_PATH = fileURLToPath(import.meta.url)

function sha256(content) {
  return createHash("sha256").update(content).digest("hex")
}

function readJson(filePath) {
  if (!existsSync(filePath)) throw new Error(`Missing artifact: ${filePath}`)
  return JSON.parse(readFileSync(filePath, "utf8"))
}

export function verifyTestAttestation({ manifest, reports, expectedSha }) {
  const findings = []
  const fail = (code, message) => findings.push({ level: "FAIL", code, message })

  if (manifest?.kind !== "canonical-test-discovery-manifest") {
    fail("INVALID_MANIFEST_KIND", "Discovery manifest kind is invalid")
  }
  if (manifest?.version !== "2.0.0") {
    fail("INVALID_MANIFEST_VERSION", "Discovery manifest version is invalid")
  }
  if (manifest?.source?.git_sha !== expectedSha) {
    fail("SHA_MISMATCH", "Manifest SHA does not match the frozen review SHA")
  }
  if (manifest?.source?.remote_context?.sha !== expectedSha) {
    fail("REMOTE_SHA_MISMATCH", "GitHub Actions SHA does not match the frozen review SHA")
  }
  if (manifest?.source?.checkout_clean_before_execution !== true) {
    fail("CHECKOUT_NOT_PROVEN_CLEAN", "Clean checkout precondition is absent")
  }
  if (manifest?.summary?.local_execution_complete !== true) {
    fail("LOCAL_EXECUTION_INCOMPLETE", "Not every canonical suite was executed")
  }
  if (manifest?.summary?.suite_count !== 6 || manifest?.summary?.executed_suite_count !== 6) {
    fail("SUITE_COUNT_MISMATCH", "Expected six discovered and executed suites")
  }
  if (
    !Number.isInteger(manifest?.summary?.executed_test_cases) ||
    manifest.summary.executed_test_cases <= 0 ||
    manifest.summary.executed_test_cases !== manifest.summary.passed_test_cases
  ) {
    fail("TEST_COUNT_MISMATCH", "Executed and passed test counts must be equal and positive")
  }
  if (!Array.isArray(manifest?.execution_reports) || manifest.execution_reports.length !== 5) {
    fail("REPORT_COUNT_MISMATCH", "Expected five execution reports")
  }
  if (manifest?.execution_reports?.some((entry) => entry.accepted !== true)) {
    fail("UNACCEPTED_REPORT", "Every manifest execution report must be accepted")
  }

  const subject = manifest?.source?.discovery_subject_sha256
  const suiteIds = new Set()
  let reportPassedTotal = 0
  for (const report of reports) {
    if (report?.kind !== "canonical-test-execution-report" || report?.version !== "1.0.0") {
      fail("INVALID_REPORT_SCHEMA", "Execution report schema is invalid")
      continue
    }
    if (report.status !== "PASS" || report.exit_code !== 0) {
      fail("REPORT_NOT_PASS", "Execution report is not a successful run")
    }
    if (report.discovery_subject_sha256 !== subject) {
      fail("REPORT_SUBJECT_MISMATCH", "Execution report subject does not match the manifest")
    }
    if (report.summary?.executed_test_cases !== report.summary?.passed_test_cases) {
      fail("REPORT_COUNT_MISMATCH", "Execution report contains non-passing tests")
    }
    reportPassedTotal += report.summary?.passed_test_cases ?? 0
    for (const suiteId of report.scope?.suite_ids ?? []) {
      if (suiteIds.has(suiteId)) {
        fail("DUPLICATE_SUITE_EVIDENCE", `Suite ${suiteId} appears in multiple reports`)
      }
      suiteIds.add(suiteId)
    }
  }
  if (suiteIds.size !== 6) {
    fail("INCOMPLETE_SUITE_EVIDENCE", "Reports do not cover all six canonical suites")
  }
  if (reportPassedTotal !== manifest?.summary?.passed_test_cases) {
    fail("AGGREGATE_COUNT_MISMATCH", "Report totals do not equal the manifest total")
  }

  return {
    pass: findings.length === 0,
    findings,
    verified: {
      git_sha: expectedSha,
      discovery_subject_sha256: subject,
      suite_count: suiteIds.size,
      passed_test_cases: reportPassedTotal,
      report_count: reports.length,
    },
  }
}

export function buildReviewReceipt({ verification, manifestPath, reportPaths }) {
  return {
    kind: "canonical-test-review-e",
    version: "1.0.0",
    receipt_id: randomUUID(),
    invocation_id: process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_RUN_ID}:${process.env.GITHUB_JOB}:${process.env.GITHUB_RUN_ATTEMPT}`
      : randomUUID(),
    generated_at: new Date().toISOString(),
    reviewer: {
      provider: process.env.GITHUB_ACTIONS === "true" ? "github-actions" : "local",
      job: process.env.GITHUB_JOB ?? "local-review",
      run_id: process.env.GITHUB_RUN_ID ?? null,
      run_attempt: process.env.GITHUB_RUN_ATTEMPT ?? null,
    },
    verdict: verification.pass ? "PASS" : "FAIL",
    verification,
    evidence: {
      manifest: { path: manifestPath, sha256: sha256(readFileSync(manifestPath)) },
      reports: reportPaths.map((reportPath) => ({
        path: reportPath,
        sha256: sha256(readFileSync(reportPath)),
      })),
    },
  }
}

function main() {
  const artifactDir = path.resolve(process.argv[2] ?? ".agents/artifacts")
  const expectedSha = process.argv[3] ?? process.env.GITHUB_SHA
  const outputPath = path.resolve(process.argv[4] ?? path.join(artifactDir, "test-review-e.json"))
  if (!expectedSha) {
    console.error(`Usage: node ${SCRIPT_PATH} <artifact-dir> <expected-sha> [output]`)
    process.exitCode = 2
    return
  }
  const manifestPath = path.join(artifactDir, "test-discovery-manifest.json")
  const reportPaths = [
    "test-execution-node.json",
    "test-execution-backend-unit.json",
    "test-execution-backend-integration-http.json",
    "test-execution-storefront-unit.json",
    "test-execution-playwright-e2e.json",
  ].map((name) => path.join(artifactDir, name))
  const manifest = readJson(manifestPath)
  const reports = reportPaths.map(readJson)
  const verification = verifyTestAttestation({ manifest, reports, expectedSha })
  const receipt = buildReviewReceipt({ verification, manifestPath, reportPaths })
  writeFileSync(outputPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8")
  console.log(`[${receipt.verdict}] REVIEW-E written to ${outputPath}`)
  if (!verification.pass) {
    for (const finding of verification.findings) {
      console.error(`  ${finding.code}: ${finding.message}`)
    }
    process.exitCode = 1
  }
}

if (path.resolve(process.argv[1] ?? "") === SCRIPT_PATH) {
  main()
}
