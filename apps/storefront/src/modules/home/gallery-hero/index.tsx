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

  if (!products || products.length === 0) {
    return <GalleryHeroFallback />;
  }

  const galleryItems = mapStoreProductsToGalleryItems(products, countryCode);

  if (!galleryItems || galleryItems.length === 0) {
    return <GalleryHeroFallback />;
  }

  return <GalleryHeroClient items={galleryItems} countryCode={countryCode} />;
}
