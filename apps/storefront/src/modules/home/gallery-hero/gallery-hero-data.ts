import { getCollectionByHandle } from "@lib/data/collections";
import { listProducts } from "@lib/data/products";
import { HttpTypes } from "@medusajs/types";

/**
 * Query params shape used by fetchGalleryHeroProducts.
 * Extracted as a standalone type so tests can assert without mocking Medusa.
 */
export interface GalleryHeroQueryParams {
  limit: number;
  fields: string;
  collection_id: string;
}

/**
 * Build the queryParams object for the gallery hero product list.
 *
 * Fail-Closed Policy: A valid collection is strictly required. When no collection
 * is found, null is returned to prevent fetching arbitrary products from the catalog
 * and incorrectly presenting them as curated Fio Vivo artworks.
 *
 * Extracted from fetchGalleryHeroProducts to be unit-testable without
 * mocking the Medusa client.
 */
export function buildGalleryHeroQueryParams(
  collection: { id: string } | null | undefined,
  limit = 8
): GalleryHeroQueryParams | null {
  if (!collection?.id) {
    return null;
  }

  return {
    limit,
    fields: "*variants,*variants.calculated_price,*images,*categories",
    collection_id: collection.id,
  };
}

export async function fetchGalleryHeroProducts(
  countryCode: string
): Promise<HttpTypes.StoreProduct[]> {
  try {
    // FAIL-CLOSED: Strictly query products in the fio-vivo collection.
    // If the collection does not exist (e.g. prior to DB seed), return []
    // so the hero caller can handle fallback cleanly rather than polluting
    // the Fio Vivo gallery with arbitrary store products.
    const collection = await getCollectionByHandle("fio-vivo");
    const queryParams = buildGalleryHeroQueryParams(collection);

    if (!queryParams) {
      return [];
    }

    const { response } = await listProducts({
      countryCode,
      queryParams,
    });
    return response.products || [];
  } catch (error) {
    console.error("Failed to fetch products for Gallery Hero:", error);
    return [];
  }
}
