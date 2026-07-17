# Ocean: Documentation Versioning & Changelog v3.0
## Tracking the Iterative Evolution of Our Product and Technical Specifications

To ensure our documentation remains a living and accurate reflection of Ocean's codebase, this document tracks revisions, versioning rules, and historical changelogs across our engineering specifications.

---

## 1. Documentation Versioning Standards

Our documentation suite adheres to a versioning system that maps directly to product milestones:

```
    v1.0 (Foundation)   ──►   v1.1 (Incremental)   ──►   v2.0 (Deep Integration)
    - Initial Schemas         - Spacing tokens            - Hybrid AI search
    - Portals & Gateway       - Basic filters             - Stripe split checkouts
```

### Versioning Rules:
- **Major Releases (vX.0):** triggered by major architectural shifts (e.g. migrating databases, introducing server-side AI, or transitioning from single-vendor to multi-vendor split checkouts).
- **Minor Releases (v1.X):** triggered by incremental API modifications, design token expansions, or new portal layout updates.
- **Revision Patches (v1.1.X):** triggered by simple typo corrections, clarified descriptions, or visual asset improvements.

---

## 2. Integrated Specifications Changelog

The following log chronicles the evolution of Ocean's technical specifications:

### Version 3.0 (Current Version - July 12, 2026)
* **Goal:** Hardening our specifications into living development resources, establishing figma-parity pipelines, and documenting operational site reliability constraints.
* **Added Architectural Diagrams:** Created a comprehensive vector visual directory (`/docs/31-system-diagrams.md`) detailing authentication flows, checkout sequences, hybrid search pipelines, and database ERDs.
* **Established ADRs:** Created an architecture decision archive (`/adr/`) documenting key database choices, ranking algorithms (RRF), token designs, and event-driven pipelines.
* **Added Storybook Specs:** Documented reusable component isolation models, axe-core automated accessibility audits, and responsive viewport tests.
* **Added SRE & Monitoring Specs:** Defined Service Level Objectives (SLOs), Service Level Indicators (SLIs), Error Budgets, and high-priority database/checkout alert triggers.
* **Added Product Metric Maps:** Linked core engineering capabilities (low latency, AI search) directly to ten business metrics (search success rate, zero-result rates, checkout conversions, and retention).

### Version 2.0 (June 10, 2026)
* **Goal:** Introducing server-side AI, hybrid search pipelines, and financial escrow infrastructure.
* **Added AI Search Specs:** Documented the dual-engine retrieval pipeline combining lexical text indexes with Gemini `text-embedding-004` dense vector embeddings.
* **Added Financial Escrow Specs:** Outlined Stripe Connect multi-vendor splits, commission rates, and the 14-day post-delivery freeze logic.
* **Added Personalization Engine:** Defined the customer category affinity score formula and pricing band sensitivity calculations.

### Version 1.1 (May 02, 2026)
* **Goal:** Standardizing our brand styling, component templates, and directory structures.
* **Added Design Tokens:** Published the master design token dictionary (`/docs/29-tokens.json`) with unified colors, corner radii, and spacing scales.
* **Added Portal Specs:** Outlined separate access rules for the Buyer Portal, Seller Dashboard, Warehouse Portal, and Courier Tracker.

### Version 1.0 (April 15, 2026)
* **Goal:** Establishing product foundations and baseline system architectures.
* **Added Core Specs:** Created initial PRDs, information architecture diagrams, database schemas, and baseline backend API routing specs.
