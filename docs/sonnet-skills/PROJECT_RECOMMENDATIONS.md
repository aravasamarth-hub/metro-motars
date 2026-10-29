# Metro Motors AI Skills System & Project Recommendations

This document establishes the strategic adoption recommendations for applying the Sonnet Skills / 50 AI Agents framework directly to **Metro Motors** (and adjacent software repositories).

---

## 1. Project Context & Current Architecture

**Metro Motors** is a dual-interface used motorcycle showroom management and customer marketplace application:
- **Backend**: Python 3.11, FastAPI, Pydantic schemas, JWT authentication, and dual database mode (`database.py` with MongoDB Atlas connection and local `data/` JSONL offline fallback).
- **Frontend**: React 18, Craco, TailwindCSS, Lucide icons, Motion UI, and Jest test suite.
- **Key Modules**:
  - `backend/server.py`: Main API application entrypoint and route declarations.
  - `backend/auth_service.py` & `security.py`: Password hashing, token validation, role-based access control (Admin, Showroom Staff, Customer).
  - `backend/enquiry_service.py`: Customer vehicle enquiry processing and storage.
  - `backend/storage_service.py`: Local file storage with abstraction for Cloudflare R2.
  - `bill/` & `demo bill.pdf`: Billing, proforma invoices, and customer receipt generation.
- **Explicit Deferred Components (Per `DEFERRED.md`)**:
  - Live MongoDB Atlas cluster connection (relying on JSONL fallback).
  - Live transactional email delivery via SendGrid/SMTP (relying on local console logging).
  - Google OAuth client credentials (relying on standard email/password JWT).
  - Production Cloudflare R2 storage credentials (relying on local file uploads).
  - Production domain setup and SSL hosting.

---

## 2. Priority Ranking: The Top 10 Most Useful Skills for Metro Motors

The following 10 skills from the 50-agent catalog deliver the highest leverage for Metro Motors, directly addressing code quality, security, billing accuracy, and customer responsiveness:

### 1. Agent 31 + Agent 27: Billing Integrity & Document Extraction Engine
- **Priority**: **#1 (Critical)**
- **Why it Matters**: Used motorcycle transactions involve significant sums (₹50,000 - ₹5,00,000+), GST calculations, RTO transfer charges, and strict statutory compliance. Calculation errors or duplicate bills cause direct financial loss.
- **Metro Motors Implementation**:
  - Deterministic Pydantic schemas in FastAPI to validate bill calculations (Base Price + Refurbishment + RTO + Insurance = Grand Total).
  - Database-level idempotency checks on `invoice_id` to prevent duplicate billing.
  - Vision OCR to extract vehicle registration numbers and chassis numbers from uploaded RC book photos.
- **Control Level**: **Level 3 (Approval Required)**. No bill can be finalized without showroom manager sign-off.

### 2. Agent 01 + Agent 18: Inbound Customer Enquiry & Lead Triage
- **Priority**: **#2 (Critical)**
- **Why it Matters**: In used vehicle sales, response latency directly dictates conversion. Inbound enquiries in `backend/enquiry_service.py` currently arrive unranked.
- **Metro Motors Implementation**:
  - Fast LLM classifier analyzes incoming enquiry messages.
  - Tags intent: Ready-to-Buy (Immediate test-ride request), Price-Negotiator, or General Query.
  - Scores lead from 0 to 100 based on budget alignment with vehicle price.
  - Prioritizes sales staff notification for high-scoring leads.
- **Control Level**: **Level 1 (Autonomous Tagging & Routing)**.

### 3. Agent 30: Quality Exception & Regression Guard (Quality Gate)
- **Priority**: **#3 (Critical)**
- **Why it Matters**: Prevents bugs from slipping into production during agentic paired-programming. Ensures that edits to the backend do not break frontend builds or API contracts.
- **Metro Motors Implementation**:
  - Automated pre-commit quality gate running `python -m pytest backend/tests` and `npm test -- --watchAll=false`.
  - Static type verification via `tsc --noEmit` and Ruff linting.
  - Strict verification of the offline JSONL fallback whenever database code is touched.
- **Control Level**: **Level 1 (Autonomous CI/Local Quality Gate)**.

### 4. Agent 29: Vehicle Inventory Intelligence & Aging Monitor
- **Priority**: **#4 (High)**
- **Why it Matters**: Used vehicles are depreciating assets. A motorcycle sitting in the showroom for > 45 days incurs lot holding costs and blocks working capital.
- **Metro Motors Implementation**:
  - Background worker checks days-in-inventory for each bike in `data/bikes.jsonl` or MongoDB.
  - Automatically flags vehicles exceeding 30, 45, and 60 days.
  - Recommends price markdown strategies or highlighted placement on the marketplace homepage.
- **Control Level**: **Level 2 (Review Required)**. Markdown suggestions presented to showroom manager for approval.

### 5. Agent 05: Proposal & Quotation Assistant
- **Priority**: **#5 (High)**
- **Why it Matters**: Customers require customized financing quotations (down payment options, loan tenures, interest rates, RTO breakdown) before committing to a purchase.
- **Metro Motors Implementation**:
  - Dynamic quotation builder rendering customer options into standard PDF format (referencing `bill/demo bill.pdf` layout).
  - Uses Jinja2 / ReportLab with deterministic math calculations.
- **Control Level**: **Level 2 (Staff Review)**.

### 6. Agent 20: Guided Buyer & Seller KYC Onboarding
- **Priority**: **#6 (High)**
- **Why it Matters**: Selling or buying a used motorcycle requires extensive documentation (Aadhaar, PAN, Form 29/30 RTO transfer forms, insurance transfer).
- **Metro Motors Implementation**:
  - Step-by-step React onboarding checklist.
  - Validates document completeness before submission to backend `storage_service.py`.
  - Enforces local encrypted storage for uploaded customer IDs.
- **Control Level**: **Level 1 (Autonomous In-App Guidance)**.

### 7. Agent 43: Showroom Founder Daily Briefing
- **Priority**: **#7 (High)**
- **Why it Matters**: Gives the dealership owner an immediate high-level pulse on daily operations without logging into multiple admin tabs.
- **Metro Motors Implementation**:
  - Daily 7:00 AM summary: New enquiries received yesterday, test rides scheduled for today, bikes sold, pending customer documentation, and overdue balances.
- **Control Level**: **Level 1 (Read-Only Executive Notification)**.

### 8. Agent 03: Test-Ride & Sales Follow-Up Generator
- **Priority**: **#8 (Medium)**
- **Why it Matters**: Showroom visitors take test rides but leave without buying; sales reps often fail to follow up within 24 hours.
- **Metro Motors Implementation**:
  - After a test-ride is logged in the CRM/database, the agent drafts a personalized WhatsApp/email follow-up referencing the specific bike model and condition.
- **Control Level**: **Level 2 (Rep 1-Click Review Before Send)**.

### 9. Agent 46: Business Memory & Architecture Decision Logging
- **Priority**: **#9 (Medium)**
- **Why it Matters**: Preserves architectural rationale across agentic development sessions so future AI turns do not overwrite intentional design choices (such as offline-first architecture).
- **Metro Motors Implementation**:
  - Repository-level ADRs in `docs/` and `memory/` detailing why external services are deferred and how security boundaries are maintained.
- **Control Level**: **Level 1 (Autonomous Repo Documentation)**.

### 10. Agent 15: Interactive Valuation & EMI Lead Magnet
- **Priority**: **#10 (Medium)**
- **Why it Matters**: Attracts organic buyers and sellers to Metro Motors by providing immediate utility on the website.
- **Metro Motors Implementation**:
  - Interactive "Instant Bike Valuation" and "Monthly EMI Calculator" components on the React frontend.
  - Prompts users for vehicle details (Year, Brand, Model, KM driven) and captures contact info to display the valuation.
- **Control Level**: **Level 1 (Client-side interactive widget)**.

---

## 3. Skills Deferred or Not Recommended for Metro Motors

| Skill | Category | Reason for Deferral / Rejection in Metro Motors |
| :--- | :--- | :--- |
| **Agent 21: Voice Calling** | Telephony | High cost, complex telephony infrastructure; premature before live phone line setup. |
| **Agent 11: Performance Marketing** | Ads | Deferred until live Meta/Google ad spend campaigns are active. |
| **Agent 35: Recruitment Coordinator** | HR | Metro Motors is currently focused on product and showroom operations, not large-scale hiring. |
| **Agent 42: Due-Diligence Research** | M&A | Designed for venture capital and enterprise acquisitions; irrelevant to retail vehicle dealership. |
| **Agent 50: Agency Operating Agent** | Agency | Designed for multi-client billable agencies, not an automotive retail inventory business. |

---

## 4. Software Quality & Engineering Skills for Antigravity

In addition to business automation agents, Antigravity requires specific **engineering workflows** to maintain code quality:

| Engineering Need | Recommended Antigravity Workflow Skill | Metro Motors Application |
| :--- | :--- | :--- |
| **Requirements Analysis** | `concise-planning` & `product-manager-toolkit` | Plan changes atomically before editing files. |
| **Architecture Mapping** | `codebase-mapper` | Map dependencies between `database.py`, `server.py`, and React UI. |
| **Defect Hunting** | `systematic-debugging` & `debugger` | Hypothesize and test root causes before proposing code modifications. |
| **API Security** | `api-security-best-practices` & `security-auditor` | Audit JWT validation, RBAC enforcement, and prevent PII leakage. |
| **Testing Verification** | `empirical-validation` & `test-driven-development` | Require passing pytest and Jest runs before marking tasks complete. |
| **Safe Orchestration** | `subagent-delegation` & `accidental-data-loss-prevention` | Prevent destructive git or database operations. |
