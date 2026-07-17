# Ocean: Core Architecture Diagrams v1.0
## Visual Representation of Pipelines, Lifecycle Sequences, and Topology

This document compiles the visual architecture specs, sequence graphs, and component boundary models for Ocean's engineering suite. It serves as the single source of truth for our technical workflows, providing both high-fidelity text-based ASCII and standard Mermaid.js layout structures.

---

## 1. Overall System Architecture

The overall system architecture details how edge traffic passes through the CDN layer and Ingress Controller into our micro-architected Gateway, routing queries to proper domain-driven handlers.

### Mermaid Diagram
```mermaid
graph TD
    subgraph Edge_and_Ingress [Edge & Traffic Ingress]
        Client([Client Browsers]) -->|HTTPS / Port 443| CDN[Cloudflare CDN Edge]
        CDN -->|WAF & Edge Cache| Nginx[Nginx Ingress / Reverse Proxy]
    end

    subgraph API_Gateway_Layer [API Gateway & Policy Engine]
        Nginx -->|Port 3000| Gateway[Express API Gateway]
        Gateway -->|Verify JWT| SessionStore[(Redis Session Store)]
        Gateway -->|Rate Limiter| Throttler[Rate Limiting Module]
    end

    subgraph Core_Services [Domain Services]
        Gateway -->|Proxy| BuyerService[Buyer App Service]
        Gateway -->|Proxy| SellerService[Seller App Service]
        Gateway -->|Proxy| WarehouseService[Warehouse Service]
        Gateway -->|Proxy| DeliveryService[Delivery & Logistics]
    end

    subgraph Infrastructure_State [Persistence & Third-Party]
        BuyerService & SellerService --> Postgres[(PostgreSQL Core Database)]
        BuyerService & SellerService --> AI[Gemini AI Engine - text-embedding-004 / gemini-2.5]
        BuyerService & SellerService --> Stripe[Stripe Connect Gateway]
    end
```

### ASCII Schematic
```
  [ Client Browsers ]
          │ (HTTPS - Port 443)
          ▼
┌───────────────────┐
│  Cloudflare CDN   │ ◄─── WAF & Static Asset Edge Caching
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   Nginx Ingress   │ ◄─── SSL Termination & Request Proxying
└─────────┬─────────┘
          │ (Forward to Port 3000)
          ▼
┌───────────────────┐
│ Express Gateway   │ ◄─── Token Verification, Route Security, Rate Limiting
└────┬─────┬─────┬──┘
     │     │     │
     │     │     └────────────────────────┐
     ▼     ▼                              ▼
┌────────┐┌────────┐                ┌────────────┐
│ Buyer  ││ Seller │                │ Logistics  │ ◄── Domain-Driven Services
│ Service││ Service│                │ & Delivery │
└───┬────┘└───┬────┘                └─────┬──────┘
    │         │                           │
    └─────────┼───────────────┬───────────┘
              ▼               ▼
     ┌────────────────┐ ┌─────────────┐
     │ PostgreSQL DB  │ │  Redis      │ ◄── Storage & High-Speed Cache Core
     └────────────────┘ └─────────────┘
```

---

## 2. Service Boundaries & Multi-Vendor Layout

Ocean is structured as a multi-tenant, micro-modular monolith. Boundaries between services are enforced at the router and directory levels, communicating via clean service-layer abstractions and database transactions.

### Mermaid Diagram
```mermaid
graph LR
    subgraph Shared_Kernels [Shared Kernel Space]
        DB[(PostgreSQL Schema)]
        Cache[(Redis Cache)]
        Auth[JWT Core Engine]
    end

    subgraph Portals [Domain Boundaries]
        Buyer[Buyer Portal] -->|Reads Catalog / Places Orders| DB
        Seller[Seller Portal] -->|Manages Inventory / KYC Status| DB
        Warehouse[Warehouse Portal] -->|Receives Packs / Holds Stock| DB
        Delivery[Delivery Portal] -->|Dispatches Items / Logs GPS| DB
        Admin[Platform Admin Portal] -->|Audits KYC / Resolves Disputes| DB
    end

    style Shared_Kernels fill:#f4f4f5,stroke:#3f3f46,stroke-width:2px
    style Portals fill:#fcffff,stroke:#0c2b4e,stroke-width:1px
```

---

## 3. End-to-End Authentication Flow

Ocean maintains a stateless OAuth/JWT verification sequence. Session profiles are validated dynamically on the server side using lazy Redis validation to protect client-side environments from unauthorized data leakages.

### Mermaid Diagram
```mermaid
sequenceDiagram
    autonumber
    actor Client as Client App (Vite/React)
    participant GW as Express API Gateway
    participant Redis as Redis Session Cache
    participant DB as PostgreSQL Core

    Client->>GW: POST /api/auth/login (Credentials)
    GW->>DB: Query account & verify password hash
    DB-->>GW: Return User Record (ID, Role, Status)
    GW->>GW: Generate Cryptographic JWT Access Token
    GW->>Redis: Set Token Status: (userId -> active)
    GW-->>Client: Set HttpOnly Cookie (JWT) & Return user profile JSON
    
    Note over Client, GW: Standard Authenticated Request Flow
    Client->>GW: GET /api/seller/listings (Includes HttpOnly Cookie)
    GW->>Redis: Check session token blacklist / status
    Redis-->>GW: Active / Valid
    GW->>DB: Execute Query with Seller Tenant Scope
    DB-->>GW: Return Records
    GW-->>Client: Return 200 OK with Data Payload
```

---

## 4. Checkout & Financial Escrow Sequence

To ensure payment integrity and customer security, financial transactions are executed via Stripe Connect. Funds are locked in escrow for 14 calendar days after delivery verification before settlement is dispatched.

### Mermaid Diagram
```mermaid
sequenceDiagram
    autonumber
    actor Buyer as Buyer Client
    participant API as Express API
    participant Stripe as Stripe Connect
    participant DB as PostgreSQL
    actor Seller as Seller Dashboard

    Buyer->>API: POST /api/checkout/submit (Cart & Address)
    API->>DB: Acquire dynamic inventory row locks (SELECT FOR UPDATE)
    DB-->>API: Row Lock Confirmed (In-Stock)
    API->>Stripe: Create PaymentIntent (Amount, Metadata)
    Stripe-->>API: PaymentIntent client_secret returned
    API-->>Buyer: Return payment intent credentials
    Buyer->>Stripe: Submit payment info directly (Secure Iframe)
    Stripe-->>Buyer: Payment Success / Confirmed
    Stripe->>API: Webhook: payment_intent.succeeded
    API->>DB: Update Order state to 'Paid', Decrement Stock
    API->>DB: Hold funds in Escrow table (State: Frozen)
    API-->>Seller: Trigger pending pack alert
    Note over Buyer, Seller: 14-Day Post-Delivery Escrow Clock
    DB->>API: Carrier updates: Status = Delivered + 14 days elapsed
    API->>Stripe: Transfer funds to Seller connected account (minus 5% fee)
    API->>DB: Update transaction record to 'Settled'
```

---

## 5. Lexical & Vector Hybrid Search Pipeline (RRF)

Our search architecture utilizes Reciprocal Rank Fusion (RRF) to merge exact keyword hits with high-fidelity semantic embeddings generated via the Gemini `text-embedding-004` API.

### Mermaid Diagram
```mermaid
graph TD
    Query[User Query: 'minimalist desk'] --> GW[Express Search Router]
    
    subgraph Keyword_Path [Keyword Matching Path]
        GW -->|String| Lexical[SQL FTS / ILIKE Parser]
        Lexical -->|Fetch Exact Hits| LexicalHits[Lexical Hit List]
    end

    subgraph Semantic_Path [Semantic Neural Path]
        GW -->|Prompt| Gemini[Gemini API - text-embedding-004]
        Gemini -->|768-Dim Dense Vector| Similarity[pgvector Cosine Similarity Match]
        Similarity -->|Fetch Conceptual Hits| VectorHits[Vector Hit List]
    end

    LexicalHits --> RRF[Reciprocal Rank Fusion RRF Algorithm]
    VectorHits --> RRF
    
    RRF -->|Calculate Unified RRF Scores| Sorter[RRF Sorter & Filter Solver]
    Sorter -->|Remove Out of Stock / Moderated| FinalList[Ranked Product Result Set]
    FinalList -->|JSON Response| User[Client Viewport]
```

---

## 6. Decoupled Asynchronous Event Bus Flow

To maximize system throughput and isolate critical systems, order events are dispatched asynchronously. Domain subscribers react independently to finalize logistics, update analytical funnels, and trigger emails.

### Mermaid Diagram
```mermaid
graph TD
    Checkout[Stripe Payment Succeeded] -->|API Controller| EventBus[Event Bus / Message Distributor]
    
    subgraph Domain_Subscribers [Asynchronous Consumer Nodes]
        EventBus -->|Topic: order.completed| Inventory[Inventory Service]
        EventBus -->|Topic: order.completed| Courier[Courier & Label Service]
        EventBus -->|Topic: order.completed| Email[Notification Engine]
        EventBus -->|Topic: order.completed| BI[Analytics & BI Store]
        EventBus -->|Topic: order.completed| Recs[Personalization Engine]
    end

    Inventory -->|Task| Decrement[Decrement Stock Counts]
    Courier -->|Task| Label[Generate Prepaid Shipping PDF]
    Email -->|Task| SendEmail[Compile & Send HTML Receipt]
    BI -->|Task| LogFunnel[Record Conversion Event]
    Recs -->|Task| Recompute[Update Customer Category Affinity]
```

---

## 7. Server-Side AI Request Lifecycle

AI requests are strictly kept on the server to protect secret keys. The `gemini-2.5` model generates smart insights, summaries, and categorizations behind an Express proxy layer.

### Mermaid Diagram
```mermaid
sequenceDiagram
    autonumber
    actor Client as React Client UI
    participant Server as Express Server (server.ts)
    participant Gemini as Gemini Developer API (SDK)

    Client->>Server: GET /api/ai/product-insights?id=102
    Server->>Server: Verify Active User Auth & Rate Limits
    Note over Server: Server-Side API Key Security
    Server->>Server: Retrieve Gemini Developer API Key from process.env
    Server->>Server: Query product reviews & descriptions from PostgreSQL
    Server->>Gemini: Call GoogleGenAI SDK (Model: gemini-2.5, System Prompt + Reviews)
    Gemini-->>Server: Return Structured Markdown / JSON Output
    Server->>Server: Format & Sanitise response payload
    Server-->>Client: Return 200 OK with Clean Insight Data (No keys leaked)
```

---

## 8. Content-Based Recommendation Pipeline

Recommendations are driven by mapping product features (materials, colors, categories, price points) against real-time user engagement behaviors (browses, cart additions, and historical orders) to compile highly personalized suggestions.

### Mermaid Diagram
```mermaid
graph TD
    User[(User Engagement Vector)] --> Model[Cosine Similarity Engine]
    Catalog[(Product Metadata Vectors)] --> Model
    
    Model -->|Rank Raw Similarity Scores| Filters[Exclusion & Quality Rules]
    
    subgraph Business_Rules [Quality Gates]
        Filters -->|Filter Out| OutOfStock[Exclude Out-of-Stock SKUs]
        Filters -->|Filter Out| Moderated[Exclude Moderated Listings]
        Filters -->|Filter Out| Duplicates[Exclude Already Purchased Items]
    end

    Filters -->|Final Sort| Output[Curated Suggestion List]
    Output --> PDP[PDP 'Similar Products' Row]
    Output --> Home[Homepage 'Trending Collections']
```

---

## 9. Production CI/CD & Deployment Pipeline

Every merge into `main` executes automatic linters, TypeScript compiler tests, and unit testing runs. Upon success, an isolated container is built and deployed directly to Cloud Run behind Nginx.

### Mermaid Diagram
```mermaid
graph LR
    Push[Git Push to main] --> Lint[Linter Run: npm run lint]
    Lint --> Compile[TypeScript Compiler: npm run build]
    Compile --> Test[Unit & Integration Tests: npm run test]
    Test -->|Pass| Docker[Docker Container Build]
    Docker -->|Publish| Artifacts[Cloud Artifact Registry]
    Artifacts -->|Deploy| CloudRun[Cloud Run Container]
    CloudRun -->|Ingress Config| Nginx[Nginx Edge Ingress]
```

---

## 10. Database Entity Relationship Diagram (ERD)

The persistent database schema is designed for tight referential integrity, strong primary/foreign key cascading, and operational trace logs to map out marketplace participants.

### Mermaid Diagram
```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UNIQUE
        string password_hash
        string role
        string status
        timestamp created_at
    }
    SELLERS {
        uuid id PK
        uuid user_id FK
        string brand_name
        string tax_id
        string kyc_status
        timestamp registered_at
    }
    PRODUCTS {
        uuid id PK
        uuid seller_id FK
        string title
        string description
        string category
        decimal price
        integer stock_quantity
        string status
        timestamp created_at
    }
    ORDERS {
        uuid id PK
        uuid buyer_id FK
        decimal total_amount
        string status
        timestamp created_at
    }
    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        integer quantity
        decimal unit_price
    }

    USERS ||--o| SELLERS : "has_profile"
    SELLERS ||--o{ PRODUCTS : "owns"
    USERS ||--o{ ORDERS : "places"
    ORDERS ||--|{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "included_in"
```
