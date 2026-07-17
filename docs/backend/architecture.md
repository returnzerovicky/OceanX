# Ocean Backend Architecture Specification (v4.0)

This document details the high-scale distributed systems architecture for **Ocean**, a global multi-vendor enterprise marketplace designed to support **10 million active users, 10 million products, and 1 million daily orders**.

---

## 1. System Topology & Architectural Patterns

Ocean utilizes a **hybrid modular monolith to microservices pattern**. To prevent premature network overhead, the core services are structured as a clean, modular monolith built with **Clean Architecture** principles, designed to be easily extracted into independent, containerized microservices running on Kubernetes as scale demands.

```
                                 [ Cloudflare CDN & WAF ]
                                            │
                                            ▼
                               [ NGINX Ingress Controller ]
                                            │
                      ┌─────────────────────┴─────────────────────┐
                      ▼                                           ▼
             [ Client SPA Applet ]                         [ API Gateway ]
             (React/Vite Preview)                      (Rate Limiter, Auth, CORS)
                                                                  │
                                                                  ▼
                                                      [ Modular Monolith Node ]
                                                 (Express / TypeScript Service Layer)
                                                                  │
                ┌───────────────────┬─────────────────────────────┼─────────────────────────────┐
                ▼                   ▼                             ▼                             ▼
       [ Transactional DB ]  [ Vector Database ]         [ Distributed Cache ]        [ Event Broker & Queue ]
          (PostgreSQL)         (pgvector / GIN)          (Redis Cluster Lock)         (Emitter / BullMQ Memory)
```

---

## 2. Comprehensive Service Inventory (46 Distinct Modules)

Each module within the Ocean backend represents a domain-driven context. The service boundary limits side-effects, manages domain state, and processes asynchronous event handlers.

### Core Commerce Services
1. **Authentication Service**: Handlers for standard JWT, session registration, refresh tokens, and password hashing mechanisms.
2. **Authorization Service**: Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC) validator engine.
3. **Cart Service**: Transient multi-device cart manager supporting attribute-based item combinations.
4. **Wishlist Service**: Customer saved items tracker with price alert trigger links.
5. **Checkout Service**: Validates cart consistency, computes taxes, discounts, shipping, and compiles order structures.
6. **Order Service**: Transaction-safe state orchestrator mapping order progression (Pending -> Succeeded -> Delivered).
7. **Coupon Service**: Validates spending conditions, usage counts, and expiration dates.
8. **Pricing Service**: Dynamic price computation taking into account active promotions, bulk pricing, and custom seller discounts.
9. **Tax Service**: Multi-region tax computation incorporating localized GST, VAT, and sales tax regulations.
10. **Invoice Service**: PDF invoice generation system with automated legal archiving.

### Catalog & Sellers Services
11. **Product Service**: Core product details, categories, subcategories, collection mappings, and technical spec-sheets.
12. **Seller Service**: Multi-vendor onboarding, compliance verification, and performance evaluation metric calculations.
13. **Commission Service**: Computes platform fees, referral fees, and dynamic cuts per category.
14. **Dispute Service**: Arbitrates buyer-seller conflicts with dedicated escalation workflows.
15. **Escrow Service**: Safely holds funds for the duration of the return window before releasing payouts.
16. **Review Service**: Customer rating compiler with integrated automated fraud-detection checks.
17. **Loyalty Service**: Gamified customer loyalty coins and reward programs engine.
18. **Wallet Service**: Multi-currency ledger for platform-managed digital wallets, credits, and deposits.

### Inventory & Logistics Services
19. **Inventory Service**: High-speed locks preventing over-allocation and stock double-booking during traffic surges.
20. **Warehouse Service**: Coordinates warehouse capabilities, storage locations, and spatial capacities.
21. **Shipment Service**: Tracks parcels, assigns carrier details, and calculates delivery dates.
22. **Courier Service**: Direct third-party API integration (DHL, FedEx, UPS) mapping package collection and tracking updates.
23. **Returns Service**: Orchestrates returns, exchanges, collection windows, and physical inspections.
24. **Refund Service**: Calculates and issues partial, full, or ledger-based refunds.

### Operations & Search Services
25. **Search Service**: High-velocity hybrid search (Lexical + Semantic) with synonym expansions and CTR boosts.
26. **Analytics Service**: Low-latency event streaming recording user activities and clicks.
27. **Notification Service**: Central routing engine managing multichannel updates (Email, SMS, Push Notification).
28. **Admin Service**: High-privilege dashboard aggregator supplying operational controls, logs, and stats.
29. **AI Service**: Server-side wrapper connecting to Gemini API for smart suggestions, semantic vectors, and chatbots.
30. **Support Ticket Service**: Customers issue reporting system with chat history.
31. **Feature Flag Service**: Dynamically toggles experimental components without rebuilding containers.
32. **Audit Service**: Immutable log recorder capturing security events and high-privilege operations.
33. **Media Service**: Handles asset uploads, compression pipelines, and signed URL generation.
34. **Location Service**: Pincode serviceability lookup, warehouse proximity calculators, and shipping routing profiles.
35. **Fraud Detection Service**: Assesses transaction profiles, fake review patterns, and compromised IPs.
36. **Identity Verification Service**: KYC (Know Your Customer) workflow processor for vendors.
37. **Subscription Service**: Manages customer subscriptions (e.g., VIP delivery plans).
38. **Live Chat Service**: WebSockets controller powering real-time chat with sellers and support.
39. **Email Service**: Transports transactional emails via custom SMTP queues.
40. **SMS Service**: Integrates Twilio or similar text relays for active verification codes.
41. **Push Notification Service**: Leverages Firebase Cloud Messaging to dispatch real-time alerts.

---

## 3. Distributed Transactions & Data Flow

To ensure high-throughput execution with maximum reliability, distributed transaction states are managed with ACID compliance at the database level and Eventual Consistency across background worker queues.

### The Checkout & Fulfillment Pipeline
1. **Cart Validation**: Cart Service validates stock in memory via a fast check.
2. **Inventory Reservation**: Inventory Service locks the quantity (decrementing `stock_on_hand` and incrementing `stock_reserved`).
3. **Payment Processing**: Checkout Service calls Payment Service. Payment Service initializes the gateway and captures the transaction.
4. **Order State Update**: On success, Order Service commits the state to the DB and triggers the `OrderPaid` event.
5. **Logistics Allocation**: Warehouse Service selects the optimal warehouse based on proximity and issues a picking manifest.
6. **Delivery Execution**: Shipment Service assigns a tracking number, notifying the Courier Service.
7. **Escrow Hold**: The platform holds payment funds in the Escrow Service.
8. **Confirmation & Release**: Once Shipment is marked `Delivered` plus 14 days (return policy), Escrow Service automatically releases the payout to the Seller's Wallet.

---

## 4. Performance Scaling to 10M Users

To achieve the sub-100ms API response benchmark at 500 requests/sec, Ocean employs:
* **Write-Behind Caching**: High-velocity counters (such as page views and search scores) are buffered in Redis before batch flushing to Postgres.
* **Database Connection Pooling**: pg-pool manages persistent socket connections to Postgres, capping resource overhead.
* **Cursor-Based Pagination**: Large lists are fetched with unique IDs (cursors) to prevent performance degradation associated with large SQL `OFFSET` values.
* **Hybrid Database Model**: Real-time read operations use memory databases and cached index files, keeping Postgres focused on ACID-guaranteed write events.
