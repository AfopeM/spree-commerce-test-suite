# Spree Commerce API Test Automation

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.40-green)](https://playwright.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18%20%7C%2020-brightgreen)](https://nodejs.org/)

**Risk-based API testing suite** for the Spree Commerce e-commerce platform, demonstrating test prioritization, architectural patterns, and CI/CD integration. With a focus on **Core Revenue-critical flows** checkout and cart operations, the features that drive **80% of business value.**

---

## Quick Stats

|                     |                                              |
| ------------------- | -------------------------------------------- |
| **Automated Tests** | 27 across cart, checkout, and e2e operations |
| **Prioritization**  | 90% effort on revenue-critical paths         |
| **Execution Time**  | ~25 seconds (parallel)                       |
| **Tech Stack**      | TypeScript · Playwright · Postman            |

---

## Testing Strategy: Risk-Based Prioritization

Test coverage is driven by **business impact.** On e-commerce platforms, cart and checkout failures translate directly to lost revenue, so that's where the suite is focused first.

| Priority        | Feature           | Tests  | Business Impact           | Rationale                    |
| --------------- | ----------------- | :----: | ------------------------- | ---------------------------- |
| **🔴 CRITICAL** | Checkout E2E Flow |   1    | Direct revenue generation | If broken, $0 revenue        |
| **🟠 HIGH**     | Cart Operations   |   15   | Purchase prerequisite     | Can't checkout without cart  |
| **🟠 HIGH**     | Checkout Steps    |   11   | Revenue-critical path     | Address → Shipping → Payment |
| **Total**       | -                 | **27** | -                         | -                            |

---

## Test Coverage

| Suite                           | Positive | Negative | Edge | Total  |
| ------------------------------- | :------: | :------: | :--: | :----: |
| **E2E** (`tests/e2e`)           |    1     |    -     |  -   | **1**  |
| **Cart** (`tests/cart`)         |    6     |    7     |  2   | **15** |
| **Checkout** (`tests/checkout`) |    6     |    5     |  —   | **11** |
| **Total**                       |    13    |    12    |  2   | **27** |

**Out Of Scope:** Product Catalog, Wishlists, and Admin APIs

---

## Key Design Decisions

**Dynamic product IDs:** Purchasable variant IDs are fetched at runtime rather than hardcoded. This prevents flaky tests in environments where inventory changes frequently, which is the norm in e-commerce.

**Isolated cart tokens per test:** Every test creates its own cart token, ensuring zero state bleed between tests even under full parallel execution.

**Explicit error contract validation:** The suite distinguishes between `404 Not Found` (resource doesn't exist) and `422 Unprocessable Entity` (business logic failure, e.g. out-of-stock). This boundary matters — front-end error handling depends on getting the right status code to show the right message to the user.

**State factory helpers:** Utilities like `createCartAtAddressState` and `createCartAtPaymentState` encapsulate multi-step setup so individual tests remain focused on the behaviour under test rather than repetitive scaffolding.

---

## Project Architecture

```
spree-commerce-tests/
├── .github/workflows/                      # CI/CD pipeline (GitHub Actions)
│   └── test.yml
├── src/
│   ├── api/                                # API abstraction layer
│   │   ├── cart.controller.ts
│   │   ├── checkout.controller.ts
│   │   └── product.controller.ts
│   ├── utils/                              # Reusable utilities
│   │   └── api.util.ts
│   └── types/                              # TypeScript interfaces/types
│       └── spree.types.ts
├── tests/                                  # Test specifications
│   ├── cart/                               # Cart CRUD operations (15 tests)
│   │   ├── cart-add.spec.ts
│   │   ├── cart-update.spec.ts
│   │   └── cart-remove.spec.ts
│   └── checkout/                           # Checkout flow (11 tests)
│       ├── checkout-shipping.spec.ts
│       └── checkout-payment.spec.ts
├── docs/                                   # Documentation
│   └── test-report.md
├── playwright.config.ts                    # Test configuration
├── package.json                            # Dependencies
└── README.md                               # This file
```

---

## Running the Tests

### Prerequisites

- Node.js 18+ (LTS)
- npm

### Installation

```bash
# Clone repository
git clone https://github.com/afopem/spree-commerce-test-suite.git
cd spree-commerce-tests-suite

# Install dependencies
npm install

```

### Run Tests

```bash
# Run all tests
npm run test

# Run specific test suite
npm run test:cart
npm run test:checkout
npm run test:e2e

npm run test:smoke
npm run test:negative
npm run test:regression

# Run with UI (headed mode)
npm run test:headed

# View HTML report
npm run report
```

---

## Technology Stack

| Layer              | Technology               | Version                              |
| ------------------ | ------------------------ | ------------------------------------ |
| **Test Framework** | Playwright               | API testing, parallel execution      |
| **Language**       | TypeScript               | Type-safe test code                  |
| **API Client**     | Postman                  | Manual API exploration and debugging |
| **CI/CD**          | GitHub Actions           | Automated test execution             |
| **API**            | Spree Commerce           | Demo e-commerce platform             |
| **Reporting**      | Playwright HTML Reporter | Test result visualization            |

---

## Acknowledgments

- [Spree Commerce](https://spreecommerce.org/) for providing a robust demo API
- [Playwright](https://playwright.dev/) for excellent documentation and tooling
