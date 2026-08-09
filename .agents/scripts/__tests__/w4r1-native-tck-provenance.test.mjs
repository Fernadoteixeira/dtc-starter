/**
 * w4r1-native-tck-provenance.test.mjs
 *
 * W4R.1 Native Evidence Provenance Verification
 *
 * Verifies that native TCK outputs under .agents/scripts/__tests__/W4-E/TCK-E/native/
 * conform to native tool schema invariants:
 *   1. compatibility.json contains native schema keys (summary, per_requirement, per_transport)
 *   2. junitreport.xml testcase count matches tests attribute
 *   3. manifest.yaml explicitly attributes native provenance
 */

import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

const TCK_E_DIR = path.resolve(process.cwd(), ".agents/scripts/__tests__/W4-E/TCK-E")
const NATIVE_DIR = path.join(TCK_E_DIR, "native")

test("W4R.1: native/compatibility.json exists and satisfies native JSONFormatter schema", () => {
  const jsonPath = path.join(NATIVE_DIR, "compatibility.json")
  assert.ok(fs.existsSync(jsonPath), "native/compatibility.json must exist")
  const content = fs.readFileSync(jsonPath, "utf8")
  assert.ok(content.length > 0, "native/compatibility.json must be non-empty")

  const data = JSON.parse(content)
  assert.ok(data.summary, "native compatibility.json must contain summary object")
  assert.ok(data.summary.timestamp, "summary must contain timestamp")
  assert.ok(data.summary.sut_url, "summary must contain sut_url")
  assert.ok(data.summary.spec_version, "summary must contain spec_version")
  assert.ok(data.per_requirement, "native compatibility.json must contain per_requirement object")
  assert.ok(data.per_transport, "native compatibility.json must contain per_transport object")
})

test("W4R.1: native/junitreport.xml exists and testcase count matches declared tests attribute", () => {
  const xmlPath = path.join(NATIVE_DIR, "junitreport.xml")
  assert.ok(fs.existsSync(xmlPath), "native/junitreport.xml must exist")
  const content = fs.readFileSync(xmlPath, "utf8")
  assert.ok(content.length > 0, "native/junitreport.xml must be non-empty")

  const testCountMatch = content.match(/tests="(\d+)"/)
  assert.ok(testCountMatch, "junitreport.xml must declare tests attribute")
  const declaredTests = parseInt(testCountMatch[1], 10)

  const testcaseMatches = content.match(/<testcase\b/g) || []
  assert.equal(
    testcaseMatches.length,
    declaredTests,
    `Declared tests (${declaredTests}) must equal actual <testcase> count (${testcaseMatches.length})`
  )
})

test("W4R.1: TCK-E/manifest.yaml assigns NATIVE_A2A_TCK_OUTPUT provenance to native files", () => {
  const manifestPath = path.join(TCK_E_DIR, "manifest.yaml")
  assert.ok(fs.existsSync(manifestPath), "manifest.yaml must exist")
  const content = fs.readFileSync(manifestPath, "utf8")

  assert.match(content, /provenance_rule:\s*"RAW TOOL OUTPUT != FIO-VIVO SUMMARY"/i)
  assert.match(content, /provenance:\s*NATIVE_A2A_TCK_OUTPUT/i)
  assert.match(content, /transformed:\s*false/i)
})
