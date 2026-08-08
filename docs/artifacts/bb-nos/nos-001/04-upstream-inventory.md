# 04 — Upstream Source Inventory (NOS-001)

**Issue:** #13 (NOS-001)
**Canonical SHA:** `2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e`
**Source path:** `apps/storefront/src/modules/nos-gallery/`
**Protocol:** Canonical Autonomous Execution v4.0
**DoR status:** PASS (13/13)

---

## 1. Complete File Inventory

### 1.1 App Entry

| Path | Lines | Role | Dependencies |
|---|---|---|---|
| `app/page.tsx` | 11 | Home page entry — renders `<Gallery />` inside `<AppShell>` | next, `@/components/gallery` |

### 1.2 Components

| Path | Lines | Role | Key Imports |
|---|---|---|---|
| `components/gallery.tsx` | 3 | Barrel re-export of `ArtGallerySlider` | `@/components/art-gallery-slider` |
| `components/art-gallery-slider.tsx` | 549 | **Main slider orchestrator** — active index, drag/wheel/swipe navigation, scene management, preloading, ResizeObserver, analytics, dynamic dialog imports | framer-motion, 10 hooks, constants, analytics, artworks data, types |
| `components/artwork-card.tsx` | 672 | **Artwork card** — pointer scene navigation (2x2 quadrant), parallax, scene discovery (650ms), save/share, caption, reflection, image preloading | framer-motion, lucide-react (5 icons), hooks, constants, share lib, schema lib |
| `components/gallery-ambient.tsx` | ~40 | Ambient background with color extraction, crossfade transitions | framer-motion, `use-color-extraction` hook, constants |
| `components/gallery-navigation-dots.tsx` | ~30 | Navigation dots (one per artwork) with keyboard arrows, scroll-on-click | framer-motion |
| `components/gallery-progress-control.tsx` | ~50 | Progress panel showing artworks visited, scenes discovered, achievements | framer-motion, `use-gallery-progress` hook, constants |
| `components/gallery-state-screen.tsx` | ~30 | SSR fallback screen with static gradient | (none) |

### 1.3 Hooks

| Path | Lines | Role | Dependencies |
|---|---|---|---|
| `hooks/use-slider-navigation.ts` | ~80 | Active index management, direction calculation, boundary detection | framer-motion (useMotionValue), constants |
| `hooks/use-slider-drag.ts` | ~120 | Drag gesture handling, resistance, velocity, momentum easing | framer-motion (pan, useMotionValue), constants |
| `hooks/use-slider-wheel.ts` | ~80 | Wheel gesture handling, resistance, threshold, reset delay | framer-motion (useMotionValue), constants |
| `hooks/use-reduced-motion.ts` | ~20 | Detects `prefers-reduced-motion` media query | (browser API only) |
| `hooks/use-artwork-dwell.ts` | ~40 | Dwell time tracking, fires `artwork_dwell` analytics after 3s | `@vercel/analytics`, constants |
| `hooks/use-color-extraction.ts` | ~100 | Canvas-based color extraction from scene images, sessionStorage cache | (browser API only) |
| `hooks/use-gallery-progress.ts` | ~120 | Progress tracking via localStorage, achievements, scene/artwork discovery | `@/lib/gallery-progress`, types, constants |
| `hooks/use-saved-artworks.ts` | ~60 | Saved artworks collection, localStorage persistence, toggle state | types, constants |
| `hooks/use-slide-observer.ts` | ~30 | ResizeObserver for slide dimensions | (browser API only) |
| `hooks/use-touch-swipe.ts` | ~50 | Touch swipe gesture handling for mobile | framer-motion (useMotionValue), constants |

### 1.4 Lib

| Path | Lines | Role | Dependencies |
|---|---|---|---|
| `lib/constants.ts` | ~120 | All tuning constants: SLIDER_CONSTANTS, GALLERY_MOTION, GALLERY_EFFECTS, GALLERY_LAYOUT, AVAILABILITY_LABEL, AVAILABILITY_BADGE_CLASS, DEFAULT_COLORS, IMAGE_CACHE_BUST, SITE_URL | (none) |
| `lib/analytics.ts` | ~60 | 16 Vercel Analytics event wrappers | `@vercel/analytics` |
| `lib/gallery-progress.ts` | 342 | GalleryProgressSnapshot, 4 achievements, localStorage with validation/parsing, summary creation | (none) |
| `lib/artworks/indexes.ts` | ~20 | Artwork lookup indexes by id and code | `@/data/artworks` |
| `lib/utils.ts` | ~20 | `cn()` class merge utility | clsx, tailwind-merge |
| `lib/schema.ts` | ~40 | JSON-LD schema generation for artwork SEO | (none) |
| `lib/share.ts` | ~30 | Web Share API wrapper with clipboard fallback | (browser API only) |
| `lib/artwork-availability.ts` | ~15 | Availability label/badge utilities | constants |

### 1.5 Types

| Path | Lines | Role |
|---|---|---|
| `types/artwork.ts` | ~60 | Artwork, ArtworkScene, ArtworkAvailability, ArtworkPublicationStatus, ArtworkRecord, ArtworkMetadata |
| `types/gallery.ts` | ~20 | GalleryProgress, GallerySnapshot, AchievementId, GalleryProgressSummary |

### 1.6 Data

| Path | Lines | Role |
|---|---|---|
| `data/artworks.ts` | ~200 | 6 ArtworkRecord objects (FV-001 through FV-006), each with 4 scenes, embedded ambient colors, full metadata. 3 published, 3 draft |

### 1.7 Styles

| Path | Lines | Role |
|---|---|---|
| `app/globals.css` | 577 | **Copper/umber/linen CSS token system** — palette tokens, gallery-shell, gallery-grain, gallery-vignette, gallery-card, gallery-scene-light, gallery-reflection, gallery-skeleton, gallery-skip-link, responsive breakpoints, reduced-motion overrides |

### 1.8 Config

| Path | Role |
|---|---|
| `AGENTS.md` | Upstream agent instructions (modified in subproject) |
| `package.json` | Upstream package metadata (standalone Next.js app) |
| `tailwind.config.ts` | Tailwind config with custom gallery tokens |
| `tsconfig.json` | TypeScript config |
| `next.config.mjs` | Next.js config |
| `.turbo/` | Turbo cache (untracked) |

---

## 2. Dependency Summary

### 2.1 External Dependencies (used by upstream)

| Package | Used In | Import Pattern |
|---|---|---|
| `framer-motion` | 6 components, 4 hooks | `motion`, `AnimatePresence`, `useMotionValue`, `useSpring`, `useTransform`, `useAnimationFrame`, `PanInfo` |
| `lucide-react` | `artwork-card.tsx` | `ArrowUpRight`, `BookOpenText`, `Bookmark`, `Check`, `Share2` (5 icons) |
| `sonner` | `art-gallery-slider.tsx` (inquiry modal) | `toast` |
| `@vercel/analytics` | `lib/analytics.ts`, `use-artwork-dwell.ts` | `Analytics.track()` |
| `clsx` | `lib/utils.ts` | `clsx` |
| `tailwind-merge` | `lib/utils.ts` | `twMerge` |
| `next` | `app/page.tsx`, `artwork-card.tsx` | `next/dynamic`, `next/image` |

### 2.2 Internal Module Dependencies (cross-file)

```
app/page.tsx
  └─ components/gallery.tsx
       └─ components/art-gallery-slider.tsx
            ├─ hooks/use-slider-navigation.ts
            ├─ hooks/use-slider-drag.ts
            ├─ hooks/use-slider-wheel.ts
            ├─ hooks/use-reduced-motion.ts
            ├─ hooks/use-artwork-dwell.ts
            ├─ hooks/use-slide-observer.ts
            ├─ hooks/use-touch-swipe.ts
            ├─ components/artwork-card.tsx
            │    ├─ hooks/use-color-extraction.ts
            │    ├─ hooks/use-saved-artworks.ts
            │    ├─ lib/share.ts
            │    ├─ lib/schema.ts
            │    ├─ lib/utils.ts
            │    └─ lucide-react (5 icons)
            ├─ components/gallery-ambient.tsx
            │    └─ hooks/use-color-extraction.ts
            ├─ components/gallery-navigation-dots.tsx
            ├─ components/gallery-progress-control.tsx
            │    └─ hooks/use-gallery-progress.ts
            ├─ lib/constants.ts
            ├─ lib/analytics.ts
            ├─ lib/artworks/indexes.ts
            └─ data/artworks.ts
                 └─ types/artwork.ts
                      └─ types/gallery.ts
```

---

## 3. Capability Inventory

| # | Capability | Source Files | Complexity |
|---|---|---|---|
| C01 | Drag navigation (horizontal pan with resistance/momentum) | `use-slider-drag.ts`, `art-gallery-slider.tsx` | HIGH |
| C02 | Wheel navigation (vertical wheel → horizontal slide) | `use-slider-wheel.ts`, `art-gallery-slider.tsx` | HIGH |
| C03 | Touch swipe navigation | `use-touch-swipe.ts`, `art-gallery-slider.tsx` | MEDIUM |
| C04 | Keyboard navigation (arrows, dots) | `gallery-navigation-dots.tsx`, `art-gallery-slider.tsx` | MEDIUM |
| C05 | Pointer-based scene discovery (2x2 quadrant → 4 scenes) | `artwork-card.tsx` | HIGH |
| C06 | Color extraction from images (canvas + sessionStorage) | `use-color-extraction.ts` | HIGH |
| C07 | Ambient background with crossfade | `gallery-ambient.tsx` | MEDIUM |
| C08 | Parallax effects (pointer-driven X/Y/rotate) | `artwork-card.tsx` | MEDIUM |
| C09 | Progress tracking (localStorage, 4 achievements) | `gallery-progress.ts`, `use-gallery-progress.ts` | HIGH |
| C10 | Saved artworks collection | `use-saved-artworks.ts` | MEDIUM |
| C11 | Share functionality (Web Share API + clipboard) | `share.ts`, `artwork-card.tsx` | LOW |
| C12 | Inquiry modal (toast-based) | `art-gallery-slider.tsx` (sonner) | LOW |
| C13 | Details dialog (dynamic import) | `art-gallery-slider.tsx` | MEDIUM |
| C14 | JSON-LD schema injection | `schema.ts`, `artwork-card.tsx` | LOW |
| C15 | Analytics (16 events) | `analytics.ts`, `use-artwork-dwell.ts` | MEDIUM |
| C16 | Image preloading | `art-gallery-slider.tsx`, `artwork-card.tsx` | MEDIUM |
| C17 | Reduced motion support | `use-reduced-motion.ts`, CSS | LOW |
| C18 | Skip link for accessibility | CSS, `art-gallery-slider.tsx` | LOW |
| C19 | Responsive layout (mobile/desktop breakpoints) | CSS, `art-gallery-slider.tsx` | MEDIUM |
| C20 | SSR fallback screen | `gallery-state-screen.tsx` | LOW |
| C21 | Artwork availability labels/badges | `artwork-availability.ts`, constants | LOW |
| C22 | Reflection effect on cards | CSS, `artwork-card.tsx` | LOW |

---

## 4. File Hash Registry

All 8 primary source files and all hooks/libs were verified via SHA256 during DoR (see `door-13-evidence.md`). Hash values are reproduced in artifact 16-agent-skill-evidence.yaml.

---

**End of artifact 04.**