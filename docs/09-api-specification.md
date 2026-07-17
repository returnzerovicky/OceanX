# Ocean: API Specification & Contracts v1.0
## REST Endpoints, Idempotency, and Structured Payloads

This document defines the REST API standards, endpoint contracts, response structures, and error formats for Ocean's backend service. All client-server communication must adhere strictly to these interfaces.

---

## 1. Global API Standards

### A. Naming and Routing Conventions
* All API endpoints are prefixed with `/api/v1`.
* Resource names in routes must be plural (e.g., `/api/v1/products`, `/api/v1/orders`).
* Query parameters use camelCase (e.g., `?sortBy=priceAsc&page=1`).

### B. Standard Response Envelopes
To ensure predictable consumption, every API response must use a consistent wrapper.

#### Success Envelope (HTTP 200/201)
```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2026-07-12T13:30:00Z"
  }
}
```

#### Paginated Success Envelope (HTTP 200)
```json
{
  "success": true,
  "data": [],
  "meta": {
    "pagination": {
      "currentPage": 1,
      "pageSize": 12,
      "totalPages": 5,
      "totalRecords": 60,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "timestamp": "2026-07-12T13:30:00Z"
  }
}
```

#### Error Envelope (HTTP 4xx/5xx)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "The provided shipping address could not be verified.",
    "details": [
      {
        "field": "postalCode",
        "issue": "Postal code does not match state coordinates."
      }
    ]
  },
  "meta": {
    "timestamp": "2026-07-12T13:30:00Z"
  }
}
```

---

## 2. Core Endpoint Specifications

### A. AI Semantic Search
* **Route:** `POST /api/v1/search`
* **Purpose:** Process conversational or keyword search queries with AI classification.
* **Payload:**
```json
{
  "query": "minimalist wooden study desk under 500 dollars",
  "filters": {
    "category": "Furniture"
  },
  "limit": 12,
  "page": 1
}
```
* **Response (HTTP 200):**
```json
{
  "success": true,
  "data": {
    "aiInsights": {
      "interpretedQuery": "Search for Home & Office desks constructed with solid wood priced <= $500",
      "suggestedTags": ["Solid Oak", "Minimalist Workspaces"]
    },
    "results": [
      {
        "id": "prod_wood_desk_01",
        "title": "Minimalist Solid Oak Desk",
        "slug": "minimalist-solid-oak-desk",
        "price": 450.00,
        "vendor": "Marcus Woodworking",
        "rating": 4.9,
        "images": ["https://assets.ocean.com/desk_01.jpg"]
      }
    ]
  },
  "meta": {
    "pagination": {
      "currentPage": 1,
      "pageSize": 12,
      "totalPages": 1,
      "totalRecords": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

### B. Consolidated Checkout & Order Reservation
To prevent over-purchasing and double-spending, Checkout creations must use **Idempotency Keys** and secure **Item Reservations**:

* **Route:** `POST /api/v1/checkout/reserve`
* **Headers:** `Idempotency-Key: idemp_key_uuid_here`
* **Payload:**
```json
{
  "cartId": "cart_buyer_uuid_101",
  "items": [
    {
      "productId": "prod_wood_desk_01",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "100 Alabaster Way",
    "city": "Seattle",
    "state": "WA",
    "postalCode": "98101",
    "country": "US"
  },
  "paymentMethodId": "pm_stripe_token_sample"
}
```
* **Response (HTTP 201):**
```json
{
  "success": true,
  "data": {
    "checkoutSessionId": "ch_sess_9001",
    "totalAmount": 450.00,
    "inventoryReservationExpiry": "2026-07-12T13:45:00-07:00",
    "paymentIntentClientSecret": "pi_stripe_secret_101"
  }
}
```

---

### C. Multi-Vendor Dispute Arbitration
* **Route:** `POST /api/v1/disputes`
* **Payload:**
```json
{
  "orderId": "ord_99012",
  "productId": "prod_wood_desk_01",
  "reason": "ITEM_DAMAGED",
  "description": "The item was received with a deep fracture in the main desktop support rail.",
  "evidenceImages": ["https://assets.ocean.com/dispute_evidence_01.jpg"]
}
```
* **Response (HTTP 201):**
```json
{
  "success": true,
  "data": {
    "disputeId": "disp_8801",
    "status": "PENDING_SELLER_RESPONSE",
    "reviewDeadline": "2026-07-15T13:30:00-07:00"
  }
}
```

---

## 3. Idempotency and Rate-Limiting Rules

* **Idempotency Execution:**
  - Idempotency keys (`Idempotency-Key`) are required on all state-modifying requests (`POST`, `PUT`, `DELETE`) within Checkout, Payouts, and Refund routes.
  - The server caches successful responses associated with active idempotency keys for **24 hours**. Any identical incoming request received within this window instantly returns the cached response, preventing accidental double billing.
* **Rate-Limiting Throttles:**
  - Standard Public Reading (`GET /api/v1/products`): Maximum of **120 requests per minute** per client IP.
  - Conversational AI Search (`POST /api/v1/search`): Maximum of **30 requests per minute** per client IP.
  - Transactional Form Submissions (`POST /api/v1/checkout/*`): Maximum of **10 requests per minute** per user ID / IP.
  - Rate-limit violations return an HTTP **429 Too Many Requests** response with a `Retry-After` header.
