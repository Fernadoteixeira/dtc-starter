import assert from "node:assert/strict"
import test from "node:test"

import { summarizeJestReport } from "../collect-jest-test-evidence.mjs"

test("summarizes runner-native Jest JSON", () => {
  assert.deepEqual(
    summarizeJestReport({
      numTotalTests: 12,
      numPassedTests: 11,
      numFailedTests: 1,
      numPendingTests: 0,
      numTodoTests: 0,
      numTotalTestSuites: 2,
      numPassedTestSuites: 1,
      numFailedTestSuites: 1,
    }),
    {
      discovered_test_cases: 12,
      executed_test_cases: 12,
      passed_test_cases: 11,
      failed_test_cases: 1,
      pending_test_cases: 0,
      todo_test_cases: 0,
      test_suites_total: 2,
      test_suites_passed: 1,
      test_suites_failed: 1,
    },
  )
})

test("rejects incomplete Jest JSON", () => {
  assert.throws(
    () => summarizeJestReport({ numTotalTests: 1 }),
    /missing integer numPassedTests/,
  )
})
