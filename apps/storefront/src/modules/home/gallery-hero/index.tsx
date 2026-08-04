import React from "react";
import {
  GalleryExperience,
  mapStoreProductsToGalleryItems,
} from "@dtc/gallery-experience";
import { fetchGalleryHeroProducts } from "./gallery-hero-data";
import { isGalleryHeroEnabled } from "./gallery-hero-feature-flags";
import { GalleryHeroFallback } from "./gallery-hero-fallback";
import { trackGalleryEvent } from "./gallery-hero-analytics";

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

  return (
    <div className="w-full relative">
      <GalleryExperience
        items={galleryItems}
        collectionTitle="Curated Gallery Experience"
        collectionNumber="01"
        collectionNarrative="Immerse in handcrafted design and authentic commerce."
        locale={countryCode}
        onItemView={(item, index) =>
          trackGalleryEvent("gallery_item_view", { item, index, locale: countryCode })
        }
        onProductIntent={(item) =>
          trackGalleryEvent("gallery_product_intent", { item, locale: countryCode })
        }
      />
    </div>
  );
}
