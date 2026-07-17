# Ocean: Recommendation Engine Specification v1.0
## Collaborative Filtering, Content-Based Similarity, and Placement Strategy

This document details Ocean's product recommendation service, defining our similarity algorithms, placement strategies, and data models to drive user engagement and increase Average Order Value (AOV).

---

## 1. Unified Recommendations Topology

The Recommendation Engine parses user activity and catalog metadata to generate personalized suggestion sets. It combines collaborative filtration with direct item-to-item similarity maps.

```
       [ User Activity logs ]             [ Product Metadata ]
                  │                                │
                  ▼                                ▼
       ┌─────────────────────┐          ┌─────────────────────┐
       │   User Embeddings   │          │  Product Embeddings │
       │ (Categories, Price) │          │(Features, Materials)│
       └──────────┬──────────┘          └──────────┬──────────┘
                  │                                │
                  └───────────────┬────────────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │    Scoring Model    │
                       │ (Cosine Similarity) │
                       └──────────┬──────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │   Filtering Rules   │
                       │(No out-of-stock SKUs)│
                       └──────────┬──────────┘
                                  │
                  ┌───────────────┼───────────────┐
                  ▼               ▼               ▼
            [ Homepage ]        [ PDP ]       [ Cart ]
            Curated Feed    Similar Items    Cross-Sells
```

---

## 2. Core Recommendation Strategies

Ocean implements six specialized recommendation strategies, each optimized for specific customer touchpoints:

### A. Trending Now (Homepage Placement)
* **Goal:** Surface high-velocity, high-satisfaction products.
* **Logic:** Items are scored based on sales acceleration and average review sentiment over the past 7 days:
  $$Score = \frac{Sales(t_{-7} \to t_{0})}{Sales(t_{-14} \to t_{-7})} \times AverageRating$$

### B. Similar Products (PDP Placement)
* **Goal:** Prevent navigation dead-ends by suggesting related pieces.
* **Logic:** Computes content similarity using cosine metrics of product descriptions, materials, categories, and price bands.

### C. Frequently Bought Together (Checkout & PDP Placement)
* **Goal:** Increase basket size during active shopping.
* **Logic:** Analyzes historical order transactions to find pairs with high association rules (Support & Confidence metrics):
  $$Confidence(A \to B) = \frac{Transactions(A \cap B)}{Transactions(A)}$$

### D. Recently Viewed Items (Account & Homepage Placement)
* **Goal:** Allow users to easily return to products they've shown interest in.
* **Logic:** Extracted from the user's local session history, displaying up to 10 recently viewed items in reverse-chronological order.

### E. People Also Bought (PDP Placement)
* **Goal:** Surface related items based on community purchase behavior.
* **Logic:** Suggests products purchased by other users who bought the item currently being viewed.

### F. Continue Shopping (Homepage Placement)
* **Goal:** Re-engage returning buyers with unfinished journeys.
* **Logic:** Recommends items related to active, unpurchased items left in the user's shopping cart or wishlist.

---

## 3. Placement Policy & Layout Rules

To preserve Ocean's "silent luxury" feel, we limit recommendation density and enforce strict visual layout rules:
* **Density Cap:** No page layout may contain more than two recommendation carousels.
* **Visual Aspect:** All recommendation items must use standard Product Display Cards, maintaining a consistent 4:3 aspect ratio.
* **Exclusion List:** Recommendations must automatically exclude products that are out of stock, unapproved, or currently flagged for moderation.
