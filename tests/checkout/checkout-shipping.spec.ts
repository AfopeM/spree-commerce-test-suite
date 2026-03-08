import { test, expect } from "@playwright/test";
import { createCart, createCartWithItem } from "@api/cart.controller";
import {
  getRandomFrom,
  getPurchasableVariantIds,
  createCartAtAddressState,
} from "@utils/api.util";
import {
  addShippingAddress,
  getShippingMethods,
  selectFirstShippingMethod,
  DEFAULT_EMAIL,
  DEFAULT_SHIPPING_ADDRESS,
  advanceCheckout,
} from "@api/checkout.controller";

// =======================================
// CHECKOUT SHIPPING-ADDRESS FUNCTIONALITY
// =======================================
test.describe("Checkout shipping address", () => {
  // ==============
  // POSITIVE TESTS
  // ==============
  test.describe("Positive Test", { tag: "@regression @smoke" }, () => {
    // 1. VERIFY ADDRESS PERSISTENCE
    test("verify order saves shipping address and email", async ({
      request,
    }) => {
      const id = getRandomFrom(await getPurchasableVariantIds(request));
      const { token } = await createCartWithItem(request, id, 1);

      const response = await addShippingAddress(request, token);
      expect(response.status()).toBe(200);

      const data = await response.json();

      expect(data.data.attributes.state).toBe("address");
      expect(data.data.attributes.email).toBe(DEFAULT_EMAIL);
    });

    // 2. VERIFY STATE TRANSITION TO DELIVERY
    test("advance order from 'address' state to 'payment' state", async ({
      request,
    }) => {
      const id = getRandomFrom(await getPurchasableVariantIds(request));
      const { token } = await createCartWithItem(request, id, 1);

      await addShippingAddress(request, token);

      const response = await advanceCheckout(request, token);
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.data.attributes.state).toBe("payment");
    });

    // 3. ACCEPT CUSTOM SHIPPING ADDRESS
    test("accept custom shipping address", async ({ request }) => {
      const id = getRandomFrom(await getPurchasableVariantIds(request));
      const { token } = await createCartWithItem(request, id, 1);

      const customEmail = "custom@test.com";
      const customAddress = {
        ...DEFAULT_SHIPPING_ADDRESS,
        city: "LA",
      };

      const response = await addShippingAddress(
        request,
        token,
        customEmail,
        customAddress,
      );
      expect(response.status()).toBe(200);

      const shippingData = await response.json();
      expect(shippingData.data.attributes.email).toBe(customEmail);

      const addressRecord = shippingData.included.find(
        (item: any) => item.type === "address",
      );
      expect(addressRecord).toBeDefined();
      expect(addressRecord.attributes.city).toBe("LA");
    });

    // 4. FETCH AVAILABLE SHIPPING METHODS
    test("returns available shipping methods after address is set", async ({
      request,
    }) => {
      const { token } = await createCartAtAddressState(request);
      const shippingData = await getShippingMethods(request, token);

      expect(
        shippingData.data[0].relationships.shipping_rates.data.length,
      ).toBeGreaterThan(0);
    });

    // 5. VERIFY STATE TRANSITION TO PAYMENT
    test("advance order from 'delivery' state to 'payment' state", async ({
      request,
    }) => {
      const { token } = await createCartAtAddressState(request);

      await selectFirstShippingMethod(request, token);

      const response = await advanceCheckout(request, token);
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.data.attributes.state).toBe("payment");
    });
  });

  // ==============
  // NEGATIVE TESTS
  // ==============
  test.describe("Negative Test", { tag: "@regression @negative" }, () => {
    // 6. REJECT MISSING REQUIRED FIELDS
    test("reject missing required address fields", async ({ request }) => {
      const id = getRandomFrom(await getPurchasableVariantIds(request));
      const { token } = await createCartWithItem(request, id, 1);
      const incompleteAddress = {
        firstname: "John",
        lastname: "Snow",
        address1: "",
        city: "",
        country_iso: "US",
      };

      const response = await request.patch("checkout", {
        headers: { "X-Spree-Order-Token": token },
        data: {
          order: {
            email: DEFAULT_EMAIL,
            ship_address_attributes: incompleteAddress,
          },
        },
      });

      expect(response.status()).toBe(422);
    });

    // 7. REJECT CHECKOUT WITH EMPTY CART
    test("reject checkout with empty cart", async ({ request }) => {
      const { token } = await createCart(request);

      const response = await addShippingAddress(request, token);
      expect(response.status()).toBe(422);

      const shippingData = await response.json();
      expect(shippingData.data.attributes.state).toBe("address");
      expect(shippingData.errors).toBeDefined();
    });

    // 8. REJECT UNSUPPORTED SHIPPING REGIONS
    test("reject shipping to unsupported country", async ({ request }) => {
      const id = getRandomFrom(await getPurchasableVariantIds(request));
      const { token } = await createCartWithItem(request, id, 1);

      const internationalAddress = {
        ...DEFAULT_SHIPPING_ADDRESS,
        city: "Spin Boldak",
        country_iso: "AF",
      };

      const response = await addShippingAddress(
        request,
        token,
        DEFAULT_EMAIL,
        internationalAddress,
      );
      expect(response.status()).toBe(422);

      const shippingData = await response.json();
      expect(shippingData.error).toBeDefined();
    });
  });
});
