# Ocean: DevOps & Infrastructure Specification v1.0
## Continuous Deployment, Environment Configuration, and Container Lifecycle

This document defines Ocean's continuous integration and continuous deployment (CI/CD) pipelines, development runtime configurations, production container specs, and active service health monitoring.

---

## 1. Continuous Integration & Deployment Funnel

Ocean employs an automated Git-driven delivery workflow. Every code revision committed to the production branch triggers automatic linting, building, and deployment to high-availability hosting infrastructure.

```
       [ Developer Commit ]
                │
                ▼
       [ GitHub repository ] ──► Trigger Action Workflow
                │
                ▼
       [ CI Pipeline (Test) ]
                ├── Unit Tests (Jest)
                ├── Integration Tests (Supertest)
                └── Code Linter (ESLint)
                │
                ▼
       [ CD Pipeline (Build) ]
                ├── Compile Frontend Assets (Vite)
                ├── Bundle Backend Server (esbuild)
                └── Create Docker Container
                │
                ▼
       [ Cloud Container Registry ]
                │
                ▼
       [ Production Cloud Run ] ──► Canary Deployment (10% -> 100%)
```

---

## 2. Docker Container Configuration

Ocean relies on a lightweight, multi-stage Docker build to keep images extremely compact, secure, and fast to download during cold starts:

```dockerfile
# --- Stage 1: Build & Bundle ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 2: Minimalist Production Run ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "run", "start"]
```

### Container Specifications & Port Mapping
* **Ingress Mapping:** The container must expose and bind to **Port 3000** on host `0.0.0.0` (required for routing).
* **Base Image OS:** Alpine Linux is selected to minimize container footprints and eliminate system-level security vulnerabilities.

---

## 3. Deployment Environments & Configurations

We split deployment configurations across three isolated development environments to protect user-facing data consistency:

1. **Local Development Environment (`development`):**
   - Configured via local `.env`.
   - Mounts local database instances (such as a local PostgreSQL or mock data stores).
   - Serves hot-reloaded assets directly through Vite.
2. **Staging / QA Environment (`staging`):**
   - Live web previews deployed automatically on pull requests to allow design team reviews.
   - Utilizes testing database instances, mimicking production dimensions.
3. **Production Global Environment (`production`):**
   - Scaled across high-availability Cloud Run endpoints.
   - Backed by high-capacity persistent Cloud SQL and S3 buckets.
   - Enforces strict security configurations, CDN page caching, and error trackers.

---

## 4. Live Health Checking & Logging

To maximize availability and achieve our target LCP metrics, we monitor containers continuously:
* **Liveness Probe:** `GET /api/v1/health`. Verifies the container's core process is running. If this probe returns a status other than 200, the routing platform restarts the container.
* **Readiness Probe:** `GET /api/v1/health/db`. Confirms active connections can be established with downstream databases and cache layers.
* **Structured System Logs:** All server logs must be output to `stdout` in structured JSON format rather than plain strings, enabling automated parsers to flag and categorize errors.
