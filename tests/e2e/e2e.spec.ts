import { test, expect } from "@playwright/test";
import { createCart, addItemToCart } from "@api/cart.controller";
import {
  addPayment,
  completeOrder,
  addShippingAddress,
  selectFirstShippingMethod,
  advanceCheckout,
} from "@api/checkout.controller";
import { getRandomFrom, getPurchasableVariantIds } from "@utils/api.util";

// =================
// E2E FUNCTIONALITY
// =================
test.describe("E2E: Order Completion", () => {
  // =============
  // POSITIVE TEST
  // =============
  test(
    "complete full checkout flow from cart to order",
    {
      tag: "@e2e",
    },
    async ({ request }) => {
      // STEP 1: CREATE CART
      const { token, id: cartId } = await createCart(request);

      console.log(`Created Cart: ${cartId}, token: ${token}`);

      // STEP 2: ADD PRODUCT TO CART
      const variantId = getRandomFrom(await getPurchasableVariantIds(request));
      const addItemResponse = await addItemToCart(request, token, variantId, 2);
      expect(addItemResponse.status()).toBe(200);

      console.log(`Added 2 ID: ${variantId} items to cart`);

      // STEP 3: ADD SHIPPING ADDRESS
      const addressResponse = await addShippingAddress(request, token);
      expect(addressResponse.status()).toBe(200);

      const addressData = await addressResponse.json();
      expect(addressData.data.attributes.state).toBe("address");

      console.log("Added shipping address, state: address");

      // STEP 4: SELECT SHIPPING METHOD
      const shippingResponse = await selectFirstShippingMethod(request, token);
      expect(shippingResponse.status()).toBe(200);

      console.log("Selected shipping, state: delivery");

      // STEP 5: NOW ADD PAYMENT DETAILS (while in payment state)
      const toPaymentResponse = await advanceCheckout(request, token);
      const toPaymentData = await toPaymentResponse.json();
      expect(toPaymentData.data.attributes.state).toBe("payment");

      console.log("Advanced to payment state");

      const paymentResponse = await addPayment(request, token);
      expect(paymentResponse.status()).toBe(200);

      const paymentData = await paymentResponse.json();
      const payments = paymentData.data.relationships.payments.data;

      expect(payments.length).toBeGreaterThan(0);
      console.log(`Payment record created: ${payments[0].id}`);

      // STEP 6: COMPLETE THE ORDER
      console.warn(
        "Final completion is blocked by Stripe Redirect requirements.",
      );
      test.fixme(
        true,
        "Blocked by Stripe PaymentIntent redirect validation (return_url)",
      );

      // BLOCKED SECTION
      const completeResponse = await completeOrder(request, token);
      expect(completeResponse.status()).toBe(200);

      const orderData = await completeResponse.json();

      expect(orderData.data.attributes.state).toBe("complete");
      expect(orderData.data.attributes.shipment_state).toBe("ready");
      expect(orderData.data.attributes.payment_state).toBe("paid");

      expect(orderData.data.attributes.item_count).toBe(2);
      expect(orderData.data.attributes.number).toBeTruthy(); // Order number assigned

      console.log(
        `Order ${orderData.data.attributes.number} placed successfully!`,
      );
    },
  );
});
