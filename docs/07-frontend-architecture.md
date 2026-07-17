# Ocean: Frontend Architecture & State Strategy v1.0
## State Management, Session Lifecycle & Offline Fallback Mechanics

Ocean is built as a highly modular React single-page application (SPA) backed by Vite. This document outlines the system-wide state architecture, data persistence layers, session lifecycles, and code split rules required to keep Ocean exceptionally fast, reliable, and maintainable.

---

## 1. Unified State Management Architecture

To prevent prop-drilling, performance bottlenecks, and infinite re-renders, Ocean categorizes and manages application state into four distinct tiers:

```
                  Ocean State Architecture
┌────────────────────────────────────────────────────────┐
│                      Server State                      │
│       (Product Catalogs, Active Orders, Settlements)    │
│            - Fast, read-heavy, server-cached           │
└───────────────────────────┬────────────────────────────┘
                            │ Synchronizes via REST
                            ▼
┌────────────────────────────────────────────────────────┐
│                      Global State                      │
│        (User Authentication, Cart, Wishlist, UI)       │
│            - Synced across routes, reactive            │
└───────────────────────────┬────────────────────────────┘
                            │ Persists selectively
                            ▼
┌────────────────────────────────────────────────────────┐
│                    Persistent State                    │
│        (Cached Cart SKUs, Token, Theme, Wishlist)       │
│            - Hydrated instantly from LocalStorage      │
└───────────────────────────┬────────────────────────────┘
                            │ Injects state
                            ▼
┌────────────────────────────────────────────────────────┐
│                      Local State                       │
│        (Form inputs, active filters, open drawers)      │
│            - Contained strictly inside components      │
└────────────────────────────────────────────────────────┘
```

### A. Global State (Cart & Wishlist Engine)
- Managed via lightweight React Context (or centralized state hooks).
- Cart items and active wishlists are kept in memory and synchronized immediately to the database (for logged-in users) or client-side cache (for guest users).
- Changes to quantities or items trigger optimistic UI updates: the state changes instantly, and a background request is made to the database, ensuring seamless perceived performance.

### B. Server State (Product lists, Orders, Reviews)
- High-volume data sets fetched from the server-side API.
- Leverages dynamic data fetching hooks with automated garbage-collection.
- Responses from the product catalog or specific seller details are cached for a short duration (e.g., 2 minutes) to prevent redundant network requests when clicking between related views.

### C. Persistent State (Token & User Settings)
- Critical configurations that survive browser refreshes or short-term internet drops.
- Persisted in the browser's `localStorage` or secured cookies.
- **Keys:** `ocean_auth_token`, `ocean_user_wishlist`, `ocean_cached_cart`.

### D. Local State (UX Layout context)
- Transient states like `isCartOpen`, `activeTab`, or individual search query input.
- Kept strictly local inside their respective components using standard React `useState` hooks.
- **Rule:** Never promote local UI states to global context unless multiple disparate layout components require immediate awareness of that state.

---

## 2. Authentication & Session Lifecycle

To secure transactional workflows while preserving frictionless onboarding, Ocean uses a **Hybrid JWT Session Flow**:

```
[ Buyer / Guest ]
       │
       ├─► Browse / Add to Cart ──────► Guest Context (No Auth, LocalStorage)
       │
       └─► Initiate Checkout ─────────► Modal Login (JWT Auth, Secure Cookie)
                                               │
                                               ├─► Sync Guest Cart to DB
                                               └─► Establish Session
```

* **Guest State:** Guests can browse catalogs, add items to their Cart, and update their Wishlist. This data is written to the guest's local cache.
* **On-the-Fly Conversion:** When a guest initiates Checkout, they are prompted to complete a 1-tap passwordless or standard email sign-in.
* **Session Sync:** Upon successful verification, the frontend:
  1. Saves the secure JWT auth token.
  2. Submits the cached local cart to the server-side consolidation endpoint.
  3. Seamlessly updates the checkout flow with the user's saved addresses, requiring zero work from the buyer.
* **Session Expiry Handling:** If the session token expires or is revoked mid-flow, the client intercepts the API error gracefully: it prompts the user with a non-disruptive authentication modal overlay to log back in without losing their active checkout configuration.

---

## 3. Offline Caching & Sync Strategy

An unstable network should never disrupt a premium shopping experience. Ocean handles offline scenarios gracefully:

* **Connection Status Hook:** A system-wide custom React hook monitors network status (`navigator.onLine`).
* **Visual Status Toast:** When the user goes offline, a quiet, non-obtrusive toast notification appears: *"Browsing in offline mode. Changes will sync once reconnected."*
* **Offline Cart & Wishlist Queuing:**
  - If a user changes item quantities or adds a new piece to their wishlist while offline, the frontend intercepts the API request.
  - The local cart context is updated instantly (Optimistic UI), and the action is queued in a local offline-sync array inside `localStorage`.
  - Once the connection is re-established, the queue processes background sync requests sequentially, silently updating the server.

---

## 4. Code Modularity & Modularization Rules

Large, consolidated source files degrade performance and make maintaining code difficult. Ocean enforces strict modularity boundaries:

1. **Max File Size Rule:** No component source file should exceed **400 lines of code**. If a file grows beyond this, extract helper functions, types, and nested sub-components into separate files.
2. **Directory Separation:**
   - `/src/components/common/`: Shared design system primitives (Buttons, Inputs, Cards).
   - `/src/components/layout/`: Global templates (Headers, Footers, Cart drawers).
   - `/src/components/portals/`: Modules specific to individual experiences (Buyer views, Seller dashboards, Admin control panels).
   - `/src/hooks/`: Reusable logic engines (`useCart`, `useAuth`, `useNetwork`).
   - `/src/types.ts`: Centralized file containing all global type definitions and interfaces.
3. **Strict Type Definitions:** Never use TypeScript `any`. Every dynamic payload, api response, and component property must be typed.
