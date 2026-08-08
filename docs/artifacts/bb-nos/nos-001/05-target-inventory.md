# 05 — Target Surface Inventory (NOS-001)

> **HISTORICAL_TARGET_SNAPSHOT:** this file predates target baseline `38246f64...` and the current W1 host surface. Current target truth is in `target_baseline`, `target_legacy_dispositions` and `target_host_dispositions` of `/.agents/contracts/nos-gallery-transplant-manifest.yaml`.

**Issue:** #13 (NOS-001)
**Protocol:** Canonical Autonomous Execution v4.0
**DoR status:** PASS (13/13)

---

## 1. Gallery-Experience Package (`@dtc/gallery-experience`)

### 1.1 Components

| Path | Lines | Role | Current State |
|---|---|---|---|
| `src/components/gallery-experience.tsx` | ~150 | Main component — static shell with StaticSceneRail, StaticArtworkCard, StaticNavigation | NO interactivity. Fixed at items[0]. aria-hidden on most elements. |
| `src/components/gallery-experience.jsx` | ~150 | JSX duplicate of .tsx | Duplicate — should be removed or unified |
| `src/components/artwork-card.tsx` | ~80 | Static artwork card — image + label + price | NO scene navigation, NO parallax, NO save/share |
| `src/components/artwork-card.jsx` | ~80 | JSX duplicate | Duplicate |
| `src/components/gallery-ambient.tsx` | ~30 | Static ambient background — fixed gradient | NO color extraction, NO crossfade |
| `src/components/gallery-ambient.jsx` | ~30 | JSX duplicate | Duplicate |

### 1.2 Types

| Path | Role | Current Types |
|---|---|---|
| `src/types/index.ts` | Domain contracts | `GalleryItem` (id: string, handle: string), `GalleryScene` (id: string, image: GalleryImage), `GalleryAvailability` ('available'\|'low-stock'\|'out-of-stock'\|'preorder'\|'unavailable'), `GalleryImage` (url, alt, width, height), `GalleryPrice` (amount, currencyCode) |
| `src/types/index.js` | JS duplicate | Duplicate |

### 1.3 Styles

| Path | Lines | Palette | Current State |
|---|---|---|---|
| `src/styles/gallery-experience.css` | ~200 | **BLUE/SLATE** (`#090a0f` bg, `#38bdf8` accent, `#f8fafc` text) | **WRONG** — contract requires copper/umber/linen. `1.25rem` radius (contract: 2px). No gallery-grain, no gallery-vignette, no gallery-reflection. |

### 1.4 Adapters

| Path | Role | Current State |
|---|---|---|
| `src/adapters/medusa/mapStoreProductToGalleryItem.ts` | Maps StoreProduct → GalleryItem | Reads metadata.gallery for contextualName, artist, material, year, sceneImages, ambientColors. Hardcoded fallback ambient colors (WRONG: blue, not copper). |

### 1.5 i18n

| Path | Role |
|---|---|
| `src/i18n/dictionary.ts` | pt-BR and es-419 translations for gallery labels |

### 1.6 Package Manifest

| Key | Value |
|---|---|
| name | `@dtc/gallery-experience` |
| version | `1.0.0` |
| dependencies | `clsx@^2.1.1`, `framer-motion@12.42.2`, `tailwind-merge@^3.3.1` |
| peerDependencies | `next@>=15`, `react@^19`, `react-dom@^19` |
| exports | `./src/index.ts` (types), `./src/styles/*.css` (CSS) |

---

## 2. Gallery-Hero Module (`apps/storefront/src/modules/home/gallery-hero/`)

### 2.1 Files

| Path | Lines | Role | Current State |
|---|---|---|---|
| `index.tsx` | ~5 | Barrel re-export | Exports `GalleryHero` |
| `gallery-hero-client.tsx` | ~80 | Client component — fetches products, renders GalleryExperience | Uses Medusa SDK, feature flags, fixture fallback |
| `medusa-adapter.ts` | ~60 | Maps StoreProduct → GalleryItem | Reads metadata.gallery fields. Hardcoded fallback ambient colors (WRONG: blue). |
| `gallery-hero-data.ts` | ~40 | Data fetching via Medusa SDK `store.product.list` | Queries by tag 'fio-vivo-collection' |
| `gallery-hero-analytics.ts` | ~30 | Analytics event wrappers | Uses Vercel Analytics `track()` — but `@vercel/analytics` NOT installed in storefront |
| `gallery-hero-feature-flags.ts` | ~20 | Feature flag config | Controls gallery enable/disable |
| `gallery-hero-fallback.tsx` | ~30 | Fallback UI when gallery disabled | Static gradient |

### 2.2 Data Flow

```
page.tsx ([countryCode]/(main)/page.tsx)
  └─ gallery-hero/index.tsx
       └─ gallery-hero-client.tsx
            ├─ gallery-hero-data.ts → Medusa SDK → store.product.list
            ├─ medusa-adapter.ts → mapStoreProductToGalleryItem
            ├─ gallery-hero-feature-flags.ts → isEnabled check
            ├─ @dtc/gallery-experience → GalleryExperience component
            └─ gallery-hero-fallback.tsx (if disabled)
```

---

## 3. Storefront Page Integration

| Path | Role | Current State |
|---|---|---|
| `apps/storefront/src/app/[countryCode]/(main)/page.tsx` | Home page | Renders `<GalleryHero />` in a section. Already wired. |

---

## 4. Gap Summary (Target vs Canonical)

| Area | Canonical (Upstream) | Current (Target) | Gap |
|---|---|---|---|
| **Navigation** | Drag, wheel, swipe, keyboard, dots | NONE | TOTAL |
| **Scene discovery** | 2x2 pointer quadrant → 4 scenes | NONE | TOTAL |
| **Color extraction** | Canvas-based, sessionStorage cache | Hardcoded fallback colors | TOTAL |
| **Ambient background** | Crossfade between extracted colors | Static gradient | TOTAL |
| **Parallax** | Pointer-driven X/Y/rotate | NONE | TOTAL |
| **Progress tracking** | localStorage, 4 achievements | NONE | TOTAL |
| **Saved artworks** | localStorage collection | NONE | TOTAL |
| **Share** | Web Share API + clipboard | NONE | TOTAL |
| **Inquiry** | Toast-based modal | NONE | TOTAL |
| **Details dialog** | Dynamic import dialog | NONE | TOTAL |
| **JSON-LD schema** | Generated per artwork | NONE | TOTAL |
| **Analytics** | 16 events | 6 stub events (unusable — missing dep) | PARTIAL→TOTAL |
| **Image preloading** | Active preloading | NONE | TOTAL |
| **Reduced motion** | Media query detection + CSS overrides | NONE | TOTAL |
| **Skip link** | Present | NONE | TOTAL |
| **Accessibility** | ARIA carousel, keyboard, live regions | `aria-hidden` on most elements | INVERTED |
| **CSS palette** | Copper/umber/linen | Blue/slate | TOTAL MISMATCH |
| **CSS radius** | 2px | 1.25rem | MISMATCH |
| **CSS effects** | Grain, vignette, reflection, skeleton | NONE | TOTAL |
| **Responsive** | Mobile/desktop breakpoints with card sizing | Basic | PARTIAL |
| **SSR fallback** | gallery-state-screen.tsx | gallery-hero-fallback.tsx | PARTIAL (different approach) |
| **Type system** | Artwork (id: number, code: string) | GalleryItem (id: string, handle: string) | INCOMPATIBLE |
| **Availability** | 'available'\|'sold'\|'reserved'\|'commission' | 'available'\|'low-stock'\|'out-of-stock'\|'preorder'\|'unavailable' | INCOMPATIBLE |
| **Dependencies** | framer-motion, lucide-react, sonner, @vercel/analytics | clsx only (storefront); framer-motion in gallery-exp pkg | PARTIAL |

---

**End of artifact 05.**
