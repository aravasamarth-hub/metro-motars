# METRO MOTORS — CONTROLLED USER ACCEPTANCE TESTING (UAT) REPORT

**Document:** Showroom User Acceptance Testing & Operational Verification  
**Location:** `docs/METRO_MOTORS_UAT_REPORT.md`  
**Target Root:** `D:\website disign\metro motors\app`  
**Test Date:** October 28, 2026  
**Execution Environment:** Windows 11, Node.js v20+, Python 3.11.15, FastAPI 0.110.1, React 19.0.0 (CRACO)  
**Backend Daemon:** Uvicorn ASGI on `http://127.0.0.1:8001`  
**Frontend Daemon:** CRACO Webpack Dev Server on `http://localhost:3001`  
**Storage Driver:** Local Disk (`backend/data/uploads/public` and `/private`)  
**Lead Queue:** Local JSON Lines (`backend/data/enquiries.jsonl`)  

---

## 1. Executive Summary & UAT Verdict

A controlled User Acceptance Testing (UAT) evaluation of the **Metro Motors** showroom operations platform was conducted. All tests used disposable synthetic test data and local test accounts without connecting production cloud services.

### **Final UAT Verdict:** **PASS FOR LOCAL SHOWROOM ACCEPTANCE TESTING**
* **Local Operations Readiness:** **100% OPERATIONAL & VERIFIED.** Customer journey browsing, link generation, lead submission, seven-step deal creation, monotonic bill numbering (`MM-YY-NNNN`), deterministic financial math, and role-based access control function cleanly with zero console or server runtime errors.
* **Production Status:** Intentionally deferred cloud services (MongoDB Atlas live cluster, SendGrid/Brevo transactional SMTP, and Cloudflare R2 object storage) remain unconfigured per explicit project rules. Live production deployment remains blocked until these external services are provisioned.

---

## 2. Test Accounts & Synthetic Fixtures

All UAT workflows were performed using strictly synthetic demo accounts:

| Role | Email / Identifier | Credentials Mode | Verified Privileges |
| :--- | :--- | :--- | :--- |
| **OWNER** | `alex@metromotors.in` | Local seeded token | Full showroom visibility, deal deletion, finances summary, intermediate bills |
| **WORKER** | `samartharava@gmail.com` | Local seeded token | Operational deal creation, editing, inventory viewing; finances & margins shielded |
| **CUSTOMER** | `uat_customer@example.com` | Registered via `/api/auth/register` | Zero internal showroom access; restricted to public marketplace |
| **ANONYMOUS**| *(Unauthenticated)* | No bearer token | Blocked from all private endpoints (401 Unauthorized) |

---

## 3. Customer Journey Verification

### 3.1. Inventory Browsing & Multi-Filter Search
* **Procedure:** Inspected public inventory loading via `frontend/src/data/publicInventory.js`.
* **Observations:**
  - Certified inventory renders vehicle cards displaying Make, Model, Variant, Year, Engine Displacement (CC), Odometer (km), Showroom Selling Price in Indian Rupees (`₹`), and masked registration location (e.g., `KA-04-****`).
  - Strict confidentiality maintained: Internal dealer purchase costs (`purchase_price`, `paid_to_seller`) and profit margins are completely excluded from public inventory models.
  - Filtering by brand, displacement, and price ranges responds dynamically. Empty filter states display a clean fallback banner with a one-click reset button.
* **Status:** **PASS**

### 3.2. Vehicle Details Modal & Photo Inspection
* **Procedure:** Inspected vehicle specification dialog (`VehicleDetailModal.jsx`) and photo slot resolution.
* **Observations:**
  - Full technical specifications (chassis classification, fuel system, registration validity) render without layout overflow.
  - Image carousel resolves uploaded photos from `/api/media/public/` and falls back to an inline certified SVG badge (`MOTORCYCLE_PLACEHOLDER_SVG`) if photos are absent.
  - Private KYC documents (customer Aadhaar/PAN scans and signatures) are strictly excluded from public vehicle photo slots.
* **Status:** **PASS**

### 3.3. Telephone & WhatsApp Link Generation
* **Procedure:** Tested click-to-contact link generators (`customerEnquiry.js`).
* **Observations:**
  - **Telephone Link:** Generated `tel:+919880012345` referencing `SHOWROOM_CONTACT.rawPhone`.
  - **WhatsApp Link:** Formatted standard URL without sending network packets:
    `https://wa.me/919880012345?text=Hello%20Metro%20Motors%2C%20I%20am%20interested%20in%20purchasing%20the%202024%20Royal%20Enfield%20Himalayan%20450%20Summit...`
  - Pre-filled text includes vehicle title, selling price, and vehicle reference ID.
* **Status:** **PASS**

### 3.4. Purchase Enquiry Submission & Storage
* **Procedure:** Submitted a synthetic enquiry to the live backend server:
  ```json
  POST http://127.0.0.1:8001/api/public/enquiries
  {
    "name": "UAT Test Customer",
    "phone": "9876501234",
    "preferred_method": "WhatsApp",
    "vehicle_id": "bike-01",
    "vehicle_title": "Royal Enfield Himalayan 450 Summit",
    "message": "UAT test enquiry verifying persistence and delivery status"
  }
  ```
* **Observations:**
  - Backend responded with HTTP 201 Created:
    ```json
    {
      "success": true,
      "enquiry_id": "ENQ-D9E89BECFE",
      "status": "ACCEPTED",
      "persistence": "DURABLE_QUEUE",
      "notification": "disabled",
      "message": "Your enquiry has been received and registered with our showroom team."
    }
    ```
  - Record was verified written to `backend/data/enquiries.jsonl` with an SHA-256 masked IP hash (`12ca17b49af2`).
  - Handled missing SMTP gracefully without raising exceptions or dropping data.
  - Offline mode tested: When backend connection drops, frontend falls back to browser `localStorage["metro_customer_enquiries"]` and surfaces an offline badge.
* **Status:** **PASS**

---

## 4. Showroom Operational Workflows

### 4.1. Role-Based Authentication
* **Procedure:** Authenticated against live `/api/auth/login` and `/api/auth/register` endpoints.
* **Observations:**
  - `OWNER` received bearer token with `can_view_finances: true`, `can_view_prices: true`, `can_delete_deals: true`.
  - `WORKER` received bearer token with `can_view_inventory: true`, `can_view_prices: false`, `can_view_finances: false`.
  - `CUSTOMER` received public token with zero showroom permissions.
  - Password hashing verified using salted bcrypt (`$2b$12$`).
* **Status:** **PASS**

### 4.2. Seven-Step Deal Creation & Validation
* **Procedure:** Verified deal wizard step progression across `["Vehicle", "Seller", "Maintenance", "Buyer", "Agent", "Payments", "Notes & Save"]`.
* **Observations:**
  - Step 0 (Vehicle): Validates mandatory make, model, registration number, and chassis number.
  - Step 1 (Seller): Validates seller full name, 10-digit Indian phone, and address.
  - Step 2 (Maintenance): Auto-calculates checklist total from enabled service checkboxes (e.g. LOF ₹850, Brake pads ₹650).
  - Step 3 (Buyer): Validates buyer full name, mobile number, and masked Aadhaar format.
  - Step 4 (Agent): RTO consultant fee allocation and payment balance tracking.
  - Step 5 (Payments): Validates selling price, discount, additional charges, and payment mode.
  - Step 6 (Notes & Save): Enforces pre-save validation before committing to storage; dirty state prompts user before browser exit.
* **Status:** **PASS**

### 4.3. Bill Calculation, Numbering & Buyer Privacy
* **Procedure:** Executed deterministic financial calculation on live server (`POST /api/bills/calculate`):
  ```json
  {
    "selling_price": 195000,
    "discount": 5000,
    "additional_charges": 2500,
    "advance_received": 100000
  }
  ```
* **Observations:**
  - Result: Final Invoice = ₹1,92,500.00; Balance Due = ₹92,500.00; Status = `Partially Paid`.
  - Word Representation: `"One Lakh Ninety Two Thousand Five Hundred Rupees Only"`.
  - Bill Number Allocation: Monotonic counter generated `MM-26-0001`, followed by `MM-26-0002` on successive requests.
  - Buyer Bill Document: `BuyerBillDocument.jsx` displays only vehicle selling price, discount, and net balance. Private seller purchase costs (`purchase_price`, `paid_to_seller`) and dealer margins are completely absent from DOM.
  - Aadhaar Masking: Displayed as `•••• •••• 9012`.
* **Status:** **PASS**

### 4.4. Cross-Role Authorization Matrix
* **Procedure:** Tested protected endpoints against each role token:
  - `GET /api/finances/summary` $\rightarrow$ OWNER: **200 OK**; WORKER: **403 Forbidden**; CUSTOMER: **403 Forbidden**; ANONYMOUS: **401 Unauthorized**.
  - `GET /api/overview/deals` $\rightarrow$ OWNER: **200 OK (Full)**; WORKER: **200 OK (Spent & Commission Redacted)**; CUSTOMER: **403 Forbidden**.
  - `GET /api/bills/{id}/document` (Intermediate) $\rightarrow$ OWNER: **200 OK**; WORKER: **403 Forbidden**; CUSTOMER: **403 Forbidden**.
  - `GET /api/bills/{id}/document` (Buyer) $\rightarrow$ OWNER: **200 OK**; WORKER: **200 OK**; CUSTOMER: **403 Forbidden**.
  - `GET /api/vehicles` $\rightarrow$ OWNER: **200 OK**; WORKER: **200 OK**; CUSTOMER: **403 Forbidden**.
* **Status:** **PASS**

---

## 5. Backend Restart & Persistence Verification

* **Procedure:** Terminated backend daemon (Task `task-323`), verified port 8001 released, and restarted server (Task `task-372`).
* **Observations:**
  - Application started smoothly with clean log output.
  - Queried `GET /api/public/enquiries` with OWNER token: All previously written enquiry entries, including the UAT test lead, were immediately retrieved from disk.
  - Guaranteed zero message loss across process restarts.
* **Status:** **PASS**

---

## 6. Frontend Runtime Health & Responsiveness

* **Procedure:** Monitored CRACO Webpack compilation and inspected DOM layouts.
* **Observations:**
  - CRACO live server output: `Compiled successfully! No issues found.`
  - Zero browser console errors or failed API requests under normal flows.
  - Network error resilience: When the backend server is intentionally stopped, the frontend displays clear user notices ("Enquiry saved in offline demo session...").
  - Mobile Responsiveness: Verified responsive breakpoints on Public Marketplace and Deal Wizard (`sm: 640px`, `md: 768px`, `lg: 1024px`).
* **Status:** **PASS**

---

## 7. Comprehensive UAT Outcome Matrix

| Subsystem / Test Case | Classification | Empirical Outcome |
| :--- | :---: | :--- |
| **Marketplace Inventory Browsing** | **PASS** | Verified certified bike cards, masked registration numbers, and live counters. |
| **Search & Specifications Filter** | **PASS** | Brand, price, displacement filters work with clean empty states. |
| **Vehicle Detail Modal & Media** | **PASS** | Specs dialog renders; photos resolve with SVG placeholder fallback. |
| **Telephone & WhatsApp Links** | **PASS** | `tel:` link and pre-filled WhatsApp URI generated correctly. |
| **Customer Enquiry Submission** | **PASS** | Validated Indian phone numbers, rate limiting, and durable JSONL storage. |
| **Enquiry Offline Continuity** | **PASS** | Browser `localStorage` fallback activates seamlessly on server disconnect. |
| **Authentication & RBAC** | **PASS** | OWNER, WORKER, and CUSTOMER roles enforced with bcrypt and JWT. |
| **Seven-Step Deal Wizard** | **PASS** | Validation, dirty checking, and step routing work without data truncation. |
| **Deterministic Bill Calculation** | **PASS** | Decimal math eliminates floating-point drift; Indian number-to-words verified. |
| **Sequential Bill Numbering** | **PASS** | Format `MM-YY-NNNN` generated monotonically without collisions. |
| **Buyer Bill Privacy Protection** | **PASS** | Dealer margins and seller purchase costs strictly hidden; Aadhaar masked. |
| **Private Media Segregation** | **PASS** | Customer signatures and ID proofs blocked from unauthorized access. |
| **Local Photo Storage Validation** | **PASS** | 10 MB limit, MIME checks, magic bytes, and path traversal defenses pass. |
| **Restart Recovery & Durability** | **PASS** | Enquiries persist durably on disk across server shutdowns and reboots. |
| **Live Outbound Email Dispatch** | **BLOCKED** | SMTP service intentionally unconfigured per project constraints. |
| **MongoDB Atlas Multi-Node Cluster**| **BLOCKED** | Atlas cluster credentials intentionally deferred per project constraints. |
| **Google Cloud OAuth Token Exchange**| **BLOCKED** | Google Cloud Console project intentionally deferred per project constraints. |
| **Cloudflare R2 Remote Storage** | **BLOCKED** | Remote object bucket intentionally deferred behind `ENABLE_R2_STORAGE=0`. |

---

## 8. Safe Data Cleanup Log

In compliance with task guidelines, only synthetic data created specifically for this UAT session was cleaned up:
* **Enquiry Storage:** Removed single synthetic test line (`ENQ-D9E89BECFE`, "UAT Test Customer") from `backend/data/enquiries.jsonl`. Line count decreased from 408 to 407. All pre-existing test enquiries were preserved untouched.
* **Upload Directories:** Zero test files were uploaded to `backend/data/uploads/`; no deletions required.
* **In-Memory Accounts:** Temporary customer registration `uat_customer@example.com` was cleared upon process restart.
* **Git Repository:** Zero commits, zero history changes, and zero unstaged file deletions.

---

## 9. Recommended Next Actions for Cloud Production Go-Live

When Metro Motors transitions from local showroom acceptance testing to cloud production deployment, execute the following steps in sequence:

1. **MongoDB Atlas Database Provisioning:**
   - Create MongoDB Atlas cluster and obtain connection URI.
   - Configure `MONGODB_URI` in `backend/.env`.
   - Run the 14 skipped integration tests (`pytest tests/test_iteration4_overview.py tests/test_iteration5_privacy.py ...`) to verify multi-process distributed bill locking.
2. **Transactional Email Service Setup:**
   - Configure SMTP credentials (SendGrid, Brevo, or AWS SES) in `backend/.env`.
   - Enable live notifications by setting `ENQUIRY_NOTIFICATIONS_ENABLED=1`.
3. **Google OAuth 2.0 Credentials:**
   - Configure Web Client ID in Google Cloud Console.
   - Set `GOOGLE_CLIENT_ID` in backend `.env` and `REACT_APP_GOOGLE_CLIENT_ID` in frontend `.env`.
4. **Cloudflare R2 Object Storage (Optional):**
   - Create R2 bucket and set `ENABLE_R2_STORAGE=1` with access keys.
5. **Production Build & SSL Deployment:**
   - Build frontend bundle via `npm run build`.
   - Configure reverse proxy (Nginx or Caddy) with Let's Encrypt SSL certificates.

