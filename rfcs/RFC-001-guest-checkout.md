# RFC-001: Frictionless Guest Checkout
## Author: Engineering Lead (Fulfillment & Cart Team)

### 1. Abstract / Problem Statement
Currently, Ocean requires all customers to create an active account and complete KYC guidelines prior to placing orders. This step ensures security but introduces friction that drives cart abandonment. 

To increase conversion rates, this RFC proposes a **Frictionless Guest Checkout** workflow. Users can purchase items by providing only an email address and shipping location, leaving account creation as an optional post-purchase step.

---

### 2. High-Level Architecture

We will introduce a dual-state checkout model on the server side to handle both registered and anonymous customers cleanly:

```
                  [ Add Items to Cart ]
                            │
                            ▼
                [ Click Proceed to Checkout ]
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
      [ Logged-In User ]         [ Anonymous Guest ]
               │                         │
               │ (Reads Profile)         │ (Enters email & address)
               ▼                         ▼
         ┌─────────────────────────────────────┐
         │     Stripe Secure Payment Page      │
         └──────────────────┬──────────────────┘
                            │
                            ▼
                  [ Order Created ]
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
      [ Send Confirmation ]      [ Send Confirmation ]
                                 [ + One-Click Signup link ]
```

---

### 3. Core Technical Specifications

#### A. Session Storage Transitions
- **Anonymized Cart Identification:** Anonymous shopping baskets will be cached inside Redis linked to a cryptographically secure client-side `guest_session_id` cookie.
- **Cart Merging Logic:** If a guest logs in midway through their journey, the anonymous cart will merge with their profile cart using a standard union-by-SKU strategy.

#### B. Database Schema Changes
The `orders` table will be updated to support optional buyer IDs, substituting them with verified guest email fields:
```sql
ALTER TABLE orders 
  ALTER COLUMN buyer_id DROP NOT NULL,
  ADD COLUMN guest_email VARCHAR(255) NULL,
  ADD COLUMN is_guest BOOLEAN DEFAULT FALSE;
```

#### C. Post-Purchase Conversion Lifecycle
- Following payment validation, the guest receives their confirmation email.
- The email includes an ephemeral, cryptographically signed signup link (valid for 72 hours).
- Clicking this link prompts the guest to provide a password. Doing so instantly converts their guest orders into a newly initialized, fully integrated Ocean account.

---

### 4. Risks & Mitigations

* **Risk: Coupon/Discount Abuse:** Guests could circumvent checkout limit rules by using disposable email accounts.
  * *Mitigation:* The rate limiter will monitor IP addresses and postal shipping coordinates.
* **Risk: Order History Tracking:** Guests who lose their confirmation emails cannot track delivery status.
  * *Mitigation:* We will provide SMS-based OTP (One-Time Password) order lookup portals.
