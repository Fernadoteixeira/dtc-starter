# 09 — Medusa Adaptation Register (NOS-001)

**Issue:** #13 (NOS-001)
**Protocol:** Canonical Autonomous Execution v4.0

> Registers every adaptation point where the canonical nos-gallery must be adapted to work with Medusa v2 commerce data. Separate from `09-capacity-domain-handoffs.yaml` (which tracks A2A capacity).

---

## 1. Type Adaptations

| # | Upstream Type | Target Type | Adaptation | Adapter Location |
|---|---|---|---|---|
| MA01 | `Artwork` (id: number, code: string, title, artist, material, year, scenes: ArtworkScene[], availability: ArtworkAvailability, metadata: ArtworkMetadata) | `GalleryItem` (id: string, handle: string, title, artist, material, year, scenes: GalleryScene[], availability: GalleryAvailability, price: GalleryPrice) | `mapStoreProductToGalleryItem()` | `packages/gallery-experience/src/adapters/medusa/mapStoreProductToGalleryItem.ts` |
| MA02 | `ArtworkScene` (id: number, image: string, ambientColors: string[]) | `GalleryScene` (id: string, image: GalleryImage, ambientColors: string[]) | Scene ID → string (index-based), image string → GalleryImage object | Same adapter |
| MA03 | `ArtworkAvailability` ('available'\|'sold'\|'reserved'\|'commission') | `GalleryAvailability` ('available'\|'low-stock'\|'out-of-stock'\|'preorder'\|'unavailable') | Mapping table: `available→available`, `sold→out-of-stock`, `reserved→low-stock`, `commission→preorder` | Same adapter |
| MA04 | Static `ArtworkRecord[]` | Medusa `StoreProduct[]` | Data source change: static fixtures → Medusa API | `gallery-hero-data.ts` |

## 2. Data Source Adaptations

| # | Upstream Source | Target Source | Adaptation |
|---|---|---|---|
| MA05 | `data/artworks.ts` (6 static fixtures) | Medusa `store.product.list({ tags: ['fio-vivo-collection'] })` | Replace static import with async API call |
| MA06 | `lib/artworks/indexes.ts` (lookup by id/code) | Not needed (Medusa provides product ID directly) | REJECT — adapter handles lookup |
| MA07 | `ArtworkMetadata` embedded in fixture | `Product.metadata.gallery` JSON field | Adapter reads `metadata.gallery.contextualName`, `metadata.gallery.artist`, `metadata.gallery.material`, `metadata.gallery.year`, `metadata.gallery.sceneImages`, `metadata.gallery.ambientColors` |

## 3. Dependency Adaptations

| # | Upstream Dependency | Target Approach | Adaptation |
|---|---|---|---|
| MA08 | `@vercel/analytics` (direct import) | `AnalyticsAdapter` interface (dependency injection) | Package exports interface; storefront injects Vercel Analytics implementation. Package provides no-op default. |
| MA09 | `lucide-react` (5 icons) | Inline SVG components | Create 5 SVG components: ArrowUpRightIcon, BookOpenTextIcon, BookmarkIcon, CheckIcon, Share2Icon |
| MA10 | `sonner` (toast) | DEFER to #22 | Inquiry modal deferred. NOS-001 omits inquiry functionality. |
| MA11 | `next/dynamic` (dynamic import) | Available via `next` peerDependency | No adaptation needed — `next` is peerDep of gallery-experience |
| MA12 | `next/image` (optimized images) | Available via `next` peerDependency | No adaptation needed — `next` is peerDep of gallery-experience |

## 4. CSS Adaptations

| # | Upstream | Target | Adaptation |
|---|---|---|---|
| MA13 | `app/globals.css` (global styles) | `packages/gallery-experience/src/styles/gallery-experience.css` (scoped) | Scope under `[data-gallery-experience]` selector. Already scoped in current package. |
| MA14 | Blue/slate palette (current target) | Copper/umber/linen (canonical) | Replace ALL CSS custom properties: `--gallery-bg: #090a0f` → `--gallery-ink: #1b1814`, `--gallery-accent: #38bdf8` → `--gallery-accent: #c88f68`, etc. |
| MA15 | `border-radius: 1.25rem` (current) | `border-radius: 2px` (canonical) | Replace all border-radius values |
| MA16 | No grain/vignette/reflection (current) | Canonical effects | Add `.gallery-grain`, `.gallery-vignette`, `.gallery-reflection` classes |

## 5. Accessibility Adaptations

| # | Upstream | Target | Adaptation |
|---|---|---|---|
| MA17 | `aria-hidden="true"` on gallery elements (current target) | Proper ARIA carousel roles | Remove `aria-hidden`, add `role="region"`, `aria-roledescription="carousel"`, `aria-label` per slide |

## 6. Architecture Adaptations

| # | Upstream | Target | Adaptation |
|---|---|---|---|
| MA18 | Standalone Next.js app (`/app` router) | Package consumed by storefront | All components live in `@dtc/gallery-experience` package. Storefront imports via package exports. |
| MA19 | Direct component imports (`@/components/*`) | Package exports | Use package barrel: `import { GalleryExperience } from '@dtc/gallery-experience'` |
| MA20 | `SITE_URL` constant from `constants.ts` | Storefront env variable | `SITE_URL` adapted to use `process.env.NEXT_PUBLIC_STORE_URL` or storefront config |

---

**End of artifact 09.**