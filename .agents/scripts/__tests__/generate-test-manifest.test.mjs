import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import test from "node:test"

import {
  buildTestManifest,
  discoverTrackedTests,
  hashDiscoverySubject,
  validateExecutionReport,
} from "../generate-test-manifest.mjs"

function fixtureRepo() {
  const repoRoot = mkdtempSync(path.join(tmpdir(), "test-manifest-"))
  const files = {
    ".agents/scripts/__tests__/fabric.test.mjs":
      'test("one", () => {})\ntest.skip("two", () => {})\n',
    "scripts/validator.test.mjs": 'it("validates", () => {})\n',
    "apps/backend/src/example/__tests__/service.unit.spec.ts":
      'describe("service", () => { test("works", () => {}) })\n',
    "apps/backend/integration-tests/http/health.spec.ts":
      'it("responds", () => {})\n',
    "apps/storefront/src/example/__tests__/view.unit.spec.js":
      'test("renders", () => {})\n',
    "e2e/storefront/checkout.spec.ts": 'test("checks out", async () => {})\n',
    ".agents/scripts/__tests__/generated/evidence.json": "{}\n",
    "docs/example.test.mjs": 'test("not canonical", () => {})\n',
  }

  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = path.join(repoRoot, ...relativePath.split("/"))
    mkdirSync(path.dirname(absolutePath), { recursive: true })
    writeFileSync(absolutePath, content)
  }

  return { repoRoot, trackedFiles: Object.keys(files) }
}

test("discovers only files covered by explicit canonical suite rules", () => {
  const fixture = fixtureRepo()
  const discovered = discoverTrackedTests(fixture)

  assert.deepEqual(
    discovered.map((entry) => entry.path),
    [
      ".agents/scripts/__tests__/fabric.test.mjs",
      "apps/backend/integration-tests/http/health.spec.ts",
      "apps/backend/src/example/__tests__/service.unit.spec.ts",
      "apps/storefront/src/example/__tests__/view.unit.spec.js",
      "e2e/storefront/checkout.spec.ts",
      "scripts/validator.test.mjs",
    ],
  )
  assert.equal(discovered.reduce((sum, entry) => sum + entry.static_test_declarations, 0), 7)
})

test("keeps runtime counts null instead of copying static or historical counts", () => {
  const fixture = fixtureRepo()
  const manifest = buildTestManifest({
    ...fixture,
    generatedAt: "2026-08-14T00:00:00.000Z",
    gitSha: "a".repeat(40),
    dirty: false,
  })

  assert.equal(manifest.version, "2.0.0")
  assert.equal(manifest.summary.discovered_test_files, 6)
  assert.equal(manifest.summary.static_test_declarations, 7)
  assert.equal(manifest.summary.discovered_test_cases, null)
  assert.equal(manifest.summary.executed_test_cases, null)
  assert.equal(manifest.summary.passed_test_cases, null)
  assert.equal(manifest.summary.remotely_reproducible, false)
  assert.equal(
    manifest.reconciliation_verdict,
    "DISCOVERY_COMPLETE_EXECUTION_AND_REMOTE_REVIEW_PENDING",
  )
  assert.ok(
    manifest.suites.every(
      (suite) => suite.execution.status === "NOT_EXECUTED_BY_DISCOVERY",
    ),
  )
})

test("records source identity and deterministic file hashes", () => {
  const fixture = fixtureRepo()
  const manifest = buildTestManifest({
    ...fixture,
    gitSha: "b".repeat(40),
    dirty: true,
  })

  assert.equal(manifest.source.git_sha, "b".repeat(40))
  assert.equal(manifest.source.worktree_dirty, true)
  assert.match(manifest.discovered_files[0].sha256, /^[a-f0-9]{64}$/)
  assert.ok(manifest.configuration.every((entry) => entry.present === false))
})

test("discovery subject changes when a test file hash changes", () => {
  const fixture = fixtureRepo()
  const before = discoverTrackedTests(fixture)
  const targetPath = path.join(
    fixture.repoRoot,
    ".agents",
    "scripts",
    "__tests__",
    "fabric.test.mjs",
  )
  writeFileSync(targetPath, 'test("changed", () => {})\n')
  const after = discoverTrackedTests(fixture)

  assert.notEqual(hashDiscoverySubject(before), hashDiscoverySubject(after))
})

test("rejects stale and malformed execution reports", () => {
  const validReport = {
    kind: "canonical-test-execution-report",
    version: "1.0.0",
    status: "PASS",
    discovery_subject_sha256: "a".repeat(64),
    scope: { suite_ids: ["agent-node-test"] },
    summary: {
      executed_test_cases: 10,
      passed_test_cases: 10,
    },
  }

  assert.deepEqual(validateExecutionReport(validReport, "a".repeat(64)), {
    accepted: true,
    reason: "SUBJECT_MATCHED",
  })
  assert.deepEqual(validateExecutionReport(validReport, "b".repeat(64)), {
    accepted: false,
    reason: "STALE_SUBJECT",
  })
  assert.deepEqual(
    validateExecutionReport(
      {
        ...validReport,
        summary: { executed_test_cases: 10, passed_test_cases: 9 },
      },
      "a".repeat(64),
    ),
    { accepted: false, reason: "INVALID_REPORT" },
  )
  assert.deepEqual(
    validateExecutionReport(
      { ...validReport, scope: { suite_ids: ["unknown-suite"] } },
      "a".repeat(64),
    ),
    { accepted: false, reason: "INVALID_REPORT" },
  )
})
