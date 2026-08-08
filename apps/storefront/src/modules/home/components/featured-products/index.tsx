import { HttpTypes } from "@medusajs/types"
import ProductRail from "@modules/home/components/featured-products/product-rail"

export default async function FeaturedProducts({
  collections,
  region,
}: {
  collections: HttpTypes.StoreCollection[]
  region: HttpTypes.StoreRegion
}) {
  const activeCollections =
    collections && collections.length > 0
      ? collections
      : [
          {
            id: "fv-fallback-collection",
            title: "Bolsas Autorais — Coleção Fio Vivo",
            handle: "bolsas-autorais",
          } as HttpTypes.StoreCollection,
        ]

  return activeCollections.map((collection) => (
    <li key={collection.id}>
      <ProductRail collection={collection} region={region} />
    </li>
  ))
}
