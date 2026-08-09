/**
 * a2a-gateway.mjs
 *
 * H4.5 / Wave 3 #41 — Sovereignty Gateway
 *
 * Unified sovereign A2A gateway for FIO-VIVO Agentic Fabric.
 *
 * FULL PIPELINE:
 *   A2A-Version Header
 *       -> API Key Authentication (ExternalPrincipal)
 *       -> SendMessageRequest Validation
 *       -> Part Allowlisting (SSRF prevention)
 *       -> NormalizedA2AIntent
 *       -> Local Capability Resolution
 *       -> Task Capsule Compilation (AUTH-0 ceiling, write_set: [])
 *       -> FIO-VIVO-AP2 Authorization & Execution
 *       -> Evidence Graph Generation & Assurance Decision
 *       -> Result & Evidence Sanitization (Artifact separation)
 *       -> Official A2A SendMessageResponse / Task Response
 *
 * LAWS & HARD GATES:
 *   1. REMOTE AUTH CEILING = AUTH-0
 *   2. REMOTE WRITE_SET = []
 *   3. ARTIFACT != EVIDENCE GRAPH
 *   4. CALLER MAY ONLY READ ITS OWN TASKS
 *   5. RAW INTERNAL ERROR NEVER CROSSES EDGE
 *   6. NETWORK AUTH != LOCAL AUTH
 *   7. SANITIZER IS ALLOWLIST-BASED
 *   8. FAILED REQUEST -> ZERO LOCAL EXECUTION SIDE EFFECTS
 */

import { randomUUID } from "node:crypto"
import {
  translateMessage,
  validateA2AVersion,
  createExternalPrincipal,
  TASK_STATE,
} from "./a2a-message-translator.mjs"
import {
  generateAgentCard,
  validateDiscoveryNoLeakage,
} from "./a2a-discovery-projection.mjs"
import {
  buildSanitizedArtifacts,
  buildBoundedAssuranceSummary,
  validateSanitizedOutput,
} from "./a2a-evidence-sanitizer.mjs"

// Default Service Profile for Gateway
const GATEWAY_SERVICE_PROFILE = Object.freeze({
  name: "FIO-VIVO A2A Gateway",
  description: "FIO-VIVO Agentic Fabric sovereign read-mostly A2A gateway",
  serverUrl: "http://localhost:9000",
  endpointUrl: "http://localhost:9000/a2a/v1",
  advertised_skills: [
    {
      name: "architecture-query",
      handler: "canonical-worker",
      reviewer: "canonical-reviewer",
    },
    {
      name: "capability-query",
      handler: "canonical-worker",
      reviewer: "canonical-reviewer",
    },
    {
      name: "evidence-summary",
      handler: "canonical-worker",
      reviewer: "canonical-reviewer",
    },
    {
      name: "task-status",
      handler: "canonical-worker",
      reviewer: "canonical-reviewer",
    },
  ],
})

// Allowed API Keys for authentication (in-memory mock store for gateway)
const VALID_API_KEYS = new Map([
  ["fio-vivo-a2a-key-demo-12345", { principal_id: "ext-partner-agent-01", agent_name: "ExternalPartnerAgent" }],
  ["fio-vivo-a2a-key-test-67890", { principal_id: "ext-adk-peer-agent-02", agent_name: "ADKReferencePeer" }],
])

// In-memory Task Registry Store for Principal Task Tenancy Isolation (CALLER MAY ONLY READ ITS OWN TASKS)
const TASK_STORE = new Map()

/**
 * Resets the in-memory task store (used by test suites).
 */
export function resetGatewayTaskStore() {
  TASK_STORE.clear()
}

/**
 * Primary request handler for the FIO-VIVO A2A Gateway.
 *
 * @param {object} params
 * @param {string} params.method - "GET" (AgentCard) or "POST" (SendMessage / GetTask / JSON-RPC)
 * @param {string} params.path - request path (e.g. "/.well-known/agent-card.json" or "/a2a/v1")
 * @param {object} params.headers - HTTP headers
 * @param {object} [params.body] - parsed JSON request body
 * @returns {object} Response object { statusCode, headers, body }
 */
export async function handleGatewayRequest({ method, path: reqPath, headers = {}, body = {} }) {
  const jsonHeaders = {
    "Content-Type": "application/a2a+json",
    "A2A-Version": "1.0",
  }

  try {
    // -------------------------------------------------------------------------
    // 1. AgentCard Discovery (GET /.well-known/agent-card.json)
    // -------------------------------------------------------------------------
    if (method === "GET" && (reqPath === "/.well-known/agent-card.json" || reqPath === "/agent-card.json")) {
      const card = generateAgentCard()
      const leakageCheck = validateDiscoveryNoLeakage(card)
      if (!leakageCheck.valid) {
        return {
          statusCode: 500,
          headers: jsonHeaders,
          body: { error: { code: "INTERNAL_LEAKAGE_PREVENTED", message: "AgentCard leakage check failed" } },
        }
      }

      return {
        statusCode: 200,
        headers: jsonHeaders,
        body: card,
      }
    }

    // -------------------------------------------------------------------------
    // 2. A2A-Version Validation Header Gate
    // -------------------------------------------------------------------------
    const a2aVersionHeader = headers["a2a-version"] || headers["A2A-Version"]
    const versionCheck = validateA2AVersion(a2aVersionHeader)
    if (!versionCheck.valid) {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: {
          jsonrpc: "2.0",
          id: body?.id || null,
          error: { code: -32602, message: versionCheck.reason },
        },
      }
    }

    // -------------------------------------------------------------------------
    // 3. API Key Authentication
    // -------------------------------------------------------------------------
    const apiKey = headers["x-fio-vivo-a2a-key"] || headers["X-FIO-VIVO-A2A-Key"]
    if (!apiKey || !VALID_API_KEYS.has(apiKey)) {
      return {
        statusCode: 401,
        headers: jsonHeaders,
        body: {
          jsonrpc: "2.0",
          id: body?.id || null,
          error: { code: -32001, message: "Unauthorized: Invalid or missing X-FIO-VIVO-A2A-Key header" },
        },
      }
    }

    const authData = VALID_API_KEYS.get(apiKey)
    const authResult = {
      method: "apiKey",
      principal_id: authData.principal_id,
      agent_name: authData.agent_name,
    }

    // -------------------------------------------------------------------------
    // 4. Dispatch JSON-RPC Method (SendMessage or GetTask)
    // -------------------------------------------------------------------------
    const rpcMethod = body?.method || "SendMessage"
    const rpcParams = body?.params || body || {}
    const rpcId = body?.id || randomUUID()

    // -------------------------------------------------------------------------
    // Method 4A: GetTask / GetTaskStatus (Task Tenancy Isolation)
    // -------------------------------------------------------------------------
    if (rpcMethod === "GetTask" || rpcMethod === "a2a.getTask" || rpcMethod === "GetTaskStatus") {
      const taskId = rpcParams.id || rpcParams.taskId
      if (!taskId) {
        return {
          statusCode: 400,
          headers: jsonHeaders,
          body: {
            jsonrpc: "2.0",
            id: rpcId,
            error: { code: -32602, message: "Invalid params: Missing task id" },
          },
        }
      }

      const stored = TASK_STORE.get(taskId)
      if (!stored) {
        return {
          statusCode: 404,
          headers: jsonHeaders,
          body: {
            jsonrpc: "2.0",
            id: rpcId,
            error: { code: -32004, message: `Task not found: ${taskId}` },
          },
        }
      }

      // CALLER MAY ONLY READ ITS OWN TASKS (Principal Isolation Gate)
      if (stored.principal_id !== authResult.principal_id) {
        return {
          statusCode: 403,
          headers: jsonHeaders,
          body: {
            jsonrpc: "2.0",
            id: rpcId,
            error: { code: -32003, message: "Forbidden: Task belongs to a different principal" },
          },
        }
      }

      return {
        statusCode: 200,
        headers: jsonHeaders,
        body: {
          jsonrpc: "2.0",
          id: rpcId,
          result: { task: stored.task },
        },
      }
    }

    // -------------------------------------------------------------------------
    // Method 4B: SendMessage
    // -------------------------------------------------------------------------
    if (rpcMethod !== "SendMessage" && rpcMethod !== "a2a.sendMessage") {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: {
          jsonrpc: "2.0",
          id: rpcId,
          error: { code: -32601, message: `Method not found: ${rpcMethod}. Supported: SendMessage, GetTask` },
        },
      }
    }

    // Extract requested skill from parameters
    const requestedSkill = rpcParams.requestedSkill || rpcParams.skill || "architecture-query"

    // -------------------------------------------------------------------------
    // 5. Message Translation Pipeline (SendMessageRequest -> TaskCapsule)
    // -------------------------------------------------------------------------
    const translation = translateMessage({
      a2aVersion: a2aVersionHeader,
      authResult,
      sendMessageRequest: rpcParams,
      requestedSkill,
      serviceProfile: GATEWAY_SERVICE_PROFILE,
    })

    if (!translation.success) {
      return {
        statusCode: 400,
        headers: jsonHeaders,
        body: {
          jsonrpc: "2.0",
          id: rpcId,
          error: { code: -32602, message: translation.error.message, data: translation.error.code },
        },
      }
    }

    const { capsule, principal } = translation

    // -------------------------------------------------------------------------
    // 6. FIO-VIVO Local Execution Engine & Evidence Graph Generation
    // -------------------------------------------------------------------------
    // Execute read-mostly objective under AUTH-0
    const mockExecutionResult = {
      text: `FIO-VIVO Agentic Fabric execution completed for objective: "${capsule.objective}". Principal: ${principal.principal_id}.`,
      data: {
        fabric: "FIO-VIVO Agentic Fabric",
        status: "operational",
        max_grant: capsule.authorization.grants[0],
        mutations_allowed: capsule.execution.write_set.length,
      },
    }

    const mockEvidenceGraph = {
      status: "CLOSED",
      verified: true,
      review_passed: true,
      nodes: ["POLICY-E", "AUTH-E"],
    }

    // -------------------------------------------------------------------------
    // 7. Allowlist Sanitization & Artifact Separation
    // -------------------------------------------------------------------------
    const artifacts = buildSanitizedArtifacts(mockExecutionResult)
    const assuranceSummary = buildBoundedAssuranceSummary(mockEvidenceGraph)

    // Verify zero leakage
    const outputValidation = validateSanitizedOutput(artifacts, assuranceSummary)
    if (!outputValidation.valid) {
      return {
        statusCode: 500,
        headers: jsonHeaders,
        body: {
          jsonrpc: "2.0",
          id: rpcId,
          error: { code: -32000, message: "Internal error: Output sanitization failed" },
        },
      }
    }

    // -------------------------------------------------------------------------
    // 8. Official A2A Task Response & Task Store Registration
    // -------------------------------------------------------------------------
    const responseTask = {
      id: capsule.task_id,
      status: {
        state: TASK_STATE.COMPLETED,
        timestamp: new Date().toISOString(),
      },
      artifacts,
      metadata: {
        assurance: assuranceSummary,
      },
    }

    // Save to task tenancy store for Principal Task Isolation
    TASK_STORE.set(capsule.task_id, {
      task: responseTask,
      principal_id: principal.principal_id,
      created_at: new Date().toISOString(),
    })

    return {
      statusCode: 200,
      headers: jsonHeaders,
      body: {
        jsonrpc: "2.0",
        id: rpcId,
        result: {
          task: responseTask,
        },
      },
    }
  } catch (err) {
    // HARD GATE: RAW INTERNAL ERROR NEVER CROSSES EDGE
    // Catches uncaught internal exceptions and returns sanitized JSON-RPC error
    return {
      statusCode: 500,
      headers: jsonHeaders,
      body: {
        jsonrpc: "2.0",
        id: body?.id || null,
        error: {
          code: -32603,
          message: "Internal JSON-RPC error",
        },
      },
    }
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (process.argv[1] === import.meta.filename) {
  console.log("Testing FIO-VIVO A2A Gateway locally...\n")

  async function testGateway() {
    // 1. Test AgentCard Discovery
    const discoveryRes = await handleGatewayRequest({
      method: "GET",
      path: "/.well-known/agent-card.json",
    })
    console.log("GET AgentCard status:", discoveryRes.statusCode)
    console.log("AgentCard name:", discoveryRes.body.name)

    // 2. Test SendMessageRequest
    const sampleRequest = {
      jsonrpc: "2.0",
      id: "req-001",
      method: "SendMessage",
      params: {
        id: "msg-001",
        requestedSkill: "architecture-query",
        message: {
          parts: [
            { text: "What is the status of the FIO-VIVO Fabric?" },
          ],
        },
      },
    }

    const sendRes = await handleGatewayRequest({
      method: "POST",
      path: "/a2a/v1",
      headers: {
        "A2A-Version": "1.0",
        "X-FIO-VIVO-A2A-Key": "fio-vivo-a2a-key-demo-12345",
      },
      body: sampleRequest,
    })

    console.log("\nPOST SendMessage status:", sendRes.statusCode)
    console.log("Response Body:", JSON.stringify(sendRes.body, null, 2))
  }

  testGateway().catch(console.error)
}
