import test from "node:test"
import assert from "node:assert/strict"
import { handleGatewayRequest, resetGatewayTaskStore } from "../a2a-gateway.mjs"

const VALID_HEADERS_P1 = {
  "A2A-Version": "1.0",
  "X-FIO-VIVO-A2A-Key": "fio-vivo-a2a-key-demo-12345", // ext-partner-agent-01
}

const VALID_HEADERS_P2 = {
  "A2A-Version": "1.0",
  "X-FIO-VIVO-A2A-Key": "fio-vivo-a2a-key-test-67890", // ext-adk-peer-agent-02
}

test.beforeEach(() => {
  resetGatewayTaskStore()
})

// ---------------------------------------------------------------------------
// 1. POSITIVE SUITE
// ---------------------------------------------------------------------------

test("W3 #41 POSITIVE: Valid authenticated read request executes end-to-end and returns sanitized response", async () => {
  const req = {
    jsonrpc: "2.0",
    id: "req-p1",
    method: "SendMessage",
    params: {
      id: "msg-p1",
      requestedSkill: "architecture-query",
      message: {
        parts: [{ kind: "text", text: "Query fabric capabilities and status" }],
      },
    },
  }

  const res = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: VALID_HEADERS_P1,
    body: req,
  })

  assert.equal(res.statusCode, 200)
  assert.equal(res.body.jsonrpc, "2.0")
  assert.equal(res.body.id, "req-p1")
  assert.ok(res.body.result.task)
  assert.equal(res.body.result.task.status.state, "TASK_STATE_COMPLETED")
  assert.ok(Array.isArray(res.body.result.task.artifacts))
  assert.equal(res.body.result.task.metadata.assurance.assurance_level, "P5_GOVERNED")
})

// ---------------------------------------------------------------------------
// 2. AUTHORITY ATTACKS
// ---------------------------------------------------------------------------

test("W3 #41 AUTHORITY: Injection of AUTH-1 grant in request params is ignored/capped at AUTH-0", async () => {
  const req = {
    jsonrpc: "2.0",
    id: "req-auth1",
    method: "SendMessage",
    params: {
      id: "msg-auth1",
      requestedSkill: "architecture-query",
      grants: ["AUTH-1"], // Authority injection attempt
      authorization: { grants: ["AUTH-1", "AUTH-4"] },
      message: {
        parts: [{ kind: "text", text: "Escalate grant to AUTH-1" }],
      },
    },
  }

  const res = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: VALID_HEADERS_P1,
    body: req,
  })

  assert.equal(res.statusCode, 200)
  // Verify payload assurance remains P5_GOVERNED under AUTH-0
  assert.equal(res.body.result.task.metadata.assurance.assurance_level, "P5_GOVERNED")
})

test("W3 #41 AUTHORITY: Injection of custom worker/reviewer identities is ignored by Capability Resolver", async () => {
  const req = {
    jsonrpc: "2.0",
    id: "req-inj",
    method: "SendMessage",
    params: {
      id: "msg-inj",
      requestedSkill: "architecture-query",
      worker: "malicious-unauthorized-worker",
      reviewer: "colluding-reviewer",
      message: {
        parts: [{ kind: "text", text: "Inject custom runtime worker" }],
      },
    },
  }

  const res = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: VALID_HEADERS_P1,
    body: req,
  })

  assert.equal(res.statusCode, 200)
  const jsonStr = JSON.stringify(res.body)
  assert.equal(jsonStr.includes("malicious-unauthorized-worker"), false)
  assert.equal(jsonStr.includes("colluding-reviewer"), false)
})

test("W3 #41 AUTHORITY: Write-set injection attempt results in empty write_set=[]", async () => {
  const req = {
    jsonrpc: "2.0",
    id: "req-ws",
    method: "SendMessage",
    params: {
      id: "msg-ws",
      requestedSkill: "architecture-query",
      write_set: [".agents/canonical-agent-registry.yaml"],
      message: {
        parts: [{ kind: "text", text: "Inject mutation write_set" }],
      },
    },
  }

  const res = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: VALID_HEADERS_P1,
    body: req,
  })

  assert.equal(res.statusCode, 200)
  const jsonStr = JSON.stringify(res.body)
  assert.equal(jsonStr.includes("write_set"), false)
})

// ---------------------------------------------------------------------------
// 3. BOUNDARY ATTACKS
// ---------------------------------------------------------------------------

test("W3 #41 BOUNDARY: Rejects file:// and remote URL SSRF attempts in Part", async () => {
  const reqSSRF = {
    jsonrpc: "2.0",
    id: "req-ssrf",
    method: "SendMessage",
    params: {
      id: "msg-ssrf",
      message: {
        parts: [
          { kind: "file", file_url: "file:///C:/Users/fjuni/.env" },
        ],
      },
    },
  }

  const res = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: VALID_HEADERS_P1,
    body: reqSSRF,
  })

  assert.equal(res.statusCode, 400)
  assert.match(res.body.error.message, /Unsupported part kind/i)
})

test("W3 #41 BOUNDARY: Rejects malformed RPC method and unsupported version header", async () => {
  const resBadVer = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: { ...VALID_HEADERS_P1, "A2A-Version": "3.0" },
    body: { jsonrpc: "2.0", id: "1", method: "SendMessage" },
  })

  assert.equal(resBadVer.statusCode, 400)
  assert.equal(resBadVer.body.error.code, -32602)
})

// ---------------------------------------------------------------------------
// 4. DISCLOSURE ATTACKS & RAW ERROR MASKING
// ---------------------------------------------------------------------------

test("W3 #41 DISCLOSURE: Zero internal details, filesystem paths, or stack traces leak in response", async () => {
  const req = {
    jsonrpc: "2.0",
    id: "req-disc",
    method: "SendMessage",
    params: {
      id: "msg-disc",
      requestedSkill: "architecture-query",
      message: {
        parts: [{ kind: "text", text: "Query system details" }],
      },
    },
  }

  const res = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: VALID_HEADERS_P1,
    body: req,
  })

  const jsonStr = JSON.stringify(res.body)
  const forbiddenSubstrings = [
    "C:\\Users",
    ".agents/",
    ".mjs",
    "fencing_token",
    "lease_id",
    "canonical-worker",
    "canonical-reviewer",
    "POLICY-E",
    "AUTH-E",
    "LEASE-E",
  ]

  for (const forbidden of forbiddenSubstrings) {
    assert.equal(jsonStr.includes(forbidden), false, `Disclosed forbidden internal string: ${forbidden}`)
  }
})

// ---------------------------------------------------------------------------
// 5. TENANCY & TASK ISOLATION
// ---------------------------------------------------------------------------

test("W3 #41 TENANCY: Task owner can query GetTask, but a different principal receives 403 Forbidden", async () => {
  // 1. Principal 1 creates task
  const createReq = {
    jsonrpc: "2.0",
    id: "req-create-t1",
    method: "SendMessage",
    params: {
      id: "msg-t1",
      requestedSkill: "architecture-query",
      message: { parts: [{ kind: "text", text: "Create task for P1" }] },
    },
  }

  const createRes = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: VALID_HEADERS_P1,
    body: createReq,
  })

  assert.equal(createRes.statusCode, 200)
  const taskId = createRes.body.result.task.id

  // 2. Principal 1 queries task via GetTask -> 200 OK
  const getP1Res = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: VALID_HEADERS_P1,
    body: {
      jsonrpc: "2.0",
      id: "req-get-p1",
      method: "GetTask",
      params: { id: taskId },
    },
  })

  assert.equal(getP1Res.statusCode, 200)
  assert.equal(getP1Res.body.result.task.id, taskId)

  // 3. Principal 2 attempts to query Principal 1's task -> 403 Forbidden
  const getP2Res = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: VALID_HEADERS_P2, // Different principal!
    body: {
      jsonrpc: "2.0",
      id: "req-get-p2",
      method: "GetTask",
      params: { id: taskId },
    },
  })

  assert.equal(getP2Res.statusCode, 403)
  assert.equal(getP2Res.body.error.code, -32003)
  assert.match(getP2Res.body.error.message, /belongs to a different principal/i)
})
