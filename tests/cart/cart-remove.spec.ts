import { test, expect } from "@playwright/test";
import {
  getCart,
  createCart,
  removeLineItem,
  createCartWithItem,
} from "@api/cart.controller";
import {
  getRandomFrom,
  getPurchasableVariantIds,
  getDifferentIdFrom,
} from "@helpers/product.util";
import { CartResponse } from "@src-types/spree.types";

// =====================
// REMOVES FUNCTIONALITY
// =====================
test.describe("Remove from Cart", () => {
  // ==============
  // POSITIVE TESTS
  // ==============
  test.describe("Positive Scenarios @regression @smoke", () => {
    // 1. REMOVE SINGLE ITEM
    test("remove line item from cart", async ({ request }) => {
      const id = getRandomFrom(await getPurchasableVariantIds(request));
      const { token, lineItemId } = await createCartWithItem(request, id, 1);

      const response = await removeLineItem(request, token, lineItemId);
      expect(response.status()).toBe(200);

      const cart: CartResponse = await getCart(request, token);
      expect(cart.data.attributes.item_count).toBe(0);
    });
  });

  // ==============
  // NEGATIVE TESTS
  // ==============
  test.describe("Negative Scenarios @regression @negative", () => {
    // 2. DOES NOT REMOVE INVALID LINE ITEMS
    test("reject removal of non-existent line item", async ({ request }) => {
      const { token } = await createCart(request);

      const response = await removeLineItem(request, token, "fake-id");
      expect(response.status()).toBe(404);
    });

    // 3. DOES NOT REMOVE LINE ITEMS NOT IN CART
    test("reject removal of line item that is not in cart", async ({
      request,
    }) => {
      const id = getRandomFrom(await getPurchasableVariantIds(request));
      const otherId = getDifferentIdFrom(
        await getPurchasableVariantIds(request),
        id,
      );
      const { token } = await createCartWithItem(request, id, 1);

      const response = await removeLineItem(request, token, otherId);
      expect(response.status()).toBe(404);
    });

    // 4. DOES NOT REMOVE LINE ITEMS NOT IN CART
    test("reject removal with invalid cart token", async ({ request }) => {
      const id = getRandomFrom(await getPurchasableVariantIds(request));
      const otherId = getDifferentIdFrom(
        await getPurchasableVariantIds(request),
        id,
      );
      const { token } = await createCartWithItem(request, id, 1);

      const response = await removeLineItem(request, token + "1", otherId);
      expect(response.status()).toBe(404);
    });
  });
});
