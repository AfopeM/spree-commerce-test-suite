# Test Report

**Project:** Spree Commerce Cart API &nbsp;|&nbsp; **Date:** 2025-02-22 &nbsp;|&nbsp;
**Suites:** Add to Cart · Update Cart · Remove from Cart &nbsp;|&nbsp; **Tags:** `@cart` `@regression` `@sanity` `@negative` `@edge`

---

## Executive Summary

| Total Tests | Passed | Failed | Pass Rate |
| :---------: | :----: | :----: | :-------: |
|     15      |   14   |   1    |    93%    |

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

## Failure Analysis

| ID    | Test Name                   | Suite       | Root Cause                                      | Priority |
| ----- | --------------------------- | ----------- | ----------------------------------------------- | -------- |
| TC-06 | Add item with zero quantity | Add to Cart | API accepts qty=0 instead of rejecting with 400 | 🔴 High  |

---

## Observations & Recommendations

**TC-06 — Zero Quantity on Add:** The API currently accepts a quantity of `0` when adding an item instead of returning HTTP `400`. This violates the expected contract and may allow ghost line items to enter the cart. Recommend adding server-side validation to reject quantities ≤ 0 at the add-item endpoint.

**Coverage highlights:** All three cart operations (add/update/remove) have positive, negative, and where appropriate edge-case coverage. Stock validation, token authentication, and non-existent resource handling are all verified.
