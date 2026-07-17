# Ocean: Search Architecture Specification v1.0
## Keyword Extraction, Vector Embeddings, and Hybrid Ranking Pipelines

This document details Ocean's search architecture. To support natural language queries while returning rapid, precise results, Ocean implements a high-performance **Hybrid Search Pipeline** that combines traditional lexical matching with neural vector embeddings.

---

## 1. Unified Search Pipeline

The search pipeline handles incoming user queries by analyzing text, fetching matches from both lexical (SQL/text indexing) and vector data stores, and fusing the results to produce a balanced, highly relevant list of products.

```
                                [ User Search Query ]
                                          │
                                          ▼
                       ┌─────────────────────────────────────┐
                       │       Express API Search Router     │
                       └──────────────────┬──────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     ┌─────────────────────────┐                     ┌─────────────────────────┐
     │  Lexical Search Path    │                     │   Vector Search Path    │
     │  - Tokenize query       │                     │  - Gemini Embedding API │
     │  - SQL LIKE / FullText  │                     │  - Vector Similarity    │
     └────────────┬────────────┘                     └────────────┬────────────┘
                  │                                               │
                  ▼                                               ▼
           [ Lexical Hits ]                                [ Vector Hits ]
                  │                                               │
                  └───────────────────────┬───────────────────────┘
                                          │
                                          ▼
                       ┌─────────────────────────────────────┐
                       │     Reciprocal Rank Fusion (RRF)    │
                       │   (Scores combined, duplicates out) │
                       └──────────────────┬──────────────────┘
                                          │
                                          ▼
                       ┌─────────────────────────────────────┐
                       │       Filter & Sort Resolver        │
                       │     (In-stock status, Category)     │
                       └──────────────────┬──────────────────┘
                                          │
                                          ▼
                               [ Ranked Final Results ]
```

---

## 2. Dual-Engine Retrieval System

### A. Lexical (Keyword) Engine
* **Purpose:** Ensures exact keyword matching for brand names, SKU numbers, and precise model labels (e.g., "WH-1000XM4").
* **Implementation:** Leverages PostgreSQL full-text search indexes with word stemming, stopword removal, and fuzzy edit-distance (Levenshtein) lookups.

### B. Semantic (Vector) Engine
* **Purpose:** Understands abstract customer intent, synonyms, and natural-language queries (e.g., "minimalist workspace desk under 500 dollars").
* **Implementation:**
  1. The user's search string is sent to the **`text-embedding-004`** model via the Gemini API, returning a 768-dimensional dense vector.
  2. The vector is matched against a vector index in PostgreSQL (using `pgvector`) or a specialized vector store, utilizing Cosine Similarity metrics.

---

## 3. Hybrid Ranking (Reciprocal Rank Fusion)

To combine results from both search paths, the Search Service uses the **Reciprocal Rank Fusion (RRF)** algorithm:

- Given a document $d$, its RRF score is calculated as:
  $$RRF(d) = \sum_{m \in M} \frac{1}{k + r_m(d)}$$
  Where:
  - $M$ = Set of retrieval paths (Lexical, Vector).
  - $r_m(d)$ = The ordinal rank of document $d$ inside retrieval path $m$.
  - $k$ = A constant stabilizer (default: `60`).
- The fused items are sorted by their RRF score, ensuring exact matches and semantic fits are ranked highest.

---

## 4. Operational Filter Resolve & Performance

- **Post-Query Filtering:** Filters (Category selection, price ceilings, stock status) are resolved directly within the final database query to keep results precise.
- **Latency Target:** The search execution lifecycle—including vector generation, DB lookup, and ranking fusion—must complete in **under 350ms** to satisfy Ocean's INP targets.
