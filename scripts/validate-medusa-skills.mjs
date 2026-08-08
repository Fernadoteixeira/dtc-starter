#!/usr/bin/env node
/**
 * validate-medusa-skills.mjs
 *
 * Validator for the canonical Medusa agent skills tree at `.agents/skills/medusa/`.
 *
 * Checks:
 *   1. Counts SKILL.md files (excluding provenance/ and original/).
 *   2. Verifies each SKILL.md `name` field matches its parent directory name
 *      and matches the regex `^[a-z0-9-]{1,64}$`.
 *   3. Detects duplicate `name` values.
 *   4. Validates presence of `description` in YAML frontmatter.
 *   5. Resolves relative Markdown links `[...](relative-path)` against the
 *      SKILL.md's directory and checks the target exists.
 *   6. Validates JSON syntax of `provenance/SOURCE.json` and `.vscode/mcp.json`.
 *
 * Exit codes: 0 = all checks pass, 1 = one or more checks failed.
 */

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs"
import { join, dirname, resolve, normalize, isAbsolute } from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const repoRoot = resolve(__dirname, "..")
const skillsRoot = join(repoRoot, ".agents", "skills", "medusa")

let errors = 0
let warnings = 0

function fail(msg) {
  console.error(`  FAIL: ${msg}`)
  errors++
}

function warn(msg) {
  console.warn(`  WARN: ${msg}`)
  warnings++
}

// ---------------------------------------------------------------------------
// 1. Find all SKILL.md files (excluding provenance/ and original/)
// ---------------------------------------------------------------------------
function findSkillFiles(dir, base = dir) {
  const results = []
  if (!existsSync(dir)) return results

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)

    // Skip provenance/ and original/ directories
    if (entry.isDirectory()) {
      if (entry.name === "provenance" || entry.name === "original") continue
      results.push(...findSkillFiles(fullPath, base))
    } else if (entry.isFile() && entry.name === "SKILL.md") {
      results.push(fullPath)
    }
  }
  return results
}

// ---------------------------------------------------------------------------
// 2. Parse YAML frontmatter (minimal — no external deps)
// ---------------------------------------------------------------------------
function parseFrontmatter(content) {
  const lines = content.split(/\r?\n/)
  if (lines.length === 0 || lines[0].trim() !== "---") {
    return { frontmatter: null, body: content }
  }

  const fmLines = []
  let i = 1
  for (; i < lines.length; i++) {
    if (lines[i].trim() === "---") break
    fmLines.push(lines[i])
  }

  if (i >= lines.length) {
    return { frontmatter: null, body: content, error: "Unterminated frontmatter" }
  }

  // Minimal YAML parsing: key: value (single-line), key: "value" (quoted)
  const fm = {}
  for (const line of fmLines) {
    const match = line.match(/^([a-zA-Z_-]+):\s*(.*)$/)
    if (match) {
      const key = match[1]
      let value = match[2]
      // Strip surrounding quotes
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1)
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1)
      }
      fm[key] = value
    }
  }

  const body = lines.slice(i + 1).join("\n")
  return { frontmatter: fm, body }
}

// ---------------------------------------------------------------------------
// 3. Extract relative Markdown links
// ---------------------------------------------------------------------------
const LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g

function extractRelativeLinks(body, filePath) {
  const links = []
  let match
  while ((match = LINK_RE.exec(body)) !== null) {
    const target = match[2].trim()
    // Skip absolute URLs, anchors, and mailto
    if (target.startsWith("http://") || target.startsWith("https://")) continue
    if (target.startsWith("mailto:")) continue
    if (target.startsWith("#")) continue
    // Strip anchor from path
    const pathPart = target.split("#")[0].split("?")[0]
    if (!pathPart) continue
    links.push({ text: match[1], target: pathPart, raw: target })
  }
  return links
}

// ---------------------------------------------------------------------------
// 4. Validate JSON files
// ---------------------------------------------------------------------------
function validateJson(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label}: file not found at ${filePath}`)
    return null
  }
  try {
    const content = readFileSync(filePath, "utf8")
    return JSON.parse(content)
  } catch (e) {
    fail(`${label}: invalid JSON — ${e.message}`)
    return null
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
console.log("=== Medusa Skills Validator ===")
console.log(`Skills root: ${skillsRoot}`)
console.log()

// 4a. Validate SOURCE.json
console.log("[1] Validating SOURCE.json...")
const sourcePath = join(skillsRoot, "provenance", "SOURCE.json")
const sourceData = validateJson(sourcePath, "SOURCE.json")
if (sourceData) {
  if (!sourceData.clone || !sourceData.clone.commit) {
    warn("SOURCE.json: missing clone.commit")
  }
  if (!Array.isArray(sourceData.files)) {
    fail("SOURCE.json: 'files' is not an array")
  } else {
    console.log(`  SOURCE.json: ${sourceData.files.length} file entries`)
    let shaErrors = 0
    for (const entry of sourceData.files) {
      if (!entry.originalPath || typeof entry.originalPath !== "string") {
        shaErrors++
      }
      if (!entry.sha256 || !/^[a-f0-9]{64}$/.test(entry.sha256)) {
        shaErrors++
      }
      if (typeof entry.size !== "number" || entry.size < 0) {
        shaErrors++
      }
    }
    if (shaErrors > 0) {
      fail(`SOURCE.json: ${shaErrors} entries with invalid fields`)
    } else {
      console.log("  All entries valid (path, sha256, size)")
    }
  }
}
console.log()

// 4b. Validate .vscode/mcp.json
console.log("[2] Validating .vscode/mcp.json...")
const mcpPath = join(repoRoot, ".vscode", "mcp.json")
const mcpData = validateJson(mcpPath, ".vscode/mcp.json")
if (mcpData) {
  if (!mcpData.servers || typeof mcpData.servers !== "object") {
    fail(".vscode/mcp.json: missing 'servers' object")
  } else {
    const serverNames = Object.keys(mcpData.servers)
    console.log(`  Servers: ${serverNames.join(", ")}`)
    if (!mcpData.servers["medusa-docs"]) {
      warn(".vscode/mcp.json: no 'medusa-docs' server found")
    } else {
      const srv = mcpData.servers["medusa-docs"]
      if (srv.type !== "http" || !srv.url) {
        fail(".vscode/mcp.json: medusa-docs server missing type or url")
      } else {
        console.log(`  medusa-docs: ${srv.type} ${srv.url}`)
      }
    }
  }
}
console.log()

// 1-3. Find and validate SKILL.md files
console.log("[3] Scanning for SKILL.md files...")
const skillFiles = findSkillFiles(skillsRoot)
console.log(`  Found ${skillFiles.length} SKILL.md file(s)`)

if (skillFiles.length === 0) {
  console.log("  (No SKILL.md files yet — this is expected before canonical skills are created)")
}
console.log()

const nameRegex = /^[a-z0-9-]{1,64}$/
const seenNames = new Map() // name -> filePath
let duplicateCount = 0

for (const skillPath of skillFiles) {
  const relPath = skillPath.substring(skillsRoot.length + 1)
  console.log(`  Checking: ${relPath}`)

  const content = readFileSync(skillPath, "utf8")
  const { frontmatter, body, error: fmError } = parseFrontmatter(content)

  if (fmError) {
    fail(`${relPath}: ${fmError}`)
    continue
  }

  if (!frontmatter) {
    fail(`${relPath}: no YAML frontmatter found`)
    continue
  }

  // Check name field
  const name = frontmatter.name
  if (!name) {
    fail(`${relPath}: missing 'name' in frontmatter`)
  } else {
    // Check regex
    if (!nameRegex.test(name)) {
      fail(`${relPath}: name '${name}' does not match /^[a-z0-9-]{1,64}$/`)
    }

    // Check name == parent directory
    const parentDir = skillPath.split(/[\\/]/).slice(-2, -1)[0]
    if (name !== parentDir) {
      fail(`${relPath}: name '${name}' does not match parent directory '${parentDir}'`)
    }

    // Check duplicates
    if (seenNames.has(name)) {
      fail(`${relPath}: duplicate name '${name}' (also in ${seenNames.get(name)})`)
      duplicateCount++
    } else {
      seenNames.set(name, relPath)
    }
  }

  // Check description field
  if (!frontmatter.description || frontmatter.description.trim() === "") {
    fail(`${relPath}: missing or empty 'description' in frontmatter`)
  }

  // Check relative links
  if (body) {
    const links = extractRelativeLinks(body, skillPath)
    for (const link of links) {
      const linkTarget = normalize(join(dirname(skillPath), link.target))
      // Prevent path traversal outside repo
      const relToRepo = linkTarget.substring(repoRoot.length + 1)
      if (relToRepo.startsWith("..")) {
        fail(`${relPath}: link '${link.raw}' resolves outside repository`)
        continue
      }
      if (!existsSync(linkTarget)) {
        fail(`${relPath}: broken relative link '${link.raw}' -> ${relToRepo}`)
      }
    }
  }
}

console.log()
console.log("=== Summary ===")
console.log(`  SKILL.md files found: ${skillFiles.length}`)
console.log(`  Duplicate names: ${duplicateCount}`)
console.log(`  Errors: ${errors}`)
console.log(`  Warnings: ${warnings}`)

if (errors > 0) {
  console.log("\n  Result: FAIL")
  process.exit(1)
} else {
  console.log("\n  Result: PASS")
  process.exit(0)
}