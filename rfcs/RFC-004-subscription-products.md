# RFC-004: Recurring Subscription Products
## Author: Billing & Checkout Engineering Group

### 1. Abstract / Problem Statement
To build predictable recurring revenue streams for both curators and the Ocean platform, this RFC proposes adding **Subscription-Based Products** (e.g., monthly curated design boxes, scheduled coffee refills, quarterly organic textile renewals). This expansion requires recurring billing systems, subscription state management, and robust retry logic.

---

### 2. Core Architectural Design

We will integrate Stripe Billing (Subscriptions) directly into our database and checkout models, syncing subscription lifecycles asynchronously via secure Stripe webhooks.

```
       [ Customer selects Monthly Plan ]
                       │
                       ▼
         [ Checkout - Stripe Billing ]
                       │
                       ▼
           [ Webhook: sub.succeeded ]
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
  [ Update DB State ]      [ Dispatch Order Event ]
  (Active Subscription)    (Triggers warehouse pack)
```

---

### 3. Database Schema Extensions

We will track subscription states, intervals, and customer mappings inside a new table linked to our standard orders model:

```sql
CREATE TYPE subscription_status AS ENUM (
  'incomplete', 'incomplete_expired', 'trialing', 'active', 
  'past_due', 'canceled', 'unpaid'
);

CREATE TABLE product_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID REFERENCES users(id) ON DELETE RESTRICT,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  status subscription_status NOT NULL,
  current_period_start TIMESTAMP NOT NULL,
  current_period_end TIMESTAMP NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 4. Subscription Renewal & Webhook Workflows

#### A. The Renewal Loop
Every billing cycle, Stripe processes the customer's payment automatically and fires a web notification:
- **Webhook Received:** `invoice.payment_succeeded`.
- **System Action:** The Express backend parses the payload, extends the `current_period_end` date, writes a new order item inside the `orders` table, and publishes an `order.completed` event to ship the current month's box.

#### B. Graceful Payment Failure (Dunning Process)
If a recurring charge fails (e.g., card expired or insufficient funds):
- Stripe fires `invoice.payment_failed`.
- The system flags the subscription status as `past_due` and pauses fulfillment logs.
- The notification engine sends an email containing an update-billing link. Stripe retries the transaction according to our smart-retry timeline (Days 1, 3, 5, and 7). If all retries fail, the subscription is canceled.
