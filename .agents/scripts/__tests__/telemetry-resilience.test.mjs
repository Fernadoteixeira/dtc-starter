/**
 * telemetry-resilience.test.mjs
 *
 * H6 / W5 #46 OpenTelemetry Substrate Resilience & Fault Isolation Test Suite
 *
 * Tests:
 *   1. Exporter Network Outage Fault Injection against canonical-telemetry-lib.mjs
 *   2. Telemetry Invariant: TELEMETRY LOSS != BEHAVIOR CHANGE
 *   3. Telemetry Invariant: OBSERVABILITY != EVIDENCE != AUTH
 *   4. Control-Plane Privacy (Raw fencing tokens/lease IDs sanitized before export)
 */

import { test } from "node:test"
import assert from "node:assert/strict"
import {
  createFabricSpan,
  recordFabricSpanWithExporter,
  sanitizeTelemetryAttributes,
  sanitizeControlPlaneId
} from "../canonical-telemetry-lib.mjs"

// Simulated Telemetry Exporter with Fault Injection Capability
export class FaultInjectableTelemetryExporter {
  constructor(options = {}) {
    this.simulatedOutage = options.outage || false
    this.exportedSpans = []
  }

  exportSpan(span) {
    if (this.simulatedOutage) {
      throw new Error("NETWORK_ERROR: OTLP exporter endpoint unreachable")
    }
    this.exportedSpans.push(span)
    return { success: true }
  }
}

// ---------------------------------------------------------------------------
// TEST 1: Exporter Outage Fault Injection via canonical-telemetry-lib.mjs
// ---------------------------------------------------------------------------
test("W5 #46: Exporter network outage does NOT interrupt task capsule execution (FAIL-SAFE)", () => {
  const failingExporter = new FaultInjectableTelemetryExporter({ outage: true })
  
  // Dispatch telemetry span through canonical runtime helper under simulated outage
  const res = recordFabricSpanWithExporter("fabric.task_capsule.execute", {
    "fabric.task_id": "TASK-CANONICAL-001"
  }, failingExporter)

  assert.equal(res.status, "OK")
  assert.equal(res.writeSetGranted, false)
  assert.equal(res.authGranted, false)
  assert.equal(failingExporter.exportedSpans.length, 0)
})

// ---------------------------------------------------------------------------
// TEST 2: TELEMETRY LOSS != BEHAVIOR CHANGE
// ---------------------------------------------------------------------------
test("W5 #46: Telemetry outage produces identical return payload to healthy state", () => {
  const healthyExporter = new FaultInjectableTelemetryExporter({ outage: false })
  const failingExporter = new FaultInjectableTelemetryExporter({ outage: true })

  const healthyRes = recordFabricSpanWithExporter("fabric.task_capsule.execute", { "fabric.task_id": "TASK-002" }, healthyExporter)
  const failingRes = recordFabricSpanWithExporter("fabric.task_capsule.execute", { "fabric.task_id": "TASK-002" }, failingExporter)

  assert.equal(healthyRes.status, failingRes.status)
  assert.equal(healthyRes.writeSetGranted, failingRes.writeSetGranted)
  assert.equal(healthyRes.authGranted, failingRes.authGranted)
})

// ---------------------------------------------------------------------------
// TEST 3: OBSERVABILITY != EVIDENCE != AUTH
// ---------------------------------------------------------------------------
test("W5 #46: Telemetry span generation NEVER grants write-set or satisfies AUTH gate", () => {
  const healthyExporter = new FaultInjectableTelemetryExporter({ outage: false })
  const res = recordFabricSpanWithExporter("fabric.task_capsule.execute", { "fabric.task_id": "TASK-003" }, healthyExporter)

  assert.equal(res.writeSetGranted, false, "Telemetry emission must NEVER grant write-set")
  assert.equal(res.authGranted, false, "Telemetry emission must NEVER grant AUTH")
  assert.equal(healthyExporter.exportedSpans.length, 1)
})

// ---------------------------------------------------------------------------
// TEST 4: Control-Plane Privacy Sanitization in canonical-telemetry-lib.mjs
// ---------------------------------------------------------------------------
test("W5 #46: Control-plane lease IDs and fencing tokens are sanitized via SHA-256 before export", () => {
  const rawLeaseId = "LEASE-SECRET-PID-1234"
  const rawFencingToken = "FENCING-TOKEN-9999"

  const sanitized = sanitizeTelemetryAttributes({
    "fabric.lease_id": rawLeaseId,
    "fabric.fencing_token": rawFencingToken
  })

  assert.ok(sanitized["fabric.lease_id"])
  assert.ok(sanitized["fabric.fencing_token"])
  assert.notEqual(sanitized["fabric.lease_id"], rawLeaseId)
  assert.notEqual(sanitized["fabric.fencing_token"], rawFencingToken)
  assert.equal(sanitized["fabric.lease_id"], sanitizeControlPlaneId(rawLeaseId))
})
