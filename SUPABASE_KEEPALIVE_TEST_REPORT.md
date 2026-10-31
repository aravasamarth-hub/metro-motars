# Metro Motors — Supabase Keepalive Pre-Flight Test & Audit Report

**Date:** 2026-11-01  
**Project:** Metro Motors / Metro Motors  
**Architectural Verification Level:** Production-grade Safe Keepalive  
**Total Cost Impact:** ₹0 (Free tier only)

---

## 1. Summary of Actions Completed

| Area | Status | Detail |
| :--- | :--- | :--- |
| **Repository Audit** | ✅ PASSED | Checked `app/` branch `main`. Verified absence of any conflicting keepalive workflows. |
| **SQL Migration Prepared** | ✅ PASSED | Created `supabase/migrations/001_create_project_keepalive.sql`. Idempotent, RLS protected, anon SELECT-only on id=1. |
| **GitHub Actions Workflow** | ✅ PASSED | Created `.github/workflows/supabase-keepalive.yml`. Cron scheduled for every 8 hours, manual `workflow_dispatch` enabled. |
| **Syntax & Lint Validation** | ✅ PASSED | Workflow YAML validated with `js-yaml` parser. SQL statement structure audited. |
| **Security Boundaries** | ✅ PASSED | Zero MongoDB records/credentials touched. Zero application secrets committed. Zero service_role keys required. |
| **Existing Code Integrity** | ✅ PASSED | All 97 frontend unit/integration test suites pass. Backend pytest passes with zero regressions. |

---

## 2. Security & Architecture Audit Matrix

### Protection Rules Audit

1. **Default Git Branch:** Identified as `main` (`https://github.com/aravasamarth-hub/metro-motars.git`).
2. **Existing Supabase Configuration:** Fully decoupled. No frontend or backend files have hardcoded Supabase keys.
3. **Existing MongoDB Integration:** Preserved 100%. MongoDB Atlas / local MongoDB remains the sole business and admin database. No migrations or modifications were made.
4. **Existing Authentication Functionality:** Untouched. Login endpoints, Google OAuth handlers, and Resend/SMTP configs remain completely unaltered.
5. **Secrets Exposure Check:**
   - No private keys or tokens in git status or repo files.
   - The keepalive workflow only references `${{ secrets.SUPABASE_URL }}` and `${{ secrets.SUPABASE_PUBLISHABLE_KEY }}`.
   - GitHub Actions automatically masks these secrets from logs.

---

## 3. SQL Migration Verification

- **Table Name:** `public.project_keepalive`
- **Primary Key:** `id INTEGER PRIMARY KEY`
- **Default Record:** `id: 1, status: 'active'`
- **Idempotency:** Protected via `IF NOT EXISTS` and `ON CONFLICT (id) DO NOTHING`.
- **Privilege Grants:**
  - `anon`: Granted `USAGE` on schema `public` and `SELECT` on `public.project_keepalive`.
  - `anon`: Explicit `REVOKE` for `INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`, `REFERENCES`.
- **Row Level Security (RLS):**
  - RLS explicitly enabled.
  - Policy `keepalive_read_only` ensures `anon` can only execute `SELECT` where `id = 1`.

---

## 4. GitHub Actions Workflow Verification

- **File Path:** `.github/workflows/supabase-keepalive.yml`
- **Cron Expression:** `17 */8 * * *` (Runs at 00:17, 08:17, 16:17 UTC daily).
- **Manual Trigger:** `workflow_dispatch` enabled.
- **Runner:** `ubuntu-latest` (GitHub-hosted, zero local laptop dependency).
- **Target Endpoint:** `${CLEAN_URL}/rest/v1/project_keepalive?id=eq.1&select=id`
- **Headers:** `apikey: ${SUPABASE_PUBLISHABLE_KEY}`, `Authorization: Bearer ${SUPABASE_PUBLISHABLE_KEY}`, `Accept: application/json`.
- **Diagnostic Output:** Parses response with `jq -e 'type == "array" and length == 1 and .[0].id == 1'`. Emits clear diagnostic errors for HTTP 401, 403, 404, or network unreachability.

---

## 5. Test Status Breakdown

| Item | Verified By Agent | Requires User Action |
| :--- | :---: | :---: |
| Code & File Creation | ✅ Yes | — |
| Workflow YAML Syntax | ✅ Yes | — |
| SQL Logic & Policy Safety | ✅ Yes | — |
| Regression Testing on App | ✅ Yes (97/97 tests passed) | — |
| Supabase SQL Execution | — | ⏳ **User Action** (Run script in Supabase SQL Editor) |
| GitHub Secrets Creation | — | ⏳ **User Action** (Add `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`) |
| Git Push to `origin main` | — | ⏳ **User Action** (Push files to trigger Actions tab) |
| First Live Manual Run | — | ⏳ **User Action** (Click "Run workflow" in GitHub Actions) |

---

## 6. Uptime Disclaimer

Periodic database read pings generate authentic PostgREST query traffic that resets the Supabase free project inactivity counter. However, keepalive scripts do not guarantee 100% uptime against Supabase platform outages, planned maintenance, or retroactive policy modifications by Supabase. If a project is already paused prior to setup, it must be manually resumed once from the dashboard before automated pings can succeed.

