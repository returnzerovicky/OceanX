# Ocean: SRE & Reliability Engineering Guide v1.0
## Service Level Objectives, Error Budgets, Disaster Recovery, and Incident Response

This document establishes Ocean's site reliability engineering (SRE) targets, defines our metrics calculations, and schedules our backup, failover, and operational response protocols.

---

## 1. SLI, SLO, and SLA Definitions

We align SRE practices with clear, mathematically validated targets:

```
  [ Service Level Indicators ] ──► [ Service Level Objectives ] ──► [ Service Level Agreement ]
  (Actual live performance)        (Internal engineering targets)   (Contractual user guarantees)
```

### A. Availability SLO
* **SLI Calculation:**
  $$Availability = \frac{\text{Successful Requests (HTTP codes } \neq 5xx\text{)}}{\text{Total Valid Requests}} \times 100$$
* **SLO Target:** **99.95%** calculated over a rolling 30-day window.
* **Contractual SLA:** **99.9%** availability guarantee to merchant stores.

### B. Latency (Speed) SLO
* **SLI Calculation:** Percentage of valid GET requests completed in under 200ms.
* **SLO Target:** **95.0%** of requests under 200ms.

---

## 2. Dynamic Error Budgets

Our 30-day Availability SLO (99.95%) yields a strict monthly **Error Budget**:

$$\text{Error Budget} = 100\% - 99.95\% = 0.05\% \text{ allowable failures}$$

### Error Budget Policy Rules:
- **Budget > 20% remaining:** Green zone. Feature development continues as planned.
- **Budget < 10% remaining:** Amber zone. Code changes are heavily audited, and performance reviews are scheduled.
- **Budget Exhausted (0%):** Red zone. **All feature shipments freeze.** The engineering team shifts 100% of their velocity to debugging stability, optimizing queries, and resolving underlying errors.

---

## 3. Database Backup & Disaster Recovery (DR)

To prevent catastrophic data loss under physical cloud center outages, PostgreSQL and storage layers follow scheduled replication protocols:

### A. Recovery Metrics
- **RPO (Recovery Point Objective):** **< 5 minutes.** The maximum period of transactional data we can afford to lose in a crash.
- **RTO (Recovery Time Objective):** **< 15 minutes.** The maximum time our platform can remain offline before failovers must execute.

### B. Replication & Backups
- **Continuous Write-Ahead Logs (WAL):** Database state changes are archived continuously to remote, isolated cloud object buckets.
- **Automated Snapshots:** Fully comprehensive database snapshots are executed automatically every 24 hours (retained for 30 rolling days).
- **Multi-Region Replica:** A hot-standby Postgres replica is kept synchronized in an isolated cloud zone, ready to take over traffic instantly.

---

## 4. Incident Response Procedure

When an P0 or P1 alarm triggers, SREs follow a structured incident management loop:

```
[ Alarm Triggers ] ──► [ 1. Triage & Verify ] ──► [ 2. Mitigate / Failover ] ──► [ 3. Post-Mortem ]
```

1. **Triage & Establish Commander:** The first responder acknowledges the alert, declares an incident, and designates an Incident Commander to coordinate investigations.
2. **Mitigation (Stop the Bleeding):** Priority is placed on restoring service, not debugging the root cause. This includes rolling back the latest commit, shifting traffic to standby instances, or scaling connection pools.
3. **Communication:** Inform merchants and active buyers of platform status via our public Status page. Update estimates every 15 minutes.
4. **Post-Mortem Review:** Within 48 hours of resolution, the team holds a blameless post-mortem to analyze the root cause, compile action items, and update SRE playbooks.
