import { APIRequestContext } from "@playwright/test";
import { ProductListResponse } from "../types/api.types";

let cachedVariantIds: string[] | null = null;
let cachedOutOfStockVariantIds: string[] | null = null;

export async function listOfProducts(request: APIRequestContext) {
  const response = await request.get("products", {
    headers: {
      "Content-Type": "application/vnd.api+json",
    },
  });

  const responseData: ProductListResponse = await response.json();

  return responseData;
}

export async function getPurchasableVariantIds(request: APIRequestContext) {
  if (cachedVariantIds) return cachedVariantIds;

  const response = await listOfProducts(request);
  const ids = response.data
    .filter((res) => res.attributes.purchasable === true)
    .map((res) => res.relationships.default_variant.data.id);

  if (ids.length === 0)
    throw new Error("No purchasable products found in catalog.");

  cachedVariantIds = ids;
  return ids;
}

export async function getOutOfStockVariantIds(request: APIRequestContext) {
  if (cachedOutOfStockVariantIds) return cachedOutOfStockVariantIds;

  const response = await listOfProducts(request);
  const ids = response.data
    .filter((res) => res.attributes.in_stock === false) // Standardized to false
    .map((res) => res.relationships.default_variant.data.id);

  if (ids.length === 0)
    throw new Error("No out-of-stock products found in catalog.");

  cachedOutOfStockVariantIds = ids;
  return ids;
}

export function getRandomFrom(ids: string[]): string {
  return ids[Math.floor(Math.random() * ids.length)];
}

export function getDifferentIdFrom(ids: string[], excludedId: string): string {
  const filtered = ids.filter((id) => id !== excludedId);
  if (filtered.length === 0) {
    throw new Error(
      `Cannot pick a different ID; only one ID available: ${excludedId}`,
    );
  }
  return getRandomFrom(filtered);
}
