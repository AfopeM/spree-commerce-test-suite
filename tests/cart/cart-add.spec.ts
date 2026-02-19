import { test, expect } from "@playwright/test";
import { CartResponse } from "@src-types/api.types";
import { createCart, addItemToCart, getCart } from "@api/cart.api";
import {
  getRandomFrom,
  getDifferentIdFrom,
  getOutOfStockVariantIds,
  getPurchasableVariantIds,
} from "@helpers/product.helper";

test("Successfully initializes a new cart @smoke", async ({ request }) => {
  const { token, id } = await createCart(request);

  expect(token).toBeTruthy();
  expect(id).toBeTruthy();
});

// ADD FUNCTIONALITY
test.describe("Cart: Add Functionality", () => {
  let cartToken: string;

  test.beforeEach(async ({ request }) => {
    const { token } = await createCart(request);
    cartToken = token;
  });

  // ADD SINGLE ITEM
  test("adding a single item is added to cart", async ({ request }) => {
    const id = getRandomFrom(await getPurchasableVariantIds(request));

    const response = await addItemToCart(request, cartToken, id, 1);
    expect(response.ok(), `Failed to add item ${id} cart`).toBeTruthy();

    const cart: CartResponse = await getCart(request, cartToken);
    expect(cart.data.attributes.item_count).toBe(1);
  });

  // ADD MULTIPLE OF THE SAME ITEM
  test("adding multiple units of the same item", async ({ request }) => {
    const id = getRandomFrom(await getPurchasableVariantIds(request));

    const response = await addItemToCart(request, cartToken, id, 3);
    expect(response.ok(), `Failed to add item ${id} to cart`).toBeTruthy();

    const cart: CartResponse = await getCart(request, cartToken);
    expect(cart.data.attributes.item_count).toBe(3);
  });

  // ADD MULTIPLE UNIQUE ITEMS
  test("adding multiple unique products", async ({ request }) => {
    const allIds = await getPurchasableVariantIds(request);
    const id1 = getRandomFrom(allIds);
    const id2 = getDifferentIdFrom(allIds, id1);

    const response1 = await addItemToCart(request, cartToken, id1, 2);
    expect(response1.ok(), `Failed to add item ${id1} to cart`).toBeTruthy();

    const response2 = await addItemToCart(request, cartToken, id2, 1);
    expect(response2.ok(), `Failed to add item ${id2} to cart`).toBeTruthy();

    const cart: CartResponse = await getCart(request, cartToken);

    expect(cart.data.attributes.item_count).toBe(3);
    expect(
      cart.data.relationships.line_items.data,
      "Should have 2 unique line items",
    ).toHaveLength(2);
  });

  // NEGATIVE - ADD INVALID ITEM
  test("adding an invalid product ID fails", async ({ request }) => {
    const response = await addItemToCart(request, cartToken, "0000", 1);

    expect(response.status(), "Succeed in adding item invalid item 0000").toBe(
      404,
    );
  });

  // NEGATIVE - QUANTITY OF ADDED TO CART IS 0
  test("cart should ignore add requests with quantity <= 0", async ({
    request,
  }) => {
    const id = getRandomFrom(await getPurchasableVariantIds(request));

    const response = await addItemToCart(request, cartToken, id, 0);
    expect(
      response.status(),
      `Succeed in adding item ${id} with zero quantity}`,
    ).toBe(400);

    const cart: CartResponse = await getCart(request, cartToken);
    expect(cart.data.attributes.item_count).toBe(0);
  });

  // NEGATIVE - ADD ITEM THAT IS OUT OF STOCK
  test("out-of-stock products cannot be added to a cart", async ({
    request,
  }) => {
    const outOfStockId = getRandomFrom(await getOutOfStockVariantIds(request));

    const response = await addItemToCart(request, cartToken, outOfStockId, 1);
    expect(
      response.status(),
      `Succeed in adding item ${outOfStockId} to cart}`,
    ).toBe(422);

    const cart: CartResponse = await getCart(request, cartToken);
    expect(cart.data.attributes.item_count).toBe(0);
  });
});
