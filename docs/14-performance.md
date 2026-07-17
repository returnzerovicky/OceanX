# Ocean: Performance Budgets & Asset Strategy v1.0
## Core Web Vitals, Asset Loading, and Delivery Optimizations

A premium e-commerce platform must be exceptionally fast. Speed is luxury; a slow, laggy interface instantly degrades brand authority. This document establishes measurable performance budgets, bundle policies, and image loading guidelines for Ocean.

---

## 1. Core Web Vitals Budgets

Ocean targets a high level of speed across all buyer-facing routes. We measure and enforce the following performance targets:

| Metric | Target Value | Critical Action Threshold | Measurement Definition |
| :--- | :--- | :--- | :--- |
| **LCP** (Largest Contentful Paint) | **< 1.2s** | > 2.0s | Time taken to render the primary visual element (hero product/banner). |
| **INP** (Interaction to Next Paint) | **< 100ms** | > 200ms | Time from user interaction to visual frame update. |
| **CLS** (Cumulative Layout Shift) | **< 0.05** | > 0.10 | Sum of all unexpected visual layout shifts during page lifetime. |
| **TTFB** (Time to First Byte) | **< 200ms** | > 500ms | Server responsiveness to initial document request. |
| **Speed Index** | **< 1.5s** | > 3.0s | Visual completeness index during page load. |

---

## 2. JavaScript Bundle Budgets & Splitting

To prevent initial loading lag, Ocean regulates bundle size using production-build rules configured in Vite and esbuild:

* **Initial Entrypoint Bundle Limit:** The primary client-side bundle (`index.html` loading script) must not exceed **150 KB** (gzipped).
* **Granular Route Splitting:** All top-level marketplace screens (Home, PDP, Cart, Checkout, Portals) must be loaded lazily using React `lazy` and `Suspense`:
```typescript
import { lazy } from 'react';

// Lazily load large modular components to reduce primary bundle weight
const AdminPortal = lazy(() => import('./components/AdminPortal'));
const SellerPortal = lazy(() => import('./components/SellerPortal'));
```
* **Dynamic Chunk Splitting:** Heavy third-party packages must be extracted into isolated chunks so they are loaded only when needed:
  - D3.js and Recharts (analytical charts used only on Seller/Admin Dashboards) are split from the main buyer bundle.
  - The Stripe and Google Maps integration engines are loaded asynchronously only when initiating checkout or address verification.

---

## 3. High-Fidelity Image Optimization Policy

Images showcase products, but unoptimized files can degrade performance. Ocean enforces strict image delivery standards:

* **Next-Gen File Formats:** All product, banner, and profile images must be transcoded and served as **AVIF** (preferred) or **WebP** formats. Standard JPEGs and PNGs are prohibited, except for high-transparency schematics.
* **Responsive Image Layouts (Srcset):** Image elements must leverage adaptive responsive sets to ensure mobile devices load lightweight, screen-proportional images:
```html
<img 
  src="product_500w.webp" 
  srcset="product_300w.webp 300w, product_500w.webp 500w, product_800w.webp 800w"
  sizes="(max-width: 600px) 300px, 500px"
  alt="Industrial Brass Desk Lamp"
  loading="lazy"
  decoding="async"
/>
```
* **Image Lazy Loading:** Every image positioned below the fold must include the native `loading="lazy"` attribute. Hero banners and primary PDP images must omit this attribute and instead use `fetchpriority="high"` to minimize Largest Contentful Paint (LCP) times.
* **Predefined Dimensions (Anti-CLS):** To achieve a Cumulative Layout Shift (CLS) of `< 0.05`, all image containers must maintain pre-calculated layout sizes. During loading, they must display a clean, shimmer skeleton container matching the final dimensions of the asset.

---

## 4. Fonts and Styling Optimizations

* **Font Delivery:**
  - Standard fonts (Inter, Space Grotesk, JetBrains Mono) are loaded via high-performance Google CDN servers, with prefetching tags included in `<head>`:
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  ```
  - All font-face declarations must feature the `font-display: swap` property to render readable fallback system text instantly during font loading.
* **CSS Tree-Shaking:**
  - Ocean utilizes Tailwind CSS. In production, Tailwind automatically tree-shakes and purges all unused utility classes.
  - Standard CSS rules are bundled into a single file, keeping the styling payload under **25 KB** (gzipped).
