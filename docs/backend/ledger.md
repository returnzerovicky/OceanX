# Ocean Financial Ledger & Double-Entry Bookkeeping System (v4.0)

This document specifies the database schemas, mathematical equations, and query pipelines for Ocean's **Marketplace Financial Ledger System**. It implements a double-entry bookkeeping architecture to ensure absolute auditability and financial reconciliation.

---

## 1. Double-Entry Bookkeeping Architecture

In high-scale financial platforms, updating basic customer and seller balances using simple update statements (e.g., `SET balance = balance + X`) is highly vulnerable to race conditions, currency drift, and database locks.

Ocean uses a **Double-Entry Bookkeeping Model**:
* Every financial movement is represented by a **Transaction** containing at least one **Debit** (funds leaving an account) and one **Credit** (funds entering an account).
* The sum of debits and credits within any transaction must always equal zero:
  $$\sum \text{Debits} + \sum \text{Credits} = 0$$
* Account balances are calculated dynamically by summing their historic ledger entries, ensuring an immutable audit trail.

---

## 2. Multi-Tenant Financial Schema

Below is the complete, production-ready PostgreSQL DDL schema designed to manage platform ledgers, seller balances, customer wallets, escrows, platform commissions, and automated reconciliation processes.

```sql
-- ============================================================================
-- OCEAN ENTERPRISE MARKETPLACE - FINANCIAL LEDGER SCHEMA DDL
-- ============================================================================

-- 1. LEDGER ACCOUNTS DEFINITION
CREATE TABLE IF NOT EXISTS ledger_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_number VARCHAR(100) NOT NULL UNIQUE,
    account_name VARCHAR(150) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'
    owner_id VARCHAR(100) NOT NULL,    -- References users.id, sellers.id, or 'PLATFORM'
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. IMMUTABLE FINANCIAL TRANSACTIONS
CREATE TABLE IF NOT EXISTS ledger_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_id VARCHAR(100) NOT NULL,   -- Associated Order ID, Refund ID, or Dispute ID
    transaction_type VARCHAR(100) NOT NULL, -- 'Order_Purchase', 'Escrow_Release', 'Platform_Fee_Cut', 'Payout'
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. LEDGER ENTRIES (JOURNAL LINE ITEMS)
CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES ledger_transactions(id) ON DELETE RESTRICT,
    account_id UUID NOT NULL REFERENCES ledger_accounts(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 4) NOT NULL, -- Positive represents Credit (funds entering), Negative represents Debit (funds leaving)
    entry_sequence INT NOT NULL,    -- Line sequence within the transaction (0, 1, 2)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_non_zero CHECK (amount <> 0.0000)
);

-- 4. ESCROW BALANCE LEDGERS
CREATE TABLE IF NOT EXISTS escrow_ledgers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(100) NOT NULL,
    seller_id VARCHAR(100) NOT NULL,
    total_amount NUMERIC(15, 4) NOT NULL,
    platform_commission NUMERIC(15, 4) NOT NULL,
    seller_payout NUMERIC(15, 4) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Held', -- 'Held', 'Released', 'Refunded', 'Arbitrated'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. DAILY RECONCILIATION AUDIT LOGS
CREATE TABLE IF NOT EXISTS financial_reconciliations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reconciliation_date DATE NOT NULL UNIQUE,
    total_transactions_processed INT NOT NULL,
    sum_debits NUMERIC(18, 4) NOT NULL,
    sum_credits NUMERIC(18, 4) NOT NULL,
    discrepancy_detected BOOLEAN NOT NULL DEFAULT FALSE,
    audit_log JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- INDEXES FOR FINANCIAL PERFORMANCE & RECONCILIATION AUDITS
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ledger_accounts_owner ON ledger_accounts(owner_id);
CREATE INDEX IF NOT EXISTS idx_ledger_transactions_ref ON ledger_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_account ON ledger_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_composite ON ledger_entries(account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_escrow_ledgers_order ON escrow_ledgers(order_id);
```

---

## 3. High-Security Ledger Transaction Workflows

This section provides complete PostgreSQL transaction blocks detailing how payments are routed through the double-entry ledger.

### Scenario A: Customer Completes an Order Payment ($200.00)
When a customer pays $200.00 for an order, the funds are deposited into the platform's central Escrow ledger account pending the return window, updating the corresponding entries:
1. Debit the customer's payment balance (-$200.00).
2. Credit the platform's central Escrow asset account (+$200.00).

```sql
BEGIN TRANSACTION;

-- 1. Create the general transaction header
INSERT INTO ledger_transactions (id, reference_id, transaction_type, idempotency_key, description)
VALUES (
    't_88291a92_pay'::uuid, 
    'ord_88291a92', 
    'Order_Purchase', 
    'idem_88291a92_payment_charge', 
    'Customer purchase credit transaction to platform escrow'
);

-- 2. Debit Customer Wallet Account (Leaving User Wallet)
INSERT INTO ledger_entries (transaction_id, account_id, amount, entry_sequence)
VALUES (
    't_88291a92_pay'::uuid, 
    (SELECT id FROM ledger_accounts WHERE owner_id = 'usr_9281a8f3b' AND account_type = 'Asset'), 
    -200.0000, 
    0
);

-- 3. Credit Platform Escrow Holding Account (Entering Escrow Liability)
INSERT INTO ledger_entries (transaction_id, account_id, amount, entry_sequence)
VALUES (
    't_88291a92_pay'::uuid, 
    (SELECT id FROM ledger_accounts WHERE owner_id = 'PLATFORM' AND account_name = 'Central Escrow Asset Account'), 
    200.0000, 
    1
);

-- 4. Record the active escrow manager profile
INSERT INTO escrow_ledgers (order_id, seller_id, total_amount, platform_commission, seller_payout, status)
VALUES ('ord_88291a92', 'sel_301', 200.0000, 10.0000, 190.0000, 'Held');

COMMIT;
```

### Scenario B: Escrow Released & Payout Dispatched to Seller
When the 14-day return window expires, the escrow balance is released. The platform takes its 5% commission ($10.00), and pays the remaining balance ($190.00) into the seller's wallet:
1. Debit the Platform Escrow account (-$200.00).
2. Credit the Platform Revenue account (+$10.00).
3. Credit the Seller's Wallet account (+$190.00).

```sql
BEGIN TRANSACTION;

-- 1. Create the release transaction record
INSERT INTO ledger_transactions (id, reference_id, transaction_type, idempotency_key, description)
VALUES (
    't_88291a92_release'::uuid, 
    'ord_88291a92', 
    'Escrow_Release', 
    'idem_88291a92_release_disbursement', 
    'Escrow payout disbursement to seller minus platform commissions fee'
);

-- 2. Debit Platform Escrow Account (-200.00)
INSERT INTO ledger_entries (transaction_id, account_id, amount, entry_sequence)
VALUES (
    't_88291a92_release'::uuid, 
    (SELECT id FROM ledger_accounts WHERE owner_id = 'PLATFORM' AND account_name = 'Central Escrow Asset Account'), 
    -200.0000, 
    0
);

-- 3. Credit Platform Revenue Account (+10.00 commission)
INSERT INTO ledger_entries (transaction_id, account_id, amount, entry_sequence)
VALUES (
    't_88291a92_release'::uuid, 
    (SELECT id FROM ledger_accounts WHERE owner_id = 'PLATFORM' AND account_name = 'Platform Revenue Account'), 
    10.0000, 
    1
);

-- 4. Credit Seller Wallet Account (+190.00 payout)
INSERT INTO ledger_entries (transaction_id, account_id, amount, entry_sequence)
VALUES (
    't_88291a92_release'::uuid, 
    (SELECT id FROM ledger_accounts WHERE owner_id = 'sel_301' AND account_type = 'Asset'), 
    190.0000, 
    2
);

-- 5. Update the escrow status
UPDATE escrow_ledgers 
SET status = 'Released', updated_at = CURRENT_TIMESTAMP 
WHERE order_id = 'ord_88291a92';

COMMIT;
```

---

## 4. Platform Reconciliation & Auditing Pipelines

To guarantee absolute transactional integrity and detect potential fraud or bugs, an automated cron job runs at 11:59 PM nightly to perform a **Platform Reconciliation Audit**:

```sql
-- Dynamic query to verify if any transaction balances are incorrect
SELECT 
    t.id AS transaction_id, 
    t.reference_id, 
    SUM(e.amount) AS balance_discrepancy
FROM ledger_transactions t
JOIN ledger_entries e ON t.id = e.transaction_id
GROUP BY t.id, t.reference_id
HAVING SUM(e.amount) <> 0.0000;
```

### Automated Reconciliation Log Generation
The results of this audit are saved to the `financial_reconciliations` table. If any discrepancies are detected:
1. Discrepancy flags are raised immediately (`discrepancy_detected` set to `TRUE`).
2. The platform dispatches an urgent SMS and PagerDuty incident alert to the SRE and Financial Operations teams.
3. Automated payment payouts to sellers are temporarily frozen until the audit log is reviewed and cleared by administrators.
