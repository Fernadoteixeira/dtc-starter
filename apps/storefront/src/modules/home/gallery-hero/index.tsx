import React from "react";
import { mapStoreProductsToGalleryItems } from "./medusa-adapter";
import { fetchGalleryHeroProducts } from "./gallery-hero-data";
import { isGalleryHeroEnabled } from "./gallery-hero-feature-flags";
import { GalleryHeroFallback } from "./gallery-hero-fallback";
import { GalleryHeroClient } from "./gallery-hero-client";

export default async function GalleryHero({
  countryCode = "dk",
}: {
  countryCode?: string;
}) {
  if (!isGalleryHeroEnabled()) {
    return <GalleryHeroFallback />;
  }

  const products = await fetchGalleryHeroProducts(countryCode);
  const galleryItems =
    products.length > 0
      ? mapStoreProductsToGalleryItems(products, countryCode)
      : undefined;

  return <GalleryHeroClient items={galleryItems} countryCode={countryCode} />;
}
