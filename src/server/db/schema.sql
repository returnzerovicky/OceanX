-- ============================================================================
-- OCEAN ENTERPRISE MARKETPLACE - CORE POSTGRESQL SCHEMA BLUEPRINT
-- Production-grade, highly indexed, fully normalized schema
-- Target: High-throughput transaction processing (OLTP) and Hybrid Analytics (HTAP)
-- ============================================================================

-- Extensions for high performance uuid generation and fuzzy searching
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ----------------------------------------------------------------------------
-- 1. SECURITY & IDENTITY ACCESS MANAGEMENT (RBAC)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY, -- Supports custom federated IDs and UUIDs
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255), -- Nullable for OAuth-only users
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    wallet_balance NUMERIC(15, 4) NOT NULL DEFAULT 0.0000,
    reward_coins INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(255) NOT NULL UNIQUE,
    user_agent TEXT,
    ip_address VARCHAR(45) NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. SELLER & STORE FRONT MODULES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS sellers (
    id VARCHAR(100) PRIMARY KEY, -- e.g., 'sell-1'
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    logo_url TEXT,
    rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0,
    followers_count INT NOT NULL DEFAULT 0,
    verified_badge BOOLEAN NOT NULL DEFAULT FALSE,
    gst_number VARCHAR(50),
    response_rate INT NOT NULL DEFAULT 100,
    response_time VARCHAR(50) NOT NULL DEFAULT 'Within 1 hour',
    years_on_platform INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seller_profiles (
    seller_id VARCHAR(100) PRIMARY KEY REFERENCES sellers(id) ON DELETE CASCADE,
    business_description TEXT,
    support_email VARCHAR(255) NOT NULL,
    support_phone VARCHAR(50),
    registered_office_address TEXT NOT NULL,
    country VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    payout_details JSONB, -- Encrypted or standard banking identifiers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. PRODUCT CATALOG DATASETS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(100) PRIMARY KEY, -- e.g., 'cat-1'
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    parent_id VARCHAR(100) REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS brands (
    id VARCHAR(100) PRIMARY KEY, -- e.g., 'brand-1'
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    logo_url TEXT,
    rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0,
    origin_country VARCHAR(100),
    year_established INT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(100) PRIMARY KEY, -- e.g., 'prod-1'
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    sku VARCHAR(100) NOT NULL UNIQUE,
    barcode VARCHAR(100),
    seller_id VARCHAR(100) NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
    brand_id VARCHAR(100) NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
    category_id VARCHAR(100) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    subcategory VARCHAR(150),
    collection VARCHAR(150),
    short_title VARCHAR(150),
    description TEXT NOT NULL,
    short_description TEXT,
    specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
    features TEXT[] NOT NULL DEFAULT '{}'::text[],
    highlights TEXT[] NOT NULL DEFAULT '{}'::text[],
    box_contents TEXT[] NOT NULL DEFAULT '{}'::text[],
    warranty_info TEXT,
    return_policy TEXT,
    country_of_origin VARCHAR(100),
    manufacturer VARCHAR(255),
    model_number VARCHAR(100),
    launch_date DATE,
    rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0,
    reviews_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku_suffix VARCHAR(50) NOT NULL,
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g., {"color": "Blue", "size": "128GB"}
    mrp NUMERIC(15, 2) NOT NULL,
    selling_price NUMERIC(15, 2) NOT NULL,
    wholesale_price NUMERIC(15, 2),
    stock_qty INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(30) NOT NULL DEFAULT 'image', -- 'image', 'video', 'ar_model'
    is_main BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0
);

-- ----------------------------------------------------------------------------
-- 4. INVENTORY, WAREHOUSE & LOGISTICS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS warehouses (
    id VARCHAR(100) PRIMARY KEY, -- e.g., 'WH-US-WEST-1'
    name VARCHAR(150) NOT NULL,
    capacity INT NOT NULL DEFAULT 100000,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id VARCHAR(100) NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    stock_on_hand INT NOT NULL DEFAULT 0,
    stock_reserved INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 10,
    restock_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_id, warehouse_id)
);

-- ----------------------------------------------------------------------------
-- 5. PURCHASES, CARTS & WISHLISTS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    selected_attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id, selected_attributes)
);

CREATE TABLE IF NOT EXISTS wishlists (
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id)
);

-- ----------------------------------------------------------------------------
-- 6. DISCOUNTS & COUPONS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS coupons (
    code VARCHAR(50) PRIMARY KEY,
    discount_type VARCHAR(30) NOT NULL, -- 'percentage', 'fixed'
    value NUMERIC(10, 2) NOT NULL,
    min_spend NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    max_discount NUMERIC(10, 2),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 7. ORDERS, ESCROWS & DISPUTES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(100) PRIMARY KEY, -- e.g., 'ORD-548102'
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    coupon_code VARCHAR(50) REFERENCES coupons(code) ON DELETE SET NULL,
    subtotal NUMERIC(15, 2) NOT NULL,
    discount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'
    shipping_address JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(100) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    seller_id VARCHAR(100) NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    quantity INT NOT NULL,
    selected_attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'Confirmed', -- Supports Split Order Status
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(100) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(100) NOT NULL,
    description TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(100) PRIMARY KEY, -- e.g. transaction ID
    order_id VARCHAR(100) NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    payment_method VARCHAR(50) NOT NULL, -- 'stripe', 'razorpay', 'wallet', 'paypal'
    amount NUMERIC(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status VARCHAR(50) NOT NULL, -- 'Pending', 'Succeeded', 'Failed', 'Refunded'
    gateway_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refunds (
    id VARCHAR(100) PRIMARY KEY,
    payment_id VARCHAR(100) NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL,
    reason TEXT,
    status VARCHAR(50) NOT NULL, -- 'Pending', 'Processed', 'Failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shipments (
    id VARCHAR(100) PRIMARY KEY, -- e.g., tracking ID
    order_id VARCHAR(100) NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    carrier VARCHAR(100) NOT NULL, -- 'DHL', 'FedEx', 'UPS'
    tracking_number VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'Shipped', 'In-Transit', 'Out-for-Delivery', 'Delivered'
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    actual_delivery TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(100) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    details TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Opened', -- 'Opened', 'Under-Investigation', 'Resolved', 'Closed'
    resolution TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS escrow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(100) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    seller_id VARCHAR(100) NOT NULL REFERENCES sellers(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Held', -- 'Held', 'Released', 'Refunded'
    held_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    released_at TIMESTAMP WITH TIME ZONE
);

-- ----------------------------------------------------------------------------
-- 8. COMMUNICATIONS, INTELLIGENCE & ANALYTICS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(100) PRIMARY KEY, -- e.g., 'rev-1'
    product_id VARCHAR(100) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    reviewer_name VARCHAR(150) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    verified_purchase BOOLEAN NOT NULL DEFAULT TRUE,
    helpful_count INT NOT NULL DEFAULT 0,
    media_urls TEXT[] NOT NULL DEFAULT '{}'::text[],
    pros TEXT[] NOT NULL DEFAULT '{}'::text[],
    cons TEXT[] NOT NULL DEFAULT '{}'::text[],
    review_date DATE NOT NULL,
    ai_sentiment VARCHAR(30) NOT NULL DEFAULT 'neutral', -- 'positive', 'neutral', 'negative'
    is_fake BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'order_status', 'price_alert', 'promo', 'security'
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recommendations (
    product_id VARCHAR(100) PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
    frequently_bought_together TEXT[] NOT NULL DEFAULT '{}'::text[],
    similar_products TEXT[] NOT NULL DEFAULT '{}'::text[],
    upsell_options TEXT[] NOT NULL DEFAULT '{}'::text[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL, -- 'view', 'cart_add', 'purchase', 'search'
    payload JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(255) NOT NULL,
    user_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'Success', 'Warning', 'Alert'
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 9. PERFORMANCE OPTIMIZATION INDEXES
-- ----------------------------------------------------------------------------

-- Standard indices for foreign keys and quick queries
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id, subcategory);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_seller ON order_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_carts_user ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);

-- Full-text GIN index for robust fast prefix lexical search
CREATE INDEX IF NOT EXISTS idx_products_search_trgm ON products USING gin (title gin_trgm_ops, subcategory gin_trgm_ops, description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_sellers_search_trgm ON sellers USING gin (name gin_trgm_ops);
