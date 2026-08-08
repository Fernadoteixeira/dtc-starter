# NOS-001 AUTO-E2 — Iteration 1 to Iteration 2

Date: `2026-08-08`

## Independent feedback consumed

Iteration 1 passed its original validator but failed both independent gates:

- `REVIEW-E1`: `FAIL`, P0=0, P1=5, P2=5;
- `REPO-GUARDIAN-E1`: `FAIL`, P0=0, P1=3, P2=2.

The failure was accepted as a real semantic defect. No freeze, W1 transition or Git operation occurred.

## Measurable correction

| Dimension                         |                           Iteration 1 |                                                   Iteration 2 |
| --------------------------------- | ------------------------------------: | ------------------------------------------------------------: |
| Capability ownership relation     |                    15 one-sided edges |                                 Bidirectional mirror enforced |
| Dangling `owns` tokens            |                                    13 |                  0; 16 typed non-source work items registered |
| Saved-artworks disposition        |       ADAPT with invented live owners |                                             DEFER / `CAND-07` |
| JSON-LD target owners             |               ADAPT + DEFER collision |                                            CAP-026 DEFER only |
| Observability target              | Client/server conflated in one `.tsx` |         Web Vitals `.tsx` client + observability `.ts` server |
| Shared targets                    |                              Implicit |                             Explicit `shared_target_contract` |
| Canonical behavior values         |           Prose requiring rediscovery |             Typed layout, slider, motion and effect constants |
| Target truth negative tests       |                                     0 |      Planned-exists, duplicate/conflict and target-hash cases |
| Ownership negative tests          |                                     0 | One-sided edge, dangling token and unknown future owner cases |
| DAG cycle test                    |                                     0 |                           Explicit fail-closed cycle mutation |
| Validator negative/positive tests |                                     9 |                                                            17 |
| Disposition counts                |                    26 ADAPT / 2 DEFER |                                            25 ADAPT / 3 DEFER |

## Design decisions

1. `issue_owner` and `issue_ownership[issue].owns` are one normative bidirectional relation for capability IDs.
2. Non-source responsibilities are registered under `issue_ownership._non_source_work_items`; no free-form dangling token is accepted.
3. Every DEFER `future_owner` must resolve to that registry.
4. A shared target is permitted only when every claimant uses the same non-empty `shared_target_contract`, state and disposition.
5. A `planned` target must be absent; an existing/replace/facade/host target must exist.
6. Capability target hashes are validated generically.
7. The issue DAG must remain acyclic even when both dependency blocks are edited together.
8. Generated JS/JSX, tsbuildinfo and the stale test move into PKG-W2 cleanup before the first canonical package build.

## Retained constraints

- Independent REVIEW-E2 and REPO-GUARDIAN-E2 are required; AUTO-E2 cannot self-certify.
- GitHub issue #13 completion publication is an external write and remains unauthorized.
- The manifest remains unfrozen.
- Commercial Truth remains FAIL and blocks W1 runtime implementation.
- Package, canonical visual, interaction, accessibility, resilience, observability, security, performance, E2E, rollout and human gates remain open.

AUTO-E2 verdict: `PASS FOR ITERATION IMPROVEMENT ONLY` (55/55 closure files verified, P0=0, P1=0); it is not W0 DoD, GO or freeze evidence.
