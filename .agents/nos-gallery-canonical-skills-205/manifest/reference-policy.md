# Canonical Reference Policy

This policy governs reference pages for `.agents/nos-gallery-canonical-skills-205`.

## Authority order

Use sources in this order unless the capability explicitly requires a standards body first:

1. Official package/framework documentation.
2. Official project repository documentation maintained by the package owner.
3. Official API/type reference generated from the project source.
4. Applicable standards body documentation such as W3C/WAI, WHATWG, TC39 or Node.js.
5. Package registry metadata only for identity/version corroboration, never as the primary behavioral specification.

Community posts, tutorials, snippets, search-result summaries and generated answers are not canonical references.

## Version discipline

The sibling `SKILL.md` declares `package` and `package_version`. Reference evidence MUST record the documentation version or compatibility scope actually consulted. If current documentation has moved beyond the skill baseline, record the drift instead of silently applying newer behavior.

## Capability specificity

Prefer the narrowest official page that directly governs the skill's capability. A package documentation homepage is an entry point, not sufficient evidence when a capability-specific API or guide exists.

## Retrieval evidence

A loaded URL is not proof of consultation. When an execution materially relies on a reference, record:

- `capability_id`
- `package`
- `package_version`
- official page title
- URL
- authority class
- version/compatibility scope
- retrieval timestamp
- decision or implementation affected
- evidence receipt/artifact reference

Reference evidence is separate from `SKILL-LOAD-E` and `SKILL-CONSUME-E`.

## Fail-closed rules

- Do not fabricate missing documentation URLs.
- Do not promote community mirrors to official authority.
- Do not treat package installation as capability incorporation.
- Do not claim a source was consulted merely because it is listed in `REFERENCES.md`.
- Record redirects, removals, deprecations and version drift.
- If no authoritative source can be resolved, mark the reference gate `BLOCKED` or `UNRESOLVED`.
