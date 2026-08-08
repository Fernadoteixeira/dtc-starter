# BB-NOS Canonical Executive Issue Governance Artifact

Repository: `Fernadoteixeira/dtc-starter`  
Parent EPIC: #12  
Canonical upstream: `Fernadoteixeira/nos-gallery@2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e`

## Executive status

```text
VISÃO GERAL
BB-NOS / EPIC #12                      🔴 NO-GO
NOS-GALLERY COMO REFERÊNCIA            🟢 VALIDADO
MANIFESTO CANÔNICO / #13               🟡 DRAFT-0 / REMEDIATION
NOS-GALLERY TRANSPLANTADO              🔴 PENDENTE
FIDELIDADE VISUAL                      🔴 PENDENTE
FIDELIDADE COMPORTAMENTAL              🔴 PENDENTE
COMMERCE TRUTH                         🟡 BASE / HARDENING PENDENTE
RUNTIME RESILIENCE                     🔴 #29
FUNCTIONAL E2E / CROSS-BROWSER         🔴 #30
OBSERVABILITY                          🔴 #31
SECURITY / PRIVACY                     🔴 #32
ROLLOUT / ROLLBACK                     🔴 #27
HUMAN VISUAL APPROVAL                  🔴 #28
RELEASE CANDIDATE                      🔴 NOT READY
```

## Storefront

```text
APPLICATION / STOREFRONT               🟡
HOME / FIRST FOLD                      🟡
GALLERY HERO                           🟡
NOS REFERENCE / MANIFEST           #13 🟡
VISUAL SYSTEM                      #14 🔴
AMBIENT / GRAIN / VIGNETTE         #15 🔴
ARTWORK CARD / SCENES               #16 🔴
ACTIVE INDEX / NAVIGATION           #17 🔴
DRAG / WHEEL                        #18 🔴
PARALLAX / REDUCED MOTION           #19 🔴
PROGRESS / DWELL / DISCOVERY        #20 🔴
CTA / ANALYTICS / LOCALIZATION      #23 🔴
A11Y / RESPONSIVENESS               #24 🔴
VISUAL PARITY                       #25 🔴
PERFORMANCE                         #26 🔴
RUNTIME RESILIENCE                  #29 🔴
FUNCTIONAL E2E / CROSS-BROWSER      #30 🔴
OBSERVABILITY                       #31 🔴
SECURITY / PRIVACY                  #32 🔴
ROLLOUT                             #27 🔴
HUMAN RELEASE                       #28 🔴
```

## Backend / Commerce

```text
MEDUSA BACKEND                         🟢 FOUNDATION EXISTS
REGION / COUNTRY CONTEXT               🟢 PRESERVE
PRODUCT / PDP ROUTING                  🟢 PRESERVE
FIO VIVO COLLECTION SOURCE         #21 🔴
FAIL-CLOSED COLLECTION             #21 🔴
DETERMINISTIC ELIGIBILITY          #21 🔴
MEDUSA → GALLERYITEM TRUTH         #22 🔴
CALCULATED PRICE / VARIANT POLICY  #22 🔴
INVENTORY / AVAILABILITY TRUTH     #22 🔴
METADATA VALIDATION                #22 🔴
LOCALIZED PRODUCT CTA              #23 🔴
COMMERCE-SAFE FALLBACK             #27 🔴
```

## Admin

Current BB-NOS owns the consumption experience, not a full operator/curation product.

```text
MEDUSA ADMIN                          ⚪ OUTSIDE CURRENT BB-NOS
FIO VIVO CURATION                     ⚪ FUTURE EPIC CANDIDATE
GALLERY METADATA MANAGEMENT           ⚪ FUTURE EPIC CANDIDATE
SCENE / AMBIENT MANAGEMENT            ⚪ FUTURE EPIC CANDIDATE
FIRST-FOLD ORDERING                   ⚪ FUTURE EPIC CANDIDATE
PRODUCT ELIGIBILITY CONTROL           ⚪ FUTURE EPIC CANDIDATE
EDITORIAL PERSONALIZATION             ⚪ FUTURE EPIC CANDIDATE
OPERATOR AUDIT / DIAGNOSTICS UI       ⚪ FUTURE EPIC CANDIDATE
```

Recommended future parent: `[EPIC][BB-ADMIN-GALLERY] Fio Vivo Gallery Curation & Merchandising Control Plane`.

## Expanded issue map

| Issue | Responsibility | Domain |
|---|---|---|
| #13 | Frozen source diff + transplant manifest | Architecture |
| #14 | Copper/umber/linen visual system | Storefront/Design |
| #15 | Ambient/grain/vignette | Storefront/Visual |
| #16 | ArtworkCard scenes + image contract | Storefront |
| #17 | Active index/navigation | Interaction |
| #18 | Drag/wheel | Interaction |
| #19 | Parallax/reduced motion | Interaction/A11y |
| #20 | Progress/dwell/discovery | State/Privacy |
| #21 | Fio Vivo fail-closed source | Backend/Commerce |
| #22 | Truthful Medusa adapter | Backend/Commerce |
| #23 | CTA/analytics/localization | Storefront/Commerce |
| #24 | Responsive/keyboard/a11y | Quality |
| #25 | Visual parity | Visual QA |
| #26 | Performance/image budgets | Performance |
| #29 | Runtime resilience/degraded UX | Runtime |
| #30 | Functional E2E/cross-browser | System QA |
| #31 | Observability/diagnostics | Operations |
| #32 | Security/privacy gate | Security |
| #27 | Rollout/flag/fallback/rollback | Release Ops |
| #28 | Human visual/release decision | Human Gate |

## Canonical agent architecture

SSOT candidate: `.agents/canonical-agent-shortcuts.yaml`

```text
18 canonical Ollama Superpowers agents
            +
RUG specialist profiles/validators
            +
28 core skills
            +
18 canonical Medusa skills
            +
NOS-205 atomic skill resolver
            +
Product-Lifecycle-315 orchestration resolver
            +
contracts/governance
```

Primary aliases:
`@orchestrate:nos`, `@architect:nos`, `@impl:nos`, `@impl:storefront`, `@impl:medusa`, `@repo:guard`, `@css:spec`, `@css:impl`, `@css:validate`, `@visual:audit`, `@build:verify`, `@qa:nos`, `@regression:nos`, `@runtime:nos`, `@security:nos`, `@release:nos`, `@i18n`.

## Governance invariant

```text
NO EVIDENCE = UNVERIFIED
NO DoR PASS = NO START
NO DoD PASS = NO DONE
NO QUALIFIED GO = NO TRANSITION
TECHNICAL GO ≠ MERGE AUTHORIZATION
AUTOMATION ≠ HUMAN VISUAL APPROVAL
```

## Root next step

`#13 REMEDIATION + AUTO-IMPROVE ITERATION 1`

Required terminal outcome before W1:

`NOS-GALLERY TRANSPLANT MANIFEST FROZEN`

Only then may #14 and #21 enter their own independent DoR gates.
