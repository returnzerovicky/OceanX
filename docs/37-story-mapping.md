# Ocean: End-to-End User Story Map v1.0
## Visualizing the Product Journeys for Buyers and Sellers

To guide engineering priorities and feature design, Ocean maps the entire customer experience across discrete, sequential user journeys. This keeps product development focused on clear, human-centric outcomes.

---

## 1. The Customer Shopping Journey

The buyer's experience transitions from initial interest to recurring engagement:

```
  [ DISCOVER ] ──► [ SEARCH ] ──► [ BROWSE ] ──► [ COMPARE ] ──► [ WISHLIST ]
       │
       ▼
   [ CART ] ───► [ CHECKOUT ] ──► [ TRACK ] ───► [ REVIEW ] ───► [ REORDER ]
```

### 1. Discover
- **Objective:** Capture user attention on arrival.
- **Key Features:** Pristine hero collections, trending items, and category menus.

### 2. Search
- **Objective:** Help users find specific items instantly.
- **Key Features:** Auto-suggestions, synonym stemming, and hybrid search (Lexical + Gemini Vector search).

### 3. Browse
- **Objective:** Enable frictionless catalog exploration.
- **Key Features:** Responsive category filters, dynamic pricing sliders, and stock status indicators.

### 4. Compare
- **Objective:** Facilitate informed purchasing decisions.
- **Key Features:** Side-by-side spec comparison grids, material close-ups, and review summaries.

### 5. Wishlist
- **Objective:** Save items for future sessions.
- **Key Features:** Easy tap-to-favorite icons, collection folders, and price-drop notifications.

### 6. Cart
- **Objective:** Prepare selections for purchase.
- **Key Features:** Slide-out drawer, optimistic quantity edits, and promotional code inputs.

### 7. Checkout
- **Objective:** Complete transactions securely and quickly.
- **Key Features:** Single-screen layout, Google Maps autocomplete, and Stripe Connect split payments.

### 8. Track
- **Objective:** Provide peace of mind during fulfillment.
- **Key Features:** Dynamic progress bars, real-time carrier integrations, and estimated delivery dates.

### 9. Review
- **Objective:** Share feedback and build brand reputation.
- **Key Features:** Star rating matrices, image uploads, and AI-powered review summarizations.

### 10. Reorder
- **Objective:** Encourage repeat purchases and loyalty.
- **Key Features:** One-click reordering, subscription configurations, and recommended cross-sells.

---

## 2. The Seller Merchant Journey

The seller's experience bridges operational setup with financial settlements:

```
  [ REGISTER ] ──► [ KYC VERIFY ] ──► [ UPLOAD ] ──► [ MANAGE ] ──► [ SHIP ] ──► [ GET PAID ]
```

### 1. Register
- **Objective:** Onboard new curators seamlessly.
- **Key Features:** Elegant merchant signup, brand story submission, and payout banking setup.

### 2. KYC Verify
- **Objective:** Maintain high platform quality and security.
- **Key Features:** Tax ID validation, government ID uploads, and admin moderation reviews.

### 3. Upload
- **Objective:** List premium items with high-quality assets.
- **Key Features:** Drag-and-drop 4:3 image uploader, AI category tags, and stock inventory entries.

### 4. Manage
- **Objective:** Oversee stock and sales performance.
- **Key Features:** Dynamic stock alerts, pricing managers, and real-time sales dashboards.

### 5. Ship
- **Objective:** Complete logistics securely and accurately.
- **Key Features:** Auto-generated pre-paid carrier labels, custom packing slip PDFs, and status trackers.

### 6. Get Paid
- **Objective:** Distribute merchant earnings predictably.
- **Key Features:** 14-day escrow counters, settled balance displays, and weekly bank settlements.
---

## 3. Journey-to-Code Alignment

Our engineering teams are aligned directly to these story maps:
- **Discover, Search, Browse, Compare, Wishlist:** Managed by the **Catalog & Discovery Team**.
- **Cart, Checkout, Get Paid:** Managed by the **Checkout & Financial Infrastructure Team**.
- **Track, Ship, Manage:** Managed by the **Logistics & Partner Operations Team**.
- **KYC, Admin Arbitration, Reviews:** Managed by the **Trust, Safety, & Compliance Team**.
- **AI Assistant, Recs:** Managed by the **AI Innovations Team**.
