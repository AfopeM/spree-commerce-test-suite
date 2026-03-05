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
  DEFAULT_SHIPPING_ADDRESS,
} from "@api/checkout.controller";

// =======================================
// CHECKOUT SHIPPING-ADDRESS FUNCTIONALITY
// =======================================
test.describe("Checkout shipping address", () => {
  // ==============
  // POSITIVE TESTS
  // ==============
  test.describe("Positive Test", { tag: "@regression @smoke" }, () => {
    // 1. VALIDATE SHIPPING ADDRESS AND EMAIL
    test(
      "validates shipping address and email",
      { tag: "@smoke" },
      async ({ request }) => {
        const id = getRandomFrom(await getPurchasableVariantIds(request));
        const { token } = await createCartWithItem(request, id, 1);
        const response = await addShippingAddress(request, token);
        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data.data.attributes.state).toBe("address");
        expect(data.data.attributes.email).toBe("test@example.com");
      },
    );

    // 2. ACCEPT CUSTOM SHIPPING ADDRESS
    test("accept custom shipping address", async ({ request }) => {
      const id = getRandomFrom(await getPurchasableVariantIds(request));
      const { token } = await createCartWithItem(request, id, 1);
      const customAddress = {
        ...DEFAULT_SHIPPING_ADDRESS,
        city: "LA",
        state_name: "California",
        zipcode: "90001",
      };
      const response = await addShippingAddress(
        request,
        token,
        "custom@test.com",
        customAddress,
      );
      expect(response.status()).toBe(200);
      const shippingData = await response.json();

      expect(shippingData.data.attributes.email).toBe("custom@test.com");
      const addressRecord = shippingData.included.find(
        (item: any) => item.type === "address",
      );

      expect(addressRecord).toBeDefined();
      expect(addressRecord.attributes.city).toBe("LA");
    });

    // 3. FETCH AVAILABLE SHIPPING METHODS
    test("returns available shipping methods after address set", async ({
      request,
    }) => {
      const { token } = await createCartAtAddressState(request);

      const shippingData = await getShippingMethods(request, token);

      expect(shippingData.data).toBeInstanceOf(Array);
      expect(shippingData.data.length).toBeGreaterThan(0);

      const firstMethod = shippingData.data[0];
      expect(firstMethod.id).toBeTruthy();

      expect(
        firstMethod.relationships.shipping_rates.data.length,
      ).toBeGreaterThan(0);
    });

    // 4. SELECT SHIPPING METHOD
    test("successfully select shipping method", async ({ request }) => {
      const { token } = await createCartAtAddressState(request);

      const response = await selectFirstShippingMethod(request, token);

      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.data.attributes.state).toBe("delivery");
    });
  });

  // ==============
  // NEGATIVE TESTS
  // ==============
  test.describe("Negative Test", () => {
    // 5. REJECT MISSING REQUIRED FIELDS
    test(
      "reject missing required address fields",
      { tag: "@regression @negative" },
      async ({ request }) => {
        const id = getRandomFrom(await getPurchasableVariantIds(request));

        const { token } = await createCartWithItem(request, id, 1);

        const incompleteAddress = {
          firstname: "John",
          lastname: "Snow",
          address1: "",
          city: "",
          state_name: "",
          zipcode: "",
          phone: "3014445002",
          country_iso: "US",
        };

        const response = await request.patch("checkout", {
          headers: { "X-Spree-Order-Token": token },
          data: {
            order: {
              email: "test@example.com",
              ship_address_attributes: incompleteAddress,
            },
          },
        });

        expect(response.status()).toBe(422);
      },
    );

    // 6. REJECT CHECKOUT WITH EMPTY CART
    test("reject checkout with empty cart", async ({ request }) => {
      const { token } = await createCart(request);

      const response = await addShippingAddress(request, token);

      expect(response.status()).toBe(422);

      const data = await response.json();

      expect(data.data.attributes.state).toBe("address");
    });
  });
});
