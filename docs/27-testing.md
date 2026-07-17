# Ocean: Testing Strategy v1.0
## Unit Tests, Integration Tests, End-to-End, and Accessibility Verifications

This document outlines Ocean's end-to-end testing matrix, establishing the tools, targets, and criteria required to maintain high code quality and prevent regressions.

---

## 1. Core Testing Hierarchy

To balance test execution speed and comprehensive coverage, Ocean divides tests across four operational tiers:

```
                            Ocean Testing Matrix
┌────────────────────────────────────────────────────────┐
│                   End-to-End Tests                     │
│         (Funnels, Checkouts, Portal Transitions)        │
│              - Coverage: Core User Journeys            │
└───────────────────────────┬────────────────────────────┘
                            │ Playwright / Cypress
                            ▼
┌────────────────────────────────────────────────────────┐
│                  Integration Tests                     │
│         (Auth session routes, API endpoints, SDKs)      │
│              - Coverage: Server API Controllers        │
└───────────────────────────┬────────────────────────────┘
                            │ Supertest / Mocha / Jest
                            ▼
┌────────────────────────────────────────────────────────┐
│                     Unit Tests                         │
│         (Components, hooks, formats, state logic)      │
│              - Coverage: Target helper functions       │
└───────────────────────────┬────────────────────────────┘
                            │ Vitest / Jest / Testing Library
                            ▼
┌────────────────────────────────────────────────────────┐
│                Accessibility Audits                    │
│         (Keyboard Focus, ARIA tags, Contrasts)         │
│              - Coverage: Component Library             │
└────────────────────────────────────────────────────────┘
                            axe-core / Lighthouse
```

---

## 2. Testing Frameworks & Tool Selection

* **Unit Testing (Vitest / React Testing Library):** Used for testing component layouts, state transitions, custom hooks, and standard formatting utilities.
* **API Integration Testing (Supertest):** Deployed inside Express backend routes to verify API contracts, auth protections, payloads, and error codes.
* **End-to-End (E2E) Testing (Playwright):** Simulates real user browser sessions. Playwright executes core buyer flows, checkout submissions, and portal routing sequences.
* **Automated Accessibility Testing (axe-core):** Integrated directly into E2E testing pipelines to automatically flag missing ARIA attributes, focus traps, and low-contrast colors.

---

## 3. High-Priority Testing Targets

To ensure high reliability, several critical workflows require comprehensive test coverage:

- **The Checkout Transaction Funnel:** E2E tests must verify that adding items to the cart, initiating checkout, submitting payment credentials, and completing orders operates correctly under simulated network latencies.
- **The Authentication Lifecycle:** Integration tests must verify access and refresh token distribution, route access guards, and automatic token expiration recovery.
- **Inventory Locks under Load:** Load testing scripts must verify that simultaneous purchase attempts for the same SKU acquire database locks correctly and prevent overselling.
- **Offline Caching & Sync:** Unit tests must verify that cart modifications made while offline queue correctly inside `localStorage` and sync automatically upon reconnection.
- **Dispute Escalation Pipelines:** Integration tests must verify that dispute state transitions (Filing -> 72h Seller Window -> Admin Queue -> Resolution) operate according to our business rules.
- **Keyboard Navigation Compliance:** Axe-core tests must verify that interactive layouts are fully navigable using the keyboard and maintain active focus traps within modals.
