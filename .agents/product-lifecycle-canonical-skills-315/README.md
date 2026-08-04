# Product Lifecycle Canonical Skills Atlas

A technology-, language- and industry-agnostic operating system for product lifecycle work.

## Inventory

- **315 atomic canonical skills**
- **78 capability packs**
- **22 product lifecycle domains**
- **24 cross-domain orchestration skills**, not counted as atomic skills

## Design principles

1. Outcomes before tools.
2. Evidence before certainty.
3. Explicit boundaries, owners and decisions.
4. Security, privacy, accessibility, reliability and cost as lifecycle concerns.
5. Verification of real behavior, not artifact existence.
6. Reversible delivery under uncertainty.
7. Observable operation and controlled retirement.

## Structure

```text
skills/<domain>/<capability-pack>/<skill>/SKILL.md
orchestrations/<orchestration>/SKILL.md
manifest/
schemas/
templates/
docs/
checksums/
```

## Counting model

An atomic skill owns one reusable capability contract. Audit, design, implementation, verification, operation, optimization and retirement are lifecycle modes inside the skill, not separate skills.

Generated on `2026-08-04`.
