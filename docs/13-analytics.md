# Ocean: Analytics & Event Tracking Specification v1.0
## Funnel Tracking, Structured Events & Conversion Analytics

To continuously optimize the shopping experience, increase Conversion Rates, and reduce Cart Abandonment, Ocean implements a **Structured Event Tracking System**. This document defines the events, properties, user funnels, and privacy standards required for our analytics engine.

---

## 1. The Core E-Commerce Funnel

Ocean tracks the buyer's progression through five distinct conversion stages. Every step in this funnel is measured to identify and resolve drop-offs:

```
[ Discovery ] ──► [ Intent ] ──► [ Cart State ] ──► [ Checkout Started ] ──► [ Purchase Completed ]
```

| Funnel Step | Triggering Event | Primary Optimization Metric |
| :--- | :--- | :--- |
| **1. Discovery** | `Product_Viewed` | Click-Through-Rate (CTR) of Featured Items |
| **2. Intent** | `Product_Added_To_Cart` | Product Add-to-Cart (ATC) Rate |
| **3. Cart State** | `Cart_Drawer_Opened` | Cart-to-Checkout Progression Rate |
| **4. Checkout Started**| `Checkout_Initiated` | Checkout Completion Rate |
| **5. Purchase Completed**| `Checkout_Completed` | Average Order Value (AOV), Purchase Rate |

---

## 2. Event Tracking Schemas & Payloads

Every tracked user event must include consistent **Context Metadata**:
```json
{
  "context": {
    "platform": "web",
    "deviceType": "mobile",
    "viewportSize": "390x844",
    "sessionId": "sess_buyer_uuid_8801",
    "userId": "usr_buyer_uuid_902" // NULL for guests
  }
}
```

### A. Discovery Events

#### 1. Search Executed
* **Trigger:** When a user submits a search query (keyword or conversational AI).
* **Payload:**
```json
{
  "eventName": "Search_Executed",
  "properties": {
    "searchQuery": "warm brass desk lamp",
    "searchType": "semantic", -- 'semantic', 'keyword'
    "categoryFilter": "Home Decor",
    "resultsReturned": 18,
    "responseTimeMs": 340
  }
}
```

#### 2. Product Viewed
* **Trigger:** When a user opens a product details page (PDP).
* **Payload:**
```json
{
  "eventName": "Product_Viewed",
  "properties": {
    "productId": "prod_lamp_882",
    "productTitle": "Industrial Brass Desk Lamp",
    "category": "Home Decor",
    "price": 125.00,
    "sellerId": "sell_ambient_lights",
    "isRecommended": true
  }
}
```

---

### B. Conversion Events

#### 1. Product Added to Cart
* **Trigger:** When a user clicks the "Add to Cart" CTA.
* **Payload:**
```json
{
  "eventName": "Product_Added_To_Cart",
  "properties": {
    "productId": "prod_lamp_882",
    "sku": "sku_lamp_brass_us",
    "quantity": 1,
    "price": 125.00,
    "variantName": "Brass / US Cord",
    "sourcePage": "pdp" -- 'pdp', 'homepage_recommendation', 'search'
  }
}
```

#### 2. Checkout Initiated
* **Trigger:** When a user clicks "Proceed to Checkout" from the cart drawer or page.
* **Payload:**
```json
{
  "eventName": "Checkout_Initiated",
  "properties": {
    "cartId": "cart_buyer_uuid_101",
    "cartTotal": 125.00,
    "itemCount": 1,
    "sellerIds": ["sell_ambient_lights"]
  }
}
```

#### 3. Checkout Completed
* **Trigger:** When payment is successfully processed and the Order confirmation page loads.
* **Payload:**
```json
{
  "eventName": "Checkout_Completed",
  "properties": {
    "orderId": "ord_lamp_9901",
    "transactionId": "ch_stripe_88012",
    "totalAmount": 125.00,
    "subtotal": 115.00,
    "tax": 10.00,
    "shipping": 0.00,
    "itemCount": 1,
    "appliedCoupon": "WELCOME10",
    "paymentMethod": "card"
  }
}
```

#### 4. Payment Failed
* **Trigger:** When Stripe rejects payment or checkout is halted due to a validation error.
* **Payload:**
```json
{
  "eventName": "Payment_Failed",
  "properties": {
    "orderId": "ord_lamp_9901",
    "failureReason": "card_declined",
    "errorCode": "insufficient_funds",
    "totalAmount": 125.00
  }
}
```

---

## 3. Client-Side Tracking Integration Rules

* **Non-Blocking Operation:** Analytics events must be dispatched asynchronously using non-blocking API calls. Tracking should never block visual thread execution or degrade performance.
* **Batch and Flush Queues:** To conserve battery and network usage on mobile devices, client events are batched into local memory and flushed in groups of 10, or during page transitions.
* **Explicit User Privacy & Consent:**
  - Ocean strictly respects user privacy preferences (Do Not Track - DNT).
  - No personally identifiable information (PII)—including emails, full names, precise GPS coordinates, or credit card numbers—may ever be included in tracking payloads.
  - Users can toggle cookie tracking off inside their Profile panel, which instantly disables non-essential events.
  - Tracking data must be fully anonymized at the point of collection.
│
