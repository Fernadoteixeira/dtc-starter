# 08 — Commerce Invariants (NOS-001)

**Issue:** #13 (NOS-001)
**Protocol:** Canonical Autonomous Execution v4.0

---

## 1. Medusa Source-of-Truth Invariants

| # | Invariant | Enforcement | Verification |
|---|---|---|---|
| CI01 | All product data comes from Medusa `store.product.list` API | No hardcoded product data in gallery components | Code review: gallery components receive `GalleryItem[]`, never fetch directly |
| CI02 | Prices come from Medusa `Variant.calculated_price` | No fabricated prices in gallery | Adapter reads `product.variants[0].calculated_price` |
| CI03 | Availability comes from Medusa `Product.status` + `Variant.inventory` | No hardcoded availability | Adapter maps Medusa availability → `GalleryAvailability` |
| CI04 | Product images come from Medusa `Product.images` | No hardcoded image URLs in gallery | Adapter reads `product.images` and `metadata.gallery.sceneImages` |
| CI05 | Product metadata (artist, material, year) comes from `Product.metadata.gallery` | No hardcoded metadata | Adapter reads `metadata.gallery.*` fields |

## 2. Fio Vivo Eligibility Invariants

| # | Invariant | Enforcement | Verification |
|---|---|---|---|
| CI06 | Only products tagged `fio-vivo-collection` are eligible | Data fetch filters by tag | `gallery-hero-data.ts` query includes tag filter |
| CI07 | Only published products (status=published) appear in gallery | Data fetch filters by status | Medusa `store.product.list` only returns published by default |
| CI08 | Products without gallery metadata are gracefully omitted | Adapter returns null for incomplete products | Adapter validates required fields before returning GalleryItem |

## 3. Fail-Closed Invariants

| # | Invariant | Enforcement | Verification |
|---|---|---|---|
| CI09 | If Medusa is unreachable, show fallback (not fabricated data) | `gallery-hero-fallback.tsx` renders static gradient | Error boundary in `gallery-hero-client.tsx` |
| CI10 | If no products match criteria, show empty state (not fake products) | Gallery renders "no artworks" state | Gallery component handles empty `items[]` array |
| CI11 | If adapter fails for a product, skip it (don't fabricate) | Adapter returns null, filtered out | `gallery-hero-data.ts` filters nulls from mapped results |
| CI12 | If color extraction fails, use default colors (not fabricated) | `use-color-extraction` falls back to `DEFAULT_COLORS` | Hook catches canvas errors, returns DEFAULT_COLORS |

## 4. Fabricated Data Prohibition

| # | Rule | Scope |
|---|---|---|
| CI13 | NO hardcoded artwork data in gallery components | Components receive data as props — never define artwork fixtures inline |
| CI14 | NO hardcoded prices | Prices come from Medusa only |
| CI15 | NO hardcoded availability labels | Labels come from `GalleryAvailability` mapping |
| CI16 | NO hardcoded image URLs | Images come from Medusa product images |
| CI17 | Fixture data is ONLY for development/fallback | `gallery-hero-fallback.tsx` uses static gradient, not fake products |

## 5. Type Safety Invariants

| # | Invariant | Enforcement |
|---|---|---|
| CI18 | `GalleryItem.id` is always a string (Medusa product ID) | Type system enforces `id: string` |
| CI19 | `GalleryScene.id` is always a string | Type system enforces `id: string` |
| CI20 | `GalleryItem.availability` is always a valid `GalleryAvailability` enum value | Type system + adapter validation |
| CI21 | `GalleryPrice` amount is always a number ≥ 0 | Adapter validates price from Medusa |

## 6. Runtime Immutability Invariant

| # | Invariant | Enforcement |
|---|---|---|
| CI22 | NOS-001 is an analysis/planning issue — NO code, branch, commit, or PR mutation | `git diff --exit-code` on all target surfaces = 0 | Pre/post verification in artifact 21 |

---

**End of artifact 08.**