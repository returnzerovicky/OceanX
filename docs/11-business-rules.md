# Ocean: Marketplace Business Rules & Operational Workflows v1.0
## Financial Settlements, Inventory Hold & Arbitration Standards

An enterprise-grade marketplace requires strict, immutable business policies. This document details the algorithmic logic, compliance deadlines, and financial rules governing operations on the Ocean marketplace.

---

## 1. Automated Commission & Payout Mechanics

To maintain a self-sustaining ecosystem while attracting premium, high-integrity merchants, Ocean administers an automated escrow settlement ledger.

### A. Core Commission Formulas
* **Gross Transaction Value ($GTV$):** The total price paid by the buyer for items in an order, excluding sales taxes, but including any shipping fees set by the seller.
* **Platform Commission Fee ($C_p$):** Standard platform deduction applied to each order item.
  $$C_p = (GTV_{item} \times R_c) + F_f$$
  Where:
  - $R_c$ = Seller-specific commission rate (default: `10%` / `0.10`).
  - $F_f$ = Flat transaction processing fee (default: `$0.30`).
* **Merchant Settlement Allocation ($S_m$):** The net earnings transferred to the merchant's escrow ledger:
  $$S_m = GTV_{item} - C_p$$

### B. The Escrow Holding Period
- Earnings from processed sales do not settle immediately to prevent seller flight during delivery failures.
- Net allocations ($S_m$) are locked in a non-withdrawable **Platform Escrow Account** for a strict cooling window of **14 calendar days** following verified parcel delivery (the Return Eligibility Period).
- If no dispute or return request is logged within this 14-day window, funds transition to **Settled Balance** and are automatically batched into the merchant's weekly bank transfer (processed every Tuesday).

---

## 2. Inventory Reservation and Overselling Guardrails

To prevent the common e-commerce trap of "double-purchase" during flash sales or heavy traffic, Ocean implements an automated **Inventory Lock** state inside the database:

```
[ Buyer Clicks "Proceed to Payment" ]
                 │
                 ▼
[ Acquire Lock on sku_variants.stock_quantity ]
                 │
                 ├──► Success ──► Decrement Stock & Create "Locked Reservation" (15 Mins)
                 │                      │
                 │                      ├─► Complete Payment (Stripe Callback) ─► Finalize Order
                 │                      │
                 │                      └─► Timeout / Exit ──────────────────────► Restore Stock
                 │
                 └──► Failure ──► Abort & Alert: "Item currently held in another basket."
```

* **The 15-Minute Reservation window:**
  - Upon navigating to the Payment screen, the checkout controller acquires a database transaction lock on the requested SKUs.
  - If sufficient stock is available, the physical count is decremented immediately, and a temporary checkout reservation is created.
  - The buyer has exactly **15 minutes** to submit valid payment credentials and complete the Stripe transaction.
* **Session Expiry & Automatic Reclamation:**
  - If the timer expires or the user explicitly abandons the checkout page, the lock is released.
  - The reserved SKU quantities are immediately returned to the active stock catalog, preventing phantom stock losses.

---

## 3. High-Integrity Dispute Arbitration Timelines

When a buyer reports a damaged, incomplete, or unreceived package, the transaction enters an objective, multi-step mediation process:

1. **Filing (Day 0):** The buyer files a dispute through their Account panel, uploading photo/video evidence. The platform places an immediate freeze on the seller's escrow allocation for that order.
2. **Seller Response Window (Days 1–3):** The merchant has exactly **72 hours** to review the dispute. They can:
   - Accept the dispute and issue a full refund.
   - Propose an alternative settlement (e.g., partial refund or replacement).
   - Reject the claim and submit counter-evidence (e.g., origin carrier weight receipts, postal drop images).
3. **Admin Escalation (Day 4+):** If the seller fails to respond within 72 hours, or if negotiations stall, the dispute is escalated to the **Admin Arbitration Queue**.
4. **Resolution Ruling (Days 5–7):** A platform moderator reviews the evidence and renders an immutable judgment. Upon ruling, the frozen escrow funds are immediately returned to the buyer (Refund) or released to the seller (Payout).

---

## 4. Refund & Return Logistics Routing Rules

To ensure a luxurious, hassle-free return experience, Ocean enforces clear logistics routing policies:

* **Return Window:** Buyers can request a return for any undamaged, unused product within **14 calendar days** of delivery.
* **Shipping Cost Allocation:**
  - If the return is due to *merchant error* (e.g., damaged item, incorrect sizing, wrong SKU), the return shipping label is billed directly to the seller's account.
  - If the return is due to *buyer preference* (e.g., changed mind, didn't fit), a flat return shipping fee of **$10.00** is deducted from the final refunded subtotal.
* **Quality Assurance Gatekeeping:**
  - Upon parcel arrival at the merchant's facility, the merchant has **48 hours** to inspect the returned SKU and confirm its original condition.
  - Once verified, the platform backend automatically triggers the Stripe refund processor. Funds return to the buyer's original payment method within 3–5 business days.
* **Abuse Protection Throttles:** Buyers who maintain an overall return rate exceeding **35% of order value** over any 90-day window are automatically flagged for account review, disabling free return shipping offers to protect merchants from systematic exploit.
