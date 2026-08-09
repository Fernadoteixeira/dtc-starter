import assert from "node:assert/strict"
import { test, beforeEach } from "node:test"
import {
  REGISTRY_PATH,
  acquireWriteSetLease,
  authorizeTaskCapsule,
  compileTaskCapsule,
  hashTaskCapsule,
  releaseWriteSetLease,
  resetWriteSetLeases,
  validateTaskCapsule,
  validateTaskCapsuleReferences
} from "../canonical-execution-lib.mjs"
import { buildRouteBundle } from "../resolve-agent-shortcut.mjs"

beforeEach(() => {
  resetWriteSetLeases()
})

test("dtc-agentic-fabric: validateTaskCapsuleReferences resolves known agents from agent registry", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-001" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Certification test 001",
    writeSet: ["apps/storefront/src/modules/home/gallery-hero/medusa-adapter.ts"]
  })
  const validated = validateTaskCapsuleReferences(capsule)
  assert.equal(validated.agent.worker, "implementation-engineer")
  assert.equal(validated.agent.reviewer, "canonical-reviewer")
})

test("dtc-agentic-fabric: rejects unknown worker agent reference", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-002" })
  const capsule = compileTaskCapsule({ routeBundle: route, objective: "Testing unknown worker" })
  capsule.agent.worker = "fake-unknown-worker"
  assert.throws(() => validateTaskCapsuleReferences(capsule), /references unknown worker agent: fake-unknown-worker/)
})

test("dtc-agentic-fabric: rejects unknown reviewer agent reference", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-003" })
  const capsule = compileTaskCapsule({ routeBundle: route, objective: "Testing unknown reviewer" })
  capsule.agent.reviewer = "fake-unknown-reviewer"
  assert.throws(() => validateTaskCapsuleReferences(capsule), /references unknown reviewer agent: fake-unknown-reviewer/)
})

test("dtc-agentic-fabric: rejects non-existent authority source ref", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-004" })
  const capsule = compileTaskCapsule({ routeBundle: route, objective: "Testing fake source ref" })
  capsule.authority.source_refs = [".agents/fake-non-existent-source-ref.json"]
  assert.throws(() => validateTaskCapsuleReferences(capsule), /references non-existent authority source ref/)
})

test("dtc-agentic-fabric: authorizeTaskCapsule grants AUTH-0 and AUTH-1 for valid capsules", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-005" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Testing auth tier 1",
    writeSet: ["apps/storefront/src/lib/config.ts"]
  })
  const res0 = authorizeTaskCapsule(capsule, "AUTH-0")
  assert.equal(res0.authorized, true)
  assert.equal(res0.tier, "AUTH-0")

  const res1 = authorizeTaskCapsule(capsule, "AUTH-1")
  assert.equal(res1.authorized, true)
  assert.equal(res1.tier, "AUTH-1")
})

test("dtc-agentic-fabric: authorizeTaskCapsule rejects AUTH-4 financial escalation without AP2 mandate", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-006" })
  const capsule = compileTaskCapsule({ routeBundle: route, objective: "Testing auth tier 4" })
  assert.throws(() => authorizeTaskCapsule(capsule, "AUTH-4"), /Authorization tier escalation rejected: AUTH-4 requires AP2 mandate verification/)
})

test("dtc-agentic-fabric: authorizeTaskCapsule rejects AUTH-2/3 without human approval", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-007" })
  const capsule = compileTaskCapsule({ routeBundle: route, objective: "Testing auth tier 2" })
  assert.throws(() => authorizeTaskCapsule(capsule, "AUTH-2"), /requires human approval/)

  capsule.governance.human_gate = "HUMAN_APPROVED"
  const res2 = authorizeTaskCapsule(capsule, "AUTH-2")
  assert.equal(res2.authorized, true)
})

test("dtc-agentic-fabric: acquireWriteSetLease grants active lease for disjoint paths", () => {
  const routeA = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-008A" })
  const capsuleA = compileTaskCapsule({
    routeBundle: routeA,
    objective: "Lane A execution",
    writeSet: ["apps/storefront/src/modules/home/hero.tsx"]
  })
  const routeB = buildRouteBundle({ shortcut: "impl:nos", taskId: "CERT-008B" })
  const capsuleB = compileTaskCapsule({
    routeBundle: routeB,
    objective: "Lane B execution",
    writeSet: ["apps/storefront/src/styles/theme.css"]
  })

  const leaseA = acquireWriteSetLease({ capsule: capsuleA, owner: "lane-A-worker" })
  assert.equal(leaseA.status, "ACTIVE")
  assert.equal(leaseA.task_id, "CERT-008A")

  const leaseB = acquireWriteSetLease({ capsule: capsuleB, owner: "lane-B-worker" })
  assert.equal(leaseB.status, "ACTIVE")
  assert.equal(leaseB.task_id, "CERT-008B")
})

test("dtc-agentic-fabric: acquireWriteSetLease rejects active write-set lease overlap", () => {
  const routeA = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-009A" })
  const capsuleA = compileTaskCapsule({
    routeBundle: routeA,
    objective: "Lane A execution",
    writeSet: ["apps/storefront/src/styles/shared.css"]
  })
  const routeB = buildRouteBundle({ shortcut: "impl:nos", taskId: "CERT-009B" })
  const capsuleB = compileTaskCapsule({
    routeBundle: routeB,
    objective: "Lane B execution",
    writeSet: ["apps/storefront/src/styles/shared.css", "apps/storefront/src/lib/utils.ts"]
  })

  acquireWriteSetLease({ capsule: capsuleA, owner: "lane-A-worker" })
  assert.throws(() => acquireWriteSetLease({ capsule: capsuleB, owner: "lane-B-worker" }), /Write-set collision detected on path: apps\/storefront\/src\/styles\/shared\.css/)
})

test("dtc-agentic-fabric: releaseWriteSetLease allows re-acquisition of write-set path", () => {
  const routeA = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-010A" })
  const capsuleA = compileTaskCapsule({
    routeBundle: routeA,
    objective: "Lane A execution",
    writeSet: ["apps/storefront/src/lib/shared.ts"]
  })
  const routeB = buildRouteBundle({ shortcut: "impl:nos", taskId: "CERT-010B" })
  const capsuleB = compileTaskCapsule({
    routeBundle: routeB,
    objective: "Lane B execution",
    writeSet: ["apps/storefront/src/lib/shared.ts"]
  })

  const leaseA = acquireWriteSetLease({ capsule: capsuleA, owner: "lane-A-worker" })
  assert.throws(() => acquireWriteSetLease({ capsule: capsuleB, owner: "lane-B-worker" }), /Write-set collision detected/)

  releaseWriteSetLease(leaseA.lease_id)
  const leaseB = acquireWriteSetLease({ capsule: capsuleB, owner: "lane-B-worker" })
  assert.equal(leaseB.status, "ACTIVE")
})

test("dtc-agentic-fabric: hashTaskCapsule produces consistent SHA-256 digest", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-011" })
  const capsule = compileTaskCapsule({ routeBundle: route, objective: "Testing digest" })
  const digest1 = hashTaskCapsule(capsule)
  const digest2 = hashTaskCapsule(capsule)
  assert.equal(digest1, digest2)
  assert.match(digest1, /^[a-f0-9]{64}$/)
})
