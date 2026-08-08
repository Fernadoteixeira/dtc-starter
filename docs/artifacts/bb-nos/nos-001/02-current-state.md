# NOS-001 — 02 Current State (Target Analysis)

- **Date:** 2026-08-08
- **Agent:** RUG orchestrator (direct execution)
- **Scope:** All target surfaces that will receive the transplant

## 1. Target surface inventory

### 1.1 `packages/gallery-experience/` (workspace package `@dtc/gallery-experience`)

| File | Size | Role |
|---|---|---|
| `src/index.ts` | Entry point, re-exports types, components, dictionary, imports CSS |
| `src/types/index.ts` | Domain contracts: `GalleryItem`, `GalleryScene`, `GalleryPrice`, `GalleryAvailability`, `GalleryExperienceProps` |
| `src/components/gallery-experience.tsx` | **Main component** — static shell with `StaticSceneRail`, `StaticArtworkCard`, `StaticNavigation` |
| `src/components/artwork-card.tsx` | Interactive card with framer-motion (NOT used by gallery-experience.tsx) |
| `src/components/gallery-ambient.tsx` | Ambient with framer-motion (NOT used by gallery-experience.tsx) |
| `src/i18n/dictionary.ts` | pt-BR and es-419 translations, `resolveGalleryLocale`, `translateGallery`, `translateFioVivoTitle` |
| `src/styles/gallery-experience.css` | Scoped CSS under `[data-gallery-experience]` — **blue/slate palette, NOT copper/umber/linen** |

### 1.2 `apps/storefront/src/modules/home/gallery-hero/`

| File | Role |
|---|---|
| `index.tsx` | Server component, fetches Medusa products, renders `GalleryHeroClient` or `GalleryHeroFallback` |
| `gallery-hero-client.tsx` | Client component, fixture fallback, renders `GalleryExperience` |
| `medusa-adapter.ts` | `mapStoreProductToGalleryItem` — maps `HttpTypes.StoreProduct` to `GalleryItem` |
| `gallery-hero-data.ts` | `fetchGalleryHeroProducts` — fetches from Medusa via `listProducts` |
| `gallery-hero-analytics.ts` | `trackGalleryEvent` — gtag integration (NOT Vercel Analytics) |
| `gallery-hero-fallback.tsx` | Fallback UI (Medusa DTC Starter heading) |
| `gallery-hero-feature-flags.ts` | `isGalleryHeroEnabled` — env `NEXT_PUBLIC_GALLERY_HERO_ENABLED` |
| `fixtures/fio-vivo-products.ts` | 6 fixture products for graceful fallback |

### 1.3 Runtime slot

| File | Role |
|---|---|
| `apps/storefront/src/app/[countryCode]/(main)/page.tsx` | Homepage — imports and renders `GalleryHero` |

## 2. Current `GalleryExperience` component architecture

The main `gallery-experience.tsx` is a **pure static shell**:

```
GalleryExperience
  ├── div.dtc-gallery[data-gallery-experience]
  │   ├── div.dtc-gallery__ambient (static gradient layer)
  │   ├── aside.dtc-gallery__editorial (collection title + narrative + counter)
  │   ├── div.dtc-gallery__viewport
  │   │   └── div.dtc-gallery__track
  │   │       ├── StaticArtworkCard[active] (items[0])
  │   │       ├── StaticArtworkCard[adjacent] (items[1])
  │   │       └── StaticArtworkCard[continuation] (items[2])
  │   ├── StaticNavigation (dots, aria-hidden, current=0 fixed)
  │   └── span.dtc-gallery__cta (aria-hidden)
```

**Critical gaps vs upstream:**
- NO active-index state (always renders items[0] as active)
- NO navigation (arrows, keyboard, drag, wheel, swipe)
- NO scene management (scene rail is static, aria-hidden)
- NO progress tracking (localStorage, achievements, dwell)
- NO analytics integration (callbacks exist in props but are never wired)
- NO accessibility (dots and CTA are aria-hidden, no ARIA live region)
- NO reduced-motion support
- NO color extraction
- NO share, save, inquiry, or details dialog
- NO JSON-LD schema
- NO ambient color extraction (ambient is a static gradient)

## 3. Current CSS palette (CRITICAL GAP)

| Token | Current (target) | Canonical (upstream) | Gap |
|---|---|---|---|
| Background primary | `#090a0f` (near-black blue) | `#1b1814` (warm charcoal) | WRONG — blue/black vs warm umber |
| Accent | `#38bdf8` (sky blue) | `#c88f68` (copper) | WRONG — blue vs copper |
| Text primary | `#f8fafc` (slate-50) | `#ede3d2` (linen) | WRONG — cool vs warm |
| Accent glow | `rgba(56, 189, 248, 0.25)` | `rgb(200 143 104 / 14%)` | WRONG |
| Border | `rgba(255, 255, 255, 0.12)` | `rgb(237 227 210 / 20%)` | WRONG — white vs linen |
| Card radius | `1.25rem` (20px) | `2px` | WRONG — rounded vs sharp |
| Font | `system-ui` stack | `var(--font-geist)` + `var(--font-playfair)` | WRONG — no serif |

**Verdict:** The current CSS is a **complete visual mismatch** with the canonical palette. The `nos-gallery-first-fold.yaml` contract requires copper/umber/linen. This is the single largest gap in the transplant.

## 4. Current type system

```typescript
// Target (gallery-experience)
interface GalleryItem {
  id: string;          // vs upstream: number
  handle: string;      // vs upstream: code (string)
  title: string;
  scenes: GalleryScene[];
  availability: GalleryAvailability;  // 'available'|'low-stock'|'out-of-stock'|'preorder'|'unavailable'
  productUrl: string;
  price?: GalleryPrice;
  // ...
}

interface GalleryScene {
  id: string;          // vs upstream: number
  image: GalleryImage;  // vs upstream: string
  label: string;
}
```

**Type system gap:** The upstream `Artwork` uses `id: number`, `code: string`, `scenes[].id: number`, `image: string`. The target `GalleryItem` uses `id: string`, `handle: string`, `scenes[].id: string`, `image: GalleryImage`. These are incompatible and require the adapter layer (which exists as `medusa-adapter.ts`).

## 5. Current commerce coupling

The `medusa-adapter.ts` maps `HttpTypes.StoreProduct` to `GalleryItem`:
- Reads `product.metadata?.gallery` for `GalleryProductMetadata` (contextualName, artist, material, year, story, sceneImages, ambientColors)
- Falls back to `product.thumbnail` or `product.images[0]?.url` for primary image
- Derives scenes from `metadata.sceneImages` or `product.images.slice(1)`
- Derives price from `firstVariant.calculated_price`
- Derives availability from variant inventory count (0 = out-of-stock, <=5 = low-stock)
- Falls back to hardcoded ambient colors `["#1a1a2e", "#16213e", "#0f3460"]` (WRONG — blue, not copper)

**Commerce gap:** The adapter has hardcoded fallback ambient colors that violate the copper/umber/linen palette. The `GalleryAvailability` enum ('low-stock', 'out-of-stock', 'preorder', 'unavailable') does not match the upstream's `ArtworkAvailability` ('available', 'sold', 'reserved', 'commission').

## 6. Dependencies available in storefront

| Dependency | Present | Version | Used by upstream |
|---|---|---|---|
| `framer-motion` | NO (storefront) / YES (gallery-experience) | `12.42.2` (gallery-exp pkg) | YES — motion, AnimatePresence, useMotionValue, useSpring, useTransform |
| `lucide-react` | NO | — | YES — icons (ArrowUpRight, BookOpenText, Bookmark, Check, Share2) |
| `sonner` | NO | — | YES — toast notifications |
| `@vercel/analytics` | NO | — | YES — Analytics.track() |
| `clsx` | YES | `^2.1.1` | YES (via utils.ts cn()) |
| `tailwind-merge` | NO (storefront) / YES (gallery-experience) | `^3.3.1` (gallery-exp pkg) | YES (via utils.ts cn()) |
| `next` | YES | `16.3.1-canary.4` | YES — next/dynamic, next/image |
| `react` | YES | `19.0.5` | YES |
| `react-dom` | YES | `19.0.5` | YES |

> **CRITICAL:** `lucide-react`, `sonner`, and `@vercel/analytics` are NOT available anywhere in the workspace. `framer-motion` and `tailwind-merge` are available ONLY in the `@dtc/gallery-experience` package. The transplant manifest must resolve these: PORT (add to appropriate package.json), ADAPT (replace with equivalent), or DEFER (later child issue). AGENTS.md non-goal: "Introducing new dependencies (Framer Motion, shadcn/ui)" — however, framer-motion is ALREADY a dependency of gallery-experience, so using it within that package does not introduce a new workspace-level dependency. Adding `lucide-react`, `sonner`, or `@vercel/analytics` WOULD introduce new dependencies and requires explicit authorization.

## 7. Summary

The current target is a **static visual shell** with a **wrong color palette** (blue/slate instead of copper/umber/linen), **no interactivity**, **no accessibility**, and **no behavioral parity** with the canonical source. The transplant must replace the CSS palette, port the interactive behaviors, wire the accessibility layer, and adapt the commerce coupling — all while preserving the existing Medusa integration and storefront routing.