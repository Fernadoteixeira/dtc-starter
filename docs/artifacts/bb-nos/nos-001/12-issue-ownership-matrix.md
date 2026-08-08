# 12 — Issue Ownership Matrix (NOS-001)

**Issue:** #13 (NOS-001)
**Protocol:** Canonical Autonomous Execution v4.0

> Maps each capability/behavior from the transplant manifest to its owning child issue.

---

## Issue→Capability Matrix

| Issue | Title | Capabilities Owned | Behaviors Owned | Disposition |
|---|---|---|---|---|
| **#13** | NOS-001: Freeze transplant manifest | Manifest, CSS token spec, type mapping, adapter design, architecture | B20 (SSR fallback spec), B21 (availability label spec), B22 (CSS palette spec), B23 (effects spec), B24 (layout spec) | PORT (spec), ADAPT (types) |
| **#14** | Navigation engine | C01-C04 (drag, wheel, swipe, keyboard nav), C16 (image preloading), C19 (responsive) | N01-N08, V11, L05-L06, L09, PF01, PF04 | PORT |
| **#15** | Accessibility layer | C18 (skip link), AC01-AC08 (all accessibility) | N04-N05, V12 (skeleton), AC01-AC08 | PORT |
| **#16** | Scene discovery & ambient | C05-C08 (scene discovery, color extraction, ambient, parallax→partially) | S01-S07, V01-V02, PF02 | PORT |
| **#17** | Parallax & visual effects | C08 (parallax), V05-V09 (card effects) | V05-V09, V11, PF05 | PORT |
| **#18** | Progress & gamification | C09 (progress tracking) | P01-P09 | PORT |
| **#19** | Save & share | C10-C11 (saved artworks, share) | I01-I04 | PORT |
| **#20** | Details dialog & SEO | C13 (details dialog), C14 (JSON-LD) | I08, SE01-SE03 | PORT/ADAPT |
| **#21** | Commerce integration | C21 (availability), D01-D05 (data/commerce) | D01-D05, I06 | ADAPT |
| **#22** | Inquiry modal | C12 (inquiry) | I07, A07 | DEFER→PORT |
| **#23** | Analytics integration | C15 (16 analytics events) | A01-A16 | ADAPT |
| **#24** | Integration testing | All capabilities integrated | All behaviors verified | TEST |
| **#25** | Visual regression | Visual parity with canonical | All visual behaviors | TEST |
| **#26** | Performance audit | Performance benchmarks | All performance behaviors | TEST |
| **#27** | Security review | Security audit | All behaviors | SEC |
| **#28** | Release gate | Final GO/NO-GO for release | All | GATE |

---

## Capability→Issue Reverse Map

| Capability | Owner Issue | Dependencies |
|---|---|---|
| C01 Drag navigation | #14 | #13 |
| C02 Wheel navigation | #14 | #13 |
| C03 Touch swipe | #14 | #13 |
| C04 Keyboard navigation | #15 | #14 |
| C05 Scene discovery | #16 | #14 |
| C06 Color extraction | #16 | #14 |
| C07 Ambient crossfade | #16 | #16 (C06) |
| C08 Parallax | #17 | #16 |
| C09 Progress tracking | #18 | #14, #16 |
| C10 Saved artworks | #19 | #14 |
| C11 Share | #19 | #14 |
| C12 Inquiry modal | #22 | #14, #21 |
| C13 Details dialog | #20 | #14, #16 |
| C14 JSON-LD schema | #20 | #14 |
| C15 Analytics | #23 | #14, #16, #18, #19 |
| C16 Image preloading | #14 | #13 |
| C17 Reduced motion | #15 | #13 |
| C18 Skip link | #15 | #13 |
| C19 Responsive layout | #14 | #13 |
| C20 SSR fallback | #13 | (none) |
| C21 Availability labels | #21 | #13 |
| C22 Reflection | #13 | (none) |

---

## NOS-001 Direct Deliverables

| Deliverable | Status | Evidence |
|---|---|---|
| Transplant manifest (06) | FROZEN | This document set |
| CSS token specification | DOCUMENTED | Artifact 06 §5 |
| Type mapping table | DOCUMENTED | Artifact 06 §4, artifact 09 |
| Adapter design | DOCUMENTED | Artifact 09 |
| Behavior contract matrix | DOCUMENTED | Artifact 07 (90 behaviors) |
| Commerce invariants | DOCUMENTED | Artifact 08 (22 invariants) |
| Dependency DAG | DOCUMENTED | Artifact 13 |
| Issue ownership | DOCUMENTED | This artifact |
| Intentional deviations | DOCUMENTED | Artifact 10 (16 deviations) |
| Residual gaps | DOCUMENTED | Artifact 11 (23 gaps) |

---

**End of artifact 12.**