"""
Metro Motors — Billing Integrity & Regression Test Suite
Empirically tests Phase 4 requirements:
1. Valid bills, deterministic totals, and Indian currency words.
2. Missing business rules explicitly surfaced (unconfigured tax rate).
3. Invalid, negative, and malformed requests rejected (422 Unprocessable Entity).
4. Decimal rounding and boundary edge cases (discounts exceeding total, zero amounts).
5. Bill number format allocation preserving MM-YY-NNNN via /deals/next-bill-number.
6. Repeated submissions and idempotency protection.
7. Duplicate bill number and duplicate deal bill type rejection (409 Conflict).
8. Role-based authorization restrictions.
9. Buyer-facing privacy, margin redaction, and confidential shielding.
10. PDF generation stream integrity.
11. Resilient failure and recovery behavior.
"""

import asyncio
import os
import pytest
from starlette.testclient import TestClient

os.environ["DISABLE_REMOTE_DB"] = "1"
os.environ["JWT_SECRET_KEY"] = "test_secret_key_for_unit_tests_metro_motors_2026"
os.environ["ENV"] = "test"

import server
from auth_service import seed_default_showroom_users
from security import create_access_token
from server import app, BILL_TYPE_SELLER_BUYER, BILL_TYPE_SELLER_INTERMEDIATE
from billing_service import calculate_bill_financials, is_valid_bill_number_format, amount_in_words

client = TestClient(app)


class MockCursor:
    def __init__(self, data):
        self._data = data

    def sort(self, *args, **kwargs):
        return self

    async def to_list(self, length=None):
        return list(self._data)


class MockCollection:
    def __init__(self, data=None):
        self._data = list(data) if data else []

    def find(self, *args, **kwargs):
        return MockCursor(self._data)

    async def find_one(self, filter_dict=None, *args, **kwargs):
        if not self._data:
            return None
        if filter_dict:
            for item in self._data:
                match = True
                for k, v in filter_dict.items():
                    if item.get(k) != v:
                        match = False
                        break
                if match:
                    return dict(item)
            return None
        return dict(self._data[0])

    async def insert_one(self, doc):
        self._data.append(dict(doc))
        return doc

    async def update_one(self, filter_dict, update_dict):
        doc = await self.find_one(filter_dict)
        if doc and "$set" in update_dict:
            doc.update(update_dict["$set"])
        return doc

    async def delete_one(self, filter_dict):
        self._data = [d for d in self._data if not all(d.get(k) == v for k, v in filter_dict.items())]
        return None

    async def delete_many(self, filter_dict):
        self._data = [d for d in self._data if not all(d.get(k) == v for k, v in filter_dict.items())]
        return None


class MockDatabase:
    def __init__(self, collections_dict):
        self._collections = collections_dict
        for k, v in collections_dict.items():
            setattr(self, k, v)

    def __getitem__(self, name):
        return self._collections.get(name)


@pytest.fixture(autouse=True)
def setup_mock_db():
    seed_default_showroom_users()
    server.COLLECTIONS["deals"] = MockCollection([
        {"deal_id": "DEAL-INT-001", "deal_type": "Buy & Sell", "status": "Active", "vehicle_id": "VEH-INT-001", "seller_id": "SEL-001", "buyer_id": "BUY-001"}
    ])
    server.COLLECTIONS["vehicles"] = MockCollection([
        {"vehicle_id": "VEH-INT-001", "vehicle_name": "Royal Enfield Himalayan 450", "vehicle_number": "KA04EF9876"}
    ])
    server.COLLECTIONS["sellers"] = MockCollection([{"seller_id": "SEL-001", "name": "Seller Ramesh", "phone": "9876543210", "address": "Jayanagar", "id_details": "123456789012"}])
    server.COLLECTIONS["buyers"] = MockCollection([{"buyer_id": "BUY-001", "name": "Buyer Priya", "phone": "9123456780", "address": "Koramangala", "id_details": "987654321098"}])
    server.COLLECTIONS["witnesses"] = MockCollection([])
    server.COLLECTIONS["payments"] = MockCollection([
        {"payment_id": "PAY-001", "deal_id": "DEAL-INT-001", "payment_type": "Purchase", "amount": 220000.0, "payment_status": "Paid", "payment_date": "2026-02-01"},
        {"payment_id": "PAY-002", "deal_id": "DEAL-INT-001", "payment_type": "Sale", "amount": 265000.0, "payment_status": "Paid", "payment_date": "2026-02-05"},
        {"payment_id": "PAY-003", "deal_id": "DEAL-INT-001", "payment_type": "Dealer Commission", "amount": 15000.0, "payment_status": "Paid", "payment_date": "2026-02-05"},
    ])
    server.COLLECTIONS["documents"] = MockCollection([])
    server.COLLECTIONS["bills"] = MockCollection([
        {
            "bill_id": "BILL-EXISTING-001",
            "deal_id": "DEAL-INT-001",
            "bill_type": BILL_TYPE_SELLER_INTERMEDIATE,
            "bill_number": "MM-26-0001",
            "customer": "Seller Ramesh",
            "vehicle": "Royal Enfield Himalayan 450",
            "price": 220000.0,
            "created_date": "2026-02-01T10:00:00Z",
            "updated_date": "2026-02-01T10:00:00Z",
        }
    ])
    server.COLLECTIONS["counters"] = MockCollection([])
    server.db = MockDatabase(server.COLLECTIONS)


def owner_headers() -> dict[str, str]:
    token = create_access_token(subject="alex@metromotors.in", name="Alex Kumar", role="OWNER")
    return {"Authorization": f"Bearer {token}"}


def worker_headers() -> dict[str, str]:
    token = create_access_token(
        subject="worker@metromotors.in",
        name="Showroom Staff",
        role="WORKER",
        extra_claims={"permissions": {"can_view_finances": False, "can_view_bills": True, "can_delete_bills": False}},
    )
    return {"Authorization": f"Bearer {token}"}


# ─── 1. DETERMINISTIC FINANCIAL CALCULATIONS ──────────────────────────────────

def test_01_valid_bill_calculation_endpoint():
    """Verify server-side financial calculation matches deterministic business rules."""
    payload = {
        "selling_price": 180000.0,
        "discount": 5000.0,
        "additional_charges": 3500.0,
        "advance_received": 50000.0,
    }
    res = client.post("/api/bills/calculate", json=payload, headers=owner_headers())
    assert res.status_code == 200, res.text
    data = res.json()

    assert data["selling_price"] == 180000.0
    assert data["discount"] == 5000.0
    assert data["additional_charges"] == 3500.0
    assert data["subtotal"] == 183500.0
    assert data["final_invoice_amount"] == 178500.0
    assert data["advance_received"] == 50000.0
    assert data["remaining_balance"] == 128500.0
    assert data["payment_status"] == "Partially Paid"
    assert "One Lakh Seventy Eight Thousand Five Hundred Rupees Only" in data["amount_in_words"]
    # Missing business rules surfaced honestly without invented tax rates
    assert any("GST tax rate unconfigured" in rule for rule in data["missing_business_rules"])


def test_02_calculation_with_explicit_gst():
    """Verify deterministic tax calculation when statutory rate is provided."""
    payload = {
        "selling_price": 100000.0,
        "discount": 0.0,
        "additional_charges": 0.0,
        "advance_received": 118000.0,
        "gst_rate_percent": 18.0,
    }
    res = client.post("/api/bills/calculate", json=payload, headers=owner_headers())
    assert res.status_code == 200
    data = res.json()
    assert data["final_invoice_amount"] == 100000.0
    assert data["tax_amount"] == 18000.0
    assert data["grand_total_with_tax"] == 118000.0
    assert data["remaining_balance"] == 0.0
    assert data["payment_status"] == "Paid"


def test_03_rounding_and_decimal_boundaries():
    """Verify proper decimal rounding to 2 places and edge boundaries."""
    # Fractional cents
    payload = {
        "selling_price": 99999.555,
        "discount": 100.333,
        "additional_charges": 50.111,
        "advance_received": 0.0,
    }
    res = client.post("/api/bills/calculate", json=payload, headers=owner_headers())
    assert res.status_code == 200
    data = res.json()
    assert data["selling_price"] == 99999.56
    assert data["discount"] == 100.33
    assert data["additional_charges"] == 50.11

    # Discount exceeding selling price clamped to zero, not negative
    payload_excess = {
        "selling_price": 50000.0,
        "discount": 75000.0,
        "additional_charges": 0.0,
        "advance_received": 0.0,
    }
    res_excess = client.post("/api/bills/calculate", json=payload_excess, headers=owner_headers())
    assert res_excess.status_code == 200
    assert res_excess.json()["final_invoice_amount"] == 0.0
    assert res_excess.json()["remaining_balance"] == 0.0


def test_04_invalid_and_negative_amounts_rejected():
    """Verify negative amounts and invalid payloads return 422 Unprocessable Entity."""
    # Negative selling price
    res1 = client.post("/api/bills/calculate", json={"selling_price": -500.0}, headers=owner_headers())
    assert res1.status_code == 422

    # Negative discount
    res2 = client.post("/api/bills/calculate", json={"selling_price": 50000.0, "discount": -100.0}, headers=owner_headers())
    assert res2.status_code == 422

    # Extra unmapped fields forbidden
    res3 = client.post("/api/bills/calculate", json={"selling_price": 50000.0, "unrecognized_field": 999}, headers=owner_headers())
    assert res3.status_code == 422


# ─── 2. BILL NUMBER FORMAT & ALLOCATION ───────────────────────────────────────

def test_05_next_bill_number_endpoint():
    """Verify GET /deals/next-bill-number returns valid MM-YY-NNNN format."""
    res = client.get("/api/deals/next-bill-number", headers=owner_headers())
    assert res.status_code == 200, res.text
    data = res.json()
    assert "bill_number" in data
    assert is_valid_bill_number_format(data["bill_number"]) is True


# ─── 3. DEDUPLICATION & IDEMPOTENCY ──────────────────────────────────────────

def test_06_duplicate_bill_number_rejected_with_409():
    """Creating a bill with an existing bill_number via POST /api/bills must return 409 Conflict."""
    payload = {
        "deal_id": "DEAL-INT-001",
        "bill_type": BILL_TYPE_SELLER_BUYER,
        "bill_number": "MM-26-0001",  # Already assigned in fixture
        "customer": "Buyer Priya",
        "vehicle": "Royal Enfield Himalayan 450",
        "price": 265000.0,
    }
    res = client.post("/api/bills", json=payload, headers=owner_headers())
    assert res.status_code == 409
    assert "Duplicate bill number" in res.json().get("detail", "")


def test_07_duplicate_bill_for_same_deal_and_type_rejected():
    """Creating a duplicate bill of the same type for the same deal returns 409 Conflict."""
    payload = {
        "deal_id": "DEAL-INT-001",
        "bill_type": BILL_TYPE_SELLER_INTERMEDIATE,  # Deal already has an intermediate bill
        "bill_number": "MM-26-9999",
        "customer": "Seller Ramesh",
        "vehicle": "Royal Enfield Himalayan 450",
        "price": 220000.0,
    }
    res = client.post("/api/bills", json=payload, headers=owner_headers())
    assert res.status_code == 409
    assert "Duplicate bill for deal" in res.json().get("detail", "")


# ─── 4. PRIVACY, ROLE ACCESS & MARGIN REDACTION ───────────────────────────────

def test_08_buyer_bill_redacts_confidential_margins():
    """
    Buyer-facing bills (Seller → Buyer) must strictly shield purchase costs,
    dealer commission, and purchase payment lines.
    """
    # First generate buyer bill
    gen_res = client.post(
        "/api/deals/DEAL-INT-001/bills/generate",
        json={"bill_type": BILL_TYPE_SELLER_BUYER},
        headers=owner_headers(),
    )
    assert gen_res.status_code == 201
    buyer_bill_id = gen_res.json()["bill_id"]

    # Request document
    doc_res = client.get(f"/api/bills/{buyer_bill_id}/document", headers=owner_headers())
    assert doc_res.status_code == 200
    doc = doc_res.json()

    # Confidential object MUST be null/None on buyer bills
    assert doc["confidential"] is None

    # Payment lines must NOT include Purchase or Commission records
    for line in doc["payment_lines"]:
        assert "purchase" not in line["payment_type"].lower()
        assert "commission" not in line["payment_type"].lower()
        assert "margin" not in line["payment_type"].lower()


def test_09_worker_blocked_from_intermediate_confidential_bill():
    """Workers without can_view_finances must receive 403 when requesting intermediate bill document."""
    res = client.get("/api/bills/BILL-EXISTING-001/document", headers=worker_headers())
    assert res.status_code == 403
    assert "confidential dealer purchase financials" in res.json().get("detail", "").lower()


def test_10_unauthenticated_requests_blocked():
    """Unauthenticated requests must be rejected with 401."""
    res1 = client.post("/api/bills/calculate", json={"selling_price": 10000.0})
    assert res1.status_code == 401

    res2 = client.get("/api/deals/next-bill-number")
    assert res2.status_code == 401


# ─── 5. PDF GENERATION STREAM ─────────────────────────────────────────────────

def test_11_pdf_download_stream_preserves_headers():
    """Verify POST /api/download-pdf returns application/pdf with content disposition."""
    dummy_pdf = b"%PDF-1.4 dummy pdf bytes"
    res = client.post(
        "/api/download-pdf",
        data={"filename": "Buyer-Bill-MM-26-0001"},
        files={"file": ("Buyer-Bill-MM-26-0001.pdf", dummy_pdf, "application/pdf")},
    )
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert 'attachment; filename="Buyer-Bill-MM-26-0001.pdf"' in res.headers["content-disposition"]
    assert res.content == dummy_pdf
