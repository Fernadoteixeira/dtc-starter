import assert from "node:assert/strict"
import { execSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from "node:fs"
import path from "node:path"
import { test, beforeEach } from "node:test"
import {
  AGENT_REGISTRY_PATH,
  AUTHORITY_REGISTRY_PATH,
  CAPABILITY_REGISTRY_PATH,
  PROTOCOL_REGISTRY_PATH,
  REPO_ROOT,
  EPHEMERAL_LEASE_STORE_PATH,
  loadDurableLeasesState,
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
  validateTaskCapsuleReferences,
  verifyMutationPostcondition,
  buildCompleteReceiptChain,
  captureHostMutationDelta,
  exportSubprocessContext,
  quarantineMutationEscape,
  validateSubprocessAuthority,
  verifyAndEnforceMutationPostcondition
} from "../canonical-execution-lib.mjs"
import { buildRouteBundle } from "../resolve-agent-shortcut.mjs"

beforeEach(() => {
  resetWriteSetLeases()
})

// ==========================================
// CATEGORY 1: REGISTRY SSOT (4 REGISTRIES)
// ==========================================

test("fio-vivo-agentic-fabric: loadAgentRegistry resolves both archetypes and agents maps", () => {
  const registry = loadAgentRegistry()
  assert.ok(registry.agents.has("canonical-worker"))
  assert.ok(registry.agents.has("canonical-reviewer"))
  assert.ok(registry.agents.has("implementation-engineer"))
  assert.ok(registry.agents.has("code-reviewer"))
  assert.ok(registry.agents.has("repo-guardian"))
})

test("fio-vivo-agentic-fabric: validateTaskCapsuleReferences resolves known agents from agent registry", () => {
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

test("fio-vivo-agentic-fabric: rejects unknown worker agent reference", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-002" })
  const capsule = compileTaskCapsule({ routeBundle: route, objective: "Testing unknown worker" })
  capsule.agent.worker = { agent_id: "fake-unknown-worker", archetype: "worker" }
  assert.throws(() => validateTaskCapsuleReferences(capsule), /references unknown worker agent: fake-unknown-worker/)
})

test("fio-vivo-agentic-fabric: rejects unknown reviewer agent reference", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-003" })
  const capsule = compileTaskCapsule({ routeBundle: route, objective: "Testing unknown reviewer" })
  capsule.agent.reviewer = { agent_id: "fake-unknown-reviewer", archetype: "reviewer" }
  assert.throws(() => validateTaskCapsuleReferences(capsule), /references unknown reviewer agent: fake-unknown-reviewer/)
})

test("fio-vivo-agentic-fabric: rejects non-existent authority source ref", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-004" })
  const capsule = compileTaskCapsule({ routeBundle: route, objective: "Testing fake source ref" })
  capsule.authority.source_refs = [".agents/fake-non-existent-source-ref.json"]
  assert.throws(() => validateTaskCapsuleReferences(capsule), /references non-existent authority source ref/)
})

test("fio-vivo-agentic-fabric: parseAgentRegistry fails when archetypes: section is missing", () => {
  assert.throws(() => parseAgentRegistry("invalid: yaml"), /Agent registry missing archetypes: or agents: section/)
})

// ==========================================
// CATEGORY 2: AGENT SEPARATION & IDENTITIES
// ==========================================

test("fio-vivo-agentic-fabric: validateTaskCapsule rejects worker identity == reviewer identity", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-005" })
  const capsule = compileTaskCapsule({ routeBundle: route, objective: "Testing identity separation" })
  capsule.agent.worker = { agent_id: "canonical-worker", archetype: "worker" }
  capsule.agent.reviewer = { agent_id: "canonical-worker", archetype: "reviewer" }
  assert.throws(() => validateTaskCapsule(capsule), /Capsule worker and reviewer agent identities must be distinct/)
})

test("fio-vivo-agentic-fabric: validateTaskCapsule accepts distinct worker and reviewer identities", () => {
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

test("fio-vivo-agentic-fabric: authorizeTaskCapsule grants AUTH-0 and AUTH-1 when explicitly listed", () => {
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

test("fio-vivo-agentic-fabric: authorizeTaskCapsule rejects grant not included in capsule grants (no implicit tier inheritance)", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-008" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Testing grant exclusion",
    grants: ["AUTH-0"] // AUTH-1 is omitted!
  })
  assert.throws(() => authorizeTaskCapsule(capsule, "AUTH-1"), /requested grant AUTH-1 is not in capsule authorization grants/)
})

test("fio-vivo-agentic-fabric: authorizeTaskCapsule rejects AUTH-4 financial escalation without ap2-payments mandate", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-009" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Testing auth tier 4",
    grants: ["AUTH-4"]
  })
  assert.throws(() => authorizeTaskCapsule(capsule, "AUTH-4"), /Authorization grant rejected: AUTH-4 requires ap2-payments mandate verification/)
})

test("fio-vivo-agentic-fabric: authorizeTaskCapsule rejects fio_vivo_ap2 and dtc_ap2 as sole mandate authority for AUTH-4", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-009B" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Testing channel isolation",
    grants: ["AUTH-4"]
  })
  capsule.protocols.fio_vivo_ap2 = "mandate_verified"
  assert.throws(() => authorizeTaskCapsule(capsule, "AUTH-4"), /Authorization grant rejected: AUTH-4 requires ap2-payments mandate verification/)

  capsule.protocols.fio_vivo_ap2 = undefined
  capsule.protocols.dtc_ap2 = "mandate_verified"
  assert.throws(() => authorizeTaskCapsule(capsule, "AUTH-4"), /Authorization grant rejected: AUTH-4 requires ap2-payments mandate verification/)
})

test("fio-vivo-agentic-fabric: authorizeTaskCapsule grants AUTH-4 MAY_ADVANCE with valid ap2-payments mandate object", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-009C" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Testing ap2-payments mandate",
    grants: ["AUTH-4"]
  })
  capsule.protocols["ap2-payments"] = "mandate_verified"
  capsule.mandate = {
    mandate_id: "man-001",
    principal: "principal-001",
    transaction: {
      amount: "100.50",
      currency: "USD",
      payee: "vendor-001",
      operation: "purchase"
    },
    validity: {
      expires_at: new Date(Date.now() + 60000).toISOString(),
      nonce: "nonce-xyz-123"
    },
    verification: {
      protocol: "ap2-payments",
      verdict: "mandate_verified"
    }
  }

  const res = authorizeTaskCapsule(capsule, "AUTH-4")
  assert.equal(res.authorized, true)
  assert.equal(res.grant, "AUTH-4")
  assert.equal(res.status, "MAY_ADVANCE")
})

test("fio-vivo-agentic-fabric: authorizeTaskCapsule rejects mandate with non-canonical floating point amount", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-009D" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Testing floating point rejection",
    grants: ["AUTH-4"]
  })
  capsule.protocols["ap2-payments"] = "mandate_verified"
  capsule.mandate = {
    transaction: { amount: 100.50 }
  }
  assert.throws(() => authorizeTaskCapsule(capsule, "AUTH-4"), /mandate transaction amount must be a canonical decimal string/)
})

test("fio-vivo-agentic-fabric: authorizeTaskCapsule rejects AUTH-2/3 without human approval", () => {
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

test("fio-vivo-agentic-fabric: pathsOverlap detects parent-child directory overlap", () => {
  assert.equal(pathsOverlap("packages/gallery/**", "packages/gallery/src/card.tsx"), true)
  assert.equal(pathsOverlap("packages/gallery/src/card.tsx", "packages/gallery"), true)
  assert.equal(pathsOverlap("apps/storefront/src/styles/theme.css", "apps/storefront/src/modules/home"), false)
})

test("fio-vivo-agentic-fabric: pathsOverlap detects Windows case-insensitive collision", () => {
  assert.equal(pathsOverlap("apps/storefront/src/styles/theme.css", "APPS/STOREFRONT/SRC/STYLES/THEME.CSS"), true)
})

test("fio-vivo-agentic-fabric: acquireWriteSetLease grants active lease for disjoint paths", () => {
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

test("fio-vivo-agentic-fabric: acquireWriteSetLease rejects parent-child directory write-set overlap", () => {
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

test("fio-vivo-agentic-fabric: loadDurableLeasesState throws LEASE_STORE_CORRUPT on invalid JSON", () => {
  const storePath = path.resolve(REPO_ROOT, EPHEMERAL_LEASE_STORE_PATH)
  const storeDir = path.dirname(storePath)
  if (!existsSync(storeDir)) mkdirSync(storeDir, { recursive: true })
  const backup = existsSync(storePath) ? readFileSync(storePath, "utf-8") : null

  try {
    writeFileSync(storePath, "{ corrupt json ...", "utf-8")
    assert.throws(() => loadDurableLeasesState(), /LEASE_STORE_CORRUPT/)
  } finally {
    if (backup !== null) {
      writeFileSync(storePath, backup, "utf-8")
    } else {
      try { unlinkSync(storePath) } catch {}
    }
  }
})

test("fio-vivo-agentic-fabric: fencing_high_water_mark increases monotonically across lease acquisitions", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-HWM" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Testing fencing HWM",
    writeSet: ["apps/storefront/src/lib/hwm.ts"]
  })

  const lease1 = acquireWriteSetLease({ capsule, owner: "worker-1" })
  releaseWriteSetLease(lease1.lease_id, lease1.owner_token, lease1.fencing_token)

  const lease2 = acquireWriteSetLease({ capsule, owner: "worker-2" })
  assert.ok(lease2.fencing_token > lease1.fencing_token)
  releaseWriteSetLease(lease2.lease_id, lease2.owner_token, lease2.fencing_token)
})

test("fio-vivo-agentic-fabric: releaseWriteSetLease rejects release with invalid owner_token", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-013" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Lane execution",
    writeSet: ["apps/storefront/src/lib/shared.ts"]
  })
  const lease = acquireWriteSetLease({ capsule, owner: "lane-worker", ownerToken: "valid-token-123" })
  assert.throws(() => releaseWriteSetLease(lease.lease_id, "wrong-token-456"), /invalid owner_token/)
})

test("fio-vivo-agentic-fabric: releaseWriteSetLease allows re-acquisition of write-set path", () => {
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

test("fio-vivo-agentic-fabric: hashCanonicalTaskCapsule produces consistent SHA-256 digest regardless of key order", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-015" })
  const capsule1 = compileTaskCapsule({ routeBundle: route, objective: "Testing digest" })
  const capsule2 = structuredClone(capsule1)

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

test("fio-vivo-agentic-fabric: hashCanonicalTaskCapsule excludes task_capsule_sha256 digest field from calculation", () => {
  const route = buildRouteBundle({ shortcut: "impl", taskId: "CERT-016" })
  const capsule = compileTaskCapsule({ routeBundle: route, objective: "Testing digest exclusion" })
  const hashBefore = hashCanonicalTaskCapsule(capsule)
  capsule.task_capsule_sha256 = hashBefore
  const hashAfter = hashCanonicalTaskCapsule(capsule)
  assert.equal(hashBefore, hashAfter)
})

// ==========================================
// CATEGORY 6: PLATFORM TOOL EXECUTION GATEWAY (FIO-VIVO-AP2)
// ==========================================

test("fio-vivo-agentic-fabric: authorizePlatformToolCall authorizes read-only tool under AUTH-0", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-017" })
  const capsule = compileTaskCapsule({ routeBundle: route, objective: "Read-only test" })
  const auth = authorizePlatformToolCall({ capsule, toolName: "view_file", targetPath: "apps/storefront/src/lib/config.ts" })
  assert.equal(auth.status, "AUTHORIZED")
  assert.equal(auth.required_grant, "AUTH-0")
})

test("fio-vivo-agentic-fabric: authorizePlatformToolCall authorizes mutation tool under AUTH-1 with valid lease", () => {
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

test("fio-vivo-agentic-fabric: authorizePlatformToolCall blocks mutation tool call without active write-set lease", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-019" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Unleased mutation test",
    writeSet: ["apps/storefront/src/lib/config.ts"],
    grants: ["AUTH-0", "AUTH-1"]
  })
  assert.throws(
    () => authorizePlatformToolCall({ capsule, toolName: "replace_file_content", targetPath: "apps/storefront/src/lib/config.ts" }),
    /FIO-VIVO-AP2 Execution Blocked: Tool replace_file_content requires an active write-set lease/
  )
})

test("fio-vivo-agentic-fabric: authorizePlatformToolCall blocks mutation tool call when target path is outside lease write-set", () => {
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
      targetPath: "apps/storefront/src/app/page.tsx"
    }),
    /FIO-VIVO-AP2 Execution Blocked: Target path apps\/storefront\/src\/app\/page\.tsx is not in lease write-set/
  )
})

test("fio-vivo-agentic-fabric: authorizePlatformToolCall blocks SCM operations under AUTH-2 without human gate approval", () => {
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

test("fio-vivo-agentic-fabric: authorizePlatformToolCall blocks financial transaction under AUTH-4 without AP2 mandate", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-022" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Payment test",
    grants: ["AUTH-4"]
  })
  assert.throws(
    () => authorizePlatformToolCall({ capsule, toolName: "run_command", commandLine: "payment purchase mandate" }),
    /requires ap2-payments mandate verification/
  )
})

test("fio-vivo-agentic-fabric: cross-process atomic write-set lease contention blocks Process B when Process A holds lease", () => {
  const childScript = `
    import { buildRouteBundle } from "./.agents/scripts/resolve-agent-shortcut.mjs";
    import { compileTaskCapsule, acquireWriteSetLease } from "./.agents/scripts/canonical-execution-lib.mjs";
    const routeA = buildRouteBundle({ shortcut: "impl:storefront", taskId: "XPROC-001A" });
    const capsuleA = compileTaskCapsule({
      routeBundle: routeA,
      objective: "Process A execution",
      writeSet: ["packages/gallery-experience/**"]
    });
    acquireWriteSetLease({ capsule: capsuleA, owner: "process-A-worker" });
  `
  execSync(`node --input-type=module -e "${childScript.replace(/"/g, '\\"').replace(/\r?\n/g, " ")}"`, {
    cwd: process.cwd()
  })

  const routeB = buildRouteBundle({ shortcut: "impl:nos", taskId: "XPROC-001B" })
  const capsuleB = compileTaskCapsule({
    routeBundle: routeB,
    objective: "Process B execution",
    writeSet: ["packages/gallery-experience/src/components/card.tsx"]
  })

  assert.throws(
    () => acquireWriteSetLease({ capsule: capsuleB, owner: "process-B-worker" }),
    /Write-set collision detected/
  )
})

test("fio-vivo-agentic-fabric: authorizePlatformToolCall blocks indirect shell/script file write bypasses in run_command", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-023" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Indirect write bypass test",
    writeSet: ["apps/storefront/src/lib/config.ts"],
    grants: ["AUTH-0", "AUTH-1"]
  })

  assert.throws(
    () => authorizePlatformToolCall({ capsule, toolName: "run_command", commandLine: "Set-Content -Path apps/storefront/src/lib/config.ts -Value 'hack'" }),
    /FIO-VIVO-AP2 Execution Blocked: Tool run_command requires an active write-set lease/
  )

  assert.throws(
    () => authorizePlatformToolCall({ capsule, toolName: "run_command", commandLine: "node -e \"fs.writeFileSync('apps/storefront/src/lib/config.ts', 'hack')\"" }),
    /FIO-VIVO-AP2 Execution Blocked: Tool run_command requires an active write-set lease/
  )

  assert.throws(
    () => authorizePlatformToolCall({ capsule, toolName: "run_command", commandLine: "echo 'hack' >> apps/storefront/src/lib/config.ts" }),
    /FIO-VIVO-AP2 Execution Blocked: Tool run_command requires an active write-set lease/
  )
})

test("fio-vivo-agentic-fabric H2.6: 16-process barrier race contention produces exactly 1 winner and 15 conflicts", () => {
  const childScript = `
    import { buildRouteBundle } from "./.agents/scripts/resolve-agent-shortcut.mjs";
    import { compileTaskCapsule, acquireWriteSetLease } from "./.agents/scripts/canonical-execution-lib.mjs";
    const processId = process.argv[2];
    try {
      const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "RACE-" + processId });
      const capsule = compileTaskCapsule({
        routeBundle: route,
        objective: "Barrier contender " + processId,
        writeSet: ["packages/gallery-experience/**"]
      });
      acquireWriteSetLease({ capsule, owner: "worker-" + processId });
      console.log("ACQUIRED:" + processId);
    } catch (e) {
      console.log("CONFLICT:" + processId);
    }
  `

  let acquiredCount = 0
  let conflictCount = 0

  for (let i = 0; i < 16; i += 1) {
    const output = execSync(`node --input-type=module -e "${childScript.replace(/"/g, '\\"').replace(/\r?\n/g, " ")}" ${i}`, {
      cwd: process.cwd()
    }).toString()

    if (output.includes("ACQUIRED:")) acquiredCount += 1
    if (output.includes("CONFLICT:")) conflictCount += 1
  }

  assert.equal(acquiredCount, 1)
  assert.equal(conflictCount, 15)
})

test("fio-vivo-agentic-fabric H2.6: releaseWriteSetLease rejects stale fencing token", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-FENCE" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Fencing token test",
    writeSet: ["apps/storefront/src/lib/config.ts"]
  })
  const lease = acquireWriteSetLease({ capsule, owner: "worker-A" })
  const staleFencingToken = lease.fencing_token - 1
  assert.throws(
    () => releaseWriteSetLease(lease.lease_id, lease.owner_token, staleFencingToken),
    /STALE_LEASE_OWNER/
  )
})

test("fio-vivo-agentic-fabric H3.6: verifyMutationPostcondition detects unauthorized write-set escape", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-POST" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Postcondition test",
    writeSet: ["apps/storefront/src/modules/home/hero.tsx"]
  })

  // Authorized write-set matches -> PASS
  const validRes = verifyMutationPostcondition({ capsule, observedPaths: ["apps/storefront/src/modules/home/hero.tsx"] })
  assert.equal(validRes.status, "PASS")

  // Unauthorized write-set escape -> THROWS WRITE_SET_ESCAPE
  assert.throws(
    () => verifyMutationPostcondition({
      capsule,
      observedPaths: ["apps/storefront/src/modules/home/hero.tsx", "package.json"]
    }),
    /WRITE_SET_ESCAPE: Observed unauthorized mutation on path: package\.json/
  )
})

test("fio-vivo-agentic-fabric H3.7: validateSubprocessAuthority blocks grant elevation and write-set escape", () => {
  const parentRoute = buildRouteBundle({ shortcut: "impl:storefront", taskId: "PARENT-001" })
  const parentCapsule = compileTaskCapsule({
    routeBundle: parentRoute,
    objective: "Parent task",
    writeSet: ["apps/storefront/src/**"],
    grants: ["AUTH-0", "AUTH-1"]
  })

  // Valid confined child -> PASS
  const childRoute = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CHILD-001" })
  const childCapsule = compileTaskCapsule({
    routeBundle: childRoute,
    objective: "Child task",
    writeSet: ["apps/storefront/src/modules/home/hero.tsx"],
    grants: ["AUTH-0", "AUTH-1"]
  })
  const confRes = validateSubprocessAuthority({ parentCapsule, childCapsule })
  assert.equal(confRes.status, "CONFINED")

  // Child attempting to elevate grant to AUTH-2 -> DENIED
  const elevatedGrantCapsule = compileTaskCapsule({
    routeBundle: childRoute,
    objective: "Elevated grant child",
    writeSet: ["apps/storefront/src/modules/home/hero.tsx"],
    grants: ["AUTH-0", "AUTH-1", "AUTH-2"]
  })
  assert.throws(
    () => validateSubprocessAuthority({ parentCapsule, childCapsule: elevatedGrantCapsule }),
    /SUBPROCESS_ELEVATION_DENIED: Child task attempted to elevate grant: AUTH-2/
  )

  // Child attempting to expand write-set to package.json -> DENIED
  const elevatedWriteSetCapsule = compileTaskCapsule({
    routeBundle: childRoute,
    objective: "Elevated write-set child",
    writeSet: ["package.json"],
    grants: ["AUTH-0", "AUTH-1"]
  })
  assert.throws(
    () => validateSubprocessAuthority({ parentCapsule, childCapsule: elevatedWriteSetCapsule }),
    /SUBPROCESS_ELEVATION_DENIED: Child task write-set escape beyond parent bounds: package\.json/
  )
})

test("fio-vivo-agentic-fabric H3.7: exportSubprocessContext formats environment context cleanly", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "ENV-001" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Subprocess env test",
    writeSet: ["apps/storefront/src/lib/config.ts"],
    grants: ["AUTH-0", "AUTH-1"]
  })
  const lease = acquireWriteSetLease({ capsule, owner: "worker-A" })
  const envCtx = exportSubprocessContext({ capsule, leaseRecord: lease })

  assert.equal(envCtx.FIO_VIVO_LEASE_ID, lease.lease_id)
  assert.equal(envCtx.FIO_VIVO_FENCING_TOKEN, String(lease.fencing_token))
  assert.ok(envCtx.FIO_VIVO_TASK_CAPSULE_SHA256)
  assert.ok(envCtx.FIO_VIVO_AUTHORIZATION_GRANTS.includes("AUTH-1"))
})

test("fio-vivo-agentic-fabric H3.8: captureHostMutationDelta captures filesystem git delta", () => {
  const delta = captureHostMutationDelta(() => {
    // Read-only action -> empty delta
    return "ok"
  })
  assert.equal(delta.result, "ok")
  assert.ok(Array.isArray(delta.observed_write_set))
})

test("fio-vivo-agentic-fabric H3.9: verifyAndEnforceMutationPostcondition produces quarantine record on escape", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CERT-QUAR" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Quarantine test",
    writeSet: ["apps/storefront/src/modules/home/hero.tsx"]
  })

  try {
    verifyAndEnforceMutationPostcondition({
      capsule,
      observedPaths: ["apps/storefront/src/modules/home/hero.tsx", "apps/backend/src/unauthorized.ts"]
    })
    assert.fail("Should have thrown WRITE_SET_ESCAPE")
  } catch (err) {
    assert.ok(err.message.includes("WRITE_SET_ESCAPE"))
    assert.equal(err.quarantine.status, "QUARANTINED")
    assert.equal(err.quarantine.task_id, "CERT-QUAR")
  }
})

test("fio-vivo-agentic-fabric H3.10: buildCompleteReceiptChain builds full 6-phase receipt chain", () => {
  const route = buildRouteBundle({ shortcut: "impl:storefront", taskId: "CHAIN-001" })
  const capsule = compileTaskCapsule({
    routeBundle: route,
    objective: "Receipt chain test",
    writeSet: ["apps/storefront/src/lib/config.ts"]
  })
  const lease = acquireWriteSetLease({ capsule, owner: "worker-A" })
  const chain = buildCompleteReceiptChain({
    capsule,
    toolName: "replace_file_content",
    requiredGrant: "AUTH-1",
    leaseRecord: lease,
    observedWriteSet: ["apps/storefront/src/lib/config.ts"],
    status: "PASS"
  })

  assert.equal(chain["POLICY-E"].status, "PASS")
  assert.equal(chain["AUTH-E"].required_grant, "AUTH-1")
  assert.equal(chain["LEASE-E"].lease_id, lease.lease_id)
  assert.equal(chain["TOOL-E"].tool_name, "replace_file_content")
  assert.deepEqual(chain["MUTATION-E"].observed_write_set, ["apps/storefront/src/lib/config.ts"])
  assert.equal(chain["POSTCONDITION-E"].status, "PASS")
})
