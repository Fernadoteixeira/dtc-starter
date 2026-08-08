# 10 — Intentional Deviations (NOS-001)

> **SUPERSEDED_UNAPPROVED_DEVIATIONS:** this historical list grants no current waiver. Only explicit `ADAPT`, `DEFER` and `REJECT_WITH_REASON` entries with typed ownership in `/.agents/contracts/nos-gallery-transplant-manifest.yaml` are current.

**Issue:** #13 (NOS-001)
**Protocol:** Canonical Autonomous Execution v4.0

> Documents every intentional deviation from the canonical nos-gallery source, with rationale and risk assessment. Deviations are NOT bugs — they are deliberate engineering decisions.

---

## 1. Type System Deviations

| # | Deviation | Canonical | Target | Rationale | Risk |
|---|---|---|---|---|---|
| DV01 | Artwork ID type | `id: number` | `id: string` | Medusa product IDs are strings. Adapter handles conversion. | LOW — adapter is type-safe |
| DV02 | Scene ID type | `id: number` | `id: string` | Scenes are indexed from Medusa metadata, string IDs for consistency. | LOW |
| DV03 | Availability enum | 'available'\|'sold'\|'reserved'\|'commission' | 'available'\|'low-stock'\|'out-of-stock'\|'preorder'\|'unavailable' | Medusa availability model differs. Mapping table in adapter. | MEDIUM — semantic mapping must be validated |
| DV04 | Image type | `image: string` (URL) | `image: GalleryImage` (url, alt, width, height) | Medusa images have metadata. `next/image` benefits from dimensions. | LOW |
| DV05 | Price field | (not in upstream) | `price: GalleryPrice` (amount, currencyCode) | Commerce requirement — gallery displays prices from Medusa. | LOW |

## 2. Dependency Deviations

| # | Deviation | Canonical | Target | Rationale | Risk |
|---|---|---|---|---|---|
| DV06 | lucide-react icons | 5 icon imports | Inline SVG components | Dependency not available; adding it violates "no new deps" principle. 5 simple icons are trivial to inline. | LOW |
| DV07 | @vercel/analytics | Direct `Analytics.track()` | `AnalyticsAdapter` interface (DI) | Dependency not available in package. DI allows storefront to inject implementation. | LOW — clean architecture |
| DV08 | sonner toast | Direct `toast()` call | DEFERRED to #22 | Inquiry modal is separate child issue. NOS-001 omits inquiry. | LOW — documented in manifest |
| DV09 | framer-motion location | In storefront | In gallery-experience package | framer-motion is a direct dep of gallery-experience, NOT storefront. All ported components live in the package. | LOW — package already has dep |

## 3. Architecture Deviations

| # | Deviation | Canonical | Target | Rationale | Risk |
|---|---|---|---|---|---|
| DV10 | Component location | `apps/storefront/src/modules/nos-gallery/` | `packages/gallery-experience/src/` | Components live in isolated package for reuse. Storefront imports via package. | LOW — package architecture |
| DV11 | Data source | Static `data/artworks.ts` | Medusa `store.product.list` API | Commerce requirement — data comes from Medusa, not fixtures. | LOW — adapter handles |
| DV12 | Fixture data | 6 ArtworkRecord objects | Fallback gradient only | No fabricated product data. Fixtures used only in development/tests. | LOW |
| DV13 | SITE_URL | Hardcoded constant | Environment variable | Multi-environment support (dev/staging/prod). | LOW |
| DV14 | Global CSS | `app/globals.css` | Scoped `[data-gallery-experience]` CSS | Package isolation — styles don't leak to storefront. | LOW |

## 4. Scope Deviations

| # | Deviation | Canonical | Target | Rationale | Risk |
|---|---|---|---|---|---|
| DV15 | Full gallery in one app | All features in nos-gallery module | Features distributed across #14–#28 | Transplant is decomposed into 16 child issues. NOS-001 is the manifest only. | LOW — DAG tracks dependencies |
| DV16 | Publication status | `ArtworkPublicationStatus` ('published'\|'draft') | DEFERRED | Medusa manages product status. Revisit in #21. | LOW |

---

## 5. Risk Mitigation

| Risk | Mitigation |
|---|---|
| DV03 (availability mapping semantic mismatch) | Adapter includes explicit mapping table. #21 validates mapping with real Medusa data. |
| DV06 (inline SVG vs lucide-react) | SVG icons match lucide-react path data exactly. Visual parity verified in #15. |
| DV07 (analytics DI) | AnalyticsAdapter interface matches Vercel Analytics `track()` signature. Storefront injects real implementation. |
| DV15 (feature distribution) | Dependency DAG (artifact 13) ensures correct ordering. Each child issue has its own DoR/DoD. |

---

**End of artifact 10.**
