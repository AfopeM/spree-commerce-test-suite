import { test, expect } from "@playwright/test";
import { CartResponse } from "@src-types/spree.types";
import { createCart, addItemToCart, getCart } from "@api/cart.controller";
import {
  getRandomFrom,
  getDifferentIdFrom,
  getOutOfStockVariantIds,
  getPurchasableVariantIds,
} from "@helpers/product.util";

// =================
// ADD FUNCTIONALITY
// =================
test.describe("Add to Cart", () => {
  test("Successfully initializes a new cart", async ({ request }) => {
    const { token, id } = await createCart(request);

    expect(token).toBeTruthy();
    expect(id).toBeTruthy();
  });

  // ==============
  // POSITIVE TESTS
  // ==============
  test.describe("Positive Scenarios @regression @smoke", () => {
    let cartToken: string;

    test.beforeEach(async ({ request }) => {
      const { token } = await createCart(request);
      cartToken = token;
    });

    // 1. ADD A SINGLE ITEM
    test("adds a single item to cart", async ({ request }) => {
      const id = getRandomFrom(await getPurchasableVariantIds(request));

      const response = await addItemToCart(request, cartToken, id, 1);
      expect(response.status(), `Failed to add item ${id} cart`).toBe(200);

      const cart: CartResponse = await getCart(request, cartToken);
      expect(cart.data.attributes.item_count).toBe(1);
    });

    // 2. ADD MULTIPLE OF THE SAME ITEM
    test("adds multiple units of the same item", async ({ request }) => {
      const id = getRandomFrom(await getPurchasableVariantIds(request));

      const response = await addItemToCart(request, cartToken, id, 3);
      expect(response.status(), `Failed to add item ${id} to cart`).toBe(200);

      const cart: CartResponse = await getCart(request, cartToken);
      expect(cart.data.attributes.item_count).toBe(3);
    });

    // 3. ADD MULTIPLE UNIQUE ITEMS
    test("adds multiple unique products", async ({ request }) => {
      const allIds = await getPurchasableVariantIds(request);
      const id1 = getRandomFrom(allIds);
      const id2 = getDifferentIdFrom(allIds, id1);

      const response1 = await addItemToCart(request, cartToken, id1, 2);
      expect(response1.status(), `Failed to add item ${id1} to cart`).toBe(200);

      const response2 = await addItemToCart(request, cartToken, id2, 1);
      expect(response2.status(), `Failed to add item ${id2} to cart`).toBe(200);

      const cart: CartResponse = await getCart(request, cartToken);

      expect(cart.data.attributes.item_count).toBe(3);
      expect(cart.data.relationships.line_items.data).toHaveLength(2);
    });
  });

  // ==============
  // NEGATIVE TESTS
  // ==============
  test.describe("Negative Scenarios @regression @negative", () => {
    let cartToken: string;

    test.beforeEach(async ({ request }) => {
      const { token } = await createCart(request);
      cartToken = token;
    });

    // 4. REJECT INVALID PRODUCT
    test("fails when adding a non-existent product", async ({ request }) => {
      const response = await addItemToCart(request, cartToken, "0000", 1);

      expect(
        response.status(),
        "Succeed in adding item invalid item 0000",
      ).toBe(404);
    });

    // 5. REJECT PRODUCT WITH ZERO UNITS
    test("rejects quantities of zero", async ({ request }) => {
      const id = getRandomFrom(await getPurchasableVariantIds(request));

      const response = await addItemToCart(request, cartToken, id, 0);
      expect(
        response.status(),
        `Succeed in adding item ${id} with zero quantity}`,
      ).toBe(400);

      const cart: CartResponse = await getCart(request, cartToken);
      expect(cart.data.attributes.item_count).toBe(0);
    });

    // 6. REJECT OUT-OF-STOCK PRODUCT
    test("prevents adding out-of-stock products", async ({ request }) => {
      const outOfStockId = getRandomFrom(
        await getOutOfStockVariantIds(request),
      );

      const response = await addItemToCart(request, cartToken, outOfStockId, 1);
      expect(
        response.status(),
        `Succeed in adding item ${outOfStockId} to cart}`,
      ).toBe(422);

      const cart: CartResponse = await getCart(request, cartToken);
      expect(cart.data.attributes.item_count).toBe(0);
    });
  });
});
