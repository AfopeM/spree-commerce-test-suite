import { test, expect } from "@playwright/test";

test("should create a cart and recieve a token", async ({ request }) => {
  const response = await request.post("cart", {
    headers: {
      "Content-Type": "application/vnd.api+json",
    },
  });
  expect(response.ok()).toBe(true);

  const responseData = await response.json();
  const token = responseData.data.attributes.token;

  expect(token).toBeTruthy();
  expect(typeof token).toBe("string");
  expect(token.length).toBeGreaterThan(10);
});
