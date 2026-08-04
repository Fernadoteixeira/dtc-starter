import { listProducts } from "@lib/data/products";
import { HttpTypes } from "@medusajs/types";

export async function fetchGalleryHeroProducts(
  countryCode: string
): Promise<HttpTypes.StoreProduct[]> {
  try {
    const { response } = await listProducts({
      countryCode,
      queryParams: {
        limit: 8,
        fields: "*variants,*variants.calculated_price,*images,*categories",
      },
    });
    return response.products || [];
  } catch (error) {
    console.error("Failed to fetch products for Gallery Hero:", error);
    return [];
  }
}
