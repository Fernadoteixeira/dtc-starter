import test from "node:test"
import assert from "node:assert/strict"
import { generateAgentCard, validateDiscoveryNoLeakage } from "../a2a-discovery-projection.mjs"

test("A2A DISCOVERY #40: Generates compliant A2A 1.0 AgentCard from Service Profile", () => {
  const card = generateAgentCard()
  assert.equal(card.name, "FIO-VIVO A2A Gateway")
  assert.equal(card.version, "1.0.0")
  assert.ok(Array.isArray(card.supportedInterfaces))
  assert.equal(card.supportedInterfaces[0].protocolBinding, "JSONRPC")
  assert.equal(card.supportedInterfaces[0].protocolVersion, "1.0")
  assert.ok(Array.isArray(card.skills))
  assert.ok(card.skills.length >= 4)
})

test("A2A DISCOVERY #40: Rejects poisonous internal values leaking into public AgentCard", () => {
  const poisonousProfile = {
    agent_id: "secret-agent-id-999",
    archetype: "canonical-worker",
    filesystemPath: "C:\\Users\\fjuni\\Documents\\GitHub\\02-medusa-halls\\dtc-starter\\.agents\\skills\\medusa",
    skillPath: ".agents/skills/medusa",
    lease_id: "lease-xyz-777",
    fencing_token: 9999,
    host_session_id: "host-session-secret-123",
    reviewer_identity: "reviewer-master",
    system_prompt: "You are Antigravity system prompt...",
  }

  const card = generateAgentCard(poisonousProfile)
  const jsonStr = JSON.stringify(card)

  // 1. Verify no poisonous keys exist in top-level AgentCard
  assert.equal(card.agent_id, undefined)
  assert.equal(card.archetype, undefined)
  assert.equal(card.filesystemPath, undefined)
  assert.equal(card.skillPath, undefined)
  assert.equal(card.lease_id, undefined)
  assert.equal(card.fencing_token, undefined)
  assert.equal(card.host_session_id, undefined)
  assert.equal(card.reviewer_identity, undefined)
  assert.equal(card.system_prompt, undefined)

  // 2. Verify no internal string fragments leak anywhere in JSON string
  const forbiddenSubstrings = [
    "secret-agent-id-999",
    "canonical-worker",
    "C:\\Users",
    ".agents/skills",
    "lease-xyz-777",
    "9999",
    "host-session-secret-123",
    "reviewer-master",
    "Antigravity system prompt"
  ]

  for (const forbidden of forbiddenSubstrings) {
    assert.equal(jsonStr.includes(forbidden), false, `Poisonous string leaked into AgentCard: ${forbidden}`)
  }

  // 3. Verify validateDiscoveryNoLeakage passes cleanly
  assert.doesNotThrow(() => validateDiscoveryNoLeakage(card))
})
