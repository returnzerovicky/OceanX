# Ocean: System Error Catalogue v1.0
## Error Mapping, Response Payloads, and UX Recovery Guidelines

This document acts as Ocean's master dictionary for error codes, database failures, and client-side recovery states. It defines clear error codes and actionable recovery behaviors to maintain a polished, professional user experience.

---

## 1. System Error Code Mapping

All API-driven errors must use a standard JSON payload format containing unique, machine-readable error codes. This allows the client application to display precise, helpful, and localized recovery screens.

| HTTP Code | Error Code Token | Core System Context | User-Facing Display Message | Immediate UX Recovery Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **400** | `INVALID_PAYLOAD` | Form data failed backend schema validation. | "Some form details are incomplete. Please verify your entries." | Highlight invalid input fields in crimson and display helpful inline error labels. |
| **401** | `TOKEN_EXPIRED` | Access session JWT has expired. | "Your secure login session has expired. Please verify your identity." | Display a non-disruptive, in-place login modal over the current screen to resume without losing progress. |
| **403** | `KYC_PENDING` | Active seller tried uploading catalog before KYC verification. | "Your brand verification is currently pending review." | Navigate the seller to their brand onboarding screen with active compliance status timelines. |
| **404** | `PRODUCT_NOT_FOUND` | PDP slug could not be located in database. | "We couldn't locate the requested product listing." | Display a polished 404 page with a clean search bar and related product recommendations. |
| **429** | `RATE_LIMIT_EXCEEDED` | Client surpassed request throttle limit. | "Too many requests. Please wait a moment and try again." | Temporarily disable submit CTAs and display a countdown timer indicating when the user can retry. |
| **500** | `DATABASE_TIMEOUT` | Relational database failed responding within threshold. | "Our system is temporarily responding slowly. Please retry in a moment." | Display a non-disruptive toast with an auto-retry CTA to safely re-dispatch the request. |
| **503** | `AI_SERVICE_UNAVAILABLE` | Gemini API connection timed out. | "AI insights are temporarily offline. Standard results are shown below." | Silently fall back to standard keyword-based search queries without interrupting the user's flow. |

---

## 2. Critical Transactional Recovery Flows

### A. Stripe Payment Rejection Flow
- **Error Trigger:** Stripe returns a card rejection code (e.g., `card_declined`, `incorrect_zip`).
- **Logistics Handler:** The checkout transaction remains open, preserving all cart items and shipping configurations.
- **UI Recovery:** Displays an inline payment alert in crimson detailing the exact issue (e.g., "Insufficient funds. Please use a different card.") and prompts the user to submit alternative payment details.

### B. Checkout Inventory Lock Conflict
- **Error Trigger:** A buyer attempts to purchase an item that has just been reserved or sold out.
- **Logistics Handler:** The checkout process is paused, and the reservation is safely cancelled.
- **UI Recovery:** Displays a clear overlay alert: *"An item in your cart was just reserved by another buyer. We have saved your selection to your Wishlist."* and returns the user to their cart to review.

### C. Connection Offline State
- **Error Trigger:** Browser drops internet connection mid-session (`navigator.onLine === false`).
- **Logistics Handler:** Frontend enters offline-cache mode. Modifications are queued inside local storage.
- **UI Recovery:** Displays a quiet, non-obtrusive banner: *"Browsing in offline mode. Changes will sync once reconnected."* The user can continue browsing cached pages and editing their cart without losing data.
