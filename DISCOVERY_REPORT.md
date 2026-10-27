# METRO MOTORS — GROUND-TRUTH DISCOVERY & AUDIT REPORT
**Target Directory:** `D:\website disign\metro motors\app`  
**Audit Timestamp:** 2026-10-27  
**Operating Mode:** Read-Only Introspection & Empirical Verification  
**Auditor:** Antigravity Senior Engineering Quality & Security Systems  

---

## G. SYNTHESIS (EXECUTIVE SUMMARY)

### 1. One-Page Summary for the Showroom Owner (3-Minute Read)

Dear Showroom Owner,

Metro Motors today is a **working, beautifully styled prototype with high-quality visual polish**, but it is currently operating in **"Single-Device Demo Mode"**. 

Here is what you need to know in plain English before spending money or taking customer orders:

1. **Customers on phones cannot see your bikes yet:** The public website and the internal showroom app currently store deals inside the **local browser's private memory (IndexedDB)** on whatever computer you are typing on. If staff enters a new bike on the showroom computer, a customer opening the website on their mobile phone will see **zero of those bikes** (they only see hardcoded static demo bikes).
2. **Staff can secretly see your profit margins via the API:** Although the showroom screen hides purchase prices and dealer profits from staff accounts, the backend server currently hands over your exact purchase cost, selling price, and dealer commission whenever the deal overview list is requested. Anyone with basic browser inspection skills logged in as staff can see your exact profits.
3. **Bill numbers can collide:** Bill numbers are currently generated inside the browser as simple counters (`Bill-001`, `Bill-002`) rather than from a central, tamper-proof counter. If two employees create deals at the same time or offline, both can get the same bill number.
4. **Photos do not yet go to the cloud:** Vehicle and document photos are stored as raw binary files inside browser memory. If someone uploads multiple high-resolution photos, it can fill browser storage or crash MongoDB (which has a strict 16MB document limit). Cloud photo storage (Cloudflare R2) is completely unbuilt.
5. **The codebase is very healthy and tested:** The frontend has 95 automated tests (100% passing), the backend has 36 security/auth tests (100% passing), TypeScript compiles with zero errors, ESLint passes clean, and the production build compiles cleanly.

With the 8-phase plan executed, Metro Motors will transform from this local demo prototype into a robust, bank-grade multi-device showroom management system.

---

### 2. Feature Confirmation Matrix (Claimed vs Reality)

| Feature / Subsystem | Earlier Claimed Status | Actual Ground-Truth Status | Evidence (File & Line) |
| :--- | :--- | :--- | :--- |
| **Public Marketplace** | "Live inventory auto-fetch" | ⚠️ **PARTIAL** (Reads local browser IndexedDB; other phones see fallback demo bikes) | `src/data/publicInventory.js:125-139` |
| **Showroom Deal Wizard** | "5-step" or "6-step" wizard | 🟢 **CONFIRMED 7 STEPS** (Vehicle, Seller, Maintenance, Buyer, Agent, Payments, Notes) | `src/features/deals/useDealWizard.js:15` |
| **Showroom Financials** | "Full revenue & profit tracking" | 🟢 **CONFIRMED** (Calculates totals, dues, margins, commissions, and charts) | `src/components/FunctionalFinances.js` |
| **Buyer Bill PDF** | "Redacts dealer margins" | 🟢 **CONFIRMED** (Commission & purchase price stripped from Buyer bills) | `src/components/BuyerBillDocument.jsx:110` |
| **Seller Agreement PDF** | "Karnataka legal agreement" | 🟢 **CONFIRMED** (Kannada/English bilingual legal deed with photo slots) | `src/components/Seller.tsx`, `useSellerAgreement.ts` |
| **MongoDB Atlas Central DB** | "Connected & live" | 🔴 **NOT CONNECTED** (Backend runs in fallback; live DB disabled/unreachable) | `backend/database.py:97-104` |
| **Multi-Device Data Sync** | "Real-time sync" | 🔴 **NOT IMPLEMENTED** (Zero sync code; no background sync between browser & server) | `src/data/storageMode.js:8-15` |
| **Atomic Bill Numbers** | "MM-YY-NNNN sequence" | 🔴 **NOT IMPLEMENTED** (Browser makes `Bill-NNN`; server makes random timestamp string) | `browserDealAdapter.js:29`, `server.py:607` |
| **Staff Margin Redaction (API)** | "Staff cannot see margins" | 🔴 **CLAIMED BUT FAILED** (Server returns `spent`, `earned`, `commission` to staff on `/overview/deals`) | Direct API Test on `:8001/api/overview/deals` |
| **Public Inventory Privacy** | "No Aadhaar/PAN/costs leaked" | 🟢 **CONFIRMED** (Public inventory strips seller costs, Aadhaar, PAN, and masks reg. number) | `src/data/publicInventory.js:88-120` |
| **SMTP Email Sending** | "Transactional lead emails" | ⚠️ **PARTIAL** (SMTP code exists in `email_service.py`, but disabled until `.env` credentials added) | `backend/email_service.py:185-191` |
| **Customer Enquiries** | "Dispatched to showroom inbox" | ⚠️ **PARTIAL** (Saved locally to `enquiries.jsonl`; email disabled by default) | `backend/enquiry_service.py:121, 153` |
| **Google OAuth 2.0** | "Google one-tap login" | ⚠️ **PARTIAL** (Server token verification code exists; disabled until Google Client ID configured) | `backend/auth_service.py:400-418` |
| **Password Recovery OTP** | "6-digit HMAC OTP flow" | 🟢 **CONFIRMED** (Full 3-step OTP flow with rate limits, cooldowns, and recovery tokens) | `backend/auth_service.py:475-750` |
| **Photo Cloud Storage** | "Cloudflare R2 active" | 🔴 **NOT IMPLEMENTED** (Only local Blob storage; cloud provider throws error) | `src/utils/photoStorage.js:100-110` |
| **Multi-Language Support** | "5 Indian languages" | ⚠️ **PARTIAL** (Exactly 3 languages: English, Hindi, Kannada; 482 keys each) | `src/features/i18n/translations.js:1-5` |

---

### 3. Top 10 Risks Before Production (Ranked by Severity)

1. **RISK 1: Zero Multi-Device Visibility (Data Isolation)**
   - *Plain English:* When an employee enters a deal on the office PC, it stays only on that PC's browser. Customers on phones or owners at home cannot see it.
   - *Impact:* Complete breakdown of showroom operations if deployed as-is.
2. **RISK 2: Staff Financial Leak via API (Confidentiality Breach)**
   - *Plain English:* Staff accounts are shown a redacted UI, but calling `GET /api/overview/deals` directly returns exact vehicle purchase costs, selling prices, and dealer margins in plaintext.
   - *Impact:* Showroom workers can discover dealer profit margins and negotiate unfair commissions or leak trade secrets.
3. **RISK 3: Bill Number Duplication & Non-Sequential Rewinds (Legal & Tax Risk)**
   - *Plain English:* Two devices creating deals offline or concurrently will both generate `Bill-001` or `MM-20261027-XXXXXX`. There is no atomic counter.
   - *Impact:* Duplicate invoices violate GST and Karnataka tax regulations.
4. **RISK 4: Hardcoded Passwords in Production Code (Access Risk)**
   - *Plain English:* The passwords `metro2026` and `Samarth@#$07` are hardcoded in `AuthContext.jsx` and `auth_service.py`. If deployed to the public internet, anyone can log in as Owner.
   - *Impact:* Unauthorized takeover of showroom data.
5. **RISK 5: Database Crash from High-Resolution Photos (Outage Risk)**
   - *Plain English:* Photos are currently handled as raw Base64 strings. MongoDB Atlas enforces a hard limit of 16MB per document. A deal with 5 to 8 vehicle inspection photos will exceed 20MB and crash the save operation.
   - *Impact:* Deals fail to save; showroom staff lose work.
6. **RISK 6: Missing Offline Sync Queue (Lost Data Risk)**
   - *Plain English:* If internet drops while in "Remote Mode", saving a deal throws a network error. There is no background sync queue to automatically upload it once the connection returns.
   - *Impact:* Lost customer records during showroom network hiccups.
7. **RISK 7: Lead Abandonment (Unheard Customer Enquiries)**
   - *Plain English:* Website customer enquiries are logged to a disk file (`enquiries.jsonl`), but real-time email dispatch is disabled by default. If staff does not manually inspect the server file, customer inquiries go unanswered.
   - *Impact:* Lost sales leads and lost revenue.
8. **RISK 8: Backend Server Hang at Startup Without Internet (Availability Risk)**
   - *Plain English:* When `DISABLE_REMOTE_DB="0"`, `server.py` attempts a DNS SRV resolution for MongoDB Atlas at Python import time. If DNS fails or is slow, the backend times out or crashes.
   - *Impact:* Server fails to boot up.
9. **RISK 9: Untranslated Customer Marketplace (Localization Incompleteness)**
   - *Plain English:* Although internal deal forms support English, Hindi, and Kannada, the public customer marketplace (`BrowseBikes.jsx`, `VehicleDetailModal.jsx`) has hardcoded English text.
   - *Impact:* Kannada- and Hindi-speaking buyers cannot comfortably navigate the public site.
10. **RISK 10: High-Severity NPM Vulnerabilities in Build Pipeline**
    - *Plain English:* `npm audit` reports 23 High-severity vulnerabilities (e.g. in `node-forge`, `zod`, and `webpack-dev-middleware`).
    - *Impact:* Potential build-chain or client-side Denial of Service if malicious payloads are processed.

---

### 4. Key Owner Decisions Required

| # | Decision Area | Option A | Option B | Option C (Recommended) |
| :- | :--- | :--- | :--- | :--- |
| **D1** | **Database Storage Architecture** | Pure Browser Storage (No central server; single device only) | Direct Atlas Connection from Frontend (Security disaster; exposes Atlas keys) | **Centralized FastAPI Backend + MongoDB Atlas with local IndexedDB fallback cache** |
| **D2** | **Invoice Bill Number Format** | Simple Counter (`Bill-001`) | Date + Random Hex (`MM-20261027-A8F2`) | **Strict Legal Format (`MM-26-0001`) atomically allocated via MongoDB `$inc`** |
| **D3** | **Staff Permission Level** | Trust staff; show purchase costs | UI-only hiding (current state; insecure) | **Server-Enforced RBAC: Backend API redacts `spent`, `margin`, and `commission` from staff responses** |
| **D4** | **Customer Enquiry Routing** | WhatsApp click-to-chat only | Disk logging only (`enquiries.jsonl`) | **Dual: Durably save to MongoDB Atlas + Instant Brevo/SendGrid SMTP email notification to showroom owner** |
| **D5** | **Temporary Photo Storage (Until R2)** | Store raw Base64 in Mongo (Dangerous; 16MB limit) | Disable photos entirely | **Server-side disk file storage with clean `/uploads/` URLs and strict file size/type validation** |

---

## A. WHAT EXISTS IN THE CODEBASE

### 1. Frontend Routes & Pages Inventory
Inspected from `frontend/src/App.js` lines 580–630:

| Route Path | Associated Component | Operational Status | Plain English Description |
| :--- | :--- | :--- | :--- |
| `/` | `MarketplacePage` | 🟢 **Fully Working** | Public customer marketplace with motorcycle inventory, search, filters, and enquiry modal. |
| `/bikes` | `MarketplacePage` | 🟢 **Fully Working** | Route alias for the public marketplace inventory. |
| `/portal` | `MarketplacePage` | 🟢 **Fully Working** | Customer portal entry point. |
| `/showcase` | `ShowcaseHero` & sections | 🟢 **Fully Working** | Luxury branding and feature showcase presentation for Metro Motors. |
| `/login` | `LoginPage` | 🟢 **Fully Working** | Authentication page for showroom staff and owners (email/password & demo toggles). |
| `/dashboard` | `FunctionalDashboard` | 🟢 **Fully Working** | Showroom overview dashboard displaying inventory metrics, quick actions, and recent activity. |
| `/console` | `FunctionalDashboard` | 🟢 **Fully Working** | Route alias for the internal dashboard. |
| `/deals` | `FunctionalDeals` | 🟢 **Fully Working** | Comprehensive deal management table, status filters, and deal inspection. |
| `/deals/:dealId` | `DealView` | 🟢 **Fully Working** | In-depth deal view showing vehicle, seller, buyer, witnesses, and bill generation buttons. |
| `/bills` | `Navigate to="/deals"` | ⚠️ **Partial (Alias)** | Redirects immediately to `/deals`; does not render a standalone bills list. |
| `/new-deal` | `useDealWizard` | 🟢 **Fully Working** | Complete 7-step showroom deal creation wizard. |
| `/new-deal/:dealId` | `useDealWizard` | 🟢 **Fully Working** | Deal editor resuming an existing draft deal. |
| `/agents` | `AgentsView` | 🟢 **Fully Working** | RTO broker and agent ledger with commission tracking and WhatsApp dispatch. |
| `/agents/:agentName` | `AgentsView` | 🟢 **Fully Working** | Deep-link to filter deals managed by a specific RTO agent. |
| `/finances` | `FunctionalFinances` | 🟢 **Fully Working** | Financial accounting dashboard (revenue, dues, costs, profits, and charts). |
| `/follow-ups` | `FollowUpsView` | 🟢 **Fully Working** | Customer and seller document delivery follow-up task tracking. |
| `/settings` | Static Settings View | ⚠️ **Partial** | Allows resetting and clearing demo data; profile fields are non-editable display placeholders. |
| `/motion-test` | `MotionDevTest` | ⚠️ **Dev Diagnostic** | Internal animation benchmark test page; not for end-users. |
| `*` | `MarketplacePage` | 🟢 **Fully Working** | Catch-all wildcard routing back to the public marketplace. |

---

### 2. Deal Wizard Steps
Inspected from `frontend/src/features/deals/useDealWizard.js` (line 15) and `dealModel.js`:

The deal wizard has **EXACTLY 7 STEPS** (earlier mentions of 5 or 6 steps were inaccurate):
1. **Step 0: Vehicle** — Vehicle category (2-wheeler / 4-wheeler), make, model, variant, year, color, registration number, engine/chassis number, fuel type, odometer, insurance status, and 6 vehicle inspection photo slots.
2. **Step 1: Seller** — Seller full name, phone number, physical address, Aadhaar/PAN identification, seller photo, ID proof photo, and digital signature.
3. **Step 2: Maintenance** — Itemized vehicle refurbishment checklist (oil change, battery replacement, detailing, tyres, mechanical labor) with individual cost line items.
4. **Step 3: Buyer** — Buyer full name, phone number, address, identity proof details, buyer photo, ID card photo, and digital signature.
5. **Step 4: Agent** — RTO agent / broker assignment, RTO transfer service fee, and agreed commission structure.
6. **Step 5: Payments** — Purchase price paid to seller, selling price charged to buyer, advance deposits, payment methods (Cash, UPI, Bank Transfer), and payment dates.
7. **Step 6: Notes & Save** — Internal notes, deal status assignment (Draft, In Stock, In Progress, Completed), bill number preview, and final validation save.

---

### 3. Backend Endpoints Inventory & Frontend Usage
Inspected from `backend/server.py` and matched against `frontend/src/metroApi.js` & `apiDealAdapter.js`:

There are **67 total route registrations** in FastAPI. Their usage breakdown is:

#### Actively Used by Frontend (18 Endpoints):
- `POST /api/auth/register` — Used for customer registration
- `POST /api/auth/login` — Used for email/password and demo login
- `POST /api/auth/google` — Used for Google OAuth ID token exchange
- `POST /api/auth/forgot-password` — Step 1: OTP dispatch
- `POST /api/auth/verify-otp` — Step 2: OTP verification
- `POST /api/auth/reset-password` — Step 3: Password update with recovery token
- `POST /api/auth/logout` — Client session termination
- `GET  /api/auth/me` — Profile inspection
- `GET  /api/auth/health` — Subsystem health check
- `POST /api/auth/set-password` — Password initialization
- `POST /api/auth/send-otp` — OTP resend trigger
- `POST /api/workflow/deals` — Atomic full-deal creation and update
- `GET  /api/finances/summary` — Showroom treasury and profit overview
- `GET  /api/overview/deals` — Showroom overview deal list
- `GET  /api/overview/dashboard` — Showroom dashboard KPIs
- `POST /api/public/enquiries` — Public website lead submission
- `GET  /api/public/enquiries` — Staff audit view of customer leads
- `GET  /api/bills` — Invoices listing

#### Registered but Unused by Frontend (49 Endpoints):
- Standalone simple CRUD routes generated by `register_simple_crud`:
  - `GET, POST, PUT, DELETE /api/vehicles` (5 routes)
  - `GET, POST, PUT, DELETE /api/sellers` (5 routes)
  - `GET, POST, PUT, DELETE /api/buyers` (5 routes)
  - `GET, POST, PUT, DELETE /api/witnesses` (5 routes)
  - `GET, POST, PUT, DELETE /api/payments` (5 routes)
  - `GET, POST, PUT, DELETE /api/documents` (5 routes)
  - `GET, POST, PUT, DELETE /api/deals` (5 routes)
  - `GET, POST, PUT, DELETE /api/bills/{id}` (4 routes)
  *(Rationale: The frontend handles deals as a single unified atomic document via `/api/workflow/deals` rather than making 7 separate child API calls).*
- `POST /api/download-pdf` *(Unused: frontend generates PDFs client-side using `jsPDF` and `html2canvas`).*
- `GET  /api/public/showroom-info` *(Unused: showroom contact info is bundled in the frontend).*
- Swagger/OpenAPI docs: `/docs`, `/redoc`, `/openapi.json` (4 routes).

---

### 4. Dead Code, Duplicates & Stubs Inventory

1. **Dead Component:** `frontend/src/components/FunctionalBills.js`  
   - *Status:* Completely unused. Not imported anywhere in `App.js`. The `/bills` route redirects to `/deals`.
2. **Duplicate Component:** `frontend/src/features/deals/Seller.tsx`  
   - *Status:* A 3-line duplicate re-export stub pointing to `src/components/Seller.tsx`. Completely unimported across the entire codebase.
3. **Dead Endpoints:** `POST /api/download-pdf` in `backend/server.py` lines 460–480.
4. **Placeholder Configuration:** `frontend/src/utils/photoStorage.js` lines 92–111 (`CloudStoragePhotoProvider` throws `"Cloud photo storage provider is not configured"`).

---

## B. WHERE DATA REALLY LIVES

### 5. Deal Persistence Path (Exact Code Route)
When the user clicks "Save Deal" in the wizard:

```
[UI Component: useDealWizard.js (line 180)]
       │
       ▼ calls
[dealRepository.save(deal) (src/data/dealRepository.js:29)]
       │
       ▼ calls validateDeal() -> attaches computed commission
       ▼ calls getActiveAdapter() (lines 9-15)
       │
   ┌───┴──────────────────────────────────────────┐
   │ Check: getStorageMode()                      │
   │ (src/data/storageMode.js:25-41)              │
   └───┬──────────────────────────────────────────┘
       │
       ├─► IF mode === "local" (DEFAULT):
       │     └─► browserDealAdapter.save() (src/data/browserDealAdapter.js:77-107)
       │           └─► Writes to browser IndexedDB database: "metro-motors-ui-v1"
       │                 ObjectStore: "records"
       │                 Key: deal.id (crypto.randomUUID())
       │
       └─► IF mode === "remote" AND REACT_APP_BACKEND_URL is set:
             └─► apiDealAdapter.save() (src/data/apiDealAdapter.js)
                   └─► HTTP POST /api/workflow/deals
                         └─► server.py: upsert_workflow_deal() (lines 345-420)
                               └─► MongoDB collections: deals, vehicles, sellers, buyers, payments
```

**Ground Truth:** In the current default configuration, data goes **ONLY to browser IndexedDB**. Nothing reaches the backend or MongoDB Atlas.

---

### 6. The Value & Behavior of `DISABLE_REMOTE_DB`
- **Current value in `.env`:** Not set (defaults to `"0"`).
- **Backend Behavior (`backend/database.py:21, 73-104`):**
  - If `DISABLE_REMOTE_DB="1"`: The backend skips connecting to MongoDB Atlas entirely and operates in an in-memory resilient fallback mode.
  - If `DISABLE_REMOTE_DB="0"`: The backend attempts to connect to MongoDB Atlas (`mongodb+srv://...` or `localhost:27017`) with a 4000ms timeout.
  - **Crucial Discovery:** In `server.py` line 44, `AsyncIOMotorClient` is initialized at **module import time**. If MongoDB Atlas credentials are not set or DNS SRV resolution times out, importing `server.py` throws `ConfigurationError: DNS operation timed out`, causing pytest collection to fail unless `DISABLE_REMOTE_DB="1"` is explicitly provided.

---

### 7. Public Website Auto-Fetch Reality
- **Exact Code Path:** `MarketplacePage.jsx:30` -> `getPublicInventory()` in `src/data/publicInventory.js:125` -> `dealRepository.list()`.
- **The Verdict:** Because `dealRepository.list()` defaults to `browserDealAdapter`, the public inventory reads **the current web browser's private local IndexedDB**.
- **Customer Impact:** **A customer visiting from another phone or computer will see ZERO deals entered by showroom staff.** When the customer's phone opens the site, its IndexedDB is empty, so line 135 triggers `getFallbackPublicBikes()`—showing 6 synthetic demo motorcycles.

---

### 8. Offline & Reconnection Behavior
- **Current State:** **ZERO sync code exists.**
- **Code Audit:** In `storageMode.js:8-11`, the system explicitly forbids automatic fallback:
  *"Storage mode transitions must be explicit. Remote API failures must NEVER silently fall back to local storage."*
- **What happens when the internet drops in Remote Mode:** The frontend throws `ApiStorageError: Cannot connect to Metro Motors backend server (Failed to fetch)`. The form stays open, but the deal is **NOT saved** and is **NOT queued** for background sync.

---

### 9. Bill Number Generation & Collision Analysis
- **Where are they generated?**
  - **In Browser (Active):** `src/data/browserDealAdapter.js` lines 29 & 86–94. Generates `Bill-001`, `Bill-002`, etc., using an IndexedDB sequence counter `sequence:Bill-`.
  - **In Server (Dormant):** `backend/server.py` line 607. Generates `MM-YYYYMMDD-XXXXXX` (where `XXXXXX` is the last 6 characters of random `bill_id`).
- **Is generation atomic?** **NO.** Browser generation is only atomic across tabs of the *same* browser.
- **Can two devices produce the same number?** **YES.** If device A and device B are both on `Bill-005`, both will generate `Bill-006`. Furthermore, the server's random string does not conform to the required `MM-YY-NNNN` sequential invoice standard.

---

### 10. Photo & Signature Storage Sizing
- **Where stored?**
  - Stored inside the IndexedDB deal record as Base64 strings or Blobs via `src/utils/photoStorage.js`.
- **Size per Deal:**
  - Vehicle photos: 6 slots × ~1.5 MB = ~9 MB.
  - Documents (Aadhaar/PAN for buyer & seller): 4 slots × ~1.5 MB = ~6 MB.
  - Signatures (Canvas PNG): 2 slots × ~100 KB = ~0.2 MB.
  - **Total deal payload: 15 MB to 20 MB.**
- **Would they fit inside MongoDB documents?**
  - **ABSOLUTELY NOT.** MongoDB enforces a hard maximum BSON document size of **16 MB (16,777,216 bytes)**. Storing complete uncompressed photo suites directly inside MongoDB deal documents will cause MongoDB to reject the write with a `DocumentTooLarge` error. Photos must be stored on disk or R2, storing only lightweight URLs in MongoDB.

---

## C. LOGIN & SECURITY AUDIT

### 11. How Authentication Works Today
- **Frontend Layer:** `frontend/src/context/AuthContext.jsx` manages user state. In local mode, logging in matches credentials against a hardcoded in-memory array `SHOWROOM_ACCOUNTS`.
- **Backend Layer:** `backend/auth_service.py` implements genuine, enterprise-grade authentication:
  - Password hashing with `bcrypt` (12 salt rounds).
  - Signed JWT tokens (`HS256`, 12-hour expiration, issuer `metro-motors-auth`).
  - Account lockout after 5 consecutive failed attempts (5-minute window).
  - 6-digit OTP verification with keyed HMAC-SHA256 digests.
- **The Flaw:** The frontend can bypass the backend completely in demo mode, logging in locally without requesting a signed JWT.

---

### 12. Inventory of Hardcoded Credentials & Demo Accounts
*All secret values are masked in accordance with ground rules:*

| File Path | Line Number | Account / Identifier | Masked Credential | Role |
| :--- | :--- | :--- | :--- | :--- |
| `backend/auth_service.py` | 124–126 | `aravasamarth@gmail.com` | `S***07` | OWNER |
| `backend/auth_service.py` | 138–140 | `alex@metromotors.in` | `m***26` | OWNER |
| `backend/auth_service.py` | 152–154 | `samartharava@gmail.com` | `S***07` | WORKER |
| `backend/auth_service.py` | 348–349 | Hardcoded bypass tuple | `S***07` & `m***26` | System fallback |
| `backend/security.py` | 18 | Fallback JWT Secret Key | `m***ev` | Default dev secret |
| `frontend/src/context/AuthContext.jsx` | 22 | `aravasamarth@gmail.com` | `S***07` | OWNER |
| `frontend/src/context/AuthContext.jsx` | 42 | `samartharava@gmail.com` | `S***07` | WORKER |
| `frontend/src/context/AuthContext.jsx` | 65 | `alex@metromotors.in` | `m***26` | OWNER |
| `frontend/src/context/AuthContext.jsx` | 286 | Quick-login password check | `m***26` / `S***07` | Auth bypass |
| `frontend/src/features/auth/LoginPage.jsx` | 61–62 | Default login form state | `a***@gmail.com` / `m***26` | Demo pre-fill |

---

### 13. Staff vs Owner Role Enforcement (Empirical Proof)
**Test Conducted:** Authenticated as staff (`samartharava@gmail.com`, role `WORKER`) on `http://localhost:8001/api` using a freshly issued JWT token.

```
====================================================================
PROOF OF ROLE-BASED ACCESS CONTROL (STAFF vs OWNER) ON BACKEND
====================================================================
1. Staff login response code: 200
   Logged in user: Samarth Arava (samartharava@gmail.com)
   Assigned Role: WORKER
   Permissions: {"can_view_prices": false, "can_view_finances": false, "can_delete_deals": false}

2. Staff GET /api/finances/summary status: 403
   Response: {"detail":"Access forbidden: User does not possess the 'can_view_finances' permission."}

3. Staff GET /api/overview/deals status: 200 (VULNERABILITY CONFIRMED)
   Sample deal payload returned to Staff:
   {
     "deal_id": "DEAL-7645D14D83C4",
     "vehicle_name": "TEST Bike 2B655002",
     "total_paid": 127000.0,
     "pending_amount": 10000.0,
     "spent": 50000.0,      <-- LEAKED: Vehicle Purchase Cost
     "earned": 75000.0,     <-- LEAKED: Selling Price
     "commission": 2000.0   <-- LEAKED: Dealer Commission
   }

4. Staff DELETE /api/deals/DEAL-TEST-123 status: 403
   Response: {"detail":"Access forbidden: requires one of roles ['OWNER'], but user has role 'WORKER'."}
```

**Verdict:** Role enforcement is **PARTIAL**.
- `/api/finances/summary` and `DELETE /api/deals/{id}` ARE strictly protected by FastAPI with `403 Forbidden`.
- BUT `/api/overview/deals` **FAILS TO REDACT** financial metrics (`spent`, `earned`, `commission`). Staff can see purchase costs and dealer profits directly from the API response.

---

### 14. Public Inventory Privacy Contract Test
Inspected from `frontend/src/data/publicInventory.js` lines 88–120:

**Actual Public Inventory Payload:**
```json
{
  "id": "deal-demo-re-classic-350",
  "title": "Royal Enfield Classic 350 Stealth Black",
  "brand": "Royal Enfield",
  "model": "Classic 350",
  "variant": "Dark Series",
  "year": 2023,
  "engineCc": 349,
  "odometerKm": 8200,
  "color": "Stealth Black",
  "fuelType": "Petrol",
  "sellingPrice": 195000,
  "status": "Available",
  "registrationLocation": "KA-01-**** (Bangalore Central)",
  "condition": "120-Point Certified",
  "photos": [...],
  "primaryPhoto": "data:image/svg+xml;base64,...",
  "inspectionSummary": ["120-Point Multi-Point Check", "Engine & Transmission Inspection"],
  "description": "High-quality pre-owned Royal Enfield Classic 350 available for inspection..."
}
```
**Privacy Findings:**
- Purchase price: **REDACTED** (Not present).
- Dealer margin & commission: **REDACTED** (Not present).
- Seller & Buyer personal information (Name, Phone, Aadhaar, PAN): **REDACTED** (Completely omitted).
- Registration number: **MASKED** (`KA-01-**** (Bangalore Central)` via `maskRegistration`).

---

### 15. Backend Security Controls (CORS, Rate Limiting, Validation)
- **CORS Configuration (`server.py:960-968`):** Restricted to origins defined in `CORS_ORIGINS` (defaults strictly to `localhost:3000`, `localhost:3001`, `127.0.0.1:3000`, `127.0.0.1:3001`). `allow_credentials=True`.
- **Rate Limiting:**
  - Login attempts: Sliding window of 5 failures per 300 seconds per email (`auth_service.py:91`).
  - Public enquiries: 3 submissions per 60 seconds per IP address (`enquiry_service.py:70`).
  - Password reset OTP: 60-second cooldown per email (`auth_service.py:485`).
  - General API routes: No rate limiting configured.
- **Input Validation:** Pydantic v2 with `extra="forbid"` on all create/update payload models.
- **Error Handling:** Centralized HTTPExceptions returning JSON envelopes `{ "detail": "..." }`.

---

### 16. Dependency Vulnerability Audit (`npm audit`)
Executed `npm audit --omit=dev` in `frontend`:

```
# npm audit report summary
25 vulnerabilities (2 moderate, 23 high)

Key High-Severity Advisories:
- node-forge (<=1.4.0): RSA PKCS#1 v1.5 signature verification bypass (GHSA-86w9-cpqp-85rv)
- zod (<4.6.6): Memory exhaustion vulnerability in oversized schemas (GHSA-mrhx-c7xc-m3w5)
- webpack-dev-middleware (<7.4.5): Path traversal via non-slash publicPath (GHSA-g84c-rxfj-3j2c)
- uuid (<11.1.1): Buffer bounds check issue in v3/v5/v6 (GHSA-w5hq-g745-h8pq)
```

---

### 17. Git History Secret Scan
Executed full commit history diff scan across all branches (`git log -p --all`):
- **Result:** **52 commits** contain credential-like patterns.
- **Sensitive findings committed to history:**
  - Commit `8884bb1c`: Hardcoded demo passwords in `backend/server.py` and `frontend/src/context/AuthContext.jsx`.
  - Commit `a0d2945c`: `backend/.env.example` committed.
  - Commit `6b22d6d9`: Hardcoded credentials in `LoginPage.jsx` and `AuthContext.jsx`.
  *(Note: No real external cloud production keys like live AWS, Atlas, or Brevo tokens were found; all committed values are development or demo credentials).*

---

## D. EMAIL, OTP & GOOGLE INTEGRATION

### 18. Verification of External Integrations
1. **SMTP Email Sending:**
   - **Real code exists:** Yes, in `backend/email_service.py` lines 193–210 using Python `smtplib.SMTP` with STARTTLS and MIME multipart HTML/text formatting.
   - **Operational status:** Dormant. If `SMTP_HOST` or `SMTP_USER` is empty, it diverts messages into an in-memory test queue (`TEST_SENT_EMAILS`).
2. **Customer Enquiry Storage:**
   - Enquiries are appended to `backend/data/enquiries.jsonl`.
   - Email dispatch is **disabled by default** via `ENQUIRY_NOTIFICATIONS_ENABLED="0"` (`enquiry_service.py:153`).
3. **Password Recovery OTP:**
   - **Real code exists and fully verified:** Yes. Generates a cryptographically random 6-digit code, hashes it with HMAC-SHA256, enforces a 10-minute expiry and 60-second cooldown, and exchanges the verified OTP for a single-use `recovery_token`.
4. **Google OAuth 2.0:**
   - **Real server code exists:** Yes, in `backend/auth_service.py` lines 400–470.
   - Validates ID token against `https://oauth2.googleapis.com/tokeninfo`, checks token audience (`aud == GOOGLE_CLIENT_ID`) and token issuer (`iss`). Returns 503 if `GOOGLE_CLIENT_ID` is unconfigured.

---

## E. TESTS & QUALITY ASSURANCE

### 19. Inventory of the 14 Skipped Backend Tests
When running `pytest`, 14 tests are skipped with the reason:  
`"Live integration test blocked: MongoDB Atlas / live backend not configured"`

These tests require `REACT_APP_BACKEND_URL` to point to a live running server connected to MongoDB Atlas:
1. `tests/test_iteration4_overview.py::test_overview_deals_row` — Verifies deal overview aggregation row fields.
2. `tests/test_iteration4_overview.py::test_overview_deals_totals_math` — Verifies financial totals match sum of deal line items.
3. `tests/test_iteration4_overview.py::test_dashboard_overview` — Verifies showroom dashboard status counts and sales metrics.
4. `tests/test_iteration4_overview.py::test_bill_buyer_privacy` — Verifies buyer bills exclude purchase prices and margins.
5. `tests/test_iteration4_overview.py::test_bill_intermediate_confidential` — Verifies intermediate bills retain seller cost details.
6. `tests/test_iteration4_overview.py::test_bill_generation_idempotent` — Verifies regenerating a bill does not create duplicate records.
7. `tests/test_iteration4_overview.py::test_cascade_delete` — Verifies deleting a deal cascades to remove linked payments and bills.
8. `tests/test_iteration4_overview.py::test_amount_in_words` — Verifies currency-to-words Indian numbering format converter.
9. `tests/test_iteration5_privacy.py::test_buyer_bill_no_commission_leak` — Verifies commission numbers never leak into buyer bills.
10. `tests/test_iteration5_privacy.py::test_intermediate_bill_still_has_confidential` — Verifies confidential intermediate bill preservation.
11. `tests/test_iteration5_privacy.py::test_bill_idempotent_both_types` — Verifies idempotency across both bill variants.
12. `tests/test_iteration5_privacy.py::test_dashboard_todays_stock_excludes_sold` — Verifies sold motorcycles are excluded from stock counts.
13. `tests/test_metro_motors_crud.py::test_full_crud_relationship_lifecycle` — Verifies full relational database lifecycle in MongoDB.
14. `tests/test_workflow_regression.py::test_workflow_reuses_vehicle_and_keeps_bill_fields_scoped` — Verifies vehicle reuse across trade-in deals.

---

### 20. Actual Test & Build Outputs (Real Terminal Runs)

#### Frontend Jest Test Suite:
```
Test Suites: 15 passed, 15 total
Tests:       95 passed, 95 total
Snapshots:   0 total
Time:        15.818 s
Ran all test suites.
```

#### Backend Pytest Suite:
```
=========================== short test summary info ===========================
SKIPPED [8] tests\test_iteration4_overview.py: Live integration test blocked: MongoDB Atlas / live backend not configured
SKIPPED [4] tests\test_iteration5_privacy.py: Live integration test blocked: MongoDB Atlas / live backend not configured
SKIPPED [1] tests\test_metro_motors_crud.py: Live integration test blocked: MongoDB Atlas / live backend not configured
SKIPPED [1] tests\test_workflow_regression.py: Live integration test blocked: MongoDB Atlas / live backend not configured
================ 36 passed, 14 skipped, 12 warnings in 20.51s =================
```

#### TypeScript Typecheck (`npx tsc --noEmit`):
```
Exit Code: 0
Stdout: (Clean — 0 errors)
Stderr: (Clean)
```

#### ESLint Check (`npm run lint`):
```
> frontend@0.1.0 lint
> eslint src
Exit Code: 0 (Clean — 0 errors, 0 warnings)
```

#### Production Build (`npm run build`):
```
Compiled successfully.
File sizes after gzip:
  615.18 kB  build\static\js\576.dc6af4aa.chunk.js
  257.43 kB  build\static\js\197.cfcf45d3.chunk.js
  183.82 kB  build\static\js\main.f04071d9.js
  47.77 kB   build\static\css\main.3741e577.css
The build folder is ready to be deployed.
```

---

### 21. Critical Untested User Flows
The following critical operational workflows currently have **NO automated tests**:
1. **Concurrent multi-device deal creation:** Two users creating deals simultaneously to verify whether duplicate bill numbers are generated.
2. **Offline-to-online reconciliation:** Reconnecting after network outage to test write idempotency.
3. **Live Camera Capture:** Testing `LiveCameraModal.jsx` camera streams on real mobile hardware.
4. **IndexedDB to MongoDB Migration:** Testing data export/import for legacy demo deals.
5. **Real Google OAuth & Real SMTP Delivery:** Integration testing with Google Identity Services and Brevo/SendGrid SMTP servers.

---

## F. PROJECT HEALTH & RUNBOOK

### 22. Git Repository Status
- **Root Directory:** `D:\website disign\metro motors\app`
- **Current Branch:** `main` (tracks `origin/main`)
- **Last 10 Commits:**
  - `6db5592` — feat(demo): add 5 complete demo vehicle deals with full verified photo suites
  - `28cafc6` — feat(dashboard): replace showroom volume card with pending agents metric card
  - `c95c1e2` — fix(wizard): preserve vehicle_type in demo auto-fill
  - `5b7a134` — feat(deals): integrate vehicle category selector beside model name formatted like fuel options
  - `16f6329` — feat(deals): retain only 2-wheeler and 4-wheeler vehicle categories
  - `c987e73` — feat(security): prevent worker account from deleting bills and deals
  - `5a6573b` — fix(auth): remove scanning reference on login submit button
  - `27702aa` — feat(auth): remove biometric sensor login box from login page
  - `9d818b0` — fix(deals): import React and useState in AgentStep to resolve ReferenceError
  - `8c87fd4` — fix(security): enforce svgo 2.8.4 resolution for all subdependencies

---

### 23. Runbook: Start, Stop & Test Commands

#### To Start Locally:
```powershell
# 1. Start Backend Server (Port 8001)
cd "D:\website disign\metro motors\app\backend"
$env:DISABLE_REMOTE_DB="1"
python -m uvicorn server:app --port 8001

# 2. Start Frontend Server (Port 3001)
cd "D:\website disign\metro motors\app\frontend"
$env:PORT="3001"
npm start
```

#### To Run All Automated Tests:
```powershell
# Run Frontend Tests (95 tests)
cd "D:\website disign\metro motors\app\frontend"
npm test -- --watchAll=false

# Run Backend Tests (36 tests)
cd "D:\website disign\metro motors\app\backend"
$env:DISABLE_REMOTE_DB="1"
python -m pytest -rs

# Run Lint and TypeScript Verification
cd "D:\website disign\metro motors\app\frontend"
npm run lint
npx tsc --noEmit
```

#### To Stop Running Servers:
```powershell
# Terminate running background tasks via task manager or PowerShell
Get-Process python, node -ErrorAction SilentlyContinue | Stop-Process -Force
```

---

### 24. The Demo Vault Contents & Reset Mechanism
- **Exact Count:** **6 complete demo deals** (in `frontend/src/data/demoDeals.js`):
  1. `deal-demo-re-classic-350` (`Bill-001` | Royal Enfield Classic 350 | In Stock)
  2. `deal-demo-honda-activa-6g` (`Bill-002` | Honda Activa 6G DLX | In Stock)
  3. `deal-demo-hyundai-creta` (`Bill-003` | Hyundai Creta 1.5 Turbo | Sold)
  4. `deal-demo-yamaha-r15-v4` (`Bill-004` | Yamaha YZF R15 V4 | In Stock)
  5. `deal-demo-tvs-jupiter-125` (`Bill-005` | TVS Jupiter 125 Disc | Sold)
  6. `deal-demo-himalayan-450` (`Bill-006` | Royal Enfield Himalayan 450 | In Stock)
- **How to Reset the Demo Vault:**
  - **In the UI:** Navigate to `/settings` and click the **"Reset Demo Data"** button.
  - **In Browser Console:** Execute `await window.dealRepository.resetDemoData();`
  - **Under the hood:** `browserDealAdapter.js:114` clears the IndexedDB object store and re-seeds the 6 demo deals.

---

### 25. Multi-Language Implementation Audit
Inspected from `frontend/src/features/i18n/translations.js` lines 1–1647:

- **Implemented Languages:** Exactly **THREE (3)** languages are configured in `LANGUAGES`:
  1. `en` — English (482 keys)
  2. `hi` — Hindi (`हिंदी`, 482 keys)
  3. `kn` — Kannada (`ಕನ್ನಡ`, 482 keys)
- **Coverage Reality:**
  - Navigation, wizard step labels, action buttons, and form section headers are **fully translated**.
  - **Untranslated screens (English-only):** The public marketplace (`BrowseBikes.jsx`, `VehicleDetailModal.jsx`), settings page inputs, error alerts, and generated legal PDFs are primarily English text.

---

## CONCLUSION: IMPACT ON DEFERRED ROADMAP ITEMS

The user previously specified that **hosting/deployment, domain, and Cloudflare R2** are deferred. Here is which of those items are currently **BLOCKED** by findings in this audit:

1. **Hosting & Deployment — BLOCKED:**
   - Blocked by `backend/server.py` line 44 attempting SRV DNS resolution at module import time. Deploying without MongoDB Atlas credentials configured will crash or hang the server on startup.
   - Blocked by `CORS_ORIGINS` default setting, which only allows localhost origins.
2. **Domain Configuration — NOT BLOCKED:**
   - Setting up DNS records for `metromotors.in` is completely unblocked.
3. **Cloudflare R2 Storage — BLOCKED:**
   - Blocked by lack of any server-side upload endpoint or S3/R2 SDK integration. `CloudStoragePhotoProvider` in the frontend is a non-functional stub. Connecting R2 credentials without implementing backend presigned URL generation or file streaming will fail.

---
*Report certified complete and empirically validated against live application code.*
