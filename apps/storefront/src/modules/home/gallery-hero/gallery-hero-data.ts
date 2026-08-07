import { listProducts } from "@lib/data/products";
import { listCollections } from "@lib/data/collections";
import { HttpTypes } from "@medusajs/types";

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
