import { APIRequestContext } from "@playwright/test";
import { ProductListResponse } from "../../src/types/api.types";

export async function listOfProducts(request: APIRequestContext) {
  const response = await request.get("products", {
    headers: {
      "Content-Type": "application/vnd.api+json",
    },
  });

  const responseData: ProductListResponse = await response.json();

  return responseData;
}
