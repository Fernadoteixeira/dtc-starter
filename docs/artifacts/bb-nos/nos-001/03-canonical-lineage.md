# NOS-001 — 03 Canonical Lineage (Upstream Analysis)

- **Date:** 2026-08-08
- **Agent:** RUG orchestrator (direct execution)
- **Scope:** Canonical `nos-gallery` source at pinned SHA `2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e`

## 1. Lineage chain

```
Fernadoteixeira/nos-gallery (canonical, named in #12/#13)
  └─ HEAD: 2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e
     ↓ (identical SHA — content-addressed identity)
boldfernando/nos-gallery (mirror alias, named in nos-gallery-first-fold.yaml)
  └─ HEAD: 2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e
     ↓ (embedded subproject, not formal .gitmodules)
apps/storefront/src/modules/nos-gallery (local mirror)
  └─ HEAD: 2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e
     (dirty: AGENTS.md modified, .turbo/ untracked — NO source files modified)
```

**Verdict:** No lineage conflict. All three resolve to the same commit SHA. Frozen as immutable source truth.

## 2. Upstream architecture overview

```
app/page.tsx (entry point)
  ├── fetches artworks via getGalleryArtworks() (from lib/artworks/repository)
  ├── builds JSON-LD via buildGalleryJsonLd()
  ├── renders <ArtGallerySlider artworks={...} initialArtworkCode={?obra=} />
  └── renders <GalleryStateScreen> for empty collection

components/art-gallery-slider.tsx (main slider — 549 lines)
  ├── State: currentIndex, activeDialog, progressOpen, sceneSelectionIntent, slideStep
  ├── Hooks: useSliderNavigation, useSliderDrag, useSliderWheel, usePrefersReducedMotion, useHasFinePointer, useArtworkDwell, useGalleryProgressSummary, useGalleryProgressActions
  ├── Catalog: createArtworkCatalog(artworks) → byCode, byCategory, byMaterial, byAvailability, indexByCode
  ├── Renders: GalleryAmbient, ArtworkCard[], NavigationDots, GalleryProgressControl
  ├── Dynamic imports: ArtworkDetailsDialog, InquiryModal (ssr: false)
  ├── Preloads: next adjacent artwork image
  ├── ResizeObserver: measures slide step (cardWidth + gap)
  ├── Analytics: artworkViewed, achievementUnlocked, inquiryOpened, sceneDiscovered, collectionResumeSelected
  └── Scene selection: from progress dialog → goToSlide + sceneSelectionIntent

components/artwork-card.tsx (artwork card — 672 lines)
  ├── State: isHovered, activeScene, loadedImageSrc
  ├── Props: artwork, isActive, isSceneDiscoveryEnabled, hasFinePointer, shouldReduceMotion, dragOffset, index, currentIndex, totalSlides, discoveredSceneKeys, sceneSelectionIntent, callbacks
  ├── Interactive scene navigation: pointer move → quadrant selection (2x2 grid → scene 0-3)
  ├── Parallax: useTransform on dragOffset, pointerX/Y → crochetImageX/Y, crochetRotateX/Y
  ├── Scene discovery: setTimeout(SCENE_DISCOVERY_DELAY_MS=650ms) after image load
  ├── Scene thumbnails: right-side rail, click/hover to change scene, discovered indicator (Check icon)
  ├── Save/share: useSavedArtworks, shareArtwork (Web Share API), toast notifications
  ├── Caption: year, title, contextualName, artist, location, role
  ├── Mobile action: "Conhecer a peça" button (md:hidden)
  ├── Reflection: bottom mirror with blur
  └── Accessibility: role=group, aria-roledescription=slide, aria-label, aria-current, aria-hidden, inert

components/gallery-ambient.tsx (ambient — 30 lines)
  ├── useArtworkColors hook → color extraction (canvas-based, cached in sessionStorage)
  ├── Renders radial gradients with framer-motion AnimatePresence
  ├── Respects shouldReduceMotion
  └── Falls back to DEFAULT_COLORS or artwork.ambientColors

components/navigation-dots.tsx (navigation — ~120 lines)
  ├── Bottom-centered nav bar with backdrop-blur
  ├── Prev/next arrows (ChevronLeft, ChevronRight from lucide-react)
  ├── Dot indicators: active dot width=27px vs 6px inactive
  ├── aria-label, aria-current support
  └── framer-motion animations

components/gallery-progress-control.tsx (progress — ~100 lines)
  ├── useGalleryProgressSummary + useGalleryProgressActions
  ├── Shows discovered/total scene count
  ├── Resume button → opens CollectionProgressDialog
  ├── Reset functionality
  ├── Analytics: collectionMapOpened, collectionProgressReset
  └── Dynamic import: CollectionProgressDialog
```

## 3. Upstream hooks inventory

| Hook | File | Purpose | Dependencies |
|---|---|---|---|
| `useSliderNavigation` | `hooks/use-slider-navigation.ts` | currentIndex state + keyboard (Arrow/Home/End) | React useState/useCallback/useEffect |
| `useSliderDrag` | `hooks/use-slider-drag.ts` | Mouse/touch drag with resistance, velocity, momentum | framer-motion useMotionValue, SLIDER_CONSTANTS |
| `useSliderWheel` | `hooks/use-slider-wheel.ts` | Wheel scroll with resistance and accumulator | SLIDER_CONSTANTS |
| `usePrefersReducedMotion` | `hooks/use-reduced-motion.ts` | Reduced motion media query | React useSyncExternalStore |
| `useHasFinePointer` | `hooks/use-reduced-motion.ts` | Fine pointer media query | React useSyncExternalStore |
| `useArtworkDwell` | `hooks/use-artwork-dwell.ts` | Dwell time tracking (>=2s) | Analytics.artworkDwell |
| `useArtworkColors` | `hooks/use-color-extraction.ts` | Color extraction with sessionStorage cache | DEFAULT_COLORS, color-extractor.ts |
| `useGalleryProgressSummary` | `hooks/use-gallery-progress.ts` | Read progress from localStorage | useSyncExternalStore, gallery-progress.ts |
| `useGalleryProgressActions` | `hooks/use-gallery-progress.ts` | Mutate progress (visit, discover, reset) | gallery-progress.ts |
| `useSavedArtworks` | `hooks/use-saved-artworks.ts` | Saved artworks in localStorage | Custom events for cross-tab sync |

## 4. Upstream lib inventory

| File | Purpose | Key exports |
|---|---|---|
| `lib/constants.ts` | All tuning constants | SLIDER_CONSTANTS, GALLERY_MOTION, GALLERY_EFFECTS, GALLERY_LAYOUT, AVAILABILITY_LABEL, AVAILABILITY_BADGE_CLASS, DEFAULT_COLORS, IMAGE_CACHE_BUST, SITE_URL, GALLERY_CONTACT_EMAIL, GALLERY_CONTACT_WHATSAPP |
| `lib/analytics.ts` | Vercel Analytics tracking | `Analytics` object with 16 track methods |
| `lib/gallery-progress.ts` | Progress logic | `GalleryProgressSnapshot`, `GalleryAchievement`, `createSceneDiscoveryKey`, `parseGalleryProgress`, `serializeGalleryProgress`, `markArtworkVisited`, `markSceneDiscovered`, `createGalleryProgressSummary`, `getNewlyUnlockedAchievements` |
| `lib/artworks/indexes.ts` | Catalog creation | `ArtworkCatalog`, `createArtworkCatalog`, `getArtworkByCode`, `getArtworkIndexByCode`, `getArtworksByCategory/Material/Availability` |
| `lib/artworks/catalog.ts` | (not directly read, likely static data) | Artwork catalog functions |
| `lib/utils.ts` | Utilities | `cn()` (clsx + tailwind-merge), `artworkImageUrl()` (cache-bust) |
| `lib/schema.ts` | JSON-LD SEO | `buildGalleryJsonLd()` |
| `lib/share.ts` | Web Share API | `shareArtwork()` → 'native'/'clipboard'/'cancelled' |
| `lib/color-extractor.ts` | Canvas color extraction | `extractColors()` (dynamically imported) |

## 5. Upstream CSS token system

The upstream `app/globals.css` defines a **copper/umber/linen** palette:

```css
--gallery-ink: #1b1814;           /* warm charcoal */
--gallery-ink-deep: #120e0b;      /* deep umber */
--gallery-surface: #272119;      /* warm surface */
--gallery-paper: #ede3d2;         /* linen */
--gallery-paper-bright: #fff8ec;  /* bright linen */
--gallery-accent: #c88f68;        /* COPPER */
--gallery-accent-bright: #e0ad82;  /* bright copper */
--gallery-accent-line: rgb(200 143 104 / 72%);
--gallery-copy: #d7c6ae;          /* warm copy */
--gallery-muted: #aa9a84;          /* warm muted */
```

Additional visual layers:
- `gallery-grain` — SVG noise filter with soft-light blend
- `gallery-vignette` — radial gradient darkening edges
- `gallery-card` — linear gradient with copy/surface mix
- `gallery-scene-pattern` — radial dot pattern for crochet cards
- `gallery-scene-light` — pointer-following radial glow
- `gallery-reflection` — blurred mirror below card
- `gallery-skeleton` — shimmer animation for loading
- `gallery-skip-link` — accessibility skip link

Card sizing:
- Mobile: `--gallery-card-size: min(22.5rem, calc(100vw - 2rem), calc(100svh - 8.75rem))`
- Desktop: `--gallery-card-size: min(31.25rem, calc(100vw - 5rem), calc(100svh - 15rem))`
- Mobile gap: `1.25rem` (20px)
- Desktop gap: `4rem` (64px)

## 6. Upstream data layer

`data/artworks.ts` exports 6 `ArtworkRecord` objects:
- FV-001 Espiral dourada (published, displayOrder: 1)
- FV-002 Órbita negra (published, displayOrder: 2)
- FV-003 Trama solar (draft, displayOrder: 99)
- FV-004 Fio ancestral (draft, displayOrder: 99)
- FV-005 Trança Âmbar (published, displayOrder: 3)
- FV-006 Duna Terracota (published, displayOrder: 4)

Each has 4 scenes (frente, perfil, gesto, detalhe), embedded ambient colors, full metadata (artist, location, role, year, material, dimensions, story, tags, artistUrl).

## 7. Upstream accessibility features

| Feature | Implementation |
|---|---|
| Skip link | `gallery-skip-link` — "Pular para a galeria" |
| ARIA carousel | `role=region`, `aria-roledescription=carrossel`, `aria-label`, `aria-keyshortcuts` |
| Slide roles | `role=group`, `aria-roledescription=slide`, `aria-label` with title/artist/position |
| Active state | `aria-current=true`, `aria-hidden` on inactive, `inert` on inactive |
| Keyboard | ArrowLeft/Right/Home/End (from useSliderNavigation) |
| ARIA live | `aria-live=polite`, `aria-atomic=true` for current artwork announcement |
| Help text | `sr-only` help description with `aria-describedby` |
| Focus visible | `focus-visible:ring-2` with `--gallery-accent` |
| Reduced motion | All animations disabled when `prefers-reduced-motion: reduce` |
| Scene labels | `aria-label` with scene number, label, and discovered status |
| Navigation | `aria-label` on prev/next, `aria-current` on active dot |

## 8. Upstream analytics events

16 tracked events via `@vercel/analytics`:
1. `artwork_viewed` — artworkId, title, index
2. `artwork_shared` — artworkId, method
3. `scene_changed` — artworkId, sceneIndex
4. `scene_discovered` — artworkId, sceneIndex, discoveredScenes, totalScenes
5. `collection_map_opened` — discoveredScenes, totalScenes
6. `collection_resume_selected` — artworkId, sceneIndex, source
7. `achievement_unlocked` — achievementId
8. `collection_progress_reset`
9. `runtime_error` — boundary, hasDigest
10. `web_vital` — metricName, value, label
11. `inquiry_opened` — artworkId, title
12. `inquiry_submission_started` — artworkId
13. `inquiry_delivery_succeeded` — artworkId
14. `inquiry_delivery_failed` — artworkId, reason
15. `inquiry_fallback_opened` — artworkId
16. `artwork_dwell` — artworkId, title, durationSeconds