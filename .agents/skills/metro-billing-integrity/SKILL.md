---
name: metro-billing-integrity
description: Enforces deterministic invoice math, duplicate invoice prevention, and statutory compliance for Metro Motors.
risk: none
source: local-project-workflow
date_added: 2026-10-28
tags: ["billing", "finance", "fastapi", "integrity", "idempotency"]
---

# Metro Motors Billing Integrity & Audit Workflow

Derived from Agents 27 & 31 of the 50 AI Agents playbook, this skill enforces deterministic financial math, invoice deduplication, and Level 3 human control across all vehicle quotation and billing operations.

---

## 1. The Cardinal Rule: Deterministic Math vs. LLM

**Never let an LLM compute prices, discounts, GST amounts, or ledger totals.**
- **LLM Role**: Parse unstructured customer notes, extract metadata, structure description text.
- **Python Code Role**: Execute all addition, multiplication, rounding, and database balance commits.

---

## 2. Server-Side Calculation Schema

Every billing generation endpoint must calculate totals using the following deterministic formula:

$$\text{Subtotal} = \text{Base Price} + \text{Refurbishment} + \text{RTO Transfer Fee}$$
$$\text{Tax Amount} = \text{round}\left(\text{Subtotal} \times \frac{\text{GST Rate}}{100.0},\; 2\right)$$
$$\text{Grand Total} = \text{round}(\text{Subtotal} + \text{Tax Amount},\; 2)$$

### Python Reference Implementation:
```python
from pydantic import BaseModel, Field

class BillLineItem(BaseModel):
    description: str
    amount: float = Field(..., ge=0)

class BillCalculationRequest(BaseModel):
    vehicle_id: str
    base_price: float = Field(..., gt=0)
    refurbishment_cost: float = Field(default=0.0, ge=0)
    rto_charges: float = Field(default=0.0, ge=0)
    gst_rate_percent: float = Field(default=18.0, ge=0, le=28.0)

class BillCalculationResponse(BaseModel):
    subtotal: float
    tax_amount: float
    grand_total: float
```

---

## 3. Duplicate Prevention & Idempotency Check

Before committing any bill record to `data/bills.jsonl` or MongoDB:
1. Check if `invoice_id` or `bill_number` already exists.
2. If already exists: Return HTTP 409 Conflict with `{"error": "DUPLICATE_INVOICE_ID"}`.
3. Check for concurrent submissions using unique database index or file lock.

---

## 4. Human Approval Gate (Level 3 Control)

- An automated agent may draft a proforma invoice or quotation.
- The invoice status MUST remain `DRAFT` until a showroom manager or admin explicitly reviews and signs off.
- No payment receipt or delivery note can be released in `DRAFT` status.
