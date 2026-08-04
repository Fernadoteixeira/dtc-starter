"use client";

import React from "react";
import { GalleryExperience, GalleryItem } from "@dtc/gallery-experience";
import { fioVivoProducts } from "./fixtures/fio-vivo-products";

export function GalleryHeroClient({
  items: _items,
  countryCode = "dk",
}: {
  items?: GalleryItem[];
  countryCode?: string;
}) {
  // Temporary BB-03 override: map host fixture items
  const fixtureItems: GalleryItem[] = fioVivoProducts.map((p) => ({
    id: p.id,
    handle: p.handle,
    title: p.title,
    primaryImage: {
      url: p.primaryImage.src,
      alt: p.primaryImage.alt,
      width: p.primaryImage.width,
      height: p.primaryImage.height,
    },
    scenes: p.scenes.map((s) => ({
      id: s.id,
      image: {
        url: s.src,
        alt: s.alt,
        width: s.width,
        height: s.height,
      },
      label: s.label,
    })),
    availability: "available",
    productUrl: `/products/${p.handle}`,
    ambientColors: Array.isArray(p.ambientColors) ? p.ambientColors : undefined,
  }));

  return (
    <div className="dtc-gallery-container" data-gallery-hero-container="true">
      <GalleryExperience
        items={fixtureItems}
        collectionTitle="Fio Vivo"
        collectionNumber="01"
        collectionNarrative="O crochê se move"
        locale={countryCode}
      />
    </div>
  );
}

