# Ocean Event-Driven & Queue Architecture Specification (v4.0)

This document details the high-scale asynchronous messaging framework for Ocean. The architecture uses an **Event Broker** to handle state changes and a **Distributed Task Queue** to run heavy background jobs, ensuring high reliability and system stability.

---

## 1. Event Broker Architecture & System Schema

Events coordinate decoupled domains, ensuring the main thread completes client HTTP requests immediately while downstream tasks run in the background.

```
       [ Core Commerce Service ] (Producer)
                  │
                  ▼ (Emits Event)
         [ Event Broker Bus ]
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
  [ Consumer A ]      [ Consumer B ]
 (Transactional)     (Data Warehouse)
```

Each transaction-critical event must be processed with an **idempotency key** to prevent duplicate execution.

### Production Event Catalog

All events inherit a standard wrapper format:
```json
{
  "eventId": "evt_9128a10b9c",
  "eventType": "OrderPaid",
  "eventVersion": "1.0",
  "producer": "OrderService",
  "timestamp": "2026-07-13T09:50:00Z",
  "idempotencyKey": "idem_order_88291a92_paid",
  "data": {}
}
```

#### Complete Event Directory
1. **`UserRegistered`**: Dispatched by `AuthService` when a new profile is saved. Downstream consumers send welcome emails and allocate initial loyalty credits.
2. **`OrderCreated`**: Emitted by `OrderService` upon order checkout. Downstream consumers reserve stock and calculate tax.
3. **`OrderPaid`**: Dispatched by `PaymentService` once the payment gateway returns a success confirmation. This triggers picking manifests, invoice generation, and escrow allocation.
4. **`OrderCancelled`**: Emitted by `OrderService` when an order is cancelled, initiating inventory release, shipping cancellations, and refunds.
5. **`OrderDelivered`**: Dispatched by `ShipmentService` upon delivery confirmation, initiating the return window countdown and eventual seller payment release.
6. **`InventoryReserved`**: Emitted by `InventoryService` when stock is locked during checkout, protecting against stock double-booking.
7. **`InventoryReleased`**: Triggered when checkouts expire or orders are cancelled to restore active stock counts.
8. **`ShipmentCreated`**: Triggered when a picking manifest is confirmed, requesting tracking allocation from carriers.
9. **`ShipmentDelivered`**: Confirms parcel arrival to trigger the delivery receipt state.
10. **`RefundRequested`**: Triggered when a customer returns an item, initiating payment gateway return operations.
11. **`RefundCompleted`**: Emitted upon successful bank transfer, updating order status and sending receipts.
12. **`SellerPaid`**: Dispatched once escrow funds are released and transferred to the seller's balance.
13. **`WalletUpdated`**: Emitted when balance ledger entries change, ensuring accurate user ledger state.
14. **`ReviewCreated`**: Triggers real-time review sentiment checks and updates the product's overall rating.
15. **`ReviewDeleted`**: Removes the review from rating aggregates and search indices.
16. **`NotificationCreated`**: General dispatch requests sent to user devices (Email, SMS, Push Notification).
17. **`CouponApplied`**: Records discount usage counts to prevent promotion abuse.
18. **`AIReviewGenerated`**: Generated when the Gemini model finishes analyzing and summarizing review sentiment.
19. **`SearchIndexed`**: Emitted when product details are updated, pushing changes to the hybrid search index.
20. **`ImageUploaded`**: Dispatched when raw images are uploaded, triggering compression pipelines.

---

## 2. Distributed Task Queues

Task Queues handle heavy background processes that do not block client threads.

```
                    [ Message Queue (BullMQ) ]
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
 [ Email Worker ]        [ Media Worker ]        [ Analytics Worker ]
```

### Queue Directory & Task Definitions
* **`Emails`**: Sends transactional and promotional emails.
* **`SMS`**: Transports verification codes (OTPs) and critical delivery alerts.
* **`Push Notifications`**: Handles mobile app marketing and push messaging.
* **`Recommendations`**: Updates collaborative filtering structures and dynamic caches in the background.
* **`AI`**: Runs heavy Gemini prompt completions, summaries, and embedding generations.
* **`Invoices`**: Generates and archives PDF invoices.
* **`Reports`**: Generates bulk GMV and seller performance reports.
* **`Inventory Sync`**: Reconciles warehouse stock levels with the online store inventory twice daily.
* **`Order Sync`**: Reconciles order records with third-party logistics databases.
* **`Payment Retry`**: Retries failed webhook updates and handles temporary gateway timeouts.
* **`Fraud Detection`**: Checks transaction history for automated fraud flags in the background.
* **`Image Compression`**: Resizes and compresses catalog images to WebP format.
* **`Video Processing`**: Processes and transcodes product demonstration videos.
* **`Search Indexing`**: Rebuilds fuzzy search indexes and calculates trending product ranks.
* **`Analytics`**: Batches and writes streaming event logs to the analytics database.
* **`Cron Jobs`**: Runs automated system maintenance tasks:
  * **Daily Jobs**: Expires old coupon codes, cleans expired JWT sessions, and flags inactive carts.
  * **Weekly Jobs**: Computes seller performance metrics, response rates, and payout statements.
  * **Monthly Jobs**: Generates platform revenue statements and runs GDPR-compliant cold-storage archiving.

---

## 3. Resilience, DLQ & Retry Policy

Asynchronous tasks can fail due to database lockups, external API outages, or network hiccups. Ocean ensures reliability through structured retry policies:

* **Exponential Backoff**: Failed queue tasks are retried with an exponential delay (e.g., $retry\_delay = initial\_delay \times 2^{retry\_count}$).
* **Dead Letter Queue (DLQ)**: If a critical task fails after 5 retries, it is relocated to a Dead Letter Queue (DLQ) to prevent blocking the queue.
* **Manual Re-drive Workflows**: System administrators can inspect, debug, and manually re-drive failed DLQ events directly from the Admin Panel.
* **Idempotent Consumers**: Downstream consumers check if an event ID has already been processed in the database before running, preventing duplicate changes (e.g., double-charging cards or double-crediting wallets).
