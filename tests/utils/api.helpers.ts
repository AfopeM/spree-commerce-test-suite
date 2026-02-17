import { APIRequestContext } from "@playwright/test";

export async function getCart(request: APIRequestContext, token: string) {
  const response = await request.get("cart", {
    headers: {
      "Content-Type": "application/vnd.api+json",
      "X-Spree-Order-Token": token,
    },
  });

  return response.json();
}

export async function createCart(request: APIRequestContext) {
  const response = await request.post("cart", {
    headers: {
      "Content-Type": "application/vnd.api+json",
    },
  });
  const responseData = await response.json();

  const token = responseData.data.attributes.token;
  const id = responseData.data.id;

  if (typeof token !== "string" || token.length < 10) {
    throw new Error("Invalid cart token");
  }
  if (typeof id !== "string") {
    throw new Error("Invalid cart id");
  }

  return { token, id };
}

export async function addItemToCart(
  request: APIRequestContext,
  token: string,
  variantId: string,
  quantity: number = 1,
) {
  const response = await request.post("cart/add_item", {
    headers: {
      "Content-Type": "application/vnd.api+json",
      "X-Spree-Order-Token": token,
    },
    data: {
      variant_id: variantId,
      quantity,
    },
  });

  return response;
}

export async function updateLineItem(
  request: APIRequestContext,
  token: string,
  lineItemId: string,
  quantity: number,
) {
  const response = await request.delete("cart/set_quantity", {
    headers: {
      "Content-Type": "application/vnd.api+json",
      "X-Spree-Order-Token": token,
    },
    data: {
      line_item_id: lineItemId,
      quantity,
    },
  });

  return response;
}
