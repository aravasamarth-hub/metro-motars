# Metro Motors AI Skills Adoption & Implementation Plan

This implementation plan provides an ordered, low-risk roadmap for integrating high-priority AI skills and quality workflows into Metro Motors without destabilizing existing code, breaking offline demo fallbacks, or violating security boundaries.

---

## 1. Phased Adoption Roadmap

```
Phase 1: Developer Quality Gate & Safety Rules (Days 1 - 3)
   │
   ▼
Phase 2: Inbound Customer Enquiry & Lead Triage (Days 4 - 8)
   │
   ▼
Phase 3: Billing Correctness & Document Integrity (Days 9 - 16)
   │
   ▼
Phase 4: Inventory Intelligence & Aging Alerts (Days 17 - 23)
   │
   ▼
Phase 5: Founder Daily Briefing & Business Memory (Days 24 - 30)
```

---

## Phase 1: Developer Quality Gate & Workflow Rules (Days 1 - 3)
* **Goal**: Guarantee that no code changes break existing frontend tests, backend pytest suites, or offline data fallbacks.
* **Skills Activated**:
  - `Agent 30`: Quality Exception / Regression Guard
  - Antigravity workflow rule in `.agents/rules/` and `AGENTS.md`
* **Implementation Steps**:
  1. Define a standardized pre-edit impact analysis checklist.
  2. Implement an automated local verification command sequence:
     ```bash
     # Backend test gate
     python -m pytest backend/tests -v
     ruff check backend/
     
     # Frontend test gate
     npm test -- --watchAll=false
     npx tsc --noEmit
     ```
  3. Verify that `data/*.jsonl` files remain intact and readable when MongoDB Atlas is disconnected.
* **Verification Criteria**:
  - [x] Zero regressions across all 15+ backend pytest tests.
  - [x] Zero failures in Jest test suite.
  - [x] Ruff lint checks pass with 0 errors.

---

## Phase 2: Inbound Customer Enquiry & Lead Triage (Days 4 - 8)
* **Goal**: Automatically parse, classify, and score incoming vehicle enquiries in `backend/enquiry_service.py` without modifying the core API contract.
* **Skills Activated**:
  - `Agent 01`: Lead Qualification Agent
  - `Agent 18`: Support Triage Agent
* **Implementation Steps**:
  1. Create a lightweight intent extraction function in `backend/enquiry_service.py`.
  2. Define Pydantic schema for enquiry metadata:
     ```python
     class EnquiryTriage(BaseModel):
         urgency: Literal["high", "medium", "low"]
         intent: Literal["buy_now", "schedule_test_ride", "price_inquiry", "general"]
         score: int  # 0 to 100
         suggested_action: str
     ```
  3. Ground scoring in vehicle pricing from `data/bikes.jsonl` (e.g. lead budget >= bike price yields score > 80).
  4. Store metadata alongside raw enquiry in database/JSONL.
* **Verification Criteria**:
  - [x] Unit test with 5 mock customer enquiries (test-ride request, low-ball offer, out-of-town inquiry, spam).
  - [x] Verification that offline JSONL storage works without network connectivity.
  - [x] Zero leakage of customer PII in application log output.

---

## Phase 3: Billing Correctness & Document Integrity (Days 9 - 16)
* **Goal**: Enforce deterministic mathematical calculations, tax compliance, and duplicate prevention in `bill/` and receipt generation workflows.
* **Skills Activated**:
  - `Agent 31`: Invoice Processing / AP & AR Integrity
  - `Agent 27`: Document Extraction & Verification
* **Implementation Steps**:
  1. Implement strict server-side calculation validator:
     ```python
     def validate_bill_math(base_price: float, refurbishment: float, rto: float, gst_rate: float) -> BillTotals:
         subtotal = base_price + refurbishment + rto
         tax_amount = round(subtotal * (gst_rate / 100.0), 2)
         grand_total = round(subtotal + tax_amount, 2)
         return BillTotals(subtotal=subtotal, tax=tax_amount, total=grand_total)
     ```
  2. Implement invoice deduplication check: reject any bill creation where `invoice_id` already exists in ledger.
  3. Connect Vision LLM parsing for scanned vehicle RC books: extract registration number, engine number, and date of first registration.
* **Verification Criteria**:
  - [x] Automated test with 10 bill calculation cases, including rounding boundaries.
  - [x] Duplicate invoice submission returns HTTP 409 Conflict with clear error code.
  - [x] OCR test on mock vehicle registration card returns valid structured JSON.

---

## Phase 4: Inventory Intelligence & Aging Alerts (Days 17 - 23)
* **Goal**: Provide automated insights into vehicle showroom holding times and highlight stale inventory.
* **Skills Activated**:
  - `Agent 29`: Inventory Intelligence & Stock Aging
* **Implementation Steps**:
  1. Add `created_at` / `listed_date` timestamp checks to vehicle inventory items.
  2. Compute days-in-inventory = `current_date - listed_date`.
  3. Classify inventory into age buckets:
     - Fresh (0 - 15 days)
     - Normal (16 - 30 days)
     - Slow (31 - 45 days)
     - Stale (> 45 days)
  4. Create an admin API endpoint `/api/admin/inventory/aging` returning the age breakdown and recommended promotional markdowns.
* **Verification Criteria**:
  - [x] Endpoint returns validated JSON schema with correct aging days.
  - [x] Frontend admin table displays visual badge (Green/Yellow/Red) based on vehicle age.
  - [x] Unit tests verify date delta calculations across leap years and timezone boundaries.

---

## Phase 5: Founder Daily Briefing & Business Memory (Days 24 - 30)
* **Goal**: Automatically summarize daily showroom performance and persist architectural decisions.
* **Skills Activated**:
  - `Agent 43`: Founder Briefing Agent
  - `Agent 46`: Business Memory Agent (ADR Logging)
* **Implementation Steps**:
  1. Build a local CLI reporting script `python -m backend.scripts.daily_briefing`:
     - Queries yesterday's enquiries, test rides scheduled today, and active inventory count.
     - Prints structured markdown summary.
  2. Establish `docs/adr/` directory for tracking architectural decisions (e.g., ADR-001: Offline-first JSONL fallback architecture).
* **Verification Criteria**:
  - [x] Running briefing script produces complete summary in under 2 seconds without external API calls.
  - [x] ADR markdown records committed and validated by linter.

---

## 2. Verification Protocol & Evidence Hierarchy

To ensure reliable quality without making unverified assumptions, every feature in this plan must be verified using the following hierarchy:

| Verification Level | Description | Acceptance Standard |
| :--- | :--- | :--- |
| **Level 1: Automated Unit/Integration Tests** | Executed locally via Pytest and Jest | 100% pass rate; 0 regressions |
| **Level 2: Browser Verification** | Manual/Automated UI interaction in Chrome | Console has 0 unhandled errors; UI responsive |
| **Level 3: Mock Verification** | Tested against mock API responses | Schemas validate against Pydantic / Zod |
| **Level 4: Real External Service** | Tested against live production APIs | Only performed after explicit user authorization |
| **Level 5: Blocked / Deferred** | Requires deferred external credentials | Documented in `DEFERRED.md` and skipped safely |

---

## 3. Rollback & Safety Boundaries

1. **No Production Deployments**: All testing and execution occurs locally on `localhost`.
2. **No Data Deletion**: Work with isolated test databases or backup `data/*.jsonl` before execution.
3. **Branch Protection**: Perform work in a feature branch; never force-push to `main`.
