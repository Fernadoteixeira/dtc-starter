import assert from "node:assert/strict"
import { test, beforeEach } from "node:test"
import {
  AGENT_REGISTRY_PATH,
  AUTHORITY_REGISTRY_PATH,
  CAPABILITY_REGISTRY_PATH,
  PROTOCOL_REGISTRY_PATH,
  acquireWriteSetLease,
  authorizePlatformToolCall,
  authorizeTaskCapsule,
  compileTaskCapsule,
  hashCanonicalTaskCapsule,
  hashTaskCapsule,
  loadAgentRegistry,
  parseAgentRegistry,
  pathsOverlap,
  releaseWriteSetLease,
  resetWriteSetLeases,
  toCanonicalLeasePath,
  validateTaskCapsule,
  validateTaskCapsuleReferences
} from "../canonical-execution-lib.mjs"
import { buildRouteBundle } from "../resolve-agent-shortcut.mjs"

beforeEach(() => {
  resetWriteSetLeases()
})

// ==========================================
// CATEGORY 1: REGISTRY SSOT (4 REGISTRIES)
// ==========================================

test("dtc-agentic-fabric: loadAgentRegistry resolves both archetypes and agents maps", () => {
  const registry = loadAgentRegistry()
  assert.ok(registry.agents.has("canonical-worker"))
  assert.ok(registry.agents.has("canonical-reviewer"))
  assert.ok(registry.agents.has("implementation-engineer"))
  assert.ok(registry.agents.has("code-reviewer"))
  assert.ok(registry.agents.has("repo-guardian"))
})

test("dtc-agentic-fabric: validateTaskCapsuleReferences resolves known agents from agent registry", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-001" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Certification test 001",
    writeSet: ["apps/storefront/src/modules/home/gallery-hero/medusa-adapter.ts"]
  })
  const validated = validateTaskCapsuleReferences(capsule)
  assert.equal(validated.agent.worker.agent_id, "implementation-engineer")
  assert.equal(validated.agent.reviewer.agent_id, "canonical-reviewer")
})

test("dtc-agentic-fabric: rejects unknown worker agent reference", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-002" })
  const capsule = compileTaskCapsule({ routeBundle: route, objective: "Testing unknown worker" })
  capsule.agent.worker = { agent_id: "fake-unknown-worker", archetype: "worker" }
  assert.throws(() => validateTaskCapsuleReferences(capsule), /references unknown worker agent: fake-unknown-worker/)
})

test("dtc-agentic-fabric: rejects unknown reviewer agent reference", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-003" })
  const capsule = compileTaskCapsule({ routeBundle: route, objective: "Testing unknown reviewer" })
  capsule.agent.reviewer = { agent_id: "fake-unknown-reviewer", archetype: "reviewer" }
  assert.throws(() => validateTaskCapsuleReferences(capsule), /references unknown reviewer agent: fake-unknown-reviewer/)
})

test("dtc-agentic-fabric: rejects non-existent authority source ref", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-004" })
  const capsule = compileTaskCapsule({ routeBundle: route, objective: "Testing fake source ref" })
  capsule.authority.source_refs = [".agents/fake-non-existent-source-ref.json"]
  assert.throws(() => validateTaskCapsuleReferences(capsule), /references non-existent authority source ref/)
})

test("dtc-agentic-fabric: parseAgentRegistry fails when archetypes: section is missing", () => {
  assert.throws(() => parseAgentRegistry("invalid: yaml"), /Agent registry missing archetypes: or agents: section/)
})

// ==========================================
// CATEGORY 2: AGENT SEPARATION & IDENTITIES
// ==========================================

test("dtc-agentic-fabric: validateTaskCapsule rejects worker identity == reviewer identity", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-005" })
  const capsule = compileTaskCapsule({ routeBundle: route, objective: "Testing identity separation" })
  capsule.agent.worker = { agent_id: "canonical-worker", archetype: "worker" }
  capsule.agent.reviewer = { agent_id: "canonical-worker", archetype: "reviewer" }
  assert.throws(() => validateTaskCapsule(capsule), /Capsule worker and reviewer agent identities must be distinct/)
})

test("dtc-agentic-fabric: validateTaskCapsule accepts distinct worker and reviewer identities", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-006" })
  const capsule = compileTaskCapsule({ routeBundle: route, objective: "Distinct identities" })
  capsule.agent.worker = { agent_id: "implementation-engineer", archetype: "worker" }
  capsule.agent.reviewer = { agent_id: "code-reviewer", archetype: "reviewer" }
  const validated = validateTaskCapsule(capsule)
  assert.equal(validated.agent.worker.agent_id, "implementation-engineer")
  assert.equal(validated.agent.reviewer.agent_id, "code-reviewer")
})

// ==========================================
// CATEGORY 3: CAPABILITY-BASED AUTH GRANTS
// ==========================================

test("dtc-agentic-fabric: authorizeTaskCapsule grants AUTH-0 and AUTH-1 when explicitly listed", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-007" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Testing auth grants",
    writeSet: ["apps/storefront/src/lib/config.ts"],
    grants: ["AUTH-0", "AUTH-1"]
  })
  const res0 = authorizeTaskCapsule(capsule, "AUTH-0")
  assert.equal(res0.authorized, true)
  assert.equal(res0.grant, "AUTH-0")

  const res1 = authorizeTaskCapsule(capsule, "AUTH-1")
  assert.equal(res1.authorized, true)
  assert.equal(res1.grant, "AUTH-1")
})

test("dtc-agentic-fabric: authorizeTaskCapsule rejects grant not included in capsule grants (no implicit tier inheritance)", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-008" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Testing grant exclusion",
    grants: ["AUTH-0"] // AUTH-1 is omitted!
  })
  assert.throws(() => authorizeTaskCapsule(capsule, "AUTH-1"), /requested grant AUTH-1 is not in capsule authorization grants/)
})

test("dtc-agentic-fabric: authorizeTaskCapsule rejects AUTH-4 financial escalation without AP2 mandate", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-009" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Testing auth tier 4",
    grants: ["AUTH-4"]
  })
  assert.throws(() => authorizeTaskCapsule(capsule, "AUTH-4"), /Authorization grant rejected: AUTH-4 requires AP2 mandate verification/)
})

test("dtc-agentic-fabric: authorizeTaskCapsule rejects AUTH-2/3 without human approval", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-010" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Testing auth tier 2",
    grants: ["AUTH-2"]
  })
  assert.throws(() => authorizeTaskCapsule(capsule, "AUTH-2"), /requires human approval/)

  capsule.governance.human_gate = "HUMAN_APPROVED"
  const res2 = authorizeTaskCapsule(capsule, "AUTH-2")
  assert.equal(res2.authorized, true)
})

// ==========================================
// CATEGORY 4: PROCESS-SAFE LEASES & PATH NORMALIZATION
// ==========================================

test("dtc-agentic-fabric: pathsOverlap detects parent-child directory overlap", () => {
  assert.equal(pathsOverlap("packages/gallery/**", "packages/gallery/src/card.tsx"), true)
  assert.equal(pathsOverlap("packages/gallery/src/card.tsx", "packages/gallery"), true)
  assert.equal(pathsOverlap("apps/storefront/src/styles/theme.css", "apps/storefront/src/modules/home"), false)
})

test("dtc-agentic-fabric: pathsOverlap detects Windows case-insensitive collision", () => {
  assert.equal(pathsOverlap("apps/storefront/src/styles/theme.css", "APPS/STOREFRONT/SRC/STYLES/THEME.CSS"), true)
})

test("dtc-agentic-fabric: acquireWriteSetLease grants active lease for disjoint paths", () => {
  const routeA = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-011A" })
  const capsuleA = compileTaskCapsule({
    routeBundle: routeA,
    objective: "Lane A execution",
    writeSet: ["apps/storefront/src/modules/home/hero.tsx"]
  })
  const routeB = buildRouteBundle({ shortcut: "impl:nos", taskId: "CERT-011B" })
  const capsuleB = compileTaskCapsule({
    routeBundle: routeB,
    objective: "Lane B execution",
    writeSet: ["apps/storefront/src/styles/theme.css"]
  })

  const leaseA = acquireWriteSetLease({ capsule: capsuleA, owner: "lane-A-worker" })
  assert.equal(leaseA.status, "ACTIVE")
  assert.equal(leaseA.task_id, "CERT-011A")

  const leaseB = acquireWriteSetLease({ capsule: capsuleB, owner: "lane-B-worker" })
  assert.equal(leaseB.status, "ACTIVE")
  assert.equal(leaseB.task_id, "CERT-011B")
})

test("dtc-agentic-fabric: acquireWriteSetLease rejects parent-child directory write-set overlap", () => {
  const routeA = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-012A" })
  const capsuleA = compileTaskCapsule({
    routeBundle: routeA,
    objective: "Lane A execution",
    writeSet: ["packages/gallery-experience/**"]
  })
  const routeB = buildRouteBundle({ shortcut: "impl:nos", taskId: "CERT-012B" })
  const capsuleB = compileTaskCapsule({
    routeBundle: routeB,
    objective: "Lane B execution",
    writeSet: ["packages/gallery-experience/src/components/card.tsx"]
  })

  acquireWriteSetLease({ capsule: capsuleA, owner: "lane-A-worker" })
  assert.throws(() => acquireWriteSetLease({ capsule: capsuleB, owner: "lane-B-worker" }), /Write-set collision detected/)
})

test("dtc-agentic-fabric: releaseWriteSetLease rejects release with invalid owner_token", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-013" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Lane execution",
    writeSet: ["apps/storefront/src/lib/shared.ts"]
  })
  const lease = acquireWriteSetLease({ capsule, owner: "lane-worker", ownerToken: "valid-token-123" })
  assert.throws(() => releaseWriteSetLease(lease.lease_id, "wrong-token-456"), /invalid owner_token/)
})

test("dtc-agentic-fabric: releaseWriteSetLease allows re-acquisition of write-set path", () => {
  const routeA = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-014A" })
  const capsuleA = compileTaskCapsule({
    routeBundle: routeA,
    objective: "Lane A execution",
    writeSet: ["apps/storefront/src/lib/shared.ts"]
  })
  const routeB = buildRouteBundle({ shortcut: "impl:nos", taskId: "CERT-014B" })
  const capsuleB = compileTaskCapsule({
    routeBundle: routeB,
    objective: "Lane B execution",
    writeSet: ["apps/storefront/src/lib/shared.ts"]
  })

  const leaseA = acquireWriteSetLease({ capsule: capsuleA, owner: "lane-A-worker", ownerToken: "token-A" })
  assert.throws(() => acquireWriteSetLease({ capsule: capsuleB, owner: "lane-B-worker" }), /Write-set collision detected/)

  releaseWriteSetLease(leaseA.lease_id, "token-A")
  const leaseB = acquireWriteSetLease({ capsule: capsuleB, owner: "lane-B-worker" })
  assert.equal(leaseB.status, "ACTIVE")
})

// ==========================================
// CATEGORY 5: CANONICAL TASK CAPSULE HASHING
// ==========================================

test("dtc-agentic-fabric: hashCanonicalTaskCapsule produces consistent SHA-256 digest regardless of key order", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-015" })
  const capsule1 = compileTaskCapsule({ routeBundle: route, objective: "Testing digest" })
  const capsule2 = structuredClone(capsule1)

  // Reorder keys manually
  const reordered = {
    governance: capsule2.governance,
    schema_version: capsule2.schema_version,
    task: capsule2.task,
    agent: capsule2.agent,
    capabilities: capsule2.capabilities,
    authority: capsule2.authority,
    execution: capsule2.execution,
    protocols: capsule2.protocols,
    evidence: capsule2.evidence,
    kind: capsule2.kind,
    authorization: capsule2.authorization
  }

  const hash1 = hashCanonicalTaskCapsule(capsule1)
  const hash2 = hashCanonicalTaskCapsule(reordered)
  assert.equal(hash1, hash2)
  assert.match(hash1, /^[a-f0-9]{64}$/)
})

test("dtc-agentic-fabric: hashCanonicalTaskCapsule excludes task_capsule_sha256 digest field from calculation", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-016" })
  const capsule = compileTaskCapsule({ routeBundle: route, objective: "Testing digest exclusion" })
  const hashBefore = hashCanonicalTaskCapsule(capsule)
  capsule.task_capsule_sha256 = hashBefore
  const hashAfter = hashCanonicalTaskCapsule(capsule)
  assert.equal(hashBefore, hashAfter)
})

// ==========================================
// CATEGORY 6: PLATFORM TOOL EXECUTION GATEWAY (DTC-AP2)
// ==========================================

test("dtc-agentic-fabric: authorizePlatformToolCall authorizes read-only tool under AUTH-0", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-017" })
  const capsule = compileTaskCapsule({ routeBundle: route, objective: "Read-only test" })
  const auth = authorizePlatformToolCall({ capsule, toolName: "view_file", targetPath: "apps/storefront/src/lib/config.ts" })
  assert.equal(auth.status, "AUTHORIZED")
  assert.equal(auth.required_grant, "AUTH-0")
})

test("dtc-agentic-fabric: authorizePlatformToolCall authorizes mutation tool under AUTH-1 with valid lease", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-018" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Mutation test",
    writeSet: ["apps/storefront/src/lib/config.ts"],
    grants: ["AUTH-0", "AUTH-1"]
  })
  const lease = acquireWriteSetLease({ capsule, owner: "canonical-worker" })
  const auth = authorizePlatformToolCall({
    capsule,
    leaseId: lease.lease_id,
    toolName: "replace_file_content",
    targetPath: "apps/storefront/src/lib/config.ts"
  })
  assert.equal(auth.status, "AUTHORIZED")
  assert.equal(auth.required_grant, "AUTH-1")
})

test("dtc-agentic-fabric: authorizePlatformToolCall blocks mutation tool call without active write-set lease", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-019" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Unleased mutation test",
    writeSet: ["apps/storefront/src/lib/config.ts"],
    grants: ["AUTH-0", "AUTH-1"]
  })
  assert.throws(
    () => authorizePlatformToolCall({ capsule, toolName: "replace_file_content", targetPath: "apps/storefront/src/lib/config.ts" }),
    /DTC-AP2 Execution Blocked: Tool replace_file_content requires an active write-set lease/
  )
})

test("dtc-agentic-fabric: authorizePlatformToolCall blocks mutation tool call when target path is outside lease write-set", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-020" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Outside target test",
    writeSet: ["apps/storefront/src/lib/config.ts"],
    grants: ["AUTH-0", "AUTH-1"]
  })
  const lease = acquireWriteSetLease({ capsule, owner: "canonical-worker" })
  assert.throws(
    () => authorizePlatformToolCall({
      capsule,
      leaseId: lease.lease_id,
      toolName: "replace_file_content",
      targetPath: "apps/storefront/src/app/page.tsx" // Not in lease write-set!
    }),
    /DTC-AP2 Execution Blocked: Target path apps\/storefront\/src\/app\/page\.tsx is not in lease write-set/
  )
})

test("dtc-agentic-fabric: authorizePlatformToolCall blocks SCM operations under AUTH-2 without human gate approval", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-021" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "SCM test",
    grants: ["AUTH-2"]
  })
  assert.throws(
    () => authorizePlatformToolCall({ capsule, toolName: "run_command", commandLine: "git commit -m 'test'" }),
    /requires human approval/
  )
})

test("dtc-agentic-fabric: authorizePlatformToolCall blocks financial transaction under AUTH-4 without AP2 mandate", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-022" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Payment test",
    grants: ["AUTH-4"]
  })
  assert.throws(
    () => authorizePlatformToolCall({ capsule, toolName: "run_command", commandLine: "payment purchase mandate" }),
    /requires AP2 mandate verification/
  )
})
