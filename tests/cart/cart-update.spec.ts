import { test, expect } from "@playwright/test";
import {
  getCart,
  updateLineItem,
  createCartWithItem,
} from "@api/cart.controller";
import {
  getRandomFrom,
  getDifferentIdFrom,
  getPurchasableVariantIds,
} from "@helpers/product.util";
import { CartResponse } from "@src-types/spree.types";

// ====================
// UPDATE FUNCTIONALITY
// ====================
test.describe("Update Cart", () => {
  // ==============
  // POSITIVE TESTS
  // ==============
  test.describe("Positive Scenarios @regression @smoke", () => {
    // 1. UPDATE SINGLE ITEM
    test("updates item quantity in the cart", async ({ request }) => {
      const id = getRandomFrom(await getPurchasableVariantIds(request));
      const { token, lineItemId } = await createCartWithItem(request, id, 1);

      const response = await updateLineItem(request, token, lineItemId, 5);
      expect(response.status()).toBe(200);

      const cart: CartResponse = await getCart(request, token);
      expect(cart.data.attributes.item_count).toBe(5);
    });
  });

  // ==============
  // NEGATIVE TESTS
  // ==============
  test.describe("Negative Scenarios @regression @negative", () => {
    // 2. UPDATE NON-EXISTENT ITEM
    test("fails when updating a non-existent line item", async ({
      request,
    }) => {
      const id = getRandomFrom(await getPurchasableVariantIds(request));
      const otherId = getDifferentIdFrom(
        await getPurchasableVariantIds(request),
        id,
      );
      const { token } = await createCartWithItem(request, id, 4);

      const response = await updateLineItem(request, token, otherId, 0);
      expect(response.status()).toBe(422);
    });
  });

  // ==========
  // EDGE TESTS
  // ==========
  test.describe("Edge Scenarios @regression @edge", () => {
    // 3. UPDATE QUANTITY TO ZERO
    test("fails when setting item quantity to zero", async ({ request }) => {
      const id = getRandomFrom(await getPurchasableVariantIds(request));
      const { token, lineItemId } = await createCartWithItem(request, id, 1);

      const response = await updateLineItem(request, token, lineItemId, 0);
      expect(response.status()).toBe(422);
    });

    // 4. SET EXTREME QUANTITY
    test("rejects excessively large quantity requests", async ({ request }) => {
      const id = getRandomFrom(await getPurchasableVariantIds(request));
      const { token, lineItemId } = await createCartWithItem(request, id, 1);

      const response = await updateLineItem(request, token, lineItemId, 999999);
      expect(response.status()).toBe(422);
    });
  });
});
