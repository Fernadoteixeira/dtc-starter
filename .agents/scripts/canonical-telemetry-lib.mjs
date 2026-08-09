/**
 * canonical-telemetry-lib.mjs
 *
 * H6 / W5 #46 — FIO-VIVO Vendor-Neutral OpenTelemetry Substrate Helper
 *
 * Provides structured trace spans, metric counters, sanitized event
 * logging, and fail-safe exporter fault tolerance for the FIO-VIVO Agentic Fabric.
 *
 * LAWS & INVARIANTS:
 *   1. TELEMETRY TRACKS EXECUTION; TELEMETRY NEVER EXPOSES SECRETS
 *   2. TELEMETRY LOSS != BEHAVIOR CHANGE (EXPORTER OUTAGE IS FAIL-SAFE)
 *   3. OBSERVABILITY != EVIDENCE != AUTH
 */

import { createHash, randomUUID } from "node:crypto"

const FORBIDDEN_KEYS = new Set([
  "raw_secret",
  "api_key",
  "private_key",
  "raw_prompt",
  "internal_stack_trace",
  "X-FIO-VIVO-A2A-Key",
  "password",
  "token",
])

/**
 * Sanitizes control plane sensitive IDs (lease_id, fencing_token) via SHA-256 hash
 */
export function sanitizeControlPlaneId(idValue) {
  if (!idValue) return null
  return createHash("sha256").update(String(idValue)).digest("hex")
}

/**
 * Sanitizes attribute key/value pairs to prevent accidental secret leakage
 */
export function sanitizeTelemetryAttributes(attributes = {}) {
  const sanitized = {}
  for (const [key, value] of Object.entries(attributes)) {
    if (key === "fabric.lease_id" || key === "fabric.fencing_token") {
      sanitized[key] = sanitizeControlPlaneId(value)
    } else if (FORBIDDEN_KEYS.has(key) || /secret|password|key|token|prompt/i.test(key)) {
      sanitized[key] = "[REDACTED_TELEMETRY_SECRET]"
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

/**
 * Creates an OpenTelemetry-compliant trace span object
 */
export function createFabricSpan(spanName, attributes = {}) {
  const traceId = randomUUID()
  const spanId = randomUUID().substring(0, 16)
  const startTime = new Date().toISOString()
  const sanitizedAttrs = sanitizeTelemetryAttributes(attributes)

  return {
    traceId,
    spanId,
    name: spanName,
    startTime,
    attributes: sanitizedAttrs,
    status: "OK",
    end(status = "OK") {
      this.endTime = new Date().toISOString()
      this.status = status
      return this
    },
  }
}

/**
 * Fail-safe runtime exporter dispatch wrapper (TELEMETRY LOSS != BEHAVIOR CHANGE)
 */
export function recordFabricSpanWithExporter(spanName, attributes = {}, exporter = null) {
  const span = createFabricSpan(spanName, attributes)
  span.end("OK")

  if (exporter && typeof exporter.exportSpan === "function") {
    try {
      exporter.exportSpan(span)
    } catch (err) {
      // FAIL-SAFE INVARIANT: Telemetry exporter failure is caught locally and NEVER alters runtime execution
      console.warn(`[TELEMETRY_EXPORTER_OUTAGE_CAPTURED] ${err.message}`)
    }
  }

  // OBSERVABILITY != EVIDENCE != AUTH invariant: Telemetry returns 0 grants or write-set access
  return {
    traceId: span.traceId,
    status: span.status,
    writeSetGranted: false,
    authGranted: false
  }
}

/**
 * Metric counter registry
 */
const METRIC_COUNTERS = new Map()

export function recordFabricMetric(metricName, value = 1, labels = {}) {
  const key = `${metricName}:${JSON.stringify(labels)}`
  const current = METRIC_COUNTERS.get(key) || 0
  METRIC_COUNTERS.set(key, current + value)
  return {
    name: metricName,
    value: current + value,
    labels: sanitizeTelemetryAttributes(labels),
  }
}

export function getMetricCounters() {
  return new Map(METRIC_COUNTERS)
}
