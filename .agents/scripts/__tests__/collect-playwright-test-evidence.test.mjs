import assert from "node:assert/strict"
import test from "node:test"

import { summarizePlaywrightReport } from "../collect-playwright-test-evidence.mjs"

test("summarizes runner-native Playwright JSON", () => {
  assert.deepEqual(
    summarizePlaywrightReport({
      stats: {
        expected: 14,
        unexpected: 1,
        flaky: 2,
        skipped: 3,
        duration: 1250,
      },
    }),
    {
      discovered_test_cases: 20,
      executed_test_cases: 17,
      passed_test_cases: 16,
      failed_test_cases: 1,
      flaky_test_cases: 2,
      skipped_test_cases: 3,
      duration_ms: 1250,
    },
  )
})

test("rejects incomplete Playwright JSON", () => {
  assert.throws(
    () => summarizePlaywrightReport({ stats: { expected: 1 } }),
    /missing integer stats.unexpected/,
  )
})
