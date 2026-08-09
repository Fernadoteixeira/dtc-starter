import test from "node:test"
import assert from "node:assert/strict"
import { handleGatewayRequest } from "../a2a-gateway.mjs"
import { translateMessage } from "../a2a-message-translator.mjs"

const VALID_HEADERS = {
  "A2A-Version": "1.0",
  "X-FIO-VIVO-A2A-Key": "fio-vivo-a2a-key-demo-12345",
}

test("A2A BOUNDARY #39: Valid A2A message compiles ExternalPrincipal task capsule with AUTH-0 and write_set=[]", () => {
  const sendMessageRequest = {
    id: "req-valid-101",
    message: {
      id: "msg-valid-101",
      role: "user",
      parts: [
        {
          kind: "text",
          text: "Query fabric capabilities and architecture guidelines",
        },
      ],
    },
  }

  const result = translateMessage({
    a2aVersion: "1.0",
    authResult: { authenticated: true, keyId: "remote-agent-client-alpha" },
    sendMessageRequest,
    requestedSkill: "architecture-query",
  })

  if (!result.success) console.log("TRANSLATE RESULT ERROR:", result.error)
  assert.equal(result.success, true)
  const capsule = result.capsule

  // 1. Verify ExternalPrincipal mapping & authority ceiling
  assert.equal(capsule.external_principal.principal_id, "remote-agent-client-alpha")
  assert.deepEqual(capsule.authorization.grants, ["AUTH-0"])
  assert.deepEqual(capsule.execution.write_set, [])

  // 2. Verify local worker/reviewer selection
  assert.equal(capsule.worker, "repo-cartographer")
  assert.equal(capsule.reviewer, "code-reviewer")
  assert.notEqual(capsule.worker, capsule.reviewer)
})

test("A2A BOUNDARY #39: Invalid A2A message fails closed without compiling capsule or executing tools", async () => {
  // Unsupported RPC method
  const invalidRes = await handleGatewayRequest({
    method: "POST",
    path: "/a2a/v1",
    headers: VALID_HEADERS,
    body: {
      jsonrpc: "2.0",
      id: "99",
      method: "ExecuteUnauthorizedWrite",
      params: {},
    },
  })

  assert.equal(invalidRes.statusCode, 400)
  assert.equal(invalidRes.body.error.code, -32601)
  assert.equal(invalidRes.body.result, undefined)
})
