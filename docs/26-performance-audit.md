# Ocean: Performance Audit Specification v1.0
## Measurable Budgets, Page Performance Targets, and Optimization Workflows

This document establishes Ocean's performance budgets, asset delivery guidelines, and audit protocols to ensure the platform remains exceptionally fast.

---

## 1. Measurable Performance Budgets

To satisfy Core Web Vitals and meet our Largest Contentful Paint (LCP) targets, the build system enforces strict payload size budgets:

```
                            Ocean Asset Budgets
┌────────────────────────────────────────────────────────┐
│               JavaScript Initial Bundle                │
│                 Budget: < 150 KB (gzipped)             │
└───────────────────────────┬────────────────────────────┘
                            │ Combined Entrypoint
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Global CSS Bundle                    │
│                 Budget: < 25 KB (gzipped)              │
└───────────────────────────┬────────────────────────────┘
                            │ CSS and Custom Tailwind Purge
                            ▼
┌────────────────────────────────────────────────────────┐
│                     Product Images                     │
│                 Budget: < 100 KB per Asset             │
└────────────────────────────────────────────────────────┘
                            Optimized WebP / AVIF Format
```

---

## 2. Page Performance Budgets & Core Metrics

We measure and enforce the following target performance thresholds:

| Metric Group | Metric Name | Core Target | Action Threshold | Measurement Tool |
| :--- | :--- | :--- | :--- | :--- |
| **UX Core** | **LCP** (Largest Contentful Paint) | **< 1.2s** | > 2.0s | Web Vitals API / Lighthouse |
| **UX Core** | **INP** (Interaction to Next Paint) | **< 100ms** | > 200ms | Web Vitals API / Lighthouse |
| **UX Core** | **CLS** (Cumulative Layout Shift) | **< 0.05** | > 0.10 | Web Vitals API / Lighthouse |
| **Asset Size** | Initial JavaScript Payload | **< 150 KB** | > 250 KB | Vite Build Analyzer |
| **Asset Size** | Initial CSS Payload | **< 25 KB** | > 50 KB | Vite Build Analyzer |
| **API Speed** | TTFB (Time to First Byte) | **< 200ms** | > 500ms | Express Server Telemetry |

---

## 3. High-Performance Asset Delivery Policy

- **Vite Code Splitting:** Top-level portals (Buyer interface, Seller panel, Admin dashboard) must be dynamically loaded using React `lazy` and `Suspense` to avoid initial bundle bloat.
- **Asynchronous Heavy SDKs:** Large integration SDKs (such as Stripe or Google Maps) must load asynchronously only when the user navigates to the checkout or shipping screen.
- **Next-Gen Image Formats:** Product images must be encoded and delivered in next-generation formats (**WebP** or **AVIF**), keeping individual assets under **100 KB**.
- **Dynamic Image Sizing:** Image layouts must leverage adaptive `srcset` attributes to deliver lightweight, resolution-appropriate assets to mobile devices.
- **Zero CLS Skeletons:** Product grids and sliders must use pre-allocated skeleton placeholders matching final asset dimensions to eliminate layout shifts during loading.
- **Font Display Swap:** CSS font face declarations must use `font-display: swap` to display fallback system text instantly during font loading.
- **Tailwind Purge CSS:** The production pipeline must purge unused utility classes, keeping the global CSS file under **25 KB** (gzipped).
