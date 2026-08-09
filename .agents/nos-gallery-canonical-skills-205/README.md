# nos-gallery Canonical Skills Atlas

This package contains **205 atomic canonical skills** derived from the direct dependency baseline of `Fernadoteixeira/nos-gallery`.

## Scope

- 205 package-scoped atomic skills
- 72 direct dependencies
- 8 capability domains
- No assumption of prior incorporation
- One `SKILL.md` per capability
- One `REFERENCES.md` companion per capability
- JSON and CSV manifests with checksums
- Package and domain indexes
- Fail-closed reference policy and package reference registry

## Directory structure

```text
skills/
  01-web-runtime/
  02-identity-auth/
  03-data-contracts-forms/
  04-radix-ui/
  05-styles-themes-css/
  06-interaction-visualization-ux/
  07-analytics-performance/
  08-quality-engineering/
manifest/
  skills.json
  skills.csv
  domain-summary.json
  package-summary.json
  reference-policy.md
  package-reference-registry.md
scripts/
  validate-references.mjs
templates/
  orchestration-skill-template.md
```

Every capability directory contains:

```text
<capability>/
  SKILL.md
  REFERENCES.md
```

`SKILL.md` remains the executable capability contract. `REFERENCES.md` is the canonical reference entrypoint and evidence contract for documentation consulted during execution. A listed reference is not proof of consumption.

## Reference validation

Run:

```bash
node .agents/nos-gallery-canonical-skills-205/scripts/validate-references.mjs
```

The validator fails closed if any manifest-backed skill lacks its `REFERENCES.md` companion or the required reference-governance markers.

## Canonical counting rule

A skill is an executable capability contract with:

- a specific job to be done;
- explicit inputs and outputs;
- a repeatable workflow;
- guardrails;
- acceptance criteria;
- verification focus;
- evidence and handoff requirements.

Installed packages are not treated as implemented product capabilities.

## Baseline

- Repository: `Fernadoteixeira/nos-gallery`
- Branch baseline: `main`
- Package manager: `pnpm@10.33.2`
- Node.js: `>=20.9.0`
- Generated: `2026-08-04`
- Atomic skill count: `205`
