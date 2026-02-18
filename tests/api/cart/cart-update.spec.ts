import { test, expect } from "@playwright/test";
import { getCart, updateLineItem, createCartWithItem } from "@api/cart.api";
import {
  getRandomFrom,
  getPurchasableVariantIds,
} from "@helpers/product.helper";
import { CartResponse } from "@src-types/api.types";

// UPDATE FUNCTIONALITY
test.describe("Cart: Update Functionality", () => {
  // UPDATE SINGLE ITEM
  test("updating line item quantity reflects the new total in the cart", async ({
    request,
  }) => {
    const id = getRandomFrom(await getPurchasableVariantIds(request));
    const { token, lineItemId } = await createCartWithItem(request, id, 1);

    const response = await updateLineItem(request, token, lineItemId, 5);
    expect(response.ok()).toBe(true);

    const cart: CartResponse = await getCart(request, token);
    expect(cart.data.attributes.item_count).toBe(5);
  });

  //  EDGE CASE - UPDATE CART ITEM TO ZERO
  test("updating line item quantity to zero removes the item from the cart", async ({
    request,
  }) => {
    const id = getRandomFrom(await getPurchasableVariantIds(request));
    const { token, lineItemId } = await createCartWithItem(request, id, 1);

    const response = await updateLineItem(request, token, lineItemId, 0);
    expect(response.ok()).toBe(true);

    const cart: CartResponse = await getCart(request, token);
    expect(cart.data.attributes.item_count).toBe(0);
  });
});
