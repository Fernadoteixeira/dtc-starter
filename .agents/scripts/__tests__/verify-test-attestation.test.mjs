import assert from "node:assert/strict"
import test from "node:test"

import { verifyTestAttestation } from "../verify-test-attestation.mjs"

function validFixture() {
  const subject = "b".repeat(64)
  const expectedSha = "a".repeat(40)
  const suiteGroups = [
    ["agent-node-test", "repository-node-test"],
    ["backend-unit"],
    ["backend-integration-http"],
    ["storefront-unit"],
    ["playwright-e2e"],
  ]
  const reports = suiteGroups.map((suiteIds, index) => ({
    kind: "canonical-test-execution-report",
    version: "1.0.0",
    status: "PASS",
    exit_code: 0,
    discovery_subject_sha256: subject,
    scope: { suite_ids: suiteIds },
    summary: { executed_test_cases: index + 1, passed_test_cases: index + 1 },
  }))
  const passed = reports.reduce((sum, report) => sum + report.summary.passed_test_cases, 0)
  return {
    expectedSha,
    reports,
    manifest: {
      kind: "canonical-test-discovery-manifest",
      version: "2.0.0",
      source: {
        git_sha: expectedSha,
        checkout_clean_before_execution: true,
        discovery_subject_sha256: subject,
        remote_context: { sha: expectedSha },
      },
      summary: {
        local_execution_complete: true,
        suite_count: 6,
        executed_suite_count: 6,
        executed_test_cases: passed,
        passed_test_cases: passed,
      },
      execution_reports: reports.map(() => ({ accepted: true })),
    },
  }
}

test("accepts a complete remote attestation bound to one SHA and subject", () => {
  const fixture = validFixture()
  const result = verifyTestAttestation(fixture)
  assert.equal(result.pass, true)
  assert.deepEqual(result.findings, [])
  assert.equal(result.verified.suite_count, 6)
})

test("rejects SHA drift, stale reports and incomplete suite coverage", () => {
  const fixture = validFixture()
  fixture.manifest.source.git_sha = "c".repeat(40)
  fixture.reports[0].discovery_subject_sha256 = "d".repeat(64)
  fixture.reports[4].scope.suite_ids = []

  const result = verifyTestAttestation(fixture)
  assert.equal(result.pass, false)
  assert.ok(result.findings.some((finding) => finding.code === "SHA_MISMATCH"))
  assert.ok(result.findings.some((finding) => finding.code === "REPORT_SUBJECT_MISMATCH"))
  assert.ok(result.findings.some((finding) => finding.code === "INCOMPLETE_SUITE_EVIDENCE"))
})
