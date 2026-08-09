/**
 * a2a-adversarial-corpus.test.mjs
 *
 * H4.6 — Adversarial & Conformance Certification Suite
 *
 * 6 Security & Conformance Groups:
 *   1. PROTOCOL    (A2A-Version, method, malformed payload rejection)
 *   2. IDENTITY    (ExternalPrincipal isolation, zero local identity selection)
 *   3. AUTHORITY   (AUTH-0 ceiling, write_set == [], no grant escalation)
 *   4. DISCLOSURE  (Zero leakage of internal paths, leases, tokens, archetypes)
 *   5. EXECUTION   (Pipeline compilation integrity)
 *   6. OUTPUT      (Official A2A Task + Artifact structure)
 */

import test from "node:test"
import assert from "node:assert/strict"
import { handleGatewayRequest } from "../a2a-gateway.mjs"
import { validateDiscoveryNoLeakage } from "../a2a-discovery-projection.mjs"
import { validateSanitizedOutput } from "../a2a-evidence-sanitizer.mjs"

const VALID_HEADERS = {
  "A2A-Version": "1.0",
  "X-FIO-VIVO-A2A-Key": "fio-vivo-a2a-key-demo-12345",
}

// ---------------------------------------------------------------------------
// GROUP 1: PROTOCOL
// ---------------------------------------------------------------------------

test("PROTOCOL: Rejects missing A2A-Version header", async () => {
  const res = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: { "X-FIO-VIVO-A2A-Key": "fio-vivo-a2a-key-demo-12345" },
    body: { jsonrpc: "2.0", id: "1", method: "SendMessage", params: {} },
  })

  assert.equal(res.statusCode, 400)
  assert.equal(res.body.error.code, -32602)
  assert.match(res.body.error.message, /Missing A2A-Version/i)
})

test("PROTOCOL: Rejects unsupported A2A-Version (e.g. 2.0)", async () => {
  const res = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: { ...VALID_HEADERS, "A2A-Version": "2.0" },
    body: { jsonrpc: "2.0", id: "1", method: "SendMessage", params: {} },
  })

  assert.equal(res.statusCode, 400)
  assert.equal(res.body.error.code, -32602)
  assert.match(res.body.error.message, /Unsupported A2A-Version/i)
})

test("PROTOCOL: Rejects unsupported RPC method", async () => {
  const res = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: VALID_HEADERS,
    body: { jsonrpc: "2.0", id: "1", method: "DestroyFabric", params: {} },
  })

  assert.equal(res.statusCode, 400)
  assert.equal(res.body.error.code, -32601)
  assert.match(res.body.error.message, /Method not found/i)
})

test("PROTOCOL: Rejects malformed Message without Parts", async () => {
  const res = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: VALID_HEADERS,
    body: {
      jsonrpc: "2.0",
      id: "1",
      method: "SendMessage",
      params: {
        id: "msg-bad",
        message: {}, // No parts array
      },
    },
  })

  assert.equal(res.statusCode, 400)
  assert.equal(res.body.error.code, -32602)
  assert.match(res.body.error.message, /at least one Part/i)
})

test("PROTOCOL: Rejects SSRF attempt with remote file URL in Part", async () => {
  const res = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: VALID_HEADERS,
    body: {
      jsonrpc: "2.0",
      id: "1",
      method: "SendMessage",
      params: {
        id: "msg-ssrf",
        message: {
          parts: [
            { url: "http://169.254.169.254/latest/meta-data/" },
          ],
        },
      },
    },
  })

  assert.equal(res.statusCode, 400)
  assert.equal(res.body.error.code, -32602)
  assert.match(res.body.error.message, /SSRF prevention/i)
})

// ---------------------------------------------------------------------------
// GROUP 2: IDENTITY
// ---------------------------------------------------------------------------

test("IDENTITY: Rejects invalid or missing API key", async () => {
  const res = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: { "A2A-Version": "1.0", "X-FIO-VIVO-A2A-Key": "invalid-key-999" },
    body: { jsonrpc: "2.0", id: "1", method: "SendMessage", params: {} },
  })

  assert.equal(res.statusCode, 401)
  assert.equal(res.body.error.code, -32001)
})

test("IDENTITY: Authenticated remote identity becomes ExternalPrincipal only", async () => {
  const res = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: VALID_HEADERS,
    body: {
      jsonrpc: "2.0",
      id: "req-id-1",
      method: "SendMessage",
      params: {
        id: "msg-id-1",
        requestedSkill: "architecture-query",
        message: { parts: [{ text: "Who am I?" }] },
      },
    },
  })

  assert.equal(res.statusCode, 200)
  const textOutput = res.body.result.task.artifacts[0].parts[0].text
  assert.match(textOutput, /Principal: ext-partner-agent-01/)
  assert.doesNotMatch(textOutput, /canonical-worker/)
  assert.doesNotMatch(textOutput, /a2a_external_reader/)
})

// ---------------------------------------------------------------------------
// GROUP 3: AUTHORITY
// ---------------------------------------------------------------------------

test("AUTHORITY: External request always capped at AUTH-0 ceiling with 0 mutations", async () => {
  const res = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: VALID_HEADERS,
    body: {
      jsonrpc: "2.0",
      id: "req-auth-1",
      method: "SendMessage",
      params: {
        id: "msg-auth-1",
        requestedSkill: "architecture-query",
        message: { parts: [{ text: "Execute write operation" }] },
      },
    },
  })

  assert.equal(res.statusCode, 200)
  const dataOutput = res.body.result.task.artifacts[0].parts[1].data
  assert.equal(dataOutput.max_grant, "AUTH-0")
  assert.equal(dataOutput.mutations_allowed, 0)
})

// ---------------------------------------------------------------------------
// GROUP 4: DISCLOSURE
// ---------------------------------------------------------------------------

test("DISCLOSURE: AgentCard discovery contains 0 internal detail leakage", async () => {
  const res = await handleGatewayRequest({
    method: "GET",
    path: "/.well-known/agent-card.json",
  })

  assert.equal(res.statusCode, 200)
  const leakage = validateDiscoveryNoLeakage(res.body)
  assert.equal(leakage.valid, true, `Leakage detected: ${leakage.violations.join(", ")}`)
})

test("DISCLOSURE: Task response artifacts contain 0 internal detail leakage", async () => {
  const res = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: VALID_HEADERS,
    body: {
      jsonrpc: "2.0",
      id: "req-disc-1",
      method: "SendMessage",
      params: {
        id: "msg-disc-1",
        requestedSkill: "architecture-query",
        message: { parts: [{ text: "Query system details" }] },
      },
    },
  })

  assert.equal(res.statusCode, 200)
  const task = res.body.result.task
  const leakage = validateSanitizedOutput(task.artifacts, task.metadata.assurance)
  assert.equal(leakage.valid, true, `Leakage detected: ${leakage.violations.join(", ")}`)
})

// ---------------------------------------------------------------------------
// GROUP 5: EXECUTION
// ---------------------------------------------------------------------------

test("EXECUTION: Pipeline executes end-to-end and returns TASK_STATE_COMPLETED", async () => {
  const res = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: VALID_HEADERS,
    body: {
      jsonrpc: "2.0",
      id: "req-exec-1",
      method: "SendMessage",
      params: {
        id: "msg-exec-1",
        requestedSkill: "architecture-query",
        message: { parts: [{ text: "Full pipeline execution test" }] },
      },
    },
  })

  assert.equal(res.statusCode, 200)
  assert.equal(res.body.result.task.status.state, "TASK_STATE_COMPLETED")
  assert.equal(res.body.result.task.metadata.assurance.verified, true)
  assert.equal(res.body.result.task.metadata.assurance.assurance_level, "P5_GOVERNED")
})

// ---------------------------------------------------------------------------
// GROUP 6: OUTPUT
// ---------------------------------------------------------------------------

test("OUTPUT: Returns valid official A2A JSON-RPC 2.0 structure with Task & Artifacts", async () => {
  const res = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: VALID_HEADERS,
    body: {
      jsonrpc: "2.0",
      id: "req-out-1",
      method: "SendMessage",
      params: {
        id: "msg-out-1",
        requestedSkill: "architecture-query",
        message: { parts: [{ text: "Test output format" }] },
      },
    },
  })

  assert.equal(res.statusCode, 200)
  assert.equal(res.body.jsonrpc, "2.0")
  assert.equal(res.body.id, "req-out-1")
  assert.ok(res.body.result.task)
  assert.ok(Array.isArray(res.body.result.task.artifacts))
  assert.ok(res.body.result.task.artifacts.length > 0)
  assert.ok(res.body.result.task.artifacts[0].parts)
})
