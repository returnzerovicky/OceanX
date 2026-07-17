# Ocean: Notification Architecture v1.0
## Delivery Engines, Dynamic Templates, and Multi-Channel Routing

A premium shopping experience relies on clear, timely updates. This document defines Ocean's transaction notification architecture, template systems, and multi-channel delivery rules.

---

## 1. Unified Notification Dispatch System

The notification service monitors order changes, payment events, and disputes, automatically routing updates through the most appropriate delivery channel (Email, In-App, or Webhooks) based on recipient preferences.

```
                         Unified Notification Event
                                     │
                                     ▼
                        ┌─────────────────────────┐
                        │   Notification Dispatch │
                        │  (Queue Processor, App) │
                        └────────────┬────────────┘
                                     │
                  ┌──────────────────┼──────────────────┐
                  ▼                  ▼                  ▼
        ┌──────────────────┐┌──────────────────┐┌──────────────────┐
        │   Email Engine   ││  In-App Engine   ││  Webhook Engine  │
        │  (Transactional) ││ (Real-Time Push) ││  (Seller Integration)
        └────────┬─────────┘└────────┬─────────┘└────────┬─────────┘
                 │                   │                   │
                 ▼                   ▼                   ▼
           [ Buyer Inbox ]     [ Portal UI ]      [ Seller System ]
```

---

## 2. Notification Dispatch Matrices

We use tailored channels for different events to prevent notification fatigue while ensuring critical alerts are received:

| Transactional Event | Primary Channel | Secondary Channel | Intended Recipient | Delivery Target |
| :--- | :--- | :--- | :--- | :--- |
| **Order Completed** | Email | In-App (Push) | Buyer | Immediately (< 2s) |
| **Parcel Dispatched** | Email | In-App (Push) | Buyer | Immediately (< 2s) |
| **Dispute Filed** | In-App (Web) | Email | Seller | Within 5 seconds |
| **Payout Settled** | Email | In-App (Web) | Seller | Within 1 minute |
| **Dispute Decision** | Email | In-App (Push) | Buyer / Seller | Immediately (< 2s) |

---

## 3. Dynamic Template Strategy & Visual Styling

To support a luxurious, high-end aesthetic, our email templates match Ocean's visual guidelines:
* **Visual Styling:** Emails feature clean layouts, off-white background fills, generous padding, Inter typography, and a prominent Ocean logotype.
* **Responsive Layouts:** All template structures are built with mobile-first HTML styling to guarantee correct rendering on small touchscreens.
* **Transactional Content Guidelines:** No marketing fluff, sales-pitch slogans, or exclamation marks are allowed. Content must remain direct and objective.

### Standard Template Contract: Order Confirmation (JSON Schema)
```json
{
  "templateId": "ocean_order_confirmed_v1",
  "recipient": "vicky.b1902@gmail.com",
  "dynamicData": {
    "buyerName": "Vicky",
    "orderId": "ord_99012",
    "deliveryDateEstimate": "Thursday, July 16, 2026",
    "items": [
      {
        "title": "Minimalist Solid Oak Desk",
        "quantity": 1,
        "price": "$450.00"
      }
    ],
    "subtotal": "$450.00",
    "tax": "$45.00",
    "shipping": "$0.00",
    "total": "$495.00",
    "trackingUrl": "https://ocean.com/profile/orders/ord_99012"
  }
}
```

---

## 4. Webhooks & External Seller Integration

Sellers frequently use third-party ERPs or inventory platforms (such as Shopify or Salesforce) to manage fulfillment. Ocean supports this via custom webhook triggers:

* **Endpoint Registration:** Sellers can configure webhook endpoints (`URL`) in their portal dashboard.
* **Payload Signatures:** All webhook payloads include an **`Ocean-Signature`** header containing an HMAC-SHA256 signature, enabling the seller's server to verify the payload's integrity.
* **Automatic Retries:** If a seller's server returns a non-200 response, Ocean automatically retries delivery using an exponential backoff schedule (retrying up to 5 times over 2 hours).
