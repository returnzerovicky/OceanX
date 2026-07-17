# Ocean: Operational Monitoring & Metrics Specification v1.0
## Tracking Live Performance, Error Frequencies, and Alerting Triggers

This document establishes Ocean's performance budgets, system log guidelines, telemetry parameters, and live alerting thresholds to maintain professional service reliability.

---

## 1. High-Precision Latency & Budget Thresholds

We track the operational health of Ocean across several target thresholds. Any breach of these budgets triggers automated DevOps warnings:

| Service Subsystem | Target Latency (p95) | Degradation Trigger (p99) | Critical Alarm Trigger | Tracking Log Channel |
| :--- | :--- | :--- | :--- | :--- |
| **API Gateway Ingress** | `< 20ms` | `> 50ms` | `> 100ms` | `express.gateway` |
| **Product Search (Lexical)** | `< 50ms` | `> 120ms` | `> 250ms` | `search.lexical` |
| **AI Vector Embeddings** | `< 180ms` | `> 350ms` | `> 500ms` | `ai.gemini.embeddings`|
| **AI Insights generation** | `< 1200ms` | `> 2500ms` | `> 4000ms` | `ai.gemini.pro` |
| **Recommendation Engine** | `< 80ms` | `> 200ms` | `> 350ms` | `recs.similarity` |
| **Database Query (SQL)** | `< 15ms` | `> 50ms` | `> 150ms` | `db.postgresql` |
| **Stripe Checkout Webhooks** | `< 250ms` | `> 800ms` | `> 1500ms` | `billing.stripe` |

---

## 2. Platform Uptime & Error Frequency Budgets

We maintain strict error frequency and operational budgets:
- **Global Ingress Availability:** **99.95%** monthly uptime.
- **Max HTTP 5xx Error Rate:** Less than **0.05%** of overall daily traffic.
- **Payment Processing success rate:** **99.9%** successful payment captures (excluding standard customer card rejections).
- **Cache Hit Ratio (Redis):** Greater than **85%** of read queries.

---

## 3. High-Priority Alerting Triggers

Our monitoring platform (e.g. Datadog / Google Cloud Monitoring) aggregates telemetry and fires high-severity alarms when the following thresholds are breached:

### A. Core Database Exhaustion Alarm (P0 - Immediate Page)
- **Condition:** CPU Utilization exceeds **85%** for over 3 minutes OR active database connection count exceeds **90%** of max pool capacity.
- **Action:** Triggers P0 incident response, scales active Cloud SQL read replicas, and sends urgent SMS alerts to the SRE roster.

### B. Checkout Failure Alarm (P0 - Immediate Page)
- **Condition:** Payment webhook callbacks return non-200 HTTP codes or timeout consecutively for 3 purchase attempts.
- **Action:** Instantly escalates to billing leads, freezes non-idempotent checkout queues, and switches to fallback payment processing networks.

### C. Gemini AI Exhaustion Alarm (P2 - Developer Warning)
- **Condition:** Rate limit errors (`HTTP 429 - Quota Exceeded`) from the Google GenAI SDK exceed 10 instances inside a 5-minute window.
- **Action:** Silently redirects search queries to exact-match lexical parsers, disables interactive recommendations, and queues a DevOps backlog ticket to request a quota increase.
