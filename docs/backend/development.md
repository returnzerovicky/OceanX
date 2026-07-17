# Ocean Developer Handbook: Architecture, Clean Code & Patterns (v4.0)

This guide documents the software engineering patterns, coding standards, and directory structures required to write clean, modular, and maintainable code for Ocean.

---

## 1. Modular Monolith Directory Structure

The codebase is organized into domain-driven folders to keep modules clean, decoupled, and easy to extract into independent microservices as the platform scales.

```
/src/
├── client/                     # Frontend client React/Vite source code
├── server/                     # Backend API source code
│   ├── config/                 # Environment configs and cloud initializers
│   ├── db/                     # DB client, schemas, migration scripts
│   ├── events/                 # Event emitters and pub-sub configurations
│   ├── middleware/             # Express middlewares (security, auth, rate limiters)
│   ├── queue/                  # Background job definitions and task workers
│   ├── repositories/           # Data Access Layer (PostgreSQL query logic)
│   ├── routes/                 # REST Route controllers mapped by version
│   ├── services/               # Core Business Logic Layer (services)
│   ├── gemini.ts               # Google Gemini SDK interfaces
│   └── db.ts                   # In-memory memory-store configurations
├── types.ts                    # Global TypeScript interfaces
└── App.tsx                     # Main React Client component
```

---

## 2. Core Software Design Patterns

Ocean strictly decouples core business logic from databases and delivery mechanisms using three primary architectural layers:

```
[ HTTP Route Handler ] ──> [ Service Layer ] ──> [ Repository Layer ] ──> [ Database ]
```

### 1. Repository Pattern (Data Access Layer)
Repositories encapsulate database query logic, protecting core business logic from database schema changes.

```ts
import { db } from '../db';
import { Product } from '../../types';

export class ProductRepository {
  public findById(id: string): Product | null {
    // Isolated database query logic
    const state = db.getState();
    const product = state.products.find(p => p.id === id);
    return product || null;
  }

  public updateStock(id: string, newStock: number): void {
    const state = db.getState();
    const product = state.products.find(p => p.id === id);
    if (product) {
      product.stock_qty = newStock;
      db.save(); // Persist changes
    }
  }
}
```

### 2. Service Layer Pattern (Domain Logic Layer)
Services coordinate multiple repositories, calculate business rules, trigger background events, and contain the core transactional logic.

```ts
import { ProductRepository } from '../repositories/product.repository';
import { OrderRepository } from '../repositories/order.repository';
import { Order, OrderItem } from '../../types';

export class OrderCheckoutService {
  private productRepo = new ProductRepository();
  private orderRepo = new OrderRepository();

  public checkout(userId: string, items: OrderItem[]): Order {
    // 1. Verify inventory stock
    for (const item of items) {
      const product = this.productRepo.findById(item.productId);
      if (!product || (product.stock_qty || 0) < item.quantity) {
        throw new Error(`STOCK_INSUFFICIENT: ${item.title}`);
      }
    }

    // 2. Decrement inventory
    for (const item of items) {
      const product = this.productRepo.findById(item.productId)!;
      this.productRepo.updateStock(item.productId, (product.stock_qty || 0) - item.quantity);
    }

    // 3. Create the order record
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = this.orderRepo.create(userId, items, total);

    return order;
  }
}
```

### 3. API Versioning Guide
To prevent breaking changes for mobile clients, web clients, and third-party integrations, Ocean enforces strict API versioning using URL prefixes (e.g., `/api/v1/`).

* **Adding Fields**: Backward-compatible changes (like adding non-required fields to responses) can be deployed directly to the active version.
* **Breaking Changes**: Structural modifications (like renaming fields, changing payloads, or removing endpoints) require incrementing the version prefix (e.g., creating `/api/v2/`).

---

## 3. Testing Guide

Ocean implements a comprehensive three-tier testing framework to ensure system reliability:

### 1. Unit Testing
* **Focus**: Tests individual functions, mathematical calculations, and utility helpers in isolation using mocked dependencies.
* **Standard**: Aim for $> 90\%$ test coverage on core services like checkout, taxes, and coupon applications.

### 2. Integration Testing
* **Focus**: Tests API endpoint routing, request validation, authentication checks, database interactions, and event processing.
* **Standard**: Ensure complete integration tests are run on critical pipelines (such as `/api/v1/auth/login` and `/api/v1/orders/checkout`) before deploying to production.

### 3. Load Testing
* **Focus**: Simulates high-traffic scenarios (e.g., 500 requests per second) using tools like **k6** or **Locust** to verify system stability, database connection limits, and redis cache performance under load.
