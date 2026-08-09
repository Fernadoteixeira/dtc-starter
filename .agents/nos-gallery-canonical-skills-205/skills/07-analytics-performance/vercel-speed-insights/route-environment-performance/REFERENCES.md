---
kind: canonical-skill-reference-page
status: canonical
source_of_truth: ./SKILL.md
reference_policy: ../../../../manifest/reference-policy.md
package_reference_registry: ../../../../manifest/package-reference-registry.md
---

# Canonical References

This page is the reference companion for the sibling [`SKILL.md`](./SKILL.md).

## Local canonical sources

- [`SKILL.md`](./SKILL.md) — capability contract, package, package version, workflow, guardrails and evidence requirements.
- [`skills.json`](../../../../manifest/skills.json) — canonical capability identity and checksum registry.
- [`package-reference-registry.md`](../../../../manifest/package-reference-registry.md) — approved primary documentation roots by package family.
- [`reference-policy.md`](../../../../manifest/reference-policy.md) — rules for source authority, version matching, retrieval and evidence.

## External reference rule

Resolve the `package`, `package_version`, `capability_id`, `slug` and `title` from the sibling `SKILL.md`, then consult the matching primary source in the package reference registry. Prefer capability-specific official documentation over package homepages whenever available.

Do not treat a URL, installed dependency, manifest entry or loaded page as proof that the reference was consumed. Actual execution evidence must record the consulted source separately from skill loading.

## Reference evidence contract

When this skill is executed, persist reference evidence with at least:

```yaml
capability_id: <from SKILL.md>
package: <from SKILL.md>
package_version: <from SKILL.md>
reference_title: <official page title>
reference_url: <primary source URL>
reference_authority: official-docs | official-repository | standards-body
version_scope: <version or compatibility scope>
retrieved_at: <ISO-8601>
used_for: <decision, rule, implementation or validation>
evidence_ref: <receipt or artifact reference>
```

## Fail-closed rules

- Prefer official vendor/project documentation and standards bodies.
- Match the documented behavior to the package/version declared by the skill.
- Record redirects, deprecations or version drift explicitly.
- Do not invent or silently repair missing references.
- Do not claim a reference was consulted without execution evidence.
- Keep reference provenance separate from `SKILL-LOAD-E` and `SKILL-CONSUME-E`.
