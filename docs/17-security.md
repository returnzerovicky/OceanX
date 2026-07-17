# Ocean: Security Specification v1.0
## Identity Protection, Threat Prevention, and Platform Integrity

This document establishes the security specifications, threat mitigations, and compliance boundaries required to protect the Ocean multi-tenant marketplace, our merchants, and our buyers.

---

## 1. Authentication Lifecycle & Refresh Tokens

Ocean implements a robust **Two-Tier JSON Web Token (JWT) Session Architecture** to eliminate cross-site scripting (XSS) risks while maintaining seamless persistent login states.

```
   [ Buyer App ]                                           [ Auth Gateway ]
         │                                                         │
         ├───────► Submit Credentials (email/password) ───────────►┤
         │◄─────── Send Auth Token (JSON) & Refresh Token (Cookie) ├─ Set HttpOnly, Secure
         │                                                         │
         │                                                         │
         ├───────► Request with Auth Token (Header) ──────────────►┤
         │◄─────── Response (HTTP 200) ────────────────────────────┤
         │                                                         │
         │ --[ Auth Token Expires ]--                              │
         │                                                         │
         ├───────► Request with Expired Token ────────────────────►┤
         │◄─────── Response (HTTP 401 Unauthorized) ───────────────┤
         │                                                         │
         ├───────► POST /api/v1/auth/refresh (Cookie) ────────────►┤
         │◄─────── Send New Auth Token (JSON) ─────────────────────┤
```

### A. Access Tokens (Short-Lived)
- **Payload:** Contains non-sensitive metadata (`userId`, `role`, `email`).
- **Signature:** Encrypted with high-entropy keys (`HMAC-SHA256`).
- **Expiry:** Strictly limited to **15 minutes**.
- **Delivery:** Transmitted back to the client application inside the JSON response payload.

### B. Refresh Tokens (Long-Lived)
- **Entropy:** Unique, cryptographically secure 128-character strings.
- **Expiry:** Set to **7 calendar days**.
- **Storage:** Saved on the server inside the session database and delivered to the client as an **`HttpOnly`**, **`Secure`**, **`SameSite=Strict`** cookie.
- **Protection:** JavaScript code inside the browser cannot read or access this cookie, completely mitigating standard session hijacking.

---

## 2. Threat Mitigation & Prevention Protocols

To secure Ocean's database and user interfaces, we enforce automated input sanitization and strict routing defenses:

### A. Cross-Site Scripting (XSS) Mitigation
- **Input Sanitization:** All text inputs (e.g., product reviews, seller bios) are passed through strict HTML escape sanitizers before database storage.
- **Content Security Policy (CSP):** The Express server issues a robust CSP header:
  ```http
  Content-Security-Policy: default-src 'self'; script-src 'self'; img-src 'self' data: https://assets.ocean.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; connect-src 'self' https://api.stripe.com;
  ```

### B. Cross-Site Request Forgery (CSRF) Mitigation
- All state-changing API endpoints (`POST`, `PUT`, `DELETE`) require a validated double-submit token structure.
- Cookies are limited to `SameSite=Strict` to prevent the browser from appending session metadata during cross-origin redirections.

### C. SQL Injection Mitigation
- The backend relies on standard parameterized Object Relational Mappings (ORMs) or prepared statements.
- Direct string concatenations within SQL queries are strictly prohibited.

---

## 3. Dynamic API Rate-Limiting & DDOS Protections

To prevent systematic scraper scraping and brute-force service degradation, the Express Gateway implements dual-layer rate limiting:

| Target Endpoint Range | Window | Max Requests | Response Code | Action Taken |
| :--- | :--- | :--- | :--- | :--- |
| `/api/v1/auth/login` | 15 Mins | 5 | `429 Too Many Requests` | Temp block IP and log event. |
| `/api/v1/checkout/*` | 1 Min | 10 | `429 Too Many Requests` | Intercept and prompt CAPTCHA. |
| All standard `GET` requests | 1 Min | 120 | `429 Too Many Requests` | Throttled access. |

---

## 4. Merchant KYC & Compliance Protections

To protect the platform's financial integrity and prevent seller fraud:
* **KYC Gateway Verification:** Newly registered sellers are placed in a **`pending`** state. Their accounts cannot list products or receive payouts until an admin reviews their uploaded government documentation.
* **Audit Logs:** All admin panel actions (approvals, dispute rejections, manual refund overrides) are recorded in an immutable, read-only audit log table.
* **Secrets Management:** Sensitive integration keys (Stripe API Keys, Google Workspace Secrets) are injected into container environments at runtime. Hardcoding keys within source files is strictly prohibited.
