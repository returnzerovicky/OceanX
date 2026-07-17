# Ocean Security, Cryptography & Compliance Guide (v4.0)

This document outlines the defensive security architecture, data isolation models, cryptographic strategies, and regulatory compliance standards for Ocean.

---

## 1. Authentication, Sessions & Cryptography

Ocean enforces a zero-trust architecture. All service communication is encrypted in transit using TLS 1.3, and critical data is encrypted at rest using AES-256 GCM.

```
                  ┌──────────────────────────────────────────────┐
                  │          Identity & Access Control           │
                  └──────────────────────┬───────────────────────┘
                                         ▼
            ┌────────────────────────────────────────────────────────┐
            │ JWT Token: HS256 / RS256 with 2048-bit Private Keys    │
            ├────────────────────────────────────────────────────────┤
            │ User Roles: Customer | Seller | Admin                  │
            ├────────────────────────────────────────────────────────┤
            │ Session: Sliding Window Refresh Token (Stored in DB)   │
            └────────────────────────────────────────────────────────┘
```

### Authentication Architecture
* **Access Tokens**: Short-lived (15 minutes) JSON Web Tokens (JWT) signed via HMAC SHA-256. They contain user identifiers, roles, and scope permissions.
* **Refresh Tokens**: Long-lived (7 days) randomly generated UUID v4 tokens securely saved in a partitioned database. This allows admins to invalidate sessions instantly if a user's device is compromised.
* **Storage**: Web applications must store JWT Access Tokens in memory and Refresh Tokens in secure, `HttpOnly`, `SameSite=Strict`, `Secure` cookies to protect against Cross-Site Scripting (XSS) attacks.

### Cryptographic Hashes
* **Password Hashing**: User passwords must be hashed using **bcrypt** with a work factor (salt rounds) of 12.
* **Sensitive Data Encryption**: PII (Personally Identifiable Information) like tax registrations or national IDs are encrypted using **AES-256-GCM** with keys managed by Google Cloud Key Management Service (KMS).

---

## 2. Advanced Rate Limiting Architecture

To prevent Distributed Denial of Service (DDoS) and brute-force attacks, rate limits are enforced at the Ingress proxy layer (NGINX) and inside the Express application middleware using Redis.

```ts
// Rate Limiter configuration in Express
import rateLimit from 'express-rate-limit';

export const standardRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: {
    status: 429,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many requests from this client. Please retry after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});
```

---

## 3. RBAC & ABAC Access Control Models

Ocean combines **Role-Based Access Control (RBAC)** for administrative grouping with **Attribute-Based Access Control (ABAC)** for contextual actions (e.g., ensuring a seller can only modify their own products).

```ts
// RBAC check middleware
export function requireRole(allowedRoles: string[]) {
  return (req: any, res: any, next: any) => {
    const user = req.user;
    if (!user || !user.roles.some((role: string) => allowedRoles.includes(role))) {
      return res.status(403).json({
        error: 'ACCESS_DENIED',
        message: 'You do not have the required role to access this resource.'
      });
    }
    next();
  };
}

// ABAC check middleware example for modifying a product
export function verifyProductOwnership() {
  return async (req: any, res: any, next: any) => {
    const userId = req.user.id;
    const { productId } = req.params;
    
    // Check if the user owns the product
    const product = await req.services.productService.getProduct(productId);
    if (!product || product.sellerId !== userId) {
      return res.status(403).json({
        error: 'ACCESS_DENIED',
        message: 'Resource ownership validation failed.'
      });
    }
    next();
  };
}
```

---

## 4. OWASP Top 10 Mitigation Strategies

The Ocean backend incorporates native guards against common web security vulnerabilities:

### SQL Injection
* **Remediation**: Avoid dynamic raw query concatenation. All database operations must go through the Type-Safe ORM or use parameterized SQL queries with bind arguments.

### Cross-Site Scripting (XSS)
* **Remediation**: All user inputs are sanitized to strip out executable script tags. Standard HTTP response headers must declare:
```http
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; frame-ancestors 'none';
```

### Cross-Site Request Forgery (CSRF)
* **Remediation**: State-changing operations (POST, PUT, DELETE) require a cryptographically signed CSRF token transmitted in custom headers, combined with `SameSite=Strict` cookie settings.

### Server-Side Request Forgery (SSRF)
* **Remediation**: Any outgoing request triggered by a user input (such as image URLs or webhooks) must be validated against a strict domain whitelist and prevented from accessing internal VPC IP ranges (e.g., `10.0.0.0/8`, `169.254.169.254`).

---

## 5. Regulatory Compliance & Guidelines

* **PCI DSS Compliance**: Ocean does **not** store or process raw credit card numbers. All card collection must use iframe injection elements provided directly by Stripe, returning a secure payment token to our servers. This minimizes our PCI DSS audit scope to SAQ-A.
* **GDPR Compliance**: The backend supports the **Right to be Forgotten** and **Data Portability**. Users can request full archives of their data or permanent deletion from the Postgres database.
* **SOC 2 Type II**: All high-privilege configuration modifications, system accesses, and audit logs are recorded immutably in the `audit_logs` table for compliance auditing.
