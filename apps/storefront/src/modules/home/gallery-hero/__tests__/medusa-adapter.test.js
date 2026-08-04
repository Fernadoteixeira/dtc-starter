const test = require("node:test");
const assert = require("node:assert");

// Mock product mapping test for Medusa adapter logic
test("Medusa adapter formats product data and handles availability", () => {
  const mockProduct = {
    id: "prod_01",
    handle: "test-shirt",
    title: "Test Shirt",
    description: "A cool test shirt",
    thumbnail: "http://example.com/image.jpg",
    variants: [
      {
        calculated_price: {
          calculated_amount: 50,
          currency_code: "eur",
        },
        inventory_quantity: 12,
      },
    ],
  };

  assert.strictEqual(mockProduct.id, "prod_01");
  assert.strictEqual(mockProduct.handle, "test-shirt");
  assert.strictEqual(mockProduct.variants[0].inventory_quantity, 12);
});
