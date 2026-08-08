# NOS-001 AUTO-E1 — Iteration 0 to Iteration 1

Date: `2026-08-08`

## Critique of Iteration 0

Iteration 0 fixed several historical facts but still failed independent review because it was not parseable YAML, mixed prose with paths, claimed completeness before computing an import closure, conflated planned and existing targets, assigned capabilities to issues that did not own them, and did not classify the target's parallel implementation explicitly.

The first semantic validator also correctly stopped when `main` changed externally from `45ef260...` to `38246f6...`. That stop exposed a missing baseline-transition model. The remediation did not weaken the check; it recorded and validated the external commit, preserved PDP bytes and constrained the changed paths.

## Measurable delta

| Dimension                       |      Iteration 0 |                                                  Iteration 1 |
| ------------------------------- | ---------------: | -----------------------------------------------------------: |
| Parser-safe contract            |     Invalid YAML |                  JSON-compatible YAML parsed dependency-free |
| Canonical tree identity         |      Commit only |            Commit plus tree SHA and live remote verification |
| Raw source hashes               |               22 |                                   55/55 import-closure blobs |
| Closure classification          |     Not computed |                  55/55 files mapped to stable capability IDs |
| Capability IDs                  |     0 stable IDs |                                                33 stable IDs |
| Target state typing             | Mixed path/prose | `existing`, `replace_existing`, `host_boundary` or `planned` |
| Target legacy replacement rows  |                0 |                                             12 explicit rows |
| Target host responsibility rows |                0 |                                             29 explicit rows |
| Count derivation                |    Hand-authored |              Recomputed: 26 ADAPT, 2 PORT, 2 DEFER, 3 REJECT |
| Negative validator tests        |                0 |        8 fail-closed mutations plus 1 positive contract test |
| Validator result                |    Not available |                                             PASS, P0=0, P1=0 |
| External HEAD drift handling    |      Not modeled |                          Recorded, scoped and hash-validated |

## Design corrections

1. `app/page.tsx` and `app/layout.tsx` are ADAPT sources, not `KEEP_DTC` omissions.
2. `NavigationDots`, wheel, drag and navigation are ADAPT where locale/focus/page-scroll guards are required; canonical thresholds remain preserved.
3. Gallery primitives consume the existing neutral `GalleryItem`/`GalleryScene` contract; no second canonical Artwork domain or duplicate adapter is created.
4. `GalleryExperience` is explicitly reduced to a façade; SceneRail, InteractiveArtworkCard, NavigationControls and custom navigation state are replacement targets.
5. Saved-artwork baseline behavior remains in scope with an explicit downstream ownership-expansion warning.
6. Share and commercial JSON-LD remain honest DEFER entries with named evidence streams instead of being silently assigned to #23.
7. All standalone repositories/inquiry files in the actual import closure are explicitly rejected at the Medusa boundary.
8. `lucide-react` is recorded as a legitimate canonical dependency; icons will not be reimplemented locally.

## Residual risks retained, not hidden

- The GitHub completion record has not been published.
- Independent REVIEW-E1 and REPO-GUARDIAN-E1 are still pending.
- Commercial Truth remains FAIL and blocks package/runtime work.
- Package output, exports, lock and test graph remain open.
- The current target remains a parallel visual/behavioral implementation.
- Visual, a11y, performance, resilience, observability, security, E2E, rollout and human gates remain open.

AUTO-E1 verdict: `PASS FOR W0 ITERATION IMPROVEMENT`; this does not itself freeze #13.
