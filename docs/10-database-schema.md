# Ocean: Database Architecture & Schema v1.0
## Schema Structures, Relational Maps & Execution Indexes

Ocean employs a robust relational schema designed to ensure absolute data consistency, transaction isolation, and high-performance querying for buyers, sellers, and operators. This document outlines the physical tables, column attributes, relationships, and caching indexes.

---

## 1. Unified Entity Relationship Diagram (Conceptual Layout)

```
       ┌───────────┐         ┌───────────┐
       │   Users   │◄───────►│  Sellers  │
       └─────┬─────┘         └─────┬─────┘
             │                     │
             │                     ▼
             │               ┌───────────┐         ┌──────────────┐
             │               │ Products  │◄───────►│ SKU Variants │
             │               └─────┬─────┘         └──────┬───────┘
             ▼                     │                      │
       ┌───────────┐               │                      │
       │  Orders   │◄──────────────┼──────────────────────┘
       └─────┬─────┘               │
             │                     ▼
             ├────────────────►┌───────────┐
             │                 │  Reviews  │
             ▼                 └───────────┘
       ┌───────────┐
       │ Payments  ├──────────►┌───────────┐
       └─────┬─────┘           │Settlements│
             ▼                 └───────────┘
       ┌───────────┐
       │ Disputes  │
       └───────────┘
```

---

## 2. Table Schemas & Column Attributes

### A. Users Table
Stores information for buyers, platform operators, and delivery personnel.
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'buyer', -- 'buyer', 'admin', 'warehouse', 'delivery'
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### B. Sellers Table
Houses individual brand configurations and operational statuses.
```sql
CREATE TABLE sellers (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  brand_name VARCHAR(100) UNIQUE NOT NULL,
  brand_description TEXT,
  logo_url VARCHAR(2083),
  kyc_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'suspended'
  commission_rate_percentage DECIMAL(5,2) DEFAULT 10.00,
  payout_bank_account VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### C. Products Table
Standard master listings for products on the platform.
```sql
CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  seller_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  images JSON NOT NULL, -- Array of URLs: ["url1", "url2"]
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
);
```

### D. SKU Variants Table
Ocean supports granular item configurations (e.g., color, sizing, memory storage combinations) with specific pricing offsets and distinct inventory tracking.
```sql
CREATE TABLE sku_variants (
  sku VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(36) NOT NULL,
  variant_name VARCHAR(255) NOT NULL, -- e.g., 'Space Gray / 256GB'
  price_override DECIMAL(10,2), -- NULL defaults to base_price
  stock_quantity INT NOT NULL DEFAULT 0,
  weight_grams INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### E. Orders & Order Items Tables
Orders handle core purchase history and separate multi-vendor distributions:
```sql
CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY,
  buyer_id VARCHAR(36) NOT NULL,
  shipping_address JSON NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL,
  shipping_fee DECIMAL(10,2) NOT NULL,
  coupon_discount DECIMAL(10,2) DEFAULT 0.00,
  total DECIMAL(10,2) NOT NULL,
  order_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  sku VARCHAR(50) NOT NULL,
  seller_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  price_at_purchase DECIMAL(10,2) NOT NULL,
  fulfillment_status VARCHAR(20) DEFAULT 'unfulfilled', -- 'unfulfilled', 'fulfilled', 'returned'
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (sku) REFERENCES sku_variants(sku),
  FOREIGN KEY (seller_id) REFERENCES sellers(id)
);
```

### F. Multi-Vendor Disputes Table
```sql
CREATE TABLE disputes (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  product_id VARCHAR(36) NOT NULL,
  buyer_id VARCHAR(36) NOT NULL,
  reason VARCHAR(50) NOT NULL, -- 'ITEM_DAMAGED', 'LATE_DELIVERY', 'NOT_AS_DESCRIBED'
  description TEXT,
  dispute_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'resolved_refunded', 'rejected'
  admin_decision TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (buyer_id) REFERENCES users(id)
);
```

---

## 3. High-Performance Execution Indexes

To guarantee maximum database responsiveness, LCP and INP timings under massive marketplace transaction volume, Ocean requires the following functional execution indexes:

* **Product Index (`idx_prod_category_approved`):**
  - Columns: `category`, `is_approved`, `created_at DESC`
  - Purpose: Speeds up filtered category listings and homepage collection queries.
* **Semantic Slug Index (`idx_prod_slug`):**
  - Columns: `slug` (Unique Hash)
  - Purpose: Speeds up PDP lookup during navigation.
* **Variant Catalog Index (`idx_vars_product`):**
  - Columns: `product_id`
  - Purpose: Speeds up variants fetch during PDP loads.
* **Seller Inventory Control Index (`idx_items_seller`):**
  - Columns: `seller_id`, `fulfillment_status`
  - Purpose: Optimizes dashboard order queues.
