import {
  buildGalleryHeroQueryParams,
  type GalleryHeroQueryParams,
} from "../gallery-hero-data"

describe("buildGalleryHeroQueryParams", () => {
  describe("when collection exists", () => {
    it("includes collection_id in the params", () => {
      const collection = { id: "col_fio_vivo_123" }

      const params = buildGalleryHeroQueryParams(collection)

      expect(params.collection_id).toBe("col_fio_vivo_123")
    })

    it("sets the default limit to 8", () => {
      const params = buildGalleryHeroQueryParams({ id: "col_1" })

      expect(params.limit).toBe(8)
    })

    it("sets the fields string for variants, images, and categories", () => {
      const params = buildGalleryHeroQueryParams({ id: "col_1" })

      expect(params.fields).toContain("*variants")
      expect(params.fields).toContain("*variants.calculated_price")
      expect(params.fields).toContain("*images")
      expect(params.fields).toContain("*categories")
    })
  })

  describe("when collection does not exist (fail-closed policy)", () => {
    it("returns null when collection is null", () => {
      const params = buildGalleryHeroQueryParams(null)

      expect(params).toBeNull()
    })

    it("returns null when collection is undefined", () => {
      const params = buildGalleryHeroQueryParams(undefined)

      expect(params).toBeNull()
    })

    it("returns null when collection object has no id", () => {
      const params = buildGalleryHeroQueryParams({} as { id: string })

      expect(params).toBeNull()
    })
  })

  describe("custom limit", () => {
    it("uses custom limit together with collection_id", () => {
      const params = buildGalleryHeroQueryParams({ id: "col_99" }, 4)

      expect(params).not.toBeNull()
      expect(params?.limit).toBe(4)
      expect(params?.collection_id).toBe("col_99")
    })
  })

  describe("return type", () => {
    it("returns an object with limit, fields, and collection_id when collection exists", () => {
      const params: GalleryHeroQueryParams | null = buildGalleryHeroQueryParams({
        id: "col_x",
      })

      expect(params).not.toBeNull()
      expect(typeof params?.limit).toBe("number")
      expect(typeof params?.fields).toBe("string")
      expect(typeof params?.collection_id).toBe("string")
    })
  })

  describe("immutability / purity", () => {
    it("returns a new object on each call (no shared reference)", () => {
      const a = buildGalleryHeroQueryParams({ id: "col_1" })
      const b = buildGalleryHeroQueryParams({ id: "col_2" })

      expect(a).not.toBe(b)
      expect(a.collection_id).not.toBe(b.collection_id)
    })

    it("does not mutate the input collection", () => {
      const collection = { id: "col_original" }

      buildGalleryHeroQueryParams(collection)

      expect(collection.id).toBe("col_original")
    })
  })
})