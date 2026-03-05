import { APIRequestContext } from "@playwright/test";

interface ShippingAddress {
  firstname: string;
  lastname: string;
  address1: string;
  city: string;
  phone: string;
  zipcode: string;
  state_name: string;
  country_iso: string;
}

export const DEFAULT_SHIPPING_ADDRESS: ShippingAddress = {
  firstname: "Johnny",
  lastname: "Bravo",
  address1: "20 Cooper Square",
  city: "New York",
  phone: "9175550177",
  zipcode: "10004",
  state_name: "NY",
  country_iso: "US",
};

export async function addShippingAddress(
  request: APIRequestContext,
  token: string,
  email: string = "test@example.com",
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
