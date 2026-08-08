"use client";

import React from "react";
import {
  GalleryExperience,
  GalleryItem,
  resolveGalleryLocale,
  translateFioVivoTitle,
} from "@dtc/gallery-experience";
import { fioVivoProducts } from "./fixtures/fio-vivo-products";

export function GalleryHeroClient({
  items: _items,
  countryCode = "dk",
}: {
  items?: GalleryItem[];
  countryCode?: string;
}) {
  const locale = resolveGalleryLocale(countryCode);
  // Fixture items serve as a graceful fallback when the backend has no
  // fio-vivo products yet. Live Medusa data is preferred when available.
  const fixtureItems: GalleryItem[] = fioVivoProducts.map((p) => ({
    id: p.id,
    handle: p.handle,
    title: translateFioVivoTitle(p.handle, p.title, locale),
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
    productUrl: `/${countryCode}/products/${p.handle}`,
    ambientColors:
      typeof p.ambientColors === "string" ? undefined : p.ambientColors,
  }));

  // Prefer live Medusa items; fall back to the fixture only when the
  // backend has no fio-vivo products (undefined or empty array).
  const items: GalleryItem[] =
    _items && _items.length > 0 ? _items : fixtureItems;

  return (
    <div className="dtc-gallery-container" data-gallery-hero-container="true">
      <GalleryExperience
        items={items}
        collectionTitle="Fio Vivo"
        collectionNumber="01"
        locale={countryCode}
      />
    </div>
  );
}

