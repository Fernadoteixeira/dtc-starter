# 12 — Issue Ownership Matrix (NOS-001, Remediated)

**Issue:** #13 (NOS-001)  
**Protocol:** Canonical Autonomous Execution v4.0  
**Status:** Auto-Improve Iteration 1  
**Scheduling SSOT:** current literal `Depends on:` fields in GitHub issue bodies #14–#32

> This matrix supersedes the DRAFT-0 role assignments. It does not infer ownership from the old artifact or from issue numbers.

## Issue → responsibility matrix

| Issue | NOS | Current responsibility | Domain | Hard predecessors |
|---|---|---|---|---|
| #13 | NOS-001 | Canonical source diff and transplant manifest | Architecture/governance | none |
| #14 | NOS-002 | Copper/umber/linen visual system and commerce-shell visual boundary | Visual/CSS | #13 |
| #15 | NOS-003 | Dynamic ambient, grain and vignette | Visual/ambient | #13, #14 |
| #16 | NOS-004 | ArtworkCard scene state, discovery and image-delivery contract | Gallery component/images | #13, #14 |
| #17 | NOS-005 | Active index and functional collection navigation | Interaction/navigation | #13, #16 |
| #18 | NOS-006 | Wheel, drag and swipe interaction engine | Interaction engine | #17 |
| #19 | NOS-007 | Pointer parallax and reduced-motion behavior | Motion/a11y/performance | #16, #18 |
| #20 | NOS-008 | Progress, dwell, discovery, persistence and privacy handoff | State/privacy | #16, #17 |
| #21 | NOS-009 | Deterministic, fail-closed Fio Vivo Medusa source | Commerce/source data | #13 |
| #22 | NOS-010 | Truthful Medusa → GalleryItem mapping and rejection taxonomy | Data contracts/security | #21 |
| #23 | NOS-011 | Localized PDP CTA and gallery analytics | Commerce/i18n/analytics | #17, #22 |
| #24 | NOS-012 | Responsive, keyboard and accessibility gate with commerce-shell integration | A11y/responsive QA | #15, #17, #18, #19, #23 |
| #25 | NOS-013 | Visual regression parity against the pinned baseline | Visual QA | #14, #15, #16, #17, #18, #19, #24 |
| #26 | NOS-014 | First-fold and image-delivery performance budgets | Performance QA | #18, #19, #24 |
| #27 | NOS-015 | Feature flag, rollout, fallback and rollback contract | Release operations | #21, #22, #23, #24, #25, #26, #30, #31, #32 |
| #28 | NOS-016 | Terminal human visual and release decision | Human release gate | #25, #26, #27, #29, #30, #31, #32, plus all implementation issues under #12 |
| #29 | NOS-017 | Runtime resilience and degraded-state UX | Runtime resilience | #16, #17, #21, #22 |
| #30 | NOS-018 | Functional E2E and cross-browser/device release gate | System QA | #18, #19, #20, #22, #23, #24, #29 |
| #31 | NOS-019 | Vendor-neutral observability and diagnostics contract | Operations | #20, #21, #22, #23, #29 |
| #32 | NOS-020 | Storefront security and privacy release gate | Security/privacy | #20, #22, #23, #24, #29, #30, #31 |

## Hard successors derived from current bodies

| Issue | Hard successors |
|---|---|
| #13 | #14, #15, #16, #17, #21 |
| #14 | #15, #16, #25 |
| #15 | #24, #25 |
| #16 | #17, #19, #20, #25, #29 |
| #17 | #18, #20, #23, #24, #25, #29 |
| #18 | #19, #24, #25, #26, #30 |
| #19 | #24, #25, #26, #30 |
| #20 | #30, #31, #32 |
| #21 | #22, #27, #29, #31 |
| #22 | #23, #27, #29, #30, #31, #32 |
| #23 | #24, #27, #30, #31, #32 |
| #24 | #25, #26, #27, #30, #32 |
| #25 | #27, #28 |
| #26 | #27, #28 |
| #27 | #28 |
| #29 | #28, #30, #31, #32 |
| #30 | #27, #28, #32 |
| #31 | #27, #28, #32 |
| #32 | #27, #28 |
| #28 | none |

The open expression in #28 (`all implementation issues under #12`) is retained verbatim rather than silently converted into a closed list. Before #28 DoR, the issue body must enumerate that set explicitly.

## Ownership gaps intentionally not reassigned

The DRAFT-0 matrix assigned dedicated issues for save/share, details/SEO and inquiry. Current issue bodies #14–#32 do not expose equivalent owners. These capabilities remain residual scope questions and are not silently reassigned.

## NOS-001 direct deliverables

| Deliverable | Current status | Evidence |
|---|---|---|
| Canonical SHA and lineage | VALIDATED | `03-canonical-lineage.md` |
| Source→target manifest | REMEDIATED, review pending | `06-source-target-manifest.md` and `.json` |
| Behavior contract matrix | DOCUMENTED | `07-behavior-contract-matrix.md` |
| Commerce invariants | DOCUMENTED | `08-commerce-invariants.md` |
| Current ownership | REMEDIATED | this artifact |
| Current hard DAG | REMEDIATED | `13-dependency-dag.md` |
| Provenance taxonomy | REMEDIATED | `15-agent-skill-binding.md`, `16-agent-skill-evidence.yaml` |
| Independent review | PENDING | `agent-self-critique/18-independent-review.md` |
| Final DoD | PENDING | `agent-self-critique/19-final-360-completion.md` |

**Gate:** DRAFT-0 freeze claim is invalid until independent review and final evidence reconciliation pass.
