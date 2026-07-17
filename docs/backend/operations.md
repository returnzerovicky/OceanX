# Ocean Operations: DevOps, SRE & Disaster Recovery Guide (v4.0)

This document describes the DevOps pipelines, deployment flows, system monitoring, and disaster recovery plans for Ocean.

---

## 1. DevOps & Production Infrastructure

Ocean's production infrastructure is managed using **Infrastructure-as-Code (Terraform)** and deployed onto highly scalable **Kubernetes** clusters (e.g., GKE or EKS).

```
               [ Cloudflare DNS & WAF ]
                          │
                          ▼
            [ Kubernetes Ingress Controller ]
                          │
          ┌───────────────┴───────────────┐
          ▼ (Autoscaling Pods)            ▼ (Autoscaling Pods)
   [ Ocean App Pod 1 ]             [ Ocean App Pod 2 ]
```

### Production Dockerfile
The application uses a multi-stage Docker build to keep the production image size small, secure, and optimized:
```dockerfile
# Stage 1: Build dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Run container
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

### Deployment Strategies
* **Rolling Updates**: Standard deployment strategy where pods are updated incrementally (e.g., `maxSurge: 25%`, `maxUnavailable: 0%`) to ensure zero-downtime.
* **Canary Deployments**: Route a small fraction of real traffic (e.g., 2% -> 10%) to the new build using the Nginx Ingress Controller before rolling it out to all users:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ocean-app-canary
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "10"
spec:
  rules:
  - host: api.oceanmarketplace.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ocean-service-canary
            port:
              number: 3000
```

---

## 2. Advanced Performance Monitoring (Observability)

Observability utilizes a modern monitoring stack to track system health, trace bottlenecks, and alert engineers before issues impact users.

```
                  ┌──────────────────────────────────────────────┐
                  │                 OpenTelemetry                │
                  └──────────────────────┬───────────────────────┘
                                         ▼
            ┌────────────────────────────────────────────────────────┐
            │ Metrics: Prometheus scrapes JVM, Node, and PG metrics  │
            ├────────────────────────────────────────────────────────┤
            │ Logs: Vector forwards JSON-formatted logs to Grafana   │
            ├────────────────────────────────────────────────────────┤
            │ Tracing: Jaeger tracks request flows across services   │
            └────────────────────────────────────────────────────────┘
```

### Monitoring Configuration Details
* **Prometheus**: Scrapes standard application endpoints (`/metrics`) to collect details on memory usage, CPU load, and database connection states.
* **Grafana Dashboards**: Visualizes key metrics like Request Rate, Latency, and Error Rates.
* **Loki / Vector**: Aggregate and search structured logs in JSON format.
* **Alerting Policies**: Automated notifications trigger on PagerDuty or Slack when critical thresholds are crossed:
  * *Alert 1*: API p99 latency crosses > 500ms for more than 2 minutes.
  * *Alert 2*: HTTP 5xx error rate exceeds > 1% of total requests over a 1-minute window.
  * *Alert 3*: Host memory or disk storage utilization exceeds > 85%.

---

## 3. Disaster Recovery (DR) Plan

To support high-scale operations, Ocean implements strict Recovery Point Objective (RPO) and Recovery Time Objective (RTO) targets:

* **Target RPO (Data Loss Window)**: $< 5$ minutes.
* **Target RTO (Downtime Window)**: $< 15$ minutes.

### Backup & Failover Configurations
* **Database Replication**: Uses active-passive database clustering. All write operations target the primary node, while read-only traffic is balanced across read replicas.
* **Continuous Point-In-Time Recovery (PITR)**: Write-Ahead Logs (WAL) are continuously archived to secure cloud storage buckets (e.g., Google Cloud Storage or AWS S3), allowing the database to be restored to any exact millisecond within a 30-day window.
* **Multi-Region Failover**: In the event of a catastrophic cloud provider outage in the primary region, DNS routing policies automatically fail over traffic to the secondary region using Cloudflare's Global Traffic Manager.

---

## 4. Production Runbook (Incident Response)

### Scenario: High API Latency & DB Connection Exhaustion

#### Step 1: Triage & Identification
1. Open the Grafana Dashboard and navigate to the **PostgreSQL Connection Pool** panel.
2. Check if active connections have reached the maximum pool size (`max_connections`).
3. Run the following query on the read-replica to locate slow-running queries:
```sql
SELECT pid, age(clock_timestamp(), query_start), usename, state, query 
FROM pg_stat_activity 
WHERE state != 'idle' 
ORDER BY age DESC 
LIMIT 5;
```

#### Step 2: Immediate Mitigation
* **Case A: Rogue query blocking transactions**
  1. Terminate the query process using its PID:
  ```sql
  SELECT pg_terminate_backend(<PID>);
  ```
* **Case B: Sudden traffic surge**
  1. Scale the application pods on Kubernetes:
  ```bash
  kubectl scale deployment/ocean-app --replicas=30
  ```
  2. Increase the Redis cache expiration window for high-traffic endpoints to reduce database read load.

#### Step 3: Post-Mortem & Preventative Action
1. Analyze the root cause of the query failure.
2. Add missing table indexes or restructure queries to prevent database bottlenecks.
3. Update database resource limits and adjust auto-tuning parameters if necessary.
