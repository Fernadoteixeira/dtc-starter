import assert from "node:assert/strict"
import test from "node:test"

import { parseTapSummary } from "../collect-node-test-evidence.mjs"

test("parses the final machine-readable TAP totals", () => {
  const summary = parseTapSummary(`# tests 215
# suites 0
# pass 215
# fail 0
# cancelled 0
# skipped 0
# todo 0
`)

  assert.deepEqual(summary, {
    discovered_test_cases: 215,
    executed_test_cases: 215,
    passed_test_cases: 215,
    failed_test_cases: 0,
    cancelled_test_cases: 0,
    skipped_test_cases: 0,
    todo_test_cases: 0,
  })
})

test("rejects output without authoritative TAP totals", () => {
  assert.throws(
    () => parseTapSummary("ok 1 - a test passed\n"),
    /missing tests or pass totals/,
  )
})
