# Test Report# Test Report

**Project:** Spree Commerce Cart & Checkout API &nbsp;|&nbsp; **Date:** 2025-02-22 &nbsp;|&nbsp;
**Suites:** Add to Cart · Update Cart · Remove from Cart · Checkout Shipping · Checkout Payment · E2E Order Completion &nbsp;|&nbsp;
**Tags:** `@regression` `@negative` `@edge` `@smoke` `@e2e`

---

## Executive Summary

| Total Tests | Passed | Failed | Blocked | Pass Rate |
| :---------: | :----: | :----: | :-----: | :-------: |
|     27      |   24   |   2    |    1    |    92%    |

> **Note:** TC-27 is counted separately as **Blocked** — steps 1–5 pass; step 6 (order completion) cannot be executed via headless REST due to a Stripe PaymentIntent client-side redirect requirement. It is marked `test.fixme` in the suite and excluded from the pass/fail rate.

---

## Test Results

### Add to Cart

| ID    | Test Name                       | Category | Expected Result                    | Status  |
| ----- | ------------------------------- | -------- | ---------------------------------- | ------- |
| TC-01 | Initialize new cart             | Sanity   | 201 Created                        | ✅ PASS |
| TC-02 | Add single item to cart         | Positive | 200 OK, item_count=1               | ✅ PASS |
| TC-03 | Add multiple units of same item | Positive | 200 OK, item_count=3               | ✅ PASS |
| TC-04 | Add multiple unique products    | Positive | 200 OK, item_count=3, 2 line_items | ✅ PASS |
| TC-05 | Add non-existent product        | Negative | 404 Not Found                      | ✅ PASS |
| TC-06 | Add item with zero quantity     | Negative | 400 Bad Request                    | ❌ FAIL |
| TC-07 | Add out-of-stock product        | Negative | 422 Unprocessable                  | ✅ PASS |

### Update Cart

| ID    | Test Name                      | Category | Expected Result      | Status  |
| ----- | ------------------------------ | -------- | -------------------- | ------- |
| TC-08 | Update item quantity           | Positive | 200 OK, item_count=5 | ✅ PASS |
| TC-09 | Update non-existent line item  | Negative | 422 Unprocessable    | ✅ PASS |
| TC-10 | Update quantity to zero        | Edge     | 422 Unprocessable    | ✅ PASS |
| TC-11 | Set excessively large quantity | Edge     | 422 Unprocessable    | ✅ PASS |

### Remove from Cart

| ID    | Test Name                      | Category | Expected Result      | Status  |
| ----- | ------------------------------ | -------- | -------------------- | ------- |
| TC-12 | Remove existing line item      | Positive | 200 OK, item_count=0 | ✅ PASS |
| TC-13 | Remove with fake line item ID  | Negative | 404 Not Found        | ✅ PASS |
| TC-14 | Remove line item not in cart   | Negative | 404 Not Found        | ✅ PASS |
| TC-15 | Remove with invalid cart token | Negative | 404 Not Found        | ✅ PASS |

### Checkout – Shipping Address

| ID    | Test Name                                               | Category | Expected Result                      | Status  |
| ----- | ------------------------------------------------------- | -------- | ------------------------------------ | ------- |
| TC-16 | Verify order saves shipping address and email           | Positive | 200 OK, state=address, email matches | ✅ PASS |
| TC-17 | Advance order from 'address' state to 'payment' state   | Positive | 200 OK, state=payment                | ✅ PASS |
| TC-18 | Accept custom shipping address                          | Positive | 200 OK, address fields persisted     | ✅ PASS |
| TC-19 | Returns available shipping methods after address is set | Positive | shipping_rates.length > 0            | ✅ PASS |
| TC-20 | Advance order from 'delivery' state to 'payment' state  | Positive | 200 OK, state=payment                | ✅ PASS |
| TC-21 | Reject missing required address fields                  | Negative | 422 Unprocessable                    | ✅ PASS |
| TC-22 | Reject checkout with empty cart                         | Negative | 422 Unprocessable, state=address     | ❌ FAIL |
| TC-23 | Reject shipping to unsupported country                  | Negative | 422 Unprocessable, error defined     | ✅ PASS |

### Checkout – Payment

| ID    | Test Name                               | Category | Expected Result                    | Status  |
| ----- | --------------------------------------- | -------- | ---------------------------------- | ------- |
| TC-24 | Accept valid payment details            | Positive | 200 OK, state=payment, balance_due | ✅ PASS |
| TC-25 | Reject invalid credit card              | Negative | 422 Unprocessable on advance       | ✅ PASS |
| TC-26 | Reject payment without address/shipping | Negative | state remains=address on advance   | ✅ PASS |

### E2E – Order Completion

| ID    | Test Name                                 | Category | Expected Result                            | Status     |
| ----- | ----------------------------------------- | -------- | ------------------------------------------ | ---------- |
| TC-27 | Complete full checkout flow cart to order | E2E      | 200 OK, state=complete, payment_state=paid | 🚧 BLOCKED |

**Steps verified before block (TC-27):**

| Step | Action                      | Result                                           |
| :--: | --------------------------- | ------------------------------------------------ |
|  1   | Create cart                 | ✅ Cart token issued                             |
|  2   | Add product to cart (qty=2) | ✅ 200 OK, item added                            |
|  3   | Add shipping address        | ✅ 200 OK, state=address                         |
|  4   | Select shipping method      | ✅ 200 OK, state=delivery                        |
|  5   | Advance and add payment     | ✅ 200 OK, state=payment, payment record created |
|  6   | Complete order              | 🚧 Blocked — see Blocked Test Analysis           |

---

## Failure Analysis

| ID    | Test Name                       | Suite               | Root Cause                                              | Priority |
| ----- | ------------------------------- | ------------------- | ------------------------------------------------------- | -------- |
| TC-06 | Add item with zero quantity     | Add to Cart         | API accepts qty=0 instead of rejecting with 400         | 🔴 High  |
| TC-22 | Reject checkout with empty cart | Checkout – Shipping | API does not return 422 for empty cart checkout attempt | 🔴 High  |

---

## Blocked Test Analysis

| ID    | Test Name                                 | Suite                  | Blocker                                                                                                                                                                                                                   | Resolution Path |
| ----- | ----------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| TC-27 | Complete full checkout flow cart to order | E2E – Order Completion | Stripe `PaymentIntent` requires a client-side `return_url` confirmation loop that cannot be completed through headless REST API calls; configure a mock/test gateway in the Spree demo environment (e.g., bogus gateway). |
|  |

---

## Observations & Recommendations

**TC-06 — Zero Quantity on Add:** API accepts quantity `0` instead of returning `400`. This breaks the contract and may create ghost cart items. Add server-side validation to reject quantities ≤ 0.

**TC-22 — Empty Cart Checkout:** API allows checkout with an empty cart instead of returning `422 (state=address)`. This leaves the order in an invalid state. Add a guard ensuring at least one line item before checkout.

**TC-25 — Declined Card Handling:** The advance endpoint returns `422` for declined test cards, confirming payment errors are surfaced as business logic errors, not server errors.

**TC-26 — Payment State Enforcement:** Attempting payment while the order is still in `address` correctly keeps the state at `address`. This confirms server-side checkout step gating.

**TC-27 — E2E Stripe Blocker:** Checkout steps 1–5 pass end-to-end. The blocker is Stripe’s `PaymentIntent` redirect (`return_url`), which cannot complete via headless REST calls. This is an environment limitation, not a bug. Use a mock/test gateway (e.g., bogus gateway) to enable full E2E testing.

**Coverage Highlights:** Cart tests include positive, negative, and edge cases. Checkout tests validate the full `address → delivery → payment` state machine, including transitions, validations, and payment logic. E2E tests confirm full flow up to the payment gateway boundary.
