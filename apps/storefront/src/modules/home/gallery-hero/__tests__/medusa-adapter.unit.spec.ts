import { HttpTypes } from "@medusajs/types"
import {
  mapStoreProductToGalleryItem,
  mapStoreProductsToGalleryItems,
} from "../medusa-adapter"
import type { GalleryItem } from "@dtc/gallery-experience"

/**
 * Minimal factory for HttpTypes.StoreProduct used in unit tests.
 * Only the fields consumed by the adapter are populated.
 */
function makeProduct(
  overrides: Partial<HttpTypes.StoreProduct> = {}
): HttpTypes.StoreProduct {
  return {
    id: "prod_001",
    handle: "test-product",
    title: "Test Product",
    description: "A test product",
    thumbnail: undefined,
    images: [],
    variants: [],
    categories: [],
    metadata: {},
    ...overrides,
  } as HttpTypes.StoreProduct
}

describe("mapStoreProductToGalleryItem", () => {
  describe("price mapping", () => {
    it("maps a product with calculated_price to a GalleryItem with price", () => {
      const product = makeProduct({
        variants: [
          {
            id: "var_001",
            title: "Default",
            calculated_price: {
              calculated_amount: 1290,
              currency_code: "eur",
            },
          } as HttpTypes.StoreProductVariant,
        ],
      })

      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.price).toBeDefined()
      expect(item.price!.amount).toBe(1290)
      expect(item.price!.currencyCode).toBe("EUR")
      expect(item.price!.formatted).toMatch(/1[.,\s]?290/)
    })

    it("maps a product without calculated_price to a GalleryItem with no price", () => {
      const product = makeProduct({
        variants: [
          {
            id: "var_002",
            title: "No price",
          } as HttpTypes.StoreProductVariant,
        ],
      })

      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.price).toBeUndefined()
    })

    it("maps a product with no variants to a GalleryItem with no price", () => {
      const product = makeProduct({ variants: [] })
      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.price).toBeUndefined()
    })

    it("uses 'EUR' as fallback when currency_code is missing", () => {
      const product = makeProduct({
        variants: [
          {
            id: "var_003",
            title: "Missing currency",
            calculated_price: {
              calculated_amount: 500,
            },
          } as HttpTypes.StoreProductVariant,
        ],
      })

      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.price!.currencyCode).toBe("EUR")
    })
  })

  describe("availability mapping", () => {
    it("returns 'available' when inventory > 5", () => {
      const product = makeProduct({
        variants: [
          { id: "v1", inventory_quantity: 10 } as HttpTypes.StoreProductVariant,
          { id: "v2", inventory_quantity: 5 } as HttpTypes.StoreProductVariant,
        ],
      })

      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.availability).toBe("available")
    })

    it("returns 'low-stock' when total inventory <= 5 and > 0", () => {
      const product = makeProduct({
        variants: [
          { id: "v1", inventory_quantity: 3 } as HttpTypes.StoreProductVariant,
          { id: "v2", inventory_quantity: 2 } as HttpTypes.StoreProductVariant,
        ],
      })

      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.availability).toBe("low-stock")
    })

    it("returns 'out-of-stock' when total inventory is 0", () => {
      const product = makeProduct({
        variants: [
          { id: "v1", inventory_quantity: 0 } as HttpTypes.StoreProductVariant,
        ],
      })

      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.availability).toBe("out-of-stock")
    })

    it("returns 'unavailable' when there are no variants", () => {
      const product = makeProduct({ variants: [] })
      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.availability).toBe("unavailable")
    })

    it("treats null inventory_quantity as 0", () => {
      const product = makeProduct({
        variants: [
          {
            id: "v1",
            inventory_quantity: null,
          } as HttpTypes.StoreProductVariant,
        ],
      })

      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.availability).toBe("out-of-stock")
    })
  })

  describe("scenes mapping", () => {
    it("maps metadata.sceneImages to scenes", () => {
      const product = makeProduct({
        metadata: {
          gallery: {
            sceneImages: [
              { url: "/img/scene1.png", alt: "Scene 1", label: "Angle A" },
              { url: "/img/scene2.png", alt: "Scene 2", label: "Angle B" },
            ],
          },
        },
      })

      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.scenes).toHaveLength(2)
      expect(item.scenes[0].id).toBe("scene-0")
      expect(item.scenes[0].image.url).toBe("/img/scene1.png")
      expect(item.scenes[0].image.alt).toBe("Scene 1")
      expect(item.scenes[0].label).toBe("Angle A")
      expect(item.scenes[1].id).toBe("scene-1")
    })

    it("falls back to secondary images (index 1+) when metadata has no sceneImages", () => {
      const product = makeProduct({
        images: [
          { id: "img-0", url: "/img/primary.png" },
          { id: "img-1", url: "/img/angle2.png" },
          { id: "img-2", url: "/img/angle3.png" },
        ] as HttpTypes.StoreProduct["images"],
        metadata: { gallery: {} },
      })

      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.scenes).toHaveLength(2)
      expect(item.scenes[0].image.url).toBe("/img/angle2.png")
      expect(item.scenes[0].label).toBe("View 2")
      expect(item.scenes[1].image.url).toBe("/img/angle3.png")
      expect(item.scenes[1].label).toBe("View 3")
    })

    it("returns empty scenes when no metadata and fewer than 2 images", () => {
      const product = makeProduct({
        images: [
          { id: "img-0", url: "/img/only.png" },
        ] as HttpTypes.StoreProduct["images"],
        metadata: {},
      })

      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.scenes).toHaveLength(0)
    })

    it("returns empty scenes when no metadata and no images", () => {
      const product = makeProduct({ images: [], metadata: {} })
      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.scenes).toHaveLength(0)
    })

    it("uses default alt/label when sceneImages entries omit them", () => {
      const product = makeProduct({
        metadata: {
          gallery: {
            sceneImages: [{ url: "/img/scene.png" }],
          },
        },
      })

      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.scenes[0].image.alt).toContain("scene 1")
      expect(item.scenes[0].label).toBe("Scene 1")
    })
  })

  describe("images mapping", () => {
    it("uses thumbnail as primaryImage when available", () => {
      const product = makeProduct({
        thumbnail: "/img/thumb.png",
        images: [
          { id: "img-0", url: "/img/first.png" },
        ] as HttpTypes.StoreProduct["images"],
      })

      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.primaryImage.url).toBe("/img/thumb.png")
    })

    it("uses first image as primaryImage when no thumbnail", () => {
      const product = makeProduct({
        thumbnail: undefined,
        images: [
          { id: "img-0", url: "/img/first.png" },
        ] as HttpTypes.StoreProduct["images"],
      })

      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.primaryImage.url).toBe("/img/first.png")
    })

    it("uses empty string for primaryImage.url when no thumbnail and no images", () => {
      const product = makeProduct({
        thumbnail: undefined,
        images: [],
      })

      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.primaryImage.url).toBe("")
    })

    it("uses product title as alt when title is set", () => {
      const product = makeProduct({ title: "My Artwork" })
      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.primaryImage.alt).toBe("My Artwork")
    })

    it("uses 'Product image' as alt when title is empty", () => {
      const product = makeProduct({ title: "" })
      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.primaryImage.alt).toBe("Product image")
    })
  })

  describe("core fields", () => {
    it("maps id, handle, and title", () => {
      const product = makeProduct({
        id: "prod_999",
        handle: "my-handle",
        title: "My Title",
      })

      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.id).toBe("prod_999")
      expect(item.handle).toBe("my-handle")
      expect(item.title).toBe("My Title")
    })

    it("uses contextualName from metadata when present", () => {
      const product = makeProduct({
        title: "Original Title",
        metadata: { gallery: { contextualName: "Gallery Name" } },
      })

      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.contextualName).toBe("Gallery Name")
    })

    it("falls back to title when contextualName is absent", () => {
      const product = makeProduct({ title: "Original Title", metadata: {} })
      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.contextualName).toBe("Original Title")
    })

    it("uses metadata.artist when present, otherwise undefined", () => {
      const withArtist = makeProduct({
        metadata: { gallery: { artist: "Jane Doe" } },
      })
      const withoutArtist = makeProduct({ metadata: {} })

      expect(mapStoreProductToGalleryItem(withArtist, "dk").artist).toBe(
        "Jane Doe"
      )
      expect(mapStoreProductToGalleryItem(withoutArtist, "dk").artist).toBeUndefined()
    })

    it("uses description when present, otherwise metadata.story", () => {
      const withDesc = makeProduct({
        description: "Primary desc",
        metadata: { gallery: { story: "Story" } },
      })
      const withStoryOnly = makeProduct({
        description: undefined,
        metadata: { gallery: { story: "Story desc" } },
      })
      const withNeither = makeProduct({
        description: undefined,
        metadata: {},
      })

      expect(mapStoreProductToGalleryItem(withDesc, "dk").description).toBe(
        "Primary desc"
      )
      expect(
        mapStoreProductToGalleryItem(withStoryOnly, "dk").description
      ).toBe("Story desc")
      expect(
        mapStoreProductToGalleryItem(withNeither, "dk").description
      ).toBeUndefined()
    })

    it("builds productUrl with countryCode and handle", () => {
      const product = makeProduct({ handle: "my-art" })
      const item = mapStoreProductToGalleryItem(product, "se")

      expect(item.productUrl).toBe("/se/products/my-art")
    })

    it("uses metadata.ambientColors when present", () => {
      const product = makeProduct({
        metadata: {
          gallery: { ambientColors: ["#111", "#222", "#333"] },
        },
      })

      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.ambientColors).toEqual(["#111", "#222", "#333"])
    })

    it("returns undefined ambientColors when metadata has none", () => {
      const product = makeProduct({ metadata: {} })
      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.ambientColors).toBeUndefined()
    })

    it("uses metadata.year when present", () => {
      const product = makeProduct({
        metadata: { gallery: { year: 2023 } },
      })

      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.year).toBe(2023)
    })

    it("returns undefined year when metadata has none", () => {
      const product = makeProduct({ metadata: {} })
      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.year).toBeUndefined()
    })

    it("maps category name from first category", () => {
      const product = makeProduct({
        categories: [
          { id: "cat-1", name: "Sculpture" },
        ] as HttpTypes.StoreProduct["categories"],
      })

      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.category).toBe("Sculpture")
    })

    it("returns undefined category when no categories", () => {
      const product = makeProduct({ categories: [] })
      const item = mapStoreProductToGalleryItem(product, "dk")

      expect(item.category).toBeUndefined()
    })
  })
})

describe("mapStoreProductsToGalleryItems", () => {
  it("maps an array of products", () => {
    const products = [
      makeProduct({ id: "p1", handle: "h1", title: "T1" }),
      makeProduct({ id: "p2", handle: "h2", title: "T2" }),
    ]

    const items = mapStoreProductsToGalleryItems(products, "dk")

    expect(items).toHaveLength(2)
    expect(items[0].id).toBe("p1")
    expect(items[1].id).toBe("p2")
  })

  it("returns empty array for empty input", () => {
    expect(mapStoreProductsToGalleryItems([], "dk")).toEqual([])
  })

  it("defaults countryCode to 'dk' when omitted", () => {
    const product = makeProduct({ handle: "my-art" })
    const item = mapStoreProductsToGalleryItems([product])[0] as GalleryItem

    expect(item.productUrl).toContain("/dk/products/my-art")
  })
})