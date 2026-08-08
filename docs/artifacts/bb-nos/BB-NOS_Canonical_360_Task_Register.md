# BB-NOS Canonical 360° Task Register v8

Updated: `2026-08-08T20:25:00.000-03:00`  
Repository: `Fernadoteixeira/dtc-starter`  
Target baseline: `main@38246f64e82b37670edf84d386b55b866fb425bf` (external W0 commit observed and reconciled)  
Canonical source: `Fernadoteixeira/nos-gallery@2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e`  
Parent EPIC: `#12`  
Current verdict: `BB-NOS NO-GO / REMEDIATION REQUIRED`

## Operating rules

- The pinned canonical Git tree is the implementation source of truth.
- If an equivalent exists in the pinned source, the only valid actions are `PORT` or `ADAPT`; do not create a replacement primitive.
- DoR PASS does not imply DoD PASS, and GO is never inherited.
- `44/44` unit tests and `95/95` Playwright tests are historical evidence for the parallel implementation, not canonical parity evidence.
- Commercial data fails closed. Fixtures are server-only, explicit, non-production and non-commercial.
- Product approval, stage, commit, push, PR, merge and release are distinct grants. Stage, commit, push, PR, merge and release remain forbidden.
- A workstream becomes GO only when its six tasks, required negative tests, evidence, AUTO-E and REVIEW-E are complete.

## Current gate board

| Gate                             | Current state            | Blocking evidence                                                                      |
| -------------------------------- | ------------------------ | -------------------------------------------------------------------------------------- |
| W0 Governance                    | `IN_PROGRESS`            | Iteration 1 failed both reviews; Iteration 2 validator + 17 tests + AUTO-E2 pass; E2 reviews/DoD pending |
| W1 Commercial Truth              | `BLOCKED_BY_W0`          | Current Hero, Home, ProductRail, adapter and PDP can fabricate commercial state        |
| W2 Package                       | `BLOCKED_BY_W1`          | Build emits into `src`; public exports, lock and test graph are not closed             |
| W3 Canonical Visual Port         | `BLOCKED_BY_W2`          | Current target is a parallel implementation                                            |
| W4 Interaction Port              | `BLOCKED_BY_W3`          | Canonical hooks are not yet in the package                                             |
| W5 Accessibility/Responsive/i18n | `BLOCKED_BY_W4`          | Canonical focus, inert and locale paths are not integrated                             |
| W6 Runtime Resilience            | `BLOCKED_BY_W1_W4`       | Typed state machine is not implemented                                                 |
| W7 Observability                 | `BLOCKED_BY_W6`          | Vendor-neutral bridge/reason codes are not integrated                                  |
| W8 Security/Privacy              | `BLOCKED_BY_W6_W7`       | Negative tests and supply-chain delta are open                                         |
| W9 Performance/Image             | `BLOCKED_BY_W3_W4_W5`    | Product-grade production benchmark is absent                                           |
| W10 E2E/Visual QA                | `BLOCKED_BY_W5_W6_W8_W9` | Same-state canonical regression evidence is absent                                     |
| W11 Rollout/Human Release        | `BLOCKED_BY_W10`         | Rollback, deployment and human visual decisions are pending                            |

## Authorization ledger

| Item                                   | Correct state | Dependency gate             | Preservation rule                                                                            |
| -------------------------------------- | ------------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| `DAT-06`                               | `AUTHORIZED`  | `DAT-01..DAT-05`            | Preserve the original dirty PDP diff semantically; metadata/runtime share one fixture policy |
| `COM-02`                               | `AUTHORIZED`  | `W1 + W4`                   | No additional human authorization is required inside the approved write-set                  |
| Git stage/commit/push/PR/merge/release | `FORBIDDEN`   | Explicit future human grant | No operation may infer another authorization category                                        |

## W0 — Governance and canonical provenance

DoR: `PASS` for remediation. Runtime mutations are forbidden in this workstream.

| ID     | Task                                                                                                              | Owner / issue | Status                               | DoD evidence                                                                   |
| ------ | ----------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------ | ------------------------------------------------------------------------------ |
| GOV-01 | Capture target/canonical BASE-E, PDP preservation hashes, authorization envelope and external baseline transition | `#13`         | `DONE`                               | `2026-08-08-w0-base-e.md`, `2026-08-08-external-git-drift.md`, session ledger  |
| GOV-02 | Resolve canonical commit/tree, raw blob hashes and exact `app/page + app/layout` import closure                   | `#13`         | `IMPLEMENTED_VALIDATED_PENDING_REVIEW_E2` | Iteration 2: 55/55 closure files/hashes; semantic validator PASS             |
| GOV-03 | Reconcile manifest, program-state, task register, provenance and live issue truth                                 | `#13`         | `DONE`                               | v2 pointers agree; invalid inventory and T21/T22/T23 are superseded             |
| GOV-04 | Replace existence-only/hardcoded DoD with semantic, fail-closed validation and tests                              | `#13`         | `DONE`                               | 17/17 manifest tests + 6/6 DoD tests; ownership/target/cycle/freeze negatives   |
| GOV-05 | Run measurable self-critique/AUTO-E and independent repo-guardian REVIEW-E                                        | `#13`         | `AUTO_E2_DONE_REVIEW_E2_PENDING`     | E1 findings consumed; fresh zero-P0/P1 independent E2 receipts required         |
| GOV-06 | Derive final #13 DoD, prepare completion record and freeze only when every criterion is true                      | `#13`         | `BLOCKED_GOV-05_AND_EXTERNAL_RECORD` | DoD receipt; GitHub publication remains a separate external write              |

W0 DoD: `NOT PASSED`.  
W0 verdict: `NO-GO FOR W1` until GOV-01..06 pass.

## W1 — Commercial Truth

DoR: `PASS` for implementation after W0. Current state: `FAIL`.

| ID     | Task                                                                                                                        | Owner / issue | Status                          | DoD evidence                                                                                        |
| ------ | --------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------- | --------------------------------------------------------------------------------------------------- |
| DAT-01 | Implement strict typed Fio Vivo source states, exact collection query, pagination, timeout and partial-failure handling     | `#21`         | `BLOCKED_BY_W0`                 | Source union + async/negative tests; no global-catalog fallback                                     |
| DAT-02 | Implement runtime metadata schema, URL validation, core eligibility and batch rejection taxonomy                            | `#22`         | `BLOCKED_DAT-01`                | Product-level and batch mapping tests; no type assertions over unknown metadata                     |
| DAT-03 | Implement multi-variant regional price truth, exact/from semantics, tax/original price and locale formatting                | `#22`         | `BLOCKED_DAT-02`                | Price truth table tests; no invented zero or BRL                                                    |
| DAT-04 | Implement variant-level inventory/backorder truth and aggregate availability without summing inventory                      | `#22`         | `BLOCKED_DAT-02`                | Inventory truth table tests; unknown contracts become unavailable                                   |
| DAT-05 | Implement server-only fixture policy and remove synthetic region, collection, rail enrichment, price, SKU and variant paths | `#21/#22/#29` | `BLOCKED_DAT-01..04`            | Production-deny tests across Hero, Home, FeaturedProducts and ProductRail                           |
| DAT-06 | Reconcile dirty PDP through one memoized live/fixture/unavailable resolver shared by metadata and runtime                   | `#22/#23`     | `AUTHORIZED_DEPENDS_DAT-01..05` | Before/after diff evidence; defensive image logic preserved; fixture preview noindex/non-commercial |

W1 DoD: all six tasks, full Commercial Truth matrix, unit/typecheck/lint/build and production-deny E2E PASS.  
Stop condition: if any route still invents commerce data, `COMMERCIAL TRUTH = FAIL` and W2 remains blocked.

## W2 — Package/output integrity

DoR: requires `COMMERCIAL TRUTH PASS` and final canonical dependency graph.

| ID     | Task                                                                                                    | Owner / issue          | Status           | DoD evidence                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------- | --------------------------------------------------------------------------------------- |
| PKG-01 | Freeze public API, root entrypoint and explicit `styles.css` export                                     | Package architecture   | `BLOCKED_BY_W1`  | `exports`, `files`, `sideEffects`; no deep source import                                |
| PKG-02 | Configure deterministic `rootDir/src`, `outDir/dist`, declarations and no in-place emit                 | Package architecture   | `BLOCKED_PKG-01` | Empty tracked JS/JSX/tsbuildinfo in source; reproducible `dist/**`                      |
| PKG-03 | Migrate layout/Jest/consumers to compiled public exports                                                | Storefront integration | `BLOCKED_PKG-02` | Runtime and test resolution use package exports, not `src` aliases                      |
| PKG-04 | Restrict workspace globs and regenerate the lock with pnpm 10.11.1 only                                 | Workspace              | `BLOCKED_PKG-03` | Orphan `apps/storefront/src/modules/nos-gallery` importer absent; explainable lock diff |
| PKG-05 | Align Turbo/test graph so package build precedes consumer tests and storefront unit tests run from root | Build system           | `BLOCKED_PKG-04` | Root test receipt proves storefront Jest execution against `dist`                       |
| PKG-06 | Reconcile only imports used by the frozen canonical graph and run package/storefront/full gates         | Package + QA           | `BLOCKED_PKG-05` | lint, typecheck, build, resolution smoke, unit and full graph PASS                      |

W2 DoD: package boundary and `dist/**` are truthful, deterministic and exercised by consumers.

## W3 — Canonical visual port

DoR: requires W2 PASS and exact source hashes from the manifest.

| ID     | Task                                                                                               | Owner / issue | Status                  | DoD evidence                                                                            |
| ------ | -------------------------------------------------------------------------------------------------- | ------------- | ----------------------- | --------------------------------------------------------------------------------------- |
| VIS-01 | Port/adapt canonical constants, GalleryItem contract usage and scoped copper/umber/linen CSS slice | `#14/#16`     | `BLOCKED_BY_W2`         | Source hash, target diff and CSS selector/token audit                                   |
| VIS-02 | Replace surrogate ambient with canonical GalleryAmbient and color-extraction path                  | `#15`         | `BLOCKED_VIS-01`        | Canonical crossfade/gradient/grain/vignette behavior tests                              |
| VIS-03 | Replace surrogate card with canonical ArtworkCard, Next/Image and integrated scene rail            | `#16`         | `BLOCKED_VIS-01`        | Scene/image/accessibility component tests; no new card primitive                        |
| VIS-04 | Port/adapt canonical ArtGallerySlider and reduce GalleryExperience to a thin compatibility facade  | `#17`         | `BLOCKED_VIS-02_VIS-03` | No SceneRail/InteractiveArtworkCard/NavigationControls implementations remain in facade |
| VIS-05 | Port/adapt NavigationDots, GalleryProgressControl, CollectionProgressDialog and state screen       | `#17/#20/#29` | `BLOCKED_VIS-04`        | Component tests and package export evidence                                             |
| VIS-06 | Remove parallel presentation and stale generated artifacts only after replacement gates pass       | `#14-#20`     | `BLOCKED_VIS-05`        | Source inventory proves canonical names/architecture; rollback snapshot retained        |

W3 DoD: first-fold composition is canonical-first; visual parity remains a later measured gate, not inferred from source similarity.

## W4 — Canonical interaction and progress

DoR: requires canonical components installed without unresolved replacement primitives.

| ID     | Task                                                                                                | Owner / issue             | Status                  | DoD evidence                                                                          |
| ------ | --------------------------------------------------------------------------------------------------- | ------------------------- | ----------------------- | ------------------------------------------------------------------------------------- |
| INT-01 | Adapt canonical navigation state and focus-scoped Arrow/Home/End handling                           | `#17/#24`                 | `BLOCKED_BY_W3`         | Keyboard matrix; editing targets/modifiers/overlays do not navigate                   |
| INT-02 | Adapt canonical drag/swipe thresholds, momentum and commerce-control guards                         | `#18/#24`                 | `BLOCKED_INT-01`        | Mouse/touch/coarse-pointer tests; page scroll safety                                  |
| INT-03 | Adapt canonical wheel accumulator and conditional preventDefault ownership                          | `#18/#24`                 | `BLOCKED_INT-01`        | Trackpad/wheel tests; interactive descendants and page scrolling preserved            |
| INT-04 | Port reduced-motion/fine-pointer hooks and canonical parallax with motion disabled paths            | `#19/#24/#26`             | `BLOCKED_INT-02_INT-03` | Reduced-motion and frame-stability evidence                                           |
| INT-05 | Adapt dwell, scene discovery, progress persistence and resume; keep saved-artwork controls deferred to CAND-07 | `#20/#32 + CAND-07` | `BLOCKED_INT-04` | Storage corruption/dialog-pause/dwell tests; no unowned bookmark surface |
| INT-06 | Resolve deferred share ownership and integrate canonical share plus typed host detail/CTA callbacks | `#13 evidence stream/#23` | `BLOCKED_INT-05`        | Native/clipboard/cancel tests; localized safe PDP URL; no inquiry backend duplication |

W4 DoD: canonical thresholds/state transitions are preserved; no alternate gesture or progress engine exists.

## W5 — Accessibility, responsive behavior and localization

DoR: requires stable visual and interaction trees.

| ID      | Task                                                                                     | Owner / issue | Status                    | DoD evidence                                                      |
| ------- | ---------------------------------------------------------------------------------------- | ------------- | ------------------------- | ----------------------------------------------------------------- |
| A11Y-01 | Close focus containment, active-slide tab order and overlay restoration                  | `#24`         | `BLOCKED_BY_W4`           | Keyboard-only journey and focus trace                             |
| A11Y-02 | Validate slide semantics, aria-current, aria-hidden and true inert descendant behavior   | `#24`         | `BLOCKED_A11Y-01`         | No inactive-card focus leakage; screen-reader assertions          |
| A11Y-03 | Reconcile responsive first-fold geometry for desktop, tablet, mobile and short landscape | `#24/#25`     | `BLOCKED_A11Y-01`         | No horizontal scroll; commerce header preserved                   |
| A11Y-04 | Localize controls, scenes, progress, price and state copy with complete fallback rules   | `#23/#24`     | `BLOCKED_A11Y-02`         | pt-BR plus alternate locale tests; no hardcoded inaccessible copy |
| A11Y-05 | Validate image alt semantics, 44px targets, contrast and focus-visible states            | `#16/#24`     | `BLOCKED_A11Y-03_A11Y-04` | WCAG assertions and visual evidence                               |
| A11Y-06 | Run Axe and manual assistive-technology gate across required viewports/browsers          | `#24/#30`     | `BLOCKED_A11Y-05`         | Axe critical/serious = 0; review receipt                          |

W5 DoD: accessibility, locale and responsive contracts pass independently of visual approval.

## W6 — Runtime resilience

DoR: requires Commercial Truth and canonical interaction state.

| ID     | Task                                                                                                      | Owner / issue | Status                  | DoD evidence                                               |
| ------ | --------------------------------------------------------------------------------------------------------- | ------------- | ----------------------- | ---------------------------------------------------------- |
| RUN-01 | Materialize typed loading/success/missing/empty/down/timeout/malformed/partial/ineligible/fallback states | `#29`         | `BLOCKED_BY_W1_W4`      | Exhaustive state union and compile-time exhaustiveness     |
| RUN-02 | Implement bounded loading and deterministic empty/degraded screens                                        | `#29/#24`     | `BLOCKED_RUN-01`        | Visual/state tests; no fabricated products                 |
| RUN-03 | Implement retry, recovery and stale-request cancellation semantics                                        | `#29/#30`     | `BLOCKED_RUN-01`        | down-to-recovered E2E; race tests                          |
| RUN-04 | Add route/component error boundaries without leaking internals or creating false 404s                     | `#29/#32`     | `BLOCKED_RUN-02`        | API failure and metadata/runtime consistency tests         |
| RUN-05 | Integrate feature flag, explicit non-commercial fallback and canonical-off rollback path                  | `#27/#29`     | `BLOCKED_RUN-03_RUN-04` | OFF/ON/fallback matrix; production fixture deny            |
| RUN-06 | Execute state-machine regression and hydration recovery gate                                              | `#29/#30`     | `BLOCKED_RUN-05`        | zero hydration errors; every state/recovery path exercised |

W6 DoD: all runtime states are deterministic, observable, non-fabricating and recoverable.

## W7 — Observability and analytics

DoR: requires stable reason/state taxonomy.

| ID     | Task                                                                                  | Owner / issue | Status                  | DoD evidence                                                   |
| ------ | ------------------------------------------------------------------------------------- | ------------- | ----------------------- | -------------------------------------------------------------- |
| OBS-01 | Define stable safe reason codes and typed diagnostic envelopes                        | `#31/#32`     | `BLOCKED_BY_W6`         | Schema and exhaustiveness tests                                |
| OBS-02 | Connect canonical event semantics to the vendor-neutral host analytics bridge         | `#23/#31`     | `BLOCKED_OBS-01`        | Event contract tests; no direct package vendor dependency      |
| OBS-03 | Adapt Web Vitals capture and first-fold metric correlation                            | `#31`         | `BLOCKED_OBS-01`        | Metric receipt with route/state/build identity                 |
| OBS-04 | Enforce PII/secret/raw-payload redaction and bounded error classification             | `#31/#32`     | `BLOCKED_OBS-02`        | Negative payload tests                                         |
| OBS-05 | Add diagnostics for source, mapping, fallback, image, hydration and analytics failure | `#31`         | `BLOCKED_OBS-03_OBS-04` | Each runtime failure produces one safe reason code             |
| OBS-06 | Run observability failure/recovery and cardinality gate                               | `#31/#30`     | `BLOCKED_OBS-05`        | No dropped critical state; no high-cardinality product payload |

W7 DoD: operators can distinguish every critical state without exposing user or commerce payloads.

## W8 — Security, privacy and supply chain

DoR: requires final runtime, persistence and observability surfaces.

| ID     | Task                                                                                         | Owner / issue | Status                  | DoD evidence                                         |
| ------ | -------------------------------------------------------------------------------------------- | ------------- | ----------------------- | ---------------------------------------------------- |
| SEC-01 | Validate localized product URLs, protocols, handles and metadata rendering against injection | `#32/#23`     | `BLOCKED_BY_W6_W7`      | malicious handle/URL/metadata negative tests         |
| SEC-02 | Validate remote image origins, URL schemes, canvas/CORS behavior and deterministic rejection | `#32/#16/#26` | `BLOCKED_SEC-01`        | allowlist and invalid-origin tests                   |
| SEC-03 | Audit analytics, diagnostics and local persistence for privacy/minimization                  | `#32/#20/#31` | `BLOCKED_SEC-01`        | no PII/secrets/raw payload; storage scope documented |
| SEC-04 | Reconcile dependency delta, licenses, advisories and Next/package peer resolution            | `#32/PKG`     | `BLOCKED_SEC-02`        | supply-chain report; no unresolved HIGH/CRITICAL     |
| SEC-05 | Execute adversarial state, fixture, URL, metadata, analytics and storage matrix              | `#32`         | `BLOCKED_SEC-03_SEC-04` | negative tests fail closed                           |
| SEC-06 | Produce security/privacy release gate and rollback constraints                               | `#32/#27`     | `BLOCKED_SEC-05`        | independent REVIEW-E; zero unresolved HIGH/CRITICAL  |

W8 DoD: security/privacy gate PASS with inspectable negative evidence.

## W9 — Performance and image delivery

DoR: requires production-ready package and stable UI behavior.

| ID      | Task                                                                                        | Owner / issue | Status                    | DoD evidence                                                    |
| ------- | ------------------------------------------------------------------------------------------- | ------------- | ------------------------- | --------------------------------------------------------------- |
| PERF-01 | Enforce canonical Next/Image active/inactive priority, sizes, preload and failure semantics | `#16/#26`     | `BLOCKED_BY_W3_W4_W5`     | no broken images/CLS; active LCP preload evidence               |
| PERF-02 | Measure package/storefront JavaScript and CSS delta with gallery OFF versus ON              | `#26`         | `BLOCKED_PERF-01`         | production bundle report and budgets                            |
| PERF-03 | Measure production LCP and CLS across required viewports                                    | `#26/#30`     | `BLOCKED_PERF-01`         | LCP < 2.5s; CLS < 0.1                                           |
| PERF-04 | Measure INP/interaction latency for dots, scene, drag, wheel and CTA                        | `#26/#30`     | `BLOCKED_PERF-02`         | INP < 200ms and gesture traces                                  |
| PERF-05 | Measure requests, image payload/decode, memory growth and long tasks                        | `#26`         | `BLOCKED_PERF-03_PERF-04` | bounded request/memory/image budgets                            |
| PERF-06 | Execute isolated production performance gate with reduced-motion comparison                 | `#26`         | `BLOCKED_PERF-05`         | full performance receipt; no concurrent dev/build contamination |

W9 DoD: product-grade production budgets pass; harness duration is not accepted as product performance evidence.

## W10 — Functional E2E and canonical visual regression

DoR: requires all product surfaces stable and security/performance gates green.

| ID    | Task                                                                                                                 | Owner / issue | Status                   | DoD evidence                                                             |
| ----- | -------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------ | ------------------------------------------------------------------------ |
| QA-01 | Reopen and classify the historical harness; remove stale/non-executed assertions                                     | `#30`         | `BLOCKED_BY_W5_W6_W8_W9` | Each test change classified as product/test/environment/baseline defect  |
| QA-02 | Run unit, typecheck, lint, package build and integration gates from the real public package boundary                 | `#30/PKG`     | `BLOCKED_QA-01`          | Required commands PASS; no ignored type errors treated as proof          |
| QA-03 | Execute Chromium functional journey for navigation, scenes, CTA, states and recovery                                 | `#30`         | `BLOCKED_QA-02`          | Complete user-journey trace                                              |
| QA-04 | Execute Firefox, WebKit, Mobile Chrome and Mobile Safari matrices                                                    | `#30/#24`     | `BLOCKED_QA-03`          | Required browsers 100% PASS; no skips                                    |
| QA-05 | Capture canonical/target same-artwork, same-scene, same-progress, viewport, DPR, browser, zoom and font visual diffs | `#25/#30`     | `BLOCKED_QA-04`          | Source/target SHA, screenshots, hashes and max diff ratio <= 0.05        |
| QA-06 | Run final console, broken-image, scroll, Axe and regression review                                                   | `#25/#30`     | `BLOCKED_QA-05`          | unexpected console = 0; broken images = 0; no material visual regression |

W10 DoD: functional and visual gates pass without weakened assertions or baseline laundering.

## W11 — Rollout, rollback, human gate and operations

DoR: requires all automated technical gates and explicit release evidence.

| ID     | Task                                                                                          | Owner / issue | Status                                   | DoD evidence                                                 |
| ------ | --------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------- | ------------------------------------------------------------ |
| REL-01 | Finalize feature-flag cohorts and canonical OFF/ON/fallback policy                            | `#27`         | `BLOCKED_BY_W10`                         | Rollout matrix and safe defaults                             |
| REL-02 | Prove rollback to prior storefront/feature-off state without data or migration damage         | `#27`         | `BLOCKED_REL-01`                         | Executed rollback rehearsal and timing                       |
| REL-03 | Prepare deployment readiness, monitoring, alert and incident runbook                          | `#27/#31/#32` | `BLOCKED_REL-02`                         | Operational checklist and owners                             |
| REL-04 | Present canonical/target visual evidence for explicit human approval or rejection             | `#28`         | `BLOCKED_REL-03`                         | Human decision recorded; never inferred                      |
| REL-05 | Derive release-candidate verdict without committing, merging or releasing                     | `#28`         | `BLOCKED_REL-04`                         | All gates PASS and separate Git authorization still explicit |
| REL-06 | Execute post-release observation/rollback stream only after separate deployment authorization | `CAND-06/#27` | `BLOCKED_EXTERNAL_RELEASE_AUTHORIZATION` | SLO observation, incident/rollback record and final closeout |

W11 DoD: technical candidate plus explicit human visual/release decision. Merge and release still require separate authorization.

## Candidate issue handling

| Candidate                              | Current treatment                                                                                        |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| CAND-01 Manifest/DoD remediation       | Evidence stream inside `#13` / W0; do not create a redundant issue                                       |
| CAND-02 Package build/output integrity | Independent candidate after W0; represented by W2                                                        |
| CAND-03 Fio Vivo PDP remediation       | Independent candidate; `DAT-06` already authorized                                                       |
| CAND-04 Commercial SEO                 | Independent candidate; local evidence stream begins at `DAT-05`/`CAP-026` without silently assigning #23 |
| CAND-05 Cross-browser harness          | Evidence stream inside `#30` / W10; do not create a redundant issue                                      |
| CAND-06 Post-release operations        | Independent future candidate; represented by `REL-06`                                                    |
| CAND-07 Saved-artworks governance      | Independent future candidate required before CAP-018 can leave DEFER and add bookmark/storage UI         |

## Hard GitHub DAG snapshot

```text
#13
├─ #14
│  ├─ #15
│  └─ #16 → #17 → #18 → #19
│            └─ #20
└─ #21 → #22
             └─ #23 ← #17

#24 ← #15 + #17 + #18 + #19 + #23
#25 ← #14 + #15 + #16 + #17 + #18 + #19 + #24
#26 ← #18 + #19 + #24
#29 ← #16 + #17 + #21 + #22
#30 ← #18 + #19 + #20 + #22 + #23 + #24 + #29
#31 ← #20 + #21 + #22 + #23 + #29
#32 ← #20 + #22 + #23 + #24 + #29 + #30 + #31
#27 ← #21 + #22 + #23 + #24 + #25 + #26 + #30 + #31 + #32
#28 ← #25 + #26 + #27 + #29 + #30 + #31 + #32 + all implementation issues under #12
```

The open expression in `#28` must be enumerated in the live issue before terminal DoR. This register records the expression; it does not silently invent a closed GitHub dependency set.

## Program completion equation

```text
BB-NOS TECHNICAL SUCCESS =
  72/72 tasks satisfy their evidence-backed DoD
  + zero open P0/P1 defects
  + canonical port and same-state visual parity PASS
  + commercial truth, accessibility, performance, resilience,
    observability, security, E2E and rollback PASS
  + AUTO-E and independent REVIEW-E per critical workstream

BB-NOS RELEASE SUCCESS =
  technical success
  + explicit human visual approval
  + separate Git/merge/release authorization
```

Current progress: `GOV-01`, `GOV-03` and `GOV-04` are DONE; `GOV-02` is semantically validated; `GOV-05` awaits Iteration 2 independent reviews; `GOV-06` remains blocked by those reviews and the unauthorized GitHub completion write. W1-W11 remain dependency-blocked. No freeze or release phrase is authorized.
