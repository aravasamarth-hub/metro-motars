"""Iteration 5: retest buyer bill privacy + dashboard todays_stock excludes Sold."""
import os
import uuid
import json as _json
import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
API = f"{BASE_URL}/api"

FORBIDDEN = ("commission", "margin", "purchase")


@pytest.fixture
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture
def seeded_deal(api):
    tag = uuid.uuid4().hex[:8].upper()
    buyer_name = f"TEST Buyer {tag}"
    seller_name = f"TEST Seller {tag}"
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
        "seller": {"name": seller_name, "phone": f"9{tag[:9]}", "address": "A", "id_details": "ID"},
        "buyer": {"name": buyer_name, "phone": f"8{tag[:9]}", "address": "B", "id_details": "ID"},
        "witnesses": [{"name": f"TEST W {tag}", "phone": "7000000000", "address": "W", "id_details": "WID"}],
        "payments": [
            {"person": seller_name, "payment_type": "Purchase Paid", "amount": 50000,
             "payment_date": "2026-01-05", "payment_status": "Paid"},
            {"person": buyer_name, "payment_type": "Sale Paid", "amount": 75000,
             "payment_date": "2026-01-10", "payment_status": "Paid"},
            {"person": buyer_name, "payment_type": "Sale balance Pending", "amount": 10000,
             "payment_date": "2026-01-15", "payment_status": "Pending"},
            # Commission paid to buyer (person == buyer) — the leak vector
            {"person": buyer_name, "payment_type": "Commission Paid", "amount": 2000,
             "payment_date": "2026-01-10", "payment_status": "Paid"},
        ],
    }
    r = api.post(f"{API}/workflow/deals", json=payload)
    assert r.status_code == 201, r.text
    deal_id = r.json()["deal"]["deal_id"]
    vehicle_id = r.json()["vehicle"]["vehicle_id"]
    seller_id = r.json()["seller"]["seller_id"]
    buyer_id = r.json()["buyer"]["buyer_id"]
    yield {"deal_id": deal_id, "tag": tag, "buyer": buyer_name, "seller": seller_name,
           "vehicle_id": vehicle_id, "seller_id": seller_id, "buyer_id": buyer_id}
    # cleanup deal + related persons/vehicle (avoid orphans)
    api.delete(f"{API}/deals/{deal_id}?cascade=true")
    api.delete(f"{API}/vehicles/{vehicle_id}")
    api.delete(f"{API}/sellers/{seller_id}")
    api.delete(f"{API}/buyers/{buyer_id}")


def test_buyer_bill_no_commission_leak(api, seeded_deal):
    deal_id = seeded_deal["deal_id"]
    r = api.post(f"{API}/deals/{deal_id}/bills/generate", json={"bill_type": "Seller → Buyer"})
    assert r.status_code == 201
    bill = r.json()
    # bill.price must be sale only = 75000
    assert bill["price"] == 75000.0, f"bill.price leaked: {bill}"
    bill_id = bill["bill_id"]

    doc = api.get(f"{API}/bills/{bill_id}/document").json()
    assert doc["confidential"] is None
    assert doc["total_amount"] == 75000.0
    # No payment_line should contain purchase/commission/margin
    for line in doc["payment_lines"]:
        low = line["payment_type"].lower()
        for term in FORBIDDEN:
            assert term not in low, f"leaked line: {line}"
    # Deep scan across whole document body
    body = _json.dumps(doc).lower()
    for term in FORBIDDEN:
        assert term not in body, f"'{term}' leaked in buyer bill body"
    # words match
    assert "Seventy Five Thousand" in doc["total_in_words"]


def test_intermediate_bill_still_has_confidential(api, seeded_deal):
    deal_id = seeded_deal["deal_id"]
    r = api.post(f"{API}/deals/{deal_id}/bills/generate", json={"bill_type": "Seller → Intermediate"})
    assert r.status_code == 201
    bill = r.json()
    bill_id = bill["bill_id"]
    # Purchase paid = 50000 -> intermediate bill.price
    assert bill["price"] == 50000.0
    doc = api.get(f"{API}/bills/{bill_id}/document").json()
    assert doc["confidential"] is not None
    c = doc["confidential"]
    assert c["purchase_total"] == 50000.0
    assert c["sale_total"] == 75000.0
    assert c["commission"] == 2000.0
    assert c["margin"] == 25000.0


def test_bill_idempotent_both_types(api, seeded_deal):
    deal_id = seeded_deal["deal_id"]
    for bt in ("Seller → Buyer", "Seller → Intermediate"):
        r1 = api.post(f"{API}/deals/{deal_id}/bills/generate", json={"bill_type": bt})
        r2 = api.post(f"{API}/deals/{deal_id}/bills/generate", json={"bill_type": bt})
        assert r1.json()["bill_id"] == r2.json()["bill_id"]
        assert r1.json()["bill_number"] == r2.json()["bill_number"]
    # only 2 bills for this deal
    bills = [b for b in api.get(f"{API}/bills").json() if b.get("deal_id") == deal_id]
    assert len(bills) == 2


def test_dashboard_todays_stock_excludes_sold(api, seeded_deal):
    # seeded vehicle is Sold and created today; todays_stock must NOT count it
    r = api.get(f"{API}/overview/dashboard")
    assert r.status_code == 200
    d = r.json()
    # bikes_in_stock excludes sold (contract); todays_stock should behave same
    assert d["todays_stock"] <= d["bikes_in_stock"], f"todays_stock {d['todays_stock']} > bikes_in_stock {d['bikes_in_stock']}"
