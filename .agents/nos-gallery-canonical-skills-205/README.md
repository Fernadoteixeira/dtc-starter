# nos-gallery Canonical Skills Atlas

This package contains **205 atomic canonical skills** derived from the direct dependency baseline of `Fernadoteixeira/nos-gallery`.

## Scope

- 205 package-scoped atomic skills
- 72 direct dependencies
- 8 capability domains
- No assumption of prior incorporation
- One `SKILL.md` per capability
- JSON and CSV manifests with checksums
- Package and domain indexes

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
templates/
  orchestration-skill-template.md
```

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
