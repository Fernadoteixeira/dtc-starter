"use client";

import React from "react";
import { GalleryExperience, GalleryItem } from "@dtc/gallery-experience";
import { trackGalleryEvent } from "./gallery-hero-analytics";

export function GalleryHeroClient({
  items,
  countryCode = "dk",
}: {
  items: GalleryItem[];
  countryCode?: string;
}) {
  return (
    <div className="w-full relative min-h-[500px]" data-gallery-hero-container="true">
      <GalleryExperience
        items={items}
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
