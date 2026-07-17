# RFC-002: Internationalization & Cross-Border Expansion
## Author: Architecture Group (Internationalization Taskforce)

### 1. Abstract / Problem Statement
Ocean currently targets a single-region (domestic US) audience, handling USD transactions and shipping via domestic carriers. To open our platform to international curators and global buyers, we need to adapt our backend engine to support:
- Multi-currency storage, conversion, and settlement.
- Dynamically localized catalogs and descriptions.
- Cross-border customs, duties, and logistics pipelines.

This RFC outlines our architectural roadmap to support internationalized operations.

---

### 2. Architectural Design Specifications

#### A. Multi-Currency Schema Expansion
All pricing coordinates must transition from scalar values to currency-keyed structures. We will implement database pricing bands for key global currencies (EUR, GBP, JPY, CAD) to avoid unstable live-conversion calculations:

```sql
CREATE TABLE product_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  currency_char VARCHAR(3) NOT NULL, -- 'USD', 'EUR', etc.
  amount DECIMAL(12, 2) NOT NULL,
  compare_at_amount DECIMAL(12, 2),
  UNIQUE(product_id, currency_char)
);
```

#### B. Dynamic Translation Pipeline (Gemini AI Integration)
Instead of forcing sellers to manually translate product details, we will implement an automated, real-time translating middleware powered by Gemini.
- **Workflow:** When a seller publishes or edits a listing in their native language, an asynchronous hook dispatches the copy to `gemini-2.5` to generate localization mappings.
- **Storage:** Translated strings are indexed in localized catalog indexes to ensure localized searches return fast, accurate results.

```
[ Seller Uploads listing (English) ]
                │
                ▼
      ( PostgreSQL Write )
                │
                ▼
      [ Trigger Event Bus ] ──► [ Gemini translation service ]
                                               │
                                               ▼
                              [ Writes EUR/JPY catalogs ]
```

#### C. Cross-Border Customs & Duty Calculations
We will integrate a specialized tax engine (e.g., Stripe Tax or Avalara) inside our Express API Gateway checkout pipeline:
- Calculates real-time land-cost duties (DDP - Delivered Duty Paid) at the checkout screen.
- Collects and aggregates localized VAT/GST charges dynamically, avoiding import customs holds.

---

### 3. Implementation Phases

1. **Phase 1 (Infrastructure):** Currency tables and localized database schema deployments.
2. **Phase 2 (Localization):** Automated AI-powered catalog translations and localized currency routers.
3. **Phase 3 (Logistics):** Stripe Tax integrations and international carrier routing setups.
