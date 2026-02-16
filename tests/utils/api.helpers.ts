import { APIRequestContext } from "@playwright/test";

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
