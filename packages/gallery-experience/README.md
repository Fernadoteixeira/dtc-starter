# @dtc/gallery-experience

The `@dtc/gallery-experience` package is an isolated, editorial gallery presentation module extracted from `nos-gallery` and integrated as an official component in the `dtc-starter` Medusa monorepo.

## Architecture

- **Domain Contracts**: Framework-agnostic interfaces (`GalleryItem`, `GalleryScene`, `GalleryPrice`, `GalleryAvailability`).
- **Medusa Adapter**: `mapStoreProductToGalleryItem` converts Medusa `StoreProduct` models into `GalleryItem` models.
- **CSS Isolation**: All styles are scoped under `[data-gallery-experience]` with `--dtc-gallery-*` tokens, preventing global CSS collisions.
- **Host Owned**: React, React DOM, and Next.js are declared as peer dependencies and provided by `@dtc/storefront`.
