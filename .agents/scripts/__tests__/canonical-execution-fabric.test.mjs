import assert from "node:assert/strict"
import { mkdtempSync, rmSync } from "node:fs"
import path from "node:path"
import { after, test } from "node:test"
import {
  PHASE_FILENAMES,
  REPO_ROOT,
  assertExternalSkillPath,
  hashCanonicalValue,
  parseShortcutRegistry,
  resolveEvidenceOutputPath,
  validateRouteBundle,
  writeJsonExclusive
} from "../canonical-execution-lib.mjs"
import { buildRouteBundle } from "../resolve-agent-shortcut.mjs"
import {
  validateAgentRunSchema,
  validateReviewerRoutePolicy
} from "../validate-execution-evidence.mjs"

const temporaryDirectory = mkdtempSync(path.join(REPO_ROOT, ".agents", "scripts", "__tests__", "evidence-"))
const temporaryRepoPath = path.relative(REPO_ROOT, temporaryDirectory).split(path.sep).join("/")

after(() => {
  rmSync(temporaryDirectory, { recursive: true, force: true })
})

test("canonical helpers accept stable JSON and strict shortcut YAML", () => {
  assert.equal(hashCanonicalValue({ beta: 2, alpha: 1 }), hashCanonicalValue({ alpha: 1, beta: 2 }))
  const shortcuts = parseShortcutRegistry([
    "shortcuts:",
    "  review:canonical:",
    "    canonical_agent: code-reviewer",
    "    core_skills: [code-review]",
    "    mode: read_only",
    "next_section:",
    "  ignored: true"
  ].join("\n"))
  assert.deepEqual(shortcuts["review:canonical"].core_skills, ["code-review"])
})

test("reviewer route policy accepts the canonical reviewer route", () => {
  const route = buildRouteBundle({ shortcut: "review:canonical", taskId: "TEST-001:review" })
  const validation = validateRouteBundle(route)
  assert.equal(validateReviewerRoutePolicy(validation, "TEST-001"), "TEST-001:review")
})

test("evidence output rejects traversal outside its physical directory", () => {
  const traversal = `${temporaryRepoPath}/../${PHASE_FILENAMES.workerRoute}`
  assert.throws(
    () => resolveEvidenceOutputPath(traversal, temporaryRepoPath, [PHASE_FILENAMES.workerRoute]),
    /outside the evidence directory/
  )
})

test("evidence output uses exclusive no-replace writes", () => {
  const output = `${temporaryRepoPath}/${PHASE_FILENAMES.workerRoute}`
  const resolved = resolveEvidenceOutputPath(output, temporaryRepoPath, [PHASE_FILENAMES.workerRoute])
  writeJsonExclusive(resolved, { status: "first" })
  assert.throws(
    () => resolveEvidenceOutputPath(output, temporaryRepoPath, [PHASE_FILENAMES.workerRoute]),
    /already exists/
  )
  assert.throws(() => writeJsonExclusive(resolved, { status: "second" }))
})

test("external skill policy rejects a contract disguised as a skill", () => {
  assert.throws(
    () => assertExternalSkillPath(".agents/contracts/session-state-ledger.md"),
    /outside \.agents\/skills/
  )
})

test("reviewer policy rejects a different read-only reviewer shortcut", () => {
  const route = buildRouteBundle({ shortcut: "css:validate", taskId: "TEST-002:review" })
  const validation = validateRouteBundle(route)
  assert.throws(
    () => validateReviewerRoutePolicy(validation, "TEST-002"),
    /exactly review:canonical/
  )
})

test("strict AGENT-RUN schema rejects a fake receipt with missing fields", () => {
  assert.throws(
    () => validateAgentRunSchema({ type: "AGENT-RUN" }),
    /must contain exactly/
  )
})
