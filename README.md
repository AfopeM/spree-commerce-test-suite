# Spree Commerce API Test Automation

**Risk-based API testing suite** for the Spree Commerce e-commerce platform, demonstrating test prioritization, architectural patterns, and CI/CD integration.

**Core Focus:** Revenue-critical checkout flow and cart operations, the features that drive **80% of business value.**

---

## Quick Stats

|                     |                                    |
| ------------------- | ---------------------------------- |
| **Automated Tests** | 15 across cart operations          |
| **Execution Time**  | ~30 seconds (parallel)             |
| **Tech Stack**      | TypeScript · Playwright · Insomnia |

---

## Testing Strategy: Risk-Based Prioritization

Test coverage is driven by **business impact.** On e-commerce platforms, cart and checkout failures translate directly to lost revenue, so that's where the suite is focused first.

| Feature Area        | Business Impact                                  | Priority  | Coverage Rationale                                              |
| ------------------- | ------------------------------------------------ | :-------: | --------------------------------------------------------------- |
| **Checkout Flow**   | Direct revenue (any failure stops a purchase)    |  🔴 High  | Full purchase path: address → shipping → payment → confirmation |
| **Cart Operations** | Blocks checkout (broken cart causes abandonment) | 🟡 Medium | Add, update, and remove operations including edge cases         |

**Out Of Scope:** Product Catalog, Wishlists, and Admin APIs

---

## Test Coverage

| Suite                           | Positive | Negative | Edge |     Total     |
| ------------------------------- | :------: | :------: | :--: | :-----------: |
| **Cart** (`tests/cart`)         |    5     |    7     |  2   |    **14**     |
| **Checkout** (`tests/checkout`) |    —     |    —     |  —   | _In Progress_ |
| **Total**                       |    5     |    7     |  2   |    **14**     |

---

## Key Design Decisions

**Dynamic product IDs:** Purchasable variant IDs are fetched at runtime rather than hardcoded. This prevents flaky tests in environments where inventory changes frequently, which is the norm in e-commerce.

**Isolated cart tokens per test:** Every test creates its own cart token, ensuring zero state bleed between tests even under full parallel execution.

**Explicit error contract validation:** The suite distinguishes between `404 Not Found` (resource doesn't exist) and `422 Unprocessable Entity` (business logic failure, e.g. out-of-stock). This boundary matters — front-end error handling depends on getting the right status code to show the right message to the user.

---

## Project Architecture

```
spree-commerce-tests/
├── src/
│   ├── api/                                # API abstraction layer
│   │   ├── cart.controller.ts
│   │   └── product.controller.ts
│   ├── utils/                              # Reusable utilities
│   │   └── product.util.ts
│   └── types/                              # TypeScript interfaces/types
│       └── spree.types.ts
│
├── tests/                                  # Test specifications
│   └── cart/                               # Cart CRUD operations (15 tests)
│       ├── cart-add.spec.ts
│       ├── cart-update.spec.ts
│       └── cart-remove.spec.ts
│
├── playwright.config.ts                    # Test configuration
├── package.json                            # Dependencies
├── test-report.md                           # Documentation of results
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

npm run test:positive
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
| **API Client**     | Insomnia                 | Manual API exploration and debugging |
| **CI/CD**          | GitHub Actions           | Automated test execution             |
| **API**            | Spree Commerce           | Demo e-commerce platform             |
| **Reporting**      | Playwright HTML Reporter | Test result visualization            |

---

## Acknowledgments

- [Spree Commerce](https://spreecommerce.org/) for providing a robust demo API
- [Playwright](https://playwright.dev/) for excellent documentation and tooling
