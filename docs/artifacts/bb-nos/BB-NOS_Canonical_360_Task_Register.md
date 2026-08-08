# BB-NOS Canonical 360° Task Register

Repository: `Fernadoteixeira/dtc-starter`  
Parent EPIC: #12  
Canonical upstream: `Fernadoteixeira/nos-gallery@2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e`  
Tracking reconciliation branch: `chore/bb-nos-360-tracking-reconciliation`

## Executive state

```text
BB-NOS                               NO-GO / NOT RELEASE READY
CANONICAL REFERENCE                  VALIDATED
#13 DoR                              PASS → GO_FOR_ANALYSIS
#13 MANIFEST                         DRAFT-0 / REMEDIATION REQUIRED
RUNTIME TRANSPLANT                   INCOMPLETE
COMMERCE HARDENING                   PENDING
RUNTIME RESILIENCE                   TRACKED AS #29
FUNCTIONAL E2E/CROSS-BROWSER         TRACKED AS #30
OBSERVABILITY                        TRACKED AS #31
SECURITY/PRIVACY                     TRACKED AS #32
ROLLOUT                              PENDING #27
HUMAN RELEASE                        PENDING #28
```

## Governance rules

- Current child issue `Depends on:` fields are hard-scheduling SSOT.
- No issue inherits GO from a predecessor.
- DoR PASS does not imply DoD PASS.
- Agent available does not mean agent executed.
- Skill present does not mean skill consumed.
- Contracts/manifests are `CONTRACT-E/GOV-E`, never `SKILL-E`.
- Every critical issue requires evidence-backed self-critique, `AUTO-E`, independent `REVIEW-E`, DoD and qualified GO/NO-GO.
- Product approval, Git authorization, PR authorization, merge authorization and release authorization are distinct.
- Human visual approval is terminal and cannot be inferred by automation.

## Canonical agent shortcut task

### T-AGENT-001 — Establish shortcut registry
Status: `MATERIALIZED ON BRANCH`

Artifact: `.agents/canonical-agent-shortcuts.yaml`

Architecture:

```text
shortcut
  → canonical ollama-superpowers agent
  + optional RUG specialist profile/validator
  + core skills
  + Medusa skills where relevant
  + NOS-205 atomic skill resolver
  + Product-Lifecycle-315 orchestration resolver
  + governance/product contracts
```

The 18 Ollama Superpowers agents remain canonical identities. RUG agents are specialists; they do not create a competing canonical taxonomy.

## 360° program task list

| ID | Task | Owner/Gate | Status | Unlocks |
|---|---|---|---|---|
| T00 | Re-read current EPIC/issues and detect tracking drift | `@orchestrate:nos` | DONE | reconciliation |
| T01 | Materialize canonical agent shortcut registry | `@architect:nos` + `@repo:guard` | DONE ON BRANCH | all issue bindings |
| T02 | Create runtime-resilience owner | #29 NOS-017 | DONE / OPEN | #30/#31/#32 |
| T03 | Create functional E2E/cross-browser gate | #30 NOS-018 | DONE / OPEN | #32/#27 |
| T04 | Create observability/diagnostics owner | #31 NOS-019 | DONE / OPEN | #32/#27 |
| T05 | Create security/privacy release gate | #32 NOS-020 | DONE / OPEN | #27/#28 |
| T06 | Evolve #13 with remediation + new ownership map | #13 | DONE / OPEN | #13 final DoD |
| T07 | Evolve visual-system scope with commerce-shell boundary | #14 | DONE / OPEN | #15/#16 |
| T08 | Evolve ArtworkCard with image-delivery contract | #16 | DONE / OPEN | #17/#19/#29/#26 |
| T09 | Evolve progress lifecycle with observability/privacy handoff | #20 | DONE / OPEN | #30/#31/#32 |
| T10 | Evolve Fio Vivo source with typed source-state taxonomy | #21 | DONE / OPEN | #22/#29/#31 |
| T11 | Evolve Medusa adapter with rejection/trust-boundary taxonomy | #22 | DONE / OPEN | #23/#29/#31/#32 |
| T12 | Evolve CTA/analytics with localization completeness | #23 | DONE / OPEN | #24/#30/#31/#32 |
| T13 | Evolve A11y/responsive with localized + commerce-shell UX | #24 | DONE / OPEN | #25/#26/#30/#32 |
| T14 | Evolve performance with image-delivery budgets | #26 | DONE / OPEN | #27/#28 |
| T15 | Evolve rollout with #30/#31/#32 gates | #27 | DONE / OPEN | #28 |
| T16 | Evolve human release gate with #29–#32 evidence | #28 | DONE / OPEN | release decision |
| T17 | Reconcile parent EPIC child map, DAG, waves and gates | #12 | DONE / OPEN | program SSOT |
| T18 | Rebuild #13 ownership matrix from current #14–#32 bodies | #13 remediation | NEXT | manifest freeze |
| T19 | Repair #13 provenance taxonomy AGENT/SKILL/CONTRACT/GOV | #13 remediation | NEXT | DoD |
| T20 | Execute #13 self-critique + Auto-Improve Iteration 1 | #13 remediation | NEXT | cross-review |
| T21 | Execute independent #13 cross-agent review | #13 remediation | BLOCKED BY T18–T20 | final evidence |
| T22 | Reconcile #13 DoD + final GO/NO-GO | #13 remediation | BLOCKED BY T21 | #14/#21 DoR |
| T23 | Publish #13 final 360° completion record | #13 | BLOCKED BY T22 | W1 |
| T24 | Launch independent DoR for #14 and #21 | W1 | BLOCKED BY #13 DoD PASS | implementation |
| T25 | Execute Storefront/Commerce implementation waves | #14–#23 | BLOCKED BY dependencies | quality gates |
| T26 | Execute runtime-resilience gate | #29 | BLOCKED BY #16/#17/#21/#22 | #30/#31/#32 |
| T27 | Execute accessibility/responsive gate | #24 | BLOCKED BY dependencies | #25/#26/#30/#32 |
| T28 | Execute visual parity gate | #25 | BLOCKED BY dependencies | #27/#28 |
| T29 | Execute performance gate | #26 | BLOCKED BY dependencies | #27/#28 |
| T30 | Execute functional E2E/cross-browser gate | #30 | BLOCKED BY dependencies | #32/#27 |
| T31 | Execute observability gate | #31 | BLOCKED BY dependencies | #32/#27 |
| T32 | Execute security/privacy gate | #32 | BLOCKED BY dependencies | #27/#28 |
| T33 | Execute rollout/fallback/rollback gate | #27 | BLOCKED BY #30/#31/#32 + existing deps | #28 |
| T34 | Execute final human visual/release gate | #28 | BLOCKED BY all mandatory gates | human merge decision |
| T35 | Separate Admin curation product into future EPIC if approved | `BB-ADMIN-GALLERY` | BACKLOG | Admin control plane |

## Current hard DAG

```text
#13
├─ #14
│  ├─ #15
│  └─ #16
│     ├─ #17
│     │  ├─ #18 → #19
│     │  └─ #20
│     └─ #19
└─ #21 → #22 → #23

#24 ← #15 + #17 + #18 + #19 + #23
#25 ← #14 + #15 + #16 + #17 + #18 + #19 + #24
#26 ← #18 + #19 + #24
#29 ← #16 + #17 + #21 + #22
#30 ← #18 + #19 + #20 + #22 + #23 + #24 + #29
#31 ← #20 + #21 + #22 + #23 + #29
#32 ← #20 + #22 + #23 + #24 + #29 + #30 + #31
#27 ← #21 + #22 + #23 + #24 + #25 + #26 + #30 + #31 + #32
#28 ← #25 + #26 + #27 + #29 + #30 + #31 + #32 + all implementation issues
```

## Execution waves

```text
W0   #13 remediation → DoD PASS
W1   #14 || #21
W2   #15 || #16 || #22
W3   #17
W4   #18 || #20 || #23
W5   #19
W6   #29
W7   #24 || #31
W8   #25 || #26 || #30
W9   #32
W10  #27
W11  #28
```

## Per-issue execution equation

```text
ISSUE SUCCESS =
DoR PASS
+ scope/dependencies correct
+ AGENT-E valid
+ SKILL-E valid
+ implementation/analysis evidence
+ tests/security/relevant quality evidence
+ self-critique
+ AUTO-E
+ independent REVIEW-E
+ regression evidence
+ rollback evidence
+ DoD PASS
+ qualified final GO
```

Any mandatory component unresolved means `ISSUE SUCCESS = FALSE`.

## Storefront coverage after reconciliation

```text
VISUAL / BEHAVIOR TRANSPLANT        MAPPED
COMMERCE INTEGRATION                MAPPED
LOCALIZATION                        INCREMENTED #23/#24
IMAGE DELIVERY                      INCREMENTED #16/#26
COMMERCE-SHELL INTEGRATION          INCREMENTED #14/#24/#27
RUNTIME RESILIENCE                  OWNED #29
FUNCTIONAL E2E/CROSS-BROWSER        OWNED #30
OBSERVABILITY                       OWNED #31
SECURITY / PRIVACY                  OWNED #32
ROLLOUT / ROLLBACK                  OWNED #27
HUMAN RELEASE                       OWNED #28
ADMIN CURATION EXPERIENCE           OUTSIDE BB-NOS / FUTURE EPIC
```

## Next executable action

`#13 REMEDIATION / AUTO-IMPROVE ITERATION 1`

Required outcome before W1:

`NOS-GALLERY TRANSPLANT MANIFEST FROZEN`

Until then, #14 and #21 remain candidates only, not authorized implementation work.