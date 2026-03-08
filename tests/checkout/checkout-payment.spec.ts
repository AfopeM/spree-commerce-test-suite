import { test, expect } from "@playwright/test";
import { createCartWithItem } from "@api/cart.controller";
import { getRandomFrom, getPurchasableVariantIds } from "@utils/api.util";
import {
  TEST_CARDS,
  addPayment,
  advanceCheckout,
  createCartAtPaymentState,
} from "@api/checkout.controller";

// ===============================
// CHECKOUT PAYMENT FUNCTIONALITY
// ===============================
test.describe("Checkout shipping address", () => {
  // ==============
  // POSITIVE TESTS
  // ==============
  test.describe("Positive Test", { tag: "@regression @smoke" }, () => {
    // 1. ACCEPT VALID PAYMENT DETAILS
    test("accept valid payment details", async ({ request }) => {
      const { token } = await createCartAtPaymentState(request);

      const response = await addPayment(request, token);
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.data.attributes.state).toBe("payment");
      expect(data.data.attributes.payment_state).toBe("balance_due");
    });
  });

  // ==============
  // NEGATIVE TESTS
  // ==============
  test.describe("Negative Test", { tag: "@regression @negative" }, () => {
    // 2. REJECT INVALID CREDIT CARD
    test("reject invalid credit card", async ({ request }) => {
      const { token } = await createCartAtPaymentState(request);

      await addPayment(request, token, TEST_CARDS.DECLINED);

      const response = await advanceCheckout(request, token);
      expect(response.status()).toBe(422);
    });

    // 3. REJECT PAYMENT WITHOUT ADDRESS/SHIPPING
    test("reject payment without address/shipping", async ({ request }) => {
      const id = getRandomFrom(await getPurchasableVariantIds(request));
      const { token } = await createCartWithItem(request, id, 1);

      await addPayment(request, token);

      const response = await advanceCheckout(request, token);
      const data = await response.json();

      expect(data.data.attributes.state).toBe("address");
    });
  });
});
