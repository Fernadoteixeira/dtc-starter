# BB-05 — Release Notes

**Sequence**: Corrective PR series (PR-A → PR-F)
**Date**: 2026-08-06
**Audience**: Stakeholders, reviewers, release engineering

---

## Summary

A post-merge audit of PR #7 found that the governance gate was not respected: review findings were published ~40 seconds **after** the merge. The audit also identified four concrete defects — a false-green CI, pnpm version drift, partial infrastructure bootstrap, and a BB-05 fixture that discarded live data. This release is the corrective response: a stack of six PRs that restore honest CI semantics, add a full runtime contract, make the pipeline reproducible, harden dependencies, reconcile the BB-05 integration, and document everything for review.

## What changed and why

| PR | Branch | What | Why |
|----|--------|------|-----|
| PR-A | `feat/fio-vivo-bb05-medusa-integration` | Removed `--passWithNoTests`, pinned pnpm `10.11.1`, added a `SKIPPED_NO_TESTS` discovery gate | Stop CI from reporting a false PASS when no tests exist |
| PR-B | `pr-b/runtime-contract` | Added migrate, seed, readiness probe, failure classification, per-server log uploads, explicit teardown | Tests now run against a fully initialized backend |
| PR-C | `pr-c/reproducible-pipeline` | Pinned Node `20.18.0`, added `.nvmrc`, tightened `engines.node` | Local and CI environments now match exactly |
| PR-D | `pr-d/dependency-compat` | Reduced vulnerabilities 111 → 19 (critical eliminated, high 57 → 7) via 25 patch/minor overrides; fixed a Next peer dep | Improve supply-chain security without breaking major versions |
| PR-E | `pr-e/bb05-reconciliation` | Gallery hero now renders live Medusa items (price, stock, metadata) instead of a fixture; added `fio-vivo` collection filter with fallback and seed creation | Make BB-05 exercise the real integration path |
| PR-F | `pr-f/qa-release-evidence` | This documentation | Provide release evidence and known-issues register for review |

## Validation

Every PR was independently QA-validated with a **PASS** verdict. Lint, typecheck, and YAML validity were clean across the sequence. No regressions were introduced.

## Known remaining issues (non-blocking)

- Next.js 16.3.1-canary.4 in the storefront (pre-existing; conflicts with `AGENTS.md`).
- 7 HIGH vulnerabilities deferred per the "no major upgrades" constraint.
- Unit test inventory is effectively empty; CI now honestly reports `SKIPPED_NO_TESTS`.
- `backend-logs` and `storefront-logs` artifacts are byte-identical (Playwright interleaves stdout).
- Seed idempotency is partial (try/catch, no pre-check).
- `nos-gallery` submodule has a pre-existing dirty working-tree state.

## Merge guidance

A **merge freeze** is in effect. Review PR-A (#9) first, then merge the stack in order — A → B → C → D → E → F — rebasing each downstream branch onto `main` after the prior merge. Full evidence is in `release-evidence.md`.