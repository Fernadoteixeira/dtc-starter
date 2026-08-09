/**
 * canonical-telemetry.test.mjs
 *
 * H6 / W5 #46 — OpenTelemetry Substrate Unit Test Suite
 */

import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { createFabricSpan, recordFabricMetric, sanitizeTelemetryAttributes } from "../canonical-telemetry-lib.mjs"

const CONTRACT_PATH = path.resolve(process.cwd(), ".agents/canonical-telemetry-contract.yaml")

test("W5 #46: canonical-telemetry-contract.yaml exists and parses header", () => {
  assert.ok(fs.existsSync(CONTRACT_PATH), "canonical-telemetry-contract.yaml must exist")
  const content = fs.readFileSync(CONTRACT_PATH, "utf8")
  assert.match(content, /kind:\s*canonical-telemetry-contract/i)
  assert.match(content, /status:\s*active/i)
})

test("W5 #46: sanitizeTelemetryAttributes redacts forbidden secret keys", () => {
  const rawAttrs = {
    "fabric.task_id": "task-123",
    "api_key": "supersecret-key-12345",
    "raw_prompt": "do something malicious",
    "fabric.grant": "AUTH-0",
  }

  const sanitized = sanitizeTelemetryAttributes(rawAttrs)
  assert.equal(sanitized["fabric.task_id"], "task-123")
  assert.equal(sanitized["fabric.grant"], "AUTH-0")
  assert.equal(sanitized["api_key"], "[REDACTED_TELEMETRY_SECRET]")
  assert.equal(sanitized["raw_prompt"], "[REDACTED_TELEMETRY_SECRET]")
})

test("W5 #46: createFabricSpan generates valid trace span", () => {
  const span = createFabricSpan("fabric.task_capsule.execute", {
    "fabric.task_id": "task-456",
    "fabric.worker_agent_id": "worker-1",
  })

  assert.ok(span.traceId, "Span must have traceId")
  assert.ok(span.spanId, "Span must have spanId")
  assert.equal(span.name, "fabric.task_capsule.execute")

  span.end("OK")
  assert.ok(span.endTime, "Span must have endTime after end()")
  assert.equal(span.status, "OK")
})

test("W5 #46: recordFabricMetric records counters correctly", () => {
  const metric = recordFabricMetric("fabric_capsules_total", 1, { status: "COMPLETED" })
  assert.equal(metric.name, "fabric_capsules_total")
  assert.ok(metric.value >= 1)
  assert.equal(metric.labels.status, "COMPLETED")
})
