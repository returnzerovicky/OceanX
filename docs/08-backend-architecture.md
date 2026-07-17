# Ocean: Backend & Integration Architecture v1.0
## Server Configuration, SDK Guardrails & API Gateway Integration

Ocean operates a robust full-stack container environment leveraging an integrated Express + Vite routing engine. This document establishes the backend architecture, environment protection guidelines, lazy initialization guardrails, and third-party integration pipelines required to run a secure, scalable marketplace.

---

## 1. Unified Express + Vite Integration

In development, the server dynamically proxies client-side requests through Vite's hot-reload middleware. In production, the server operates as a compiled standalone CommonJS bundle (`dist/server.cjs`) serving the static production assets while hosting our JSON API.

```
                         Unified Container Entrypoint
                               (Port 3000)
                                    │
                                    ├── /api/*  ──► Express API Router
                                    │               (Disputes, Sellers, Orders, Checkout)
                                    │
                                    └── *       ──► Static Asset Engine
                                                    - Development: Vite Dev Middleware
                                                    - Production: express.static('dist')
```

### Essential Server Ground-Rules
* **Port Mapping:** The container reverse-proxy binds strictly to **Port 3000** on host `0.0.0.0`. Modifying or overriding this port configuration will cause ingress failure.
* **API Order of Precedence:** In `server.ts`, all JSON API routes (`/api/*`) must be registered **BEFORE** mounting static or Vite asset-serving middlewares. If static routing is declared first, custom API endpoints may be swallowed and return a 404.

---

## 2. API Key Security & Env Protection

We maintain a strict zero-trust boundary for API keys and database credentials:

1. **Client-Facing Guardrails:** No sensitive keys (Stripe Secrets, Firebase Admins, Google OAuth secrets) may be prefixed with `VITE_`.
2. **Server-Side Proxy Pattern:** Client applications never call third-party services directly. Every operational request (creating a Stripe intent, sending a notification via Twilio, executing an AI prompt) must be proxied through a secure Express router endpoint `/api/*`.
3. **Environment Documentation:** Every secret utilized by the server must be documented with an empty placeholder inside `.env.example` in the root workspace directory. Real keys are kept exclusively in production container environment configurations.

---

## 3. Lazy SDK Initialization Strategy

SDKs that load and validate credentials immediately at module load time (such as Stripe or Firebase Admin) will crash the container at boot if the respective environmental variables are missing or temporarily invalid. This causes an indefinite container loop.

Ocean mandates **Lazy Client Initialization** inside all service modules. Clients are constructed only upon the first functional call, with protective error fallback states:

### Compliant Service Template (e.g., Stripe Gateway):
```typescript
import Stripe from 'stripe';

let stripeInstance: Stripe | null = null;

/**
 * Resolves the Stripe client on first use.
 * Prevents container boot crashes when STRIPE_SECRET_KEY is absent.
 */
export function getStripeClient(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        '[Ocean Backend] CRITICAL: STRIPE_SECRET_KEY environment variable is missing. Payment gateway is disabled.'
      );
    }
    stripeInstance = new Stripe(key, {
      apiVersion: '2023-10-16',
    });
  }
  return stripeInstance;
}
```

---

## 4. Multi-Tenant Marketplace Integration Matrix

Ocean is designed to manage complex multi-vendor transactions seamlessly. Our integration matrix connects specialized services to process payments, track packages, and resolve disputes:

```
                          Ocean Integration Matrix
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  Stripe Connect  │◄─────►│    Ocean Core    │◄─────►│   Google Maps    │
│  (Payment/split) │       │   Express API    │       │  (Address Autocomplete)
└──────────────────┘       └────────┬─────────┘       └──────────────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │    Gemini AI     │
                           │ (Semantic Search)│
                           └──────────────────┘
```

* **Stripe Connect (Multi-Vendor Split Payments):**
  - Handles the customer checkout payment.
  - Automatically calculates and deducts platform commission fees.
  - Distributes the remaining funds directly to individual seller merchant accounts.
* **Google Maps Platform (Address Autocomplete & Route Optimization):**
  - Generates verified shipping address suggestions within the checkout screen.
  - Automatically calculates real-time shipping costs based on precise geographic coordinates.
* **Gemini AI Core (Semantic Analysis & Curation):**
  - Powers natural-language shopping assistants and semantic search.
  - Automatically summarizes product reviews to highlight critical pros and cons.
