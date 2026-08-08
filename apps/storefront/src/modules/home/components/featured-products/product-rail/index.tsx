import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"
import { fioVivoProducts } from "@modules/home/gallery-hero/fixtures/fio-vivo-products"

export function mapFioVivoFixtureToProduct(
  fixture: (typeof fioVivoProducts)[0]
): HttpTypes.StoreProduct {
  const numericPrice =
    parseFloat(fixture.price.replace("R$", "").replace(",", ".").trim()) || 380
  return {
    id: fixture.id,
    title: fixture.title,
    handle: fixture.handle,
    description: fixture.description,
    thumbnail: fixture.primaryImage.src,
    images: fixture.scenes.map((scene) => ({ id: scene.id, url: scene.src })),
    subtitle: fixture.contextualName,
    variants: [
      {
        id: `${fixture.id}-variant`,
        title: "Peça Única / 2026",
        sku: fixture.code.toUpperCase(),
        calculated_price: {
          calculated_amount: numericPrice,
          original_amount: numericPrice,
          currency_code: "brl",
          calculated_price: {
            price_list_type: "default",
          },
        },
      } as unknown as HttpTypes.StoreProductVariant,
    ],
  } as HttpTypes.StoreProduct
}

export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  let pricedProducts: HttpTypes.StoreProduct[] = []

  try {
    if (collection.id && !collection.id.startsWith("fv-fallback")) {
      const { response } = await listProducts({
        regionId: region?.id,
        queryParams: {
          collection_id: collection.id,
          fields: "*variants.calculated_price",
        },
      })
      pricedProducts = response.products || []
    }
  } catch {
    pricedProducts = []
  }

  // If no products returned from API or fallback collection, use the Fio Vivo authorial bags fixtures
  if (!pricedProducts || pricedProducts.length === 0) {
    pricedProducts = fioVivoProducts.map(mapFioVivoFixtureToProduct)
  } else {
    // Ensure any product has valid Fio Vivo primary images and data sheets if generic
    pricedProducts = pricedProducts.map((p) => {
      const match = fioVivoProducts.find(
        (f) =>
          f.handle === p.handle ||
          f.code.includes(p.handle) ||
          p.title.toLowerCase().includes(f.title.toLowerCase())
      )
      if (match) {
        return {
          ...p,
          thumbnail: p.thumbnail || match.primaryImage.src,
          images:
            p.images && p.images.length > 0
              ? p.images
              : match.scenes.map((s) => ({ id: s.id, url: s.src })),
        }
      }
      return p
    })
  }

  return (
    <div className="content-container py-12 small:py-24">
      <div className="flex justify-between mb-8 items-center border-b border-ui-border-base pb-4">
        <div>
          <Text className="txt-xlarge font-serif">{collection.title}</Text>
          <Text className="txt-small text-ui-fg-subtle">
            Arte vestível e esculturas têxteis autorais
          </Text>
        </div>
        <InteractiveLink
          href={collection.handle ? `/collections/${collection.handle}` : "/store"}
        >
          Ver coleção
        </InteractiveLink>
      </div>
      <ul className="grid grid-cols-2 small:grid-cols-3 gap-x-6 gap-y-12 small:gap-y-16">
        {pricedProducts.map((product) => (
          <li key={product.id}>
            <ProductPreview product={product} region={region} isFeatured />
          </li>
        ))}
      </ul>
    </div>
  )
}
