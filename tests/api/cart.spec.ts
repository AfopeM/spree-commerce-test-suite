import { test, expect } from "@playwright/test";
import { createCart, addItemToCart, getCart } from "../utils/api.helpers";
import { CartResponse } from "../utils/types";

test("Successfully initializes a new cart @smoke", async ({ request }) => {
  const { token, id } = await createCart(request);

  expect(token).toBeTruthy();
  expect(id).toBeTruthy();
});

test.describe("Cart: Add Item", () => {
  let cartToken: string;

  test.beforeEach(async ({ request }) => {
    const { token } = await createCart(request);
    cartToken = token;
  });

  // ADD SINGLE ITEM
  test("a single item is added to cart", async ({ request }) => {
    await test.step("add product to cart", async () => {
      const response = await addItemToCart(request, cartToken, "2125", 1);
      expect(response.ok(), "Failed to add item to cart").toBeTruthy();
    });

    await test.step("verify total item count is 1", async () => {
      const cart: CartResponse = await getCart(request, cartToken);
      expect(cart.data.attributes.item_count).toBe(1);
    });
  });

  // ADD MULTIPLE OF THE SAME ITEM
  test("multiple of same item are added to cart", async ({ request }) => {
    await addItemToCart(request, cartToken, "2125", 3);

    const cart: CartResponse = await getCart(request, cartToken);
    expect(cart.data.attributes.item_count).toBe(3);
  });

  // ADD MULTIPLE UNIQUE ITEMS
  test("Multiple unique items are added to cart", async ({ request }) => {
    await addItemToCart(request, cartToken, "2125", 2);
    await addItemToCart(request, cartToken, "1424", 1);

    const cart: CartResponse = await getCart(request, cartToken);

    expect(cart.data.attributes.item_count).toBe(3); // 3 items in total
    expect(
      cart.data.relationships.line_items.data,
      "Should have 2 unique line items",
    ).toHaveLength(2);
  });

  // NEGATIVE - ADD INVALID ITEM
  test("Invalid item is not added to cart", async ({ request }) => {
    const response = await addItemToCart(request, cartToken, "0000", 1);

    expect(response.ok()).toBe(false);
    expect(response.status()).toBe(404);
  });

  // NEGATIVE - QUANTITY OF ADDED TO CART IS 0
  test("Item with zero quantity is not added to cart", async ({ request }) => {
    const response = await addItemToCart(request, cartToken, "2125", 0);

    expect(response.ok()).toBe(false);
    expect(response.status()).toBe(400);
  });
});
