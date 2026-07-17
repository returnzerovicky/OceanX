# Ocean Global Infrastructure & Platform Engineering Specification (v4.0)

This document provides complete production-grade specifications for the core platform infrastructure powering Ocean at scale. It describes the API gateway routing, multi-tier distributed caching, media pipelines, notification platform, hybrid search architectures, AI model deployment platforms, data engineering streaming pipes, and global multi-region deployments.

---

## 1. Global Runtime Infrastructure Topology

Below is the complete architectural layout from client requests down to micro-services, caching networks, monitoring systems, and third-party API integrations:

```
                                    [ Global Users ]
                                           │
                                           ▼ (Geo DNS Routing)
                           [ Cloudflare Anycast CDN & WAF ]
                                           │
                                           ▼ (Mutual TLS / HTTP/2)
                             [ Ingress Load Balancer ]
                                           │
                                           ▼ (Forwarding)
                             [ API Gateway (Kong / Envoy) ]
                             (Edge Auth, Rate Limit, Circuit Breakers, Correlation IDs)
                                           │
                   ┌───────────────────────┼───────────────────────┐
                   ▼ (mTLS Route)          ▼ (mTLS Route)          ▼ (mTLS Route)
           [ Core API Service ]    [ Search API Service ]   [ AI API Service ]
          (Clean Modular Monolith) (pgvector / Lexical)     (Gemini API Router)
                   │                       │                       │
         ┌─────────┴─────────┐             │                       │
         ▼                   ▼             ▼                       ▼
   [ DB Pool (pg-pool) ] [ Redis Cache ] [ Search Queue ] [ Prompt Registry Cache ]
         │                   │             │                       │
         ▼                   ▼             ▼                       ▼
   [ PostgreSQL DB ]   [ Redis Cluster ] [ Downstream Indexer ] [ Embedding Storage ]
   (Primary Master)    (Sessions, Locks)   (Fuzzy Indexes)         (pgvector DB)
         │                                 │
         ├─────────────────────────────────┼──────────────────────────────┐
         ▼ (Write Ahead Log / CDC)         ▼ (Push to Storage)            ▼ (Push Logs)
   [ ETL Streaming Pipes ]           [ Cloud Storage Bucket ]       [ OpenTelemetry Trace ]
   (Kafka / Vector Event Hub)        (Optimized WebP, Invoices)     (Prometheus / Grafana)
```

---

## 2. API Gateway Engine

The API Gateway is the single point of entry for all clients, decoupling external consumers from the internal service mesh. It operates as an **Envoy-based Edge Proxy** executing the following requirements:

### Edge Routing & Versioning
All incoming client requests are normalized, versioned, and routed to downstream services based on URL routing rules:
* `/api/v1/*` → Routed to the production Version 1 API services.
* `/api/v2/*` → Routed to target canary/V2 services.
* **Header-based overrides** allow developers to route to specified staging containers using the `X-Target-Service-Tag` header for testing.

### Edge Authentication
The Gateway intercepts all requests targeting private routes. It decrypts and validates incoming JWT tokens at the gateway level using a high-performance custom proxy plugin, preventing unauthorized requests from ever touching downstream applications:
* It parses the `Authorization: Bearer <JWT>` header.
* Validates token signature, expiration (`exp`), and audience claims against keys cached in local gateway memory.
* On validation success, it injects custom downstream headers (e.g., `X-User-Id`, `X-User-Roles`, `X-User-Permissions`) before forwarding the payload to core services.

### Global Rate Limiting
To prevent brute-force attacks and abuse, the API Gateway integrates with a **Redis Cluster** to enforce rate limits per API key, authenticated user, or client IP address:
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 60

{
  "status": 429,
  "error": "TOO_MANY_REQUESTS",
  "message": "Global rate limit exceeded. Please wait 60 seconds."
}
```

### Circuit Breakers
To prevent cascading failures across modular boundaries, the gateway implements **Circuit Breaking** (via Hystrix-like patterns):
* **Closed State**: Normal operations. If downstream error rates (5xx responses) remain $< 5\%$, the circuit remains closed.
* **Open State**: If downstream error rates cross $> 50\%$ over a rolling 10-second window, the circuit breaks. All subsequent requests are rejected immediately at the gateway with an HTTP 503 Service Unavailable, bypassing the failing backend to allow it to recover.
* **Half-Open State**: After a 30-second cooldown, the gateway permits a limited volume of check traffic (5% of normal load). If they succeed without errors, the circuit transitions back to Closed; otherwise, it returns to Open.

### Correlation IDs
To enable tracing across distributed network boundaries, the API Gateway injects a unique **Correlation ID** (`X-Correlation-Id`) into the header of every incoming request. Downstream services must capture this ID and append it to all logs, traces, and outgoing events, allowing engineers to trace a single transaction's lifecycle across any service.

---

## 3. Distributed Multi-Tier Caching Layer

Ocean achieves sub-100ms API response latency under heavy loads (500 req/sec) using an optimized multi-tier caching strategy powered by a highly available **Redis Cluster**.

```
             ┌──────────────┐
             │ Client Query │
             └──────┬───────┘
                    ▼
          ┌──────────────────┐
          │  L1 Memory Cache │ (Fast Local App Node Memory)
          └────────┬─────────┘
                   ├─────────────── Cache Hit (Sub-1ms) ──> Return
                   ▼ Cache Miss
          ┌──────────────────┐
          │ Redis Cluster L2 │ (Shared High-Speed Cache Nodes)
          └────────┬─────────┘
                   ├─────────────── Cache Hit (Sub-5ms) ──> Return
                   ▼ Cache Miss
          ┌──────────────────┐
          │  PostgreSQL DB   │ (Transactional Layer)
          └──────────────────┘
```

### Specialized Cache Topologies
* **Session Cache**: Stores user active states, active permissions, and cart contents with an TTL of 24 hours. This eliminates redundant database lookups on every page interaction.
* **Product Cache**: Caches highly accessed product detail objects (`prod_*`) with a TTL of 1 hour. This utilizes serialized JSON objects for rapid retrieval.
* **Category Cache**: Stores the entire category taxonomy list. Since taxonomy structure changes infrequently, this cache has a TTL of 24 hours and is warmed continuously.
* **Homepage Cache**: Stores pre-compiled homepage bento-layouts, carousel links, and brand lists with a TTL of 15 minutes.
* **Search Cache**: Caches top 1000 search result queries based on their query string hashes.
* **Recommendation Cache**: Caches computed collaborative filtering products with a TTL of 12 hours.
* **Inventory Cache**: High-velocity product stock levels are tracked using Redis string variables, preventing over-selling during major flash sales.

### Distributed Locking (Redlock Algorithm)
To prevent race conditions during concurrent checkouts, Ocean uses the **Redlock** algorithm to acquire distributed locks across multi-master Redis nodes:
1. When a checkout starts, the service requests a lock for the specific product ID: `SET resource_lock:prod_x1 <random_value> NX PX 5000` (expires in 5000ms).
2. The lock is only acquired if a majority of Redis masters successfully write the key.
3. Once the transaction commits, the service releases the lock using a safe Lua script that verifies the unique `<random_value>` to prevent a service from accidentally releasing a lock acquired by another thread.

### Cache Invalidation & Warming Strategies
* **Cache-Aside Pattern**: Downstream applications query the cache first. If a cache miss occurs, the data is fetched from Postgres, written to the cache, and returned.
* **Write-Through / Eviction**: When a seller updates product attributes, a database trigger or event listener immediately purges the corresponding cache key: `DEL cache:product:prod_x1`.
* **Proactive Cache Warming**: During off-peak hours (e.g., 3:00 AM), cron jobs identify top-selling products and query-terms, pre-populating them into Redis to eliminate cache-miss latency spikes for daytime shoppers.

---

## 4. Cloud CDN & Media Pipeline

A modern marketplace serves millions of product photos, videos, and billing documents. Exposing file-servers directly to users is slow and expensive. Ocean routes all binary static requests through a geographically distributed **Cloudflare CDN Layer** backed by **Secure Object Storage**.

```
 [ Seller Image Upload ] ──> [ Media API Service ] ──> [ Cloud Storage Bucket ]
                                                              │
                                                              ▼ (Async Processing Queue)
                                                    [ Image Processor Pipeline ]
                                                    (Resize, Compress to WebP / AVIF)
                                                              │
                                                              ▼
                                                     [ Cloudflare CDN ]
                                                              │
                                                              ▼
                                                        [ End Users ]
```

### Secured Binary Upload Pipeline
1. Sellers upload high-resolution product media through the Seller Portal.
2. The `Media Service` authenticates the request, scans the file binary for viruses, and saves the raw asset to an private intake Cloud Storage bucket (e.g. Google Cloud Storage).
3. Uploading initiates an asynchronous job in the **Image Processing Pipeline**.

### Automated Compression, Sizing & Formats
Downstream worker nodes process the raw image to generate web-optimized versions:
* **Formats**: Generates **WebP** and **AVIF** files, reducing size by up to 70% compared to raw PNGs.
* **Dimensions**: Generates multiple resolution footprints:
  * Thumbnail: `150x150`
  * Grid Card: `400x400`
  * Zoom Details: `1200x1200`
* **CDN Caching**: Optimized images are pushed to the public delivery bucket, and cached globally across CDN Edge points with immutable cache headers: `Cache-Control: public, max-age=31536000, immutable`.

### Signed URL Access
Sensitive assets, such as merchant verification files (KYC), billing invoices, and warehouse manifests, are stored in encrypted private buckets. Downstream microservices generate secure **Signed URLs** with a short expiry window (e.g., 15 minutes) for authorized users, preventing public indexing and unauthorized access.

---

## 5. Enterprise Notification Platform

Rather than using basic, disconnected notifications, Ocean implements an integrated **Omnichannel Notification Platform**. This engine routes, localizes, and guarantees delivery of transactions across multiple channels.

```
                  ┌──────────────────────────────────────────────┐
                  │          Platform Core Trigger Events        │
                  └──────────────────────┬───────────────────────┘
                                         ▼ (Queued Task)
                    ┌──────────────────────────────────────────┐
                    │      Notification Routing Core Engine    │
                    └────────────────────┬─────────────────────┘
                                         │
        ┌────────────────┬───────────────┼───────────────┬────────────────┐
        ▼                ▼               ▼               ▼                ▼
   [ Email API ]    [ SMS API ]    [ Push API ]    [ WhatsApp ]     [ Webhooks ]
   (SMTP / SES)     (Twilio SMS)   (FCM Push)      (Meta Cloud)     (Integrations)
```

### Channel Routing & Fallback Strategies
* **High Priority (SMS / WhatsApp)**: Verification codes, fraud alerts, and order confirmations. If WhatsApp delivery fails within 10 seconds (no double-tick receipt), the platform automatically falls back to standard SMS routing.
* **Medium Priority (Push / In-App)**: Delivery tracking milestones, order status updates, and support messages.
* **Low Priority (Email)**: Invoices, monthly ledger summaries, and marketing promotions.

### WhatsApp Template Registries & Integration
The platform integrates directly with the Meta Cloud API, routing notifications through verified business profiles:
* It maintains pre-approved message templates (e.g., `order_delivery_update`).
* Implements direct variables (e.g., `{{1}}` for customer name, `{{2}}` for carrier tracking code).

### Push Notifications Integration
* Integrates with **Firebase Cloud Messaging (FCM)** for both iOS and Android platforms.
* Caches user-device tokens in the Postgres `sessions` table.

### Webhook Dispatcher
* Allows business customers and sellers to register HTTPS endpoints for webhook events.
* Outgoing webhooks are cryptographically signed using a shared secret (`X-Ocean-Signature: t=126892182,v1=sha256_hash_value`), allowing downstream servers to verify payload authenticity.

---

## 6. Real-Time Search & Indexing Platform

At Ocean's scale (10 million products), basic SQL `LIKE` queries degrade system performance. The platform implements a high-performance **Hybrid Search Engine** (combining pg_trgm lexical searches with semantic vector lookups).

```
                 ┌──────────────────────────────────────────────┐
                 │          Product Created / Updated           │
                 └──────────────────────┬───────────────────────┘
                                        ▼ (Asynchronous Event)
                         ┌─────────────────────────────┐
                         │      Search Queue Node      │
                         └──────────────┬──────────────┘
                                        ▼
                         ┌─────────────────────────────┐
                         │   Embedding Generator (AI)  │ (Generate vectors via Gemini)
                         └──────────────┬──────────────┘
                                        ▼
                         ┌─────────────────────────────┐
                         │     Search Indexer Node     │
                         └──────────────┬──────────────┘
                                        ├──────────────────────────────┐
                                        ▼                              ▼
                           [ PostgreSQL pg_trgm Index ]       [ pgvector Embeddings ]
                           (High-speed Lexical Text)          (Semantic Query Vectors)
```

### Complete Indexing Lifecycle
1. **Trigger**: A seller modifies a product listing (title, features, specifications).
2. **Queueing**: The Product Service dispatches a `SearchIndexed` event, landing in the **Search Queue**.
3. **Embedding Generation**: The Search Indexer fetches the updated product data, compiles the searchable text metadata string, and requests a 768-dimension vector embedding from the Gemini model.
4. **Storage & Indexing**: The indexer commits the raw text to the PostgreSQL GIN indexes and the computed vectors to the `pgvector` store.
5. **Ranking**: The ranking engine combines lexical matches and semantic similarities using Reciprocal Rank Fusion (RRF) for highly accurate search results.

### Query Parsing & Search Analytics
* **Synonym Expansion**: Uses a dictionary file mapping equivalents (e.g., "phone" $\rightarrow$ "mobile", "cellphone") to dynamically expand queries.
* **Spell Correction**: Integrates Levenshtein Distance algorithms. If no matches are found, it auto-suggests corrections ("Did you mean...?").
* **Search Analytics Logging**: Searches are logged to analyze click-through rates (CTR) and search patterns. This data is used to optimize the search experience and drive catalog expansion.

---

## 7. Operational AI Infrastructure Platform

Ocean isolates AI operations into a dedicated **AI Platform Service** to prevent high-latency model calls from blocking core transactional routes.

```
 [ Core Service Route ] ──> [ AI Gateway Router ] ──> [ Local Prompt Cache ]
                                     │
                                     ▼ (Cache Miss)
                           [ Safety Filter Pipe ]
                                     │
                                     ▼ (Clean Payload)
                           [ Gemini API Endpoint ]
```

### Prompt Registry & Versioning
All system prompts are stored and versioned inside the database, preventing hardcoded prompts in codebase files:
* Prompts are version-locked (e.g., `prompt_review_analyzer:v2.1`).
* Administrators can run A/B tests on prompts to compare performance, accuracy, and latency across models.

### AI Gateway Router & Fallbacks
The AI platform abstracts all upstream model interactions behind a unified service gateway:
* It checks request configurations and routes to the optimal model (e.g., routing simple autocomplete requests to faster, lightweight models like Gemini 2.5 Flash, and routing complex summaries to larger reasoning models).
* If an external API encounters a timeout or limit error, the Gateway automatically switches traffic to fallback endpoints, maintaining uninterrupted user operations.

### Security Filters & Cost Tracking
* **Safety Filters**: Intercepts outgoing queries to sanitize PII and shields incoming responses to block unauthorized content before it is served to users.
* **Cost Tracking & Budget Capping**: Tracks exact input/output tokens used per query, logging metrics directly to `ai_logs` to monitor operational budgets.

---

## 8. Data Engineering & Streaming Pipelines

A production marketplace separates transactional operations from analytical workloads to prevent analytical queries from slowing down checkout databases.

```
 [ User Activity / Clicks ] ──> [ High-Throughput Stream ] ──> [ Raw Analytics Storage ]
                                                                       │
                                                                       ▼ (Asynchronous ETL)
                                                             [ Data Warehouse ]
                                                             (Analytics, BI, ML Training)
```

### Real-Time Clickstream Pipeline
1. Client applications transmit clickstream interactions, add-to-carts, and page views to the `/api/v1/analytics/log-event` endpoint.
2. The endpoint immediately buffers these events into high-throughput storage streams to prevent application bottlenecks.
3. Downstream consumer engines process and write these events into an analytical data store (e.g., Google BigQuery or PostgreSQL partitioned analytical engines).

### ETL & Machine Learning Training Pipelines
* **ETL (Extract, Transform, Load)**: Cron jobs run during off-peak hours to aggregate transactional data, process metrics, and write them to the Data Warehouse.
* **Feature Store Integration**: Aggregated customer interactions (such as search histories and category affinity scores) are transformed into structured features, which recommendation engines use to personalize product recommendations.

---

## 9. Multi-Region High-Availability Deployment

To support 10 million global users, Ocean is designed for multi-region deployment across geographically isolated data centers.

```
                                  [ Global User Query ]
                                            │
                                            ▼ (Anycast Geo DNS)
                             ┌──────────────────────────────┐
                             ▼ (Region 1 - US West)         ▼ (Region 2 - EU Central)
                      [ Active App Pods ]            [ Active App Pods ]
                             │                              │
                             ▼                              ▼
                      [ DB Read Replica ]            [ DB Read Replica ]
                             │                              │
                             └──────────────┬───────────────┘
                                            ▼
                                   [ DB Primary Master ]
```

### Geo-Routing & Regional Rules
* **Geo-DNS Routing**: Requests are automatically routed to the closest server region, reducing network latency.
* **Regional Inventory**: Warehouses are mapped to local regions, ensuring buyers only see serviceable products with accurate shipping estimates.
* **Regional Pricing & Taxes**: Checkout pipelines dynamically apply local region currencies and tax rules (such as US State Taxes or EU VAT).

### Failover Strategy & Active-Passive Setups
* Core application nodes operate in an **Active-Active** configuration across regions.
* The relational database is deployed in an **Active-Passive** model. Database writes target the primary write-master node in the main region, which streams transaction logs asynchronously to read replicas in other regions.
* If a primary database region encounters a catastrophic failure, an automated SRE failover routine promotes the closest read replica to write-master, updating DNS records to ensure continuous platform operations.
