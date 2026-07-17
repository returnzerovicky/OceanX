# Ocean: Event Driven Architecture v1.0
## Event-Driven Systems, Message Schemas, and State Synced Flows

This document details Ocean's event-driven architecture, defining our core event lifecycle, message structures, and processing pipelines to support real-time user experiences and reliable backend execution.

---

## 1. Core Event-Driven Topology

To maximize scalability and prevent database lockups, Ocean uses an **Event-Driven Architecture (EDA)**. Core transactional steps are decoupled into independent handlers that execute asynchronously.

```
       [ Client Checkout Submitted ]
                     │
                     ▼
       ┌───────────────────────────┐
       │     Express Checkout API  │
       │ (Initiates Stripe payment)│
       └─────────────┬─────────────┘
                     │
                     ▼
       ┌───────────────────────────┐
       │    Publish Event Bus      │
       │     "Order_Completed"     │
       └─────────────┬─────────────┘
                     │
       ┌─────────────┼─────────────┬─────────────┬─────────────┐
       ▼             ▼             ▼             ▼             ▼
┌─────────────┐┌─────────────┐┌─────────────┐┌─────────────┐┌─────────────┐
│  Inventory  ││  Logistics  ││Notification││  Analytics  ││Personalization
│  Service    ││  Service    ││   Service   ││   Service   ││   Service   │
│(Deduct stock││(Create label││(Send email) ││(Log funnel) ││(Update bias)│
└─────────────┘└─────────────┘└─────────────┘└─────────────┘└─────────────┘
```

---

## 2. Event Message Standards & Payloads

Every event published to the system must use a consistent, versioned schema to ensure reliable consumer parsing.

### Core Message Format (e.g., `Order_Completed` Payload)
```json
{
  "eventId": "evt_order_comp_88012",
  "eventType": "Order_Completed",
  "version": "1.0",
  "timestamp": "2026-07-12T13:40:00Z",
  "context": {
    "userId": "usr_buyer_902",
    "sessionId": "sess_88012"
  },
  "data": {
    "orderId": "ord_99012",
    "totalAmount": 450.00,
    "shippingAddress": {
      "street": "100 Alabaster Way",
      "city": "Seattle",
      "state": "WA",
      "postalCode": "98101",
      "country": "US"
    },
    "items": [
      {
        "sku": "sku_oak_desk_01",
        "sellerId": "sell_marcus_wood",
        "quantity": 1,
        "price": 450.00
      }
    ]
  }
}
```

---

## 3. Asynchronous Consumer Workflows

Upon receiving an `Order_Completed` event, independent services execute their respective tasks asynchronously:

### A. Inventory Service
- Parses the items array and decrements the current stock count (`stock_quantity`) in the database.
- If inventory drops below predefined safety thresholds, it triggers a warning alert to the seller.

### B. Logistics & Fulfillment Service
- Automatically generates a pending shipping invoice.
- Notifies the seller's portal with packaging guidelines and a pre-paid carrier shipping label.

### C. Notification Service
- Parses the buyer's email and dynamically compiles a receipt using Ocean's transactional template.
- Dispatches the email immediately to confirm order placement.

### D. Analytics & Personalization Services
- Records the purchase transaction to track conversions and update category preference models.
- Updates search weights, category affinities, and similar product recommendation queues for the active buyer profile.
