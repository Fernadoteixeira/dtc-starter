/**
 * a2a-discovery-projection.mjs
 *
 * H4.2 — Public AgentCard Projection
 *
 * Generates an official A2A 1.0 AgentCard from the FIO-VIVO A2A Service Profile.
 *
 * INVARIANTS:
 *   - Generated from service profile, NOT by exposing internal agent entries
 *   - Internal archetypes, agent IDs, filesystem paths, skill paths, lease
 *     mechanics, fencing tokens, and prompts are NEVER exposed.
 *   - Protocol Version: "1.0", Binding: JSONRPC, Security: apiKey
 */

import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, "../..")

// ---------------------------------------------------------------------------
// Default Service Profile (FIO-VIVO A2A Gateway)
// ---------------------------------------------------------------------------

const DEFAULT_SERVICE_PROFILE = Object.freeze({
  name: "FIO-VIVO A2A Gateway",
  description: "FIO-VIVO Agentic Fabric sovereign read-mostly A2A gateway",
  version: "1.0.0",
  serverUrl: "http://localhost:9000",
  endpointUrl: "http://localhost:9000/a2a/v1",
  advertisedSkills: [
    {
      id: "architecture-query",
      name: "architecture-query",
      description: "Query FIO-VIVO architecture, governance layers, and fabric capabilities",
      tags: ["system", "architecture"],
    },
    {
      id: "capability-query",
      name: "capability-query",
      description: "Query available public skills and service profile endpoints",
      tags: ["capabilities", "discovery"],
    },
    {
      id: "evidence-summary",
      name: "evidence-summary",
      description: "Retrieve bounded P5 evidence summaries for completed tasks",
      tags: ["evidence", "assurance"],
    },
    {
      id: "task-status",
      name: "task-status",
      description: "Check task execution state, status, and safe public deliverables",
      tags: ["tasks", "status"],
    },
  ],
})

// ---------------------------------------------------------------------------
// AgentCard Generator
// ---------------------------------------------------------------------------

/**
 * Generates an official A2A 1.0 AgentCard object from a FIO-VIVO Service Profile.
 *
 * @param {object} [profileOverride]
 * @returns {object} Official A2A AgentCard
 */
export function generateAgentCard(profileOverride = {}) {
  const profile = { ...DEFAULT_SERVICE_PROFILE, ...profileOverride }

  return {
    name: profile.name,
    description: profile.description,
    url: profile.serverUrl,
    version: profile.version,
    supportedInterfaces: [
      {
        protocolBinding: "JSONRPC",
        protocolVersion: "1.0",
        url: profile.endpointUrl,
      },
    ],
    skills: profile.advertisedSkills.map(skill => ({
      id: skill.id,
      name: skill.name,
      description: skill.description,
      tags: skill.tags || [],
    })),
    securitySchemes: {
      apiKey: {
        type: "apiKey",
        name: "X-FIO-VIVO-A2A-Key",
        in: "header",
        description: "FIO-VIVO A2A Access Key",
      },
    },
    security: [
      { apiKey: [] },
    ],
  }
}

/**
 * Validates that a generated AgentCard contains NO internal details or leaks.
 *
 * @param {object} agentCard
 * @returns {{ valid: boolean, violations: string[] }}
 */
export function validateDiscoveryNoLeakage(agentCard) {
  const violations = []
  const serialized = JSON.stringify(agentCard)

  // Forbidden internal patterns
  const forbidden = [
    /\.agents\//,
    /\.mjs/,
    /\.yaml/,
    /\.json/,
    /\/scripts\//,
    /fencing.token/i,
    /lease.?id/i,
    /write.?set/i,
    /invocation.?id/i,
    /host.?session/i,
    /prompt/i,
    /archetype/i,
    /skill.?path/i,
    /hook/i,
    /canonical-worker/i,
    /canonical-reviewer/i,
    /AUTH-4/i,
  ]

  for (const pattern of forbidden) {
    if (pattern.test(serialized)) {
      violations.push(`Leaked internal detail matching pattern: ${pattern}`)
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (process.argv[1] === __filename) {
  const card = generateAgentCard()
  const validation = validateDiscoveryNoLeakage(card)

  console.log(JSON.stringify(card, null, 2))

  if (!validation.valid) {
    console.error("\nLEAKAGE DETECTED:")
    for (const v of validation.violations) {
      console.error(`  - ${v}`)
    }
    process.exit(1)
  }

  console.log(`\nAgentCard Projection: 0 leakage violations. Valid official A2A AgentCard.`)
}

