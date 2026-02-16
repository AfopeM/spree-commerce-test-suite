import { test, expect } from "@playwright/test";
import { createCart } from "../utils/api.helpers";

test("should create a cart and recieve a token", async ({ request }) => {
  const { token, id } = await createCart(request);

  expect(token).toBeTruthy();
  expect(id).toBeTruthy();
});
