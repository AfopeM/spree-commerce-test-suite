# Test Report

**Project:** Spree Commerce Cart API &nbsp;|&nbsp; **Date:** 2025-02-22 &nbsp;|&nbsp;
**Suites:** Add to Cart · Update Cart · Remove from Cart &nbsp;|&nbsp; **Tags:** `@regression` `@smoke` `@negative` `@edge`

---

## Executive Summary

| Total Tests | Passed | Failed | Pass Rate |
| :---------: | :----: | :----: | :-------: |
|     26      |   24   |   2    |    92%    |

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

---

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

## Failure Analysis

| ID    | Test Name                       | Suite               | Root Cause                                              | Priority |
| ----- | ------------------------------- | ------------------- | ------------------------------------------------------- | -------- |
| TC-06 | Add item with zero quantity     | Add to Cart         | API accepts qty=0 instead of rejecting with 400         | 🔴 High  |
| TC-22 | Reject checkout with empty cart | Checkout – Shipping | API does not return 422 for empty cart checkout attempt | 🔴 High  |

---

## Observations & Recommendations

**TC-06 — Zero Quantity on Add:** The API currently accepts a quantity of `0` when adding an item instead of returning HTTP `400`. This violates the expected contract and may allow ghost line items to enter the cart. Recommend adding server-side validation to reject quantities ≤ 0 at the add-item endpoint.

**TC-22 — Empty Cart Checkout:** The API does not reject an attempt to begin checkout with an empty cart as expected. A 422 with state=address should be returned, but the API responds differently. Recommend adding a guard on the checkout endpoint to validate that the cart contains at least one line item before allowing state progression.

**TC-26 — State enforcement on payment advance:** The test confirms that attempting to advance to payment while the order is still in the `address` state correctly keeps the order at `address`. This validates that checkout step-gating is enforced server-side, not just in the UI.

**TC-25 — Declined card handling:** The advance endpoint returns `422` when a declined test card is used, confirming that payment processor responses are correctly surfaced as business logic errors rather than masked as server errors.

**Coverage highlights:** All three cart operations (add/update/remove) have positive, negative, and where appropriate edge-case coverage. Stock validation, token authentication, and non-existent resource handling are all verified.
