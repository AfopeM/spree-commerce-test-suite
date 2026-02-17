import { test, expect } from "@playwright/test";

import { createCart, addItemToCart, getCart } from "../utils/api.helpers";

test("should create a cart and recieve a token", async ({ request }) => {
  const { token, id } = await createCart(request);

  expect(token).toBeTruthy();
  expect(id).toBeTruthy();
});

test.describe("CART: Add Item", () => {
  // ADD SINGLE ITEM
  test("should add item to cart", async ({ request }) => {
    const { token } = await createCart(request);

    const response = await addItemToCart(request, token, "2125", 1);
    expect(response.ok()).toBeTruthy();

    // Verify Cart State
    const cart = await getCart(request, token);
    expect(cart.data.attributes.item_count).toBe(1);
  });

  // ADD MULTIPLE OF THE SAME ITEM
  test("should add multiple quantities of same item", async ({ request }) => {
    const { token } = await createCart(request);

    await addItemToCart(request, token, "2125", 3);

    const cart = await getCart(request, token);
    expect(cart.data.attributes.item_count).toBe(3);
  });

  // ADD DIFFERENT ITEMS
  test("should add different items to cart", async ({ request }) => {
    const { token } = await createCart(request);

    await addItemToCart(request, token, "2125", 2);
    await addItemToCart(request, token, "1424", 1);

    const cart = await getCart(request, token);
    expect(cart.data.attributes.item_count).toBe(3); // 3 items in total
    expect(cart.data.relationships.line_items.data).toHaveLength(2); // 2 distinct items
  });
});
