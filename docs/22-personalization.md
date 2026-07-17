# Ocean: Personalization Engine Specification v1.0
## User Identity Modeling, Category Preferences, and Dynamic Personalization

This document outlines Ocean's dynamic personalization pipeline, defining how we model user behavior, tailor content, and deliver customized feeds.

---

## 1. Unified Personalization Lifecycle

The Personalization Engine continuously monitors client events, maps these interactions to category and price profiles, and dynamically updates the user's home feed and search suggestions.

```
           [ Client Events ] ──► (Product Viewed, Search, Purchase)
                   │
                   ▼
       ┌──────────────────────┐
       │   Profile Resolver   │
       │  (Extracts metadata) │
       └──────────┬───────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │  Dynamic User Model  │
       │(Affinity, Price Band)│
       └──────────┬───────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │    Content Filter    │
       │ (Score & rank feed)  │
       └──────────┬───────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │   Personalized Feed  │
       │(Curated, High Trust) │
       └──────────────────────┘
```

---

## 2. Dynamic User Modeling

Every registered buyer has an associated user model that tracks behavioral interactions and updates preferences across several dimensions:

### A. Category Affinities
- Calculated by tracking product views, cart additions, and purchases.
- **Formula:**
  $$Affinity(c) = w_{view} V_c + w_{cart} C_c + w_{purchase} P_c$$
  Where weights are configured as:
  - $w_{view}$ = `1` (low intent)
  - $w_{cart}$ = `5` (medium intent)
  - $w_{purchase}$ = `20` (high intent)

### B. Price Sensitivity Bands
- Maps the pricing distribution of products a user interacts with to categorize them into budget brackets:
  - **Band A (Luxury):** High price affinity, prioritizes premium materials and brands.
  - **Band B (Standard):** Median market pricing affinity.
  - **Band C (Utility):** Value-focused, highly sensitive to shipping costs and active coupons.

### C. Geographic and Environmental Context
- Adjusts delivery estimates, shipping fees, and active collections based on the user's shipping postal code and local time.

---

## 3. Personalized Feed Construction

During homepage loads, the Personalization Engine structures a custom product feed:

1. **The Hero Carousel:** Showcases the user's highest affinity categories.
2. **Curated Collections:** Merges trending items with pieces matching the user's preferred price band.
3. **Smart Search Suggestions:** Prioritizes search suggestions and category rails matching the user's past queries and browsed categories.

---

## 4. Strict Privacy & Opt-Out Safeguards

* **Data Anonymization:** Behavior profiles are stored as mathematical score arrays and contain zero personally identifiable data (PII).
* **Easy Opt-Out:** Users can toggle personalization off inside their Profile settings. When disabled, the platform resets the homepage feed to the global default catalog, demonstrating respect for user choices.
