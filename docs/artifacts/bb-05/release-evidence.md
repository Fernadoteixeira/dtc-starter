# BB-05 — QA and Release Evidence

**Document**: `docs/artifacts/bb-05/release-evidence.md`
**Branch**: `pr-f/qa-release-evidence` (stacked on `pr-e/bb05-reconciliation`)
**Purpose**: Final QA gate for the corrective PR sequence (PR-A through PR-F). Documents the post-PR-7 audit, every corrective change, validation results, known remaining issues, merge-freeze recommendation, and skills-invocation note.
**Date**: 2026-08-06

---

## A. Post-PR-7 Audit Summary

| Field | Value |
|---|---|
| PR #7 merge time | `2026-08-07T00:30:41Z` |
| Merge commit | `dafc294a823e9a25a14d97a56fb9f924c83122f1` |
| Review finding #1 published | `2026-08-07T00:31:22Z` |
| Review finding #2 published | `2026-08-07T00:31:23Z` |
| Findings lag after merge | ~40 seconds |
| `governance_gate_respected` | **false** |

The review findings were published approximately 40 seconds **after** PR #7 was merged. The governance gate — which requires review approval to land before merge — was not respected.

### Key Audit Findings

1. **False green CI (`--passWithNoTests`)** — The CI workflow passed with zero tests discovered because Jest was invoked with `--passWithNoTests`, turning an absent test suite into an apparent PASS. This masked the fact that no unit tests were executed.
2. **pnpm version drift** — The GitHub Actions workflow hard-coded `pnpm version: "10"` while the repository pins `10.11.1` in `packageManager`. The drift produced lockfile/install inconsistencies across local and CI environments.
3. **Partial infrastructure bootstrap** — The CI pipeline started Medusa and the storefront but did not run migrations, seed data, or a readiness probe. Functional tests therefore ran against an uninitialized backend.
4. **BB-05 fixture override** — The gallery hero client fetched live Medusa items and then discarded them, falling back to a static fixture. The BB-05 scenario was therefore not exercising the real integration path.

### Clarification: DATABASE_URL

`DATABASE_URL` was **not** malformed. The `******` string observed in CI logs was a **display-layer credential redaction mask** applied by the GitHub Actions log sanitizer. The committed patch always carried a well-formed connection string:

```
postgres://postgres:postgres@localhost:5432/postgres
```

No corrective action was required for `DATABASE_URL`.

---

## B. Corrective PR Sequence

The six PRs below are **stacked**: each branch builds on its predecessor. They must be reviewed and merged in order.

### PR-A — Honest CI semantics

| Field | Value |
|---|---|
| Branch | `feat/fio-vivo-bb05-medusa-integration` |
| Commit | `99e1bd0` |
| PR | #9 (OPEN) |
| Scope | Removed `--passWithNoTests`; pinned pnpm to `10.11.1` in CI; added an explicit test-discovery gate that reports `SKIPPED_NO_TESTS` when zero tests are found |
| Validation | **PASS** |

### PR-B — Runtime contract

| Field | Value |
|---|---|
| Branch | `pr-b/runtime-contract` |
| Commit | `82791db` |
| Scope | Added migration step, seed step, readiness contract, failure classification, dedicated `backend-logs` / `storefront-logs` artifact uploads, explicit teardown |
| Validation | **PASS** |

### PR-C — Reproducible pipeline

| Field | Value |
|---|---|
| Branch | `pr-c/reproducible-pipeline` |
| Commit | `125dcb1` |
| Scope | Pinned Node `20.18.0` in CI; created `.nvmrc`; tightened `engines.node`. Frozen-lockfile (`--frozen-lockfile`) was already present and confirmed |
| Validation | **PASS** |

### PR-D — Dependency compatibility and security

| Field | Value |
|---|---|
| Branch | `pr-d/dependency-compat` |
| Commit | `62569c4` |
| Scope | Security audit — vulnerabilities reduced 111 → 19 (critical eliminated, high 57 → 7). Added 25 `pnpm.overrides` entries (all patch/minor, no major jumps). Fixed `gallery-experience` Next peer dependency |
| Validation | **PASS** |

### PR-E — BB-05 functional reconciliation

| Field | Value |
|---|---|
| Branch | `pr-e/bb05-reconciliation` |
| Commit | `88f20f5` |
| Scope | BB-05 functional fix — the gallery hero client now uses live Medusa items (price, stock, metadata) instead of discarding them for a static fixture. Added `fio-vivo` collection filter with graceful fallback. Created the `fio-vivo` collection in the seed script |
| Validation | **PASS** |

### PR-F — QA and release evidence (this PR)

| Field | Value |
|---|---|
| Branch | `pr-f/qa-release-evidence` |
| Commit | (created on this branch) |
| Scope | QA and release evidence documentation only. No source changes |
| Validation | Documentation only |

---

## C. Validation Summary

Each PR was independently validated by the QA process. The matrix below records the verdict and supporting checks for every PR.

| PR | Verdict | Lint | Typecheck | YAML validity | Regressions |
|----|---------|------|-----------|---------------|-------------|
| PR-A | **PASS** | clean | clean | valid | none |
| PR-B | **PASS** | clean | clean | valid | none |
| PR-C | **PASS** | clean | clean | valid (`.nvmrc`, workflow) | none |
| PR-D | **PASS** | clean | clean | valid | none |
| PR-E | **PASS** | clean | clean | n/a (source-only) | none |
| PR-F | n/a (docs) | n/a | n/a | n/a | none |

### Notes on validation

- **Independent QA validation** was performed for each PR after its implementation. Each verdict is **PASS**.
- **Lint and typecheck** were run with the project toolchain and reported no new errors for any PR.
- **YAML validity** was confirmed for every GitHub Actions workflow and configuration file touched by the sequence.
- **No regressions** were introduced: the corrective changes are additive or replacement-in-place and do not alter previously-validated behavior outside their stated scope.
- **Test discovery honesty**: PR-A replaced the false-green `--passWithNoTests` behavior with an explicit `SKIPPED_NO_TESTS` state. The CI job now truthfully reports when zero tests are found rather than claiming success.

---

## D. Known Remaining Issues

These issues are documented for transparency. None block the current sequence, but each carries a recommended follow-up.

1. **Next.js 16.3.1-canary.4 in the storefront (pre-existing).** The storefront runs a canary Next.js release, which conflicts with `AGENTS.md` (documenting Next 15.5). This is a stability risk.
   *Recommendation*: pin to a stable Next 15.5.x release, or formally bless Next 16 with an `AGENTS.md` update and full regression.

2. **7 remaining HIGH vulnerabilities require major version upgrades.** Affected packages: `serialize-javascript` 6 → 7, `vite` 5 → 6, `immutable` 3 → 4, `sharp` 0.34 → 0.35, `react-router` 7 → 8, `uuid` 9 → 11, `esbuild` 0.24 → 0.25.
   These were left unfixed per the explicit "no major upgrades" constraint applied in PR-D.

3. **Unit test inventory is effectively empty.** There are 0 `.unit.spec.ts` files. An adapter test exists as a `.test.js` file but does not match the Jest unit pattern consumed by the CI gate. The CI gate now honestly reports `SKIPPED_NO_TESTS` instead of a false PASS.

4. **`SKIPPED_NO_TESTS` still produces a green job checkmark.** The state exits 0 with an explicit "NOT a PASS" summary printed in the log. A stricter hard-fail-on-zero-tests policy can be introduced once unit tests exist.

5. **`backend-logs` and `storefront-logs` CI artifacts are byte-identical.** The Playwright `webServer` configuration interleaves both servers' stdout into a single stream, so the two uploaded artifacts contain the same bytes. True per-server log separation requires changing `playwright.config.ts`.

6. **Seed idempotency is partial.** The `fio-vivo` collection creation in the seed script is wrapped in `try/catch` (it warns on re-seed) but does not check for an existing collection first. A fully idempotent implementation should query before creating.

7. **`nos-gallery` submodule has a pre-existing dirty working-tree state.** This is unrelated to any PR in this sequence and predates the corrective work.

---

## E. Merge Freeze Recommendation

A **merge freeze** is currently in effect. No PRs should be merged, pushed, or opened during this window.

- **PR-A (#9) is OPEN** and is the entry point of the stack. It should be reviewed first.
- The PRs are **stacked**: PR-B builds on PR-A, PR-C on PR-B, and so on through PR-F.
- **Recommended merge order**: A → B → C → D → E → F.
- **After each merge**, downstream branches should be **rebased onto `main`** before their own merge, to keep the history linear and conflict-free.
- PR-F (this PR) is documentation-only and contains no source changes. It should be merged last, after all functional corrections have landed.

---

## F. Skills Invocation Note

- The corrective sequence was executed using **subagent delegation** (SWE and QA agents).
- **No Medusa agentic skills** (`building-with-medusa`, `building-storefronts`, etc.) were formally invoked during this sequence.
- The work relied on **direct code investigation** and **Medusa v2 conventions verified from the installed source** in `node_modules/@medusajs/*`. Where Medusa APIs were touched (e.g. the collection filter and seed script in PR-E), behavior was confirmed against the installed runtime rather than a skills-based workflow.