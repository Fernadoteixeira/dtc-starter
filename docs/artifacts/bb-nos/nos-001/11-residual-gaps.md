# 11 — Residual Gaps (NOS-001)

> **SUPERSEDED_RESIDUAL_GAPS:** this snapshot cannot define current blockers or deferrals. Use `residual_gaps` and `acceptance_checklist` in the Iteration 1+ manifest; Commercial Truth, canonical port and all product gates remain open.

**Issue:** #13 (NOS-001)
**Protocol:** Canonical Autonomous Execution v4.0

> Gaps that remain after NOS-001 and must be addressed in child issues. These are NOT blockers for NOS-001 DoD — they are explicitly deferred.

---

## 1. Implementation Gaps (Deferred to Child Issues)

| # | Gap | Description | Owner Issue | Severity |
|---|---|---|---|---|
| RG01 | Navigation not implemented | Drag, wheel, swipe, keyboard navigation | #14 | HIGH |
| RG02 | Accessibility not implemented | ARIA carousel, keyboard, skip link, reduced motion | #15 | HIGH |
| RG03 | Scene discovery not implemented | Pointer quadrant mapping, scene transitions | #16 | HIGH |
| RG04 | Parallax not implemented | Pointer-driven X/Y/rotate effects | #17 | MEDIUM |
| RG05 | Progress tracking not implemented | localStorage, achievements, progress panel | #18 | MEDIUM |
| RG06 | Save/share not implemented | Bookmark, Web Share API | #19 | MEDIUM |
| RG07 | Details dialog not implemented | Dynamic import dialog with full artwork info | #20 | MEDIUM |
| RG08 | Commerce integration not hardened | Medusa adapter validation, error handling | #21 | HIGH |
| RG09 | Inquiry modal not implemented | sonner toast inquiry (DEFERRED) | #22 | LOW |
| RG10 | Analytics not implemented | 16 events via AnalyticsAdapter | #23 | MEDIUM |
| RG11 | CSS palette not applied | Copper/umber/linen tokens not yet in target CSS | #13 (NOS-001 scope: manifest only) → #14+ | HIGH |
| RG12 | CSS effects not applied | Grain, vignette, reflection, skeleton | #13 (manifest) → #14+ | MEDIUM |

## 2. Verification Gaps

| # | Gap | Description | Resolution |
|---|---|---|---|
| RG13 | Availability mapping not validated | ArtworkAvailability → GalleryAvailability mapping table is designed but not tested with real Medusa data | #21 validates with integration tests |
| RG14 | Analytics adapter not tested | AnalyticsAdapter interface is designed but no concrete implementation exists | #23 creates implementation + tests |
| RG15 | Inline SVG icons not verified | 5 inline SVG components are designed but not created/compared to lucide-react originals | #14 creates and visually verifies |
| RG16 | CSS token replacement not verified | Copper/umber/linen tokens are documented but not applied to target CSS | #13 is manifest only; #14+ applies |
| RG17 | Type compatibility not runtime-tested | Artwork→GalleryItem adapter is designed but not tested with real Medusa products | #21 tests adapter with real data |

## 3. Documentation Gaps

| # | Gap | Description | Resolution |
|---|---|---|---|
| RG18 | AGENTS.md framer-motion statement | AGENTS.md says "No Framer Motion" for storefront — correct for storefront, but gallery-experience package has it. | Update AGENTS.md in a future housekeeping issue (NOT in scope for NOS-001) |
| RG19 | Source attribution discrepancy | Issue #13 references `Fernadoteixeira/nos-gallery`; contract references `boldfernando/nos-gallery` | Documented in DISC-E2 (DoR). Both resolve to same SHA. No action needed. |
| RG20 | nos-gallery subproject status | Subproject is at canonical SHA but dirty (AGENTS.md modified, .turbo/ untracked) | No action needed — subproject is reference-only. |

## 4. Risk Gaps

| # | Gap | Description | Mitigation |
|---|---|---|---|
| RG21 | Medusa metadata schema assumption | Adapter assumes `metadata.gallery.*` fields exist on products | #21 validates with real Medusa product metadata; fallback handles missing fields |
| RG22 | Scene image source | Adapter assumes `metadata.gallery.sceneImages` contains image URLs | #21 validates; if not present, falls back to product images |
| RG23 | Ambient color source | Adapter assumes `metadata.gallery.ambientColors` contains hex arrays | #16 (color extraction) can extract from images if metadata missing |

---

## 5. NOT Gaps (Explicitly Out of Scope)

| Item | Why Not a Gap |
|---|---|
| Code not implemented | NOS-001 is an analysis/planning issue. Implementation is #14–#28. |
| Tests not written | NOS-001 has no code to test. Tests belong to child issues. |
| CSS not applied | NOS-001 produces the manifest. CSS application is #13 scope (manifest documents what to apply, not application itself). |
| Build not run | NOS-001 makes no code changes. Build verification is for child issues. |

---

**End of artifact 11.**
