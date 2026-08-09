/**
 * canonical-telemetry-lib.mjs
 *
 * H6 / W5 #46 — FIO-VIVO Vendor-Neutral OpenTelemetry Substrate Helper
 *
 * Provides structured trace spans, metric counters, and sanitized event
 * logging for the FIO-VIVO Agentic Fabric.
 *
 * INVARIANTS:
 *   - TELEMETRY TRACKS EXECUTION; TELEMETRY NEVER EXPOSES SECRETS
 *   - All telemetry attributes are sanitized against forbidden keys (API keys, secrets, prompts, stack traces)
 */

import { randomUUID } from "node:crypto"

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
 * Sanitizes attribute key/value pairs to prevent accidental secret leakage
 */
export function sanitizeTelemetryAttributes(attributes = {}) {
  const sanitized = {}
  for (const [key, value] of Object.entries(attributes)) {
    if (FORBIDDEN_KEYS.has(key) || /secret|password|key|token|prompt/i.test(key)) {
      sanitized[key] = "[REDACTED_TELEMETRY_SECRET]"
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

/**
 * Simulates creation of an OpenTelemetry-compliant trace span
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
