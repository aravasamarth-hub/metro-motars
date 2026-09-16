"""Iteration 4: overview endpoints, bill privacy, cascade delete, bill idempotency, amount-in-words."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture
def seeded_deal(api):
    tag = uuid.uuid4().hex[:8].upper()
    payload = {
        "deal_type": "Buy & Sell",
        "status": "Completed",
        "vehicle": {
            "vehicle_name": f"TEST Bike {tag}", "make": "TEST", "model": "X",
            "year_of_manufacture": 2023, "color": "Red",
            "engine_number": f"E-{tag}", "chassis_number": f"C-{tag}",
            "vehicle_number": f"V-{tag}", "registration_number": f"R-{tag}",
            "insurance": "Active", "vehicle_status": "Sold",
        },
        "seller": {"name": f"TEST Seller {tag}", "phone": f"9{tag[:9]}", "address": "A", "id_details": "ID"},
        "buyer": {"name": f"TEST Buyer {tag}", "phone": f"8{tag[:9]}", "address": "B", "id_details": "ID"},
        "witnesses": [{"name": f"TEST W {tag}", "phone": "7777777777", "address": "W", "id_details": "WID"}],
        "payments": [
            {"person": f"TEST Seller {tag}", "payment_type": "Purchase", "amount": 50000,
             "payment_date": "2026-01-05", "payment_status": "Paid"},
            {"person": f"TEST Buyer {tag}", "payment_type": "Sale", "amount": 75000,
             "payment_date": "2026-01-10", "payment_status": "Paid"},
            {"person": f"TEST Buyer {tag}", "payment_type": "Sale balance", "amount": 10000,
             "payment_date": "2026-01-15", "payment_status": "Pending"},
            {"person": f"TEST Buyer {tag}", "payment_type": "Commission", "amount": 2000,
             "payment_date": "2026-01-10", "payment_status": "Paid"},
        ],
    }
    r = api.post(f"{API}/workflow/deals", json=payload)
    assert r.status_code == 201, r.text
    deal_id = r.json()["deal"]["deal_id"]
    yield deal_id, tag
    api.delete(f"{API}/deals/{deal_id}?cascade=true")


def test_overview_deals_row(api, seeded_deal):
    deal_id, tag = seeded_deal
    r = api.get(f"{API}/overview/deals")
    assert r.status_code == 200
    rows = {row["deal_id"]: row for row in r.json()}
    assert deal_id in rows
    row = rows[deal_id]
    assert row["seller_name"] == f"TEST Seller {tag}"
    assert row["buyer_name"] == f"TEST Buyer {tag}"
    assert row["vehicle_name"] == f"TEST Bike {tag}"
    assert row["total_paid"] == 127000.0  # 50k+75k+2k
    assert row["pending_amount"] == 10000.0
    assert row["spent"] == 50000.0
    assert row["earned"] == 75000.0


def test_overview_deals_totals_math(api, seeded_deal):
    deal_id, _ = seeded_deal
    rows = {row["deal_id"]: row for row in api.get(f"{API}/overview/deals").json()}
    row = rows[deal_id]
    # spent: purchase paid = 50k
    assert row["spent"] == 50000.0
    # earned: sale paid = 75k (sale balance is pending, commission doesn't match SALE terms)
    assert row["earned"] == 75000.0
    assert row["commission"] == 2000.0
    assert row["pending_amount"] == 10000.0
    assert row["total_paid"] == 127000.0


def test_dashboard_overview(api, seeded_deal):
    r = api.get(f"{API}/overview/dashboard")
    assert r.status_code == 200
    d = r.json()
    for k in ("todays_stock", "bikes_in_stock", "total_deals", "new_deals",
              "deals_closed", "net_finances", "pending_dues", "recently_sold", "bikes_for_sale"):
        assert k in d
    assert isinstance(d["recently_sold"], list)
    assert isinstance(d["bikes_for_sale"], list)
    assert d["total_deals"] >= 1


def test_bill_buyer_privacy(api, seeded_deal):
    deal_id, _ = seeded_deal
    r = api.post(f"{API}/deals/{deal_id}/bills/generate", json={"bill_type": "Seller → Buyer"})
    assert r.status_code == 201
    bill_id = r.json()["bill_id"]
    doc = api.get(f"{API}/bills/{bill_id}/document").json()
    assert doc["confidential"] is None
    # Ensure no purchase/commission/margin data leaks anywhere
    import json as _json
    body = _json.dumps(doc).lower()
    assert "purchase" not in body
    assert "commission" not in body
    assert "margin" not in body
    # Payment lines only sale
    for line in doc["payment_lines"]:
        assert "purchase" not in line["payment_type"].lower()


def test_bill_intermediate_confidential(api, seeded_deal):
    deal_id, _ = seeded_deal
    r = api.post(f"{API}/deals/{deal_id}/bills/generate", json={"bill_type": "Seller → Intermediate"})
    assert r.status_code == 201
    bill_id = r.json()["bill_id"]
    doc = api.get(f"{API}/bills/{bill_id}/document").json()
    assert doc["confidential"] is not None
    conf = doc["confidential"]
    assert conf["purchase_total"] == 50000.0
    assert conf["sale_total"] == 75000.0
    assert conf["commission"] == 2000.0
    assert conf["margin"] == 25000.0


def test_bill_generation_idempotent(api, seeded_deal):
    deal_id, _ = seeded_deal
    r1 = api.post(f"{API}/deals/{deal_id}/bills/generate", json={"bill_type": "Seller → Buyer"})
    r2 = api.post(f"{API}/deals/{deal_id}/bills/generate", json={"bill_type": "Seller → Buyer"})
    assert r1.status_code == 201 and r2.status_code == 201
    assert r1.json()["bill_id"] == r2.json()["bill_id"]
    assert r1.json()["bill_number"] == r2.json()["bill_number"]


def test_cascade_delete(api):
    tag = uuid.uuid4().hex[:8].upper()
    payload = {
        "deal_type": "Buy", "status": "Draft",
        "vehicle": {"vehicle_name": f"TEST DEL {tag}", "make": "M", "model": "M",
                    "year_of_manufacture": 2023, "color": "C",
                    "engine_number": f"E-{tag}", "chassis_number": f"CD-{tag}",
                    "vehicle_number": f"VD-{tag}", "registration_number": f"RD-{tag}",
                    "insurance": "A", "vehicle_status": "In Stock"},
        "seller": {"name": f"TEST DELS {tag}", "phone": f"6{tag[:9]}", "address": "A", "id_details": "I"},
        "buyer": {"name": f"TEST DELB {tag}", "phone": f"5{tag[:9]}", "address": "B", "id_details": "I"},
        "payments": [{"person": "x", "payment_type": "Sale", "amount": 100,
                      "payment_date": "2026-01-01", "payment_status": "Paid"}],
    }
    deal_id = api.post(f"{API}/workflow/deals", json=payload).json()["deal"]["deal_id"]
    # Without cascade -> 409 because payments exist
    r = api.delete(f"{API}/deals/{deal_id}")
    assert r.status_code == 409
    # With cascade -> deletes everything
    r = api.delete(f"{API}/deals/{deal_id}?cascade=true")
    assert r.status_code == 200
    assert api.get(f"{API}/deals/{deal_id}").status_code == 404
    # children gone
    for coll in ("witnesses", "payments", "documents", "bills"):
        remaining = [x for x in api.get(f"{API}/{coll}").json() if x.get("deal_id") == deal_id]
        assert remaining == []


def test_amount_in_words(api, seeded_deal):
    deal_id, _ = seeded_deal
    # Seller->Buyer bill; total_paid across sale = 75000 (paid sale only)
    r = api.post(f"{API}/deals/{deal_id}/bills/generate", json={"bill_type": "Seller → Buyer"})
    doc = api.get(f"{API}/bills/{r.json()['bill_id']}/document").json()
    total = doc["total_amount"]
    words = doc["total_in_words"]
    assert words.endswith("Rupees Only")
    if total == 75000:
        assert "Seventy Five Thousand" in words
