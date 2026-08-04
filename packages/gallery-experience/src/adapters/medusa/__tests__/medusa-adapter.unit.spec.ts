import { mapStoreProductToGalleryItem } from "../map-store-product-to-gallery-item";

describe("Medusa Gallery Adapter", () => {
  it("maps a basic StoreProduct to GalleryItem with default fallbacks", () => {
    const mockProduct: any = {
      id: "prod_123",
      handle: "t-shirt",
      title: "Medusa T-Shirt",
      description: "Comfortable cotton t-shirt",
      thumbnail: "https://example.com/thumb.jpg",
      images: [{ id: "img_1", url: "https://example.com/thumb.jpg" }],
      variants: [
        {
          calculated_price: {
            calculated_amount: 25,
            currency_code: "eur",
          },
          inventory_quantity: 10,
        },
      ],
    };

    const item = mapStoreProductToGalleryItem(mockProduct, "dk");

    expect(item.id).toBe("prod_123");
    expect(item.handle).toBe("t-shirt");
    expect(item.title).toBe("Medusa T-Shirt");
    expect(item.primaryImage.url).toBe("https://example.com/thumb.jpg");
    expect(item.productUrl).toBe("/dk/products/t-shirt");
    expect(item.availability).toBe("available");
    expect(item.price?.formatted).toContain("25");
  });

  it("extracts editorial metadata when present", () => {
    const mockProduct: any = {
      id: "prod_456",
      handle: "pima-shirt",
      title: "Pima Shirt",
      thumbnail: "https://example.com/main.jpg",
      metadata: {
        gallery: {
          contextualName: "Artisanal Pima",
          artist: "Studio Nord",
          year: 2026,
          ambientColors: ["#000000", "#111111", "#222222"],
        },
      },
    };

    const item = mapStoreProductToGalleryItem(mockProduct, "us");

    expect(item.contextualName).toBe("Artisanal Pima");
    expect(item.artist).toBe("Studio Nord");
    expect(item.year).toBe(2026);
    expect(item.ambientColors).toEqual(["#000000", "#111111", "#222222"]);
  });

  it("handles out-of-stock availability policy", () => {
    const mockProduct: any = {
      id: "prod_soldout",
      handle: "sold-out",
      title: "Sold Out Item",
      variants: [{ inventory_quantity: 0 }],
    };

    const item = mapStoreProductToGalleryItem(mockProduct, "dk");
    expect(item.availability).toBe("out-of-stock");
  });
});
