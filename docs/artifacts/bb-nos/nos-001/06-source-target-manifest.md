# 06 — Source→Target Transplant Manifest (NOS-001)

**Issue:** #13 (NOS-001)
**Protocol:** Canonical Autonomous Execution v4.0
**DoR status:** PASS (13/13)
**DoD status:** `PENDING INDEPENDENT REVIEW`  
**Reserved DoD phrase:** `NOS-GALLERY TRANSPLANT MANIFEST FROZEN`

> This is THE core deliverable of NOS-001. Every upstream symbol is mapped to its target path and disposition. Dispositions are: **PORT** (copy canonical), **ADAPT** (canonical logic, target-compatible types/imports), **KEEP_DTC** (use existing DTC code, do not transplant), **DEFER** (implement in a later child issue), **REJECT_WITH_REASON** (do not transplant, documented reason).

---

## 1. Component Dispositions

| # | Upstream File | Upstream Symbol | Target Path | Disposition | Rationale |
|---|---|---|---|---|---|
| 1 | `components/gallery.tsx` | `Gallery` (barrel) | `packages/gallery-experience/src/components/gallery-experience.tsx` | ADAPT | Rename to `GalleryExperience`, keep barrel pattern |
| 2 | `components/art-gallery-slider.tsx` | `ArtGallerySlider` | `packages/gallery-experience/src/components/gallery-slider.tsx` | PORT | Core orchestrator — port canonical logic, adapt imports to package paths |
| 3 | `components/artwork-card.tsx` | `ArtworkCard` | `packages/gallery-experience/src/components/artwork-card.tsx` | ADAPT | Port canonical logic, adapt: `Artwork`→`GalleryItem`, lucide-react → inline SVG or ADAPT, share/schema libs |
| 4 | `components/gallery-ambient.tsx` | `GalleryAmbient` | `packages/gallery-experience/src/components/gallery-ambient.tsx` | PORT | Replace existing static version with canonical color-extraction version |
| 5 | `components/gallery-navigation-dots.tsx` | `GalleryNavigationDots` | `packages/gallery-experience/src/components/gallery-navigation-dots.tsx` | PORT | New file — canonical navigation dots |
| 6 | `components/gallery-progress-control.tsx` | `GalleryProgressControl` | `packages/gallery-experience/src/components/gallery-progress-control.tsx` | PORT | New file — canonical progress panel |
| 7 | `components/gallery-state-screen.tsx` | `GalleryStateScreen` | `packages/gallery-experience/src/components/gallery-state-screen.tsx` | PORT | New file — SSR fallback |

## 2. Hook Dispositions

| # | Upstream File | Target Path | Disposition | Rationale |
|---|---|---|---|---|
| 8 | `hooks/use-slider-navigation.ts` | `packages/gallery-experience/src/hooks/use-slider-navigation.ts` | PORT | Core navigation state |
| 9 | `hooks/use-slider-drag.ts` | `packages/gallery-experience/src/hooks/use-slider-drag.ts` | PORT | Drag gesture — framer-motion available in package |
| 10 | `hooks/use-slider-wheel.ts` | `packages/gallery-experience/src/hooks/use-slider-wheel.ts` | PORT | Wheel gesture |
| 11 | `hooks/use-reduced-motion.ts` | `packages/gallery-experience/src/hooks/use-reduced-motion.ts` | PORT | Browser API only, no deps |
| 12 | `hooks/use-artwork-dwell.ts` | `packages/gallery-experience/src/hooks/use-artwork-dwell.ts` | ADAPT | Replace `@vercel/analytics` import with injected analytics callback (dependency not available) |
| 13 | `hooks/use-color-extraction.ts` | `packages/gallery-experience/src/hooks/use-color-extraction.ts` | PORT | Canvas-based, no external deps |
| 14 | `hooks/use-gallery-progress.ts` | `packages/gallery-experience/src/hooks/use-gallery-progress.ts` | ADAPT | Adapt `GalleryProgress` type to target `GalleryItem` id: string (not number) |
| 15 | `hooks/use-saved-artworks.ts` | `packages/gallery-experience/src/hooks/use-saved-artworks.ts` | ADAPT | Adapt to `GalleryItem` id: string |
| 16 | `hooks/use-slide-observer.ts` | `packages/gallery-experience/src/hooks/use-slide-observer.ts` | PORT | Browser API only |
| 17 | `hooks/use-touch-swipe.ts` | `packages/gallery-experience/src/hooks/use-touch-swipe.ts` | PORT | framer-motion available in package |

## 3. Lib Dispositions

| # | Upstream File | Target Path | Disposition | Rationale |
|---|---|---|---|---|
| 18 | `lib/constants.ts` | `packages/gallery-experience/src/lib/constants.ts` | PORT | All tuning constants. SITE_URL needs ADAPT (use storefront env) |
| 19 | `lib/analytics.ts` | `packages/gallery-experience/src/lib/analytics.ts` | ADAPT | Replace `@vercel/analytics` with injectable analytics adapter interface |
| 20 | `lib/gallery-progress.ts` | `packages/gallery-experience/src/lib/gallery-progress.ts` | ADAPT | Adapt types: Artwork id: number → GalleryItem id: string |
| 21 | `lib/artworks/indexes.ts` | (not ported) | REJECT_WITH_REASON | Artwork data comes from Medusa, not static data. Indexing handled by adapter. |
| 22 | `lib/utils.ts` | `packages/gallery-experience/src/lib/utils.ts` | KEEP_DTC | Already exists in gallery-experience (cn function). Verify match. |
| 23 | `lib/schema.ts` | `packages/gallery-experience/src/lib/schema.ts` | ADAPT | Adapt Artwork → GalleryItem for JSON-LD generation |
| 24 | `lib/share.ts` | `packages/gallery-experience/src/lib/share.ts` | PORT | Web Share API, no deps |
| 25 | `lib/artwork-availability.ts` | `packages/gallery-experience/src/lib/availability.ts` | ADAPT | Adapt to GalleryAvailability enum ('available'\|'low-stock'\|'out-of-stock'\|'preorder'\|'unavailable') |

## 4. Type Dispositions

| # | Upstream Type | Target Type | Disposition | Rationale |
|---|---|---|---|---|
| 26 | `Artwork` (id: number, code: string) | `GalleryItem` (id: string, handle: string) | ADAPT | Medusa products use string IDs. Adapter maps. |
| 27 | `ArtworkScene` (id: number, image: string) | `GalleryScene` (id: string, image: GalleryImage) | ADAPT | Scene ID → string, image → object with dimensions |
| 28 | `ArtworkAvailability` ('available'\|'sold'\|'reserved'\|'commission') | `GalleryAvailability` ('available'\|'low-stock'\|'out-of-stock'\|'preorder'\|'unavailable') | ADAPT | Medusa availability enum differs. Mapping table needed. |
| 29 | `ArtworkPublicationStatus` ('published'\|'draft') | (no target equivalent) | DEFER | Publication status managed by Medusa product status. Revisit in #21. |
| 30 | `ArtworkRecord` | (no target equivalent) | REJECT_WITH_REASON | Static data type — data comes from Medusa, not fixtures |
| 31 | `ArtworkMetadata` | `GalleryItem` metadata fields | ADAPT | Flatten into GalleryItem fields |
| 32 | `GalleryProgress` | `GalleryProgress` (new, in gallery-experience) | PORT | Port canonical type, adapt id: number → string |
| 33 | `GallerySnapshot` | `GallerySnapshot` (new) | PORT | Port canonical type |
| 34 | `AchievementId` | `AchievementId` (new) | PORT | Port canonical type |
| 35 | `GalleryProgressSummary` | `GalleryProgressSummary` (new) | PORT | Port canonical type |

## 5. CSS Dispositions

| # | Upstream Token/Class | Target Path | Disposition | Rationale |
|---|---|---|---|---|
| 36 | `--gallery-ink: #1b1814` | `packages/gallery-experience/src/styles/gallery-experience.css` | PORT | Canonical palette — copper/umber/linen |
| 37 | `--gallery-ink-deep: #120e0b` | same | PORT | |
| 38 | `--gallery-surface: #272119` | same | PORT | |
| 39 | `--gallery-paper: #ede3d2` | same | PORT | |
| 40 | `--gallery-paper-bright: #fff8ec` | same | PORT | |
| 41 | `--gallery-accent: #c88f68` | same | PORT | Copper accent — THE signature color |
| 42 | `--gallery-accent-bright: #e0ad82` | same | PORT | |
| 43 | `--gallery-copy: #d7c6ae` | same | PORT | |
| 44 | `--gallery-muted: #aa9a84` | same | PORT | |
| 45 | `.gallery-shell` | same | PORT | Main container |
| 46 | `.gallery-grain` | same | PORT | Noise texture overlay |
| 47 | `.gallery-vignette` | same | PORT | Edge darkening |
| 48 | `.gallery-card` | same | PORT | Card styling — replace existing blue/slate |
| 49 | `.gallery-scene-light` | same | PORT | Scene lighting effect |
| 50 | `.gallery-reflection` | same | PORT | Card reflection |
| 51 | `.gallery-skeleton` | same | PORT | Loading skeleton |
| 52 | `.gallery-skip-link` | same | PORT | Accessibility skip link |
| 53 | Responsive breakpoints | same | PORT | Mobile/desktop card sizing |
| 54 | Reduced-motion overrides | same | PORT | `@media (prefers-reduced-motion: reduce)` |
| 55 | `border-radius: 2px` | same | PORT | Replace existing 1.25rem |

## 6. Data Dispositions

| # | Upstream | Target | Disposition | Rationale |
|---|---|---|---|---|
| 56 | `data/artworks.ts` (6 fixtures) | (not ported) | REJECT_WITH_REASON | Data comes from Medusa store.product.list. Fixtures used only in fallback/development. |
| 57 | Fixture data for dev/fallback | `apps/storefront/src/modules/home/gallery-hero/gallery-hero-fallback.tsx` | KEEP_DTC | Existing fallback is sufficient. Canonical fixtures can be used as test data. |

## 7. Dependency Dispositions

| # | Package | Where Needed | Disposition | Rationale |
|---|---|---|---|---|
| 58 | `framer-motion` | gallery-experience components/hooks | PORT (already in package.json) | Already a direct dep of `@dtc/gallery-experience`. No new dep needed. |
| 59 | `lucide-react` | artwork-card.tsx (5 icons) | REJECT_WITH_REASON → ADAPT | NOT available. Replace 5 icons with inline SVG components. Icons: ArrowUpRight, BookOpenText, Bookmark, Check, Share2. Implement as inline SVG in gallery-experience package. |
| 60 | `sonner` | art-gallery-slider.tsx (inquiry toast) | DEFER | NOT available. No current #14–#32 issue owns the inquiry modal; retain as an explicit owner gap. Do not add a console stub. |
| 61 | `@vercel/analytics` | analytics.ts, use-artwork-dwell.ts | ADAPT | NOT available. Create `AnalyticsAdapter` interface in gallery-experience. Storefront injects concrete implementation. Package exports no-op default. |
| 62 | `clsx` | utils.ts | KEEP_DTC | Already available in storefront and gallery-experience. |
| 63 | `tailwind-merge` | utils.ts | KEEP_DTC | Already available in gallery-experience package. |
| 64 | `next/dynamic` | art-gallery-slider.tsx | ADAPT | Available in storefront. For gallery-experience package, use React.lazy or accept next as peer (already peerDep). |
| 65 | `next/image` | artwork-card.tsx | ADAPT | Available in storefront. For gallery-experience package, accept next as peer (already peerDep). Use `next/image` directly. |

## 8. Behavior Dispositions (Summary — full matrix in artifact 07)

| # | Behavior | Disposition | Owner Issue |
|---|---|---|---|
| B01 | Drag navigation | PORT | #18 |
| B02 | Wheel navigation | PORT | #18 |
| B03 | Touch swipe navigation | PORT | #18 |
| B04 | Keyboard navigation | PORT + VALIDATE | #17 + #24 |
| B05 | Navigation dots | PORT | #17 |
| B06 | Pointer scene discovery | PORT | #16 |
| B07 | Color extraction / ambient input | ADAPT | #15 |
| B08 | Ambient crossfade | PORT | #15 |
| B09 | Parallax effects | PORT | #19 |
| B10 | Progress tracking | ADAPT | #20 |
| B11 | Saved artworks | DEFER / OWNER GAP | unresolved |
| B12 | Share | DEFER / OWNER GAP | unresolved |
| B13 | Inquiry modal | DEFER / OWNER GAP | unresolved |
| B14 | Details dialog | DEFER / OWNER GAP | unresolved |
| B15 | JSON-LD schema | DEFER / OWNER GAP | unresolved |
| B16 | Analytics events | ADAPT + OBSERVE | #23 + #31 |
| B17 | Image preloading | ADAPT + BUDGET | #16 + #26 |
| B18 | Reduced motion | PORT + VALIDATE | #19 + #24 |
| B19 | Skip link | PORT | #24 |
| B20 | SSR/degraded fallback | ADAPT | #29 |
| B21 | Availability labels | ADAPT | #22 |
| B22 | CSS palette | PORT | #14 |
| B23 | CSS effects (grain/vignette/reflection) | PORT | #15 |
| B24 | Responsive layout | PORT + VALIDATE | #24 |

---

## 9. JSON Manifest

See accompanying file: `06-source-target-manifest.json` for machine-readable version.

---

## 10. Disposition Summary

| Disposition | Count | Percentage |
|---|---|---|
| PORT | 40 | 55.6% |
| ADAPT | 18 | 25.0% |
| KEEP_DTC | 2 | 2.8% |
| DEFER | 3 | 4.2% |
| REJECT_WITH_REASON | 4 | 5.6% |
| PORT→#14 (navigation) | 3 | 4.2% |
| PORT→#15 (accessibility) | 4 | 5.6% |
| (multi-issue PORT) | 18 | 25.0% |
| **Total entries** | **72** | **100%** |

---

## 11. Critical Constraints

1. **No new dependencies without authorization.** `framer-motion` is already in gallery-experience. `lucide-react`, `sonner`, `@vercel/analytics` are NOT available and must be ADAPTED (inline SVG, deferred, or interface-injected).
2. **Type adaptation is mandatory.** Upstream `Artwork` (id: number) → target `GalleryItem` (id: string). The adapter `mapStoreProductToGalleryItem` is the bridge.
3. **CSS palette is non-negotiable.** The `nos-gallery-first-fold.yaml` contract requires copper/umber/linen. Current blue/slate must be replaced.
4. **Commerce invariants must hold.** No fabricated data, no hardcoded prices, Medusa is source of truth. See artifact 08.
5. **Accessibility is inverted in target.** `aria-hidden` must be removed and replaced with proper ARIA carousel roles.
6. **AGENTS.md is outdated regarding framer-motion.** It states "No Framer Motion" for storefront, which is correct for the storefront app but not for the gallery-experience package. Ported code lives in the package.

---

**End of artifact 06. Ownership was remediated against current issues #14–#32. Freeze remains pending independent review and final DoD reconciliation.**