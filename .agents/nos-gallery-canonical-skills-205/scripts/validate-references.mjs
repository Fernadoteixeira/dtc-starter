import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, "..")
const manifestPath = path.join(root, "manifest", "skills.json")
const skills = JSON.parse(readFileSync(manifestPath, "utf8"))

const REQUIRED_MARKERS = [
  "kind: canonical-skill-reference-page",
  "[SKILL.md](./SKILL.md)",
  "package-reference-registry.md",
  "reference-policy.md",
  "Reference evidence contract",
  "Fail-closed rules"
]

const failures = []
for (const skill of skills) {
  const skillPath = path.join(root, skill.path)
  const referencesPath = path.join(path.dirname(skillPath), "REFERENCES.md")

  if (!existsSync(skillPath)) {
    failures.push(`${skill.capability_id}: missing SKILL.md at ${skill.path}`)
    continue
  }
  if (!existsSync(referencesPath)) {
    failures.push(`${skill.capability_id}: missing REFERENCES.md beside ${skill.path}`)
    continue
  }

  const content = readFileSync(referencesPath, "utf8")
  for (const marker of REQUIRED_MARKERS) {
    if (!content.includes(marker)) {
      failures.push(`${skill.capability_id}: REFERENCES.md missing required marker: ${marker}`)
    }
  }
}

if (failures.length > 0) {
  process.stderr.write(`NO-GO: canonical reference validation failed (${failures.length} findings)\n`)
  for (const failure of failures) process.stderr.write(`- ${failure}\n`)
  process.exitCode = 1
} else {
  process.stdout.write(`GO: ${skills.length}/${skills.length} canonical skills have validated REFERENCES.md companions\n`)
}
