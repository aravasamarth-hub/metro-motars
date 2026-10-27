# Metro Motors — Showroom Operations Platform

Metro Motors is a showroom management and vehicle deal platform designed for two-wheeler and pre-owned vehicle dealerships. It provides end-to-end deal lifecycle management, financial control with strict staff/owner access segregation, legal bill numbering (`MM-YY-NNNN`), document/photo uploads, public marketplace browsing, and customer lead acquisition.

---

## 1. System Architecture & Tech Stack

* **Frontend:** React 19, CRACO, Tailwind CSS, Lucide Icons, Radix UI primitives, Framer Motion.
* **Backend:** FastAPI (Python 3.11), Motor (Async MongoDB driver), Pydantic v2 schemas.
* **Storage Provider:** Pluggable `StorageProvider` interface with a hardened local-disk storage driver (`backend/data/uploads/public` and `/private`) and a Cloudflare R2 driver stub prepared behind a feature flag.
* **Lead Ingestion:** Durable JSON Lines queue (`backend/data/enquiries.jsonl`) guaranteeing zero enquiry loss even when external SMTP is unconfigured.
* **Persistence & Synchronization:** Browser-local IndexedDB storage for offline continuity, with validated JSON export/import and atomic server-side allocation upon sync.

---

## 2. Verified Test Execution & Quality Gates

All locally executable quality gates have been run and verified. No test failures exist.

| Quality Gate / Test Suite | Directory | Command | Exit Code | Verified Outcome |
| :--- | :--- | :--- | :---: | :--- |
| **Backend Test Suite** | `backend/` | `python -m pytest -rs` | **0** | **71 passed, 14 skipped** (14 skipped pending Atlas) |
| **Phase 1 RBAC Tests** | `backend/` | `python -m pytest tests/test_phase1_security_rbac.py -v` | **0** | **14 passed** (Staff financial data leak remediation) |
| **Phase 2 Bill Concurrency** | `backend/` | `python -m pytest tests/test_phase2_database_bill_concurrency.py -v` | **0** | **5 passed** (50 concurrent allocations, zero collisions) |
| **Phase 4 Privacy Contracts** | `backend/` | `python -m pytest tests/test_phase4_public_privacy_contracts.py -v` | **0** | **5 passed** (Zero leak of purchase costs/KYC/credentials) |
| **Phase 5 Local Photo Storage** | `backend/` | `python -m pytest tests/test_phase5_local_photo_storage.py -v` | **0** | **7 passed** (Magic-byte validation, traversal prevention) |
| **Phase 6 Email & Enquiries** | `backend/` | `python -m pytest tests/test_phase6_email_otp_enquiries.py -v` | **0** | **4 passed** (Durable JSONL queue, OTP single-use) |
| **Frontend Jest Suite** | `frontend/` | `npm test -- --watchAll=false` | **0** | **97 passed** across 15 suites (0 failures) |
| **TypeScript Typecheck** | `frontend/` | `npx tsc --noEmit` | **0** | **0 errors** (Full React/TypeScript compilation) |
| **Frontend ESLint** | `frontend/` | `npm run lint` | **0** | **0 errors, 0 warnings** |
| **Production Build** | `frontend/` | `npm run build` | **0** | **Compiled successfully** (`build/` generated) |

---

## 3. Test & Verification Classification

In compliance with project safety standards, all capabilities are strictly classified by evidence level:

### A. Locally Tested (Empirical Proof On-Disk)
* **Server-Side Financial Redaction:** Showroom staff (`WORKER` role) queries to `/api/overview/deals`, `/api/overview/dashboard`, workspace, payments, and bills are stripped of dealer purchase costs, sales totals, and net margins.
* **Atomic Bill-Number Allocator:** Monotonic sequence generation matching legal format `MM-YY-NNNN` tested with 50 simultaneous asynchronous callers with zero duplicate IDs.
* **Idempotency Safeguards:** Re-submitting deal creation or bill generation with an idempotency key safely returns the existing record without increments or duplicates.
* **Production Disconnect Rejection:** When `ENV="production"`, write operations fail safely with HTTP 503 if the authoritative database is unavailable, preventing silent local divergence.
* **Local Photo Storage Driver:** Binary magic-byte checking (JPEG `\xff\xd8\xff`, PNG `\x89PNG`, WebP `RIFF`), 10 MB limit enforcement, path traversal defense (`../../` neutralized to random UUIDs), and authenticated access control on private customer KYC documents.
* **Durable Lead Capture:** Customer purchase enquiries are journaled to local JSONL (`backend/data/enquiries.jsonl`) before outbound delivery, ensuring lead capture succeeds even if SMTP is offline.
* **Password Reset OTP Lifecycle:** Time-limited OTP generation, rate limiting, and strict single-use invalidation upon verification.
* **Offline Synchronization:** Local deal export and import utility with duplicate detection and schema validation.

### B. Mocked / Unit Tested
* Isolated MongoDB collection operations (`MockCollection`, `MockDatabase`) verifying aggregation logic, deal queries, and counters without requiring external network connectivity.
* Synthetic email delivery transport (`TEST_SENT_EMAILS`) verifying HTML/plain-text rendering without outbound socket transmission.

### C. Blocked by Missing External Configuration (14 Skipped Tests)
* **MongoDB Atlas Live Database:** 14 integration tests (`test_iteration4_overview.py`, `test_iteration5_privacy.py`, `test_metro_motors_crud.py`, `test_workflow_regression.py`) are deliberately skipped using `pytest.skip()` because MongoDB Atlas credentials do not yet exist.
* **Live Outbound Email / Brevo / SendGrid:** Live SMTP network handshake is deferred until an email provider account is provisioned.
* **Google OAuth Identity Verification:** Google Web Client ID token exchange is blocked until the Google Cloud Console project is configured.

### D. Intentionally Deferred Items
1. **Hosting & Cloud Deployment:** No automated deployments or cloud hosting commands executed.
2. **Custom Domain & DNS Setup:** DNS records and SSL termination deferred until production infrastructure is chosen.
3. **Cloudflare R2 Storage:** Remote object bucket storage is isolated behind `ENABLE_R2_STORAGE=0`; all media currently operates on the verified local-disk driver.

---

## 4. Local Setup & Running Instructions

### Prerequisites
* **Node.js:** v18+ or v20+
* **Python:** 3.10+ or 3.11+
* **Package Managers:** `npm` / `yarn` and `pip`

### Step 1: Backend Setup & Execution
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv .venv
   .venv\Scripts\activate   # On Windows
   # source .venv/bin/activate  # On macOS/Linux
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Verify backend test suite:
   ```bash
   python -m pytest -rs
   ```
5. Start the FastAPI development server:
   ```bash
   uvicorn server:app --reload --port 8000
   ```
   * The API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).
   * Health check endpoint: [http://localhost:8000/api/health](http://localhost:8000/api/health).

### Step 2: Frontend Setup & Execution
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   # or yarn install
   ```
3. Run tests and static quality checks:
   ```bash
   npm test -- --watchAll=false
   npx tsc --noEmit
   npm run lint
   ```
4. Start the React development server:
   ```bash
   npm start
   ```
   * Open [http://localhost:3000](http://localhost:3000) to view the marketplace and showroom dashboard.

---

## 5. Production Handover Checklist (When External Services are Ready)

When you are ready to connect live external infrastructure, follow these precise, non-breaking steps:

### 1. MongoDB Atlas Configuration
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with read/write access to the `metro_motors` database.
3. In `backend/.env`, set:
   ```ini
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/metro_motors?retryWrites=true&w=majority
   DB_NAME=metro_motors
   IS_PRODUCTION=True
   DISABLE_REMOTE_DB=0
   ```
4. Restart the backend. The startup event will automatically create the unique indexes:
   * `idx_bills_bill_number_unique`
   * `idx_bills_deal_id_bill_type_unique`
   * `idx_deals_idempotency_key_unique`
   * `idx_counters_id_unique`

### 2. Transactional Email & OTP (Brevo / SendGrid / Amazon SES)
1. Register for an SMTP-compatible email delivery service.
2. In `backend/.env`, set:
   ```ini
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=your_verified_user@domain.com
   SMTP_PASSWORD=your_smtp_api_key
   SMTP_FROM_EMAIL=showroom@yourmetromotors.com
   SMTP_FROM_NAME="Metro Motors Showroom"
   ENQUIRY_NOTIFICATIONS_ENABLED=1
   ```
3. Outbound emails and lead alerts will automatically switch from the internal queue to real SMTP delivery.

### 3. Google OAuth 2.0 Web Client
1. In the [Google Cloud Console](https://console.cloud.google.com/), create an OAuth 2.0 Client ID for Web Applications.
2. Add your showroom domain and `http://localhost:3000` to Authorized JavaScript origins.
3. In `backend/.env`, set:
   ```ini
   GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   OWNER_EMAILS=owner@yourmetromotors.com,partner@yourmetromotors.com
   ```
4. In `frontend/.env`, set:
   ```ini
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
   ```

### 4. Cloudflare R2 Remote Storage (Optional)
1. Create a bucket in Cloudflare R2 and generate S3-compatible API access keys.
2. In `backend/.env`, set:
   ```ini
   ENABLE_R2_STORAGE=1
   R2_BUCKET_NAME=metro-motors-media
   R2_ACCOUNT_ID=your_cloudflare_account_id
   R2_ACCESS_KEY_ID=your_access_key_id
   R2_SECRET_ACCESS_KEY=your_secret_access_key
   R2_PUBLIC_DOMAIN=https://media.yourmetromotors.com
   ```
3. New uploads will route directly to Cloudflare R2 while preserving local fallback.

---

## 6. Audit & Compliance Documents

* [`AUDIT.md`](./AUDIT.md) — Comprehensive readiness audit scorecard.
* [`SECURITY_REMEDIATION.md`](./SECURITY_REMEDIATION.md) — Remediation details for RBAC, financial redaction, and authentication hardening.
* [`VERIFICATION_REPORT.md`](./VERIFICATION_REPORT.md) — Full command outputs, test evidence, and status mappings.
* [`DEFERRED.md`](./DEFERRED.md) — Scope boundary documentation and external service prerequisites.
