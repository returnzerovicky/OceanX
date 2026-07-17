# Ocean: Marketplace Operations & Lifecycle Specification v1.0
## Seller Onboarding, Listing Audits, and Escrow Logistics

This document establishes the end-to-end lifecycle, operational guardrails, and compliance workflows governing merchants and transactions on the Ocean marketplace.

---

## 1. Complete Merchant & Product Lifecycle

To maintain high platform quality and brand safety, Ocean manages merchant accounts and product listings through structured compliance pipelines.

```
========================================================================
1. SELLER LIFECYCLE
========================================================================
[ Merchant Sign-up ] ──► [ KYC Document Upload ] ──► [ Admin Review Queue ]
                                                              │
                                     ┌────────────────────────┴────────────────────────┐
                                     ▼                                                 ▼
                             [ KYC Approved ]                                  [ KYC Rejected ]
                                     │                                                 │
                                     ▼                                                 ▼
                           (Storefront Active)                               (Account Locked)

========================================================================
2. PRODUCT LIFECYCLE
========================================================================
[ Product Drafted ] ──► [ Image Quality Audit ] ──► [ Admin Approval Queue ]
                                                              │
                                     ┌────────────────────────┴────────────────────────┐
                                     ▼                                                 ▼
                             [ List Approved ]                                 [ List Rejected ]
                                     │                                                 │
                                     ▼                                                 ▼
                            (Catalog Indexed)                                  (Draft Revised)
```

---

## 2. End-to-End Transaction Lifecycle

Every purchase transitions through clear financial, warehouse, and delivery states to ensure security and order accuracy:

```
[ Checkout Complete ]
          │
          ▼ (Idempotent payment validated)
[ Order Reserved & Created ]
          │
          ▼ (Split notifications sent to Sellers)
[ Inventory Hold Confirmed ]
          │
          ▼ (Seller packages & hand-off verified)
[ Dispatched / Shipped ]
          │
          ▼ (Carrier tracking updates to Delivered)
[ Parcel Delivered ]
          │
          ▼ (14-day return and dispute window starts)
[ Settlement Clearance ]
          │
          ▼ (Escrow released)
[ Payout Issued to Bank ]
```

---

## 3. Detailed Operational Workflows

### A. Merchant Registration & KYC
- **Onboarding:** Sellers provide basic contact information, their business tax ID, and upload an official government ID.
- **Status:** The brand status remains **`pending`** during verification. This status disables public storefront pages, cart operations, and payouts.
- **Verification:** An admin verifies the documents. Upon approval, the status changes to **`approved`**, enabling the seller's storefront.

### B. Product Listing Audit
- **Content Policy:** Sellers create listings specifying title, description, category, and uploading product images.
- **Image Quality Check:** To maintain Ocean's design standards, images must have a 4:3 aspect ratio and feature clean, high-contrast backgrounds.
- **Status Pipeline:** Listings are submitted to the **`Admin Moderation Queue`**. Once approved by a moderator, they are published to the public catalog.

### C. Financial Settlement Clearance
- **Escrow Freeze:** To protect buyers, order revenues are held in platform escrow for **14 calendar days** following delivery.
- **Dispute Check:** If no disputes or return requests are logged during this window, funds transition to **Settled Balance**.
- **Payout:** Settled funds are batched and transferred to the seller's linked bank account on a weekly schedule.
