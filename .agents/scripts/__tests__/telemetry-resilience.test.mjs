/**
 * telemetry-resilience.test.mjs
 *
 * H6 / W5 #46 OpenTelemetry Substrate Resilience & Failure Isolation Test Suite
 *
 * Tests:
 *   1. Exporter Network Outage Fault Injection (Execution continues intact)
 *   2. Telemetry Invariant: TELEMETRY LOSS != BEHAVIOR CHANGE
 *   3. Telemetry Invariant: OBSERVABILITY != EVIDENCE != AUTH
 *   4. Control-Plane Privacy (Raw fencing tokens/lease IDs sanitized before export)
 */

import { test } from "node:test"
import assert from "node:assert/strict"
import { createHash } from "node:crypto"

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

// Simulated Task Capsule Executor wrapped in Telemetry Substrate
export function executeTaskCapsuleWithTelemetry(capsule, exporter) {
  const result = {
    taskId: capsule.taskId,
    status: "EXECUTED",
    writeSetGranted: false, // Telemetry NEVER grants write_set
    output: capsule.inputData ? `Processed: ${capsule.inputData}` : "Success"
  }

  // Telemetry Emission Step wrapped in Fail-Safe Handler (#46 Fault-Isolation Law)
  try {
    const sanitizedLeaseHash = capsule.leaseId ? createHash("sha256").update(capsule.leaseId).digest("hex") : null
    const sanitizedFencingHash = capsule.fencingToken ? createHash("sha256").update(capsule.fencingToken).digest("hex") : null

    exporter.exportSpan({
      name: "fabric.task_capsule.execute",
      attributes: {
        "fabric.task_id": capsule.taskId,
        "fabric.task_capsule_digest": createHash("sha256").update(JSON.stringify(capsule)).digest("hex"),
        "fabric.sanitized_lease_hash": sanitizedLeaseHash,
        "fabric.sanitized_fencing_hash": sanitizedFencingHash,
        "fabric.operation_type": "task"
      }
    })
  } catch (err) {
    // FAIL-SAFE CATCH: Telemetry outage is logged locally but NEVER alters execution flow
    console.warn(`[TELEMETRY_OUTAGE_CAPTURED] ${err.message}`)
  }

  return result
}

// ---------------------------------------------------------------------------
// TEST 1: Exporter Outage Fault Injection
// ---------------------------------------------------------------------------
test("W5 #46: Exporter network outage does NOT interrupt task capsule execution (FAIL-SAFE)", () => {
  const failingExporter = new FaultInjectableTelemetryExporter({ outage: true })
  const capsule = { taskId: "TASK-TEST-001", inputData: "Hello FIO-VIVO" }

  // Execute capsule under simulated total telemetry exporter outage
  const res = executeTaskCapsuleWithTelemetry(capsule, failingExporter)

  assert.equal(res.status, "EXECUTED")
  assert.equal(res.output, "Processed: Hello FIO-VIVO")
  assert.equal(failingExporter.exportedSpans.length, 0)
})

// ---------------------------------------------------------------------------
// TEST 2: TELEMETRY LOSS != BEHAVIOR CHANGE
// ---------------------------------------------------------------------------
test("W5 #46: Telemetry outage produces identical return payload to healthy state", () => {
  const healthyExporter = new FaultInjectableTelemetryExporter({ outage: false })
  const failingExporter = new FaultInjectableTelemetryExporter({ outage: true })
  const capsule = { taskId: "TASK-TEST-002", inputData: "Deterministic Input" }

  const healthyRes = executeTaskCapsuleWithTelemetry(capsule, healthyExporter)
  const failingRes = executeTaskCapsuleWithTelemetry(capsule, failingExporter)

  assert.deepEqual(healthyRes, failingRes, "Execution result must be identical regardless of telemetry state")
})

// ---------------------------------------------------------------------------
// TEST 3: OBSERVABILITY != EVIDENCE != AUTH
// ---------------------------------------------------------------------------
test("W5 #46: Telemetry span generation NEVER grants write-set or satisfies AUTH gate", () => {
  const healthyExporter = new FaultInjectableTelemetryExporter({ outage: false })
  const capsule = { taskId: "TASK-TEST-003" }

  const res = executeTaskCapsuleWithTelemetry(capsule, healthyExporter)
  assert.equal(res.writeSetGranted, false, "Telemetry emission must NEVER grant write-set")
  assert.equal(healthyExporter.exportedSpans.length, 1)
})

// ---------------------------------------------------------------------------
// TEST 4: Control-Plane Privacy Sanitization
// ---------------------------------------------------------------------------
test("W5 #46: Control-plane lease IDs and fencing tokens are sanitized before export", () => {
  const exporter = new FaultInjectableTelemetryExporter({ outage: false })
  const rawLeaseId = "LEASE-SECRET-PID-1234"
  const rawFencingToken = "FENCING-TOKEN-9999"

  executeTaskCapsuleWithTelemetry({ taskId: "TASK-SEC-004", leaseId: rawLeaseId, fencingToken: rawFencingToken }, exporter)

  const span = exporter.exportedSpans[0]
  assert.ok(span.attributes["fabric.sanitized_lease_hash"])
  assert.ok(span.attributes["fabric.sanitized_fencing_hash"])
  assert.notEqual(span.attributes["fabric.sanitized_lease_hash"], rawLeaseId)
  assert.notEqual(span.attributes["fabric.sanitized_fencing_hash"], rawFencingToken)
})
