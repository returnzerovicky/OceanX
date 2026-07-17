# Ocean: System Architecture Specification v1.0
## Infrastructure, Routing, and Integration Topology

This document details Ocean's production infrastructure, networking, and micro-component runtime topology. Our system-level design supports high horizontal scalability, low latencies, and high data consistency across five operational portals.

---

## 1. High-Level System Architecture

Ocean leverages a container-native cloud layout designed to scale automatically under transaction spikes. Edge-cached content delivery networks route traffic through reverse proxies to a secure application gateway layer, which coordinates core microservices.

```
                                  [ Client Browers ]
                                          │
                                          ▼
                             ┌─────────────────────────┐
                             │    Cloudflare CDN Edge  │
                             │ (WAF, SSL, Edge Caching)│
                             └────────────┬────────────┘
                                          │
                                          ▼
                             ┌─────────────────────────┐
                             │       Nginx Ingress     │
                             │   (Reverse Proxy, SSL)  │
                             └────────────┬────────────┘
                                          │
                                          ▼
                             ┌─────────────────────────┐
                             │  Express API Gateway    │
                             │ (Session Auth, Throttles)│
                             └──────┬───────────┬──────┘
                                    │           │
           ┌────────────────────────┘           └────────────────────────┐
           ▼                                                             ▼
┌──────────────────────┐                                      ┌──────────────────────┐
│    Buyer Service     │                                      │    Seller Service    │
│  - Catalog search    │                                      │  - Inventory SKU     │
│  - Shopping cart     │                                      │  - Orders queues     │
│  - Reviews analyst   │                                      │  - Bank settlements  │
└──────────┬───────────┘                                      └──────────┬───────────┘
           │                                                             │
           └────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │    Redis Cache Layer    │
                       │  (Cart, Session, Hooks) │
                       └────────────┬────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │   PostgreSQL Database   │
                       │ (Schema-tight Tables)   │
                       └────────────┬────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
        ┌───────────────────┐               ┌───────────────────┐
        │   Object Storage  │               │   Gemini AI Core  │
        │ (S3 Media Assets) │               │(Pro/Flash Services)│
        └───────────────────┘               └───────────────────┘
```

---

## 2. Platform Core Services Breakdown

### A. The Nginx Reverse Proxy
- Intercepts incoming connections on Port `3000`.
- Terminates SSL/TLS encryption.
- Directs requests starting with `/api/v1` to the core Express instance.
- Directs static web requests (`/`, `/assets/*`) to optimized public disk caches or Vite's dev server depending on environment parameters.

### B. The API Gateway (Express Routing Layer)
- **Token Validation Middleware:** Validates user identity via cryptographic session signatures.
- **Dynamic Rate Limiter:** Protects downstream databases from malicious spikes.
- **Cors Security Guard:** Sanitizes Origin headers, preventing cross-site query exploits.

### C. Transient Caching Engine (Redis)
- **Cart Buffer:** Caches guest shopping baskets, avoiding heavy disk writes for abandoned carts.
- **Session Cache:** Stores active JSON Web Tokens (JWT) status, bypassing Postgres reads on every API call.
- **Idempotency Register:** Tracks transaction UUIDs during checkouts to ensure exactly-once payment processing.

### D. Persistent Storage Engine (PostgreSQL)
- Serves as the platform's single source of truth for identity, inventory, and settlements.
- Structured with tight schemas, relational foreign key cascading, and operational execution indexes to minimize Time-to-First-Byte (TTFB).

### E. AI Inference Engine (Gemini Pro/Flash Integration)
- Processes conversational inputs and summarizes product reviews on the server side using the `@google/genai` SDK.
- Accessed via rate-limited, secured server routes, ensuring that the model's instructions and system API keys remain completely confidential.
