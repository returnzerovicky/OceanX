# Ocean REST API Specification — v1.0 (Enterprise Standard)

This document specifies the complete REST API for Ocean. Every endpoint contains authentication scopes, payloads, exact schema responses, HTTP error codes, and strict rate limits.

---

## Global Headers & Standards

All requests must conform to these standard HTTP headers:
* **Accept**: `application/json`
* **Content-Type**: `application/json`
* **X-API-Version**: `1.0`
* **Authorization**: `Bearer <AccessToken>` (for secured endpoints)

---

## 1. Authentication & Session Module (`/api/v1/auth`)

### POST `/api/v1/auth/login`
* **Method**: `POST`
* **Description**: Authenticate client credentials and yield a secure JWT token pair.
* **Authentication**: None
* **Rate Limit**: 5 attempts per IP per 10 minutes
* **Headers**: `X-Forwarded-For: <Client IP>`
* **Validation**: Email is verified, password string is min 8 chars.
* **Request Body**:
```json
{
  "email": "customer@example.com",
  "password": "SecurePassword123!"
}
```
* **Response (200 OK)**:
```json
{
  "user": {
    "id": "usr_9281a8f3b",
    "email": "customer@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "wallet_balance": 150.00,
    "roles": ["Customer"]
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
  "refreshToken": "ref_932a8f81bb3aa"
}
```
* **Error Codes**:
  * `400 BAD_REQUEST`: Missing email or malformed string.
  * `401 INVALID_CREDENTIALS`: Password mismatch or email not found.
  * `429 TOO_MANY_REQUESTS`: Rate limit exceeded.

---

## 2. Product Catalog Module (`/api/v1/products`)

### GET `/api/v1/products`
* **Method**: `GET`
* **Description**: Retrieve a paginated array of products filtered by query options.
* **Authentication**: None
* **Rate Limit**: 100 requests per minute
* **Query Parameters**:
  * `limit` (int, default 20)
  * `cursor` (string, unique product ID cursor)
  * `category` (string, optional)
  * `brand` (string, optional)
  * `sortBy` (string, e.g., `price_asc`, `price_desc`, `rating_desc`)
* **Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "prod_x1",
      "title": "Quantum Pro Watch",
      "slug": "quantum-pro-watch",
      "sku": "QTY-PRW-01",
      "sellingPrice": 299.99,
      "rating": 4.8,
      "reviewsCount": 142
    }
  ],
  "nextCursor": "prod_x1"
}
```

---

## 3. Orders & Processing Module (`/api/v1/orders`)

### POST `/api/v1/orders/checkout`
* **Method**: `POST`
* **Description**: Instantiates a checkout process, computes invoice fields, locks items in inventory, and registers the order.
* **Authentication**: Required (`Customer` role)
* **Permissions**: `order:create`
* **Rate Limit**: 10 requests per user per minute
* **Request Body**:
```json
{
  "userId": "usr_9281a8f3b",
  "items": [
    { "productId": "prod_x1", "qty": 1 }
  ],
  "addressId": "addr_9182a7bc",
  "couponCode": "SUMMER50"
}
```
* **Response (201 Created)**:
```json
{
  "orderId": "ord_88291a92",
  "subtotal": 299.99,
  "discount": 50.00,
  "shippingFee": 15.00,
  "tax": 20.00,
  "total": 284.99,
  "status": "Pending",
  "timeline": [
    { "status": "Pending", "updatedAt": "2026-07-13T09:50:00Z" }
  ]
}
```
* **Error Codes**:
  * `400 STOCK_INSUFFICIENT`: One or more items are out of stock.
  * `400 COUPON_EXPIRED`: The supplied discount code is invalid or expired.
  * `401 UNAUTHORIZED`: Missing or invalid Bearer token.

---

## 4. User Profile Module (`/api/v1/users`)

### GET `/api/v1/users/:id/profile`
* **Method**: `GET`
* **Description**: Obtain full profile summary including addresses, loyalty points, and active session indicators.
* **Authentication**: Required (`Customer` or `Admin`)
* **Permissions**: `user:read` (Users can only read their own profile, Admins can read all)
* **Rate Limit**: 30 requests per minute
* **Response (200 OK)**:
```json
{
  "userId": "usr_9281a8f3b",
  "email": "customer@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+15551234567",
  "rewardCoins": 420,
  "walletBalance": 150.00,
  "addresses": [
    { "id": "addr_9182a7bc", "city": "San Francisco", "isDefault": true }
  ]
}
```

---

## 5. Elastic Hybrid Search Engine (`/api/v1/search`)

### GET `/api/v1/search`
* **Method**: `GET`
* **Description**: Dispatches a hybrid search query (Postgres trigrams + pgvector embeddings) returning matched catalog elements.
* **Authentication**: None
* **Rate Limit**: 120 requests per minute
* **Query Parameters**:
  * `q` (string, the search query text)
  * `category` (string, optional category scope)
* **Response (200 OK)**:
```json
{
  "results": [
    {
      "id": "prod_x1",
      "title": "Quantum Pro Watch",
      "matchScore": 0.965,
      "highlights": ["Quantum", "Watch"]
    }
  ],
  "latencyMs": 42
}
```

---

## 6. Cart Management Module (`/api/v1/cart`)

### POST `/api/v1/cart/:userId/add`
* **Method**: `POST`
* **Description**: Insert or increment items within the customer's shopping cart.
* **Authentication**: Required (`Customer`)
* **Rate Limit**: 60 requests per minute
* **Request Body**:
```json
{
  "productId": "prod_x1",
  "qty": 2,
  "selectedAttributes": { "color": "Midnight Black" }
}
```
* **Response (200 OK)**:
```json
{
  "userId": "usr_9281a8f3b",
  "cart": [
    {
      "productId": "prod_x1",
      "qty": 2,
      "title": "Quantum Pro Watch",
      "selectedAttributes": { "color": "Midnight Black" }
    }
  ]
}
```

---

## 7. Payments Processing Module (`/api/v1/payment`)

### POST `/api/v1/payment/charge`
* **Method**: `POST`
* **Description**: Directs Stripe, Razorpay, or Paypal gateways to process the transaction payload.
* **Authentication**: Required (`Customer`)
* **Rate Limit**: 10 requests per minute
* **Request Body**:
```json
{
  "orderId": "ord_88291a92",
  "paymentMethod": "stripe",
  "amount": 284.99
}
```
* **Response (200 OK)**:
```json
{
  "success": true,
  "transactionId": "txn_8c1b920aa92",
  "amountCharged": 284.99,
  "gateway": "stripe",
  "status": "Succeeded"
}
```
* **Error Codes**:
  * `402 PAYMENT_REQUIRED`: Card declined, insufficient funds, or general gateway error.

---

## 8. Customer Reviews & Sentiment AI (`/api/v1/reviews`)

### POST `/api/v1/reviews/submit`
* **Method**: `POST`
* **Description**: Submits product feedback. Integrates with the AI Service to screen for fake/malicious submissions.
* **Authentication**: Required (`Customer`)
* **Rate Limit**: 5 requests per minute
* **Request Body**:
```json
{
  "productId": "prod_x1",
  "userName": "Jane Doe",
  "rating": 5,
  "comment": "Incredible battery life and premium finish!"
}
```
* **Response (201 Created)**:
```json
{
  "review": {
    "id": "rev_7b29a101",
    "productId": "prod_x1",
    "rating": 5,
    "comment": "Incredible battery life and premium finish!",
    "aiSentiment": "positive",
    "isFake": false
  }
}
```

---

## 9. Seller Onboarding & Metrics Module (`/api/v1/sellers`)

### GET `/api/v1/sellers/:id/metrics`
* **Method**: `GET`
* **Description**: Pull metrics details for a specific seller store.
* **Authentication**: Required (`Seller` or `Admin`)
* **Rate Limit**: 30 requests per minute
* **Response (200 OK)**:
```json
{
  "sellerId": "sel_301",
  "name": "NexusTech Solutions",
  "responseRate": 98,
  "responseTime": "Within 15 minutes",
  "rating": 4.9,
  "followersCount": 42500,
  "verifiedBadge": true,
  "yearsOnPlatform": 4
}
```

---

## 10. Multi-Tenant Admin Panel (`/api/v1/admin`)

### GET `/api/v1/admin/dashboard`
* **Method**: `GET`
* **Description**: Retrieve platform metrics (GMV, order volume, system load) for real-time monitoring.
* **Authentication**: Required (`Admin`)
* **Permissions**: `admin:dashboard`
* **Rate Limit**: 20 requests per minute
* **Response (200 OK)**:
```json
{
  "gmvToday": 1420500.00,
  "orderCountToday": 12450,
  "activeSessions": 42090,
  "escrowHeldBalance": 5420900.00,
  "systemStatus": "healthy"
}
```

---

## 11. Warehouse Location Allocation (`/api/v1/warehouse`)

### GET `/api/v1/warehouse/allocation/:productId`
* **Method**: `GET`
* **Description**: Pinpoint which warehouses contain active inventory stocks of a specified item.
* **Authentication**: Required (`Seller`, `Admin`)
* **Rate Limit**: 40 requests per minute
* **Response (200 OK)**:
```json
{
  "productId": "prod_x1",
  "allocations": [
    { "warehouseId": "wh_sf", "warehouseName": "San Francisco Hub", "stockOnHand": 450 }
  ]
}
```

---

## 12. Real-Time Inventory Control (`/api/v1/inventory`)

### POST `/api/v1/inventory/reserve`
* **Method**: `POST`
* **Description**: Decrements the main inventory count and updates the reserved bucket.
* **Authentication**: Required (`InternalSystem` or `Admin`)
* **Rate Limit**: 500 requests per minute
* **Request Body**:
```json
{
  "productId": "prod_x1",
  "qty": 1
}
```
* **Response (200 OK)**:
```json
{
  "productId": "prod_x1",
  "reserved": true,
  "newStockReserved": 42,
  "newStockOnHand": 408
}
```

---

## 13. Dispute Arbitrator Module (`/api/v1/disputes`)

### POST `/api/v1/disputes/file`
* **Method**: `POST`
* **Description**: Create an official arbitration dispute record to hold escrow payouts.
* **Authentication**: Required (`Customer`)
* **Rate Limit**: 5 requests per minute
* **Request Body**:
```json
{
  "orderId": "ord_88291a92",
  "reason": "Item not as described",
  "details": "The clock bezel is cracked and color is fading."
}
```
* **Response (201 Created)**:
```json
{
  "disputeId": "dis_7b2190aa",
  "orderId": "ord_88291a92",
  "status": "Under Review",
  "refundInitiated": false
}
```

---

## 14. Message Routing & Alerts (`/api/v1/notifications`)

### GET `/api/v1/notifications/:userId`
* **Method**: `GET`
* **Description**: Pull a list of recent notifications.
* **Authentication**: Required (`Customer`, `Seller`)
* **Rate Limit**: 40 requests per minute
* **Response (200 OK)**:
```json
[
  {
    "id": "notif_21908aa91",
    "title": "Order Dispatched!",
    "message": "Your watch is on its way with tracking code DHL-8201.",
    "isRead": false,
    "createdAt": "2026-07-13T09:55:00Z"
  }
]
```

---

## 15. Analytics Event Logging (`/api/v1/analytics`)

### POST `/api/v1/analytics/log-event`
* **Method**: `POST`
* **Description**: Buffered, asynchronous endpoint for transmitting event logs.
* **Authentication**: None (accepts anonymous cookies)
* **Rate Limit**: 1000 requests per minute
* **Request Body**:
```json
{
  "eventName": "product_viewed",
  "properties": {
    "productId": "prod_x1",
    "referrer": "google.com"
  }
}
```
* **Response (202 Accepted)**:
```json
{ "status": "queued" }
```

---

## 16. Server-Side AI Orchestrator (`/api/v1/ai`)

### POST `/api/v1/ai/assistant/chat`
* **Method**: `POST`
* **Description**: Process smart customer assistance prompts using server-side Gemini integration.
* **Authentication**: Required (`Customer`, `AnonymousGuest`)
* **Rate Limit**: 15 requests per minute
* **Request Body**:
```json
{
  "history": [
    { "role": "user", "text": "Hi, I need a sports watch" }
  ],
  "message": "Do you have any option with 10 days of battery life?"
}
```
* **Response (200 OK)**:
```json
{
  "response": "Yes! The Quantum Pro Watch features up to 14 days of battery life and active multi-sport tracking. Would you like me to add it to your cart?"
}
```

---

## 17. Operational Help Tickets (`/api/v1/support`)

### POST `/api/v1/support/tickets`
* **Method**: `POST`
* **Description**: Submits an official support request ticket.
* **Authentication**: Required (`Customer`, `Seller`)
* **Rate Limit**: 5 requests per minute
* **Request Body**:
```json
{
  "subject": "Double-charged on last purchase",
  "description": "My visa card shows two debits for order ord_88291a92."
}
```
* **Response (201 Created)**:
```json
{
  "ticketId": "tkt_8120b0a",
  "subject": "Double-charged on last purchase",
  "status": "Open",
  "createdAt": "2026-07-13T09:58:00Z"
}
```

---

## 18. Secured Binary Media Upload (`/api/v1/upload`)

### POST `/api/v1/upload`
* **Method**: `POST`
* **Description**: Upload binary assets directly. It scans files for malware and stores them in Cloud Storage.
* **Authentication**: Required (`Seller`, `Admin`)
* **Rate Limit**: 20 requests per minute
* **Headers**: `Content-Type: multipart/form-data`
* **Request Body**: Binary file payload (e.g. `file: product_banner.png`)
* **Response (201 Created)**:
```json
{
  "url": "https://storage.googleapis.com/ocean-media-bucket/prod_images/banner_91a029b.png",
  "mediaType": "image/png",
  "fileSize": 142050
}
```
* **Error Codes**:
  * `413 PAYLOAD_TOO_LARGE`: Files must not exceed 10MB.
  * `415 UNSUPPORTED_MEDIA_TYPE`: Invalid extension. Only JPG, PNG, WEBP, and MP4 formats are permitted.
