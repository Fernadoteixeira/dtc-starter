import { listProducts } from "@lib/data/products";
import { listCollections } from "@lib/data/collections";
import { HttpTypes } from "@medusajs/types";

/**
 * Query params shape used by fetchGalleryHeroProducts.
 * Extracted as a standalone type so tests can assert without mocking Medusa.
 */
export interface GalleryHeroQueryParams {
  limit: number;
  fields: string;
  collection_id?: string;
}

/**
 * Build the queryParams object for the gallery hero product list.
 *
 * When a collection is found, its id is included so the Medusa store API
 * filters products by that collection. When no collection is found, the
 * param is omitted so all products are returned (the caller can then
 * filter client-side or simply show whatever is available).
 *
 * Extracted from fetchGalleryHeroProducts to be unit-testable without
 * mocking the Medusa client.
 */
export function buildGalleryHeroQueryParams(
  collection: { id: string } | null | undefined,
  limit = 8
): GalleryHeroQueryParams {
  const params: GalleryHeroQueryParams = {
    limit,
    fields: "*variants,*variants.calculated_price,*images,*categories",
  };

  if (collection) {
    params.collection_id = collection.id;
  }

  return params;
}

export async function fetchGalleryHeroProducts(
  countryCode: string
): Promise<HttpTypes.StoreProduct[]> {
  try {
    // Prefer products in the fio-vivo collection. When the collection does
    // not exist yet (e.g. before the seed runs), fall back to an unfiltered
    // fetch so the hero still renders something rather than nothing.
    const collection = await getCollectionByHandle("fio-vivo");

    const { response } = await listProducts({
      countryCode,
      queryParams: {
        limit: 8,
        fields: "*variants,*variants.calculated_price,*images,*categories",
        ...(collection ? { collection_id: collection.id } : {}),
      },
    });
    return response.products || [];
  } catch (error) {
    console.error("Failed to fetch products for Gallery Hero:", error);
    return [];
  }
}
