const test = require("node:test");
const assert = require("node:assert");

// Import mapped function logic or test helper
const { mapStoreProductToGalleryItem } = require("../medusa-adapter.ts");

test("1. Basic happy path: product with thumbnail and price", () => {
  const mockProduct = {
    id: "prod_01",
    handle: "t-shirt",
    title: "Medusa T-Shirt",
    thumbnail: "http://example.com/thumb.jpg",
    variants: [
      {
        calculated_price: { calculated_amount: 25, currency_code: "eur" },
        inventory_quantity: 10,
      },
    ],
  };

  const item = mapStoreProductToGalleryItem(mockProduct, "dk");
  assert.strictEqual(item.id, "prod_01");
  assert.strictEqual(item.handle, "t-shirt");
  assert.strictEqual(item.primaryImage.url, "http://example.com/thumb.jpg");
  assert.strictEqual(item.availability, "available");
  assert.ok(item.price.formatted.includes("25"));
});

test("2. Product without thumbnail falls back to images[0] or placeholder", () => {
  const mockProductWithImages = {
    id: "prod_02",
    handle: "sweatshirt",
    title: "Sweatshirt",
    images: [{ url: "http://example.com/img1.jpg" }],
  };
  const item1 = mapStoreProductToGalleryItem(mockProductWithImages, "dk");
  assert.strictEqual(item1.primaryImage.url, "http://example.com/img1.jpg");

  const mockProductNoImage = { id: "prod_03", handle: "no-img", title: "No Image" };
  const item2 = mapStoreProductToGalleryItem(mockProductNoImage, "dk");
  assert.ok(item2.primaryImage.url.includes("placeholder"));
});

test("3. Product without calculated price leaves price undefined", () => {
  const mockProduct = { id: "prod_noprice", handle: "noprice", title: "No Price" };
  const item = mapStoreProductToGalleryItem(mockProduct, "dk");
  assert.strictEqual(item.price, undefined);
});

test("4. Out of stock inventory policy (inventory_quantity === 0)", () => {
  const mockProduct = {
    id: "prod_out",
    handle: "out-stock",
    title: "Out of Stock",
    variants: [{ inventory_quantity: 0 }],
  };
  const item = mapStoreProductToGalleryItem(mockProduct, "dk");
  assert.strictEqual(item.availability, "out-of-stock");
});

test("5. Low stock inventory policy (inventory_quantity <= 5)", () => {
  const mockProduct = {
    id: "prod_low",
    handle: "low-stock",
    title: "Low Stock",
    variants: [{ inventory_quantity: 3 }],
  };
  const item = mapStoreProductToGalleryItem(mockProduct, "dk");
  assert.strictEqual(item.availability, "low-stock");
});

test("6. Product without variants returns unavailable", () => {
  const mockProduct = { id: "prod_novar", handle: "novar", title: "No Variants" };
  const item = mapStoreProductToGalleryItem(mockProduct, "dk");
  assert.strictEqual(item.availability, "unavailable");
});

test("7. Extracts editorial metadata when present", () => {
  const mockProduct = {
    id: "prod_meta",
    handle: "meta-item",
    title: "Meta Item",
    metadata: {
      gallery: {
        contextualName: "Artisanal Pima",
        artist: "Studio Nord",
        year: 2026,
        ambientColors: ["#000", "#111", "#222"],
      },
    },
  };
  const item = mapStoreProductToGalleryItem(mockProduct, "us");
  assert.strictEqual(item.contextualName, "Artisanal Pima");
  assert.strictEqual(item.artist, "Studio Nord");
  assert.strictEqual(item.year, 2026);
  assert.deepStrictEqual(item.ambientColors, ["#000", "#111", "#222"]);
});

test("8. Handles sceneImages in metadata", () => {
  const mockProduct = {
    id: "prod_scenes",
    handle: "scenes-item",
    title: "Scenes Item",
    metadata: {
      gallery: {
        sceneImages: [
          { url: "http://example.com/scene1.jpg", label: "Front View" },
          { url: "http://example.com/scene2.jpg", label: "Detail View" },
        ],
      },
    },
  };
  const item = mapStoreProductToGalleryItem(mockProduct, "dk");
  assert.strictEqual(item.scenes.length, 2);
  assert.strictEqual(item.scenes[0].label, "Front View");
});

test("9. Constructs localized product URL correctly", () => {
  const mockProduct = { id: "prod_url", handle: "custom-pant", title: "Pant" };
  const itemUS = mapStoreProductToGalleryItem(mockProduct, "us");
  assert.strictEqual(itemUS.productUrl, "/us/products/custom-pant");

  const itemDE = mapStoreProductToGalleryItem(mockProduct, "de");
  assert.strictEqual(itemDE.productUrl, "/de/products/custom-pant");
});

test("10. Graceful handling of missing title/handle", () => {
  const mockProduct = { id: "prod_empty" };
  const item = mapStoreProductToGalleryItem(mockProduct, "dk");
  assert.strictEqual(item.id, "prod_empty");
  assert.ok(item.productUrl.includes("/dk/products/"));
});

test("11. Extracts category name if present", () => {
  const mockProduct = {
    id: "prod_cat",
    handle: "cat-item",
    title: "Cat Item",
    categories: [{ name: "Outerwear" }],
  };
  const item = mapStoreProductToGalleryItem(mockProduct, "dk");
  assert.strictEqual(item.category, "Outerwear");
});

test("12. Handles missing currency code gracefully", () => {
  const mockProduct = {
    id: "prod_nocurr",
    handle: "nocurr",
    title: "No Currency",
    variants: [
      {
        calculated_price: { calculated_amount: 100 },
      },
    ],
  };
  const item = mapStoreProductToGalleryItem(mockProduct, "dk");
  assert.ok(item.price?.formatted);
});
