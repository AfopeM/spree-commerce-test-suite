import { APIRequestContext } from "@playwright/test";
import { createCartAtAddressState } from "@utils/api.util";

// ==============================
// SHIPPING ADDRESS FUNCTIONALITY
// ==============================
interface ShippingAddress {
  firstname: string;
  lastname: string;
  address1: string;
  city: string;
  country_iso: string;
}

export const DEFAULT_EMAIL = "test@example.com";

export const DEFAULT_SHIPPING_ADDRESS: ShippingAddress = {
  firstname: "Johnny",
  lastname: "Bravo",
  address1: "20 Cooper Square",
  city: "New York",
  country_iso: "US",
};

export async function addShippingAddress(
  request: APIRequestContext,
  token: string,
  email: string = DEFAULT_EMAIL,
  address: ShippingAddress = DEFAULT_SHIPPING_ADDRESS,
) {
  const response = await request.patch("checkout?include=shipping_address", {
    headers: { "X-Spree-Order-Token": token },
    data: {
      order: {
        email,
        ship_address_attributes: address,
      },
    },
  });
  return response;
}

export async function getShippingMethods(
  request: APIRequestContext,
  token: string,
) {
  const response = await request.get("checkout/shipping_rates", {
    headers: {
      "X-Spree-Order-Token": token,
    },
  });

  if (!response.ok()) {
    throw new Error(`Shipping methods failed: ${await response.text()}`);
  }

  return response.json();
}

export async function selectShippingMethod(
  request: APIRequestContext,
  token: string,
  shipmentId: string,
  shippingRateId: string,
) {
  const response = await request.patch("checkout", {
    headers: { "X-Spree-Order-Token": token },
    data: {
      order: {
        shipments_attributes: [
          {
            id: shipmentId,
            selected_shipping_rate_id: shippingRateId,
          },
        ],
      },
    },
  });

  return response;
}

export async function selectFirstShippingMethod(
  request: APIRequestContext,
  token: string,
) {
  const shippingData = await getShippingMethods(request, token);

  const shipment = shippingData.data[0];
  const shipmentId = shipment.id;
  const shippingRateId = shipment.relationships.shipping_rates.data[0].id;

  return selectShippingMethod(request, token, shipmentId, shippingRateId);
}

// =====================
// PAYMENT FUNCTIONALITY
// =====================
export const TEST_CARDS = {
  SUCCESS: "4111111111111111",
  DECLINED: "4002",
};

const DEFAULT_CARD = {
  // gateway_payment_profile_id: "ABC123",
  cc_type: "visa",
  last_digits: "1111",
  month: "12",
  year: "2028",
  name: "Test User",
  verification_value: "123",
};

export async function getPaymentMethods(
  request: APIRequestContext,
  token: string,
) {
  const response = await request.get("checkout/payment_methods", {
    headers: { "X-Spree-Order-Token": token },
  });

  return response.json();
}

export async function addPayment(
  request: APIRequestContext,
  token: string,
  cardNumber: string = TEST_CARDS.SUCCESS,
) {
  const paymentMethodsData = await getPaymentMethods(request, token);

  const paymentMethod = paymentMethodsData.data.find(
    (method: any) =>
      method.attributes.type.includes("Gateway") ||
      method.attributes.name.toLowerCase().includes("credit card"),
  );

  if (!paymentMethod) {
    throw new Error(
      "Could not find a Credit Card payment method in the API response.",
    );
  }

  const response = await request.patch("checkout", {
    headers: { "X-Spree-Order-Token": token },
    data: {
      order: {
        payments_attributes: [
          {
            payment_method_id: paymentMethod.id,
            source_attributes: {
              number: cardNumber,
              ...DEFAULT_CARD,
            },
          },
        ],
      },
    },
  });

  return response;
}

export async function completeOrder(request: APIRequestContext, token: string) {
  const response = await request.patch("checkout/complete", {
    headers: { "X-Spree-Order-Token": token },
  });

  return response;
}

export async function createCartAtPaymentState(request: APIRequestContext) {
  const { token, cartId } = await createCartAtAddressState(request);
  await selectFirstShippingMethod(request, token);

  await advanceCheckout(request, token);

  return { token, cartId };
}

// ==============================
// STATE FUNCTIONALITY
// ==============================
export async function advanceCheckout(
  request: APIRequestContext,
  token: string,
) {
  return await request.patch("checkout/advance", {
    headers: { "X-Spree-Order-Token": token },
  });
}
