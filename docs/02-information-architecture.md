# Ocean: Information Architecture & Routing Specification v1.0
## Structural Design & Navigation Philosophy

A premium e-commerce experience begins with an intuitive, flat, and predictable structure. Users must always understand where they are, where they came from, and how to return. Ocean employs a **Context-Aware Adaptive Information Architecture (IA)** designed to simplify complex multi-vendor workflows into logical, lightweight layouts.

---

## 1. Unified Sitemaps & Portal Segments

The Ocean application is divided into five specialized user-facing domains. While they share a core design language, each maintains an information density tailored to its primary operator:

```
Ocean Ecosystem
├── Buyer Webapp (High-Empathy, Fluid, Curated)
├── Seller Portal (High-Utility, Modular, Dense)
├── Warehouse Management Portal (High-Speed, Keyboard-First, Scan-Centric)
├── Delivery Portal (Mobile-First, One-Handed, Map-Guided)
└── Admin Moderation Deck (High-Density, Analytical, Multi-pane)
```

---

## 2. Directory Map & Component Hierarchy

### I. Buyer Experience Map (Flat & Intuitive)
```
Marketplace Home (Curated Showcase)
├── Global Navigation Bar (Brand Header, Universal AI Assistant, Wishlist & Cart Portals)
├── Discovery & Semantic Search Console (Dynamic suggestions, interactive voice/text query)
├── Category Hubs (Visual Icon Rail)
│   ├── Electronics (Sub: Audio, Computing, Smart Wearables)
│   ├── Fashion & Wardrobe (Sub: Minimalist, Luxury Outwear, Accents)
│   └── Home & Living (Sub: Studio Furniture, Ambient Lighting, Textiles)
├── Unified Search Results (Category/Result grid with instant side-by-side comparison deck)
│   └── Multi-Select Compare Drawer
├── Product Details Page (PDP) (High-Immersive Media, Dynamic Delivery, Configurator, Reviews)
├── Cart Side-Drawer (Active Context) & Consolidated Cart Page
├── Multi-Vendor Checkout Funnel (One-page, step-by-step breadcrumb progress)
└── User Account Hub (Profile, Order tracking status timelines, Return hub, Saved addresses)
```

### II. Merchant Operations Portal (Symmetric Grid)
```
Seller Dashboard (Overview of Key Performance Indicators)
├── Inventory Console (Add, Edit, Bulk-import premium products, Set Variant rules)
├── Order Fulfillment Center (Process orders, Print shipping labels, Confirm parcel hand-off)
├── Financial Settlement Ledger (Earnings statements, Commission breakdowns, Bank transfers)
└── Brand Profile Customizer (Storefront banner, Mission statement, Custom logo configuration)
```

### III. System Administrative Panel (Three-Column Control Deck)
```
Admin Dashboard (Platform Performance & Compliance)
├── Merchant Moderation Panel (KYC Review, Storefront approval queue, Performance audits)
├── Product Listing Compliance (Manual audit logs, Brand registry protection)
├── Dispute Resolution Board (Customer/Seller dynamic chat interface, Refund override controls)
└── Global System Settings (Commission rates, Feature toggles, CDN purging)
```

---

## 3. Navigation Hierarchy & Interactive Frameworks

To optimize product discoverability and user speed, navigation relies on three persistent components:

### A. The Primary Header (The Global Anchor)
* **Left Segment:** The minimalist, balanced **Ocean Logo** with a responsive tactile brand click interaction (instantly resets marketplace context with a smooth `motion` fade).
* **Center Segment:** The **AI Smart Search Input**. Acts as a text field that expands into a glass-morphic search overlay upon focus, exposing historical semantic queries and trend tags.
* **Right Segment:** A minimalist action rail comprising:
  - Portal-switcher dropdown (Buyer / Seller / Warehouse / Delivery / Admin).
  - Quick-Wishlist badge (displays a quiet visual ring when items are saved).
  - Quick-Cart button (triggers the slide-out Cart Drawer).
  - User Avatar (leads to the User Profile drop-sheet).

### B. Category Icon Rail (The Fast-Path Selector)
* Located directly below the Primary Header.
* Consists of flat, highly stylized geometric icons representing main categories.
* Hover state: Soft background shift and micro-expansion of the icon.
* Active state: Solid subtle underline to establish clear environmental location.

### C. The Bottom Control Sheet (Mobile-First Paradigm)
* Responsive design removes the cluttered desktop header on viewports `< 768px`.
* Replaced by a high-contrast sticky navigation bar at the bottom:
  - **Discover (Home):** Curated product collections.
  - **Search:** Full-screen dedicated AI conversational input.
  - **Cart:** Quick-draw sheet (slides up from base).
  - **Account:** Unified profile and logistics status tracker.

---

## 4. Routing Philosophy & Layout Wrappers

Ocean implements client-side and server-side routing based on a **Hierarchical Layout Pattern** to eliminate page-load flickering.

```
/
├── (buyer)                         -> Main Layout Template
│   ├── /                           -> Homepage
│   ├── /search?q=                  -> Dynamic Search Overlay/Results
│   ├── /category/:id               -> Filterable Category Page
│   ├── /product/:slug              -> High-Fidelity PDP
│   ├── /cart                       -> Full-Cart Page
│   ├── /checkout                   -> Distraction-Free Single-Page Checkout
│   └── /profile                    -> Unified Account Hub (Tabs: orders, profile, returns)
│
├── /seller                         -> Merchant Portal Template
│   ├── /seller/dashboard           -> KPIs & Payout Tracking
│   ├── /seller/inventory           -> SKU & Variant Matrix
│   └── /seller/orders              -> Shipment Fulfillment Queue
│
├── /admin                          -> Platform Control Deck Template
│   ├── /admin/disputes             -> Customer Arbitrations
│   └── /admin/sellers              -> KYC Verification
│
├── /warehouse                      -> Sorting & Barcode Engine
└── /delivery                       -> Route Mapping & Signature Capture
```

---

## 5. Information Density & Screen Spacing Strategy

To avoid "AI-slop clutter," Ocean adheres to a rigorous Information Density strategy based on operator tasks:

1. **Buyer Face (Immersive Luxury):** Low density, high negative space. Standard margins: `px-6 md:px-12 lg:px-24`. Maximum width: `max-w-7xl mx-auto`. Elements are isolated with generous margins (`mb-12` to `mb-20`) to let products "breathe" and signal premium value.
2. **Seller Face (Data Integrity):** Medium density. Structured data tables (`dense` rows, 14px text) with clean grid boundaries. Focuses on scannable numbers and active statuses.
3. **Admin Panel & Warehouse Face (Maximum Efficiency):** High density, dual-pane/three-pane layouts. Compact lists, multi-column tables, keyboard hotkeys. Maximizes visual space to display maximum structural relationships without forcing user scroll.
