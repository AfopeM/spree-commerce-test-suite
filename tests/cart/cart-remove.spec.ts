import { test, expect } from "@playwright/test";
import {
  getCart,
  createCart,
  removeLineItem,
  createCartWithItem,
} from "@api/cart.api";
import {
  getRandomFrom,
  getPurchasableVariantIds,
} from "@helpers/product.helper";
import { CartResponse } from "@src-types/api.types";

// REMOVES FUNCTIONALITY
test.describe("Cart: Remove Functionality", () => {
  // REMOVES SINGLE ITEM
  test("updating line item quantity reflects the new total in the cart", async ({
    request,
  }) => {
    const id = getRandomFrom(await getPurchasableVariantIds(request));
    const { token, lineItemId } = await createCartWithItem(request, id, 1);

    const response = await removeLineItem(request, token, lineItemId);
    expect(response.ok()).toBe(true);

    const cart: CartResponse = await getCart(request, token);
    expect(cart.data.attributes.item_count).toBe(0);
  });

  // NEGATIVE - DOES NOT REMOVE INVALID LINE ITEMS
  test("should reject removal of non-existent line item", async ({
    request,
  }) => {
    const { token } = await createCart(request);

    const response = await removeLineItem(request, token, "fake-id");
    expect(response.ok()).toBe(false);
  });
});
