# PR-D: Dependency Compatibility Audit

**Date:** 2026-08-06
**Branch:** `pr-d/dependency-compat` (stacked on `pr-c/reproducible-pipeline`)
**Tool:** pnpm 10.11.1

## Audit Summary

### Vulnerability Counts

| Severity   | Before | After |
|------------|--------|-------|
| Critical   | 1      | 0     |
| High       | 57     | 7     |
| Moderate   | 55     | 10    |
| Low        | 7      | 2     |
| **Total**  | **111 advisories** | **19 vulnerabilities** |

The "before" count of 111 reflects advisory entries (including duplicates per
package per path). The "after" count of 19 reflects unique vulnerabilities
reported by `pnpm audit` after overrides were applied.

### Peer Dependency Warnings

All remaining peer dependency warnings are **pre-existing** and not caused by
the overrides added in this PR:

- `@medusajs/*` packages expect React 18 but the workspace uses React 19
- `@medusajs/types` expects vite ^5.4.21 but the backend uses vite 8.2.1
- `@medusajs/draft-order` expects react-router-dom 6.30.4 but backend uses 7.18.2
- `react-i18next` 17.0.11 expects i18next >=26.2.0 but 23.7.11 is installed
- `vite` 5.4.21 (storefront) expects @types/node ^18 but 17.0.21 is installed
- `@clerk/nextjs` in nos-gallery module expects specific React 19 patch versions
- `fdir` 6.1.1 (via @medusajs/admin-vite-plugin) expects picomatch 3.x but 4.x is installed

These are framework-level compatibility issues that require upstream Medusa
updates to resolve and are outside the scope of a dependency compatibility PR
that avoids major version upgrades.

### Version Conflicts

- **Next.js:** Storefront uses `next@16.3.1-canary.4`. The
  `packages/gallery-experience` package declared a peer dep of `next: "^15.0.0"`
  which excluded Next 16. Resolved by widening to `next: ">=15.0.0"`.
- **React:** All workspace packages use React 19 (19.0.5 in storefront, 19.2.8
  in backend, 19.2.0 in nos-gallery). Consistent major version; minor
  differences are acceptable.
- **@medusajs/medusa:** Confirmed at v2.18.0 as expected. Not modified.

## Overrides Applied

All overrides are patch or minor bumps within the same major version. No major
version jumps were introduced.

### Simple overrides (all versions of the package)

| Package                | Old version | New version | Severity fixed | Reason |
|------------------------|-------------|-------------|----------------|--------|
| protobufjs             | 7.5.4       | 7.6.5       | Critical        | Prototype pollution |
| axios                  | 1.13.2      | 1.19.0      | High/Moderate   | SSRF, credential leak |
| form-data              | 4.0.5       | 4.0.6       | High            | Prototype pollution |
| follow-redirects       | 1.15.11     | 1.16.0      | Moderate        | Cookie leak on redirect |
| lodash                 | 4.17.21     | 4.18.1      | High/Moderate   | Prototype pollution |
| rollup                 | 4.53.3      | 4.59.0      | High            | ReDoS |
| flatted                | 3.3.3       | 3.4.4       | High            | Prototype pollution |
| fast-uri               | 3.1.0       | 3.1.5       | High/Moderate   | ReDoS |
| immutable              | 3.7.6       | 3.8.3       | (partial)       | Minor bump; full fix needs 4.x (major) |
| qs                     | 6.14.0      | 6.15.3      | Moderate/Low    | Prototype pollution |
| body-parser            | 1.20.4      | 1.20.6      | Low             | Prototype pollution |
| diff                   | 4.0.2       | 4.0.4       | Low             | ReDoS |

### Range-based overrides (only vulnerable version ranges)

| Package                          | Range                        | Target   | Severity fixed |
|----------------------------------|------------------------------|----------|----------------|
| @babel/core                      | <7.29.6                     | 7.29.7   | Low            |
| @opentelemetry/core              | <2.8.0                      | 2.10.0   | Moderate       |
| @protobufjs/utf8                 | <=1.1.0                     | 1.1.2    | Moderate       |
| ajv                              | <6.14.0                     | 6.14.0   | Moderate       |
| ajv                              | >=8.0.0 <8.18.0             | 8.18.0   | Moderate       |
| brace-expansion                  | <1.1.18                     | 1.1.18   | High           |
| brace-expansion                  | >=2.0.0 <2.1.4              | 2.1.4    | High           |
| brace-expansion                  | >=5.0.0 <5.0.9              | 5.0.9    | High           |
| js-yaml                          | >=3.0.0 <3.15.1             | 3.15.1   | High/Moderate  |
| js-yaml                          | >=4.0.0 <4.3.1              | 4.3.1    | High/Moderate  |
| minimatch                        | >=9.0.0 <9.0.7              | 9.0.7    | High           |
| path-to-regexp                   | <0.1.13                     | 0.1.13   | High           |
| postcss                          | <8.5.26                     | 8.5.26   | Moderate/Low   |

### Pre-existing overrides (not added by this PR)

| Package          | Version   | Reason |
|------------------|-----------|--------|
| @types/react     | 19.0.5    | Type consistency |
| @types/react-dom | 19.0.5    | Type consistency |
| typescript       | ^5.6.2    | Type consistency |

## Vulnerabilities NOT Fixed (require major version upgrades)

These cannot be safely fixed within the constraints of this PR (no major
version upgrades):

| Package              | Installed | Patched | Severity | Reason not fixed |
|----------------------|-----------|---------|----------|------------------|
| serialize-javascript | 6.0.2     | >=7.0.3 | High     | Major 6 to 7     |
| vite (storefront)    | 5.4.21    | >=6.4.3 | High     | Major 5 to 6     |
| immutable            | 3.8.3     | >=4.3.9 | High     | Major 3 to 4     |
| sharp                | 0.34.5    | >=0.35.0| High     | 0.x minor, potentially breaking |
| react-router         | 7.18.2    | >=8.3.0 | High     | Major 7 to 8     |
| react-router (6.x)   | 6.30.4    | >=7.18.0| Moderate | Major 6 to 7 (transitive via @medusajs) |
| react-router-dom     | 6.30.4    | N/A     | Moderate | No fix available (patched: <0.0.0) |
| uuid                 | 9.0.1     | >=11.1.1| Moderate | Major 9 to 11    |
| esbuild              | 0.24.2    | >=0.25.0| Moderate | 0.x minor, potentially breaking |
| webpack              | 5.103.0   | >=5.104.1| Low     | Override not effective (peer-dep-only) |

## Peer Dependency Conflict Resolved

**File:** `packages/gallery-experience/package.json`

The `next` peer dependency was widened from `"^15.0.0"` to `">=15.0.0"` to
accommodate the storefront's Next.js 16.3.1-canary.4. The `^15.0.0` range
excluded Next 16.x, causing a peer dependency conflict. The `>=15.0.0` range
accepts both Next 15.x and 16.x while maintaining the minimum version
requirement.

## Files Modified

1. `package.json` — Added 24 security overrides in `pnpm.overrides`
2. `packages/gallery-experience/package.json` — Widened `next` peer dep
3. `pnpm-lock.yaml` — Updated as side effect of `pnpm install`
4. `docs/DEPENDENCY_AUDIT.md` — This audit report (new file)

## Verification

- `pnpm install --frozen-lockfile` passes (lockfile is consistent)
- `pnpm audit` confirms 0 critical vulnerabilities remaining
- No source files under `apps/*/src/**` were modified
- No major version upgrades were introduced