# Metro Motors — Security Remediation Report (Phase 1)

## Executive Summary
This report documents the security remediation for Phase 1 of the Metro Motors operational hardening project. All high-severity financial data leaks and production authentication risks identified in the discovery audit have been resolved and verified with automated test suites.

---

## 1. Server-Side Role Enforcement (RBAC)

### 1.1 Remediation of Financial Leak on `/api/overview/deals`
* **Vulnerability Identified:** The endpoint `/api/overview/deals` previously ran without authentication and attached unredacted financial metrics (`spent`, `earned`, `commission`) to every deal object, allowing any caller or showroom worker to inspect dealer purchase costs and net profit margins.
* **Remediation Implemented:**
  - Added server-side authentication dependency `Depends(get_current_user)`.
  - Inspected caller role and permissions (`can_view_finances`, `can_view_prices`).
  - For showroom staff (`WORKER` role), `spent`, `earned`, and `commission` fields are explicitly stripped/redacted from all deal rows before serialization.
* **Automated Verification:**
  - `tests/test_phase1_security_rbac.py::test_01_anonymous_request_to_overview_deals_is_rejected` (PASSED)
  - `tests/test_phase1_security_rbac.py::test_02_staff_token_redacts_costs_margins_and_commissions_on_overview_deals` (PASSED)
  - `tests/test_phase1_security_rbac.py::test_03_owner_token_retains_full_financial_visibility_on_overview_deals` (PASSED)

### 1.2 Remediation of Financial Leak on `/api/overview/dashboard`
* **Vulnerability Identified:** The dashboard overview endpoint calculated aggregate showroom revenue, purchase expenses, and net profit margins and returned them to all callers.
* **Remediation Implemented:**
  - Added `current_user: dict = Depends(get_current_user)`.
  - For non-owner staff, `net_finances` and `pending_dues` are returned as `None` (redacted).
  - In `recently_sold` items, vehicle purchase costs (`spent`) and dealer commissions are removed for staff.
  - Preserved staff operational metrics (`bikes_in_stock`, `total_deals`, `new_deals`).
* **Automated Verification:**
  - `tests/test_phase1_security_rbac.py::test_04_staff_dashboard_overview_redacts_net_finances_and_dues` (PASSED)
  - `tests/test_phase1_security_rbac.py::test_05_owner_dashboard_overview_includes_full_finances` (PASSED)

### 1.3 Deal Workspace & Document Leakage Protections
* **Vulnerability Identified:** In `/api/deals/{deal_id}/workspace` and `/api/bills/{bill_id}/document`, purchase invoices and seller payment amounts were queryable by ID.
* **Remediation Implemented:**
  - In `/api/deals/{deal_id}/workspace`: Purchase payments and intermediate bills are stripped from staff workspace responses.
  - In `/api/bills/{bill_id}/document`: Returned `403 Forbidden` if a non-owner attempts to view a non-buyer-facing (intermediate/purchase) bill.
  - In `register_simple_crud`: Restricted `/api/payments` to `can_view_payments` permission (returns `403 Forbidden` for staff); restricted `/api/bills` to `can_view_bills` permission (returns `403 Forbidden` for staff).
* **Automated Verification:**
  - `tests/test_phase1_security_rbac.py::test_06_staff_direct_payments_crud_is_forbidden` (PASSED)
  - `tests/test_phase1_security_rbac.py::test_07_owner_can_query_payments` (PASSED)
  - `tests/test_phase1_security_rbac.py::test_08_staff_direct_bills_crud_is_forbidden` (PASSED)

### 1.4 Principle of Least Privilege: Role Permissions Matrix
Added the `CUSTOMER` role and refined permissions in `backend/security.py`:

| Permission | OWNER | MANAGER | WORKER (Staff) | CUSTOMER |
| :--- | :---: | :---: | :---: | :---: |
| `can_view_inventory` | Yes | Yes | Yes | Yes |
| `can_create_deals` | Yes | Yes | Yes | No |
| `can_edit_deals` | Yes | Yes | Yes | No |
| `can_delete_deals` | Yes | No | No | No |
| `can_view_prices` | Yes | Yes | No | No |
| `can_view_finances` | Yes | No | No | No |
| `can_view_payments` | Yes | No | No | No |
| `can_view_bills` | Yes | No | No | No |
| `can_delete_bills` | Yes | No | No | No |
| `can_manage_users` | Yes | No | No | No |

---

## 2. Production Authentication Safety

### 2.1 Environment Detection & Demo Disabling
* Created an explicit `IS_PRODUCTION` environment flag in `backend/security.py` and `backend/auth_service.py` that activates when `ENV="production"` or `ENVIRONMENT="production"`.
* **Protections Enforced in Production Mode:**
  1. **Demo Seeding Disabled:** In-memory demo account seeding (`seed_default_showroom_users`) is completely skipped.
  2. **Password-less Login Rejection:** Calling `authenticate_user_credentials` with `password=None` raises an HTTP 400 Bad Request error.
  3. **Hardcoded Password Bypass Disabled:** Hardcoded passwords (e.g. `metro2026`) cannot bypass bcrypt verification in production mode.
  4. **Legacy Setup Endpoint Disabled:** `/api/auth/set-password` returns HTTP 404 Not Found in production mode.
* **Automated Verification:**
  - `tests/test_phase1_security_rbac.py::test_10_production_mode_rejects_password_none` (PASSED)
  - `tests/test_phase1_security_rbac.py::test_11_production_mode_rejects_demo_credentials` (PASSED)
  - `tests/test_phase1_security_rbac.py::test_12_production_mode_disables_legacy_set_password_endpoint` (PASSED)

### 2.2 Removal of Backdoor Substring Matching & Privilege Escalation
* **Issue:** `/api/auth/set-password` previously assigned the `OWNER` role if the email contained the substring `"aravasamarth"`.
* **Remediation:** Removed the substring check completely. Replaced with strict matching against `OWNER_EMAILS` environment configuration.
* **Google OAuth Escalation Fix:** In `authenticate_google_identity`, unmapped Google email addresses previously defaulted to `WORKER`. They now default strictly to `CUSTOMER` (least privilege, zero showroom access).
* **Automated Verification:**
  - `tests/test_phase1_security_rbac.py::test_09_customer_role_has_zero_showroom_permissions` (PASSED)
  - `tests/test_phase1_security_rbac.py::test_13_set_password_does_not_grant_owner_via_email_substring` (PASSED)

---

## 3. Credential Exposure & Git History Audit

### 3.1 Historical Git Commit Scan Results
* **Commit `6b22d6d9`:** `frontend/src/features/auth/LoginPage.jsx` — Demo password autofill buttons added for local mock testing.
* **Commit `8884bb1c`:** `backend/server.py` and frontend files — Substring email checks and demo seed users committed.
* **Commit `a0d2945c`:** `backend/.env.example` — Safe `mongodb://localhost:27017` documentation added.

### 3.2 Credential Classification
- **Genuine Production Secrets in History:** **ZERO (0)** genuine MongoDB Atlas connection strings, SendGrid/Brevo API keys, or live production JWT private keys were found in Git history.
- **Test Fixtures & Demo Credentials:** The exposed credentials are synthetic local test values (`metro2026`, synthetic demo emails).
- **Validity Status:** Test fixtures only; unverified/invalid against any external production service.

### 3.3 Credential Rotation Checklist
When preparing for production deployment with real customer money:
1. [ ] **JWT Signing Secret:** Generate a cryptographically random 64-character secret via `openssl rand -hex 32` and populate in production `JWT_SECRET_KEY`.
2. [ ] **MongoDB Atlas Database User:** Create a dedicated database user with least privilege on the showroom database; do not use admin cluster credentials.
3. [ ] **Google OAuth Client Secret:** Ensure the production OAuth 2.0 client secret is stored exclusively in production environment secrets and redirect URIs strictly match showroom domain.
4. [ ] **SMTP / Transactional Email Credentials:** Generate API keys with send-only permissions from Brevo or SendGrid; never reuse personal developer email credentials.
5. [ ] **Showroom Owner & Staff Passwords:** When real accounts are created, use unique bcrypt-hashed passwords (minimum 12 characters).

### 3.4 Git Ignore & Safe Example Validation
- Verified `.gitignore` covers `.env`, `.env.*`, `*.env`, `*token.json*`, `*credentials.json*`.
- Verified `backend/.env.example` and `frontend/.env.example` contain only variable names and safe placeholder documentation (`<LONG_RANDOM_SECRET_...>`, `<DB_USER>`, etc.).
- Verified `git ls-files | findstr "\.env"` only lists `.env.example` files.
