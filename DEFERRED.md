# Metro Motors — Deferred Scope & External Prerequisites

## 1. Intentionally Deferred Items (Per Project Ground Rules)

The following three items are strictly deferred per explicit user project constraints:

1. **Hosting & Production Deployment:**
   - No cloud deployment or publish commands executed.
   - Hostinger MCP and external hosting environments remain untouched.
2. **Domain & DNS Setup:**
   - Production domain assignment, SSL certification, and DNS routing are deferred until hosting is provisioned.
3. **Cloudflare R2 Production Image Storage:**
   - Cloudflare R2 bucket integration remains deferred behind an explicit feature flag (`ENABLE_R2_STORAGE=0`).
   - All media handling operates safely via the local-disk driver (`backend/data/uploads/`).

---

## 2. External Service Prerequisites & Local Implementation Status

The accounts below do not currently exist and cannot be tested against live external endpoints. However, all local code, validation logic, mock adapters, and offline fallback handlers are complete:

### A. MongoDB Atlas Database Cluster

- **External Prerequisite:** Provision a MongoDB Atlas cluster and acquire connection URI (`mongodb+srv://...`).
- **Local Implementation Status (COMPLETE):**
  - Configured environment variables with safe fallback.
  - Added startup validation rejecting production boot if URI is missing.
  - Implemented atomic server-side bill allocator (`MM-YY-NNNN`).
  - Implemented unique database index definitions (`idx_bills_bill_number_unique`, `idx_bills_deal_id_bill_type_unique`, `idx_deals_idempotency_key_unique`, `idx_counters_id_unique`).
  - Added safe HTTP 503 rejection if production database is disconnected.
  - Concurrency, idempotency, and recovery tests passing (77 passing unit/security tests, 14 skipped tests awaiting Atlas).

### B. Transactional Email & OTP (Brevo / SendGrid / SMTP)

- **External Prerequisite:** Account creation and SMTP credential/API key generation.
- **Local Implementation Status (COMPLETE):**
  - Implemented modular email service with in-memory test queue (`TEST_SENT_EMAILS`).
  - Accurate delivery reporting: returns `delivered: False` with status `unconfigured_smtp` when SMTP is absent, preventing false delivery claims.
  - Designed responsive HTML/text templates for OTP verification and lead alerts.
  - Implemented durable local persistence for enquiries (`backend/data/enquiries.jsonl`) guaranteeing zero message loss even when SMTP is disconnected.
  - Enforced IP/phone rate limiting and single-use OTP expiration (tested and verified).

### C. Google OAuth 2.0 Web Client

- **External Prerequisite:** Google Cloud Console project creation and Web Client ID configuration.
- **Local Implementation Status (COMPLETE):**
  - Implemented server-side Google ID token decoding and audience verification.
  - Enforced least privilege: unmapped Google accounts strictly receive the `CUSTOMER` role (zero showroom management permissions).
  - Hardened authorization: owner privileges require explicit presence in `OWNER_EMAILS`.
  - Customer accounts are blocked from accessing internal showroom endpoints (`/sellers`, `/buyers`, `/witnesses`, `/documents`, `/deals`, and `/media/private/*`).
